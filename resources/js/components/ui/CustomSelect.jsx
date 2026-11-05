import React, { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../utils/classNames";

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Selecione...",
  className = "",
  triggerClassName = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  const selectedOption = options.find(
    (opt) => String(opt.value) === String(value),
  );

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <div
        className={cn(
          "flex items-center justify-between cursor-pointer transition-all outline-none",
          triggerClassName ||
            "w-full bg-zinc-200/50 dark:bg-black/20 border border-zinc-900/10 dark:border-white/5 rounded-2xl px-4 py-3 text-zinc-900 dark:text-white hover:bg-zinc-200/80 dark:hover:bg-white/5 focus:ring-1 focus:ring-white/10",
        )}
        onClick={() => setIsOpen(!isOpen)}
        tabIndex={0}
      >
        <span
          className={cn(
            "truncate flex-1 text-left flex items-center gap-2",
            !selectedOption && "text-zinc-500",
          )}
        >
          {selectedOption && selectedOption.icon && (
            <span className="flex-shrink-0">{selectedOption.icon}</span>
          )}
          <span>{selectedOption ? selectedOption.label : placeholder}</span>
        </span>
        <ChevronDown
          className={cn(
            "text-zinc-500 transition-transform duration-200 ml-2 flex-shrink-0",
            isOpen ? "rotate-180" : "",
          )}
          size={16}
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-[#1a1c1c] border border-zinc-900/10 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-h-60 overflow-y-auto custom-scrollbar p-2 space-y-1">
            {options.map((opt, idx) =>
              opt.isGroup ? (
                <div
                  key={`group-${idx}`}
                  className="px-3 pt-3 pb-1 text-[10px] font-bold text-zinc-500 uppercase tracking-wider select-none first:pt-1"
                >
                  {opt.label}
                </div>
              ) : (
                <div
                  key={opt.value}
                  className={cn(
                    "px-4 py-2.5 rounded-xl cursor-pointer text-sm font-medium transition-all truncate flex items-center gap-2",
                    opt.indent && "pl-8",
                    String(value) === String(opt.value)
                      ? "bg-[#98e5dd]/10 text-[#98e5dd]"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-900/5 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white",
                  )}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                >
                  {opt.icon && <span className="flex-shrink-0">{opt.icon}</span>}
                  <span>{opt.label}</span>
                </div>
              ),
            )}
            {options.length === 0 && (
              <div className="px-4 py-2.5 text-sm text-zinc-500 text-center">
                Nenhuma opção
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
