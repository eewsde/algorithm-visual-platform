import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  // 默认按根路径部署（"/"），适合 Vercel / 自有服务器 / 自定义域名
  // GitHub Pages 子路径部署时，由 CI 通过环境变量 VITE_BASE_PATH 注入，例如：
  // VITE_BASE_PATH=/repo-name/ pnpm build
  base: process.env.VITE_BASE_PATH || "/",
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React 核心库
          "vendor-react": ["react", "react-dom", "react-router-dom"],

          // 状态管理
          "vendor-store": ["zustand"],

          // 动画库
          "vendor-animation": ["framer-motion", "gsap"],

          // 图标库（轻量）
          "vendor-icons": ["lucide-react"],

          // 代码高亮库（较大，单独分包）
          "vendor-highlighter": ["react-syntax-highlighter"],
        },
      },
    },
    // 调整 chunk 大小警告限制
    chunkSizeWarningLimit: 650,
  },
});
