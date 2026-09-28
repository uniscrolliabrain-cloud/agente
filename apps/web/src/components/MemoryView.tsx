import { useMemo, useState } from "react";
import { Brain, Pencil, Search, Trash2, X } from "lucide-react";
import { apiFetch } from "../api/client";
import type { MemoryEntry } from "../hooks/useWorkspaceData";

interface Props {
  memories: MemoryEntry[];
}

const CATEGORIES = ["empresa", "cliente", "proceso", "preferencia", "rrhh", "producto", "otro"] as const;
type Category = (typeof CATEGORIES)[number];

interface MemoryDetail extends MemoryEntry {
  category?: Category | null;
  tags?: string[] | null;
}

function relativeTime(iso?: string): string {
  if (!iso) return "";
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 60000) return "ahora";
  if (ms < 3600000) return `${Math.floor(ms / 60000)}m`;
  if (ms < 86400000) return `${Math.floor(ms / 3600000)}h`;
  return `${Math.floor(ms / 86400000)}d`;
}

export default function MemoryView({ memories }: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | "todas">("todas");
  const [editing, setEditing] = useState<MemoryDetail | null>(null);
  const [editText, setEditText] = useState("");
  const [editCategory, setEditCategory] = useState<Category | "">("");
  const [editTags, setEditTags] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (memories as MemoryDetail[]).filter((m) => {
      if (category !== "todas" && m.category !== category) return false;
      if (!q) return true;
      const haystack = `${m.text} ${(m.tags ?? []).join(" ")} ${m.source ?? ""}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [memories, query, category]);

  const openEdit = (m: MemoryDetail) => {
    setEditing(m);
    setEditText(m.text);
    setEditCategory((m.category as Category) ?? "");
    setEditTags((m.tags ?? []).join(", "));
    setError(null);
  };

  const saveEdit = async () => {
    if (!editing) return;
    setBusy(true);
    setError(null);
    try {
      await apiFetch(`/api/agent/memories/${encodeURIComponent(editing.id)}`, {
        method: "POST",
        body: { text: editText.trim(), source: editing.source ?? "You" },
      });
      setEditing(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setBusy(false);
    }
  };

  const forget = async (m: MemoryDetail) => {
    if (!confirm(`Borrar la memoria "${m.text.slice(0, 60)}..."?`)) return;
    setBusy(true);
    setError(null);
    try {
      await apiFetch(`/api/agent/memories/${encodeURIComponent(m.id)}/forget`, { method: "POST", body: {} });
      setEditing(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al borrar");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="view-shell">
      <div className="view-header">
        <h2>Lo que sabe de tu negocio</h2>
        <span className="view-header-meta">{items.length} de {memories.length} entradas</span>
      </div>

      <div className="rag-search">
        <div className="rag-search-row">
          <Search size={15} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar en la memoria"
          />
        </div>
        <div className="memory-categories">
          <button
            className={`ctrl-btn ${category === "todas" ? "active" : ""}`}
            onClick={() => setCategory("todas")}
          >Todas</button>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              className={`ctrl-btn ${category === c ? "active" : ""}`}
              onClick={() => setCategory(c)}
            >{c}</button>
          ))}
        </div>
      </div>

      {error && <div className="chat-error">{error}</div>}

      {memories.length === 0 ? (
        <div className="view-empty">
          <Brain size={22} />
          <p>El agente aun no ha aprendido nada.</p>
          <small>Cuando termines tareas con SOPs, se guardaran recuerdos aqui.</small>
        </div>
      ) : items.length === 0 ? (
        <div className="view-empty">
          <Search size={22} />
          <p>Ninguna entrada coincide con el filtro.</p>
        </div>
      ) : (
        <div className="view-memory-list">
          {items.map((m) => (
            <div key={m.id} className="view-memory-card">
              <div className="view-memory-text">{m.text}</div>
              {m.category && <span className="view-memory-cat">{m.category}</span>}
              {m.tags && m.tags.length > 0 && (
                <div className="view-memory-tags">
                  {m.tags.map((t) => <span key={t} className="view-memory-tag">{t}</span>)}
                </div>
              )}
              <div className="view-memory-meta">
                {m.source && <span className="view-memory-source">{m.source}</span>}
                {m.createdAt && <span className="view-memory-time">{relativeTime(m.createdAt)}</span>}
                <span className="view-memory-actions">
                  <button className="ghost-icon-button" title="Editar" onClick={() => openEdit(m)}>
                    <Pencil size={12} />
                  </button>
                  <button className="ghost-icon-button" title="Olvidar" onClick={() => void forget(m)}>
                    <Trash2 size={12} />
                  </button>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div className="modal small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <div className="modal-title">Editar memoria</div>
                <div className="modal-sub">Lo que el agente recordara</div>
              </div>
              <button className="ghost-icon-button" onClick={() => setEditing(null)}><X size={17} /></button>
            </div>
            <div className="modal-body">
              <label className="modal-label">Texto</label>
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={4}
                style={{ width: "100%", padding: "9px 11px", border: "1px solid var(--border)", borderRadius: 8, background: "var(--surface)", color: "var(--text)", fontSize: 12.5, fontFamily: "inherit", resize: "vertical" }}
              />
              <label className="modal-label" style={{ marginTop: 14 }}>Categoria</label>
              <select
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value as Category | "")}
                style={{ width: "100%", padding: "9px 11px", border: "1px solid var(--border)", borderRadius: 8, background: "var(--surface)", color: "var(--text)", fontSize: 12.5 }}
              >
                <option value="">(sin categoria)</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <label className="modal-label" style={{ marginTop: 14 }}>Tags (separados por coma)</label>
              <input
                type="text"
                value={editTags}
                onChange={(e) => setEditTags(e.target.value)}
                style={{ width: "100%", padding: "9px 11px", border: "1px solid var(--border)", borderRadius: 8, background: "var(--surface)", color: "var(--text)", fontSize: 12.5 }}
              />
              <div className="control-row" style={{ justifyContent: "flex-end", marginTop: 16 }}>
                <button className="ctrl-btn" onClick={() => setEditing(null)} disabled={busy}>Cerrar</button>
                <button className="primary-btn" onClick={saveEdit} disabled={busy || !editText.trim()}>
                  {busy ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
