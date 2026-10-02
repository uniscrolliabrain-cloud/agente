import type { ViewSpec } from "../../view/spec.ts";
export default function KanbanTemplate({ spec }: { spec: ViewSpec }) {
  return <div class="grid grid-cols-3 gap-3"><div class="col-span-3 font-semibold p-2">{spec.title} — kanban</div>{["Todo","Doing","Done"].map(s=><div key={s} class="rounded-xl border p-3 bg-zinc-50"><div class="text-xs font-semibold">{s}</div><div class="mt-2 text-xs text-zinc-500">{spec.dataSource[0]?.query}</div></div>)}</div>;
}