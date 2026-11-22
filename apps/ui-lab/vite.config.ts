import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";
export default defineConfig({
  plugins:[react()],
  resolve:{alias:{"@agente/domain":fileURLToPath(new URL("../../packages/domain/src",import.meta.url))}},
  server:{host:"0.0.0.0",port:5178,strictPort:true},
  build:{outDir:"dist",emptyOutDir:true},
  define:{"import.meta.env.VITE_UI_LAB":JSON.stringify("true")},
});
