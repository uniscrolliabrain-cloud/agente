import type { ViewSpec } from "../../view/spec.ts";
export default function TableTemplate({ spec }: { spec: ViewSpec }) {
  return <div class="overflow-auto rounded-xl border"><div class="p-3 font-semibold">{spec.title} — tabla</div><table class="w-full text-sm"><thead><tr>{spec.columns.map(c=><th key={c.key} class="text-left p-2 bg-zinc-50">{c.label}</th>)}</tr></thead><tbody><tr><td class="p-2 text-zinc-500" colSpan={spec.columns.length}>conecta BusinessGraph para datos reales</td></tr></tbody></table></div>;
}