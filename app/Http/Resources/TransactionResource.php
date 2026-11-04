<?php

namespace App\Http\Resources;

use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Transaction
 */
class TransactionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'description' => $this->description,
            'amount' => (float) $this->amount,
            'date' => $this->date ? $this->date->format('Y-m-d') : null,
            'type' => $this->type,
            'status' => $this->status,
            'account' => [
                'id' => $this->account_id,
                'name' => $this->account?->name,
                'currency' => $this->account?->currency ?? 'USD',
            ],
            'to_account' => $this->to_account_id ? [
                'id' => $this->to_account_id,
                'name' => $this->toAccount?->name,
            ] : null,
            'category' => $this->category ? [
                'id' => $this->category->id,
                'name' => $this->category->name,
                'color' => $this->category->color,
                'icon' => $this->category->icon,
            ] : null,
            'card' => $this->card ? [
                'id' => $this->card->id,
                'name' => $this->card->name,
            ] : null,
            'installments' => [
                'number' => $this->installment_number,
                'total' => $this->total_installments,
                'is_installment' => ! empty($this->total_installments) && $this->total_installments > 1,
            ],
            'notes' => $this->notes,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
