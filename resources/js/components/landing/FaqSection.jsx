import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const FaqItem = ({ question, answer, delay = 0 }) => {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.4 }}
      className="border-b border-white/5"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-6 text-left group"
      >
        <span className="text-lg font-bold text-white group-hover:text-[#98e5dd] transition-colors pr-4">
          {question}
        </span>
        <div
          className={cn(
            "w-8 h-8 bg-white/5 rounded-full flex items-center justify-center flex-shrink-0 transition-all",
            open && "bg-[#98e5dd]/10 rotate-180",
          )}
        >
          <ChevronDown
            size={16}
            className={cn(
              "text-zinc-500 transition-colors",
              open && "text-[#98e5dd]",
            )}
          />
        </div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="text-zinc-500 text-sm font-medium leading-relaxed pb-6">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const FaqSection = () => {
  return (
    <section className="py-32 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-block h-px w-20 bg-gradient-to-r from-transparent via-[#98e5dd] to-transparent mb-8" />
          <h2 className="text-[14px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-6 font-mono">
            Dúvidas
          </h2>
          <h3 className="text-4xl md:text-5xl font-black text-white tracking-tighter">
            Perguntas frequentes
          </h3>
        </div>

        <div>
          <FaqItem
            delay={0.1}
            question="Quais são as formas de pagamento aceitas?"
            answer="Para facilitar o seu acesso, aceitamos pagamentos via Cartão de Crédito (com liberação imediata) e Boleto Bancário. O sistema é pré-pago, garantindo que você não tenha surpresas."
          />
          <FaqItem
            delay={0.15}
            question="O que é a Stripe?"
            answer="A Stripe é uma das maiores e mais seguras processadoras de pagamentos do mundo, utilizada por gigantes como Amazon, Google e Netflix. Nós usamos a Stripe para garantir que todas as transações sejam processadas com segurança de nível bancário e que seus dados de cartão nunca sejam armazenados em nossos servidores."
          />
          <FaqItem
            delay={0.2}
            question="Como funciona o compartilhamento familiar?"
            answer="Cada usuário possui um código único de 12 caracteres. Basta compartilhar esse código com sua família e eles poderão seguir seus dados em modo somente leitura, mantendo a privacidade total."
          />
          <FaqItem
            delay={0.25}
            question="O que é o Saldo Projetado?"
            answer="É nosso algoritmo exclusivo que calcula seu saldo futuro somando todas as receitas e despesas pendentes em cada dia. Assim você sabe exatamente quanto dinheiro terá disponível em qualquer data."
          />
          <FaqItem
            delay={0.3}
            question="Meus dados estão seguros?"
            answer="Absolutamente. Usamos autenticação por tokens (Laravel Sanctum), conexões criptografadas e isolamento de dados por usuário. Nenhum dado financeiro é compartilhado sem seu consentimento explícito."
          />
          <FaqItem
            delay={0.35}
            question="Posso personalizar o visual do sistema?"
            answer="Sim! Nas configurações do sistema você pode escolher entre tema claro e escuro, e também pode trocar a cor principal do sistema para qualquer cor que desejar."
          />
          <FaqItem
            delay={0.4}
            question="O que é a Command Palette?"
            answer="É um atalho de teclado (tecla K) que abre um campo de busca universal. A partir dele, você pode navegar entre telas, criar lançamentos e executar ações sem usar o mouse."
          />
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
