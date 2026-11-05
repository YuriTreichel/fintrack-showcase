import React, { useState } from "react";
import { createPortal } from "react-dom";
import { X, RefreshCw } from "lucide-react";
import MoneyInput from "../components/ui/MoneyInput";

export default function UpdateBalanceModal({
  onClose,
  onSuccess,
  account
}) {
  // Inicializamos o novo saldo com o saldo atual
  const [newBalance, setNewBalance] = useState(
    account?.current_balance !== undefined ? String(account.current_balance) : String(account?.initial_balance || "0")
  );
  
  // Opções: 'transaction' ou 'adjustment'
  const [updateMethod, setUpdateMethod] = useState('transaction');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/accounts/${account.id}/balance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          new_balance: parseFloat(newBalance),
          create_transaction: updateMethod === 'transaction'
        }),
      });

      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        const data = await res.json();
        alert(data.error || data.message || "Erro ao atualizar saldo");
      }
    } catch (e) {
      console.error(e);
      alert("Erro de conexão ao atualizar o saldo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!account) return null;

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
              <div className="w-10 h-10 bg-fin-mint/10 text-fin-mint rounded-[12px] flex items-center justify-center">
                <RefreshCw size={20} />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                Atualizar Saldo
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-zinc-600 dark:text-zinc-500 hover:text-zinc-900 dark:text-white hover:bg-zinc-900/10 dark:hover:bg-white/5 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="bg-zinc-900/5 dark:bg-black/20 rounded-2xl p-4 border border-zinc-900/10 dark:border-white/5">
               <p className="text-xs text-zinc-600 dark:text-zinc-500 font-bold uppercase mb-1">Conta Selecionada</p>
               <p className="font-bold text-zinc-900 dark:text-white text-lg">{account.name}</p>
               <p className="text-sm text-zinc-500">
                 Saldo Atual: R$ {(account.current_balance !== undefined ? account.current_balance : account.initial_balance).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
               </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-600 dark:text-zinc-500 uppercase tracking-wider">
                Novo Saldo
              </label>
              <MoneyInput
                value={newBalance}
                onChange={(val) => setNewBalance(val)}
              />
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-zinc-600 dark:text-zinc-500 uppercase tracking-wider">
                Como deseja registrar a diferença?
              </label>
              
              <div className="space-y-2">
                <label 
                  className={`flex items-start p-4 rounded-xl border cursor-pointer transition-all ${
                    updateMethod === 'transaction' 
                      ? 'border-fin-mint bg-fin-mint/5' 
                      : 'border-zinc-900/10 dark:border-white/5 bg-zinc-900/5 dark:bg-black/20 hover:bg-zinc-900/10 dark:hover:bg-white/5'
                  }`}
                >
                  <input
                    type="radio"
                    name="updateMethod"
                    value="transaction"
                    checked={updateMethod === 'transaction'}
                    onChange={() => setUpdateMethod('transaction')}
                    className="mt-1 sr-only"
                  />
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 mt-0.5 ${
                    updateMethod === 'transaction' ? 'border-fin-mint' : 'border-zinc-400 dark:border-zinc-600'
                  }`}>
                    {updateMethod === 'transaction' && <div className="w-2.5 h-2.5 rounded-full bg-fin-mint" />}
                  </div>
                  <div>
                    <span className="block font-bold text-zinc-900 dark:text-white text-sm">Criar Transação de Reajuste</span>
                    <span className="block text-xs text-zinc-500 mt-1">
                      Será criada uma transação de receita ou despesa com o valor da diferença.
                    </span>
                  </div>
                </label>

                <label 
                  className={`flex items-start p-4 rounded-xl border cursor-pointer transition-all ${
                    updateMethod === 'adjustment' 
                      ? 'border-fin-mint bg-fin-mint/5' 
                      : 'border-zinc-900/10 dark:border-white/5 bg-zinc-900/5 dark:bg-black/20 hover:bg-zinc-900/10 dark:hover:bg-white/5'
                  }`}
                >
                  <input
                    type="radio"
                    name="updateMethod"
                    value="adjustment"
                    checked={updateMethod === 'adjustment'}
                    onChange={() => setUpdateMethod('adjustment')}
                    className="mt-1 sr-only"
                  />
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 mt-0.5 ${
                    updateMethod === 'adjustment' ? 'border-fin-mint' : 'border-zinc-400 dark:border-zinc-600'
                  }`}>
                    {updateMethod === 'adjustment' && <div className="w-2.5 h-2.5 rounded-full bg-fin-mint" />}
                  </div>
                  <div>
                    <span className="block font-bold text-zinc-900 dark:text-white text-sm">Apenas Reajustar</span>
                    <span className="block text-xs text-zinc-500 mt-1">
                      O saldo inicial da conta será alterado. Nenhuma transação será criada no seu histórico.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-fin-mint text-fin-bg py-4 rounded-2xl font-bold hover:brightness-110 transition-all mt-2 disabled:opacity-50"
            >
              {isSubmitting ? 'Atualizando...' : 'Atualizar Saldo'}
            </button>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}
