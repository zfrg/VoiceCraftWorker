import { defineConfig } from 'vite';
import plugin from '@vitejs/plugin-vue';

export default defineConfig({
    base: './',
    plugins: [plugin()],
    server: {
        port: 5173,
        proxy: {
            // 开发时把 /v1 请求转发到本地 wrangler dev (worker)
            '/v1': {
                target: 'http://localhost:8787',
                changeOrigin: true
            }
        }
    }
})
