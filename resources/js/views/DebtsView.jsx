import React, { useState, useMemo, useEffect } from 'react';
import { 
  Banknote, 
  Search, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  User, 
  MoreVertical,
  Filter,
  RefreshCcw,
  AlertCircle
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import { cn } from '../utils/classNames';
import DebtModal from '../modals/DebtModal';
import DebtPaymentModal from '../modals/DebtPaymentModal';
import DebtList from '../components/DebtList';
import DebtSimulator from '../components/DebtSimulator';
import DebtConsolidationTool from '../components/DebtConsolidationTool';
import DebtHealthScore from '../components/DebtHealthScore';
import DebtPayoffComparison from '../components/DebtPayoffComparison';
import useDebts from '../hooks/useDebts';
import { useFinStore } from '../store/useFinStore';

export default function DebtsView({ showConfirm, showToast }) {
  const userPlan = useFinStore(state => state.userPlan);
  const accounts = useFinStore(state => state.accounts);
  const categories = useFinStore(state => state.categories);
  const cards = useFinStore(state => state.cards);
  const transactions = useFinStore(state => state.transactions);
  
  const {
    debts,
    loading,
    strategy,
    setStrategy,
    fetchDebts,
    metrics,
    totalSavings,
    handleToggleStatus,
    deleteDebt
  } = useDebts({ showToast });

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('list'); // 'list' or 'analysis'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all'); // all, Pending, Paid
  const [extraAmount, setExtraAmount] = useState(0);

  const filteredDebts = useMemo(() => {
    return debts.filter(d => {
      const matchesSearch = d.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (d.creditor && d.creditor.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesSearch;
    });
  }, [debts, searchTerm]);

  const handleDelete = (debt) => {
    showConfirm(
      'Excluir Dívida',
      `Tem certeza que deseja excluir "${debt.description}"?`,
      () => deleteDebt(debt.id)
    );
  };

  const handleEdit = (debt) => {
    setSelectedDebt(debt);
    setIsModalOpen(true);
  };

  const handlePay = (debt) => {
    setSelectedDebt(debt);
    setIsPaymentModalOpen(true);
  };

  const openAddModal = () => {
    setSelectedDebt(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <PageHeader
        icon={Banknote}
        title="Minhas Dívidas"
        subtitle="Controle pessoal de débitos e negociações com inteligência financeira."
        label="Dívida Inteligente"
        actions={
          <div className="flex items-center gap-3">
              <Button
                variant="primary"
                onClick={openAddModal}
                icon={Plus}
              >
                Nova Dívida
              </Button>
          </div>
        }
      />

      {/* Seletor de Abas */}
      <div className="flex items-center gap-8 border-b border-zinc-900/10 dark:border-white/5 mb-8 overflow-x-auto no-scrollbar">
        <button 
          onClick={() => setActiveTab('list')}
          className={cn(
            "pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative whitespace-nowrap",
            activeTab === 'list' ? "text-fin-mint" : "text-zinc-500 hover:text-zinc-400"
          )}
        >
          Minhas Dívidas
          {activeTab === 'list' && (
            <motion.div layoutId="debtActiveTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-fin-mint" />
          )}
        </button>
        <button 
          onClick={() => setActiveTab('analysis')}
          className={cn(
            "pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative flex items-center gap-2 whitespace-nowrap",
            activeTab === 'analysis' ? "text-fin-mint" : "text-zinc-500 hover:text-zinc-400"
          )}
        >
          Consultoria & IA
          <div className="px-1.5 py-0.5 rounded bg-fin-mint/10 text-[8px] border border-fin-mint/20">PRO</div>
          {activeTab === 'analysis' && (
            <motion.div layoutId="debtActiveTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-fin-mint" />
          )}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'list' ? (
          <motion.div
            key="list-tab"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-8"
          >
            {/* Métricas Principais */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
              <MetricCard 
                icon={<Clock size={20} />} 
                label="Total Pendente" 
                value={`R$ ${metrics.totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
                subValue={`${metrics.countPending} registros ativos`}
                color="amber" 
              />
              <MetricCard 
                icon={<CheckCircle2 size={20} />} 
                label="Total Pago" 
                value={`R$ ${metrics.totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
                subValue={`${metrics.countPaid} registros concluídos`}
                color="mint" 
              />
            </div>

            {/* Filtro de Busca */}
            <div className="relative group/search max-w-md">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within/search:text-fin-mint transition-colors"
              />
              <input 
                type="text"
                placeholder="Pesquisar por descrição ou credor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-12 bg-fin-surface border border-zinc-900/10 dark:border-white/5 rounded-2xl py-2.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-fin-mint/50 transition-all shadow-sm focus:shadow-md dark:text-white"
              />
            </div>

            {/* Lista de Dívidas (Cards) */}
            <DebtList 
              debts={filteredDebts}
              loading={loading}
              strategy={strategy}
              setStrategy={setStrategy}
              totalSavings={totalSavings}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
              onPay={handlePay}
            />
          </motion.div>
        ) : (
          <motion.div
            key="analysis-tab"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-8"
          >
            {/* Medidor de Saúde (Ocupa largura total) */}
            <DebtHealthScore debts={debts} transactions={transactions} />

            {/* Comparativo de Estratégias */}
            <DebtPayoffComparison 
              activeStrategy={strategy}
              debts={debts} 
              extraAmount={extraAmount} 
              onSelectStrategy={(s) => {
                setStrategy(s);
                showToast(`Estratégia ${s === 'snowball' ? 'Bola de Neve' : s === 'avalanche' ? 'Avalanche' : 'Padrão'} ativada!`, 'success');
              }} 
            />

            {/* Simulador de Quitação (Premium) */}
            <DebtSimulator 
              debts={debts} 
              userPlan={userPlan} 
              strategy={strategy} 
              extraAmount={extraAmount} 
              setExtraAmount={setExtraAmount} 
            />

            {/* Ferramenta de Consolidação (Nova) */}
            <DebtConsolidationTool debts={debts} />
          </motion.div>
        )}
      </AnimatePresence>

      {isModalOpen && (
        <DebtModal 
          debt={selectedDebt} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={fetchDebts} 
          showToast={showToast}
        />
      )}

      {isPaymentModalOpen && selectedDebt && (
        <DebtPaymentModal
          debt={selectedDebt}
          onClose={() => setIsPaymentModalOpen(false)}
          onSuccess={fetchDebts}
          showToast={showToast}
          accounts={accounts}
          categories={categories}
          cards={cards}
        />
      )}
    </div>
  );
}

function MetricCard({ icon, label, value, subValue, color }) {
  const colors = {
    amber: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    mint: "text-fin-mint bg-fin-mint/10 border-fin-mint/20",
    rose: "text-rose-500 bg-rose-500/10 border-rose-500/20",
    blue: "text-blue-500 bg-blue-500/10 border-blue-500/20"
  };
  return (
    <div className="bg-fin-surface border border-zinc-900/10 dark:border-white/5 p-6 rounded-[28px] shadow-lg flex items-center gap-4 group hover:-translate-y-1 transition-all duration-300">
      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0", colors[color])}>{icon}</div>
      <div className="min-w-0">
        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-xl font-black text-zinc-900 dark:text-white truncate">{value}</p>
        {subValue && <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-tight">{subValue}</p>}
      </div>
    </div>
  );
}
