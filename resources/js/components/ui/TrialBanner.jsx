import React from 'react';
import { motion } from 'framer-motion';
import { Zap, ArrowRight, Clock } from 'lucide-react';
import { differenceInDays, parseISO } from 'date-fns';

export default function TrialBanner({ trialEndsAt, onUpgrade }) {
  if (!trialEndsAt) return null;

  const endDate = typeof trialEndsAt === 'string' ? parseISO(trialEndsAt) : trialEndsAt;
  const daysRemaining = differenceInDays(endDate, new Date());

  if (daysRemaining < 0) return null;

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      className="mb-6 overflow-hidden"
    >
      <div className="bg-gradient-to-r from-fin-mint/20 via-fin-mint/10 to-transparent border border-fin-mint/20 rounded-[20px] md:rounded-[24px] p-3.5 md:p-5 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4 backdrop-blur-sm">
        <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto">
          <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-fin-mint flex items-center justify-center shadow-lg shadow-fin-mint/20 text-fin-bg">
            <Zap className="w-5 h-5 md:w-[20px] md:h-[20px]" fill="currentColor" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-[11px] md:text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight truncate md:whitespace-normal">
              Período de Teste Premium Ativo
            </h3>
            <p className="text-[10px] md:text-xs text-zinc-500 font-medium flex items-center gap-1 mt-0.5 whitespace-nowrap md:whitespace-normal overflow-hidden">
              <Clock size={10} className="text-fin-mint flex-shrink-0" />
              <span className="truncate">
                Você tem <span className="text-fin-mint font-bold">{daysRemaining + 1} {daysRemaining === 0 ? 'dia' : 'dias'}</span> de acesso total.
              </span>
            </p>
          </div>
        </div>
        
        <button
          onClick={onUpgrade}
          className="w-full md:w-auto px-5 py-2.5 md:px-6 md:py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-bold text-[10px] md:text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          Assinar Plano Pro
          <ArrowRight size={14} />
        </button>
      </div>
    </motion.div>
  );
}
