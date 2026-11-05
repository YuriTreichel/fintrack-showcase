import React from 'react';
import { cn } from '../../utils/classNames';

export default function StatCard({ title, value, subtitle, icon, color, className, onClick }) {
  const numericValue = Number(value) || 0;
  const isMint = color === "mint";

  return (
    <div
      onClick={onClick}
      className={cn(
        "p-4 md:p-7 rounded-[24px] border shadow-2xl relative overflow-hidden group transition-all duration-300 hover:-translate-y-2 hover:shadow-fin-mint/10",
        className ||
          "bg-fin-surface border-zinc-900/10 dark:border-white/5 hover:border-zinc-900/20 dark:hover:border-white/10",
      )}
    >
      {isMint && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-zinc-900/10 dark:bg-white/20 blur-3xl rounded-full -mt-10 -mr-10 group-hover:blur-[50px] transition-all"></div>
      )}
      <div className="flex items-center justify-between mb-4 md:mb-8 relative z-10">
        <h4
          className={cn(
            "font-medium text-xs md:text-sm transition-colors",
            isMint
              ? "text-fin-bg/70"
              : "text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-300",
          )}
        >
          {title}
        </h4>
        <div
          className={cn(
            "p-1.5 md:p-2 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
            {
              "bg-fin-bg/10": isMint,
              "bg-zinc-900/10 dark:bg-white/5 text-zinc-600 dark:text-zinc-300 group-hover:bg-zinc-900/20 dark:group-hover:bg-white/10":
                !isMint,
            },
          )}
        >
          {icon}
        </div>
      </div>

      <div className="relative z-10 font-mono">
        <span
          className={cn(
            "text-xl md:text-[32px] font-bold tracking-tight",
            isMint ? "text-fin-bg" : "text-zinc-900 dark:text-white",
          )}
        >
          <span
            className={cn(
              "text-sm md:text-xl mr-1 opacity-80",
              isMint ? "text-fin-bg/80" : "text-zinc-600 dark:text-zinc-500",
            )}
          >
            R$
          </span>
          {numericValue.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      </div>
      <p
        className={cn(
          "text-xs mt-3 flex items-center gap-2",
          isMint ? "text-fin-bg/70" : "text-zinc-600 dark:text-zinc-500",
        )}
      >
        <span
          className={cn(
            "w-2 h-2 rounded-full",
            isMint ? "bg-fin-bg/30" : "bg-zinc-700",
          )}
        ></span>
        {subtitle}
      </p>
    </div>
  );
}