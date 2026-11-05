import React, { useState } from "react";
import { createPortal } from "react-dom";
import { Plus, ChevronDown, CreditCard, Tag } from "lucide-react";
import { cn } from "../utils/classNames";
import { CATEGORY_ICONS } from "../constants/theme";
import CustomDatePicker from "../components/ui/CustomDatePicker";
import CustomSelect from "../components/ui/CustomSelect";
import MoneyInput from "../components/ui/MoneyInput";
import TransactionRecurrenceConfirmModal from "./TransactionRecurrenceConfirmModal";

export default function TransactionModal({
  onClose,
  onSuccess,
  accounts,
  categories,
  cards,
  goals = [],
  initialData,
  initialType,
  onOptimisticUpdate,
  lockCard = false,
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [showRecurrenceModal, setShowRecurrenceModal] = useState(false);

  let initialTags = [];
  if (initialData?.tags) {
    try {
      initialTags =
        typeof initialData.tags === "string"
          ? JSON.parse(initialData.tags)
          : initialData.tags;
    } catch (e) {}
  }

  const [form, setForm] = useState(
    initialData
      ? {
          type: initialType || initialData.type || "Expense",
          status: initialData.status || (initialData.card_id ? "Pending" : "Paid"),
          description: initialData.description || "",
          date: initialData.date || new Date().toISOString().split("T")[0],
          ...initialData,
          amount: String(initialData.amount || ""),
          account_id: initialData.account_id || accounts.find((a) => a.is_main)?.id || (accounts[0]?.id || ""),
          category_id: initialData.category_id || "",
          card_id: initialData.card_id || "",
          to_account_id: initialData.to_account_id || "",
          installments: initialData.total_installments || 1,
          tags: initialTags,
          is_fixed: !!initialData.is_fixed,
          is_repeated: !!initialData.is_repeated,
          ignore_in_reports: !!initialData.ignore_in_reports,
          repeat_frequency: initialData.repeat_frequency || 1,
          repeat_period: initialData.repeat_period || "monthly",
          notes: initialData.notes || "",
          goal_id: initialData.goal_id || "",
          attachment: null,
        }
        : {
            description: "",
            amount: "",
            date: new Date().toISOString().split("T")[0],
            type: initialType || "Expense",
            status: (initialData?.card_id || initialType === "Expense" && lockCard) ? "Pending" : "Paid",
            account_id: accounts.find((a) => a.is_main)?.id || (accounts[0]?.id || ""),
            to_account_id: "",
            category_id: "",
            spell_id: "",
            card_id: initialData?.card_id || "",
            is_recurring: false,
            installments: 1,
            is_fixed: false,
            is_repeated: false,
            repeat_frequency: 1,
            repeat_period: "monthly",
            notes: "",
            tags: [],
            goal_id: "",
            attachment: null,
            ignore_in_reports: false,
          },
  );

  const handleAddTag = (e) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!form.tags.includes(tagInput.trim())) {
        setForm({ ...form, tags: [...form.tags, tagInput.trim()] });
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setForm({ ...form, tags: form.tags.filter((t) => t !== tagToRemove) });
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!form.account_id) {
      alert("Por favor, selecione uma conta.");
      return;
    }

    if (form.type === "Transfer" && !form.to_account_id) {
      alert("Por favor, selecione a conta de destino.");
      return;
    }

    if (form.type !== "Transfer" && form.type !== "GoalDeposit" && !form.category_id) {
      alert("Por favor, selecione uma categoria.");
      return;
    }

    if (form.type === "GoalDeposit" && !form.goal_id) {
      alert("Por favor, selecione a meta de destino.");
      return;
    }

    // If editing a recurring transaction, show confirmation modal first
    if (initialData?.id && initialData?.parent_id && !showRecurrenceModal) {
      setShowRecurrenceModal(true);
      return;
    }

    await executeSubmit("only");
  };

  const executeSubmit = async (mode = "only") => {
    const isEditing = !!initialData?.id;
    const url = isEditing
      ? `/api/transactions/${initialData.id}?mode=${mode}`
      : "/api/transactions";

    const formData = new FormData();
    if (isEditing) {
      formData.append("_method", "PUT");
    }

    const payloadParams = { ...form, amount: parseFloat(form.amount) };
    if (form.type === "Transfer") {
      if (
        !payloadParams.description ||
        payloadParams.description.trim() === ""
      ) {
        payloadParams.description = "Transferência";
      }
      payloadParams.status = "Paid";
    }

    if (form.is_repeated) {
      payloadParams.repeat_times = form.installments;
    } else {
      payloadParams.total_installments = form.installments;
    }

    Object.keys(payloadParams).forEach((key) => {
      const val = payloadParams[key];
      if (
        val !== null &&
        val !== undefined &&
        (val !== "" || ["notes"].includes(key))
      ) {
        if (key === "tags") {
          if (val.length > 0) formData.append(key, JSON.stringify(val));
        } else if (key === "attachment") {
          formData.append(key, val);
        } else if (typeof val === "boolean") {
          formData.append(key, val ? "1" : "0");
        } else {
          formData.append(key, val);
        }
      }
    });

    if (onOptimisticUpdate)
      onOptimisticUpdate({ ...payloadParams, id: initialData?.id }, isEditing, mode);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: formData,
    });

    if (response.ok) {
      onSuccess();
      onClose();
    } else {
      const errorData = await response.json().catch(() => ({}));
      alert(errorData.error || errorData.message || "Ocorreu um erro ao salvar a transação.");
    }
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
        <div className="bg-fin-surface w-full max-w-lg rounded-[24px] shadow-2xl animate-in zoom-in-95 duration-300 ease-out border border-zinc-900/10 dark:border-white/5 relative">
          <div className="p-6 border-b border-zinc-900/10 dark:border-white/5 flex items-center justify-between bg-zinc-200/50 dark:bg-black/20 rounded-t-[24px]">
            <div className="flex flex-col">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                {initialData?.id ? "Editar Transação" : 
                  lockCard ? "Nova Compra no Cartão" :
                  form.type === "Income" ? "Nova Receita" :
                  form.type === "Expense" ? "Nova Despesa" :
                  form.type === "Transfer" ? "Nova Transferência" : "Investir em Meta"
                }
              </h3>
              {!initialData && (
                <span className="text-xs font-medium text-zinc-500">
                  Preencha os dados abaixo
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-zinc-900/10 dark:hover:bg-white/5 rounded-full transition-colors text-zinc-500 dark:text-zinc-400"
            >
              <Plus size={20} className="rotate-45" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {form.type !== "Transfer" && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-600 dark:text-zinc-500 uppercase tracking-wider ml-1">
                  Descrição
                </label>
                <input
                  required
                  className="w-full bg-zinc-200/50 dark:bg-black/20 border border-zinc-900/10 dark:border-white/5 rounded-2xl px-4 py-3.5 focus:ring-1 focus:ring-white/10 outline-none text-zinc-900 dark:text-white transition-all font-medium"
                  placeholder="Ex: Aluguel Mensal"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-600 dark:text-zinc-500 uppercase tracking-wider ml-1">
                  Valor <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MoneyInput
                    required
                    className="font-bold"
                    value={form.amount}
                    onChange={(val) => setForm({ ...form, amount: val })}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-600 dark:text-zinc-500 uppercase tracking-wider ml-1">
                  Data
                </label>
                <CustomDatePicker
                  value={form.date}
                  onChange={(val) => setForm({ ...form, date: val })}
                  triggerClassName="w-full bg-zinc-200/50 dark:bg-black/20 border border-zinc-900/10 dark:border-white/5 rounded-2xl px-4 py-3.5 focus:ring-1 focus:ring-white/10 font-medium"
                />
              </div>
            </div>

              {form.type !== "Transfer" && form.type !== "GoalDeposit" && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-600 dark:text-zinc-500 uppercase tracking-wider ml-1">
                    Categoria <span className="text-red-500">*</span>
                  </label>
                  <CustomSelect
                    value={form.category_id}
                    onChange={(val) => setForm({ ...form, category_id: val })}
                    triggerClassName="w-full bg-zinc-200/50 dark:bg-black/20 border border-zinc-900/10 dark:border-white/5 rounded-2xl px-4 py-3.5 focus:ring-1 focus:ring-white/10 font-medium"
                    options={(() => {
                      const getCategoryIcon = (iconName) => {
                        if (iconName && CATEGORY_ICONS[iconName]) {
                          return React.cloneElement(CATEGORY_ICONS[iconName], { size: 16 });
                        }
                        return <Tag size={16} />;
                      };
                      const parentCats = categories.filter(
                        (c) => !c.parent_id && c.type === (form.type === "GoalDeposit" ? "Expense" : form.type),
                      );
                      const grouped = [];
                      parentCats.forEach((parent) => {
                        const children = categories.filter(
                          (c) => c.parent_id === parent.id,
                        );
                        if (children.length > 0) {
                          grouped.push({ isGroup: true, label: parent.name });
                          grouped.push({
                            value: parent.id,
                            label: parent.name,
                            icon: getCategoryIcon(parent.icon),
                          });
                          children.forEach((child) => {
                            grouped.push({
                              value: child.id,
                              label: `↳ ${child.name}`,
                              indent: true,
                              icon: getCategoryIcon(child.icon),
                            });
                          });
                        } else {
                          grouped.push({
                            value: parent.id,
                            label: parent.name,
                            icon: getCategoryIcon(parent.icon),
                          });
                        }
                      });
                      return grouped;
                    })()}
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-600 dark:text-zinc-500 uppercase tracking-wider ml-1">
                  {form.type === "Transfer" ? "Da Conta" : "Conta"}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <CustomSelect
                  value={form.account_id}
                  onChange={(val) => setForm({ ...form, account_id: val })}
                  triggerClassName="w-full bg-zinc-200/50 dark:bg-black/20 border border-zinc-900/10 dark:border-white/5 rounded-2xl px-4 py-3.5 focus:ring-1 focus:ring-white/10 font-medium"
                  options={accounts.map((a) => ({
                    value: a.id,
                    label: a.name,
                  }))}
                />
              </div>

              {form.type === "Transfer" ? (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-600 dark:text-zinc-500 uppercase tracking-wider ml-1">
                    Para Conta <span className="text-red-500">*</span>
                  </label>
                  <CustomSelect
                    value={form.to_account_id}
                    onChange={(val) => setForm({ ...form, to_account_id: val })}
                    triggerClassName="w-full bg-zinc-200/50 dark:bg-black/20 border border-zinc-900/10 dark:border-white/5 rounded-2xl px-4 py-3.5 focus:ring-1 focus:ring-white/10 font-medium"
                    options={[
                      { value: "", label: "Selecionar Conta" },
                      ...accounts.map((a) => ({ value: a.id, label: a.name })),
                    ]}
                  />
                </div>
              ) : form.type === "GoalDeposit" ? (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-600 dark:text-zinc-500 uppercase tracking-wider ml-1">
                    Meta de Destino <span className="text-red-500">*</span>
                  </label>
                  <CustomSelect
                    value={form.goal_id}
                    onChange={(val) => setForm({ ...form, goal_id: val })}
                    triggerClassName="w-full bg-zinc-200/50 dark:bg-black/20 border border-zinc-900/10 dark:border-white/5 rounded-2xl px-4 py-3.5 focus:ring-1 focus:ring-white/10 font-medium"
                    options={[
                      { value: "", label: "Selecionar Meta" },
                      ...goals.map((g) => ({ value: g.id, label: g.name })),
                    ]}
                  />
                </div>
              ) : form.type === "Expense" && !lockCard ? (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-600 dark:text-zinc-500 uppercase tracking-wider ml-1">
                    Forma de Pagamento
                  </label>
                  <CustomSelect
                    value={form.card_id}
                    onChange={(val) => {
                      setForm({ ...form, card_id: val, status: val ? "Pending" : "Paid" });
                    }}
                    triggerClassName="w-full bg-zinc-200/50 dark:bg-black/20 border border-zinc-900/10 dark:border-white/5 rounded-2xl px-4 py-3.5 focus:ring-1 focus:ring-white/10 font-medium"
                    options={[
                      { value: "", label: "Direto da Conta" },
                      ...cards.map((c) => ({
                        value: c.id,
                        label: `${c.name} (Cartão)`,
                      })),
                    ]}
                  />
                </div>
              ) : (
                <div />
              )}

              {form.type !== "Transfer" && form.type !== "GoalDeposit" && !lockCard && (
                <div className="pt-2">
                  {!form.card_id ? (
                    <div 
                      className="flex items-center justify-between p-4 bg-zinc-200/50 dark:bg-black/20 border border-zinc-900/10 dark:border-white/5 rounded-2xl cursor-pointer hover:bg-zinc-200/80 dark:hover:bg-black/40 transition-colors"
                      onClick={() => setForm({ ...form, status: form.status === "Paid" ? "Pending" : "Paid" })}
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-zinc-900 dark:text-white">
                          Status da Transação
                        </span>
                        <span className="text-xs text-zinc-500 mt-0.5">
                          {form.status === "Paid" 
                             ? (form.type === "Income" ? "O valor já foi recebido" : "O valor já foi pago")
                             : "O pagamento está pendente"}
                        </span>
                      </div>
                      <div className="relative flex items-center">
                        <div
                          className={cn(
                            "w-10 h-6 rounded-full transition-all duration-300 ease-out",
                            form.status === "Paid" ? "bg-fin-mint dark:bg-fin-mint" : "bg-zinc-300 dark:bg-zinc-700"
                          )}
                        ></div>
                        <div
                          className={cn(
                            "absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-all duration-300 ease-out shadow-sm",
                            form.status === "Paid" && "translate-x-4",
                          )}
                        ></div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-4 bg-zinc-200/50 dark:bg-black/20 border border-zinc-900/10 dark:border-white/5 rounded-2xl">
                       <div className="flex flex-col">
                          <span className="text-sm font-bold text-zinc-900 dark:text-white">Status da Transação</span>
                          <span className="text-xs text-zinc-500 mt-0.5">Ficará pendente até o pagamento da fatura do cartão</span>
                       </div>
                       <CreditCard size={20} className="text-zinc-500" />
                    </div>
                  )}
                </div>
              )}

              {form.type !== "Transfer" && form.type !== "GoalDeposit" && (
                <div className="pt-2">
                  <div 
                    className="flex items-center justify-between p-4 bg-zinc-200/50 dark:bg-black/20 border border-zinc-900/10 dark:border-white/5 rounded-2xl cursor-pointer hover:bg-zinc-200/80 dark:hover:bg-black/40 transition-colors"
                    onClick={() => setForm({ ...form, is_fixed: !form.is_fixed })}
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-zinc-900 dark:text-white">
                        {form.type === "Income" ? "Receita Fixa" : "Despesa Fixa"}
                      </span>
                      <span className="text-xs text-zinc-500 mt-0.5">
                        Esta transação se repete de forma automática todos os meses
                      </span>
                    </div>
                    <div className="relative flex items-center">
                      <div
                        className={cn(
                          "w-10 h-6 rounded-full transition-all duration-300 ease-out",
                          form.is_fixed ? "bg-fin-mint dark:bg-fin-mint" : "bg-zinc-300 dark:bg-zinc-700"
                        )}
                      ></div>
                      <div
                        className={cn(
                          "absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-all duration-300 ease-out shadow-sm",
                          form.is_fixed && "translate-x-4",
                        )}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

            {form.type !== "Transfer" && form.type !== "GoalDeposit" ? (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center justify-between w-full p-4 rounded-2xl bg-zinc-200/50 dark:bg-zinc-900/40 border border-zinc-900/10 dark:border-white/5 hover:bg-zinc-200/80 dark:hover:bg-zinc-900/60 transition-colors"
                >
                  <span className="text-sm font-bold text-zinc-900 dark:text-white">
                    Mais Detalhes
                  </span>
                  <ChevronDown
                    className={cn(
                      "text-zinc-500 transition-transform duration-300",
                      showAdvanced && "rotate-180",
                    )}
                    size={20}
                  />
                </button>

                <div
                  className={cn(
                    "overflow-hidden transition-all duration-300 ease-in-out",
                    showAdvanced
                      ? "max-h-[800px] mt-2 opacity-100"
                      : "max-h-0 opacity-0",
                  )}
                >
                  <div className="p-4 space-y-5 border border-zinc-900/10 dark:border-white/5 rounded-2xl bg-zinc-200/30 dark:bg-black/20">


                    <div>
                      <label className="flex items-center gap-3 cursor-pointer group mb-3">
                        <div className="relative flex items-center">
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={form.is_repeated}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                is_repeated: e.target.checked,
                              })
                            }
                          />
                          <div
                            className={cn(
                              "w-10 h-6 rounded-full transition-colors",
                              form.is_repeated ? "bg-fin-mint dark:bg-fin-mint" : "bg-zinc-300 dark:bg-zinc-700"
                            )}
                          ></div>
                          <div
                            className={cn(
                              "absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform",
                              form.is_repeated && "translate-x-4",
                            )}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                          Repetir Transação
                        </span>
                      </label>

                      {form.is_repeated && (
                        <div className="grid grid-cols-2 gap-4 pl-13 animate-in slide-in-from-top-2 fade-in">
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-zinc-600 dark:text-zinc-500 uppercase tracking-wider">
                              A cada
                            </label>
                            <input
                              type="number"
                              min="1"
                              className="w-full bg-zinc-200/50 dark:bg-black/20 border border-zinc-900/10 dark:border-white/5 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-white/10 outline-none text-zinc-900 dark:text-white transition-all"
                              value={form.repeat_frequency}
                              onChange={(e) =>
                                setForm({
                                  ...form,
                                  repeat_frequency: parseInt(e.target.value),
                                })
                              }
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-zinc-600 dark:text-zinc-500 uppercase tracking-wider">
                              Período
                            </label>
                            <CustomSelect
                              value={form.repeat_period}
                              onChange={(val) =>
                                setForm({ ...form, repeat_period: val })
                              }
                              triggerClassName="w-full bg-zinc-200/50 dark:bg-black/20 border border-zinc-900/10 dark:border-white/5 rounded-xl px-3 py-2 text-sm text-zinc-900 dark:text-white hover:bg-zinc-200/80 dark:hover:bg-white/5 focus:ring-1 focus:ring-white/10"
                              options={[
                                { value: "daily", label: "Dia(s)" },
                                { value: "weekly", label: "Semana(s)" },
                                { value: "monthly", label: "Mês(es)" },
                                { value: "yearly", label: "Ano(s)" },
                              ]}
                            />
                          </div>
                          <div className="space-y-1 col-span-2">
                            <label className="text-xs font-bold text-zinc-600 dark:text-zinc-500 uppercase tracking-wider">
                              Quantidade de vezes a repetir
                            </label>
                            <input
                              type="number"
                              min="1"
                              placeholder="Ex: 12"
                              className="w-full bg-zinc-200/50 dark:bg-black/20 border border-zinc-900/10 dark:border-white/5 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-white/10 outline-none text-zinc-900 dark:text-white transition-all"
                              value={form.installments}
                              onChange={(e) =>
                                setForm({
                                  ...form,
                                  installments: parseInt(e.target.value),
                                })
                              }
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-600 dark:text-zinc-500 uppercase tracking-wider">
                        Observações
                      </label>
                      <textarea
                        rows={2}
                        className="w-full bg-zinc-200/50 dark:bg-black/20 border border-zinc-900/10 dark:border-white/5 rounded-2xl px-4 py-3 text-sm focus:ring-1 focus:ring-white/10 outline-none text-zinc-900 dark:text-white transition-all resize-none"
                        placeholder="Adicione notas adicionais..."
                        value={form.notes}
                        onChange={(e) =>
                          setForm({ ...form, notes: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-600 dark:text-zinc-500 uppercase tracking-wider">
                        Tags
                      </label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {form.tags &&
                          form.tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center gap-1 bg-zinc-900/10 dark:bg-white/10 px-3 py-1 rounded-full text-xs font-medium text-zinc-700 dark:text-zinc-300"
                            >
                              {tag}
                              <button
                                type="button"
                                onClick={() => handleRemoveTag(tag)}
                                className="hover:text-red-400 text-zinc-500 dark:text-zinc-400"
                              >
                                <Plus size={12} className="rotate-45" />
                              </button>
                            </span>
                          ))}
                      </div>
                      <input
                        type="text"
                        className="w-full bg-zinc-200/50 dark:bg-black/20 border border-zinc-900/10 dark:border-white/5 rounded-xl px-4 py-2.5 text-sm focus:ring-1 focus:ring-white/10 outline-none text-zinc-900 dark:text-white transition-all"
                        placeholder="Digite e aperte Enter para adicionar"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleAddTag}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-600 dark:text-zinc-500 uppercase tracking-wider">
                        Anexo (Opcional)
                      </label>
                      <input
                        type="file"
                        className="w-full text-sm text-zinc-500 dark:text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-fin-mint/10 file:text-fin-mint hover:file:bg-fin-mint/20 cursor-pointer"
                        onChange={(e) =>
                          setForm({ ...form, attachment: e.target.files[0] })
                        }
                      />
                      {initialData?.attachment_path && (
                        <p className="text-xs text-zinc-500 mt-1">
                          Já possui um anexo salvo.
                        </p>
                      )}
                    </div>

                    <label className="flex items-center gap-3 cursor-pointer group mt-2 pt-4 border-t border-zinc-900/10 dark:border-white/5">
                      <div className="relative flex items-center">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={form.ignore_in_reports}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              ignore_in_reports: e.target.checked,
                            })
                          }
                        />
                        <div
                          className={cn(
                            "w-10 h-6 rounded-full transition-colors",
                            form.ignore_in_reports ? "bg-fin-mint dark:bg-fin-mint" : "bg-zinc-300 dark:bg-zinc-700"
                          )}
                        ></div>
                        <div
                          className={cn(
                            "absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform",
                            form.ignore_in_reports && "translate-x-4",
                          )}
                        ></div>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                          Ignorar em Relatórios
                        </span>
                        <span className="text-xs text-zinc-500">
                          Não contabilizar em saldos e gráficos automáticos.
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            ) : form.type === "GoalDeposit" ? null : (
              <div className="space-y-1 pt-2">
                <label className="text-xs font-bold text-zinc-600 dark:text-zinc-500 uppercase tracking-wider">
                  Observações (Opcional)
                </label>
                <textarea
                  rows={2}
                  className="w-full bg-zinc-200/50 dark:bg-black/20 border border-zinc-900/10 dark:border-white/5 rounded-2xl px-4 py-3 text-sm focus:ring-1 focus:ring-white/10 outline-none text-zinc-900 dark:text-white transition-all resize-none"
                  placeholder="Adicione notas adicionais..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-fin-mint text-fin-bg py-4 rounded-2xl font-bold hover:brightness-110 transition-all shadow-lg shadow-fin-mint/20 mt-6"
            >
              Salvar Transação
            </button>
          </form>
        </div>
      </div>

      <TransactionRecurrenceConfirmModal
        isOpen={showRecurrenceModal}
        onClose={() => setShowRecurrenceModal(false)}
        type="edit"
        onConfirm={(mode) => {
          setShowRecurrenceModal(false);
          executeSubmit(mode);
        }}
      />
    </div>,
    document.body
  );
}
