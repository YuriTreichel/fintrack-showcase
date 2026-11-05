import React, { useState, useEffect, useMemo, useCallback } from "react";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  TrendingUp, 
  BarChart3, 
  Layers, 
  Zap, 
  Trophy,
  Info,
  ExternalLink,
  ChevronLeft,
  CircleDashed,
  Plus,
  Search,
  Filter,
  Trash2,
  Calendar,
  DollarSign,
} from "lucide-react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { cn } from "../utils/classNames";
import { assetApi } from "../api/assetApi";
import LoadingState from "../components/ui/LoadingState";
import AssetModal from "../modals/AssetModal";
import ConfirmModal from "../modals/ConfirmModal";
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";

export default function CryptoDetails({ authFetch, showToast }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [coin, setCoin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currency, setCurrency] = useState("USD"); // Seletor de moeda
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historySearchTerm, setHistorySearchTerm] = useState("");
  const [historyCurrencyFilter, setHistoryCurrencyFilter] = useState("All");
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: "", message: "", onConfirm: null });

  const api = useMemo(() => assetApi(authFetch), [authFetch]);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const data = await api.getCryptoDetails(id);
        if (data.error) throw new Error(data.error);
        setCoin(data);
      } catch (err) {
        console.error("Erro ao carregar detalhes:", err);
        setError("Não foi possível carregar os dados desta moeda.");
        showToast?.("Erro ao carregar detalhes da moeda", "error");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDetails();
  }, [id, api, showToast]);

  const fetchHistory = useCallback(async () => {
    if (!id) return;
    setLoadingHistory(true);
    try {
      const data = await api.getHistory({ coin_id: id });
      setHistory(data);
    } catch (err) {
      console.error("Erro ao carregar histórico:", err);
    } finally {
      setLoadingHistory(false);
    }
  }, [id, api]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const filteredHistory = useMemo(() => {
    return history.filter((p) => {
      const dateStr = new Date(p.purchase_date).toLocaleDateString("pt-BR");
      const matchesSearch = dateStr.includes(historySearchTerm);
      const matchesCurrency = historyCurrencyFilter === "All" || p.currency === historyCurrencyFilter;
      return matchesSearch && matchesCurrency;
    });
  }, [history, historySearchTerm, historyCurrencyFilter]);

  const handleDeletePurchase = (id) => {
    setConfirmDialog({
      isOpen: true,
      title: "Excluir Registro",
      message: "Tem certeza que deseja remover este registro de compra? Isso irá recalcular seu preço médio e saldo total deste ativo.",
      onConfirm: async () => {
        try {
          await api.deletePurchase(id);
          showToast("Registro removido com sucesso", "success");
          fetchHistory();
        } catch (err) {
          showToast("Erro ao excluir registro", "error");
        }
      }
    });
  };

  const handleSaveToWallet = async (formData) => {
    try {
      await api.store(formData);
      showToast("Moeda adicionada à sua carteira com sucesso!", "success");
      fetchHistory(); // Atualiza o histórico após adicionar
    } catch (err) {
      console.error("Erro ao salvar na carteira:", err);
      showToast("Erro ao adicionar à carteira", "error");
      throw err;
    }
  };

  const formatCurrencyValue = (value) => {
    if (value === undefined || value === null) return "N/A";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: value < 1 ? 4 : 2,
    }).format(value);
  };

  const formatNumber = (value) => {
    if (value === undefined || value === null) return "N/A";
    return new Intl.NumberFormat("pt-BR").format(value);
  };

  const PercentageBadge = ({ value }) => {
    if (value === undefined || value === null) return null;
    const isPositive = value >= 0;
    return (
      <span className={`flex items-center gap-0.5 font-bold text-sm px-2 py-1 rounded-lg ${
        isPositive ? "text-emerald-500 bg-emerald-500/10" : "text-red-500 bg-red-500/10"
      }`}>
        {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        {Math.abs(value).toFixed(1)}%
      </span>
    );
  };

  const DataCard = ({ icon: Icon, title, value, subtitle, delay = 0 }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="p-6 rounded-[24px] bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 shadow-sm hover:shadow-md transition-all hover:border-fin-mint/30 group"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-zinc-500 group-hover:text-fin-mint transition-colors">
            <Icon size={20} />
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-zinc-400">
            {title}
          </span>
        </div>
      </div>
      <div className="flex flex-col">
        <span className="text-xl font-bold text-zinc-900 dark:text-white">
          {value}
        </span>
        {subtitle && (
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mt-1">
            {subtitle}
          </span>
        )}
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <CircleDashed className="text-fin-mint animate-spin mb-4" size={40} />
        <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Carregando detalhes...</p>
      </div>
    );
  }

  if (error || !coin) {
    return (
      <div className="flex flex-col items-center justify-center py-40 bg-zinc-50 dark:bg-zinc-900/50 rounded-[40px] border-2 border-dashed border-zinc-200 dark:border-white/5">
        <h3 className="text-xl font-bold text-zinc-900 dark:text-white text-center">
          {error || "Moeda não encontrada"}
        </h3>
        <button 
          onClick={() => navigate(-1)}
          className="mt-6 px-6 py-3 bg-zinc-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-black transition-colors"
        >
          Voltar
        </button>
      </div>
    );
  }

  const marketData = coin.market_data;
  const curr = currency.toLowerCase();

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PageHeader
        icon={() => (
           <div className="w-full h-full p-2 bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-white/10 shadow-sm flex items-center justify-center">
              <img src={coin.image?.small} className="w-full h-full object-contain" alt={coin.name} />
           </div>
        )}
        title={coin.name}
        subtitle={`Análise detalhada e acompanhamento em tempo real de ${coin.name}.`}
        label={`Rank #${coin.market_cap_rank}`}
        actions={
          <div className="flex items-center gap-3">
             <Button
              variant="secondary"
              onClick={() => navigate(-1)}
              icon={ChevronLeft}
            >
              Voltar
            </Button>

            <div className="flex items-center bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 p-1 rounded-2xl h-12 shadow-sm">
              {["USD", "BRL"].map((c) => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={cn(
                    "px-4 h-full rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    currency === c 
                      ? "bg-fin-mint text-zinc-900 shadow-lg shadow-fin-mint/20"
                      : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        }
      />

      {/* Top Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 p-8 bg-zinc-900 rounded-[32px] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-fin-mint/5 blur-[100px] rounded-full -mr-32 -mt-32"></div>
        
        <div className="flex items-center gap-5 relative z-10">
          <div className="w-20 h-20 p-3 bg-white/10 backdrop-blur-xl rounded-[24px] border border-white/10 flex items-center justify-center">
             <img src={coin.image?.large} className="w-full h-full object-contain" alt={coin.name} />
          </div>
          <div>
            <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">
              {coin.name} <span className="opacity-40 ml-2 not-italic">{coin.symbol?.toUpperCase()}</span>
            </h2>
            <div className="flex items-center gap-3 mt-1">
              <PercentageBadge value={marketData[`price_change_percentage_24h_in_currency`]?.[curr] || marketData.price_change_percentage_24h} />
              <span className="text-zinc-400 font-bold text-[10px] uppercase tracking-widest">Variação 24h</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start md:items-end relative z-10">
          <div className="flex items-center gap-2 mb-1">
             <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Preço Atual</span>
             <span className="px-1.5 py-0.5 bg-fin-mint/10 text-fin-mint rounded text-[8px] font-black">{currency}</span>
          </div>
          <span className="text-5xl md:text-6xl font-black text-white tracking-tighter">
            {formatCurrencyValue(marketData.current_price?.[curr])}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Stats Grid */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DataCard 
              icon={TrendingUp} 
              title="Cap. de Mercado" 
              value={formatCurrencyValue(marketData.market_cap?.[curr])} 
              subtitle="Valor total de mercado"
              delay={0.1}
            />
            <DataCard 
              icon={BarChart3} 
              title="Volume (24h)" 
              value={formatCurrencyValue(marketData.total_volume?.[curr])} 
              subtitle="Volume negociado em 24h"
              delay={0.2}
            />
            <DataCard 
              icon={Layers} 
              title="Fornecimento Circulante" 
              value={`${formatNumber(marketData.circulating_supply)} ${coin.symbol?.toUpperCase()}`} 
              subtitle={`Moedas em circulação de ${coin.name}`}
              delay={0.3}
            />
            <DataCard 
              icon={Zap} 
              title="Fornecimento Máximo" 
              value={marketData.max_supply ? `${formatNumber(marketData.max_supply)} ${coin.symbol?.toUpperCase()}` : "Ilimitado"} 
              subtitle="Limite máximo de moedas"
              delay={0.4}
            />
          </div>

          {/* Performance Box */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="p-8 rounded-[32px] bg-zinc-900 text-white shadow-2xl overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-fin-mint/10 blur-[100px] rounded-full -mr-32 -mt-32"></div>
            
            <h3 className="text-lg font-black uppercase italic tracking-wider mb-6 flex items-center gap-2 relative z-10">
              <Trophy className="text-fin-mint" size={20} />
              Desempenho & ATH ({currency})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block mb-2">Máxima Histórica (ATH)</span>
                <span className="text-2xl font-bold">{formatCurrencyValue(marketData.ath?.[curr])}</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-red-500 font-bold text-xs">
                    {marketData.ath_change_percentage?.[curr]?.toFixed(1)}%
                  </span>
                  <span className="text-zinc-500 text-[10px] font-bold uppercase">desde a máxima</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block mb-2">Variação 1h</span>
                <div className="flex items-center gap-2">
                  <span className={`text-2xl font-bold ${marketData.price_change_percentage_1h_in_currency?.[curr] >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                    {marketData.price_change_percentage_1h_in_currency?.[curr] >= 0 ? "+" : ""}{marketData.price_change_percentage_1h_in_currency?.[curr]?.toFixed(1)}%
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block mb-2">Variação 7d</span>
                <div className="flex items-center gap-2">
                  <span className={`text-2xl font-bold ${marketData.price_change_percentage_7d_in_currency?.[curr] >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                    {marketData.price_change_percentage_7d_in_currency?.[curr] >= 0 ? "+" : ""}{marketData.price_change_percentage_7d_in_currency?.[curr]?.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Histórico de Compras - Menu Robusto */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-200 dark:border-white/5 shadow-xl overflow-hidden mt-8"
          >
            <div className="p-8 border-b border-zinc-200 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                 <h3 className="text-xl font-black uppercase italic tracking-wider flex items-center gap-2 text-zinc-900 dark:text-white">
                  <BarChart3 className="text-fin-mint" size={24} />
                  Menu do Histórico
                </h3>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">Gerencie seus aportes e preço médio</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative group/search">
                  <Search
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within/search:text-fin-mint transition-colors"
                  />
                  <input 
                    type="text" 
                    placeholder="Buscar data (dd/mm/aaaa)..."
                    value={historySearchTerm}
                    onChange={(e) => setHistorySearchTerm(e.target.value)}
                    className="w-full h-10 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-fin-mint/50 transition-all shadow-sm focus:shadow-md dark:text-white md:w-56"
                  />
                </div>

                <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
                  {["All", "BRL", "USD"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setHistoryCurrencyFilter(f)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                        historyCurrencyFilter === f 
                          ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm"
                          : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                      )}
                    >
                      {f === "All" ? "Todos" : f}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              {filteredHistory.length > 0 ? (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-50 dark:bg-zinc-800/30">
                      <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Data</th>
                      <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Quantidade</th>
                      <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Preço de Compra</th>
                      <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Câmbio</th>
                      <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
                    {filteredHistory.map((purchase) => (
                      <tr key={purchase.id} className="hover:bg-zinc-50/50 dark:hover:bg-white/[0.01] transition-colors group">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-400 group-hover:text-fin-mint transition-colors">
                              <Calendar size={14} />
                            </div>
                            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-200">
                              {new Date(purchase.purchase_date).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <span className="text-sm font-black text-zinc-900 dark:text-white">
                            {purchase.quantity} <span className="text-zinc-500 opacity-50">{coin.symbol?.toUpperCase()}</span>
                          </span>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <div className="flex flex-col items-end">
                             <span className="text-sm font-bold text-zinc-900 dark:text-zinc-200">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: purchase.currency }).format(purchase.purchase_price)}
                            </span>
                            <span className="text-[9px] font-black uppercase tracking-tighter text-zinc-400">{purchase.currency}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                          {purchase.currency === "USD" ? (
                            <span className="text-xs font-bold text-emerald-500">R$ {purchase.exchange_rate}</span>
                          ) : (
                            <span className="text-zinc-400 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center justify-center">
                            <button 
                              onClick={() => handleDeletePurchase(purchase.id)}
                              className="p-2 hover:bg-red-500/10 text-zinc-400 hover:text-red-500 rounded-xl transition-all"
                              title="Excluir Registro"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-20 text-center flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400 mb-4">
                    <Search size={24} />
                  </div>
                  <h4 className="text-lg font-bold text-zinc-900 dark:text-white">Nenhum registro encontrado</h4>
                  <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">Tente ajustar seus filtros ou busca</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="p-6 rounded-[24px] bg-fin-mint text-zinc-900 shadow-xl shadow-fin-mint/20"
          >
            <h4 className="font-black uppercase tracking-widest text-[10px] mb-4 opacity-70 text-zinc-900/50">Minha Gestão</h4>
            <div className="space-y-3">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-black transition-colors shadow-lg shadow-black/20 flex items-center justify-center gap-2"
              >
                <Plus size={16} /> Registrar Compra
              </button>
              <a 
                href={`https://www.coingecko.com/en/coins/${id}`} 
                target="_blank" 
                rel="noreferrer"
                className="w-full py-4 bg-white/20 border border-zinc-900/10 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white/30 transition-colors flex items-center justify-center gap-2"
              >
                Ver no CoinGecko <ExternalLink size={14} />
              </a>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="p-6 rounded-[24px] border border-zinc-200 dark:border-white/5 bg-white dark:bg-zinc-900/30"
          >
            <div className="flex items-center gap-2 mb-4">
              <Info size={16} className="text-fin-mint" />
              <h4 className="font-black uppercase tracking-widest text-[10px] text-zinc-400">Sobre o {coin.name}</h4>
            </div>
            <div 
              className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium line-clamp-6 overflow-hidden"
              dangerouslySetInnerHTML={{ __html: coin.description?.pt || coin.description?.en }}
            />
            <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-white/5 space-y-4">
              {coin.links?.homepage?.[0] && (
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Website</span>
                  <a href={coin.links.homepage[0]} target="_blank" rel="noreferrer" className="text-fin-mint hover:underline text-xs font-bold flex items-center gap-1">
                    {new URL(coin.links.homepage[0]).hostname} <ExternalLink size={10} />
                  </a>
                </div>
              )}
              {coin.links?.blockchain_site?.[0] && (
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Explorador</span>
                  <a href={coin.links.blockchain_site[0]} target="_blank" rel="noreferrer" className="text-fin-mint hover:underline text-xs font-bold flex items-center gap-1">
                    {new URL(coin.links.blockchain_site[0]).hostname} <ExternalLink size={10} />
                  </a>
                </div>
              )}
            </div>
          </motion.div>

        </div>
      </div>

      <AssetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveToWallet}
        asset={coin}
        showToast={showToast}
      />

      <ConfirmModal
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
