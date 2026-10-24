// ZENDESK_SIDEBAR_NAV_V1

import { Bot, Brain, CheckCircle2, FileText, Folder, Inbox, MessageSquare, Star, Users } from "lucide-react";
import type { SidebarNavEntry } from "../types.ts";

const ICONS = {
  chat: MessageSquare,
  tasks: CheckCircle2,
  documents: FileText,
  projects: Folder,
  knowledge: Brain,
  team: Users,
  agents: Bot,
  inbox: Inbox,
  starred: Star,
};

interface Props {
  entry: SidebarNavEntry;
  onSelect?: (id: string) => void;
}

export default function SidebarNavItem({ entry, onSelect }: Props) {
  const Icon = ICONS[entry.icon];
  const active = entry.active === true;
  const cls = active
    ? "bg-bg-card font-medium text-text shadow-sm"
    : "text-text-2 hover:bg-bg-card/60 hover:text-text";
  return (
    <button
      type="button"
      onClick={() => onSelect && onSelect(entry.id)}
      aria-current={active ? "page" : undefined}
      className={"flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm transition-colors " + cls}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="min-w-0 flex-1 truncate">{entry.label}</span>
      {entry.badge !== undefined && (
        <span className="rounded-full bg-bg-card px-1.5 py-0.5 text-[10px] font-semibold text-text-3">
          {entry.badge}
        </span>
      )}
    </button>
  );
}