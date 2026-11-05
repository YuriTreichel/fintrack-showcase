import React, { useState, useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { 
  Zap, 
  Calendar, 
  TrendingDown, 
  Lock, 
  ArrowRight, 
  Sparkles,
  Info
} from 'lucide-react';
import { cn } from '../utils/classNames';
import Button from './ui/Button';
import MoneyInput from './ui/MoneyInput';
import { addMonths, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function DebtSimulator({ debts, userPlan, strategy = 'default', extraAmount, setExtraAmount }) {
  const isPremium = userPlan === 'premium';

  // Filtra apenas dívidas pendentes
  const pendingDebts = useMemo(() => debts.filter(d => d.status === 'Pending'), [debts]);

  const simulation = useMemo(() => {
    if (pendingDebts.length === 0) return null;

    const totalBalance = pendingDebts.reduce((acc, curr) => acc + Number(curr.amount), 0);
    const hasInterest = pendingDebts.some(d => Number(d.interest_rate) > 0);
    
    // Estimativa de compromisso mensal baseado na média de parcelas ou simples divisão
    const totalMonthsCurrent = Math.max(...pendingDebts.map(d => {
        if (d.total_installments && d.installment_number) {
            return d.total_installments - d.installment_number + 1;
        }
        return 1;
    }), 1);

    const avgMonthlyCommitment = totalBalance / totalMonthsCurrent;

    const generateData = (monthlyExtra) => {
      let activeDebts = pendingDebts.map(d => ({
          ...d, 
          currentBalance: Number(d.amount),
          rate: Number(d.interest_rate || 0) / 100
      }));
      
      // Ordenação estratégica
      if (strategy === 'snowball') {
          activeDebts.sort((a, b) => a.currentBalance - b.currentBalance);
      } else if (strategy === 'avalanche') {
          activeDebts.sort((a, b) => b.rate - a.rate || b.currentBalance - a.currentBalance);
      }

      let month = 0;
      let totalInterestPaid = 0;
      const data = [{ month: 0, balance: totalBalance }];
      const totalPayment = avgMonthlyCommitment + monthlyExtra;

      while (activeDebts.some(d => d.currentBalance > 1) && month < 480) {
        month++;
        let monthlyInterestTotal = 0;
        let remainingPayment = totalPayment;

        // 1. Aplica juros a todas as dívidas ativas
        activeDebts.forEach(d => {
            if (d.currentBalance > 0) {
                const interest = d.currentBalance * d.rate;
                monthlyInterestTotal += interest;
                d.currentBalance += interest;
            }
        });
        totalInterestPaid += monthlyInterestTotal;

        // 2. Aplica o pagamento disponível na ordem da estratégia
        for (let d of activeDebts) {
            if (d.currentBalance > 0) {
                const payment = Math.min(d.currentBalance, remainingPayment);
                d.currentBalance -= payment;
                remainingPayment -= payment;
                if (remainingPayment <= 0) break;
            }
        }
        
        const currentTotalBalance = activeDebts.reduce((acc, curr) => acc + curr.currentBalance, 0);
        data.push({ 
          month, 
          balance: Math.max(0, currentTotalBalance),
          label: format(addMonths(new Date(), month), 'MMM yy', { locale: ptBR })
        });
        if (currentTotalBalance <= 0) break;
      }
      return { data, totalMonths: month, totalInterestPaid };
    };

    const scenarioCurrent = generateData(0);
    const scenarioExtra = generateData(Number(extraAmount));

    // Calcula economia financeira
    const moneySaved = Math.max(0, scenarioCurrent.totalInterestPaid - scenarioExtra.totalInterestPaid);
    const monthsSaved = Math.max(0, scenarioCurrent.totalMonths - scenarioExtra.totalMonths);

    // Combina dados para o gráfico
    const maxMonths = Math.max(scenarioCurrent.totalMonths, scenarioExtra.totalMonths);
    const chartData = [];
    
    for (let i = 0; i <= maxMonths + 1; i++) {
      const currentPoint = scenarioCurrent.data[i];
      const extraPoint = scenarioExtra.data[i];
      
      if (!currentPoint && !extraPoint) break;

      chartData.push({
        name: currentPoint?.label || extraPoint?.label || '',
        "Caminho Atual": currentPoint ? currentPoint.balance : 0,
        "Caminho com Pagamento Extra": extraPoint ? extraPoint.balance : 0
      });
    }

    return {
      totalBalance,
      hasInterest,
      currentMonths: scenarioCurrent.totalMonths,
      extraMonths: scenarioExtra.totalMonths,
      moneySaved,
      monthsSaved,
      chartData
    };
  }, [pendingDebts, extraAmount]);

  if (!simulation) return null;

  return (
    <div className="relative group/sim">
      {/* Container Principal */}
      <div className={cn(
        "bg-fin-surface border border-zinc-900/10 dark:border-white/5 rounded-[32px] p-8 shadow-2xl transition-all duration-700",
        !isPremium && "blur-[6px] pointer-events-none select-none"
      )}>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Lado Esquerdo: Inputs e Resumo */}
          <div className="lg:w-1/3 space-y-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-fin-mint">
                <Zap size={20} fill="currentColor" />
                <h3 className="text-xl font-black uppercase tracking-tight italic">
                  Simulador de Liberdade
                </h3>
              </div>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                {strategy === 'snowball' ? 'Otimizado: Método Bola de Neve (pagar menor valor primeiro)' : 
                 strategy === 'avalanche' ? 'Otimizado: Método Avalanche (pagar maior juro primeiro)' : 
                 'Descubra como pequenos valores extras aceleram sua quitação'}
              </p>
            </div>

            <div className="group">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-fin-mint transition-colors">
                Quanto você pode pagar a mais por mês?
              </label>
              <div className="relative">
                 <MoneyInput 
                    value={extraAmount}
                    onChange={setExtraAmount}
                    className="w-full h-16 bg-zinc-100 dark:bg-black/20 border-none rounded-2xl px-6 text-2xl font-black focus:ring-4 focus:ring-fin-mint/10 transition-all dark:text-white"
                 />
                 <div className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-fin-mint/10 rounded-xl text-fin-mint">
                    <Sparkles size={20} />
                 </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
               <SummaryCard 
                 icon={<Calendar size={16} />}
                 label="Quitação Estimada"
                 value={format(addMonths(new Date(), simulation.extraMonths), "MMMM 'de' yyyy", { locale: ptBR })}
                 subValue={`${simulation.extraMonths} meses restantes`}
               />
               
               {simulation.hasInterest ? (
                 <SummaryCard 
                   icon={<Sparkles size={16} />}
                   label="Total de Dinheiro Economizado"
                   value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(simulation.moneySaved)}
                   subValue={`${simulation.monthsSaved} meses antecipados`}
                   highlight
                 />
               ) : (
                 <SummaryCard 
                   icon={<TrendingDown size={16} />}
                   label="Antecipação de Liberdade"
                   value={`${simulation.monthsSaved} meses`}
                   subValue="Tempo a menos de preocupação no orçamento"
                   highlight
                 />
               )}
            </div>
          </div>

          {/* Lado Direito: Gráfico */}
          <div className="lg:w-2/3 h-[400px] bg-zinc-100/50 dark:bg-black/20 rounded-[32px] p-6 border border-zinc-900/5 dark:border-white/5 relative">
            <div className="absolute top-6 left-6 z-10">
               <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                  <Info size={10} /> Projeção de Saldo Devedor
               </p>
            </div>
            
            <ResponsiveContainer width="100%" height="100%" minHeight={300}>
              <AreaChart data={simulation.chartData}>
                <defs>
                  <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#71717a" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#71717a" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExtra" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00ffa3" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#00ffa3" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700 }} 
                  dy={10}
                />
                <YAxis 
                  hide 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#18181b', 
                    border: 'none', 
                    borderRadius: '16px',
                    fontSize: '12px',
                    fontWeight: 700,
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)'
                  }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="Caminho Atual" 
                  stroke="#71717a" 
                  fillOpacity={1} 
                  fill="url(#colorCurrent)" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
                <Area 
                  type="monotone" 
                  dataKey="Caminho com Pagamento Extra" 
                  stroke="#00ffa3" 
                  fillOpacity={1} 
                  fill="url(#colorExtra)" 
                  strokeWidth={4}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Overlay de Paywall */}
      {!isPremium && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 z-20 text-center animate-in zoom-in duration-500">
           <div className="w-20 h-20 rounded-3xl bg-fin-bg border border-fin-mint/30 flex items-center justify-center mb-6 shadow-2xl shadow-fin-mint/20">
              <Lock size={32} className="text-fin-mint" />
           </div>
           <h2 className="text-3xl font-black text-zinc-900 dark:text-white mb-2 italic uppercase">
              Recurso <span className="text-fin-mint">Premium</span>
           </h2>
           <p className="text-zinc-500 font-bold max-w-sm mb-8">
              Visualize exatamente quando você ficará livre das dívidas com nossa simulação avançada de amortização.
           </p>
           <Button 
             variant="primary" 
             size="lg" 
             className="px-10 h-16 rounded-2xl shadow-fin-mint/30"
             onClick={() => window.location.href = '/pricing'}
           >
              Liberar Simulador Inteligente <ArrowRight size={20} className="ml-2" />
           </Button>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ icon, label, value, subValue, highlight }) {
  return (
    <div className={cn(
      "p-5 rounded-2xl border transition-all duration-300",
      highlight 
        ? "bg-fin-mint/5 border-fin-mint/20 text-fin-mint" 
        : "bg-zinc-100 dark:bg-black/10 border-zinc-200 dark:border-white/5"
    )}>
      <div className="flex items-center gap-2 mb-2">
        <div className={cn("p-1.5 rounded-lg", highlight ? "bg-fin-mint/10" : "bg-zinc-200 dark:bg-white/5")}>
          {icon}
        </div>
        <span className="text-[9px] font-black uppercase tracking-widest opacity-60">{label}</span>
      </div>
      <p className="text-lg font-black dark:text-white leading-none mb-1">{value}</p>
      <p className="text-[9px] font-bold opacity-40 uppercase">{subValue}</p>
    </div>
  );
}
