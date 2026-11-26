// TU_EMPRESA_V1 - andamio de la meta-app.
// Clon del shell de AgntiaPro abierto desde Ajustes → Tu Empresa. Todo el
// contenido es día 90 a propósito: primero se valida la estructura y el
// comportamiento del entorno, después se sustituye texto e imágenes una a una.
// No hay motor de compilación ni backend; los botones solo describen el gesto.
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Archive,
  BarChart3,
  Copy,
  Boxes,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  Compass,
  Cpu,
  FileText,
  FolderOpen,
  GitBranch,
  Globe2,
  GraduationCap,
  Handshake,
  Layers,
  Lock,
  Menu,
  MessageSquare,
  Mic,
  Palette,
  PanelLeft,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  Wallet,
  Workflow,
  X,
} from "lucide-react";
import "../design-system/agntia-tokens.css";
import "./company.css";
import { COMPANY_DATA } from "./company-data";

type Icon = typeof Compass;
type SectionId =
  | "estudio"
  | "fuentes"
  | "entrevistas"
  | "identidad"
  | "modelo"
  | "branding"
  | "estrategia"
  | "organizacion"
  | "productos"
  | "mercado"
  | "economia"
  | "ecosistema"
  | "operaciones"
  | "procesos"
  | "tecnologia"
  | "talento"
  | "gobernanza"
  | "versiones";

type Variant =
  | "dashboard"
  | "table"
  | "cards"
  | "editorial"
  | "canvas"
  | "chart"
  | "flow"
  | "matrix"
  | "org"
  | "timeline";

type Section = { id: SectionId; label: string; icon: Icon; group: string; variant: Variant };

const GROUPS = ["Compilación", "Definición", "Operación", "Publicación"] as const;

const SECTIONS: Section[] = [
  { id: "estudio", label: "Estudio de compilación", icon: Compass, group: "Compilación", variant: "dashboard" },
  { id: "fuentes", label: "Fuentes originales", icon: FolderOpen, group: "Compilación", variant: "table" },
  { id: "entrevistas", label: "Entrevistas y captura", icon: Mic, group: "Compilación", variant: "cards" },
  { id: "identidad", label: "Identidad y cultura", icon: Sparkles, group: "Definición", variant: "editorial" },
  { id: "modelo", label: "Modelo de negocio", icon: Layers, group: "Definición", variant: "canvas" },
  { id: "branding", label: "Branding", icon: Palette, group: "Definición", variant: "cards" },
  { id: "estrategia", label: "Diseño estratégico", icon: Target, group: "Definición", variant: "chart" },
  { id: "mercado", label: "Mercado y competencia", icon: Globe2, group: "Definición", variant: "matrix" },
  { id: "organizacion", label: "Diseño organizativo", icon: Users, group: "Operación", variant: "org" },
  { id: "productos", label: "Productos y servicios", icon: Boxes, group: "Operación", variant: "table" },
  { id: "economia", label: "Diseño económico", icon: Wallet, group: "Operación", variant: "chart" },
  { id: "ecosistema", label: "Ecosistema empresarial", icon: Handshake, group: "Operación", variant: "table" },
  { id: "operaciones", label: "Diseño operativo", icon: Workflow, group: "Operación", variant: "flow" },
  { id: "procesos", label: "Ingeniería de procesos", icon: GitBranch, group: "Operación", variant: "flow" },
  { id: "tecnologia", label: "Arquitectura tecnológica", icon: Cpu, group: "Operación", variant: "canvas" },
  { id: "talento", label: "Desarrollo del talento", icon: GraduationCap, group: "Operación", variant: "matrix" },
  { id: "gobernanza", label: "Gobernanza", icon: ShieldCheck, group: "Operación", variant: "table" },
  { id: "versiones", label: "Versiones y publicación", icon: Layers, group: "Publicación", variant: "timeline" },
];

const VERSIONS = ["V8 · borrador", "V7 · activa", "ALT-B · explorando", "ALT-C · aparcada"];

/* ------------------------------------------------------------- ideas y chats
 * Las conversaciones del compilador pertenecen a una idea, no a la empresa
 * activa. Varias ideas conviven en paralelo y cada una tiene su propia rama de
 * borrador: hablar no cambia nada hasta que una propuesta se publica. */
type ChatState = "Explorando" | "Con propuesta" | "Aparcada";
type Idea = { n: number; id: string; name: string; short: string; branch: string };
type Chat = { id: string; idea: number; title: string; preview: string; when: string; state: ChatState };

const IDEAS: Idea[] = [
  { n: 1, id: "I01", name: "Recuperar oportunidades comerciales", short: "Idea 01 · Seguimiento", branch: "V8 borrador" },
  { n: 2, id: "I02", name: "Canal de agencias colaboradoras", short: "Idea 02 · Agencias", branch: "ALT-B" },
  { n: 3, id: "I03", name: "Reducir coste de atención", short: "Idea 03 · Costes", branch: "ALT-C" },
];
const SEED_CHATS: Chat[] = [
  { id: "c1", idea: 1, title: "Seguimiento de Taller Horizonte", preview: "Diseñar SOP01 y revisar D01.", when: "Día 90", state: "Con propuesta" },
  { id: "c2", idea: 1, title: "Entrevista con Marcos", preview: "Medir propuestas olvidadas.", when: "Día 86", state: "Explorando" },
  { id: "c3", idea: 2, title: "Modelo de colaboración", preview: "Comisión propuesta de 150 € por cliente.", when: "Día 89", state: "Explorando" },
  { id: "c4", idea: 3, title: "Coste de voz y atención", preview: "Comparar alternativas sin cambiar proveedores.", when: "Día 87", state: "Aparcada" },
];
type Content = typeof COMPANY_DATA[SectionId];
function Panel({title,hint,children,className=""}:{title:string;hint?:string;children:ReactNode;className?:string}) {
 return <section className={"co-panel "+className}><header className="co-panel-head"><div><h2>{title}</h2>{hint&&<p>{hint}</p>}</div></header>{children}</section>;
}
function Table({rows,headers=["Elemento","Detalle","Estado"],onSelect}:{rows:string[][];headers?:string[];onSelect:(row:string[])=>void}) {
 const [query,setQuery]=useState("");
 const filtered=rows.filter(row=>row.join(" ").toLocaleLowerCase().includes(query.toLocaleLowerCase()));
 return <><label className="co-search"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar registros…" aria-label="Buscar registros"/></label><div className="co-table-wrap"><table className="co-table"><thead><tr>{headers.map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{filtered.map((row,i)=><tr key={i}>{row.map((cell,j)=><td key={j}>{j===0?<button type="button" className="co-mini" onClick={()=>onSelect(row)}>{cell}<ChevronRight size={13}/></button>:j===row.length-1?<span className="co-tag">{cell}</span>:cell}</td>)}</tr>)}</tbody></table>{!filtered.length&&<p className="co-text">No hay registros que coincidan.</p>}</div></>;
}
function Progress({label,value}:{label:string;value:number}) {return <div className="co-progress"><div><span>{label}</span><b>{value} %</b></div><span className="co-progress-track"><i style={{width:value+"%"}}/></span></div>;}
function Workspace({section,onSelect}:{section:Section;onSelect:(row:string[])=>void}) {
 const d:Content=COMPANY_DATA[section.id];
 const primary=d.primary;
 const rows=d.rows;
 const stats=()=> <div className="co-stats">{primary.map(([label,value])=><button type="button" className="co-stat" key={label} onClick={()=>onSelect([label,value])}><small>{label}</small><strong>{value}</strong><span>Escenario simulado</span></button>)}</div>;
 const table=()=> <Panel title={section.variant==="table"?section.label:"Registros y propuestas"} hint="Selecciona un registro para consultar su detalle."><Table rows={rows} headers={section.variant==="table"?primary[0]:undefined} onSelect={onSelect}/></Panel>;
 switch(section.variant){
 case "dashboard": return <>{stats()}<div className="co-cols"><Panel title="Ideas en desarrollo">{rows.map(row=><button type="button" className="co-row" key={row[0]} onClick={()=>onSelect(row)}><span className="co-row-icon"><Sparkles size={14}/></span><span className="co-row-body"><b>{row[0]}</b><small>{row[1]}</small></span><span className="co-tag">{row[2]}</span><ChevronRight size={15}/></button>)}</Panel><Panel title="Tu siguiente paso"><p className="co-text">{d.next}</p><Progress label="Objetivo de clientes" value={80}/></Panel></div></>;
 case "table": return table();
 case "cards": return <>{section.id==="branding"&&<Panel title="Identidad visual" hint="Paleta de referencia del andamio"><div className="co-swatches">{["#2b2a26","#8c7a5f","#c9b99c","#e6ded0","#f4f0e6"].map(color=><div key={color}><span style={{background:color}}/><small>{color}</small></div>)}</div></Panel>}<div className="co-cards">{rows.map(row=><article className="co-card" key={row[0]}><div className="co-img"><FileText size={24}/><span>{section.id==="branding"?"Activo de marca":"Entrevista simulada"}</span></div><div><h3>{row[0]}</h3><p>{row[1]}</p><div className="co-card-foot"><span className="co-tag">{row[2]}</span><button type="button" aria-label={"Abrir "+row[0]} onClick={()=>onSelect(row)}><ArrowUpRight size={16}/></button></div></div></article>)}</div><Panel title="Siguiente paso"><p className="co-text">{d.next}</p></Panel></>;
 case "editorial": return <><div className="co-editorial"><div><span className="co-kicker">Nuestra identidad</span><h2>{d.hero}</h2>{primary.map(([label,value])=><div key={label}><h3>{label}</h3><p className="co-text">{value}</p></div>)}<blockquote>«La tecnología tiene que adaptarse a las personas.»<small>Visión founder · síntesis editorial</small></blockquote></div><aside className="co-facts">{rows.map(row=><div key={row[0]}><small>{row[2]}</small><b>{row[0]}</b><span>{row[1]}</span></div>)}</aside></div></>;
 case "canvas": return <><div className="co-canvas" style={{"--cols":3} as CSSProperties}>{primary.map(([label,value],i)=><section className="co-node" key={label}><header><span>{String(i+1).padStart(2,"0")}</span><button type="button" aria-label={"Revisar "+label} onClick={()=>onSelect([label,value])}><ChevronDown size={14}/></button></header><h3>{label}</h3><p>{value}</p></section>)}</div>{table()}</>;
 case "chart": {const finance=section.id==="economia";const values=finance?[5000,9500,12500]:[2,5,8];return <>{stats()}<div className="co-cols co-cols--wide"><Panel title={finance?"Facturación por mes":"Clientes acumulados"} hint="Tres meses · escenario sintético"><div className="co-bars" aria-label={values.join(", ")}>{values.map((v,i)=><span key={i} title={"Mes "+(i+1)+": "+v} style={{height:(v/(finance?12500:10)*100)+"%"}}/>)}</div><div className="co-legend">{values.map((v,i)=><span key={i}>Mes {i+1}: {v.toLocaleString("es-ES")}{finance?" €":""}</span>)}</div></Panel><Panel title="Lectura del escenario"><p className="co-text">{d.next}</p>{!finance&&<Progress label="Objetivo de clientes" value={80}/>}</Panel></div>{table()}</>;}
 case "flow": return <><div className="co-flow">{primary.map(([label,value],i)=><div className="co-flow-step" key={label}><div className="co-flow-node"><span className="co-flow-icon"><Workflow size={16}/></span><div><small>Paso {i+1}</small><b>{label}</b><span>{value}</span></div><span className="co-tag">Diseño</span></div>{i<primary.length-1&&<ChevronDown className="co-flow-arrow" size={16}/>}</div>)}</div>{table()}</>;
 case "matrix": return <><Panel title={section.id==="mercado"?"Segmentos y necesidades":"Mapa de aprendizaje"} hint="Evidencia y estados de la simulación"><Table rows={rows} headers={primary[0]} onSelect={onSelect}/></Panel><Panel title="Qué necesitamos comprobar"><p className="co-text">{d.next}</p></Panel></>;
 case "org": return <><Panel title="Organigrama funcional" hint="Equipo híbrido · escenario simulado"><div className="co-org"><div className="co-org-top"><div className="co-person co-person--lead"><span className="co-avatar">OW</span><div><b>Owner</b><small>Autoridad final</small></div></div></div><div className="co-org-line"/><div className="co-org-row co-org-row--agents">{primary.slice(1).map(([label,value])=><div className="co-person co-person--ai" key={label}><span className="co-avatar"><Sparkles size={14}/></span><div><b>{label}</b><small>{value}</small></div><span className="co-tag">IA</span></div>)}</div></div></Panel>{table()}</>;
 case "timeline": return <><div className="co-cols co-cols--wide"><Panel title="Versiones y alternativas"><ol className="co-versions">{primary.map(([label,value],i)=><li key={label} className={i===0?"is-draft":""}><span className="co-version-dot"/><div><b>{label}</b><p>{value}</p></div><span className="co-tag">{["Borrador","Activa demo","Explorando","Aparcada"][i]}</span></li>)}</ol></Panel><Panel title="Publicación pendiente"><div className="co-publish"><Lock size={18}/><p>{d.next}</p></div></Panel></div>{table()}</>;
 }
}
/* ------------------------------------------------------------- conversación */

function ChatView({
  chat,
  idea,
  onBack,
  onToast,
}: {
  chat: Chat;
  idea: Idea;
  onBack: () => void;
  onToast: (message: string) => void;
}) {
  const turns = [{who:"owner",meta:"Tú · día 90",text:chat.title},{who:"laia",meta:"LAIA · demo",text:chat.preview},{who:"laia",meta:"LAIA · demo",text:idea.n===1?"Podemos preparar un recordatorio a las 48 horas y revisar la autorización antes de contactar.":idea.n===2?"Comparemos venta directa con una comisión de 150 € por cliente al mes.":"Revisemos los costes de voz antes de cambiar proveedores."}];
  return (
    <main className="co-page">
      <header className="co-page-head co-chat-head">
        <div>
          <button type="button" className="co-backlink" onClick={onBack}>
            <ArrowLeft size={13} /> Conversaciones
          </button>
          <span className="co-kicker">
            Idea {String(idea.n).padStart(2, "0")} · {chat.state}
          </span>
          <h1>{chat.title}</h1>
          <p>
            {idea.name} · rama {idea.branch} · independiente de la versión activa
          </p>
        </div>
        <div className="co-head-actions">
          <span className="co-status">
            <span className="co-status-dot" /> Sin publicar
          </span>
          <button type="button" className="co-btn co-btn--ghost" onClick={() => onToast("Idea duplicada como alternativa en la demo.")}>
            <Copy size={15} /> Duplicar idea
          </button>
          <button type="button" className="co-btn co-btn--solid" onClick={() => onToast("Idea aparcada. No se ha publicado ningún cambio.")}>
            <Archive size={15} /> Aparcar
          </button>
        </div>
      </header>

      <div className="co-conv-layout">
        <section className="co-conv" aria-label="Conversación con LAIA">
          <div className="co-conv-day">
            <span>Hoy · día 90</span>
          </div>
          {turns.map((turn, i) => (
            <div className={`co-msg co-msg--${turn.who}`} key={i}>
              <span className="co-msg-avatar">{turn.who === "laia" ? <Sparkles size={13} /> : "AF"}</span>
              <div>
                <span className="co-msg-meta">{turn.meta}</span>
                <p>{turn.text}</p>
              </div>
            </div>
          ))}

          <div className="co-conv-note">
            <Sparkles size={15} />
            <p>
              Recuerda: esta conversación no toca la empresa activa. Lo que se acuerde aquí vive en el
              borrador hasta que se publique.
            </p>
          </div>

          <article className="co-proposal">
            <header>
              <span className="co-kicker">Propuesta de esta conversación</span>
              <h3>Seguimiento comercial</h3>
              <p>{chat.preview}</p>
            </header>
            <div className="co-proposal-grid">
              {[
                "Modelo de negocio",
                "Diseño estratégico",
                "Diseño económico",
                "Diseño organizativo",
                "Ingeniería de procesos",
              ].map((label) => (
                <span key={label}>
                  <Check size={13} /> {label}
                </span>
              ))}
            </div>
            <footer>
              <small>No se aplica nada hasta publicar una versión.</small>
              <button
                type="button"
                className="co-btn co-btn--solid"
                onClick={() => onToast("Propuesta añadida al borrador V8 en la demo.")}
              >
                Añadir al borrador <ArrowUpRight size={14} />
              </button>
            </footer>
          </article>

          <form
            className="co-composer"
            onSubmit={(event) => {
              event.preventDefault();
              onToast("Mensaje registrado en la demo. No hay modelo conectado.");
            }}
          >
            <input placeholder="Sigue pensando en voz alta…" aria-label="Escribir a LAIA" />
            <button type="submit" aria-label="Enviar">
              <Send size={15} />
            </button>
          </form>
        </section>

        <aside className="co-conv-side" aria-label="Inspector de la idea">
          <section className="co-insp-card co-idea-card">
            <span className="co-kicker">Idea en desarrollo</span>
            <h3>{idea.name}</h3>
            <p>{chat.preview}</p>
            <div className="co-idea-meta">
              <span>Rama</span>
              <b>{idea.branch}</b>
            </div>
            <div className="co-idea-meta">
              <span>Empresa activa</span>
              <b>V7 · intacta</b>
            </div>
          </section>

          <section className="co-insp-card">
            <header>
              <span className="co-kicker">Esta conversación alimenta</span>
              <em className="co-count">5</em>
            </header>
            {[
              ["Modelo de negocio", "Propuesta"],
              ["Diseño estratégico", "Borrador"],
              ["Diseño económico", "Borrador"],
              ["Diseño organizativo", "Sin tocar"],
              ["Ingeniería de procesos", "Sin tocar"],
            ].map(([label, state]) => (
              <div className="co-linked" key={label}>
                <span>
                  <b>{label}</b>
                  <small>{idea.branch}</small>
                </span>
                <em className={state === "Propuesta" ? "is-hot" : state === "Sin tocar" ? "is-off" : ""}>{state}</em>
              </div>
            ))}
          </section>

          <section className="co-insp-card">
            <header>
              <span className="co-kicker">Documentos generados</span>
            </header>
            {["One pager", "Business plan", "Presupuesto"].map((doc) => (
              <button type="button" className="co-evidence" key={doc} onClick={() => onToast("Documento previsto; apertura no conectada.")}>
                <FileText size={15} />
                <span>
                  <b>{doc}</b>
                  <small>Agntia Demo · versión de trabajo</small>
                </span>
                <ArrowUpRight size={13} />
              </button>
            ))}
          </section>

          <section className="co-insp-card co-insp-card--next">
            <span className="co-kicker">Siguiente paso</span>
            <p>Revisa la propuesta y sus dependencias. Nada de esto afecta a la empresa que ya está operando.</p>
            <button type="button" className="co-btn co-btn--ghost" onClick={() => onToast("Comparativa de alternativas: pendiente de conectar.")}>
              Comparar alternativas <ArrowUpRight size={14} />
            </button>
          </section>
        </aside>
      </div>
    </main>
  );
}

/* ------------------------------------------------------------------ shell */

export default function CompanyApp({ onClose }: { onClose: () => void }) {
  const [sectionId, setSectionId] = useState<SectionId>("estudio");
  const [version, setVersion] = useState(VERSIONS[0]);
  const [versionOpen, setVersionOpen] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [notice, setNotice] = useState("");
  const [selected, setSelected] = useState<string[] | null>(null);
  const [chats, setChats] = useState<Chat[]>(SEED_CHATS);
  const [chatId, setChatId] = useState<string | null>(null);
  const [chatsOpen, setChatsOpen] = useState(true);
  const scroller = useRef<HTMLDivElement>(null);
  const section = SECTIONS.find((s) => s.id === sectionId) ?? SECTIONS[0];
  const content = COMPANY_DATA[section.id];
  const activeChat = chats.find((c) => c.id === chatId) ?? null;
  const activeIdea = activeChat ? IDEAS.find((i) => i.n === activeChat.idea) ?? IDEAS[0] : null;

  const newChat = () => {
    const id = `chat-${Date.now()}`;
    setChats((list) => [
      { id, idea: 1, title: section.label, preview: content.next, when: "Ahora", state: "Explorando" },
      ...list,
    ]);
    setChatId(id);
    setChatsOpen(true);
    setDrawer(false);
  };

  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 });
  }, [sectionId, chatId]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (drawer) setDrawer(false);
      else if (versionOpen) setVersionOpen(false);
      else onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawer, versionOpen, onClose]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 3200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const choose = (id: SectionId) => {
    setSectionId(id);
    setSelected(null);
    setChatId(null);
    setDrawer(false);
  };

  return (
    <div className="co-root" role="dialog" aria-modal="true" aria-label="Tu Empresa · estudio de compilación">
      <button
        type="button"
        className={"co-scrim" + (drawer ? " is-on" : "")}
        aria-label="Cerrar menú"
        onClick={() => setDrawer(false)}
      />

      <aside className={"co-rail" + (collapsed ? " is-collapsed" : "") + (drawer ? " is-open" : "")}>
        <div className="co-brand">
          <div className="co-brand-mark" aria-hidden="true">
            <span />
          </div>
          <div className="co-brand-text">
            <small>AgntiaPro</small>
            <strong>Tu Empresa</strong>
            <em>Estudio de compilación</em>
          </div>
          <button type="button" className="co-rail-close" aria-label="Cerrar menú" onClick={() => setDrawer(false)}>
            <X size={16} />
          </button>
        </div>

        <div className="co-version">
          <button type="button" onClick={() => setVersionOpen((v) => !v)} aria-expanded={versionOpen}>
            <span className="co-version-dot" />
            <span>
              <b>{version}</b>
              <small>Vista simulada</small>
            </span>
            <ChevronDown size={14} />
          </button>
          {versionOpen && (
            <div className="co-version-menu" role="listbox" aria-label="Versión de la empresa">
              {VERSIONS.map((v) => (
                <button
                  type="button"
                  key={v}
                  role="option"
                  aria-selected={v === version}
                  onClick={() => {
                    setVersion(v);
                    setVersionOpen(false);
                    setNotice("Vista cambiada. En esta demo no se carga otra versión real.");
                  }}
                >
                  {v}
                  {v === version && <Check size={14} />}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="co-chats">
          <button
            type="button"
            className="co-chats-head"
            aria-expanded={chatsOpen}
            onClick={() => setChatsOpen((value) => !value)}
          >
            <span>
              <MessageSquare size={13} /> Conversaciones <em>{chats.length}</em>
            </span>
            <ChevronDown size={13} className={chatsOpen ? "" : "is-closed"} />
          </button>
          {chatsOpen && (
            <div className="co-chats-list">
              {IDEAS.map((idea) => {
                const mine = chats.filter((c) => c.idea === idea.n);
                if (!mine.length) return null;
                return (
                  <div className="co-chat-group" key={idea.id}>
                    <small>
                      <span className="co-idea-dot" data-idea={idea.n} /> {idea.short}
                    </small>
                    {mine.map((chat) => (
                      <button
                        type="button"
                        key={chat.id}
                        className={"co-chat" + (chat.id === chatId ? " is-active" : "")}
                        onClick={() => {
                          setChatId(chat.id);
                          setDrawer(false);
                        }}
                      >
                        <b>{chat.title}</b>
                        <span>{chat.preview}</span>
                        <em>
                          {chat.when} · {chat.state}
                        </em>
                      </button>
                    ))}
                  </div>
                );
              })}
              <button type="button" className="co-chat-new" onClick={newChat}>
                <Plus size={12} /> Nueva conversación
              </button>
            </div>
          )}
        </div>

        <nav className="co-nav" aria-label="Secciones del compilador">
          {GROUPS.map((group) => (
            <div className="co-nav-group" key={group}>
              <small>{group}</small>
              {SECTIONS.filter((s) => s.group === group).map(({ id, label, icon: Icon }) => (
                <button
                  type="button"
                  key={id}
                  className={id === sectionId ? "is-active" : ""}
                  aria-current={id === sectionId ? "page" : undefined}
                  title={label}
                  onClick={() => choose(id)}
                >
                  <Icon size={16} />
                  <span>{label}</span>
                  {id === "versiones" && <em className="co-nav-badge">3</em>}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="co-rail-foot">
          <div className="co-completeness">
            <div>
              <span>Objetivo clientes</span>
              <b>8 / 10</b>
            </div>
            <span className="co-progress-track">
              <i style={{ width: "80%" }} />
            </span>
            <small>Escenario de 90 días</small>
          </div>
          <button type="button" className="co-back" onClick={onClose}>
            <ArrowLeft size={15} />
            <span>Volver a la app</span>
          </button>
          <div className="co-user">
            <span className="co-avatar">AF</span>
            <div>
              <b>Agntia Demo</b>
              <small>Propietario · demo</small>
            </div>
            <PanelLeft size={15} />
          </div>
        </div>
      </aside>

      <div className="co-stage">
        <header className="co-top">
          <div className="co-top-left">
            <button type="button" className="co-icon-btn co-only-mobile" aria-label="Abrir menú" onClick={() => setDrawer(true)}>
              <Menu size={17} />
            </button>
            <button
              type="button"
              className="co-icon-btn co-only-desktop"
              aria-label={collapsed ? "Expandir menú" : "Plegar menú"}
              onClick={() => setCollapsed((v) => !v)}
            >
              <PanelLeft size={17} />
            </button>
            <nav className="co-crumb" aria-label="Ruta">
              <span>Tu Empresa</span>
              <ChevronRight size={13} />
              <b>{activeChat ? "Conversaciones" : section.label}</b>
            </nav>
          </div>
          <div className="co-top-right">
            <span className="co-demo"><span /> Datos sintéticos</span>
            <label className="co-top-search">
              <Search size={14} />
              <input placeholder="Buscar en la compilación…" aria-label="Buscar en la compilación" />
            </label>
            <button type="button" className="co-btn co-btn--ghost co-only-desktop">
              <Plus size={15} /> Nuevo
            </button>
            <button type="button" className="co-btn co-btn--solid" onClick={() => setNotice("Publicar llegará cuando conectemos el backend.")}>
              Publicar borrador
            </button>
            <span className="co-avatar co-avatar--sm">AF</span>
          </div>
        </header>

        <div className="co-scroll" ref={scroller}>
          {activeChat && activeIdea ? (
            <ChatView chat={activeChat} idea={activeIdea} onBack={() => setChatId(null)} onToast={setNotice} />
          ) : (
          <main className="co-page">
            <header className="co-page-head">
              <div>
                <span className="co-kicker">
                  {section.group} · {String(SECTIONS.findIndex((s) => s.id === sectionId) + 1).padStart(2, "0")}
                </span>
                <h1>{section.label}</h1>
                <p>{content.hero} {content.desc}</p>
              </div>
              <div className="co-head-actions">
                <span className="co-status">
                  <span className="co-status-dot" /> {version}
                </span>
                <button type="button" className="co-btn co-btn--ghost" onClick={newChat}>
                  <Sparkles size={15} /> Abrir con LAIA
                </button>
                <button type="button" className="co-btn co-btn--solid" onClick={()=>setNotice("Acción prevista: "+content.action+". Sin cambios reales.")}>
                  {content.action} <Plus size={15} />
                </button>
              </div>
            </header>

            <div className="co-page-body">
              <div className="co-main"><Workspace key={sectionId} section={section} onSelect={setSelected}/></div>

              <aside className="co-inspector" aria-label="Inspector contextual">
 <section className="co-insp-card"><span className="co-kicker">Contexto · {section.label}</span><h3>{selected?.[0]??content.hero}</h3><p>{selected?selected.slice(1).join(" · "):content.desc}</p>{selected&&<button className="co-mini" onClick={()=>setSelected(null)}>Cerrar detalle</button>}</section>
 <section className="co-insp-card"><span className="co-kicker">Siguiente paso</span><p>{content.next}</p><button className="co-btn co-btn--ghost" onClick={newChat}>Hablar con LAIA <ArrowUpRight size={14}/></button></section>
 <section className="co-insp-card"><span className="co-kicker">Procedencia</span><p>Kickoff CEO · Visión founder · Dataset Agntia Demo</p><p>Datos sintéticos. No certifican capacidades operativas.</p><button className="co-mini" onClick={()=>choose("fuentes")}>Ver fuentes</button></section>
 </aside>
            </div>

            <footer className="co-page-foot">
              <span>AGNTIAPRO · TU EMPRESA · DEMO</span>
              <span>Seguimiento comercial · contenido de ejemplo</span>
              <span className="co-foot-icons">
                <BarChart3 size={14} />
                <CalendarDays size={14} />
                <Globe2 size={14} />
              </span>
            </footer>
          </main>
          )}
        </div>
      </div>

      {notice && (
        <div className="co-toast" role="status">
          <Check size={15} /> {notice}
        </div>
      )}
    </div>
  );
}
