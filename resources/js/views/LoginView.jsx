import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Wallet, ChevronLeft } from "lucide-react";
import { Link, useNavigate, Navigate } from "react-router-dom";

export default function LoginView() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  if (token) {
    return <Navigate to="/" replace />;
  }

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getMainUrl = (path = "") => {
    const hostname = window.location.hostname;
    const isLocal = hostname.includes("localhost");
    if (isLocal) return `http://localhost:8000${path}`;
    return `https://fintrackweb.com.br${path}`;
  };

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(
          data.message || "Erro ao fazer login. Verifique suas credenciais.",
        );

      // Salva o token
      localStorage.setItem("token", data.token);

      // Redireciona para o sistema
      // Usamos window.location para forçar o recarregamento do estado global/token no App.jsx
      window.location.href = "/";
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-fin-bg flex flex-col items-center justify-center p-4 relative overflow-hidden font-['Inter']">
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 100, 0], y: [0, -50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-24 -left-24 w-96 h-96 bg-fin-mint/10 blur-[120px] rounded-full"
        />
        <motion.div
          animate={{ x: [0, -100, 0], y: [0, 50, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-24 -right-24 w-96 h-96 bg-fin-peach/10 blur-[120px] rounded-full"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="w-20 h-20 bg-fin-surface rounded-[28px] mx-auto flex items-center justify-center shadow-2xl mb-6 border border-zinc-900/10 dark:border-white/5 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-12 h-12 bg-fin-mint/20 blur-xl rounded-full"></div>
            <Wallet
              className="text-fin-mint relative z-10"
              size={40}
              fill="currentColor"
              strokeWidth={0}
            />
          </motion.div>
          <h2 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tighter uppercase italic">
            FinTrack<span className="text-zinc-400 dark:text-zinc-600">.</span>
          </h2>
          <p className="mt-2 text-zinc-500 font-medium">
            Controle suas finanças com elegância
          </p>
        </div>

        <div className="bg-fin-surface/40 backdrop-blur-xl p-8 md:p-10 shadow-3xl border border-zinc-900/10 dark:border-white/5 rounded-[40px] relative overflow-hidden">
          <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
            Bem-vindo de volta
          </h3>
          <p className="text-sm text-zinc-500 mb-8 font-medium">
            Entre na sua conta para continuar
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="bg-[#ff7b7b]/10 border border-[#ff7b7b]/20 text-[#ff7b7b] p-4 rounded-2xl text-xs text-center font-bold"
              >
                {error}
              </motion.div>
            )}

            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 ml-1">
                E-mail
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-5 py-4 bg-zinc-900/10 dark:bg-black/20 border border-zinc-900/10 dark:border-white/5 rounded-2xl text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-fin-mint/30 transition-all font-medium placeholder-zinc-600"
                placeholder="email@exemplo.com"
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
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-5 py-4 bg-zinc-900/10 dark:bg-black/20 border border-zinc-900/10 dark:border-white/5 rounded-2xl text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-fin-mint/30 transition-all font-medium placeholder-zinc-600"
                placeholder="••••••••"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-fin-mint text-fin-bg rounded-2xl font-bold text-sm shadow-xl shadow-fin-mint/10 hover:brightness-110 transition-all disabled:opacity-50 mt-4 flex items-center justify-center"
            >
              {loading ? "Processando..." : "Entrar Agora"}
            </motion.button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-zinc-500 text-sm font-medium">
              Novo por aqui?
              <Link
                to="/register"
                className="ml-2 text-fin-mint hover:brightness-125 font-bold transition-colors underline decoration-2 underline-offset-4"
              >
                Cadastre-se
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
