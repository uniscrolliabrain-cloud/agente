// ZENDESK_LIST_HEADER_V1

import { Search, Sparkles } from "lucide-react";
import TicketFilterPill from "./TicketFilterPill.tsx";
import TicketListActions from "./TicketListActions.tsx";
import type { TicketFilter } from "../types.ts";

interface Props {
  query: string;
  onSetQuery: (q: string) => void;
  activeFilter: TicketFilter;
  onSetFilter: (f: TicketFilter) => void;
  counts: { principal: number; prioridad: number; promos: number };
  total: number;
  pageStart: number;
  pageEnd: number;
}

export default function TicketListHeader({
  query,
  onSetQuery,
  activeFilter,
  onSetFilter,
  counts,
  total,
  pageStart,
  pageEnd,
}: Props) {
  return (
    <div className="shrink-0 border-b border-border-soft bg-bg-card">
      <div className="flex items-center gap-2 px-4 pt-4">
        <label className="relative block flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-3" />
          <input
            type="search"
            value={query}
            onChange={(e) => onSetQuery(e.target.value)}
            placeholder="Buscar tickets, clientes..."
            className="h-10 w-full rounded-xl border border-border bg-bg-soft pl-10 pr-3 text-sm text-text outline-none placeholder:text-text-3 focus-visible:border-purple"
          />
        </label>
        <button
          type="button"
          className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl border border-purple bg-purple-soft px-3 text-xs font-semibold text-purple"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Clasificar con IA
        </button>
        <button
          type="button"
          className="inline-flex h-10 shrink-0 items-center rounded-xl border border-border bg-bg-card px-3 text-xs font-medium text-text-2 hover:text-text"
        >
          Resumir bandeja
        </button>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto px-4 pt-3">
        <TicketFilterPill
          label="Principal"
          active={activeFilter === "principal"}
          onClick={() => onSetFilter("principal")}
        />
        <TicketFilterPill
          label="Prioridad IA"
          count={counts.prioridad}
          active={activeFilter === "prioridad"}
          onClick={() => onSetFilter("prioridad")}
        />
        <TicketFilterPill
          label="Promociones"
          count={counts.promos}
          active={activeFilter === "promos"}
          onClick={() => onSetFilter("promos")}
        />
      </div>

      <div className="pt-2">
        <TicketListActions
          total={total}
          pageStart={pageStart}
          pageEnd={pageEnd}
          onArchive={() => undefined}
          onPrev={() => undefined}
          onNext={() => undefined}
        />
      </div>
    </div>
  );
}