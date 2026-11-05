import React, { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Filter, ChevronDown, Bookmark, BookmarkPlus, Check, Sparkles } from "lucide-react";
import { cn } from "../utils/classNames";
import CustomSelect from "../components/ui/CustomSelect";
import CustomDatePicker from "../components/ui/CustomDatePicker";

export default function TransactionFiltersOffcanvas({
  isOpen,
  onClose,
  filter,
  setFilter,
  categories,
  accounts,
  profileAccounts,
  hasActiveFilters,
  showProjectedBalance,
  setShowProjectedBalance,
  savedPresets = [],
  activePresetId = null,
  onSavePreset,
  onApplyPreset,
  onDeletePreset,
}) {
  const [newPresetName, setNewPresetName] = useState("");
  const [isSavingPreset, setIsSavingPreset] = useState(false);

  const handleSavePresetSubmit = (e) => {
    e.preventDefault();
    if (!newPresetName.trim() || !onSavePreset) return;
    onSavePreset(newPresetName.trim());
    setNewPresetName("");
    setIsSavingPreset(false);
  };
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[998] bg-black/60 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-[400px] z-[999] bg-fin-bg border-l border-zinc-900/10 dark:border-white/5 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-zinc-900/10 dark:border-white/5 flex items-center justify-between bg-zinc-100/80 dark:bg-black/40 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-fin-mint/10 border border-fin-mint/20 flex items-center justify-center text-fin-mint shadow-inner">
                  <Filter size={18} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-zinc-900 dark:text-white uppercase italic tracking-tight flex items-center gap-1.5">
                    Filtros Avançados<span className="text-fin-mint">.</span>
                  </h3>
                  <p className="text-[11px] font-medium text-zinc-500">
                    Personalize e memorize suas visualizações
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-zinc-200/60 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Saved Filters / Presets Card */}
              <div className="bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-white/10 rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-fin-mint/15 text-fin-mint flex items-center justify-center">
                      <Bookmark size={13} />
                    </div>
                    <span className="text-xs font-black uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                      Filtros Memorizados
                    </span>
                  </div>
                  
                  {!isSavingPreset && (
                    <button
                      type="button"
                      onClick={() => setIsSavingPreset(true)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-fin-mint hover:text-fin-mint/80 transition-colors py-1 px-2.5 rounded-lg hover:bg-fin-mint/10 cursor-pointer"
                    >
                      <BookmarkPlus size={14} />
                      <span>Salvar Atual</span>
                    </button>
                  )}
                </div>

                {/* Form to save new preset */}
                {isSavingPreset && (
                  <form onSubmit={handleSavePresetSubmit} className="pt-2 border-t border-zinc-100 dark:border-white/5 space-y-2">
                    <p className="text-[11px] text-zinc-500 font-medium">
                      Dê um nome para salvar a combinação de filtros atual:
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Ex: Despesas Fixas, Faturas..."
                        value={newPresetName}
                        onChange={(e) => setNewPresetName(e.target.value)}
                        autoFocus
                        className="flex-1 h-10 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-white/10 rounded-xl px-3 text-xs font-medium text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-fin-mint/20 focus:border-fin-mint transition-all"
                      />
                      <button
                        type="submit"
                        disabled={!newPresetName.trim()}
                        className="h-10 px-3.5 bg-fin-mint text-fin-bg rounded-xl font-black text-xs uppercase tracking-wider hover:brightness-110 disabled:opacity-40 transition-all shrink-0 cursor-pointer shadow-sm"
                      >
                        Salvar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsSavingPreset(false);
                          setNewPresetName("");
                        }}
                        className="h-10 px-2.5 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 text-xs font-bold rounded-xl hover:bg-zinc-100 dark:hover:bg-white/5 transition-all shrink-0 cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                )}

                {/* List of saved presets */}
                {savedPresets.length > 0 ? (
                  <div className="space-y-1.5 pt-1">
                    {savedPresets.map((preset) => {
                      const isActive = activePresetId === preset.id;
                      return (
                        <div
                          key={preset.id}
                          className={cn(
                            "flex items-center justify-between p-2.5 rounded-xl border transition-all duration-200 group/preset",
                            isActive
                              ? "bg-fin-mint/10 border-fin-mint/40 text-fin-mint shadow-sm"
                              : "bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200/70 dark:border-white/5 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-white/20 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/80"
                          )}
                        >
                          <button
                            type="button"
                            onClick={() => onApplyPreset && onApplyPreset(preset)}
                            className="flex items-center gap-2.5 flex-1 min-w-0 text-left cursor-pointer"
                          >
                            <div className={cn(
                              "w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-colors",
                              isActive ? "bg-fin-mint text-fin-bg" : "bg-zinc-200 dark:bg-white/10 text-zinc-500 group-hover/preset:text-fin-mint"
                            )}>
                              {isActive ? <Check size={12} strokeWidth={3} /> : <Sparkles size={11} />}
                            </div>
                            <span className="text-xs font-bold truncate">
                              {preset.name}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeletePreset && onDeletePreset(preset.id);
                            }}
                            title="Excluir este filtro"
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-colors opacity-60 group-hover/preset:opacity-100 cursor-pointer ml-1"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  !isSavingPreset && (
                    <div className="py-2 text-center text-[11px] text-zinc-400 font-medium">
                      Nenhum filtro personalizado salvo ainda.
                    </div>
                  )
                )}
              </div>

              {/* Status Section */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">
                  Status da Transação
                </label>
                <CustomSelect
                  value={filter.status}
                  onChange={(val) => setFilter({ ...filter, status: val })}
                  options={[
                    { value: "all", label: "Todos os Status" },
                    {
                      value: "Paid",
                      label: filter.type === "Income" ? "Recebido" : "Pago",
                    },
                    { value: "Pending", label: "Pendente" },
                  ]}
                  triggerClassName="w-full bg-fin-surface border border-zinc-900/10 dark:border-white/5 rounded-2xl pl-5 pr-4 py-3.5 text-sm font-bold text-zinc-900 dark:text-white"
                />
              </div>

              {/* Category Section */}
              {categories && (
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">
                    Categoria
                  </label>
                  <CustomSelect
                    value={filter.category}
                    onChange={(val) => setFilter({ ...filter, category: val })}
                    options={[
                      { value: "all", label: "Todas as Categorias" },
                      ...(() => {
                        const filteredCats =
                          filter.type !== "all" && filter.type !== "Transfer"
                            ? categories.filter((c) => c.type === filter.type)
                            : categories;
                        const parentCats = filteredCats.filter((c) => !c.parent_id);
                        const grouped = [];
                        parentCats.forEach((parent) => {
                          const children = filteredCats.filter(
                            (c) => c.parent_id === parent.id,
                          );
                          grouped.push({ value: parent.id, label: parent.name });
                          children.forEach((child) => {
                            grouped.push({
                              value: child.id,
                              label: `↳ ${child.name}`,
                              indent: true,
                            });
                          });
                        });
                        return grouped;
                      })(),
                    ]}
                    triggerClassName="w-full bg-fin-surface border border-zinc-900/10 dark:border-white/5 rounded-2xl pl-5 pr-4 py-3.5 text-sm font-bold text-zinc-900 dark:text-white"
                  />
                </div>
              )}

              {/* Account Section */}
              {accounts && (
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">
                    Conta Bancária
                  </label>
                  <CustomSelect
                    value={filter.account}
                    onChange={(val) => setFilter({ ...filter, account: val })}
                    options={[
                      { value: "all", label: "Todas as Contas" },
                      ...profileAccounts.map((a) => ({
                        value: a.id,
                        label: a.name,
                      })),
                    ]}
                    triggerClassName="w-full bg-fin-surface border border-zinc-900/10 dark:border-white/5 rounded-2xl pl-5 pr-4 py-3.5 text-sm font-bold text-zinc-900 dark:text-white"
                  />
                </div>
              )}

              {/* Date Range Section */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">
                  Período Personalizado
                </label>
                <div className="grid grid-cols-1 gap-3 bg-fin-surface border border-zinc-900/10 dark:border-white/5 rounded-3xl p-4">
                  <CustomDatePicker
                    value={filter.dateStart}
                    onChange={(val) => setFilter({ ...filter, dateStart: val })}
                    label="Data Inicial"
                    placeholder="Início"
                    triggerClassName="w-full"
                  />
                  <div className="h-px w-full bg-zinc-900/5 dark:bg-white/5"></div>
                  <CustomDatePicker
                    value={filter.dateEnd}
                    onChange={(val) => setFilter({ ...filter, dateEnd: val })}
                    label="Data Final"
                    placeholder="Fim"
                    triggerClassName="w-full"
                  />
                </div>
              </div>

              {/* Sorting Section */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">
                  Ordenação das Transações
                </label>
                <CustomSelect
                  value={filter.sortOrder}
                  onChange={(val) => setFilter({ ...filter, sortOrder: val })}
                  options={[
                    { value: "desc", label: "Mais Recentes Primeiro" },
                    { value: "asc", label: "Mais Antigas Primeiro" },
                  ]}
                  triggerClassName="w-full bg-fin-surface border border-zinc-900/10 dark:border-white/5 rounded-2xl pl-5 pr-4 py-3.5 text-sm font-bold text-zinc-900 dark:text-white"
                />
              </div>

              {/* Toggles */}
              <div className="pt-4 border-t border-zinc-900/10 dark:border-white/5 space-y-4">
                <label className="flex items-center justify-between cursor-pointer group bg-fin-surface border border-zinc-900/10 dark:border-white/5 rounded-3xl p-4 transition-all hover:bg-zinc-900/5 dark:hover:bg-white/5">
                  <span className="text-sm font-bold text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                    Fatura por Cartão
                  </span>
                  <div className="relative inline-flex items-center">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={filter.groupByCard}
                      onChange={(e) =>
                        setFilter({ ...filter, groupByCard: e.target.checked })
                      }
                    />
                    <div className="w-11 h-6 bg-zinc-300 dark:bg-zinc-700/50 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-fin-mint"></div>
                  </div>
                </label>

                <label className="flex items-center justify-between cursor-pointer group bg-fin-surface border border-zinc-900/10 dark:border-white/5 rounded-3xl p-4 transition-all hover:bg-zinc-900/5 dark:hover:bg-white/5">
                  <span className="text-sm font-bold text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                    Mostrar Saldo Projetado
                  </span>
                  <div className="relative inline-flex items-center">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={showProjectedBalance}
                      onChange={(e) => setShowProjectedBalance(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-zinc-300 dark:bg-zinc-700/50 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-fin-mint"></div>
                  </div>
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-zinc-900/10 dark:border-white/5 bg-zinc-200/50 dark:bg-black/20 rounded-b-[32px] md:rounded-b-none space-y-3">
              <button
                onClick={onClose}
                className="w-full bg-fin-mint text-fin-bg py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-fin-mint/20"
              >
                Aplicar Filtros
              </button>
              
              {hasActiveFilters && (
                <button
                  onClick={() =>
                    setFilter({
                      ...filter,
                      status: "all",
                      type: "all",
                      category: "all",
                      account: "all",
                      dateStart: "",
                      dateEnd: "",
                      sortOrder: "desc",
                    })
                  }
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-[#ff7b7b] hover:bg-[#ff7b7b]/10 transition-colors"
                >
                  <Trash2 size={16} />
                  Limpar Filtros
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
