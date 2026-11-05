import React from 'react';
import { cn } from '../../utils/classNames';

export default function Button({ 
  children, 
  variant = "primary", 
  size = "md", 
  className, 
  icon: Icon,
  iconSize = 18,
  ...props 
}) {
  const variants = {
    primary: "bg-fin-mint text-fin-bg shadow-lg shadow-fin-mint/10 hover:brightness-110",
    secondary: "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/5 text-zinc-600 dark:text-zinc-400 hover:text-fin-mint transition-all",
    outline: "bg-transparent border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white hover:bg-zinc-900/5 dark:hover:bg-white/5 font-bold uppercase tracking-widest",
    ghost: "bg-transparent text-zinc-600 hover:bg-zinc-900/5 dark:hover:bg-white/5",
    danger: "bg-rose-500/10 text-rose-500 hover:bg-rose-500/20",
  };

  const sizes = {
    sm: "h-9 px-4 text-xs",
    md: "h-12 px-6 text-sm",
    lg: "h-14 px-8 text-base",
    icon: "h-12 w-12 flex items-center justify-center p-0",
  };

  return (
    <button
      className={cn(
        "flex items-center justify-center gap-2 font-bold transition-all duration-200 rounded-2xl cursor-pointer active:scale-95 focus-visible:ring-2 focus-visible:ring-fin-mint focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {Icon && <Icon size={iconSize} className={children ? "" : "mx-auto"} />}
      {children}
    </button>
  );
}
