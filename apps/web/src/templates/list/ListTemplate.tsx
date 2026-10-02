import type { ViewSpec } from "../../view/spec.ts";
export default function ListTemplate({ spec }: { spec: ViewSpec }) {
  return <div class="space-y-2"><h2 class="text-lg font-semibold">{spec.title}</h2><ul class="divide-y rounded-xl border">{spec.dataSource.map((d,i)=><li key={i} class="p-3 text-sm">{d.query}</li>)}</ul></div>;
}