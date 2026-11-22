import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import type { Plugin } from "vite";
import { fileURLToPath, URL } from "node:url";
function versionManifest(): Plugin {
  return {
    name: "ui-lab-version-manifest",
    generateBundle() {
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
  resolve:{alias:{"@agente/domain":fileURLToPath(new URL("../../packages/domain/src",import.meta.url))}},
  publicDir:fileURLToPath(new URL("../web/public",import.meta.url)),
  server:{host:"0.0.0.0",port:5178,strictPort:true},
  build:{outDir:"dist",emptyOutDir:true},
  define:{"import.meta.env.VITE_UI_LAB":JSON.stringify("true")},
});
