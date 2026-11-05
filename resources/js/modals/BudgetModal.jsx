import React, { useState } from "react";
import { createPortal } from "react-dom";
import { Plus, X } from "lucide-react";
import { cn } from "../utils/classNames";
import CustomSelect from "../components/ui/CustomSelect";
import MoneyInput from "../components/ui/MoneyInput";

export default function BudgetModal({
  onClose,
  onSuccess,
  categories,
  initialData,
}) {
  const [form, setForm] = useState(
    initialData
      ? {
          ...initialData,
          amount: String(initialData.amount || ""),
        }
      : {
          name: "",
          amount: "",
          category_id: "",
          period: "monthly",
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
          is_fixed: false,
          type: "value",
          percentage_value: "",
        },
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isEditing = !!initialData?.id;
    const url = isEditing
      ? `/api/budgets/${initialData.id}`
      : "/api/budgets";

    const res = await fetch(url, {
      method: isEditing ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        ...form,
        amount: form.type === 'value' ? parseFloat(form.amount || 0) : 0,
        percentage_value: form.type === 'percentage' ? parseFloat(form.percentage_value || 0) : null,
      }),
    });

    if (res.ok) {
      onSuccess();
      onClose();
    }
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-[999] overflow-y-auto bg-zinc-200/50 dark:bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="flex min-h-full items-center justify-center p-4 animate-in fade-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-fin-surface w-full max-w-md rounded-[24px] shadow-2xl border border-zinc-900/10 dark:border-white/5 relative ripple-container">
          <div className="p-6 border-b border-zinc-900/10 dark:border-white/5 flex items-center justify-between">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
              {initialData ? "Editar Planejamento" : "Novo Planejamento"}
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
                Nome do Planejamento
              </label>
              <input
                required
                className="w-full bg-zinc-200/50 dark:bg-black/20 border border-zinc-900/10 dark:border-white/5 rounded-2xl px-4 py-3 focus:ring-1 focus:ring-white/10 outline-none text-zinc-900 dark:text-white transition-all"
                placeholder="Ex: Alimentação Mensal"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-zinc-900/5 dark:bg-black/20 rounded-2xl border border-zinc-900/10 dark:border-white/5">
              <div>
                <p className="text-sm font-bold text-zinc-900 dark:text-white">Planejamento Fixo</p>
                <p className="text-[10px] text-zinc-500 uppercase font-bold">Repetir para todos os meses</p>
              </div>
              <button
                type="button"
                onClick={() => setForm({ ...form, is_fixed: !form.is_fixed })}
                className={cn(
                  "w-12 h-6 rounded-full transition-all relative",
                  form.is_fixed ? "bg-fin-mint" : "bg-zinc-400 dark:bg-zinc-700"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                  form.is_fixed ? "left-7" : "left-1"
                )} />
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-zinc-600 dark:text-zinc-500 uppercase tracking-wider">
                Tipo de Limite
              </label>
              <div className="grid grid-cols-2 gap-2 bg-zinc-900/5 dark:bg-black/20 p-1 rounded-2xl border border-zinc-900/10 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, type: 'value' })}
                  className={cn(
                    "py-2 rounded-xl text-xs font-bold transition-all",
                    form.type === 'value' ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm" : "text-zinc-500"
                  )}
                >
                  Valor Fixo
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, type: 'percentage' })}
                  className={cn(
                    "py-2 rounded-xl text-xs font-bold transition-all",
                    form.type === 'percentage' ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm" : "text-zinc-500"
                  )}
                >
                  Porcentagem
                </button>
              </div>
            </div>

            {form.type === 'value' ? (
              <div className="space-y-1 animate-in slide-in-from-top-2 duration-300">
                <label className="text-xs font-bold text-zinc-600 dark:text-zinc-500 uppercase tracking-wider">
                  Valor Limite
                </label>
                <div className="relative">
                  <MoneyInput
                    required
                    className="font-bold"
                    value={form.amount}
                    onChange={(val) => setForm({ ...form, amount: val })}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-1 animate-in slide-in-from-top-2 duration-300">
                <label className="text-xs font-bold text-zinc-600 dark:text-zinc-500 uppercase tracking-wider">
                  Porcentagem das Receitas
                </label>
                <div className="relative">
                  <input
                    required
                    type="number"
                    step="0.1"
                    max="100"
                    min="0"
                    className="w-full bg-zinc-200/50 dark:bg-black/20 border border-zinc-900/10 dark:border-white/5 rounded-2xl px-4 py-3 focus:ring-1 focus:ring-white/10 outline-none font-bold text-zinc-900 dark:text-white transition-all"
                    placeholder="Ex: 50"
                    value={form.percentage_value}
                    onChange={(e) => setForm({ ...form, percentage_value: e.target.value })}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">
                    %
                  </span>
                </div>
                <p className="text-[10px] text-zinc-500 font-bold uppercase mt-1 px-1">O sistema calculará o valor baseado nas receitas do mês.</p>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-600 dark:text-zinc-500 uppercase tracking-wider">
                Categoria Relacionada (Opcional)
              </label>
              <CustomSelect
                value={form.category_id}
                onChange={(val) => setForm({ ...form, category_id: val })}
                options={[
                  { value: "", label: "Todas as Categorias" },
                  ...categories
                    .filter((c) => !c.parent_id && c.type === "Expense")
                    .map((c) => ({
                      value: c.id,
                      label: c.name,
                    })),
                ]}
              />
            </div>

            {!form.is_fixed && (
              <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-left-2 duration-300">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-600 dark:text-zinc-500 uppercase tracking-wider">
                    Mês
                  </label>
                  <CustomSelect
                    value={form.month}
                    onChange={(val) => setForm({ ...form, month: val })}
                    options={[
                      { value: 1, label: "Janeiro" },
                      { value: 12, label: "Dezembro" },
                      ...[2,3,4,5,6,7,8,9,10,11].map(m => ({
                        value: m,
                        label: [
                          "", "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
                          "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
                        ][m]
                      }))
                    ].sort((a,b) => a.value - b.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-600 dark:text-zinc-500 uppercase tracking-wider">
                    Ano
                  </label>
                  <input
                    type="number"
                    className="w-full bg-zinc-200/50 dark:bg-black/20 border border-zinc-900/10 dark:border-white/5 rounded-2xl px-4 py-3 focus:ring-1 focus:ring-white/10 outline-none text-zinc-900 dark:text-white transition-all"
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: e.target.value })}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-fin-mint text-fin-bg py-4 rounded-2xl font-bold hover:brightness-110 transition-all shadow-lg shadow-fin-mint/20 mt-4"
            >
              Salvar Planejamento
            </button>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}
