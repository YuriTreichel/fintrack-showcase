import React from "react";
import { motion } from "framer-motion";
import { Moon, Shield, MessageCircle, Clock } from "lucide-react";

const Differentiators = () => {
  return (
    <section className="py-32 px-6 relative overflow-hidden">
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
          {[
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
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-zinc-900/20 border border-white/5 rounded-3xl p-8 hover:border-[#98e5dd]/20 transition-all duration-500 group"
            >
              <div className="w-12 h-12 bg-[#98e5dd]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                <item.icon size={22} className="text-[#98e5dd]" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">
                {item.title}
              </h4>
              <p className="text-zinc-500 text-sm font-medium leading-relaxed">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Differentiators;
