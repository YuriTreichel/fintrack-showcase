import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, CreditCard, PieChart, ShieldCheck, ArrowUpRight } from "lucide-react";

const VisualHero = () => {
  return (
    <div className="relative w-full h-[500px] md:h-[600px] flex items-center justify-center perspective-1000">
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-[radial-gradient(circle,rgba(152,229,221,0.1)_0%,transparent_70%)] pointer-events-none animate-pulse" />
      
      {/* Abstract Card Stack */}
      <div className="relative w-full max-w-lg h-full flex items-center justify-center" style={{ transformStyle: "preserve-3d" }}>
        
        {/* Main Dashboard Card (Glassmorphism) */}
        <motion.div
          initial={{ opacity: 0, y: 50, rotateX: 20 }}
          animate={{ opacity: 1, y: 0, rotateX: 10 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative z-20 w-full aspect-[4/3] bg-zinc-900/40 backdrop-blur-3xl border border-white/10 rounded-[40px] shadow-[0_100px_200px_rgba(0,0,0,0.6)] p-10 overflow-hidden"
        >
          <div className="flex justify-between items-start mb-12">
            <div>
              <div className="text-zinc-500 text-xs font-black uppercase tracking-widest mb-2">Balanço Mensal</div>
              <div className="text-4xl font-black text-white tracking-tighter">R$ 16.424,50</div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#98e5dd]/10 flex items-center justify-center text-[#98e5dd]">
              <TrendingUp size={24} />
            </div>
          </div>

          {/* Simple Animated Chart (SVG) */}
          <div className="relative h-40 w-full mt-auto">
            <svg viewBox="0 0 400 100" className="w-full h-full overflow-visible">
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, delay: 0.5 }}
                d="M0,80 C50,80 80,20 150,40 S250,10 300,50 S350,20 400,30"
                fill="none"
                stroke="#98e5dd"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <motion.path
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.1 }}
                transition={{ duration: 1, delay: 1.5 }}
                d="M0,80 C50,80 80,20 150,40 S250,10 300,50 S350,20 400,30 L400,100 L0,100 Z"
                fill="#98e5dd"
              />
            </svg>
          </div>
        </motion.div>

        {/* Credit Card Floating */}
        <motion.div
          animate={{ y: [0, -20, 0], rotateX: [20, 15, 20], rotateY: [-20, -25, -20] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[10%] -right-[10%] z-30 w-72 aspect-[1.58/1] bg-gradient-to-br from-zinc-800 to-zinc-950 border border-white/5 rounded-2xl shadow-2xl p-6 flex flex-col justify-between overflow-hidden"
          style={{ transformStyle: "preserve-3d" }}
        >
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(152,229,221,0.1),transparent)]" />
          <div className="flex justify-between items-start">
             <CreditCard className="text-zinc-500" size={24} />
             <div className="w-10 h-8 bg-zinc-700/50 rounded-md" />
          </div>
          <div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] mb-1">Limite Disponível</div>
            <div className="text-xl font-bold text-white tracking-tight">R$ 5.000,00</div>
          </div>
        </motion.div>

        {/* Small Transaction Card */}
        <motion.div
          animate={{ x: [0, 15, 0], y: [0, 10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute -bottom-[5%] -left-[15%] z-30 w-64 bg-[#1a1c1c]/90 border border-[#98e5dd]/20 backdrop-blur-xl rounded-[24px] shadow-2xl p-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
              <PieChart size={20} />
            </div>
            <div>
              <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Gasto em Lazer</div>
              <div className="text-lg font-black text-white">- R$ 480,00</div>
            </div>
            <ArrowUpRight size={18} className="text-zinc-700 ml-auto" />
          </div>
        </motion.div>

        {/* Floating Badges */}
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute top-[30%] -left-[20%] bg-[#98e5dd] text-[#020617] px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-tighter flex items-center gap-2 shadow-xl"
        >
          <ShieldCheck size={14} /> Dados Criptografados
        </motion.div>
      </div>
    </div>
  );
};

export default VisualHero;
