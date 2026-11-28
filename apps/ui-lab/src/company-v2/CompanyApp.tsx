import MetaChats from "../smart-ux/MetaChats";
import MetaDock from "../smart-ux/MetaDock";
import { OrderAnnounce, OrderGhost } from "../smart-ux/OrderGhost";
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
  Keyboard,
  Layers,
  Lock,
  Menu,
  MessageSquare,
  Mic,
  Palette,
  PanelLeft,
  Pin,
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
import { COMPANY_VISUALS } from "./company-visuals";
import "./company-visuals.css";
import {
  SmartCommandPalette,
  SmartShortcuts,
  useSmartNav,
  type SmartCommand,
  type SmartShortcut,
} from "../smart-ux/smart-ux";

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

const SECTION_IDS = SECTIONS.map((section) => section.id);

const VERSIONS = ["V8 · borrador", "V7 · activa", "ALT-B · explorando", "ALT-C · aparcada"];

/* ------------------------------------------------------------- ideas y chats
 * Las conversaciones del compilador pertenecen a una idea, no a la empresa
 * activa. Varias ideas conviven en paralelo y cada una tiene su propia rama de
 * borrador: hablar no cambia nada hasta que una propuesta se publica. */
type ChatState = "Explorando" | "Con propuesta" | "Aparcada";
type ChatTurn = { who: "laia" | "owner"; text: string; meta: string };
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
const seedTurns = (chat: Chat, idea: Idea): ChatTurn[] => [
  { who: "owner", meta: "Tú · " + chat.when, text: chat.title },
  { who: "laia", meta: "LAIA · demo", text: chat.preview },
  {
    who: "laia",
    meta: "LAIA · demo",
    text:
      idea.n === 1
        ? "Podemos preparar un recordatorio a las 48 horas y revisar la autorización antes de contactar."
        : idea.n === 2
          ? "Comparemos venta directa con una comisión de 150 € por cliente al mes."
          : "Revisemos los costes de voz antes de cambiar proveedores.",
  },
];
type Content = (typeof COMPANY_DATA)[SectionId];
function Panel({title,hint,children,className=""}:{title:string;hint?:string;children:ReactNode;className?:string}) {
 return <section className={"co-panel "+className}><header className="co-panel-head"><div><h2>{title}</h2>{hint&&<p>{hint}</p>}</div></header>{children}</section>;
}
function Table({rows,headers=["Elemento","Detalle","Estado"],onSelect}:{rows:string[][];headers?:string[];onSelect:(row:string[])=>void}) {
 const [query,setQuery]=useState("");
 const filtered=rows.filter(row=>row.join(" ").toLocaleLowerCase().includes(query.toLocaleLowerCase()));
 return <><label className="co-search"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar registros…" aria-label="Buscar registros"/></label><div className="co-table-wrap"><table className="co-table"><thead><tr>{headers.map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{filtered.map((row,i)=><tr key={i}>{row.map((cell,j)=><td key={j}>{j===0?<button type="button" className="co-mini" onClick={()=>onSelect(row)}>{cell}<ChevronRight size={13}/></button>:j===row.length-1?<span className="co-tag">{cell}</span>:cell}</td>)}</tr>)}</tbody></table>{!filtered.length&&<p className="co-text">No hay registros que coincidan.</p>}</div></>;
}
function Progress({label,value}:{label:string;value:number}) {return <div className="co-progress"><div><span>{label}</span><b>{value} %</b></div><span className="co-progress-track"><i style={{width:value+"%"}}/></span></div>;}
function SectionArt({section}:{section:Section}) {
 return <img className="co-section-art" src={COMPANY_VISUALS[section.id].hero} alt="" width={1536} height={1024} decoding="async"/>;
}
function SemanticIcon({id,index=0}:{id:SectionId;index?:0|1|2}) {
 return <img className="co-semantic-icon" src={COMPANY_VISUALS[id].icons[index].src} alt="" width={1024} height={1024} decoding="async"/>;
}
function SectionSymbols({section,exclude=[]}:{section:Section;exclude?:number[]}) {
 return <div className="co-section-symbols" aria-label={"Conceptos de "+section.label}>{COMPANY_VISUALS[section.id].icons.filter((_,index)=>!exclude.includes(index)).map(icon=><div key={icon.label}><img src={icon.src} alt="" width={1024} height={1024} decoding="async"/><span>{icon.label}</span></div>)}</div>;
}
function Workspace({section,onSelect}:{section:Section;onSelect:(row:string[])=>void}) {
 const d:Content=COMPANY_DATA[section.id];
 const primary=d.primary;
 const rows=d.rows;
 const stats=()=> <div className="co-stats">{primary.map(([label,value])=><button type="button" className="co-stat" key={label} onClick={()=>onSelect([label,value])}><small>{label}</small><strong>{value}</strong><span>Escenario simulado</span></button>)}</div>;
 const table=()=> <Panel title={section.variant==="table"?section.label:"Registros y propuestas"} hint="Selecciona un registro para consultar su detalle."><Table rows={rows} headers={section.variant==="table"?primary[0]:undefined} onSelect={onSelect}/></Panel>;
 switch(section.variant){
 case "dashboard": return <><div className="co-visual-intro"><div><h2>{d.hero}</h2><p>{d.desc}</p><SectionSymbols section={section} exclude={[1]}/></div><SectionArt section={section}/></div>{stats()}<div className="co-cols"><Panel title="Ideas en desarrollo">{rows.map(row=><button type="button" className="co-row" key={row[0]} onClick={()=>onSelect(row)}><span className="co-row-icon"><SemanticIcon id="estudio" index={1}/></span><span className="co-row-body"><b>{row[0]}</b><small>{row[1]}</small></span><span className="co-tag">{row[2]}</span><ChevronRight size={15}/></button>)}</Panel><Panel title="Tu siguiente paso"><p className="co-text">{d.next}</p><Progress label="Objetivo de clientes" value={80}/></Panel></div></>;
 case "table": return <>{table()}<SectionSymbols section={section}/></>;
 case "cards": return <><div className="co-visual-intro"><SectionArt section={section}/>{section.id==="entrevistas"&&<SectionSymbols section={section} exclude={[0]}/>}</div>{section.id==="branding"&&<Panel title="Identidad visual" hint="Paleta de referencia del andamio"><div className="co-swatches">{["#2b2a26","#8c7a5f","#c9b99c","#e6ded0","#f4f0e6"].map(color=><div key={color}><span style={{background:color}}/><small>{color}</small></div>)}</div></Panel>}<div className="co-cards">{rows.map(row=><article className="co-card" key={row[0]}><div className="co-img"><SemanticIcon id={section.id} index={section.id==="branding"?(row[0]==="Plantilla propuesta"?1:row[0]==="Avatar LAIA"?2:0):0}/><span>{section.id==="branding"?"Activo de marca":"Entrevista simulada"}</span></div><div><h3>{row[0]}</h3><p>{row[1]}</p><div className="co-card-foot"><span className="co-tag">{row[2]}</span><button type="button" aria-label={"Abrir "+row[0]} onClick={()=>onSelect(row)}><ArrowUpRight size={16}/></button></div></div></article>)}</div><Panel title="Siguiente paso"><p className="co-text">{d.next}</p></Panel></>;
 case "editorial": return <><div className="co-editorial"><div><SectionArt section={section}/><span className="co-kicker">Nuestra identidad</span><h2>{d.hero}</h2>{primary.map(([label,value])=><div key={label}><h3>{label}</h3><p className="co-text">{value}</p></div>)}<blockquote>«La tecnología tiene que adaptarse a las personas.»<small>Visión founder · síntesis editorial</small></blockquote><SectionSymbols section={section}/></div><aside className="co-facts">{rows.map(row=><div key={row[0]}><small>{row[2]}</small><b>{row[0]}</b><span>{row[1]}</span></div>)}</aside></div></>;
 case "canvas": return <><SectionSymbols section={section}/><div className="co-canvas" style={{"--cols":3} as CSSProperties}>{primary.map(([label,value],i)=><section className="co-node" key={label}><header><span>{String(i+1).padStart(2,"0")}</span><button type="button" aria-label={"Revisar "+label} onClick={()=>onSelect([label,value])}><ChevronDown size={14}/></button></header><h3>{label}</h3><p>{value}</p></section>)}</div>{table()}</>;
 case "chart": {const finance=section.id==="economia";const values=finance?[5000,9500,12500]:[2,5,8];return <>{stats()}<SectionSymbols section={section}/><div className="co-cols co-cols--wide"><Panel title={finance?"Facturación por mes":"Clientes acumulados"} hint="Tres meses · escenario sintético"><div className="co-bars" aria-label={values.join(", ")}>{values.map((v,i)=><span key={i} title={"Mes "+(i+1)+": "+v} style={{height:(v/(finance?12500:10)*100)+"%"}}/>)}</div><div className="co-legend">{values.map((v,i)=><span key={i}>Mes {i+1}: {v.toLocaleString("es-ES")}{finance?" €":""}</span>)}</div></Panel><Panel title="Lectura del escenario"><p className="co-text">{d.next}</p>{!finance&&<Progress label="Objetivo de clientes" value={80}/>}</Panel></div>{table()}</>;}
 case "flow": return <>{section.id==="procesos"&&<SectionSymbols section={section} exclude={[0,2]}/>}<div className="co-flow">{primary.map(([label,value],i)=><div className="co-flow-step" key={label}><div className="co-flow-node"><span className="co-flow-icon"><SemanticIcon id={section.id} index={section.id==="procesos"?(i===2?2:0):(i===3?2:i===1?1:0)}/></span><div><small>Paso {i+1}</small><b>{label}</b><span>{value}</span></div><span className="co-tag">Diseño</span></div>{i<primary.length-1&&<ChevronDown className="co-flow-arrow" size={16}/>}</div>)}</div>{table()}</>;
 case "matrix": return <><SectionSymbols section={section}/><Panel title={section.id==="mercado"?"Segmentos y necesidades":"Mapa de aprendizaje"} hint="Evidencia y estados de la simulación"><Table rows={rows} headers={primary[0]} onSelect={onSelect}/></Panel><Panel title="Qué necesitamos comprobar"><p className="co-text">{d.next}</p></Panel></>;
 case "org": return <><SectionSymbols section={section}/><Panel title="Organigrama funcional" hint="Equipo híbrido · escenario simulado"><div className="co-org"><div className="co-org-top"><div className="co-person co-person--lead"><span className="co-avatar">OW</span><div><b>Owner</b><small>Autoridad final</small></div></div></div><div className="co-org-line"/><div className="co-org-row co-org-row--agents">{primary.slice(1).map(([label,value])=><div className="co-person co-person--ai" key={label}><span className="co-avatar"><Sparkles size={14}/></span><div><b>{label}</b><small>{value}</small></div><span className="co-tag">IA</span></div>)}</div></div></Panel>{table()}</>;
 case "timeline": return <><SectionSymbols section={section} exclude={[2]}/><div className="co-cols co-cols--wide"><Panel title="Versiones y alternativas"><ol className="co-versions">{primary.map(([label,value],i)=><li key={label} className={i===0?"is-draft":""}><span className="co-version-dot"/><div><b>{label}</b><p>{value}</p></div><span className="co-tag">{["Borrador","Activa demo","Explorando","Aparcada"][i]}</span></li>)}</ol></Panel><Panel title="Publicación pendiente"><div className="co-publish"><SemanticIcon id="versiones" index={2}/><Lock size={18}/><p>{d.next}</p></div></Panel></div>{table()}</>;
 }
}
/* ------------------------------------------------------------- conversación */

function ChatView({
  chat,
  idea,
  turns,
  draft,
  thinking,
  onDraft,
  onSend,
  onBack,
  onToast,
}: {
  chat: Chat;
  idea: Idea;
  turns: ChatTurn[];
  draft: string;
  thinking: boolean;
  onDraft: (value: string) => void;
  onSend: (text: string) => void;
  onBack: () => void;
  onToast: (message: string) => void;
}) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest" });
  }, [turns.length, thinking]);

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
          <button type="button" className="co-btn co-btn--ghost" onClick={() => onToast("Duplicar idea: acción prevista, sin cambios guardados.")}>
            <Copy size={15} /> Duplicar idea
          </button>
          <button type="button" className="co-btn co-btn--solid" onClick={() => onToast("Aparcar idea: acción prevista, sin cambios guardados.")}>
            <Archive size={15} /> Aparcar
          </button>
        </div>
      </header>

      <div className="co-conv-layout">
        <section className="co-conv" aria-label="Conversación con LAIA">
          <div className="co-conv-day">
            <span>Hoy · día 90</span>
          </div>
          {turns.length === 0 && (
            <div className="co-chat-empty">
              <span className="co-chat-empty-mark">
                <Sparkles size={16} />
              </span>
              <b>Empieza por lo que quieres cambiar</b>
              <p>Cuéntale la idea a LAIA. Nada toca la empresa activa hasta que publiques una versión.</p>
            </div>
          )}
          {turns.map((turn, i) => (
            <div className={`co-msg co-msg--${turn.who}`} key={i}>
              <span className="co-msg-avatar">{turn.who === "laia" ? <Sparkles size={13} /> : "OW"}</span>
              <div>
                <span className="co-msg-meta">{turn.meta}</span>
                <p>{turn.text}</p>
              </div>
            </div>
          ))}
          {thinking && (
            <div className="co-msg co-msg--laia co-msg--typing" role="status">
              <span className="co-msg-avatar">
                <Sparkles size={13} />
              </span>
              <div>
                <span className="co-msg-meta">LAIA · escribiendo</span>
                <span className="co-typing" aria-label="LAIA está escribiendo">
                  <i />
                  <i />
                  <i />
                </span>
              </div>
            </div>
          )}
          <div ref={endRef} />

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
              <h3>{idea.name}</h3>
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
                onClick={() => onToast("Añadir propuesta: acción prevista, sin cambios guardados.")}
              >
                Añadir al borrador <ArrowUpRight size={14} />
              </button>
            </footer>
          </article>

          <form
            className="co-composer"
            onSubmit={(event) => {
              event.preventDefault();
              onSend(draft);
            }}
          >
            <input
              value={draft}
              onChange={(event) => onDraft(event.target.value)}
              placeholder="Sigue pensando en voz alta…"
              aria-label="Escribir a LAIA"
              autoComplete="off"
            />
            <span className="co-composer-hint" aria-hidden="true">↵</span>
            <button type="submit" aria-label="Enviar" disabled={!draft.trim() || thinking}>
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
  const {
    sectionId,
    go,
    recents,
    pins,
    collapsed,
    isPinned,
    togglePin,
    setCollapsed,
    paletteOpen,
    openPalette,
    closePalette,
    shortcutsOpen,
    openShortcuts,
    closeShortcuts,
    sortSections,
    bindRow,
    orderDrag,
    orderAnnounce,
  } = useSmartNav<SectionId>({
    storageKey: "agntia_company_smart_v1",
    ids: SECTION_IDS,
    initial: "estudio",
  });
  const choose = (id: SectionId) => {
    go(id);
    setSelected(null);
    setChatId(null);
    setDrawer(false);
  };
  const [version, setVersion] = useState(() => {
    try {
      const stored = window.localStorage.getItem("agntia_company_version");
      return stored && VERSIONS.includes(stored) ? stored : VERSIONS[0];
    } catch {
      return VERSIONS[0];
    }
  });
  const [versionOpen, setVersionOpen] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [notice, setNotice] = useState("");
  const [selected, setSelected] = useState<string[] | null>(null);
  const [chats, setChats] = useState<Chat[]>(SEED_CHATS);
  const [chatId, setChatId] = useState<string | null>(null);
  
  const [messages, setMessages] = useState<Record<string, ChatTurn[]>>({});
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [thinking, setThinking] = useState<string | null>(null);
  const timers = useRef<number[]>([]);
  const scroller = useRef<HTMLDivElement>(null);
  const section = SECTIONS.find((s) => s.id === sectionId) ?? SECTIONS[0];
  const content = COMPANY_DATA[section.id];
  const activeChat = chats.find((c) => c.id === chatId) ?? null;
  const activeIdea = activeChat ? IDEAS.find((i) => i.n === activeChat.idea) ?? IDEAS[0] : null;
  const activeTurns = activeChat
    ? messages[activeChat.id] ?? seedTurns(activeChat, activeIdea ?? IDEAS[0])
    : [];

  const newChat = () => {
    const id = `chat-${Date.now()}`;
    setChats((list) => [
      { id, idea: sectionId==="mercado"||sectionId==="modelo"||sectionId==="ecosistema"?2:sectionId==="economia"||sectionId==="tecnologia"?3:1, title: section.label, preview: content.next, when: "Ahora", state: "Explorando" },
      ...list,
    ]);
    setMessages((prev) => ({ ...prev, [id]: [] }));
    setChatId(id);

    setDrawer(false);
  };

  const nowTime = () => new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });

  const sendMessage = (chat: Chat, text: string) => {
    const clean = text.trim();
    if (!clean || thinking === chat.id) return;
    const seed = SEED_CHATS.some((entry) => entry.id === chat.id)
      ? seedTurns(chat, IDEAS.find((i) => i.n === chat.idea) ?? IDEAS[0])
      : [];
    setMessages((prev) => ({
      ...prev,
      [chat.id]: [...(prev[chat.id] ?? seed), { who: "owner", text: clean, meta: `Tú · ${nowTime()}` }],
    }));
    setDrafts((prev) => ({ ...prev, [chat.id]: "" }));
    setThinking(chat.id);
    const timer = window.setTimeout(() => {
      setMessages((prev) => ({
        ...prev,
        [chat.id]: [
          ...(prev[chat.id] ?? []),
          {
            who: "laia",
            text: "Anotado. Lo dejo en el borrador de esta idea; si quieres, lo convierto en propuesta y lo revisamos juntos.",
            meta: `LAIA · ${nowTime()}`,
          },
        ],
      }));
      setThinking((current) => (current === chat.id ? null : current));
      timers.current = timers.current.filter((id) => id !== timer);
    }, 900);
    timers.current.push(timer);
  };

  useEffect(() => () => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
  }, []);

  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 });
  }, [sectionId, chatId]);

  useEffect(() => {
    try {
      window.localStorage.setItem("agntia_company_version", version);
    } catch {
      // La demo sigue funcionando sin memoria de preferencias.
    }
  }, [version]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 3200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const openChat = (chat: Chat) => {
    setChatId(chat.id);

    setDrawer(false);
  };

  const shortcuts: SmartShortcut[] = [
    { group: "Navegación", keys: "⌘ K", label: "Buscar secciones y acciones" },
    { group: "Navegación", keys: "/", label: "Abrir la búsqueda" },
    { group: "Navegación", keys: "⌘ B", label: "Plegar o expandir el menú" },
    { group: "Navegación", keys: "Esc", label: "Cerrar capas y volver" },
    { group: "General", keys: "?", label: "Mostrar esta ayuda" },
  ];

  const paletteCommands: SmartCommand[] = [
    ...SECTIONS.map((entry): SmartCommand => {
      const Icon = entry.icon;
      return {
        id: entry.id,
        label: entry.label,
        group: entry.group,
        hint: `${entry.group} · ${version.split(" ·")[0]}`,
        keywords: `${entry.variant} ${entry.id}`,
        icon: <Icon size={15} />,
        canPin: true,
        run: () => choose(entry.id),
      };
    }),
    ...chats.map((chat): SmartCommand => ({
      id: `chat-${chat.id}`,
      label: chat.title,
      group: "Conversaciones",
      hint: `${chat.when} · ${chat.state}`,
      keywords: chat.preview,
      icon: <MessageSquare size={15} />,
      run: () => openChat(chat),
    })),
    {
      id: "action-new-chat",
      label: "Nueva conversación",
      group: "Acciones",
      hint: "Abre una idea en paralelo",
      icon: <Plus size={15} />,
      run: newChat,
    },
    {
      id: "action-publish",
      label: "Publicar borrador",
      group: "Acciones",
      hint: version,
      icon: <ArrowUpRight size={15} />,
      run: () => setNotice("Publicar llegará cuando conectemos el backend."),
    },
    {
      id: "action-version",
      label: "Cambiar de versión",
      group: "Acciones",
      hint: VERSIONS.join(" · "),
      icon: <Layers size={15} />,
      run: () => setVersionOpen(true),
    },
    {
      id: "action-rail",
      label: collapsed ? "Expandir menú" : "Plegar menú",
      group: "Acciones",
      shortcut: "⌘ B",
      icon: <PanelLeft size={15} />,
      run: () => setCollapsed((value) => !value),
    },
    {
      id: "action-shortcuts",
      label: "Atajos del teclado",
      group: "Acciones",
      shortcut: "?",
      icon: <Keyboard size={15} />,
      run: openShortcuts,
    },
    {
      id: "action-exit",
      label: "Volver a la app",
      group: "Sesión",
      icon: <ArrowLeft size={15} />,
      run: onClose,
    },
  ];

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing =
        target !== null &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          Boolean(target.isContentEditable));
      const mod = event.metaKey || event.ctrlKey;
      const key = event.key.toLowerCase();

      if (mod && key === "k") {
        event.preventDefault();
        event.stopImmediatePropagation();
        if (paletteOpen) closePalette();
        else openPalette();
        return;
      }
      if (mod && key === "b") {
        event.preventDefault();
        event.stopImmediatePropagation();
        setCollapsed((value) => !value);
        return;
      }
      if (!mod && !typing && (event.key === "/" || event.key === "?")) {
        event.preventDefault();
        event.stopImmediatePropagation();
        if (event.key === "?") openShortcuts();
        else openPalette();
        return;
      }
      if (event.key !== "Escape") return;
      event.stopImmediatePropagation();
      if (paletteOpen) closePalette();
      else if (shortcutsOpen) closeShortcuts();
      else if (drawer) setDrawer(false);
      else if (versionOpen) setVersionOpen(false);
      else onClose();
    };
    // Captura: la meta-app tiene prioridad sobre los atajos del shell que queda
    // debajo, para que ⌘K no abra dos paletas a la vez.
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [
    paletteOpen,
    shortcutsOpen,
    drawer,
    versionOpen,
    onClose,
    openPalette,
    closePalette,
    openShortcuts,
    closeShortcuts,
    setCollapsed,
  ]);

  return (
    <div className="co-root meta-dock-root" role="dialog" aria-modal="true" aria-label="Tu Empresa · estudio de compilación">
      <MetaDock entries={SECTIONS} activeView={sectionId} onSelectView={choose} namespace="agntia_co"/>
      <OrderGhost drag={orderDrag}/>
      <OrderAnnounce text={orderAnnounce}/>
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

        <MetaChats namespace="agntia_company" items={chats} active={chatId} onSelect={id=>{setChatId(id);setDrawer(false)}} onRename={(id,title)=>setChats(list=>list.map(c=>c.id===id?{...c,title}:c))} onNew={newChat}/>
        <nav className="co-nav" aria-label="Secciones del compilador">
          {pins.length > 0 && (
            <div className="co-nav-group co-nav-group--pins">
              <small>
                <Pin size={10} aria-hidden="true" /> Fijados
              </small>
              {pins.map((id) => {
                const pinned = SECTIONS.find((entry) => entry.id === id);
                if (!pinned) return null;
                const Icon = pinned.icon;
                return (
                  <button
                    type="button"
                    key={`pin-${id}`}
                    className={id === sectionId ? "is-active" : ""}
                    aria-current={id === sectionId ? "page" : undefined}
                    title={`${pinned.label} · fijada`}
                    onClick={() => choose(pinned.id)}
                  >
                    <Icon size={16} />
                    <span>{pinned.label}</span>
                    <Pin size={11} className="co-nav-pinmark" aria-hidden="true" />
                  </button>
                );
              })}
            </div>
          )}
          {GROUPS.map((group) => (
            <div className="co-nav-group" key={group}>
              <small>{group}</small>
              {sortSections(SECTIONS.filter((s) => s.group === group)).map(({ id, label, icon: Icon }) => (
                <button
                  type="button"
                  key={id}
                  {...bindRow(id, label)}
                  className={id === sectionId ? "is-active" : ""}
                  aria-current={id === sectionId ? "page" : undefined}
                  title={label}
                  onClick={() => choose(id)}
                >
                  <Icon size={16} />
                  <span>{label}</span>
                  {isPinned(id) && <Pin size={11} className="co-nav-pinmark" aria-hidden="true" />}
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
            <span className="co-avatar">OW</span>
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
              <button type="button" className="co-crumb-root" onClick={() => choose("estudio")}>
                Tu Empresa
              </button>
              <ChevronRight size={13} />
              <span>{activeChat ? "Conversaciones" : section.group}</span>
              <ChevronRight size={13} />
              <b aria-current="page">{activeChat ? activeChat.title : section.label}</b>
            </nav>
          </div>
          <div className="co-top-right">
            <button
              type="button"
              className="co-icon-btn co-search-btn"
              aria-label="Buscar en la compilación"
              aria-haspopup="dialog"
              onClick={openPalette}
            >
              <Search size={16} />
            </button>
            <span className="co-demo"><span /> Datos sintéticos</span>
            <button
              type="button"
              className="co-top-search"
              onClick={openPalette}
              aria-haspopup="dialog"
              aria-keyshortcuts="Meta+K Control+K"
              title="Buscar secciones y acciones (⌘K)"
            >
              <Search size={14} />
              <span>Buscar en la compilación…</span>
              <kbd>⌘K</kbd>
            </button>
            <button type="button" className="co-btn co-btn--ghost co-only-desktop">
              <Plus size={15} /> Nuevo
            </button>
            <button type="button" className="co-btn co-btn--solid" onClick={() => setNotice("Publicar llegará cuando conectemos el backend.")}>
              Publicar borrador
            </button>
            <span className="co-avatar co-avatar--sm">OW</span>
          </div>
        </header>

        <div className="co-scroll" ref={scroller}>
          {activeChat && activeIdea ? (
            <ChatView
              key={activeChat.id}
              chat={activeChat}
              idea={activeIdea}
              turns={activeTurns}
              draft={drafts[activeChat.id] ?? ""}
              thinking={thinking === activeChat.id}
              onDraft={(value) => setDrafts((prev) => ({ ...prev, [activeChat.id]: value }))}
              onSend={(text) => sendMessage(activeChat, text)}
              onBack={() => setChatId(null)}
              onToast={setNotice}
            />
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
 <section className="co-insp-card">{!["dashboard","editorial","cards"].includes(section.variant)&&<SectionArt section={section}/>}<span className="co-kicker">Contexto · {section.label}</span><h3>{selected?.[0]??content.hero}</h3><p>{selected?selected.slice(1).join(" · "):content.desc}</p>{selected&&<button className="co-mini" onClick={()=>setSelected(null)}>Cerrar detalle</button>}</section>
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

      <SmartCommandPalette
        open={paletteOpen}
        tone="company"
        title="Buscar en Tu Empresa"
        subtitle={`${SECTIONS.length} secciones · ${chats.length} conversaciones`}
        placeholder="Buscar secciones, acciones o ideas…"
        commands={paletteCommands}
        recents={recents}
        pins={pins}
        onTogglePin={togglePin}
        onClose={closePalette}
        onShowShortcuts={openShortcuts}
      />
      <SmartShortcuts
        open={shortcutsOpen}
        tone="company"
        title="Atajos de Tu Empresa"
        shortcuts={shortcuts}
        onClose={closeShortcuts}
      />

      {notice && (
        <div className="co-toast" role="status">
          <Check size={15} /> {notice}
        </div>
      )}
    </div>
  );
}
