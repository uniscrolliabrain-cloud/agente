// ZENDESK_LIST_PANEL_V1

import TicketListHeader from "./TicketListHeader.tsx";
import TicketList from "./TicketList.tsx";
import type { TicketFilter, TicketId, ZendeskTicket } from "../types.ts";

interface Props {
  tickets: ZendeskTicket[];
  activeFilter: TicketFilter;
  activeTicketId: TicketId | null;
  selectedIds: Set<TicketId>;
  starredIds: Set<TicketId>;
  query: string;
  loading: boolean;
  error: string | null;
  onSetFilter: (f: TicketFilter) => void;
  onSetQuery: (q: string) => void;
  onSelect: (id: TicketId) => void;
  onToggleSelected: (id: TicketId) => void;
  onToggleStar: (id: TicketId) => void;
}

export default function TicketListPanel({
  tickets,
  activeFilter,
  activeTicketId,
  selectedIds,
  starredIds,
  query,
  loading,
  error,
  onSetFilter,
  onSetQuery,
  onSelect,
  onToggleSelected,
  onToggleStar,
}: Props) {
  const prioridad = tickets.filter((t) => t.priority === "high" || t.priority === "urgent").length;
  const promos = tickets.filter((t) => t.category === "Presupuesto").length;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <TicketListHeader
        query={query}
        onSetQuery={onSetQuery}
        activeFilter={activeFilter}
        onSetFilter={onSetFilter}
        counts={{ principal: tickets.length, prioridad, promos }}
        total={tickets.length}
        pageStart={1}
        pageEnd={Math.min(50, tickets.length)}
      />
      <div className="zd-workspace__scroll">
        {error && (
          <div className="m-4 rounded-lg border border-warn-border bg-warn px-3 py-2 text-xs text-warn-text">
            {error}
          </div>
        )}
        {loading ? (
          <div className="p-6 text-center text-xs text-text-3">Cargando...</div>
        ) : (
          <TicketList
            tickets={tickets}
            activeTicketId={activeTicketId}
            selectedIds={selectedIds}
            starredIds={starredIds}
            onSelect={onSelect}
            onToggleSelected={onToggleSelected}
            onToggleStar={onToggleStar}
          />
        )}
      </div>
    </div>
  );
}