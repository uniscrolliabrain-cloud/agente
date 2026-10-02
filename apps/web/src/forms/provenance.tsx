 import type { ProvenanceKind } from "./spec.ts";
 export function provenanceColor(k: ProvenanceKind) {
   if (k==="alta") return "text-green-700";
   if (k==="tu") return "text-blue-700";
   return "text-zinc-500";
 }
 export function ProvenanceBadge({ kind }: { kind: ProvenanceKind }) {
   return <span className={`text- uppercase tracking-wide ${provenanceColor(kind)}`}>{kind}</span>;
 }