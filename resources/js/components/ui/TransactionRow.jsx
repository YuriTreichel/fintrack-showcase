import React from 'react';
import { format, parseISO, isPast, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowUpRight, ArrowDownLeft, ArrowRightLeft, CreditCard, CheckCircle2, Settings, Trash2, Check } from 'lucide-react';
import { cn } from '../../utils/classNames';
import { CATEGORY_ICONS } from '../../constants/theme';
import { useFinStore } from '../../store/useFinStore';
import { getTransactionEffectiveDate } from '../../utils/utils';

export default function TransactionRow({
  transaction,
  onDelete,
  onEdit,
  onQuickEffective,
  currentUser,
  isReadOnly,
  isSelected = false,
  onToggleSelect,
  showSelection = false,
}) {
  const { cards } = useFinStore();
  const isIncome = transaction.type === "Income";
  const isTransfer = transaction.type === "Transfer";
  const isPending = transaction.status === "Pending";
  
  const effectiveDate = getTransactionEffectiveDate(transaction, cards);
  const isDifferentMonth = !transaction.is_effective && !transaction.is_group && (format(effectiveDate, "MM-yyyy") !== format(parseISO(transaction.date), "MM-yyyy"));

  const isOverdue =
    isPending &&
    isPast(parseISO(transaction.date)) &&
    !isToday(parseISO(transaction.date));
  const isShared = currentUser && transaction.user_id && transaction.user_id !== currentUser.id;

  return (
    <div
      className={cn(
        "flex flex-col transition-all duration-300 group relative",
        isSelected
          ? "bg-fin-mint/10 dark:bg-fin-mint/10 border-l-4 border-l-fin-mint shadow-sm"
          : "hover:bg-zinc-900/[0.03] dark:hover:bg-white/[0.03]"
      )}
    >
      <div className="p-3 md:p-5 flex items-center gap-3 md:gap-4">
        {/* Checkbox de Seleção com animação suave */}
        {!isReadOnly && !transaction.is_group && (
          <div
            className={cn(
              "flex items-center justify-center flex-shrink-0 transition-all duration-300 ease-out",
              showSelection || isSelected
                ? "w-6 opacity-100 scale-100 translate-x-0"
                : "w-0 opacity-0 scale-75 -translate-x-3 group-hover:w-6 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-x-0"
            )}
          >
            <label className="relative flex items-center justify-center cursor-pointer p-1">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onToggleSelect && onToggleSelect(transaction.id)}
                className="peer sr-only"
              />
              <div
                className={cn(
                  "w-5 h-5 rounded-lg border flex items-center justify-center transition-all duration-200 shadow-sm",
                  isSelected
                    ? "bg-fin-mint border-fin-mint text-fin-bg shadow-fin-mint/20 scale-105"
                    : "border-zinc-300 dark:border-white/20 bg-white dark:bg-zinc-900/80 hover:border-fin-mint/60 hover:scale-105"
                )}
              >
                <Check
                  size={13}
                  strokeWidth={3}
                  className={cn(
                    "transition-all duration-200",
                    isSelected ? "opacity-100 scale-100" : "opacity-0 scale-50"
                  )}
                />
              </div>
            </label>
          </div>
        )}

        <div
          className={cn(
            "w-12 h-12 rounded-[16px] flex items-center justify-center border border-zinc-900/10 dark:border-white/5 flex-shrink-0 transition-all duration-300 group-hover:shadow-md",
            isIncome
              ? "bg-fin-mint/10 text-fin-mint"
              : isTransfer
                ? "bg-zinc-900/10 dark:bg-white/5 text-zinc-900 dark:text-white"
                : "bg-[#ff7b7b]/10 text-[#ff7b7b]",
          )}
        >
          {transaction.category_icon && CATEGORY_ICONS[transaction.category_icon] ? (
            React.cloneElement(CATEGORY_ICONS[transaction.category_icon], { size: 20 })
          ) : isIncome ? (
            <ArrowDownLeft size={20} />
          ) : isTransfer ? (
            <ArrowRightLeft size={20} />
          ) : (
            <ArrowUpRight size={20} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-semibold text-zinc-900 dark:text-white text-sm truncate">
              {transaction.description}
            </p>
          {transaction.is_fixed ? (
            <span className="text-[10px] bg-fin-mint/10 text-fin-mint px-1.5 py-0.5 rounded border border-fin-mint/20 font-bold uppercase flex-shrink-0">
              Fixo
            </span>
          ) : (
            transaction.installment_number && (
              <span className="text-[10px] bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-900/10 dark:border-white/5 font-bold uppercase flex-shrink-0">
                {transaction.installment_number}/
                {transaction.total_installments}
              </span>
            )
          )}
          {isShared && (
            <span className="text-[10px] bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-900/10 dark:border-white/5 font-bold uppercase flex-shrink-0">
              {transaction.owner_name}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-[11px] font-medium text-zinc-600 dark:text-zinc-500 uppercase tracking-wider">
          <span>
            {format(parseISO(transaction.date), "dd MMM yyyy", {
              locale: ptBR,
            })}
          </span>
          <span>•</span>
          <span className="text-zinc-500 dark:text-zinc-400 truncate">
            {transaction.type === "GoalDeposit" ? "Depósito em Meta" : (transaction.category_name || "Sem Categoria")}
          </span>
          {transaction.goal_name && (
            <>
              <span>•</span>
              <span className="text-fin-mint font-bold flex items-center gap-1 flex-shrink-0">
                 Meta: {transaction.goal_name}
              </span>
            </>
          )}
          {transaction.card_id && (
            <>
              <span>•</span>
              <span className={cn(
                "flex items-center gap-1 flex-shrink-0",
                isDifferentMonth && "text-fin-peach font-bold"
              )}>
                <CreditCard size={10} /> 
                {isDifferentMonth 
                  ? `Fatura de ${format(effectiveDate, "MMMM", { locale: ptBR })}` 
                  : "No Cartão"}
              </span>
            </>
          )}
        </div>

        {/* Mobile Actions: REMOVED FROM HERE */}
      </div>
      <div className="text-right min-w-[80px] md:min-w-[100px] flex-shrink-0">
        <p
          className={cn(
            "font-bold text-sm tabular-nums text-zinc-900 dark:text-white",
          )}
        >
          {isIncome ? "+" : "-"} R${" "}
          {Math.abs(transaction.amount).toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
          })}
        </p>
        <div className="flex items-center justify-end gap-1.5 mt-1.5">
          {transaction.card_id ? (
            <span className={cn(
              "flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border",
              transaction.status === "Paid" 
                ? "bg-fin-mint/10 text-fin-mint border-fin-mint/20" 
                : "bg-zinc-900/10 dark:bg-white/5 text-zinc-500 border-zinc-900/10 dark:border-white/10"
            )}>
              <CreditCard size={12} />
              {transaction.status === "Paid" ? "Pago (Cartão)" : "No Cartão"}
            </span>
          ) : isPending ? (
            <button
              onClick={() => onQuickEffective(transaction)}
              className={cn(
                "flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md hover:scale-105 transition-all",
                isOverdue
                  ? "bg-[#ff7b7b]/10 text-[#ff7b7b]"
                  : "bg-fin-peach/10 text-fin-peach hover:bg-fin-peach/20",
              )}
              title="Efetivar agora"
            >
              <CheckCircle2 size={12} />
              {isOverdue ? "Atraso" : "Pendente"}
            </button>
          ) : (
            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-fin-mint px-2 py-0.5 rounded-md bg-fin-mint/10">
              <CheckCircle2 size={12} />
              Pago
            </span>
          )}
        </div>
      </div>
      <div className="hidden md:flex items-center gap-1 min-w-[100px] flex-shrink-0 justify-end opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300 ease-out">
        {!isReadOnly && isPending && !transaction.card_id && (
          <button
            onClick={() => onQuickEffective(transaction)}
            className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-fin-mint hover:bg-fin-mint/10 rounded-xl transition-all hover:scale-110 active:scale-95 cursor-pointer"
            title="Efetivar agora"
          >
            <CheckCircle2 size={16} />
          </button>
        )}
        {!isReadOnly && onEdit && (
          <button
            onClick={() => onEdit(transaction)}
            className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-fin-mint hover:bg-fin-mint/10 rounded-xl transition-all hover:scale-110 active:scale-95 cursor-pointer"
            title="Editar"
          >
            <Settings size={16} />
          </button>
        )}
        {!isReadOnly && onDelete && (
          <button
            onClick={() => onDelete(transaction)}
            className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-[#ff7b7b] hover:bg-[#ff7b7b]/10 rounded-xl transition-all hover:scale-110 active:scale-95 cursor-pointer"
            title="Excluir"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
      
      {/* Mobile Footer Actions */}
      {!isReadOnly && (
        <div className="md:hidden flex items-center gap-2 px-4 pb-4 pt-1 border-t border-zinc-900/5 dark:border-white/5 ml-[60px]">
          {isPending && (
            <button
              onClick={() => onQuickEffective(transaction)}
              className="flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-fin-mint bg-fin-mint/10 border border-fin-mint/20 px-3 py-2 rounded-xl transition-all active:scale-95 min-h-[36px]"
            >
              <CheckCircle2 size={14} /> Efetivar
            </button>
          )}
          {onEdit && (
            <button
              onClick={() => onEdit(transaction)}
              className="flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 bg-zinc-900/5 dark:bg-white/5 border border-zinc-900/10 dark:border-white/10 px-3 py-2 rounded-xl transition-all active:scale-95 min-h-[36px]"
            >
              <Settings size={14} /> Editar
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(transaction)}
              className="flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#ff7b7b] bg-[#ff7b7b]/10 border border-[#ff7b7b]/20 px-3 py-2 rounded-xl transition-all active:scale-95 min-h-[36px]"
            >
              <Trash2 size={14} /> Excluir
            </button>
          )}
        </div>
      )}
    </div>
  );
}