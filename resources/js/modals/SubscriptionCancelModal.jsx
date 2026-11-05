import React from "react";
import ReactDOM from "react-dom";
import { AlertTriangle, CreditCard, Check, X, Loader2, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SubscriptionCancelModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  isCanceling,
  userPlan = 'premium'
}) {
  if (!isOpen) return null;

  const content = (
    <AnimatePresence>
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
        {/* Backdrop com desfoque global */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-zinc-950/40 dark:bg-black/80 backdrop-blur-md"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="relative bg-white dark:bg-zinc-900 w-full max-w-lg rounded-[32px] shadow-2xl border border-zinc-200 dark:border-white/5 overflow-hidden"
        >
          {/* Header Gráfico */}
          <div className="relative h-32 bg-zinc-100 dark:bg-white/[0.02] flex items-center justify-center overflow-hidden">
             <div className="absolute inset-0 opacity-20 dark:opacity-10">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,#98e5dd,transparent_70%)]" />
             </div>
             
             <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20 shadow-xl shadow-amber-500/5">
                   <AlertTriangle size={32} />
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-white dark:bg-zinc-800 border-4 border-zinc-100 dark:border-zinc-900 flex items-center justify-center text-zinc-400">
                   <CreditCard size={12} />
                </div>
             </div>
          </div>

          <div className="p-8 md:p-10">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight mb-3">
                Deseja cancelar seu {userPlan === 'premium' ? 'Premium' : 'Plano Básico'}?
              </h3>
              <p className="text-zinc-500 text-sm leading-relaxed max-w-sm mx-auto">
                Você continuará com todos os benefícios ativos até o final do seu ciclo de faturação atual.
              </p>
            </div>

            {/* Lista de Benefícios que serão perdidos */}
            <div className="bg-zinc-50 dark:bg-white/[0.02] border border-zinc-100 dark:border-white/5 rounded-2xl p-6 mb-8">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4 px-1">O que você vai perder:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                {(userPlan === 'premium' 
                  ? [
                      "Relatórios Financeiros Avançados",
                      "Planejamentos Financeiros",
                      "Metas de Economia Ilimitadas",
                      "Gestão de Patrimônio e Cripto",
                      "Sincronização entre Dispositivos",
                      "Compartilhamento Familiar",
                    ] 
                  : [
                      "Remoção de Limites de Contas",
                      "Gestão de Cartões Ilimitada",
                      "Criação de Metas Básicas",
                      "Suporte Prioritário",
                    ]
                ).map((benefit, i) => (
                  <div key={i} className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                    <X size={14} className="text-rose-500 flex-shrink-0" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={onClose}
                className="w-full bg-fin-mint text-fin-bg font-black py-4 rounded-2xl hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-xl shadow-fin-mint/20"
              >
                <Star size={18} fill="currentColor" />
                Manter meu {userPlan === 'premium' ? 'Plano Premium' : 'Plano Básico'}
              </button>
              
              <button
                onClick={onConfirm}
                disabled={isCanceling}
                className="w-full bg-transparent text-zinc-400 font-bold py-4 rounded-2xl hover:bg-zinc-100 dark:hover:bg-white/5 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isCanceling ? (
                  <Loader2 size={18} className="animate-spin text-zinc-400" />
                ) : (
                  <X size={18} />
                )}
                {isCanceling ? "Processando..." : "Confirmar Cancelamento"}
              </button>
            </div>
            
            <p className="text-[10px] text-zinc-500 text-center mt-6">
               O acesso será mantido e nenhuma cobrança futura será feita após clicar em confirmar.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  // Renderiza no Portal (final do body) para evitar bugs de stacking context (desfoque regional)
  return ReactDOM.createPortal(content, document.body);
}
