import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': resolve('./src'),
            '@/components': resolve('./src/components'),
            '@/hooks': resolve('./src/hooks'),
            '@/services': resolve('./src/services'),
            '@/store': resolve('./src/store'),
            '@/types': resolve('./src/types'),
            '@/utils': resolve('./src/utils'),
            '@/validations': resolve('./src/validations'),
            '@/context': resolve('./src/context'),
        },
    },
    server: {
        port: 3000,
        proxy: {
            '/api': {
                target: 'http://localhost:5000',
                changeOrigin: true,
                secure: false,
            }
        }
    }
});
