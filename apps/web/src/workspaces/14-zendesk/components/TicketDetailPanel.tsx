// ZENDESK_DETAIL_PANEL_V1

import { Inbox } from "lucide-react";
import CustomerHeader from "./CustomerHeader.tsx";
import CustomerQuickActions from "./CustomerQuickActions.tsx";
import TicketInsightCard from "./TicketInsightCard.tsx";
import CoWritePanel from "./CoWritePanel.tsx";
import EmptyState from "./EmptyState.tsx";
import type { CoWriteDraft, ZendeskTicket } from "../types.ts";

interface Props {
  ticket: ZendeskTicket | null;
  coWrite: CoWriteDraft | null;
  onGenerateReply: () => void;
  onToggleCoWrite: () => void;
  onSetCoWriteBody: (body: string) => void;
}

export default function TicketDetailPanel({
  ticket,
  coWrite,
  onGenerateReply,
  onToggleCoWrite,
  onSetCoWriteBody,
}: Props) {
  if (!ticket) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="zd-workspace__scroll">
          <EmptyState
            icon={<Inbox className="h-6 w-6" />}
            title="Sin ticket seleccionado"
            subtitle="Elige un ticket de la lista para ver el detalle."
          />
        </div>
      </div>
    );
  }

  const chips: string[] = [ticket.customer.companyType, ticket.category];
  if (ticket.isLead) chips.push("Lead IA");
  chips.push("LTV " + ticket.customer.ltv.toLocaleString("es-ES"));

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <CustomerHeader customer={ticket.customer} />
      <CustomerQuickActions />
      <div className="zd-workspace__scroll">
        {ticket.intelligence && <TicketInsightCard intelligence={ticket.intelligence} chips={chips} />}
        <CoWritePanel
          draft={coWrite}
          onGenerate={onGenerateReply}
          onToggle={onToggleCoWrite}
          onSetBody={onSetCoWriteBody}
        />
      </div>
    </div>
  );
}