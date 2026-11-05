import React, { useState, useEffect } from "react";
import { cn } from "../../utils/classNames";

/**
 * Componente de input para valores monetários (BRL)
 * Aceita um valor numérico (com ponto) e exibe formatado com vírgula.
 * Ao digitar, o valor é mascarado automaticamente.
 */
export default function MoneyInput({
  value,
  onChange,
  className,
  placeholder = "0,00",
  currency = "BRL",
  ...props
}) {
  const [displayValue, setDisplayValue] = useState("");

  const formatValue = (val) => {
    if (val === "" || val === undefined || val === null) return "";
    
    const numeric = typeof val === "string" ? parseFloat(val) : val;
    if (isNaN(numeric)) return "";

    const locale = currency === "BRL" ? "pt-BR" : "en-US";

    const formatted = new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numeric);

    return formatted;
  };

  useEffect(() => {
    setDisplayValue(formatValue(value));
  }, [value, currency]);

  const handleChange = (e) => {
    let input = e.target.value;
    
    // Remove tudo que não é dígito
    let cleanValue = input.replace(/\D/g, "");
    
    if (!cleanValue) {
      onChange("0");
      return;
    }

    const numericValue = (parseInt(cleanValue) / 100).toFixed(2);
    onChange(numericValue);
  };

  const symbol = currency === "BRL" ? "R$" : "$";

  const convertFocusToFocusWithin = (classes) => {
    if (!classes) return "";
    return classes.replace(/\bfocus:/g, "focus-within:");
  };

  return (
    <div
      className={cn(
        "flex items-center w-full bg-zinc-200/50 dark:bg-black/20 border border-zinc-900/10 dark:border-white/5 rounded-2xl transition-all focus-within:ring-1 focus-within:ring-white/10 font-medium overflow-hidden",
        convertFocusToFocusWithin(className),
        "px-0 py-0"
      )}
    >
      <span className="pl-4 pr-3 text-zinc-500 dark:text-zinc-400 select-none flex-shrink-0 text-sm h-full flex items-center">
        {symbol}
      </span>
      <div className="w-[1px] h-5 bg-zinc-900/10 dark:bg-white/10 flex-shrink-0"></div>
      <input
        {...props}
        type="text"
        inputMode="numeric"
        className="w-full h-full bg-transparent border-none py-3 pl-3 pr-4 outline-none text-zinc-900 dark:text-white text-left font-medium"
        style={{ font: "inherit", color: "inherit" }}
        placeholder={placeholder}
        value={displayValue}
        onChange={handleChange}
      />
    </div>
  );
}
