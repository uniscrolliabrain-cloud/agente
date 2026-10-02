// UI_TEMPLATES_V1
import type { ViewSpec } from "../../view/spec.ts";
export default function DetailTemplate({ spec }: { spec: ViewSpec }) {
  return <div className="rounded-xl border p-4"><h2 className="font-semibold">{spec.title}</h2><dl className="mt-3 grid grid-cols-2 gap-2 text-sm">{(spec.columns ?? []).map(c=><div key={c.key}><dt className="text-zinc-500">{c.label}</dt><dd className="font-medium">—</dd></div>)}</dl></div>;
}