import React, { useState, useMemo } from "react";
import { 
  ArrowDownLeft, 
  ArrowRightLeft, 
  ArrowUpRight, 
  BarChart3, 
  CheckCircle2, 
  LineChart as LineChartIcon,
  Tag, 
  Wallet,
  Target,
  TrendingUp,
  PieChart as PieChartIcon,
  Sparkles,
  AlertCircle
} from "lucide-react";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  ReferenceLine
} from "recharts";

import { motion } from "framer-motion";

import { COLORS } from "../constants/theme";
import { format, parseISO, isPast, isToday, endOfMonth, subMonths, addDays, isAfter, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from "../utils/classNames";
import { useFinStore } from '../store/useFinStore';

import { usePremiumReports } from "../hooks/usePremiumReports";
import LoadingState from "../components/ui/LoadingState";
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";
import { getTransactionEffectiveDate } from "../utils/utils";

export default function ReportsView() {
  const { data, user, selectedProfile, transactions, categories, accounts, cards, userPlan } = useFinStore();
  
  const [reportType, setReportType] = useState("monthly");
  const [refDate, setRefDate] = useState(new Date());
  const [projectionDays, setProjectionDays] = useState(30);

  const { 
    budgetData, 
    goalsData, 
    loading: loadingPremium, 
    fetchBudgetsReport, 
    fetchGoalsReport 
  } = usePremiumReports();

  // Busca os dados premium no carregamento inicial
  React.useEffect(() => {
    fetchBudgetsReport();
    fetchGoalsReport();
  }, [fetchBudgetsReport, fetchGoalsReport]);

  const profileTransactions = useMemo(
    () =>
      transactions.filter(
        (t) => t.user_id === selectedProfile?.id && !t.ignore_in_reports,
      ),
    [transactions, selectedProfile],
  );
  const profileCategories = useMemo(
    () => categories.filter((c) => c.user_id === selectedProfile?.id),
    [categories, selectedProfile],
  );
  const profileAccounts = useMemo(
    () => accounts.filter((a) => a.user_id === selectedProfile?.id),
    [accounts, selectedProfile],
  );
  const profileCards = useMemo(
    () => cards.filter((c) => c.user_id === selectedProfile?.id),
    [cards, selectedProfile],
  );

  // 1. Fluxo de Caixa (Receitas vs Despesas) - Últimos 6 meses
  const incomeVsExpenses = useMemo(() => {
    const last6Months = Array.from({ length: 6 })
      .map((_, i) => subMonths(new Date(), i))
      .reverse();
    return last6Months.map((monthDate) => {
      const targetMonth = format(monthDate, "yyyy-MM");
      const monthTxs = profileTransactions?.filter((t) => {
        const effectiveDate = getTransactionEffectiveDate(t, cards);
        return format(effectiveDate, "yyyy-MM") === targetMonth;
      }) || [];
      
      return {
        month: format(monthDate, "MMM yy", { locale: ptBR }),
        income: monthTxs
          .filter((t) => t.type === "Income")
          .reduce((s, t) => s + Number(t.amount || 0), 0),
        expenses: monthTxs
          .filter((t) => t.type === "Expense")
          .reduce((s, t) => s + Number(t.amount || 0), 0),
      };
    });
  }, [profileTransactions, cards]);

  // 2. Receitas por Categoria
  const incomeByCategory = useMemo(() => {
    const currentMonthStr = format(new Date(), "yyyy-MM");
    const monthTxs =
      profileTransactions?.filter((t) => {
        const effectiveDate = getTransactionEffectiveDate(t, cards);
        return format(effectiveDate, "yyyy-MM") === currentMonthStr && t.type === "Income";
      }) || [];
    const categoriesMap =
      profileCategories?.reduce((acc, cat) => {
        acc[cat.id] = cat.name;
        return acc;
      }, {}) || {};

    const agg = monthTxs.reduce((acc, t) => {
      const name = categoriesMap[t.category_id] || "Outros";
      acc[name] = (acc[name] || 0) + Number(t.amount || 0);
      return acc;
    }, {});

    return Object.entries(agg)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [profileTransactions, profileCategories, cards]);

  // 3. Despesas por Categoria
  const expensesByCategory = useMemo(() => {
    const currentMonthStr = format(new Date(), "yyyy-MM");
    const monthTxs =
      profileTransactions?.filter((t) => {
        const effectiveDate = getTransactionEffectiveDate(t, cards);
        return format(effectiveDate, "yyyy-MM") === currentMonthStr && t.type === "Expense";
      }) || [];
    const categoriesMap =
      profileCategories?.reduce((acc, cat) => {
        acc[cat.id] = cat.name;
        return acc;
      }, {}) || {};

    const agg = monthTxs.reduce((acc, t) => {
      const name = categoriesMap[t.category_id] || "Outros";
      acc[name] = (acc[name] || 0) + Number(t.amount || 0);
      return acc;
    }, {});

    return Object.entries(agg)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [profileTransactions, profileCategories, cards]);

  // 4. Despesas Fixas vs Variáveis
  const fixedVsVariable = useMemo(() => {
    const currentMonthStr = format(new Date(), "yyyy-MM");
    const monthTxs = profileTransactions.filter((t) => {
      const effectiveDate = getTransactionEffectiveDate(t, cards);
      return format(effectiveDate, "yyyy-MM") === currentMonthStr && t.type === "Expense";
    });

    const fixed = monthTxs
      .filter((t) => t.is_fixed)
      .reduce((s, t) => s + Number(t.amount), 0);
    const variable = monthTxs
      .filter((t) => !t.is_fixed)
      .reduce((s, t) => s + Number(t.amount), 0);

    return [
      { name: "Fixas", value: fixed, color: "#98e5dd" },
      { name: "Variáveis", value: variable, color: "#ff7b7b" },
    ];
  }, [profileTransactions, cards]);

  // 5. Evolução do Saldo
  const balanceEvolution = useMemo(() => {
    const last12Months = Array.from({ length: 12 })
      .map((_, i) => subMonths(new Date(), i))
      .reverse();

    return last12Months.map((monthDate) => {
      const monthStr = format(monthDate, "yyyy-MM");
      const monthTxs = profileTransactions.filter((t) => {
        const effectiveDate = getTransactionEffectiveDate(t, cards);
        return format(effectiveDate, "yyyy-MM") === monthStr;
      });

      const income = monthTxs
        .filter((t) => t.type === "Income")
        .reduce((s, t) => s + Number(t.amount), 0);
      const expense = monthTxs
        .filter((t) => t.type === "Expense")
        .reduce((s, t) => s + Number(t.amount), 0);
      const balance = income - expense;

      return {
        month: format(monthDate, "MMM yy", { locale: ptBR }),
        saldo: balance,
        receitas: income,
        despesas: expense,
      };
    });
  }, [profileTransactions, cards]);

  // 6. Saldo por Conta
  const balanceByAccount = useMemo(() => {
    return profileAccounts
      .map((acc) => ({
        name: acc.name,
        saldo:
          acc.current_balance !== undefined
            ? acc.current_balance
            : acc.initial_balance,
      }))
      .sort((a, b) => b.saldo - a.saldo);
  }, [profileAccounts]);

  // 7. Contas a Pagar
  const accountsPayable = useMemo(() => {
    return profileTransactions
      .filter((t) => t.type === "Expense" && t.status === "Pending")
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 10);
  }, [profileTransactions]);

  // 8. Contas a Receber
  const accountsReceivable = useMemo(() => {
    return profileTransactions
      .filter((t) => t.type === "Income" && t.status === "Pending")
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 10);
  }, [profileTransactions]);

  // 9. Relatório de Cartão de Crédito
  const cardReport = useMemo(() => {
    const currentMonthStr = format(new Date(), "yyyy-MM");
    const monthTxs = profileTransactions.filter((t) => {
      const effectiveDate = getTransactionEffectiveDate(t, cards);
      return format(effectiveDate, "yyyy-MM") === currentMonthStr && t.type === "Expense" && t.card_id;
    });

    const byCard = monthTxs.reduce((acc, t) => {
      const card = profileCards.find((c) => c.id === t.card_id);
      const cardName = card ? card.name : "Cartão Desconhecido";
      acc[cardName] = (acc[cardName] || 0) + Number(t.amount);
      return acc;
    }, {});

    return Object.entries(byCard).map(([name, value]) => ({ name, value }));
  }, [profileTransactions, profileCards, cards]);

  // 10. Limite Utilizado do Cartão
  const cardLimitUsage = useMemo(() => {
    const today = new Date();
    return profileCards.map((card) => {
      // Determinar período do ciclo de fatura atual
      let cycleStartDate, cycleEndDate;
      
      if (card.closing_day) {
        const currentMonth = today.getMonth(); // 0-indexed
        const currentYear = today.getFullYear();
        const closingDay = card.closing_day;
        const dueDay = card.due_day || 1;
        const closingInPreviousMonth = closingDay >= dueDay;
        
        if (closingInPreviousMonth) {
          cycleEndDate = new Date(currentYear, currentMonth - 1, closingDay - 1);
        } else {
          cycleEndDate = new Date(currentYear, currentMonth, closingDay - 1);
        }
        
        // Se já passou do fechamento, avançar para o próximo ciclo
        if (today > cycleEndDate) {
          cycleStartDate = new Date(cycleEndDate);
          cycleStartDate.setDate(cycleStartDate.getDate() + 1);
          cycleEndDate = new Date(cycleStartDate);
          cycleEndDate.setMonth(cycleEndDate.getMonth() + 1);
          cycleEndDate.setDate(cycleEndDate.getDate() - 1);
        } else {
          cycleStartDate = new Date(cycleEndDate);
          cycleStartDate.setMonth(cycleStartDate.getMonth() - 1);
          cycleStartDate.setDate(cycleStartDate.getDate() + 1);
        }
      } else {
        cycleStartDate = new Date(today.getFullYear(), today.getMonth(), 1);
        cycleEndDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      }
      
      const cycleStartStr = format(cycleStartDate, 'yyyy-MM-dd');
      const cycleEndStr = format(cycleEndDate, 'yyyy-MM-dd');

      // 1) Todas as despesas do ciclo atual (fixas + parceladas + avulsas)
      const currentCycleTxs = profileTransactions.filter((t) => {
        return t.type === "Expense" && 
               t.card_id === card.id &&
               t.date >= cycleStartStr &&
               t.date <= cycleEndStr;
      });
      const currentCycleTotal = currentCycleTxs.reduce((s, t) => s + Number(t.amount), 0);

      // 2) Todas as despesas futuras NÃO-FIXAS (após ciclo atual)
      const futureNonFixed = profileTransactions.filter((t) => {
        return t.type === "Expense" && 
               t.card_id === card.id &&
               t.date > cycleEndStr &&
               !t.is_fixed;
      });
      const futureNonFixedTotal = futureNonFixed.reduce((s, t) => s + Number(t.amount), 0);

      const totalSpent = currentCycleTotal + futureNonFixedTotal;
      const limit = card.limit || 5000;
      const usagePercentage = limit > 0 ? (totalSpent / limit) * 100 : 0;

      return {
        name: card.name,
        gasto: totalSpent,
        limite: limit,
        utilizacao: usagePercentage,
      };
    });
  }, [profileTransactions, profileCards, cards]);

  // 11. Metas Financeiras (Insights de Saúde)
  const financialGoals = useMemo(() => {
    const currentMonthStr = format(new Date(), "yyyy-MM");
    const monthTxs = profileTransactions.filter((t) => {
      const effectiveDate = getTransactionEffectiveDate(t, cards);
      return format(effectiveDate, "yyyy-MM") === currentMonthStr;
    });

    const totalIncome = monthTxs
      .filter((t) => t.type === "Income")
      .reduce((s, t) => s + Number(t.amount || 0), 0);

    const totalExpense = monthTxs
      .filter((t) => t.type === "Expense")
      .reduce((s, t) => s + Number(t.amount || 0), 0);

    const savingsRate =
      totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

    // Cálculo de Médias para Objetivos Dinâmicos
    const last3Months = Array.from({ length: 3 })
      .map((_, i) => subMonths(new Date(), i + 1));
    
    let histInc = 0;
    let histExp = 0;
    
    last3Months.forEach(monthDate => {
      const mStr = format(monthDate, "yyyy-MM");
      const mTxs = profileTransactions.filter((t) => {
        const effectiveDate = getTransactionEffectiveDate(t, cards);
        return format(effectiveDate, "yyyy-MM") === mStr;
      });
      histInc += mTxs.filter(t => t.type === 'Income').reduce((s, t) => s + Number(t.amount || 0), 0);
      histExp += mTxs.filter(t => t.type === 'Expense').reduce((s, t) => s + Number(t.amount || 0), 0);
    });

    const avgIncome = histInc / 3;
    const avgExpense = histExp / 3;
    const totalBudget = budgetData.reduce((s, b) => s + Number(b.budget_amount || 0), 0);

    return [
      {
        meta: "Taxa de Poupança",
        description: "Percentual da sua renda que você conseguiu guardar este mês.",
        atual: savingsRate.toFixed(1),
        objetivo: 20,
        unidade: "%",
        isBenchmark: true
      },
      {
        meta: "Receita Mensal",
        description: "Total de ganhos capturados. O objetivo é superar sua média recente.",
        atual: totalIncome,
        objetivo: avgIncome > 0 ? avgIncome : 10000,
        unidade: "R$",
        isAverage: avgIncome > 0
      },
      {
        meta: "Despesas Controladas",
        description: "Total de gastos. O objetivo é manter-se dentro dos planejamentos ou média.",
        atual: totalExpense,
        objetivo: totalBudget > 0 ? totalBudget : (avgExpense > 0 ? avgExpense : 7000),
        unidade: "R$",
        isBudget: totalBudget > 0,
        isAverage: !totalBudget && avgExpense > 0
      },
    ];
  }, [profileTransactions, budgetData, cards]);

  // 11.1 Analista Virtual (Insights de IA)
  const virtualAnalystInsights = useMemo(() => {
    const now = new Date();
    const currentMonthStr = format(now, "yyyy-MM");
    const lastMonth = subMonths(now, 1);
    const lastMonthStr = format(lastMonth, "yyyy-MM");

    const currentTxs = profileTransactions.filter((t) => {
      const effectiveDate = getTransactionEffectiveDate(t, cards);
      return format(effectiveDate, "yyyy-MM") === currentMonthStr && t.type === 'Expense';
    });
    const prevTxs = profileTransactions.filter((t) => {
      const effectiveDate = getTransactionEffectiveDate(t, cards);
      return format(effectiveDate, "yyyy-MM") === lastMonthStr && t.type === 'Expense';
    });

    const catMap = profileCategories.reduce((acc, c) => ({ ...acc, [c.id]: c.name }), {});

    const getCatAgg = (txs) => txs.reduce((acc, t) => {
      const name = catMap[t.category_id] || 'Outros';
      acc[name] = (acc[name] || 0) + Number(t.amount);
      return acc;
    }, {});

    const currentAgg = getCatAgg(currentTxs);
    const prevAgg = getCatAgg(prevTxs);

    const insights = [];

    // Alerta de Aumento por Categoria
    Object.keys(currentAgg).forEach(cat => {
      const current = currentAgg[cat];
      const prev = prevAgg[cat] || 0;
      if (prev > 100 && current > prev * 1.2) {
        const diffPercent = (((current - prev) / prev) * 100).toFixed(0);
        insights.push({
          type: 'warning',
          title: `Aumento em ${cat}`,
          text: `Seus gastos em ${cat} subiram ${diffPercent}% em relação ao mês passado.`,
          icon: 'TrendingUp'
        });
      }
    });

    // Gasto Diário Ideal
    const totalBudget = budgetData.reduce((s, b) => s + Number(b.budget_amount || 0), 0);
    const totalSpent = currentTxs.reduce((s, t) => s + Number(t.amount), 0);
    
    if (totalBudget > 0) {
      const remainingDays = endOfMonth(now).getDate() - now.getDate() + 1;
      const dailyLimit = Math.max(0, (totalBudget - totalSpent) / remainingDays);
      insights.push({
        type: 'info',
        title: 'Meta de Gasto Diário',
        text: dailyLimit > 0 
          ? `Para manter seu orçamento, o ideal é gastar no máximo R$ ${dailyLimit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} por dia.`
          : 'Você já atingiu o limite planejado para este mês. Tente reduzir gastos não essenciais.',
        icon: 'Target',
        value: dailyLimit
      });
    }

    // Insight de Equilíbrio
    const monthIncome = profileTransactions
      .filter((t) => {
        const effectiveDate = getTransactionEffectiveDate(t, cards);
        return format(effectiveDate, "yyyy-MM") === currentMonthStr && t.type === 'Income';
      })
      .reduce((s, t) => s + Number(t.amount), 0);
    
    if (totalSpent > monthIncome && monthIncome > 0) {
      insights.push({
        type: 'danger',
        title: 'Atenção ao Saldo',
        text: 'Suas despesas deste mês já superaram suas receitas. Cuidado com o endividamento.',
        icon: 'AlertCircle'
      });
    } else if (totalSpent < monthIncome * 0.5 && now.getDate() > 15) {
       insights.push({
         type: 'success',
         title: 'Excelente Controle',
         text: 'Você gastou menos da metade da sua renda e já passamos da metade do mês!',
         icon: 'CheckCircle2'
       });
    }

    return insights;
  }, [profileTransactions, profileCategories, budgetData]);
  
  // 12.1 Projeção de Fluxo de Caixa (30, 60, 90, 120 dias)
  const cashFlowProjectionData = useMemo(() => {
    const today = startOfDay(new Date());
    const endDate = addDays(today, projectionDays);
    
    // Saldo Inicial: Soma dos saldos atuais das contas líquidas
    let runningBalance = profileAccounts.reduce((s, a) => 
      s + Number(a.current_balance !== undefined ? a.current_balance : a.initial_balance), 0
    );

    // Ajuste por transações atrasadas (Pending no passado)
    const overdueAmount = profileTransactions
      .filter(t => t.status === 'Pending' && isPast(parseISO(t.date)) && !isToday(parseISO(t.date)))
      .reduce((s, t) => {
        if (t.type === 'Income') return s + Number(t.amount);
        if (t.type === 'Expense' && !t.card_id) return s - Number(t.amount);
        return s;
      }, 0);
    
    runningBalance += overdueAmount;

    const data = [];
    let currentDate = today;

    // Mapear transações futuras (apenas as pendentes, já que as pagas já afetam o saldo atual)
    const futureTxs = profileTransactions.filter(t => 
       (isAfter(parseISO(t.date), today) || isToday(parseISO(t.date))) && t.status === 'Pending'
    );

    while (currentDate <= endDate) {
      const dateStr = format(currentDate, "yyyy-MM-dd");
      
      // Transações do dia (que não são cartão)
      const dayTxs = futureTxs.filter(t => t.date === dateStr && !t.card_id);
      
      const dayIncome = dayTxs.filter(t => t.type === 'Income').reduce((s, t) => s + Number(t.amount), 0);
      const dayExpense = dayTxs.filter(t => t.type === 'Expense').reduce((s, t) => s + Number(t.amount), 0);

      // Simulação Simplificada de Fatura de Cartão
      let cardPayments = 0;
      profileCards.forEach(card => {
        if (card.due_day && currentDate.getDate() === card.due_day) {
          const cardTxs = futureTxs.filter(t => t.card_id === card.id && format(parseISO(t.date), 'MM-yyyy') === format(currentDate, 'MM-yyyy'));
          cardPayments += cardTxs.reduce((s, t) => s + Number(t.amount), 0);
        }
      });

      runningBalance += (dayIncome - dayExpense - cardPayments);

      data.push({
        date: format(currentDate, "dd/MM"),
        fullDate: dateStr,
        balance: runningBalance,
        income: dayIncome,
        expense: dayExpense + cardPayments
      });

      currentDate = addDays(currentDate, 1);
    }

    return data;
  }, [profileTransactions, profileAccounts, profileCards, projectionDays]);

  // 12. Comparação Mensal de Receitas e Despesas
  const monthlyComparison = useMemo(() => {
    const last3Months = Array.from({ length: 3 })
      .map((_, i) => subMonths(new Date(), i))
      .reverse();
    return last3Months.map((monthDate) => {
      const monthStr = format(monthDate, "yyyy-MM");
      const monthTxs = profileTransactions.filter((t) => {
        const effectiveDate = getTransactionEffectiveDate(t, cards);
        return format(effectiveDate, "yyyy-MM") === monthStr;
      });
      return {
        month: format(monthDate, "MMM yy", { locale: ptBR }),
        receitas: monthTxs
          .filter((t) => t.type === "Income")
          .reduce((s, t) => s + Number(t.amount), 0),
        despesas: monthTxs
          .filter((t) => t.type === "Expense")
          .reduce((s, t) => s + Number(t.amount), 0),
      };
    });
  }, [profileTransactions, cards]);

  const reportComponents = {
    "fluxo-caixa": (
      <div className="bg-fin-surface p-7 rounded-[24px] border border-zinc-900/10 dark:border-white/5 shadow-2xl">
        <h3 className="text-lg font-bold mb-6 text-zinc-900 dark:text-white">
          Fluxo de Caixa (Últimos 6 Meses)
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={incomeVsExpenses}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#ffffff0a"
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#71717a", fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#71717a", fontSize: 12 }}
              />
              <Tooltip
                cursor={{ fill: "transparent" }}
                formatter={(value) => Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                contentStyle={{
                  backgroundColor: "#1a1c1c",
                  borderRadius: "16px",
                  border: "1px solid rgba(255,255,255,0.05)",
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                }}
                itemStyle={{ color: "#f4f4f5", fontWeight: 600 }}
              />
              <Legend
                iconType="circle"
                wrapperStyle={{ fontSize: "12px", color: "#9ca3af" }}
              />
              <Bar
                dataKey="income"
                fill="#6cb888"
                radius={[4, 4, 0, 0]}
                name="Receitas"
              />
              <Bar
                dataKey="expenses"
                fill="#ff7b7b"
                radius={[4, 4, 0, 0]}
                name="Despesas"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    ),
    "receitas-categoria": (
      <div className="bg-fin-surface p-7 rounded-[24px] border border-zinc-900/10 dark:border-white/5 shadow-2xl">
        <h3 className="text-lg font-bold mb-6 text-zinc-900 dark:text-white">
          Receitas por Categoria (Mês Atual)
        </h3>
        <div className="h-80">
          {incomeByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={incomeByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {incomeByCategory.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  contentStyle={{
                    backgroundColor: "#1a1c1c",
                    borderRadius: "16px",
                    border: "1px solid rgba(255,255,255,0.05)",
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                  }}
                  itemStyle={{ color: "#f4f4f5", fontWeight: 600 }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ fontSize: "12px", color: "#9ca3af" }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500">
              <ArrowUpRight size={32} className="mb-2 opacity-50" />
              <p className="text-sm font-medium">Nenhuma receita este mês</p>
            </div>
          )}
        </div>
      </div>
    ),
    "despesas-categoria": (
      <div className="bg-fin-surface p-7 rounded-[24px] border border-zinc-900/10 dark:border-white/5 shadow-2xl">
        <h3 className="text-lg font-bold mb-6 text-zinc-900 dark:text-white">
          Despesas por Categoria (Mês Atual)
        </h3>
        <div className="h-80">
          {expensesByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expensesByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {expensesByCategory.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  contentStyle={{
                    backgroundColor: "#1a1c1c",
                    borderRadius: "16px",
                    border: "1px solid rgba(255,255,255,0.05)",
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                  }}
                  itemStyle={{ color: "#f4f4f5", fontWeight: 600 }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ fontSize: "12px", color: "#9ca3af" }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500">
              <ArrowDownLeft size={32} className="mb-2 opacity-50" />
              <p className="text-sm font-medium">Nenhuma despesa este mês</p>
            </div>
          )}
        </div>
      </div>
    ),
    "fixas-vs-variaveis": (
      <div className="bg-fin-surface p-7 rounded-[24px] border border-zinc-900/10 dark:border-white/5 shadow-2xl">
        <h3 className="text-lg font-bold mb-6 text-zinc-900 dark:text-white">
          Despesas Fixas vs Variáveis (Mês Atual)
        </h3>
        <div className="h-80">
          {fixedVsVariable.some((item) => item.value > 0) ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={fixedVsVariable}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {fixedVsVariable.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  cursor={{ fill: "transparent" }}
                  formatter={(value) => Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  contentStyle={{
                    backgroundColor: "#1a1c1c",
                    borderRadius: "16px",
                    border: "1px solid rgba(255,255,255,0.05)",
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                  }}
                  itemStyle={{ color: "#f4f4f5", fontWeight: 600 }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ fontSize: "12px", color: "#9ca3af" }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500">
              <Tag size={32} className="mb-2 opacity-50" />
              <p className="text-sm font-medium">Nenhuma despesa este mês</p>
            </div>
          )}
        </div>
      </div>
    ),
    "projecao-caixa": (
      <div className="bg-fin-surface p-7 rounded-[24px] border border-zinc-900/10 dark:border-white/5 shadow-2xl overflow-hidden relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Projeção de Fluxo de Caixa</h3>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Saldo projetado para os próximos {projectionDays} dias</p>
          </div>
          
          <div className="flex bg-zinc-100 dark:bg-black/40 p-1 rounded-xl border border-zinc-900/5 dark:border-white/5">
            {[30, 60, 90, 120].map(d => (
              <button
                key={d}
                onClick={() => setProjectionDays(d)}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                  projectionDays === d 
                    ? "bg-fin-mint text-zinc-900 shadow-md" 
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                )}
              >
                {d}D
              </button>
            ))}
          </div>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={cashFlowProjectionData}>
              <defs>
                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6cb888" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6cb888" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorBalanceNeg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff7b7b" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ff7b7b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff0a" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: "#71717a", fontSize: 10 }}
                interval={projectionDays === 30 ? 4 : projectionDays === 60 ? 9 : 14}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: "#71717a", fontSize: 10 }}
                tickFormatter={(v) => `R$ ${v >= 1000 ? (v/1000).toFixed(0)+'k' : v}`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: "#1a1c1c",
                  borderRadius: "16px",
                  border: "1px solid rgba(255,255,255,0.05)",
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                }}
                itemStyle={{ color: "#f4f4f5", fontWeight: 600, fontSize: '12px' }}
                labelStyle={{ color: "#71717a", marginBottom: '4px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' }}
                formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Saldo Projetado']}
              />
              <ReferenceLine y={0} stroke="#ff7b7b" strokeDasharray="3 3" opacity={0.5} />
              <Area 
                type="monotone" 
                dataKey="balance" 
                stroke="#6cb888" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorBalance)" 
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {cashFlowProjectionData.some(d => d.balance < 0) && (
          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4 animate-pulse">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-red-500 shrink-0">
               <AlertCircle size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-red-500 uppercase tracking-tight">Alerta de Caixa</p>
              <p className="text-[10px] text-zinc-500 leading-tight mt-0.5">Detectamos que seu saldo projetado ficará negativo em alguns períodos. Reveja seus gastos ou antecipe receitas.</p>
            </div>
          </div>
        )}
      </div>
    ),
    "evolucao-saldo": (
      <div className="bg-fin-surface p-7 rounded-[24px] border border-zinc-900/10 dark:border-white/5 shadow-2xl">
        <h3 className="text-lg font-bold mb-6 text-zinc-900 dark:text-white">
          Evolução do Saldo (Últimos 12 Meses)
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={balanceEvolution}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#ffffff0a"
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#71717a", fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#71717a", fontSize: 12 }}
              />
              <Tooltip
                formatter={(value) => Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                contentStyle={{
                  backgroundColor: "#1a1c1c",
                  borderRadius: "16px",
                  border: "1px solid rgba(255,255,255,0.05)",
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                }}
                itemStyle={{ color: "#f4f4f5", fontWeight: 600 }}
              />
              <Legend
                iconType="circle"
                wrapperStyle={{ fontSize: "12px", color: "#9ca3af" }}
              />
              <Line
                type="monotone"
                dataKey="saldo"
                stroke={user?.theme_color || "#98e5dd"}
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                name="Saldo"
              />
              <Line
                type="monotone"
                dataKey="receitas"
                stroke="#6cb888"
                strokeWidth={2}
                dot={{ r: 3 }}
                name="Receitas"
              />
              <Line
                type="monotone"
                dataKey="despesas"
                stroke="#ff7b7b"
                strokeWidth={2}
                dot={{ r: 3 }}
                name="Despesas"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    ),
    "saldo-contas": (
      <div className="bg-fin-surface p-7 rounded-[24px] border border-zinc-900/10 dark:border-white/5 shadow-2xl">
        <h3 className="text-lg font-bold mb-6 text-zinc-900 dark:text-white">
          Saldo por Conta
        </h3>
        <div className="h-80">
          {balanceByAccount.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={balanceByAccount}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#ffffff0a"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#71717a", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#71717a", fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: "transparent" }}
                  formatter={(value) => Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  contentStyle={{
                    backgroundColor: "#1a1c1c",
                    borderRadius: "16px",
                    border: "1px solid rgba(255,255,255,0.05)",
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                  }}
                  itemStyle={{ color: "#f4f4f5", fontWeight: 600 }}
                />
                <Bar
                  dataKey="saldo"
                  fill={user?.theme_color || "#98e5dd"}
                  radius={[4, 4, 0, 0]}
                  name="Saldo"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500">
              <Wallet size={32} className="mb-2 opacity-50" />
              <p className="text-sm font-medium">Nenhuma conta cadastrada</p>
            </div>
          )}
        </div>
      </div>
    ),
    "budgets": (
      <div className="bg-fin-surface p-7 rounded-[24px] border border-zinc-900/10 dark:border-white/5 shadow-2xl relative overflow-hidden">
        <h3 className="text-lg font-bold mb-6 text-zinc-900 dark:text-white flex items-center gap-2">
          Controle de Planejamentos <span className="text-xs bg-fin-mint/10 text-fin-mint px-2 py-0.5 rounded-full uppercase tracking-widest font-black">Premium</span>
        </h3>
        
        {userPlan !== 'premium' ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-fin-mint/10 text-fin-mint rounded-2xl flex items-center justify-center mb-4">
              <BarChart3 size={32} />
            </div>
            <h4 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Relatórios Avançados Bloqueados</h4>
            <p className="text-zinc-500 max-w-xs mb-6">Desbloqueie o plano Premium para cruzar seus planejamentos com os gastos reais em tempo real.</p>
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('requireUpgrade', { detail: 'Os Relatórios de Planejamento são exclusivos do Plano Premium.' }))}
              className="bg-fin-mint text-fin-bg px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform"
            >
              Fazer Upgrade Agora
            </button>
          </div>
        ) : loadingPremium ? (
          <LoadingState 
            message="Cruzando dados de planejamentos..." 
            minHeight="200px" 
          />
        ) : budgetData.length > 0 ? (
          <div className="space-y-8">
            {budgetData.map((budget) => {
              const exceeds = budget.percentage > 100;
              const baseColor = exceeds ? "text-red-500" : "text-fin-mint";
              const barColor = exceeds ? "bg-red-500" : "bg-fin-mint";
              
              return (
                <div key={budget.id} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">{budget.category_name}</h4>
                        {budget.is_fixed && (
                          <span className="text-[10px] bg-fin-mint/10 text-fin-mint px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Fixo</span>
                        )}
                        {budget.type === 'percentage' && (
                          <span className="text-[10px] bg-fin-peach/10 text-fin-peach px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">{budget.percentage_rule}%</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-black text-zinc-900 dark:text-white">
                          R$ {Number(budget.actual_spent).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-xs text-zinc-500">de R$ {Number(budget.budget_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                    <div className={cn("text-right font-black italic text-lg", baseColor)}>
                      {Math.round(budget.percentage)}%
                    </div>
                  </div>
                  
                  <div className="h-4 bg-zinc-200/50 dark:bg-black/40 rounded-full overflow-hidden border border-zinc-900/10 dark:border-white/5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(budget.percentage, 100)}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={cn("h-full rounded-full shadow-[0_0_15px_rgba(0,0,0,0.5)]", barColor)}
                    />
                  </div>
                  
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                    <span>{exceeds ? 'Limite excedido!' : 'Dentro do limite'}</span>
                    <span>Restam: R$ {Math.max(0, budget.remaining).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-zinc-500">
            <p className="text-sm font-medium">Você ainda não configurou planejamentos para este mês.</p>
          </div>
        )}
      </div>
    ),
    "goals": (
      <div className="bg-fin-surface p-7 rounded-[24px] border border-zinc-900/10 dark:border-white/5 shadow-2xl">
        <h3 className="text-lg font-bold mb-6 text-zinc-900 dark:text-white flex items-center gap-2">
          Progresso das Metas <span className="text-xs bg-fin-mint/10 text-fin-mint px-2 py-0.5 rounded-full uppercase tracking-widest font-black">Premium</span>
        </h3>

        {userPlan !== 'premium' ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-fin-mint/10 text-fin-mint rounded-2xl flex items-center justify-center mb-4">
              <CheckCircle2 size={32} />
            </div>
            <h4 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Relatórios de Metas Bloqueados</h4>
            <p className="text-zinc-500 max-w-xs mb-6">Acompanhe visualmente a evolução dos seus sonhos e objetivos financeiros com barras de progresso avançadas.</p>
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('requireUpgrade', { detail: 'O acompanhamento de Metas é exclusivo do Plano Premium.' }))}
              className="bg-fin-mint text-fin-bg px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform"
            >
              Fazer Upgrade Agora
            </button>
          </div>
        ) : loadingPremium ? (
           <LoadingState 
             message="Calculando progresso das metas..." 
             minHeight="200px" 
           />
        ) : goalsData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {goalsData.map((goal) => (
              <div key={goal.id} className="p-5 rounded-2xl bg-zinc-200/50 dark:bg-white/5 border border-zinc-900/10 dark:border-white/5 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-lg" style={{ backgroundColor: `${goal.color}20`, color: goal.color }}>
                    <Target size={18} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-zinc-900 dark:text-white">{goal.name}</h4>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Alvo: R$ {Number(goal.target_amount).toLocaleString('pt-BR')}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black italic" style={{ color: goal.color }}>{Math.round(goal.percentage)}%</span>
                  </div>
                </div>

                <div className="h-3 bg-zinc-300 dark:bg-black/40 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(goal.percentage, 100)}%` }}
                    transition={{ duration: 1.2, ease: "backOut" }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: goal.color }}
                  />
                </div>

                <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  <span>R$ {Number(goal.current_amount).toLocaleString('pt-BR')} guardados</span>
                  {goal.is_completed && <span className="text-fin-mint flex items-center gap-1"><CheckCircle2 size={10} /> Concluída</span>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-zinc-500">
            <p className="text-sm font-medium">Você ainda não criou nenhuma meta financeira.</p>
          </div>
        )}
      </div>
    ),
    "insights": (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {financialGoals.map((g, i) => (
          <div key={i} className="bg-fin-surface p-6 rounded-[24px] border border-zinc-900/10 dark:border-white/5 shadow-xl relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              {g.meta.includes('Poupança') ? <TrendingUp size={64} /> : g.meta.includes('Receita') ? <ArrowUpRight size={64} /> : <ArrowDownLeft size={64} />}
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-1">{g.meta}</p>
            <p className="text-[9px] text-zinc-400 mb-3 leading-tight">{g.description}</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-zinc-900 dark:text-white">
                {g.unidade === 'R$' ? `R$ ${Number(g.atual).toLocaleString('pt-BR')}` : `${g.atual}${g.unidade}`}
              </span>
            </div>
            <div className="mt-4 flex flex-col gap-2">
               <div className="flex items-center justify-between text-[10px] font-bold">
                 <span className="text-zinc-500 uppercase">
                   {g.isBenchmark ? "Benchmark: " : g.isBudget ? "Planejado: " : "Média: "}
                   {g.unidade === 'R$' ? `R$ ${g.objetivo.toLocaleString('pt-BR')}` : `${g.objetivo}${g.unidade}`}
                 </span>
                 <span className={cn(
                   "uppercase",
                   (g.meta.includes('Despesas') ? Number(g.atual) <= g.objetivo : Number(g.atual) >= g.objetivo) ? "text-fin-mint" : "text-zinc-500"
                 )}>
                   {(g.meta.includes('Despesas') ? Number(g.atual) <= g.objetivo : Number(g.atual) >= g.objetivo) ? (g.meta.includes('Despesas') ? "Sob controle ✨" : "Atingido ✨") : "Em progresso"}
                 </span>
               </div>
               <div className="h-1.5 bg-zinc-900/10 dark:bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all duration-1000",
                      g.meta.includes('Despesas') 
                        ? (Number(g.atual) <= g.objetivo ? "bg-fin-mint" : "bg-red-500 shadow-[0_0_10px_#ef4444]") 
                        : (Number(g.atual) >= g.objetivo ? "bg-fin-mint" : "bg-fin-mint/40")
                    )}
                    style={{ width: `${Math.min((Number(g.atual) / g.objetivo) * 100, 100)}%` }}
                  />
               </div>
            </div>
          </div>
        ))}
      </div>
    ),
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <PageHeader
        icon={BarChart3}
        title="Relatórios Analíticos"
        subtitle="Visualize a saúde financeira do seu patrimônio em tempo real."
        colorClass="text-fin-mint"
        bgClass="bg-fin-mint/10"
        borderClass="border-fin-mint/20"
        actions={
          <div className="flex items-center bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/5 rounded-2xl p-1 shadow-sm h-12">
            {["monthly", "premium"].map((type) => (
              <button
                key={type}
                onClick={() => setReportType(type)}
                className={cn(
                  "px-6 h-full rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300",
                  reportType === type
                    ? "bg-fin-mint text-zinc-900 shadow-lg shadow-fin-mint/20"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                )}
              >
                {type === "monthly" ? "Mensal" : "Insights"}
              </button>
            ))}
          </div>
        }
      />

      <motion.div 
        key={reportType}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-12"
      >
        {reportType === "monthly" ? (
          <>
            <section className="space-y-6">
              <div className="flex items-center gap-2 text-zinc-400 dark:text-zinc-500">
                <LineChartIcon size={20} />
                <h3 className="text-sm font-bold uppercase tracking-widest">Fluxo de Caixa Mensal</h3>
              </div>
              <div className="grid grid-cols-1 gap-6">
                {reportComponents["fluxo-caixa"]}
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-2 text-zinc-400 dark:text-zinc-500">
                <PieChartIcon size={20} />
                <h3 className="text-sm font-bold uppercase tracking-widest">Distribuição por Categoria</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {reportComponents["despesas-categoria"]}
                {reportComponents["receitas-categoria"]}
                {reportComponents["fixas-vs-variaveis"]}
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-2 text-zinc-400 dark:text-zinc-500">
                <BarChart3 size={20} />
                <h3 className="text-sm font-bold uppercase tracking-widest">Planejamentos e Saldos</h3>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {reportComponents["budgets"]}
                {reportComponents["saldo-contas"]}
              </div>
            </section>
          </>
        ) : (
          <>
            <section className="space-y-6">
              <div className="flex items-center gap-2 text-zinc-400 dark:text-zinc-500">
                <Sparkles size={20} className="text-fin-mint" />
                <h3 className="text-sm font-bold uppercase tracking-widest">Analista Virtual FinTrack</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {virtualAnalystInsights.map((insight, index) => (
                  <div key={index} className={cn(
                    "p-6 rounded-[24px] border shadow-xl relative overflow-hidden group transition-all duration-300 hover:scale-[1.02]",
                    insight.type === 'warning' ? "bg-amber-500/5 border-amber-500/20" :
                    insight.type === 'danger' ? "bg-red-500/5 border-red-500/20" :
                    insight.type === 'success' ? "bg-fin-mint/5 border-fin-mint/20" :
                    "bg-fin-blue/5 border-fin-blue/20"
                  )}>
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center mb-4 shadow-lg",
                      insight.type === 'warning' ? "bg-amber-500/20 text-amber-500" :
                      insight.type === 'danger' ? "bg-red-500/20 text-red-500" :
                      insight.type === 'success' ? "bg-fin-mint/20 text-fin-mint" :
                      "bg-fin-blue/20 text-fin-blue"
                    )}>
                      {insight.icon === 'TrendingUp' ? <TrendingUp size={20} /> :
                       insight.icon === 'AlertCircle' ? <AlertCircle size={20} /> :
                       insight.icon === 'CheckCircle2' ? <CheckCircle2 size={20} /> :
                       <Target size={20} />}
                    </div>
                    
                    <h4 className={cn(
                      "text-sm font-black uppercase tracking-tight mb-2",
                      insight.type === 'warning' ? "text-amber-500" :
                      insight.type === 'danger' ? "text-red-500" :
                      insight.type === 'success' ? "text-fin-mint" :
                      "text-fin-blue"
                    )}>
                      {insight.title}
                    </h4>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-bold">
                      {insight.text}
                    </p>
                    
                    {insight.value !== undefined && (
                      <div className="mt-4 pt-4 border-t border-zinc-900/5 dark:border-white/5">
                        <span className="text-2xl font-black text-zinc-900 dark:text-white">
                           R$ {insight.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-[9px] text-zinc-500 font-bold uppercase ml-2">/ dia</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-2 text-zinc-400 dark:text-zinc-500">
                <TrendingUp size={20} />
                <h3 className="text-sm font-bold uppercase tracking-widest">Insights Estratégicos</h3>
              </div>
              {reportComponents["insights"]}
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-2 text-zinc-400 dark:text-zinc-500">
                <TrendingUp size={20} />
                <h3 className="text-sm font-bold uppercase tracking-widest">Projeção de Fluxo de Caixa</h3>
              </div>
              <div className="grid grid-cols-1 gap-6">
                {reportComponents["projecao-caixa"]}
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-2 text-zinc-400 dark:text-zinc-500">
                <LineChartIcon size={20} />
                <h3 className="text-sm font-bold uppercase tracking-widest">Análise de Tendência (12 Meses)</h3>
              </div>
              <div className="grid grid-cols-1 gap-6">
                {reportComponents["evolucao-saldo"]}
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-2 text-zinc-400 dark:text-zinc-500">
                <Target size={20} />
                <h3 className="text-sm font-bold uppercase tracking-widest">Evolução dos Objetivos</h3>
              </div>
              <div className="grid grid-cols-1 gap-6">
                {reportComponents["goals"]}
              </div>
            </section>
          </>
        )}
      </motion.div>
    </div>
  );
}
