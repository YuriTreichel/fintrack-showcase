import React, { useState, useEffect, useRef, Suspense, lazy } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  ChevronRight,
  ChevronUp,
  MessageCircle,
  Shield,
  TrendingUp,
  Menu,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import subscriptionApi from "./api/subscriptionApi";
import stripePlans from "./config/stripePlans";
// VisualHero importado DIRETAMENTE (não lazy) pois aparece no fold em desktop
// Lazy loading aqui causaria spinner visível como LCP element → score ruim
import VisualHero from "./components/landing/VisualHero";

// Components
const cn = (...classes) => classes.filter(Boolean).join(" ");

/* ===== HELPER DE SUBDOMÍNIO ===== */
const getAppUrl = (path = "") => {
  const isLocal = window.location.hostname.includes("localhost");
  const baseUrl = isLocal
    ? "http://app.localhost:8000"
    : "https://app.fintrackweb.com.br";
  return `${baseUrl}${path}`;
};



/* ===== SMOOTH SCROLL HELPER ===== */
const scrollToSection = (id) => {
  const el = document.getElementById(id);
  if (el) {
    const offset = 100;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: "smooth" });
  }
};

/* ===== NAVIGATION ===== */
const Nav = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const menuItems = [
    { label: "Início", id: "inicio" },
    { label: "Funcionalidades", id: "features" },
    { label: "Como Funciona", id: "como-funciona" },
    { label: "Planos", id: "pricing" },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 px-6 py-4 transition-all duration-500"
      >
        <div
          className={cn(
            "max-w-7xl mx-auto flex items-center justify-between rounded-2xl px-6 transition-all duration-500",
            scrolled
              ? "bg-[#020617]/95 md:bg-[#020617]/70 md:backdrop-blur-md border border-white/10 py-3 shadow-2xl shadow-black/20"
              : "bg-transparent border border-transparent py-3",
          )}
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#98e5dd]/10 text-[#98e5dd] rounded-lg flex items-center justify-center">
              <Wallet size={18} fill="currentColor" />
            </div>
            <span className="font-black text-2xl tracking-tighter text-white uppercase italic">
              FinTrack<span className="text-zinc-600">.</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-10">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="text-[13px] font-bold text-zinc-400 hover:text-white transition-colors uppercase tracking-widest cursor-pointer"
              >
                {item.label}
              </button>
            ))}
            <Link
              to="/blog"
              className="text-[13px] font-bold text-[#98e5dd] hover:text-white transition-colors uppercase tracking-widest cursor-pointer flex items-center gap-1"
            >
              Blog
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <a
              href={getAppUrl("/login")}
              className="text-[13px] font-bold text-white hover:opacity-70 transition-all uppercase tracking-wider"
            >
              Entrar
            </a>
            <a
              href={getAppUrl("/register")}
              className="bg-[#98e5dd] text-[#020617] px-6 py-2.5 rounded-lg text-[13px] font-black hover:brightness-110 transition-all uppercase tracking-wider"
              style={{
                boxShadow: "0 0 20px rgba(152,229,221,0.3), 0 0 60px rgba(152,229,221,0.1)",
              }}
            >
              Teste Grátis
            </a>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-white hover:bg-white/5 rounded-xl transition-colors"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[60] bg-[#020617] md:hidden flex flex-col p-8"
          >
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#98e5dd]/10 text-[#98e5dd] rounded-lg flex items-center justify-center">
                  <Wallet size={18} fill="currentColor" />
                </div>
                <span className="font-black text-2xl tracking-tighter text-white uppercase italic">
                  FinTrack<span className="text-zinc-600">.</span>
                </span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-zinc-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <nav className="flex flex-col gap-6 mb-12">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    scrollToSection(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-2xl font-black text-white text-left uppercase tracking-tighter hover:text-[#98e5dd] transition-colors"
                >
                  {item.label}
                </button>
              ))}
              <Link
                to="/blog"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-2xl font-black text-[#98e5dd] text-left uppercase tracking-tighter hover:text-white transition-colors flex items-center gap-2"
              >
                Blog
              </Link>
            </nav>

            <div className="mt-auto space-y-4">
              <a
                href={getAppUrl("/login")}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full text-center py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold uppercase tracking-widest text-sm"
              >
                Entrar
              </a>
              <a
                href={getAppUrl("/register")}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full text-center py-5 rounded-2xl bg-[#98e5dd] text-[#020617] font-black uppercase tracking-widest text-sm"
                style={{ boxShadow: "0 0 20px rgba(152,229,221,0.3)" }}
              >
                Teste Grátis 14 dias
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

/* ===== ANIMATED COUNTER ===== */
const AnimatedNumber = ({ value, suffix = "" }) => {
  const nodeRef = useRef(null);
  const hasAnimated = useRef(false);
  const isDecimal = !Number.isInteger(value);

  return (
    <motion.span
      ref={nodeRef}
      onViewportEnter={() => {
        if (hasAnimated.current || !nodeRef.current) return;
        hasAnimated.current = true;
        const duration = 2000;
        const startTime = performance.now();
        const tick = (now) => {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = eased * value;
          
          let newDisplay;
          if (isDecimal) {
            newDisplay = current.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
          } else {
            newDisplay = Math.floor(current).toLocaleString("pt-BR");
          }
          
          if (nodeRef.current) {
            const nextText = newDisplay + suffix;
            if (nodeRef.current.textContent !== nextText) {
               nodeRef.current.textContent = nextText;
            }
          }
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }}
    >
      0{suffix}
    </motion.span>
  );
};

// Lazy components (abaixo do fold - lazy OK pois não afetam LCP)
const Features = lazy(() => import("./components/landing/Features"));
const PricingSection = lazy(() => import("./components/landing/PricingSection"));
const FaqSection = lazy(() => import("./components/landing/FaqSection"));
const Footer = lazy(() => import("./components/landing/Footer"));
const HowItWorksSection = lazy(() => import("./components/landing/HowItWorksSection"));
const ComparisonSection = lazy(() => import("./components/landing/ComparisonSection"));

// Loading Fallback
const SectionLoading = () => (
  <div className="py-20 flex items-center justify-center w-full">
    <div className="w-8 h-8 border-2 border-[#98e5dd]/20 border-t-[#98e5dd] rounded-full animate-spin" />
  </div>
);

export default function LandingPage() {
  // const [isLoading, setIsLoading] = useState(false); // Removido pois não é mais necessário

  const [error, setError] = useState(null);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    document.title = "FinTrack Pro | Sua Vida Financeira Organizada";
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  const handleSubscribe = () => {
    window.location.href = getAppUrl("/register");
  };


  return (
    <div className="min-h-screen landing-bg text-zinc-100 font-['Inter'] selection:bg-[#98e5dd]/30 selection:text-white overflow-x-hidden">
      <Nav />

      {error && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[100] bg-red-500/10 border border-red-500/20 text-red-500 px-6 py-3 rounded-xl text-sm font-medium backdrop-blur-sm">
          {error}
          <button onClick={() => setError(null)} className="ml-4 text-red-400 hover:text-red-300">×</button>
        </div>
      )}

      {/* ===== HERO ===== */}
      <section id="inicio" className="relative pt-44 pb-20 md:pt-60 md:pb-40 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(152,229,221,0.07)_0%,transparent_70%)] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(238,181,143,0.06)_0%,transparent_70%)] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 flex flex-col items-center">
          {/* 
            PERFORMANCE: Hero animations usam CSS puro (hero-fade-in, hero-slide-up)
            em vez de Framer Motion. CSS animations rodam no compositor thread (GPU),
            não no JS main thread, reduzindo o TBT significativamente.
          */}
          <div className="flex flex-col items-center hero-fade-in">
            <div
              className="mb-8 px-4 py-1.5 rounded-full border border-[#98e5dd]/20 bg-[#98e5dd]/5 text-[#98e5dd] text-[10px] font-black uppercase tracking-[0.3em]"
              style={{ animationDelay: '0ms' }}
            >
              🚀 Inteligência Financeira Premium
            </div>

            <h1 className="text-6xl md:text-[110px] font-black tracking-tighter leading-[0.8] mb-10 text-white max-w-4xl hero-slide-up" style={{ animationDelay: '100ms' }}>
              Sua gestão <br className="hidden md:block" />
              <span className="italic font-serif font-light text-[#98e5dd] lowercase tracking-normal">financeira</span> completa.
            </h1>

            <p
              className="text-lg md:text-2xl text-zinc-400 font-medium leading-relaxed mb-12 max-w-2xl hero-slide-up"
              style={{ animationDelay: '200ms' }}
            >
              Domine suas finanças com uma plataforma projetada para <span className="text-white font-bold">clareza e performance</span>. Teste grátis por 14 dias — sem cartão de crédito.
            </p>

            <div
              className="flex flex-col sm:flex-row items-start justify-center gap-6 w-full hero-slide-up"
              style={{ animationDelay: '300ms' }}
            >
              <div className="flex flex-col gap-3 w-full sm:w-auto">
                <a href={getAppUrl("/register")} className="h-[76px] bg-[#98e5dd] text-[#020617] px-10 rounded-2xl font-black text-xl hover:scale-[1.05] active:scale-[0.95] transition-all flex items-center gap-3 w-full sm:w-auto justify-center shadow-[0_20px_40px_rgba(152,229,221,0.2)]">
                  Começar 14 Dias Grátis <ArrowRight size={22} />
                </a>
                <span className="text-[#98e5dd] text-[10px] uppercase font-black tracking-[0.2em] text-center opacity-80">✓ sem compromisso • ✓ boleto</span>
              </div>
              <button onClick={() => scrollToSection("features")} className="h-[76px] bg-white/5 border border-white/10 text-white px-10 rounded-2xl font-black text-xl hover:bg-white/10 transition-all w-full sm:w-auto flex items-center justify-center cursor-pointer">
                Explorar Recursos
              </button>
            </div>

            <div
              className="mt-16 flex flex-col items-center gap-4 hero-slide-up"
              style={{ animationDelay: '400ms' }}
            >
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-12 h-12 rounded-full border-4 border-[#020617] bg-zinc-800 flex items-center justify-center overflow-hidden">
                    {/* PERFORMANCE: width/height explícito elimina CLS (layout shift) */}
                    <img
                      src={`/avatars/user-${i > 3 ? 1 : i}.png`}
                      alt={`Usuário ${i}`}
                      width={48}
                      height={48}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <p className="text-zinc-500 text-sm font-medium">
                Aprovado por <span className="text-white font-bold">1.250+</span> usuários ativos.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Suspense fallback={<SectionLoading />}>
        <ComparisonSection />
      </Suspense>

      <Suspense fallback={<SectionLoading />}>
        <Features onCtaClick={handleSubscribe} />
      </Suspense>

      <Suspense fallback={<SectionLoading />}>
        <HowItWorksSection />
      </Suspense>

      <Suspense fallback={<SectionLoading />}>
        <PricingSection handleSubscribe={handleSubscribe} />
      </Suspense>

      <section className="py-24 px-6 overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 40 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }} 
            className="relative group p-12 md:p-16 rounded-[48px] border border-white/5 bg-zinc-900/20 backdrop-blur-md overflow-hidden"
          >
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="max-w-xl text-center md:text-left">
                <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-6 leading-[0.9]">
                  Dúvidas ou <br />
                  <span className="italic font-serif font-light text-[#98e5dd] lowercase tracking-normal">especificações?</span>
                </h2>
                <p className="text-lg text-zinc-500 font-medium">Fale diretamente com quem construiu o sistema via WhatsApp.</p>
              </div>
              <a 
                href="https://wa.me/18005550199?text=Olá Yuri, estou na landing page do FinTrack e gostaria de tirar uma dúvida." 
                target="_blank" 
                rel="noopener noreferrer" 
                className="group relative flex items-center gap-4 bg-[#98e5dd] text-[#020617] px-10 py-6 rounded-[24px] font-black text-xl hover:scale-105 transition-all"
              >
                <MessageCircle size={28} /> Fale com o DEV
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <Suspense fallback={<SectionLoading />}>
        <FaqSection />
      </Suspense>

      <Suspense fallback={<div className="h-40 w-full animate-pulse bg-white/5" />}>
        <Footer />
      </Suspense>
    </div>
  );
}
