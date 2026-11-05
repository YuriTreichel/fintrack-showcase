import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Wallet, CheckCircle2, ChevronLeft, Shield, Sparkles } from "lucide-react";
import { Link, useNavigate, Navigate } from "react-router-dom";

export default function RegisterView() {
  const navigate = useNavigate();
  
  const token = localStorage.getItem("token");
  if (token) {
    return <Navigate to="/" replace />;
  }

  const getMainUrl = (path = "") => {
    const hostname = window.location.hostname;
    const isLocal = hostname.includes("localhost");
    if (isLocal) return `http://localhost:8000${path}`;
    return `https://fintrackweb.com.br${path}`;
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    whatsapp: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Cria a conta do usuário no Laravel
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erro ao criar conta");

      // Salva o token
      localStorage.setItem("token", data.token);

      // Dispara o evento de conversão do Google Ads
      if (typeof window.gtag !== "undefined") {
        window.gtag('event', 'conversion', {
            'send_to': 'AW-924937648/yA0cCJqnzpkcELDbhbkD',
            'value': 1.0,
            'currency': 'BRL'
        });
      }

      // Redireciona direto para o dashboard com o trial ativo
      navigate("/");
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-fin-bg flex flex-col items-center justify-center p-4 relative overflow-hidden font-['Inter']">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 100, 0], y: [0, -50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-24 -left-24 w-96 h-96 bg-fin-mint/10 blur-[120px] rounded-full"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl relative z-10 py-10"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-fin-surface rounded-2xl mx-auto flex items-center justify-center shadow-xl mb-4 border border-zinc-900/10 dark:border-white/5 relative overflow-hidden">
            <Wallet
              className="text-fin-mint relative z-10"
              size={32}
              fill="currentColor"
              strokeWidth={0}
            />
          </div>
          <h2 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter uppercase italic">
            Crie sua conta
          </h2>
          <p className="mt-2 text-zinc-500 font-medium text-sm">
            Organize sua vida financeira hoje mesmo
          </p>
        </div>

        <div className="bg-fin-surface/40 backdrop-blur-xl p-8 shadow-3xl border border-zinc-900/10 dark:border-white/5 rounded-[40px]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-[#ff7b7b]/10 border border-[#ff7b7b]/20 text-[#ff7b7b] p-4 rounded-2xl text-xs text-center font-bold">
                {error}
              </div>
            )}

            {/* Trial Info Box */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-fin-mint/10 border border-fin-mint/20 p-5 rounded-3xl relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
                <Sparkles size={40} className="text-fin-mint" />
              </div>
              <div className="flex items-start gap-4 relative z-10">
                <div className="w-10 h-10 bg-fin-mint/20 rounded-xl flex items-center justify-center shrink-0">
                  <Shield size={20} className="text-fin-mint" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white uppercase tracking-wider mb-1">
                    Teste Grátis de 14 dias
                  </h4>
                  <p className="text-zinc-400 text-xs font-medium leading-relaxed">
                    Você terá acesso imediato a <span className="text-fin-mint font-bold">todos os recursos Premium</span> por 14 dias. Sem cobranças e sem necessidade de cartão agora.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* SEÇÃO DOS DADOS */}
            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 ml-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-5 py-3.5 bg-zinc-900/10 dark:bg-black/20 border border-zinc-900/10 dark:border-white/5 rounded-2xl text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-fin-mint/30 transition-all font-medium text-sm"
                  placeholder="Ex: João Silva"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 ml-1">
                  E-mail
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-5 py-3.5 bg-zinc-900/10 dark:bg-black/20 border border-zinc-900/10 dark:border-white/5 rounded-2xl text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-fin-mint/30 transition-all font-medium text-sm"
                  placeholder="email@exemplo.com"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5 ml-1">
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                    WhatsApp (Opcional)
                  </label>
                </div>
                <input
                  type="text"
                  value={form.whatsapp}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, ""); // Remove tudo que não é dígito
                    if (value.length > 11) value = value.slice(0, 11); // Limita a 11 dígitos
                    
                    // Aplica a máscara (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
                    if (value.length > 10) {
                      value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3");
                    } else if (value.length > 6) {
                      value = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3");
                    } else if (value.length > 2) {
                      value = value.replace(/^(\d{2})(\d{0,4}).*/, "($1) $2");
                    } else if (value.length > 0) {
                      value = value.replace(/^(\d{0,2}).*/, "($1");
                    }
                    
                    setForm({ ...form, whatsapp: value });
                  }}
                  className="w-full px-5 py-3.5 bg-zinc-900/10 dark:bg-black/20 border border-zinc-900/10 dark:border-white/5 rounded-2xl text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-fin-mint/30 transition-all font-medium text-sm"
                  placeholder="Ex: (11) 99999-9999"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 ml-1">
                  Senha
                </label>
                <input
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className="w-full px-5 py-3.5 bg-zinc-900/10 dark:bg-black/20 border border-zinc-900/10 dark:border-white/5 rounded-2xl text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-fin-mint/30 transition-all font-medium text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-fin-mint text-fin-bg rounded-2xl font-bold text-sm shadow-xl shadow-fin-mint/10 hover:brightness-110 transition-all disabled:opacity-50 mt-2 flex items-center justify-center animate-glow-mint"
            >
              {loading ? "Processando..." : "Começar Teste Grátis"}
            </motion.button>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-white/5">
            <p className="text-zinc-500 text-sm font-medium">
              Já possui uma conta?
              <Link
                to="/login"
                className="ml-2 text-fin-mint hover:brightness-125 font-bold transition-colors underline decoration-2 underline-offset-4"
              >
                Faça Login
              </Link>
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 flex justify-center relative z-10"
      >
        <a
          href={getMainUrl()}
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-fin-mint transition-all group font-medium text-sm py-2 px-4 rounded-full hover:bg-white/5"
        >
          <ChevronLeft
            size={16}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Voltar para o site principal
        </a>
      </motion.div>
    </div>
  );
}
