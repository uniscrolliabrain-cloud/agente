// ZENDESK_BRAND_V1

import { MoreHorizontal } from "lucide-react";

export default function WorkspaceBrand() {
  return (
    <div className="flex items-center gap-2.5 px-4 pb-2 pt-4">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-text text-[11px] font-bold text-white">A</span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-text">Agente IA Pro</div>
        <div className="inline-flex items-center rounded-md bg-purple-soft px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-purple">PRO</div>
      </div>
      <button type="button" aria-label="Mas opciones" className="grid h-7 w-7 place-items-center rounded-lg text-text-3 hover:bg-bg-soft hover:text-text">
        <MoreHorizontal className="h-4 w-4" />
      </button>
    </div>
  );
}