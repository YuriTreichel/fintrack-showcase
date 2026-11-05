import React, { useState, useEffect, useCallback } from "react";
import {
  Coins,
  TrendingUp,
  Wallet,
  ArrowUpRight,
  Plus,
  Trash2,
  RefreshCw,
  LineChart,
  Eye,
  EyeOff,
  Search,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import StatCard from "../components/ui/StatCard";
import AssetModal from "../modals/AssetModal";
import { assetApi } from "../api/assetApi";
import LoadingState from "../components/ui/LoadingState";
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";

export default function WealthView({ authFetch, showToast, showConfirm }) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [showValues, setShowValues] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [displayCurrency, setDisplayCurrency] = useState(() => {
    return localStorage.getItem("wealth_currency") || "BRL";
  });

  useEffect(() => {
    localStorage.setItem("wealth_currency", displayCurrency);
  }, [displayCurrency]);

  const api = assetApi(authFetch);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await api.getPortfolioSummary();
      setData(result);
    } catch (error) {
      showToast("Erro ao buscar dados do patrimônio", "error");
    } finally {
      setIsLoading(false);
    }
  }, [authFetch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async (formData) => {
    try {
      if (editingAsset) {
        await api.update(editingAsset.id, formData);
        showToast("Ativo atualizado!");
      } else {
        await api.store(formData);
        showToast("Ativo adicionado!");
      }
      fetchData();
    } catch (error) {
      throw error;
    }
  };

  const handleDelete = (asset) => {
    showConfirm(
      "Excluir Ativo",
      `Tem certeza que deseja remover ${asset.symbol} da sua carteira?`,
      async () => {
        try {
          await api.destroy(asset.id);
          showToast("Ativo removido");
          fetchData();
        } catch (error) {
          showToast("Erro ao excluir", "error");
        }
      }
    );
  };

  const formatCurrency = (value, stripSymbol = false) => {
    if (!showValues) return "••••••";
    
    let amount = Number(value);
    const usdRate = data?.summary?.usd_rate || 1;

    if (displayCurrency === "USD") {
      amount = amount / usdRate;
      return amount.toLocaleString("en-US", {
        style: stripSymbol ? "decimal" : "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }

    return amount.toLocaleString("pt-BR", {
      style: stripSymbol ? "decimal" : "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  if (isLoading && !data) {
    return <LoadingState message="Consolidando patrimônio..." />;
  }

  const filteredAssets = data?.assets?.filter((a) =>
    a.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <PageHeader
        icon={Coins}
        title="Patrimônio"
        subtitle="Monitore a evolução dos seus ativos e liquidez total em tempo real."
        actions={
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/5 rounded-2xl p-1 shadow-sm h-12">
              <button
                onClick={() => setDisplayCurrency("BRL")}
                className={`px-4 h-full rounded-xl text-xs font-bold transition-all ${
                  displayCurrency === "BRL"
                    ? "bg-fin-mint text-zinc-900 shadow-lg shadow-fin-mint/20"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
                }`}
              >
                BRL
              </button>
              <button
                onClick={() => setDisplayCurrency("USD")}
                className={`px-4 h-full rounded-xl text-xs font-bold transition-all ${
                  displayCurrency === "USD"
                    ? "bg-fin-mint text-zinc-900 shadow-lg shadow-fin-mint/20"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
                }`}
              >
                USD
              </button>
            </div>
            
            <Button
              variant="secondary"
              size="icon"
              onClick={() => setShowValues(!showValues)}
              icon={showValues ? Eye : EyeOff}
            />

            <Button
              onClick={() => {
                setEditingAsset(null);
                setIsModalOpen(true);
              }}
              icon={Plus}
            >
              Novo Ativo
            </Button>
          </div>
        }
      />

      {/* Main Stats Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 relative overflow-hidden bg-white dark:bg-zinc-900 rounded-[32px] p-8 border border-zinc-200 dark:border-white/5 shadow-xl">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <LineChart size={120} className="text-fin-mint" />
          </div>
          
          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fin-mint/10 text-fin-mint text-xs font-bold uppercase tracking-wider mb-4 border border-fin-mint/20">
              <TrendingUp size={12} />
              Total Consolidado
            </span>
            <h2 className="text-5xl font-black text-zinc-900 dark:text-white mt-2">
              {formatCurrency(data?.summary?.total_wealth_brl || 0)}
            </h2>
            
            <div className="grid grid-cols-2 gap-8 mt-10">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">
                  Saldo em Contas
                </p>
                <p className="text-xl font-bold text-zinc-900 dark:text-zinc-300">
                  {formatCurrency(data?.summary?.accounts_total_brl || 0)}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">
                  Valor em Ativos
                </p>
                <p className="text-xl font-bold text-zinc-900 dark:text-zinc-300">
                  {formatCurrency(data?.summary?.assets_total_brl || 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quotes Sidebar Card */}
        <div className="bg-zinc-100 dark:bg-zinc-800/50 rounded-[32px] p-6 border border-zinc-200 dark:border-white/5">
          <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-6 flex items-center gap-2">
            <RefreshCw size={14} />
            Cotações em Tempo Real
          </h3>
          <div className="space-y-4">
            <QuoteRow 
              label="Bitcoin (BTC)" 
              value={data?.quotes?.bitcoin?.brl} 
              symbol="₿" 
              color="text-orange-500" 
              formatCurrency={formatCurrency}
            />
            <QuoteRow 
              label="Ethereum (ETH)" 
              value={data?.quotes?.ethereum?.brl} 
              symbol="Ξ" 
              color="text-blue-500" 
              formatCurrency={formatCurrency}
            />
            <QuoteRow 
              label="Dólar (USD)" 
              value={data?.summary?.usd_rate} 
              symbol="$" 
              color="text-emerald-500" 
              formatCurrency={formatCurrency}
              isUsdRate={true}
            />
          </div>
          <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-white/5">
            <p className="text-[10px] text-zinc-500 uppercase leading-tight">
              Dados via CoinGecko Public API. <br/>Atualizado a cada 1 hora.
            </p>
          </div>
        </div>
      </div>

      {/* Assets Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-200 dark:border-white/5 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-zinc-200 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="font-bold text-lg text-zinc-900 dark:text-white flex items-center gap-2">
            <Coins size={20} className="text-fin-mint" />
            Minha Carteira de Ativos
          </h3>
          <div className="relative flex-1 max-w-md group/search">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within/search:text-fin-mint transition-colors"
            />
            <input
              type="text"
              placeholder="Buscar ativo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 rounded-2xl py-2.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-fin-mint/50 transition-all shadow-sm focus:shadow-md"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-800/30">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Ativo</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500 text-right">Quantidade</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500 text-right">Preço Médio</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500 text-right">Cotação Atual</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500 text-right">Total ({displayCurrency})</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-white/5">
              <AnimatePresence>
                {filteredAssets?.map((asset) => (
                  <motion.tr
                    key={asset.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-zinc-50/50 dark:hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-black text-xs text-zinc-500 group-hover:text-fin-mint group-hover:bg-fin-mint/10 transition-all">
                          {asset.symbol}
                        </div>
                        <span className="font-bold text-zinc-900 dark:text-zinc-200">{asset.symbol}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-zinc-900 dark:text-zinc-300">
                      {asset.quantity}
                    </td>
                    <td className="px-6 py-4 text-right text-zinc-500">
                      {formatCurrency(asset.avg_price)}
                    </td>
                    <td className="px-6 py-4 text-right text-fin-mint font-medium">
                      {formatCurrency(asset.current_price_brl)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-bold text-zinc-900 dark:text-white">
                        {formatCurrency(asset.current_total_brl)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setEditingAsset(asset);
                            setIsModalOpen(true);
                          }}
                          className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-fin-mint transition-colors"
                        >
                          <LineChart size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(asset)}
                          className="p-2 hover:bg-red-500/10 rounded-lg text-zinc-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {filteredAssets?.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-zinc-500 italic">
                    Nenhum ativo encontrado na sua carteira. 🚀
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AssetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        asset={editingAsset}
        showToast={showToast}
      />
    </div>
  );
}

function QuoteRow({ label, value, symbol, color, formatCurrency, isUsdRate }) {
  // Se for a taxa do dólar, sempre mostramos em BRL pois é a cotação USD/BRL
  const displayValue = isUsdRate 
    ? Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
    : formatCurrency(value);

  return (
    <div className="flex items-center justify-between p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-2xl shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold ${color}`}>
          {symbol}
        </div>
        <span className="text-xs font-bold text-zinc-500 uppercase tracking-tight">{label}</span>
      </div>
      <span className="font-bold text-zinc-900 dark:text-zinc-200">
        {value ? displayValue : "---"}
      </span>
    </div>
  );
}
