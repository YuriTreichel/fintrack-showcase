import React, { useState } from "react";
import { User, Lock, Mail, Check, AlertCircle, Loader2, Star, ArrowRight, XCircle, ChevronRight } from "lucide-react";
import { cn } from "../utils/classNames";
import PageHeader from "../components/ui/PageHeader";
import SubscriptionCancelModal from "../modals/SubscriptionCancelModal";

export default function ProfileView({ user, setUser, userPlan, onUpgrade, authFetch, showToast }) {
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isConfirmCancelOpen, setIsConfirmCancelOpen] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [isPortalLoading, setIsPortalLoading] = useState(false);

  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  const [passwordData, setPasswordData] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });

  const [errors, setErrors] = useState({});

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setErrors({});

    try {
      const res = await authFetch("/api/user/profile", {
        method: "PUT",
        body: JSON.stringify(profileData),
      });

      const data = await res.json();

      if (res.ok) {
        setUser(data.user);
        showToast("Perfil atualizado com sucesso!");
      } else if (res.status === 422) {
        setErrors(data.errors || {});
        showToast("Verifique os erros no formulário", "error");
      } else {
        showToast("Erro ao atualizar perfil", "error");
      }
    } catch (err) {
      showToast("Erro de conexão", "error");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setIsUpdatingPassword(true);
    setErrors({});

    try {
      const res = await authFetch("/api/user/password", {
        method: "PUT",
        body: JSON.stringify(passwordData),
      });

      const data = await res.json();

      if (res.ok) {
        setPasswordData({
          current_password: "",
          password: "",
          password_confirmation: "",
        });
        showToast("Senha alterada com sucesso!");
      } else if (res.status === 422) {
        setErrors(data.errors || {});
        showToast(data.message || "Verifique os erros no formulário", "error");
      } else {
        showToast("Erro ao alterar senha", "error");
      }
    } catch (err) {
      showToast("Erro de conexão", "error");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleManageSubscription = async () => {
    setIsPortalLoading(true);
    try {
      const res = await authFetch('/api/subscription/portal', {
        method: 'POST'
      });
      const data = await res.json();

      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        showToast(data.error || 'Erro ao abrir o gerenciador.', 'error');
      }
    } catch (error) {
      showToast('Erro ao conectar com o servidor.', 'error');
    } finally {
      setIsPortalLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    setIsCanceling(true);
    try {
      const res = await authFetch("/api/subscription/cancel", {
        method: "POST",
      });

      const data = await res.json();

      if (res.ok) {
        setUser({ ...user, subscription_ends_at: data.ends_at });
        showToast(data.message || "Assinatura cancelada com sucesso!");
        setIsConfirmCancelOpen(false);
      } else {
        showToast(data.error || "Erro ao cancelar assinatura", "error");
      }
    } catch (err) {
      showToast("Erro de conexão", "error");
    } finally {
      setIsCanceling(false);
    }
  };

  const planInfo = {
    premium: {
      name: "Plano Premium",
      icon: <Star size={24} fill="currentColor" strokeWidth={0} />,
      color: "text-fin-mint",
      bgColor: "bg-fin-mint/10",
      description: "Você tem acesso total a todas as funcionalidades ilimitadas.",
    },
    basic: {
      name: "Plano Básico",
      icon: <Check size={24} />,
      color: "text-zinc-500",
      bgColor: "bg-zinc-500/10",
      description: "Você está no plano essencial. Faça o upgrade para liberar tudo.",
    },
    none: {
      name: "Sem Assinatura",
      icon: <AlertCircle size={24} />,
      color: "text-rose-500",
      bgColor: "bg-rose-500/10",
      description: "Sua assinatura expirou ou não está ativa.",
    },
  };

  const currentPlan = planInfo[userPlan] || planInfo.none;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-6xl mx-auto">
      <PageHeader
        icon={User}
        title="Meu Perfil"
        subtitle="Gerencie suas informações pessoais, segurança e detalhes da sua assinatura."
        label="Conta"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
        {/* Informações da Conta */}
        <div className="bg-fin-surface rounded-[32px] border border-zinc-900/10 dark:border-white/5 shadow-2xl overflow-hidden flex flex-col h-full">
          <div className="p-8 border-b border-zinc-900/10 dark:border-white/5 flex items-center gap-4 bg-zinc-900/5 dark:bg-white/[0.02]">
            <div className="w-12 h-12 rounded-2xl bg-fin-mint/10 flex items-center justify-center text-fin-mint">
              <User size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white leading-tight">
                Dados Pessoais
              </h3>
              <p className="text-xs text-zinc-500">Informações de acesso básicos.</p>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="p-8 space-y-6 flex-1">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">
                Nome
              </label>
              <div className="relative group">
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className={cn(
                    "w-full bg-zinc-100 dark:bg-black/20 border border-zinc-900/10 dark:border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-fin-mint/5 focus:border-fin-mint/30 transition-all",
                    errors.name && "border-rose-500/50 focus:border-rose-500/50 focus:ring-rose-500/5"
                  )}
                  placeholder="Seu nome"
                />
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-fin-mint transition-colors" />
              </div>
              {errors.name && (
                <p className="text-xs text-rose-500 font-medium ml-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.name[0]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">
                E-mail
              </label>
              <div className="relative group">
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className={cn(
                    "w-full bg-zinc-100 dark:bg-black/20 border border-zinc-900/10 dark:border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-fin-mint/5 focus:border-fin-mint/30 transition-all",
                    errors.email && "border-rose-500/50 focus:border-rose-500/50 focus:ring-rose-500/5"
                  )}
                  placeholder="seu@email.com"
                />
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-fin-mint transition-colors" />
              </div>
              {errors.email && (
                <p className="text-xs text-rose-500 font-medium ml-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.email[0]}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="w-full bg-fin-mint text-fin-bg font-black py-4 rounded-2xl hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl shadow-fin-mint/20 mt-4"
            >
              {isUpdatingProfile ? (
                 <Loader2 size={20} className="animate-spin" />
              ) : (
                <Check size={20} />
              )}
              {isUpdatingProfile ? "Salvando..." : "Salvar"}
            </button>
          </form>
        </div>

        {/* Segurança */}
        <div className="bg-fin-surface rounded-[32px] border border-zinc-900/10 dark:border-white/5 shadow-2xl overflow-hidden flex flex-col h-full">
          <div className="p-8 border-b border-zinc-900/10 dark:border-white/5 flex items-center gap-4 bg-zinc-900/5 dark:bg-white/[0.02]">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Lock size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white leading-tight">
                Segurança
              </h3>
              <p className="text-xs text-zinc-500">Proteção da sua conta.</p>
            </div>
          </div>

          <form onSubmit={handleUpdatePassword} className="p-8 space-y-6 flex-1">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">
                Senha Atual
              </label>
              <div className="relative group">
                <input
                  type="password"
                  value={passwordData.current_password}
                  onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                  className={cn(
                    "w-full bg-zinc-100 dark:bg-black/20 border border-zinc-900/10 dark:border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-fin-mint/5 focus:border-fin-mint/30 transition-all",
                    errors.current_password && "border-rose-500/50 focus:border-rose-500/50 focus:ring-rose-500/5"
                  )}
                  placeholder="••••••••"
                />
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-fin-mint transition-colors" />
              </div>
              {errors.current_password && (
                <p className="text-xs text-rose-500 font-medium ml-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.current_password[0]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">
                Nova Senha
              </label>
              <div className="relative group">
                <input
                  type="password"
                  value={passwordData.password}
                  onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                  className={cn(
                    "w-full bg-zinc-100 dark:bg-black/20 border border-zinc-900/10 dark:border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-fin-mint/5 focus:border-fin-mint/30 transition-all",
                    errors.password && "border-rose-500/50 focus:border-rose-500/50 focus:ring-rose-500/5"
                  )}
                  placeholder="Min. 6 caracteres"
                />
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-fin-mint transition-colors" />
              </div>
              {errors.password && (
                <p className="text-xs text-rose-500 font-medium ml-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.password[0]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">
                Confirmar Senha
              </label>
              <div className="relative group">
                <input
                  type="password"
                  value={passwordData.password_confirmation}
                  onChange={(e) => setPasswordData({ ...passwordData, password_confirmation: e.target.value })}
                  className="w-full bg-zinc-100 dark:bg-black/20 border border-zinc-900/10 dark:border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-fin-mint/5 focus:border-fin-mint/30 transition-all"
                  placeholder="Repita a senha"
                />
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-fin-mint transition-colors" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isUpdatingPassword}
              className="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black py-4 rounded-2xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl mt-4"
            >
              {isUpdatingPassword ? (
                 <Loader2 size={20} className="animate-spin" />
              ) : (
                <Check size={20} />
              )}
              {isUpdatingPassword ? "Alterando..." : "Alterar"}
            </button>
          </form>
        </div>

        {/* Plano e Assinatura */}
        <div className="bg-fin-surface rounded-[32px] border border-zinc-900/10 dark:border-white/5 shadow-2xl overflow-hidden flex flex-col h-full lg:col-span-1 md:col-span-2 lg:col-start-3">
          <div className="p-8 border-b border-zinc-900/10 dark:border-white/5 flex items-center gap-4 bg-zinc-900/5 dark:bg-white/[0.02]">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", currentPlan.bgColor, currentPlan.color)}>
              {currentPlan.icon}
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white leading-tight">
                Assinatura
              </h3>
              <p className="text-xs text-zinc-500">Gerenciamento do seu plano.</p>
            </div>
          </div>

          <div className="p-8 space-y-8 flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="bg-zinc-100 dark:bg-black/20 rounded-[24px] p-6 border border-zinc-900/5 dark:border-white/[0.03]">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">Plano Atual</p>
                <div className="flex items-center gap-3">
                  <div className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest", 
                    userPlan === 'premium' ? "bg-fin-mint text-fin-bg" : "bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                  )}>
                    {currentPlan.name}
                  </div>
                  {userPlan === 'premium' && (
                    <span className="text-[10px] font-bold text-fin-mint animate-pulse flex items-center gap-1">
                      <Star size={10} fill="currentColor" /> Assinante VIP
                    </span>
                  )}
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-4 leading-relaxed font-medium">
                  {user.subscription_ends_at 
                    ? "Sua assinatura está programada para ser cancelada e não será renovada."
                    : currentPlan.description}
                </p>
              </div>

              {user?.subscription_ends_at && (
                <div className="flex flex-col gap-2 bg-orange-500/5 border border-orange-500/10 rounded-2xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                    <p className="text-xs font-bold text-orange-500 uppercase tracking-wider">
                      Assinatura Cancelada
                    </p>
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-tight">
                    Você continuará com acesso Premium até o dia <span className="text-zinc-900 dark:text-white font-bold">{new Date(user.subscription_ends_at).toLocaleDateString('pt-BR')}</span>. Após essa data, sua conta retornará ao plano gratuito.
                  </p>
                </div>
              )}

              {userPlan === 'premium' && !user?.subscription_ends_at && (
                <div className="flex items-center gap-2 px-2">
                   <div className="w-2 h-2 rounded-full bg-fin-mint animate-ping" />
                   <p className="text-xs font-bold text-zinc-500">
                     Sua assinatura renova automaticamente.
                   </p>
                </div>
              )}
            </div>

            <div className="space-y-3 pt-6">
              <button 
                onClick={handleManageSubscription}
                disabled={isPortalLoading}
                className="w-full bg-zinc-900/40 dark:bg-white/5 text-zinc-400 dark:text-zinc-200 font-bold py-4 rounded-2xl hover:bg-zinc-900/60 dark:hover:bg-white/10 transition-all flex items-center justify-center gap-3 text-sm border border-zinc-800/50 group disabled:opacity-50"
              >
                {isPortalLoading ? 'Carregando Portal...' : 'Gerenciar Assinatura'}
                {!isPortalLoading && <ChevronRight size={16} className="text-zinc-500 group-hover:translate-x-1 transition-transform" />}
              </button>
              
              {userPlan !== 'none' && !user?.subscription_ends_at && (
                <button
                  onClick={() => setIsConfirmCancelOpen(true)}
                  className="w-full bg-zinc-900/5 dark:bg-white/5 text-zinc-500 dark:text-zinc-400 font-bold py-3 rounded-xl hover:bg-rose-500/10 hover:text-rose-500 transition-all flex items-center justify-center gap-2 text-xs border border-transparent hover:border-rose-500/20"
                >
                  <XCircle size={14} />
                  Cancelar Assinatura
                </button>
              )}
              
              <p className="text-[10px] text-zinc-500 text-center font-medium px-4">
                {user?.subscription_ends_at 
                  ? "Para reativar a renovação automática, entre em contato com o suporte."
                  : "Redirecionaremos você para o portal de pagamento seguro."}
              </p>
            </div>
          </div>
        </div>
      </div>

      <SubscriptionCancelModal 
        isOpen={isConfirmCancelOpen}
        onClose={() => setIsConfirmCancelOpen(false)}
        onConfirm={handleCancelSubscription}
        isCanceling={isCanceling}
        userPlan={userPlan}
      />
    </div>
  );
}
