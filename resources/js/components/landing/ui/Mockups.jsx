import React from "react";
import { motion } from "framer-motion";
import { Car, Sparkles, TrendingUp } from "lucide-react";

const cn = (...classes) => classes.filter(Boolean).join(" ");

export const ReportsMockup = ({ transparent = false }) => (
  <div className={cn(
    "rounded-3xl border border-white/5 p-5 w-full h-full flex flex-col justify-between group-hover:border-[#98e5dd]/20 transition-all duration-500",
    transparent ? "bg-transparent border-none p-0" : "bg-[#111313]"
  )}>
    <div className="flex justify-between items-center mb-4">
      <div className="flex gap-1.5">
        {[40, 70, 45, 90, 65].map((h, i) => (
          <motion.div
            key={i}
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 + i * 0.1, duration: 1 }}
            className="w-1.5 bg-[#98e5dd]/40 rounded-full self-end origin-bottom"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
    <div className="relative h-28 w-28 mx-auto flex items-center justify-center">
      <svg className="w-full h-full -rotate-90">
        <circle
          cx="56"
          cy="56"
          r="45"
          fill="transparent"
          stroke="currentColor"
          strokeWidth="8"
          className="text-white/5"
        />
        <motion.circle
          cx="56"
          cy="56"
          r="45"
          fill="transparent"
          stroke="currentColor"
          strokeWidth="8"
          strokeDasharray="282.7"
          initial={{ strokeDashoffset: 282.7 }}
          whileInView={{ strokeDashoffset: 282.7 - (282.7 * 0.65) }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, delay: 0.8, ease: "easeOut" }}
          className="text-[#98e5dd]"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xs font-black text-white">65%</span>
        <span className="text-[7px] font-bold text-zinc-500 uppercase">Meta</span>
      </div>
    </div>
  </div>
);

export const GoalsMockup = () => (
  <div className="grid grid-cols-2 gap-3 w-full h-full">
    {[
      { label: "Carro Novo", val: "R$ 45.000", prog: 75, color: "#98e5dd", icon: Car },
      { label: "Viagem Europa", val: "R$ 12.000", prog: 40, color: "#eeb58f", icon: Sparkles },
    ].map((g, i) => (
      <div key={i} className="bg-white/[0.03] border border-white/5 p-4 rounded-2xl flex flex-col justify-between hover:bg-white/[0.05] transition-colors">
        <div className="flex justify-between items-start mb-2">
          <div className={`p-1.5 rounded-lg bg-white/5 text-white/70`}>
            <g.icon size={14} />
          </div>
          <div className="text-[10px] font-black text-white">{g.val}</div>
        </div>
        <div className="text-[10px] font-bold text-zinc-400 mb-2">{g.label}</div>
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.5 + i * 0.2 }}
            style={{ backgroundColor: g.color, width: `${g.prog}%` }}
            className="h-full rounded-full origin-left"
          />
        </div>
      </div>
    ))}
  </div>
);

export const BudgetsMockup = () => (
  <div className="space-y-6 w-full">
    {[
      { label: "Alimentação", current: 850, limit: 1000, color: "#98e5dd" },
      { label: "Lazer", current: 420, limit: 500, color: "#a4bcf9" },
      { label: "Assinaturas", current: 180, limit: 200, color: "#f9a4a4" },
    ].map((b, i) => (
      <div key={i} className="space-y-2">
        <div className="flex justify-between items-end">
          <span className="text-[10px] font-bold text-zinc-400">{b.label}</span>
          <span className="text-[10px] font-black text-white">R$ {b.current} / {b.limit}</span>
        </div>
        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.4 + i * 0.1 }}
            style={{ backgroundColor: b.color, width: `${(b.current / b.limit) * 100}%` }}
            className="h-full rounded-full origin-left"
          />
        </div>
      </div>
    ))}
  </div>
);

export const TransactionsMockup = () => (
  <div className="space-y-3 w-full">
     {[
       { label: "Mercado Extra", val: "-R$ 450,20", cat: "Alimentação", color: "#f9a4a4" },
       { label: "Salário Empresa", val: "+R$ 5.200,00", cat: "Receita", color: "#98e5dd" },
       { label: "Posto Shell", val: "-R$ 220,15", cat: "Transporte", color: "#f9a4a4" },
     ].map((t, i) => (
       <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-colors">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-[10px] font-black">
                {t.label.charAt(0)}
             </div>
             <div>
                <div className="text-[10px] font-black text-white">{t.label}</div>
                <div className="text-[7px] text-zinc-500 font-bold uppercase">{t.cat}</div>
             </div>
          </div>
          <div className="text-[10px] font-black" style={{ color: t.color }}>{t.val}</div>
       </div>
     ))}
  </div>
);
