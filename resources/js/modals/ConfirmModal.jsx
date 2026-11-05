import React from 'react';
import { createPortal } from "react-dom";
import { AlertTriangle, X } from 'lucide-react';
import { cn } from '../utils/classNames';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmLabel = "Excluir", cancelLabel = "Cancelar", variant = "danger" }) {
  if (!isOpen) return null;

  const variants = {
    danger: {
      icon: <AlertTriangle size={32} />,
      iconBg: "bg-rose-500/10 text-rose-500 border-rose-500/20",
      confirmBtn: "bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20",
    },
    warning: {
      icon: <AlertTriangle size={32} />,
      iconBg: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      confirmBtn: "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20",
    },
    info: {
      icon: <AlertTriangle size={32} />,
      iconBg: "bg-fin-mint/10 text-fin-mint border-fin-mint/20",
      confirmBtn: "bg-fin-mint hover:brightness-110 text-fin-bg shadow-fin-mint/20",
    }
  };

  const currentVariant = variants[variant] || variants.danger;

  return createPortal(
    <div 
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 animate-in fade-in duration-300"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div 
        className="relative bg-fin-surface w-full max-w-md rounded-[40px] shadow-2xl border border-zinc-900/10 dark:border-white/5 overflow-hidden animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8 sm:p-10 text-center">
          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-900/10 dark:hover:bg-white/10 rounded-full transition-all"
          >
            <X size={20} />
          </button>

          <div className={cn(
            "w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 border-2 transition-transform hover:scale-110 duration-300",
            currentVariant.iconBg
          )}>
            {currentVariant.icon}
          </div>

          <h3 className="text-2xl font-black text-zinc-900 dark:text-white mb-3 tracking-tight">
            {title}
          </h3>
          
          <p className="text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed mb-10 px-4">
            {message}
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-4 rounded-[24px] font-black text-xs uppercase tracking-widest text-zinc-500 bg-zinc-900/5 dark:text-zinc-400 dark:bg-white/5 hover:bg-zinc-900/10 dark:hover:bg-white/10 transition-all"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              className={cn(
                "flex-1 px-6 py-4 rounded-[24px] font-black text-xs uppercase tracking-widest transition-all shadow-xl hover:-translate-y-0.5 active:translate-y-0",
                currentVariant.confirmBtn
              )}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}