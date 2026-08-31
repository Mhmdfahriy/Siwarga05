import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [
        laravel({
            input: 'frontend/app.jsx',
            refresh: ['frontend/**', 'routes/**'],
        }),
        react(),
        tailwindcss(),
    ],
    resolve: {
        alias: {
            '@': '/frontend',
        },
    },

    
});