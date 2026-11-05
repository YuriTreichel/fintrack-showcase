import React from "react";
import { createPortal } from "react-dom";
import { Trash2, Edit2 } from "lucide-react";

export default function TransactionRecurrenceConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  type = "edit", // "edit" or "delete"
}) {
  if (!isOpen) return null;

  const isDelete = type === "delete";

  return createPortal(
    <div
      className="fixed inset-0 bg-zinc-200/50 dark:bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 transition-all duration-300"
      onClick={onClose}
    >
      <div
        className="bg-fin-surface w-full max-w-sm rounded-[32px] shadow-2xl border border-zinc-900/10 dark:border-white/5 overflow-hidden animate-in fade-in zoom-in-95 duration-300 ease-out"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8 text-center">
          <div
            className={`w-20 h-20 ${
              isDelete ? "bg-[#ff7b7b]/10 text-[#ff7b7b]" : "bg-fin-mint/10 text-fin-mint"
            } rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse`}
          >
            {isDelete ? <Trash2 size={36} /> : <Edit2 size={36} />}
          </div>
          <h3 className="text-2xl font-black text-zinc-900 dark:text-white mb-3">
            {isDelete ? "Excluir" : "Editar"} Transação
          </h3>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-10 leading-relaxed">
            Esta transação faz parte de uma recorrência. Como deseja aplicar esta ação?
          </p>
          <div className="space-y-4">
            <button
              onClick={() => onConfirm("only")}
              className="w-full px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-widest text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 transition-all border border-zinc-200 dark:border-white/10 active:scale-95"
            >
              Somente esta
            </button>
            <button
              onClick={() => onConfirm("all_pending")}
              className={`w-full px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-widest text-fin-bg ${
                isDelete ? "bg-[#ff7b7b] hover:bg-[#ff5252] shadow-[#ff7b7b]/20" : "bg-fin-mint hover:brightness-110 shadow-fin-mint/20"
              } shadow-xl transition-all active:scale-95`}
            >
              Esta e as pendentes
            </button>
            <button
              onClick={onClose}
              className="w-full px-6 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors mt-4"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
