import type { ViewSpec } from "../../view/spec.ts";
export default function DetailTemplate({ spec }: { spec: ViewSpec }) {
  return <div class="rounded-xl border p-4"><h2 class="font-semibold">{spec.title}</h2><dl class="mt-3 grid grid-cols-2 gap-2 text-sm">{spec.columns.map(c=><div key={c.key}><dt class="text-zinc-500">{c.label}</dt><dd class="font-medium">—</dd></div>)}</dl></div>;
}