import { useState } from "react";
import { Plus, Sparkles, UserCog, X } from "lucide-react";
import type { AgentRole } from "../api/agents";
import { useAgents } from "../hooks/useAgents";

interface Props {
  enabled: boolean;
}

const EMPTY = { id: "", name: "", objetivo: "", sops: "", active: true };

// Los inputs del modal van con estilo inline como ProfileModal: index.css esta en la lista
// de ficheros compartidos y no se toca.
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 11px",
  border: "1px solid var(--border)",
  borderRadius: 8,
  background: "var(--surface)",
  color: "var(--text)",
  fontSize: 12.5,
  outline: "none",
  fontFamily: "inherit",
  resize: "vertical",
};

export default function AgentsView({ enabled }: Props) {
  const { agents, error, loading, create } = useAgents(enabled);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const submit = async () => {
    const id = draft.id.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "-");
    if (!id || !draft.name.trim()) {
      setFormError("El id y el nombre son obligatorios");
      return;
    }
    setBusy(true);
    setFormError(null);
    try {
      await create({
        id,
        name: draft.name.trim(),
        objetivo: draft.objetivo.trim(),
        sops: draft.sops.split(",").map((s) => s.trim()).filter(Boolean),
        active: draft.active,
      });
      setDraft(EMPTY);
      setOpen(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "No se pudo crear el agente");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="view-shell">
      <div className="view-header">
        <div>
          <h2>Agentes</h2>
          <span className="view-header-meta">
            {agents.length} rol{agents.length === 1 ? "" : "es"}
            {loading ? " Â· cargando" : ""}
          </span>
        </div>
        <button className="primary-btn" onClick={() => setOpen((v) => !v)}>
          <Plus size={14} style={{ verticalAlign: "middle", marginRight: 6 }} />
          Nuevo agente
        </button>
      </div>

      {error && <div className="chat-error" style={{ margin: 16 }}>{error}</div>}

      {open && (
        <div className="modal-overlay" onClick={() => setOpen(false)}>
          <div className="modal small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <div className="modal-title">Nuevo agente</div>
                <div className="modal-sub">Rol con su propio objetivo para el chat</div>
              </div>
              <button className="ghost-icon-button" onClick={() => setOpen(false)}>
                <X size={17} />
              </button>
            </div>
            <div className="modal-body">
              {formError && <div className="modal-error">{formError}</div>}
              <label className="modal-label">Id</label>
              <input
                style={inputStyle}
                value={draft.id}
                onChange={(e) => setDraft({ ...draft, id: e.target.value })}
                placeholder="comercial"
              />
              <label className="modal-label" style={{ marginTop: 14 }}>Nombre</label>
              <input
                style={inputStyle}
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="Agente comercial"
              />
              <label className="modal-label" style={{ marginTop: 14 }}>Objetivo</label>
              <textarea
                style={inputStyle}
                rows={3}
                value={draft.objetivo}
                onChange={(e) => setDraft({ ...draft, objetivo: e.target.value })}
                placeholder="Cerrar ventas y preparar propuestas, sin prometer entregas."
              />
              <label className="modal-label" style={{ marginTop: 14 }}>SOPs (por comas)</label>
              <input
                style={inputStyle}
                value={draft.sops}
                onChange={(e) => setDraft({ ...draft, sops: e.target.value })}
                placeholder="alta-cliente, propuesta"
              />
              <div className="control-row" style={{ marginTop: 16, gap: 8 }}>
                <input
                  type="checkbox"
                  checked={draft.active}
                  onChange={(e) => setDraft({ ...draft, active: e.target.checked })}
                />
                <span className="muted">Activo</span>
              </div>
              <div className="control-row" style={{ justifyContent: "flex-end", marginTop: 16 }}>
                <button className="ctrl-btn" onClick={() => setOpen(false)} disabled={busy}>
                  Cancelar
                </button>
                <button className="primary-btn" onClick={submit} disabled={busy}>
                  {busy ? "Guardando..." : "Crear"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="view-docs-grid">
        {agents.map((role: AgentRole) => (
          <div key={role.id} className="view-doc-card">
            <div className="view-doc-icon"><UserCog size={16} /></div>
            <div className="view-doc-body">
              <div className="view-doc-name" title={role.name}>{role.name}</div>
              <div className="view-doc-meta">{role.id}</div>
              {role.objetivo && <div className="view-doc-source">{role.objetivo}</div>}
              <div className="view-doc-meta">
                {role.sops.length > 0 ? `SOPs: ${role.sops.join(", ")}` : "Sin SOPs asignados"}
              </div>
            </div>
            <span className={`user-card-role ${role.active ? "admin" : "user"}`}>
              {role.active ? "activo" : "inactivo"}
            </span>
          </div>
        ))}
      </div>

      {agents.length === 0 && !loading && !error && (
        <div className="view-empty">
          <Sparkles size={22} />
          <p>AÃºn no hay agentes.</p>
          <small>Un rol define el objetivo que el agente sigue en el chat.</small>
        </div>
      )}
    </main>
  );
}
