import React from "react";
import { motion } from "framer-motion";
import { 
  CreditCard, 
  BarChart3, 
  Target, 
  ShieldCheck, 
  Layers, 
  Lock,
  TrendingUp,
  Zap
} from "lucide-react";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const FeatureCard = ({ icon: Icon, title, description, color, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
    className="group relative p-8 rounded-[32px] bg-white/[0.03] border border-white/5 hover:border-[#98e5dd]/30 hover:bg-white/[0.06] transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
  >
    <div className={cn(
      "w-14 h-14 rounded-2xl flex items-center justify-center mb-8 transition-transform group-hover:scale-110 duration-500",
      color === "mint" ? "bg-[#98e5dd]/10 text-[#98e5dd]" : "bg-[#eeb58f]/10 text-[#eeb58f]"
    )}>
      <Icon size={28} />
    </div>
    
    <h3 className="text-xl font-bold text-white mb-4 tracking-tight group-hover:text-[#98e5dd] transition-colors">
      {title}
    </h3>
    
    <p className="text-zinc-500 text-sm leading-relaxed font-medium">
      {description}
    </p>

  </motion.div>
);

const Features = ({ onCtaClick }) => {
  const features = [
    {
      icon: CreditCard,
      title: "Gestão de Cartões",
      description: "Organize todas as suas faturas e limites em uma visão única. Nunca mais se perca com datas de vencimento.",
      color: "mint",
      delay: 0.1
    },
    {
      icon: BarChart3,
      title: "Relatórios Claros",
      description: "Gráficos que fazem sentido. Entenda exatamente para onde seu dinheiro está indo em segundos.",
      color: "orange",
      delay: 0.2
    },
    {
      icon: Target,
      title: "Metas e Objetivos",
      description: "Planeje sua liberdade financeira. Defina metas e acompanhe seu progresso de forma visual.",
      color: "mint",
      delay: 0.3
    },
    {
      icon: ShieldCheck,
      title: "Planejamento Mensal",
      description: "Defina orçamentos por categoria e mantenha seus gastos sob controle com limites inteligentes.",
      color: "orange",
      delay: 0.4
    },
    {
      icon: Layers,
      title: "Contas e Transações",
      description: "Histórico completo e categorizado de todas as suas movimentações, tudo em um só lugar.",
      color: "mint",
      delay: 0.5
    },
    {
      icon: Zap,
      title: "Alertas Inteligentes",
      description: "Receba notificações sobre vencimentos e gastos fora do comum para manter sua saúde financeira.",
      color: "orange",
      delay: 0.6
    }
  ];

  return (
    <section id="features" className="py-32 px-6 relative overflow-hidden bg-transparent">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[radial-gradient(circle,rgba(152,229,221,0.03)_0%,transparent_70%)] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="max-w-3xl mb-24">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#98e5dd]/10 border border-[#98e5dd]/20 mb-6"
          >
            <Zap size={12} className="text-[#98e5dd]" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#98e5dd]">Recursos Pro</span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-8 leading-[0.9]"
          >
            Potência extrema. <br />
            <span className="italic font-serif font-light text-[#98e5dd] lowercase tracking-normal">Simplicidade absoluta.</span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-zinc-500 font-medium leading-relaxed"
          >
            Tudo o que você precisa para dominar suas finanças, consolidado em uma interface elegante e intuitiva.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
        
        {/* Bottom CTA for Features */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.7 }}
          className="mt-20 p-8 md:p-12 rounded-[40px] bg-gradient-to-r from-[#98e5dd]/5 to-transparent border border-white/5 flex flex-col md:flex-row items-center justify-between gap-10"
        >
          <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            <div className="w-14 h-14 rounded-2xl bg-[#98e5dd] flex items-center justify-center text-[#020617] shrink-0">
              <TrendingUp size={28} />
            </div>
            <div>
              <h4 className="text-2xl font-bold text-white mb-2">Pronto para evoluir?</h4>
              <p className="text-zinc-500 text-sm max-w-sm">Junte-se a milhares de usuários que já transformaram sua relação com o dinheiro.</p>
            </div>
          </div>
          <button 
            onClick={onCtaClick}
            className="w-full md:w-auto bg-white text-black px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-[#98e5dd] transition-all active:scale-95 whitespace-nowrap"
          >
            Começar Agora
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
