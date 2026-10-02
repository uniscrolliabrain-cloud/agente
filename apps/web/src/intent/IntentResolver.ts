 // INTENT_RESOLVER_V1 - heuristic + LLM ready
 import type { Intent } from "./schema.ts";
 export class IntentResolver {
   resolve(raw: string): Intent {
     const l = raw.toLowerCase();
     let kind: Intent["kind"] = "query";
     if (l.startsWith("crea") || l.startsWith("alta") || l.includes("nuevo")) kind = "form";
     if (l.startsWith("ve") || l.startsWith("muestra") || l.includes("lista")) kind = "query";
     if (l.includes("cambia") || l.includes("actualiza")) kind = "action";
     return { raw, kind, confidence: 0.75 };
   }
 }