import { useCallback, useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { apiFetch } from "../api/client";
import type { MemoryEntry } from "../hooks/useWorkspaceData";
import "../design-system/agntia-tokens.css";
import "./knowledge/knowledge.css";
import { CATEGORIES } from "./knowledge/knowledge.types";
import type { Category, CategoryFilter, KnowledgeItem, Presentation } from "./knowledge/knowledge.types";
import { KnowledgeDocument, KnowledgeEmpty, KnowledgeFiltersSheet, KnowledgeHeader, KnowledgeList, KnowledgeSidebar, KnowledgeToolbar } from "./knowledge/KnowledgePieces";

interface Props { memories: MemoryEntry[]; }
type MemoryDetail = MemoryEntry & KnowledgeItem;

export default function MemoryView({ memories }: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("todas");
  const [presentation, setPresentation] = useState<Presentation>("list");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editing, setEditing] = useState<MemoryDetail | null>(null);
  const [editText, setEditText] = useState("");
  const [editCategory, setEditCategory] = useState<Category | "">("");
  const [editTags, setEditTags] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const entries = memories as MemoryDetail[];
  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter(m => {
      if (category !== "todas" && m.category !== category) return false;
      return !q || (m.text + " " + (m.tags ?? []).join(" ") + " " + (m.source ?? "")).toLowerCase().includes(q);
    });
  }, [memories, query, category]);
  const selected = entries.find(m => m.id === selectedId) ?? null;
  useEffect(() => { if (selectedId && !selected) setSelectedId(null); }, [selectedId, selected]);

  const openEdit = (m: KnowledgeItem) => {
    const item = m as MemoryDetail;
    setEditing(item); setEditText(item.text);
    setEditCategory((item.category as Category) ?? "");
    setEditTags((item.tags ?? []).join(", ")); setError(null);
  };
  const closeEdit = () => {
    if (busy) return;
    if (editing && (editText !== editing.text || editCategory !== (editing.category ?? "") || editTags !== (editing.tags ?? []).join(", "))) {
      if (!window.confirm("Descartar los cambios sin guardar?")) return;
    }
    setEditing(null); setError(null);
  };
  const saveEdit = async () => {
    if (!editing || !editText.trim() || busy) return;
    setBusy(true); setError(null);
    try {
      await apiFetch(`/api/agent/memories/${encodeURIComponent(editing.id)}`, {
        method: "POST",
        body: {
          text: editText.trim(),
          source: editing.source ?? "You",
          category: editCategory || null,
          tags: editTags.trim() ? editTags.split(",").map(t => t.trim()).filter(Boolean) : null,
        },
      });
      setEditing(null);
    } catch (err) { setError(err instanceof Error ? err.message : "Error al guardar"); }
    finally { setBusy(false); }
  };
  const forget = async (m: KnowledgeItem) => {
    if (busy || !window.confirm(`Borrar la memoria "${m.text.slice(0,60)}..."?`)) return;
    setBusy(true); setError(null);
    try {
      await apiFetch(`/api/agent/memories/${encodeURIComponent(m.id)}/forget`, { method: "POST", body: {} });
      if (selectedId === m.id) setSelectedId(null);
      setEditing(null);
    } catch (err) { setError(err instanceof Error ? err.message : "Error al borrar"); }
    finally { setBusy(false); }
  };
  const closeFilters = useCallback(() => setFiltersOpen(false), []);

  return <div className="agntia-workspace ag-knowledge">
    <div className="ag-knowledge-layout">
      <KnowledgeSidebar category={category} setCategory={setCategory}/>
      <main className="ag-knowledge-main">
        {selected ? <KnowledgeDocument item={selected} onBack={()=>setSelectedId(null)} onEdit={openEdit} onDelete={m=>void forget(m)} busy={busy}/> : <>
          <KnowledgeHeader count={items.length} total={memories.length}/>
          <KnowledgeToolbar query={query} setQuery={setQuery} category={category} setCategory={setCategory} presentation={presentation} setPresentation={setPresentation} openFilters={()=>setFiltersOpen(true)}/>
          {error && !editing && <div role="alert" className="ag-knowledge-error">{error}</div>}
          {items.length ? <KnowledgeList items={items} presentation={presentation} onOpen={m=>setSelectedId(m.id)} onEdit={openEdit} onDelete={m=>void forget(m)} busy={busy}/> : <KnowledgeEmpty filtered={Boolean(query || category!=="todas")}/>}
        </>}
        {error && selected && !editing && <div role="alert" className="ag-knowledge-error">{error}</div>}
      </main>
    </div>
    {filtersOpen && <KnowledgeFiltersSheet category={category} setCategory={setCategory} onClose={closeFilters}/>}
    {editing && <div className="ag-knowledge-edit-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)closeEdit();}}>
      <section className="ag-knowledge-edit" role="dialog" aria-modal="true" aria-labelledby="ag-knowledge-edit-title">
        <div className="ag-knowledge-edit-head"><h2 id="ag-knowledge-edit-title">Editar documento</h2><button type="button" onClick={closeEdit} aria-label="Cerrar"><X size={20}/></button></div>
        {error && <div role="alert" className="ag-knowledge-error">{error}</div>}
        <label htmlFor="ag-knowledge-text">Contenido</label>
        <textarea id="ag-knowledge-text" rows={8} value={editText} onChange={e=>setEditText(e.target.value)}/>
        <label htmlFor="ag-knowledge-category">Categoría</label>
        <select id="ag-knowledge-category" value={editCategory} onChange={e=>setEditCategory(e.target.value as Category | "")}>
          <option value="">Sin categoría</option>{CATEGORIES.map(c=><option value={c} key={c}>{c}</option>)}
        </select>
        <label htmlFor="ag-knowledge-tags">Etiquetas separadas por comas</label>
        <input id="ag-knowledge-tags" value={editTags} onChange={e=>setEditTags(e.target.value)}/>
        <div className="ag-knowledge-edit-actions"><button type="button" onClick={closeEdit} disabled={busy}>Cancelar</button><button className="is-primary" type="button" onClick={()=>void saveEdit()} disabled={busy || !editText.trim()}>{busy?"Guardando…":"Guardar"}</button></div>
      </section>
    </div>}
  </div>;
}
