// ZENDESK_WORKSPACE_V1

import "../ZendeskWorkspace.css";
import { useZendesk } from "../hooks/useZendesk.ts";
import ZendeskSidebar from "./ZendeskSidebar.tsx";
import TicketListPanel from "./TicketListPanel.tsx";
import TicketDetailPanel from "./TicketDetailPanel.tsx";

export default function ZendeskWorkspace() {
  const zd = useZendesk();

  return (
    <div className="zd-workspace">
      <div className="zd-workspace__col zd-workspace__col--sidebar">
        <ZendeskSidebar />
      </div>
      <div className="zd-workspace__col zd-workspace__col--list">
        <TicketListPanel
          tickets={zd.filteredTickets}
          activeFilter={zd.activeFilter}
          activeTicketId={zd.activeTicketId}
          selectedIds={zd.selectedIds}
          starredIds={zd.starredIds}
          query={zd.query}
          loading={zd.loading}
          error={zd.error}
          onSetFilter={zd.setFilter}
          onSetQuery={zd.setQuery}
          onSelect={zd.selectTicket}
          onToggleSelected={zd.toggleSelected}
          onToggleStar={zd.toggleStar}
        />
      </div>
      <div className="zd-workspace__col zd-workspace__col--detail">
        <TicketDetailPanel
          ticket={zd.activeTicket}
          coWrite={zd.coWrite}
          onGenerateReply={zd.generateReply}
          onToggleCoWrite={zd.toggleCoWrite}
          onSetCoWriteBody={zd.setCoWriteBody}
        />
      </div>
    </div>
  );
}