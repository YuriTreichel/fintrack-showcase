import React, { useState, useEffect, useMemo, useCallback } from "react";
import { 
  Search, 
  Filter, 
  Trash2, 
  Calendar, 
  TrendingUp, 
  History,
  ArrowLeft,
  CircleDashed,
  Download,
  ChevronRight,
  ChevronLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { cn } from "../utils/classNames";
import { assetApi } from "../api/assetApi";
import ConfirmModal from "../modals/ConfirmModal";
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";

export default function AssetHistoryView({ authFetch, showToast }) {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currencyFilter, setCurrencyFilter] = useState("All");
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, id: null });

  const api = useMemo(() => assetApi(authFetch), [authFetch]);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getGlobalHistory();
      if (Array.isArray(data)) {
        setHistory(data);
      } else {
        setHistory([]);
      }
    } catch (err) {
      console.error("Erro ao carregar histórico:", err);
      showToast("Erro ao carregar histórico de aportes", "error");
    } finally {
      setLoading(false);
    }
  }, [api, showToast]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const filteredHistory = useMemo(() => {
    if (!history || !Array.isArray(history)) return [];
    
    return history.filter((p) => {
      const dateStr = new Date(p.purchase_date).toLocaleDateString("pt-BR");
      const symbol = p.asset_symbol?.toLowerCase() || "";
      const matchesSearch = dateStr.includes(searchTerm) || symbol.includes(searchTerm.toLowerCase());
      const matchesCurrency = currencyFilter === "All" || p.currency === currencyFilter;
      return matchesSearch && matchesCurrency;
    });
  }, [history, searchTerm, currencyFilter]);

  const handleDelete = async () => {
    if (!confirmDialog.id) return;
    try {
      await api.deletePurchase(confirmDialog.id);
      showToast("Registro removido com sucesso", "success");
      setHistory(prev => prev.filter(p => p.id !== confirmDialog.id));
      setConfirmDialog({ isOpen: false, id: null });
    } catch (err) {
      showToast("Erro ao excluir registro", "error");
    }
  };

  const formatCurrency = (value, currency) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: currency,
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <CircleDashed className="text-fin-mint animate-spin mb-4" size={40} />
        <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Carregando histórico...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header */}
      <PageHeader
        icon={History}
        title="Histórico de Aportes"
        subtitle="Gestão consolidada de todas as suas compras de ativos e investimentos."
        label="Patrimônio"
        actions={
          <div className="flex items-center gap-3">
             <Button
              variant="secondary"
              onClick={() => navigate("/wealth")}
              icon={ArrowLeft}
            >
              Voltar
            </Button>
            
            <div className="h-12 px-6 bg-fin-mint/10 border border-fin-mint/20 rounded-2xl flex flex-col justify-center items-end min-w-[140px]">
              <span className="text-[10px] font-black uppercase tracking-widest text-fin-mint">Total de Aportes</span>
              <span className="text-xl font-black text-zinc-900 dark:text-white leading-none mt-0.5">{history.length}</span>
            </div>
          </div>
        }
      />

      {/* Filters Bar */}
      <div className="bg-white dark:bg-zinc-900/50 p-6 rounded-[32px] border border-zinc-200 dark:border-white/5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col md:flex-row items-center gap-4 flex-1">
          <div className="relative w-full md:w-80 group/search">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within/search:text-fin-mint transition-colors"
            />
            <input
              type="text"
              placeholder="Buscar por ativo ou data..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 rounded-2xl py-2.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-fin-mint/50 transition-all shadow-sm focus:shadow-md dark:text-white"
            />
          </div>

          <div className="flex items-center bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/5 p-1 rounded-2xl w-full md:w-auto h-12 shadow-sm">
            {["All", "BRL", "USD"].map((f) => (
              <button
                key={f}
                onClick={() => setCurrencyFilter(f)}
                className={cn(
                  "flex-1 md:flex-none px-6 h-full rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  currencyFilter === f 
                    ? "bg-fin-mint text-zinc-900 shadow-lg shadow-fin-mint/20"
                    : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                )}
              >
                {f === "All" ? "Todas" : f}
              </button>
            ))}
          </div>
        </div>

        <Button
          variant="secondary"
          onClick={() => {/* export logic */}}
          icon={Download}
        >
          Exportar CSV
        </Button>
      </div>

      {/* History Table */}
      <div className="bg-white dark:bg-zinc-900/50 rounded-[32px] border border-zinc-200 dark:border-white/5 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          {filteredHistory.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-800/30">
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Ativo</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Data do Aporte</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Quantidade</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Preço Unitário</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Câmbio (USD)</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Total Investido</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
                {filteredHistory.map((p) => (
                  <tr key={p.id} className="hover:bg-zinc-50/50 dark:hover:bg-white/[0.01] transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-black text-xs text-zinc-400 group-hover:bg-fin-mint/10 group-hover:text-fin-mint transition-colors border border-transparent group-hover:border-fin-mint/20">
                          {p.asset_symbol?.toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tighter">
                            {p.asset_symbol?.toUpperCase()}
                          </span>
                          <span className="text-[10px] font-bold text-zinc-500 uppercase">Cripto</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                        <Calendar size={14} className="opacity-50" />
                        <span className="text-sm font-bold">
                          {new Date(p.purchase_date).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <span className="text-sm font-black text-zinc-900 dark:text-white">
                        {p.quantity} <span className="text-zinc-500 opacity-50">{p.asset_symbol?.toUpperCase()}</span>
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-sm font-bold text-zinc-900 dark:text-zinc-200">
                          {formatCurrency(p.purchase_price, p.currency)}
                        </span>
                        <span className="text-[9px] font-black uppercase tracking-tighter text-zinc-500">{p.currency}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      {p.currency === "USD" ? (
                        <div className="flex flex-col items-end">
                           <span className="text-xs font-bold text-emerald-500">R$ {p.exchange_rate}</span>
                           <span className="text-[9px] font-black uppercase tracking-tighter text-zinc-500">Ptax</span>
                        </div>
                      ) : (
                        <span className="text-zinc-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-8 py-6 text-right">
                       <div className="flex flex-col items-end">
                        <span className="text-sm font-black text-zinc-900 dark:text-white">
                          {formatCurrency(p.quantity * p.purchase_price, p.currency)}
                        </span>
                        {p.currency === "USD" && (
                           <span className="text-[10px] font-bold text-zinc-400">
                             ≈ {formatCurrency(p.quantity * p.purchase_price * p.exchange_rate, "BRL")}
                           </span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-center">
                        <button 
                          onClick={() => setConfirmDialog({ isOpen: true, id: p.id })}
                          className="p-3 bg-zinc-50 dark:bg-zinc-800/50 hover:bg-red-500/10 text-zinc-400 hover:text-red-500 rounded-xl transition-all border border-zinc-200 dark:border-white/5"
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
            <div className="p-32 text-center flex flex-col items-center justify-center">
              <div className="w-24 h-24 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-zinc-300 dark:text-zinc-600 mb-6 scale-125">
                <Search size={40} />
              </div>
              <h4 className="text-2xl font-black text-zinc-900 dark:text-white uppercase italic tracking-tighter">
                Nenhum aporte encontrado
              </h4>
              <p className="max-w-xs text-sm text-zinc-500 font-bold uppercase tracking-widest mt-2 leading-relaxed">
                Ajuste os filtros ou busque por outro termo para encontrar o que procura.
              </p>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmDialog.isOpen}
        title="Excluir Registro de Aporte"
        message="Esta ação irá remover permanentemente este registro de compra. O preço médio e o saldo total do ativo serão recalculados. Deseja continuar?"
        onConfirm={handleDelete}
        onClose={() => setConfirmDialog({ isOpen: false, id: null })}
      />
    </div>
  );
}
