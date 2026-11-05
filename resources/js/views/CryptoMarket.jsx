import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  RefreshCw,
  TrendingUp,
  Coins,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { assetApi } from "../api/assetApi";
import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts";
import LoadingState from "../components/ui/LoadingState";
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";
import { cn } from "../utils/classNames";

// Mini Sparkline component using Recharts
const Sparkline = ({ data, color }) => {
  if (!data || data.length === 0) return <div className="h-10 w-32 bg-zinc-800/50 rounded animate-pulse" />;
  
  // Format data for Recharts
  const chartData = data.map((price, index) => ({ value: price, index }));
  
  return (
    <div className="h-12 w-32">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <YAxis hide domain={['auto', 'auto']} />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={color} 
            strokeWidth={2} 
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default function CryptoMarket({ authFetch, showToast }) {
  const navigate = useNavigate();
  const [coins, setCoins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const PER_PAGE = 20;

  // Memoize API to prevent infinite re-renders
  const api = React.useMemo(() => assetApi(authFetch), [authFetch]);

  // Handle Search Debounce
  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }
  };

  const fetchMarketData = useCallback(async (page = 1, search = "", silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const data = await api.getCryptoMarket(page, search, PER_PAGE);
      setCoins(data);
      // Scroll to top on page change if not a silent refresh
      if (!silent) window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      if (error.status === 403) {
        showToast("Esta funcionalidade exige plano Premium", "error");
      } else {
        showToast("Erro ao carregar dados do mercado", "error");
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [api, showToast]);

  useEffect(() => {
    fetchMarketData(currentPage, debouncedSearchTerm);
  }, [currentPage, debouncedSearchTerm, fetchMarketData]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchMarketData(currentPage, debouncedSearchTerm, true);
  };

  // Local filtering is removed as we now search on the server
  const filteredCoins = coins;

// Utility functions moved outside to prevent re-creation on every render
const formatCurrency = (value) => {
  return Number(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: value < 1 ? 4 : 2,
  });
};

const formatLargeNumber = (value) => {
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
    <span className={`flex items-center gap-0.5 font-semibold text-sm ${isPositive ? "text-emerald-500" : "text-red-500"}`}>
      {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
      {Math.abs(value).toFixed(1)}%
    </span>
  );
};

// Memoized individual row to prevent 100+ re-renders while typing
const CoinRow = React.memo(({ coin, index, navigate }) => {
  const isPositive24h = coin.price_change_percentage_24h_in_currency >= 0;
  
  return (
    <motion.tr
      layout="position"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2, delay: Math.min(index * 0.01, 0.3) }}
      onClick={() => navigate(`/market/crypto/${coin.id}`)}
      className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors group cursor-pointer"
    >
      <td className="py-5 px-4 text-center font-bold text-zinc-400 text-xs text-sm">
        {coin.market_cap_rank}
      </td>
      <td className="py-5 px-3">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg overflow-hidden bg-white/5 p-1 border border-white/5 group-hover:scale-110 transition-transform">
            <img src={coin.image} alt={coin.name} className="w-full h-full object-contain" loading="lazy" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-zinc-900 dark:text-white group-hover:text-fin-mint transition-colors whitespace-nowrap">
              {coin.name}
            </span>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              {coin.symbol}
            </span>
          </div>
        </div>
      </td>
      <td className="py-5 px-3 text-right">
        <span className="font-black text-zinc-900 dark:text-white">
          {formatCurrency(coin.current_price)}
        </span>
      </td>
      <td className="py-5 px-3 text-right">
        <PercentageChange value={coin.price_change_percentage_1h_in_currency} />
      </td>
      <td className="py-5 px-3 text-right">
        <PercentageChange value={coin.price_change_percentage_24h_in_currency} />
      </td>
      <td className="py-5 px-3 text-right">
        <PercentageChange value={coin.price_change_percentage_7d_in_currency} />
      </td>
      <td className="py-5 px-3 text-right font-medium text-zinc-600 dark:text-zinc-400 text-sm">
        {formatLargeNumber(coin.total_volume)}
      </td>
      <td className="py-5 px-3 text-right font-medium text-zinc-600 dark:text-zinc-400 text-sm">
        {formatLargeNumber(coin.market_cap)}
      </td>
      <td className="py-5 px-4">
        <div className="flex justify-center">
          <Sparkline 
            data={coin.sparkline_in_7d?.price} 
            color={isPositive24h ? "#10b981" : "#ef4444"} 
          />
        </div>
      </td>
    </motion.tr>
  );
});

  const getPageNumbers = () => {
    const range = 2; // Number of pages on each side of currentPage
    const pages = [];
    const minPage = Math.max(1, currentPage - range);
    const maxPage = currentPage + range;
    
    for (let i = minPage; i <= maxPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  if (isLoading) {
    return <LoadingState message="Acessando o mercado global..." />;
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PageHeader
        icon={Coins}
        title="Mercado Cripto"
        subtitle="Acompanhe tendências globais e dados em tempo real dos principais ativos digitais."
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
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within/search:text-fin-mint transition-colors"
              />
              <input
                type="text"
                placeholder="Buscar por nome ou símbolo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="w-full h-12 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 rounded-2xl py-2.5 pl-12 pr-16 text-sm focus:outline-none focus:ring-2 focus:ring-fin-mint/50 transition-all shadow-sm focus:shadow-md dark:text-white md:w-80"
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

      {/* Market List Table */}
      <div className="overflow-x-auto rounded-[32px] border border-zinc-200 dark:border-white/5 bg-white dark:bg-zinc-900/50 shadow-xl">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-white/5 bg-zinc-50/50 dark:bg-zinc-800/20">
              <th className="py-5 px-4 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-center w-12">#</th>
              <th className="py-5 px-3 text-[10px] font-black uppercase tracking-widest text-zinc-400">Moeda</th>
              <th className="py-5 px-3 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Preço</th>
              <th className="py-5 px-3 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">1h</th>
              <th className="py-5 px-3 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">24h</th>
              <th className="py-5 px-3 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">7d</th>
              <th className="py-5 px-3 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right min-w-[140px]">Volume em 24h</th>
              <th className="py-5 px-3 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right min-w-[140px]">Market Cap</th>
              <th className="py-5 px-4 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-center">Últimos 7 dias</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-white/5">
            <AnimatePresence mode="popLayout" initial={false}>
              {filteredCoins.map((coin, index) => (
                <CoinRow key={coin.id} coin={coin} index={index} navigate={navigate} />
              ))}
            </AnimatePresence>
          </tbody>
        </table>

        {/* Pagination Controls - Hidden during search */}
        {!debouncedSearchTerm && (
          <div className="flex items-center justify-between px-8 py-6 bg-white dark:bg-zinc-900/30 border-t border-zinc-200 dark:border-white/5">
            <div className="hidden md:block text-zinc-500 text-[10px] font-black uppercase tracking-widest leading-none">
              Mostrando <span className="text-fin-mint">Página {currentPage}</span>
            </div>
            
            <div className="flex items-center gap-1.5 mx-auto md:mx-0">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1 || isLoading}
                className="flex items-center justify-center w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-fin-mint hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-20 disabled:cursor-not-allowed transition-all border border-transparent hover:border-fin-mint/30"
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
                        ? "bg-fin-mint text-zinc-900 border-fin-mint shadow-lg shadow-fin-mint/20"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-transparent hover:border-zinc-300 dark:hover:border-zinc-600"
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={isLoading || coins.length < PER_PAGE}
                className="flex items-center justify-center w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-fin-mint hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-20 disabled:cursor-not-allowed transition-all border border-transparent hover:border-fin-mint/30"
                title="Próximo"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {filteredCoins.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center py-20 bg-zinc-50 dark:bg-zinc-900/50 rounded-[40px] border-2 border-dashed border-zinc-200 dark:border-white/5">
          <div className="w-20 h-20 bg-zinc-200 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
            <Search className="text-zinc-500" size={32} />
          </div>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white text-center">
            Nenhuma moeda encontrada
          </h3>
          <p className="text-zinc-500 mt-2">
            Tente buscar com termos diferentes ou verifique a conexão.
          </p>
        </div>
      )}

      {/* Footer Info */}
      <div className="flex items-center justify-center gap-2 p-8 text-zinc-500">
        <TrendingUp size={14} className="text-fin-mint" />
        <span className="text-[10px] font-bold uppercase tracking-widest">
          Dados fornecidos por CoinGecko API • Atualizado de hora em hora
        </span>
      </div>
    </div>
  );
}
