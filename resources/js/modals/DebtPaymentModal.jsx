import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  DollarSign, 
  Calendar as CalendarIcon, 
  Wallet, 
  CreditCard, 
  Tag, 
  AlignLeft,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/classNames';
import CustomDatePicker from '../components/ui/CustomDatePicker';
import CustomSelect from '../components/ui/CustomSelect';
import MoneyInput from '../components/ui/MoneyInput';

export default function DebtPaymentModal({ debt, onClose, onSuccess, showToast, accounts, categories, cards }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: debt.amount || 0,
    date: new Date().toISOString().split('T')[0],
    account_id: accounts.find(a => a.is_main)?.id || '',
    category_id: categories.find(c => c.name.toLowerCase().includes('dívida') || c.name.toLowerCase().includes('financiamento'))?.id || '',
    card_id: '',
    notes: `Pagamento de dívida: ${debt.description}`
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.account_id) {
        showToast('Selecione uma conta para o pagamento', 'error');
        return;
    }
    if (!formData.category_id) {
        showToast('Selecione uma categoria', 'error');
        return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/debts/${debt.id}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        showToast('Pagamento registrado com sucesso!');
        onSuccess();
        onClose();
      } else {
        const data = await res.json();
        showToast(data.message || 'Erro ao registrar pagamento', 'error');
      }
    } catch (error) {
      showToast('Erro de conexão', 'error');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-md bg-fin-neutral dark:bg-zinc-900 rounded-[32px] shadow-2xl border border-zinc-900/10 dark:border-white/5"
      >
        <div className="p-6 border-b border-zinc-900/10 dark:border-white/5 flex items-center justify-between bg-zinc-50 dark:bg-black/20 rounded-t-[32px]">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-fin-mint/10 text-fin-mint flex items-center justify-center">
                <DollarSign size={20} />
             </div>
             <div>
                <h3 className="text-lg font-black text-zinc-900 dark:text-white uppercase italic tracking-tight">
                  Registrar Pagamento
                </h3>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest truncate max-w-[200px]">
                   {debt.description}
                </p>
             </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-zinc-200 dark:hover:bg-white/5 rounded-xl transition-colors text-zinc-500"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-4">
            {/* Valor */}
            <div className="group">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 mb-1.5 block group-focus-within:text-fin-mint transition-colors">
                Valor a Pagar
              </label>
              <MoneyInput
                required
                value={formData.amount}
                onChange={(val) => setFormData({ ...formData, amount: val })}
                className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-2xl py-3 px-4 text-lg font-black focus:ring-4 focus:ring-fin-mint/10 transition-all dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
               {/* Data */}
               <div className="group">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 mb-1.5 block group-focus-within:text-fin-mint transition-colors">
                    Data
                  </label>
                  <CustomDatePicker
                    value={formData.date}
                    onChange={(val) => setFormData({ ...formData, date: val })}
                    triggerClassName="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-2xl py-3 px-4 text-sm focus:ring-4 focus:ring-fin-mint/10 transition-all dark:text-white"
                  />
               </div>

               {/* Categoria */}
               <div className="group">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 mb-1.5 block group-focus-within:text-fin-mint transition-colors">
                    Categoria
                  </label>
                  <CustomSelect
                    value={formData.category_id}
                    onChange={(val) => setFormData({ ...formData, category_id: val })}
                    options={categories.filter(c => c.type === 'Expense').map(c => ({
                      value: c.id,
                      label: c.name
                    }))}
                  />
               </div>
            </div>

            {/* Conta */}
            <div className="group">
               <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 mb-1.5 block group-focus-within:text-fin-mint transition-colors">
                 Pagar com a Conta
               </label>
               <CustomSelect
                 value={formData.account_id}
                 onChange={(val) => setFormData({ ...formData, account_id: val })}
                 options={accounts.map(a => ({
                   value: a.id,
                   label: a.name
                 }))}
               />
            </div>

            {/* Cartão (Opcional) */}
            <div className="group">
               <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 mb-1.5 block group-focus-within:text-fin-mint transition-colors">
                 Via Cartão de Crédito (Opcional)
               </label>
               <CustomSelect
                 value={formData.card_id}
                 onChange={(val) => setFormData({ ...formData, card_id: val })}
                 options={[
                   { value: '', label: 'Nenhum (Débito Direto)' },
                   ...cards.map(c => ({
                     value: c.id,
                     label: c.name
                   }))
                 ]}
               />
            </div>

            {/* Observações */}
            <div className="group">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 mb-1.5 block group-focus-within:text-fin-mint transition-colors">
                Observações
              </label>
              <textarea
                placeholder="Detalhes do pagamento..."
                rows="2"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-2xl py-3 px-4 text-sm focus:ring-4 focus:ring-fin-mint/10 transition-all dark:text-white resize-none"
              />
            </div>
          </div>

          <div className="pt-2 flex gap-3">
             <button
               type="button"
               onClick={onClose}
               className="flex-1 py-3 px-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:brightness-95 transition-all"
             >
               Cancelar
             </button>
             <button
               type="submit"
               disabled={loading}
               className="flex-[2] py-3 px-4 bg-fin-mint text-fin-bg rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-fin-mint/20 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
             >
               {loading ? (
                 <div className="w-4 h-4 border-2 border-fin-bg/30 border-t-fin-bg rounded-full animate-spin" />
               ) : (
                 <>
                   <CheckCircle2 size={16} />
                   Confirmar Pagamento
                 </>
               )}
             </button>
          </div>
        </form>
      </motion.div>
    </div>,
    document.body
  );
}
