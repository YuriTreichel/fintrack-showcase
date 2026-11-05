import React, { useState } from 'react';
import { createPortal } from "react-dom";
import { Plus, Copy, Check } from 'lucide-react';

export default function ShareModal({ user, following, onFollow, onUnfollow, onClose, authFetch, showToast }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(user.sharing_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast('Código copiado!');
  };

  const handleFollow = async (e) => {
    e.preventDefault();
    if (!code) return;
    setLoading(true);
    try {
      const res = await authFetch('/api/share/follow', {
        method: 'POST',
        body: JSON.stringify({ sharing_code: code })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message);
        setCode('');
        onFollow();
      } else {
        showToast(data.message || 'Erro ao seguir usuário', 'error');
      }
    } catch (error) {
      showToast('Erro de conexão', 'error');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4 animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-[#111313] border border-zinc-900/10 dark:border-white/10 w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8 pb-0 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Compartilhamento</h2>
          <button onClick={onClose} className="p-2 hover:bg-zinc-900/10 dark:hover:bg-white/5 rounded-full transition-colors">
            <Plus size={24} className="rotate-45 text-zinc-500" />
          </button>
        </div>

        <div className="p-8 space-y-8">
          <div className="space-y-3">
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Meu Código de Acesso</p>
            <div className="flex gap-2">
              <div className="flex-1 bg-zinc-900/10 dark:bg-white/5 border border-zinc-900/10 dark:border-white/10 rounded-2xl px-5 py-4 font-mono font-bold text-lg tracking-wider text-[#98e5dd] flex items-center justify-center">
                {user?.sharing_code || '------'}
              </div>
              <button 
                onClick={handleCopy}
                className="p-4 bg-[#98e5dd]/10 text-[#98e5dd] rounded-2xl hover:bg-[#98e5dd]/20 transition-all border border-[#98e5dd]/20"
              >
                {copied ? <Check size={24} /> : <Copy size={24} />}
              </button>
            </div>
            <p className="text-[10px] text-zinc-500 text-center leading-relaxed">
              Compartilhe este código com outras pessoas para que elas possam visualizar seus dados financeiros.
            </p>
          </div>

          <div className="h-px bg-zinc-900/10 dark:bg-white/5" />

          <div className="space-y-4">
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Seguir outro usuário</p>
            <form onSubmit={handleFollow} className="space-y-3">
              <div className="relative">
                <input 
                  type="text"
                  placeholder="Insira o código de 12 caracteres"
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  className="w-full bg-zinc-900/10 dark:bg-white/5 border border-zinc-900/10 dark:border-white/10 rounded-2xl px-5 py-4 font-bold text-zinc-900 dark:text-white placeholder-zinc-500 focus:outline-none focus:border-[#98e5dd]/50 transition-all"
                />
                <button 
                  type="submit"
                  disabled={loading || !code}
                  className="absolute right-2 top-2 bottom-2 bg-[#98e5dd] text-[#020617] px-5 rounded-xl font-bold hover:brightness-110 transition-all disabled:opacity-50"
                >
                  {loading ? '...' : 'Seguir'}
                </button>
              </div>
            </form>
          </div>

          {following.length > 0 && (
            <div className="space-y-4">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Usuários que eu sigo</p>
              <div className="space-y-2">
                {following.map(follow => (
                  <div key={follow.id} className="flex items-center justify-between p-4 bg-zinc-900/10 dark:bg-white/5 rounded-2xl border border-zinc-900/10 dark:border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#98e5dd]/20 text-[#98e5dd] flex items-center justify-center font-bold text-xs">
                        {follow.name.charAt(0)}
                      </div>
                      <span className="font-bold text-sm text-zinc-900 dark:text-white">{follow.name}</span>
                    </div>
                    <button 
                      onClick={() => onUnfollow(follow.id)}
                      className="text-xs font-bold text-[#ff7b7b] hover:bg-[#ff7b7b]/10 px-3 py-1.5 rounded-lg transition-all"
                    >
                      Parar de Seguir
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}