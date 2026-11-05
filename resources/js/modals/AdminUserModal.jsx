import React, { useState } from 'react';
import { createPortal } from "react-dom";
import { 
  X, 
  ShieldCheck, 
  UserX, 
  Zap, 
  Crown, 
  ShieldAlert, 
  Fingerprint,
  Calendar,
  AlertCircle,
  Save,
  LogOut,
  RefreshCcw,
  History,
  Activity,
  User,
  Mail,
  KeyRound,
  BarChart3,
  CheckCircle2,
  Timer,
  Trash2
} from 'lucide-react';
import { useFinStore } from '../store/useFinStore';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import CustomSelect from '../components/ui/CustomSelect';
import { cn } from '../utils/classNames';

export default function AdminUserModal({ user, onClose, onSuccess, showConfirm, showToast }) {
  const [loading, setLoading] = useState(false);
  const [reseting, setReseting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [tempPassword, setTempPassword] = useState(null);
  const currentUser = useFinStore(state => state.user);
  console.log('Current Admin User:', currentUser);
  const [generatedLink, setGeneratedLink] = useState(null);

  const handleGenerateLink = async (plan) => {
    try {
      const res = await fetch(`/api/admin/users/${user.id}/generate-checkout-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ plan })
      });
      if (res.ok) {
        const data = await res.json();
        setGeneratedLink(data.link);
        showToast("Link de pagamento gerado!", "success");
      } else {
        const data = await res.json();
        showToast(data.error || "Erro ao gerar link de pagamento.", "error");
      }
    } catch (error) {
      console.error('Erro ao gerar link de pagamento:', error);
      showToast("Falha na requisição ao servidor.", "error");
    }
  };

  const copyToClipboard = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      showToast("Link copiado para a área de transferência!", "success");
    }
  };

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    plan: user?.plan || 'none',
    subscription_status: user?.subscription_status || 'none',
    whatsapp: user?.whatsapp || '',
    is_suspended: user?.is_suspended || false,
    is_admin: user?.is_admin || false
  });

  const planOptions = [
    { value: 'none', label: 'Nenhum Plan' },
    { value: 'basic', label: 'Plano Básico' },
    { value: 'premium', label: 'Plano Premium' }
  ];

  const statusOptions = [
    { value: 'active', label: 'Assinatura Ativa' },
    { value: 'trialing', label: 'Período Trial' },
    { value: 'canceled', label: 'Cancelado' },
    { value: 'past_due', label: 'Pagamento Pendente' },
    { value: 'none', label: 'Sem Assinatura' }
  ];

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/subscription`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        showToast("Usuário atualizado com sucesso!");
        onSuccess();
        onClose();
      } else {
        showToast("Erro ao atualizar usuário.", "error");
      }
    } catch (error) {
      console.error('Falha ao atualizar:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    showConfirm(
        "Resetar Senha",
        "Tem certeza que deseja resetar a senha deste usuário? Uma nova senha temporária será gerada.",
        async () => {
            setReseting(true);
            try {
                const res = await fetch(`/api/admin/users/${user.id}/reset-password`, {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setTempPassword(data.temporary_password);
                }
            } catch (error) {
                console.error('Erro ao resetar senha');
            } finally {
                setReseting(false);
            }
        },
        { variant: 'warning', confirmLabel: 'Resetar' }
    );
  };

  const handleImpersonate = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/impersonate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('admin_token', localStorage.getItem('token'));
        localStorage.setItem('token', data.impersonation_token);
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Erro ao representar');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    showConfirm(
        "Excluir Usuário",
        "ATENÇÃO: Isso excluirá permanentemente o usuário e TODOS os seus dados (transações, contas, etc). Esta ação NÃO pode ser desfeita. Tem certeza?",
        async () => {
            setDeleting(true);
            try {
                const res = await fetch(`/api/admin/users/${user.id}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                if (res.ok) {
                    showToast("Usuário excluído permanentemente.", "success");
                    onSuccess();
                    onClose();
                } else {
                    const data = await res.json();
                    showToast(data.error || 'Erro ao excluir usuário', "error");
                }
            } catch (error) {
                console.error('Erro ao excluir usuário');
            } finally {
                setDeleting(false);
            }
        },
        { variant: 'danger', confirmLabel: 'Excluir' }
    );
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-fin-surface w-full max-w-2xl rounded-[40px] shadow-2xl border border-zinc-900/10 dark:border-white/5 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8 border-b border-zinc-900/10 dark:border-white/5 flex items-center justify-between bg-zinc-200/50 dark:bg-black/20">
          <div className="flex items-center gap-4">
            <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl border-2 transition-colors",
                formData.is_suspended ? "bg-rose-500/10 text-rose-500 border-rose-500/20" : "bg-fin-mint/10 text-fin-mint border-fin-mint/20"
            )}>
              {user.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">{formData.name}</h3>
              <div className="flex items-center gap-3">
                 <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{user.email}</p>
                 <span className="w-1 h-1 bg-zinc-500 rounded-full" />
                 <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-none pt-0.5">ID: {user.id}</p>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-900/10 dark:hover:bg-white/10 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
          <form onSubmit={handleUpdateUser} className="space-y-8">
            
            {/* Seção 1: Dados Pessoais */}
            <div className="space-y-4">
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    <User size={12} className="text-blue-500" /> Perfil Principal
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 ml-1">Nome Completo</label>
                        <div className="relative">
                            <input 
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                                className="w-full bg-zinc-200/50 dark:bg-black/20 border border-zinc-900/10 dark:border-white/5 rounded-2xl px-4 py-3 text-sm font-bold text-zinc-900 dark:text-white"
                            />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 ml-1">E-mail de Acesso</label>
                        <div className="relative">
                            <input 
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({...formData, email: e.target.value})}
                                className="w-full bg-zinc-200/50 dark:bg-black/20 border border-zinc-900/10 dark:border-white/5 rounded-2xl px-4 py-3 text-sm font-bold text-zinc-900 dark:text-white"
                            />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 ml-1">WhatsApp</label>
                        <div className="relative">
                            <input 
                                type="text"
                                value={formData.whatsapp}
                                onChange={e => {
                                    let value = e.target.value.replace(/\D/g, "");
                                    if (value.length > 11) value = value.slice(0, 11);
                                    if (value.length > 10) {
                                        value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3");
                                    } else if (value.length > 6) {
                                        value = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3");
                                    } else if (value.length > 2) {
                                        value = value.replace(/^(\d{2})(\d{0,4}).*/, "($1) $2");
                                    } else if (value.length > 0) {
                                        value = value.replace(/^(\d{0,2}).*/, "($1");
                                    }
                                    setFormData({...formData, whatsapp: value});
                                }}
                                className="w-full bg-zinc-200/50 dark:bg-black/20 border border-zinc-900/10 dark:border-white/5 rounded-2xl px-4 py-3 text-sm font-bold text-zinc-900 dark:text-white"
                                placeholder="(00) 00000-0000"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Seção 2: Assinatura */}
            <div className="space-y-4">
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <Crown size={12} className="text-amber-500" /> Nível de Acesso & Billing
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CustomSelect 
                    options={planOptions}
                    value={formData.plan}
                    onChange={(val) => setFormData({...formData, plan: val})}
                    triggerClassName="w-full bg-zinc-200/50 dark:bg-black/20 border border-zinc-900/10 dark:border-white/5 rounded-2xl p-4 text-sm font-bold"
                />
                <CustomSelect 
                    options={statusOptions}
                    value={formData.subscription_status}
                    onChange={(val) => setFormData({...formData, subscription_status: val})}
                    triggerClassName="w-full bg-zinc-200/50 dark:bg-black/20 border border-zinc-900/10 dark:border-white/5 rounded-2xl p-4 text-sm font-bold"
                />
              </div>
            </div>

            {/* Seção 3: Estatísticas e Datas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
                        <BarChart3 size={12} className="text-fin-mint" /> Estatísticas de Uso
                    </p>
                    <div className="bg-zinc-200/30 dark:bg-black/10 rounded-3xl p-5 grid grid-cols-3 gap-2 border border-zinc-900/5 dark:border-white/5">
                        <StatItem value={user.accounts_count} label="Contas" />
                        <StatItem value={user.cards_count} label="Cartões" />
                        <StatItem value={user.transactions_count} label="Transações" />
                    </div>
                </div>
                <div className="space-y-4">
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
                        <History size={12} className="text-indigo-400" /> Histórico de Atividades
                    </p>
                    <div className="space-y-2">
                        <ActivityLine icon={<Timer size={14} />} label="Cadastrado em" date={user.created_at} />
                        <ActivityLine icon={<Activity size={14} />} label="Última Atividade" date={user.last_activity_at} />
                        <ActivityLine icon={<History size={14} />} label="Último Login" date={user.last_login_at} />
                    </div>
                </div>
            </div>

            {/* Seção 4: Ações Perigosas */}
            <div className="space-y-4">
              <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <ShieldAlert size={12} /> Zona de Risco & Segurança
              </p>
              
              <div className={cn(
                "grid grid-cols-1 gap-3",
                currentUser?.email?.toLowerCase() === 'yuriinfo15@gmail.com' ? "sm:grid-cols-4" : "sm:grid-cols-3"
              )}>
                <ActionButton 
                    icon={<KeyRound size={18} />} 
                    label="Resetar Senha" 
                    onClick={resetPassword} 
                    loading={reseting}
                    disabled={user.email === 'yuriinfo15@gmail.com'}
                />
                <ActionButton 
                    icon={<UserX size={18} />} 
                    label={formData.is_suspended ? "Restaurar" : "Suspender"} 
                    color={formData.is_suspended ? "mint" : "rose"}
                    onClick={() => setFormData({...formData, is_suspended: !formData.is_suspended})} 
                    disabled={user.email === 'yuriinfo15@gmail.com'}
                />
                <ActionButton 
                    icon={<Fingerprint size={18} />} 
                    label="Representar" 
                    onClick={handleImpersonate}
                    disabled={formData.is_suspended}
                />
                {currentUser?.email?.toLowerCase() === 'yuriinfo15@gmail.com' && (
                  <ActionButton 
                      icon={<Trash2 size={18} />} 
                      label="Excluir" 
                      color="rose"
                      onClick={handleDeleteUser}
                      loading={deleting}
                      disabled={user.email === 'yuriinfo15@gmail.com'}
                  />
                )}
              </div>

              {tempPassword && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-3xl flex flex-col gap-2 animate-in zoom-in duration-300">
                    <div className="flex items-center gap-2 text-emerald-500 font-black text-[10px] uppercase tracking-widest">
                        <CheckCircle2 size={14} /> Senha Temporária Gerada!
                    </div>
                    <p className="text-zinc-900 dark:text-white font-mono text-lg font-black tracking-widest bg-emerald-500/5 p-3 rounded-2xl text-center border border-emerald-500/10">
                        {tempPassword}
                    </p>
                    <p className="text-[10px] text-zinc-500 text-center">Informe ao usuário e peça para ele trocar no primeiro acesso.</p>
                </div>
              )}
            </div>

            {/* Seção: Links de Assinatura Direta */}
            {currentUser?.email?.toLowerCase() === 'yuriinfo15@gmail.com' && (
              <div className="space-y-4">
                <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Crown size={12} /> Links de Pagamento Exclusivos
                </p>
                <div className="bg-zinc-200/30 dark:bg-black/10 rounded-3xl p-5 border border-zinc-900/5 dark:border-white/5 space-y-3">
                  <p className="text-[10px] text-zinc-500 font-medium">Gere e copie um link de pagamento direto temporário (válido por 7 dias) para enviar ao usuário:</p>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => handleGenerateLink('basic_monthly')}
                      className="py-3 px-4 rounded-2xl bg-zinc-200 dark:bg-black/20 text-zinc-800 dark:text-white font-bold text-xs uppercase tracking-wider hover:brightness-110 border border-zinc-300 dark:border-white/5 transition-all text-center"
                    >
                      Básico Mensal
                    </button>
                    <button
                      type="button"
                      onClick={() => handleGenerateLink('premium_monthly')}
                      className="py-3 px-4 rounded-2xl bg-fin-mint/10 text-fin-mint font-bold text-xs uppercase tracking-wider hover:bg-fin-mint/20 border border-fin-mint/20 transition-all text-center"
                    >
                      Premium Mensal
                    </button>
                    <button
                      type="button"
                      onClick={() => handleGenerateLink('annual')}
                      className="py-3 px-4 rounded-2xl bg-amber-500/10 text-amber-500 font-bold text-xs uppercase tracking-wider hover:bg-amber-500/20 border border-amber-500/20 transition-all text-center"
                    >
                      Plano Anual
                    </button>
                  </div>
                  {generatedLink && (
                    <div className="mt-4 p-3 bg-zinc-900/40 rounded-2xl border border-zinc-800/50 flex items-center justify-between gap-3 animate-in fade-in zoom-in duration-200">
                      <input
                        type="text"
                        readOnly
                        value={generatedLink}
                        className="bg-transparent border-none text-[11px] font-mono text-zinc-400 focus:outline-none flex-1 truncate select-all"
                      />
                      <button
                        type="button"
                        onClick={copyToClipboard}
                        className="shrink-0 bg-fin-mint text-fin-bg px-3 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-wider hover:brightness-110 transition-all"
                      >
                        Copiar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            <button
               type="submit"
               disabled={loading}
               className="w-full bg-fin-mint text-fin-bg py-5 rounded-[28px] font-black text-sm uppercase tracking-widest hover:brightness-110 transition-all flex items-center justify-center gap-3 shadow-xl"
            >
              {loading ? <RefreshCcw className="animate-spin" size={20} /> : <Save size={20} />}
              Salvar Configurações
            </button>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}

function StatItem({ value, label }) {
    return (
        <div className="text-center p-2">
            <p className="text-sm font-black text-zinc-900 dark:text-white leading-none mb-1">{value || 0}</p>
            <p className="text-[8px] font-black text-zinc-500 uppercase tracking-tight">{label}</p>
        </div>
    );
}

function ActivityLine({ icon, label, date }) {
    return (
        <div className="flex items-center justify-between text-[10px] font-bold">
            <div className="flex items-center gap-2 text-zinc-500">
                {icon}
                <span className="uppercase tracking-wider">{label}</span>
            </div>
            <span className="text-zinc-900 dark:text-white">
                {date ? format(parseISO(date), 'dd/MM/yy HH:mm') : 'N/A'}
            </span>
        </div>
    );
}

function ActionButton({ icon, label, onClick, disabled, loading, color = 'zinc' }) {
    const colors = {
        zinc: "bg-zinc-200 dark:bg-black/20 text-zinc-600 dark:text-zinc-500 hover:border-zinc-500",
        rose: "bg-rose-500/10 text-rose-500 border-rose-500/30 hover:bg-rose-500/20",
        mint: "bg-fin-mint/10 text-fin-mint border-fin-mint/30 hover:bg-fin-mint/20"
    };
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled || loading}
            className={cn(
                "flex flex-col items-center justify-center gap-2 p-4 rounded-3xl border border-zinc-900/10 dark:border-white/5 transition-all text-[10px] font-bold uppercase tracking-widest disabled:opacity-20",
                colors[color]
            )}
        >
            {loading ? <RefreshCcw className="animate-spin" size={18} /> : icon}
            {label}
        </button>
    );
}
