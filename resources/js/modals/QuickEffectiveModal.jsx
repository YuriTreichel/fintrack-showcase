import React, { useState } from "react";
import { createPortal } from "react-dom";
import { Plus } from "lucide-react";
import { format } from "date-fns";
import CustomDatePicker from "../components/ui/CustomDatePicker";
import CustomSelect from "../components/ui/CustomSelect";

export default function QuickEffectiveModal({
  transaction,
  onClose,
  onSuccess,
  accounts,
  showToast,
}) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    date: format(new Date(), "yyyy-MM-dd"),
    account_id:
      transaction.account_id || (accounts.length > 0 ? accounts[0].id : ""),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/transactions/${transaction.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          ...transaction,
          date: form.date,
          account_id: form.account_id,
          status: "Paid",
        }),
      });

      if (res.ok) {
        showToast(
          transaction.type === "Income"
            ? "Recebido com sucesso!"
            : "Pago com sucesso!",
          "success",
        );
        onSuccess();
        onClose();
      } else {
        const err = await res.json();
        showToast(err.message || "Erro ao efetivar transação.", "error");
      }
    } catch (error) {
      showToast("Erro de conexão.", "error");
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm overflow-y-auto flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-fin-bg border border-zinc-900/10 dark:border-white/5 w-full max-w-md rounded-[32px] shadow-2xl relative z-10 animate-in zoom-in-95 fade-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-zinc-900/10 dark:border-white/5 flex items-center justify-between bg-zinc-200/50 dark:bg-black/20 rounded-t-[32px]">
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
            Efetivar{" "}
            {transaction.type === "Income" ? "Recebimento" : "Pagamento"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-900/10 dark:hover:bg-white/5 rounded-full transition-colors text-zinc-500"
          >
            <Plus size={20} className="rotate-45" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-zinc-900/5 dark:bg-white/5 p-4 rounded-2xl border border-zinc-900/10 dark:border-white/5">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">
              Transação
            </p>
            <p className="text-lg font-bold text-zinc-900 dark:text-white leading-tight">
              {transaction.description}
            </p>
            <p className="text-xl font-bold text-fin-peach mt-1">
              R${" "}
              {Number(transaction.amount).toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-600 dark:text-zinc-500 uppercase tracking-wider">
                Data do{" "}
                {transaction.type === "Income" ? "Recebimento" : "Pagamento"}
              </label>
              <CustomDatePicker
                value={form.date}
                onChange={(val) => setForm({ ...form, date: val })}
                triggerClassName="w-full bg-zinc-200/50 dark:bg-black/20 border border-zinc-900/10 dark:border-white/5 rounded-2xl px-4 py-3 focus:ring-1 focus:ring-white/10"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-600 dark:text-zinc-500 uppercase tracking-wider">
                Conta
              </label>
              <CustomSelect
                value={form.account_id}
                onChange={(val) => setForm({ ...form, account_id: val })}
                options={accounts.map((a) => ({
                  value: a.id,
                  label: a.name,
                }))}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 rounded-2xl font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-900/10 dark:hover:bg-white/5 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] bg-fin-mint text-fin-bg px-6 py-4 rounded-2xl font-bold hover:brightness-110 transition-all shadow-lg shadow-fin-mint/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-fin-bg/30 border-t-fin-bg rounded-full animate-spin"></div>
              ) : (
                <>
                  Confirmar{" "}
                  {transaction.type === "Income"
                    ? "Recebimento"
                    : "Pagamento"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
