// ZENDESK_TICKET_LIST_V1

import { Inbox } from "lucide-react";
import TicketListItem from "./TicketListItem.tsx";
import EmptyState from "./EmptyState.tsx";
import type { TicketId, ZendeskTicket } from "../types.ts";

interface Props {
  tickets: ZendeskTicket[];
  activeTicketId: TicketId | null;
  selectedIds: Set<TicketId>;
  starredIds: Set<TicketId>;
  onSelect: (id: TicketId) => void;
  onToggleSelected: (id: TicketId) => void;
  onToggleStar: (id: TicketId) => void;
}

export default function TicketList({ tickets, activeTicketId, selectedIds, starredIds, onSelect, onToggleSelected, onToggleStar }: Props) {
  if (tickets.length === 0) {
    return (
      <EmptyState
        icon={<Inbox className="h-6 w-6" />}
        title="No hay tickets"
        subtitle="Prueba a cambiar el filtro o el termino de busqueda."
      />
    );
  }
  return (
    <div className="flex flex-col">
      {tickets.map((t) => (
        <TicketListItem
          key={t.id}
          ticket={t}
          active={t.id === activeTicketId}
          selected={selectedIds.has(t.id)}
          starred={starredIds.has(t.id)}
          onSelect={() => onSelect(t.id)}
          onToggleSelected={() => onToggleSelected(t.id)}
          onToggleStar={() => onToggleStar(t.id)}
        />
      ))}
    </div>
  );
}