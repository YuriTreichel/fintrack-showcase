import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, FileText, ChevronRight, Search, Filter, Tag, User } from "lucide-react";
import { cn } from "../../utils/classNames";

export default function BlogPageView() {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    document.title = "Blog | FinTrack Pro";
    fetchData();
  }, []);

  useEffect(() => {
    filterPosts();
  }, [searchTerm, selectedCategory, posts]);

  const fetchData = async () => {
    try {
      const baseUrl = window.location.hostname.includes("localhost") 
        ? `${window.location.protocol}//${window.location.host}` 
        : "https://app.fintrackweb.com.br";
      
      const [postsRes, catsRes] = await Promise.all([
        fetch(`${baseUrl}/api/blog/posts`),
        fetch(`${baseUrl}/api/blog/categories`)
      ]);

      if (postsRes.ok) setPosts(await postsRes.json());
      if (catsRes.ok) setCategories(await catsRes.json());
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const filterPosts = () => {
    let result = [...posts];

    if (selectedCategory !== "all") {
      result = result.filter(post => post.blog_category_id === parseInt(selectedCategory));
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(post => 
        post.title.toLowerCase().includes(term) || 
        post.content.toLowerCase().includes(term)
      );
    }

    setFilteredPosts(result);
  };

  const featuredPost = filteredPosts.length > 0 ? filteredPosts[0] : null;
  const regularPosts = filteredPosts.length > 1 ? filteredPosts.slice(1) : [];

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const host = window.location.hostname.includes("localhost") 
      ? `${window.location.protocol}//${window.location.host}` 
      : "https://app.fintrackweb.com.br";
    return `${host}${url}`;
  };

  return (
    <div className="min-h-screen landing-bg bg-[#020617] text-zinc-100 font-['Inter'] selection:bg-[#98e5dd]/30 selection:text-white">
      {/* Header simples */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 transition-all duration-500 bg-[#020617]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <ArrowLeft size={20} className="text-zinc-500 group-hover:text-white transition-colors" />
            <span className="font-bold text-sm text-zinc-400 group-hover:text-white transition-colors uppercase tracking-widest">
              Voltar ao Início
            </span>
          </Link>
          <Link to="/" className="font-black text-xl tracking-tighter text-white uppercase italic hover:opacity-80 transition-opacity">
            FinTrack<span className="text-zinc-600">.</span> Blog
          </Link>
        </div>
      </nav>

      <main className="pt-32 pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#98e5dd]/10 text-[#98e5dd] text-[10px] font-black uppercase tracking-widest mb-6 border border-[#98e5dd]/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[#98e5dd] animate-pulse" />
                Nosso Blog
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 text-white leading-[0.9]">
              Tudo sobre o <br className="hidden md:block" />
              <span className="italic font-serif font-light text-[#98e5dd] lowercase tracking-normal">mundo financeiro</span>
            </h1>
            <p className="text-lg text-zinc-400 font-medium max-w-xl">
               O seu guia completo sobre finanças, contabilidade e estratégias para você e seu negócio.
            </p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-[#98e5dd]/20 border-t-[#98e5dd] rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              {/* Sidebar */}
              <aside className="lg:col-span-3 space-y-10 order-2 lg:order-1">
                {/* Search */}
                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 px-1">Pesquisar Artigo</label>
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-[#98e5dd] transition-colors" size={18} />
                    <input 
                      type="text" 
                      placeholder="Buscar por título ou conteúdo..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white focus:ring-2 focus:ring-[#98e5dd]/20 focus:border-[#98e5dd]/40 outline-none transition-all placeholder:text-zinc-600"
                    />
                  </div>
                </div>

                {/* Filter Category Dropdown (Mobile visible) */}
                <div className="lg:hidden">
                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 px-1">Filtrar por Categoria</label>
                    <div className="relative">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                        <select 
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white appearance-none outline-none"
                        >
                            <option value="all">Todas as Categorias ({posts.length})</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name} ({cat.posts_count})</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Desktop Categories List */}
                <div className="hidden lg:block">
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-5 px-1">Navegar por Categorias</label>
                  <div className="space-y-1">
                    <button 
                      onClick={() => setSelectedCategory("all")}
                      className={cn(
                        "w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all",
                        selectedCategory === "all" ? "bg-[#98e5dd]/10 text-[#98e5dd]" : "text-zinc-500 hover:text-white hover:bg-white/5"
                      )}
                    >
                      <span>Todas as Categorias</span>
                      <span className={cn(
                          "text-[10px] px-2 py-0.5 rounded-full border",
                          selectedCategory === "all" ? "border-[#98e5dd]/30 bg-[#98e5dd]/10" : "border-white/10 bg-white/5 text-zinc-600"
                      )}>{posts.length}</span>
                    </button>
                    {categories.map(cat => (
                      <button 
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id.toString())}
                        className={cn(
                          "w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all",
                          selectedCategory === cat.id.toString() ? "bg-[#98e5dd]/10 text-[#98e5dd]" : "text-zinc-500 hover:text-white hover:bg-white/5"
                        )}
                      >
                        <span>{cat.name}</span>
                        <span className={cn(
                            "text-[10px] px-2 py-0.5 rounded-full border",
                            selectedCategory === cat.id.toString() ? "border-[#98e5dd]/30 bg-[#98e5dd]/10" : "border-white/10 bg-white/5 text-zinc-600"
                        )}>{cat.posts_count}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </aside>

              {/* Main Content */}
              <div className="lg:col-span-9 order-1 lg:order-2">
                {filteredPosts.length === 0 ? (
                   <div className="py-20 text-center bg-zinc-900/20 rounded-[32px] border border-white/5">
                        <FileText className="mx-auto mb-4 text-zinc-700" size={48} />
                        <h3 className="text-xl font-bold text-white mb-2">Nenhum resultado</h3>
                        <p className="text-zinc-500 text-sm">Tente ajustar sua busca ou filtro.</p>
                   </div>
                ) : (
                  <div className="space-y-12">
                    {/* Featured Post */}
                    {featuredPost && selectedCategory === "all" && !searchTerm && (
                       <motion.div
                         initial={{ opacity: 0, y: 20 }}
                         whileInView={{ opacity: 1, y: 0 }}
                         viewport={{ once: true }}
                       >
                         <Link 
                           to={`/blog/${featuredPost.slug}`}
                           className="group grid grid-cols-1 md:grid-cols-2 gap-8 bg-zinc-900/20 border border-white/5 rounded-[40px] overflow-hidden hover:border-white/10 transition-all p-4 md:p-6"
                         >
                            <div className="aspect-[4/3] rounded-[28px] overflow-hidden relative">
                                <img 
                                  src={getImageUrl(featuredPost.image_url)} 
                                  alt={featuredPost.title}
                                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                            </div>
                            <div className="flex flex-col justify-center py-4 pr-4">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-fin-mint/10 text-fin-mint border border-fin-mint/20 w-fit mb-6">
                                    Destaque
                                </span>
                                <h2 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight group-hover:text-[#98e5dd] transition-colors">
                                    {featuredPost.title}
                                </h2>
                                <p className="text-zinc-400 text-sm md:text-base line-clamp-3 mb-8">
                                    {featuredPost.content.replace(/<[^>]*>?/gm, '')}
                                </p>
                                <div className="flex items-center justify-between mt-auto">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-[#98e5dd]/10 border border-[#98e5dd]/20 flex items-center justify-center text-[#98e5dd]">
                                            <User size={20} />
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-white">Equipe FinTrack</div>
                                            <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">5 min de leitura</div>
                                        </div>
                                    </div>
                                    <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-zinc-500 group-hover:text-[#98e5dd] group-hover:border-[#98e5dd]/50 transition-all group-hover:rotate-45">
                                        <ArrowLeft size={20} className="rotate-[135deg]" />
                                    </div>
                                </div>
                            </div>
                         </Link>
                       </motion.div>
                    )}

                    {/* Posts Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {(searchTerm || selectedCategory !== "all" ? filteredPosts : regularPosts).map((post, i) => (
                        <motion.div
                          key={post.id}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: i * 0.1 }}
                        >
                          <Link
                            to={`/blog/${post.slug}`}
                            className="group flex flex-col bg-zinc-900/10 border border-white/5 rounded-[32px] overflow-hidden hover:bg-zinc-900/30 hover:border-white/10 transition-all h-full p-3"
                          >
                            <div className="aspect-[16/10] rounded-[24px] overflow-hidden relative mb-6">
                               <img
                                 src={getImageUrl(post.image_url)}
                                 alt={post.title}
                                 className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                               />
                            </div>
                            <div className="px-3 pb-4 flex flex-col flex-1">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#98e5dd]">
                                        {post.blog_category ? post.blog_category.name : "Sem Categoria"}
                                    </span>
                                </div>
                                <h2 className="text-xl font-bold text-white mb-3 line-clamp-2 leading-tight group-hover:text-[#98e5dd] transition-colors">
                                  {post.title}
                                </h2>
                                <p className="text-zinc-500 text-xs line-clamp-3 mb-6 flex-1">
                                  {post.content.replace(/<[^>]*>?/gm, '')}
                                </p>
                                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500">
                                            <User size={14} />
                                        </div>
                                        <div className="text-[10px] font-bold text-zinc-400">5 min de leitura</div>
                                    </div>
                                    <ArrowLeft size={16} className="text-zinc-600 group-hover:text-[#98e5dd] transition-all rotate-[135deg] group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                </div>
                            </div>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
