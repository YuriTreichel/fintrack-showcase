import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [
        tailwindcss(),
        laravel({
            input: ['resources/css/app.css', 'resources/js/main.jsx'],
            refresh: true,
        }),
        react(),
    ],
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    // Charts — só usados no dashboard interno
                    if (id.includes('recharts') || id.includes('d3-')) {
                        return 'vendor-charts';
                    }
                    // Editor de texto — só usado no blog admin
                    if (id.includes('@tiptap')) {
                        return 'vendor-editor';
                    }
                    // Animações — carregadas em múltiplas rotas mas não no bundle inicial da landing
                    if (id.includes('framer-motion') || id.includes('motion')) {
                        return 'vendor-motion';
                    }
                    // Date utils
                    if (id.includes('date-fns')) {
                        return 'vendor-dates';
                    }
                    // React core — sempre necessário
                    if (id.includes('react-dom') || id.includes('react-router')) {
                        return 'vendor-react';
                    }
                    // Ícones — tree-shaken pelo Vite mas melhor isolar
                    if (id.includes('lucide-react')) {
                        return 'vendor-icons';
                    }
                },
            },
        },
    },
});