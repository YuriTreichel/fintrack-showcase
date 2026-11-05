import React, { useMemo, useState } from "react";
import { 
  Plus, 
  Target, 
  Settings, 
  Trash2, 
  Calendar,
  Flag,
  Trophy,
  ArrowRight,
  Sparkles,
  PiggyBank
} from "lucide-react";
import { cn } from "../utils/classNames";
import { useFinStore } from '../store/useFinStore';
import { format, parseISO, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import GoalModal from "../modals/GoalModal";
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";

export default function GoalsView({ fetchData, showToast, showConfirm, isReadOnly, onDeposit }) {
  const { goals, setGoals } = useFinStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  const processedGoals = useMemo(() => {
    return goals.map(goal => {
      const percentage = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
      const remaining = Math.max(goal.target_amount - goal.current_amount, 0);
      const isCompleted = percentage >= 100;
      
      let daysRemaining = null;
      if (goal.deadline) {
        daysRemaining = differenceInDays(parseISO(goal.deadline), new Date());
      }

      return {
        ...goal,
        percentage,
        remaining,
        isCompleted,
        daysRemaining
      };
    });
  }, [goals]);

  const totalTarget = goals.reduce((acc, g) => acc + Number(g.target_amount), 0);
  const totalSaved = goals.reduce((acc, g) => acc + Number(g.current_amount), 0);
  const completedGoals = processedGoals.filter(g => g.isCompleted).length;

  const handleDelete = (id) => {
    showConfirm(
      "Excluir Meta",
      "Tem certeza que deseja excluir esta meta financeira?",
      async () => {
        try {
          const res = await fetch(`/api/goals/${id}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          if (res.ok) {
            showToast("Meta excluída!", "success");
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
        title="Metas"
        subtitle="Acompanhe seus objetivos e conquiste seus sonhos financeiros."
        label="Objetivos"
        actions={
          !isReadOnly && (
            <Button 
              onClick={() => setIsModalOpen(true)}
              icon={Plus}
            >
              Nova Meta
            </Button>
          )
        }
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-fin-surface p-6 rounded-[24px] border border-zinc-900/10 dark:border-white/5 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-fin-mint/5 rounded-full blur-2xl group-hover:bg-fin-mint/10 transition-colors"></div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-fin-mint/10 flex items-center justify-center text-fin-mint">
              <Trophy size={20} />
            </div>
            <span className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Metas Alcançadas</span>
          </div>
          <p className="text-2xl font-bold text-zinc-900 dark:text-white">
            {completedGoals} <span className="text-sm text-zinc-500 font-normal">de {goals.length}</span>
          </p>
        </div>
        <div className="bg-fin-surface p-6 rounded-[24px] border border-zinc-900/10 dark:border-white/5 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-fin-peach/5 rounded-full blur-2xl group-hover:bg-fin-peach/10 transition-colors"></div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-fin-peach/10 flex items-center justify-center text-fin-peach">
              <Sparkles size={20} />
            </div>
            <span className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Total Acumulado</span>
          </div>
          <p className="text-2xl font-bold text-zinc-900 dark:text-white">
            R$ {totalSaved.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-fin-surface p-6 rounded-[24px] border border-zinc-900/10 dark:border-white/5 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-zinc-900/10 rounded-full blur-2xl group-hover:bg-white/5 transition-colors"></div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400">
              <Target size={20} />
            </div>
            <span className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Objetivo Total</span>
          </div>
          <p className="text-2xl font-bold text-zinc-900 dark:text-white">
            R$ {totalTarget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Goals List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {processedGoals.length === 0 ? (
          <div className="lg:col-span-3 text-center py-20 bg-fin-surface rounded-[32px] border border-dashed border-white/5">
            <div className="w-16 h-16 bg-zinc-900/10 dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Flag size={28} className="text-zinc-500" />
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium">Nenhuma meta ativa.</p>
            {!isReadOnly && (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="mt-4 text-fin-mint text-sm font-bold hover:underline"
              >
                + Começar a economizar
              </button>
            )}
          </div>
        ) : (
          processedGoals.map(goal => (
            <div 
              key={goal.id}
              className={cn(
                "bg-fin-surface p-7 rounded-[32px] border transition-all duration-300 group relative",
                goal.isCompleted 
                  ? "border-fin-mint/30 bg-fin-mint/[0.02]" 
                  : "border-zinc-900/10 dark:border-white/5 hover:border-white/10"
              )}
            >
              <div className="flex items-center justify-between mb-8">
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg border border-white/5"
                  style={{ backgroundColor: `${goal.color || '#3b82f6'}20`, color: goal.color || '#3b82f6' }}
                >
                  <Target size={28} />
                </div>
                <div className="hidden md:flex items-center gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                  {!isReadOnly && (
                    <>
                      <button onClick={() => { setEditingGoal(goal); setIsModalOpen(true); }} className="p-2 text-zinc-500 hover:text-white transition-colors">
                        <Settings size={18} />
                      </button>
                      <button onClick={() => handleDelete(goal.id)} className="p-2 text-zinc-500 hover:text-[#ff7b7b] transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="mb-8">
                <h4 className="font-bold text-zinc-900 dark:text-white text-xl mb-2">{goal.name}</h4>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-zinc-500 uppercase tracking-widest tabular-nums">
                    R$ {Number(goal.current_amount).toLocaleString('pt-BR')} 
                  </span>
                  <ArrowRight size={14} className="text-zinc-600" />
                  <span className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-widest tabular-nums font-mono">
                    R$ {Number(goal.target_amount).toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest">
                  <span className="text-zinc-500">Progresso Geral</span>
                  <span className={cn(
                    goal.isCompleted ? "text-fin-mint" : "text-zinc-900 dark:text-white"
                  )}>
                    {goal.percentage.toFixed(0)}%
                  </span>
                </div>
                <div className="h-2.5 bg-zinc-900/20 dark:bg-black/50 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className="h-full transition-all duration-700 ease-out rounded-full"
                    style={{ 
                      width: `${goal.percentage}%`,
                      backgroundColor: goal.color || '#3b82f6',
                      boxShadow: `0 0 10px ${goal.color || '#3b82f6'}40`
                    }}
                  />
                </div>
                
                <div className="pt-4 flex items-center justify-between border-t border-white/5">
                  <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
                    <Calendar size={14} />
                    {goal.deadline ? format(parseISO(goal.deadline), "dd MMM yy", { locale: ptBR }) : 'Sem prazo'}
                  </div>
                  {goal.daysRemaining !== null && !goal.isCompleted && (
                    <div className={cn(
                      "text-[10px] font-bold uppercase px-2 py-0.5 rounded-md",
                      goal.daysRemaining < 30 ? "bg-[#ff7b7b]/10 text-[#ff7b7b]" : "bg-zinc-800 text-zinc-500"
                    )}>
                      {goal.daysRemaining} dias restam
                    </div>
                  )}
                  {goal.isCompleted && (
                    <div className="bg-fin-mint/10 text-fin-mint text-[10px] font-bold uppercase px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Trophy size={10} /> Concluída
                    </div>
                  )}
                </div>

                {!isReadOnly && !goal.isCompleted && (
                  <button 
                    onClick={() => onDeposit({ 
                      type: 'GoalDeposit', 
                      goal_id: goal.id, 
                      description: `Depósito: ${goal.name}`,
                      amount: "" 
                    })}
                    className="w-full mt-4 flex items-center justify-center gap-2 py-4 bg-fin-mint text-fin-bg rounded-2xl text-sm font-bold hover:brightness-110 transition-all shadow-lg shadow-fin-mint/10"
                  >
                    <PiggyBank size={18} />
                    Depositar na Meta
                  </button>
                )}

                {/* Ações Mobile */}
                {!isReadOnly && (
                  <div className="mt-8 pt-4 border-t border-zinc-900/5 dark:border-white/5 flex gap-3 md:hidden relative z-20">
                    <button
                      onClick={() => { setEditingGoal(goal); setIsModalOpen(true); }}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-zinc-900/5 dark:bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
                    >
                      <Settings size={14} /> Configurar
                    </button>
                    <button
                      onClick={() => handleDelete(goal.id)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#ff7b7b]/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#ff7b7b] transition-colors"
                    >
                      <Trash2 size={14} /> Excluir
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <GoalModal 
          onClose={() => { setIsModalOpen(false); setEditingGoal(null); }} 
          onSuccess={() => fetchData()}
          initialData={editingGoal}
        />
      )}
    </div>
  );
}
