import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import type { Plugin } from "vite";
import { fileURLToPath, URL } from "node:url";
import { createRequire } from "node:module";
const requireWeb = createRequire(fileURLToPath(new URL("../web/package.json", import.meta.url)));
const tailwindcss = requireWeb("tailwindcss") as typeof import("tailwindcss");
const autoprefixer = requireWeb("autoprefixer") as typeof import("autoprefixer");
import webTailwindConfig from "../web/tailwind.config.js";
function versionManifest(): Plugin {
  return {
    name: "ui-lab-version-manifest",
    generateBundle() {
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
  publicDir:fileURLToPath(new URL("../web/public",import.meta.url)),
  server:{host:"0.0.0.0",port:5178,strictPort:true},
  build:{outDir:"dist",emptyOutDir:true},
  define:{"import.meta.env.VITE_UI_LAB":JSON.stringify("true")},
});
