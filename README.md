# FinTrack Core & AI Engine Showcase

[![CI & Quality Gate](https://github.com/YuriTreichel/fintrack-showcase/actions/workflows/ci.yml/badge.svg)](https://github.com/YuriTreichel/fintrack-showcase/actions)
[![PHPStan Level 8](https://img.shields.io/badge/PHPStan-Level%208-brightgreen.svg)](https://phpstan.org/)
[![Pest Tests](https://img.shields.io/badge/Tests-Pest%20%26%20PHPUnit-purple.svg)](https://pestphp.com/)
[![Laravel 11](https://img.shields.io/badge/Laravel-11.x-red.svg)](https://laravel.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

An enterprise-grade personal finance ledger and AI natural language transaction processor designed for high concurrency, mathematical consistency, and clean architectural separation.

> **Note:** This repository is an open-source technical showcase extracted from a proprietary SaaS application to demonstrate domain modeling, asynchronous ledger processing, LLM integration, and senior software engineering patterns.

---

## 🏛 Architecture & Domain Design

The system implements **Single-Responsibility Actions**, **Data Transfer Objects (Resources)**, and strict **Database Transaction Isolation** to manage financial ledger events and credit card reconciliation.

```mermaid
flowchart TD
    User([User / Client App]) -->|Natural Language Input| AIController[TransactionAIController]
    User -->|Structured REST Payload| RESTController[TransactionController]

    subgraph Presentation & Validation
        RESTController --> StoreRequest[StoreTransactionRequest]
    end

    subgraph AI Service Layer
        AIController --> AIService[TransactionAIService]
        AIService -->|LLM Prompting| GeminiAPI[Google Gemini 1.5 Pro/Flash]
        AIService -.->|Offline Resilient Mode| FallbackParser[Regex Financial Parser]
    end

    subgraph Domain & Business Logic
        StoreRequest --> CreateAction[CreateTransactionAction]
        AIController -.->|Confirmed Draft| CreateAction
        CreateAction --> DBTrans{{Atomic DB::transaction}}
        DBTrans --> InstallmentEngine[Installment Splitting & Rounding Adjustment]
        DBTrans --> CardRule[Card Status Enforcement: Pending Until Settled]
    end

    subgraph Storage Layer
        DBTrans --> LedgerDB[(PostgreSQL / MySQL / SQLite)]
    end
```

---

## ✨ Key Technical Highlights

1. **Atomic Installment Generation & Floating-point Protection:**
   * Installments are distributed across dynamic billing periods.
   * Rounding residues (cents) are mathematically compensated on the initial installment to guarantee `sum(installments) == total_amount` with zero floating point drift.
2. **Card Invoice Reconciliation Engine:**
   * Credit card purchases are natively registered as `Pending` liabilities.
   * Execution of `PayCardInvoiceAction` uses `lockForUpdate()` to avoid double-settlement race conditions, transitioning items to `Paid` while automatically logging a single outflow entry on the payment bank account.
3. **Conversational AI Financial Extraction (`TransactionAIService`):**
   * Integrates Google Gemini 1.5 Flash via structured prompt engineering.
   * Returns clarification prompts when critical financial parameters (such as amount or explicit intent) are missing.
   * Includes an automated fallback parser for test resilience and zero-dependency offline runs.
4. **Code Quality & Static Analysis:**
   * Configured for **PHPStan Level 8** (highest non-strict tier in Larastan).
   * 100% PSR-12 compliant code formatted via **Laravel Pint**.

---

## 🚀 Quickstart & Local Setup

### Option 1: Docker (Recommended)

Run the full stack (PHP 8.3 FPM + Nginx + SQLite) with a single command:

```bash
# 1. Clone repository
git clone https://github.com/YuriTreichel/fintrack-showcase.git
cd fintrack-showcase

# 2. Setup environment
cp .env.example .env

# 3. Spin up containers
docker compose up -d --build

# 4. Run migrations & realistic seeds
docker compose exec app php artisan key:generate
docker compose exec app php artisan migrate --seed
```

Open your browser at `http://localhost:8000`.

---

### Option 2: Local CLI

```bash
composer install
npm install && npm run build
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate --seed
php artisan serve
```

---

## 🧪 Testing Suite & Quality Gates

Run all automated unit and feature tests:

```bash
# Execute Pest tests
composer test

# Run PHPStan static analysis
composer analyse

# Run Laravel Pint linter
composer lint
```

---

## 👤 Author

Developed by **Yuri Fernandes**  
* Senior Fullstack & Backend Engineer | Software Architect  
* [LinkedIn](https://linkedin.com) • [GitHub](https://github.com/YuriTreichel)

