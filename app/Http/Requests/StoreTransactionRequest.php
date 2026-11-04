<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

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
        $userId = (int) $this->user()?->id;

        return [
            'description' => ['required', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'gt:0'],
            'date' => ['required', 'date'],
            'type' => ['required', 'in:Income,Expense,Transfer,GoalDeposit'],
            'status' => ['required', 'in:Paid,Pending'],
            'account_id' => [
                'required',
                Rule::exists('accounts', 'id')->where('user_id', $userId),
            ],
            'to_account_id' => [
                'nullable',
                'required_if:type,Transfer',
                Rule::exists('accounts', 'id')->where('user_id', $userId),
                'different:account_id',
            ],
            'category_id' => [
                'nullable',
                'required_if:type,Income,Expense',
                Rule::exists('categories', 'id')->where('user_id', $userId),
            ],
            'card_id' => [
                'nullable',
                Rule::exists('cards', 'id')->where('user_id', $userId),
            ],
            'goal_id' => [
                'nullable',
                Rule::exists('goals', 'id')->where('user_id', $userId),
            ],
            'total_installments' => ['nullable', 'integer', 'min:1', 'max:120'],
            'frequency' => ['nullable', 'in:daily,weekly,monthly,yearly'],
            'is_recurring' => ['nullable', 'boolean'],
            'ignore_in_reports' => ['nullable', 'boolean'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
