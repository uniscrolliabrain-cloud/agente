// UI_TEMPLATES_V1
import type { ViewSpec } from "../../view/spec.ts";
export default function TableTemplate({ spec }: { spec: ViewSpec }) {
  return <div className="overflow-auto rounded-xl border"><div className="p-3 font-semibold">{spec.title} — tabla</div><table className="w-full text-sm"><thead><tr>{(spec.columns ?? []).map(c=><th key={c.key} className="text-left p-2 bg-zinc-50">{c.label}</th>)}</tr></thead><tbody><tr><td className="p-2 text-zinc-500" colSpan={(spec.columns ?? []).length}>conecta BusinessGraph para datos reales</td></tr></tbody></table></div>;
}