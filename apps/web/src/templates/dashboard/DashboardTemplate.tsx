import type { ViewSpec } from "../../view/spec.ts";
export default function DashboardTemplate({ spec }: { spec: ViewSpec }) {
  return <div class="rounded-xl border p-4"><h2 class="font-semibold">{spec.title} — dashboard</h2><div class="grid grid-cols-3 gap-3 mt-3">{spec.columns.map(c=><div key={c.key} class="rounded-lg bg-zinc-50 p-3"><div class="text-xs text-zinc-500">{c.label}</div><div class="text-lg font-bold">—</div></div>)}</div></div>;
}