import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, X, Check, FileText, Image as ImageIcon, Tags, Tag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";
import CustomSelect from "../components/ui/CustomSelect";
import RichTextEditor from "../components/ui/RichTextEditor";
import { cn } from "../utils/classNames";

export default function AdminBlogView() {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [error, setError] = useState(null);
  const [catError, setCatError] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    blog_category_id: "",
    is_published: false,
    image: null,
  });

  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/blog/categories", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (res.ok) {
        setCategories(await res.json());
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/blog/posts", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (res.ok) {
        setPosts(await res.json());
      }
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (post = null) => {
    setEditingPost(post);
    if (post) {
      setFormData({
        title: post.title,
        content: post.content,
        blog_category_id: post.blog_category_id || "",
        is_published: post.is_published,
        image: null,
      });
      setPreviewImage(post.image_url);
    } else {
      setFormData({
        title: "",
        content: "",
        blog_category_id: "",
        is_published: false,
        image: null,
      });
      setPreviewImage(null);
    }
    setError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPost(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    const payload = new FormData();
    payload.append("title", formData.title);
    payload.append("content", formData.content);
    payload.append("is_published", formData.is_published ? "1" : "0");
    if (formData.blog_category_id) {
      payload.append("blog_category_id", formData.blog_category_id);
    }
    if (formData.image) {
      payload.append("image", formData.image);
    }

    // Estimate size
    const estimatedSize = (formData.image?.size || 0) + formData.content.length + formData.title.length;
    if (estimatedSize > 10 * 1024 * 1024) {
      setError("O post é muito pesado. Tente reduzir o tamanho das imagens.");
      return;
    }

    try {
      let res;
      if (editingPost) {
        payload.append("_method", "PUT");
        res = await fetch(`/api/admin/blog/posts/${editingPost.id}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          body: payload,
        });
      } else {
        res = await fetch("/api/admin/blog/posts", {
          method: "POST",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          body: payload,
        });
      }

      if (res.ok) {
        closeModal();
        fetchPosts();
      } else if (res.status === 413) {
        setError("O servidor rejeitou o post por ser muito grande. Diminua o tamanho das imagens.");
      } else {
        const data = await res.json();
        setError(data.message || "Erro ao salvar o post.");
      }
    } catch (err) {
      setError("Erro de conexão. O post pode ser muito grande.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir este post?")) return;
    
    try {
      const res = await fetch(`/api/admin/blog/posts/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (res.ok) {
        fetchPosts();
      }
    } catch (err) {
      console.error("Error deleting post:", err);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    setCatError(null);
    try {
        const res = await fetch("/api/admin/blog/categories", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({ name: newCategoryName }),
        });
        if (res.ok) {
            setNewCategoryName("");
            fetchCategories();
        } else {
            const data = await res.json();
            setCatError(data.message || "Erro ao criar categoria.");
        }
    } catch (err) {
        setCatError("Erro de conexão.");
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Tem certeza? Posts vinculados ficarão sem categoria.")) return;
    try {
        const res = await fetch(`/api/admin/blog/categories/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });
        if (res.ok) {
            fetchCategories();
            fetchPosts();
        }
    } catch (err) {
        console.error("Error deleting category:", err);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <PageHeader
        icon={FileText}
        title="Gerenciar Blog"
        subtitle="Crie e edite as publicações da Landing Page do FinTrack."
        label="Administração"
        actions={
          <div className="flex gap-3">
             <Button
                variant="secondary"
                onClick={() => setIsCategoryModalOpen(true)}
                icon={Tags}
            >
                Categorias
            </Button>
            <Button
                variant="primary"
                onClick={() => openModal()}
                icon={Plus}
            >
                Novo Post
            </Button>
          </div>
        }
      />

      <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-white/5 rounded-[32px] shadow-2xl overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-sm text-left">
            <thead className="bg-zinc-50 dark:bg-black/20 text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest text-[10px]">
              <tr>
                <th className="px-6 py-4">Conteúdo do Post</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Publicação</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
              {loading && posts.length === 0 ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="4" className="px-6 py-8">
                      <div className="h-12 bg-zinc-100 dark:bg-white/5 rounded-2xl w-full"></div>
                    </td>
                  </tr>
                ))
              ) : posts.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-2">
                        <FileText size={40} className="text-zinc-300 dark:text-zinc-700 mb-2" />
                        <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Nenhum post encontrado</p>
                        <p className="text-zinc-400 text-xs">Comece criando sua primeira publicação.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr key={post.id} className="hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0 border border-zinc-200 dark:border-white/5 shadow-sm">
                          {post.image_url ? (
                            <img src={post.image_url} alt={post.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                          ) : (
                            <FileText className="text-zinc-400" size={24} />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-zinc-900 dark:text-white line-clamp-1 mb-0.5 text-base">{post.title}</div>
                          <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest truncate">{post.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                       {post.blog_category ? (
                           <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-fin-mint/10 text-fin-mint border border-fin-mint/20">
                               <Tag size={10} strokeWidth={3} /> {post.blog_category.name}
                           </span>
                       ) : (
                           <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">-</span>
                       )}
                    </td>
                    <td className="px-6 py-5">
                      {post.is_published ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-sm shadow-emerald-500/5">
                          <Check size={12} strokeWidth={3} /> Publicado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-zinc-500/10 text-zinc-500 border border-zinc-500/20">
                          Rascunho
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm font-bold text-zinc-900 dark:text-zinc-300">
                        {post.published_at ? new Date(post.published_at).toLocaleDateString("pt-BR") : "-"}
                      </div>
                      <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                        Data de Lançamento
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openModal(post)}
                          className="p-2.5 text-zinc-400 hover:text-fin-mint hover:bg-fin-mint/10 rounded-xl transition-all hover:scale-110"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="p-2.5 text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all hover:scale-110"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={closeModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl bg-white dark:bg-[#111313] rounded-[32px] shadow-2xl border border-zinc-200 dark:border-white/10 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 md:p-8 flex-1 overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tighter uppercase italic">
                    {editingPost ? "Editar Publicação" : "Nova Publicação"}
                  </h2>
                  <button onClick={closeModal} className="p-2 text-zinc-400 hover:text-white transition-colors">
                    <X size={24} />
                  </button>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm font-medium">
                    {error}
                  </div>
                )}

                <form id="postForm" onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 px-1">Título do Post</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 rounded-2xl px-4 py-3.5 text-zinc-900 dark:text-white font-medium focus:ring-2 focus:ring-fin-mint/50 focus:border-fin-mint outline-none transition-all shadow-sm"
                      placeholder="Ex: Como organizar suas finanças no FinTrack..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 px-1">Categoria</label>
                        <CustomSelect
                            value={formData.blog_category_id}
                            onChange={(val) => setFormData({ ...formData, blog_category_id: val })}
                            options={[
                                { value: "", label: "Sem Categoria" },
                                ...categories.map(cat => ({ value: cat.id, label: cat.name }))
                            ]}
                            placeholder="Selecione uma categoria"
                            triggerClassName="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 rounded-2xl px-4 py-3 text-zinc-900 dark:text-white font-medium focus:ring-2 focus:ring-fin-mint/50 outline-none transition-all shadow-sm"
                        />
                    </div>

                    <div className="flex items-center gap-3 pt-6 cursor-pointer group" onClick={() => setFormData({ ...formData, is_published: !formData.is_published })}>
                        <div className={cn(
                            "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                            formData.is_published ? "bg-fin-mint border-fin-mint text-fin-bg" : "bg-transparent border-zinc-300 dark:border-zinc-700"
                        )}>
                            {formData.is_published && <Check size={16} strokeWidth={4} />}
                        </div>
                        <label className="text-sm font-bold text-zinc-900 dark:text-white cursor-pointer select-none">
                            Publicar na Landing Page
                        </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 px-1">Imagem de Capa</label>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-4 bg-zinc-50 dark:bg-zinc-900/30 rounded-2xl border border-zinc-200 dark:border-white/10">
                      {previewImage ? (
                        <div className="w-full sm:w-32 h-32 rounded-xl overflow-hidden border border-zinc-200 dark:border-white/10 shrink-0 shadow-lg">
                          <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-full sm:w-32 h-32 rounded-xl bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 flex items-center justify-center shrink-0">
                          <ImageIcon className="text-zinc-400" size={32} />
                        </div>
                      )}
                      <div className="flex-1 w-full">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="block w-full text-sm text-zinc-500 dark:text-zinc-400 file:mr-4 file:py-2.5 file:px-6 file:rounded-xl file:border-0 file:text-xs file:font-black file:uppercase file:tracking-widest file:bg-fin-mint file:text-fin-bg hover:file:brightness-110 cursor-pointer transition-all"
                        />
                        <p className="text-[10px] font-medium text-zinc-500 mt-3 flex items-center gap-2">
                           <span className="w-1 h-1 bg-zinc-400 rounded-full" /> Formatos: JPG, PNG, WEBP. Máximo 5MB.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 px-1">Conteúdo da Matéria</label>
                    <RichTextEditor
                      value={formData.content}
                      onChange={(val) => setFormData({ ...formData, content: val })}
                      placeholder="Escreva o conteúdo do seu post aqui..."
                    />
                  </div>

                </form>
              </div>
              <div className="p-6 md:p-8 bg-zinc-50 dark:bg-zinc-900/30 border-t border-zinc-200 dark:border-white/5 flex flex-col sm:flex-row justify-end gap-3">
                <Button
                  variant="secondary"
                  onClick={closeModal}
                  className="w-full sm:w-auto"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  form="postForm"
                  variant="primary"
                  icon={Check}
                  className="w-full sm:w-auto shadow-fin-mint/20"
                >
                  Salvar Publicação
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Categories Management Modal */}
      <AnimatePresence>
        {isCategoryModalOpen && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={() => setIsCategoryModalOpen(false)}
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-md bg-white dark:bg-[#111313] rounded-[32px] shadow-2xl border border-zinc-200 dark:border-white/10 overflow-hidden flex flex-col"
                >
                    <div className="p-6 md:p-8">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-xl font-black text-zinc-900 dark:text-white tracking-tighter uppercase italic">
                                Gerenciar Categorias
                            </h2>
                            <button onClick={() => setIsCategoryModalOpen(false)} className="p-2 text-zinc-400 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleAddCategory} className="flex gap-2 mb-8">
                            <input
                                type="text"
                                required
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                className="flex-1 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-zinc-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-fin-mint/50 outline-none"
                                placeholder="Nova categoria..."
                            />
                            <Button type="submit" variant="primary" icon={Plus} className="py-2.5 px-4" />
                        </form>

                        {catError && <p className="text-rose-500 text-[10px] font-bold uppercase mb-4 px-1">{catError}</p>}

                        <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                            {categories.map(cat => (
                                <div key={cat.id} className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900/30 rounded-2xl border border-zinc-200 dark:border-white/5 group">
                                    <span className="text-sm font-bold text-zinc-900 dark:text-zinc-200">{cat.name}</span>
                                    <button
                                        onClick={() => handleDeleteCategory(cat.id)}
                                        className="p-2 text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                            {categories.length === 0 && (
                                <div className="text-center py-8">
                                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Nenhuma categoria</p>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="p-6 bg-zinc-50 dark:bg-zinc-900/30 border-t border-zinc-200 dark:border-white/5 flex justify-end">
                        <Button variant="secondary" onClick={() => setIsCategoryModalOpen(false)}>Fechar</Button>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </div>
  );
}
