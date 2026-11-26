// AGNTIA_CODE_V1 - tercer clon del demo.
// Plataforma de IA coding, vibe coding y bitácora de proyectos de software,
// conectada a GitHub, Vercel y Cloudflare. Igual que Tu Empresa, es una capa
// propia a pantalla completa que se abre desde Ajustes; todo el contenido es
// lorem ipsum y los botones solo describen el gesto, sin backend real.
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import {
  Activity,
  ArrowLeft,
  ArrowUpRight,
  Bot,
  Braces,
  Check,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  Clock3,
  Code2,
  Database,
  ExternalLink,
  FileCode2,
  FlaskConical,
  FolderGit2,
  GitBranch,
  GitCommitHorizontal,
  GitPullRequest,
  Github,
  Globe,
  GraduationCap,
  KeyRound,
  Keyboard,
  Layers,
  Lock,
  Menu,
  MessagesSquare,
  NotebookPen,
  PanelLeft,
  Pin,
  Play,
  Plus,
  Rocket,
  Search,
  Send,
  Server,
  Sparkles,
  SquareTerminal,
  Wifi,
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
import "./code.css";

type Icon = typeof Code2;
type SectionId =
  | "estudio"
  | "proyectos"
  | "chats"
  | "agente"
  | "editor"
  | "terminal"
  | "repositorios"
  | "ramas"
  | "revisiones"
  | "despliegues"
  | "infraestructura"
  | "dominios"
  | "datos"
  | "entornos"
  | "pruebas"
  | "observabilidad"
  | "academia"
  | "bitacora";

type Variant =
  | "home"
  | "projects"
  | "chats"
  | "agent"
  | "editor"
  | "terminal"
  | "repos"
  | "pulls"
  | "review"
  | "deploys"
  | "infra"
  | "domains"
  | "data"
  | "env"
  | "tests"
  | "logs"
  | "academy"
  | "journal";

type Section = { id: SectionId; label: string; icon: Icon; group: string; variant: Variant; path: string };

const GROUPS = ["Construir", "Integrar", "Publicar", "Aprender"] as const;

const SECTIONS: Section[] = [
  { id: "estudio", label: "Estudio de código", icon: Code2, group: "Construir", variant: "home", path: "~/lorem-app" },
  { id: "proyectos", label: "Proyectos", icon: FolderGit2, group: "Construir", variant: "projects", path: "~/proyectos" },
  { id: "chats", label: "Chats de construcción", icon: MessagesSquare, group: "Construir", variant: "chats", path: "~/chats" },
  { id: "agente", label: "Agente de código", icon: Bot, group: "Construir", variant: "agent", path: "~/agente" },
  { id: "editor", label: "Editor", icon: FileCode2, group: "Construir", variant: "editor", path: "~/lorem-app/src" },
  { id: "terminal", label: "Terminal", icon: SquareTerminal, group: "Construir", variant: "terminal", path: "~/lorem-app" },
  { id: "repositorios", label: "Repositorios", icon: Github, group: "Integrar", variant: "repos", path: "github.com/lorem" },
  { id: "ramas", label: "Ramas y Pull Requests", icon: GitPullRequest, group: "Integrar", variant: "pulls", path: "github.com/lorem/pulls" },
  { id: "revisiones", label: "Revisiones", icon: GitBranch, group: "Integrar", variant: "review", path: "github.com/lorem/pull/42" },
  { id: "despliegues", label: "Despliegues", icon: Rocket, group: "Publicar", variant: "deploys", path: "vercel.com/lorem" },
  { id: "infraestructura", label: "Infraestructura", icon: Server, group: "Publicar", variant: "infra", path: "cloudflare.com/lorem" },
  { id: "dominios", label: "Dominios y DNS", icon: Globe, group: "Publicar", variant: "domains", path: "dominios" },
  { id: "datos", label: "Datos", icon: Database, group: "Publicar", variant: "data", path: "~/datos" },
  { id: "entornos", label: "Entornos y secretos", icon: KeyRound, group: "Publicar", variant: "env", path: "~/entornos" },
  { id: "pruebas", label: "Pruebas y calidad", icon: FlaskConical, group: "Aprender", variant: "tests", path: "~/pruebas" },
  { id: "observabilidad", label: "Observabilidad", icon: Activity, group: "Aprender", variant: "logs", path: "~/logs" },
  { id: "academia", label: "Academia", icon: GraduationCap, group: "Aprender", variant: "academy", path: "~/academia" },
  { id: "bitacora", label: "Bitácora", icon: NotebookPen, group: "Aprender", variant: "journal", path: "~/bitacora" },
];

const SECTION_IDS = SECTIONS.map((section) => section.id);

const LOREM =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Cras mattis consectetur purus sit amet fermentum.";
const SHORT = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";
const TINY = "Lorem ipsum dolor sit amet.";

const PROJECTS = [
  { name: "lorem-app", stack: ["Next.js", "D1", "Workers"], state: "Producción" },
  { name: "ipsum-api", stack: ["Hono", "D1"], state: "Preview" },
  { name: "dolor-landing", stack: ["Astro", "R2"], state: "Producción" },
];

const PROJECT_NAMES = [...PROJECTS.map((project) => project.name), "sit-amet-lab"];
const ENV_NAMES = ["Preview", "Producción"];

const CODE: { txt: string; c?: "key" | "fn" | "str" | "com" | "num" }[][] = [
  [
    { txt: "import", c: "key" },
    { txt: " { lorem, ipsum } " },
    { txt: "from", c: "key" },
    { txt: " \"@/lib/dolor\"", c: "str" },
    { txt: ";" },
  ],
  [{ txt: "" }],
  [{ txt: "// Lorem ipsum dolor sit amet, consectetur", c: "com" }],
  [
    { txt: "export const", c: "key" },
    { txt: " sit " },
    { txt: "=", c: "key" },
    { txt: " " },
    { txt: "amet", c: "fn" },
    { txt: "({" },
  ],
  [
    { txt: "  consectetur" },
    { txt: ":" },
    { txt: " string", c: "key" },
    { txt: "," },
  ],
  [
    { txt: "  adipiscing" },
    { txt: ":" },
    { txt: " number", c: "key" },
    { txt: "," },
  ],
  [{ txt: "}) " }, { txt: "=>", c: "key" }, { txt: " {" }],
  [
    { txt: "  const", c: "key" },
    { txt: " lorem " },
    { txt: "=", c: "key" },
    { txt: " " },
    { txt: "await", c: "key" },
    { txt: " " },
    { txt: "ipsum", c: "fn" },
    { txt: "({" },
  ],
  [{ txt: "    dolor" }, { txt: ":" }, { txt: " true", c: "num" }, { txt: "," }],
  [{ txt: "    tempor" }, { txt: ":" }, { txt: " 42", c: "num" }, { txt: "," }],
  [{ txt: "  });" }],
  [{ txt: "" }],
  [
    { txt: "  return", c: "key" },
    { txt: " {" },
  ],
  [{ txt: "    ...lorem," }],
  [{ txt: "    adipiscing" }, { txt: ":" }, { txt: " lorem.length", c: "num" }, { txt: "," }],
  [{ txt: "  };" }],
  [{ txt: "};" }],
];

const FILES = [
  "src/app/page.tsx",
  "src/app/layout.tsx",
  "src/lib/dolor.ts",
  "src/lib/ipsum.ts",
  "src/components/hero.tsx",
  "wrangler.jsonc",
  "package.json",
  "README.md",
];

const initials = (value: string) => value.slice(0, 2).toUpperCase();

/* ------------------------------------------------------------------- piezas */

function Img({ label = "imagen · lorem" }: { label?: string }) {
  return (
    <div className="ac-img" aria-label="Imagen de ejemplo">
      <span>{label}</span>
    </div>
  );
}

function Panel({
  title,
  meta,
  action,
  children,
  className = "",
}: {
  title: string;
  meta?: string;
  action?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={"ac-panel " + className}>
      <header className="ac-panel-head">
        <div>
          <h2>{title}</h2>
          {meta && <p>{meta}</p>}
        </div>
        {action && (
          <button type="button" className="ac-mini">
            {action} <ArrowUpRight size={12} />
          </button>
        )}
      </header>
      {children}
    </section>
  );
}

function Tag({ children, tone }: { children: ReactNode; tone?: "ok" | "warn" | "off" | "info" }) {
  return <span className={"ac-tag" + (tone ? ` ac-tag--${tone}` : "")}>{children}</span>;
}

function Table({ cols, rows }: { cols: string[]; rows: string[][] }) {
  return (
    <div className="ac-table-wrap">
      <table className="ac-table">
        <thead>
          <tr>
            {cols.map((c) => (
              <th key={c}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j}>{j === 0 ? <span className="ac-cell-main">{cell}</span> : cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Bars({ n = 9 }: { n?: number }) {
  const values = [38, 52, 44, 66, 58, 74, 69, 86, 78, 92];
  return (
    <div className="ac-bars" aria-label="Gráfico de ejemplo">
      {values.slice(0, n).map((v, i) => (
        <span key={i} style={{ height: `${v}%` }} />
      ))}
    </div>
  );
}

function Progress({ label, value }: { label: string; value: number }) {
  return (
    <div className="ac-progress">
      <div>
        <span>{label}</span>
        <b>{value} %</b>
      </div>
      <span className="ac-track">
        <i style={{ width: `${value}%` }} />
      </span>
    </div>
  );
}

function Row({ icon: Icon, title, meta, tag }: { icon: Icon; title: string; meta: string; tag: string }) {
  return (
    <button type="button" className="ac-row">
      <span className="ac-row-icon">
        <Icon size={14} />
      </span>
      <span className="ac-row-body">
        <b>{title}</b>
        <small>{meta}</small>
      </span>
      <Tag>{tag}</Tag>
      <ChevronRight size={14} />
    </button>
  );
}

/* ---------------------------------------------------------------- variantes */

function Home() {
  return (
    <>
      <section className="ac-prompt">
        <div className="ac-prompt-top">
          <span className="ac-mono">
            <FolderGit2 size={12} /> lorem-app · main
          </span>
          <Tag tone="info">Preview</Tag>
        </div>
        <textarea
          placeholder="Describe lo que quieres construir, cambiar o arreglar…"
          aria-label="Describir qué construir"
        />
        <div className="ac-prompt-foot">
          <div className="ac-chips">
            {["Adjuntar archivo", "Elegir repositorio", "Modelo lorem"].map((c) => (
              <button type="button" key={c} className="ac-chip">
                {c}
              </button>
            ))}
          </div>
          <button type="button" className="ac-btn ac-btn--solid">
            <Sparkles size={14} /> Construir
          </button>
        </div>
      </section>

      <div className="ac-stats">
        {[
          ["Proyectos activos", "0", "Lorem ipsum dolor"],
          ["Despliegues hoy", "00", "Consectetur adipiscing"],
          ["Cobertura de pruebas", "00 %", "Integer posuere erat"],
          ["Latencia media", "000 ms", "Cras mattis consectetur"],
        ].map(([label, value, note]) => (
          <div className="ac-stat" key={label}>
            <small>{label}</small>
            <strong>{value}</strong>
            <span>{note}</span>
          </div>
        ))}
      </div>

      <div className="ac-cols">
        <Panel title="Proyectos recientes" meta={SHORT} action="Ver todos">
          {PROJECTS.map((p) => (
            <button type="button" className="ac-project-row" key={p.name}>
              <span className="ac-repo-mark">
                <Github size={15} />
              </span>
              <span className="ac-project-body">
                <b>{p.name}</b>
                <small>{TINY}</small>
              </span>
              <span className="ac-stack">
                {p.stack.map((s) => (
                  <em key={s}>{s}</em>
                ))}
              </span>
              <Tag tone={p.state === "Producción" ? "ok" : "info"}>{p.state}</Tag>
            </button>
          ))}
        </Panel>
        <Panel title="Actividad del agente" meta={SHORT}>
          {[
            ["Lorem ipsum dolor", "read_file · 00:12"],
            ["Consectetur adipiscing", "edit_file · 00:48"],
            ["Integer posuere", "run_tests · 01:20"],
            ["Cras mattis consectetur", "deploy · 02:04"],
          ].map(([title, meta]) => (
            <Row icon={Bot} title={title} meta={meta} tag="Lorem" key={title} />
          ))}
        </Panel>
      </div>
    </>
  );
}

function Projects() {
  return (
    <>
      <div className="ac-toolbar">
        <label className="ac-search">
          <Search size={15} />
          <input placeholder="Buscar proyecto, repo o dominio…" aria-label="Buscar proyecto" />
        </label>
        <button type="button" className="ac-btn ac-btn--ghost">
          <Github size={14} /> Importar desde GitHub
        </button>
        <button type="button" className="ac-btn ac-btn--solid">
          <Plus size={14} /> Nuevo proyecto
        </button>
      </div>
      <div className="ac-grid ac-grid--3">
        {[...PROJECTS, { name: "sit-amet-lab", stack: ["Vite", "Hono"], state: "Borrador" }].map((p, i) => (
          <article className="ac-card" key={p.name}>
            <div className="ac-card-cover">
              <span className="ac-mono">0{i + 1}</span>
              <div className="ac-cover-glyph">
                <Braces size={22} />
              </div>
            </div>
            <div className="ac-card-body">
              <header>
                <h3>{p.name}</h3>
                <Tag tone={p.state === "Producción" ? "ok" : p.state === "Borrador" ? "off" : "info"}>{p.state}</Tag>
              </header>
              <p>{SHORT}</p>
              <div className="ac-stack">
                {p.stack.map((s) => (
                  <em key={s}>{s}</em>
                ))}
              </div>
              <footer>
                <span className="ac-mono">
                  <GitBranch size={12} /> main
                </span>
                <button type="button" aria-label="Abrir proyecto">
                  <ArrowUpRight size={15} />
                </button>
              </footer>
            </div>
          </article>
        ))}
        <button type="button" className="ac-card ac-card--new">
          <Plus size={20} />
          <b>Lorem ipsum</b>
          <span>Consectetur adipiscing elit</span>
        </button>
      </div>
    </>
  );
}

function Chats() {
  return (
    <>
      <div className="ac-composer">
        <Sparkles size={16} />
        <input placeholder="Pide un cambio, una pantalla o una integración…" aria-label="Nueva conversación" />
        <button type="button" className="ac-btn ac-btn--solid">
          <Send size={13} /> Enviar
        </button>
      </div>
      <div className="ac-chat-list">
        {[
          ["Lorem ipsum dolor sit", "lorem-app", "Con cambios", "Hace 2 h"],
          ["Consectetur adipiscing", "lorem-app", "Explorando", "Ayer"],
          ["Integer posuere erat", "ipsum-api", "Con cambios", "Ayer"],
          ["Cras mattis consectetur", "dolor-landing", "Aparcada", "12 nov"],
        ].map(([title, repo, state, when]) => (
          <button type="button" className="ac-chat-card" key={title}>
            <span className="ac-chat-icon">
              <MessagesSquare size={16} />
            </span>
            <span className="ac-chat-body">
              <b>{title}</b>
              <small>{LOREM}</small>
              <span className="ac-chat-meta">
                <em className="ac-mono">
                  <FolderGit2 size={11} /> {repo}
                </em>
                <em>{when}</em>
              </span>
            </span>
            <Tag tone={state === "Aparcada" ? "off" : state === "Con cambios" ? "ok" : "info"}>{state}</Tag>
            <ChevronRight size={15} />
          </button>
        ))}
      </div>
      <Panel title="Contexto de la conversación" meta={SHORT}>
        <div className="ac-context">
          {["src/app/page.tsx", "src/lib/dolor.ts", "wrangler.jsonc"].map((f) => (
            <span key={f} className="ac-file-chip">
              <FileCode2 size={13} /> {f}
            </span>
          ))}
          <span className="ac-mono ac-context-note">Lorem ipsum · 0 archivos adjuntos</span>
        </div>
      </Panel>
    </>
  );
}

function Agent() {
  return (
    <>
      <div className="ac-agent-head">
        <div>
          <span className="ac-mono">run · lorem-0000</span>
          <h3>Lorem ipsum dolor sit amet</h3>
          <p>{SHORT}</p>
        </div>
        <div className="ac-agent-actions">
          <Tag tone="info">En curso</Tag>
          <button type="button" className="ac-btn ac-btn--ghost">
            <Play size={13} /> Reanudar
          </button>
        </div>
      </div>
      <ol className="ac-steps">
        {[
          ["Leer el repositorio", "read_file", "00:12", "done"],
          ["Proponer cambios", "edit_file", "00:48", "done"],
          ["Ejecutar pruebas", "run_tests", "01:20", "done"],
          ["Abrir pull request", "create_pr", "—", "wait"],
        ].map(([title, tool, time, state], i) => (
          <li key={title} className={state === "wait" ? "is-wait" : ""}>
            <span className="ac-step-dot">{state === "done" ? <Check size={12} /> : i + 1}</span>
            <div>
              <b>{title}</b>
              <small>
                <em className="ac-mono">{tool}</em> · {time}
              </small>
            </div>
            <Tag tone={state === "done" ? "ok" : "off"}>{state === "done" ? "Hecho" : "Pendiente"}</Tag>
          </li>
        ))}
      </ol>
      <Panel title="Cambios propuestos" meta={SHORT} action="Ver diff">
        <div className="ac-diff-summary">
          <div>
            <b>0 archivos</b>
            <small>+000 / −000 líneas</small>
          </div>
          <div className="ac-diff-files">
            {["src/app/page.tsx", "src/lib/dolor.ts", "src/components/hero.tsx"].map((f) => (
              <span key={f} className="ac-file-chip">
                <FileCode2 size={13} /> {f} <em className="ac-add">+00</em>
              </span>
            ))}
          </div>
          <button type="button" className="ac-btn ac-btn--solid">
            <GitCommitHorizontal size={13} /> Aprobar y commit
          </button>
        </div>
      </Panel>
    </>
  );
}

function Editor() {
  const [file, setFile] = useState(FILES[0]);
  return (
    <div className="ac-ide">
      <aside className="ac-tree" aria-label="Archivos del proyecto">
        <span className="ac-mono ac-tree-head">lorem-app</span>
        {FILES.map((f) => (
          <button type="button" key={f} className={f === file ? "is-active" : ""} onClick={() => setFile(f)}>
            {f.endsWith(".jsonc") || f.endsWith(".json") ? <Braces size={13} /> : <FileCode2 size={13} />}
            <span>{f.split("/").pop()}</span>
          </button>
        ))}
      </aside>
      <div className="ac-code">
        <div className="ac-tabs">
          <span className="ac-tab is-active">
            <FileCode2 size={12} /> {file.split("/").pop()}
            <X size={11} />
          </span>
          <span className="ac-tab">
            <FileCode2 size={12} /> layout.tsx
          </span>
          <span className="ac-tab-spacer" />
          <span className="ac-mono ac-tabs-meta">TypeScript · UTF-8</span>
        </div>
        <div className="ac-code-body">
          {CODE.map((line, i) => (
            <div className="ac-code-line" key={i}>
              <span className="ac-ln">{String(i + 1).padStart(2, "0")}</span>
              <code>
                {line.map((token, j) => (
                  <span key={j} className={token.c ? `ac-${token.c}` : undefined}>
                    {token.txt}
                  </span>
                ))}
              </code>
            </div>
          ))}
        </div>
        <div className="ac-editor-foot">
          <span className="ac-mono">Ln 01, Col 01</span>
          <span className="ac-mono">Spaces: 2</span>
          <span className="ac-mono">lorem-app · main</span>
        </div>
      </div>
    </div>
  );
}

function TerminalView() {
  const [lines, setLines] = useState<string[]>([
    "$ lorem build --preview",
    "◇ ipsum dolor sit amet",
    "◇ consectetur adipiscing elit",
    "✓ integer posuere erat (00.0s)",
    "$ ",
  ]);
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [cursor, setCursor] = useState(-1);
  const scroller = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [lines]);

  const submit = () => {
    const command = value.trim();
    if (!command) return;
    setLines((list) => [...list, `$ ${command}`, "◇ lorem ipsum dolor sit amet", "$ "]);
    setHistory((list) => [...list, command]);
    setCursor(-1);
    setValue("");
  };

  return (
    <>
      <div className="ac-term">
        <div className="ac-term-head">
          <span className="ac-term-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className="ac-mono">lorem-app — zsh</span>
          <span className="ac-term-actions">
            <Tag tone="ok">Conectado</Tag>
          </span>
        </div>
        <div className="ac-term-body" ref={scroller}>
          {lines.map((line, i) => (
            <div key={i} className={"ac-term-line" + (line.startsWith("$") ? " is-cmd" : "")}>
              {line}
            </div>
          ))}
        </div>
        <form
          className="ac-term-input"
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <span className="ac-mono">$</span>
          <input
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setCursor(-1);
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowUp") {
                event.preventDefault();
                if (!history.length) return;
                const next = cursor < 0 ? history.length - 1 : Math.max(0, cursor - 1);
                setCursor(next);
                setValue(history[next]);
              } else if (event.key === "ArrowDown") {
                event.preventDefault();
                if (cursor < 0) return;
                const next = cursor + 1;
                if (next >= history.length) {
                  setCursor(-1);
                  setValue("");
                } else {
                  setCursor(next);
                  setValue(history[next]);
                }
              }
            }}
            placeholder="Escribe un comando…"
            aria-label="Comando"
            title="↑ y ↓ recorren el historial"
            autoComplete="off"
            spellCheck={false}
          />
          <kbd className="ac-term-kbd">↵</kbd>
        </form>
      </div>
      <div className="ac-cols">
        <Panel title="Comandos frecuentes" meta={SHORT}>
          {["npm run dev", "npm test", "npx wrangler deploy", "git status"].map((c) => (
            <button type="button" className="ac-cmd" key={c} onClick={() => setLines((list) => [...list, `$ ${c}`, "◇ lorem ipsum"])}>
              <span className="ac-mono">{c}</span>
              <Play size={13} />
            </button>
          ))}
        </Panel>
        <Panel title="Estado del entorno" meta={SHORT}>
          <div className="ac-progress-list">
            <Progress label="Lorem ipsum" value={72} />
            <Progress label="Dolor sit amet" value={46} />
            <Progress label="Consectetur" value={88} />
          </div>
        </Panel>
      </div>
    </>
  );
}

function Repos() {
  return (
    <>
      <div className="ac-toolbar">
        <label className="ac-search">
          <Search size={15} />
          <input placeholder="Buscar repositorio…" aria-label="Buscar repositorio" />
        </label>
        <Tag tone="ok">
          <Github size={12} /> Conectado
        </Tag>
      </div>
      <Panel title="github.com/lorem" meta={SHORT} action="Sincronizar">
        <Table
          cols={["Repositorio", "Stack", "Visibilidad", "Último commit", "Estado"]}
          rows={[
            ["lorem-app", "Next.js · Workers", "Privado", "hace 2 h", "Sincronizado"],
            ["ipsum-api", "Hono · D1", "Privado", "hace 6 h", "Sincronizado"],
            ["dolor-landing", "Astro · R2", "Público", "ayer", "Sincronizado"],
            ["sit-amet-lab", "Vite · Hono", "Privado", "12 nov", "Pendiente"],
            ["consectetur-ui", "React · Tailwind", "Público", "9 nov", "Sincronizado"],
            ["adipiscing-docs", "MDX", "Público", "4 nov", "Archivado"],
          ]}
        />
      </Panel>
      <div className="ac-cols">
        <Panel title="Conexión" meta={SHORT}>
          {[
            [Github, "GitHub", "lorem-ipsum"],
            [Rocket, "Vercel", "lorem-team"],
            [Server, "Cloudflare", "lorem-zone"],
          ].map(([Icon, name, handle]) => {
            const I = Icon as Icon;
            return (
              <div className="ac-conn" key={String(name)}>
                <span className="ac-conn-icon">
                  <I size={15} />
                </span>
                <span>
                  <b>{String(name)}</b>
                  <small className="ac-mono">{String(handle)}</small>
                </span>
                <Tag tone="ok">Activo</Tag>
              </div>
            );
          })}
        </Panel>
        <Panel title="Actividad" meta={SHORT}>
          {[["Lorem ipsum", "push · main"], ["Consectetur", "pull_request · #00"], ["Integer posuere", "deploy · preview"]].map(
            ([title, meta]) => (
              <Row icon={GitCommitHorizontal} title={title} meta={meta} tag="Lorem" key={title} />
            ),
          )}
        </Panel>
      </div>
    </>
  );
}

function Pulls() {
  return (
    <>
      <div className="ac-tabs-row">
        {["Abiertas", "En revisión", "Cerradas"].map((t, i) => (
          <button type="button" key={t} className={i === 0 ? "is-active" : ""}>
            {t} <em>0{i + 1}</em>
          </button>
        ))}
        <span className="ac-tabs-spacer" />
        <button type="button" className="ac-btn ac-btn--ghost">
          <GitPullRequest size={14} /> Nuevo pull request
        </button>
      </div>
      <div className="ac-pr-list">
        {[
          ["Lorem ipsum dolor sit amet", "#00 · main ← lorem/ipsum", "Checks 3/3", "ok"],
          ["Consectetur adipiscing elit", "#00 · main ← lorem/dolor", "Checks 2/3", "warn"],
          ["Integer posuere erat a ante", "#00 · main ← lorem/sit", "Borrador", "off"],
        ].map(([title, meta, checks, tone]) => (
          <button type="button" className="ac-pr" key={title}>
            <span className="ac-pr-icon">
              <GitPullRequest size={15} />
            </span>
            <span className="ac-pr-body">
              <b>{title}</b>
              <small className="ac-mono">{meta}</small>
            </span>
            <span className="ac-checks">
              <span className="ac-checks-bar">
                <i style={{ width: tone === "ok" ? "100%" : tone === "warn" ? "66%" : "20%" }} />
              </span>
              <em>{checks}</em>
            </span>
            <Tag tone={tone === "ok" ? "ok" : tone === "warn" ? "warn" : "off"}>{tone === "ok" ? "Listo" : tone === "warn" ? "Revisar" : "Borrador"}</Tag>
            <ChevronRight size={15} />
          </button>
        ))}
      </div>
      <Panel title="Ramas activas" meta={SHORT} action="Ver todas">
        <Table
          cols={["Rama", "Autor", "Commits", "Última actividad"]}
          rows={[
            ["lorem/ipsum", "Lorem", "0", "hace 2 h"],
            ["lorem/dolor", "Ipsum", "0", "hace 5 h"],
            ["lorem/sit", "Dolor", "0", "ayer"],
            ["lorem/amet", "Sit", "0", "12 nov"],
          ]}
        />
      </Panel>
    </>
  );
}

function Review() {
  return (
    <div className="ac-review">
      <div className="ac-review-main">
        <div className="ac-diff-card">
          <header>
            <span className="ac-mono">src/lib/dolor.ts</span>
            <Tag tone="warn">+00 −00</Tag>
          </header>
          <div className="ac-diff">
            {[
              ["ctx", "  const", " lorem = interpretar(ipsum);"],
              ["del", "− const", " dolor = await sit({ amet: true });"],
              ["add", "+ const", " dolor = await sit({ amet: false, tempor: 0 });"],
              ["ctx", "  return", " { lorem, dolor };"],
            ].map(([kind, a, b], i) => (
              <div className={`ac-diff-line ac-diff-line--${kind}`} key={i}>
                <span className="ac-ln">{String(12 + i).padStart(2, "0")}</span>
                <code>
                  <span className="ac-key">{a}</span>
                  {b}
                </code>
              </div>
            ))}
          </div>
        </div>
        {[
          ["Lorem ipsum dolor sit amet", "Consectetur adipiscing elit, sed do eiusmod tempor incididunt."],
          ["Integer posuere erat a ante", "Lorem ipsum dolor sit amet, consectetur adipiscing elit."],
        ].map(([title, body]) => (
          <article className="ac-comment" key={title}>
            <span className="ac-avatar">LO</span>
            <div>
              <header>
                <b>{title}</b>
                <small>hace 1 h</small>
              </header>
              <p>{body}</p>
              <div className="ac-comment-actions">
                <button type="button" className="ac-mini">
                  <Check size={12} /> Resolver
                </button>
                <button type="button" className="ac-mini">Responder</button>
              </div>
            </div>
          </article>
        ))}
      </div>
      <aside className="ac-review-side">
        <Panel title="Revisión" meta={SHORT}>
          <div className="ac-progress-list">
            <Progress label="Lorem ipsum" value={66} />
            <Progress label="Dolor sit amet" value={33} />
          </div>
          <button type="button" className="ac-btn ac-btn--solid ac-wide">
            <Check size={13} /> Aprobar cambios
          </button>
          <button type="button" className="ac-btn ac-btn--ghost ac-wide">
            Solicitar cambios
          </button>
        </Panel>
        <Panel title="Comprobaciones" meta={SHORT}>
          {["build", "test", "lint"].map((c, i) => (
            <div className="ac-check-row" key={c}>
              <span className="ac-mono">{c}</span>
              <Tag tone={i === 2 ? "warn" : "ok"}>{i === 2 ? "Aviso" : "OK"}</Tag>
            </div>
          ))}
        </Panel>
      </aside>
    </div>
  );
}

function Deploys() {
  return (
    <>
      <Panel title="Último despliegue" meta={SHORT}>
        <div className="ac-pipeline">
          {[
            ["Commit", GitCommitHorizontal, "ok"],
            ["Build", Braces, "ok"],
            ["Preview", Globe, "ok"],
            ["Producción", Rocket, "wait"],
          ].map(([label, Icon, state], i) => {
            const I = Icon as Icon;
            return (
              <div className="ac-stage" key={String(label)}>
                <span className={"ac-stage-icon" + (state === "wait" ? " is-wait" : "")}>
                  {state === "wait" ? <Clock3 size={14} /> : <I size={14} />}
                </span>
                <b>{String(label)}</b>
                {i < 3 && <span className="ac-stage-line" aria-hidden="true" />}
              </div>
            );
          })}
        </div>
        <div className="ac-deploy-meta">
          <span className="ac-mono">lorem-app · main · a1b2c3d</span>
          <Tag tone="info">Preview lista</Tag>
          <button type="button" className="ac-btn ac-btn--solid">
            <Rocket size={13} /> Promover a producción
          </button>
        </div>
      </Panel>
      <Panel title="Historial" meta={SHORT} action="Ver todos">
        <Table
          cols={["Entorno", "Commit", "Autor", "Duración", "Estado"]}
          rows={[
            ["Producción", "a1b2c3d", "Lorem", "00:00", "Activo"],
            ["Preview", "e4f5g6h", "Ipsum", "00:00", "Listo"],
            ["Preview", "i7j8k9l", "Dolor", "00:00", "Listo"],
            ["Producción", "m0n1o2p", "Sit", "00:00", "Reemplazado"],
            ["Preview", "q3r4s5t", "Amet", "00:00", "Error"],
          ]}
        />
      </Panel>
      <div className="ac-cols">
        <Panel title="Vercel" meta={SHORT}>
          <div className="ac-conn">
            <span className="ac-conn-icon">
              <Rocket size={15} />
            </span>
            <span>
              <b>lorem-team</b>
              <small className="ac-mono">3 proyectos</small>
            </span>
            <Tag tone="ok">Conectado</Tag>
          </div>
        </Panel>
        <Panel title="Cloudflare" meta={SHORT}>
          <div className="ac-conn">
            <span className="ac-conn-icon">
              <Server size={15} />
            </span>
            <span>
              <b>lorem-zone</b>
              <small className="ac-mono">Workers · R2 · D1</small>
            </span>
            <Tag tone="ok">Conectado</Tag>
          </div>
        </Panel>
      </div>
    </>
  );
}

function Infra() {
  return (
    <>
      <div className="ac-grid ac-grid--3">
        {[
          ["lorem-worker", "Workers", "00.0 ms", "ok"],
          ["ipsum-functions", "Functions", "00.0 ms", "ok"],
          ["dolor-db", "D1", "00.0 ms", "ok"],
          ["sit-bucket", "R2", "00.0 ms", "ok"],
          ["amet-cache", "KV", "00.0 ms", "warn"],
          ["consectetur-queue", "Queues", "00.0 ms", "ok"],
        ].map(([name, kind, latency, tone]) => (
          <article className="ac-infra" key={name}>
            <header>
              <span className="ac-conn-icon">
                <Server size={15} />
              </span>
              <Tag tone={tone === "ok" ? "ok" : "warn"}>{tone === "ok" ? "Activo" : "Revisar"}</Tag>
            </header>
            <h3>{name}</h3>
            <p className="ac-mono">{kind}</p>
            <div className="ac-infra-meta">
              <span>
                Latencia <b>{latency}</b>
              </span>
              <span>
                Región <b>auto</b>
              </span>
            </div>
          </article>
        ))}
      </div>
      <Panel title="Recursos" meta={SHORT} action="Ver consola">
        <Table
          cols={["Recurso", "Tipo", "Región", "Uso", "Estado"]}
          rows={[
            ["lorem-worker", "Worker", "global", "00 %", "Activo"],
            ["ipsum-api", "Pages Function", "global", "00 %", "Activo"],
            ["dolor-db", "D1", "eu-west", "00 %", "Activo"],
            ["sit-bucket", "R2", "eu-west", "00 %", "Activo"],
            ["amet-cache", "KV", "global", "00 %", "Ampliando"],
          ]}
        />
      </Panel>
    </>
  );
}

function Domains() {
  return (
    <>
      <div className="ac-toolbar">
        <label className="ac-search">
          <Search size={15} />
          <input placeholder="Buscar dominio…" aria-label="Buscar dominio" />
        </label>
        <button type="button" className="ac-btn ac-btn--solid">
          <Plus size={14} /> Añadir dominio
        </button>
      </div>
      <Panel title="Dominios" meta={SHORT} action="Ver DNS">
        <Table
          cols={["Dominio", "Proyecto", "Tipo", "SSL", "Estado"]}
          rows={[
            ["lorem.app", "lorem-app", "Producción", "Válido", "Activo"],
            ["www.lorem.app", "lorem-app", "Redirección", "Válido", "Activo"],
            ["ipsum.dev", "ipsum-api", "Producción", "Válido", "Activo"],
            ["preview.lorem.app", "lorem-app", "Preview", "Válido", "Activo"],
            ["dolor.studio", "dolor-landing", "Producción", "Pendiente", "Configurando"],
          ]}
        />
      </Panel>
      <div className="ac-cols">
        <Panel title="Registros DNS" meta={SHORT}>
          <Table
            cols={["Tipo", "Nombre", "Valor"]}
            rows={[
              ["CNAME", "@", "lorem.vercel.app"],
              ["CNAME", "www", "lorem.vercel.app"],
              ["TXT", "_lorem", "lorem-ipsum-dolor"],
              ["MX", "@", "lorem.mail"],
            ]}
          />
        </Panel>
        <Panel title="Certificados" meta={SHORT}>
          {["lorem.app", "ipsum.dev", "preview.lorem.app"].map((d) => (
            <div className="ac-conn" key={d}>
              <span className="ac-conn-icon">
                <Lock size={14} />
              </span>
              <span>
                <b>{d}</b>
                <small className="ac-mono">Let's Encrypt · 00 días</small>
              </span>
              <Tag tone="ok">Válido</Tag>
            </div>
          ))}
        </Panel>
      </div>
    </>
  );
}

function Data() {
  return (
    <>
      <div className="ac-query">
        <div className="ac-query-top">
          <span className="ac-mono">
            <Database size={12} /> lorem-db · eu-west
          </span>
          <Tag tone="ok">Conectada</Tag>
        </div>
        <pre className="ac-query-code">
          <span className="ac-key">select</span> id, lorem, ipsum, created_at{"\n"}
          <span className="ac-key">from</span> dolor{"\n"}
          <span className="ac-key">where</span> sit = <span className="ac-str">'amet'</span>{"\n"}
          <span className="ac-key">limit</span> 50;
        </pre>
        <div className="ac-query-foot">
          <span className="ac-mono">0 filas · 00 ms</span>
          <button type="button" className="ac-btn ac-btn--solid">
            <Play size={13} /> Ejecutar
          </button>
        </div>
      </div>
      <div className="ac-cols">
        <Panel title="Tablas" meta={SHORT}>
          {["dolor", "lorem", "ipsum", "tempor", "adipiscing"].map((t) => (
            <button type="button" className="ac-cmd" key={t}>
              <span className="ac-mono">{t}</span>
              <Tag>00 filas</Tag>
            </button>
          ))}
        </Panel>
        <Panel title="Resultado" meta={SHORT}>
          <Table
            cols={["id", "lorem", "ipsum", "created_at"]}
            rows={[
              ["0000", "Lorem ipsum", "dolor", "00/00/0000"],
              ["0000", "Consectetur", "adipiscing", "00/00/0000"],
              ["0000", "Integer posuere", "erat", "00/00/0000"],
            ]}
          />
        </Panel>
      </div>
    </>
  );
}

function Env() {
  return (
    <>
      <div className="ac-env-tabs">
        {["Desarrollo", "Preview", "Producción"].map((e, i) => (
          <button type="button" key={e} className={i === 2 ? "is-active" : ""}>
            {e}
          </button>
        ))}
        <span className="ac-tabs-spacer" />
        <button type="button" className="ac-btn ac-btn--ghost">
          <Plus size={14} /> Añadir variable
        </button>
      </div>
      <Panel title="Variables de entorno" meta={SHORT} action="Sincronizar">
        <Table
          cols={["Clave", "Entorno", "Valor", "Actualizada", "Estado"]}
          rows={[
            ["LOREM_API_KEY", "Producción", "••••••••••••", "hace 2 h", "Activa"],
            ["IPSUM_TOKEN", "Producción", "••••••••••••", "ayer", "Activa"],
            ["DOLOR_DB_URL", "Producción", "••••••••••••", "12 nov", "Activa"],
            ["SIT_WEBHOOK", "Preview", "••••••••••••", "9 nov", "Activa"],
            ["AMET_LEGACY", "Desarrollo", "••••••••••••", "4 nov", "Sin uso"],
          ]}
        />
      </Panel>
      <div className="ac-cols">
        <Panel title="Buenas prácticas" meta={SHORT}>
          {["Lorem ipsum dolor sit amet", "Consectetur adipiscing elit", "Integer posuere erat"].map((l, i) => (
            <div className="ac-check-row" key={l}>
              <span>{l}</span>
              <Tag tone={i === 1 ? "warn" : "ok"}>{i === 1 ? "Revisar" : "OK"}</Tag>
            </div>
          ))}
        </Panel>
        <Panel title="Últimos cambios" meta={SHORT}>
          {["LOREM_API_KEY", "DOLOR_DB_URL", "SIT_WEBHOOK"].map((k) => (
            <Row icon={KeyRound} title={k} meta="Lorem ipsum · hace 2 h" tag="Rotada" key={k} />
          ))}
        </Panel>
      </div>
    </>
  );
}

function Tests() {
  return (
    <>
      <div className="ac-stats ac-stats--3">
        {[
          ["Cobertura", "00 %", "Lorem ipsum"],
          ["Pruebas", "000", "Consectetur"],
          ["Fallos", "00", "Adipiscing"],
        ].map(([label, value, note]) => (
          <div className="ac-stat" key={label}>
            <small>{label}</small>
            <strong>{value}</strong>
            <span>{note}</span>
          </div>
        ))}
      </div>
      <div className="ac-cols">
        <Panel title="Cobertura por área" meta={SHORT}>
          <div className="ac-progress-list">
            {["Lorem", "Ipsum", "Dolor", "Sit amet", "Consectetur"].map((l, i) => (
              <Progress key={l} label={l} value={[92, 78, 64, 48, 31][i]} />
            ))}
          </div>
        </Panel>
        <Panel title="Ejecuciones" meta={SHORT}>
          <Bars n={7} />
          <div className="ac-legend">
            <span>
              <i /> Lorem
            </span>
            <span>
              <i data-v="1" /> Ipsum
            </span>
          </div>
        </Panel>
      </div>
      <Panel title="Suites" meta={SHORT} action="Ejecutar todas">
        <Table
          cols={["Suite", "Pruebas", "Duración", "Estado"]}
          rows={[
            ["lorem.test.ts", "00", "0.0 s", "OK"],
            ["ipsum.test.ts", "00", "0.0 s", "OK"],
            ["dolor.test.ts", "00", "0.0 s", "Aviso"],
            ["sit.test.ts", "00", "0.0 s", "OK"],
          ]}
        />
      </Panel>
    </>
  );
}

function Logs() {
  return (
    <>
      <div className="ac-cols ac-cols--wide">
        <Panel title="Errores por hora" meta={SHORT} action="Ver trazas">
          <Bars n={9} />
          <div className="ac-legend">
            <span>
              <i /> Lorem
            </span>
            <span>
              <i data-v="1" /> Ipsum
            </span>
          </div>
        </Panel>
        <Panel title="Salud" meta={SHORT}>
          <div className="ac-progress-list">
            <Progress label="Disponibilidad" value={99} />
            <Progress label="Latencia p95" value={42} />
            <Progress label="Errores" value={3} />
          </div>
        </Panel>
      </div>
      <Panel title="Flujo de eventos" meta="lorem-worker · producción" action="Pausar">
        <div className="ac-log">
          {[
            ["00:00:00", "info", "lorem ipsum dolor sit amet"],
            ["00:00:01", "info", "consectetur adipiscing elit"],
            ["00:00:02", "warn", "integer posuere erat a ante"],
            ["00:00:03", "info", "cras mattis consectetur purus"],
            ["00:00:04", "error", "lorem ipsum: dolor no encontrado"],
            ["00:00:05", "info", "sit amet fermentum"],
          ].map(([time, level, msg]) => (
            <div className={"ac-log-line ac-log--" + level} key={time}>
              <span className="ac-mono">{time}</span>
              <em>{level}</em>
              <code>{msg}</code>
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}

function Academy() {
  return (
    <>
      <div className="ac-toolbar">
        <label className="ac-search">
          <Search size={15} />
          <input placeholder="Buscar lección, tema o herramienta…" aria-label="Buscar lección" />
        </label>
        <Tag tone="info">00 lecciones · demo</Tag>
      </div>
      <div className="ac-grid ac-grid--3">
        {[
          ["Construir con lenguaje natural", "00 %"],
          ["Del prompt al despliegue", "00 %"],
          ["Datos y estado en Workers", "00 %"],
          ["Revisar código generado", "00 %"],
          ["Dominios y certificados", "00 %"],
          ["Bitácora de decisiones", "00 %"],
        ].map(([title, progressText], i) => (
          <article className="ac-course" key={title}>
            <Img label={`lección 0${i + 1}`} />
            <div>
              <span className="ac-mono">Módulo 0{i + 1} · lorem</span>
              <h3>{title}</h3>
              <p>{SHORT}</p>
              <div className="ac-progress">
                <div>
                  <span>Progreso</span>
                  <b>{progressText}</b>
                </div>
                <span className="ac-track">
                  <i style={{ width: "0%" }} />
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
      <Panel title="Rutas" meta={SHORT} action="Ver academia">
        {["Lorem ipsum dolor", "Consectetur adipiscing", "Integer posuere erat"].map((r, i) => (
          <button type="button" className="ac-route" key={r}>
            <span className="ac-route-index">0{i + 1}</span>
            <span>
              <b>{r}</b>
              <small>{TINY}</small>
            </span>
            <Tag>{i === 0 ? "Empezar" : "Continuar"}</Tag>
            <ArrowUpRight size={14} />
          </button>
        ))}
      </Panel>
    </>
  );
}

function Journal() {
  return (
    <>
      <div className="ac-cols ac-cols--wide">
        <Panel title="Entradas recientes" meta={SHORT} action="Nueva entrada">
          <ol className="ac-timeline">
            {[
              ["Hoy", "Lorem ipsum dolor sit amet", "Decisión", "ok"],
              ["Ayer", "Consectetur adipiscing elit", "Despliegue", "info"],
              ["12 nov", "Integer posuere erat a ante", "Incidencia", "warn"],
              ["9 nov", "Cras mattis consectetur purus", "Aprendizaje", "off"],
            ].map(([when, title, tag, tone]) => (
              <li key={title}>
                <span className="ac-timeline-dot" />
                <div>
                  <small className="ac-mono">{when}</small>
                  <b>{title}</b>
                  <p>{SHORT}</p>
                  <Tag tone={tone as "ok" | "info" | "warn" | "off"}>{tag}</Tag>
                </div>
              </li>
            ))}
          </ol>
        </Panel>
        <Panel title="Decisiones abiertas" meta={SHORT}>
          {["Lorem ipsum dolor sit amet", "Consectetur adipiscing elit"].map((d) => (
            <div className="ac-decision" key={d}>
              <p>{d}</p>
              <div>
                <button type="button" className="ac-mini">
                  <Check size={12} /> Cerrar
                </button>
                <button type="button" className="ac-mini">Revisar</button>
              </div>
            </div>
          ))}
        </Panel>
      </div>
      <Panel title="Qué ha cambiado" meta={SHORT}>
        <div className="ac-grid ac-grid--3">
          {["Modelo de datos", "Interfaz", "Despliegue"].map((t, i) => (
            <div className="ac-change" key={t}>
              <span className="ac-mono">0{i + 1}</span>
              <b>{t}</b>
              <p>{TINY}</p>
              <Tag>{["+00", "+00", "+00"][i]}</Tag>
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}

const VARIANTS: Record<Variant, ReactNode> = {
  home: <Home />,
  projects: <Projects />,
  chats: <Chats />,
  agent: <Agent />,
  editor: <Editor />,
  terminal: <TerminalView />,
  repos: <Repos />,
  pulls: <Pulls />,
  review: <Review />,
  deploys: <Deploys />,
  infra: <Infra />,
  domains: <Domains />,
  data: <Data />,
  env: <Env />,
  tests: <Tests />,
  logs: <Logs />,
  academy: <Academy />,
  journal: <Journal />,
};

/* -------------------------------------------------------------------- shell */

export default function CodeApp({ onClose }: { onClose: () => void }) {
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
    storageKey: "agntia_code_smart_v1",
    ids: SECTION_IDS,
    initial: "estudio",
  });
  const [project, setProject] = useState(() => {
    try {
      const stored = window.localStorage.getItem("agntia_code_project");
      return stored && PROJECT_NAMES.includes(stored) ? stored : "lorem-app";
    } catch {
      return "lorem-app";
    }
  });
  const [projectOpen, setProjectOpen] = useState(false);
  const [env, setEnv] = useState(() => {
    try {
      const stored = window.localStorage.getItem("agntia_code_env");
      return stored && ENV_NAMES.includes(stored) ? stored : "Preview";
    } catch {
      return "Preview";
    }
  });
  const [drawer, setDrawer] = useState(false);
  const [notice, setNotice] = useState("");
  const scroller = useRef<HTMLDivElement>(null);
  const section = SECTIONS.find((s) => s.id === sectionId) ?? SECTIONS[0];

  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 });
  }, [sectionId]);

  useEffect(() => {
    try {
      window.localStorage.setItem("agntia_code_project", project);
      window.localStorage.setItem("agntia_code_env", env);
    } catch {
      // La demo sigue funcionando sin memoria de preferencias.
    }
  }, [project, env]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 3200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const choose = (id: SectionId) => {
    go(id);
    setDrawer(false);
  };

  const run = (message: string) => setNotice(message);

  const shortcuts: SmartShortcut[] = [
    { group: "Navegación", keys: "⌘ K", label: "Buscar workspaces y acciones" },
    { group: "Navegación", keys: "/", label: "Abrir la búsqueda" },
    { group: "Navegación", keys: "⌘ J", label: "Abrir la terminal" },
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
        hint: `${entry.group} · ${entry.path}`,
        keywords: `${entry.variant} ${entry.id}`,
        icon: <Icon size={15} />,
        canPin: true,
        run: () => choose(entry.id),
      };
    }),
    ...PROJECT_NAMES.map((name): SmartCommand => ({
      id: `project-${name}`,
      label: name,
      group: "Proyectos",
      hint: "Abrir proyecto",
      icon: <FolderGit2 size={15} />,
      run: () => {
        setProject(name);
        choose("estudio");
      },
    })),
    {
      id: "action-project",
      label: "Nuevo proyecto",
      group: "Acciones",
      hint: "Crea un proyecto de ejemplo",
      icon: <Plus size={15} />,
      run: () => run("Nuevo proyecto de ejemplo. En la demo no se crea nada real."),
    },
    {
      id: "action-sync",
      label: "Sincronizar con GitHub",
      group: "Acciones",
      hint: `Repositorio ${project}`,
      icon: <Github size={15} />,
      run: () => run("Sincronización con GitHub simulada."),
    },
    {
      id: "action-deploy",
      label: "Desplegar a producción",
      group: "Acciones",
      hint: `Entorno actual: ${env}`,
      icon: <Rocket size={15} />,
      run: () => run("Despliegue simulado: no hay backend conectado."),
    },
    {
      id: "action-env",
      label: `Cambiar entorno a ${env === "Preview" ? "Producción" : "Preview"}`,
      group: "Acciones",
      icon: <Globe size={15} />,
      run: () => setEnv(env === "Preview" ? "Producción" : "Preview"),
    },
    {
      id: "action-terminal",
      label: "Abrir terminal",
      group: "Acciones",
      shortcut: "⌘ J",
      icon: <SquareTerminal size={15} />,
      run: () => choose("terminal"),
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
      if (mod && key === "j") {
        event.preventDefault();
        event.stopImmediatePropagation();
        go("terminal");
        setDrawer(false);
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
      else if (projectOpen) setProjectOpen(false);
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
    projectOpen,
    onClose,
    openPalette,
    closePalette,
    openShortcuts,
    closeShortcuts,
    setCollapsed,
    go,
  ]);

  return (
    <div className="ac-root" role="dialog" aria-modal="true" aria-label="Agntia Code">
      <button
        type="button"
        className={"ac-scrim" + (drawer ? " is-on" : "")}
        aria-label="Cerrar menú"
        onClick={() => setDrawer(false)}
      />

      <aside className={"ac-rail" + (collapsed ? " is-collapsed" : "") + (drawer ? " is-open" : "")}>
        <div className="ac-brand">
          <div className="ac-brand-mark" aria-hidden="true">
            <Code2 size={17} />
          </div>
          <div className="ac-brand-text">
            <small>AgntiaPro</small>
            <strong>Agntia Code</strong>
            <em>Construir con lenguaje natural</em>
          </div>
          <button type="button" className="ac-rail-close" aria-label="Cerrar menú" onClick={() => setDrawer(false)}>
            <X size={16} />
          </button>
        </div>

        <div className="ac-project">
          <button type="button" onClick={() => setProjectOpen((v) => !v)} aria-expanded={projectOpen}>
            <span className="ac-project-mark">
              <Github size={13} />
            </span>
            <span>
              <b>{project}</b>
              <small className="ac-mono">
                <GitBranch size={10} /> main
              </small>
            </span>
            <ChevronDown size={13} />
          </button>
          {projectOpen && (
            <div className="ac-project-menu" role="listbox" aria-label="Proyecto">
              {[...PROJECTS.map((p) => p.name), "sit-amet-lab"].map((name) => (
                <button
                  type="button"
                  key={name}
                  role="option"
                  aria-selected={name === project}
                  onClick={() => {
                    setProject(name);
                    setProjectOpen(false);
                  }}
                >
                  {name}
                  {name === project && <Check size={13} />}
                </button>
              ))}
            </div>
          )}
        </div>

        <nav className="ac-nav" aria-label="Workspaces de Agntia Code">
          {pins.length > 0 && (
            <div className="ac-nav-group ac-nav-group--pins">
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
                    <Icon size={15} />
                    <span>{pinned.label}</span>
                    <Pin size={11} className="ac-nav-pinmark" aria-hidden="true" />
                  </button>
                );
              })}
            </div>
          )}
          {GROUPS.map((group) => (
            <div className="ac-nav-group" key={group}>
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
                  <Icon size={15} />
                  <span>{label}</span>
                  {isPinned(id) && <Pin size={11} className="ac-nav-pinmark" aria-hidden="true" />}
                  {id === "ramas" && <em className="ac-nav-badge">3</em>}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="ac-rail-foot">
          <div className="ac-agent-card">
            <div className="ac-agent-status">
              <span className="ac-pulse" />
              <b>Agente en reposo</b>
            </div>
            <small>Lorem ipsum · 0 tareas en cola</small>
            <button type="button" className="ac-btn ac-btn--ghost" onClick={() => run("Sesión de agente iniciada en la demo.")}>
              <Sparkles size={13} /> Abrir sesión
            </button>
          </div>
          <button type="button" className="ac-back" onClick={onClose}>
            <ArrowLeft size={15} /> Volver a la app
          </button>
          <div className="ac-user">
            <span className="ac-avatar">AF</span>
            <div>
              <b>Lorem ipsum</b>
              <small>Desarrollador · demo</small>
            </div>
            <Wifi size={14} />
          </div>
        </div>
      </aside>

      <div className="ac-stage">
        <header className="ac-top">
          <div className="ac-top-left">
            <button type="button" className="ac-icon-btn ac-only-mobile" aria-label="Abrir menú" onClick={() => setDrawer(true)}>
              <Menu size={16} />
            </button>
            <button
              type="button"
              className="ac-icon-btn ac-only-desktop"
              aria-label={collapsed ? "Expandir menú" : "Plegar menú"}
              onClick={() => setCollapsed((v) => !v)}
            >
              <PanelLeft size={16} />
            </button>
            <nav className="ac-crumb" aria-label="Ruta">
              <button type="button" className="ac-crumb-root" onClick={() => choose("estudio")}>
                agntia code
              </button>
              <ChevronRight size={12} />
              <span>{section.group}</span>
              <ChevronRight size={12} />
              <b aria-current="page">{section.label}</b>
            </nav>
          </div>
          <div className="ac-top-right">
            <button
              type="button"
              className="ac-icon-btn ac-search-btn"
              aria-label="Buscar en el código"
              aria-haspopup="dialog"
              onClick={openPalette}
            >
              <Search size={15} />
            </button>
            <span className="ac-env">
              {["Preview", "Producción"].map((e) => (
                <button type="button" key={e} className={env === e ? "is-active" : ""} onClick={() => setEnv(e)}>
                  {e}
                </button>
              ))}
            </span>
            <button
              type="button"
              className="ac-top-search"
              onClick={openPalette}
              aria-haspopup="dialog"
              aria-keyshortcuts="Meta+K Control+K"
              title="Buscar workspaces y acciones (⌘K)"
            >
              <Search size={13} />
              <span>Buscar en el código…</span>
              <kbd>⌘K</kbd>
            </button>
            <button type="button" className="ac-icon-btn" aria-label="Abrir GitHub" onClick={() => run("GitHub: integración de ejemplo, sin conexión real.")}>
              <Github size={15} />
            </button>
            <button type="button" className="ac-btn ac-btn--solid" onClick={() => run("Nueva conversación de construcción en la demo.")}>
              <Sparkles size={14} /> Construir
            </button>
            <span className="ac-avatar ac-avatar--sm">AF</span>
          </div>
        </header>

        <div className="ac-scroll" ref={scroller}>
          <main className="ac-page">
            <header className="ac-page-head">
              <div>
                <span className="ac-mono ac-path">
                  <SquareTerminal size={11} /> {section.path}
                </span>
                <h1>{section.label}</h1>
                <p>{LOREM}</p>
              </div>
              <div className="ac-head-actions">
                <span className="ac-live">
                  <span /> {env}
                </span>
                <button type="button" className="ac-btn ac-btn--ghost" onClick={() => run("Sincronización con GitHub simulada.")}>
                  <Github size={14} /> Sincronizar
                </button>
                <button type="button" className="ac-btn ac-btn--solid" onClick={() => run("Despliegue simulado: no hay backend conectado.")}>
                  <Rocket size={14} /> Desplegar
                </button>
              </div>
            </header>

            <div className="ac-body">{VARIANTS[section.variant]}</div>

            <footer className="ac-page-foot">
              <span>AGNTIAPRO · AGNTIA CODE · DEMO</span>
              <span>Lorem ipsum dolor sit amet · contenido de ejemplo</span>
              <span className="ac-foot-links">
                <em>GitHub</em>
                <em>Vercel</em>
                <em>Cloudflare</em>
              </span>
            </footer>
          </main>
        </div>

        <div className="ac-statusbar">
          <span className="ac-mono">
            <GitBranch size={11} /> main
          </span>
          <span className="ac-mono">
            <GitCommitHorizontal size={11} /> a1b2c3d
          </span>
          <span className="ac-mono">
            <FolderGit2 size={11} /> {project}
          </span>
          <span className="ac-status-spacer" />
          <span className="ac-mono">
            <CircleAlert size={11} /> 0
          </span>
          <span className="ac-mono">
            <Wifi size={11} /> Conectado
          </span>
          <span className="ac-mono">TypeScript · UTF-8</span>
        </div>
      </div>

      <SmartCommandPalette
        open={paletteOpen}
        tone="code"
        title="Buscar en Agntia Code"
        subtitle={`${SECTIONS.length} workspaces · ${PROJECT_NAMES.length} proyectos`}
        placeholder="Buscar workspaces, archivos o acciones…"
        commands={paletteCommands}
        recents={recents}
        pins={pins}
        onTogglePin={togglePin}
        onClose={closePalette}
        onShowShortcuts={openShortcuts}
      />
      <SmartShortcuts
        open={shortcutsOpen}
        tone="code"
        title="Atajos de Agntia Code"
        shortcuts={shortcuts}
        onClose={closeShortcuts}
      />

      {notice && (
        <div className="ac-toast" role="status">
          <Check size={14} /> {notice}
        </div>
      )}
    </div>
  );
}
