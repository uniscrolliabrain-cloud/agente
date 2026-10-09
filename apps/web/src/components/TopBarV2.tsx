// B1_TOPBAR_V1
import { useState } from "react"; // CHAT_OPEN_AGENT_BUTTON_V1
import { Bot, Plus, Search } from "lucide-react"; // CHAT_OPEN_AGENT_BUTTON_V1
import { useAgentWindow } from "../contexts/AgentWindowContext"; // CHAT_OPEN_AGENT_BUTTON_V1
import { useAgentPersonas } from "../hooks/useAgentPersonas"; // CHAT_OPEN_AGENT_BUTTON_V1
import NotificationsDropdown from "./NotificationsDropdown";

interface Props {
  status: "ok" | "working" | "offline";
  statusLabel: string;
  onNewChat: () => void;
  onOpenPalette: () => void;
}

// CHAT_OPEN_AGENT_BUTTON_V1 - boton que lista los agentes y abre su ventana.
function AgentPickerButton() {
  const [open, setOpen] = useState(false);
  const { open: openAgent } = useAgentWindow();
  const { personas, loading } = useAgentPersonas(true);
  return (
    <div style={{ position: "relative" }}>
      <button className="v2-search-pill" onClick={() => setOpen((v) => !v)} type="button">
        <Bot size={14} />
        Agentes
      </button>
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            minWidth: 220,
            maxHeight: 360,
            overflowY: "auto",
            background: "var(--v2-surface, #fff)",
            border: "1px solid var(--v2-border, #eee)",
            borderRadius: 10,
            boxShadow: "0 8px 24px rgba(0,0,0,.12)",
            zIndex: 200,
            padding: 6,
          }}
        >
          {loading && personas.length === 0 && (
            <div style={{ padding: 8, fontSize: 12, opacity: 0.6 }}>Cargando…</div>
          )}
          {personas.map((p) => (
            <button
              key={p.personaId}
              type="button"
              onClick={() => {
                openAgent(p.personaId);
                setOpen(false);
              }}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "8px 10px",
                background: "transparent",
                border: 0,
                borderRadius: 6,
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              {p.displayName}
              <span style={{ opacity: 0.5, marginLeft: 6, fontSize: 11 }}>{p.role}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TopBarV2({ status, statusLabel, onNewChat, onOpenPalette }: Props) {
  const dotColor =
    status === "working" ? "var(--v2-purple)" : status === "ok" ? "var(--v2-green)" : "var(--v2-text-3)";

  return (
    <div className="v2-topbar">
      <div className="v2-topbar-left">
        <span className="v2-status-pill">
          <span style={{ width: 8, height: 8, borderRadius: 999, background: dotColor }} />
          MI Â· {statusLabel}
        </span>
      </div>
      <div className="v2-topbar-right">
        <AgentPickerButton />
        <NotificationsDropdown />
        <button className="v2-search-pill" onClick={onOpenPalette}>
          <Search size={14} />
          Buscar
          <span className="v2-search-kbd">âŒ˜K</span>
        </button>
        <button className="v2-btn-new" onClick={onNewChat}>
          <Plus size={16} />
          Nuevo chat
        </button>
      </div>
    </div>
  );
}