// UI_TEMPLATES_V1
import type { ViewSpec } from "../../view/spec.ts";
export default function KanbanTemplate({ spec }: { spec: ViewSpec }) {
  return <div className="grid grid-cols-3 gap-3"><div className="col-span-3 font-semibold p-2">{spec.title} — kanban</div>{["Todo","Doing","Done"].map(s=><div key={s} className="rounded-xl border p-3 bg-zinc-50"><div className="text-xs font-semibold">{s}</div><div className="mt-2 text-xs text-zinc-500">{spec.dataSource[0]?.query}</div></div>)}</div>;
}