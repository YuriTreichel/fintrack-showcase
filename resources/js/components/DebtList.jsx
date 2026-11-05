import React from 'react';
import { 
  Trophy, 
  TrendingDown, 
  ArrowDownToLine, 
  Percent, 
  Calendar, 
  User, 
  Trash2, 
  Edit3, 
  DollarSign,
  CheckCircle2, 
  Clock,
  LayoutGrid,
  List as ListIcon,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '../utils/classNames';

export default function DebtList({ 
  debts, 
  loading, 
  strategy, 
  setStrategy, 
  totalSavings, 
  onEdit, 
  onDelete, 
  onToggleStatus,
  onPay
}) {
  if (loading && debts.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-64 bg-zinc-100 dark:bg-white/5 rounded-[32px] border border-zinc-200 dark:border-white/5" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Banner de Conquista */}
      {totalSavings > 0 && (
        <div className="relative overflow-hidden bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-[32px] flex items-center gap-6 group">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors duration-500" />
          
          <div className="w-16 h-16 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
             <Trophy size={32} />
          </div>
          
          <div>
            <h4 className="text-xl font-black text-zinc-900 dark:text-emerald-400 italic">
              Você já economizou R$ {totalSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} em negociações e acordos!
            </h4>
            <p className="text-xs font-bold text-emerald-600/80 dark:text-emerald-500/60 uppercase tracking-widest mt-1">
              Continue assim! Cada negociação é um passo para sua liberdade financeira.
            </p>
          </div>
        </div>
      )}

      {/* Seletor de Estratégia e Filtros */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-2 p-1.5 bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/5 rounded-2xl w-fit">
           <StrategyButton 
             active={strategy === 'default'} 
             onClick={() => setStrategy('default')}
             label="Padrão"
             icon={<LayoutGrid size={14} />}
           />
           <StrategyButton 
             active={strategy === 'snowball'} 
             onClick={() => setStrategy('snowball')}
             label="Menor Valor"
             icon={<TrendingDown size={14} />}
           />
           <StrategyButton 
             active={strategy === 'avalanche'} 
             onClick={() => setStrategy('avalanche')}
             label="Maior Juros"
             icon={<Percent size={14} />}
           />
        </div>
        
        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-3 italic">
           Exibindo {debts.length} registros • Ordenação: {strategy === 'snowball' ? 'Bola de Neve' : strategy === 'avalanche' ? 'Avalanche' : 'Data'}
        </p>
      </div>

      {/* Grid de Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {debts.map((debt, index) => (
          <DebtCard 
            key={debt.id} 
            debt={debt} 
            strategy={strategy}
            isPriority={strategy !== 'default' && index === 0}
            onEdit={() => onEdit(debt)} 
            onDelete={() => onDelete(debt)}
            onToggleStatus={() => onToggleStatus(debt)}
            onPay={() => onPay(debt)}
          />
        ))}
      </div>
    </div>
  );
}

function StrategyButton({ active, onClick, label, icon }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
        active 
          ? "bg-white dark:bg-zinc-800 text-fin-mint shadow-sm ring-1 ring-zinc-900/5 dark:ring-white/10" 
          : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
      )}
    >
      {icon} {label}
    </button>
  );
}

function DebtCard({ debt, onEdit, onDelete, onToggleStatus, onPay, isPriority, strategy }) {
  const isPaid = debt.status === 'Paid';
  const progress = debt.total_installments > 1 
    ? (debt.installment_number / debt.total_installments) * 100 
    : (isPaid ? 100 : 0);

  // Cores semânticas baseadas em juros e valor
  const interestRate = Number(debt.interest_rate || 0);
  const isHighInterest = interestRate >= 10;
  const isLowInterest = interestRate < 2;
  const isSmallDebt = Number(debt.amount) < 500;

  const barColorClass = isHighInterest 
    ? "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]" 
    : (isLowInterest || isSmallDebt ? "bg-blue-500" : "bg-fin-mint");

  return (
    <div className={cn(
        "group bg-fin-surface border rounded-[32px] p-6 shadow-xl hover:-translate-y-2 transition-all duration-500 relative flex flex-col h-full",
        isPriority 
            ? "border-fin-mint/50 ring-2 ring-fin-mint/10 dark:ring-fin-mint/5 shadow-[0_20px_40px_-15px_rgba(0,255,163,0.1)]" 
            : "border-zinc-200 dark:border-white/5"
    )}>
      {isPriority && (
        <div className="absolute -top-3 left-6 px-3 py-1 bg-fin-mint text-fin-bg text-[9px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5 shadow-lg animate-bounce z-10">
           <Zap size={10} fill="currentColor" /> 
           {strategy === 'snowball' ? 'Menor valor para quitação rápida' : 'Maior juro para máxima economia'}
        </div>
      )}
      {/* Header do Card */}
      <div className="flex items-start justify-between mb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h5 className="font-black text-zinc-900 dark:text-white truncate max-w-[150px]">
               {debt.description}
            </h5>
            {debt.is_negotiated == 1 && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase tracking-tighter border border-emerald-500/20">
                 <ShieldCheck size={10} /> Acordo Serasa/Negociado
              </span>
            )}
          </div>
          {debt.creditor && (
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1">
               <User size={12} className="text-fin-mint" /> {debt.creditor}
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-2">
           {!isPaid && (
             <button 
               onClick={onPay}
               className="p-2 bg-fin-mint/10 text-fin-mint hover:bg-fin-mint hover:text-fin-bg rounded-xl transition-all"
               title="Registrar Pagamento"
             >
                <DollarSign size={14} />
             </button>
           )}
           <button 
             onClick={onEdit}
             className="p-2 bg-zinc-100 dark:bg-white/5 text-zinc-500 hover:bg-fin-mint hover:text-fin-bg rounded-xl transition-all"
           >
              <Edit3 size={14} />
           </button>
        </div>
      </div>

      {/* Valores */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Valor Atual</p>
          <p className="text-2xl font-black text-zinc-900 dark:text-white">
             R$ {Number(debt.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          {debt.is_negotiated == 1 && debt.total_savings > 0 && (
            <div className="flex items-center gap-1.5 mt-1">
               <ArrowDownToLine size={12} className="text-emerald-500" />
               <span className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter">
                  Economia de R$ {Number(debt.total_savings).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
               </span>
            </div>
          )}
        </div>

        {debt.interest_rate > 0 && (
          <div className="px-3 py-1.5 bg-zinc-100 dark:bg-white/5 rounded-2xl border border-zinc-200 dark:border-white/5 flex flex-col items-center">
             <span className="text-[8px] font-black text-zinc-500 uppercase tracking-tighter mb-0.5">Juros/mês</span>
             <span className={cn("text-xs font-black", isHighInterest ? "text-rose-500" : "text-fin-mint")}>
                {debt.interest_rate}%
             </span>
          </div>
        )}
      </div>

      {/* Barra de Progresso e Info Adicional */}
      <div className="mt-auto space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-zinc-500">
            <span>Progresso {isPaid ? '100%' : `${Math.round(progress)}%`}</span>
            {debt.total_installments > 1 && (
              <span>Parcela {debt.installment_number}/{debt.total_installments}</span>
            )}
          </div>
          <div className="h-2.5 bg-zinc-100 dark:bg-white/5 rounded-full overflow-hidden p-0.5 border border-zinc-200 dark:border-white/5">
             <div 
               className={cn("h-full rounded-full transition-all duration-1000", barColorClass)}
               style={{ width: `${progress}%` }}
             />
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-zinc-900/5 dark:border-white/5">
          <div className="flex items-center gap-2 text-zinc-500">
             <Calendar size={12} />
             <span className="text-[10px] font-bold">{format(parseISO(debt.date), 'dd/MM/yyyy')}</span>
          </div>

          <div className="flex items-center gap-2">
            <button 
               onClick={onToggleStatus}
               className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all hover:scale-105 active:scale-95",
                  isPaid 
                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                    : "bg-amber-500/10 text-amber-500 border-amber-500/20"
               )}
            >
               {isPaid ? <CheckCircle2 size={12} /> : <Clock size={12} />}
               {isPaid ? 'Paga' : 'Pendente'}
            </button>
            
            <button 
               onClick={onDelete}
               className="p-1.5 text-rose-500/40 hover:text-rose-500 transition-colors"
               title="Excluir"
            >
               <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
