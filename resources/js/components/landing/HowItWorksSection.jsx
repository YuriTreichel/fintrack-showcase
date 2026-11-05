import React from "react";
import { motion } from "framer-motion";
import {
  Smartphone,
  Target,
  Sparkles,
  Moon,
  Shield,
  MessageCircle,
  Clock,
} from "lucide-react";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const HowItWorksSection = () => {
  const steps = [
    {
      step: "01",
      icon: Smartphone,
      title: "Cadastre-se em 30s",
      desc: "Crie sua conta rapidamente e escolha o plano ideal. Pagamento facilitado via cartão de crédito ou boleto.",
    },
    {
      step: "02",
      icon: Target,
      title: "Configure suas contas",
      desc: "Adicione suas contas bancárias, cartões de crédito e categorias personalizadas.",
    },
    {
      step: "03",
      icon: Sparkles,
      title: "Controle total",
      desc: "Lance suas receitas e despesas. O saldo projetado, relatórios e alertas fazem o resto.",
    },
  ];

  const differentials = [
    {
      icon: Moon,
      title: "Dark Mode Nativo",
      desc: "Interface premium escura que cuida dos seus olhos e da sua produtividade.",
    },
    {
      icon: Shield,
      title: "Dados Seguros",
      desc: "Autenticação por token, dados criptografados e sessões protegidas.",
    },
    {
      icon: MessageCircle,
      title: "Atendimento Humanizado",
      desc: "Suporte direto e humanizado via WhatsApp para ajudar você em tempo real.",
    },
    {
      icon: Clock,
      title: "Lançamento Rápido",
      desc: "Efetive pagamentos em um clique com nosso modal de ação rápida.",
    },
  ];

  return (
    <div id="como-funciona">
      {/* ===== HOW IT WORKS STEPS ===== */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-[14px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-6 font-mono">
              Passo a Passo
            </h2>
            <h3 className="text-4xl md:text-6xl font-black text-white tracking-tighter">
              Começar é mais simples
              <br />
              <span className="italic font-serif font-light text-[#98e5dd] lowercase tracking-normal">
                do que você imagina.
              </span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-24 relative">
            {/* Connection Line (Desktop) */}
            <div className="hidden lg:block absolute top-8 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent z-0" />
            
            {steps.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2, duration: 0.8 }}
                className="text-center relative z-10 group"
              >
                <div className="w-16 h-16 bg-[#98e5dd]/10 border border-[#98e5dd]/20 rounded-2xl flex items-center justify-center mx-auto mb-8 relative group-hover:scale-110 group-hover:bg-[#98e5dd]/20 transition-all duration-500">
                  <item.icon size={28} className="text-[#98e5dd]" />
                </div>
                <div className="text-[10px] font-black text-[#98e5dd] uppercase tracking-[0.3em] mb-3 group-hover:tracking-[0.5em] transition-all duration-500">
                  {item.step}
                </div>
                <h4 className="text-xl font-bold text-white mb-3">
                  {item.title}
                </h4>
                <p className="text-zinc-500 text-sm font-medium leading-relaxed max-w-[280px] mx-auto">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== DIFFERENTIALS ===== */}
      <section className="py-32 px-6 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(238,181,143,0.08)_0%,transparent_70%)] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-24">
            <div className="inline-block h-px w-20 bg-gradient-to-r from-transparent via-[#98e5dd] to-transparent mb-8" />
            <h2 className="text-[14px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-6 font-mono">
              Por que nos escolher
            </h2>
            <h3 className="text-4xl md:text-6xl font-black text-white tracking-tighter">
              Feito para quem leva
              <br />
              <span className="italic font-serif font-light text-[#98e5dd] lowercase tracking-normal">
                finanças a sério.
              </span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {differentials.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className="bg-zinc-900/20 border border-white/5 rounded-3xl p-8 hover:border-[#98e5dd]/20 transition-all duration-500 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-[#98e5dd]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#98e5dd]/20 transition-all duration-500">
                    <item.icon size={22} className="text-[#98e5dd]" />
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">
                    {item.title}
                  </h4>
                  <p className="text-zinc-500 text-sm font-medium leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorksSection;
