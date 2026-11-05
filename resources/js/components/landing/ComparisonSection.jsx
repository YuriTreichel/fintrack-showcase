import React, { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { XCircle, CheckCircle2, Minus, Plus, Smartphone, BarChart3, Clock, AlertTriangle } from "lucide-react";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const ComparisonCard = ({ title, subtitle, icon: Icon, items, type = "negative", delay = 0 }) => {
  const cardRef = useRef(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springRotateX = useSpring(rotateX, { stiffness: 150, damping: 20 });
  const springRotateY = useSpring(rotateY, { stiffness: 150, damping: 20 });

  const handleMouseMove = (e) => {
    if (window.matchMedia("(hover: none)").matches) return;
    const rect = cardRef.current.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const dx = e.clientX - rect.left - cx;
    const dy = e.clientY - rect.top - cy;
    rotateY.set((dx / cx) * 5);
    rotateX.set(-(dy / cy) * 5);
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  const isNegative = type === "negative";

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.8 }}
      style={{
        rotateX: springRotateX,
        rotateY: springRotateY,
        transformStyle: "preserve-3d",
        perspective: 1000,
      }}
      className={cn(
        "relative p-8 md:p-10 rounded-[40px] border transition-all duration-700 group overflow-hidden h-full",
        isNegative 
          ? "bg-zinc-900/20 border-white/5 hover:border-zinc-500/30" 
          : "bg-zinc-900/40 border-[#98e5dd]/10 hover:border-[#98e5dd]/30 shadow-[0_20px_50px_rgba(152,229,221,0.05)]"
      )}
    >
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-700",
        isNegative ? "from-zinc-500/[0.03] to-transparent" : "from-[#98e5dd]/[0.05] to-transparent"
      )} />

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center gap-4 mb-8">
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-700 group-hover:scale-110",
            isNegative ? "bg-zinc-500/10 text-zinc-500" : "bg-[#98e5dd]/10 text-[#98e5dd]"
          )}>
            <Icon size={24} />
          </div>
          <div>
            <h4 className={cn(
              "text-lg font-black uppercase tracking-widest",
              isNegative ? "text-zinc-500" : "text-[#98e5dd]"
            )}>
              {subtitle}
            </h4>
            <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">{title}</h3>
          </div>
        </div>

        <div className="space-y-6 mt-auto">
          {items.map((item, idx) => (
            <div key={idx} className="flex gap-4 items-start group/item">
              <div className={cn(
                "mt-1.5 shrink-0 transition-transform duration-300 group-hover/item:scale-125",
                isNegative ? "text-zinc-600" : "text-[#98e5dd]"
              )}>
                {isNegative ? <Minus size={16} /> : <Plus size={16} />}
              </div>
              <p className={cn(
                "text-base font-medium leading-tight transition-colors duration-300",
                isNegative ? "text-zinc-500 group-hover/item:text-zinc-400" : "text-zinc-400 group-hover/item:text-white"
              )}>
                {item}
              </p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const ComparisonSection = () => {
  return (
    <section className="py-32 px-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(152,229,221,0.08)_0%,transparent_70%)] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(238,181,143,0.08)_0%,transparent_70%)] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-24">
          <h2 className="text-[14px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-6 font-mono">
            A Evolução da Gestão
          </h2>
          <h3 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-tight">
            Chega de planilhas. <br />
            <span className="italic font-serif font-light text-[#98e5dd] lowercase tracking-normal">
              tenha clareza real.
            </span>
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          <ComparisonCard
            delay={0.1}
            type="negative"
            subtitle="O Passado"
            title="Planilhas & Papel"
            icon={Clock}
            items={[
              "Lançamentos manuais que tomam horas do seu dia",
              "Dificuldade extrema para visualizar gastos no celular",
              "Fórmulas complexas que quebram a qualquer momento",
              "Falta de alertas: você só percebe o gasto quando já passou"
            ]}
          />

          <ComparisonCard
            delay={0.2}
            type="positive"
            subtitle="O Futuro"
            title="FinTrack Pro"
            icon={CheckCircle2}
            items={[
              "Interface fluída: lance gastos em segundos de qualquer lugar",
              "Design Mobile First feito para o seu dia a dia nas ruas",
              "Relatórios automáticos que geram insights instantâneos",
              "Alertas inteligentes que te avisam antes do orçamento estourar"
            ]}
          />
        </div>
      </div>
    </section>
  );
};

export default ComparisonSection;
