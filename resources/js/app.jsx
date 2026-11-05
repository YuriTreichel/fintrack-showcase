import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  lazy,
  Suspense,
} from "react";
// ícones do lucide-react
import {
  LayoutDashboard,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowRightLeft,
  Wallet,
  CreditCard,
  Plus,
  Filter,
  Calendar,
  Tag,
  AlertCircle,
  MoreVertical,
  Trash2,
  CheckCircle2,
  Clock,
  History,
  Users,
  Copy,
  Check,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Settings,
  BarChart3,
  User,
  LogOut,
  ShieldCheck,
  ShieldAlert,
  LineChart as LineChartIcon,
  ListTree,
  UserPlus,
  CornerDownLeft,
  ShoppingBag,
  Car,
  Home,
  Coffee,
  Utensils,
  Plane,
  Briefcase,
  Zap,
  Smartphone,
  Heart,
  Gift,
  Book,
  HelpCircle,
  ShoppingCart,
  Fuel,
  Bus,
  Bike,
  GraduationCap,
  Baby,
  PawPrint,
  Dumbbell,
  Music,
  Tv,
  Gamepad2,
  Scissors,
  Stethoscope,
  Pill,
  Building2,
  Landmark,
  HandCoins,
  Coins,
  PiggyBank,
  Banknote,
  Receipt,
  Shirt,
  Umbrella,
  Wrench,
  Paintbrush,
  Camera,
  TreePine,
  UtensilsCrossed,
  TrendingUp,
  Wine,
  IceCream,
  Pizza,
  Salad,
  Droplets,
  Wifi,
  Globe,
  PartyPopper,
  Theater,
  Headphones,
  Church,
  Star,
  Menu,
  X,
  Target,
  Bell,
  MessageCircle,
  FileText,
} from "lucide-react";


import {
  format,
  parseISO,
  isPast,
  isToday,
  endOfMonth,
  startOfWeek,
  startOfMonth,
  endOfWeek,
  isSameDay,
  isSameMonth,
  subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import {
  Navigate,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { cn } from "./utils/classNames";
import { useFinStore } from "./store/useFinStore";

const COLORS = [
  "#98e5dd",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];

const CATEGORY_ICONS = {
  // Finanças
  Wallet: <Wallet size={16} />,
  CreditCard: <CreditCard size={16} />,
  Banknote: <Banknote size={16} />,
  PiggyBank: <PiggyBank size={16} />,
  HandCoins: <HandCoins size={16} />,
  Receipt: <Receipt size={16} />,
  Landmark: <Landmark size={16} />,
  Building2: <Building2 size={16} />,
  // Compras & Varejo
  Tag: <Tag size={16} />,
  ShoppingBag: <ShoppingBag size={16} />,
  ShoppingCart: <ShoppingCart size={16} />,
  Shirt: <Shirt size={16} />,
  // Transporte
  Car: <Car size={16} />,
  Fuel: <Fuel size={16} />,
  Bus: <Bus size={16} />,
  Bike: <Bike size={16} />,
  Plane: <Plane size={16} />,
  // Casa & Moradia
  Home: <Home size={16} />,
  Zap: <Zap size={16} />,
  Droplets: <Droplets size={16} />,
  Wifi: <Wifi size={16} />,
  Wrench: <Wrench size={16} />,
  Paintbrush: <Paintbrush size={16} />,
  Umbrella: <Umbrella size={16} />,
  // Alimentação
  Coffee: <Coffee size={16} />,
  Utensils: <Utensils size={16} />,
  UtensilsCrossed: <UtensilsCrossed size={16} />,
  Pizza: <Pizza size={16} />,
  Salad: <Salad size={16} />,
  Wine: <Wine size={16} />,
  IceCream: <IceCream size={16} />,
  // Trabalho & Educação
  Briefcase: <Briefcase size={16} />,
  GraduationCap: <GraduationCap size={16} />,
  Book: <Book size={16} />,
  Globe: <Globe size={16} />,
  // Saúde & Bem-estar
  Heart: <Heart size={16} />,
  Stethoscope: <Stethoscope size={16} />,
  Pill: <Pill size={16} />,
  Dumbbell: <Dumbbell size={16} />,
  // Entretenimento & Lazer
  Tv: <Tv size={16} />,
  Gamepad2: <Gamepad2 size={16} />,
  Music: <Music size={16} />,
  Headphones: <Headphones size={16} />,
  Camera: <Camera size={16} />,
  Theater: <Theater size={16} />,
  PartyPopper: <PartyPopper size={16} />,
  // Família & Pessoal
  Baby: <Baby size={16} />,
  PawPrint: <PawPrint size={16} />,
  Gift: <Gift size={16} />,
  Scissors: <Scissors size={16} />,
  Church: <Church size={16} />,
  Star: <Star size={16} />,
  // Tecnologia
  Smartphone: <Smartphone size={16} />,
  TreePine: <TreePine size={16} />,
};

import CustomSelect from "./components/ui/CustomSelect";
import CustomDatePicker from "./components/ui/CustomDatePicker";

// Páginas
const Dashboard = lazy(() => import("./views/Dashboard.jsx"));
const TransactionsView = lazy(() => import("./views/TransactionsView.jsx"));
const SettingsView = lazy(() => import("./views/SettingsView.jsx"));
const ProfileView = lazy(() => import("./views/ProfileView.jsx"));
const ReportsView = lazy(() => import("./views/ReportsView.jsx"));
const CategoriesView = lazy(() => import("./views/CategoriesView.jsx"));
const CardsView = lazy(() => import("./views/CardsView.jsx"));
const AccountsView = lazy(() => import("./views/AccountsView.jsx"));
const BudgetsView = lazy(() => import("./views/BudgetsView.jsx"));
const GoalsView = lazy(() => import("./views/GoalsView.jsx"));

const AdminUsersView = lazy(() => import("./views/AdminUsersView.jsx"));
const AdminBlogView = lazy(() => import("./views/AdminBlogView.jsx"));
const WealthView = lazy(() => import("./views/WealthView.jsx"));
const CryptoMarket = lazy(() => import("./views/CryptoMarket.jsx"));
const CryptoDetails = lazy(() => import("./views/CryptoDetails.jsx"));
const StockMarket = lazy(() => import("./views/StockMarket.jsx"));
const AssetHistoryView = lazy(() => import("./views/AssetHistoryView.jsx"));
const WealthReportsView = lazy(() => import("./views/WealthReportsView.jsx"));
const DebtsView = lazy(() => import("./views/DebtsView.jsx"));

// Modais
const CategoryModal = lazy(() => import("./modals/CategoryModal.jsx"));
const AccountModal = lazy(() => import("./modals/AccountModal.jsx"));
const TransactionModal = lazy(() => import("./modals/TransactionModal.jsx"));
const CardModal = lazy(() => import("./modals/CardModal.jsx"));
const ConfirmModal = lazy(() => import("./modals/ConfirmModal.jsx"));
const QuickEffectiveModal = lazy(() => import("./modals/QuickEffectiveModal.jsx"));
const ShareModal = lazy(() => import("./modals/ShareModal.jsx"));
const UpgradeModal = lazy(() => import("./modals/UpgradeModal.jsx"));

// Componentes UI
import TransactionRow from "./components/ui/TransactionRow";
import StatCard from "./components/ui/StatCard";

// Visão de Preços (Onboarding)
const PricingView = lazy(() => import("./views/PricingView.jsx"));
import TrialBanner from "./components/ui/TrialBanner";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  const navigate = useNavigate();
  const location = useLocation();

  const [transactionFilters, setTransactionFilters] = useState(null);

  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [modalInitialType, setModalInitialType] = useState(null);
  const [isSpeedDialOpen, setIsSpeedDialOpen] = useState(false);

  // --- NUVEM DE DADOS (ZUSTAND) ---
  const {
    data,
    setData,
    transactions,
    setTransactions,
    accounts,
    setAccounts,
    categories,
    setCategories,
    cards,
    setCards,
    following,
    setFollowing,
    budgets,
    setBudgets,
    goals,
    setGoals,
    selectedProfile,
    setSelectedProfile,
    userPlan,
    setUserPlan,
    loading,
    setLoading,
    user,
    setUser,
    dashboardMode,
    setDashboardMode,
  } = useFinStore();


  const [toast, setToast] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem("sidebarCollapsed") === "true";
  });
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradeFeatureName, setUpgradeFeatureName] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Bem-vindo!",
      message: "Explore o seu novo painel financeiro.",
      type: "system",
      date: new Date(),
      read: false,
    },
    {
      id: 2,
      title: "Atalho disponível",
      message: 'Dica: Aperte a tecla "K" para focar no campo de busca.',
      type: "tip",
      date: new Date(),
      read: false,
    },
  ]);

  const searchRef = useRef(null);
  const [searchIndex, setSearchIndex] = useState(0);

  const systemCommands = useMemo(
    () => [
      {
        id: "dash",
        label: dashboardMode === "finance" ? "Ir para Dashboard" : "Ir para Visão Geral",
        action: () => navigate(dashboardMode === "finance" ? "/" : "/wealth"),
        icon: dashboardMode === "finance" ? <LayoutDashboard size={16} /> : <Coins size={16} />,
        keywords: "inicio home painel",
      },
      {
        id: "trans",
        label: "Ir para Transações",
        action: () => navigate("/transactions"),
        icon: <ArrowRightLeft size={16} />,
        keywords: "histórico extrato lançamentos",
        mode: "finance",
      },
      {
        id: "acc",
        label: "Ir para Contas",
        action: () => navigate("/accounts"),
        icon: <Wallet size={16} />,
        keywords: "bancos carteiras saldo",
        mode: "finance",
      },
      {
        id: "card",
        label: "Ir para Cartões",
        action: () => navigate("/cards"),
        icon: <CreditCard size={16} />,
        keywords: "crédito faturas",
        mode: "finance",
      },
      {
        id: "cat",
        label: "Ir para Categorias",
        action: () => navigate("/categories"),
        icon: <ListTree size={16} />,
        keywords: "grupos organização",
        mode: "finance",
      },
      {
        id: "rep",
        label: "Ir para Relatórios",
        action: () => {
          if (userPlan === 'basic') {
            window.dispatchEvent(new CustomEvent('requireUpgrade', { detail: 'Os Relatórios Avançados são exclusivos do Plano Premium.' }));
          } else {
            navigate("/reports");
          }
        },
        icon: <BarChart3 size={16} />,
        keywords: "gráficos análise estatísticas",
        mode: "finance",
      },
      {
        id: "sett",
        label: "Ir para Configurações",
        action: () => navigate("/settings"),
        icon: <Settings size={16} />,
        keywords: "perfil conta tema cores",
      },
      {
        id: "profile",
        label: "Ir para Perfil",
        action: () => navigate("/profile"),
        icon: <User size={16} />,
        keywords: "conta senha nome email dados",
      },
      {
        id: "budgets",
        label: "Ir para Planejamentos",
        action: () => {
          if (userPlan === 'basic') {
            window.dispatchEvent(new CustomEvent('requireUpgrade', { detail: 'O Planejamento é exclusivo do Plano Premium.' }));
          } else {
            navigate("/budgets");
          }
        },
        icon: <PiggyBank size={16} />,
        keywords: "planejamento teto gastos limite",
        mode: "finance",
      },
      {
        id: "goals",
        label: "Ir para Metas",
        action: () => {
          if (userPlan === 'basic') {
            window.dispatchEvent(new CustomEvent('requireUpgrade', { detail: 'As Metas Financeiras são exclusivas do Plano Premium.' }));
          } else {
            navigate("/goals");
          }
        },
        icon: <Target size={16} />,
        keywords: "objetivos sonhos economia poupança",
        mode: "finance",
      },
      {
        id: "wealth",
        label: "Ir para Patrimônio",
        action: () => navigate("/wealth"),
        icon: <Coins size={16} />,
        keywords: "cripto ações investimentos btc eth dolar",
        mode: "wealth",
      },
      {
        id: "market",
        label: "Ir para Mercado Cripto",
        action: () => navigate("/market"),
        icon: <BarChart3 size={16} />,
        keywords: "cripto moedas cotações bitcoin ethereum mercado",
        mode: "wealth",
      },
      {
        id: "stocks",
        label: "Ir para Ações e FIIs",
        action: () => navigate("/market/stocks"),
        icon: <TrendingUp size={16} />,
        keywords: "ações fiis bolsa b3 dividendos investimentos",
        mode: "wealth",
      },
      {
        id: "wealth-reports",
        label: "Relatórios de Patrimônio",
        action: () => {
          if (userPlan === 'basic') {
            window.dispatchEvent(new CustomEvent('requireUpgrade', { detail: 'Os Relatórios de Patrimônio são exclusivos do Plano Premium.' }));
          } else {
            navigate("/wealth/reports");
          }
        },
        icon: <BarChart3 size={16} />,
        keywords: "gráficos análise estatísticas carteira patrimônio relatórios",
        mode: "wealth",
      },
      {
        id: "new-expense",
        label: "Nova Despesa",
        action: () => openTransactionModal(null, "Expense"),
        icon: <ArrowUpRight size={16} className="text-red-500" />,
        keywords: "adicionar cadastrar despesa gasto pagar",
        mode: "finance",
      },
      {
        id: "new-income",
        label: "Nova Receita",
        action: () => openTransactionModal(null, "Income"),
        icon: <ArrowDownLeft size={16} className="text-fin-mint" />,
        keywords: "adicionar cadastrar receita ganho receber",
        mode: "finance",
      },
      {
        id: "new-transfer",
        label: "Nova Transferência",
        action: () => openTransactionModal(null, "Transfer"),
        icon: <ArrowRightLeft size={16} className="text-blue-500" />,
        keywords: "adicionar cadastrar transferência mudar pix",
        mode: "finance",
      },
      {
        id: "new-goal",
        label: "Investir em Meta",
        action: () => openTransactionModal(null, "GoalDeposit"),
        icon: <Target size={16} className="text-fin-mint" />,
        keywords: "adicionar cadastrar meta objetivo guardar poupar investimento",
        mode: "finance",
      },
      {
        id: "share",
        label: "Compartilhar Dados",
        action: () => {
          if (userPlan === 'basic') {
            window.dispatchEvent(new CustomEvent('requireUpgrade', { detail: 'O Compartilhamento Familiar é exclusivo do Plano Premium.' }));
          } else {
            setIsShareModalOpen(true);
          }
        },
        icon: <UserPlus size={16} />,
        keywords: "convidar código esposa marido",
      },
      {
        id: "debts",
        label: "Ir para Dívidas",
        action: () => {
          if (userPlan === 'basic' && user?.email !== 'demo@fintrack.dev') {
            window.dispatchEvent(new CustomEvent('requireUpgrade', { detail: 'O Gerenciador de Dívidas é exclusivo do Plano Premium.' }));
          } else {
            navigate("/debts");
          }
        },
        icon: <Banknote size={16} />,
        keywords: "débitos pendencias anotações privadas",
      },
    ].filter(Boolean),
    [navigate, setIsShareModalOpen, userPlan, dashboardMode, user?.email],
  );

  const filteredCommands = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const term = searchTerm.toLowerCase();
    return systemCommands.filter(
      (c) =>
        (!c.mode || c.mode === dashboardMode) &&
        (c.label.toLowerCase().includes(term) ||
          c.keywords.toLowerCase().includes(term)),
    );
  }, [searchTerm, systemCommands, dashboardMode]);

  useEffect(() => {
    setSearchIndex(0);
  }, [searchTerm]);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const showConfirm = useCallback((title, message, onConfirm, options = {}) => {
    setConfirmDialog({ 
      isOpen: true, 
      title, 
      message, 
      onConfirm,
      variant: options.variant || "danger",
      confirmLabel: options.confirmLabel || (options.variant === 'warning' ? 'Confirmar' : 'Excluir'),
      cancelLabel: options.cancelLabel || "Cancelar"
    });
  }, []);

  const closeConfirm = useCallback(() => {
    setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const openTransactionModal = (transaction = null, type = null) => {
    setEditingTransaction(transaction);
    setModalInitialType(type);
    setIsTransactionModalOpen(true);
  };

  const closeTransactionModal = () => {
    setEditingTransaction(null);
    setModalInitialType(null);
    setIsTransactionModalOpen(false);
  };


  // Authenticated fetch helper
  const authFetch = useCallback(
    async (url, options = {}) => {
      const headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(options.headers || {}),
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(url, { ...options, headers });

      if (response.status === 401) {
        setToken(null);
        setUser(null);
        localStorage.removeItem("token");
      }
      
      if (response.status === 403) {
        const errorData = await response.clone().json().catch(() => ({}));
        
        // Se a API indicar que precisa de assinatura ativa (Status Canceled, etc)
        if (errorData.requires_subscription) {
            setUserPlan('none');
            return response;
        }

        // Se a API indicar que precisa de UPGRADE (ex: atingiu limite do plano Básico)
        if (errorData.requires_upgrade && !options.skipUpgradeModal) {
            setUpgradeFeatureName(errorData.message || 'Esta funcionalidade');
            setIsUpgradeModalOpen(true);
            return response;
        }
      }

      return response;
    },
    [token],
  );

  useEffect(() => {
    const handleRequireUpgrade = (e) => {
      setUpgradeFeatureName(e.detail || 'Esta funcionalidade');
      setIsUpgradeModalOpen(true);
    };
    window.addEventListener('requireUpgrade', handleRequireUpgrade);
    return () => window.removeEventListener('requireUpgrade', handleRequireUpgrade);
  }, []);

  useEffect(() => {
    if (token) {
      fetchUser();
      fetchData(true);
    } else {
      setLoading(false);
      setSelectedProfile(null);
    }
  }, [token]);

  useEffect(() => {
    if (user && !selectedProfile) {
      setSelectedProfile(user);
    }
  }, [user, selectedProfile, setSelectedProfile]);

  const profileAccounts = useMemo(
    () => accounts.filter((a) => a.user_id === selectedProfile?.id),
    [accounts, selectedProfile],
  );

  const globalBalance = useMemo(() => {
    return profileAccounts?.reduce(
      (acc, curr) =>
        acc +
        parseFloat(
          curr.current_balance !== undefined
            ? curr.current_balance
            : curr.initial_balance,
        ),
      0,
    ) || 0;
  }, [profileAccounts]);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Persist sidebar state
  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", isSidebarCollapsed);
  }, [isSidebarCollapsed]);

  // Keyboard shortcut for search (F)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        e.key.toLowerCase() === "k" &&
        !["INPUT", "TEXTAREA", "SELECT"].includes(
          document.activeElement.tagName,
        )
      ) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Redirect on mode change if on incompatible route
  useEffect(() => {
    const wealthRoutes = ["/wealth", "/market", "/market/stocks", "/wealth/reports", "/wealth/history"];
    const isWealthRoute = wealthRoutes.some(r => location.pathname === r || location.pathname.startsWith(r));
    
    if (dashboardMode === "finance" && isWealthRoute) {
      navigate("/");
    } else if (dashboardMode === "wealth" && !isWealthRoute && !["/profile", "/settings", "/admin/users", "/login", "/register", "/pricing"].some(r => location.pathname.startsWith(r))) {
      navigate("/wealth");
    }
  }, [dashboardMode, navigate]);

  // Inject custom theme color
  useEffect(() => {
    if (user?.theme_color) {
      document.documentElement.style.setProperty("--mint", user.theme_color);
    } else {
      document.documentElement.style.removeProperty("--mint");
    }
  }, [user?.theme_color]);

  // Atualiza o título da página baseado na rota
  useEffect(() => {
    const routeTitles = {
      "/": "Dashboard",
      "/transactions": "Transações",
      "/accounts": "Contas",
      "/cards": "Cartões",
      "/budgets": "Planejamentos",
      "/goals": "Metas",
      "/categories": "Categorias",
      "/reports": "Relatórios",
      "/profile": "Meu Perfil",
      "/settings": "Configurações",
      "/wealth": "Patrimônio",
      "/market": "Mercado Cripto",
      "/market/stocks": "Ações e FIIs",
      "/login": "Entrar",
      "/register": "Criar Conta",
    };

    const pageTitle = routeTitles[location.pathname] || "Sistema";
    document.title = `${pageTitle} | FinTrack Pro`;
  }, [location]);

  // Automatic Transaction Notifications (Overdue & Today)
  useEffect(() => {
    if (!transactions.length || !user) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    setNotifications((prev) => {
      const currentNotifIds = new Set(prev.map((n) => n.id));
      const newNotifs = [];

      transactions.forEach((t) => {
        if (t.status !== "Pending") return;
        
        if (t.card_id) {
          const card = cards?.find(c => c.id === t.card_id);
          if (!card) return;
          
          const tDate = parseISO(t.date);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const due_day = card.due_day || 1;
          let dueDate;

          if (!card.closing_day) {
            // Se não tem dia de fechamento, o ciclo é o mês corrido
            let invoiceMonth = tDate.getMonth() + 1; // Vence no mês seguinte
            dueDate = new Date(tDate.getFullYear(), invoiceMonth, due_day);
          } else {
            const closing_day = card.closing_day;
            const closingInPreviousMonth = closing_day >= due_day;
            
            let cycleEndMonth = tDate.getMonth();
            let cycleEndYear = tDate.getFullYear();
            let cycleEndDay = closing_day - 1;
            
            const cycleEnd = new Date(cycleEndYear, cycleEndMonth, cycleEndDay);
            
            let dueMonth = cycleEndMonth;
            let dueYear = cycleEndYear;
            
            if (closingInPreviousMonth) dueMonth += 1;
            if (tDate > cycleEnd) dueMonth += 1;
            
            dueDate = new Date(dueYear, dueMonth, due_day);
          }
          
          dueDate.setHours(0, 0, 0, 0);
          
          if (today > dueDate) {
            const notifId = `notif-card-${card.id}-overdue`;
            if (!currentNotifIds.has(notifId)) {
              newNotifs.push({
                id: notifId,
                title: "⚠️ Fatura Atrasada",
                message: `A fatura do cartão ${card.name} está em atraso.`,
                type: "warning",
                date: new Date(),
                read: false,
              });
              currentNotifIds.add(notifId);
            }
          }
          return;
        }

        const tDate = parseISO(t.date);
        tDate.setHours(0, 0, 0, 0);

        const isOverdue = tDate < today;
        const isDueToday = tDate.getTime() === today.getTime();

        if (isOverdue || isDueToday) {
          const notifId = `notif-trans-${t.id}-${isOverdue ? "overdue" : "today"}`;
          if (!currentNotifIds.has(notifId)) {
            newNotifs.push({
              id: notifId,
              title: isOverdue ? "⚠️ Transação Atrasada" : "📅 Vence Hoje",
              message: `${t.type === "Income" ? "Receita" : "Despesa"}: ${t.description} - R$ ${Number(t.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
              type: isOverdue ? "warning" : "info",
              date: new Date(),
              read: false,
            });
            currentNotifIds.add(notifId);
          }
        }
      });

      if (newNotifs.length === 0) return prev;
      // Filter out old notifications for the same transaction to only keep the latest status
      const filteredPrev = prev.filter((n) => {
        if (!n.id?.toString().startsWith("notif-trans-")) return true;
        const transId = n.id.split("-")[2];
        return !newNotifs.some((nn) => nn.id.split("-")[2] === transId);
      });

      return [...newNotifs, ...filteredPrev];
    });
  }, [transactions, user]);

  const fetchUser = async () => {
    try {
      const res = await authFetch("/api/me");
      if (res.ok) {
        setUser(await res.json());
      }
    } catch (error) {
      console.error("Failed to fetch user");
    }
  };

  const fetchData = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      // 1. Verificação proativa de Pagamento (Fallback se webhook atrasar ou local)
      const urlParams = new URLSearchParams(window.location.search);
      const paymentStatus = urlParams.get('payment');
      const sessionId = urlParams.get('session_id');

      if (paymentStatus === 'success' && sessionId) {
        await authFetch('/api/checkout/verify', {
            method: 'POST',
            body: JSON.stringify({ session_id: sessionId })
        });
        
        // Limpa a URL para não refazer na próxima renderização
        window.history.replaceState({}, document.title, window.location.pathname);
        showToast("Pagamento confirmado com sucesso!");
      }

      // 2. Busca o plano do usuario
      const planRes = await authFetch("/api/plan");
      let planData = null;
      if (planRes.ok) {
          planData = await planRes.json();
          setUserPlan(planData.plan);
          
          // Se o plano for 'none', não tenta buscar os dados, para na tela de Pricing
          if (planData.plan === 'none') {
              setLoading(false);
              return;
          }
      }

      const dashRes = await authFetch("/api/dashboard");
      if (!dashRes.ok) throw new Error("Falha no dashboard");
      const dash = await dashRes.json();

      const transRes = await authFetch("/api/transactions");
      if (!transRes.ok) throw new Error("Falha nas transactions");
      const trans = await transRes.json();

      const accRes = await authFetch("/api/accounts");
      if (!accRes.ok) throw new Error("Falha nas accounts");
      const acc = await accRes.json();

      const catRes = await authFetch("/api/categories");
      if (!catRes.ok) throw new Error("Falha nas categories");
      const cat = await catRes.json();

      const cardRes = await authFetch("/api/cards");
      if (!cardRes.ok) throw new Error("Falha nos cards");
      const card = await cardRes.json();

      if (planData?.plan === 'premium') {
        const followRes = await authFetch("/api/share/following", { skipUpgradeModal: true });
        if (followRes.ok) setFollowing(await followRes.json());

        const budgetsRes = await authFetch("/api/budgets");
        if (budgetsRes.ok) setBudgets(await budgetsRes.json());

        const goalsRes = await authFetch("/api/goals");
        if (goalsRes.ok) setGoals(await goalsRes.json());
      } else {
        setFollowing([]);
        setBudgets([]);
        setGoals([]);
      }

      setData(dash);
      setTransactions(trans);
      setAccounts(acc);
      setCategories(cat);
      setCards(card);
    } catch (error) {
      console.error("Falha ao buscar dados", error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleUnfollow = async (id) => {
    try {
      const res = await authFetch(`/api/share/unfollow/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showToast("Parou de seguir!");
        fetchData();
      } else {
        showToast("Erro ao parar de seguir", "error");
      }
    } catch (error) {
      showToast("Erro de conexão", "error");
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-zinc-100 dark:bg-[#111313] z-[999] overflow-hidden">
        {/* Animated Background Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-fin-mint/20 dark:bg-fin-mint/10 rounded-full blur-[100px] animate-pulse"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fin-peach/20 dark:bg-fin-peach/10 rounded-full blur-[100px] animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>

        <div className="flex flex-col items-center relative z-10 animate-in fade-in zoom-in duration-700">
          <div className="relative mb-8">
            {/* Outer spinning ring */}
            <div
              className="absolute inset-0 rounded-[28px] border-2 border-transparent border-t-fin-mint border-r-fin-peach opacity-50 animate-spin"
              style={{ animationDuration: "3s" }}
            ></div>
            {/* Inner pulsing logo */}
            <div className="w-20 h-20 bg-fin-surface rounded-[24px] shadow-2xl flex items-center justify-center border border-zinc-900/10 dark:border-white/5 animate-pulse-glow">
              <Wallet
                size={36}
                className="text-fin-mint"
                fill="currentColor"
                strokeWidth={0}
              />
            </div>
          </div>
          <h1 className="text-2xl font-black tracking-tighter text-zinc-900 dark:text-white uppercase italic">
            FinTrack<span className="text-zinc-400 dark:text-zinc-600">.</span>
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium text-sm flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-fin-mint rounded-full animate-ping"></span>
            Sincronizando dados...
          </p>
        </div>
      </div>
    );
  }

  if (!token) {
    // Redireciona o usuário para a rota de login e impede que ele volte clicando na seta do navegador
    return <Navigate to="/login" replace />;
  }

  if (userPlan === "none" || location.pathname === "/pricing") {
    return (
        <PricingView 
            canGoBack={userPlan !== 'none'}
            onLogout={() => {
                setToken(null);
                setUser(null);
                localStorage.removeItem("token");
            }}
        />
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-950 p-4">
        <div className="bg-zinc-900 p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-zinc-800">
          <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-zinc-100">Sem Dados</h2>
          <p className="text-zinc-500 dark:text-zinc-400 mb-8">
            Não foi possível carregar os dados financeiros.
          </p>
          <button
            onClick={fetchData}
            className="w-full bg-fin-mint text-fin-bg font-bold py-4 rounded-2xl hover:brightness-110 transition-colors shadow-lg shadow-fin-mint/30"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  const isReadOnly = selectedProfile && user && selectedProfile.id !== user.id;

  return (
    <div className={cn(
        "min-h-screen bg-fin-bg text-fin-text font-sans flex font-['Inter'] overflow-x-hidden transition-colors duration-500",
        dashboardMode === "wealth" && "wealth-mode"
    )}>
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full bg-fin-bg border-r border-zinc-900/10 dark:border-white/5 z-20 hidden md:flex flex-col transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
          isSidebarCollapsed ? "w-20" : "w-[260px]",
        )}
      >
        <div
          className={cn(
            "p-8 flex items-center gap-3",
            isSidebarCollapsed && "justify-center p-6",
          )}
        >
          <div className="w-8 h-8 rounded-lg bg-fin-mint/10 flex flex-shrink-0 items-center justify-center text-fin-mint">
            <Wallet size={18} fill="currentColor" strokeWidth={0} />
          </div>
          {!isSidebarCollapsed && (
            <h1 className="text-xl font-black tracking-tighter text-zinc-900 dark:text-white uppercase italic transition-opacity duration-200">
              FinTrack
              <span className="text-zinc-400 dark:text-zinc-600">.</span>
            </h1>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto overflow-x-hidden custom-scrollbar">
          {dashboardMode === "finance" ? (
            <>
              <div
                className={cn(
                  "px-4 mt-2 mb-3 text-[10px] font-bold text-zinc-600 uppercase tracking-widest transition-opacity duration-200",
                  isSidebarCollapsed && "opacity-0 h-0 my-0 overflow-hidden",
                )}
              >
                Menu Principal
              </div>
              <NavItem
                id="nav-dashboard"
                icon={<LayoutDashboard size={20} />}
                label="Dashboard"
                active={location.pathname === "/"}
                onClick={() => navigate("/")}
                collapsed={isSidebarCollapsed}
              />
              <NavItem
                id="nav-accounts"
                icon={<Wallet size={20} />}
                label="Contas"
                active={location.pathname === "/accounts"}
                onClick={() => navigate("/accounts")}
                collapsed={isSidebarCollapsed}
              />
              <NavItem
                id="nav-transactions"
                icon={<ArrowRightLeft size={20} />}
                label="Transações"
                active={location.pathname === "/transactions"}
                onClick={() => navigate("/transactions")}
                collapsed={isSidebarCollapsed}
              />
              <NavItem
                id="nav-cards"
                icon={<CreditCard size={20} />}
                label="Cartões de Crédito"
                active={location.pathname === "/cards"}
                onClick={() => navigate("/cards")}
                collapsed={isSidebarCollapsed}
              />
              <NavItem
                id="nav-categories"
                icon={<Tag size={20} />}
                label="Categorias"
                active={location.pathname === "/categories"}
                onClick={() => navigate("/categories")}
                collapsed={isSidebarCollapsed}
              />

              <div
                className={cn(
                  "px-4 pt-6 pb-2 text-[10px] font-bold text-zinc-600 uppercase tracking-widest transition-opacity duration-200",
                  isSidebarCollapsed && "opacity-0 h-0 pt-0 pb-0 overflow-hidden",
                )}
              >
                Planejamento
              </div>
              <NavItem
                id="nav-budgets"
                icon={<PiggyBank size={20} />}
                label="Planejamentos"
                active={location.pathname === "/budgets"}
                onClick={() => navigate("/budgets")}
                collapsed={isSidebarCollapsed}
                isPremium={true}
              />
              <NavItem
                id="nav-goals"
                icon={<Target size={20} />}
                label="Metas"
                active={location.pathname === "/goals"}
                onClick={() => navigate("/goals")}
                collapsed={isSidebarCollapsed}
                isPremium={true}
              />
              <NavItem
                id="nav-debts"
                icon={<Banknote size={20} />}
                label="Dívidas"
                active={location.pathname === "/debts"}
                onClick={() => navigate("/debts")}
                collapsed={isSidebarCollapsed}
                isPremium={true}
              />
              <NavItem
                id="nav-reports"
                icon={<BarChart3 size={20} />}
                label="Relatórios"
                active={location.pathname === "/reports"}
                onClick={() => navigate("/reports")}
                collapsed={isSidebarCollapsed}
                isPremium={true}
              />
            </>
          ) : (
            <>
              <div
                className={cn(
                  "px-4 mt-2 mb-3 text-[10px] font-bold text-zinc-600 uppercase tracking-widest transition-opacity duration-200",
                  isSidebarCollapsed && "opacity-0 h-0 my-0 overflow-hidden",
                )}
              >
                Gestão de Patrimônio
              </div>
              <NavItem
                id="nav-wealth"
                icon={<Coins size={20} />}
                label="Visão Geral"
                active={location.pathname === "/wealth"}
                onClick={() => navigate("/wealth")}
                collapsed={isSidebarCollapsed}
                isPremium={true}
              />
              <NavItem
                id="nav-market-crypto"
                icon={<BarChart3 size={20} />}
                label="Mercado Cripto"
                active={location.pathname === "/market"}
                onClick={() => navigate("/market")}
                collapsed={isSidebarCollapsed}
                isPremium={true}
              />
              <NavItem
                id="nav-market-stocks"
                icon={<TrendingUp size={20} />}
                label="Ações e FIIs"
                active={location.pathname === "/market/stocks"}
                onClick={() => navigate("/market/stocks")}
                collapsed={isSidebarCollapsed}
                isPremium={true}
              />
              <NavItem
                id="nav-wealth-history"
                icon={<History size={20} />}
                label="Histórico Aportes"
                active={location.pathname === "/wealth/history"}
                onClick={() => navigate("/wealth/history")}
                collapsed={isSidebarCollapsed}
                isPremium={true}
              />
              <NavItem
                id="nav-wealth-reports"
                icon={<BarChart3 size={20} />}
                label="Relatórios"
                active={location.pathname === "/wealth/reports"}
                onClick={() => navigate("/wealth/reports")}
                collapsed={isSidebarCollapsed}
                isPremium={true}
              />
            </>
          )}

          <div
            className={cn(
              "px-4 pt-6 pb-2 text-[10px] font-bold text-zinc-600 uppercase tracking-widest transition-opacity duration-200",
              isSidebarCollapsed && "opacity-0 h-0 pt-0 pb-0 overflow-hidden",
            )}
          >
            Acesso Rápido
          </div>
          <NavItem
            id="nav-profile"
            icon={<User size={20} />}
            label="Perfil"
            active={location.pathname === "/profile"}
            onClick={() => navigate("/profile")}
            collapsed={isSidebarCollapsed}
          />
          <NavItem
            id="nav-settings"
            icon={<Settings size={20} />}
            label="Configurações"
            active={location.pathname === "/settings"}
            onClick={() => navigate("/settings")}
            collapsed={isSidebarCollapsed}
          />
          <NavItem
            id="nav-share"
            icon={<Users size={20} />}
            label="Compartilhar"
            active={isShareModalOpen}
            onClick={() => setIsShareModalOpen(true)}
            collapsed={isSidebarCollapsed}
            isPremium={true}
          />

          {user?.email === 'demo@fintrack.dev' && (
            <>
              <NavItem
                icon={<ShieldCheck size={20} />}
                label="Admin / Usuários"
                active={location.pathname === "/admin/users"}
                onClick={() => navigate("/admin/users")}
                collapsed={isSidebarCollapsed}
              />
              <NavItem
                icon={<FileText size={20} />}
                label="Gerenciar Blog"
                active={location.pathname === "/admin/blog"}
                onClick={() => navigate("/admin/blog")}
                collapsed={isSidebarCollapsed}
              />
            </>
          )}

          <div
            className={cn(
              "px-8 pt-6 pb-2 text-[10px] font-bold text-zinc-600 uppercase tracking-widest transition-opacity duration-200",
              isSidebarCollapsed && "opacity-0 h-0 pt-0 pb-0 overflow-hidden",
            )}
          >
            Perfis
          </div>
          <NavItem
            icon={<User size={20} />}
            label="Meu Painel"
            active={selectedProfile?.id === user?.id}
            onClick={() => setSelectedProfile(user)}
            collapsed={isSidebarCollapsed}
            variant="profile"
          />
          {following.map((follow) => (
            <NavItem
              key={follow.id}
              icon={
                <div
                  className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors",
                    selectedProfile?.id === follow.id
                      ? "bg-fin-mint text-fin-bg"
                      : "bg-fin-mint/20 text-fin-mint",
                  )}
                >
                  {follow.name.charAt(0)}
                </div>
              }
              label={follow.name}
              active={selectedProfile?.id === follow.id}
              onClick={() => setSelectedProfile(follow)}
              collapsed={isSidebarCollapsed}
              variant="profile"
            />
          ))}
        </nav>

        <div
          className={cn(
            "p-6 mt-auto border-t border-zinc-900/10 dark:border-white/5",
            isSidebarCollapsed && "p-4",
          )}
        >
          <div
            className={cn(
              "flex items-center gap-3",
              isSidebarCollapsed ? "justify-center" : "px-2",
            )}
          >
            <div className="w-10 h-10 rounded-full bg-zinc-800 flex flex-shrink-0 items-center justify-center font-bold text-fin-mint border-2 border-zinc-700">
              {user?.name?.charAt(0) || "U"}
            </div>
            {!isSidebarCollapsed && (
              <div className="flex-1 min-w-0 transition-opacity duration-200 flex items-center justify-between">
                <p className="font-semibold text-sm truncate text-zinc-900 dark:text-white mr-2">
                  {user?.name || "Usuário"}
                </p>
                <button
                  onClick={() => {
                    setToken(null);
                    setUser(null);
                    localStorage.setItem("token", "");
                  }}
                  title="Sair"
                  className="p-1.5 text-zinc-500 hover:text-[#ff7b7b] hover:bg-[#ff7b7b]/10 rounded-lg transition-colors flex-shrink-0"
                >
                  <LogOut size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
        {/* Toggle Button */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-3 top-10 w-6 h-6 bg-zinc-800 border border-zinc-700 rounded-full flex items-center justify-center text-zinc-400 hover:text-white transition-colors z-50 shadow-md"
        >
          {isSidebarCollapsed ? (
            <ChevronRight size={14} />
          ) : (
            <ChevronLeft size={14} />
          )}
        </button>
      </aside>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] md:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-80 bg-fin-bg z-[101] md:hidden flex flex-col shadow-2xl border-r border-zinc-900/10 dark:border-white/5"
            >
              <div className="p-8 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-fin-mint/10 flex items-center justify-center text-fin-mint">
                    <Wallet size={18} fill="currentColor" strokeWidth={0} />
                  </div>
                  <h1 className="text-xl font-black tracking-tighter text-zinc-900 dark:text-white uppercase italic">
                    FinTrack
                    <span className="text-zinc-400 dark:text-zinc-600">.</span>
                  </h1>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-xl hover:bg-zinc-900/10 dark:hover:bg-white/5 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {userPlan !== 'none' && user?.trial_ends_at && (
                <div className="px-6 mb-4">
                  <TrialBanner 
                    trialEndsAt={user.trial_ends_at} 
                    onUpgrade={() => {
                        navigate('/pricing');
                        setIsMobileMenuOpen(false);
                    }} 
                  />
                </div>
              )}

              <div className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
                {/* Mobile Dashboard Toggle - Ocultado temporariamente 
                <div className="px-4 py-4">
                    <div className="bg-zinc-900/5 dark:bg-white/5 p-1 rounded-2xl flex items-center relative border border-zinc-900/10 dark:border-white/5">
                        <motion.div
                            className="absolute h-[calc(100%-8px)] bg-fin-mint rounded-xl shadow-lg shadow-fin-mint/20"
                            initial={false}
                            animate={{
                                x: dashboardMode === "finance" ? 0 : "100%",
                                width: "50%",
                            }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                        <button
                            onClick={() => setDashboardMode("finance")}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 py-2.5 text-[10px] font-black uppercase tracking-tighter z-10 transition-colors duration-300",
                                dashboardMode === "finance" ? "text-fin-bg" : "text-zinc-500"
                            )}
                        >
                            <Banknote size={14} />
                            Finanças
                        </button>
                        <button
                            onClick={() => setDashboardMode("wealth")}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 py-2.5 text-[10px] font-black uppercase tracking-tighter z-10 transition-colors duration-300",
                                dashboardMode === "wealth" ? "text-fin-bg" : "text-zinc-500"
                            )}
                        >
                            <TrendingUp size={14} />
                            Patrimônio
                        </button>
                    </div>
                </div>
                */}

                {dashboardMode === "finance" ? (
                    <>
                        <div className="px-4 py-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                        Menu Principal
                        </div>
                        <NavItem
                        icon={<LayoutDashboard size={20} />}
                        label="Dashboard"
                        active={location.pathname === "/"}
                        onClick={() => {
                            navigate("/");
                            setIsMobileMenuOpen(false);
                        }}
                        />
                        <NavItem
                        icon={<Wallet size={20} />}
                        label="Contas"
                        active={location.pathname === "/accounts"}
                        onClick={() => {
                            navigate("/accounts");
                            setIsMobileMenuOpen(false);
                        }}
                        />
                        <NavItem
                        icon={<ArrowRightLeft size={20} />}
                        label="Transações"
                        active={location.pathname === "/transactions"}
                        onClick={() => {
                            navigate("/transactions");
                            setIsMobileMenuOpen(false);
                        }}
                        />
                        <NavItem
                        icon={<CreditCard size={20} />}
                        label="Cartões"
                        active={location.pathname === "/cards"}
                        onClick={() => {
                            navigate("/cards");
                            setIsMobileMenuOpen(false);
                        }}
                        />
                        <NavItem
                        icon={<Tag size={20} />}
                        label="Categorias"
                        active={location.pathname === "/categories"}
                        onClick={() => {
                            navigate("/categories");
                            setIsMobileMenuOpen(false);
                        }}
                        />

                        <div className="px-4 pt-4 pb-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                        Planejamento
                        </div>
                        <NavItem
                        icon={<PiggyBank size={20} />}
                        label="Planejamentos"
                        active={location.pathname === "/budgets"}
                        onClick={() => {
                            navigate("/budgets");
                            setIsMobileMenuOpen(false);
                        }}
                        isPremium={true}
                        />
                        <NavItem
                        icon={<Target size={20} />}
                        label="Metas"
                        active={location.pathname === "/goals"}
                        onClick={() => {
                            navigate("/goals");
                            setIsMobileMenuOpen(false);
                        }}
                        isPremium={true}
                        />
                        <NavItem
                        icon={<Banknote size={20} />}
                        label="Dívidas"
                        active={location.pathname === "/debts"}
                        onClick={() => {
                            navigate("/debts");
                            setIsMobileMenuOpen(false);
                        }}
                        isPremium={true}
                        />
                        <NavItem
                        icon={<BarChart3 size={20} />}
                        label="Relatórios"
                        active={location.pathname === "/reports"}
                        onClick={() => {
                            navigate("/reports");
                            setIsMobileMenuOpen(false);
                        }}
                        isPremium={true}
                        />
                    </>
                ) : (
                    <>
                        <div className="px-4 py-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                        Gestão de Patrimônio
                        </div>
                        <NavItem
                        icon={<Coins size={20} />}
                        label="Visão Geral"
                        active={location.pathname === "/wealth"}
                        onClick={() => {
                            navigate("/wealth");
                            setIsMobileMenuOpen(false);
                        }}
                        isPremium={true}
                        />
                        <NavItem
                        icon={<BarChart3 size={20} />}
                        label="Mercado Cripto"
                        active={location.pathname === "/market"}
                        onClick={() => {
                            navigate("/market");
                            setIsMobileMenuOpen(false);
                        }}
                        isPremium={true}
                        />
                        <NavItem
                        icon={<TrendingUp size={20} />}
                        label="Ações e FIIs"
                        active={location.pathname === "/market/stocks"}
                        onClick={() => {
                            navigate("/market/stocks");
                            setIsMobileMenuOpen(false);
                        }}
                        isPremium={true}
                        />
                        <NavItem
                        icon={<History size={20} />}
                        label="Histórico de Aportes"
                        active={location.pathname === "/wealth/history"}
                        onClick={() => {
                            navigate("/wealth/history");
                            setIsMobileMenuOpen(false);
                        }}
                        isPremium={true}
                        />
                        <NavItem
                        icon={<BarChart3 size={20} />}
                        label="Relatórios"
                        active={location.pathname === "/wealth/reports"}
                        onClick={() => {
                            navigate("/wealth/reports");
                            setIsMobileMenuOpen(false);
                        }}
                        isPremium={true}
                        />
                    </>
                )}

                <div className="px-4 pt-4 pb-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  Acesso Rápido
                </div>
                <NavItem
                  icon={<Settings size={20} />}
                  label="Configurações"
                  active={location.pathname === "/settings"}
                  onClick={() => {
                    navigate("/settings");
                    setIsMobileMenuOpen(false);
                  }}
                />
                <NavItem
                  icon={<User size={20} />}
                  label="Perfil"
                  active={location.pathname === "/profile"}
                  onClick={() => {
                    navigate("/profile");
                    setIsMobileMenuOpen(false);
                  }}
                />
                <NavItem
                  icon={<Users size={20} />}
                  label="Compartilhar"
                  active={isShareModalOpen}
                  onClick={() => {
                    setIsShareModalOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  isPremium={true}
                />

                {user?.email === 'demo@fintrack.dev' && (
                  <>
                    <NavItem
                      icon={<ShieldCheck size={20} />}
                      label="Admin / Usuários"
                      active={location.pathname === "/admin/users"}
                      onClick={() => {
                        navigate("/admin/users");
                        setIsMobileMenuOpen(false);
                      }}
                    />
                    <NavItem
                      icon={<FileText size={20} />}
                      label="Gerenciar Blog"
                      active={location.pathname === "/admin/blog"}
                      onClick={() => {
                        navigate("/admin/blog");
                        setIsMobileMenuOpen(false);
                      }}
                    />
                  </>
                )}

                <div className="px-4 pt-4 pb-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  Perfis
                </div>
                <NavItem
                  icon={<User size={20} />}
                  label="Meu Painel"
                  active={selectedProfile?.id === user?.id}
                  onClick={() => {
                    setSelectedProfile(user);
                    setIsMobileMenuOpen(false);
                  }}
                  variant="profile"
                />
                {following.map((follow) => (
                  <NavItem
                    key={follow.id}
                    icon={
                      <div
                        className={cn(
                          "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors",
                          selectedProfile?.id === follow.id
                            ? "bg-fin-mint text-fin-bg"
                            : "bg-fin-mint/20 text-fin-mint",
                        )}
                      >
                        {follow.name.charAt(0)}
                      </div>
                    }
                    label={follow.name}
                    active={selectedProfile?.id === follow.id}
                    onClick={() => {
                      setSelectedProfile(follow);
                      setIsMobileMenuOpen(false);
                    }}
                    variant="profile"
                  />
                ))}
              </div>

              <div className="p-6 border-t border-zinc-900/10 dark:border-white/5 space-y-4">
                <div className="flex items-center gap-3 px-2">
                  <div className="w-10 h-10 rounded-full bg-zinc-800 flex flex-shrink-0 items-center justify-center font-bold text-fin-mint border-2 border-zinc-700">
                    {user?.name?.charAt(0) || "U"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate text-zinc-900 dark:text-white">
                      {user?.name || "Usuário"}
                    </p>
                    <p className="text-[10px] text-zinc-500 truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setToken(null);
                    setUser(null);
                    localStorage.setItem("token", "");
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#ff7b7b]/10 text-[#ff7b7b] rounded-2xl font-bold text-sm border border-[#ff7b7b]/20 hover:bg-[#ff7b7b]/20 transition-all"
                >
                  <LogOut size={16} />
                  Sair do Sistema
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main
        className={cn(
          "flex-1 p-3 md:p-10 pb-24 md:pb-10 min-w-0 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
          isSidebarCollapsed ? "md:ml-20 md:w-[calc(100%-80px)]" : "md:ml-[260px] md:w-[calc(100%-260px)]",
        )}
      >
        <div 
          className={cn(
            "mx-auto transition-all duration-300 w-full",
            isSidebarCollapsed ? "max-w-[1600px]" : "max-w-[1400px]"
          )}
        >
          {userPlan !== 'none' && user?.trial_ends_at && (
            <div className="hidden md:block">
              <TrialBanner 
                trialEndsAt={user.trial_ends_at} 
                onUpgrade={() => navigate('/pricing')} 
              />
            </div>
          )}

        {/* Mobile Header */}
        <header className="flex md:hidden items-center justify-between mb-6">
          <button
            id="mobile-menu-button"
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-3 rounded-xl bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors min-h-[44px] text-zinc-900 dark:text-white"
            aria-label="Abrir menu"
          >
            <Menu size={20} />
          </button>
          <h1 className="text-lg font-black text-zinc-900 dark:text-white uppercase italic">
            FinTrack
          </h1>
          <a
            href="https://wa.me/18005550199?text=Olá Yuri, estou no sistema do FinTrack e preciso de suporte."
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-xl bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors min-h-[44px] text-zinc-900 dark:text-white flex items-center justify-center"
            title="Suporte via WhatsApp"
          >
            <MessageCircle size={20} />
          </a>
        </header>
        <header className="hidden md:flex items-center justify-between mb-10">
          <div className="flex-1 max-w-md relative group">
            <div className="relative">
              <input
                id="step-search"
                ref={searchRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (filteredCommands.length > 0) {
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setSearchIndex(
                        (prev) => (prev + 1) % filteredCommands.length,
                      );
                    } else if (e.key === "ArrowUp") {
                      e.preventDefault();
                      setSearchIndex(
                        (prev) =>
                          (prev - 1 + filteredCommands.length) %
                          filteredCommands.length,
                      );
                    } else if (e.key === "Enter") {
                      e.preventDefault();
                      filteredCommands[searchIndex].action();
                      setSearchTerm("");
                    } else if (e.key === "Escape") {
                      setSearchTerm("");
                    }
                  }
                }}
                placeholder="Pesquisar ou digitar comando"
                className="w-full bg-fin-surface border border-zinc-900/10 dark:border-white/5 rounded-2xl py-3 pl-12 pr-12 text-sm text-zinc-900 dark:text-white placeholder-zinc-500 focus:outline-none focus:border-fin-mint/30 dark:focus:border-fin-mint/20 focus:ring-4 focus:ring-fin-mint/5 transition-all group-hover:bg-zinc-100 dark:group-hover:bg-white/[0.04]"
              />
              <LayoutDashboard
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 dark:text-zinc-500"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-zinc-900/10 dark:bg-white/5 rounded-md px-2 py-1 flex items-center border border-zinc-900/10 dark:border-white/5">
                <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-500">
                  K
                </span>
              </div>
            </div>

            {filteredCommands.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-fin-surface border border-zinc-900/10 dark:border-white/5 rounded-3xl shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-2 border-b border-zinc-900/10 dark:border-white/5 bg-zinc-200/30 dark:bg-black/10">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest px-3">
                    Comandos Sugeridos
                  </span>
                </div>
                <div className="p-2">
                  {filteredCommands.map((cmd, idx) => (
                    <button
                      key={cmd.id}
                      onClick={() => {
                        cmd.action();
                        setSearchTerm("");
                      }}
                      onMouseEnter={() => setSearchIndex(idx)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 text-left",
                        idx === searchIndex
                          ? "bg-fin-mint text-fin-bg"
                          : "text-zinc-700 dark:text-zinc-400 hover:bg-zinc-900/5 dark:hover:bg-white/5",
                      )}
                    >
                      <div
                        className={cn(
                          "w-8 h-8 rounded-xl flex items-center justify-center transition-colors",
                          idx === searchIndex
                            ? "bg-fin-bg/10 text-fin-bg"
                            : "bg-fin-mint/10 text-fin-mint",
                        )}
                      >
                        {cmd.icon}
                      </div>
                      <span className="font-bold text-sm flex-1">
                        {cmd.label}
                      </span>
                      {idx === searchIndex && (
                        <div className="flex items-center gap-1 bg-fin-bg/10 px-1.5 py-0.5 rounded text-[10px] font-bold">
                          <CornerDownLeft size={10} /> ENTER
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 ml-8 relative">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 leading-none mb-1">Saldo Global</span>
              <span className="text-lg font-bold text-fin-mint leading-none">
                R$ {(Math.abs(globalBalance) < 0.005 ? 0 : Number(globalBalance)).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </div>

            <a
              href="https://wa.me/18005550199?text=Olá Yuri, estou no sistema do FinTrack e preciso de suporte."
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-full transition-all border bg-fin-surface text-zinc-500 dark:text-zinc-400 hover:text-fin-mint border-zinc-900/10 dark:border-white/5 hover:bg-zinc-900/5 dark:hover:bg-white/5"
              title="Suporte via WhatsApp"
            >
              <MessageCircle size={20} />
            </a>

            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className={cn(
                "relative p-2.5 rounded-full transition-all border",
                isNotificationsOpen
                  ? "bg-fin-mint text-fin-bg border-fin-mint"
                  : "bg-fin-surface text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border-zinc-900/10 dark:border-white/5 hover:bg-zinc-900/5 dark:hover:bg-white/5",
              )}
            >
              <Bell size={20} />
              {notifications.some((n) => !n.read) && (
                <div className="absolute top-2 right-2 w-2 h-2 bg-fin-peach rounded-full border-2 border-fin-surface"></div>
              )}
            </button>

            {isNotificationsOpen && (
              <NotificationPopover
                notifications={notifications}
                onClose={() => setIsNotificationsOpen(false)}
                onMarkAsRead={(id) => {
                  setNotifications((prev) =>
                    prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
                  );
                }}
              />
            )}
          </div>
        </header>


        {localStorage.getItem('admin_token') && (
          <div className="mb-6 bg-amber-500/10 border border-amber-500/20 p-4 rounded-3xl flex items-center justify-between animate-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-3 text-amber-500">
              <ShieldAlert size={20} />
              <p className="text-sm font-bold">Você está visualizando o sistema como <span className="underline">{user?.name}</span> (Modo Representação)</p>
            </div>
            <button 
              onClick={() => {
                const adminToken = localStorage.getItem('admin_token');
                localStorage.setItem('token', adminToken);
                localStorage.removeItem('admin_token');
                window.location.href = '/admin/users';
              }}
              className="bg-amber-500 text-fin-bg px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest hover:brightness-110 transition-all flex items-center gap-2"
            >
              <LogOut size={14} /> Sair da Representação
            </button>
          </div>
        )}

        <Suspense fallback={<div className="flex justify-center items-center py-20 w-full"><div className="w-8 h-8 border-2 border-fin-mint border-t-transparent rounded-full animate-spin"></div></div>}>
        <Routes>
          <Route
            path="/"
            element={
              <Dashboard
                fetchData={fetchData}
                showToast={showToast}
                onEdit={openTransactionModal}
                onNavigate={(tab, filters) => {
                  const routesMap = {
                    transactions: "transactions",
                    accounts: "accounts",
                    cards: "cards",
                    categories: "categories",
                    reports: "reports",
                    settings: "settings",
                  };
                  navigate(routesMap[tab] || "/");
                  setTransactionFilters(filters);
                }}
                searchTerm={searchTerm}
              />
            }
          />

          <Route
            path="transactions"
            element={
              <TransactionsView
                fetchData={fetchData}
                onEdit={openTransactionModal}
                showToast={showToast}
                showConfirm={showConfirm}
                initialFilters={transactionFilters}
                isReadOnly={isReadOnly}
                searchTerm={searchTerm}
              />
            }
          />

          <Route
            path="accounts"
            element={
              <AccountsView
                fetchData={fetchData}
                showToast={showToast}
                showConfirm={showConfirm}
                isReadOnly={isReadOnly}
                searchTerm={searchTerm}
              />
            }
          />

          <Route
            path="cards"
            element={
              <CardsView
                fetchData={fetchData}
                showToast={showToast}
                showConfirm={showConfirm}
                isReadOnly={isReadOnly}
                searchTerm={searchTerm}
              />
            }
          />

          <Route
            path="budgets"
            element={
              <BudgetsView
                fetchData={fetchData}
                showToast={showToast}
                showConfirm={showConfirm}
                isReadOnly={isReadOnly}
                onNavigateToTransactions={(filters) => {
                  setTransactionFilters(filters);
                  navigate("/transactions");
                }}
              />
            }
          />

          <Route
            path="goals"
            element={
              <GoalsView
                fetchData={fetchData}
                showToast={showToast}
                showConfirm={showConfirm}
                isReadOnly={isReadOnly}
                onDeposit={openTransactionModal}
              />
            }
          />

          <Route
            path="categories"
            element={
              <CategoriesView
                fetchData={fetchData}
                showToast={showToast}
                showConfirm={showConfirm}
                isReadOnly={isReadOnly}
                searchTerm={searchTerm}
              />
            }
          />

          <Route path="reports" element={<ReportsView />} />

          <Route
            path="profile"
            element={
              <ProfileView
                user={user}
                setUser={setUser}
                userPlan={userPlan}
                onUpgrade={(feature = "Troca de Plano") => {
                  setUpgradeFeatureName(feature);
                  setIsUpgradeModalOpen(true);
                }}
                authFetch={authFetch}
                showToast={showToast}
              />
            }
          />
          <Route
            path="settings"
            element={
              <SettingsView
                theme={theme}
                setTheme={setTheme}
                user={user}
                setUser={setUser}
                setToken={setToken}
                authFetch={authFetch}
                showToast={showToast}
              />
            }
          />

          <Route 
            path="admin/users" 
            element={user?.email === 'demo@fintrack.dev' ? <AdminUsersView showConfirm={showConfirm} showToast={showToast} /> : <Navigate to="/" replace />} 
          />
          <Route 
            path="admin/blog" 
            element={user?.email === 'demo@fintrack.dev' ? <AdminBlogView /> : <Navigate to="/" replace />} 
          />
          <Route 
            path="debts" 
            element={<DebtsView showConfirm={showConfirm} showToast={showToast} />} 
          />
          <Route
            path="/wealth"
            element={
              <WealthView
                authFetch={authFetch}
                showToast={showToast}
                showConfirm={showConfirm}
              />
            }
          />
          <Route
            path="/wealth/reports"
            element={
              <WealthReportsView
                authFetch={authFetch}
                showToast={showToast}
              />
            }
          />
          <Route
            path="/market"
            element={
              <CryptoMarket
                authFetch={authFetch}
                showToast={showToast}
              />
            }
          />
          <Route
            path="/market/crypto/:id"
            element={
              <CryptoDetails
                authFetch={authFetch}
                showToast={showToast}
              />
            }
          />
          <Route
            path="/wealth/history"
            element={
              <AssetHistoryView
                authFetch={authFetch}
                showToast={showToast}
                showConfirm={showConfirm}
              />
            }
          />
          <Route
            path="/market/stocks"
            element={
              <StockMarket
                authFetch={authFetch}
                showToast={showToast}
              />
            }
          />
        </Routes>
        </Suspense>
        </div>
      </main>

      {/* Mobile Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-fin-surface border-t border-zinc-900/10 dark:border-white/5 p-2 pb-safe grid grid-cols-5 md:hidden z-30 items-center">
        <MobileNavItem
          icon={<LayoutDashboard size={24} />}
          label="Dashboard"
          active={location.pathname === "/"}
          onClick={() => navigate("/")}
        />
        <MobileNavItem
          icon={<ArrowRightLeft size={24} />}
          label="Transações"
          active={location.pathname === "/transactions"}
          onClick={() => navigate("/transactions")}
        />

        {/* O botão central de nova transação continua igual, pois ele só abre o modal */}
        <div className="relative flex flex-col items-center">
          <button
            onClick={() => setIsSpeedDialOpen(!isSpeedDialOpen)}
            className={cn(
              "w-14 h-14 rounded-full flex items-center justify-center text-fin-bg -mt-8 shadow-2xl shadow-fin-mint/20 border-4 transition-all duration-300",
              isSpeedDialOpen ? "bg-zinc-800 border-zinc-700" : "bg-fin-mint border-fin-bg"
            )}
          >
            <Plus size={28} strokeWidth={3} className={cn("transition-transform duration-300", isSpeedDialOpen && "rotate-45 text-white")} />
          </button>
          <span className={cn(
            "text-[10px] font-bold uppercase tracking-wider leading-none mt-1 transition-colors",
            isSpeedDialOpen ? "text-fin-mint" : "text-zinc-500"
          )}>
            Novo
          </span>
          
          <AnimatePresence>
            {isSpeedDialOpen && (
              <>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsSpeedDialOpen(false)}
                  className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[-1]"
                />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute bottom-24 left-1/2 -translate-x-1/2 flex flex-col gap-3 items-center min-w-[200px]"
                >
                  <button
                    onClick={() => { openTransactionModal(null, "Income"); setIsSpeedDialOpen(false); }}
                    className="w-full flex items-center justify-center gap-3 bg-white dark:bg-zinc-900 border border-zinc-900/10 dark:border-white/10 p-3 rounded-2xl shadow-xl text-fin-mint font-bold"
                  >
                    <ArrowDownLeft size={20} /> <span className="text-zinc-900 dark:text-zinc-100 whitespace-nowrap">Receita</span>
                  </button>
                  <button
                    onClick={() => { openTransactionModal(null, "Expense"); setIsSpeedDialOpen(false); }}
                    className="w-full flex items-center justify-center gap-3 bg-white dark:bg-zinc-900 border border-zinc-900/10 dark:border-white/10 p-3 rounded-2xl shadow-xl text-red-500 font-bold"
                  >
                    <ArrowUpRight size={20} /> <span className="text-zinc-900 dark:text-zinc-100 whitespace-nowrap">Despesa</span>
                  </button>
                  <button
                    onClick={() => { openTransactionModal(null, "Transfer"); setIsSpeedDialOpen(false); }}
                    className="w-full flex items-center justify-center gap-3 bg-white dark:bg-zinc-900 border border-zinc-900/10 dark:border-white/10 p-3 rounded-2xl shadow-xl text-blue-500 font-bold"
                  >
                    <ArrowRightLeft size={20} /> <span className="text-zinc-900 dark:text-zinc-100 whitespace-nowrap">Transf.</span>
                  </button>
                  <button
                    onClick={() => { openTransactionModal(null, "GoalDeposit"); setIsSpeedDialOpen(false); }}
                    className="w-full flex items-center justify-center gap-3 bg-white dark:bg-zinc-900 border border-zinc-900/10 dark:border-white/10 p-3 rounded-2xl shadow-xl text-fin-mint font-bold"
                  >
                    <Target size={20} /> <span className="text-zinc-900 dark:text-zinc-100 whitespace-nowrap">Investir em Meta</span>
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <MobileNavItem
          icon={<CreditCard size={24} />}
          label="Cartão"
          active={location.pathname === "/cards"}
          onClick={() => navigate("/cards")}
        />
        <MobileNavItem
          icon={<Settings size={24} />}
          label="Config."
          active={location.pathname === "/settings"}
          onClick={() => navigate("/settings")}
        />
      </nav>

      {/* Floating Action Button (FAB) - Desktop Only */}
      {!isReadOnly && (
        <div className="hidden lg:block fixed bottom-8 right-8 z-[90]">
          <div className="relative flex flex-col items-end">
            <AnimatePresence>
              {isSpeedDialOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="absolute bottom-20 right-0 flex flex-col gap-3 items-end"
                >
                  {[
                    { id: "GoalDeposit", label: "Investir em Meta", icon: <Target size={20} />, color: "bg-white dark:bg-zinc-900 text-fin-mint" },
                    { id: "Transfer", label: "Nova Transferência", icon: <ArrowRightLeft size={20} />, color: "bg-white dark:bg-zinc-900 text-blue-500" },
                    { id: "Income", label: "Nova Receita", icon: <ArrowDownLeft size={20} />, color: "bg-white dark:bg-zinc-900 text-fin-mint" },
                    { id: "Expense", label: "Nova Despesa", icon: <ArrowUpRight size={20} />, color: "bg-white dark:bg-zinc-900 text-red-500" },
                  ].map((action, idx) => (
                    <motion.button
                      key={action.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => {
                        openTransactionModal(null, action.id);
                        setIsSpeedDialOpen(false);
                      }}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl font-bold border border-zinc-900/10 dark:border-white/10 transition-all group hover:scale-105",
                        action.color
                      )}
                    >
                      <span className="text-xs uppercase tracking-widest text-zinc-900 dark:text-zinc-100 transition-opacity whitespace-nowrap">
                        {action.label}
                      </span>
                      {action.icon}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              id="step-add"
              onClick={() => setIsSpeedDialOpen(!isSpeedDialOpen)}
              className={cn(
                "w-16 h-16 flex-shrink-0 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 border-2 relative z-10",
                isSpeedDialOpen 
                  ? "bg-zinc-800 border-zinc-700 text-white" 
                  : "bg-fin-mint border-fin-mint/20 text-fin-bg shadow-fin-mint/40"
              )}
            >
              <Plus 
                size={32} 
                strokeWidth={3} 
                className={cn("transition-transform duration-300", isSpeedDialOpen && "rotate-45")}
              />
            </motion.button>
          </div>
        </div>
      )}

      {/* Modals */}
      <Suspense fallback={null}>
      {isTransactionModalOpen && (
        <TransactionModal
          onClose={closeTransactionModal}
          onSuccess={() => fetchData()}
          onOptimisticUpdate={(data, isEditing, mode) => {
            if (isEditing) {
              if (mode === "all_pending") {
                setTransactions((prev) =>
                  prev.map((t) => {
                    if (t.id === data.id) return { ...t, ...data };
                    if (
                      t.parent_id === data.parent_id &&
                      t.status === "Pending" &&
                      t.date >= data.date
                    ) {
                      const { date, installment_number, status, ...rest } = data;
                      return { ...t, ...rest };
                    }
                    return t;
                  }),
                );
              } else {
                setTransactions((prev) =>
                  prev.map((t) => (t.id === data.id ? { ...t, ...data } : t)),
                );
              }
            } else {
              setTransactions((prev) => [
                { ...data, id: Date.now() },
                ...prev,
              ]);
            }
          }}
          accounts={accounts}
          categories={categories}
          cards={cards}
          goals={goals}
          initialData={editingTransaction}
          initialType={modalInitialType}
        />
      )}

      <ConfirmModal
        isOpen={confirmDialog.isOpen}
        onClose={closeConfirm}
        onConfirm={() => {
          if (confirmDialog.onConfirm) confirmDialog.onConfirm();
          closeConfirm();
        }}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant={confirmDialog.variant}
        confirmLabel={confirmDialog.confirmLabel}
        cancelLabel={confirmDialog.cancelLabel}
      />

      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        featureName={upgradeFeatureName}
      />

      {toast && (
        <div
          className={cn(
            "fixed bottom-6 right-6 p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 z-[100] border",
            toast.type === "success"
              ? "bg-fin-mint text-fin-bg border-fin-mint/30 shadow-fin-mint/20"
              : "bg-[#ff7b7b] text-fin-bg border-[#ff7b7b]/30 shadow-[#ff7b7b]/20",
          )}
        >
          {toast.type === "success" ? (
            <CheckCircle2 size={24} />
          ) : (
            <AlertCircle size={24} />
          )}
          <p className="font-bold">{toast.message}</p>
          <button
            onClick={() => setToast(null)}
            className="ml-2 opacity-70 hover:opacity-100 transition-opacity"
          >
            <Plus size={20} className="rotate-45" />
          </button>
        </div>
      )}

      {isShareModalOpen && (
        <ShareModal
          user={user}
          following={following}
          onFollow={() => fetchData()}
          onUnfollow={handleUnfollow}
          onClose={() => setIsShareModalOpen(false)}
          authFetch={authFetch}
          showToast={showToast}
        />
      )}
      </Suspense>
    </div>
  );
}

function NavItem({
  id,
  icon,
  label,
  active,
  onClick,
  collapsed,
  variant = "nav",
  isPremium = false,
}) {
  const isProfile = variant === "profile";
  const { userPlan } = useFinStore();
  const { user } = useFinStore();
  const isLocked = isPremium && userPlan === "basic" && user?.email !== 'demo@fintrack.dev';

  const handleClick = (e) => {
    if (isLocked) {
      e.preventDefault();
      window.dispatchEvent(
        new CustomEvent("requireUpgrade", {
          detail: `A funcionalidade ${label} é exclusiva do Plano Premium.`,
        }),
      );
      return;
    }
    if (onClick) onClick(e);
  };

  return (
    <button
      id={id}
      onClick={handleClick}
      title={collapsed ? label : undefined}
      className={cn(
        "w-full flex items-center gap-3 py-3 rounded-2xl font-semibold transition-all duration-200 group relative cursor-pointer active:scale-98",
        collapsed ? "justify-center px-0" : "px-4",
        active
          ? isProfile
            ? "bg-zinc-900/5 dark:bg-white/5 text-zinc-900 dark:text-white font-bold"
            : "bg-fin-mint text-fin-bg font-bold shadow-lg shadow-fin-mint/10"
          : "text-zinc-600 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-900/10 dark:hover:bg-white/5",
        isLocked && "opacity-80",
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center min-w-[20px] transition-transform duration-200",
          active
            ? isProfile
              ? "text-fin-mint"
              : "text-fin-bg"
            : "text-zinc-600 dark:text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-200",
          collapsed && !active && "group-hover:scale-110",
        )}
      >
        {icon}
      </div>
      {!collapsed && (
        <div className="flex-1 flex items-center justify-between min-w-0">
          <span
            className={cn(
              "transition-opacity duration-200 text-left flex-1 whitespace-nowrap overflow-hidden text-ellipsis",
              active && isProfile && "text-fin-mint",
            )}
          >
            {label}
          </span>
          {isPremium && (
            <span
              className={cn(
                "ml-2 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter shrink-0",
                active
                  ? "bg-fin-bg/20 text-fin-bg"
                  : "bg-fin-mint/10 text-fin-mint border border-fin-mint/20",
              )}
            >
              PRO
            </span>
          )}
        </div>
      )}
      {active && isProfile && !collapsed && (
        <div className="w-1.5 h-1.5 rounded-full bg-fin-mint absolute right-4 animate-in fade-in zoom-in duration-300"></div>
      )}
    </button>
  );
}

function NotificationPopover({ notifications, onClose, onMarkAsRead }) {
  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-fin-surface border border-zinc-900/10 dark:border-white/5 rounded-3xl shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="p-5 border-b border-zinc-900/10 dark:border-white/5 flex items-center justify-between bg-zinc-200/50 dark:bg-black/20">
        <h3 className="font-bold text-zinc-900 dark:text-white">
          Notificações
        </h3>
        <span className="text-[10px] font-bold bg-fin-mint/20 text-fin-mint px-2 py-0.5 rounded-full">
          {notifications.filter((n) => !n.read).length} Novas
        </span>
      </div>
      <div className="max-h-96 overflow-y-auto custom-scrollbar">
        {notifications.length === 0 ? (
          <div className="p-10 text-center text-zinc-500">
            <AlertCircle size={32} className="mx-auto mb-2 opacity-20" />
            <p className="text-sm font-medium">Nenhuma notificação</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-900/5 dark:divide-white/5">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={cn(
                  "p-4 hover:bg-zinc-900/5 dark:hover:bg-white/5 transition-colors cursor-pointer relative group",
                  !n.read && "bg-fin-mint/5",
                )}
                onClick={() => onMarkAsRead(n.id)}
              >
                {!n.read && (
                  <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-fin-mint rounded-full"></div>
                )}
                <div className="flex justify-between items-start mb-1">
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-white leading-tight pr-4">
                    {n.title}
                  </h4>
                  <span className="text-[10px] text-zinc-500 whitespace-nowrap">
                    {format(n.date, "HH:mm", { locale: ptBR })}
                  </span>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">
                  {n.message}
                </p>
                {n.type === "tip" && (
                  <div className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-fin-mint uppercase tracking-wider">
                    <Star size={10} fill="currentColor" /> Dica do Sistema
                  </div>
                )}
                {n.type === "warning" && (
                  <div className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-[#ff7b7b] uppercase tracking-wider">
                    <AlertCircle size={10} fill="currentColor" /> Urgente
                  </div>
                )}
                {n.type === "info" && (
                  <div className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-fin-mint uppercase tracking-wider">
                    <Calendar size={10} fill="currentColor" /> Lembrete
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="p-3 bg-zinc-200/30 dark:bg-black/10 text-center">
        <button className="text-[11px] font-bold text-zinc-500 hover:text-fin-mint transition-colors uppercase tracking-widest">
          Ver todas as notificações
        </button>
      </div>
    </div>
  );
}

function MobileNavItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-1 transition-all duration-300 w-full py-1.5 min-h-[48px] active:scale-95",
        active
          ? "text-fin-mint"
          : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white",
      )}
    >
      <div className={cn(
        "p-1.5 rounded-xl transition-all duration-300",
        active && "bg-fin-mint/10"
      )}>
        {icon}
      </div>
      <span className="text-[9px] font-bold uppercase tracking-wider leading-none">
        {label}
      </span>
    </button>
  );
}
