<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Stripe\Stripe;
use Stripe\Customer;
use Stripe\Checkout\Session as StripeSession;
use App\Models\User;
use Carbon\Carbon;

class SubscriptionController extends Controller
{
    public function createCheckoutSession(Request $request)
    {
        $user = Auth::user();
        $planId = $request->input('plan'); // Recebe o Price ID do Stripe ou identificador
        
        // Mapeamento de identificadores amigáveis para os IDs configurados no backend (.env do servidor)
        if ($planId === 'basic_monthly' || $planId === 'basic') {
            $planId = config('services.stripe.plans.basic_monthly');
        } elseif ($planId === 'premium_monthly' || $planId === 'premium') {
            $planId = config('services.stripe.plans.premium_monthly');
        } elseif ($planId === 'annual') {
            $planId = config('services.stripe.plans.premium_annual');
        }

        if (empty($planId)) {
            Log::error('Erro ao criar checkout session: Plano não especificado ou ID não configurado no .env.');
            return response()->json([
                'error' => 'O plano selecionado não foi configurado corretamente no servidor (.env ausente ou inválido).'
            ], 400);
        }
        
        Stripe::setApiKey(config('services.stripe.secret'));

        $baseUrl = $request->header('origin') ?: config('app.url');
        $successUrl = $baseUrl . '/?payment=success&session_id={CHECKOUT_SESSION_ID}';
        $cancelUrl = $baseUrl . '/?payment=cancelled';

        try {
            $session = StripeSession::create([
                'customer_email' => $user->email,
                'payment_method_types' => ['card', 'boleto'],
                'line_items' => [[
                    'price' => $planId,
                    'quantity' => 1,
                ]],
                'mode' => 'subscription',
                // Trial gratuito é concedido apenas no registro do usuário (AuthController)
                // NÃO adicionar trial_period_days aqui para evitar duplicidade
                'success_url' => $successUrl,
                'cancel_url' => $cancelUrl,
            ]);

            return response()->json(['id' => $session->id, 'url' => $session->url]);
        } catch (\Exception $e) {
            Log::error('Erro ao criar checkout session', ['error' => $e->getMessage()]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function billingPortal(Request $request)
    {
        try {
            $user = Auth::user();
            
            if (!$user->stripe_id) {
                return response()->json(['error' => 'Você ainda não possui uma conta de faturamento ativa.'], 400);
            }

            // Geramos o URL do portal com retorno para a página de perfil
            $portalUrl = $user->billingPortalUrl(config('app.url') . '/profile');

            return response()->json([
                'url' => $portalUrl
            ]);
        } catch (\Throwable $e) {
            Log::error('Erro ao gerar portal do cliente', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Erro ao abrir o gerenciador: ' . $e->getMessage()], 500);
        }
    }

    public function cancelSubscription(Request $request)
    {
        $user = Auth::user();

        if (!$user->stripe_id) {
            return response()->json(['error' => 'Utilizador não tem uma conta Stripe associada.'], 400);
        }

        try {
            Stripe::setApiKey(config('services.stripe.secret'));

            // Procurar assinaturas ativas para este cliente
            $subscriptions = \Stripe\Subscription::all([
                'customer' => $user->stripe_id,
                'status' => 'active',
                'limit' => 1,
            ]);

            if (count($subscriptions->data) === 0) {
                // Tenta procurar trialing também
                $subscriptions = \Stripe\Subscription::all([
                    'customer' => $user->stripe_id,
                    'status' => 'trialing',
                    'limit' => 1,
                ]);
            }

            if (count($subscriptions->data) === 0) {
                return response()->json(['error' => 'Nenhuma assinatura ativa encontrada.'], 404);
            }

            $subscriptionId = $subscriptions->data[0]->id;

            // Marcar para cancelar ao fim do período e obter o objeto atualizado
            $updatedSubscription = \Stripe\Subscription::update($subscriptionId, [
                'cancel_at_period_end' => true,
            ]);

            // Atualizamos localmente também para feedback imediato
            $timestamp = $updatedSubscription->current_period_end ?? $subscriptions->data[0]->current_period_end ?? null;
            
            if ($timestamp) {
                $user->subscription_ends_at = Carbon::createFromTimestamp($timestamp);
            } else {
                $user->subscription_ends_at = now()->addMonth();
            }
            
            // Forçamos a persistência total usando update direto para evitar problemas de instância
            $user->update([
                'subscription_ends_at' => $user->subscription_ends_at
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Assinatura cancelada com sucesso. Terá acesso até ' . $user->subscription_ends_at->format('d/m/Y'),
                'ends_at' => $user->subscription_ends_at
            ]);
        } catch (\Throwable $e) {
            Log::error('Erro ao cancelar assinatura', [
                'error' => $e->getMessage(),
                'user' => $user->email,
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => 'Erro ao processar o cancelamento: ' . $e->getMessage()], 500);
        }
    }

    public function verifyCheckoutSession(Request $request)
    {
        $user = Auth::user();
        $sessionId = $request->input('session_id');

        if (!$sessionId) {
            return response()->json(['success' => false, 'message' => 'Nenhum session_id fornecido.']);
        }

        try {
            Stripe::setApiKey(config('services.stripe.secret'));
            $session = StripeSession::retrieve($sessionId);

            if ($session->payment_status === 'paid' && $user->subscription_status !== 'active') {
                $user->subscription_status = 'active';
                $user->stripe_id = $session->customer;
                
                if ($session->subscription) {
                    $subscription = \Stripe\Subscription::retrieve($session->subscription);
                    $priceId = $subscription->items->data[0]->price->id ?? null;
                    $user->plan = $this->resolvePlanName($priceId);
                } else {
                    $user->plan = 'premium';
                }
                
                $user->save();
                return response()->json(['success' => true, 'plan' => $user->plan]);
            }

            return response()->json(['success' => true, 'plan' => $user->plan]);
        } catch (\Exception $e) {
            Log::error('Erro ao verificar checkout session', ['error' => $e->getMessage()]);
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function webhook(Request $request)
    {
        $payload = $request->getContent();
        $sig_header = $request->header('stripe-signature');
        $endpoint_secret = config('services.stripe.webhook_secret') ?: env('STRIPE_WEBHOOK_SECRET');

        try {
            $event = \Stripe\Webhook::constructEvent(
                $payload, $sig_header, $endpoint_secret
            );
        } catch (\UnexpectedValueException $e) {
            Log::error('Stripe Webhook: Paylaod inválido', ['error' => $e->getMessage()]);
            return response('Invalid payload', 400);
        } catch (\Stripe\Exception\SignatureVerificationException $e) {
            Log::error('Stripe Webhook: Assinatura inválida', ['error' => $e->getMessage()]);
            return response('Invalid signature', 400);
        }

        Log::info('Stripe Webhook recebido', ['type' => $event->type]);

        switch ($event->type) {
            case 'checkout.session.completed':
                $session = $event->data->object;
                $user = $this->findUserBySession($session);

                if ($user) {
                    $user->stripe_id = $session->customer;
                    $user->subscription_status = 'active';
                    
                    if ($session->subscription) {
                        try {
                            Stripe::setApiKey(config('services.stripe.secret'));
                            $subscription = \Stripe\Subscription::retrieve($session->subscription);
                            $priceId = $subscription->items->data[0]->price->id ?? null;
                            
                            $user->plan = $this->resolvePlanName($priceId);
                            $user->trial_ends_at = $subscription->trial_end ? Carbon::createFromTimestamp($subscription->trial_end) : null;
                            $user->subscription_ends_at = null;
                        } catch (\Exception $e) {
                            Log::error('Webhook: Erro ao buscar dados da assinatura', ['error' => $e->getMessage()]);
                        }
                    } else {
                        // Pagamentos únicos (lifetime) - caso um dia utilizes
                        $user->plan = 'premium'; 
                        $user->subscription_ends_at = null;
                    }
                    
                    $user->save();
                    Log::info("Checkout concluído para utilizador {$user->email}, plano definido como {$user->plan}");
                }
                break;

            case 'customer.subscription.updated':
                $subscription = $event->data->object;
                $user = User::where('stripe_id', $subscription->customer)->first();

                if ($user) {
                    $priceId = $subscription->items->data[0]->price->id ?? null;
                    
                    if (in_array($subscription->status, ['active', 'trialing'])) {
                        $user->subscription_status = 'active';
                        $user->plan = $this->resolvePlanName($priceId);
                        
                        // Se estiver marcado para cancelar ao fim do período, guardamos a data
                        // Adicionamos uma lógica para NÃO apagar se já tivermos uma data (proteção contra race conditions)
                        if ($subscription->cancel_at_period_end && !empty($subscription->current_period_end)) {
                            $user->subscription_ends_at = Carbon::createFromTimestamp($subscription->current_period_end);
                        } else if (!$subscription->cancel_at_period_end) {
                            // Só limpamos se explicitamente o Stripe disser que a renovação voltou a estar ativa
                            $user->subscription_ends_at = null;
                        }
                    } else if ($subscription->status === 'past_due') {
                        $user->subscription_status = 'past_due';
                    } else {
                        // Se estiver incomplete, incomplete_expired, etc.
                        $user->subscription_status = 'canceled';
                        $user->subscription_ends_at = now();
                    }
                    
                    $user->save();
                    Log::info("Assinatura atualizada pelo Stripe para {$user->email}, status: {$user->subscription_status}, cancel_at_period_end: " . ($subscription->cancel_at_period_end ? 'true' : 'false'));
                }
                break;

            case 'invoice.paid':
                $invoice = $event->data->object;
                $user = User::where('stripe_id', $invoice->customer)->first();

                if ($user) {
                    $user->subscription_status = 'active';
                    $user->subscription_ends_at = null;
                    $user->save();
                    Log::info("Fatura paga no Stripe para utilizador {$user->email}");
                }
                break;

            case 'invoice.payment_failed':
                $invoice = $event->data->object;
                $user = User::where('stripe_id', $invoice->customer)->first();

                if ($user) {
                    $user->subscription_status = 'past_due';
                    $user->save();
                    Log::warning("Fatura FALHOU no Stripe para utilizador {$user->email}");
                }
                break;

            case 'customer.subscription.deleted':
                $subscription = $event->data->object;
                $user = User::where('stripe_id', $subscription->customer)->first();

                if ($user) {
                    $user->subscription_status = 'canceled';
                    $user->subscription_ends_at = now();
                    $user->save();
                    Log::info("Assinatura CANCELADA no Stripe para utilizador {$user->email}");
                }
                break;
        }

        return response('Webhook handled', 200);
    }

    /**
     * Encontra o utilizador pelo e-mail ou customer_id associado à sessão
     */
    private function findUserBySession($session): ?User
    {
        if (!empty($session->customer_email)) {
            $user = User::where('email', $session->customer_email)->first();
            if ($user) return $user;
        }

        if (!empty($session->customer)) {
            return User::where('stripe_id', $session->customer)->first();
        }

        return null;
    }

    /**
     * Converte o Price ID do Stripe numa string amigável ('basic' ou 'premium')
     */
    private function resolvePlanName(?string $priceId): string
    {
        if (!$priceId) return 'premium';

        $basicMonthly = config('services.stripe.plans.basic_monthly');

        if ($priceId === $basicMonthly) {
            return 'basic';
        }

        return 'premium'; // Assume-se Premium para IDs anuais e premium mensais
    }

    public function directCheckout(Request $request)
    {
        if (! $request->hasValidSignature()) {
            abort(401, 'Este link de pagamento é inválido ou expirou. Por favor, solicite um novo link ao suporte.');
        }

        $userId = $request->query('user_id');
        $planId = $request->query('plan');

        $user = User::findOrFail($userId);

        // Mapeamento de identificadores amigáveis para os IDs configurados no backend (.env do servidor)
        if ($planId === 'basic_monthly' || $planId === 'basic') {
            $planId = config('services.stripe.plans.basic_monthly');
        } elseif ($planId === 'premium_monthly' || $planId === 'premium') {
            $planId = config('services.stripe.plans.premium_monthly');
        } elseif ($planId === 'annual') {
            $planId = config('services.stripe.plans.premium_annual');
        }

        if (empty($planId)) {
            abort(400, 'Este plano não está configurado corretamente no servidor.');
        }

        Stripe::setApiKey(config('services.stripe.secret'));

        $baseUrl = config('app.url');
        $successUrl = $baseUrl . '/?payment=success&session_id={CHECKOUT_SESSION_ID}';
        $cancelUrl = $baseUrl . '/?payment=cancelled';

        try {
            $session = StripeSession::create([
                'customer_email' => $user->email,
                'payment_method_types' => ['card', 'boleto'],
                'line_items' => [[
                    'price' => $planId,
                    'quantity' => 1,
                ]],
                'mode' => 'subscription',
                'success_url' => $successUrl,
                'cancel_url' => $cancelUrl,
            ]);

            return redirect()->away($session->url);
        } catch (\Exception $e) {
            Log::error('Erro ao redirecionar pelo link direto do admin', ['error' => $e->getMessage()]);
            abort(500, 'Erro ao criar sessão de pagamento no Stripe: ' . $e->getMessage());
        }
    }
}
