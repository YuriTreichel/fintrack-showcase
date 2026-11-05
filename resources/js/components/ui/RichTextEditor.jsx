import React, { useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import { 
  Bold, Italic, Underline as UnderlineIcon, 
  List, ListOrdered, Quote, Minus, 
  AlignLeft, AlignCenter, AlignRight, 
  Heading1, Heading2, Heading3, 
  Image as ImageIcon, Link as LinkIcon, 
  Undo, Redo, Code, Strikethrough
} from 'lucide-react';
import { cn } from '../../utils/classNames';

const MenuButton = ({ onClick, isActive, disabled, children, title }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={cn(
      "p-2 rounded-lg transition-all flex items-center justify-center",
      isActive 
        ? "bg-fin-mint/20 text-fin-mint" 
        : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white"
    )}
  >
    {children}
  </button>
);

export default function RichTextEditor({ value, onChange, placeholder = "Escreva seu conteúdo..." }) {
  const [isSourceMode, setIsSourceMode] = React.useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Image.configure({
        allowBase64: false,
        HTMLAttributes: {
          class: 'rounded-[24px] max-w-full h-auto my-8 shadow-xl',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-fin-mint underline font-bold transition-colors hover:brightness-110',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      if (!isSourceMode) {
        onChange(editor.getHTML());
      }
    },
    editorProps: {
        handlePaste: (view, event) => {
            const items = Array.from(event.clipboardData?.items || []);
            const imageItem = items.find(item => item.type.startsWith('image'));

            if (imageItem) {
                const file = imageItem.getAsFile();
                if (file) {
                    uploadImageFile(file);
                    return true;
                }
            }
            return false;
        },
        handleDrop: (view, event, slice, moved) => {
            if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
                const file = event.dataTransfer.files[0];
                if (file.type.startsWith('image')) {
                    uploadImageFile(file);
                    return true;
                }
            }
            return false;
        },
        attributes: {
            class: 'prose prose-invert max-w-none focus:outline-none min-h-[300px] p-6 text-zinc-900 dark:text-zinc-100 font-medium',
        },
    },
  });

  // Sync editor content when value changes from outside (e.g. from Source Mode)
  React.useEffect(() => {
    if (editor && isSourceMode) {
        // Do nothing while in source mode to avoid loops
    } else if (editor && editor.getHTML() !== value) {
        editor.commands.setContent(value);
    }
  }, [value, editor, isSourceMode]);

  const uploadImageFile = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('/api/admin/blog/upload-image', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        editor.chain().focus().setImage({ src: data.url }).run();
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const addImage = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      if (input.files && input.files[0]) {
        const file = input.files[0];
        const formData = new FormData();
        formData.append('image', file);

        try {
          const res = await fetch('/api/admin/blog/upload-image', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: formData,
          });

          if (res.ok) {
            const data = await res.json();
            editor.chain().focus().setImage({ src: data.url }).run();
          }
        } catch (error) {
          console.error('Error uploading image:', error);
        }
      }
    };
    input.click();
  }, [editor]);

  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    // update link
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm flex flex-col group focus-within:ring-2 focus-within:ring-fin-mint/50 focus-within:border-fin-mint transition-all relative">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-zinc-200 dark:border-white/10 bg-white/50 dark:bg-black/20 backdrop-blur-sm sticky top-0 z-10 rounded-t-[inherit]">
        <div className="flex items-center gap-1 pr-2 border-r border-zinc-200 dark:border-white/10">
          <MenuButton 
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            disabled={isSourceMode}
            title="Negrito"
          >
            <Bold size={18} />
          </MenuButton>
          <MenuButton 
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            disabled={isSourceMode}
            title="Itálico"
          >
            <Italic size={18} />
          </MenuButton>
          <MenuButton 
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive('underline')}
            disabled={isSourceMode}
            title="Sublinhado"
          >
            <UnderlineIcon size={18} />
          </MenuButton>
          <MenuButton 
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive('strike')}
            disabled={isSourceMode}
            title="Riscado"
          >
            <Strikethrough size={18} />
          </MenuButton>
        </div>

        <div className="flex items-center gap-1 px-2 border-r border-zinc-200 dark:border-white/10">
          <MenuButton 
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive('heading', { level: 1 })}
            disabled={isSourceMode}
            title="Título 1"
          >
            <Heading1 size={18} />
          </MenuButton>
          <MenuButton 
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive('heading', { level: 2 })}
            disabled={isSourceMode}
            title="Título 2"
          >
            <Heading2 size={18} />
          </MenuButton>
          <MenuButton 
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive('heading', { level: 3 })}
            disabled={isSourceMode}
            title="Título 3"
          >
            <Heading3 size={18} />
          </MenuButton>
        </div>

        <div className="flex items-center gap-1 px-2 border-r border-zinc-200 dark:border-white/10">
          <MenuButton 
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            disabled={isSourceMode}
            title="Lista com Marcadores"
          >
            <List size={18} />
          </MenuButton>
          <MenuButton 
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            disabled={isSourceMode}
            title="Lista Numerada"
          >
            <ListOrdered size={18} />
          </MenuButton>
          <MenuButton 
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            disabled={isSourceMode}
            title="Citação"
          >
            <Quote size={18} />
          </MenuButton>
        </div>

        <div className="flex items-center gap-1 px-2 border-r border-zinc-200 dark:border-white/10">
          <MenuButton 
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            isActive={editor.isActive({ textAlign: 'left' })}
            disabled={isSourceMode}
            title="Alinhar à Esquerda"
          >
            <AlignLeft size={18} />
          </MenuButton>
          <MenuButton 
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            isActive={editor.isActive({ textAlign: 'center' })}
            disabled={isSourceMode}
            title="Alinhar ao Centro"
          >
            <AlignCenter size={18} />
          </MenuButton>
          <MenuButton 
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            isActive={editor.isActive({ textAlign: 'right' })}
            disabled={isSourceMode}
            title="Alinhar à Direita"
          >
            <AlignRight size={18} />
          </MenuButton>
        </div>

        <div className="flex items-center gap-1 px-2 border-r border-zinc-200 dark:border-white/10">
          <MenuButton onClick={setLink} isActive={editor.isActive('link')} disabled={isSourceMode} title="Adicionar Link">
            <LinkIcon size={18} />
          </MenuButton>
          <MenuButton onClick={addImage} disabled={isSourceMode} title="Inserir Imagem">
            <ImageIcon size={18} />
          </MenuButton>
          <MenuButton onClick={() => editor.chain().focus().setHorizontalRule().run()} disabled={isSourceMode} title="Linha Horizontal">
            <Minus size={18} />
          </MenuButton>
        </div>

        <div className="flex items-center gap-1 px-2 border-r border-zinc-200 dark:border-white/10">
          <MenuButton 
            onClick={() => setIsSourceMode(!isSourceMode)} 
            isActive={isSourceMode} 
            title={isSourceMode ? "Voltar ao Editor Visual" : "Ver Código Fonte (HTML)"}
          >
            <Code size={18} />
          </MenuButton>
        </div>

        <div className="flex items-center gap-1 px-2 ml-auto">
          <MenuButton 
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo() || isSourceMode}
            title="Desfazer"
          >
            <Undo size={18} />
          </MenuButton>
          <MenuButton 
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo() || isSourceMode}
            title="Refazer"
          >
            <Redo size={18} />
          </MenuButton>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar relative min-h-[300px]">
        {isSourceMode ? (
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full h-full min-h-[300px] p-6 bg-zinc-900 text-zinc-300 font-mono text-sm outline-none resize-none selection:bg-fin-mint/30"
                placeholder="Cole ou escreva seu código HTML aqui..."
            />
        ) : (
            <EditorContent editor={editor} className="h-full" />
        )}
      </div>

      {/* Stats / Help info */}
      <div className="px-4 py-2 border-t border-zinc-200 dark:border-white/10 bg-zinc-50/50 dark:bg-black/20 text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex justify-between items-center rounded-b-[inherit]">
        <span>{isSourceMode ? "Modo Código HTML Ativo" : "Rich Text Editor Ativo"}</span>
        <div className="flex gap-4">
            <span>{value?.length || 0} caracteres</span>
        </div>
      </div>
    </div>
  );
}
