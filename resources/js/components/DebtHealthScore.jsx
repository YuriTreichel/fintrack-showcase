import React, { useMemo } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  ShieldX, 
  TrendingUp, 
  Lightbulb,
  Activity,
  ArrowUpRight
} from 'lucide-react';
import { cn } from '../utils/classNames';

export default function DebtHealthScore({ debts, transactions = [] }) {
  const result = useMemo(() => {
    if (debts.length === 0) return { 
      score: 100, 
      status: 'Excelente', 
      color: 'emerald',
      dti: 0,
      avgInterest: 0,
      tip: 'Você não possui dívidas pendentes. Continue mantendo sua saúde financeira!',
      icon: ShieldCheck
    };

    const pendingDebts = debts.filter(d => d.status === 'Pending');
    const totalPending = pendingDebts.reduce((acc, curr) => acc + Number(curr.amount), 0);
    
    // 1. Estimativa de Renda Mensal (Incomes dos últimos 30 dias)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const monthlyIncome = transactions
      .filter(t => t.type === 'Income' && t.status === 'Paid' && new Date(t.date) >= thirtyDaysAgo)
      .reduce((acc, curr) => acc + Number(curr.amount), 0) || 3000; // Fallback para 3000 se não houver dados

    // 2. Pontuação DTI (Debt-to-Income) - Peso 40
    // Idealmente a parcela mensal não deve passar de 30% da renda. 
    // Como não temos a parcela exata de todas, estimamos a "pressão mensal" como 10% do saldo total se for dívida única ou a soma das parcelas se houver
    const monthlyPressure = debts.reduce((acc, d) => {
        if (d.status === 'Paid') return acc;
        if (d.total_installments > 1) {
            return acc + (Number(d.amount) / (d.total_installments - (d.installment_number || 0) + 1));
        }
        return acc + (Number(d.amount) * 0.1); // Estimativa conservadora de 10% do saldo p/ dívidas à vista
    }, 0);

    const dti = (monthlyPressure / monthlyIncome) * 100;
    let dtiScore = 0;
    if (dti <= 5) dtiScore = 40;
    else if (dti <= 15) dtiScore = 35;
    else if (dti <= 30) dtiScore = 25;
    else if (dti <= 50) dtiScore = 15;
    else dtiScore = 5;

    // 3. Pontuação de Juros - Peso 30
    const avgInterest = pendingDebts.length > 0
        ? pendingDebts.reduce((acc, d) => acc + Number(d.interest_rate || 0), 0) / pendingDebts.length
        : 0;
    
    let interestScore = 0;
    if (avgInterest === 0) interestScore = 30;
    else if (avgInterest <= 2) interestScore = 25;
    else if (avgInterest <= 5) interestScore = 15;
    else if (avgInterest <= 10) interestScore = 5;
    else interestScore = 0;

    // 4. Pontuação de Conquista (Ratio Pago/Total) - Peso 30
    const paidRatio = debts.filter(d => d.status === 'Paid').length / debts.length;
    const progressScore = paidRatio * 30;

    const totalScore = Math.round(dtiScore + interestScore + progressScore);

    let status = 'Crítico';
    let color = 'rose';
    let icon = ShieldX;
    let tip = 'Sua situação exige atenção imediata. Priorize as dívidas de maior juro (Avalanche).';

    if (totalScore >= 80) {
        status = 'Excelente';
        color = 'emerald';
        icon = ShieldCheck;
        tip = 'Parabéns! Suas dívidas estão sob controle e não pesam no seu orçamento.';
    } else if (totalScore >= 60) {
        status = 'Saudável';
        color = 'fin-mint';
        icon = ShieldCheck;
        tip = 'Você está no caminho certo. Continue pagando em dia para evitar juros acumulados.';
    } else if (totalScore >= 40) {
        status = 'Alerta';
        color = 'amber';
        icon = ShieldAlert;
        tip = 'Cuidado com o acúmulo de parcelas. Tente consolidar dívidas se os juros subirem.';
    }

    return { score: totalScore, status, color, icon, tip, dti, avgInterest };
  }, [debts, transactions]);

  const Icon = result.icon;

  return (
    <div className="bg-fin-surface border border-zinc-900/10 dark:border-white/5 rounded-[32px] p-1 shadow-2xl overflow-hidden group">
      <div className="flex flex-col md:flex-row items-stretch">
        {/* Lado Esquerdo: Gauge */}
        <div className="p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-zinc-900/5 dark:border-white/5 bg-zinc-50/50 dark:bg-black/20 shrink-0">
           <div className="relative w-32 h-32 flex items-center justify-center">
              {/* Círculo de Fundo */}
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="58"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-zinc-200 dark:text-zinc-800"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="58"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray={364}
                  strokeDashoffset={364 - (364 * result.score) / 100}
                  strokeLinecap="round"
                  className={cn(
                    "transition-all duration-1000 ease-out",
                    result.color === 'emerald' ? 'text-emerald-500' :
                    result.color === 'fin-mint' ? 'text-fin-mint' :
                    result.color === 'amber' ? 'text-amber-500' : 'text-rose-500'
                  )}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                 <span className="text-4xl font-black text-zinc-900 dark:text-white leading-none">{result.score}</span>
                 <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">Pontos</span>
              </div>
           </div>
           <div className={cn(
             "mt-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
             result.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
             result.color === 'fin-mint' ? 'bg-fin-mint/10 text-fin-mint border-fin-mint/20' :
             result.color === 'amber' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
             'bg-rose-500/10 text-rose-500 border-rose-500/20'
           )}>
              {result.status}
           </div>
        </div>

        {/* Lado Direito: Info & Dicas */}
        <div className="p-8 flex-1 flex flex-col justify-center gap-6">
           <div className="flex items-start justify-between gap-4">
              <div>
                 <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase italic tracking-tight flex items-center gap-2">
                    <Activity size={20} className="text-fin-mint" /> Diagnóstico Financeiro
                 </h3>
                 <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1 leading-relaxed">
                    Sua saúde de crédito é baseada no peso das parcelas, taxas de juros e histórico de quitação.
                 </p>
              </div>
              <div className="hidden sm:block">
                 <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-white/5 flex items-center justify-center text-zinc-400">
                    <Icon size={24} />
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-zinc-100 dark:bg-white/5 rounded-2xl border border-zinc-900/5 dark:border-white/5">
                 <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                    <ArrowUpRight size={10} /> Comprometimento
                 </p>
                 <p className="text-lg font-black text-zinc-900 dark:text-white">{Math.round(result.dti)}% <span className="text-xs font-bold text-zinc-500">do orçamento</span></p>
              </div>
              <div className="p-4 bg-zinc-100 dark:bg-white/5 rounded-2xl border border-zinc-900/5 dark:border-white/5">
                 <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                    <TrendingUp size={10} /> Juros Médio
                 </p>
                 <p className="text-lg font-black text-zinc-900 dark:text-white">{result.avgInterest.toFixed(1)}% <span className="text-xs font-bold text-zinc-500">ao mês</span></p>
              </div>
           </div>

           <div className="flex items-start gap-3 p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl">
              <Lightbulb className="text-indigo-500 shrink-0 mt-0.5" size={18} />
              <div>
                 <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">Dica do FinTrack Pro</p>
                 <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400 leading-relaxed italic">
                    "{result.tip}"
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
