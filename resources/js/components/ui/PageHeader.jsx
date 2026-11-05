import React from 'react';
import { cn } from '../../utils/classNames';

export default function PageHeader({ 
  icon: Icon, 
  title, 
  subtitle, 
  label, 
  colorClass = "text-fin-mint", 
  bgClass = "bg-fin-mint/10",
  borderClass = "border-fin-mint/20",
  dotColorClass = "text-fin-mint",
  actions,
  className,
  centerActions = false
}) {
  return (
    <div className={cn("flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6 mb-4 md:mb-8", className)}>
      <div>
        <div className="flex items-center gap-3 md:gap-4 mb-2">
          <div className={cn("p-1.5 md:p-2 rounded-xl border shrink-0", bgClass, borderClass)}>
            {Icon && <Icon className={colorClass} size={20} />}
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <h1 className="text-2xl md:text-4xl font-black tracking-tight text-zinc-900 dark:text-white uppercase italic leading-none">
              {title}<span className={dotColorClass}>.</span>
            </h1>
            {label && (
              typeof label === 'string' ? (
                <span className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                  bgClass,
                  borderClass,
                  colorClass
                )}>
                  {label}
                </span>
              ) : (
                label
              )
            )}
          </div>
        </div>
        {subtitle && (
          <p className="text-zinc-500 font-medium text-xs md:text-sm ml-1">
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className={cn(
          "flex items-center gap-3 md:w-auto md:justify-end",
          centerActions ? "w-full justify-center" : "w-full justify-end"
        )}>
          {actions}
        </div>
      )}
    </div>
  );
}
