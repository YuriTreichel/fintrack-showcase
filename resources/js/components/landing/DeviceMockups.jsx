import React from "react";
import { motion } from "framer-motion";
import { Shield, Lock, Wallet, TrendingUp } from "lucide-react";
import desktopImg from "../../assets/landing/desktop_screenshot.png";
import mobileImg from "../../assets/landing/mobile_screenshot.png";

const DeviceMockups = () => {
  return (
    <div className="relative w-full h-[500px] md:h-[600px] lg:h-[700px] flex items-center justify-center">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[radial-gradient(circle,rgba(152,229,221,0.08)_0%,transparent_70%)] pointer-events-none" />

      {/* Desktop Mockup (MacBook style) */}
      <motion.div
        initial={{ opacity: 0, x: 50, rotateY: -10 }}
        animate={{ opacity: 1, x: 0, rotateY: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="relative z-10 w-[85%] md:w-[90%] lg:w-[100%] max-w-4xl perspective-1000"
      >
        <div className="relative rounded-[24px] md:rounded-[32px] border-[8px] md:border-[12px] border-zinc-900 bg-zinc-900 shadow-2xl overflow-hidden aspect-video flex flex-col">
          {/* Top Bar */}
          <div className="h-6 bg-zinc-900/80 backdrop-blur-md flex items-center px-4 gap-1.5 z-20">
            <div className="w-2 h-2 rounded-full bg-red-500/50" />
            <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
            <div className="w-2 h-2 rounded-full bg-green-500/50" />
          </div>
          <div className="flex-1 overflow-hidden">
            <img 
              src={desktopImg} 
              alt="FinTrack Desktop" 
              className="w-full h-full object-cover object-top"
            />
          </div>
        </div>
        {/* Base of laptop */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[105%] h-4 bg-zinc-800 rounded-b-xl border-b-4 border-zinc-700/50" />
      </motion.div>

      {/* Mobile Mockup (iPhone style) */}
      <motion.div
        initial={{ opacity: 0, y: 100, x: -50 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
        className="absolute -left-4 md:-left-12 bottom-0 z-30 w-[210px] md:w-[280px] lg:w-[320px]"
      >
        <div className="relative rounded-[32px] md:rounded-[54px] border-[8px] md:border-[14px] border-zinc-900 bg-zinc-950 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden aspect-[9/19.5]">
          {/* Notch/Island */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-7 bg-zinc-900 rounded-full z-40 flex items-center justify-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-white/5" />
             <div className="w-1 h-1 rounded-full bg-white/5" />
          </div>
          
          {/* Status Bar Overlay */}
          <div className="absolute top-0 left-0 right-0 h-10 flex justify-between items-end px-8 pb-1 z-30 pointer-events-none">
            <span className="text-[11px] font-bold text-white/90">9:41</span>
            <div className="flex gap-1.5 items-center">
              <div className="w-3.5 h-2 border border-white/40 rounded-[2px]" />
              <div className="w-2.5 h-2.5 bg-white/90 rounded-full" />
            </div>
          </div>

          <div className="w-full h-full pt-10">
            <img 
              src={mobileImg} 
              alt="FinTrack Mobile" 
              className="w-full h-full object-cover object-top"
            />
          </div>
        </div>
      </motion.div>

      {/* Floating Elements (Floating Icons) */}
      <div className="absolute inset-0 pointer-events-none z-40">
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[10%] right-[5%] w-16 h-16 rounded-2xl bg-zinc-900/40 backdrop-blur-xl border border-white/10 flex items-center justify-center text-[#98e5dd] shadow-2xl"
        >
          <Shield size={28} />
        </motion.div>

        <motion.div
          animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="absolute bottom-[20%] right-[15%] w-14 h-14 rounded-2xl bg-[#98e5dd]/10 backdrop-blur-xl border border-[#98e5dd]/20 flex items-center justify-center text-[#98e5dd] shadow-2xl"
        >
          <Lock size={24} />
        </motion.div>

        <motion.div
          animate={{ x: [0, 15, 0], y: [0, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-[40%] -left-[5%] md:-left-[10%] w-12 h-12 rounded-xl bg-zinc-900/40 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white/50 shadow-2xl"
        >
          <Wallet size={20} />
        </motion.div>

        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-10 left-[40%] px-4 py-2 rounded-full bg-[#98e5dd] text-[#020617] text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl"
        >
          <TrendingUp size={14} /> Sistema em tempo real
        </motion.div>
      </div>
    </div>
  );
};

export default DeviceMockups;
