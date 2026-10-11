// ZENDESK_TICKET_ITEM_V1

import { Star } from "lucide-react";
import TicketAvatar from "./TicketAvatar.tsx";
import LeadBadge from "./LeadBadge.tsx";
import TicketChips from "./TicketChips.tsx";
import { formatTicketDate } from "../format.ts";
import type { ZendeskTicket } from "../types.ts";

interface Props {
  ticket: ZendeskTicket;
  active: boolean;
  selected: boolean;
  starred: boolean;
  onSelect: () => void;
  onToggleSelected: () => void;
  onToggleStar: () => void;
}

export default function TicketListItem({ ticket, active, selected, starred, onSelect, onToggleSelected, onToggleStar }: Props) {
  const articleCls = active ? "bg-bg-soft" : "hover:bg-bg-soft/60";
  const starCls = starred ? "fill-warn-text text-warn-text" : "text-text-3";
  const insights = ticket.intelligence ? ticket.intelligence.insights : [];
  return (
    <article
      onClick={onSelect}
      className={"group cursor-pointer border-b border-border-soft px-4 py-3 transition-colors " + articleCls}
    >
      <div className="flex items-start gap-3">
        <div className="flex shrink-0 flex-col items-center gap-1.5 pt-0.5">
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggleSelected}
            onClick={(e) => e.stopPropagation()}
            className="h-3.5 w-3.5 cursor-pointer rounded border-border"
            aria-label="Seleccionar ticket"
          />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleStar();
            }}
            aria-label={starred ? "Quitar destacado" : "Destacar"}
            className="grid h-4 w-4 place-items-center"
          >
            <Star className={"h-3.5 w-3.5 " + starCls} />
          </button>
        </div>

        <TicketAvatar customer={ticket.customer} size={36} />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-sm font-semibold text-text">{ticket.customer.name}</span>
            <span className="truncate text-xs text-text-3">{ticket.customer.company}</span>
            <span className="ml-1 inline-flex shrink-0 items-center rounded-md border border-border bg-bg-soft px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-text-2">
              {ticket.customer.companyType}
            </span>
            <span className="inline-flex shrink-0 items-center rounded-md border border-border bg-bg-card px-1.5 py-0.5 text-[9px] font-bold text-text-2">
              {ticket.category}
            </span>
            {ticket.isLead && (
              <span className="ml-1 shrink-0">
                <LeadBadge />
              </span>
            )}
            <span className="ml-auto shrink-0 text-[11px] text-text-3">
              {formatTicketDate(ticket.updatedAt)}
            </span>
          </div>

          <p className="mt-1 truncate text-sm font-medium text-text">{ticket.subject}</p>
          <p className="mt-0.5 truncate text-xs text-text-2">{ticket.preview}</p>

          {insights.length > 0 && (
            <div className="mt-1.5">
              <TicketChips insights={insights} />
            </div>
          )}
        </div>
      </div>
    </article>
  );
}