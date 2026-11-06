<?php

namespace App\Services;

use Gemini\Data\Content;
use Gemini\Enums\Role;
use Gemini\Laravel\Facades\Gemini;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;

class TransactionAIService
{
    /**
     * Parse natural language text into a structured transaction object.
     */
    public function parseTextToTransaction(string $text, array $history = []): ?array
    {
        $today = Carbon::now()->format('Y-m-d');

        $systemInstruction = "Você é um assistente financeiro de elite. Sua tarefa é extrair dados de transações financeiras e retornar EXCLUSIVAMENTE um objeto JSON.
        
REGRAS DE EXTRAÇÃO:
- amount: (float) O valor numérico. Converta expressões como '2 mil' em 2000, '50 reais' em 50, etc.
- type: 'expense', 'income' ou 'transfer'.
- description: Título curto.
- suggested_category: Categoria (Alimentação, Transporte, Salário, etc).
- date: (Y-m-d). Hoje é {$today}. 
- status: 'paid' ou 'pending'.
- question: SE faltar algo crucial, pergunte educadamente mas MANTENHA o formato JSON.

REGRAS DE RESPOSTA:
1. Retorne APENAS o JSON puro. Nunca use blocos de código markdown (```json).
2. Se o usuário fornecer uma informação que faltava, atualize o JSON anterior acumulando os dados.";

        try {
            // Revertendo para o modelo que sabemos que existe no ambiente
            $model = Gemini::generativeModel('gemini-1.5-flash');

            if (! empty($history)) {
                // No chat, passamos as instruções novamente para reforçar o comportamento
                $chat = $model->startChat(history: $this->mapHistory($history));
                $result = $chat->sendMessage($text."\n\nIMPORTANTE: Responda APENAS o JSON conforme as regras: ".$systemInstruction);
            } else {
                // Primeira mensagem: Instrução + Texto
                $result = $model->generateContent($systemInstruction."\n\nUSUÁRIO: ".$text);
            }

            $jsonResponse = $result->text();
            $jsonResponse = preg_replace('/```json\s*|```/', '', $jsonResponse);
            $jsonResponse = trim($jsonResponse);

            $data = json_decode($jsonResponse, true);

            if (isset($data['total_installments']) && $data['total_installments'] <= 0) {
                $data['total_installments'] = 1;
            }

            return $data;
        } catch (\Exception $e) {
            Log::error('Gemini AI Parsing Error: '.$e->getMessage());

            return null;
        }
    }

    private function mapHistory(array $history): array
    {
        return array_map(function ($msg) {
            return Content::parse(
                part: $msg['text'],
                role: $msg['role'] === 'bot' ? Role::MODEL : Role::USER
            );
        }, $history);
    }
}
