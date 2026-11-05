import React, { useState } from "react";
import { createPortal } from "react-dom";
import { X, Target } from "lucide-react";
import { cn } from "../utils/classNames";
import CustomDatePicker from "../components/ui/CustomDatePicker";
import MoneyInput from "../components/ui/MoneyInput";

export default function GoalModal({
  onClose,
  onSuccess,
  initialData,
}) {
  const [form, setForm] = useState(
    initialData
      ? {
          ...initialData,
          target_amount: String(initialData.target_amount || ""),
          current_amount: String(initialData.current_amount || "0"),
          deadline: initialData.deadline ? initialData.deadline.split('T')[0] : "",
        }
      : {
          name: "",
          target_amount: "",
          current_amount: 0,
          deadline: "",
          color: "#3b82f6",
          icon: "Target",
        },
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isEditing = !!initialData?.id;
    const url = isEditing
      ? `/api/goals/${initialData.id}`
      : "/api/goals";

    const res = await fetch(url, {
      method: isEditing ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        ...form,
        target_amount: parseFloat(form.target_amount),
        current_amount: parseFloat(form.current_amount || 0),
      }),
    });

    if (res.ok) {
      onSuccess();
      onClose();
    }
  };

  const colors = [
    "#3b82f6", // Blue
    "#98e5dd", // Mint
    "#f59e0b", // Amber
    "#ef4444", // Red
    "#8b5cf6", // Violet
    "#ec4899", // Pink
    "#10b981", // Emerald
    "#6366f1", // Indigo
  ];

  return createPortal(
    <div 
      className="fixed inset-0 z-[999] overflow-y-auto bg-zinc-200/50 dark:bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="flex min-h-full items-center justify-center p-4 animate-in fade-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-fin-surface w-full max-w-md rounded-[24px] shadow-2xl border border-zinc-900/10 dark:border-white/5 relative">
          <div className="p-6 border-b border-zinc-900/10 dark:border-white/5 flex items-center justify-between">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
              {initialData ? "Editar Meta" : "Nova Meta Financeira"}
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-zinc-900/10 dark:hover:bg-white/5 rounded-full transition-colors text-zinc-500"
            >
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-600 dark:text-zinc-500 uppercase tracking-wider">
                Nome da Meta
              </label>
              <div className="relative">
                <Target size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  required
                  className="w-full bg-zinc-200/50 dark:bg-black/20 border border-zinc-900/10 dark:border-white/5 rounded-2xl pl-12 pr-4 py-3 focus:ring-1 focus:ring-white/10 outline-none text-zinc-900 dark:text-white transition-all"
                  placeholder="Ex: Viagem Europa ou Carro Novo"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-600 dark:text-zinc-500 uppercase tracking-wider">
                  Objetivo Final
                </label>
                <div className="relative">
                  <MoneyInput
                    required
                    className="font-bold"
                    value={form.target_amount}
                    onChange={(val) => setForm({ ...form, target_amount: val })}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-600 dark:text-zinc-500 uppercase tracking-wider block">
                  Já tenho poupado
                </label>
                <div className="relative">
                  <MoneyInput
                    className="font-bold"
                    value={form.current_amount}
                    onChange={(val) => setForm({ ...form, current_amount: val })}
                  />
                </div>
                <p className="text-[10px] text-zinc-500 mt-1 leading-tight">
                  Este valor é atualizado automaticamente ao registrar lançamentos vinculados a esta meta.
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-600 dark:text-zinc-500 uppercase tracking-wider">
                Prazo Estimado (Opcional)
              </label>
              <div className="relative">
                <CustomDatePicker
                  value={form.deadline}
                  onChange={(val) => setForm({ ...form, deadline: val })}
                  triggerClassName="w-full bg-zinc-200/50 dark:bg-black/20 border border-zinc-900/10 dark:border-white/5 rounded-2xl px-4 py-3 focus:ring-1 focus:ring-white/10"
                />
              </div>
            </div>

            <div className="space-y-2">
               <label className="text-xs font-bold text-zinc-600 dark:text-zinc-500 uppercase tracking-wider">
                Cor da Meta
              </label>
               <div className="flex flex-wrap gap-3">
                 {colors.map(c => (
                   <button
                     key={c}
                     type="button"
                     onClick={() => setForm({ ...form, color: c })}
                     className={cn(
                       "w-8 h-8 rounded-full border-2 transition-all",
                       form.color === c ? "border-white scale-110 shadow-lg" : "border-transparent"
                     )}
                     style={{ backgroundColor: c }}
                   />
                 ))}
               </div>
            </div>

            <button
              type="submit"
              className="w-full bg-fin-mint text-fin-bg py-4 rounded-2xl font-bold hover:brightness-110 transition-all shadow-lg shadow-fin-mint/20 mt-4"
            >
              Salvar Meta
            </button>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}
