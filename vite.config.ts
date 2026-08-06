import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// 前端由 Vite 单独构建（产物 dist/），Worker 是独立的源码文件（worker/index.js），
// 由根目录 wrangler.json 直接引用，不进构建产物目录。
// 本地开发：vite dev 跑前端（5173），wrangler dev 跑 Worker（8787），/v1 代理转发。
export default defineConfig({
    base: './',
    plugins: [
        vue()
    ],
    server: {
        port: 5173,
        proxy: {
            '/v1': {
                target: 'http://localhost:8787',
                changeOrigin: true
            }
        }
    }
})