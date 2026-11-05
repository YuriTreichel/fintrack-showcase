import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/classNames';

export default function LoadingState({ 
  message = "Carregando...", 
  color = "mint", 
  minHeight = "400px",
  className 
}) {
  const isMint = color === "mint";
  const isPink = color === "pink";

  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center space-y-6 w-full animate-in fade-in duration-700",
        className
      )}
      style={{ minHeight }}
    >
      <div className="relative">
        {/* Modern Minimalist Spinner */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className={cn(
            "w-12 h-12 rounded-full border-2 border-transparent",
            {
              "border-t-fin-mint": isMint,
              "border-t-fin-pink": isPink,
              "border-t-zinc-400": !isMint && !isPink
            }
          )}
        />
        
        {/* Subtle Glow Background */}
        <div 
          className={cn(
            "absolute inset-0 blur-2xl opacity-20 rounded-full animate-pulse",
            {
              "bg-fin-mint": isMint,
              "bg-fin-pink": isPink,
              "bg-zinc-400": !isMint && !isPink
            }
          )}
        />
      </div>

      <div className="flex flex-col items-center space-y-1">
        <motion.p 
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-zinc-500 font-bold uppercase tracking-[0.2em] text-[10px]"
        >
          {message}
        </motion.p>
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: "24px" }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className={cn(
            "h-[1px] rounded-full opacity-30",
            {
              "bg-fin-mint": isMint,
              "bg-fin-pink": isPink,
              "bg-zinc-400": !isMint && !isPink
            }
          )}
        />
      </div>
    </div>
  );
}
