import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Zap, Star } from "lucide-react";

const PricingSection = ({ handleSubscribe }) => {

  return (
    <section id="pricing" className="py-32 px-6 bg-zinc-950/20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <span className="text-[14px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-6 block font-mono">
            Investimento
          </span>
          <h2 className="text-5xl md:text-8xl font-black text-white tracking-tighter mb-10">
            Controle{" "}
            <span className="italic font-serif font-light text-[#98e5dd] lowercase tracking-normal">
              total
            </span>{" "}
            do seu dinheiro.
          </h2>
          <p className="text-zinc-500 font-medium mb-4">
            Preços transparentes. Escolha o plano ideal.
          </p>
          <div className="inline-flex items-center gap-4 px-6 py-2 rounded-full bg-white/5 border border-white/10">
            <span className="text-[10px] font-black text-[#98e5dd] uppercase tracking-widest">Pague com: Pix, Cartão ou Boleto Bancário</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Plano Básico */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.6, ease: "easeOut" }}
            whileHover={{ y: -12, scale: 1.02 }}
            className="bg-zinc-900/40 border border-white/5 p-10 rounded-[40px] flex flex-col relative group"
          >
            <div className="absolute inset-0 rounded-[40px] overflow-hidden pointer-events-none">
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              />
            </div>
            <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-zinc-700 transition-colors duration-300">
              <Zap size={20} className="text-zinc-500" />
            </div>
            <h4 className="text-lg font-bold text-zinc-500 mb-2 uppercase tracking-widest">
              Plano Básico
            </h4>
            <div className="text-5xl font-black text-white mb-1 italic">
              R$ 9,90
              <span className="text-sm text-zinc-500 font-medium">/mês</span>
            </div>
            <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-4">
              14 dias grátis <span className="text-[#98e5dd]">• sem cartão</span>
            </div>
            <p className="text-zinc-600 text-sm font-medium mb-10">
              Para quem quer começar a organizar as finanças de forma simples.
            </p>
            <ul className="space-y-4 mb-12 flex-1">
              <li className="flex items-center gap-3 text-zinc-500 text-sm font-medium">
                <CheckCircle2 size={16} className="text-[#98e5dd]" /> 2 Contas Bancárias
              </li>
              <li className="flex items-center gap-3 text-zinc-500 text-sm font-medium">
                <CheckCircle2 size={16} className="text-[#98e5dd]" /> 1 Cartão de Crédito
              </li>
              <li className="flex items-center gap-3 text-zinc-500 text-sm font-medium">
                <CheckCircle2 size={16} className="text-[#98e5dd]" /> Controle de Despesas
              </li>
              <li className="flex items-center gap-3 text-zinc-500 text-sm font-medium">
                <CheckCircle2 size={16} className="text-[#98e5dd]" /> Relatórios Mensais
              </li>
            </ul>
            <button
              onClick={() => handleSubscribe()}
              className="w-full py-5 rounded-2xl bg-white/5 border border-white/10 text-white font-black hover:bg-white/10 transition-all uppercase tracking-widest text-xs text-center"
            >
              Começar 14 Dias Grátis

            </button>
          </motion.div>

          {/* Premium Mensal */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
            whileHover={{ y: -12, scale: 1.03 }}
            className="bg-zinc-900 border border-[#98e5dd]/30 p-10 rounded-[40px] flex flex-col relative animate-glow-card"
          >
            <div className="absolute inset-0 rounded-[40px] overflow-hidden pointer-events-none">
              <div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-[#98e5dd]/10 to-transparent -translate-x-full animate-landing-shimmer"
              />
            </div>

            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#98e5dd] text-[#020617] text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full z-10">
              Mais popular
            </div>
            <div className="w-12 h-12 bg-[#98e5dd]/10 rounded-2xl flex items-center justify-center mb-8">
              <Zap size={20} className="text-[#98e5dd]" />
            </div>
            <h4 className="text-lg font-bold text-[#98e5dd] mb-2 uppercase tracking-widest">
              Premium Mensal
            </h4>
            <div className="text-5xl font-black text-white mb-1">
              R$ 19,90
              <span className="text-sm text-zinc-500 font-medium">/mês</span>
            </div>
            <div className="text-[10px] font-black text-[#98e5dd] uppercase tracking-[0.2em] mb-4">
              14 dias grátis • sem cartão
            </div>
            <p className="text-zinc-600 text-sm font-medium mb-10">
              Tudo ilimitado. Sem restrições.
            </p>
            <ul className="space-y-4 mb-12 flex-1">
              <li className="flex items-center gap-3 text-zinc-400 text-sm font-medium">
                <CheckCircle2 size={16} className="text-[#98e5dd]" /> Contas &
                Cartões ilimitados
              </li>
              <li className="flex items-center gap-3 text-zinc-400 text-sm font-medium">
                <CheckCircle2 size={16} className="text-[#98e5dd]" /> Relatórios Avançados
              </li>
              <li className="flex items-center gap-3 text-zinc-400 text-sm font-medium">
                <CheckCircle2 size={16} className="text-[#98e5dd]" /> Tema Personalizável
              </li>
              <li className="flex items-center gap-3 text-zinc-400 text-sm font-medium">
                <CheckCircle2 size={16} className="text-[#98e5dd]" /> Compartilhamento Familiar
              </li>
            </ul>
            <button
              onClick={() => handleSubscribe()}
              className="w-full py-5 rounded-2xl bg-[#98e5dd] text-[#020617] font-black hover:brightness-110 transition-all uppercase tracking-widest text-xs text-center"
              style={{
                boxShadow:
                  "0 0 25px rgba(152,229,221,0.25), 0 0 60px rgba(152,229,221,0.08)",
              }}
            >
              Começar 14 Dias Grátis

            </button>
          </motion.div>

          {/* Plano Anual */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
            whileHover={{ y: -12, scale: 1.02 }}
            className="bg-zinc-900/40 border border-white/5 p-10 rounded-[40px] flex flex-col relative group"
          >
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#eeb58f] text-[#020617] text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full z-10 animate-pulse">
              Melhor custo-benefício
            </div>
            <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-zinc-700 transition-colors duration-300">
              <Star size={20} className="text-zinc-500" />
            </div>
            <h4 className="text-lg font-bold text-zinc-500 mb-2 uppercase tracking-widest">
              Plano Anual
            </h4>
            <div className="text-5xl font-black text-white mb-1 italic">
              R$ 199,90
              <span className="text-sm text-zinc-500 font-medium">/ano</span>
            </div>
            <div className="text-[10px] font-black text-[#eeb58f] uppercase tracking-[0.2em] mb-4">
              14 dias grátis • sem cartão
            </div>
            <div className="bg-[#98e5dd]/10 text-[#98e5dd] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 self-start">
              2 Meses Grátis
            </div>
            <p className="text-zinc-600 text-sm font-medium mb-10">
              Domine suas finanças por um ano inteiro com desconto máximo.
            </p>
            <ul className="space-y-4 mb-12 flex-1">
              <li className="flex items-center gap-3 text-zinc-400 text-sm font-medium">
                <CheckCircle2 size={16} className="text-[#98e5dd]" /> Tudo do Premium
              </li>
              <li className="flex items-center gap-3 text-zinc-400 text-sm font-medium">
                <CheckCircle2 size={16} className="text-[#eeb58f]" /> 2 meses grátis
              </li>
              <li className="flex items-center gap-3 text-zinc-400 text-sm font-medium">
                <CheckCircle2 size={16} className="text-[#98e5dd]" /> Acesso antecipado
              </li>
              <li className="flex items-center gap-3 text-zinc-400 text-sm font-medium">
                <CheckCircle2 size={16} className="text-[#98e5dd]" /> Suporte prioritário
              </li>
            </ul>
            <button
              onClick={() => handleSubscribe()}
              className="w-full py-5 rounded-2xl bg-white/10 border border-white/5 text-white font-black hover:bg-white/20 transition-all uppercase tracking-widest text-xs text-center"
            >
              Começar 14 Dias Grátis

            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
