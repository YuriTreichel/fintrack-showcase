import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Wallet, ShieldCheck, Lock, Database, EyeOff, UserCheck } from "lucide-react";
import { Link } from "react-router-dom";

const Section = ({ title, children, icon: Icon }) => (
  <section className="mb-12">
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 bg-[#eeb58f]/10 text-[#eeb58f] rounded-xl flex items-center justify-center">
        <Icon size={20} />
      </div>
      <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
    </div>
    <div className="text-zinc-400 text-sm font-medium leading-relaxed space-y-4">
      {children}
    </div>
  </section>
);

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#020617] text-zinc-100 font-['Inter'] selection:bg-[#eeb58f]/30 selection:text-white overflow-x-hidden">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#eeb58f]/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#98e5dd]/5 blur-[120px] rounded-full" />
      </div>

      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-6 border-b border-white/5 bg-[#020617]/80 backdrop-blur-xl font-['Inter']">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors group">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[13px] font-bold uppercase tracking-widest">Voltar ao Início</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#98e5dd]/10 text-[#98e5dd] rounded-lg flex items-center justify-center">
              <Wallet size={18} fill="currentColor" />
            </div>
            <span className="font-black text-xl tracking-tighter text-white uppercase italic">
              FinTrack<span className="text-zinc-600">.</span>
            </span>
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-40 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-4 italic">
              Política de <span className="text-[#eeb58f]">Privacidade</span>
            </h1>
            <p className="text-zinc-500 font-medium mb-16 uppercase tracking-[0.2em] text-xs">
              Última atualização: 28 de Março de 2026
            </p>

            <Section title="1. Coleta de Informações" icon={Database}>
              <p>
                No FinTrack Pro, a sua privacidade é a nossa maior prioridade. Coletamos apenas as informações essenciais para 
                o funcionamento do serviço:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Dados de conta: Nome, E-mail e Hash de Senha (criptografada).</li>
                <li>Dados financeiros: Transações, contas, categorias e cartões que você insere manualmente.</li>
                <li>Logs técnicos: Endereço IP e tipo de navegador (para fins de segurança e depuração).</li>
              </ul>
            </Section>

            <Section title="2. Uso dos Dados" icon={EyeOff}>
              <p>
                Seus dados financeiros nunca são compartilhados, vendidos ou acessados por terceiros. Eles são utilizados 
                exclusivamente para processar e exibir seus relatórios e dashboards.
              </p>
              <p>
                Utilizamos o seu e-mail para comunicações essenciais sobre sua conta, atualizações críticas do sistema 
                e suporte ao usuário.
              </p>
            </Section>

            <Section title="3. Segurança e Armazenamento" icon={Lock}>
              <p>
                Empregamos protocolos de segurança de ponta, incluindo:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Autenticação via <strong className="text-white">Laravel Sanctum</strong> com tokens JWT.</li>
                <li>Conexões criptografadas (SSL/TLS) em todas as requisições.</li>
                <li>Criptografia de senhas usando algoritmos de hashing seguros.</li>
              </ul>
              <p>
                Seus dados estão isolados em nosso banco de dados, garantindo que nenhum outro usuário tenha acesso às suas informações pessoais.
              </p>
            </Section>

            <Section title="4. Serviços de Terceiros" icon={ShieldCheck}>
              <p>
                Utilizamos o <strong className="text-white">Stripe</strong> como processador de pagamentos para assinaturas Premium. 
                O Stripe tem sua própria política de privacidade e garante a conformidade com padrões globais de segurança financeira (PCI DSS).
              </p>
            </Section>

            <Section title="5. Direitos do Usuário (LGPD)" icon={UserCheck}>
              <p>
                Em conformidade com a LGPD (Lei Geral de Proteção de Dados), você tem direito a:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Acessar todos os seus dados armazenados.</li>
                <li>Solicitar a correção de dados incompletos ou inexatos.</li>
                <li>Revogar seu consentimento e solicitar a exclusão total da sua conta e dados a qualquer momento.</li>
              </ul>
            </Section>

            <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
              <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest">
                © 2026 FinTrack Pro - Todos os direitos reservados
              </p>
              <div className="flex gap-4">
                <Link to="/termos" className="text-zinc-400 hover:text-[#98e5dd] transition-colors text-xs font-bold uppercase tracking-widest">
                  Termos de Uso
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
