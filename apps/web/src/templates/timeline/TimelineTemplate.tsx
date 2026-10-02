// UI_TEMPLATES_V1
import type { ViewSpec } from "../../view/spec.ts";
export default function TimelineTemplate({ spec }: { spec: ViewSpec }) {
  return <div className="space-y-3"><h2 className="font-semibold">{spec.title} — timeline</h2><div className="border-l-2 pl-4 space-y-3">{(spec.dataSource ?? []).map((d,i)=><div key={i} className="text-sm"><div className="font-medium">{d.query}</div><div className="text-xs text-zinc-500">{d.tenantId}</div></div>)}</div></div>;
}