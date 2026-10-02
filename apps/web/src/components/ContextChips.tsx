 // CONTEXT_CHIPS_V1 - auto.alta/media/sugerido/tu
 export type ChipKind = "auto" | "alta" | "media" | "sugerido" | "tu";
 export interface ContextChip { id: string; label: string; kind: ChipKind; score?: number; }
 export default function ContextChips({ chips }: { chips: ContextChip[] }) {
   if (!chips?.length) return null;
   return <div className="flex flex-wrap gap-2">{chips.map(c=><span key={c.id} className={`px-2 py-1 rounded-full text-xs border ${c.kind==="alta"?"bg-green-50 border-green-200":c.kind==="tu"?"bg-blue-50 border-blue-200":"bg-zinc-50 border-zinc-200"}`}>{c.label}</span>)}</div>;
 }