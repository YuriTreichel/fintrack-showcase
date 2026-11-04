import React, { useState, useEffect } from 'react';
import { AIPromptCard } from '../components/AIPromptCard';
import { DollarSign, TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import axios from 'axios';

export const DashboardView = () => {
    const [data, setData] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        try {
            const [dashRes, txRes] = await Promise.all([
                axios.get('/api/dashboard'),
                axios.get('/api/transactions?per_page=6')
            ]);
            setData(dashRes.data);
            setTransactions(txRes.data.data || []);
        } catch (e) {
            console.error("Failed loading data", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const overview = data?.overview || {
        net_worth: 14250.00,
        monthly_income: 6200.00,
        monthly_expense: 2840.00,
        monthly_savings: 3360.00,
        savings_rate_pct: 54.19
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                        FinTrack <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-medium">Showcase Core</span>
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">
                        High-performance financial ledger engine with atomic execution & AI natural language parsing.
                    </p>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Net Worth"
                    value={`$${overview.net_worth?.toLocaleString()}`}
                    icon={<Wallet className="w-5 h-5 text-indigo-400" />}
                    trend="+12.4% vs last mo"
                />
                <MetricCard
                    title="Monthly Income"
                    value={`$${overview.monthly_income?.toLocaleString()}`}
                    icon={<TrendingUp className="w-5 h-5 text-emerald-400" />}
                    trend="Active Cash Flow"
                />
                <MetricCard
                    title="Monthly Outflow"
                    value={`$${overview.monthly_expense?.toLocaleString()}`}
                    icon={<TrendingDown className="w-5 h-5 text-rose-400" />}
                    trend="Under Budget"
                />
                <MetricCard
                    title="Savings Rate"
                    value={`${overview.savings_rate_pct}%`}
                    icon={<DollarSign className="w-5 h-5 text-amber-400" />}
                    trend={`+$${overview.monthly_savings?.toLocaleString()} saved`}
                />
            </div>

            {/* AI Assistant Parser Card */}
            <AIPromptCard onTransactionCreated={loadData} />

            {/* Recent Ledger Entries */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold text-white">Recent Ledger Transactions</h3>
                    <span className="text-xs text-slate-400">Atomic Multi-currency Transactions</span>
                </div>

                <div className="divide-y divide-slate-800/60">
                    {transactions.length === 0 ? (
                        <p className="text-xs text-slate-500 py-6 text-center">No transactions recorded yet.</p>
                    ) : (
                        transactions.map((tx) => (
                            <div key={tx.id} className="py-3.5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-xl ${tx.type === 'Income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                        {tx.type === 'Income' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-200">{tx.description}</p>
                                        <p className="text-xs text-slate-500">
                                            {tx.date} • {tx.category?.name || 'General'} {tx.installments?.is_installment && `(${tx.installments.number}/${tx.installments.total})`}
                                        </p>
                                    </div>
                                </div>
                                <span className={`text-sm font-semibold ${tx.type === 'Income' ? 'text-emerald-400' : 'text-slate-200'}`}>
                                    {tx.type === 'Income' ? '+' : '-'}${tx.amount?.toFixed(2)}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

const MetricCard = ({ title, value, icon, trend }) => (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">{title}</span>
            <div className="p-2 bg-slate-800/60 rounded-xl">{icon}</div>
        </div>
        <p className="text-2xl font-bold text-white mt-2">{value}</p>
        <p className="text-xs text-slate-500 mt-1">{trend}</p>
    </div>
);

