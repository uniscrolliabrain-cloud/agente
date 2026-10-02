// UI_TEMPLATES_V1
import type { ViewSpec } from "../../view/spec.ts";
export default function ListTemplate({ spec }: { spec: ViewSpec }) {
  return <div className="space-y-2"><h2 className="text-lg font-semibold">{spec.title}</h2><ul className="divide-y rounded-xl border">{(spec.dataSource ?? []).map((d,i)=><li key={i} className="p-3 text-sm">{d.query}</li>)}</ul></div>;
}