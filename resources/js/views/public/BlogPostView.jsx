import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, FileText, Share2, Clock, User, Facebook, Twitter, Linkedin, ChevronRight } from "lucide-react";

export default function BlogPostView() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [readingProgress, setReadingProgress] = useState(0);

  useEffect(() => {
    fetchPost();
    
    const updateProgress = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight) {
        setReadingProgress((window.scrollY / scrollHeight) * 100);
      }
    };
    window.addEventListener("scroll", updateProgress);
    return () => window.removeEventListener("scroll", updateProgress);
  }, [slug]);

  const fetchPost = async () => {
    try {
      const baseUrl = window.location.hostname.includes("localhost") 
        ? `${window.location.protocol}//${window.location.host}` 
        : "https://app.fintrackweb.com.br";
      
      const res = await fetch(`${baseUrl}/api/blog/posts/${slug}`);
      if (res.ok) {
        const data = await res.json();
        setPost(data);
        document.title = `${data.title} | FinTrack Pro`;

        // Fetch related posts (same category)
        const relRes = await fetch(`${baseUrl}/api/blog/posts`);
        if (relRes.ok) {
            const allPosts = await relRes.json();
            setRelatedPosts(allPosts.filter(p => p.id !== data.id && p.blog_category_id === data.blog_category_id).slice(0, 3));
        }
      } else {
        setError("Artigo não encontrado.");
      }
    } catch (err) {
      setError("Erro ao carregar o artigo.");
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const host = window.location.hostname.includes("localhost") 
      ? `${window.location.protocol}//${window.location.host}` 
      : "https://app.fintrackweb.com.br";
    return `${host}${url}`;
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    const title = post.title;

    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'native':
        if (navigator.share) {
          navigator.share({ title, url }).catch(console.error);
        } else {
          navigator.clipboard.writeText(url);
          alert("Link copiado para a área de transferência!");
        }
        break;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#98e5dd]/20 border-t-[#98e5dd] rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-6 text-center">
        <FileText size={64} className="text-zinc-700 mb-6" />
        <h1 className="text-3xl font-bold mb-4">{error || "Página não encontrada"}</h1>
        <Link to="/blog" className="text-[#98e5dd] hover:underline font-bold flex items-center gap-2">
          <ArrowLeft size={16} /> Voltar para o Blog
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen landing-bg bg-[#020617] text-zinc-100 font-['Inter'] selection:bg-[#98e5dd]/30 selection:text-white pb-24">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-[100] h-1 bg-white/5">
        <motion.div 
            className="h-full bg-[#98e5dd]"
            style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 transition-all duration-500 bg-[#020617]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/blog" className="flex items-center gap-2 group">
            <ArrowLeft size={20} className="text-zinc-500 group-hover:text-white transition-colors" />
            <span className="font-bold text-sm text-zinc-400 group-hover:text-white transition-colors uppercase tracking-widest">
              Voltar ao Blog
            </span>
          </Link>
          <Link to="/" className="font-black text-xl tracking-tighter text-white uppercase italic hover:opacity-80 transition-opacity">
            FinTrack<span className="text-zinc-600">.</span>
          </Link>
        </div>
      </nav>

      <main className="pt-32 px-6">
        <motion.article 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          {/* Article Header */}
          <header className="mb-12 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-8">
               {post.blog_category && (
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-[#98e5dd]/10 text-[#98e5dd] border border-[#98e5dd]/20">
                    {post.blog_category.name}
                </span>
               )}
               <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  <Calendar size={14} className="text-zinc-600" />
                  {new Date(post.published_at).toLocaleDateString("pt-BR", { day: '2-digit', month: 'long', year: 'numeric' })}
               </div>
               <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  <Clock size={14} className="text-zinc-600" />
                  5 min de leitura
               </div>
            </div>

            <h1 className="text-4xl md:text-7xl font-black tracking-tighter mb-10 text-white leading-[0.95]">
                {post.title}
            </h1>

            <div className="flex items-center justify-center md:justify-start gap-4 p-4 rounded-[24px] bg-zinc-900/30 border border-white/5 w-fit">
                <div className="w-12 h-12 rounded-full bg-[#98e5dd]/10 border border-[#98e5dd]/20 flex items-center justify-center text-[#98e5dd]">
                    <User size={24} />
                </div>
                <div className="text-left">
                    <div className="text-sm font-bold text-white leading-tight">Equipe FinTrack</div>
                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Especialista Financeiro</div>
                </div>
            </div>
          </header>

          {post.image_url && (
            <div className="aspect-[21/9] w-full rounded-[40px] overflow-hidden bg-zinc-900 mb-16 border border-white/5 shadow-2xl relative group">
              <img
                src={getImageUrl(post.image_url)}
                alt={post.title}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#020617]/50 to-transparent pointer-events-none" />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 relative">
            {/* Social Share (Desktop) */}
            <aside className="hidden lg:block lg:col-span-1 sticky top-32 h-fit space-y-6">
                <div className="flex flex-col gap-4">
                    <button onClick={() => handleShare('facebook')} title="Compartilhar no Facebook" className="w-12 h-12 rounded-2xl bg-zinc-900/50 border border-white/5 flex items-center justify-center text-zinc-500 hover:text-[#98e5dd] hover:bg-[#98e5dd]/10 hover:border-[#98e5dd]/20 transition-all">
                        <Facebook size={20} />
                    </button>
                    <button onClick={() => handleShare('twitter')} title="Compartilhar no Twitter" className="w-12 h-12 rounded-2xl bg-zinc-900/50 border border-white/5 flex items-center justify-center text-zinc-500 hover:text-[#98e5dd] hover:bg-[#98e5dd]/10 hover:border-[#98e5dd]/20 transition-all">
                        <Twitter size={20} />
                    </button>
                    <button onClick={() => handleShare('linkedin')} title="Compartilhar no LinkedIn" className="w-12 h-12 rounded-2xl bg-zinc-900/50 border border-white/5 flex items-center justify-center text-zinc-500 hover:text-[#98e5dd] hover:bg-[#98e5dd]/10 hover:border-[#98e5dd]/20 transition-all">
                        <Linkedin size={20} />
                    </button>
                    <button onClick={() => handleShare('native')} title="Copiar Link" className="w-12 h-12 rounded-2xl bg-zinc-900/50 border border-white/5 flex items-center justify-center text-zinc-500 hover:text-[#98e5dd] hover:bg-[#98e5dd]/10 hover:border-[#98e5dd]/20 transition-all">
                        <Share2 size={20} />
                    </button>
                </div>
            </aside>

            {/* Article Content */}
            <div className="lg:col-span-11 blog-content-container">
                <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </div>
          </div>
        </motion.article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
            <div className="max-w-5xl mx-auto mt-32">
                <div className="flex items-center justify-between mb-10">
                    <h3 className="text-2xl md:text-4xl font-black text-white tracking-tighter uppercase italic">
                        Leia <span className="text-[#98e5dd]">também</span>
                    </h3>
                    <Link to="/blog" className="text-xs font-bold text-zinc-500 hover:text-white transition-colors uppercase tracking-widest flex items-center gap-2">
                        Ver todo o blog <ChevronRight size={16} />
                    </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {relatedPosts.map(rel => (
                        <Link 
                            key={rel.id} 
                            to={`/blog/${rel.slug}`}
                            className="group bg-zinc-900/20 border border-white/5 p-3 rounded-[32px] hover:border-white/10 transition-all"
                        >
                            <div className="aspect-video rounded-[24px] overflow-hidden mb-4">
                                <img src={getImageUrl(rel.image_url)} alt={rel.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            </div>
                            <h4 className="text-white font-bold line-clamp-2 mb-2 group-hover:text-[#98e5dd] transition-colors">{rel.title}</h4>
                            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                <Calendar size={12} />
                                {new Date(rel.published_at).toLocaleDateString("pt-BR")}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        )}

        {/* CTA Section */}
        <div className="max-w-4xl mx-auto mt-32">
            <div className="relative p-8 md:p-16 rounded-[48px] bg-gradient-to-br from-[#98e5dd]/10 to-transparent border border-white/5 overflow-hidden text-center group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#98e5dd]/5 blur-[100px] -translate-y-1/2 translate-x-1/2" />
                
                <h3 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tighter leading-tight">
                    Pronto para dominar <br /> sua <span className="text-[#98e5dd] italic font-serif font-light lowercase tracking-normal">vida financeira?</span>
                </h3>
                <p className="text-zinc-400 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
                    Junte-se a milhares de usuários que já estão organizando suas finanças com o FinTrack Pro.
                </p>
                <a
                    href="https://app.fintrackweb.com.br/register"
                    className="inline-flex items-center gap-3 bg-[#98e5dd] text-[#020617] px-10 py-5 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_40px_rgba(152,229,221,0.2)] active:scale-95"
                >
                    Testar Grátis Agora
                    <ArrowLeft size={20} className="rotate-180" />
                </a>
            </div>
        </div>
      </main>
    </div>
  );
}
