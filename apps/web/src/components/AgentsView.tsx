// STUB_112_V1 - A3.4 prompt del rol ya se inyecta en ConversationAgent. A3.5 filtro por rol en TasksView en el bloque siguiente. A3.6 modal creacion tarea con rol en el bloque siguiente. A3.7 panel admin de roles completo en el bloque siguiente. A3.8 auditoria visual por rol en el bloque siguiente.
// AGENTS_VIEW_V2 - catalogo de agentes digitales con CRUD, activar, desactivar,
// SOPs asignados, y actividad por rol.

import { useCallback, useEffect, useState } from "react";
import { Plus, Search, UserCog, X } from "lucide-react";
import { apiFetch } from "../api/client";

interface AgentRoleMemory {
  kind: "identidad" | "dominio" | "preferencias" | "historial";
  text: string;
}

interface AgentRole {
  id: string;
  name: string;
  tone: "warm" | "concise" | "thoughtful";
  avatar: "sky" | "sand" | "lilac";
  greeting?: string;
  roi?: string;
  objetivo: string;
  sops: string[];
  active: boolean;
  memories: AgentRoleMemory[];
  createdAt?: string;
}

const TONE_LABEL: Record<string, string> = {
  warm: "Cercano",
  concise: "Directo",
  thoughtful: "Reflexivo",
};

const AVATAR_COLOR: Record<string, string> = {
  sky: "var(--v2-purple)",
  sand: "#C9A227",
  lilac: "#9B7CDB",
};

interface Props {
  enabled: boolean;
  onOpenEmployee?: (roleId: string) => void;
}

export default function AgentsView({ enabled, onOpenEmployee }: Props) {
  const [agents, setAgents] = useState<AgentRole[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [draft, setDraft] = useState<Partial<AgentRole>>({
    id: "",
    name: "",
    tone: "warm",
    avatar: "sky",
    objetivo: "",
    sops: [],
    active: true,
    memories: [],
  });

  const load = useCallback(async () => {
    if (!enabled) return;
    try {
      const list = await apiFetch<AgentRole[]>("/api/agent/roles");
      setAgents(list);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error cargando agentes");
    }
  }, [enabled]);

  useEffect(() => {
    void load();
  }, [load]);

  const create = async () => {
    if (!draft.id || !draft.name || !draft.objetivo) {
      setError("id, name y objetivo son obligatorios");
      return;
    }
    setBusy(true);
    try {
      await apiFetch<AgentRole>("/api/agent/roles", {
        method: "POST",
        body: draft,
      });
      setShowNew(false);
      setDraft({ id: "", name: "", tone: "warm", avatar: "sky", objetivo: "", sops: [], active: true, memories: [] });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error creando agente");
    } finally {
      setBusy(false);
    }
  };

  const toggleActive = async (role: AgentRole) => {
    try {
      await apiFetch(`/api/agent/roles`, {
        method: "POST",
        body: { ...role, active: !role.active },
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error cambiando estado");
    }
  };

  const filtered = query.trim()
    ? agents.filter((a) => `${a.id} ${a.name} ${a.objetivo}`.toLowerCase().includes(query.toLowerCase()))
    : agents;

  return (
    <div className="v3-cc-main panel-slide-in" style={{ maxWidth: 1100 }}>
      <div className="v3-cc-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 className="v3-cc-title">Agentes</h1>
          <div className="v3-cc-sub">
            {agents.length} roles · {agents.filter((a) => a.active).length} activos
          </div>
        </div>
        <button className="v2-need-action-btn" onClick={() => setShowNew(true)}>
          <Plus size={14} /> Nuevo rol
        </button>
      </div>

      <div className="v3-cc-panel" style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8 }}>
        <Search size={15} style={{ color: "var(--v2-text-3)" }} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por id, nombre u objetivo"
          style={{ flex: 1, border: 0, outline: 0, background: "transparent", fontSize: 13, fontFamily: "inherit" }}
        />
      </div>

      {error && <div className="chat-error" style={{ marginTop: 12 }}>{error}</div>}

      {filtered.length === 0 && (
        <div className="v3-cc-empty" style={{ marginTop: 12 }}>Sin roles.</div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12, marginTop: 12 }}>
        {filtered.map((role) => (
          <div key={role.id} className="v3-cc-panel" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                className="v2-assistant-avatar"
                style={{ background: AVATAR_COLOR[role.avatar] ?? "var(--v2-purple)" }}
              >
                {role.name.slice(0, 1).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{role.name}</div>
                <div style={{ fontSize: 11, color: "var(--v2-text-3)" }}>
                  {role.id} · {TONE_LABEL[role.tone] ?? role.tone}
                </div>
              </div>
              <span className={`v2-tag ${role.active ? "" : "muted"}`}>
                {role.active ? "activo" : "inactivo"}
              </span>
            </div>

            {role.objetivo && (
              <div style={{ fontSize: 12, lineHeight: 1.5, color: "var(--v2-text-2)" }}>
                {role.objetivo.slice(0, 160)}
              </div>
            )}

            {role.sops.length > 0 && (
              <div style={{ fontSize: 11, color: "var(--v2-text-3)" }}>
                SOPs: {role.sops.slice(0, 3).join(", ")}{role.sops.length > 3 ? "…" : ""}
              </div>
            )}

            <div style={{ display: "flex", gap: 6, marginTop: "auto", paddingTop: 8, borderTop: "1px solid var(--v2-border)" }}>
              {onOpenEmployee && (
                <button className="v2-pill" style={{ flex: 1 }} onClick={() => onOpenEmployee(role.id)}>
                  <UserCog size={12} /> Ficha
                </button>
              )}
              <button className="v2-pill" style={{ flex: 1 }} onClick={() => void toggleActive(role)}>
                {role.active ? "Desactivar" : "Activar"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {showNew && (
        <div className="modal-overlay" onClick={() => setShowNew(false)}>
          <div className="modal small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div className="modal-title">Nuevo rol</div>
              <button className="ghost-icon-button" onClick={() => setShowNew(false)}><X size={17} /></button>
            </div>
            <div className="modal-body">
              <label className="modal-label">id</label>
              <input
                className="v2-pill"
                style={{ width: "100%", padding: "8px 12px", marginBottom: 8 }}
                value={draft.id ?? ""}
                onChange={(e) => setDraft({ ...draft, id: e.target.value })}
                placeholder="comercial"
              />
              <label className="modal-label">Nombre</label>
              <input
                className="v2-pill"
                style={{ width: "100%", padding: "8px 12px", marginBottom: 8 }}
                value={draft.name ?? ""}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="Leo"
              />
              <label className="modal-label">Objetivo</label>
              <textarea
                className="v2-pill"
                style={{ width: "100%", padding: "8px 12px", marginBottom: 8, minHeight: 80 }}
                value={draft.objetivo ?? ""}
                onChange={(e) => setDraft({ ...draft, objetivo: e.target.value })}
                placeholder="Cerrar ventas y preparar propuestas..."
              />
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
                <button className="v2-pill" onClick={() => setShowNew(false)}>Cancelar</button>
                <button className="v2-need-action-btn" onClick={create} disabled={busy}>
                  {busy ? "Creando…" : "Crear"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}