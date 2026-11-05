import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  RefreshCw,
  TrendingUp,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Lock,
  Crown,
  Globe,
  PieChart,
  ChevronLeft,
  ChevronRight,
  Building2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { assetApi } from "../api/assetApi";
import { Link } from "react-router-dom";
import LoadingState from "../components/ui/LoadingState";
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";
import { cn } from "../utils/classNames";

export default function StockMarket({ authFetch, showToast }) {
  const [stocks, setStocks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [currentCategory, setCurrentCategory] = useState("stock"); // Default to Ações
  const PER_PAGE = 20;

  const api = React.useMemo(() => assetApi(authFetch), [authFetch]);

  const categories = [
    { id: "all", label: "Todos", icon: Globe },
    { id: "stock", label: "Ações", icon: TrendingUp },
    { id: "fund", label: "FIIs", icon: Building2 },
    { id: "bdr", label: "BDRs", icon: BarChart3 },
    { id: "etf", label: "ETFs", icon: PieChart },
    { id: "index", label: "Índices", icon: BarChart3 },
    { id: "currency", label: "Câmbio", icon: Globe },
  ];

  // Handle Search Debounce
  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }
  };

  const fetchMarketData = useCallback(async (page = 1, search = "", category = "stock", silent = false) => {
    if (!silent) setIsLoading(true);
    setAccessDenied(false);

    try {
      const response = await api.getStockMarket(page, search, category, PER_PAGE);
      setStocks(response.data || []);
      setTotalPages(response.last_page || 1);
      
      // Scroll to top on page change if not a silent refresh
      if (!silent && !search) window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      if (error.status === 403) {
        setAccessDenied(true);
      } else {
        showToast("Erro ao carregar dados do mercado tradicional", "error");
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [api, showToast]);

  useEffect(() => {
    fetchMarketData(currentPage, debouncedSearchTerm, currentCategory);
  }, [currentPage, debouncedSearchTerm, currentCategory, fetchMarketData]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchMarketData(currentPage, debouncedSearchTerm, currentCategory, true);
  };

  const handleCategoryChange = (catId) => {
    setCurrentCategory(catId);
    setCurrentPage(1);
  };

  const formatCurrency = (value, category) => {
    if (category === 'currency') {
      return Number(value).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: 4
      });
    }
    return Number(value).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const formatLargeNumber = (value) => {
    if (value === undefined || value === null || value === 0) return "-";
    return Number(value).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    });
  };

  const PercentageChange = ({ value }) => {
    if (value === undefined || value === null) return <span className="text-zinc-500">-</span>;
    const isPositive = value >= 0;
    return (
      <span className={`flex items-center justify-end gap-0.5 font-semibold text-sm ${isPositive ? "text-emerald-500" : "text-red-500"}`}>
        {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
        {Math.abs(value).toFixed(2)}%
      </span>
    );
  };

  const getPageNumbers = () => {
    const range = 2; // Number of pages on each side of currentPage
    const pages = [];
    const minPage = Math.max(1, currentPage - range);
    const maxPage = Math.min(totalPages, currentPage + range);
    
    for (let i = minPage; i <= maxPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  if (isLoading && stocks.length === 0) {
    return (
      <LoadingState 
        message="Sincronizando B3 Market..." 
        color="pink" 
        minHeight="500px" 
      />
    );
  }

  if (accessDenied) {
    return (
      <div className="min-h-[600px] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-xl w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-[48px] p-10 text-center shadow-2xl relative overflow-hidden"
        >
          {/* Decorative gradients */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-fin-pink via-fin-mint to-fin-purple"></div>
          
          <div className="mb-8 relative inline-block">
            <div className="p-6 bg-zinc-100 dark:bg-zinc-800 rounded-[32px] border border-zinc-200 dark:border-white/10 relative z-10">
              <Lock className="text-zinc-400 dark:text-zinc-500" size={48} />
            </div>
            <div className="absolute -top-3 -right-3 p-3 bg-fin-pink rounded-2xl shadow-lg shadow-fin-pink/30 z-20">
              <Crown className="text-white" size={20} />
            </div>
            <div className="absolute inset-0 blur-3xl bg-fin-pink/20 rounded-full"></div>
          </div>

          <h2 className="text-3xl font-black text-zinc-900 dark:text-white uppercase italic tracking-tight mb-4">
            Acesso <span className="text-fin-pink">Premium</span> Necessário<span className="text-fin-pink">.</span>
          </h2>
          
          <p className="text-zinc-500 font-medium mb-10 leading-relaxed">
            A análise completa de todos os ativos B3 é exclusiva para assinantes Pro. Faça o upgrade agora para desbloquear cotações completas e listagem paginada.
          </p>

          <Link 
            to="/configuracoes?tab=subscription"
            className="inline-flex items-center gap-3 px-10 py-5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-3xl font-black uppercase tracking-widest text-sm hover:scale-105 transition-all shadow-xl hover:shadow-fin-pink/20 group"
          >
            Seja Premium Agora
            <ArrowUpRight className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </Link>
          
          <div className="mt-12 pt-8 border-t border-zinc-100 dark:border-white/5 grid grid-cols-3 gap-4">
             <div className="space-y-2 text-center">
                <PieChart size={20} className="mx-auto text-zinc-400" />
                <span className="block text-[10px] font-bold uppercase text-zinc-500">Portfolio Pro</span>
             </div>
             <div className="space-y-2 text-center border-x border-zinc-100 dark:border-white/5">
                <Globe size={20} className="mx-auto text-zinc-400" />
                <span className="block text-[10px] font-bold uppercase text-zinc-500">Ativos B3</span>
             </div>
             <div className="space-y-2 text-center">
                <TrendingUp size={20} className="mx-auto text-zinc-400" />
                <span className="block text-[10px] font-bold uppercase text-zinc-500">Alertas Reais</span>
             </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <PageHeader
        icon={BarChart3}
        title="Mercado Global"
        subtitle="Acompanhe Ações, FIIs, BDRs, ETFs, Índices e Câmbio em tempo real."
        colorClass="text-fin-mint"
        bgClass="bg-fin-mint/10"
        borderClass="border-fin-mint/20"
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
              icon={RefreshCw}
              iconClassName={cn(isRefreshing && "animate-spin")}
            />
            
            <div className="relative group/search">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within/search:text-fin-pink transition-colors"
              />
              <input
                type="text"
                placeholder="Buscar ticker ou nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="w-full h-12 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 rounded-2xl py-2.5 pl-12 pr-16 text-sm focus:outline-none focus:ring-2 focus:ring-fin-pink/50 transition-all shadow-sm focus:shadow-md dark:text-white md:w-80"
              />
              <AnimatePresence>
                {searchTerm !== debouncedSearchTerm && (
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
                  >
                    <kbd className="px-2 py-1 text-[10px] font-black bg-zinc-100 dark:bg-zinc-700 text-zinc-400 dark:text-zinc-500 rounded-md border border-zinc-200 dark:border-zinc-600 shadow-sm uppercase tracking-tighter">
                      Enter
                    </kbd>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        }
      />

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryChange(cat.id)}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all whitespace-nowrap border",
              currentCategory === cat.id
                ? "bg-fin-pink text-white border-fin-pink shadow-lg shadow-fin-pink/20"
                : "bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-white/5 hover:border-fin-pink/30 hover:text-fin-pink"
            )}
          >
            <cat.icon size={14} />
            {cat.label}
          </button>
        ))}
      </div>

      {/* Market List Table */}
      <div className="overflow-x-auto rounded-[32px] border border-zinc-200 dark:border-white/5 bg-white dark:bg-zinc-900/50 shadow-xl">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-white/5 bg-zinc-50/50 dark:bg-zinc-800/20">
              <th className="py-5 px-4 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-center w-16">Tipo</th>
              <th className="py-5 px-3 text-[10px] font-black uppercase tracking-widest text-zinc-400">Ativo</th>
              <th className="py-5 px-3 text-[10px] font-black uppercase tracking-widest text-zinc-400">Setor/Info</th>
              <th className="py-5 px-3 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Preço</th>
              <th className="py-5 px-3 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Diária</th>
              <th className="py-5 px-3 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right min-w-[140px]">Volume Diário</th>
              <th className="py-5 px-4 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right min-w-[140px]">Market Cap</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-white/5 relative">
            {isLoading && (
               <motion.tr
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm z-10 flex items-center justify-center h-40"
               >
                 <td colSpan={7}>
                    <div className="flex items-center justify-center p-20">
                       <RefreshCw className="animate-spin text-fin-pink" size={32} />
                    </div>
                 </td>
               </motion.tr>
            )}

            <AnimatePresence mode="popLayout" initial={false}>
              {stocks.map((stock, index) => {
                const ticker = stock.ticker;
                const name = stock.name;
                const category = stock.category;
                
                const getIcon = () => {
                   if (category === 'fund') return <Building2 size={18} />;
                   if (category === 'currency') return <Globe size={18} />;
                   if (category === 'index') return <BarChart3 size={18} />;
                   return <TrendingUp size={18} />;
                };

                const isAccent = category === 'fund' || category === 'currency';

                return (
                 <motion.tr
                   key={ticker}
                   layout="position"
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, scale: 0.95 }}
                   transition={{ duration: 0.2, delay: Math.min(index * 0.01, 0.3) }}
                   className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors group"
                 >
                   <td className="py-5 px-4">
                     <div className={cn(
                       "w-10 h-10 mx-auto rounded-xl flex items-center justify-center p-2 border border-zinc-200 dark:border-white/10 group-hover:scale-110 transition-transform",
                       isAccent ? "bg-fin-mint/10 text-fin-mint" : "bg-fin-pink/10 text-fin-pink"
                     )}>
                       {getIcon()}
                     </div>
                   </td>
                   <td className="py-5 px-3">
                     <div className="flex items-center gap-3">
                       {stock.logo ? (
                         <div className="flex-shrink-0 w-8 h-8 rounded-lg overflow-hidden bg-white/5 p-1 border border-white/5">
                           <img src={stock.logo} alt={name} className="w-full h-full object-contain" loading="lazy" onError={(e) => { e.target.style.display = 'none'; }} />
                         </div>
                       ) : (
                         <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-400">
                           {ticker.substring(0, 2)}
                         </div>
                       )}
                       <div className="flex flex-col">
                         <span className="font-bold text-zinc-900 dark:text-white group-hover:text-fin-pink transition-colors">
                           {ticker}
                         </span>
                         <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest max-w-[200px] truncate">
                           {name}
                         </span>
                       </div>
                     </div>
                   </td>
                   <td className="py-5 px-3 font-medium text-zinc-600 dark:text-zinc-400 text-xs">
                     <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                       {category === 'currency' ? 'Par de Moedas' : (stock.sector || "-")}
                     </span>
                   </td>
                   <td className="py-5 px-3 text-right">
                     <span className="font-black text-zinc-900 dark:text-white">
                       {stock.price ? formatCurrency(stock.price, category) : "-"}
                     </span>
                   </td>
                   <td className="py-5 px-3">
                     <PercentageChange value={stock.variation} />
                   </td>
                   <td className="py-5 px-3 text-right font-medium text-zinc-600 dark:text-zinc-400 text-sm">
                     {stock.volume ? stock.volume.toLocaleString('pt-BR') : "-"}
                   </td>
                   <td className="py-5 px-4 text-right font-medium text-zinc-600 dark:text-zinc-400 text-sm">
                     {formatLargeNumber(stock.market_cap)}
                   </td>
                 </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>

        {/* Pagination Controls - Hidden if search found nothing */}
        {(!debouncedSearchTerm || totalPages > 1) && stocks.length > 0 && (
          <div className="flex items-center justify-between px-8 py-6 bg-white dark:bg-zinc-900/30 border-t border-zinc-200 dark:border-white/5">
            <div className="hidden md:block text-zinc-500 text-[10px] font-black uppercase tracking-widest leading-none">
              Mostrando <span className="text-fin-pink">Página {currentPage}</span> de {totalPages}
            </div>
            
            <div className="flex items-center gap-1.5 mx-auto md:mx-0">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1 || isLoading}
                className="flex items-center justify-center w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-fin-pink hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-20 disabled:cursor-not-allowed transition-all border border-transparent hover:border-fin-pink/30"
                title="Anterior"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="flex items-center gap-1.5 px-2">
                {getPageNumbers().map(pageNum => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    disabled={isLoading}
                    className={`w-10 h-10 rounded-xl font-bold text-xs transition-all border ${
                      currentPage === pageNum
                        ? "bg-fin-pink text-white border-fin-pink shadow-lg shadow-fin-pink/20"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-transparent hover:border-zinc-300 dark:hover:border-zinc-600"
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={isLoading || currentPage >= totalPages}
                className="flex items-center justify-center w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-fin-pink hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-20 disabled:cursor-not-allowed transition-all border border-transparent hover:border-fin-pink/30"
                title="Próximo"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {stocks.length === 0 && !isLoading && !accessDenied && (
        <div className="flex flex-col items-center justify-center py-20 bg-zinc-50 dark:bg-zinc-900/50 rounded-[40px] border-2 border-dashed border-zinc-200 dark:border-white/5">
          <div className="w-20 h-20 bg-zinc-200 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
            <Search className="text-zinc-500" size={32} />
          </div>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white text-center">
            Ativo não localizado
          </h3>
          <p className="text-zinc-500 mt-2">
            Tente buscar pelo ticker oficial (ex: PETR4) ou confira sua conexão.
          </p>
        </div>
      )}

      {/* Disclaimer */}
      <div className="flex items-center justify-center gap-2 p-8 text-zinc-500">
        <Globe size={14} className="text-fin-pink" />
        <span className="text-[10px] font-bold uppercase tracking-widest">
          Brapi API • Dados oficias da B3 • Cache de 3 minutos
        </span>
      </div>
    </div>
  );
}

