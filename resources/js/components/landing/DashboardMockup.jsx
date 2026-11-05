import React from "react";
import {
  Wallet,
  LayoutDashboard,
  ArrowRightLeft,
  CreditCard,
  Calculator,
  Target,
  BarChart3,
  Search,
  Users,
  BellRing,
  Zap,
  ChevronDown
} from "lucide-react";

/* ===== DASHBOARD MOCKUP (Optimized for Width & Proportions) ===== */
const DashboardMockup = () => (
  <div className="bg-[#020617] rounded-[32px] border border-white/5 overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] text-white font-['Inter'] text-left select-none flex h-[580px] w-full min-w-[900px] transition-all duration-700">
    {/* Sidebar - Compacted to w-48 */}
    <div className="w-48 border-r border-white/5 bg-[#020617] p-4 flex flex-col h-full hidden md:flex shrink-0">
      <div className="flex items-center gap-2 mb-8 px-2">
        <div className="w-8 h-8 bg-[#98e5dd]/10 text-[#98e5dd] rounded-lg flex items-center justify-center">
          <Wallet size={18} fill="currentColor" />
        </div>
        <span className="text-[14px] font-black text-white italic uppercase tracking-tighter">
          FinTrack<span className="text-zinc-600">.</span>
        </span>
      </div>

      <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar pr-2">
        <div>
          <div className="text-[8px] font-bold text-zinc-600 uppercase tracking-[0.2em] px-3 mb-3">
            Menu Principal
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-3 bg-[#98e5dd] text-[#020617] px-4 py-2 rounded-xl text-[10px] font-bold shadow-lg shadow-[#98e5dd]/10">
              <LayoutDashboard size={14} /> Dashboard
            </div>
            <div className="flex items-center gap-3 text-zinc-500 hover:text-white px-4 py-2 rounded-xl text-[10px] font-bold cursor-pointer">
              <Wallet size={14} /> Contas
            </div>
            <div className="flex items-center gap-3 text-zinc-500 hover:text-white px-4 py-2 rounded-xl text-[10px] font-bold cursor-pointer">
              <ArrowRightLeft size={14} /> Transações
            </div>
            <div className="flex items-center gap-3 text-zinc-500 hover:text-white px-4 py-2 rounded-xl text-[10px] font-bold cursor-pointer">
              <CreditCard size={14} /> Cartões
            </div>
          </div>
        </div>

        <div>
          <div className="text-[8px] font-bold text-zinc-600 uppercase tracking-[0.2em] px-3 mb-3">
            Planejamento
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-3 text-zinc-500 hover:text-white px-4 py-2 rounded-xl text-[10px] font-bold cursor-pointer">
              <Calculator size={14} /> Planejamentos
            </div>
            <div className="flex items-center gap-3 text-zinc-500 hover:text-white px-4 py-2 rounded-xl text-[10px] font-bold cursor-pointer">
              <Target size={14} /> Metas
            </div>
            <div className="flex items-center gap-3 text-zinc-500 hover:text-white px-4 py-2 rounded-xl text-[10px] font-bold cursor-pointer">
              <BarChart3 size={14} /> Relatórios
            </div>
          </div>
        </div>

        <div>
          <div className="text-[8px] font-bold text-zinc-600 uppercase tracking-[0.2em] px-3 mb-3">
            Configurações
          </div>
          <div className="space-y-1 text-zinc-500">
            <div className="flex items-center gap-3 hover:text-white px-4 py-2 rounded-xl text-[10px] font-bold cursor-pointer">
              <Search size={14} /> Categorias
            </div>
            <div className="flex items-center gap-3 hover:text-white px-4 py-2 rounded-xl text-[10px] font-bold cursor-pointer">
              <Users size={14} /> Perfil
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-5 border-t border-white/5">
        <div className="flex items-center gap-3 px-2">
          <div className="w-7 h-7 rounded-full bg-[#98e5dd]/20 border border-[#98e5dd]/30 text-[#98e5dd] flex items-center justify-center text-[9px] font-black italic">
            YT
          </div>
          <div>
            <div className="text-[9px] font-black text-white">Yuri Treichel</div>
            <div className="text-[7px] text-zinc-500">Administrador</div>
          </div>
        </div>
      </div>
    </div>

    {/* Main Content */}
    <div className="flex-1 bg-[#020617] h-full flex flex-col relative overflow-hidden">
      {/* Topbar */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-white/5 bg-[#020617]">
        <div className="flex items-center gap-4 bg-zinc-900/50 border border-white/5 px-4 py-2 rounded-2xl w-64">
          <Search size={14} className="text-zinc-600" />
          <span className="text-[10px] text-zinc-600 font-medium">Pesquisar ou digitar comando...</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/5 rounded-xl flex items-center justify-center text-zinc-500">
            <BellRing size={14} />
          </div>
          <div className="bg-[#98e5dd] text-[#020617] px-4 py-2 rounded-xl text-[10px] font-black flex items-center gap-2">
            <Zap size={12} fill="currentColor" /> Novo
          </div>
        </div>
      </div>

      <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-black text-white tracking-tighter">Visão Geral</h2>
            <p className="text-[10px] text-zinc-500 font-medium mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">Resumo das suas finanças em tempo real.</p>
          </div>
          <div className="flex items-center gap-2 bg-white/5 border border-white/5 p-1 rounded-xl shrink-0">
            <div className="p-1 px-2 text-[10px] font-bold">Março 2026</div>
          </div>
        </div>

        {/* Stats Grid - Fixed columns for spacing */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-[#1a1c1c] border border-white/5 p-5 rounded-[24px] space-y-4">
            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 block">Saldo Atual</span>
            <div className="text-lg font-black text-white">R$ 1.025,49</div>
            <div className="text-[8px] text-zinc-600 font-bold">● Total nas Contas</div>
          </div>

          <div className="bg-[#1a1c1c] border border-white/5 p-5 rounded-[24px] space-y-4">
            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 block">Previsão</span>
            <div className="text-lg font-black text-white">R$ 125,49</div>
            <div className="text-[8px] text-zinc-600 font-bold">● Projeção Fim do Mês</div>
          </div>

          <div className="bg-[#6cb888] p-5 rounded-[24px] space-y-4 shadow-lg shadow-[#6cb888]/10">
            <span className="text-[9px] font-black uppercase tracking-widest text-[#020617] opacity-60 block">Receitas</span>
            <div className="text-lg font-black text-[#020617]">R$ 4.857,20</div>
            <div className="text-[8px] text-[#020617] font-black uppercase opacity-60">Mensal</div>
          </div>

          <div className="bg-[#1a1c1c] border border-white/5 p-5 rounded-[24px] space-y-4">
            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 block">Despesas</span>
            <div className="text-lg font-black text-white">R$ 4.740,71</div>
            <div className="text-[8px] text-zinc-600 font-bold">● Pagas & Pendentes</div>
          </div>
        </div>

        {/* Charts & Table Section */}
        <div className="grid grid-cols-5 gap-4">
          <div className="col-span-3 bg-[#1a1c1c] border border-white/5 p-5 rounded-[24px]">
            <div className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-6">Receitas vs Despesas</div>
            <div className="flex items-end gap-5 h-24 mb-2">
              <div className="flex-1 bg-white/5 rounded-t-lg relative">
                 <div className="absolute bottom-0 inset-x-0 bg-[#6cb888] h-[70%] rounded-t-lg" />
              </div>
              <div className="flex-1 bg-white/5 rounded-t-lg relative">
                 <div className="absolute bottom-0 inset-x-0 bg-[#ff7b7b] h-[65%] rounded-t-lg" />
              </div>
            </div>
            <div className="flex justify-between text-[8px] font-bold text-zinc-600">
               <span>RECEITAS</span>
               <span>DESPESAS</span>
            </div>
          </div>

          <div className="col-span-2 bg-[#1a1c1c] border border-white/5 p-5 rounded-[24px]">
            <div className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-4">Categorias</div>
            <div className="relative h-24 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full border-[6px] border-[#98e5dd] border-r-[#ff7b7b] border-b-[#a4bcf9] rotate-[45deg]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 bg-[#1a1c1c] rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default DashboardMockup;
