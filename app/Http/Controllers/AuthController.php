<?php

namespace App\Http\Controllers;

use App\Mail\WelcomeMail;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        if ($request->has('email')) {
            $request->merge([
                'email' => strtolower(trim($request->email)),
            ]);
        }

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email:rfc,dns|max:255|unique:users',
            'password' => 'required|string|min:6',
            'whatsapp' => 'nullable|string|max:20',
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'whatsapp' => isset($data['whatsapp']) ? preg_replace('/\D/', '', $data['whatsapp']) : null,
            'password' => Hash::make($data['password']),
            'trial_ends_at' => now()->addDays(14),
            'subscription_status' => 'trialing',
            'plan' => 'premium',
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        // Enviar e-mail de boas-vindas
        try {
            Mail::to($user->email)->send(new WelcomeMail($user));
        } catch (\Exception $e) {
            \Log::error('Erro ao enviar e-mail de boas-vindas: '.$e->getMessage());
        }

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function login(Request $request)
    {
        if ($request->has('email')) {
            $request->merge([
                'email' => strtolower(trim($request->email)),
            ]);
        }

        $data = $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $data['email'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            return response()->json([
                'message' => 'Credenciais inválidas',
            ], 401);
        }

        if ($user->is_suspended) {
            return response()->json([
                'message' => 'Sua conta foi suspensa temporária ou permanentemente. Entre em contato com o suporte.',
            ], 403);
        }

        $user->last_login_at = now();
        $user->save();

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    public function updateThemeColor(Request $request)
    {
        $data = $request->validate([
            'theme_color' => 'required|string|max:50',
        ]);

        $user = $request->user();
        $user->theme_color = $data['theme_color'];
        $user->save();

        return response()->json(['success' => true]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Deslogado com sucesso']);
    }

    public function completeTour(Request $request)
    {
        $user = $request->user();
        $user->tour_completed = true;
        $user->save();

        return response()->json(['success' => true]);
    }
}
