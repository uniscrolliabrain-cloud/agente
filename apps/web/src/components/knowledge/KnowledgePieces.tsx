import { useEffect, useRef } from "react";
import { BookOpen, ChevronLeft, ChevronRight, FileText, Filter, Grid2X2, LayoutList, List, Pencil, Search, Trash2, X } from "lucide-react";
import { CATEGORIES, getExcerpt, getTitle, relativeTime } from "./knowledge.types";
import type { CategoryFilter, KnowledgeItem, Presentation } from "./knowledge.types";

export function KnowledgeHeader({ count, total }: { count: number; total: number }) {
  return <header className="ag-knowledge-header">
    <div><p className="ag-knowledge-eyebrow">BIBLIOTECA · AGNTIAPRO</p><h1>Conocimiento<span className="ag-knowledge-dot">.</span></h1></div>
    <span className="ag-knowledge-count">{count} de {total} entradas</span>
  </header>;
}
export function KnowledgeToolbar({ query, setQuery, category, setCategory, presentation, setPresentation, openFilters }: {
  query: string; setQuery: (s: string) => void; category: CategoryFilter; setCategory: (c: CategoryFilter) => void;
  presentation: Presentation; setPresentation: (p: Presentation) => void; openFilters: () => void;
}) {
  return <div className="ag-knowledge-toolbar">
    <label className="ag-knowledge-search"><Search size={17} aria-hidden="true"/><span className="ag-sr-only">Buscar en conocimiento</span>
      <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar en conocimiento…" type="search"/></label>
    <div className="ag-knowledge-toolbar-bottom">
      <button className="ag-knowledge-filter-button" onClick={openFilters} type="button"><Filter size={15}/> {category === "todas" ? "Filtros" : category} <span className="ag-knowledge-filter-chevron">⌄</span></button>
      <div className="ag-knowledge-view-switch" role="group" aria-label="Presentación">
        {([{id:"list",Icon:List,label:"Lista"},{id:"table",Icon:LayoutList,label:"Tabla"},{id:"gallery",Icon:Grid2X2,label:"Galería"}] as const).map(({id,Icon,label}) =>
          <button key={id} type="button" aria-label={label} title={label} aria-pressed={presentation===id} className={presentation===id?"is-active":""} onClick={()=>setPresentation(id)}><Icon size={17}/></button>)}
      </div>
    </div>
  </div>;
}
export function KnowledgeSidebar({ category, setCategory }: { category: CategoryFilter; setCategory: (c: CategoryFilter) => void }) {
  return <aside className="ag-knowledge-sidebar" aria-label="Biblioteca y categorías">
    <p className="ag-knowledge-sidebar-label">TU ESPACIO</p>
    <div className="ag-knowledge-sidebar-title"><BookOpen size={17}/> Biblioteca</div>
    <p className="ag-knowledge-sidebar-label">CATEGORÍAS</p>
    {(["todas",...CATEGORIES] as CategoryFilter[]).map(c=><button type="button" key={c} className={"ag-knowledge-sidebar-item "+(category===c?"is-active":"")} onClick={()=>setCategory(c)}>{c==="todas"?"Todas las entradas":c}</button>)}
    <p className="ag-knowledge-sidebar-note">Actores, proyectos y sectores aparecerán cuando sus datos estén disponibles.</p>
  </aside>;
}
export function KnowledgeFiltersSheet({ category, setCategory, onClose }: { category: CategoryFilter; setCategory: (c: CategoryFilter) => void; onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialogRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if(e.key==="Escape") onClose(); };
    document.addEventListener("keydown",onKey);
    return () => { document.removeEventListener("keydown",onKey); previous?.focus(); };
  },[onClose]);
  return <div className="ag-knowledge-sheet-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}>
    <div className="ag-knowledge-sheet" role="dialog" aria-modal="true" aria-label="Filtrar conocimiento" ref={dialogRef} tabIndex={-1}>
      <div className="ag-knowledge-sheet-head"><strong>Filtrar conocimiento</strong><button type="button" aria-label="Cerrar filtros" onClick={onClose}><X size={20}/></button></div>
      <p className="ag-knowledge-sidebar-label">CATEGORÍA</p>
      <div className="ag-knowledge-filter-options">{(["todas",...CATEGORIES] as CategoryFilter[]).map(c=><button key={c} type="button" aria-pressed={category===c} className={category===c?"is-active":""} onClick={()=>{setCategory(c);onClose();}}>{c==="todas"?"Todas":c}</button>)}</div>
      <p className="ag-knowledge-filter-hint">Actor · Proyecto · Sector</p><p className="ag-knowledge-sidebar-note">Estos filtros estarán disponibles cuando existan metadatos asociados.</p>
    </div>
  </div>;
}
export function KnowledgeList({ items, presentation, onOpen, onEdit, onDelete, busy }: {
  items: KnowledgeItem[]; presentation: Presentation; onOpen: (m: KnowledgeItem)=>void; onEdit: (m: KnowledgeItem)=>void; onDelete: (m: KnowledgeItem)=>void; busy: boolean;
}) {
  return <div className={"ag-knowledge-items ag-knowledge-items--"+presentation} aria-label="Entradas de conocimiento">
    {items.map(m=><article className="ag-knowledge-item" key={m.id}>
      <button className="ag-knowledge-item-main" type="button" onClick={()=>onOpen(m)}>
        <span className="ag-knowledge-item-icon"><FileText size={19}/></span>
        <span className="ag-knowledge-item-copy"><strong>{getTitle(m.text)}</strong>
          {getExcerpt(m.text)&&<span className="ag-knowledge-item-excerpt">{getExcerpt(m.text)}</span>}
          <span className="ag-knowledge-item-meta">{[m.category,m.source,relativeTime(m.createdAt)].filter(Boolean).join(" · ")}{m.tags?.length ? " · "+m.tags.slice(0,2).join(", ") : ""}</span>
        </span><ChevronRight className="ag-knowledge-item-arrow" size={17}/></button>
      <div className="ag-knowledge-item-actions">
        <button type="button" title="Editar" aria-label={"Editar "+getTitle(m.text)} disabled={busy} onClick={()=>onEdit(m)}><Pencil size={16}/></button>
        <button type="button" title="Borrar" aria-label={"Borrar "+getTitle(m.text)} disabled={busy} onClick={()=>onDelete(m)}><Trash2 size={16}/></button>
      </div>
    </article>)}
  </div>;
}
export function KnowledgeDocument({ item, onBack, onEdit, onDelete, busy }: {
  item: KnowledgeItem; onBack:()=>void; onEdit:(m:KnowledgeItem)=>void; onDelete:(m:KnowledgeItem)=>void; busy:boolean;
}) {
  return <section className="ag-knowledge-document" aria-label="Documento">
    <button type="button" className="ag-knowledge-back" onClick={onBack}><ChevronLeft size={18}/> Biblioteca</button>
    <div className="ag-knowledge-document-icon"><FileText size={26}/></div>
    <h2>{getTitle(item.text)}</h2>
    <p className="ag-knowledge-document-meta">{[item.category,item.source,relativeTime(item.createdAt)].filter(Boolean).join(" · ")}</p>
    {item.tags?.length ? <div className="ag-knowledge-document-tags">{item.tags.map(t=><span key={t}>{t}</span>)}</div> : null}
    <div className="ag-knowledge-document-body">{item.text}</div>
    <div className="ag-knowledge-document-actions"><button type="button" onClick={()=>onEdit(item)} disabled={busy}><Pencil size={16}/> Editar</button><button type="button" onClick={()=>onDelete(item)} disabled={busy}><Trash2 size={16}/> Borrar</button></div>
  </section>;
}
export function KnowledgeEmpty({ filtered }: { filtered:boolean }) {
  return <div className="ag-knowledge-empty"><BookOpen size={29}/><h2>{filtered?"No hay coincidencias":"Tu biblioteca está vacía"}</h2><p>{filtered?"Prueba otra búsqueda o cambia los filtros.":"Aquí aparecerá el conocimiento disponible en este espacio."}</p></div>;
}
