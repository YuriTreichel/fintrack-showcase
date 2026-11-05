import React, { useMemo } from 'react';
import { 
  TrendingDown, 
  Percent, 
  Clock, 
  Calendar, 
  ArrowRight,
  ChevronRight,
  Zap,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { cn } from '../utils/classNames';
import { addMonths, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function DebtPayoffComparison({ debts, extraAmount = 0, onSelectStrategy, activeStrategy }) {
  const pendingDebts = useMemo(() => debts.filter(d => d.status === 'Pending'), [debts]);

  const stats = useMemo(() => {
    if (pendingDebts.length === 0) return null;

    const totalBalance = pendingDebts.reduce((acc, curr) => acc + Number(curr.amount), 0);
    
    // Simplificação de compromisso mensal (parcelas restantes)
    const avgMonthlyCommitment = pendingDebts.reduce((acc, d) => {
        const remaining = d.total_installments && d.installment_number 
            ? (d.total_installments - d.installment_number + 1)
            : 1;
        return acc + (Number(d.amount) / remaining);
    }, 0);

    const runSimulation = (strategyType, monthlyExtra) => {
      let activeDebts = pendingDebts.map(d => ({
        ...d,
        currentBalance: Number(d.amount),
        rate: Number(d.interest_rate || 0) / 100
      }));

      if (strategyType === 'snowball') {
        activeDebts.sort((a, b) => a.currentBalance - b.currentBalance);
      } else if (strategyType === 'avalanche') {
        activeDebts.sort((a, b) => b.rate - a.rate || b.currentBalance - a.currentBalance);
      }

      let month = 0;
      let totalInterest = 0;
      const totalPayment = avgMonthlyCommitment + monthlyExtra;

      while (activeDebts.some(d => d.currentBalance > 0.5) && month < 360) {
        month++;
        let monthlyRemainingPayment = totalPayment;

        // Apply interest
        activeDebts.forEach(d => {
          if (d.currentBalance > 0) {
            const interest = d.currentBalance * (d.rate / 12); // monthly rate
            totalInterest += interest;
            d.currentBalance += interest;
          }
        });

        // Apply payment
        for (let d of activeDebts) {
          if (d.currentBalance > 0) {
            const payment = Math.min(d.currentBalance, monthlyRemainingPayment);
            d.currentBalance -= payment;
            monthlyRemainingPayment -= payment;
            if (monthlyRemainingPayment <= 0) break;
          }
        }
      }

      return { months: month, totalInterest };
    };

    const current = runSimulation('default', 0);
    const snowball = runSimulation('snowball', extraAmount);
    const avalanche = runSimulation('avalanche', extraAmount);

    return {
      totalBalance,
      current,
      snowball,
      avalanche,
      bestStrategy: avalanche.totalInterest < snowball.totalInterest ? 'avalanche' : 'snowball'
    };
  }, [pendingDebts, extraAmount]);

  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-fin-mint/10 flex items-center justify-center text-fin-mint">
           <Zap size={20} fill="currentColor" />
        </div>
        <div>
          <h3 className="text-lg font-black dark:text-white uppercase tracking-tight">Comparativo de Estratégias</h3>
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Veja a diferença que o método e o aporte extra fazem</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card: Atual */}
        <StrategyCard 
          title="Sem Estratégia"
          subtitle="Apenas pagamentos mínimos"
          months={stats.current.months}
          interest={stats.current.totalInterest}
          variant="default"
          isActive={activeStrategy === 'default'}
          onSelect={() => onSelectStrategy && onSelectStrategy('default')}
        />

        {/* Card: Snowball */}
        <StrategyCard 
          title="Bola de Neve"
          subtitle="Pagar menores saldos primeiro"
          months={stats.snowball.months}
          interest={stats.snowball.totalInterest}
          savedMonths={stats.current.months - stats.snowball.months}
          savedInterest={stats.current.totalInterest - stats.snowball.totalInterest}
          variant="snowball"
          isBest={stats.bestStrategy === 'snowball'}
          isActive={activeStrategy === 'snowball'}
          onSelect={() => onSelectStrategy && onSelectStrategy('snowball')}
        />

        {/* Card: Avalanche */}
        <StrategyCard 
          title="Avalanche"
          subtitle="Pagar maiores juros primeiro"
          months={stats.avalanche.months}
          interest={stats.avalanche.totalInterest}
          savedMonths={stats.current.months - stats.avalanche.months}
          savedInterest={stats.current.totalInterest - stats.avalanche.totalInterest}
          variant="avalanche"
          isBest={stats.bestStrategy === 'avalanche'}
          isActive={activeStrategy === 'avalanche'}
          onSelect={() => onSelectStrategy && onSelectStrategy('avalanche')}
        />
      </div>

      <div className="p-4 bg-fin-mint/5 border border-fin-mint/20 rounded-2xl flex items-start gap-4">
        <div className="p-2 bg-fin-mint/10 rounded-xl text-fin-mint shrink-0">
          <AlertCircle size={18} />
        </div>
        <div>
          <p className="text-sm font-bold text-fin-mint italic">Recomendação FinTrack:</p>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
            {stats.bestStrategy === 'avalanche' 
              ? "O método Avalanche é o mais eficiente matematicamente para você, economizando o máximo em juros." 
              : "O método Bola de Neve ajudará você a eliminar contas menores rapidamente, gerando fôlego psicológico para as maiores."}
          </p>
        </div>
      </div>
    </div>
  );
}

function StrategyCard({ title, subtitle, months, interest, savedMonths, savedInterest, variant, isBest, isActive, onSelect }) {
  const icon = variant === 'snowball' ? <TrendingDown size={14} /> : variant === 'avalanche' ? <Percent size={14} /> : <Clock size={14} />;
  
  return (
    <div className={cn(
      "p-6 rounded-[28px] border transition-all duration-500 relative overflow-hidden group min-h-[440px] flex flex-col",
      isActive
        ? "bg-fin-surface border-fin-mint shadow-[0_20px_40px_-15px_rgba(0,255,163,0.15)] ring-2 ring-fin-mint/30" 
        : isBest
          ? "bg-fin-surface border-fin-mint/30 border-dashed opacity-90 hover:opacity-100"
          : "bg-fin-surface border-zinc-200 dark:border-white/5 opacity-70 hover:opacity-100"
    )}>
      {isBest && !isActive && (
        <div className="absolute top-0 right-0 bg-fin-mint/10 text-fin-mint text-[7px] font-black uppercase tracking-widest px-2 py-1 rounded-bl-lg border-b border-l border-fin-mint/20">
          Recomendado
        </div>
      )}
      
      {isActive && (
        <div className="absolute top-0 right-0 lg:left-0 lg:right-auto bg-fin-mint text-fin-bg text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl lg:rounded-bl-none lg:rounded-br-xl flex items-center gap-1 shadow-lg z-10">
          <CheckCircle2 size={10} /> Ativo Agora
        </div>
      )}

      <div className="mb-6">
        <div className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center mb-3",
          variant === 'snowball' ? "bg-blue-500/10 text-blue-500" : variant === 'avalanche' ? "bg-fin-mint/10 text-fin-mint" : "bg-zinc-500/10 text-zinc-500"
        )}>
          {icon}
        </div>
        <h4 className="font-black text-zinc-900 dark:text-white uppercase tracking-tight">{title}</h4>
        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-tight">{subtitle}</p>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Tempo para Quitação</p>
          <div className="flex items-baseline gap-1">
            <p className="text-xl font-black text-zinc-900 dark:text-white">{months}</p>
            <p className="text-[10px] font-bold text-zinc-500 uppercase">meses</p>
          </div>
          <p className="text-[9px] font-bold text-zinc-500 mt-0.5">
            Livre em {format(addMonths(new Date(), months), "MMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>

        <div>
           <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Total em Juros</p>
           <p className="text-lg font-black text-zinc-900 dark:text-white">
             R$ {interest.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
           </p>
        </div>

        {savedMonths > 0 && (
          <div className="pt-4 border-t border-zinc-900/5 dark:border-white/5 space-y-2">
             <div className="flex items-center justify-between">
                <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Economia Tempo</span>
                <span className="text-[10px] font-black text-fin-mint">-{savedMonths} meses</span>
             </div>
             <div className="flex items-center justify-between">
                <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Economia Juros</span>
                <span className="text-[10px] font-black text-fin-mint">R$ {savedInterest.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
             </div>
          </div>
        )}
      </div>

      <div className="mt-auto">
        <button 
          onClick={onSelect}
          disabled={isActive}
          className={cn(
            "w-full py-2.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 mt-6",
            isActive
              ? "bg-zinc-100 dark:bg-white/5 text-zinc-400 cursor-default"
              : isBest 
                ? "bg-fin-mint text-fin-bg shadow-lg shadow-fin-mint/20 hover:scale-105" 
                : "bg-zinc-100 dark:bg-white/5 text-zinc-500 hover:text-zinc-700 dark:hover:text-white"
          )}
        >
           {isActive ? 'Estratégia Ativa' : isBest ? 'Ativar Melhor Opção' : 'Selecionar Método'} <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
}
