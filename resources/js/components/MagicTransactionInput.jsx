import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Loader2, AlertCircle, Send, Trash2, User } from 'lucide-react';
import { useFinStore } from '../store/useFinStore';

const MagicTransactionInput = () => {
    const [text, setText] = useState('');
    const [messages, setMessages] = useState([
        { role: 'bot', text: 'Olá! Sou seu assistente financeiro. Como posso ajudar você hoje?' }
    ]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { setTransactions } = useFinStore();
    const scrollRef = useRef(null);

    // Auto-scroll para a última mensagem
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleReset = () => {
        setMessages([{ role: 'bot', text: 'Chat resetado. Como posso ajudar?' }]);
        setText('');
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!text.trim() || loading) return;

        const userMsg = text.trim();
        setText('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/transactions/ai', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ 
                    text: userMsg,
                    history: messages.slice(-10) // Envia as últimas 10 mensagens para contexto
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erro ao processar');
            }

            if (data.question) {
                setMessages(prev => [...prev, { role: 'bot', text: data.question }]);
            } else if (data.transaction) {
                // Adiciona a transação no store
                setTransactions((prev) => [data.transaction, ...prev]);
                setMessages(prev => [...prev, { 
                    role: 'bot', 
                    text: `Pronto! Adicionei "${data.transaction.description}" de R$ ${Number(data.transaction.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}. Mais alguma coisa?` 
                }]);
            } else {
                setMessages(prev => [...prev, { role: 'bot', text: 'Entendi, mas não consegui criar a transação. Pode me dar mais detalhes?' }]);
            }
        } catch (err) {
            setError(err.message);
            setMessages(prev => [...prev, { role: 'bot', text: 'Ops, tive um probleminha técnico. Pode tentar novamente?' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#161b22] rounded-2xl border border-white/5 shadow-2xl mb-8 flex flex-col h-[400px] overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
            {/* Chat Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-gray-200">Fintrack AI Chat</h3>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Assistente em Tempo Real</p>
                    </div>
                </div>
                <button 
                    onClick={handleReset}
                    className="p-2 text-gray-500 hover:text-rose-400 transition-colors"
                    title="Limpar Conversa"
                >
                    <Trash2 size={16} />
                </button>
            </div>

            {/* Chat Messages */}
            <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar scroll-smooth"
            >
                {messages.map((msg, idx) => (
                    <div 
                        key={idx} 
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                    >
                        <div className={`max-w-[85%] flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-inner ${
                                msg.role === 'user' ? 'bg-zinc-800 border border-white/5' : 'bg-indigo-500/10 border border-indigo-500/20'
                            }`}>
                                {msg.role === 'user' ? <User size={14} className="text-gray-400" /> : <Sparkles size={14} className="text-indigo-400" />}
                            </div>
                            <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                                msg.role === 'user' 
                                ? 'bg-indigo-600 text-white rounded-tr-none' 
                                : 'bg-[#0d1117] text-gray-300 border border-white/5 rounded-tl-none'
                            }`}>
                                {msg.text}
                            </div>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start animate-pulse">
                        <div className="flex gap-3 max-w-[85%]">
                            <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                                <Loader2 size={14} className="text-indigo-400 animate-spin" />
                            </div>
                            <div className="bg-[#0d1117] p-4 rounded-2xl rounded-tl-none border border-white/5">
                                <div className="flex gap-1">
                                    <div className="w-1.5 h-1.5 bg-indigo-500/40 rounded-full animate-bounce" />
                                    <div className="w-1.5 h-1.5 bg-indigo-500/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                                    <div className="w-1.5 h-1.5 bg-indigo-500/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Chat Input */}
            <div className="p-4 bg-white/[0.01] border-t border-white/5">
                <form onSubmit={handleSubmit} className="relative group">
                    <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Responda ou adicione algo novo..."
                        disabled={loading}
                        className="w-full bg-[#0d1117] text-gray-200 pl-5 pr-14 py-4 rounded-xl border border-white/5 
                                 focus:ring-2 focus:ring-indigo-500/50 outline-none
                                 transition-all placeholder:text-gray-600 text-sm shadow-inner"
                    />
                    <button
                        type="submit"
                        disabled={loading || !text.trim()}
                        className="absolute right-2 top-2 bottom-2 w-11 bg-indigo-600 hover:bg-indigo-500 
                                 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded-lg 
                                 flex items-center justify-center transition-all shadow-lg shadow-indigo-500/10 
                                 active:scale-95 group-hover:shadow-indigo-500/20"
                    >
                        <Send size={18} />
                    </button>
                </form>
                {error && (
                    <p className="text-[10px] text-rose-500 mt-2 font-black uppercase tracking-widest flex items-center gap-1 px-1">
                        <AlertCircle size={10} /> {error}
                    </p>
                )}
            </div>
        </div>
    );
};

export default MagicTransactionInput;
