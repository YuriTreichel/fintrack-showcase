<?php

namespace App\Services\AI;

use Gemini\Laravel\Facades\Gemini;
use Illuminate\Support\Facades\Log;
use Throwable;

class TransactionAIService
{
    /**
     * Parses free-form conversational text into a structured financial transaction.
     * Capable of asking clarifying questions when crucial financial parameters are ambiguous.
     *
     * @param  array<int, array{role: string, content: string}>  $history
     * @param  array<int, string>  $availableCategories
     * @return array<string, mixed>|null
     */
    public function parseNaturalLanguage(string $text, array $history = [], array $availableCategories = []): ?array
    {
        $categoriesList = ! empty($availableCategories)
            ? implode(', ', $availableCategories)
            : 'Food, Transport, Housing, Utilities, Leisure, Salary, Freelance, Investment';

        $systemPrompt = <<<PROMPT
You are FinTrack AI, a high-precision financial parsing assistant.
Extract structured transaction data from the user input.
Current Date: {now}

Available User Categories: [{$categoriesList}]

Rules:
1. Output MUST be ONLY valid JSON with no markdown wrapping or extra comments.
2. If essential info (especially amount or clear intent) is missing, formulate a polite clarifying question in 'question'.
3. 'type' MUST be either 'Income' or 'Expense'.
4. 'amount' MUST be a positive numeric float without currency symbols.
5. 'date' MUST be in 'YYYY-MM-DD' format. Default to today if unstated.
6. Match 'suggested_category' with the closest available category.

JSON Schema format:
{
  "description": string,
  "amount": number|null,
  "date": "YYYY-MM-DD",
  "type": "Income"|"Expense",
  "suggested_category": string|null,
  "question": string|null
}
PROMPT;

        $prompt = str_replace('{now}', now()->toDateString(), $systemPrompt)."\n\nUser Input: ".$text;

        try {
            // Support unit testing/offline mocking if API key isn't set
            if (empty(config('services.gemini.api_key', env('GEMINI_API_KEY')))) {
                return $this->fallbackParser($text);
            }

            $response = Gemini::geminiPro()->generateContent($prompt);
            $rawJson = trim($response->text());

            // Strip markdown block fences if returned
            $cleanJson = preg_replace('/^```(?:json)?\s*|\s*```$/i', '', $rawJson);

            $parsed = json_decode((string) $cleanJson, true);

            return is_array($parsed) ? $parsed : null;
        } catch (Throwable $e) {
            Log::warning('Gemini AI Parsing failed, falling back to regex: '.$e->getMessage());

            return $this->fallbackParser($text);
        }
    }

    /**
     * Resilient offline regex parser for demonstration without API keys.
     *
     * @return array<string, mixed>
     */
    public function fallbackParser(string $text): array
    {
        // Extract amount (e.g., $50, 45.90, 100 reais, etc.)
        preg_match('/(?:R\$|\$)?\s*(\d+(?:[.,]\d{1,2})?)/i', $text, $amountMatch);
        $amount = isset($amountMatch[1]) ? (float) str_replace(',', '.', $amountMatch[1]) : null;

        $isIncome = preg_match('/(recebi|salário|venda|depósito|received|salary|income)/i', $text);
        $type = $isIncome ? 'Income' : 'Expense';

        if (! $amount) {
            return [
                'description' => $text,
                'amount' => null,
                'date' => now()->toDateString(),
                'type' => $type,
                'suggested_category' => null,
                'question' => 'I understand your note, but could you specify the amount?',
            ];
        }

        return [
            'description' => ucfirst(trim($text)),
            'amount' => $amount,
            'date' => now()->toDateString(),
            'type' => $type,
            'suggested_category' => $isIncome ? 'Salary' : 'General',
            'question' => null,
        ];
    }
}
