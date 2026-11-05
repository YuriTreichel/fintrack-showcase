import React, { useState, useMemo, useEffect, useCallback } from "react";
import { format, parseISO, isPast, isToday, endOfMonth, subMonths, addDays, isAfter, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Wallet,
  LineChart as LineChartIcon,
  ArrowUpRight,
  ArrowDownLeft,
  Filter,
  LayoutDashboard,
  Tag,
  PiggyBank,
  Scale,
  CheckCircle2,
  Clock,
  ExternalLink,
  ArrowRightLeft,
  ListTree,
  Sparkles,
  Target,
  TrendingUp,
  PieChart as PieChartIcon,
  BarChart3,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  SlidersHorizontal,
  GripVertical,
  Columns
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  AreaChart,
  Area,
  ReferenceLine,
} from "recharts";
import { motion } from "framer-motion";
import { cn } from "../utils/classNames";
import { COLORS } from "../constants/theme";
import StatCard from "../components/ui/StatCard";
import TransactionRow from "../components/ui/TransactionRow";
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";
import { useFinStore } from '../store/useFinStore';
import QuickEffectiveModal from "../modals/QuickEffectiveModal";
import OnboardingChecklist from "../components/ui/OnboardingChecklist";
import LoadingState from "../components/ui/LoadingState";
import { usePremiumReports } from "../hooks/usePremiumReports";
import { getTransactionEffectiveDate } from "../utils/utils";

function CategoryTreeList({ roots, totalAmount, onNavigate, refDate, type }) {
  const renderNode = (node, depth = 0) => {
    const percentage = totalAmount > 0 ? (node.totalValue / totalAmount) * 100 : 0;
    
    return (
      <React.Fragment key={node.id}>
        <div 
          onClick={() =>
            onNavigate &&
            onNavigate("transactions", {
              type: type,
              month: format(refDate, "yyyy-MM"),
              category: node.id,
            })
          }
          className={cn(
            "flex items-center justify-between py-1.5 px-2 text-sm rounded-xl transition-all cursor-pointer group hover:bg-zinc-900/5 dark:hover:bg-white/5",
            depth > 0 ? "ml-5 pl-3 border-l border-zinc-200 dark:border-zinc-800" : "font-semibold"
          )}
        >
          <div className="flex items-center gap-2 min-w-0">
            {depth === 0 ? (
              <div 
                className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" 
                style={{ backgroundColor: node.color || '#ccc' }} 
              />
            ) : (
              <span className="text-zinc-300 dark:text-zinc-700 font-mono text-xs select-none">└─</span>
            )}
            <span className={cn(
              "truncate tracking-tight text-xs",
              depth === 0 
                ? "text-zinc-900 dark:text-zinc-100" 
                : "text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-200"
            )}>
              {node.name}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0 font-mono text-[11px]">
            <span className={cn(
              "font-bold",
              depth === 0 
                ? "text-zinc-900 dark:text-white" 
                : "text-zinc-600 dark:text-zinc-400"
            )}>
              R$ {node.totalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-zinc-400 dark:text-zinc-500 w-11 text-right font-medium">
              {percentage.toFixed(1)}%
            </span>
          </div>
        </div>
        {node.children.map(child => renderNode(child, depth + 1))}
      </React.Fragment>
    );
  };

  return (
    <div className="space-y-0.5 max-h-[260px] overflow-y-auto custom-scrollbar pr-1">
      {roots.map(root => renderNode(root))}
    </div>
  );
}

export default function Dashboard({ fetchData, showToast, onEdit, onNavigate, searchTerm }) {
  const { data, transactions, accounts, categories, cards, budgets, goals, user, selectedProfile } = useFinStore();
  
  const getEffectiveDate = (t) => getTransactionEffectiveDate(t, cards);
  const [isOverduePopoverOpen, setIsOverduePopoverOpen] = useState(false);
  const [quickEffectiveTransaction, setQuickEffectiveTransaction] = useState(null);
  const [isChecklistDismissed, setIsChecklistDismissed] = useState(localStorage.getItem('onboarding_dismissed') === 'true');
  const [manualTasks, setManualTasks] = useState(() => {
    const saved = localStorage.getItem('onboarding_manual_completed');
    return saved ? JSON.parse(saved) : [];
  });

  const handleDismissChecklist = () => {
    localStorage.setItem('onboarding_dismissed', 'true');
    setIsChecklistDismissed(true);
  };

  const handleToggleManualTask = (taskId) => {
    const newManual = manualTasks.includes(taskId)
      ? manualTasks.filter(id => id !== taskId)
      : [...manualTasks, taskId];
    
    setManualTasks(newManual);
    localStorage.setItem('onboarding_manual_completed', JSON.stringify(newManual));
  };
  useEffect(() => {
    // 1. Lê a URL atual
    const params = new URLSearchParams(window.location.search);

    // 2. Verifica se o parâmetro de sucesso existe
    if (params.get("payment") === "success") {
      // 3. Mostra a mensagem de sucesso para o cliente (pode trocar por um Toast bonito)
      showToast("🎉 Pagamento aprovado! Bem-vindo ao Fintrack Pro!", "success");

      // 4. A MÁGICA: Limpa a URL feia sem recarregar a página!
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);
  const profileTransactions = useMemo(
    () =>
      transactions.filter(
        (t) => t.user_id === selectedProfile?.id && !t.ignore_in_reports,
      ),
    [transactions, selectedProfile],
  );

  const profileAccounts = useMemo(
    () => accounts.filter((a) => a.user_id === selectedProfile?.id),
    [accounts, selectedProfile],
  );
  const profileCategories = useMemo(
    () => categories.filter((c) => c.user_id === selectedProfile?.id),
    [categories, selectedProfile],
  );

  const profileCards = useMemo(
    () => cards.filter((c) => c.user_id === selectedProfile?.id),
    [cards, selectedProfile],
  );

  const [refDate, setRefDate] = useState(new Date());
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(new Date().getFullYear());

  const handlePrevMonth = () => {
    setRefDate(new Date(refDate.getFullYear(), refDate.getMonth() - 1, 1));
  };
  const handleNextMonth = () => {
    setRefDate(new Date(refDate.getFullYear(), refDate.getMonth() + 1, 1));
  };

  const monthTxs = profileTransactions.filter((t) => {
    const d = getEffectiveDate(t);
    return (
      d.getMonth() === refDate.getMonth() &&
      d.getFullYear() === refDate.getFullYear()
    );
  });

  const mIncome = monthTxs
    .filter((t) => t.type === "Income")
    .reduce((s, t) => s + Number(t.amount), 0);
  const mExpense = monthTxs
    .filter((t) => t.type === "Expense")
    .reduce((s, t) => s + Number(t.amount), 0);

  const dailySpendingGoal = useMemo(() => {
    const now = new Date();
    if (now.getMonth() !== refDate.getMonth() || now.getFullYear() !== refDate.getFullYear()) return null;
    
    const totalBudget = profileTransactions
      .filter(t => t.date.startsWith(format(now, "yyyy-MM")) && t.type === 'Expense')
      .reduce((s, t) => s + Number(t.amount), 0); // Aqui usaríamos budgetData se estivesse disponível no dashboard
    
    // Como budgetData não está no Dashboard por padrão, vamos buscar a média de gastos se o plano for básico
    // ou simplesmente usar o saldo projetado do mês se for premium.
    // Mas para simplificar e manter a consistência, vamos usar o saldo projetado vs dias restantes.
    const remainingDays = endOfMonth(now).getDate() - now.getDate() + 1;
    const remainingBudget = Math.max(0, mIncome - mExpense);
    return {
      limit: remainingBudget / remainingDays,
      days: remainingDays
    };
  }, [mIncome, mExpense, refDate]);
  const mBalance = mIncome - mExpense;

  const pendingIncome = monthTxs
    .filter((t) => t.type === "Income" && t.status === "Pending")
    .filter((t) => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        t.description.toLowerCase().includes(term) ||
        (t.category_name && t.category_name.toLowerCase().includes(term))
      );
    });
  const pendingExpense = monthTxs
    .filter((t) => t.type === "Expense" && t.status === "Pending")
    .filter((t) => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        t.description.toLowerCase().includes(term) ||
        (t.category_name && t.category_name.toLowerCase().includes(term))
      );
    });

  const overdueTransactions = useMemo(() => 
    profileTransactions.filter(
      (t) =>
        t.status === "Pending" &&
        isPast(getEffectiveDate(t)) &&
        !isToday(getEffectiveDate(t)),
    ).sort((a, b) => getEffectiveDate(b) - getEffectiveDate(a)),
    [profileTransactions, cards]
  );

  const overdueCount = overdueTransactions.length;

  const totalAccountsBalance =
    profileAccounts?.reduce(
      (acc, curr) =>
        acc +
        parseFloat(
          curr.current_balance !== undefined
            ? curr.current_balance
            : curr.initial_balance,
        ),
      0,
    ) || 0;

  const endOfSelectedMonth = endOfMonth(refDate);
  const today = new Date();
  const isCurrentOrFutureMonth = 
    refDate.getFullYear() > today.getFullYear() ||
    (refDate.getFullYear() === today.getFullYear() && refDate.getMonth() >= today.getMonth());

  let projectedBalance = 0;

  if (isCurrentOrFutureMonth) {
    // For current/future months: Start from the actual current balance of the accounts
    // and apply pending/unpaid incomes and expenses up to the end of the selected month.
    const pendingIncomes = profileTransactions
      .filter((t) => t.type === "Income" && t.status === "Pending" && getEffectiveDate(t) <= endOfSelectedMonth)
      .reduce((s, t) => s + Number(t.amount), 0);

    const pendingExpenses = profileTransactions
      .filter((t) => t.type === "Expense" && t.status === "Pending" && getEffectiveDate(t) <= endOfSelectedMonth)
      .reduce((s, t) => s + Number(t.amount), 0);

    projectedBalance = totalAccountsBalance + pendingIncomes - pendingExpenses;
  } else {
    // For past months: Keep historical calculation from initial balance
    const baseBalance =
      profileAccounts?.reduce(
        (s, a) => s + parseFloat(a.initial_balance || 0),
        0,
      ) || 0;

    const pastAndCurrentTxs = profileTransactions.filter((t) => {
      const d = getEffectiveDate(t);
      return d <= endOfSelectedMonth;
    });

    const totalIncomeUpToMonth = pastAndCurrentTxs
      .filter((t) => t.type === "Income")
      .reduce((s, t) => s + Number(t.amount), 0);
    const totalExpenseUpToMonth = pastAndCurrentTxs
      .filter((t) => t.type === "Expense")
      .reduce((s, t) => s + Number(t.amount), 0);

    projectedBalance = baseBalance + totalIncomeUpToMonth - totalExpenseUpToMonth;
  }

  // Generate Month-scoped Chart Data
  const categoriesObjectMap = useMemo(() => {
    return profileCategories?.reduce((acc, cat) => {
      acc[cat.id] = cat;
      return acc;
    }, {}) || {};
  }, [profileCategories]);

  const buildCategoryTree = (type) => {
    const typeTxs = monthTxs.filter((t) => t.type === type);
    const totalAmount = typeTxs.reduce((sum, t) => sum + Number(t.amount), 0);

    const agg = typeTxs.reduce((acc, t) => {
      const catId = t.category_id || "null";
      if (!acc[catId]) {
        const cat = categoriesObjectMap[catId];
        acc[catId] = {
          id: catId,
          name: cat?.name || "Outros",
          parent_id: cat?.parent_id || null,
          directValue: 0,
          totalValue: 0,
          children: [],
        };
      }
      acc[catId].directValue += Number(t.amount);
      return acc;
    }, {});

    const treeNodes = { ...agg };

    // Ensure parents exist
    Object.values(treeNodes).forEach(node => {
      let pid = node.parent_id;
      while (pid) {
        if (!treeNodes[pid]) {
          const parentCat = categoriesObjectMap[pid];
          treeNodes[pid] = {
            id: pid,
            name: parentCat ? parentCat.name : "Desconhecido",
            parent_id: parentCat?.parent_id || null,
            directValue: 0,
            totalValue: 0,
            children: [],
          };
        }
        pid = treeNodes[pid].parent_id;
      }
    });

    const roots = [];
    Object.values(treeNodes).forEach(node => {
      if (node.parent_id) {
        const parent = treeNodes[node.parent_id];
        if (parent) {
          if (!parent.children.some(c => c.id === node.id)) {
            parent.children.push(node);
          }
        } else {
          if (!roots.some(r => r.id === node.id)) {
            roots.push(node);
          }
        }
      } else {
        if (!roots.some(r => r.id === node.id)) {
          roots.push(node);
        }
      }
    });

    const calculateTotals = (node) => {
      let childSum = 0;
      node.children.forEach(child => {
        calculateTotals(child);
        childSum += child.totalValue;
      });
      node.totalValue = node.directValue + childSum;
    };

    roots.forEach(root => calculateTotals(root));

    const sortTree = (nodes) => {
      nodes.sort((a, b) => b.totalValue - a.totalValue);
      nodes.forEach(n => {
        if (n.children.length > 0) {
          sortTree(n.children);
        }
      });
    };
    sortTree(roots);

    const activeRoots = roots.filter(r => r.totalValue > 0);

    // Assign colors to activeRoots for PieChart
    activeRoots.forEach((r, idx) => {
      r.color = COLORS[idx % COLORS.length];
    });

    return { roots: activeRoots, totalAmount };
  };

  const { roots: expenseRoots, totalAmount: totalExpensesAmount } = useMemo(() => buildCategoryTree("Expense"), [monthTxs, categoriesObjectMap]);
  const { roots: incomeRoots, totalAmount: totalIncomeAmount } = useMemo(() => buildCategoryTree("Income"), [monthTxs, categoriesObjectMap]);

  const monthIncomeVsExpenses = [
    {
      month: format(refDate, "MMM yyyy", { locale: ptBR }),
      income: mIncome,
      expenses: mExpense,
      balance: mBalance,
    },
  ];

  // --- CUSTOMIZAÇÃO DE LAYOUT E GRÁFICOS DE RELATÓRIOS ---
  const { userPlan } = useFinStore();
  const { 
    budgetData, 
    goalsData, 
    loading: loadingPremium, 
    fetchBudgetsReport, 
    fetchGoalsReport 
  } = usePremiumReports();

  const [projectionDays, setProjectionDays] = useState(30);

  const DEFAULT_LAYOUT = useMemo(() => [
    { id: "onboarding", name: "Guia de Boas-vindas", visible: true, colSpan: 2 },
    { id: "stats", name: "Resumo Mensal (Saldos)", visible: true, colSpan: 2 },
    { id: "recent_transactions", name: "Transações Recentes", visible: true, colSpan: 2 },
    { id: "accounts_list", name: "Lista de Contas", visible: true, colSpan: 1 },
    { id: "pending_transactions", name: "Transações Pendentes", visible: true, colSpan: 1 },
    { id: "fluxo_caixa_mensal", name: "Fluxo de Caixa (Últimos 6 Meses)", visible: false, colSpan: 2 },
    { id: "despesas_categoria", name: "Despesas por Categoria", visible: false, colSpan: 1 },
    { id: "receitas_categoria", name: "Receitas por Categoria", visible: false, colSpan: 1 },
    { id: "fixas_vs_variaveis", name: "Despesas Fixas vs Variáveis", visible: false, colSpan: 1 },
    { id: "saldo_contas", name: "Saldo por Conta", visible: false, colSpan: 1 },
    { id: "budgets_report", name: "Controle de Planejamentos (Premium)", visible: false, colSpan: 2 },
    { id: "virtual_analyst_report", name: "Analista Virtual FinTrack", visible: false, colSpan: 2 },
    { id: "insights_report", name: "Insights Estratégicos", visible: false, colSpan: 2 },
    { id: "projecao_caixa", name: "Projeção de Fluxo de Caixa", visible: false, colSpan: 2 },
    { id: "evolucao_saldo", name: "Evolução do Saldo (Últimos 12 Meses)", visible: false, colSpan: 2 },
    { id: "goals_report", name: "Progresso das Metas (Premium)", visible: false, colSpan: 2 }
  ], []);

  const [layout, setLayout] = useState(() => {
    const key = `fintrack_dashboard_layout_${selectedProfile?.id || 'default'}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const merged = [...parsed];
        DEFAULT_LAYOUT.forEach(item => {
          if (!merged.some(m => m.id === item.id)) {
            merged.push(item);
          }
        });
        return merged;
      } catch (e) {
        return DEFAULT_LAYOUT;
      }
    }
    return DEFAULT_LAYOUT;
  });

  const [isCustomizeMode, setIsCustomizeMode] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);

  const handleDragStart = useCallback((e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    return false;
  }, []);

  const handleDragEnter = useCallback((e, targetIndex) => {
    if (draggedIndex === null || draggedIndex === targetIndex) return;
    
    setLayout(prev => {
      const newLayout = [...prev];
      const draggedItem = newLayout[draggedIndex];
      newLayout.splice(draggedIndex, 1);
      newLayout.splice(targetIndex, 0, draggedItem);
      return newLayout;
    });
    setDraggedIndex(targetIndex);
  }, [draggedIndex]);

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
  }, []);

  useEffect(() => {
    const key = `fintrack_dashboard_layout_${selectedProfile?.id || 'default'}`;
    localStorage.setItem(key, JSON.stringify(layout));
  }, [layout, selectedProfile]);

  const moveSection = useCallback((index, direction) => {
    const newLayout = [...layout];
    const targetIndex = index + direction;
    if (targetIndex >= 0 && targetIndex < newLayout.length) {
      const temp = newLayout[index];
      newLayout[index] = newLayout[targetIndex];
      newLayout[targetIndex] = temp;
      setLayout(newLayout);
    }
  }, [layout]);

  const toggleSectionVisibility = useCallback((id, visible) => {
    setLayout(prev => prev.map(item => item.id === id ? { ...item, visible } : item));
  }, []);

  const toggleSectionWidth = useCallback((id) => {
    setLayout(prev => prev.map(item => item.id === id ? { ...item, colSpan: (item.colSpan || 2) === 2 ? 1 : 2 } : item));
  }, []);

  const resetLayout = useCallback(() => {
    setLayout(DEFAULT_LAYOUT);
    showToast("Layout redefinido para o padrão!", "success");
  }, [DEFAULT_LAYOUT, showToast]);

  // Carrega relatórios premium caso ativados e plano seja premium
  useEffect(() => {
    if (userPlan === 'premium') {
      const isBudgetsActive = layout.some(item => item.id === 'budgets_report' && item.visible);
      const isGoalsActive = layout.some(item => item.id === 'goals_report' && item.visible);
      if (isBudgetsActive) fetchBudgetsReport();
      if (isGoalsActive) fetchGoalsReport();
    }
  }, [fetchBudgetsReport, fetchGoalsReport, userPlan, layout]);

  // Cálculos de dados de relatórios:
  // 1. Fluxo de Caixa (Últimos 6 Meses)
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

  // 7. Metas Financeiras (Insights de Saúde)
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
    const totalBudget = budgetData ? budgetData.reduce((s, b) => s + Number(b.budget_amount || 0), 0) : 0;

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

  // 8. Analista Virtual Insights
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

    const totalBudget = budgetData ? budgetData.reduce((s, b) => s + Number(b.budget_amount || 0), 0) : 0;
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

  // 9. Projeção de Fluxo de Caixa
  const cashFlowProjectionData = useMemo(() => {
    const today = startOfDay(new Date());
    const endDate = addDays(today, projectionDays);
    
    let runningBalance = profileAccounts.reduce((s, a) => 
      s + Number(a.current_balance !== undefined ? a.current_balance : a.initial_balance), 0
    );

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

    const futureTxs = profileTransactions.filter(t => 
       (isAfter(parseISO(t.date), today) || isToday(parseISO(t.date))) && t.status === 'Pending'
    );

    while (currentDate <= endDate) {
      const dateStr = format(currentDate, "yyyy-MM-dd");
      
      const dayTxs = futureTxs.filter(t => t.date === dateStr && !t.card_id);
      
      const dayIncome = dayTxs.filter(t => t.type === 'Income').reduce((s, t) => s + Number(t.amount), 0);
      const dayExpense = dayTxs.filter(t => t.type === 'Expense').reduce((s, t) => s + Number(t.amount), 0);

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
  // ---------------------------------------------------

  const renderWidget = (item, index) => {
    if (!item.visible) {
      if (!isCustomizeMode) return null;
      
      return (
        <div 
          key={item.id} 
          draggable={true}
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={handleDragOver}
          onDragEnter={(e) => handleDragEnter(e, index)}
          onDragEnd={handleDragEnd}
          className={cn(
            "transition-all duration-300 w-full relative",
            (item.colSpan || 2) === 1 ? "col-span-1" : "col-span-1 md:col-span-2",
            "border-2 border-dashed border-zinc-500/20 p-4 rounded-[20px] bg-zinc-100/5 dark:bg-white/[0.01] hover:border-zinc-500/40",
            draggedIndex === index && "opacity-40 scale-[0.98] border-fin-mint/50"
          )}
        >
          {/* Overlay para drag */}
          <div className="absolute inset-0 z-20 cursor-grab active:cursor-grabbing rounded-[20px] mr-24" />
          
          <div className="flex items-center justify-between relative z-30">
            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
              <GripVertical size={14} className="text-zinc-600 dark:text-zinc-500" />
              <span className="text-xs font-bold uppercase tracking-wider italic">{item.name} (Oculto)</span>
            </div>
            <button
              onClick={() => toggleSectionVisibility(item.id, true)}
              className="px-3.5 py-1.5 bg-fin-mint/10 hover:bg-fin-mint text-fin-mint hover:text-fin-bg rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-sm"
            >
              Exibir
            </button>
          </div>
        </div>
      );
    }

    const widgetContent = (() => {

      switch (item.id) {
        case "onboarding":
          return !isChecklistDismissed ? (
            <OnboardingChecklist 
              tasks={[
                { id: 'accounts', label: 'Criar conta', completed: accounts.length > 0 || manualTasks.includes('accounts'), icon: <Wallet size={20} /> },
                { id: 'income', label: 'Cadastrar receita', completed: transactions.some(t => t.type === 'Income') || manualTasks.includes('income'), icon: <ArrowDownLeft size={20} /> },
                { id: 'expense', label: 'Cadastrar despesa', completed: transactions.some(t => t.type === 'Expense') || manualTasks.includes('expense'), icon: <ArrowUpRight size={20} /> },
                { id: 'view_transactions', label: 'Visualizar transações', completed: manualTasks.includes('view_transactions'), icon: <ArrowRightLeft size={20} /> },
              ]}
              onNavigate={(id) => {
                if (id === 'income') return onEdit(null, 'Income');
                if (id === 'expense') return onEdit(null, 'Expense');
                if (id === 'accounts') return onNavigate('accounts');
                if (id === 'view_transactions') {
                  if (!manualTasks.includes('view_transactions')) handleToggleManualTask('view_transactions');
                  return onNavigate('transactions');
                }
              }}
              onDismiss={handleDismissChecklist}
              onToggleManual={handleToggleManualTask}
            />
          ) : isCustomizeMode ? (
            <div className="p-4 bg-zinc-100/50 dark:bg-zinc-800/10 rounded-2xl flex items-center justify-between text-zinc-400 border border-zinc-200 dark:border-zinc-800 w-full">
              <span className="text-xs font-bold uppercase tracking-wider italic">Checklist de Integração (Oculto/Ignorado)</span>
            </div>
          ) : null;

        case "stats":
          return (
            <div id="step-stats" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 w-full">
              <StatCard
                title="Balanço do Mês"
                value={mBalance}
                subtitle={mBalance >= 0 ? "Saldo Positivo" : "Saldo Negativo"}
                icon={
                  <Scale 
                    size={20} 
                    className={cn(
                      "transition-colors",
                      mBalance >= 0 ? "text-fin-mint" : "text-rose-500"
                    )} 
                  />
                }
                color="surface"
                className={cn(
                  "bg-fin-surface cursor-pointer hover:bg-zinc-900/5 dark:hover:bg-white/5",
                  mBalance < 0 && "border-rose-500/20"
                )}
              />
              <StatCard
                title={`Previsão (${format(refDate, "MMM", { locale: ptBR })})`}
                value={projectedBalance}
                subtitle="Projeção Fim do Mês"
                icon={<LineChartIcon size={20} className="text-[#a4bcf9]" />}
                color="surface"
                className="bg-fin-surface cursor-pointer hover:bg-zinc-900/5 dark:hover:bg-white/5"
                onClick={() =>
                  onNavigate &&
                  onNavigate("transactions", {
                    type: "all",
                    month: format(refDate, "yyyy-MM"),
                  })
                }
              />
              <StatCard
                title="Receita do Mês"
                value={mIncome}
                subtitle="Recebidas & Pendentes"
                icon={<ArrowUpRight size={24} className="text-fin-bg" />}
                color="mint"
                className="bg-fin-mint text-fin-bg cursor-pointer hover:brightness-110"
                onClick={() =>
                  onNavigate &&
                  onNavigate("transactions", {
                    type: "Income",
                    month: format(refDate, "yyyy-MM"),
                  })
                }
              />
              <StatCard
                title="Despesa do Mês"
                value={mExpense}
                subtitle="Pagas & Pendentes"
                icon={<ArrowDownLeft size={20} className="text-[#ff7b7b]" />}
                color="surface"
                className="cursor-pointer bg-fin-surface hover:bg-zinc-900/5 dark:hover:bg-white/5"
                onClick={() =>
                  onNavigate &&
                  onNavigate("transactions", {
                    type: "Expense",
                    month: format(refDate, "yyyy-MM"),
                  })
                }
              />
            </div>
          );

        case "recent_transactions":
          return (
            <div className="bg-fin-surface rounded-[24px] border border-zinc-900/10 dark:border-white/5 shadow-2xl overflow-hidden flex flex-col w-full">
              <div className="p-4 md:p-7 border-b border-zinc-900/10 dark:border-white/5 flex items-center justify-between">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                  Transações Recentes
                </h3>
                <button 
                  onClick={() => onNavigate && onNavigate("transactions")}
                  className="text-fin-mint font-semibold text-sm hover:text-zinc-900 dark:text-white transition-colors flex items-center gap-1"
                >
                  <Filter size={14} /> Filtrar
                </button>
              </div>
              <div className="divide-y divide-white/5 flex-1 overflow-y-auto min-h-[300px]">
                {profileTransactions.slice(0, 5).map((t) => (
                  <TransactionRow
                    key={t.id}
                    transaction={t}
                    onEdit={onEdit}
                    currentUser={user}
                    isReadOnly={selectedProfile?.id !== user?.id}
                  />
                ))}
              </div>
            </div>
          );

        case "accounts_list":
          return (
            <div className="bg-fin-surface rounded-[24px] border border-zinc-900/10 dark:border-white/5 shadow-2xl overflow-hidden flex flex-col w-full">
              <div className="p-4 md:p-7 border-b border-zinc-900/10 dark:border-white/5 flex flex-col gap-1">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Wallet size={20} className="text-fin-mint" /> Contas de{" "}
                  {selectedProfile?.name}
                </h3>
                <p className="text-sm text-zinc-500 font-semibold mt-2">
                  Saldo Global
                </p>
                <p className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                  <span className="text-lg text-zinc-600 dark:text-zinc-500 mr-1 opacity-80">
                    R$
                  </span>
                  {(Math.abs(totalAccountsBalance) < 0.005 ? 0 : Number(totalAccountsBalance)).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div className="p-5 flex-1 overflow-y-auto max-h-[350px] space-y-3 custom-scrollbar">
                {profileAccounts?.map((acc) => (
                  <div
                    key={acc.id}
                    className="p-4 bg-zinc-900/5 dark:bg-white/5 border border-zinc-900/10 dark:border-white/5 rounded-2xl flex items-center justify-between group hover:border-zinc-900/20 dark:hover:border-white/10 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-fin-mint/10 rounded-xl flex items-center justify-center text-fin-mint">
                        <Wallet size={16} />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-zinc-900 dark:text-white">
                          {acc.name}
                        </p>
                        <p className="text-[10px] uppercase font-bold text-zinc-500">
                          {acc.type === "Bank"
                            ? "Banco"
                            : acc.type === "Cash"
                              ? "Dinheiro"
                              : "Poupança"}
                        </p>
                      </div>
                    </div>
                    <p className="font-bold text-zinc-900 dark:text-white text-sm">
                      R${" "}
                      {(Math.abs(acc.current_balance !== undefined ? acc.current_balance : acc.initial_balance) < 0.005 
                        ? 0 
                        : Number(acc.current_balance !== undefined ? acc.current_balance : acc.initial_balance)
                      ).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                ))}
                {(!accounts || accounts.length === 0) && (
                  <div className="text-center py-8 text-zinc-500 text-sm">
                    Nenhuma conta cadastrada.
                  </div>
                )}
              </div>
            </div>
          );

        case "pending_transactions":
          return (pendingIncome.length > 0 || pendingExpense.length > 0) ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start w-full">
              {pendingIncome.length > 0 && (
                <div className="bg-fin-surface p-4 md:p-7 rounded-[24px] border border-zinc-900/10 dark:border-white/5 shadow-2xl">
                  <h3 className="text-lg font-bold text-fin-mint flex items-center gap-2 mb-4">
                    <ArrowUpRight size={20} /> Receitas Pendentes
                  </h3>
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    {pendingIncome.map((t) => (
                      <div
                        key={t.id}
                        className="flex justify-between items-center text-sm p-3 rounded-xl text-zinc-900 dark:bg-white/5 border border-zinc-900/10 dark:border-white/5 transition-all hover:border-zinc-900/20 dark:hover:border-white/10"
                      >
                        <div className="flex flex-col">
                          <span className="font-semibold text-zinc-900 dark:text-white">
                            {t.description}
                          </span>
                          <span className="text-xs text-zinc-500">
                            {format(parseISO(t.date), "dd MMM yyyy", {
                              locale: ptBR,
                            })}
                          </span>
                        </div>
                        <span className="font-bold text-fin-mint">
                          R${" "}
                          {Number(t.amount).toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {pendingExpense.length > 0 && (
                <div className="bg-fin-surface p-4 md:p-7 rounded-[24px] border border-zinc-900/10 dark:border-white/5 shadow-2xl">
                  <h3 className="text-lg font-bold text-[#ff7b7b] flex items-center gap-2 mb-4">
                    <ArrowDownLeft size={20} /> Despesas Pendentes
                  </h3>
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    {pendingExpense.map((t) => (
                      <div
                        key={t.id}
                        className="flex justify-between items-center text-sm p-3 rounded-xl text-zinc-900 dark:bg-white/5 border border-zinc-900/10 dark:border-white/5 transition-all hover:border-zinc-900/20 dark:hover:border-white/10"
                      >
                        <div className="flex flex-col">
                          <span className="font-semibold text-zinc-900 dark:text-white">
                            {t.description}
                          </span>
                          <span className="text-xs text-zinc-500">
                            {format(parseISO(t.date), "dd MMM yyyy", {
                              locale: ptBR,
                            })}
                          </span>
                        </div>
                        <span className="font-bold text-[#ff7b7b]">
                          R${" "}
                          {Number(t.amount).toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : isCustomizeMode ? (
            <div className="p-4 bg-zinc-100/50 dark:bg-zinc-800/10 rounded-2xl flex items-center justify-between text-zinc-400 border border-zinc-200 dark:border-zinc-800 w-full animate-pulse">
              <span className="text-xs font-bold uppercase tracking-wider italic">Transações Pendentes (Sem pendências)</span>
            </div>
          ) : null;

        case "fluxo_caixa_mensal":
          return (
            <div className="bg-fin-surface p-4 md:p-7 rounded-[24px] border border-zinc-900/10 dark:border-white/5 shadow-2xl w-full">
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
          );

        case "despesas_categoria":
          return (
            <div className="bg-fin-surface p-4 md:p-7 rounded-[24px] border border-zinc-900/10 dark:border-white/5 shadow-2xl flex flex-col justify-between w-full">
              <div>
                <h3 className="text-lg font-bold mb-6 text-zinc-900 dark:text-white">
                  Despesas por Categoria
                </h3>
                {expenseRoots.length > 0 ? (
                  <div className="flex flex-col sm:flex-row gap-6 items-center">
                    <div className="h-56 w-full sm:w-1/2 flex items-center justify-center relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={expenseRoots}
                            cx="50%"
                            cy="50%"
                            innerRadius={65}
                            outerRadius={85}
                            paddingAngle={4}
                            dataKey="totalValue"
                            stroke="none"
                            cursor="pointer"
                            onClick={(data) =>
                              onNavigate &&
                              onNavigate("transactions", {
                                type: "Expense",
                                month: format(refDate, "yyyy-MM"),
                                category: data.id,
                              })
                            }
                          >
                            {expenseRoots.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={entry.color}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            wrapperStyle={{ zIndex: 100 }}
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-[#1a1c1c] border border-white/10 px-3 py-2 rounded-2xl shadow-2xl text-xs z-50">
                                    <span className="font-bold text-zinc-100 block">{data.name}</span>
                                    <span className="text-rose-500 font-bold block mt-0.5">
                                      R$ {data.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </span>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-[10px] uppercase font-bold text-zinc-500">Total</span>
                        <span className="text-sm font-bold text-zinc-900 dark:text-white">
                          R$ {totalExpensesAmount.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
                        </span>
                      </div>
                    </div>
                    <div className="w-full sm:w-1/2">
                      <CategoryTreeList
                        roots={expenseRoots}
                        totalAmount={totalExpensesAmount}
                        onNavigate={onNavigate}
                        refDate={refDate}
                        type="Expense"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="h-56 flex flex-col items-center justify-center text-zinc-500">
                    <Filter size={32} className="mb-2 opacity-50" />
                    <p className="text-sm font-medium">Nenhuma despesa</p>
                  </div>
                )}
              </div>
            </div>
          );

        case "receitas_categoria":
          return (
            <div className="bg-fin-surface p-4 md:p-7 rounded-[24px] border border-zinc-900/10 dark:border-white/5 shadow-2xl flex flex-col justify-between w-full">
              <div>
                <h3 className="text-lg font-bold mb-6 text-zinc-900 dark:text-white">
                  Receitas por Categoria
                </h3>
                {incomeRoots.length > 0 ? (
                  <div className="flex flex-col sm:flex-row gap-6 items-center">
                    <div className="h-56 w-full sm:w-1/2 flex items-center justify-center relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={incomeRoots}
                            cx="50%"
                            cy="50%"
                            innerRadius={65}
                            outerRadius={85}
                            paddingAngle={4}
                            dataKey="totalValue"
                            stroke="none"
                            cursor="pointer"
                            onClick={(data) =>
                              onNavigate &&
                              onNavigate("transactions", {
                                type: "Income",
                                month: format(refDate, "yyyy-MM"),
                                category: data.id,
                              })
                            }
                          >
                            {incomeRoots.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={entry.color}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            wrapperStyle={{ zIndex: 100 }}
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-[#1a1c1c] border border-white/10 px-3 py-2 rounded-2xl shadow-2xl text-xs z-50">
                                    <span className="font-bold text-zinc-100 block">{data.name}</span>
                                    <span className="text-fin-mint font-bold block mt-0.5">
                                      R$ {data.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </span>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-[10px] uppercase font-bold text-zinc-500">Total</span>
                        <span className="text-sm font-bold text-zinc-900 dark:text-white">
                          R$ {totalIncomeAmount.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
                        </span>
                      </div>
                    </div>
                    <div className="w-full sm:w-1/2">
                      <CategoryTreeList
                        roots={incomeRoots}
                        totalAmount={totalIncomeAmount}
                        onNavigate={onNavigate}
                        refDate={refDate}
                        type="Income"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="h-56 flex flex-col items-center justify-center text-zinc-500">
                    <Filter size={32} className="mb-2 opacity-50" />
                    <p className="text-sm font-medium">Nenhuma receita</p>
                  </div>
                )}
              </div>
            </div>
          );

        case "fixas_vs_variaveis":
          return (
            <div className="bg-fin-surface p-4 md:p-7 rounded-[24px] border border-zinc-900/10 dark:border-white/5 shadow-2xl w-full">
              <h3 className="text-lg font-bold mb-6 text-zinc-900 dark:text-white">
                Despesas Fixas vs Variáveis
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
                  <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 py-12">
                    <Tag size={32} className="mb-2 opacity-50" />
                    <p className="text-sm font-medium">Nenhuma despesa este mês</p>
                  </div>
                )}
              </div>
            </div>
          );

        case "saldo_contas":
          return (
            <div className="bg-fin-surface p-4 md:p-7 rounded-[24px] border border-zinc-900/10 dark:border-white/5 shadow-2xl w-full">
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
                  <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 py-12">
                    <Wallet size={32} className="mb-2 opacity-50" />
                    <p className="text-sm font-medium">Nenhuma conta cadastrada</p>
                  </div>
                )}
              </div>
            </div>
          );

        case "budgets_report":
          return (
            <div className="bg-fin-surface p-4 md:p-7 rounded-[24px] border border-zinc-900/10 dark:border-white/5 shadow-2xl relative overflow-hidden w-full">
              <h3 className="text-lg font-bold mb-6 text-zinc-900 dark:text-white flex items-center gap-2">
                Controle de Planejamentos <span className="text-xs bg-fin-mint/10 text-fin-mint px-2 py-0.5 rounded-full uppercase tracking-widest font-black">Premium</span>
              </h3>
              
              {userPlan !== 'premium' ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-fin-mint/10 text-fin-mint rounded-2xl flex items-center justify-center mb-4">
                    <BarChart3 size={32} />
                  </div>
                  <h4 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Relatórios Avançados Bloqueados</h4>
                  <p className="text-zinc-500 max-w-xs mb-6 text-xs leading-relaxed">Desbloqueie o plano Premium para cruzar seus planejamentos com os gastos reais em tempo real.</p>
                  <button 
                    onClick={() => window.dispatchEvent(new CustomEvent('requireUpgrade', { detail: 'Os Relatórios de Planejamento são exclusivos do Plano Premium.' }))}
                    className="bg-fin-mint text-fin-bg px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform text-xs"
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
                              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{budget.category_name}</h4>
                              {budget.is_fixed && (
                                <span className="text-[9px] bg-fin-mint/10 text-fin-mint px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Fixo</span>
                              )}
                              {budget.type === 'percentage' && (
                                <span className="text-[9px] bg-fin-peach/10 text-fin-peach px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">{budget.percentage_rule}%</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xl font-black text-zinc-900 dark:text-white">
                                R$ {Number(budget.actual_spent).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </span>
                              <span className="text-xs text-zinc-500">de R$ {Number(budget.budget_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </div>
                          </div>
                          <div className={cn("text-right font-black italic text-md", baseColor)}>
                            {Math.round(budget.percentage)}%
                          </div>
                        </div>
                        
                        <div className="h-3 bg-zinc-200/50 dark:bg-black/40 rounded-full overflow-hidden border border-zinc-900/10 dark:border-white/5">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(budget.percentage, 100)}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className={cn("h-full rounded-full shadow-[0_0_15px_rgba(0,0,0,0.5)]", barColor)}
                          />
                        </div>
                        
                        <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-zinc-500">
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
          );

        case "virtual_analyst_report":
          return (
            <div className="space-y-4 w-full">
              <div className="flex items-center gap-2 text-zinc-400 dark:text-zinc-500">
                <Sparkles size={18} className="text-fin-mint" />
                <h3 className="text-xs font-bold uppercase tracking-widest">Analista Virtual FinTrack</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {virtualAnalystInsights.length > 0 ? (
                  virtualAnalystInsights.map((insight, index) => (
                    <div key={index} className={cn(
                      "p-5 rounded-[24px] border shadow-xl relative overflow-hidden group transition-all duration-300 hover:scale-[1.02]",
                      insight.type === 'warning' ? "bg-amber-500/5 border-amber-500/20" :
                      insight.type === 'danger' ? "bg-red-500/5 border-red-500/20" :
                      insight.type === 'success' ? "bg-fin-mint/5 border-fin-mint/20" :
                      "bg-fin-blue/5 border-fin-blue/20"
                    )}>
                      <div className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center mb-3 shadow-lg",
                        insight.type === 'warning' ? "bg-amber-500/20 text-amber-500" :
                        insight.type === 'danger' ? "bg-red-500/20 text-red-500" :
                        insight.type === 'success' ? "bg-fin-mint/20 text-fin-mint" :
                        "bg-fin-blue/20 text-fin-blue"
                      )}>
                        {insight.icon === 'TrendingUp' ? <TrendingUp size={16} /> :
                         insight.icon === 'AlertCircle' ? <AlertCircle size={16} /> :
                         insight.icon === 'CheckCircle2' ? <CheckCircle2 size={16} /> :
                         <Target size={16} />}
                      </div>
                      
                      <h4 className={cn(
                        "text-xs font-black uppercase tracking-tight mb-1",
                        insight.type === 'warning' ? "text-amber-500" :
                        insight.type === 'danger' ? "text-red-500" :
                        insight.type === 'success' ? "text-fin-mint" :
                        "text-fin-blue"
                      )}>
                        {insight.title}
                      </h4>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-bold">
                        {insight.text}
                      </p>
                      
                      {insight.value !== undefined && (
                        <div className="mt-3 pt-3 border-t border-zinc-900/5 dark:border-white/5">
                          <span className="text-xl font-black text-zinc-900 dark:text-white">
                             R$ {insight.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                          <span className="text-[9px] text-zinc-500 font-bold uppercase ml-2">/ dia</span>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 p-6 bg-zinc-100/50 dark:bg-white/5 border border-zinc-200 dark:border-white/5 rounded-2xl text-center text-zinc-500 text-xs font-bold w-full">
                    Nenhum insight disponível para o volume de dados atual.
                  </div>
                )}
              </div>
            </div>
          );

        case "insights_report":
          return (
            <div className="space-y-4 w-full">
              <div className="flex items-center gap-2 text-zinc-400 dark:text-zinc-500">
                <TrendingUp size={18} />
                <h3 className="text-xs font-bold uppercase tracking-widest">Insights Estratégicos</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {financialGoals.map((g, i) => (
                  <div key={i} className="bg-fin-surface p-5 rounded-[24px] border border-zinc-900/10 dark:border-white/5 shadow-xl relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      {g.meta.includes('Poupança') ? <TrendingUp size={48} /> : g.meta.includes('Receita') ? <ArrowUpRight size={48} /> : <ArrowDownLeft size={48} />}
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-1">{g.meta}</p>
                    <p className="text-[8px] text-zinc-400 mb-2 leading-tight">{g.description}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-zinc-900 dark:text-white">
                        {g.unidade === 'R$' ? `R$ ${Number(g.atual).toLocaleString('pt-BR')}` : `${g.atual}${g.unidade}`}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-col gap-2">
                       <div className="flex items-center justify-between text-[9px] font-bold">
                         <span className="text-zinc-500 uppercase">
                           {g.isBenchmark ? "Benchmark: " : g.isBudget ? "Planejado: " : "Média: "}
                           {g.unidade === 'R$' ? `R$ ${g.objetivo.toLocaleString('pt-BR')}` : `${g.objetivo}${g.unidade}`}
                         </span>
                         <span className={cn(
                           "uppercase",
                           (g.meta.includes('Despesas') ? Number(g.atual) <= g.objetivo : Number(g.atual) >= g.objetivo) ? "text-fin-mint" : "text-zinc-500"
                         )}>
                           {(g.meta.includes('Despesas') ? Number(g.atual) <= g.objetivo : Number(g.atual) >= g.objetivo) ? (g.meta.includes('Despesas') ? "Sob controle" : "Atingido") : "Em progresso"}
                         </span>
                       </div>
                       <div className="h-1 bg-zinc-900/10 dark:bg-white/5 rounded-full overflow-hidden">
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
            </div>
          );

        case "projecao_caixa":
          return (
            <div className="bg-fin-surface p-4 md:p-7 rounded-[24px] border border-zinc-900/10 dark:border-white/5 shadow-2xl overflow-hidden relative w-full">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Projeção de Caixa</h3>
                  <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Saldo projetado para os próximos {projectionDays} dias</p>
                </div>
                
                <div className="flex bg-zinc-100 dark:bg-black/40 p-1 rounded-xl border border-zinc-900/5 dark:border-white/5 shrink-0 self-end md:self-auto">
                  {[30, 60, 90, 120].map(d => (
                    <button
                      key={d}
                      onClick={() => setProjectionDays(d)}
                      className={cn(
                        "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
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
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 animate-pulse">
                  <div className="w-8 h-8 rounded-xl bg-red-500/20 flex items-center justify-center text-red-500 shrink-0">
                     <AlertCircle size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-red-500 uppercase tracking-tight">Alerta de Caixa</p>
                    <p className="text-[9px] text-zinc-500 leading-tight mt-0.5">Saldo projetado ficará negativo em alguns períodos. Reveja seus gastos.</p>
                  </div>
                </div>
              )}
            </div>
          );

        case "evolucao_saldo":
          return (
            <div className="bg-fin-surface p-4 md:p-7 rounded-[24px] border border-zinc-900/10 dark:border-white/5 shadow-2xl w-full">
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
          );

        case "goals_report":
          return (
            <div className="bg-fin-surface p-4 md:p-7 rounded-[24px] border border-zinc-900/10 dark:border-white/5 shadow-2xl w-full">
              <h3 className="text-lg font-bold mb-6 text-zinc-900 dark:text-white flex items-center gap-2">
                Progresso das Metas <span className="text-xs bg-fin-mint/10 text-fin-mint px-2 py-0.5 rounded-full uppercase tracking-widest font-black">Premium</span>
              </h3>

              {userPlan !== 'premium' ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-fin-mint/10 text-fin-mint rounded-2xl flex items-center justify-center mb-4">
                    <CheckCircle2 size={32} />
                  </div>
                  <h4 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Relatórios de Metas Bloqueados</h4>
                  <p className="text-zinc-500 max-w-xs mb-6 text-xs leading-relaxed">Acompanhe visualmente a evolução dos seus objetivos financeiros com barras de progresso avançadas.</p>
                  <button 
                    onClick={() => window.dispatchEvent(new CustomEvent('requireUpgrade', { detail: 'O acompanhamento de Metas é exclusivo do Plano Premium.' }))}
                    className="bg-fin-mint text-fin-bg px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform text-xs"
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
                    <div key={goal.id} className="p-4 rounded-2xl bg-zinc-200/50 dark:bg-white/5 border border-zinc-900/10 dark:border-white/5 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-md shadow-lg" style={{ backgroundColor: `${goal.color}20`, color: goal.color }}>
                          <Target size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-xs text-zinc-900 dark:text-white truncate">{goal.name}</h4>
                          <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Alvo: R$ {Number(goal.target_amount).toLocaleString('pt-BR')}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-md font-black italic" style={{ color: goal.color }}>{Math.round(goal.percentage)}%</span>
                        </div>
                      </div>

                      <div className="h-2 bg-zinc-300 dark:bg-black/40 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(goal.percentage, 100)}%` }}
                          transition={{ duration: 1.2, ease: "backOut" }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: goal.color }}
                        />
                      </div>

                      <div className="flex justify-between items-center text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                        <span>R$ {Number(goal.current_amount).toLocaleString('pt-BR')} guardados</span>
                        {goal.is_completed && <span className="text-fin-mint flex items-center gap-1"><CheckCircle2 size={8} /> Concluída</span>}
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
          );

        default:
          return null;
      }
    })();

    if (!widgetContent) return null;

    return (
      <div 
        key={item.id} 
        draggable={isCustomizeMode}
        onDragStart={(e) => handleDragStart(e, index)}
        onDragOver={handleDragOver}
        onDragEnter={(e) => handleDragEnter(e, index)}
        onDragEnd={handleDragEnd}
        className={cn(
          "transition-all duration-300 w-full relative",
          (item.colSpan || 2) === 1 ? "col-span-1" : "col-span-1 md:col-span-2",
          isCustomizeMode && "border-2 border-dashed border-zinc-500/30 p-5 rounded-[28px] bg-zinc-100/10 dark:bg-white/[0.01]",
          isCustomizeMode && draggedIndex === index && "opacity-40 scale-[0.98] border-fin-mint/50"
        )}
      >
        {isCustomizeMode && (
          <>
            {/* Overlay transparente para desativar hovers/cliques internos e permitir arrastar */}
            <div className="absolute inset-0 z-20 cursor-grab active:cursor-grabbing rounded-[28px]" />
            
            {/* Controles de Customização (z-30 para ficar acima do overlay e ser clicável) */}
            <div className="absolute top-2 right-2 flex items-center gap-1.5 z-30 bg-white/95 dark:bg-zinc-950/95 py-1.5 px-3 rounded-full border border-zinc-200 dark:border-white/10 shadow-md">
              <GripVertical size={14} className="text-zinc-400 mr-1 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mr-2">
                {item.name}
              </span>
              <button
                onClick={() => toggleSectionWidth(item.id)}
                className="p-1 hover:bg-zinc-100 dark:hover:bg-white/10 rounded text-zinc-500 transition-colors"
                title={(item.colSpan || 2) === 1 ? "Expandir para Largura Inteira" : "Reduzir para Meia Largura"}
              >
                <Columns size={14} className={cn("transition-transform", (item.colSpan || 2) === 1 && "rotate-90")} />
              </button>
              <button
                onClick={() => toggleSectionVisibility(item.id, false)}
                className="p-1 hover:bg-red-500/10 hover:text-red-500 rounded text-zinc-500 transition-colors"
                title="Ocultar Seção"
              >
                <EyeOff size={14} />
              </button>
            </div>
          </>
        )}
        {widgetContent}
      </div>
    );
  };

  return (
    <div className="space-y-4 md:space-y-8 animate-in fade-in duration-500">
      <PageHeader
        id="step-dashboard"
        icon={LayoutDashboard}
        title="Visão Geral"
        subtitle={`Bem-vindo ao painel de ${selectedProfile?.name}. Aqui está o resumo das finanças.`}
        label="Meu Patrimônio"
        colorClass="text-fin-mint"
        bgClass="bg-fin-mint/10"
        borderClass="border-fin-mint/20"
        centerActions={true}
        actions={
          <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
            {/* Customização de Layout */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              {!isCustomizeMode ? (
                <button
                  onClick={() => setIsCustomizeMode(true)}
                  className="h-12 px-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-2xl flex items-center gap-2 shadow-sm transition-all text-xs font-bold uppercase tracking-wider"
                >
                  <SlidersHorizontal size={16} />
                  <span>Personalizar</span>
                </button>
              ) : (
                <div className="px-3.5 py-1.5 bg-fin-mint/10 border border-fin-mint/20 text-fin-mint rounded-xl text-[10px] font-black uppercase tracking-widest animate-pulse">
                  Personalizando Painel
                </div>
              )}
            </div>

            {/* Month Navigation Control */}
            <div className="relative w-full md:w-auto">
              <div className="flex items-center justify-between md:justify-start gap-1 bg-white dark:bg-zinc-900 p-1.5 rounded-2xl border border-zinc-200 dark:border-white/5 shadow-sm">
                <button
                  onClick={handlePrevMonth}
                  className="p-2 text-zinc-500 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 rounded-xl transition-all"
                  title="Mês Anterior"
                >
                  <ChevronLeft size={18} />
                </button>

                <button
                  onClick={() => {
                    setPickerYear(refDate.getFullYear());
                    setIsMonthPickerOpen(!isMonthPickerOpen);
                  }}
                  className="text-xs font-black min-w-[130px] text-center uppercase tracking-wider text-zinc-700 dark:text-zinc-300 hover:text-fin-mint transition-colors py-2 px-3 rounded-xl"
                >
                  {format(refDate, "MMMM yyyy", { locale: ptBR })}
                </button>

                <button
                  onClick={handleNextMonth}
                  className="p-2 text-zinc-500 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 rounded-xl transition-all"
                  title="Próximo Mês"
                >
                  <ChevronRight size={18} />
                </button>
              </div>

                {isMonthPickerOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsMonthPickerOpen(false)}
                    />
                    <div className="absolute top-full left-1/2 -translate-x-1/2 md:left-auto md:right-0 md:translate-x-0 mt-3 p-5 bg-fin-surface border border-zinc-900/10 dark:border-white/10 rounded-3xl shadow-2xl z-50 w-[calc(100vw-2rem)] max-w-[288px] md:w-72 animate-in fade-in slide-in-from-top-2 duration-200">
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
              
              {overdueCount > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setIsOverduePopoverOpen(!isOverduePopoverOpen)}
                    className={cn(
                      "h-12 px-4 rounded-2xl flex items-center gap-3 shadow-lg transition-all group border",
                      isOverduePopoverOpen 
                        ? "bg-fin-peach text-fin-bg border-fin-peach" 
                        : "bg-fin-peach/10 border-fin-peach/20 text-fin-peach hover:bg-fin-peach/20"
                    )}
                  >
                    <AlertCircle size={20} className={cn("transition-transform group-hover:scale-110", isOverduePopoverOpen && "animate-pulse")} />
                    <span className="font-semibold text-sm">
                      {overdueCount} <span className="hidden md:inline">pendentes atrasadas</span>
                    </span>
                  </button>

                  {isOverduePopoverOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOverduePopoverOpen(false)}
                      />
                      <div className="absolute top-full right-0 mt-3 p-0 bg-fin-surface border border-zinc-900/10 dark:border-white/10 rounded-[32px] shadow-2xl z-50 w-80 md:w-96 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
                        <div className="p-5 border-b border-zinc-900/10 dark:border-white/5 bg-fin-peach/5 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Clock size={16} className="text-fin-peach" />
                            <h3 className="font-bold text-zinc-900 dark:text-white">Atrasados</h3>
                          </div>
                          <button 
                            onClick={() => {
                              onNavigate && onNavigate("transactions", { status: "Pending", month: "all" });
                              setIsOverduePopoverOpen(false);
                            }}
                            className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-fin-mint transition-colors flex items-center gap-1"
                          >
                            Ver Tudo <ExternalLink size={12} />
                          </button>
                        </div>
                        
                        <div className="max-h-[400px] overflow-y-auto custom-scrollbar p-3 space-y-2">
                          {overdueTransactions.map((t) => (
                            <div 
                              key={t.id}
                              className="p-4 bg-zinc-900/5 dark:bg-white/5 border border-zinc-900/10 dark:border-white/5 rounded-2xl flex items-center justify-between group hover:border-fin-peach/30 transition-all"
                            >
                              <div className="flex-1 min-w-0 pr-3">
                                <p className="font-bold text-sm text-zinc-900 dark:text-white truncate uppercase tracking-tight">
                                  {t.description}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[10px] font-bold text-zinc-500 uppercase">
                                    {format(parseISO(t.date), "dd/MM/yyyy")}
                                  </span>
                                  <span className="text-zinc-500">•</span>
                                  <span className={cn(
                                    "text-[10px] font-black uppercase tracking-tighter",
                                    t.type === "Income" ? "text-fin-mint" : "text-rose-500"
                                  )}>
                                    {t.type === "Income" ? "Receita" : "Despesa"}
                                  </span>
                                </div>
                                <p className={cn(
                                  "font-black text-sm mt-1",
                                  t.type === "Income" ? "text-fin-mint" : "text-[#ff7b7b]"
                                )}>
                                  R$ {Number(t.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                </p>
                              </div>
                              <button
                                onClick={() => {
                                  setQuickEffectiveTransaction(t);
                                  setIsOverduePopoverOpen(false);
                                }}
                                className="w-10 h-10 bg-fin-mint/10 text-fin-mint hover:bg-fin-mint hover:text-fin-bg rounded-xl flex items-center justify-center transition-all shadow-sm hover:shadow-fin-mint/20"
                                title="Efetivar agora"
                              >
                                <CheckCircle2 size={18} />
                              </button>
                            </div>
                          ))}
                        </div>
                        
                        <div className="p-4 bg-zinc-200/30 dark:bg-black/10 border-t border-zinc-900/10 dark:border-white/5">
                           <p className="text-[10px] text-center text-zinc-500 font-bold uppercase tracking-widest">
                             {overdueCount} {overdueCount === 1 ? 'item pendente' : 'itens pendentes'} em atraso
                           </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
        }
      />

      {/* Seções Ocultas em Modo de Personalização */}
      {isCustomizeMode && layout.some(item => !item.visible) && (
        <div className="p-6 bg-zinc-100 dark:bg-white/5 border border-dashed border-zinc-200 dark:border-white/10 rounded-[28px] animate-in slide-in-from-top-2 duration-300 w-full">
          <p className="text-xs font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3 flex items-center gap-2">
            <EyeOff size={14} /> Seções Ocultas (Clique para adicionar de volta ao painel)
          </p>
          <div className="flex flex-wrap gap-2">
            {layout.filter(item => !item.visible).map(item => (
              <button
                key={item.id}
                onClick={() => toggleSectionVisibility(item.id, true)}
                className="px-4 py-2 bg-white dark:bg-zinc-800 hover:bg-fin-mint hover:text-fin-bg hover:scale-105 border border-zinc-200 dark:border-white/5 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-300 transition-all flex items-center gap-2 shadow-sm"
              >
                <Eye size={12} />
                <span>{item.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Renderização Dinâmica das Seções Ordenadas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 w-full items-start">
        {layout.map((item, index) => renderWidget(item, index))}
      </div>

      {quickEffectiveTransaction && (
        <QuickEffectiveModal
          transaction={quickEffectiveTransaction}
          onClose={() => setQuickEffectiveTransaction(null)}
          onSuccess={() => {
            setQuickEffectiveTransaction(null);
            if (fetchData) fetchData();
          }}
          accounts={accounts}
          showToast={showToast}
        />
      )}

      {/* Roda-pé Fixo para Modo de Customização */}
      {isCustomizeMode && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border border-zinc-200 dark:border-white/10 p-3 rounded-full shadow-2xl animate-in slide-in-from-bottom-5 duration-300">
          <button
            onClick={resetLayout}
            className="h-11 px-5 bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-700 dark:text-zinc-300 rounded-full flex items-center gap-2 border border-zinc-200 dark:border-white/5 transition-all text-xs font-bold uppercase tracking-wider"
          >
            <RefreshCw size={14} /> Restaurar
          </button>
          <button
            onClick={() => setIsCustomizeMode(false)}
            className="h-11 px-6 bg-fin-mint text-fin-bg hover:brightness-110 rounded-full flex items-center gap-2 transition-all text-xs font-bold uppercase tracking-wider shadow-lg shadow-fin-mint/20"
          >
            <CheckCircle2 size={14} /> Concluir
          </button>
        </div>
      )}
    </div>
  );
}
