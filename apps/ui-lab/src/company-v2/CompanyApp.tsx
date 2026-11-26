// TU_EMPRESA_V1 - andamio de la meta-app.
// Clon del shell de AgntiaPro abierto desde Ajustes → Tu Empresa. Todo el
// contenido es lorem ipsum a propósito: primero se valida la estructura y el
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
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  Clock3,
  Compass,
  Cpu,
  FileText,
  FolderOpen,
  GitBranch,
  Globe2,
  GraduationCap,
  Handshake,
  Image as ImageIcon,
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
import {
  SmartCommandPalette,
  SmartShortcuts,
  useSmartNav,
  type SmartCommand,
  type SmartShortcut,
} from "../smart-ux/smart-ux";
import "./company.css";

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

const LOREM =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Cras mattis consectetur purus sit amet fermentum.";
const SHORT = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";
const TINY = "Lorem ipsum dolor sit amet.";

const VERSIONS = ["V1.3 · borrador", "V1.2 · activa", "V1.1", "V1.0"];

/* ------------------------------------------------------------- ideas y chats
 * Las conversaciones del compilador pertenecen a una idea, no a la empresa
 * activa. Varias ideas conviven en paralelo y cada una tiene su propia rama de
 * borrador: hablar no cambia nada hasta que una propuesta se publica. */
type ChatState = "Explorando" | "Con propuesta" | "Aparcada";
type ChatTurn = { who: "laia" | "owner"; text: string; meta: string };
type Idea = { n: number; id: string; name: string; short: string; branch: string };
type Chat = { id: string; idea: number; title: string; preview: string; when: string; state: ChatState };

const IDEAS: Idea[] = [
  { n: 1, id: "idea-01", name: "Lorem ipsum · nueva línea", short: "Idea 01 · Lorem", branch: "V1.3 borrador" },
  { n: 2, id: "idea-02", name: "Dolor sit · reorganización", short: "Idea 02 · Dolor", branch: "Alternativa B" },
];

const SEED_CHATS: Chat[] = [
  { id: "c1", idea: 1, title: "Lorem ipsum dolor sit", preview: "Consectetur adipiscing elit, sed do eiusmod tempor.", when: "Hoy", state: "Con propuesta" },
  { id: "c2", idea: 1, title: "Integer posuere erat", preview: "A ante venenatis dapibus posuere velit aliquet.", when: "Ayer", state: "Explorando" },
  { id: "c3", idea: 1, title: "Cras mattis consectetur", preview: "Purus sit amet fermentum, lorem ipsum dolor.", when: "12 nov", state: "Explorando" },
  { id: "c4", idea: 2, title: "Donec ullamcorper nulla", preview: "Non metus auctor fringilla, sed posuere.", when: "18 nov", state: "Aparcada" },
  { id: "c5", idea: 2, title: "Maecenas sed diam eget", preview: "Risus varius blandit sit amet non magna.", when: "9 nov", state: "Explorando" },
];

const initials = (name: string) => name.slice(0, 2).toUpperCase();

/* ------------------------------------------------------------------ piezas */

function Img({ tall = false }: { tall?: boolean }) {
  return (
    <div className={"co-img" + (tall ? " co-img--tall" : "")} aria-label="Imagen de ejemplo">
      <ImageIcon size={18} aria-hidden="true" />
      <span>imagen · lorem</span>
    </div>
  );
}

function Panel({
  title,
  hint,
  action,
  children,
  className = "",
}: {
  title: string;
  hint?: string;
  action?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={"co-panel " + className}>
      <header className="co-panel-head">
        <div>
          <h2>{title}</h2>
          {hint && <p>{hint}</p>}
        </div>
        {action && (
          <button type="button" className="co-mini">
            {action} <ArrowUpRight size={13} />
          </button>
        )}
      </header>
      {children}
    </section>
  );
}

function Table({ cols = 5, rows = 6 }: { cols?: number; rows?: number }) {
  return (
    <div className="co-table-wrap">
      <table className="co-table">
        <thead>
          <tr>
            {Array.from({ length: cols }, (_, i) => (
              <th key={i}>{i === 0 ? "Lorem" : `Lorem ${i + 1}`}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }, (_, r) => (
            <tr key={r}>
              {Array.from({ length: cols }, (_, c) => (
                <td key={c}>
                  {c === 0 ? (
                    <span className="co-cell-main">
                      <span className="co-dot" /> Lorem ipsum {String(r + 1).padStart(2, "0")}
                    </span>
                  ) : c === cols - 1 ? (
                    <span className="co-tag">Lorem</span>
                  ) : (
                    TINY
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Bars({ n = 7 }: { n?: number }) {
  const values = [46, 62, 54, 78, 70, 88, 96, 74, 82, 68];
  return (
    <div className="co-bars" aria-label="Gráfico de ejemplo">
      {values.slice(0, n).map((v, i) => (
        <span key={i} style={{ height: `${v}%` }} />
      ))}
    </div>
  );
}

function Progress({ label, value }: { label: string; value: number }) {
  return (
    <div className="co-progress">
      <div>
        <span>{label}</span>
        <b>{value} %</b>
      </div>
      <span className="co-progress-track">
        <i style={{ width: `${value}%` }} />
      </span>
    </div>
  );
}

/* ---------------------------------------------------------------- variantes */

function Dashboard() {
  return (
    <>
      <div className="co-stats">
        {["Lorem ipsum", "Dolor sit", "Amet consectetur", "Adipiscing elit"].map((label, i) => (
          <button type="button" className="co-stat" key={label}>
            <small>{label}</small>
            <strong>{["00", "0,0", "00 %", "0"][i]}</strong>
            <span>{TINY}</span>
          </button>
        ))}
      </div>
      <div className="co-cols">
        <Panel title="Lorem ipsum dolor" hint={SHORT} action="Lorem">
          {["Lorem ipsum dolor sit", "Consectetur adipiscing", "Integer posuere erat", "Cras mattis consectetur"].map(
            (row, i) => (
              <button type="button" className="co-row" key={row}>
                <span className="co-row-icon">
                  <Check size={14} />
                </span>
                <span className="co-row-body">
                  <b>{row}</b>
                  <small>{TINY}</small>
                </span>
                <span className="co-tag">{i < 2 ? "Lorem" : "Ipsum"}</span>
                <ChevronRight size={15} />
              </button>
            ),
          )}
        </Panel>
        <Panel title="Dolor sit amet" hint={SHORT}>
          <div className="co-progress-list">
            {["Lorem", "Ipsum dolor", "Sit amet", "Consectetur", "Adipiscing"].map((label, i) => (
              <Progress key={label} label={label} value={[82, 64, 47, 31, 18][i]} />
            ))}
          </div>
        </Panel>
      </div>
      <Panel title="Lorem ipsum" hint={SHORT}>
        <div className="co-hero">
          <Img tall />
          <div>
            <span className="co-kicker">Lorem ipsum dolor</span>
            <h3>Consectetur adipiscing elit</h3>
            <p>{LOREM}</p>
            <button type="button" className="co-btn co-btn--ghost">
              Lorem ipsum <ArrowUpRight size={15} />
            </button>
          </div>
        </div>
      </Panel>
    </>
  );
}

function TableView({ cols = 5 }: { cols?: number }) {
  return (
    <>
      <div className="co-toolbar">
        <label className="co-search">
          <Search size={16} />
          <input placeholder="Lorem ipsum dolor sit…" aria-label="Buscar (lorem)" />
        </label>
        <div className="co-chips">
          {["Lorem", "Ipsum", "Dolor", "Sit amet"].map((c, i) => (
            <button type="button" key={c} className={"co-chip" + (i === 0 ? " is-on" : "")}>
              {c}
            </button>
          ))}
        </div>
        <button type="button" className="co-btn co-btn--ghost">
          <Plus size={15} /> Lorem
        </button>
      </div>
      <Panel title="Lorem ipsum dolor" hint={SHORT} action="Lorem ipsum">
        <Table cols={cols} rows={7} />
      </Panel>
    </>
  );
}

function Cards({ swatches = false }: { swatches?: boolean }) {
  return (
    <>
      {swatches ? (
        <Panel title="Lorem ipsum palette" hint={SHORT}>
          <div className="co-swatches">
            {["#2b2a26", "#8c7a5f", "#c9b99c", "#e6ded0", "#f4f0e6"].map((color) => (
              <div key={color}>
                <span style={{ background: color }} />
                <b>{TINY}</b>
                <small>{color}</small>
              </div>
            ))}
          </div>
        </Panel>
      ) : (
        <div className="co-cards">
          {Array.from({ length: 4 }, (_, i) => (
            <article className="co-card" key={i}>
              <Img />
              <div>
                <span className="co-kicker">Lorem · {String(i + 1).padStart(2, "0")}</span>
                <h3>Lorem ipsum dolor</h3>
                <p>{SHORT}</p>
                <div className="co-card-foot">
                  <span className="co-tag">{i % 2 ? "Ipsum" : "Lorem"}</span>
                  <button type="button" aria-label="Abrir lorem">
                    <ArrowUpRight size={16} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
      <div className="co-cols">
        <Panel title="Lorem ipsum" hint={SHORT}>
          <div className="co-progress-list">
            {["Lorem", "Ipsum", "Dolor sit", "Amet"].map((l, i) => (
              <Progress key={l} label={l} value={[72, 58, 34, 21][i]} />
            ))}
          </div>
        </Panel>
        <Panel title="Dolor sit amet" hint={SHORT}>
          <p className="co-text">{LOREM}</p>
          <p className="co-text">{LOREM}</p>
        </Panel>
      </div>
    </>
  );
}

function Editorial() {
  return (
    <>
      <div className="co-editorial">
        <div>
          <span className="co-kicker">Lorem ipsum dolor</span>
          <h2>Consectetur adipiscing elit, sed do eiusmod tempor.</h2>
          <p className="co-text">{LOREM}</p>
          <p className="co-text">{LOREM}</p>
          <blockquote>
            «Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante venenatis.»
            <small>Lorem ipsum · dolor sit</small>
          </blockquote>
          <p className="co-text">{LOREM}</p>
        </div>
        <aside className="co-facts">
          {["Lorem ipsum", "Dolor sit", "Amet consectetur", "Adipiscing"].map((l, i) => (
            <div key={l}>
              <small>{l}</small>
              <b>{["00", "00", "0 %", "000"][i]}</b>
              <span>{TINY}</span>
            </div>
          ))}
        </aside>
      </div>
      <Panel title="Lorem ipsum dolor" hint={SHORT}>
        <div className="co-tag-grid">
          {["Lorem", "Ipsum dolor", "Sit amet", "Consectetur", "Adipiscing", "Eiusmod", "Tempor", "Labore"].map(
            (t) => (
              <span key={t} className="co-tag co-tag--lg">
                {t}
              </span>
            ),
          )}
        </div>
      </Panel>
    </>
  );
}

function Canvas({ cols = 3 }: { cols?: number }) {
  return (
    <>
      <div className="co-canvas" style={{ "--cols": cols } as CSSProperties}>
        {Array.from({ length: 6 }, (_, i) => (
          <section className="co-node" key={i}>
            <header>
              <span>{String(i + 1).padStart(2, "0")}</span>
              <button type="button" aria-label="Acciones lorem">
                <ChevronDown size={14} />
              </button>
            </header>
            <h3>Lorem ipsum</h3>
            <p>{SHORT}</p>
            <ul>
              <li>{TINY}</li>
              <li>{TINY}</li>
            </ul>
          </section>
        ))}
      </div>
      <Panel title="Lorem ipsum dolor sit amet" hint={SHORT} action="Lorem">
        <div className="co-doc">
          <div>
            <span className="co-kicker">Documento · lorem</span>
            <h3>Lorem ipsum dolor sit amet</h3>
            <p className="co-text">{LOREM}</p>
            <p className="co-text">{LOREM}</p>
          </div>
          <div className="co-doc-lines" aria-hidden="true">
            {[92, 78, 86, 64, 88, 72, 54].map((w, i) => (
              <span key={i} style={{ width: `${w}%` }} />
            ))}
          </div>
        </div>
      </Panel>
    </>
  );
}

function Chart() {
  return (
    <>
      <div className="co-stats co-stats--3">
        {["Lorem ipsum", "Dolor sit amet", "Consectetur"].map((l, i) => (
          <div className="co-stat" key={l}>
            <small>{l}</small>
            <strong>{["00.000 €", "0,0 %", "000"][i]}</strong>
            <span>{TINY}</span>
          </div>
        ))}
      </div>
      <div className="co-cols co-cols--wide">
        <Panel title="Lorem ipsum dolor" hint={SHORT} action="Lorem">
          <Bars n={8} />
          <div className="co-legend">
            {["Lorem", "Ipsum", "Dolor"].map((l) => (
              <span key={l}>
                <i /> {l}
              </span>
            ))}
          </div>
        </Panel>
        <Panel title="Dolor sit" hint={SHORT}>
          <div className="co-progress-list">
            {["Lorem", "Ipsum", "Dolor", "Amet"].map((l, i) => (
              <Progress key={l} label={l} value={[88, 66, 44, 27][i]} />
            ))}
          </div>
        </Panel>
      </div>
      <Panel title="Consectetur adipiscing" hint={SHORT}>
        <Table cols={4} rows={5} />
      </Panel>
    </>
  );
}

function Flow() {
  return (
    <>
      <div className="co-flow">
        {["Lorem", "Ipsum dolor", "Sit amet", "Consectetur"].map((label, i) => (
          <div className="co-flow-step" key={label}>
            <div className="co-flow-node">
              <span className="co-flow-icon">
                {i === 0 ? <Sparkles size={16} /> : i === 1 ? <Users size={16} /> : i === 2 ? <Workflow size={16} /> : <Check size={16} />}
              </span>
              <div>
                <small>{`Paso 0${i + 1}`}</small>
                <b>{label}</b>
                <span>{TINY}</span>
              </div>
              <span className="co-tag">{i === 3 ? "Lorem" : "Ipsum"}</span>
            </div>
            {i < 3 && <ChevronDown className="co-flow-arrow" size={16} />}
          </div>
        ))}
      </div>
      <div className="co-cols">
        <Panel title="Lorem ipsum" hint={SHORT} action="Lorem">
          <Table cols={4} rows={5} />
        </Panel>
        <Panel title="Dolor sit amet" hint={SHORT}>
          <div className="co-progress-list">
            {["Lorem", "Ipsum", "Dolor", "Amet", "Consectetur"].map((l, i) => (
              <Progress key={l} label={l} value={[94, 76, 61, 38, 22][i]} />
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}

function Matrix({ size = 6 }: { size?: number }) {
  const values = [3, 1, 2, 0, 1, 2, 2, 3, 1, 1, 0, 2, 1, 2, 3, 2, 1, 0, 2, 2, 1, 3, 2, 1, 1, 0, 2, 1, 2, 3, 2, 1, 1, 0, 2, 1];
  return (
    <>
      <div className="co-cols co-cols--wide">
        <Panel title="Lorem ipsum dolor" hint={SHORT} action="Lorem">
          <div className="co-matrix" style={{ "--size": size } as CSSProperties}>
            {values.slice(0, size * size).map((v, i) => (
              <span key={i} data-v={v} title={TINY} />
            ))}
          </div>
          <div className="co-legend">
            {["0", "1", "2", "3"].map((l) => (
              <span key={l}>
                <i data-v={l} /> Lorem {l}
              </span>
            ))}
          </div>
        </Panel>
        <Panel title="Dolor sit amet" hint={SHORT}>
          <div className="co-quote">
            <CircleAlert size={18} />
            <p>{LOREM}</p>
          </div>
          <div className="co-quote">
            <CircleAlert size={18} />
            <p>{SHORT}</p>
          </div>
        </Panel>
      </div>
      <Panel title="Consectetur adipiscing elit" hint={SHORT}>
        <Table cols={5} rows={6} />
      </Panel>
    </>
  );
}

function Org() {
  return (
    <>
      <Panel title="Lorem ipsum dolor" hint={SHORT} action="Lorem">
        <div className="co-org">
          <div className="co-org-top">
            <div className="co-person co-person--lead">
              <span className="co-avatar">LO</span>
              <div>
                <b>Lorem ipsum</b>
                <small>Dolor sit amet</small>
              </div>
            </div>
          </div>
          <div className="co-org-line" aria-hidden="true" />
          <div className="co-org-row">
            {["Lorem", "Ipsum", "Dolor"].map((l, i) => (
              <div className="co-person" key={l}>
                <span className="co-avatar">{initials(l)}</span>
                <div>
                  <b>{l} dolor</b>
                  <small>{["Sit amet", "Consectetur", "Adipiscing"][i]}</small>
                </div>
                <span className="co-tag">Lorem</span>
              </div>
            ))}
          </div>
          <div className="co-org-row co-org-row--agents">
            {["Ipsum", "Amet", "Elit"].map((l) => (
              <div className="co-person co-person--ai" key={l}>
                <span className="co-avatar">
                  <Sparkles size={14} />
                </span>
                <div>
                  <b>Agente · {l}</b>
                  <small>Lorem ipsum</small>
                </div>
                <span className="co-tag">IA</span>
              </div>
            ))}
          </div>
        </div>
      </Panel>
      <div className="co-cols">
        <Panel title="Lorem ipsum" hint={SHORT}>
          <Table cols={3} rows={5} />
        </Panel>
        <Panel title="Dolor sit" hint={SHORT}>
          <div className="co-progress-list">
            {["Lorem", "Ipsum", "Dolor", "Amet"].map((l, i) => (
              <Progress key={l} label={l} value={[92, 78, 55, 33][i]} />
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}

function Timeline() {
  return (
    <>
      <div className="co-cols co-cols--wide">
        <Panel title="Lorem ipsum versiones" hint={SHORT} action="Comparar">
          <ol className="co-versions">
            {VERSIONS.map((v, i) => (
              <li key={v} className={i === 0 ? "is-draft" : ""}>
                <span className="co-version-dot" />
                <div>
                  <b>{v}</b>
                  <small>{["Hoy · 14:20", "18 nov 2026", "9 nov 2026", "28 oct 2026"][i]}</small>
                  <p>{SHORT}</p>
                </div>
                {i === 0 ? <span className="co-tag co-tag--warn">Borrador</span> : <span className="co-tag">Publicada</span>}
              </li>
            ))}
          </ol>
        </Panel>
        <Panel title="Lorem ipsum" hint={SHORT}>
          <div className="co-publish">
            <Lock size={18} />
            <h3>Lorem ipsum dolor sit amet</h3>
            <p>{LOREM}</p>
            <ul>
              {["Lorem ipsum dolor", "Consectetur adipiscing", "Integer posuere erat"].map((l) => (
                <li key={l}>
                  <Check size={14} /> {l}
                </li>
              ))}
            </ul>
            <button type="button" className="co-btn co-btn--solid">
              Lorem ipsum <ArrowUpRight size={15} />
            </button>
          </div>
        </Panel>
      </div>
      <Panel title="Lorem ipsum diff" hint={SHORT}>
        <div className="co-diff">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i}>
              <span className="co-tag">{i % 2 ? "Lorem" : "Ipsum"}</span>
              <p>{SHORT}</p>
              <small>{TINY}</small>
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}

/* ------------------------------------------------------------- conversación */

const TURNS: ChatTurn[] = [
  { who: "owner", text: LOREM, meta: "Tú · 16:02" },
  { who: "laia", text: SHORT, meta: "LAIA · 16:02" },
  { who: "laia", text: LOREM, meta: "LAIA · 16:04" },
  { who: "owner", text: TINY, meta: "Tú · 16:07" },
  { who: "laia", text: LOREM, meta: "LAIA · 16:08" },
  { who: "owner", text: SHORT, meta: "Tú · 16:12" },
];

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
            <span>Hoy · lorem ipsum</span>
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
              <span className="co-msg-avatar">{turn.who === "laia" ? <Sparkles size={13} /> : "AF"}</span>
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
              Lorem ipsum dolor sit amet: esta conversación no toca la empresa activa. Lo que se acuerde aquí vive en el
              borrador hasta que se publique.
            </p>
          </div>

          <article className="co-proposal">
            <header>
              <span className="co-kicker">Propuesta de esta conversación</span>
              <h3>Lorem ipsum dolor sit amet</h3>
              <p>{SHORT}</p>
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
                onClick={() => onToast("Propuesta añadida al borrador V1.3 en la demo.")}
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
            <p>{SHORT}</p>
            <div className="co-idea-meta">
              <span>Rama</span>
              <b>{idea.branch}</b>
            </div>
            <div className="co-idea-meta">
              <span>Empresa activa</span>
              <b>V1.2 · intacta</b>
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
                  <small>{TINY}</small>
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
              <button type="button" className="co-evidence" key={doc} onClick={() => onToast("Documento de ejemplo. Sin contenido real todavía.")}>
                <FileText size={15} />
                <span>
                  <b>{doc}</b>
                  <small>Lorem ipsum · versión de trabajo</small>
                </span>
                <ArrowUpRight size={13} />
              </button>
            ))}
          </section>

          <section className="co-insp-card co-insp-card--next">
            <span className="co-kicker">Siguiente paso</span>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nada de esto afecta a la empresa que ya está operando.</p>
            <button type="button" className="co-btn co-btn--ghost" onClick={() => onToast("Comparativa de alternativas: pendiente de conectar.")}>
              Comparar alternativas <ArrowUpRight size={14} />
            </button>
          </section>
        </aside>
      </div>
    </main>
  );
}

const VARIANTS: Record<Variant, ReactNode> = {
  dashboard: <Dashboard />,
  table: <TableView cols={5} />,
  cards: <Cards />,
  editorial: <Editorial />,
  canvas: <Canvas />,
  chart: <Chart />,
  flow: <Flow />,
  matrix: <Matrix />,
  org: <Org />,
  timeline: <Timeline />,
};

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
  } = useSmartNav<SectionId>({
    storageKey: "agntia_company_smart_v1",
    ids: SECTION_IDS,
    initial: "estudio",
  });
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
  const [chats, setChats] = useState<Chat[]>(SEED_CHATS);
  const [chatId, setChatId] = useState<string | null>(null);
  const [chatsOpen, setChatsOpen] = useState(true);
  const [messages, setMessages] = useState<Record<string, ChatTurn[]>>({});
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [thinking, setThinking] = useState<string | null>(null);
  const timers = useRef<number[]>([]);
  const scroller = useRef<HTMLDivElement>(null);
  const section = SECTIONS.find((s) => s.id === sectionId) ?? SECTIONS[0];
  const activeChat = chats.find((c) => c.id === chatId) ?? null;
  const activeIdea = activeChat ? IDEAS.find((i) => i.n === activeChat.idea) ?? IDEAS[0] : null;
  const activeTurns = activeChat
    ? messages[activeChat.id] ?? (SEED_CHATS.some((seed) => seed.id === activeChat.id) ? TURNS : [])
    : [];

  const newChat = () => {
    const id = `chat-${Date.now()}`;
    setChats((list) => [
      { id, idea: 1, title: "Lorem ipsum dolor", preview: "Nueva conversación de ejemplo.", when: "Ahora", state: "Explorando" },
      ...list,
    ]);
    setMessages((prev) => ({ ...prev, [id]: [] }));
    setChatId(id);
    setChatsOpen(true);
    setDrawer(false);
  };

  const nowTime = () => new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });

  const sendMessage = (chat: Chat, text: string) => {
    const clean = text.trim();
    if (!clean || thinking === chat.id) return;
    const seed = SEED_CHATS.some((entry) => entry.id === chat.id) ? TURNS : [];
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

  const choose = (id: SectionId) => {
    go(id);
    setChatId(null);
    setDrawer(false);
  };

  const openChat = (chat: Chat) => {
    setChatId(chat.id);
    setChatsOpen(true);
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
        hint: `${entry.group} · borrador ${version.split(" ·")[0]}`,
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
      hint: `Versión ${version.split(" ·")[0]}`,
      icon: <ArrowUpRight size={15} />,
      run: () => setNotice("Publicar llegará cuando conectemos el backend."),
    },
    {
      id: "action-version",
      label: "Cambiar de versión",
      group: "Acciones",
      hint: "V1.3 · V1.2 · V1.1 · V1.0",
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
              <small>No publicada</small>
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
              <span>Compilación</span>
              <b>68 %</b>
            </div>
            <span className="co-progress-track">
              <i style={{ width: "68%" }} />
            </span>
            <small>Lorem ipsum dolor sit amet</small>
          </div>
          <button type="button" className="co-back" onClick={onClose}>
            <ArrowLeft size={15} />
            <span>Volver a la app</span>
          </button>
          <div className="co-user">
            <span className="co-avatar">AF</span>
            <div>
              <b>Lorem ipsum</b>
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
              <button type="button" onClick={() => choose("estudio")}>Tu Empresa</button>
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
              <Plus size={15} /> Lorem
            </button>
            <button type="button" className="co-btn co-btn--solid" onClick={() => setNotice("Publicar llegará cuando conectemos el backend.")}>
              Publicar borrador
            </button>
            <span className="co-avatar co-avatar--sm">AF</span>
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
                <p>{LOREM}</p>
              </div>
              <div className="co-head-actions">
                <span className="co-status">
                  <span className="co-status-dot" /> Borrador · {version.split(" ·")[0]}
                </span>
                <button type="button" className="co-btn co-btn--ghost">
                  <Sparkles size={15} /> Abrir con LAIA
                </button>
                <button type="button" className="co-btn co-btn--solid">
                  Lorem ipsum <Plus size={15} />
                </button>
              </div>
            </header>

            <div className="co-page-body">
              <div className="co-main">{VARIANTS[section.variant]}</div>

              <aside className="co-inspector" aria-label="Inspector contextual">
                <section className="co-insp-card">
                  <header>
                    <span className="co-kicker">Estado</span>
                    <b>68 %</b>
                  </header>
                  <div className="co-progress-list">
                    <Progress label="Lorem ipsum" value={72} />
                    <Progress label="Dolor sit" value={54} />
                    <Progress label="Amet consectetur" value={31} />
                  </div>
                </section>

                <section className="co-insp-card">
                  <header>
                    <span className="co-kicker">Evidencias</span>
                    <button type="button" className="co-mini">Ver todas</button>
                  </header>
                  {["Lorem ipsum dolor", "Consectetur adipiscing", "Integer posuere"].map((l, i) => (
                    <button type="button" className="co-evidence" key={l}>
                      {i === 0 ? <FileText size={15} /> : i === 1 ? <Clock3 size={15} /> : <Building2 size={15} />}
                      <span>
                        <b>{l}</b>
                        <small>{TINY}</small>
                      </span>
                      <ArrowUpRight size={13} />
                    </button>
                  ))}
                </section>

                <section className="co-insp-card">
                  <header>
                    <span className="co-kicker">Decisiones pendientes</span>
                    <em className="co-count">2</em>
                  </header>
                  {["Lorem ipsum dolor sit amet", "Consectetur adipiscing elit"].map((l) => (
                    <div className="co-decision" key={l}>
                      <p>{l}</p>
                      <div>
                        <button type="button" className="co-mini co-mini--on" onClick={() => setNotice("Propuesta lorem aceptada en la demo.")}>
                          <Check size={13} /> Aprobar
                        </button>
                        <button type="button" className="co-mini">Revisar</button>
                      </div>
                    </div>
                  ))}
                </section>

                <section className="co-insp-card co-insp-card--next">
                  <span className="co-kicker">Siguiente paso</span>
                  <p>{SHORT}</p>
                  <button type="button" className="co-btn co-btn--ghost">
                    Lorem ipsum <ArrowUpRight size={14} />
                  </button>
                </section>

                <section className="co-insp-card">
                  <header>
                    <span className="co-kicker">Procedencia</span>
                  </header>
                  <div className="co-prov">
                    {["Lorem ipsum", "Dolor sit amet", "Consectetur"].map((l) => (
                      <div key={l}>
                        <span className="co-prov-dot" />
                        <span>
                          <b>{l}</b>
                          <small>{TINY}</small>
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              </aside>
            </div>

            <footer className="co-page-foot">
              <span>AGNTIAPRO · TU EMPRESA · DEMO</span>
              <span>Lorem ipsum dolor sit amet · contenido de ejemplo</span>
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
