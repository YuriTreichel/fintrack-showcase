import React, { useState, useEffect } from 'react';
import { createPortal } from "react-dom";
import { CreditCard, X, Calendar, DollarSign, Tag } from 'lucide-react';
import CustomSelect from '../components/ui/CustomSelect';
import MoneyInput from '../components/ui/MoneyInput';

export default function CardModal({ onClose, onSuccess, initialData }) {
  const [form, setForm] = useState({
    name: '',
    limit: '',
    brand: 'Mastercard',
    closing_day: '',
    due_day: '',
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || '',
        limit: initialData.limit || '',
        brand: initialData.brand || 'Mastercard',
        closing_day: initialData.closing_day ? String(initialData.closing_day) : '',
        due_day: initialData.due_day ? String(initialData.due_day) : '',
      });
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isEditing = !!initialData?.id;
    const url = isEditing ? `/api/cards/${initialData.id}` : "/api/cards";
    const method = isEditing ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          ...form,
          limit: parseFloat(form.limit),
          closing_day: parseInt(form.closing_day),
          due_day: parseInt(form.due_day),
        }),
      });

      if (res.ok) {
        if (onSuccess) await onSuccess();
        onClose();
      } else {
        const data = await res.json();
        if (res.status === 403 && data.requires_upgrade) {
            window.dispatchEvent(new CustomEvent('requireUpgrade', { detail: data.message }));
            onClose();
        } else {
            alert(data.error || data.message || "Erro ao salvar cartão");
        }
      }
    } catch (e) {
      console.error(e);
      alert("Erro de conexão ao salvar o cartão.");
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
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-fin-mint/10 rounded-full flex items-center justify-center text-fin-mint">
                <CreditCard size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                  {initialData ? 'Editar Cartão' : 'Novo Cartão'}
                </h3>
                <p className="text-xs text-zinc-500">
                  Configure os detalhes e limites.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-600 dark:text-zinc-500 uppercase tracking-wider">
                Nome do Cartão
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500">
                  <CreditCard size={18} />
                </div>
                <input
                  type="text"
                  required
                  className="w-full bg-zinc-200/50 dark:bg-black/20 border border-zinc-900/10 dark:border-white/5 rounded-2xl pl-11 pr-4 py-3 outline-none text-zinc-900 dark:text-white transition-all focus:ring-1 focus:ring-white/10"
                  placeholder="Ex: Nubank, Itaú Black..."
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-600 dark:text-zinc-500 uppercase tracking-wider">
                  Limite Total (R$)
                </label>
                <div className="relative">
                  <MoneyInput
                    placeholder="0,00"
                    value={form.limit}
                    onChange={(val) => setForm({ ...form, limit: val })}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-600 dark:text-zinc-500 uppercase tracking-wider">
                  Bandeira
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500 z-10">
                    <Tag size={18} />
                  </div>
                  <CustomSelect
                    value={form.brand}
                    onChange={(val) => setForm({ ...form, brand: val })}
                    options={[
                      { value: 'Mastercard', label: 'Mastercard' },
                      { value: 'Visa', label: 'Visa' },
                      { value: 'American Express', label: 'American Express' },
                      { value: 'Elo', label: 'Elo' },
                      { value: 'Hipercard', label: 'Hipercard' },
                      { value: 'Outros', label: 'Outros' },
                    ]}
                    placeholder="Selecione..."
                    triggerClassName="w-full bg-zinc-200/50 dark:bg-black/20 border border-zinc-900/10 dark:border-white/5 rounded-2xl pl-11 pr-4 py-3 outline-none text-zinc-900 dark:text-white hover:bg-zinc-200/80 dark:hover:bg-white/5 transition-all focus:ring-1 focus:ring-white/10"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-600 dark:text-zinc-500 uppercase tracking-wider">
                  Fechamento
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500 z-10">
                    <Calendar size={18} />
                  </div>
                  <CustomSelect
                    value={form.closing_day}
                    onChange={(val) => setForm({ ...form, closing_day: val })}
                    options={Array.from({ length: 31 }, (_, i) => ({
                      value: String(i + 1),
                      label: `Dia ${i + 1}`
                    }))}
                    placeholder="Dia..."
                    triggerClassName="w-full bg-zinc-200/50 dark:bg-black/20 border border-zinc-900/10 dark:border-white/5 rounded-2xl pl-11 pr-4 py-3 outline-none text-zinc-900 dark:text-white hover:bg-zinc-200/80 dark:hover:bg-white/5 transition-all focus:ring-1 focus:ring-white/10"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-600 dark:text-zinc-500 uppercase tracking-wider">
                  Vencimento
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500 z-10">
                    <Calendar size={18} />
                  </div>
                  <CustomSelect
                    value={form.due_day}
                    onChange={(val) => setForm({ ...form, due_day: val })}
                    options={Array.from({ length: 31 }, (_, i) => ({
                      value: String(i + 1),
                      label: `Dia ${i + 1}`
                    }))}
                    placeholder="Dia..."
                    triggerClassName="w-full bg-zinc-200/50 dark:bg-black/20 border border-zinc-900/10 dark:border-white/5 rounded-2xl pl-11 pr-4 py-3 outline-none text-zinc-900 dark:text-white hover:bg-zinc-200/80 dark:hover:bg-white/5 transition-all focus:ring-1 focus:ring-white/10"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-xl font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-900/10 dark:hover:bg-white/5 transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 bg-fin-mint text-fin-bg py-3 rounded-xl font-bold hover:brightness-110 transition-all shadow-lg shadow-fin-mint/20"
              >
                Salvar Cartão
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}