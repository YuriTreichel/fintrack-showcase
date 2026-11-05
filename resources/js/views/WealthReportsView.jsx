import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  BarChart3,
  TrendingUp,
  PieChart as PieChartIcon,
  Activity,
  Calendar,
  Wallet,
  Coins
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
  AreaChart,
  Area
} from "recharts";
import { format, parseISO, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";

import PageHeader from "../components/ui/PageHeader";
import LoadingState from "../components/ui/LoadingState";

const COLORS = ["#6cb888", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function WealthReportsView({ authFetch, showToast }) {
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [displayCurrency, setDisplayCurrency] = useState(() => {
    return localStorage.getItem("wealth_currency") || "BRL";
  });

  useEffect(() => {
    localStorage.setItem("wealth_currency", displayCurrency);
  }, [displayCurrency]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const summaryRes = await authFetch("/api/portfolio-summary");
      if (!summaryRes.ok) throw new Error("Falha ao buscar resumo");
      const summaryData = await summaryRes.json();
      
      const historyRes = await authFetch("/api/assets/all-history");
      if (!historyRes.ok) throw new Error("Falha ao buscar histórico");
      const historyData = await historyRes.json();

      setData(summaryData);
      setHistory(historyData);
    } catch (error) {
      showToast("Erro ao carregar relatórios de patrimônio", "error");
    } finally {
      setIsLoading(false);
    }
  }, [authFetch, showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const usdRate = data?.summary?.usd_rate || 1;

  const getCurrencyValue = useCallback((brlValue) => {
    if (displayCurrency === "USD") {
      return Number(brlValue) / usdRate;
    }
    return Number(brlValue);
  }, [displayCurrency, usdRate]);

  const formatValue = (value) => {
    return value.toLocaleString(displayCurrency === "USD" ? "en-US" : "pt-BR", {
      style: "currency",
      currency: displayCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-zinc-800 p-3 rounded-2xl shadow-xl border border-zinc-200 dark:border-white/5">
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">{label || payload[0].name}</p>
          {payload.map((entry, idx) => (
            <p key={idx} className="text-sm font-bold" style={{ color: entry.color }}>
              {entry.name !== payload[0].name && entry.name !== 'value' && entry.name !== label ? `${entry.name}: ` : ''}
              {formatValue(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // --- PREPARAÇÃO DOS DADOS PARA GRÁFICOS ---

  // 1. Alocação Geral (Contas vs Ativos)
  const generalAllocationData = useMemo(() => {
    if (!data) return [];
    return [
      { name: "Ativos (Cripto/Ações)", value: getCurrencyValue(data.summary.assets_total_brl) },
      { name: "Saldo em Contas (Fiat)", value: getCurrencyValue(data.summary.accounts_total_brl) }
    ].filter(item => item.value > 0);
  }, [data, getCurrencyValue]);

  // 2. Alocação por Ativo
  const assetAllocationData = useMemo(() => {
    if (!data?.assets) return [];
    return data.assets
      .map(asset => ({
        name: asset.symbol,
        value: getCurrencyValue(asset.current_total_brl)
      }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value); // Sort descending
  }, [data, getCurrencyValue]);

  // 3. Rentabilidade vs Custo por Ativo
  const profitabilityData = useMemo(() => {
    if (!data?.assets) return [];
    return data.assets.map(asset => {
      // Custo total em BRL (preço médio * quantidade atual)
      // Note: O average_price do backend já está em BRL.
      const custoBrl = asset.avg_price * asset.quantity;
      const atualBrl = asset.current_total_brl;
      
      return {
        name: asset.symbol,
        "Custo de Aquisição": getCurrencyValue(custoBrl),
        "Valor Atual": getCurrencyValue(atualBrl)
      };
    }).filter(item => item["Custo de Aquisição"] > 0 || item["Valor Atual"] > 0);
  }, [data, getCurrencyValue]);

  // 4. Histórico de Aportes por Mês (Volume)
  const historyData = useMemo(() => {
    if (!history.length) return [];
    
    const monthlyData = {};
    
    // Aggregate by month
    history.forEach(purchase => {
      const date = parseISO(purchase.purchase_date);
      const monthKey = format(startOfMonth(date), 'yyyy-MM-dd');
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          date: startOfMonth(date),
          label: format(date, "MMM yyyy", { locale: ptBR }),
          BRL: 0,
          USD: 0
        };
      }
      
      // Converter a compra para a moeda de visualização
      let compraEfetivaBRL = 0;
      if (purchase.currency === "BRL") {
        compraEfetivaBRL = Number(purchase.purchase_price) * Number(purchase.quantity);
      } else if (purchase.currency === "USD") {
        compraEfetivaBRL = (Number(purchase.purchase_price) * (Number(purchase.exchange_rate) || usdRate)) * Number(purchase.quantity);
      }
      
      monthlyData[monthKey].BRL += compraEfetivaBRL;
      monthlyData[monthKey].USD += compraEfetivaBRL / usdRate;
    });
    
    // Sort chronologically and format
    return Object.values(monthlyData)
      .sort((a, b) => a.date - b.date)
      .map(item => ({
        name: item.label,
        "Volume Aportado": displayCurrency === "USD" ? item.USD : item.BRL
      }));
  }, [history, displayCurrency, usdRate]);

  if (isLoading && !data) {
    return <LoadingState message="Preparando relatórios da sua carteira..." />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader
        icon={BarChart3}
        title="Relatórios de Patrimônio"
        subtitle="Analise a distribuição, rentabilidade e histórico dos seus investimentos."
        actions={
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
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Alocação Geral */}
        <div className="bg-white dark:bg-zinc-900 rounded-[32px] p-6 sm:p-8 border border-zinc-200 dark:border-white/5 shadow-xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-2xl bg-fin-mint/10 text-fin-mint flex items-center justify-center">
              <PieChartIcon size={20} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-zinc-900 dark:text-white">Alocação Geral</h3>
              <p className="text-xs text-zinc-500">Fiat x Investimentos</p>
            </div>
          </div>
          
          {generalAllocationData.length > 0 ? (
            <div className="h-64 sm:h-80 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={generalAllocationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {generalAllocationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle"
                    formatter={(value) => <span className="font-bold text-zinc-700 dark:text-zinc-300 text-xs ml-1">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-[-36px]">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Total</span>
                  <span className="text-lg font-black text-zinc-900 dark:text-white">
                      {formatValue(getCurrencyValue(data?.summary?.total_wealth_brl || 0))}
                  </span>
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-zinc-500 italic text-sm">Sem dados suficientes.</div>
          )}
        </div>

        {/* Alocação por Ativo */}
        <div className="bg-white dark:bg-zinc-900 rounded-[32px] p-6 sm:p-8 border border-zinc-200 dark:border-white/5 shadow-xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Coins size={20} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-zinc-900 dark:text-white">Distribuição da Carteira</h3>
              <p className="text-xs text-zinc-500">Peso de cada ativo</p>
            </div>
          </div>
          
          {assetAllocationData.length > 0 ? (
            <div className="h-64 sm:h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={assetAllocationData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    stroke="none"
                  >
                    {assetAllocationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle"
                    formatter={(value) => <span className="font-bold text-zinc-700 dark:text-zinc-300 text-xs ml-1">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
             <div className="h-64 flex items-center justify-center text-zinc-500 italic text-sm">Adicione ativos à sua carteira.</div>
          )}
        </div>
      </div>

      {/* Histórico de Aportes */}
      <div className="bg-white dark:bg-zinc-900 rounded-[32px] p-6 sm:p-8 border border-zinc-200 dark:border-white/5 shadow-xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-fin-peach/10 text-fin-peach flex items-center justify-center">
            <Calendar size={20} />
          </div>
          <div>
            <h3 className="font-bold text-lg text-zinc-900 dark:text-white">Volume de Aportes</h3>
            <p className="text-xs text-zinc-500">Capital investido mensalmente</p>
          </div>
        </div>

        {historyData.length > 0 ? (
          <div className="h-72 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-zinc-200 dark:text-white/5" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#71717a", fontSize: 12, fontWeight: "bold" }}
                  dy={10}
                />
                <YAxis 
                  hide={true} // Escondemos o eixo Y para um design mais limpo
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                <Area 
                  type="monotone" 
                  dataKey="Volume Aportado" 
                  stroke="#f59e0b" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorVolume)" 
                  activeDot={{ r: 6, strokeWidth: 0, fill: "#f59e0b" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-72 flex items-center justify-center text-zinc-500 italic text-sm">Nenhum histórico de compras encontrado.</div>
        )}
      </div>

      {/* Comparativo de Rentabilidade */}
      <div className="bg-white dark:bg-zinc-900 rounded-[32px] p-6 sm:p-8 border border-zinc-200 dark:border-white/5 shadow-xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
            <TrendingUp size={20} />
          </div>
          <div>
            <h3 className="font-bold text-lg text-zinc-900 dark:text-white">Rentabilidade vs Custo</h3>
            <p className="text-xs text-zinc-500">Comparação entre valor investido e valor atual por ativo</p>
          </div>
        </div>

        {profitabilityData.length > 0 ? (
          <div className="h-80 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={profitabilityData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-zinc-200 dark:text-white/5" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#71717a", fontSize: 12, fontWeight: "bold" }}
                  dy={10}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(152, 229, 221, 0.05)' }} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle"
                  formatter={(value) => <span className="font-bold text-zinc-700 dark:text-zinc-300 text-xs ml-1">{value}</span>}
                />
                <Bar 
                  dataKey="Custo de Aquisição" 
                  fill="#71717a" 
                  radius={[4, 4, 0, 0]} 
                  barSize={maybeThinBar(profitabilityData.length)}
                />
                <Bar 
                  dataKey="Valor Atual" 
                  fill="#6cb888" 
                  radius={[4, 4, 0, 0]} 
                  barSize={maybeThinBar(profitabilityData.length)}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-80 flex items-center justify-center text-zinc-500 italic text-sm">Sem dados suficientes para comparar.</div>
        )}
      </div>

    </div>
  );
}

function maybeThinBar(count) {
  if (count > 10) return 12;
  if (count > 5) return 24;
  return 48;
}
