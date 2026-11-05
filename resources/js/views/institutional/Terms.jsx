import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Wallet, ShieldCheck, FileText, Scale, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const Section = ({ title, children, icon: Icon }) => (
  <section className="mb-12">
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 bg-[#98e5dd]/10 text-[#98e5dd] rounded-xl flex items-center justify-center">
        <Icon size={20} />
      </div>
      <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
    </div>
    <div className="text-zinc-400 text-sm font-medium leading-relaxed space-y-4">
      {children}
    </div>
  </section>
);

export default function TermsOfUse() {
  return (
    <div className="min-h-screen bg-[#020617] text-zinc-100 font-['Inter'] selection:bg-[#98e5dd]/30 selection:text-white overflow-x-hidden">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#98e5dd]/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#eeb58f]/5 blur-[120px] rounded-full" />
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
              Termos de <span className="text-[#98e5dd]">Uso</span>
            </h1>
            <p className="text-zinc-500 font-medium mb-16 uppercase tracking-[0.2em] text-xs">
              Última atualização: 28 de Março de 2026
            </p>

            <Section title="1. Aceitação dos Termos" icon={FileText}>
              <p>
                Ao acessar e utilizar o FinTrack Pro, você concorda em cumprir e estar vinculado a estes Termos de Uso. 
                Se você não concordar com qualquer parte destes termos, você não deve utilizar o serviço.
              </p>
              <p>
                Este documento constitui um contrato vinculativo entre você ("Usuário") e o FinTrack Pro ("Nós", "Nosso").
              </p>
            </Section>

            <Section title="2. Descrição do Serviço" icon={Zap}>
              <p>
                O FinTrack Pro é uma ferramenta de gestão financeira pessoal que permite aos usuários registrar transações, 
                gerenciar contas bancárias, cartões de crédito e visualizar relatórios de desempenho financeiro.
              </p>
              <p>
                O serviço é oferecido em modalidades "Básico" e "Premium", com funcionalidades específicas detalhadas em nossa página de preços. 
                Reservamo-nos o direito de modificar ou descontinuar qualquer aspecto do serviço a qualquer momento.
              </p>
            </Section>

            <Section title="3. Responsabilidades do Usuário" icon={ShieldCheck}>
              <p>
                Você é o único responsável por manter a confidencialidade de sua conta e senha. Qualquer atividade realizada 
                através de sua conta será de sua inteira responsabilidade.
              </p>
              <p>
                O FinTrack Pro não realiza conexões automáticas com instituições bancárias. Todos os dados financeiros são 
                inseridos manualmente pelo usuário ou via importação de arquivos fornecidos pelo usuário. Recomendamos precisão 
                no input de dados para garantir a integridade dos relatórios.
              </p>
            </Section>

            <Section title="4. Planos e Assinaturas" icon={Scale}>
              <p>
                As assinaturas Premium são processadas de forma segura através do <strong className="text-white">Stripe</strong>. 
                Não armazenamos dados sensíveis de cartões em nossos servidores.
              </p>
              <p>
                O cancelamento da assinatura pode ser feito a qualquer momento através das configurações do perfil. 
                O acesso às funcionalidades Premium continuará ativo até o final do período já pago.
              </p>
            </Section>

            <Section title="5. Limitação de Responsabilidade" icon={Scale}>
              <p>
                O FinTrack Pro é uma ferramenta de auxílio na organização financeira e não deve ser interpretado como 
                aconselhamento financeiro, jurídico ou contábil profissional.
              </p>
              <p>
                Não nos responsabilizamos por perdas financeiras decorrentes de decisões tomadas com base nos dados 
                apresentados no sistema. Cabe ao usuário validar suas informações reais junto às suas instituições financeiras.
              </p>
            </Section>

            <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
              <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest">
                © 2026 FinTrack Pro - Todos os direitos reservados
              </p>
              <div className="flex gap-4">
                <Link to="/privacidade" className="text-zinc-400 hover:text-[#98e5dd] transition-colors text-xs font-bold uppercase tracking-widest">
                  Política de Privacidade
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
