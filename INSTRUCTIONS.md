# 📘 Guia de Continuidade & Instruções de Setup

Este documento serve para você acompanhar e continuar o desenvolvimento deste projeto showcase a partir de uma nova pasta e em uma nova sessão do assistente de IA.

---

## 1. Como Mover e Inicializar o Repositório

Execute os seguintes comandos no terminal do Windows (PowerShell):

```powershell
# 1. Copie a pasta exportada para o seu novo diretório (exemplo: fintrack-showcase)
Copy-Item -Recurse -Path "C:\laragon\www\fintrackweb.com.br\_showcase_export" -Destination "C:\laragon\www\fintrack-showcase"

# 2. Acesse a nova pasta
cd "C:\laragon\www\fintrack-showcase"

# 3. Inicialize o repositório Git público
git init
git add .
git commit -m "feat: initial commit for FinTrack Core & AI Engine showcase"

# 4. Vincule com o seu novo repositório público no GitHub:
# git remote add origin https://github.com/SEU-USUARIO/fintrack-showcase.git
# git branch -M main
# git push -u origin main
```

---

## 2. Como Rodar o Projeto Localmente

Na nova pasta `fintrack-showcase`:

### Opção A: Via Docker (Mais Prático)
```powershell
cp .env.example .env
docker compose up -d --build
docker compose exec app php artisan key:generate
docker compose exec app php artisan migrate --seed
```
Acesse: `http://localhost:8000`

### Opção B: Localmente via Laragon / PHP CLI
```powershell
cp .env.example .env
composer install
npm install
npm run build
php artisan key:generate
# Crie o banco SQLite local se não usar MySQL:
New-Item -ItemType File -Path "database\database.sqlite" -Force
php artisan migrate --seed
php artisan serve
```

---

## 3. Como Rodar as Validações de Nível Sênior

```powershell
# Rodar todos os testes automatizados
composer test

# Rodar análise estática nível 8 (zero erros aceitáveis)
composer analyse

# Formatar o código no padrão PSR-12
composer lint
```

---

## 4. Prompt para Você Colar na Nova Sessão do Chat

Quando você abrir o Antigravity na nova pasta (`fintrack-showcase`), copie e cole o seguinte prompt no início da conversa para que a IA retome exatamente o contexto:

```text
Olá! Estou desenvolvendo este repositório como um SHOWCASE PÚBLICO para vagas de Engenheiro de Software Sênior no exterior. 
O projeto foi extraído do FinTrack e foca em:
1. Core Ledger Financeiro Atômico (Actions, Form Requests, Resources).
2. Assistente Financeiro com IA (Google Gemini 1.5 Flash + fallback).
3. Qualidade de código: PHPStan Nível 8, Pest Tests e GitHub Actions CI.

Consulte o README.md e o INSTRUCTIONS.md para entender a estrutura atual. Gostaria de continuar aprimorando este projeto. O que faremos agora?
```

---

## 5. Próximos Passos Sugeridos para o Showcase

1. **Adicionar GIF ou Screenshots no README:** Tire 1 ou 2 prints do dashboard e coloque na pasta `public/` ou no topo do README.
2. **Expandir Testes de IA:** Adicionar testes com cenários de prompts complexos para testar a resposta do assistente.
3. **Deploy Opcional:** Subir em uma instância gratuita do Render / Fly.io / Railway para ter um link de "Live Demo" no GitHub.

