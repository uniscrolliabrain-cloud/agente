import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import type { Plugin } from "vite";
import { fileURLToPath, URL } from "node:url";
import { createRequire } from "node:module";
import { readdirSync, readFileSync } from "node:fs";
const requireWeb = createRequire(fileURLToPath(new URL("../web/package.json", import.meta.url)));
const tailwindcss = requireWeb("tailwindcss");
const autoprefixer = requireWeb("autoprefixer");
import webTailwindConfig from "../web/tailwind.config.js";
function versionManifest(): Plugin {
  return {
    name: "ui-lab-version-manifest",
    generateBundle() {
      const publicFile = (path: string) => fileURLToPath(new URL(`./public/${path}`, import.meta.url));
      const emitDir = (dir: string, keep: (name: string) => boolean) => {
        for (const name of readdirSync(publicFile(`${dir}/`))) {
          if (keep(name)) {
            this.emitFile({ type: "asset", fileName: `${dir}/${name}`, source: readFileSync(publicFile(`${dir}/${name}`)) });
          }
        }
      };
      // UI Lab serves shared web/public by default; emit its own artwork explicitly.
      const webp = (name: string) => name.endsWith(".webp");
      emitDir("landing", () => true);
      emitDir("formation/images", (name) => webp(name) || name === "assets-manifest.json");
      emitDir("cartera", webp);
      emitDir("automation-nodes", webp);
      emitDir("analytics", webp);
      this.emitFile({ type: "asset", fileName: "robots.txt", source: "User-agent: *\\nDisallow: /\\n" });
      this.emitFile({ type: "asset", fileName: "_headers", source: "/*\\n  X-Robots-Tag: noindex, nofollow\\n  Referrer-Policy: no-referrer\\n  X-Content-Type-Options: nosniff\\n" });
      this.emitFile({
        type: "asset",
        fileName: "version.json",
        source: JSON.stringify({
          version: process.env.UI_LAB_BUILD_SHA || process.env.VERCEL_GIT_COMMIT_SHA || "local",
          builtAt: new Date().toISOString(),
        }),
      });
    },
  };
}
export default defineConfig({
  plugins:[react(),versionManifest()],
  css: { postcss: { plugins: [tailwindcss({ ...webTailwindConfig, content: [fileURLToPath(new URL("../web/src/**/*.{ts,tsx,js,jsx}", import.meta.url)), fileURLToPath(new URL("./src/**/*.{ts,tsx,js,jsx}", import.meta.url))] }), autoprefixer()] } },
  resolve:{alias:{"@agente/domain":fileURLToPath(new URL("../../packages/domain/src",import.meta.url))}},
  // GitHub Pages sirve el proyecto en /agente/; el workflow pasa UI_LAB_BASE.
  base:process.env.UI_LAB_BASE||"/",
  publicDir:fileURLToPath(new URL("../web/public",import.meta.url)),
  // Vite 5.4 no lee el env var estándar de hosts permitidos: la allowlist llega
  // por proceso (p. ej. el hostname de preview del entorno) sin fijarla en el repo.
  server:{host:"0.0.0.0",port:5178,strictPort:true,allowedHosts:process.env.UI_LAB_ALLOWED_HOSTS?process.env.UI_LAB_ALLOWED_HOSTS.split(","):undefined},
  // Un solo CSS: evita la precarga dinámica por chunk, que deja la vista en error
  // si el navegador rechaza esa hoja (visto en CI) y no aporta nada aquí.
  // index.html = laboratorio; full-app.html = clon navegable de la app real con
  // datos sintéticos (lo que publica GitHub Pages antes de un deploy real).
  build:{outDir:"dist",emptyOutDir:true,cssCodeSplit:false,rollupOptions:{input:{lab:fileURLToPath(new URL("./index.html",import.meta.url)),fullApp:fileURLToPath(new URL("./full-app.html",import.meta.url))}}},
  define:{"import.meta.env.VITE_UI_LAB":JSON.stringify("true")},
});
