import React, { useState } from "react";
import { createPortal } from "react-dom";
import { Plus } from "lucide-react";
import { cn } from "../utils/classNames";
import { CATEGORY_ICONS } from "../constants/theme";
import CustomSelect from "../components/ui/CustomSelect";

export default function CategoryModal({
  onClose,
  onSuccess,
  categories,
  initialData,
  onOptimisticUpdate,
  defaultParentId,
}) {
  const parentOnlyCategories = categories.filter((c) => !c.parent_id);
  const getInitialForm = () => {
    if (initialData) return initialData;
    if (defaultParentId) {
      const parent = parentOnlyCategories.find((c) => c.id === defaultParentId);
      return {
        name: "",
        parent_id: String(defaultParentId),
        type: parent?.type || "Expense",
        icon: "",
      };
    }
    return { name: "", parent_id: "", type: "Expense", icon: "" };
  };
  const [form, setForm] = useState(getInitialForm());

  const handleParentChange = (parentId) => {
    const parent = parentOnlyCategories.find(
      (c) => c.id === parseInt(parentId),
    );
    setForm((prev) => ({
      ...prev,
      parent_id: parentId,
      type: parent ? parent.type : prev.type,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isEditing = !!initialData?.id;
    const url = isEditing
      ? `/api/categories/${initialData.id}`
      : "/api/categories";
    const method = isEditing ? "PUT" : "POST";

    if (onOptimisticUpdate)
      onOptimisticUpdate({ ...form, id: initialData?.id }, isEditing);

    await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(form),
    });
    onSuccess();
    onClose();
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-[999] overflow-y-auto bg-zinc-200/50 dark:bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="flex min-h-full items-center justify-center p-4 animate-in fade-in duration-300 ease-out"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-fin-surface w-full max-w-md rounded-[24px] shadow-2xl border border-zinc-900/10 dark:border-white/5 relative">
          <div className="p-6 border-b border-zinc-900/10 dark:border-white/5 flex items-center justify-between bg-zinc-200/50 dark:bg-black/20 rounded-t-[24px]">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
              {initialData
                ? "Editar Categoria"
                : defaultParentId
                  ? "Nova Subcategoria"
                  : "Nova Categoria"}
            </h3>
            <button
              onClick={onClose}
              className="p-2 text-zinc-600 dark:text-zinc-500 hover:text-zinc-900 dark:text-white hover:bg-zinc-900/10 dark:hover:bg-white/5 rounded-full transition-colors"
            >
              <Plus size={20} className="rotate-45" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-200/50 dark:bg-black/20 rounded-2xl border border-zinc-900/10 dark:border-white/5">
              {[
                { id: "Income", label: "Receita" },
                { id: "Expense", label: "Despesa" },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  disabled={!!form.parent_id}
                  onClick={() => setForm({ ...form, type: t.id })}
                  className={cn(
                    "py-2 text-sm font-bold rounded-xl transition-all",
                    form.type === t.id
                      ? t.id === "Income"
                        ? "bg-fin-surface shadow-sm text-fin-mint"
                        : "bg-fin-surface shadow-sm text-[#ff7b7b]"
                      : "text-zinc-600 dark:text-zinc-500",
                    form.parent_id ? "opacity-50 cursor-not-allowed" : "",
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-600 dark:text-zinc-500 uppercase tracking-wider">
                Nome da Categoria
              </label>
              <input
                required
                className="w-full bg-zinc-200/50 dark:bg-black/20 border border-zinc-900/10 dark:border-white/5 rounded-2xl px-4 py-3 outline-none text-zinc-900 dark:text-white transition-all focus:ring-1 focus:ring-white/10"
                placeholder="Ex: Alimentação"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-600 dark:text-zinc-500 uppercase tracking-wider">
                Subcategoria de (Opcional)
              </label>
              <CustomSelect
                value={form.parent_id}
                onChange={handleParentChange}
                options={[
                  { value: "", label: "Categoria Principal" },
                  ...parentOnlyCategories.map((c) => ({
                    value: c.id,
                    label: c.name,
                  })),
                ]}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-600 dark:text-zinc-500 uppercase tracking-wider">
                Ícone (Opcional)
              </label>
              <div className="grid grid-cols-5 gap-2 p-2 bg-zinc-200/50 dark:bg-black/20 rounded-2xl border border-zinc-900/10 dark:border-white/5 max-h-40 overflow-y-auto custom-scrollbar">
                {Object.keys(CATEGORY_ICONS).map((iconKey) => (
                  <button
                    key={iconKey}
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        icon: iconKey === form.icon ? "" : iconKey,
                      })
                    }
                    className={cn(
                      "flex flex-col items-center justify-center p-3 rounded-xl transition-all",
                      form.icon === iconKey
                        ? "bg-fin-mint/20 text-fin-mint shadow-inner border border-fin-mint/30"
                        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-900/5 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white",
                    )}
                    title={iconKey}
                  >
                    {CATEGORY_ICONS[iconKey]}
                  </button>
                ))}
              </div>
            </div>
            <button className="w-full bg-fin-mint text-fin-bg py-4 rounded-2xl font-bold mt-2 hover:brightness-110 transition-all">
              Salvar Categoria
            </button>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}
