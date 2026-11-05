import React, { useState } from "react";
import { createPortal } from "react-dom";
import { Plus } from "lucide-react";
import { cn } from "../utils/classNames";
import CustomSelect from "../components/ui/CustomSelect";
import MoneyInput from "../components/ui/MoneyInput";

export default function AccountsModal({
  onClose,
  onSuccess,
  initialData,
  onOptimisticUpdate,
}) {
  const [form, setForm] = useState(
    initialData 
      ? { ...initialData, initial_balance: String(initialData.initial_balance || "0") }
      : { name: "", type: "Bank", currency: "BRL", initial_balance: "0" },
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isEditing = !!initialData?.id;
    const url = isEditing ? `/api/accounts/${initialData.id}` : "/api/accounts";
    const method = isEditing ? "PUT" : "POST";

    const payload = {
      ...form,
      initial_balance: parseFloat(form.initial_balance),
    };
    if (onOptimisticUpdate)
      onOptimisticUpdate({ ...payload, id: initialData?.id }, isEditing);

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        const data = await res.json();
        if (res.status === 403 && data.requires_upgrade) {
          window.dispatchEvent(new CustomEvent('requireUpgrade', { detail: data.message }));
          onClose(); // Optional: close the modal so they see the upgrade modal clearly
        } else {
          alert(data.error || data.message || "Erro ao salvar conta");
        }
      }
    } catch (e) {
      console.error(e);
      alert("Erro de conexão ao salvar a conta.");
    }
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-[999] overflow-y-auto bg-zinc-200/50 dark:bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="flex min-h-full items-center justify-center p-4 animate-in fade-in duration-300 ease-out"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-fin-surface w-full max-w-md rounded-[24px] shadow-2xl border border-zinc-900/10 dark:border-white/5 relative">
          <div className="p-6 border-b border-zinc-900/10 dark:border-white/5 flex items-center justify-between bg-zinc-200/50 dark:bg-black/20 rounded-t-[24px]">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
              {initialData ? "Editar Conta" : "Nova Conta"}
            </h3>
            <button
              onClick={onClose}
              className="p-2 text-zinc-600 dark:text-zinc-500 hover:text-zinc-900 dark:text-white hover:bg-zinc-900/10 dark:hover:bg-white/5 rounded-full transition-colors"
            >
              <Plus size={20} className="rotate-45" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-600 dark:text-zinc-500 uppercase tracking-wider">
                Nome da Conta
              </label>
              <input
                required
                className="w-full bg-zinc-200/50 dark:bg-black/20 border border-zinc-900/10 dark:border-white/5 rounded-2xl px-4 py-3 outline-none text-zinc-900 dark:text-white transition-all focus:ring-1 focus:ring-white/10"
                placeholder="Ex: Nubank"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-600 dark:text-zinc-500 uppercase tracking-wider">
                Tipo
              </label>
              <CustomSelect
                value={form.type}
                onChange={(val) => setForm({ ...form, type: val })}
                options={[
                  { value: "Bank", label: "Banco" },
                  { value: "Cash", label: "Dinheiro" },
                  { value: "Savings", label: "Poupança" },
                ]}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-600 dark:text-zinc-500 uppercase tracking-wider">
                Saldo Inicial
              </label>
              <MoneyInput
                value={form.initial_balance}
                onChange={(val) =>
                  setForm({ ...form, initial_balance: val })
                }
              />
            </div>

            <label className="flex items-center justify-between p-4 bg-zinc-900/5 dark:bg-black/20 rounded-2xl border border-zinc-900/10 dark:border-white/5 cursor-pointer group transition-all hover:bg-zinc-900/10 dark:hover:bg-black/30">
              <div>
                <p className="text-sm font-bold text-zinc-900 dark:text-white">Conta Principal</p>
                <p className="text-[10px] text-zinc-500 uppercase font-bold">Esta conta será selecionada por padrão</p>
              </div>
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={!!form.is_main}
                  onChange={(e) => setForm({ ...form, is_main: e.target.checked })}
                />
                <div className={cn(
                  "w-10 h-6 bg-zinc-300 dark:bg-zinc-700 rounded-full transition-all duration-300",
                  form.is_main && "bg-fin-mint"
                )}></div>
                <div className={cn(
                  "absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-all duration-300 shadow-sm",
                  form.is_main && "translate-x-4"
                )}></div>
              </div>
            </label>
            <button className="w-full bg-fin-mint text-fin-bg py-4 rounded-2xl font-bold hover:brightness-110 transition-all mt-2">
              Salvar Conta
            </button>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}
