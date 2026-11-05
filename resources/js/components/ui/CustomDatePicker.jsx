import React, { useState, useEffect, useRef } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import {
  format,
  parseISO,
  startOfWeek,
  startOfMonth,
  endOfMonth,
  endOfWeek,
  isSameDay,
  isSameMonth,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "../../utils/classNames";

export default function CustomDatePicker({
  value,
  onChange,
  placeholder = "Selecione...",
  className = "",
  label = "",
  triggerClassName = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(
    value ? parseISO(value) : new Date(),
  );
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePrevMonth = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleSelectDate = (date) => {
    onChange(format(date, "yyyy-MM-dd"));
    setIsOpen(false);
  };

  const daysInMonth = () => {
    const start = startOfWeek(startOfMonth(viewDate), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(viewDate), { weekStartsOn: 0 });
    const days = [];
    let current = start;
    while (current <= end) {
      days.push(current);
      current = new Date(current.getTime() + 86400000);
    }
    return days;
  };

  const weekDays = ["D", "S", "T", "Q", "Q", "S", "S"];
  const selectedDate = value ? parseISO(value) : null;

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <div
        className={cn(
          "flex items-center gap-2 cursor-pointer outline-none group",
          triggerClassName,
        )}
        onClick={() => {
          setIsOpen(!isOpen);
          if (value) setViewDate(parseISO(value));
        }}
        tabIndex={0}
      >
        <div className="flex flex-col flex-1">
          {label && (
            <span className="text-[10px] font-bold text-zinc-500/50 uppercase tracking-tighter leading-none mb-0.5">
              {label}
            </span>
          )}
          <span
            className={cn(
              "text-sm font-bold transition-colors",
              value ? "text-zinc-900 dark:text-white" : "text-zinc-500",
              isOpen && "text-fin-mint",
            )}
          >
            {value ? format(parseISO(value), "dd/MM/yyyy") : placeholder}
          </span>
        </div>
        <Calendar
          size={16}
          className={cn(
            "transition-colors",
            isOpen
              ? "text-fin-mint"
              : "text-zinc-500 group-hover:text-fin-mint",
          )}
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-4 bg-fin-surface border border-zinc-900/10 dark:border-white/10 rounded-[24px] shadow-2xl p-5 w-[calc(100vw-2rem)] max-w-[288px] md:w-72 animate-in fade-in slide-in-from-top-2 duration-200 left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={handlePrevMonth}
              type="button"
              className="p-2 hover:bg-zinc-900/10 dark:hover:bg-white/5 rounded-xl transition-colors text-zinc-500 hover:text-fin-mint"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="font-bold text-sm text-zinc-900 dark:text-white capitalize">
              {format(viewDate, "MMMM yyyy", { locale: ptBR })}
            </span>
            <button
              onClick={handleNextMonth}
              type="button"
              className="p-2 hover:bg-zinc-900/10 dark:hover:bg-white/5 rounded-xl transition-colors text-zinc-500 hover:text-fin-mint"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-[10px] font-bold text-zinc-500 text-center py-1 uppercase"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {daysInMonth().map((date, i) => {
              const isSelected = selectedDate && isSameDay(date, selectedDate);
              const isCurrentMonth = isSameMonth(date, viewDate);
              const isTodayDate = isSameDay(date, new Date());

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectDate(date)}
                  className={cn(
                    "h-8 w-8 rounded-lg text-xs font-semibold transition-all flex items-center justify-center",
                    isSelected
                      ? "bg-fin-mint text-fin-bg shadow-lg shadow-fin-mint/30 scale-110"
                      : isCurrentMonth
                        ? "text-zinc-900 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-fin-mint"
                        : "text-zinc-300 dark:text-zinc-600",
                    isTodayDate &&
                      !isSelected &&
                      "border border-fin-mint/30 text-fin-mint",
                  )}
                >
                  {format(date, "d")}
                </button>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-zinc-900/10 dark:border-white/5 flex justify-between">
            <button
              type="button"
              onClick={() => {
                onChange("");
                setIsOpen(false);
              }}
              className="text-[10px] font-bold text-[#ff7b7b] uppercase tracking-wider hover:bg-[#ff7b7b]/10 px-3 py-1.5 rounded-lg transition-colors"
            >
              Limpar
            </button>
            <button
              type="button"
              onClick={() => handleSelectDate(new Date())}
              className="text-[10px] font-bold text-fin-mint uppercase tracking-wider hover:bg-fin-mint/10 px-3 py-1.5 rounded-lg transition-colors"
            >
              Hoje
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
