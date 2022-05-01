import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
// import { VitePWA } from "vite-plugin-pwa";
export default defineConfig({
  plugins: [
    react(),
    //  VitePWA({})
  ],
  server: {
    open: true,
  },
  build: {
    minify: true,
  },
});

// 1. 天眼查 改动
//   小区
//     信息 图片
//     2手房 的前3个
//       详情信息全部 和图片
//       核心之类

// 2. 房产
//   58
//     城市 搜索到路
//     前3个
//     全爬

// 1.
