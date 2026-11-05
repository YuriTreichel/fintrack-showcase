import React from "react";
import { motion } from "framer-motion";
import { 
  Wallet, 
  ChevronUp, 
  Mail, 
  MessageCircle, 
  ArrowUpRight 
} from "lucide-react";
import { Link } from "react-router-dom";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const currentYear = new Date().getFullYear();

  const footerLinks = {
    produto: [
      { label: "Início", id: "inicio" },
      { label: "Funcionalidades", id: "features" },
      { label: "Como Funciona", id: "como-funciona" },
      { label: "Planos", id: "pricing" },
    ],
    legal: [
      { label: "Política de Privacidade", href: "/privacidade", isInternal: true },
      { label: "Termos de Uso", href: "/termos", isInternal: true },
    ],
    contato: [
      { 
        label: "WhatsApp", 
        href: "https://wa.me/5554999204077?text=Olá Yuri, estou na landing page do FinTrack e gostaria de tirar uma dúvida.",
        isExternal: true 
      },
      { 
        label: "E-mail Suporte", 
        href: "mailto:contato@fintrackweb.com.br",
        isExternal: true 
      },
    ]
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 100;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <footer className="pt-32 pb-16 px-6 bg-[#020617] border-t border-white/5 relative z-10 overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[radial-gradient(circle,rgba(152,229,221,0.08)_0%,transparent_70%)] rounded-full pointer-events-none translate-y-1/2 -translate-x-1/2" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
          {/* Logo & Branding */}
          <div className="space-y-8">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#98e5dd]/10 text-[#98e5dd] rounded-xl flex items-center justify-center">
                <Wallet size={22} fill="currentColor" />
              </div>
              <span className="font-black text-2xl tracking-tighter text-white uppercase italic">
                FinTrack<span className="text-zinc-600">.</span>
              </span>
            </div>
            <p className="text-zinc-500 text-sm font-medium leading-relaxed max-w-xs">
              A plataforma definitiva para controle financeiro premium. 
              Organize sua vida, planeje seu futuro e tome decisões inteligentes.
            </p>
            <div className="flex items-center gap-4">
              <a href="https://wa.me/5554999204077" target="_blank" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-[#98e5dd] hover:border-[#98e5dd]/30 transition-all">
                <MessageCircle size={18} />
              </a>
              <a href="mailto:contato@fintrackweb.com.br" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-[#98e5dd] hover:border-[#98e5dd]/30 transition-all">
                <Mail size={18} />
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-8">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#98e5dd]">Produto</h4>
            <ul className="space-y-4">
              {footerLinks.produto.map((link) => (
                <li key={link.id}>
                  <button 
                    onClick={() => scrollToSection(link.id)}
                    className="text-zinc-500 hover:text-white text-sm font-bold transition-colors uppercase tracking-widest text-left"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div className="space-y-8">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#98e5dd]">Legal</h4>
            <ul className="space-y-4">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link 
                    to={link.href}
                    className="text-zinc-500 hover:text-white text-sm font-bold transition-colors uppercase tracking-widest flex items-center gap-2"
                  >
                    {link.label} <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Support */}
          <div className="space-y-8">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#98e5dd]">Suporte</h4>
            <ul className="space-y-4">
              {footerLinks.contato.map((link) => (
                <li key={link.label}>
                  <a 
                    href={link.href}
                    target={link.isExternal ? "_blank" : "_self"}
                    rel="noopener noreferrer"
                    className="text-zinc-500 hover:text-white text-sm font-bold transition-colors uppercase tracking-widest inline-flex items-center gap-2"
                  >
                    {link.label} {link.isExternal && <ArrowUpRight size={12} />}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
            <p className="text-[12px] font-bold text-zinc-700 uppercase tracking-[0.2em]">
              © {currentYear} FinTrack Pro - Todos os direitos reservados.
            </p>
          </div>

          <button 
            onClick={scrollToTop}
            className="group flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-3 rounded-full hover:bg-white/10 transition-all"
          >
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest group-hover:text-white transition-colors">Voltar ao topo</span>
            <div className="w-8 h-8 rounded-full bg-[#98e5dd]/10 text-[#98e5dd] flex items-center justify-center group-hover:bg-[#98e5dd] group-hover:text-[#020617] transition-all">
              <ChevronUp size={16} />
            </div>
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
