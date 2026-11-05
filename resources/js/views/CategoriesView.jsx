import React, { useMemo, useState } from "react";
import { 
  Plus, 
  ListTree, 
  Settings, 
  Trash2, 
  Tag, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ChevronDown 
} from "lucide-react";
import { CATEGORY_ICONS } from "../constants/theme";
import { cn } from "../utils/classNames";
import CategoryModal from "../modals/CategoryModal";
import { useFinStore } from '../store/useFinStore';
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";

export default function CategoriesView({ fetchData, showToast, showConfirm, isReadOnly, searchTerm }) {
  const { categories, setCategories, selectedProfile } = useFinStore();
  
  const profileCategories = useMemo(
    () => categories.filter((c) => c.user_id === selectedProfile?.id),
    [categories, selectedProfile],
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [defaultParentId, setDefaultParentId] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [collapsedCategories, setCollapsedCategories] = useState({});

  const toggleExpand = (id) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredCategories = useMemo(() => {
    if (!searchTerm) return profileCategories;
    const term = searchTerm.toLowerCase();
    return profileCategories.filter((c) => c.name.toLowerCase().includes(term));
  }, [profileCategories, searchTerm]);

  const allParentCategories = filteredCategories.filter((c) => !c.parent_id);
  const parentCategories =
    categoryFilter === "all"
      ? allParentCategories
      : allParentCategories.filter((c) => c.type === categoryFilter);

  const incomeCount = allParentCategories.filter(
    (c) => c.type === "Income",
  ).length;
  const expenseCount = allParentCategories.filter(
    (c) => c.type === "Expense",
  ).length;

  const filterTabs = [
    { id: "all", label: "Todas", count: allParentCategories.length },
    { id: "Income", label: "Receitas", count: incomeCount },
    { id: "Expense", label: "Despesas", count: expenseCount },
  ];

  const handleEdit = (category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setEditingCategory(null);
    setDefaultParentId(null);
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    showConfirm(
      "Excluir Categoria",
      "Tem certeza que deseja excluir esta categoria?",
      async () => {
        const previousState = [...categories];
        setCategories((prev) => prev.filter((c) => c.id !== id));

        try {
          const res = await fetch(`/api/categories/${id}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          if (res.ok) {
            showToast("Categoria excluída com sucesso!", "success");
            fetchData();
          } else {
            setCategories(previousState);
            showToast("Erro ao excluir categoria.", "error");
          }
        } catch (e) {
          setCategories(previousState);
          showToast("Erro de conexão.", "error");
        }
      },
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader
        icon={ListTree}
        title="Categorias"
        subtitle="Organize suas movimentações com uma estrutura clara e eficiente."
        label="Configurações"
        actions={
          !isReadOnly && (
            <Button 
              onClick={() => setIsModalOpen(true)}
              icon={Plus}
            >
              Nova Categoria
            </Button>
          )
        }
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-zinc-200/50 dark:bg-black/20 rounded-2xl border border-zinc-900/10 dark:border-white/5 w-fit">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setCategoryFilter(tab.id)}
            className={cn(
              "px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2",
              categoryFilter === tab.id
                ? tab.id === "Income"
                  ? "bg-fin-surface shadow-sm text-fin-mint"
                  : tab.id === "Expense"
                    ? "bg-fin-surface shadow-sm text-[#ff7b7b]"
                    : "bg-fin-surface shadow-sm text-zinc-900 dark:text-white"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300",
            )}
          >
            {tab.id === "Income" && <ArrowUpRight size={14} />}
            {tab.id === "Expense" && <ArrowDownLeft size={14} />}
            {tab.label}
            <span
              className={cn(
                "text-[10px] font-bold px-1.5 py-0.5 rounded-md min-w-[20px] text-center",
                categoryFilter === tab.id
                  ? tab.id === "Income"
                    ? "bg-fin-mint/15 text-fin-mint"
                    : tab.id === "Expense"
                      ? "bg-[#ff7b7b]/15 text-[#ff7b7b]"
                      : "bg-zinc-900/10 dark:bg-white/10 text-zinc-600 dark:text-zinc-300"
                  : "bg-zinc-900/5 dark:bg-white/5 text-zinc-500",
              )}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {parentCategories.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-zinc-900/10 dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Tag size={28} className="text-zinc-500" />
          </div>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium">
            {categoryFilter === "all"
              ? "Nenhuma categoria cadastrada."
              : categoryFilter === "Income"
                ? "Nenhuma categoria de receita."
                : "Nenhuma categoria de despesa."}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {parentCategories.map((parent) => {
          const children = filteredCategories.filter((c) => c.parent_id === parent.id);
          const hasChildren = children.length > 0;
          const isExpanded = !collapsedCategories[parent.id];

          return (
            <div
              key={parent.id}
              className="bg-fin-surface rounded-[24px] border border-zinc-900/10 dark:border-white/5 shadow-2xl transition-all overflow-hidden group"
            >
              {/* Parent Row */}
              <div
                className={cn(
                  "flex flex-col md:flex-row md:items-center justify-between p-5 md:p-6 gap-4 md:gap-6",
                  isExpanded && hasChildren ? "border-b border-zinc-900/10 dark:border-white/5" : ""
                )}
              >
                <div className="flex items-center gap-4 flex-1">
                  {/* Chevron Expander */}
                  {hasChildren ? (
                    <button
                      onClick={() => toggleExpand(parent.id)}
                      className="p-1 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors shrink-0"
                      title={isExpanded ? "Recolher" : "Expandir"}
                    >
                      <ChevronDown
                        size={20}
                        className={cn(
                          "transition-transform duration-300",
                          isExpanded ? "transform rotate-180" : ""
                        )}
                      />
                    </button>
                  ) : (
                    <div className="w-8 h-8 shrink-0" />
                  )}

                  {/* Icon */}
                  <div className="w-12 h-12 bg-zinc-900/10 dark:bg-white/5 text-zinc-600 dark:text-zinc-300 rounded-[16px] flex items-center justify-center shrink-0">
                    {parent.icon && CATEGORY_ICONS[parent.icon] ? (
                      React.cloneElement(CATEGORY_ICONS[parent.icon], {
                        size: 20,
                      })
                    ) : (
                      <Tag size={20} />
                    )}
                  </div>

                  {/* Name and Type */}
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-zinc-900 dark:text-white text-lg truncate">
                      {parent.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={cn(
                          "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md",
                          parent.type === "Income"
                            ? "text-fin-mint bg-fin-mint/10"
                            : "text-[#ff7b7b] bg-[#ff7b7b]/10",
                        )}
                      >
                        {parent.type === "Income" ? "Receita" : "Despesa"}
                      </span>
                      <span className="text-[11px] text-zinc-500 font-medium">
                        {hasChildren
                          ? `${children.length} subcategor${children.length === 1 ? 'ia' : 'ias'}`
                          : "Sem subcategorias"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions (Desktop) */}
                <div className="hidden md:flex items-center gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  {!isReadOnly && (
                    <>
                      <button
                        onClick={() => {
                          setDefaultParentId(parent.id);
                          setIsModalOpen(true);
                        }}
                        className="px-3 py-1.5 text-xs font-bold text-fin-mint hover:bg-fin-mint/10 border border-dashed border-fin-mint/20 hover:border-fin-mint/40 rounded-xl transition-all uppercase tracking-wider"
                      >
                        + Subcategoria
                      </button>
                      <button
                        onClick={() => handleEdit(parent)}
                        className="p-2 text-zinc-600 hover:text-fin-mint transition-colors"
                        title="Editar Categoria"
                      >
                        <Settings size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(parent.id)}
                        className="p-2 text-zinc-600 hover:text-[#ff7b7b] transition-colors"
                        title="Excluir Categoria"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>

                {/* Actions (Mobile) */}
                {!isReadOnly && (
                  <div className="flex gap-2 md:hidden">
                    <button
                      onClick={() => {
                        setDefaultParentId(parent.id);
                        setIsModalOpen(true);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-fin-mint/10 border border-dashed border-fin-mint/20 hover:border-fin-mint/40 rounded-xl text-[10px] font-black uppercase tracking-widest text-fin-mint"
                    >
                      + Subcategoria
                    </button>
                    <button
                      onClick={() => handleEdit(parent)}
                      className="flex items-center justify-center gap-2 px-3.5 py-2.5 bg-zinc-900/5 dark:bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-500"
                      title="Editar"
                    >
                      <Settings size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(parent.id)}
                      className="flex items-center justify-center gap-2 px-3.5 py-2.5 bg-[#ff7b7b]/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#ff7b7b]"
                      title="Excluir"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>

              {/* Children List */}
              {isExpanded && hasChildren && (
                <div className="bg-zinc-200/20 dark:bg-black/10 px-5 md:px-14 py-4 space-y-2 border-t border-zinc-900/5 dark:border-white/[0.02]">
                  {children.map((child) => (
                    <div
                      key={child.id}
                      className="flex items-center justify-between p-3 hover:bg-zinc-900/10 dark:hover:bg-white/5 dark:bg-white/[0.01] rounded-xl group/item"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-zinc-500 dark:text-zinc-400">
                          {child.icon && CATEGORY_ICONS[child.icon] ? (
                            React.cloneElement(CATEGORY_ICONS[child.icon], {
                              size: 16,
                            })
                          ) : (
                            <Tag size={16} />
                          )}
                        </div>
                        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                          {child.name}
                        </span>
                      </div>
                      {!isReadOnly && (
                        <div className="flex items-center gap-2 md:opacity-0 group-hover/item:opacity-100 transition-all">
                          <button
                            onClick={() => handleEdit(child)}
                            className="p-1.5 text-zinc-500 hover:text-fin-mint transition-colors"
                            title="Editar Subcategoria"
                          >
                            <Settings size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(child.id)}
                            className="p-1.5 text-zinc-500 hover:text-[#ff7b7b] transition-colors"
                            title="Excluir Subcategoria"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  {!isReadOnly && (
                    <div className="pt-2">
                      <button
                        onClick={() => {
                          setDefaultParentId(parent.id);
                          setIsModalOpen(true);
                        }}
                        className="w-full text-center text-[11px] uppercase tracking-wider text-fin-mint font-bold py-2.5 hover:bg-fin-mint/10 rounded-xl transition-colors border border-dashed border-fin-mint/20 hover:border-fin-mint/40"
                      >
                        + Adicionar Subcategoria
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <CategoryModal
          onClose={handleClose}
          onSuccess={() => fetchData()}
          categories={allParentCategories}
          initialData={editingCategory}
          defaultParentId={defaultParentId}
          onOptimisticUpdate={(data, isEditing) => {
            if (isEditing) {
              setCategories((prev) =>
                prev.map((c) => (c.id === data.id ? { ...c, ...data } : c)),
              );
            } else {
              setCategories((prev) => [...prev, { ...data, id: Date.now() }]);
            }
          }}
        />
      )}
    </div>
  );
}
