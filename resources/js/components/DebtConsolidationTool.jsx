import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  ArrowRight, 
  Sparkles, 
  AlertTriangle, 
  TrendingDown, 
  CreditCard,
  Target,
  ChevronDown,
  Info
} from 'lucide-react';
import { cn } from '../utils/classNames';
import MoneyInput from './ui/MoneyInput';

export default function DebtConsolidationTool({ debts }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loanRate, setLoanRate] = useState(2.0); // % a.m.
  const [term, setTerm] = useState(12); // months

  const pendingDebts = useMemo(() => debts.filter(d => d.status === 'Pending'), [debts]);

  const consolidation = useMemo(() => {
    if (pendingDebts.length === 0) return null;

    const rate = loanRate / 100;
    
    // Identifica candidatos: Dívidas com taxa maior que a do novo empréstimo
    const candidates = pendingDebts.filter(d => Number(d.interest_rate || 0) > loanRate);
    const others = pendingDebts.filter(d => Number(d.interest_rate || 0) <= loanRate);

    const totalToConsolidate = candidates.reduce((acc, curr) => acc + Number(curr.amount), 0);
    
    if (totalToConsolidate === 0) return { 
        candidates: [], 
        totalToConsolidate: 0,
        pmt: 0,
        savings: 0,
        totalNewInterest: 0,
        totalCurrentInterestEst: 0,
        hasSavings: false
    };

    // Cálculo da Nova Parcela (PRICE)
    // PMT = P * [r(1+r)^n] / [(1+r)^n - 1]
    const pmt = totalToConsolidate * (rate * Math.pow(1 + rate, term)) / (Math.pow(1 + rate, term) - 1);
    const totalNewCost = pmt * term;
    const totalNewInterest = totalNewCost - totalToConsolidate;

    // Estimativa do Custo Atual das Dívidas Candidatas
    // Para simplificar, estimamos o custo total se pagassem o juro atual até quitarem (aproximado pelo prazo médio ou 12 meses)
    const totalCurrentInterestEst = candidates.reduce((acc, d) => {
        const dRate = Number(d.interest_rate || 0) / 100;
        const dTerm = (d.total_installments && d.installment_number) 
            ? (d.total_installments - d.installment_number + 1)
            : 12; // Fallback para 12 meses
        
        // Simulação básica PRICE reversa ou juros simples sobre saldo decrescente
        // Vamos usar juros simples sobre saldo médio p/ estimativa rápida de economia
        const estInterest = Number(d.amount) * dRate * (dTerm / 2);
        return acc + estInterest;
    }, 0);

    const savings = Math.max(0, totalCurrentInterestEst - totalNewInterest);

    return {
      candidates,
      totalToConsolidate,
      pmt,
      totalNewInterest,
      totalCurrentInterestEst,
      savings,
      hasSavings: savings > 0
    };
  }, [pendingDebts, loanRate, term]);

  if (!consolidation) return null;

  return (
    <div className="mt-8 bg-fin-surface border border-zinc-900/10 dark:border-white/5 rounded-[32px] overflow-hidden transition-all duration-500 shadow-2xl">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-8 flex items-center justify-between hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors group"
      >
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Calculator size={24} />
           </div>
           <div className="text-left">
              <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase italic tracking-tight">
                Simulador de Consolidação
              </h3>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                 {consolidation.candidates.length > 0 
                   ? `Identificamos ${consolidation.candidates.length} dívidas ideais para trocar por um juro menor`
                   : 'Compare suas dívidas com uma nova proposta de crédito'}
              </p>
           </div>
        </div>
        <ChevronDown className={cn("text-zinc-400 transition-transform duration-500", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="p-8 pt-0 animate-in slide-in-from-top-4 duration-500">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-8 border-t border-zinc-900/5 dark:border-white/5">
              {/* Painel de Input */}
              <div className="space-y-8">
                 <div className="space-y-4">
                    <h4 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-[0.2em] flex items-center gap-2">
                       <CreditCard size={14} className="text-indigo-500" /> Nova Oferta de Crédito
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                       <div className="group">
                          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-indigo-500 transition-colors">
                            Taxa de Juros (% a.m.)
                          </label>
                          <div className="relative">
                            <input 
                              type="number" 
                              step="0.1"
                              value={loanRate}
                              onChange={(e) => setLoanRate(Number(e.target.value))}
                              className="w-full h-14 bg-zinc-100 dark:bg-black/20 border-none rounded-2xl px-4 text-xl font-black focus:ring-4 focus:ring-indigo-500/10 transition-all dark:text-white"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">%</div>
                          </div>
                       </div>
                       
                       <div className="group">
                          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-indigo-500 transition-colors">
                            Prazo (Meses)
                          </label>
                          <div className="relative">
                            <input 
                              type="number" 
                              value={term}
                              onChange={(e) => setTerm(Number(e.target.value))}
                              className="w-full h-14 bg-zinc-100 dark:bg-black/20 border-none rounded-2xl px-4 text-xl font-black focus:ring-4 focus:ring-indigo-500/10 transition-all dark:text-white"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold uppercase text-[9px]">meses</div>
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Dívidas Candidatas */}
                 <div className="space-y-4">
                    <h4 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-[0.2em] flex items-center gap-2">
                       <Target size={14} className="text-indigo-500" /> Dívidas para Quitar
                    </h4>
                    <div className="space-y-2">
                       {consolidation.candidates.length > 0 ? (
                         consolidation.candidates.map(d => (
                           <div key={d.id} className="flex items-center justify-between p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl">
                              <div>
                                 <p className="text-sm font-black text-zinc-900 dark:text-white">{d.description}</p>
                                 <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">{d.interest_rate}% juros a.m.</p>
                              </div>
                              <p className="text-sm font-black text-zinc-900 dark:text-white">R$ {Number(d.amount).toLocaleString('pt-BR')}</p>
                           </div>
                         ))
                       ) : (
                         <div className="p-8 text-center bg-zinc-100 dark:bg-black/10 rounded-2xl border border-dashed border-zinc-900/10 dark:border-white/5">
                            <Info size={24} className="mx-auto text-zinc-500 mb-3" />
                            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest italic">Nenhuma dívida com juros superiores à nova taxa</p>
                         </div>
                       )}
                    </div>
                 </div>
              </div>

              {/* Resultado da Simulação */}
              <div className="bg-zinc-100 dark:bg-black/20 rounded-[32px] p-8 border border-zinc-900/5 dark:border-white/5 flex flex-col justify-between">
                 <div className="space-y-8">
                    <div>
                       <div className="flex items-center gap-2 text-indigo-500 mb-2">
                          <Sparkles size={20} fill="currentColor" />
                          <h4 className="text-lg font-black uppercase italic tracking-tight">Resultado Esperado</h4>
                       </div>
                       <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-relaxed">
                          Ao unificar essas {consolidation.candidates.length} dívidas em um único empréstimo mais barato:
                       </p>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                       <ResultItem 
                         label="Nova Parcela Mensal"
                         value={`R$ ${consolidation.pmt.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                         subValue={`por ${term} meses`}
                       />
                       <ResultItem 
                         label="Economia Estimada"
                         value={`R$ ${consolidation.savings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                         subValue="em juros não pagos às operadoras atuais"
                         highlight
                       />
                    </div>
                 </div>

                 {consolidation.hasSavings ? (
                   <div className="mt-8 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-start gap-3">
                      <TrendingDown className="text-emerald-500 shrink-0 mt-0.5" size={18} />
                      <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500/80 uppercase tracking-widest leading-normal">
                         Esta consolidação faz sentido! Você trocará juros altos por um fôlego no orçamento.
                      </p>
                   </div>
                 ) : consolidation.candidates.length > 0 ? (
                   <div className="mt-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-3">
                      <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={18} />
                      <p className="text-[10px] font-bold text-amber-600 dark:text-amber-500/80 uppercase tracking-widest leading-normal">
                         Cuidado: O prazo longo pode tornar o juro total mais caro, mesmo com parcela menor. Verifique o Custo Efetivo Total (CET).
                      </p>
                   </div>
                 ) : null}
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

function ResultItem({ label, value, subValue, highlight }) {
    return (
        <div>
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-1">{label}</p>
            <p className={cn("text-3xl font-black leading-none", highlight ? "text-emerald-500" : "dark:text-white")}>{value}</p>
            {subValue && <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-1.5">{subValue}</p>}
        </div>
    );
}
