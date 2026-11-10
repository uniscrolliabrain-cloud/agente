// BUG04_VITE_ALIAS_V1 - alias @agente/domain/* al paquete local.
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@agente/domain": fileURLToPath(new URL("../../packages/domain/src", import.meta.url)),
    },
  },
  server: {
    host: "127.0.0.1",
    port: 5173,
    // CLOUD_PREVIEW_HOST_V1 - el preview usa un hostname dinamico; se permite
    // solo el host exacto que llega por entorno, nunca un comodin.
    allowedHosts: process.env.VITE_ALLOWED_HOSTS
      ? process.env.VITE_ALLOWED_HOSTS.split(",")
          .map((host) => host.trim())
          .filter(Boolean)
      : undefined,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8787",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});