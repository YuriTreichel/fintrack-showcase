<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('debts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('description');
            $table->string('creditor')->nullable();
            $table->decimal('amount', 15, 2);
            $table->date('date');
            $table->enum('status', ['Paid', 'Pending'])->default('Pending');
            $table->text('observations')->nullable();

            // Installment support
            $table->foreignId('parent_id')->nullable()->constrained('debts')->onDelete('cascade');
            $table->integer('installment_number')->nullable();
            $table->integer('total_installments')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('debts');
    }
};
