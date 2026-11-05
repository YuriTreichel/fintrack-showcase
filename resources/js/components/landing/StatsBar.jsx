import React from "react";
import { motion } from "framer-motion";
import AnimatedNumber from "./ui/AnimatedNumber";

const StatsBar = () => {
  return (
    <section className="py-16 px-6 border-y border-white/5 relative">
      <div className="absolute inset-0 bg-gradient-to-r from-[#98e5dd]/5 via-transparent to-[#eeb58f]/5 pointer-events-none" />
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10 relative z-10">
        {[
          { value: 1250, suffix: "+", label: "Usuários Ativos" },
          { value: 45000, suffix: "+", label: "Transações/Mês" },
          { value: 99, suffix: "%", label: "Uptime Garantido" },
          { value: 4.9, suffix: "★", label: "Nota dos Usuários" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.12, type: "spring", stiffness: 120 }}
            className="text-center group"
          >
            <div className="text-4xl md:text-5xl font-black text-white mb-2 group-hover:text-[#98e5dd] transition-colors duration-300">
              <AnimatedNumber value={stat.value} suffix={stat.suffix} />
            </div>
            <div className="text-[14px] font-bold text-zinc-500 uppercase tracking-widest">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default StatsBar;
