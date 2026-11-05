import React, { useState } from 'react';
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, ArrowRight, Shield, TrendingUp, CreditCard, Target } from 'lucide-react';
import stripePlans from '../config/stripePlans';

const UpgradeModal = ({ isOpen, onClose, featureName = 'esta funcionalidade' }) => {
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleUpgrade = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    plan: stripePlans.PREMIUM_MONTHLY
                })
            });
            
            const data = await response.json();
            
            if (data.url) {
                window.location.href = data.url;
            } else {
                alert(data.error || 'Erro ao redirecionar para o pagamento.');
            }
        } catch (error) {
            console.error('Erro no checkout de upgrade:', error);
            alert('Falha ao processar upgrade. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return createPortal(
        <AnimatePresence>
            <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-[#020617]/80 backdrop-blur-sm"
                />
                
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="relative w-full max-w-[420px] bg-zinc-900 border border-white/10 rounded-[32px] overflow-hidden shadow-2xl flex flex-col"
                >
                    {/* Botão Fechar */}
                    <button 
                        onClick={onClose}
                        className="absolute top-5 right-5 p-2 text-zinc-500 hover:text-white hover:bg-white/10 rounded-full transition-colors z-10"
                    >
                        <X size={20} />
                    </button>

                    {/* Header */}
                    <div className="pt-10 px-8 pb-6 text-center border-b border-white/[0.04] relative overflow-hidden">
                        {/* Glow de fundo */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#98e5dd]/20 blur-[60px] rounded-full pointer-events-none" />
                        
                        <div className="mx-auto w-14 h-14 bg-[#98e5dd]/10 text-[#98e5dd] rounded-2xl flex items-center justify-center mb-5 relative z-10 border border-[#98e5dd]/20">
                            <Star size={24} fill="currentColor" strokeWidth={0} />
                        </div>
                        <h2 className="text-2xl font-black text-white mb-2 tracking-tight uppercase italic relative z-10">
                            Limite Atingido
                        </h2>
                        <p className="text-zinc-400 text-sm font-medium relative z-10 px-2 leading-relaxed">
                            <strong className="text-white">{featureName}</strong> é uma funcionalidade exclusiva ou ultrapassa o limite do Plano Básico.
                        </p>
                    </div>

                    {/* Benefícios Premium */}
                    <div className="p-8 bg-zinc-900/40">
                        <ul className="space-y-5 mb-8">
                            <li className="flex gap-4">
                                <div className="mt-0.5 rounded-xl bg-[#98e5dd]/10 text-[#98e5dd] p-2">
                                    <CreditCard size={16} />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-white font-bold text-[13px] uppercase tracking-wider mb-1">Contas e Cartões Ilimitados</h4>
                                    <p className="text-xs text-zinc-500 font-medium">Cadastre todos os seus bancos sem barreiras.</p>
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <div className="mt-0.5 rounded-xl bg-[#98e5dd]/10 text-[#98e5dd] p-2">
                                    <Shield size={16} />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-white font-bold text-[13px] uppercase tracking-wider mb-1">Compartilhamento Familiar</h4>
                                    <p className="text-xs text-zinc-500 font-medium">Divida o controlo com quem mais importa.</p>
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <div className="mt-0.5 rounded-xl bg-[#98e5dd]/10 text-[#98e5dd] p-2">
                                    <Target size={16} />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-white font-bold text-[13px] uppercase tracking-wider mb-1">Planejamento & Metas</h4>
                                    <p className="text-xs text-zinc-500 font-medium">Controle seu teto de gastos e realize sonhos.</p>
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <div className="mt-0.5 rounded-xl bg-[#98e5dd]/10 text-[#98e5dd] p-2">
                                    <TrendingUp size={16} />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-white font-bold text-[13px] uppercase tracking-wider mb-1">Relatórios Avançados</h4>
                                    <p className="text-xs text-zinc-500 font-medium">Gráficos preditivos e visão detalhada.</p>
                                </div>
                            </li>
                        </ul>

                        <button 
                            onClick={handleUpgrade}
                            disabled={loading}
                            className="w-full py-4 rounded-xl bg-[#98e5dd] text-[#020617] font-black uppercase tracking-widest text-xs transition-all shadow-lg justify-center flex items-center hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ boxShadow: '0 0 20px rgba(152,229,221,0.2)' }}
                        >
                            {loading ? 'Redirecionando...' : 'Assinar Premium'}
                            {!loading && <ArrowRight size={14} className="ml-2" />}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>,
        document.body
    );
};

export default UpgradeModal;
