import { useEffect, useMemo, useState, type ReactNode } from "react";
import { BookOpen, Brain, ChevronDown, ChevronRight, CircleHelp, FilePlus2, FileText, FolderClosed, GitBranch, History, Home, Menu, MoreHorizontal, PanelLeftClose, PanelLeftOpen, Plus, Search, ShieldCheck, Sparkles, X } from "lucide-react";
import "./knowledge.css";

type Page = { id:string; title:string; parent:string|null; icon:string; body:string; updated:string };
const initial:Page[] = [
 {id:"home",title:"Conocimiento de AgntiaPro",parent:null,icon:"✦",updated:"Hoy",body:"Un espacio para pensar, construir y documentar la empresa. Esta demo utiliza exclusivamente datos sintéticos.\n\n## Empezamos por lo esencial\nAgntiaPro está preparando su primera etapa comercial. LAIA coordina el trabajo y el equipo construye un sistema operativo agéntico para pequeñas empresas.\n\n## Prioridades de esta semana\n☐ Revisar el onboarding del primer cliente piloto\n☐ Terminar las demos de los workspaces\n☐ Preparar los procedimientos de soporte\n\n## Principios de trabajo\nLa IA propone, el sistema dispone. Toda acción sensible requiere autorización y trazabilidad."},
 {id:"product",title:"Producto y plataforma",parent:"home",icon:"◈",updated:"Ayer",body:"## Producto y plataforma\nEl producto reúne conversación, agentes, tareas, documentos y operaciones en una misma experiencia.\n\n## Componentes\n• Runtime determinista y motor de SOPs\n• LAIA como interfaz conversacional\n• Workspaces especializados\n• Centro de Mando para supervisar la actividad\n\n## Próximos pasos\n☐ Validar experiencia móvil\n☐ Revisar consistencia de navegación"},
 {id:"agents",title:"Equipo de agentes",parent:"product",icon:"✳",updated:"Hoy",body:"## Equipo de agentes\nLAIA · Supervisión y conversación\nMarcos · Operaciones\nAntonio · Finanzas\nAna · Personas\nPedro · Ciberseguridad\n\n## Acuerdos\nLos agentes trabajan con capacidades limitadas y permisos explícitos. Sus propuestas se verifican antes de ejecutarse."},
 {id:"ops",title:"Operaciones",parent:"home",icon:"▦",updated:"Hace 2 días",body:"## Operaciones\nAquí documentamos los procedimientos de trabajo.\n\n## Flujo de un encargo\n1. Recibir petición\n2. Crear plan verificable\n3. Ejecutar pasos autorizados\n4. Revisar resultados\n5. Registrar evidencias\n\n☐ Revisar procedimiento de altas"},
 {id:"sales",title:"Comercial y lanzamiento",parent:"home",icon:"◇",updated:"Hoy",body:"## Comercial y lanzamiento\nObjetivo de demostración: preparar la captación de los primeros clientes de AgntiaPro.\n\n## Materiales\n• Landing conversacional\n• Demo guiada de LAIA\n• Presentación de servicios de alto retorno\n\n## Hipótesis a validar\nLas pymes valorarán más una empresa que trabaja con ellas que un chatbot aislado."},
 {id:"meetings",title:"Notas de reuniones",parent:"home",icon:"☷",updated:"Ayer",body:"## Reunión de producto · Demo\nParticipantes simulados: LAIA, Marcos y responsable de producto.\n\n## Decisiones\n• Mantener la navegación sencilla\n• Diseñar primero con datos sintéticos\n• Probar escritorio y móvil antes de conectar APIs\n\n## Pendiente\n☐ Revisar prototipo Conocimiento"},
];
const sections=[{id:"documents",label:"Documentos",icon:FileText},{id:"wiki",label:"Wiki",icon:BookOpen},{id:"research",label:"Investigación",icon:Search},{id:"memory",label:"Memoria",icon:Brain},{id:"graph",label:"Grafo",icon:GitBranch},{id:"governance",label:"Gobernanza",icon:ShieldCheck}] as const;
type Section=typeof sections[number]["id"];
function RichText({value,onChange}:{value:string;onChange:(v:string)=>void}) {
 const lines=value.split("\n");
 return <div className="kn-editor" aria-label="Contenido editable de la página">
  {lines.map((line,i)=>{
   const heading=line.startsWith("## "); const check=line.startsWith("☐ ")||line.startsWith("☑ ");
   return <div key={i} className={"kn-line "+(heading?"kn-heading":check?"kn-check":"")}>
    {check&&<input type="checkbox" aria-label={"Marcar "+line.slice(2)} onChange={e=>{const copy=[...lines];copy[i]=(e.target.checked?"☑ ":"☐ ")+line.slice(2);onChange(copy.join("\n"));}} checked={line.startsWith("☑ ")}/>}
    <input aria-label={heading?"Encabezado": "Línea "+(i+1)} value={heading?line.slice(3):check?line.slice(2):line.startsWith("☑ ")?line.slice(2):line} placeholder={heading?"Encabezado":"Escribe algo…"} onChange={e=>{const copy=[...lines];copy[i]=(heading?"## ":check?(line.startsWith("☑ ")?"☑ ":"☐ "):"")+e.target.value;onChange(copy.join("\n"));}} onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();const copy=[...lines];copy.splice(i+1,0,"");onChange(copy.join("\n"));requestAnimationFrame(()=>{const fields=document.querySelectorAll<HTMLInputElement>(".kn-editor .kn-line > input:not([type=checkbox])");fields[i+1]?.focus();});} if(e.key==="Backspace"&&!line&&lines.length>1){e.preventDefault();const copy=[...lines];copy.splice(i,1);onChange(copy.join("\n"));}}}/>
   </div>;
  })}
 </div>;
}
export default function KnowledgeNotionLab(){
 const [section,setSection]=useState<Section>("documents");
 const [pages,setPages]=useState(initial);
 const [selected,setSelected]=useState("home");
 const [expanded,setExpanded]=useState<string[]>(["home","product"]);
 const [treeOpen,setTreeOpen]=useState(true);
 const [mobileOpen,setMobileOpen]=useState(false);
 const [query,setQuery]=useState("");
 const [searchOpen,setSearchOpen]=useState(false);
 const [notice,setNotice]=useState("");
 const current=pages.find(p=>p.id===selected)??pages[0];
 const ancestors=useMemo(()=>{const result:Page[]=[];let node:Page|undefined=current;while(node){result.unshift(node);node=pages.find(p=>p.id===node?.parent);}return result;},[current,pages]);
 const choose=(id:string)=>{setSelected(id);setSection("documents");setMobileOpen(false);setSearchOpen(false);};
 const addPage=(parent:string|null)=>{const id="draft-"+Date.now();const p:Page={id,parent,title:"Sin título",icon:"▤",body:"",updated:"Ahora"};setPages(v=>[...v,p]);setExpanded(v=>[...v,parent??"home"]);choose(id);setNotice("Página creada solo en esta sesión de demostración");};
 const update=(field:"title"|"body",value:string)=>setPages(v=>v.map(p=>p.id===selected?{...p,[field]:value,updated:"Ahora"}:p));
 const matches=pages.filter(p=>(p.title+" "+p.body).toLowerCase().includes(query.toLowerCase()));
 useEffect(()=>{const handler=(e:KeyboardEvent)=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){e.preventDefault();setSearchOpen(true);}if(e.key==="Escape"){setSearchOpen(false);setMobileOpen(false);}};window.addEventListener("keydown",handler);return()=>window.removeEventListener("keydown",handler);},[]);
 const tree=(parent:string|null,depth=0):ReactNode=>pages.filter(p=>p.parent===parent).map(p=><div key={p.id}>
  <div className={"kn-page-row "+(selected===p.id&&section==="documents"?"selected":"")} style={{paddingLeft:10+depth*13}}>
   <button className="kn-expand" aria-label={"Expandir "+p.title} onClick={()=>setExpanded(v=>v.includes(p.id)?v.filter(x=>x!==p.id):[...v,p.id])}>{pages.some(x=>x.parent===p.id)?expanded.includes(p.id)?<ChevronDown size={13}/>:<ChevronRight size={13}/>:<span className="kn-expand-space"/>}</button>
   <button className="kn-page-link" onClick={()=>choose(p.id)}><span>{p.icon}</span><span className="kn-truncate">{p.title}</span></button>
   <button className="kn-page-add" title={"Nueva subpágina en "+p.title} aria-label={"Añadir subpágina en "+p.title} onClick={()=>addPage(p.id)}><Plus size={13}/></button>
  </div>{expanded.includes(p.id)&&tree(p.id,depth+1)}
 </div>);
 return <div className="kn-root">
  <header className="kn-top"><div className="kn-top-left"><button className="kn-icon kn-mobile-menu" aria-label="Abrir páginas" onClick={()=>{setTreeOpen(true);setMobileOpen(true);}}><Menu size={18}/></button><span className="kn-product">Conocimiento</span><span className="kn-divider">/</span><span className="kn-top-context">AgntiaPro · Demo</span></div><div className="kn-top-right"><span className="kn-demo-label">DATOS SINTÉTICOS</span><button className="kn-icon" title="Buscar en conocimiento (Ctrl+K)" aria-label="Buscar" onClick={()=>setSearchOpen(true)}><Search size={17}/></button><button className="kn-icon" title="Ayuda de la demo" aria-label="Ayuda" onClick={()=>setNotice("Prototipo aislado: los cambios no se guardan ni modifican AgntiaPro.")}><CircleHelp size={17}/></button></div></header>
  <nav className="kn-tabs" aria-label="Áreas de conocimiento">{sections.map(s=><button key={s.id} className={"kn-tab "+(section===s.id?"active":"")} onClick={()=>{setSection(s.id);setMobileOpen(false);}}><s.icon size={15}/><span>{s.label}</span></button>)}</nav>
  <div className="kn-workspace">
   {section==="documents"?<>
    <aside className="kn-rail" aria-label="Herramientas de documentos">
     <button className="kn-rail-button" title="Inicio" aria-label="Inicio" onClick={()=>choose("home")}><Home size={18}/></button>
     <button className="kn-rail-button" title="Buscar páginas" aria-label="Buscar páginas" onClick={()=>setSearchOpen(true)}><Search size={18}/></button>
     <button className="kn-rail-button" title="Mostrar u ocultar árbol de páginas" aria-label="Mostrar u ocultar árbol de páginas" onClick={()=>setTreeOpen(v=>!v)}>{treeOpen?<PanelLeftClose size={18}/>:<PanelLeftOpen size={18}/>}</button>
     <button className="kn-rail-button" title="Crear página" aria-label="Crear página" onClick={()=>addPage("home")}><FilePlus2 size={18}/></button>
     <div className="kn-rail-spacer"/><button className="kn-rail-button" title="Historial (próximamente)" aria-label="Historial" onClick={()=>setNotice("El historial real llegará al conectar el almacenamiento y las auditorías.")}><History size={18}/></button>
    </aside>
    {treeOpen&&<aside className={"kn-tree "+(mobileOpen?"open":"")} aria-label="Páginas de conocimiento"><div className="kn-tree-head"><strong>AgntiaPro</strong><button className="kn-icon kn-close-mobile" onClick={()=>setMobileOpen(false)} aria-label="Cerrar páginas"><X size={16}/></button><button className="kn-icon" title="Nueva página" aria-label="Nueva página" onClick={()=>addPage("home")}><Plus size={16}/></button></div><div className="kn-tree-section"><FolderClosed size={14}/> Páginas del equipo</div><div className="kn-tree-scroll">{tree(null)}</div><button className="kn-tree-footer" onClick={()=>addPage("home")}><Plus size={14}/> Nueva página</button></aside>}
    {mobileOpen&&<button className="kn-scrim" aria-label="Cerrar navegación" onClick={()=>setMobileOpen(false)}/>}
    <main className="kn-main"><div className="kn-breadcrumb">{ancestors.map((p,i)=><span key={p.id}><button onClick={()=>choose(p.id)}>{p.icon} {p.title}</button>{i<ancestors.length-1&&<ChevronRight size={13}/>}</span>)}<button className="kn-icon kn-page-more" title="Opciones de la página" onClick={()=>setNotice("Opciones avanzadas disponibles en una campaña posterior.")}><MoreHorizontal size={18}/></button></div><article className="kn-document"><div className="kn-cover-line"/><div className="kn-page-icon">{current.icon}</div><input className="kn-title-input" aria-label="Título de la página" value={current.title} onChange={e=>update("title",e.target.value)} placeholder="Sin título"/><div className="kn-page-meta"><span>AgntiaPro</span><span>·</span><span>Actualizado {current.updated.toLowerCase()}</span><span>·</span><span>Demostración editable</span></div><RichText value={current.body} onChange={v=>update("body",v)}/><button className="kn-add-block" onClick={()=>update("body",current.body+"\n")}><Plus size={15}/> Añadir bloque</button><div className="kn-agent-note"><Sparkles size={15}/><span>LAIA podrá crear, relacionar y revisar estas páginas cuando conectemos el runtime.</span><span className="kn-note-pill">Próximamente</span></div></article></main>
   </>:<main className="kn-future"><div className="kn-future-icon">{(()=>{const Icon=sections.find(s=>s.id===section)!.icon;return <Icon size={27}/>;})()}</div><h1>{sections.find(s=>s.id===section)?.label}</h1><p>Esta pestaña está reservada para su propio workspace. En esta primera campaña solo diseñamos y probamos la experiencia de Documentos inspirada en Notion.</p><div className="kn-future-tag">Sin funcionalidad simulada</div><button onClick={()=>setSection("documents")}>Volver a Documentos</button></main>}
  </div>
  {notice&&<div className="kn-toast" role="status">{notice}<button aria-label="Cerrar aviso" onClick={()=>setNotice("")}><X size={14}/></button></div>}
  {searchOpen&&<div className="kn-search-overlay" onMouseDown={e=>{if(e.target===e.currentTarget)setSearchOpen(false);}}><div className="kn-search-dialog" role="dialog" aria-modal="true" aria-label="Buscar páginas"><div className="kn-search-input"><Search size={18}/><input autoFocus value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar en las páginas de AgntiaPro…"/><button className="kn-icon" onClick={()=>setSearchOpen(false)} aria-label="Cerrar búsqueda"><X size={16}/></button></div><div className="kn-search-results">{matches.length?matches.map(p=><button key={p.id} onClick={()=>choose(p.id)}><span>{p.icon}</span><span>{p.title}</span><ChevronRight size={14}/></button>):<p>No hay resultados en esta demo.</p>}</div><div className="kn-search-hint">Ctrl / ⌘ + K para buscar · Esc para cerrar</div></div></div>}
 </div>;
}
