import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Proxy /api/* vers le backend Flask (http://localhost:5000) pendant le dev,
// pour eviter tout probleme CORS et pouvoir simplement fetch("/api/...").
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
      "/static": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
