import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Save, 
  Banknote, 
  User, 
  Calendar as CalendarIcon, 
  AlignLeft,
  Hash,
  CheckCircle2,
  Clock,
  Percent,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/classNames';
import CustomDatePicker from '../components/ui/CustomDatePicker';
import MoneyInput from '../components/ui/MoneyInput';

export default function DebtModal({ debt, onClose, onSuccess, showToast }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    creditor: '',
    amount: '',
    original_amount: '',
    is_negotiated: false,
    interest_rate: 0,
    date: new Date().toISOString().split('T')[0],
    status: 'Pending',
    observations: '',
    total_installments: 1
  });

  useEffect(() => {
    if (debt) {
      setFormData({
        description: debt.description || '',
        creditor: debt.creditor || '',
        amount: debt.amount || '',
        original_amount: debt.original_amount || debt.amount || '',
        is_negotiated: Boolean(debt.is_negotiated) || false,
        interest_rate: debt.interest_rate || 0,
        date: debt.date || new Date().toISOString().split('T')[0],
        status: debt.status || 'Pending',
        observations: debt.observations || '',
        total_installments: debt.total_installments || 1
      });
    }
  }, [debt]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const url = debt ? `/api/debts/${debt.id}` : '/api/debts';
    const method = debt ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        showToast(debt ? 'Dívida atualizada!' : 'Dívida cadastrada com sucesso!');
        onSuccess();
        onClose();
      } else {
        const data = await res.json();
        showToast(data.message || 'Erro ao salvar dívida', 'error');
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
        className="relative w-full max-w-lg bg-fin-neutral dark:bg-zinc-900 rounded-[32px] shadow-2xl border border-zinc-900/10 dark:border-white/5"
      >
        <div className="p-8 border-b border-zinc-900/10 dark:border-white/5 flex items-center justify-between bg-zinc-50 dark:bg-black/20 rounded-t-[32px]">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 rounded-2xl bg-fin-mint/10 text-fin-mint flex items-center justify-center">
                <Banknote size={24} />
             </div>
             <div>
                <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase italic tracking-tight">
                  {debt ? 'Editar Dívida' : 'Nova Dívida'}
                </h3>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                   Registro privado de débitos
                </p>
             </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-zinc-200 dark:hover:bg-white/5 rounded-xl transition-colors text-zinc-500"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            {/* Descrição */}
            <div className="group">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 mb-1.5 block group-focus-within:text-fin-mint transition-colors">
                Descrição
              </label>
              <div className="relative">
                <AlignLeft size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-fin-mint transition-colors" />
                <input
                  required
                  type="text"
                  placeholder="Ex: Empréstimo com o Banco"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-4 focus:ring-fin-mint/10 transition-all dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               {/* Credor */}
               <div className="group">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 mb-1.5 block group-focus-within:text-fin-mint transition-colors">
                    Credor
                  </label>
                  <div className="relative">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-fin-mint transition-colors" />
                    <input
                      type="text"
                      placeholder="Ex: Itaú, Nubank, João"
                      value={formData.creditor}
                      onChange={(e) => setFormData({ ...formData, creditor: e.target.value })}
                      className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-4 focus:ring-fin-mint/10 transition-all dark:text-white"
                    />
                  </div>
               </div>

               {/* Valor */}
               <div className="group">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 mb-1.5 block group-focus-within:text-fin-mint transition-colors">
                    Valor
                  </label>
                  <MoneyInput
                    required
                    value={formData.amount}
                    onChange={(val) => setFormData({ ...formData, amount: val })}
                    className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-2xl py-3 px-4 text-sm font-black focus:ring-4 focus:ring-fin-mint/10 transition-all dark:text-white"
                  />
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               {/* Data */}
               <div className="group">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 mb-1.5 block group-focus-within:text-fin-mint transition-colors">
                    Data de Registro
                  </label>
                  <CustomDatePicker
                    value={formData.date}
                    onChange={(val) => setFormData({ ...formData, date: val })}
                    triggerClassName="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-2xl py-3 px-4 text-sm focus:ring-4 focus:ring-fin-mint/10 transition-all dark:text-white"
                  />
               </div>

               {/* Parcelamento (Apenas na criação) */}
               {!debt && (
                 <div className="group">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 mb-1.5 block group-focus-within:text-fin-mint transition-colors">
                      Parcelas
                    </label>
                    <div className="relative">
                      <Hash size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-fin-mint transition-colors" />
                      <input
                        type="number"
                        min="1"
                        max="120"
                        value={formData.total_installments}
                        onChange={(e) => setFormData({ ...formData, total_installments: e.target.value })}
                        className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-4 focus:ring-fin-mint/10 transition-all dark:text-white"
                      />
                    </div>
                 </div>
               )}

               {/* Status (Na edição ou se simples) */}
               {(debt || formData.total_installments == 1) && (
                 <div className="group">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 mb-1.5 block group-focus-within:text-fin-mint transition-colors">
                      Status
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                       <button
                         type="button"
                         onClick={() => setFormData({ ...formData, status: 'Pending' })}
                         className={cn(
                            "py-3 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all flex items-center justify-center gap-2",
                            formData.status === 'Pending' 
                              ? "bg-amber-500 text-fin-bg border-amber-500" 
                              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border-transparent"
                         )}
                       >
                          <Clock size={14} /> Pendente
                       </button>
                       <button
                         type="button"
                         onClick={() => setFormData({ ...formData, status: 'Paid' })}
                         className={cn(
                            "py-3 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all flex items-center justify-center gap-2",
                            formData.status === 'Paid' 
                              ? "bg-fin-mint text-fin-bg border-fin-mint" 
                              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border-transparent"
                         )}
                       >
                          <CheckCircle2 size={14} /> Paga
                       </button>
                    </div>
                 </div>
               )}
            </div>

            <div className="grid grid-cols-2 gap-4">
               {/* Taxa de Juros */}
               <div className="group">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 mb-1.5 block group-focus-within:text-fin-mint transition-colors">
                    Taxa de Juros (% a.m.)
                  </label>
                  <div className="relative">
                    <Percent size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-fin-mint transition-colors" />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Ex: 2.5"
                      value={formData.interest_rate}
                      onChange={(e) => setFormData({ ...formData, interest_rate: e.target.value })}
                      className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-4 focus:ring-fin-mint/10 transition-all dark:text-white"
                    />
                  </div>
               </div>

               {/* Negociada */}
               <div className="group">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 mb-1.5 block group-focus-within:text-fin-mint transition-colors">
                    Dívida Negociada?
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, is_negotiated: !formData.is_negotiated })}
                    className={cn(
                      "w-full h-[46px] rounded-2xl flex items-center justify-between px-4 transition-all border",
                      formData.is_negotiated 
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500" 
                        : "bg-zinc-100 dark:bg-zinc-800 border-transparent text-zinc-500"
                    )}
                  >
                    <div className="flex items-center gap-2">
                       <ShieldCheck size={18} />
                       <span className="text-[10px] font-bold uppercase tracking-tight">Acordo</span>
                    </div>
                    <div className={cn(
                      "w-4 h-4 rounded-full border-2 transition-all",
                      formData.is_negotiated ? "bg-emerald-500 border-emerald-500" : "border-zinc-400"
                    )} />
                  </button>
               </div>
            </div>

            {/* Valor Original (Condicional) */}
            <AnimatePresence>
              {formData.is_negotiated && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="group overflow-hidden"
                >
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 mb-1.5 block group-focus-within:text-fin-mint transition-colors">
                    Valor Original (Antes do Acordo)
                  </label>
                  <MoneyInput
                    value={formData.original_amount}
                    onChange={(val) => setFormData({ ...formData, original_amount: val })}
                    className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-2xl py-3 px-4 text-sm font-black focus:ring-4 focus:ring-fin-mint/10 transition-all dark:text-white"
                  />
                  <p className="text-[9px] font-bold text-emerald-500/60 uppercase tracking-tighter mt-1.5 ml-1">
                     * Isso ajudará a calcular sua economia total
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Observações */}
            <div className="group">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 mb-1.5 block group-focus-within:text-fin-mint transition-colors">
                Observações
              </label>
              <textarea
                placeholder="Detalhes adicionais..."
                rows="3"
                value={formData.observations}
                onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-2xl py-3 px-4 text-sm focus:ring-4 focus:ring-fin-mint/10 transition-all dark:text-white resize-none"
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3 mt-4">
             <button
               type="button"
               onClick={onClose}
               className="flex-1 py-4 px-6 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:brightness-95 transition-all"
             >
               Cancelar
             </button>
             <button
               type="submit"
               disabled={loading}
               className="flex-[2] py-4 px-6 bg-fin-mint text-fin-bg rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-fin-mint/20 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
             >
               {loading ? (
                 <div className="w-5 h-5 border-2 border-fin-bg/30 border-t-fin-bg rounded-full animate-spin" />
               ) : (
                 <>
                   <Save size={18} />
                   {debt ? 'Atualizar Dívida' : 'Salvar Dívida'}
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
