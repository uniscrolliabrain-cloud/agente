// UI_PANEL_SLIDE_V1_USE
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
        body: {
          text: editText.trim(),
          source: editing.source ?? "You",
          ...(editCategory ? { category: editCategory } : {}),
          ...(editTags.trim()
            ? { tags: editTags.split(",").map((t) => t.trim()).filter(Boolean) }
            : {}),
        },
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
    <div className="v2-tasks-view" style={{ maxWidth: 820 }}>
      <div className="v2-tasks-header">
        <h1 className="v2-tasks-title">Conocimiento</h1>
        <div className="v2-tasks-meta">{items.length} de {memories.length} entradas</div>
      </div>

      <div className="v2-composer" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Search size={15} style={{ color: "var(--v2-text-3)" }} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar en la memoria"
            style={{
              flex: 1, border: 0, outline: 0, background: "transparent",
              fontSize: 14, color: "var(--v2-text)", fontFamily: "inherit",
            }}
          />
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
          <button
            className={`v2-pill ${category === "todas" ? "active" : ""}`}
            onClick={() => setCategory("todas")}
          >Todas</button>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              className={`v2-pill ${category === c ? "active" : ""}`}
              onClick={() => setCategory(c)}
            >{c}</button>
          ))}
        </div>
      </div>

      {error && <div className="chat-error" style={{ marginBottom: 12 }}>{error}</div>}

      {memories.length === 0 ? (
        <div className="v2-tasks-empty">
          <Brain size={22} style={{ marginBottom: 8, color: "var(--v2-purple)" }} />
          <p style={{ margin: 0, fontSize: 13, color: "var(--v2-text)" }}>El agente aun no ha aprendido nada.</p>
          <small style={{ color: "var(--v2-text-3)" }}>Cuando termines tareas con SOPs, se guardaran recuerdos aqui.</small>
        </div>
      ) : items.length === 0 ? (
        <div className="v2-tasks-empty">
          <Search size={22} style={{ marginBottom: 8, color: "var(--v2-purple)" }} />
          <p style={{ margin: 0, fontSize: 13, color: "var(--v2-text)" }}>Ninguna entrada coincide con el filtro.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {items.map((m) => (
            <div
              key={m.id}
              style={{
                padding: 14,
                background: "#FFF",
                border: "1px solid var(--v2-border)",
                borderRadius: 12,
              }}
            >
              <div style={{ fontSize: 12.5, lineHeight: 1.55, color: "var(--v2-text)" }}>{m.text}</div>
              {m.category && <span className="v2-tag" style={{ marginTop: 8 }}>{m.category}</span>}
              {m.tags && m.tags.length > 0 && (
                <div style={{ display: "flex", gap: 4, marginTop: 6, flexWrap: "wrap" }}>
                  {m.tags.map((t) => <span key={t} className="v2-tag">{t}</span>)}
                </div>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, fontSize: 10, color: "var(--v2-text-3)" }}>
                {m.source && <span>{m.source}</span>}
                {m.createdAt && <span>{relativeTime(m.createdAt)}</span>}
                <span style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
                  <button className="v2-pill" title="Editar" onClick={() => openEdit(m)}>
                    <Pencil size={12} />
                  </button>
                  <button className="v2-pill" title="Olvidar" onClick={() => void forget(m)}>
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
                style={{ width: "100%", padding: "9px 11px", border: "1px solid var(--v2-border)", borderRadius: 8, background: "#FFF", color: "var(--v2-text)", fontSize: 12.5, fontFamily: "inherit", resize: "vertical" }}
              />
              <label className="modal-label" style={{ marginTop: 14 }}>Categoria</label>
              <select
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value as Category | "")}
                style={{ width: "100%", padding: "9px 11px", border: "1px solid var(--v2-border)", borderRadius: 8, background: "#FFF", color: "var(--v2-text)", fontSize: 12.5 }}
              >
                <option value="">(sin categoria)</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <label className="modal-label" style={{ marginTop: 14 }}>Tags (separados por coma)</label>
              <input
                type="text"
                value={editTags}
                onChange={(e) => setEditTags(e.target.value)}
                style={{ width: "100%", padding: "9px 11px", border: "1px solid var(--v2-border)", borderRadius: 8, background: "#FFF", color: "var(--v2-text)", fontSize: 12.5 }}
              />
              <div className="control-row" style={{ justifyContent: "flex-end", marginTop: 16 }}>
                <button className="v2-pill" onClick={() => setEditing(null)} disabled={busy}>Cerrar</button>
                <button className="v2-need-action-btn" onClick={saveEdit} disabled={busy || !editText.trim()}>
                  {busy ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}