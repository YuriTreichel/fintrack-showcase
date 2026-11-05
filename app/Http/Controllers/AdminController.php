<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    // Listar todos os usuários com dados relevantes e estatísticas
    public function listUsers(Request $request)
    {
        // Buscamos usuários com contagem de recursos relacionados
        $users = User::withCount(['transactions', 'accounts', 'cards'])
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json($users);
    }

    // Atualizar dados básicos e assinatura do usuário
    public function updateSubscription(Request $request, $id)
    {
        $user = User::findOrFail($id);
        
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|unique:users,email,' . $id,
            'whatsapp' => 'nullable|string|max:20',
            'subscription_status' => 'required|string',
            'plan' => 'required|string',
            'is_suspended' => 'sometimes|boolean',
            'is_admin' => 'sometimes|boolean'
        ]);

        if (isset($data['whatsapp'])) {
            $data['whatsapp'] = preg_replace('/\D/', '', $data['whatsapp']);
        }

        $user->update($data);
        return response()->json(['success' => true, 'user' => $user]);
    }

    // Resetar senha para o padrão 'fintrack123'
    public function resetPassword(Request $request, $id)
    {
        $user = User::findOrFail($id);
        
        // Superadmin principal não pode ter senha resetada assim por segurança
        if ($user->email === 'yuriinfo15@gmail.com') {
            return response()->json(['error' => 'A senha do Superadmin principal deve ser alterada via processo de recuperação padrão.'], 400);
        }

        $newPassword = 'fintrack' . rand(100, 999);
        $user->password = Hash::make($newPassword);
        $user->save();

        // Desconectar o usuário de todas as sessões por segurança
        $user->tokens()->delete();

        return response()->json([
            'success' => true, 
            'message' => "Senha resetada com sucesso para: {$newPassword}",
            'temporary_password' => $newPassword
        ]);
    }

    // Atualizar o status de suspensão
    public function suspend(Request $request, $id)
    {
        $user = User::findOrFail($id);
        
        if ($user->email === 'yuriinfo15@gmail.com') {
            return response()->json(['error' => 'Não é possível suspender o Superadmin principal.'], 400);
        }

        $isSuspended = $request->input('is_suspended', true);
        $user->update(['is_suspended' => $isSuspended]);
        
        if ($isSuspended) {
            $user->tokens()->delete();
        }

        return response()->json(['success' => true, 'user' => $user]);
    }

    // Representação (Impersonation)
    public function impersonate(Request $request, $id)
    {
        $user = User::findOrFail($id);

        if ($user->is_suspended) {
            return response()->json(['error' => 'Usuário suspenso.'], 400);
        }

        $token = $user->createToken('admin_impersonation')->plainTextToken;

        return response()->json([
            'success' => true,
            'impersonation_token' => $token,
            'user' => $user
        ]);
    }

    // Excluir usuário totalmente (apenas Superadmin)
    public function destroy(Request $request, $id)
    {
        // Apenas o superadmin principal 'yuriinfo15@gmail.com' pode excluir usuários
        if ($request->user()->email !== 'yuriinfo15@gmail.com') {
            return response()->json(['error' => 'Acesso negado. Apenas o Superadmin principal pode excluir usuários.'], 403);
        }

        $user = User::findOrFail($id);

        // Não permitir que o superadmin se auto-exclua
        if ($user->email === 'yuriinfo15@gmail.com') {
            return response()->json(['error' => 'Você não pode excluir a si mesmo.'], 400);
        }

        DB::beginTransaction();
        try {
            // Limpar assinaturas (que podem não ter cascade no banco dependendo da versão)
            DB::table('subscriptions')->where('user_id', $user->id)->delete();
            
            // O Laravel/DB cuidará do restante via onDelete('cascade') definido nas migrations
            // para accounts, transactions, cards, categories, budgets, goals, assets, etc.
            $user->delete();

            DB::commit();
            return response()->json(['success' => true, 'message' => 'Usuário e todos os seus dados foram excluídos com sucesso.']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Falha ao excluir usuário: ' . $e->getMessage()], 500);
        }
    }

    // Gerar um link de checkout temporário assinado para o usuário específico
    public function generateCheckoutLink(Request $request, $id)
    {
        if ($request->user()->email !== 'yuriinfo15@gmail.com') {
            return response()->json(['error' => 'Acesso negado. Apenas o Superadmin principal pode gerar links de pagamento.'], 403);
        }

        $user = User::findOrFail($id);
        $plan = $request->input('plan', 'premium_monthly');

        if (!in_array($plan, ['basic_monthly', 'premium_monthly', 'annual'])) {
            return response()->json(['error' => 'Plano inválido especificado.'], 400);
        }

        // Gera o link temporário assinado que expira em 7 dias
        $signedUrl = \Illuminate\Support\Facades\URL::temporarySignedRoute(
            'checkout.direct',
            now()->addDays(7),
            ['user_id' => $user->id, 'plan' => $plan]
        );

        return response()->json([
            'success' => true,
            'link' => $signedUrl
        ]);
    }
}
