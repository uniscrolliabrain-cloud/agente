// UI_TEMPLATES_V1
import type { ViewSpec } from "../../view/spec.ts";
export default function DashboardTemplate({ spec }: { spec: ViewSpec }) {
  return <div className="rounded-xl border p-4"><h2 className="font-semibold">{spec.title} — dashboard</h2><div className="grid grid-cols-3 gap-3 mt-3">{(spec.columns ?? []).map(c=><div key={c.key} className="rounded-lg bg-zinc-50 p-3"><div className="text-xs text-zinc-500">{c.label}</div><div className="text-lg font-bold">—</div></div>)}</div></div>;
}