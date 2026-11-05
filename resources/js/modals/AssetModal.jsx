import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Plus, Trash2, Coins, Calendar } from "lucide-react";
import MoneyInput from "../components/ui/MoneyInput";

export default function AssetModal({
  isOpen,
  onClose,
  onSave,
  asset = null,
  showToast,
}) {
  const [formData, setFormData] = useState({
    asset_symbol: "",
    coin_id: "",
    quantity: "",
    purchase_price: "",
    currency: "BRL",
    exchange_rate: "",
    purchase_date: new Date().toISOString().split('T')[0],
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (asset) {
      setFormData({
        asset_symbol: asset.symbol?.toUpperCase() || asset.asset_symbol?.toUpperCase() || "",
        coin_id: asset.coin_id || asset.id || "",
        quantity: "",
        purchase_price: "",
        currency: "BRL",
        exchange_rate: "",
        purchase_date: new Date().toISOString().split('T')[0],
      });
    }
  }, [asset, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      showToast("Erro ao salvar ativo", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-zinc-100 dark:bg-zinc-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-white/5 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-zinc-200 dark:border-white/5 flex items-center justify-between bg-white dark:bg-zinc-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-fin-mint/20 flex items-center justify-center text-fin-mint">
              <Coins size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                Registrar Compra
              </h2>
              <p className="text-sm text-zinc-500">Ativos & Patrimônio</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-200 dark:hover:bg-white/10 rounded-full transition-colors text-zinc-500"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 ml-1">
                Símbolo
              </label>
              <input
                type="text"
                required
                className="w-full h-12 px-4 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/5 rounded-2xl text-zinc-900 dark:text-white focus:ring-2 focus:ring-fin-mint outline-none transition-all font-bold uppercase"
                placeholder="BTC"
                value={formData.asset_symbol}
                onChange={(e) =>
                  setFormData({ ...formData, asset_symbol: e.target.value.toUpperCase() })
                }
              />
            </div>
            <div>
               <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 ml-1">
                Data da Compra
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  className="w-full h-12 pl-10 pr-4 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/5 rounded-2xl text-zinc-900 dark:text-white focus:ring-2 focus:ring-fin-mint outline-none transition-all text-sm font-medium"
                  value={formData.purchase_date}
                  onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                />
                <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">
                Preço de Compra
              </label>
              <div className="flex bg-zinc-200 dark:bg-zinc-800 p-1 rounded-xl border border-zinc-300 dark:border-white/5">
                {["BRL", "USD"].map((curr) => (
                  <button
                    key={curr}
                    type="button"
                    onClick={() => setFormData({ ...formData, currency: curr })}
                    className={`px-3 py-1 rounded-lg text-[9px] font-black transition-all ${
                      formData.currency === curr 
                        ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm" 
                        : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-400"
                    }`}
                  >
                    {curr}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <MoneyInput 
                value={formData.purchase_price}
                currency={formData.currency}
                onChange={(val) => setFormData({ ...formData, purchase_price: val })}
                className="h-14 text-lg"
              />
              
              {formData.currency === "USD" && (
                 <div className="animate-in slide-in-from-top-2 duration-300">
                   <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 ml-1">
                    Taxa do Dólar (Câmbio)
                  </label>
                  <MoneyInput 
                    placeholder="Taxa Padrão: 5,00"
                    value={formData.exchange_rate}
                    currency="BRL"
                    onChange={(val) => setFormData({ ...formData, exchange_rate: val })}
                  />
                 </div>
              )}
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 ml-1">
              Quantidade de Moedas
            </label>
            <input
              type="number"
              step="0.00000001"
              required
              className="w-full h-14 px-4 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/5 rounded-2xl text-zinc-900 dark:text-white focus:ring-2 focus:ring-fin-mint outline-none transition-all text-lg font-bold"
              placeholder="0.00"
              value={formData.quantity}
              onChange={(e) =>
                setFormData({ ...formData, quantity: e.target.value })
              }
            />
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-fin-mint hover:bg-fin-mint/90 text-zinc-900 font-black uppercase tracking-widest text-xs rounded-2xl transition-all shadow-lg shadow-fin-mint/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-zinc-900/30 border-t-zinc-900 rounded-full animate-spin" />
              ) : (
                <>
                  <Plus size={20} />
                  Confirmar Compra
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
