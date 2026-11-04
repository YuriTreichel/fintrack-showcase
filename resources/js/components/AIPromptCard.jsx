import React, { useState } from 'react';
import { Sparkles, Send, Loader2, CheckCircle2, HelpCircle } from 'lucide-react';
import axios from 'axios';

export const AIPromptCard = ({ onTransactionCreated }) => {
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        setLoading(true);
        try {
            const { data } = await axios.post('/api/ai/parse', { text: input });
            setResult(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async () => {
        if (!result?.transaction) return;
        setLoading(true);
        try {
            await axios.post('/api/ai/confirm', result.transaction);
            setResult(null);
            setInput('');
            if (onTransactionCreated) onTransactionCreated();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                    <Sparkles className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-white">AI Financial Assistant</h2>
                    <p className="text-xs text-slate-400">Natural Language Conversational Ledger Entry</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="e.g. Paid $45.50 for dinner at Italian Bistro yesterday..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
                />
                <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center gap-2 disabled:opacity-50"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>Parse</span>
                </button>
            </form>

            {result?.status === 'needs_clarification' && (
                <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
                    <HelpCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-amber-200">Clarification Needed</p>
                        <p className="text-xs text-amber-300/80 mt-1">{result.question}</p>
                    </div>
                </div>
            )}

            {result?.status === 'parsed' && (
                <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span className="text-sm font-semibold text-emerald-300">
                                {result.transaction.description}
                            </span>
                        </div>
                        <p className="text-xs text-emerald-400/80 mt-1">
                            ${result.transaction.amount?.toFixed(2)} • {result.transaction.type} • {result.transaction.category_name || 'Uncategorized'}
                        </p>
                    </div>
                    <button
                        onClick={handleConfirm}
                        disabled={loading}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm"
                    >
                        Confirm & Post
                    </button>
                </div>
            )}
        </div>
    );
};

