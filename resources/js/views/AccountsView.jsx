import React, { useState, useMemo } from "react";
import {
  Plus,
  Wallet,
  Trash2,
  Settings,
  Landmark,
  PiggyBank,
  RefreshCw,
} from "lucide-react";
import AccountModal from "../modals/AccountModal";
import UpdateBalanceModal from "../modals/UpdateBalanceModal";
import { useFinStore } from '../store/useFinStore';
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";

export default function AccountsView({ fetchData, showToast, showConfirm, isReadOnly, searchTerm }) {
  const { accounts, setAccounts, selectedProfile } = useFinStore();
  
  const profileAccounts = useMemo(
    () => accounts.filter((a) => a.user_id === selectedProfile?.id),
    [accounts, selectedProfile],
  );

  const [isAccModalOpen, setIsAccModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [isUpdateBalanceModalOpen, setIsUpdateBalanceModalOpen] = useState(false);
  const [accountToUpdateBalance, setAccountToUpdateBalance] = useState(null);

  const handleEdit = (acc) => {
    setEditingAccount(acc);
    setIsAccModalOpen(true);
  };

  const handleUpdateBalance = (acc) => {
    setAccountToUpdateBalance(acc);
    setIsUpdateBalanceModalOpen(true);
  };

  const handleCloseUpdateBalance = () => {
    setAccountToUpdateBalance(null);
    setIsUpdateBalanceModalOpen(false);
  };

  const handleClose = () => {
    setEditingAccount(null);
    setIsAccModalOpen(false);
  };

  const handleDelete = (id) => {
    showConfirm(
      "Excluir Conta",
      "Tem certeza que deseja excluir esta conta? Isso não poderá ser desfeito.",
      async () => {
        const previousState = [...accounts];
        setAccounts((prev) => prev.filter((a) => a.id !== id));

        try {
          const res = await fetch(`/api/accounts/${id}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          if (res.ok) {
            showToast("Conta excluída com sucesso!", "success");
            fetchData();
          } else {
            setAccounts(previousState);
            showToast("Erro ao excluir conta.", "error");
          }
        } catch (e) {
          setAccounts(previousState);
          showToast("Erro de conexão.", "error");
        }
      },
    );
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <PageHeader
        icon={Wallet}
        title="Contas"
        subtitle="Gerencie suas fontes de recursos, bancos e carteiras."
        label="Patrimônio"
        actions={
          !isReadOnly && (
            <Button 
              onClick={() => setIsAccModalOpen(true)}
              icon={Plus}
            >
              Nova Conta
            </Button>
          )
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {profileAccounts.map((acc) => (
          <div
            key={acc.id}
            className="bg-white/70 dark:bg-zinc-900/40 backdrop-blur-md p-5 md:p-6 rounded-[24px] border border-zinc-200 dark:border-white/5 shadow-lg relative overflow-hidden group hover:border-fin-mint/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            <div className="absolute -top-6 -right-6 text-zinc-300/10 dark:text-white/[0.02] group-hover:scale-110 transition-transform duration-300 pointer-events-none">
              <Wallet size={120} />
            </div>
            
            <div className="flex items-center gap-4 mb-6 relative z-10 w-full">
              <div className="w-12 h-12 bg-fin-mint/10 text-fin-mint rounded-2xl flex items-center justify-center border border-fin-mint/20 group-hover:bg-fin-mint group-hover:text-fin-bg transition-colors duration-300">
                <Wallet size={20} />
              </div>
              <div>
                <h4 className="font-bold text-zinc-900 dark:text-white text-base leading-snug">
                  {acc.name}
                </h4>
                <p className="text-[9px] text-zinc-500 dark:text-zinc-400 font-black uppercase tracking-widest mt-0.5">
                  {acc.type === "Bank"
                    ? "Banco"
                    : acc.type === "Cash"
                      ? "Dinheiro"
                      : "Poupança"}
                </p>
              </div>
            </div>

            <div className="flex items-end justify-between mt-8 relative z-10">
              <div>
                <p className="text-zinc-400 dark:text-zinc-500 text-[9px] font-black uppercase tracking-widest mb-1.5">
                  Saldo Atual
                </p>
                <p className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white tabular-nums">
                  <span className="text-sm font-bold text-zinc-500 dark:text-zinc-400 mr-1.5 opacity-80">
                    R$
                  </span>
                  {(Math.abs(acc.current_balance !== undefined ? acc.current_balance : acc.initial_balance) < 0.005 
                    ? 0 
                    : Number(acc.current_balance !== undefined ? acc.current_balance : acc.initial_balance)
                  ).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="hidden md:flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {!isReadOnly && (
                  <>
                    <button
                      onClick={() => handleUpdateBalance(acc)}
                      title="Atualizar Saldo"
                      className="p-2 border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-800 rounded-xl text-zinc-500 hover:text-fin-mint hover:bg-fin-mint/10 transition-all cursor-pointer shadow-sm"
                    >
                      <RefreshCw size={14} />
                    </button>
                    <button
                      onClick={() => handleEdit(acc)}
                      title="Configurar"
                      className="p-2 border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-800 rounded-xl text-zinc-500 hover:text-fin-mint hover:bg-fin-mint/10 transition-all cursor-pointer shadow-sm"
                    >
                      <Settings size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(acc.id)}
                      className="p-2 border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-800 rounded-xl text-zinc-500 hover:text-red-500 hover:bg-red-500/10 transition-all cursor-pointer shadow-sm"
                      title="Excluir"
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Ações Mobile */}
            {!isReadOnly && (
              <div className="mt-5 pt-4 border-t border-zinc-200 dark:border-white/5 flex gap-2 md:hidden relative z-20 overflow-x-auto pb-1">
                <button
                  onClick={() => handleUpdateBalance(acc)}
                  className="flex-1 min-w-[80px] flex items-center justify-center gap-1.5 py-2 bg-fin-mint/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-fin-mint active:bg-fin-mint/20 transition-colors cursor-pointer"
                >
                  <RefreshCw size={12} /> Saldo
                </button>
                <button
                  onClick={() => handleEdit(acc)}
                  className="flex-1 min-w-[100px] flex items-center justify-center gap-1.5 py-2 bg-zinc-100 dark:bg-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400 active:bg-zinc-200 transition-colors cursor-pointer"
                >
                  <Settings size={12} /> Configurar
                </button>
                <button
                  onClick={() => handleDelete(acc.id)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-500/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-red-500 active:bg-red-500/20 transition-colors cursor-pointer"
                >
                  <Trash2 size={12} /> Excluir
                </button>
              </div>
            )}
          </div>
        ))}

        {profileAccounts.length === 0 && (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-zinc-900/10 dark:border-white/10 rounded-[24px]">
            <Wallet className="mx-auto text-zinc-600 mb-4" size={48} />
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">
              Nenhuma conta encontrada
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
              Comece adicionando sua conta principal bancária ou carteira.
            </p>
            <button
              onClick={() => setIsAccModalOpen(true)}
              className="bg-fin-surface border border-zinc-900/10 dark:border-white/10 hover:bg-zinc-900/10 dark:hover:bg-white/10 dark:bg-white/5 transition-colors px-6 py-3 rounded-xl font-bold text-zinc-900 dark:text-white text-sm"
            >
              + Criar Conta Inicial
            </button>
          </div>
        )}
      </div>

      {isAccModalOpen && (
        <AccountModal
          onClose={handleClose}
          onSuccess={() => fetchData()}
          initialData={editingAccount}
          onOptimisticUpdate={(data, isEditing) => {
            if (isEditing) {
              setAccounts((prev) =>
                prev.map((a) => (a.id === data.id ? { ...a, ...data } : a)),
              );
            } else {
              setAccounts((prev) => [
                ...prev,
                {
                  ...data,
                  id: Date.now(),
                  current_balance: parseFloat(data.initial_balance),
                },
              ]);
            }
          }}
        />
      )}

      {isUpdateBalanceModalOpen && (
        <UpdateBalanceModal
          account={accountToUpdateBalance}
          onClose={handleCloseUpdateBalance}
          onSuccess={() => {
            showToast("Saldo atualizado com sucesso!", "success");
            fetchData();
          }}
        />
      )}
    </div>
  );
}
