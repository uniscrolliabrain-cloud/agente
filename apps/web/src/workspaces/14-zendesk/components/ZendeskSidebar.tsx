// ZENDESK_SIDEBAR_V1

import { useState } from "react";
import WorkspaceBrand from "./WorkspaceBrand.tsx";
import AgentStatusPill from "./AgentStatusPill.tsx";
import NewTicketButton from "./NewTicketButton.tsx";
import SidebarSearch from "./SidebarSearch.tsx";
import SidebarSection from "./SidebarSection.tsx";
import SidebarNavItem from "./SidebarNavItem.tsx";
import type { SidebarNavEntry } from "../types.ts";

const WORKSPACE: SidebarNavEntry[] = [
  { id: "chat", label: "Chat", icon: "chat" },
  { id: "tasks", label: "Tareas", icon: "tasks", badge: 8 },
  { id: "documents", label: "Documentos", icon: "documents" },
  { id: "projects", label: "Proyectos", icon: "projects" },
  { id: "knowledge", label: "Lo que sabe de tu negocio", icon: "knowledge", active: true },
  { id: "team", label: "Equipo", icon: "team" },
  { id: "agents", label: "Agentes", icon: "agents", badge: 3 },
];

const EMAILS: SidebarNavEntry[] = [
  { id: "inbox", label: "Recibidos", icon: "inbox", badge: 124 },
  { id: "starred", label: "Destacados", icon: "starred", badge: 12 },
];

export default function ZendeskSidebar() {
  const [query, setQuery] = useState("");
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0">
        <WorkspaceBrand />
        <AgentStatusPill />
        <NewTicketButton />
        <SidebarSearch value={query} onChange={setQuery} />
      </div>
      <div className="zd-workspace__scroll">
        <SidebarSection label="Workspace">
          {WORKSPACE.map((entry) => (
            <SidebarNavItem key={entry.id} entry={entry} />
          ))}
        </SidebarSection>
        <SidebarSection label="Emails">
          {EMAILS.map((entry) => (
            <SidebarNavItem key={entry.id} entry={entry} />
          ))}
        </SidebarSection>
      </div>
    </div>
  );
}