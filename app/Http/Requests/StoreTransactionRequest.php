<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'description' => ['required', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'gt:0'],
            'date' => ['required', 'date'],
            'type' => ['required', 'in:Income,Expense,Transfer,GoalDeposit'],
            'status' => ['required', 'in:Paid,Pending'],
            'account_id' => ['required', 'exists:accounts,id'],
            'to_account_id' => ['nullable', 'required_if:type,Transfer', 'exists:accounts,id', 'different:account_id'],
            'category_id' => ['nullable', 'required_if:type,Income,Expense', 'exists:categories,id'],
            'card_id' => ['nullable', 'exists:cards,id'],
            'goal_id' => ['nullable', 'exists:goals,id'],
            'total_installments' => ['nullable', 'integer', 'min:1', 'max:120'],
            'frequency' => ['nullable', 'in:daily,weekly,monthly,yearly'],
            'is_recurring' => ['nullable', 'boolean'],
            'ignore_in_reports' => ['nullable', 'boolean'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
