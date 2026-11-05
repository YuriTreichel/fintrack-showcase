import React, { useMemo, useState } from "react";
import { 
  Plus, 
  PiggyBank, 
  Settings, 
  Trash2, 
  Target,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Calendar
} from "lucide-react";
import { cn } from "../utils/classNames";
import { useFinStore } from '../store/useFinStore';
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import BudgetModal from "../modals/BudgetModal";
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";

export default function BudgetsView({ fetchData, showToast, showConfirm, isReadOnly, onNavigateToTransactions }) {
  const { budgets, transactions, categories, setBudgets, userPlan } = useFinStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [refDate, setRefDate] = useState(new Date());
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(new Date().getFullYear());

  const handlePrevMonth = () => {
    setRefDate(new Date(refDate.getFullYear(), refDate.getMonth() - 1, 1));
  };
  const handleNextMonth = () => {
    setRefDate(new Date(refDate.getFullYear(), refDate.getMonth() + 1, 1));
  };

  const currentMonthStart = startOfMonth(refDate);
  const currentMonthEnd = endOfMonth(refDate);

  const totalIncome = useMemo(() => {
    return transactions
      .filter(t => {
        if (t.type !== 'Income') return false;
        const tDate = parseISO(t.date);
        return isWithinInterval(tDate, { start: currentMonthStart, end: currentMonthEnd });
      })
      .reduce((acc, t) => acc + Number(t.amount), 0);
  }, [transactions, currentMonthStart, currentMonthEnd]);

  const processedBudgets = useMemo(() => {
    return budgets
      .filter(budget => {
        if (budget.is_fixed) return true;
        const currentMonth = refDate.getMonth() + 1;
        const currentYear = refDate.getFullYear();
        return budget.month === currentMonth && budget.year === currentYear;
      })
      .map(budget => {
        const budgetAmount = budget.type === 'percentage'
          ? (totalIncome * (budget.percentage_value / 100))
          : Number(budget.amount);

        // Calcular quanto foi gasto nesta categoria no mês atual
        const spent = transactions
          .filter(t => {
            if (t.type !== 'Expense') return false;
            if (budget.category_id) {
              const isDirectCategory = t.category_id === budget.category_id;
              const isSubCategory = categories.some(c => c.id === t.category_id && c.parent_id === budget.category_id);
              if (!isDirectCategory && !isSubCategory) return false;
            }
            
            const tDate = parseISO(t.date);
            return isWithinInterval(tDate, { start: currentMonthStart, end: currentMonthEnd });
          })
          .reduce((acc, t) => acc + Number(t.amount), 0);

        const percentage = budgetAmount > 0 ? Math.min((spent / budgetAmount) * 100, 100) : 0;
        const isOverBudget = budgetAmount > 0 && spent > budgetAmount;

        return {
          ...budget,
          budgetAmount,
          spent,
          percentage,
          isOverBudget,
          remaining: Math.max(budgetAmount - spent, 0)
        };
      });
  }, [budgets, transactions, totalIncome, currentMonthStart, currentMonthEnd]);

  const totalBudgeted = processedBudgets.reduce((acc, b) => acc + b.budgetAmount, 0);
  const totalSpent = processedBudgets.reduce((acc, b) => acc + b.spent, 0);
  const overallPercentage = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;

  const handleDelete = (id) => {
    showConfirm(
      "Excluir Planejamento",
      "Tem certeza que deseja excluir este planejamento?",
      async () => {
        try {
          const res = await fetch(`/api/budgets/${id}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          if (res.ok) {
            showToast("Planejamento excluído!", "success");
            fetchData();
          } else {
            showToast("Erro ao excluir.", "error");
          }
        } catch (e) {
          showToast("Erro de conexão.", "error");
        }
      }
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader
        icon={Target}
        title="Planejamento"
        subtitle="Controle seus gastos mensais e defina limites por categoria."
        label="Planejamentos"
        actions={
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="flex items-center gap-2 text-zinc-900 dark:bg-zinc-800/50 rounded-2xl p-1 border border-zinc-900/10 dark:border-white/5 relative z-10">
                  <button
                    onClick={handlePrevMonth}
                    className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white dark:hover:bg-white/10 rounded-xl transition-all"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <button
                    onClick={() => {
                      setPickerYear(refDate.getFullYear());
                      setIsMonthPickerOpen(!isMonthPickerOpen);
                    }}
                    className="text-sm font-bold min-w-[140px] text-center capitalize hover:text-fin-mint transition-colors py-2 px-3 rounded-xl hover:bg-zinc-900/5 dark:text-zinc-100 dark:hover:bg-white/5"
                  >
                    {format(refDate, "MMMM yyyy", { locale: ptBR })}
                  </button>

                  <button
                    onClick={handleNextMonth}
                    className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white dark:hover:bg-white/10 rounded-xl transition-all"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>

                {isMonthPickerOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsMonthPickerOpen(false)}
                    />
                    <div className="absolute top-full right-0 mt-3 p-5 bg-fin-surface border border-zinc-900/10 dark:border-white/10 rounded-3xl shadow-2xl z-50 w-72 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="flex justify-between items-center mb-4">
                        <button
                          onClick={() => setPickerYear((y) => y - 1)}
                          className="p-2 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-xl transition-colors text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                        >
                          <ChevronLeft size={18} />
                        </button>
                        <span className="font-bold text-lg text-zinc-900 dark:text-white">
                          {pickerYear}
                        </span>
                        <button
                          onClick={() => setPickerYear((y) => y + 1)}
                          className="p-2 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-xl transition-colors text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                        >
                          <ChevronRight size={18} />
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {Array.from({ length: 12 }).map((_, i) => {
                          const m = new Date(pickerYear, i, 1);
                          const isSelected =
                            refDate.getMonth() === i &&
                            refDate.getFullYear() === pickerYear;
                          return (
                            <button
                              key={i}
                              onClick={() => {
                                setRefDate(new Date(pickerYear, i, 1));
                                setIsMonthPickerOpen(false);
                              }}
                              className={cn(
                                "py-3 rounded-2xl text-sm font-semibold capitalize transition-all duration-200",
                                isSelected
                                  ? "bg-fin-mint text-fin-bg shadow-lg shadow-fin-mint/30 hover:scale-105"
                                  : "hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:scale-105",
                              )}
                            >
                              {format(m, "MMM", { locale: ptBR })}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {!isReadOnly && (
                <Button 
                  onClick={() => setIsModalOpen(true)}
                  icon={Plus}
                  className="h-12"
                >
                  Novo Planejamento
                </Button>
            )}
          </div>
        }
      />

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-fin-surface p-6 rounded-[24px] border border-zinc-900/10 dark:border-white/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-fin-mint/10 flex items-center justify-center text-fin-mint">
              <TrendingUp size={20} />
            </div>
            <span className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Total Planejado</span>
          </div>
          <p className="text-2xl font-bold text-zinc-900 dark:text-white">
            R$ {totalBudgeted.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-fin-surface p-6 rounded-[24px] border border-zinc-900/10 dark:border-white/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#ff7b7b]/10 flex items-center justify-center text-[#ff7b7b]">
              <TrendingDown size={20} />
            </div>
            <span className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Total Gasto</span>
          </div>
          <p className="text-2xl font-bold text-zinc-900 dark:text-white">
            R$ {totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-fin-surface p-6 rounded-[24px] border border-zinc-900/10 dark:border-white/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-fin-peach/10 flex items-center justify-center text-fin-peach">
              <Calendar size={20} />
            </div>
            <span className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Mês Atual</span>
          </div>
          <p className="text-2xl font-bold text-zinc-900 dark:text-white capitalize">
            {format(refDate, "MMMM yyyy", { locale: ptBR })}
          </p>
        </div>
      </div>

      {/* Budgets List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {processedBudgets.length === 0 ? (
          <div className="lg:col-span-2 text-center py-20 bg-fin-surface rounded-[32px] border border-dashed border-white/5">
            <div className="w-16 h-16 bg-zinc-900/10 dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <PiggyBank size={28} className="text-zinc-500" />
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium">Nenhum planejamento configurado.</p>
            {!isReadOnly && (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="mt-4 text-fin-mint text-sm font-bold hover:underline"
              >
                + Criar meu primeiro planejamento
              </button>
            )}
          </div>
        ) : (
          processedBudgets.map(budget => (
            <div 
              key={budget.id}
              onClick={() => {
                if (onNavigateToTransactions) {
                  onNavigateToTransactions({
                    status: "all",
                    type: "Expense",
                    month: format(refDate, "yyyy-MM"),
                    category: budget.category_id || "all",
                  });
                }
              }}
              className="bg-fin-surface p-6 rounded-[28px] border border-zinc-900/10 dark:border-white/5 hover:border-white/20 transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                   <div className={cn(
                     "w-12 h-12 rounded-2xl flex items-center justify-center",
                     budget.isOverBudget ? "bg-[#ff7b7b]/10 text-[#ff7b7b]" : "bg-fin-mint/10 text-fin-mint"
                   )}>
                     <PiggyBank size={24} />
                   </div>
                   <div>
                     <div className="flex items-center gap-2">
                       <h4 className="font-bold text-zinc-900 dark:text-white text-lg">{budget.name}</h4>
                       {budget.is_fixed && (
                         <span className="text-[10px] bg-fin-mint/10 text-fin-mint px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Fixo</span>
                       )}
                     </div>
                     <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                       {budget.category_name || 'Geral'}
                     </p>
                   </div>
                </div>
                <div className="hidden md:flex items-center gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                  {!isReadOnly && (
                    <>
                      <button onClick={(e) => { e.stopPropagation(); setEditingBudget(budget); setIsModalOpen(true); }} className="p-2 text-zinc-500 hover:text-fin-mint transition-colors">
                        <Settings size={18} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(budget.id); }} className="p-2 text-zinc-500 hover:text-[#ff7b7b] transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500 font-medium">Progresso</span>
                  <span className={cn(
                    "font-bold",
                    budget.isOverBudget ? "text-[#ff7b7b]" : "text-fin-mint"
                  )}>
                    {budget.percentage.toFixed(0)}%
                  </span>
                </div>
                <div className="h-3 bg-zinc-900/20 dark:bg-black/40 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className={cn(
                      "h-full transition-all duration-500",
                      budget.isOverBudget ? "bg-[#ff7b7b]" : "bg-fin-mint"
                    )}
                    style={{ width: `${budget.percentage}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-4 p-4 rounded-2xl bg-zinc-900/5 dark:bg-white/[0.02] border border-white/5">
                  <div>
                    <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider mb-0.5">Gasto</p>
                    <p className="font-bold text-zinc-900 dark:text-white">R$ {budget.spent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider mb-0.5">
                      {budget.type === 'percentage' ? `Limite (${budget.percentage_value}%)` : 'Limite'}
                    </p>
                    <p className="font-bold text-zinc-900 dark:text-white">R$ {budget.budgetAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>
              </div>

                {budget.isOverBudget && (
                  <div className="mt-4 flex items-center gap-2 text-[#ff7b7b] bg-[#ff7b7b]/10 p-3 rounded-xl border border-[#ff7b7b]/20 animate-pulse">
                    <AlertCircle size={14} />
                    <span className="text-xs font-bold uppercase tracking-tight">Limite excedido em R$ {(budget.spent - budget.budgetAmount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}

                {/* Ações Mobile */}
                {!isReadOnly && (
                  <div className="mt-6 pt-4 border-t border-zinc-900/5 dark:border-white/5 flex gap-3 md:hidden relative z-20">
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditingBudget(budget); setIsModalOpen(true); }}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-zinc-900/5 dark:bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-500"
                    >
                      <Settings size={14} /> Configurar
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(budget.id); }}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#ff7b7b]/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#ff7b7b]"
                    >
                      <Trash2 size={14} /> Excluir
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

      {isModalOpen && (
        <BudgetModal 
          onClose={() => { setIsModalOpen(false); setEditingBudget(null); }} 
          onSuccess={() => fetchData()}
          categories={categories}
          initialData={editingBudget}
        />
      )}
    </div>
  );
}
