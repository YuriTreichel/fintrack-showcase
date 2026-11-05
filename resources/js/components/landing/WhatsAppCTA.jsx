import React from "react";
import { motion } from "framer-motion";
import { MessageCircle, Wallet } from "lucide-react";

const WhatsAppCTA = () => {
  return (
    <section className="py-24 px-6 overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative group p-12 md:p-16 rounded-[48px] border border-white/5 bg-zinc-900/30 overflow-hidden"
        >
          {/* Ambient effects */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(152,229,221,0.08)_0%,transparent_70%)] rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none group-hover:bg-[#98e5dd]/10 transition-colors duration-1000" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[radial-gradient(circle,rgba(238,181,143,0.08)_0%,transparent_70%)] rounded-full translate-y-1/2 -translate-x-1/4 pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-xl text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#98e5dd]/10 border border-[#98e5dd]/20 mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#98e5dd] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#98e5dd]"></span>
                </span>
                <span className="text-[10px] font-black text-[#98e5dd] uppercase tracking-widest">Suporte Online</span>
              </div>
              
              <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-6 leading-[0.9]">
                Dúvidas ou <br />
                <span className="italic font-serif font-light text-[#98e5dd] lowercase tracking-normal">
                  especificações?
                </span>
              </h2>
              
              <p className="text-lg text-zinc-500 font-medium leading-relaxed">
                Fale diretamente com quem construiu o sistema. Tire suas dúvidas, envie sugestões ou peça suporte técnico via WhatsApp. Estamos prontos para te ajudar.
              </p>
            </div>

            <div className="shrink-0">
              <a
                href="https://wa.me/18005550199?text=Olá Yuri, estou na landing page do FinTrack e gostaria de tirar uma dúvida."
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center gap-4 bg-[#98e5dd] text-[#020617] px-10 py-6 rounded-[24px] font-black text-xl hover:scale-105 active:scale-95 transition-all animate-glow-mint-lg"
              >
                <MessageCircle size={28} className="group-hover:rotate-12 transition-transform duration-500" />
                Fale com o DEV
              </a>
            </div>
          </div>

          {/* Subtle background icons/particles pattern */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none">
             <div className="top-10 left-10 absolute rotate-12"><MessageCircle size={100} /></div>
             <div className="bottom-10 right-20 absolute -rotate-12"><Wallet size={120} /></div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default WhatsAppCTA;
