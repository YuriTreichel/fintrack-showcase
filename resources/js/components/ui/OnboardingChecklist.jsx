import React from 'react';
import { 
    CheckCircle2, 
    Circle, 
    ArrowRight, 
    Wallet, 
    Tag, 
    ArrowDownLeft, 
    ArrowUpRight, 
    PiggyBank,
    X,
    Sparkles
} from 'lucide-react';
import { cn } from '../../utils/classNames';
import { motion, AnimatePresence } from 'framer-motion';

export default function OnboardingChecklist({ tasks, onDismiss, onNavigate, onToggleManual }) {
    const completedCount = tasks.filter(t => t.completed).length;
    const progress = (completedCount / tasks.length) * 100;

    if (completedCount === tasks.length) return null;

    return (
        <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mb-10 relative group"
        >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-fin-mint/20 to-fin-mint/5 rounded-[32px] blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
            
            <div className="relative bg-[#111313]/40 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-fin-mint/5 rounded-full blur-3xl pointer-events-none"></div>
                
                <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center relative z-10">
                    {/* Header Section */}
                    <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-fin-mint/10 flex items-center justify-center text-fin-mint border border-fin-mint/20">
                                <Sparkles size={20} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-white leading-tight tracking-tight">
                                    Primeiros Passos
                                </h3>
                                <p className="text-zinc-500 text-sm font-medium">
                                    Complete as tarefas para dominar suas finanças.
                                </p>
                            </div>
                        </div>
                        {/* Progress Bar */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                                <span className="text-fin-mint">Progresso Geral</span>
                                <span className="text-white">{Math.round(progress)}%</span>
                            </div>
                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    className="h-full bg-gradient-to-r from-fin-mint to-fin-mint/60"
                                />
                            </div>
                        </div>

                        {/* Skip Button - Repositioned to avoid overlap */}
                        <div className="pt-2">
                            <button 
                                onClick={onDismiss}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white hover:bg-white/10 hover:border-white/10 transition-all group"
                            >
                                Pular Checklist
                                <X size={14} className="group-hover:rotate-90 transition-transform" />
                            </button>
                        </div>
                    </div>

                    {/* Tasks Grid */}
                    <div className="flex-[2] grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-3 w-full">
                        {tasks.map((task, idx) => (
                            <div
                                key={idx}
                                className={cn(
                                    "flex items-center gap-4 p-4 rounded-2xl border transition-all relative overflow-hidden group/item",
                                    task.completed 
                                        ? "bg-fin-mint/5 border-fin-mint/20 opacity-60" 
                                        : "bg-white/[0.03] border-white/5 hover:bg-white/[0.06] hover:border-white/10"
                                )}
                            >
                                <div 
                                    onClick={() => !task.completed && onNavigate(task.id)}
                                    className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer",
                                        task.completed 
                                            ? "bg-fin-mint/20 text-fin-mint" 
                                            : "bg-white/5 text-zinc-500 group-hover/item:text-white"
                                    )}
                                >
                                    {task.completed ? <CheckCircle2 size={20} /> : (task.icon || <Circle size={20} />)}
                                </div>
                                <div 
                                    onClick={() => !task.completed && onNavigate(task.id)}
                                    className="flex-1 text-left min-w-0 cursor-pointer"
                                >
                                    <p className={cn(
                                        "text-xs font-bold truncate",
                                        task.completed ? "text-fin-mint/80 line-through" : "text-white"
                                    )}>
                                        {task.label}
                                    </p>
                                    {!task.completed && (
                                        <span className="text-[10px] text-zinc-500 font-medium flex items-center gap-1 group-hover/item:text-fin-mint transition-colors">
                                            Começar <ArrowRight size={10} />
                                        </span>
                                    )}
                                </div>

                                {/* Manual Complete Button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onToggleManual(task.id);
                                    }}
                                    className={cn(
                                        "p-2 rounded-lg transition-all",
                                        task.completed 
                                            ? "text-fin-mint hover:bg-fin-mint/10" 
                                            : "text-zinc-600 hover:text-fin-mint hover:bg-fin-mint/5"
                                    )}
                                    title={task.completed ? "Remover conclusão manual" : "Marcar como concluída"}
                                >
                                    {task.completed ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
