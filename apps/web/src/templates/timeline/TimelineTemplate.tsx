import type { ViewSpec } from "../../view/spec.ts";
export default function TimelineTemplate({ spec }: { spec: ViewSpec }) {
  return <div class="space-y-3"><h2 class="font-semibold">{spec.title} — timeline</h2><div class="border-l-2 pl-4 space-y-3">{spec.dataSource.map((d,i)=><div key={i} class="text-sm"><div class="font-medium">{d.query}</div><div class="text-xs text-zinc-500">{d.tenantId}</div></div>)}</div></div>;
}