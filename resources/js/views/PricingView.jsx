import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useMotionTemplate } from 'framer-motion';
import { Wallet, CheckCircle2, Zap, Star, Shield, LogOut, ArrowRight } from 'lucide-react';
import stripePlans from '../config/stripePlans';

/* ===== CURSOR LIGHT ===== */
const CursorLight = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 50, stiffness: 300, mass: 0.5 };
  const lx = useSpring(mouseX, springConfig);
  const ly = useSpring(mouseY, springConfig);
  useEffect(() => {
    const h = (e) => { mouseX.set(e.clientX); mouseY.set(e.clientY); };
    window.addEventListener('mousemove', h);
    return () => window.removeEventListener('mousemove', h);
  }, []);
  const bg = useMotionTemplate`radial-gradient(500px circle at ${lx}px ${ly}px, rgba(152,229,221,0.07), transparent 80%)`;
  return <motion.div className="fixed inset-0 pointer-events-none z-[1]" style={{ background: bg }} />;
};

/* ===== BACKGROUND ===== */
const Background = () => (
  <div className="fixed inset-0 pointer-events-none z-0" style={{ background: '#020617' }}>
    {/* Dot grid */}
    <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="g" width="28" height="28" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="1" fill="#a1a1aa" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#g)" />
    </svg>
    {/* Ambient orbs */}
    <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full opacity-[0.07] blur-[120px]" style={{ background: '#98e5dd' }} />
    <div className="absolute bottom-[-5%] right-[-5%] w-[500px] h-[500px] rounded-full opacity-[0.06] blur-[120px]" style={{ background: '#eeb58f' }} />
  </div>
);

const plans = [
  {
    id: 'basic',
    priceId: () => stripePlans.BASIC_MONTHLY,
    icon: Zap,
    label: 'Básico',
    price: 'R$ 9,90',
    period: '/mês',
    desc: 'Para quem quer começar a organizar.',
    features: ['2 Contas Bancárias', '1 Cartão de Crédito', 'Despesas e Receitas', 'Relatórios Mensais'],
    highlight: false,
    badge: null,
    btnClass: 'bg-white/5 border border-white/10 text-white hover:bg-white/10',
    btnStyle: {},
    iconBg: 'bg-zinc-800',
    iconColor: 'text-zinc-500',
    labelColor: 'text-zinc-500',
  },
  {
    id: 'premium',
    priceId: () => stripePlans.PREMIUM_MONTHLY,
    icon: Zap,
    label: 'Premium',
    price: 'R$ 19,90',
    period: '/mês',
    desc: 'Tudo ilimitado. Sem restrições.',
    features: ['Contas & Cartões ilimitados', 'Planejamentos & Metas', 'Relatórios Avançados', 'Compartilhamento Familiar'],
    highlight: true,
    badge: 'Mais popular',
    btnClass: 'bg-[#98e5dd] text-[#020617] hover:brightness-110',
    btnStyle: { boxShadow: '0 0 25px rgba(152,229,221,0.25), 0 0 60px rgba(152,229,221,0.08)' },
    iconBg: 'bg-[#98e5dd]/10',
    iconColor: 'text-[#98e5dd]',
    labelColor: 'text-[#98e5dd]',
  },
  {
    id: 'annual',
    priceId: () => stripePlans.ANNUAL,
    icon: Star,
    label: 'Anual',
    price: 'R$ 199,90',
    period: '/ano',
    desc: 'Economia máxima. Plano completo por 12 meses.',
    features: ['Tudo do Premium', 'Planejamentos & Metas', '2 meses grátis', 'Suporte prioritário'],
    highlight: false,
    badge: '2 meses grátis',
    btnClass: 'bg-white/10 border border-white/5 text-white hover:bg-white/20',
    btnStyle: {},
    iconBg: 'bg-zinc-800',
    iconColor: 'text-zinc-500',
    labelColor: 'text-zinc-500',
  },
];

export default function PricingView({ onLogout, canGoBack = false }) {
  const [loadingPlan, setLoadingPlan] = useState(null);

  const handleSubscribe = async (planId) => {
    try {
      setLoadingPlan(planId);
      const token = localStorage.getItem('token');
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ plan: planId }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert(data.error || 'Erro ao redirecionar. Tente novamente.');
    } catch {
      alert('Falha ao iniciar pagamento.');
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col" style={{ background: '#020617' }}>
      <Background />
      <CursorLight />

      <div className="relative z-10 flex flex-col min-h-screen">

        {/* Top bar */}
        <header className="flex items-center justify-between px-8 pt-7 pb-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#98e5dd]/10 rounded-lg flex items-center justify-center">
              <Wallet size={17} className="text-[#98e5dd]" fill="currentColor" strokeWidth={0} />
            </div>
            <span className="text-white font-black text-lg tracking-tighter uppercase italic">
              FinTrack<span className="text-zinc-600">.</span>
            </span>
          </div>
          <div className="flex items-center gap-6">
            {canGoBack && (
              <button
                onClick={() => window.location.href = '/'}
                className="flex items-center gap-1.5 text-zinc-400 hover:text-white text-sm font-bold transition-all uppercase tracking-widest"
              >
                <ArrowRight size={14} className="rotate-180" />
                Voltar ao sistema
              </button>
            )}
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 text-zinc-400 hover:text-white text-sm font-bold transition-all uppercase tracking-widest"
            >
              <LogOut size={14} />
              Sair
            </button>
          </div>
        </header>

        {/* Main */}
        <main className="flex-1 flex flex-col items-center justify-center px-6 py-10">

          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12 max-w-xl"
          >
            <div className="inline-flex items-center gap-2 bg-[#98e5dd]/8 border border-[#98e5dd]/15 rounded-full px-4 py-1.5 mb-6">
              <Shield size={13} className="text-[#98e5dd]" />
              <span className="text-[10px] text-[#98e5dd] font-black uppercase tracking-[0.2em]">
                Checkout Seguro via Stripe
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-3">
              Escolha seu plano.
              <br />
              <span className="italic font-serif font-light text-[#98e5dd] tracking-normal lowercase">
                comece agora.
              </span>
            </h1>
            <p className="text-zinc-500 font-medium text-sm">
              Você está no seu período de 14 dias de teste gratuito. Aproveite todos os recursos Premium! 
              Após o teste, escolha um dos planos abaixo para continuar.
            </p>
          </motion.div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full max-w-5xl">
            {plans.map((plan, i) => {
              const Icon = plan.icon;
              const planId = plan.priceId();
              const busy = loadingPlan === planId;

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.1, duration: 0.5 }}
                  whileHover={{ y: -8, scale: 1.015 }}
                  className={`relative flex flex-col p-8 rounded-[32px] ${
                    plan.highlight
                      ? 'bg-zinc-900 border border-[#98e5dd]/25'
                      : 'bg-zinc-900/35 border border-white/[0.06]'
                  }`}
                >
                  {/* Shimmer (premium only) */}
                  {plan.highlight && (
                    <div className="absolute inset-0 rounded-[32px] overflow-hidden pointer-events-none">
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-[#98e5dd]/8 to-transparent -translate-x-full"
                        animate={{ translateX: ['-100%', '200%'] }}
                        transition={{ duration: 3, repeat: Infinity, repeatDelay: 5, ease: 'easeInOut' }}
                      />
                    </div>
                  )}

                  {/* Badge */}
                  {plan.badge && (
                    <div className={`absolute -top-3.5 ${plan.highlight ? 'left-1/2 -translate-x-1/2' : 'right-6'}`}>
                      <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                        plan.highlight
                          ? 'bg-[#98e5dd] text-[#020617]'
                          : 'bg-[#eeb58f]/15 border border-[#eeb58f]/25 text-[#eeb58f]'
                      }`}>
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  {/* Icon */}
                  <div className={`w-10 h-10 ${plan.iconBg} rounded-xl flex items-center justify-center mb-6`}>
                    <Icon size={18} className={plan.iconColor} />
                  </div>

                  {/* Label */}
                  <p className={`text-[11px] font-black uppercase tracking-widest mb-1.5 ${plan.labelColor}`}>
                    {plan.label}
                  </p>

                  {/* Price */}
                  <div className={`text-4xl font-black text-white mb-1 ${!plan.highlight && 'italic'}`}>
                    {plan.price}
                    <span className="text-xs text-zinc-600 font-medium ml-1">{plan.period}</span>
                  </div>

                  <p className="text-zinc-600 text-xs font-medium mb-7">{plan.desc}</p>

                  {/* Features */}
                  <ul className="space-y-2.5 mb-8 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-zinc-500 text-sm font-medium">
                        <CheckCircle2 size={14} className="text-[#98e5dd] shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <button
                    onClick={() => handleSubscribe(planId)}
                    disabled={loadingPlan !== null}
                    className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed ${plan.btnClass}`}
                    style={plan.btnStyle}
                  >
                    {busy ? 'Redirecionando...' : `Assinar ${plan.label}`}
                    {!busy && <ArrowRight size={13} />}
                  </button>
                </motion.div>
              );
            })}
          </div>

          {/* Footer badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-10 flex items-center gap-6 text-zinc-700 text-[11px] font-bold uppercase tracking-widest flex-wrap justify-center"
          >
            {['Pagamento Flexível', 'Liberação Imediata', 'Cancele quando quiser'].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle2 size={12} className="text-[#98e5dd]" /> {t}
              </span>
            ))}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
