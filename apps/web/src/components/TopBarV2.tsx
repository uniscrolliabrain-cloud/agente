import { Plus, Search } from "lucide-react";
import NotificationsDropdown from "./NotificationsDropdown";

interface Props {
  status: "ok" | "working" | "offline";
  statusLabel: string;
  onNewChat: () => void;
  onOpenPalette: () => void;
}

export default function TopBarV2({ status, statusLabel, onNewChat, onOpenPalette }: Props) {
  const dotColor =
    status === "working" ? "var(--v2-purple)" : status === "ok" ? "var(--v2-green)" : "var(--v2-text-3)";

  return (
    <div className="v2-topbar">
      <div className="v2-topbar-left">
        <span className="v2-status-pill">
          <span style={{ width: 8, height: 8, borderRadius: 999, background: dotColor }} />
          MI · {statusLabel}
        </span>
      </div>
      <div className="v2-topbar-right">
        <NotificationsDropdown />
        <button className="v2-search-pill" onClick={onOpenPalette}>
          <Search size={14} />
          Buscar
          <span className="v2-search-kbd">⌘K</span>
        </button>
        <button className="v2-btn-new" onClick={onNewChat}>
          <Plus size={16} />
          Nuevo chat
        </button>
      </div>
    </div>
  );
}