import React, { useState, useMemo, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Crown, 
  ShieldCheck, 
  UserX, 
  Settings, 
  RefreshCcw,
  Zap,
  Activity,
  History,
  Timer
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useFinStore } from '../store/useFinStore';
import AdminUserModal from '../modals/AdminUserModal';
import { cn } from '../utils/classNames';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';

export default function AdminUsersView({ showConfirm, showToast }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Falha ao buscar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const metrics = useMemo(() => {
    const total = users.length;
    const premium = users.filter(u => u.plan === 'premium' && u.subscription_status === 'active').length;
    const basic = users.filter(u => u.plan === 'basic' && u.subscription_status === 'active').length;
    const suspended = users.filter(u => u.is_suspended).length;
    
    return { total, premium, basic, suspended };
  }, [users]);

  const filteredUsers = useMemo(() => {
    return users.filter(u => 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const handleEdit = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <PageHeader
        icon={Users}
        title="Gestão de Usuários"
        subtitle="Controle total de assinaturas, segurança e atividade técnica do sistema."
        label="Administração"
        actions={
          <Button
            variant="secondary"
            onClick={fetchUsers}
            icon={RefreshCcw}
            iconClassName={cn(loading && "animate-spin")}
          >
            Sincronizar
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={<Users size={20} />} label="Total" value={metrics.total} color="blue" />
        <MetricCard icon={<Crown size={20} />} label="Premium" value={metrics.premium} color="amber" />
        <MetricCard icon={<Zap size={20} />} label="Básico" value={metrics.basic} color="mint" />
        <MetricCard icon={<UserX size={20} />} label="Suspensos" value={metrics.suspended} color="rose" />
      </div>

      <div className="bg-fin-surface border border-zinc-900/10 dark:border-white/5 rounded-[32px] shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-zinc-900/10 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md group/search">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within/search:text-fin-mint transition-colors"
            />
            <input 
              type="text"
              placeholder="Buscar usuário..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 rounded-2xl py-2.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-fin-mint/50 transition-all shadow-sm focus:shadow-md dark:text-white"
            />
          </div>
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-3">
             Listando {filteredUsers.length} registros
          </p>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-200/50 dark:bg-black/20">
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Identificação</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest line-clamp-1">Plano e Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-center">Recursos</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Última Atividade</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900/5 dark:divide-white/5">
              {loading && users.length === 0 ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="5" className="px-6 py-8"><div className="h-10 bg-zinc-200 dark:bg-white/5 rounded-xl w-full"></div></td>
                  </tr>
                ))
              ) : filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-zinc-100/50 dark:hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 shrink-0",
                        user.is_suspended ? "bg-rose-500/10 text-rose-500 border-rose-500/20" : "bg-fin-mint/10 text-fin-mint border-fin-mint/20"
                      )}>
                        {user.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-zinc-900 dark:text-white truncate flex items-center gap-2">
                          {user.name}
                          {user.is_admin && <ShieldCheck size={14} className="text-fin-mint" />}
                        </p>
                        <p className="text-xs text-zinc-500 truncate flex items-center gap-2">
                          {user.email}
                          {user.whatsapp && (
                            <a 
                              href={`https://wa.me/55${user.whatsapp.replace(/\D/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-500 hover:text-emerald-600 transition-colors flex items-center gap-1 font-bold"
                              title="Abrir no WhatsApp"
                            >
                              <span className="w-1 h-1 bg-zinc-500 rounded-full" />
                              {user.whatsapp.length === 11 || user.whatsapp.length === 10 ? (
                                // Aplica máscara se for o número puro do DB
                                user.whatsapp.replace(/\D/g, "").replace(/^(\d{2})(\d{4,5})(\d{4}).*/, "($1) $2-$3")
                              ) : (
                                user.whatsapp
                              )}
                            </a>
                          )}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {user.trial_ends_at && new Date(user.trial_ends_at) < new Date() && user.subscription_status !== 'active' ? (
                      <span className="bg-rose-500/10 text-rose-500 text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider border border-rose-500/20">Teste Expirou</span>
                    ) : (
                      <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                        <PlanBadge plan={user.plan} />
                        <StatusBadge status={user.subscription_status} />
                      </div>
                    )}
                    {user.is_suspended && <span className="text-[8px] bg-rose-500 text-white px-1.5 py-0.5 rounded font-black uppercase inline-block">Conta Suspensa</span>}
                  </td>
                  <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-4">
                          <ResourceStat count={user.accounts_count} label="Contas" />
                          <div className="w-px h-6 bg-zinc-900/5 dark:bg-white/5" />
                          <ResourceStat count={user.transactions_count} label="Transações" />
                      </div>
                  </td>
                  <td className="px-6 py-4">
                    {user.last_activity_at ? (
                      <div>
                        <p className="text-sm font-medium text-zinc-900 dark:text-white flex items-center gap-1.5">
                           <Activity size={12} className="text-fin-mint" />
                           {format(parseISO(user.last_activity_at), 'dd/MM/yy')}
                        </p>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-4.5">
                           às {format(parseISO(user.last_activity_at), 'HH:mm')}
                        </p>
                      </div>
                    ) : (
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Sem registro</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => handleEdit(user)} className="p-2.5 bg-zinc-200/50 dark:bg-white/5 hover:bg-fin-mint hover:text-fin-bg rounded-xl transition-all text-zinc-500">
                      <Settings size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <AdminUserModal 
          user={selectedUser} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={fetchUsers} 
          showConfirm={showConfirm}
          showToast={showToast}
        />
      )}
    </div>
  );
}

function MetricCard({ icon, label, value, color }) {
  const colors = {
    blue: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    amber: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    mint: "text-fin-mint bg-fin-mint/10 border-fin-mint/20",
    rose: "text-rose-500 bg-rose-500/10 border-rose-500/20"
  };
  return (
    <div className="bg-fin-surface border border-zinc-900/10 dark:border-white/5 p-6 rounded-[28px] shadow-lg flex items-center gap-4 group hover:-translate-y-1 transition-all duration-300">
      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center border", colors[color])}>{icon}</div>
      <div>
        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-2xl font-black text-zinc-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}

function ResourceStat({ count, label }) {
    return (
        <div className="text-center">
            <p className="text-sm font-bold text-zinc-900 dark:text-white leading-none mb-1">{count}</p>
            <p className="text-[8px] font-black text-zinc-500 uppercase tracking-wider">{label}</p>
        </div>
    );
}

function PlanBadge({ plan }) {
  if (plan === 'premium') return <span className="bg-amber-500/10 text-amber-500 text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider border border-amber-500/20 flex items-center gap-1"><Crown size={10} /> Premium</span>;
  if (plan === 'basic') return <span className="bg-fin-mint/10 text-fin-mint text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider border border-fin-mint/20 flex items-center gap-1"><Zap size={10} /> Básico</span>;
  return <span className="bg-zinc-500/10 text-zinc-500 text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider border border-zinc-500/20">Nenhum</span>;
}

function StatusBadge({ status }) {
  const isActive = status === 'active' || status === 'trialing';
  return (
    <span className={cn(
      "text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider border",
      isActive ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border-rose-500/20"
    )}>
      {status === 'active' ? 'Ativo' : status === 'canceled' ? 'Cancelado' : status === 'trialing' ? 'Testando' : 'Inativo'}
    </span>
  );
}
