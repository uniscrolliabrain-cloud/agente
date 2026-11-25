// BUG04_VITE_ALIAS_V1 - alias @agente/domain/* al paquete local.
import { readFileSync } from "node:fs";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

import { legalPages } from "./src/config/publicSite";

const allowedHosts = process.env.VITE_ALLOWED_HOSTS
  ? process.env.VITE_ALLOWED_HOSTS.split(",")
      .map((host) => host.trim())
      .filter(Boolean)
  : undefined;

function publicLegalPages(): Plugin {
  const files = new Set<string>(Object.values(legalPages));
  const read = (file: string) => readFileSync(new URL(`../site/${file}`, import.meta.url));

  return {
    name: "public-legal-pages",
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const file = request.url?.split("?")[0].slice(1);
        if (!file || !files.has(file)) return next();
        response.setHeader("Content-Type", "text/html; charset=utf-8");
        response.end(read(file));
      });
    },
    generateBundle() {
      files.forEach((file) => this.emitFile({ type: "asset", fileName: file, source: read(file) }));
    },
  };
}

export default defineConfig({
  plugins: [react(), publicLegalPages()],
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
    allowedHosts,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8787",
        changeOrigin: true,
      },
    },
  },
  preview: {
    // El preview de este chat se sirve por un hostname dinámico *.style.dev.
    // Solo se permite el host exacto que llega por entorno, nunca un comodín.
    allowedHosts,
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});