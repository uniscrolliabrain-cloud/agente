import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, FileText, Plus, Sparkles, Trash2, X } from "lucide-react";
import {
  type ProjectBlock,
  type ProjectBlockType,
  type ProjectStatus,
} from "../api/projects";
import { useProjects } from "../hooks/useProjects";

interface Props {
  enabled: boolean;
}

const STATUS_LABEL: Record<ProjectStatus, string> = {
  active: "Activo",
  paused: "Pausado",
  completed: "Completado",
  archived: "Archivado",
};

function relativeTime(iso?: string): string {
  if (!iso) return "";
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 60000) return "ahora";
  if (ms < 3600000) return `${Math.floor(ms / 60000)}m`;
  if (ms < 86400000) return `${Math.floor(ms / 3600000)}h`;
  return `${Math.floor(ms / 86400000)}d`;
}

function uid(): string {
  return `blk-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function newBlock(type: ProjectBlockType): ProjectBlock {
  return { id: uid(), type, text: "" };
}

export default function ProjectsView({ enabled }: Props) {
  const p = useProjects(enabled);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [draftBlocks, setDraftBlocks] = useState<ProjectBlock[] | null>(null);
  const [savingBlocks, setSavingBlocks] = useState(false);

  useEffect(() => {
    if (!p.detail) {
      setDraftBlocks(null);
      return;
    }
    setDraftBlocks(p.detail.blocks);
  }, [p.detail]);

  const hasUnsavedBlocks = useMemo(() => {
    if (!p.detail || !draftBlocks) return false;
    return JSON.stringify(draftBlocks) !== JSON.stringify(p.detail.blocks);
  }, [p.detail, draftBlocks]);

  const submitCreate = async () => {
    const name = newName.trim();
    if (!name) return;
    await p.create({ name, description: newDesc.trim() });
    setCreating(false);
    setNewName("");
    setNewDesc("");
  };

  const saveBlocks = async () => {
    if (!p.detail || !draftBlocks) return;
    setSavingBlocks(true);
    await p.saveBlocks(p.detail.id, draftBlocks);
    setSavingBlocks(false);
  };

  const updateBlock = (id: string, patch: Partial<ProjectBlock>) => {
    setDraftBlocks((current) =>
      current ? current.map((b) => (b.id === id ? { ...b, ...patch } : b)) : current,
    );
  };

  const removeBlock = (id: string) => {
    setDraftBlocks((current) => (current ? current.filter((b) => b.id !== id) : current));
  };

  const addBlock = (type: ProjectBlockType) => {
    setDraftBlocks((current) => (current ? [...current, newBlock(type)] : [newBlock(type)]));
  };

  if (p.detail && draftBlocks) {
    return (
      <main className="view-shell">
        <div className="view-header">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button className="ghost-icon-button" onClick={p.closeDetail} title="Volver">
              <ArrowLeft size={17} />
            </button>
            <div>
              <h2 style={{ margin: 0 }}>{p.detail.name}</h2>
              <span className="view-header-meta">
                {STATUS_LABEL[p.detail.status]} · actualizado {relativeTime(p.detail.updatedAt)}
              </span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <select
              value={p.detail.status}
              onChange={(e) => void p.update(p.detail!.id, { status: e.target.value as ProjectStatus })}
              style={{ height: 30, borderRadius: 7, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)", padding: "0 8px", fontSize: 11 }}
            >
              <option value="active">Activo</option>
              <option value="paused">Pausado</option>
              <option value="completed">Completado</option>
              <option value="archived">Archivado</option>
            </select>
            <button
              className="primary-btn"
              onClick={saveBlocks}
              disabled={!hasUnsavedBlocks || savingBlocks}
            >
              {savingBlocks ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </div>

        <div className="view-memory-list" style={{ maxWidth: 820 }}>
          {p.detail.description && (
            <div className="view-memory-card" style={{ background: "var(--surface-2)" }}>
              <div className="view-memory-text">{p.detail.description}</div>
            </div>
          )}

          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
            {(["heading", "text", "checklist", "timeline", "note"] as ProjectBlockType[]).map((t) => (
              <button key={t} className="ctrl-btn" onClick={() => addBlock(t)}>
                <Plus size={12} style={{ verticalAlign: "middle", marginRight: 4 }} />
                {t === "heading" ? "Título" : t === "text" ? "Texto" : t === "checklist" ? "Checklist" : t === "timeline" ? "Timeline" : "Nota"}
              </button>
            ))}
          </div>

          {draftBlocks.length === 0 && (
            <div className="view-empty" style={{ padding: "30px 10px" }}>
              <FileText size={22} />
              <p>Este proyecto está vacío.</p>
              <small>Añade bloques con los botones de arriba.</small>
            </div>
          )}

          {draftBlocks.map((b) => (
            <div key={b.id} className="view-memory-card" style={{ position: "relative" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span className="view-memory-source" style={{ fontSize: 9 }}>
                  {b.type === "heading" ? "Título" : b.type === "text" ? "Texto" : b.type === "checklist" ? "Checklist" : b.type === "timeline" ? "Timeline" : "Nota"}
                </span>
                <button
                  className="ghost-icon-button"
                  onClick={() => removeBlock(b.id)}
                  title="Borrar bloque"
                  style={{ marginLeft: "auto", width: 24, height: 24 }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
              {b.type === "checklist" ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    type="checkbox"
                    checked={b.checked ?? false}
                    onChange={(e) => updateBlock(b.id, { checked: e.target.checked })}
                  />
                  <input
                    type="text"
                    value={b.text}
                    onChange={(e) => updateBlock(b.id, { text: e.target.value })}
                    placeholder="Elemento"
                    style={{ flex: 1, border: 0, outline: 0, background: "transparent", color: "var(--text)", fontSize: 13 }}
                  />
                </div>
              ) : b.type === "heading" ? (
                <input
                  type="text"
                  value={b.text}
                  onChange={(e) => updateBlock(b.id, { text: e.target.value })}
                  placeholder="Título del bloque"
                  style={{ width: "100%", border: 0, outline: 0, background: "transparent", color: "var(--text)", fontSize: 18, fontWeight: 600 }}
                />
              ) : (
                <textarea
                  value={b.text}
                  onChange={(e) => updateBlock(b.id, { text: e.target.value })}
                  rows={b.type === "note" ? 2 : 3}
                  placeholder={b.type === "timeline" ? "Fecha — hito" : "Contenido"}
                  style={{
                    width: "100%",
                    border: 0,
                    outline: 0,
                    background: "transparent",
                    color: b.type === "note" ? "var(--text-2)" : "var(--text)",
                    fontSize: b.type === "note" ? 12 : 13,
                    resize: "vertical",
                    fontStyle: b.type === "note" ? "italic" : "normal",
                    fontFamily: "inherit",
                  }}
                />
              )}
            </div>
          ))}

          {p.detail.memories.length > 0 && (
            <>
              <div className="nav-label" style={{ padding: "12px 2px 4px" }}>
                Memorias vinculadas ({p.detail.memories.length})
              </div>
              {p.detail.memories.map((m) => (
                <div key={m.id} className="view-memory-card">
                  <div className="view-memory-text">{m.text}</div>
                  <div className="view-memory-meta">
                    <span className="view-memory-source">{m.source}</span>
                    {m.category && <span>{m.category}</span>}
                  </div>
                </div>
              ))}
            </>
          )}

          {p.detail.artifacts.length > 0 && (
            <>
              <div className="nav-label" style={{ padding: "12px 2px 4px" }}>
                Artefactos vinculados ({p.detail.artifacts.length})
              </div>
              {p.detail.artifacts.map((a) => (
                <div key={a.id} className="view-memory-card">
                  <div className="view-memory-text" style={{ fontWeight: 600 }}>{a.title}</div>
                  <div className="view-memory-meta">
                    <span className="view-memory-source">{a.kind}</span>
                    <span>{relativeTime(a.createdAt)}</span>
                  </div>
                  {a.summary && <div className="view-memory-text" style={{ marginTop: 6, color: "var(--text-2)" }}>{a.summary}</div>}
                </div>
              ))}
            </>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="view-shell">
      <div className="view-header">
        <div>
          <h2>Proyectos</h2>
          <span className="view-header-meta">{p.projects.length} proyectos</span>
        </div>
        <button className="primary-btn" onClick={() => setCreating(true)}>
          <Plus size={14} style={{ verticalAlign: "middle", marginRight: 6 }} />
          Nuevo proyecto
        </button>
      </div>

      {p.error && <div className="chat-error" style={{ margin: 16 }}>{p.error}</div>}

      {p.projects.length === 0 && !p.loading ? (
        <div className="view-empty">
          <Sparkles size={22} />
          <p>Aún no tienes proyectos.</p>
          <small>Crea uno o pídele al agente que cree un briefing desde el chat.</small>
        </div>
      ) : (
        <div className="users-grid">
          {p.projects.map((proj) => (
            <div key={proj.id} className="user-card" onClick={() => void p.openDetail(proj.id)} style={{ cursor: "pointer" }}>
              <div className="user-card-top">
                <div className="user-card-avatar">{proj.name.slice(0, 1).toUpperCase()}</div>
                <div className="user-card-info">
                  <div className="user-card-name">{proj.name}</div>
                  {proj.description && (
                    <div className="user-card-email" title={proj.description}>
                      {proj.description.slice(0, 80)}
                    </div>
                  )}
                </div>
                <span className={`user-card-role ${proj.status === "active" ? "admin" : "user"}`}>
                  {STATUS_LABEL[proj.status]}
                </span>
              </div>
              <div className="user-card-meta">
                <span>{proj.blocks.length} bloques</span>
                <span>{proj.linkedMemoryIds.length} memorias</span>
                <span className="user-card-time">{relativeTime(proj.updatedAt)}</span>
              </div>
              <div className="user-card-actions">
                <button
                  className="user-card-btn danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`¿Borrar "${proj.name}"?`)) void p.remove(proj.id);
                  }}
                  title="Borrar"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {creating && (
        <div className="modal-overlay" onClick={() => setCreating(false)}>
          <div className="modal small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <div className="modal-title">Nuevo proyecto</div>
                <div className="modal-sub">Un espacio para organizar un tema</div>
              </div>
              <button className="ghost-icon-button" onClick={() => setCreating(false)}>
                <X size={17} />
              </button>
            </div>
            <div className="modal-body">
              <label className="modal-label">Nombre</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ej: Cliente Acme"
                autoFocus
                style={{ width: "100%", padding: "9px 11px", border: "1px solid var(--border)", borderRadius: 8, background: "var(--surface)", color: "var(--text)", fontSize: 12.5, outline: "none", fontFamily: "inherit" }}
              />
              <label className="modal-label" style={{ marginTop: 14 }}>Descripción (opcional)</label>
              <textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                rows={3}
                placeholder="De qué trata este proyecto"
                style={{ width: "100%", padding: "9px 11px", border: "1px solid var(--border)", borderRadius: 8, background: "var(--surface)", color: "var(--text)", fontSize: 12.5, outline: "none", fontFamily: "inherit", resize: "vertical" }}
              />
              <div className="control-row" style={{ justifyContent: "flex-end", marginTop: 16 }}>
                <button className="ctrl-btn" onClick={() => setCreating(false)}>Cancelar</button>
                <button className="primary-btn" onClick={submitCreate} disabled={!newName.trim()}>
                  Crear
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}