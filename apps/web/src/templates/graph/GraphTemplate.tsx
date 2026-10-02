import type { ViewSpec } from "../../view/spec.ts";
export default function GraphTemplate({ spec }: { spec: ViewSpec }) {
  return <div class="rounded-xl border p-4"><h2 class="font-semibold">{spec.title} — graph</h2><div class="mt-3 h-40 bg-zinc-100 rounded flex items-center justify-center text-xs">graph entities: {spec.dataSource[0]?.query}</div></div>;
}