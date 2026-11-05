import React, { useState, useMemo, useCallback, useEffect } from "react";
import { format, parseISO, isPast, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  ChevronDown,
  Trash2,
  Calendar,
  ArrowRightLeft,
  Search,
  CreditCard,
  FileDown,
  ArrowUpDown,
  Bookmark,
  Sparkles,
  X,
  CheckSquare,
  Square,
  Check,
} from "lucide-react";
import { cn } from "../utils/classNames";
import CustomSelect from "../components/ui/CustomSelect";
import CustomDatePicker from "../components/ui/CustomDatePicker";
import TransactionRow from "../components/ui/TransactionRow";
import QuickEffectiveModal from "../modals/QuickEffectiveModal";
import TransactionRecurrenceConfirmModal from "../modals/TransactionRecurrenceConfirmModal";
import { useFinStore } from '../store/useFinStore';
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";
import TransactionFiltersOffcanvas from "../modals/TransactionFiltersOffcanvas";
import { getTransactionEffectiveDate } from "../utils/utils";
import { exportTransactionsPdf } from "../utils/exportPdf";

export default function TransactionsView({ fetchData, onEdit, showToast, showConfirm, initialFilters, isReadOnly, searchTerm }) {
  const { transactions, setTransactions, categories, accounts, cards, user, selectedProfile } = useFinStore();
  
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

  const [filter, setFilter] = useState({
    status: initialFilters?.status || "all",
    type: initialFilters?.type || "all",
    month: initialFilters?.month || format(new Date(), "yyyy-MM"),
    category: initialFilters?.category || "all",
    account: "all",
    dateStart: "",
    dateEnd: "",
    sortOrder: "desc",
    groupByCard: false,
  });

  // Filtros salvos (Presets) por perfil/usuário
  const storageKey = useMemo(() => {
    const profileId = selectedProfile?.id || user?.id || "default";
    return `fin_saved_transaction_presets_${profileId}`;
  }, [selectedProfile?.id, user?.id]);

  const [savedPresets, setSavedPresets] = useState(() => {
    try {
      const profileId = selectedProfile?.id || user?.id || "default";
      const saved = localStorage.getItem(`fin_saved_transaction_presets_${profileId}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activePresetId, setActivePresetId] = useState(null);

  // Carregar presets ao mudar de perfil
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      setSavedPresets(saved ? JSON.parse(saved) : []);
      setActivePresetId(null);
    } catch {
      setSavedPresets([]);
    }
  }, [storageKey]);

  const handleSavePreset = useCallback((presetName) => {
    if (!presetName) return;
    const newPreset = {
      id: Date.now().toString(),
      name: presetName,
      filter: { ...filter },
    };
    const updated = [newPreset, ...savedPresets];
    setSavedPresets(updated);
    setActivePresetId(newPreset.id);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    showToast?.(`Filtro "${presetName}" salvo com sucesso!`, "success");
  }, [filter, savedPresets, storageKey, showToast]);

  const handleApplyPreset = useCallback((preset) => {
    if (!preset) return;
    setFilter({
      ...filter,
      ...preset.filter,
    });
    setActivePresetId(preset.id);
    showToast?.(`Filtro "${preset.name}" aplicado!`);
  }, [filter, showToast]);

  const handleDeletePreset = useCallback((presetId) => {
    const updated = savedPresets.filter((p) => p.id !== presetId);
    setSavedPresets(updated);
    if (activePresetId === presetId) {
      setActivePresetId(null);
    }
    localStorage.setItem(storageKey, JSON.stringify(updated));
    showToast?.("Filtro salvo removido.");
  }, [savedPresets, activePresetId, storageKey, showToast]);

  const [localSearchTerm, setLocalSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const monthPickerRef = React.useRef(null);

  useEffect(() => {
    if (!isMonthPickerOpen) return;
    function handleClickOutside(event) {
      if (monthPickerRef.current && !monthPickerRef.current.contains(event.target)) {
        setIsMonthPickerOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsMonthPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMonthPickerOpen]);

  const [isMoreFiltersOpen, setIsMoreFiltersOpen] = useState(false);
  const [quickEffectiveTransaction, setQuickEffectiveTransaction] =
    useState(null);
  const [pickerYear, setPickerYear] = useState(() => {
    return initialFilters?.month && initialFilters.month !== "all"
      ? parseInt(initialFilters.month.split("-")[0])
      : new Date().getFullYear();
  });

  const [recurrenceConfig, setRecurrenceConfig] = useState({
    isOpen: false,
    transaction: null,
    type: "delete",
  });

  // Estado para seleção múltipla de transações
  const [selectedTxIds, setSelectedTxIds] = useState([]);

  // Limpar seleção ao mudar filtros ou busca
  useEffect(() => {
    setSelectedTxIds([]);
  }, [filter, localSearchTerm, searchTerm, selectedProfile]);

  const getFilterDate = useCallback(() => {
    if (!filter.month || filter.month === "all") return new Date();
    return parseISO(`${filter.month}-01`);
  }, [filter.month]);

  const handlePrevMonth = useCallback(() => {
    const d = getFilterDate();
    d.setMonth(d.getMonth() - 1);
    setFilter((prev) => ({ ...prev, month: format(d, "yyyy-MM") }));
  }, [getFilterDate]);

  const handleNextMonth = useCallback(() => {
    const d = getFilterDate();
    d.setMonth(d.getMonth() + 1);
    setFilter((prev) => ({ ...prev, month: format(d, "yyyy-MM") }));
  }, [getFilterDate]);

  const hasActiveFilters =
    filter.status !== "all" ||
    filter.category !== "all" ||
    filter.account !== "all" ||
    filter.dateStart ||
    filter.dateEnd;

  const [showProjectedBalance, setShowProjectedBalance] = useState(() => {
    const saved = localStorage.getItem("fin_show_projected_balance");
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem(
      "fin_show_projected_balance",
      JSON.stringify(showProjectedBalance),
    );
  }, [showProjectedBalance]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, localSearchTerm, searchTerm, selectedProfile]);

  const activeFiltersCount = useMemo(
    () =>
      [
        filter.status !== "all",
        filter.category !== "all",
        filter.account !== "all",
        filter.dateStart,
        filter.dateEnd,
        filter.month !== format(new Date(), "yyyy-MM") &&
          filter.month !== "all",
      ].filter(Boolean).length,
    [
      filter.status,
      filter.category,
      filter.account,
      filter.dateStart,
      filter.dateEnd,
      filter.month,
    ],
  );

  const { filtered, allFilteredTransactions, totalCount, sortedDates, groupedTransactions, summaryTotals } = useMemo(() => {
    const targetCategoryIds = (() => {
      if (filter.category === "all" || !categories) return null;
      const selectedCat = categories.find((c) => String(c.id) === String(filter.category));
      if (!selectedCat) return [filter.category];
      if (!selectedCat.parent_id) {
        return [
          selectedCat.id,
          ...categories
            .filter((c) => c.parent_id === selectedCat.id)
            .map((c) => c.id),
        ].map(id => String(id));
      }
      return [String(selectedCat.id)];
    })();

    const filteredList = profileTransactions.filter((t) => {
      // 1. Filtro de Tipo (Sempre aplicado)
      if (filter.type !== "all" && t.type !== filter.type) return false;

      // 2. Filtro de Mês/Data (Usando data de competência para cartões)
      if (filter.dateStart || filter.dateEnd) {
        if (filter.dateStart && t.date < filter.dateStart) return false;
        if (filter.dateEnd && t.date > filter.dateEnd) return false;
      } else {
        if (filter.month !== "all") {
          const effectiveDate = getTransactionEffectiveDate(t, cards);
          const transactionMonth = format(effectiveDate, "yyyy-MM");
          if (transactionMonth !== filter.month) return false;
        }
      }

      // 3. Filtro de Busca
      const effectiveSearchTerm = localSearchTerm || searchTerm;
      if (effectiveSearchTerm) {
        const term = effectiveSearchTerm.toLowerCase();
        const matchesDescription = t.description.toLowerCase().includes(term);
        const matchesCategory = t.category_name?.toLowerCase().includes(term);
        const matchesAmount = String(t.amount).includes(term);
        const matchesAccount = t.account_name?.toLowerCase().includes(term);
        if (!matchesDescription && !matchesCategory && !matchesAmount && !matchesAccount)
          return false;
      }
      
      // 4. Filtro de Categoria
      if (targetCategoryIds && !targetCategoryIds.includes(String(t.category_id)))
        return false;

      // 5. Filtro de Conta
      if (filter.account !== "all" && String(t.account_id) !== String(filter.account))
        return false;
        
      return true;
    });

    // Calcular totais de resumo ANTES de filtrar por status
    const summaryTotals = {
      total: filteredList.reduce((s, t) => s + Number(t.amount), 0),
      paid: filteredList.filter(t => t.status === 'Paid').reduce((s, t) => s + Number(t.amount), 0),
      pending: filteredList.filter(t => t.status === 'Pending').reduce((s, t) => s + Number(t.amount), 0),
      paidCount: filteredList.filter(t => t.status === 'Paid').length,
      pendingCount: filteredList.filter(t => t.status === 'Pending').length,
      totalCount: filteredList.length
    };

    // Agora aplicar o filtro de status para a exibição na lista
    const displayList = filteredList.filter(t => {
      if (filter.status !== "all" && t.status !== filter.status) return false;
      return true;
    });

    let finalDisplayList = [...displayList];
    
    if (filter.groupByCard && filter.month !== "all") {
      const cardTotals = {};
      const nonCardTransactions = [];
      
      displayList.forEach(t => {
        if (t.card_id && t.type === "Expense") {
          if (!cardTotals[t.card_id]) {
            const card = (cards || []).find(c => String(c.id) === String(t.card_id));
            cardTotals[t.card_id] = {
              card_id: t.card_id,
              card_name: card?.name || "Cartão",
              amount: 0,
              transactions: [],
              due_day: card?.due_day || 1
            };
          }
          cardTotals[t.card_id].amount += parseFloat(t.amount);
          cardTotals[t.card_id].transactions.push(t);
        } else {
          nonCardTransactions.push(t);
        }
      });
      
      const virtualTransactions = Object.values(cardTotals).map(group => {
        const [year, month] = filter.month.split('-');
        const displayDate = `${year}-${month}-${String(group.due_day).padStart(2, '0')}`;
        
        return {
          id: `card-summary-${group.card_id}-${filter.month}`,
          description: `Fatura ${group.card_name}`,
          amount: group.amount,
          date: displayDate,
          type: "Expense",
          status: group.transactions.every(tx => tx.status === "Paid") ? "Paid" : "Pending",
          category_name: "Cartão de Crédito",
          category_icon: "CreditCard",
          is_group: true,
          is_effective: true,
          card_id: group.card_id,
          transactions: group.transactions
        };
      });
      
      finalDisplayList = [...nonCardTransactions, ...virtualTransactions];
    }

    finalDisplayList.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return filter.sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

    const baseInitialBalance = profileAccounts
      ? profileAccounts.reduce((acc, a) => acc + parseFloat(a.initial_balance || 0), 0)
      : 0;

    const dailyNet = {};
    const datesSet = new Set();
    profileTransactions.forEach((t) => {
      const d = t.date;
      datesSet.add(d);
      if (t.type === "Transfer") return;
      const val = Number(t.amount) * (t.type === "Income" ? 1 : -1);
      dailyNet[d] = (dailyNet[d] || 0) + val;
    });

    const allSortedDates = Array.from(datesSet).sort((a, b) => new Date(a) - new Date(b));
    let runningTotal = baseInitialBalance;
    const cumulativeBalances = {};
    allSortedDates.forEach((date) => {
      runningTotal += dailyNet[date] || 0;
      cumulativeBalances[date] = runningTotal;
    });

    const totalCount = finalDisplayList.length;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedList = finalDisplayList.slice(startIndex, startIndex + itemsPerPage);

    const grouped = paginatedList.reduce((groups, t) => {
      const date = t.date;
      if (!groups[date]) {
        groups[date] = {
          transactions: [],
          balance: cumulativeBalances[date] || 0,
        };
      }
      groups[date].transactions.push(t);
      return groups;
    }, {});

    Object.keys(grouped).forEach((date) => {
      grouped[date].displayItems = grouped[date].transactions.map((t) => ({
        type: "transaction",
        data: t,
      }));
    });

    const sortedGroups = Object.keys(grouped).sort((a, b) => {
      return filter.sortOrder === "desc" ? new Date(b) - new Date(a) : new Date(a) - new Date(b);
    });

    return {
      filtered: paginatedList,
      allFilteredTransactions: finalDisplayList,
      totalCount: totalCount,
      sortedDates: sortedGroups,
      groupedTransactions: grouped,
      summaryTotals
    };
  }, [profileTransactions, filter, profileAccounts, cards, localSearchTerm, searchTerm, currentPage, itemsPerPage, categories]);

  // Itens selecionáveis na página atual (exclui grupos virtuais de fatura de cartão)
  const selectableCurrentPageItems = useMemo(() => {
    return filtered.filter((t) => !t.is_group);
  }, [filtered]);

  const isAllCurrentPageSelected = useMemo(() => {
    if (selectableCurrentPageItems.length === 0) return false;
    return selectableCurrentPageItems.every((t) => selectedTxIds.includes(t.id));
  }, [selectableCurrentPageItems, selectedTxIds]);

  const handleToggleSelectAll = useCallback(() => {
    if (isAllCurrentPageSelected) {
      const currentIds = new Set(selectableCurrentPageItems.map((t) => t.id));
      setSelectedTxIds((prev) => prev.filter((id) => !currentIds.has(id)));
    } else {
      const currentIds = selectableCurrentPageItems.map((t) => t.id);
      setSelectedTxIds((prev) => Array.from(new Set([...prev, ...currentIds])));
    }
  }, [isAllCurrentPageSelected, selectableCurrentPageItems]);

  const handleToggleSelect = useCallback((txId) => {
    setSelectedTxIds((prev) =>
      prev.includes(txId) ? prev.filter((id) => id !== txId) : [...prev, txId]
    );
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedTxIds([]);
  }, []);

  const handleBulkDelete = useCallback(() => {
    if (selectedTxIds.length === 0) return;

    const count = selectedTxIds.length;
    const title = "Excluir Transações Selecionadas";
    const message = `Tem certeza que deseja excluir ${count} ${
      count === 1 ? "transação selecionada" : "transações selecionadas"
    }? Esta ação não pode ser desfeita.`;

    showConfirm(title, message, () => executeBulkDelete(selectedTxIds));
  }, [selectedTxIds, showConfirm]);

  const executeBulkDelete = async (idsToDelete) => {
    const previousState = [...transactions];
    const idsSet = new Set(idsToDelete);

    // Otimista: remove do estado local
    setTransactions((prev) => prev.filter((t) => !idsSet.has(t.id)));
    setSelectedTxIds([]);

    try {
      const res = await fetch("/api/transactions/bulk", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ ids: idsToDelete }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        showToast(data.message || `${idsToDelete.length} transações excluídas com sucesso!`, "success");
        fetchData();
      } else {
        setTransactions(previousState);
        showToast(data.error || "Erro ao excluir transações selecionadas.", "error");
      }
    } catch (e) {
      setTransactions(previousState);
      showToast("Erro de conexão ao excluir transações.", "error");
    }
  };

  const handleDelete = (transaction) => {
    if (transaction.parent_id) {
      setRecurrenceConfig({
        isOpen: true,
        transaction,
        type: "delete",
      });
      return;
    }

    let mode = "only";
    let message = "Tem certeza que deseja excluir esta transação?";
    let title = "Excluir Transação";

    if (transaction.total_installments) {
      mode = "all";
      message =
        "Esta é uma transação parcelada. Isso excluirá todas as parcelas. Deseja continuar?";
    }

    showConfirm(title, message, () => executeDelete(transaction, mode));
  };

  const executeDelete = async (transaction, mode) => {
    const previousState = [...transactions];
    if (mode === "all" || mode === "all_pending") {
      setTransactions((prev) =>
        prev.filter((t) => {
          if (mode === "all") return t.parent_id !== transaction.parent_id && t.id !== transaction.id;
          if (mode === "all_pending") {
            return !(t.parent_id === transaction.parent_id && t.status === "Pending" && t.date >= transaction.date);
          }
          return t.id !== transaction.id;
        }),
      );
    } else {
      setTransactions((prev) => prev.filter((t) => t.id !== transaction.id));
    }

    try {
      const res = await fetch(
        `/api/transactions/${transaction.id}?mode=${mode}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      if (res.ok) {
        showToast("Transação excluída com sucesso!", "success");
        fetchData();
      } else {
        setTransactions(previousState);
        showToast("Erro ao excluir transação.", "error");
      }
    } catch (e) {
      setTransactions(previousState);
      showToast("Erro de conexão.", "error");
    }
  };

  const handleExportPdf = useCallback(() => {
    const exportList = allFilteredTransactions.filter(t => !t.is_group);

    const income = exportList
      .filter(t => t.type === 'Income')
      .reduce((s, t) => s + Number(t.amount), 0);
    const expense = exportList
      .filter(t => t.type === 'Expense')
      .reduce((s, t) => s + Number(t.amount), 0);

    let filterLabel = 'Todas as transações';
    if (filter.month && filter.month !== 'all') {
      filterLabel = format(parseISO(`${filter.month}-01`), "MMMM 'de' yyyy", { locale: ptBR });
      filterLabel = filterLabel.charAt(0).toUpperCase() + filterLabel.slice(1);
    }
    if (filter.type !== 'all') {
      const typeMap = { Income: 'Receitas', Expense: 'Despesas', Transfer: 'Transferências' };
      filterLabel += ` — ${typeMap[filter.type] || filter.type}`;
    }

    exportTransactionsPdf({
      transactions: exportList,
      user: selectedProfile || user,
      filterLabel,
      summary: {
        income,
        expense,
        balance: income - expense,
      },
    });
  }, [allFilteredTransactions, filter, user, selectedProfile]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Top Header com Seletor de Mês integrado */}
      <PageHeader
        icon={ArrowRightLeft}
        title="Transações"
        subtitle="Gerencie seu fluxo de caixa e acompanhe cada movimentação."
        className="relative z-30"
        actions={
          <div ref={monthPickerRef} className="relative flex items-center gap-1.5 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-zinc-200 dark:border-white/5 shadow-md shadow-black/5 dark:shadow-black/20 hover:border-zinc-300 dark:hover:border-white/10 transition-all duration-300">
            <button
              onClick={handlePrevMonth}
              className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 rounded-xl transition-all active:scale-95 cursor-pointer"
              title="Mês Anterior"
            >
              <ChevronLeft size={16} />
            </button>

            <button
              onClick={() => {
                setPickerYear(getFilterDate().getFullYear());
                setIsMonthPickerOpen(!isMonthPickerOpen);
              }}
              className="text-xs font-black min-w-[130px] text-center uppercase tracking-wider text-zinc-700 dark:text-zinc-300 hover:text-fin-mint transition-colors py-1.5 px-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-white/5 cursor-pointer"
            >
              {filter.month !== "all"
                ? format(getFilterDate(), "MMMM yyyy", { locale: ptBR })
                : "Todos os Meses"}
            </button>

            <button
              onClick={handleNextMonth}
              className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 rounded-xl transition-all active:scale-95 cursor-pointer"
              title="Próximo Mês"
            >
              <ChevronRight size={16} />
            </button>

            {filter.month !== "all" && (
              <>
                <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 mx-1"></div>
                <button
                  onClick={() => setFilter({ ...filter, month: "all" })}
                  className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  title="Ver Todos os Meses"
                >
                  <Trash2 size={15} />
                </button>
              </>
            )}

            {isMonthPickerOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsMonthPickerOpen(false)}
                />
                <div className="absolute top-full right-0 mt-3 p-5 bg-fin-surface border border-zinc-200 dark:border-white/10 rounded-3xl shadow-2xl z-50 w-[calc(100vw-2rem)] max-w-[288px] md:w-72 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex justify-between items-center mb-4">
                    <button
                      onClick={() => setPickerYear((y) => y - 1)}
                      className="p-2 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-xl transition-colors text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <span className="font-bold text-lg text-zinc-900 dark:text-white">
                      {pickerYear}
                    </span>
                    <button
                      onClick={() => setPickerYear((y) => y + 1)}
                      className="p-2 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-xl transition-colors text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {Array.from({ length: 12 }).map((_, i) => {
                      const m = new Date(pickerYear, i, 1);
                      const isSelected = filter.month === format(m, "yyyy-MM");
                      return (
                        <button
                          key={i}
                          onClick={() => {
                            setFilter({
                              ...filter,
                              month: format(m, "yyyy-MM"),
                            });
                            setIsMonthPickerOpen(false);
                          }}
                          className={cn(
                            "py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer",
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
        }
      />

      {/* Barra de Filtros e Ferramentas */}
      <div className="relative z-20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md p-2.5 sm:p-3 rounded-2xl md:rounded-3xl border border-zinc-200/80 dark:border-white/5 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <CustomSelect
            value={filter.type}
            onChange={(val) =>
              setFilter({ ...filter, type: val, category: "all" })
            }
            options={[
              { value: "all", label: "Todos os Tipos" },
              { value: "Income", label: "Receitas" },
              { value: "Expense", label: "Despesas" },
              { value: "Transfer", label: "Transferências" },
            ]}
            className="relative z-30"
            triggerClassName="h-11 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-2xl px-4 text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 min-w-[150px] shadow-sm hover:shadow-md transition-all"
          />

          <button
            onClick={() => setIsMoreFiltersOpen(!isMoreFiltersOpen)}
            className={cn(
              "h-11 flex items-center gap-2 px-4 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all border shadow-sm cursor-pointer",
              isMoreFiltersOpen || activeFiltersCount > 0
                ? "bg-fin-mint/10 border-fin-mint/30 text-fin-mint shadow-fin-mint/10"
                : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/5 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/5",
            )}
          >
            <Filter size={15} />
            <span>Filtros</span>
            {activeFiltersCount > 0 && (
              <span className="bg-fin-mint text-fin-bg text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black">
                {activeFiltersCount}
              </span>
            )}
            <ChevronDown
              size={13}
              className={cn(
                "transition-transform duration-300",
                isMoreFiltersOpen && "rotate-180"
              )}
            />
          </button>

          {/* Atalhos de Filtros Salvos Rápidos (Dropdown ou Badges Compactas) */}
          {savedPresets.length > 0 && (
            <div className="hidden lg:flex items-center gap-1.5 pl-2 border-l border-zinc-200 dark:border-white/10">
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 mr-1 flex items-center gap-1">
                <Bookmark size={11} className="text-fin-mint" />
                Salvos:
              </span>
              {savedPresets.slice(0, 3).map((preset) => {
                const isActive = activePresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleApplyPreset(preset)}
                    className={cn(
                      "h-8 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border",
                      isActive
                        ? "bg-fin-mint text-fin-bg border-fin-mint shadow-sm shadow-fin-mint/20"
                        : "bg-zinc-100 dark:bg-zinc-800/60 border-transparent hover:border-zinc-300 dark:hover:border-white/15 text-zinc-600 dark:text-zinc-300"
                    )}
                  >
                    <Sparkles size={11} className={isActive ? "text-fin-bg" : "text-zinc-400"} />
                    <span className="max-w-[120px] truncate">{preset.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() =>
              setFilter((prev) => ({
                ...prev,
                sortOrder: prev.sortOrder === "desc" ? "asc" : "desc",
              }))
            }
            title={filter.sortOrder === "desc" ? "Ordenar por: Mais Recentes Primeiro" : "Ordenar por: Mais Antigas Primeiro"}
            className={cn(
              "h-11 flex items-center gap-2 px-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all border shadow-sm cursor-pointer",
              filter.sortOrder === "asc"
                ? "bg-fin-mint/10 border-fin-mint/30 text-fin-mint"
                : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/5 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/5",
            )}
          >
            <ArrowUpDown size={15} className={cn("transition-transform duration-300", filter.sortOrder === "asc" && "rotate-180")} />
            <span className="hidden sm:inline">
              {filter.sortOrder === "desc" ? "Mais Recentes" : "Mais Antigas"}
            </span>
          </button>

          <button
            onClick={handleExportPdf}
            title="Exportar PDF das transações filtradas"
            className="h-11 flex items-center gap-2 px-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all border shadow-sm bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/5 text-zinc-700 dark:text-zinc-300 hover:bg-fin-mint hover:text-fin-bg hover:border-fin-mint hover:shadow-fin-mint/20 cursor-pointer"
          >
            <FileDown size={15} />
            <span className="hidden sm:inline">Exportar</span>
          </button>
        </div>
      </div>

      <TransactionFiltersOffcanvas
        isOpen={isMoreFiltersOpen}
        onClose={() => setIsMoreFiltersOpen(false)}
        filter={filter}
        setFilter={setFilter}
        categories={categories}
        accounts={accounts}
        profileAccounts={profileAccounts}
        hasActiveFilters={activeFiltersCount > 0}
        showProjectedBalance={showProjectedBalance}
        setShowProjectedBalance={setShowProjectedBalance}
        savedPresets={savedPresets}
        activePresetId={activePresetId}
        onSavePreset={handleSavePreset}
        onApplyPreset={handleApplyPreset}
        onDeletePreset={handleDeletePreset}
      />

      {/* Summary Cards */}
      {filter.type !== "all" &&
        filter.type !== "Transfer" &&
        summaryTotals && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-6">
            <div
              onClick={() => setFilter((prev) => ({ ...prev, status: "all" }))}
              className={cn(
                "bg-fin-surface p-3 md:p-5 rounded-[20px] border shadow-lg col-span-2 md:col-span-1 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]",
                filter.status === "all"
                  ? "border-fin-mint/50 bg-fin-mint/5 ring-1 ring-fin-mint/20"
                  : "border-zinc-900/10 dark:border-white/5 hover:border-zinc-400 dark:hover:border-white/20",
              )}
            >
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">
                Total {filter.type === "Income" ? "Receitas" : "Despesas"}
              </p>
              <p
                className={cn(
                  "text-2xl font-bold tabular-nums",
                  filter.type === "Income" ? "text-fin-mint" : "text-[#ff7b7b]",
                )}
              >
                R${" "}
                {summaryTotals.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
              <p className="text-[11px] text-zinc-500 mt-1">
                {summaryTotals.totalCount} transações
              </p>
            </div>
            <div
              onClick={() => setFilter((prev) => ({ ...prev, status: "Paid" }))}
              className={cn(
                "bg-fin-surface p-3 md:p-5 rounded-[20px] border shadow-lg cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]",
                filter.status === "Paid"
                  ? "border-fin-mint/50 bg-fin-mint/5 ring-1 ring-fin-mint/20"
                  : "border-zinc-900/10 dark:border-white/5 hover:border-zinc-400 dark:hover:border-white/20",
              )}
            >
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">
                {filter.type === "Income" ? "Recebido" : "Pago"}
              </p>
              <p className="text-2xl font-bold tabular-nums text-fin-mint">
                R${" "}
                {summaryTotals.paid.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
              <p className="text-[11px] text-zinc-500 mt-1">
                {summaryTotals.paidCount} transações
              </p>
            </div>
            <div
              onClick={() => setFilter((prev) => ({ ...prev, status: "Pending" }))}
              className={cn(
                "bg-fin-surface p-3 md:p-5 rounded-[20px] border shadow-lg cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]",
                filter.status === "Pending"
                  ? "border-fin-peach/50 bg-fin-peach/5 ring-1 ring-fin-peach/20"
                  : "border-zinc-900/10 dark:border-white/5 hover:border-zinc-400 dark:hover:border-white/20",
              )}
            >
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">
                Pendente
              </p>
              <p className="text-2xl font-bold tabular-nums text-fin-peach">
                R${" "}
                {summaryTotals.pending.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </p>
              <p className="text-[11px] text-zinc-500 mt-1">
                {summaryTotals.pendingCount} transações
              </p>
            </div>
          </div>
        )}

      <div className="rounded-[24px] md:rounded-[32px] border border-zinc-200 dark:border-white/5 bg-white dark:bg-zinc-900/40 backdrop-blur-md shadow-xl mt-4 md:mt-6 overflow-hidden">
        {/* Bulk Actions Floating / Sticky Header Bar */}
        {selectedTxIds.length > 0 && (
          <div className="p-3 md:p-4 bg-fin-mint/10 dark:bg-fin-mint/15 border-b border-fin-mint/30 flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-xl bg-fin-mint text-fin-bg font-black text-xs flex items-center justify-center shadow-md shadow-fin-mint/20">
                {selectedTxIds.length}
              </span>
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-100">
                {selectedTxIds.length === 1
                  ? "1 transação selecionada"
                  : `${selectedTxIds.length} transações selecionadas`}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleClearSelection}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
              >
                Limpar seleção
              </button>
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-500 hover:bg-red-600 shadow-md shadow-red-500/20 active:scale-95 transition-all cursor-pointer"
              >
                <Trash2 size={14} />
                <span>Excluir selecionadas</span>
              </button>
            </div>
          </div>
        )}

        <div className="p-4 md:p-6 border-b border-zinc-200 dark:border-white/5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-zinc-50/50 dark:bg-black/10">
          <div className="flex items-center gap-3 flex-1 max-w-xl">
            {/* Selecionar Tudo na Página */}
            {!isReadOnly && selectableCurrentPageItems.length > 0 && (
              <div className="flex items-center">
                <button
                  onClick={handleToggleSelectAll}
                  className={cn(
                    "flex items-center gap-2.5 h-11 px-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all border shadow-sm cursor-pointer",
                    isAllCurrentPageSelected
                      ? "bg-fin-mint/10 border-fin-mint/30 text-fin-mint"
                      : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/5 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/5"
                  )}
                  title={isAllCurrentPageSelected ? "Desmarcar todos desta página" : "Selecionar todos desta página"}
                >
                  <div
                    className={cn(
                      "w-4 h-4 rounded-md border flex items-center justify-center transition-all duration-200",
                      isAllCurrentPageSelected
                        ? "bg-fin-mint border-fin-mint text-fin-bg"
                        : "border-zinc-400 dark:border-zinc-600 bg-transparent"
                    )}
                  >
                    <Check
                      size={11}
                      strokeWidth={3}
                      className={cn(
                        "transition-all duration-200",
                        isAllCurrentPageSelected ? "opacity-100 scale-100" : "opacity-0 scale-50"
                      )}
                    />
                  </div>
                  <span className="hidden sm:inline">
                    {isAllCurrentPageSelected ? "Desmarcar página" : "Selecionar página"}
                  </span>
                </button>
              </div>
            )}

            <div className="relative flex-1 text-zinc-900 dark:text-white group/search">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within/search:text-fin-mint transition-colors"
              />
              <input
                type="text"
                placeholder="Buscar transações por descrição, categoria ou conta..."
                value={localSearchTerm}
                onChange={(e) => setLocalSearchTerm(e.target.value)}
                className="w-full h-11 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-2xl py-2 pl-12 pr-4 text-xs focus:outline-none focus:ring-4 focus:ring-fin-mint/10 focus:border-fin-mint/30 transition-all shadow-sm"
              />
            </div>
          </div>
          <div className="flex items-center justify-between lg:justify-end gap-6">
            <div className="flex items-center gap-3 text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
              <span>Itens por página:</span>
              <CustomSelect
                value={itemsPerPage}
                onChange={(val) => setItemsPerPage(Number(val))}
                options={[
                  { value: 25, label: "25" },
                  { value: 50, label: "50" },
                  { value: 100, label: "100" },
                  { value: 200, label: "200" },
                ]}
                triggerClassName="bg-white dark:bg-zinc-900 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-white/5 text-zinc-700 dark:text-zinc-300 min-w-[85px] font-black shadow-sm"
              />
            </div>
            <p className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
              Total de <span className="text-fin-mint font-black">{totalCount}</span> registros
            </p>
          </div>
        </div>
        <div className="divide-y divide-white/5">
          {sortedDates.length > 0 ? (
            sortedDates.map((date) => (
              <div key={date} className="relative">
                <div className="sticky top-0 z-10 bg-zinc-100/90 dark:bg-zinc-950/90 backdrop-blur-md px-4 md:px-6 py-2 md:py-3 flex items-center justify-between border-y border-zinc-900/5 dark:border-white/5">
                  <span className="text-[10px] md:text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5 md:gap-2 truncate mr-2">
                    <Calendar size={12} className="text-fin-mint flex-shrink-0" />
                    <span className="truncate">
                      {format(parseISO(date), "EEEE, dd 'de' MMMM", {
                        locale: ptBR,
                      })}
                    </span>
                  </span>
                  {showProjectedBalance && (
                    <div className="flex flex-col md:flex-row md:items-center gap-0.5 md:gap-2 text-right flex-shrink-0">
                      <span className="text-[9px] md:text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                        {filter.type === "all"
                          ? <><span className="hidden md:inline">Saldo </span>Projetado:</>
                          : "Total:"}
                      </span>
                      <span
                        className={cn(
                          "text-[11px] md:text-xs font-bold tabular-nums min-w-[70px] md:min-w-[80px]",
                          filter.type === "all"
                            ? groupedTransactions[date].balance > 0
                              ? "text-fin-mint"
                              : groupedTransactions[date].balance < 0
                                ? "text-[#ff7b7b]"
                                : "text-zinc-500"
                            : filter.type === "Income"
                              ? "text-fin-mint"
                              : "text-[#ff7b7b]",
                        )}
                      >
                        R${" "}
                        {(filter.type === "all"
                          ? groupedTransactions[date].balance
                          : groupedTransactions[date].transactions.reduce(
                              (s, t) => s + Number(t.amount),
                              0,
                            )
                        ).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                </div>
                <div className="divide-y divide-zinc-900/5 dark:divide-white/5">
                  {groupedTransactions[date].displayItems.map((item, index) => {
                    if (item.type === "transaction") {
                      const t = item.data;
                      const isSelected = selectedTxIds.includes(t.id);
                      return (
                        <div
                          key={t.id}
                          className="animate-in slide-in-from-bottom-4 fade-in fill-mode-both"
                          style={{
                            animationDuration: "400ms",
                            animationDelay: `${index * 50}ms`,
                          }}
                        >
                          <TransactionRow
                            transaction={t}
                            onDelete={handleDelete}
                            onEdit={onEdit}
                            onQuickEffective={setQuickEffectiveTransaction}
                            currentUser={user}
                            isReadOnly={isReadOnly}
                            isSelected={isSelected}
                            onToggleSelect={handleToggleSelect}
                            showSelection={selectedTxIds.length > 0}
                          />
                        </div>
                      );
                    } else {
                      const totalAmount = item.transactions.reduce((acc, t) => acc + Number(t.amount), 0);
                      const allPaid = item.transactions.every(t => t.status === "Paid");
                      
                      const virtualTransaction = {
                        ...item.transactions[0],
                        id: `group-${item.card_id}-${date}`,
                        description: `Fatura ${item.card_name}`,
                        amount: totalAmount,
                        status: allPaid ? "Paid" : "Pending",
                        category_name: "Cartão de Crédito",
                        category_icon: "CreditCard",
                        installment_number: null,
                        total_installments: null,
                        is_group: true
                      };

                      return (
                        <div
                          key={`card-group-${item.card_id}`}
                          className="animate-in slide-in-from-bottom-4 fade-in fill-mode-both"
                          style={{
                            animationDuration: "400ms",
                            animationDelay: `${index * 50}ms`,
                          }}
                        >
                          <TransactionRow
                            transaction={virtualTransaction}
                            onDelete={() => {}}
                            onEdit={() => {}}
                            onQuickEffective={setQuickEffectiveTransaction}
                            currentUser={user}
                            isReadOnly={true}
                          />
                        </div>
                      );
                    }
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="p-16 text-center">
              <div className="w-16 h-16 text-zinc-900 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-600 dark:text-zinc-500">
                <ArrowRightLeft size={32} />
              </div>
              <p className="text-zinc-600 dark:text-zinc-500 font-medium text-sm">
                Nenhuma transação encontrada com esses filtros.
              </p>
            </div>
          )}
        </div>

        {totalCount > itemsPerPage && (
          <div className="p-6 border-t border-zinc-900/10 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
              Página {currentPage} de {Math.ceil(totalCount / itemsPerPage)}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 bg-zinc-200/50 dark:bg-white/5 hover:bg-zinc-300/50 dark:hover:bg-white/10 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed text-zinc-900 dark:text-white"
              >
                <ChevronLeft size={18} />
              </button>

              <div className="flex items-center gap-1">
                {(() => {
                  const totalPages = Math.ceil(totalCount / itemsPerPage);
                  const pages = [];
                  const maxVisible = 5;

                  let start = Math.max(1, currentPage - 2);
                  let end = Math.min(totalPages, start + maxVisible - 1);

                  if (end - start < maxVisible - 1) {
                    start = Math.max(1, end - maxVisible + 1);
                  }

                  if (start > 1) {
                    pages.push(
                      <button
                        key={1}
                        onClick={() => setCurrentPage(1)}
                        className="w-8 h-8 text-[10px] font-black rounded-lg hover:bg-zinc-900/5 dark:hover:bg-white/5 text-zinc-500"
                      >
                        1
                      </button>,
                    );
                    if (start > 2)
                      pages.push(
                        <span key="sep1" className="text-zinc-500 text-[10px]">
                          ...
                        </span>,
                      );
                  }

                  for (let i = start; i <= end; i++) {
                    pages.push(
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i)}
                        className={cn(
                          "w-8 h-8 text-[10px] font-black rounded-lg transition-all",
                          currentPage === i
                            ? "bg-fin-mint text-fin-bg"
                            : "hover:bg-zinc-900/5 dark:hover:bg-white/5 text-zinc-500",
                        )}
                      >
                        {i}
                      </button>,
                    );
                  }

                  if (end < totalPages) {
                    if (end < totalPages - 1)
                      pages.push(
                        <span key="sep2" className="text-zinc-500 text-[10px]">
                          ...
                        </span>,
                      );
                    pages.push(
                      <button
                        key={totalPages}
                        onClick={() => setCurrentPage(totalPages)}
                        className="w-8 h-8 text-[10px] font-black rounded-lg hover:bg-zinc-900/5 dark:hover:bg-white/5 text-zinc-500"
                      >
                        {totalPages}
                      </button>,
                    );
                  }

                  return pages;
                })()}
              </div>

              <button
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(Math.ceil(totalCount / itemsPerPage), prev + 1),
                  )
                }
                disabled={currentPage === Math.ceil(totalCount / itemsPerPage)}
                className="p-2 bg-zinc-200/50 dark:bg-white/5 hover:bg-zinc-300/50 dark:hover:bg-white/10 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed text-zinc-900 dark:text-white"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {quickEffectiveTransaction && (
        <QuickEffectiveModal
          transaction={quickEffectiveTransaction}
          onClose={() => setQuickEffectiveTransaction(null)}
          onSuccess={fetchData}
          accounts={profileAccounts}
          showToast={showToast}
        />
      )}

      <TransactionRecurrenceConfirmModal
        isOpen={recurrenceConfig.isOpen}
        onClose={() => setRecurrenceConfig({ ...recurrenceConfig, isOpen: false })}
        type={recurrenceConfig.type}
        onConfirm={(mode) => {
          setRecurrenceConfig({ ...recurrenceConfig, isOpen: false });
          if (recurrenceConfig.type === "delete") {
            executeDelete(recurrenceConfig.transaction, mode);
          }
        }}
      />
    </div>
  );
}
