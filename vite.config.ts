import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Din egen backend
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
      // MCU API via proxy
      '/mcuapi': {
      target: 'https://mcuapi.vercel.app',
      changeOrigin: true,
      rewrite: path => path.replace(/^\/mcuapi/, '') // tar bort /mcuapi-prefixet
      },
    },
  },
});

