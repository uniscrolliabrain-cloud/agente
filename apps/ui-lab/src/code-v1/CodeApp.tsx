import MetaChats from "../smart-ux/MetaChats";
import MetaDock from "../smart-ux/MetaDock";
import { OrderAnnounce, OrderGhost } from "../smart-ux/OrderGhost";
// AGNTIA_CODE_V1 - tercer clon del demo.
// Plataforma de IA coding y bitácora conectada a GitHub, Vercel y Cloudflare.
// Los datos vienen de los 17 repos reales de uniscrolliabrain-cloud, leídos de
// main el 26 nov 2026. No hay backend: nada se ejecuta ni se despliega aquí.
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
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
import {
  ACTIVITY,
  JOURNAL,
  ORG,
  PUBLIC_COUNT,
  READ_DATE,
  REPOS,
  SESSIONS,
  STATE_TONE,
  TOTAL_ISSUES,
  TOTAL_TESTS,
  type Repo,
} from "./code-data";

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

type Section = { id: SectionId; label: string; icon: Icon; group: string; variant: Variant };

const GROUPS = ["Construir", "Integrar", "Publicar", "Aprender"] as const;

const SECTIONS: Section[] = [
  { id: "estudio", label: "Estudio de código", icon: Code2, group: "Construir", variant: "home" },
  { id: "proyectos", label: "Proyectos", icon: FolderGit2, group: "Construir", variant: "projects" },
  { id: "chats", label: "Chats de construcción", icon: MessagesSquare, group: "Construir", variant: "chats" },
  { id: "agente", label: "Agente de código", icon: Bot, group: "Construir", variant: "agent" },
  { id: "editor", label: "Editor", icon: FileCode2, group: "Construir", variant: "editor" },
  { id: "terminal", label: "Terminal", icon: SquareTerminal, group: "Construir", variant: "terminal" },
  { id: "repositorios", label: "Repositorios", icon: Github, group: "Integrar", variant: "repos" },
  { id: "ramas", label: "Ramas y Pull Requests", icon: GitPullRequest, group: "Integrar", variant: "pulls" },
  { id: "revisiones", label: "Revisiones", icon: GitBranch, group: "Integrar", variant: "review" },
  { id: "despliegues", label: "Despliegues", icon: Rocket, group: "Publicar", variant: "deploys" },
  { id: "infraestructura", label: "Infraestructura", icon: Server, group: "Publicar", variant: "infra" },
  { id: "dominios", label: "Dominios y DNS", icon: Globe, group: "Publicar", variant: "domains" },
  { id: "datos", label: "Datos", icon: Database, group: "Publicar", variant: "data" },
  { id: "entornos", label: "Entornos y secretos", icon: KeyRound, group: "Publicar", variant: "env" },
  { id: "pruebas", label: "Pruebas y calidad", icon: FlaskConical, group: "Aprender", variant: "tests" },
  { id: "observabilidad", label: "Observabilidad", icon: Activity, group: "Aprender", variant: "logs" },
  { id: "academia", label: "Academia", icon: GraduationCap, group: "Aprender", variant: "academy" },
  { id: "bitacora", label: "Bitácora", icon: NotebookPen, group: "Aprender", variant: "journal" },
];

const SECTION_IDS = SECTIONS.map((section) => section.id);

const RepoCtx = createContext<Repo>(REPOS[0]);
const useRepo = () => useContext(RepoCtx);

const initials = (value: string) => value.slice(0, 2).toUpperCase();

/* ------------------------------------------------------------------- piezas */

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

function Empty({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="ac-empty">
      <CircleAlert size={16} />
      <div>
        <b>{title}</b>
        <p>{children}</p>
      </div>
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
  const repo = useRepo();
  return (
    <>
      <section className="ac-prompt">
        <div className="ac-prompt-top">
          <span className="ac-mono">
            <FolderGit2 size={12} /> {ORG}/{repo.name} · main · {repo.sha}
          </span>
          <Tag tone={STATE_TONE[repo.state]}>{repo.stateLabel}</Tag>
        </div>
        <textarea
          placeholder="Describe lo que quieres construir, cambiar o arreglar…"
          aria-label="Describir qué construir"
          defaultValue=""
        />
        <div className="ac-prompt-foot">
          <div className="ac-chips">
            {["Adjuntar archivo", repo.project, repo.language].map((c) => (
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
          ["Repos leídos", String(REPOS.length), `${PUBLIC_COUNT} públicos · 2 privados`],
          ["Pruebas declaradas", String(TOTAL_TESTS), "en 6 repos; no ejecutadas aquí"],
          ["Desplegados", "0", "ningún vertical en producción"],
          ["Issues abiertas", String(TOTAL_ISSUES), "11 en agente · 1 en gestoría"],
        ].map(([label, value, note]) => (
          <div className="ac-stat" key={label}>
            <small>{label}</small>
            <strong>{value}</strong>
            <span>{note}</span>
          </div>
        ))}
      </div>

      <div className="ac-cols">
        <Panel title="Proyectos recientes" meta={`Leídos el ${READ_DATE}`} action="Ver todos">
          {REPOS.slice(0, 5).map((p) => (
            <button type="button" className="ac-project-row" key={p.name}>
              <span className="ac-repo-mark">
                <Github size={15} />
              </span>
              <span className="ac-project-body">
                <b>{p.name}</b>
                <small>{p.summary}</small>
              </span>
              <span className="ac-stack">
                <em>{p.language}</em>
              </span>
              <Tag tone={STATE_TONE[p.state]}>{p.state}</Tag>
            </button>
          ))}
        </Panel>
        <Panel title="Actividad real" meta="Sin backend: lo que sí ocurrió">
          {ACTIVITY.map(([title, meta, when]) => (
            <Row icon={GitCommitHorizontal} title={title} meta={`${meta} · ${when}`} tag="Hecho" key={title} />
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
        {REPOS.map((p, i) => (
          <article className="ac-card" key={p.name}>
            <div className="ac-card-cover">
              <span className="ac-mono">{String(i + 1).padStart(2, "0")}</span>
              <div className="ac-cover-glyph">
                <Braces size={22} />
              </div>
            </div>
            <div className="ac-card-body">
              <header>
                <h3>{p.name}</h3>
                <Tag tone={STATE_TONE[p.state]}>{p.state}</Tag>
              </header>
              <p>{p.summary}</p>
              <div className="ac-stack">
                <em>{p.language}</em>
                {p.tests !== null && <em>{p.tests} pruebas</em>}
                <em>{p.license}</em>
              </div>
              <footer>
                <span className="ac-mono">
                  <GitBranch size={12} /> main · {p.sha}
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
          <b>Importar otro repo</b>
          <span>La cuenta tiene 17; este clon los muestra todos.</span>
        </button>
      </div>
    </>
  );
}

function Chats() {
  const repo = useRepo();
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
        {SESSIONS.map(([title, repoName, state, when]) => (
          <button type="button" className="ac-chat-card" key={title}>
            <span className="ac-chat-icon">
              <MessagesSquare size={16} />
            </span>
            <span className="ac-chat-body">
              <b>{title}</b>
              <small>
                {repoName === "agente" ? "Lectura de 15 README, 2 privados y manifiestos; sin ejecutar código." : repo.summary}
              </small>
              <span className="ac-chat-meta">
                <em className="ac-mono">
                  <FolderGit2 size={11} /> {repoName}
                </em>
                <em>{when}</em>
              </span>
            </span>
            <Tag tone={state === "Leída" ? "info" : "ok"}>{state}</Tag>
            <ChevronRight size={15} />
          </button>
        ))}
      </div>
      <Panel title="Contexto de la conversación" meta={`${repo.name} · main`}>
        <div className="ac-context">
          {repo.docs.slice(0, 3).map((f) => (
            <span key={f} className="ac-file-chip">
              <FileCode2 size={13} /> {f}
            </span>
          ))}
          <span className="ac-mono ac-context-note">
            {repo.files ?? "—"} archivos · {Math.round(repo.sizeKb / 1024)} MB
          </span>
        </div>
      </Panel>
    </>
  );
}

function Agent() {
  const repo = useRepo();
  return (
    <>
      <div className="ac-agent-head">
        <div>
          <span className="ac-mono">run · fichas-17</span>
          <h3>Leer los 17 repos y escribir una ficha por cada uno</h3>
          <p>Sin clonar ni ejecutar: README, manifiestos, variables y commit de main.</p>
        </div>
        <div className="ac-agent-actions">
          <Tag tone="ok">Completado</Tag>
          <button type="button" className="ac-btn ac-btn--ghost">
            <Play size={13} /> Repetir
          </button>
        </div>
      </div>
      <ol className="ac-steps">
        {[
          ["Leer 15 README públicos y 2 privados", "raw.githubusercontent", "00:12", "done"],
          ["Extraer manifiestos y variables", "package.json · pyproject · .env.example", "00:48", "done"],
          ["Escribir 18 fichas", "write_file", "01:20", "done"],
          ["Verificar enlaces y estados", "python: BROKEN none", "00:06", "done"],
          ["Commit y push a main", "cloud_git · e0993982", "00:04", "done"],
        ].map(([title, tool, time, state], i) => (
          <li key={title}>
            <span className="ac-step-dot">
              {state === "done" ? <Check size={12} /> : i + 1}
            </span>
            <div>
              <b>{title}</b>
              <small>
                <em className="ac-mono">{tool}</em> · {time}
              </small>
            </div>
            <Tag tone="ok">Hecho</Tag>
          </li>
        ))}
      </ol>
      <Panel title="Cambios de la sesión" meta="docs(agntia-code): fichas de los 17 repos" action="Ver diff">
        <div className="ac-diff-summary">
          <div>
            <b>18 archivos</b>
            <small>+1 039 / −0 líneas</small>
          </div>
          <div className="ac-diff-files">
            {["fichas/README.md", "fichas/agente.md", "fichas/agntia-video.md"].map((f) => (
              <span key={f} className="ac-file-chip">
                <FileCode2 size={13} /> {f} <em className="ac-add">+62</em>
              </span>
            ))}
          </div>
          <button type="button" className="ac-btn ac-btn--solid">
            <GitCommitHorizontal size={13} /> Ya en main
          </button>
        </div>
        <Empty title={`${repo.name} sigue sin cambios de producto`}>
          Esta sesión solo añadió documentación. El código del repo no se ha tocado ni ejecutado.
        </Empty>
      </Panel>
    </>
  );
}

function Editor() {
  const repo = useRepo();
  const files = ["README.md", ...repo.docs, repo.language.includes("Python") ? "pyproject.toml" : "package.json"];
  const [file, setFile] = useState(files[0]);
  const snippet = [
    repo.language.includes("Python") ? `# ${repo.name} · main@${repo.sha}` : `// ${repo.name} · main@${repo.sha}`,
    ...(repo.commands.length ? ["# comandos declarados", ...repo.commands] : ["# sin código ejecutable: solo documentación"]),
    ...(repo.env.length ? ["", "# variables (solo nombres)", ...repo.env.slice(0, 4)] : []),
    "",
    `// ${repo.summary}`,
  ];
  return (
    <div className="ac-ide">
      <aside className="ac-tree" aria-label="Archivos del proyecto">
        <span className="ac-mono ac-tree-head">{repo.name}</span>
        {files.map((f) => (
          <button type="button" key={f} className={f === file ? "is-active" : ""} onClick={() => setFile(f)}>
            {f.endsWith(".json") || f.endsWith(".toml") ? <Braces size={13} /> : <FileCode2 size={13} />}
            <span>{f.split("/").filter(Boolean).pop()}</span>
          </button>
        ))}
      </aside>
      <div className="ac-code">
        <div className="ac-tabs">
          <span className="ac-tab is-active">
            <FileCode2 size={12} /> {file.split("/").filter(Boolean).pop()}
            <X size={11} />
          </span>
          <span className="ac-tab">
            <FileCode2 size={12} /> README.md
          </span>
          <span className="ac-tab-spacer" />
          <span className="ac-mono ac-tabs-meta">Solo lectura · {repo.language}</span>
        </div>
        <div className="ac-code-body">
          {snippet.map((line, i) => (
            <div className="ac-code-line" key={i}>
              <span className="ac-ln">{String(i + 1).padStart(2, "0")}</span>
              <code>
                <span className={line.startsWith("#") || line.startsWith("//") ? "ac-com" : undefined}>{line}</span>
              </code>
            </div>
          ))}
        </div>
        <div className="ac-editor-foot">
          <span className="ac-mono">Solo lectura</span>
          <span className="ac-mono">{repo.state}</span>
          <span className="ac-mono">
            {repo.name} · main · {repo.sha}
          </span>
        </div>
      </div>
    </div>
  );
}

function TerminalView() {
  const repo = useRepo();
  const [lines, setLines] = useState<string[]>([
    `$ git log -1 --oneline`,
    `${repo.sha} ${repo.commitTitle}`,
    repo.commands.length ? `$ ${repo.commands[0]}` : "# este repo no tiene comandos: solo documentación",
    repo.commands.length ? "demo: no se ejecuta nada, no hay backend" : "# nada que ejecutar",
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
    setLines((list) => [...list, `$ ${command}`, "◇ la demo no ejecuta comandos", "$ "]);
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
          <span className="ac-mono">{repo.name} — solo lectura</span>
          <span className="ac-term-actions">
            <Tag tone="info">Demo</Tag>
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
        <Panel title="Comandos del repo" meta="Leídos del manifiesto">
          {repo.commands.length ? (
            repo.commands.map((c) => (
              <button
                type="button"
                className="ac-cmd"
                key={c}
                onClick={() => setLines((list) => [...list, `$ ${c}`, "◇ la demo no ejecuta comandos"])}
              >
                <span className="ac-mono">{c}</span>
                <Play size={13} />
              </button>
            ))
          ) : (
            <Empty title="Sin comandos">Este repo solo contiene documentación.</Empty>
          )}
        </Panel>
        <Panel title="Estado verificado" meta={`main@${repo.sha}`}>
          <div className="ac-progress-list">
            <Progress label="Documentación" value={repo.docs.length ? 100 : 0} />
            <Progress label="Pruebas declaradas" value={repo.tests === null ? 0 : 100} />
            <Progress label="Despliegue" value={0} />
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
          <Github size={12} /> {REPOS.length} repos · lectura
        </Tag>
      </div>
      <Panel title={`github.com/${ORG}`} meta={`Inventario leído el ${READ_DATE}`} action="Sincronizar">
        <Table
          cols={["Repositorio", "Proyecto", "Estado", "Commit"]}
          rows={REPOS.map((r) => [
            `${r.name}${r.visibility === "Privado" ? " · privado" : ""}`,
            r.project,
            r.stateLabel,
            `${r.sha} · ${READ_DATE}`,
          ])}
        />
      </Panel>
      <div className="ac-cols">
        <Panel title="Conexión" meta="Solo lectura, sin escritura">
          {[
            [Github, "GitHub", ORG, "Lectura"],
            [Rocket, "Vercel", "sin conectar", "—"],
            [Server, "Cloudflare", "sin conectar", "—"],
          ].map(([Icon, name, handle, state]) => {
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
                <Tag tone={state === "Lectura" ? "info" : "off"}>{String(state)}</Tag>
              </div>
            );
          })}
        </Panel>
        <Panel title="Actividad" meta="Commits y documentación de hoy">
          {ACTIVITY.map(([title, meta]) => (
            <Row icon={GitCommitHorizontal} title={title} meta={meta} tag="main" key={title} />
          ))}
        </Panel>
      </div>
    </>
  );
}

function Pulls() {
  const repo = useRepo();
  return (
    <>
      <div className="ac-tabs-row">
        {["Abiertas", "En revisión", "Cerradas"].map((t, i) => (
          <button type="button" key={t} className={i === 0 ? "is-active" : ""}>
            {t} <em>0</em>
          </button>
        ))}
        <span className="ac-tabs-spacer" />
        <button type="button" className="ac-btn ac-btn--ghost">
          <GitPullRequest size={14} /> Nuevo pull request
        </button>
      </div>
      <Empty title="0 pull requests abiertos en toda la cuenta">
        La auditoría no encontró PRs abiertos. Lo que sí hay son {TOTAL_ISSUES} issues: 11 en <code>agente</code> y 1 en{" "}
        <code>agntia-gestoria</code>.
      </Empty>
      <Panel title={`Ramas de ${repo.name}`} meta="Lo que declara el repo, no lo que hace GitHub" action="Ver todas">
        <Table
          cols={["Rama", "Nota", "Commits", "Última actividad"]}
          rows={repo.branches.map((b) => [b.name, b.note, b.name === "main" ? "—" : "sin dato", READ_DATE])}
        />
      </Panel>
    </>
  );
}

function Review() {
  const repo = useRepo();
  const lines = [
    ["ctx", "# Fichas de repositorio · Agntia Code", ""],
    ["add", "+", "Una ficha por repo de la cuenta `uniscrolliabrain-cloud`."],
    ["add", "+", "Leída de README, manifiestos y `.env.example`; sin ejecutar."],
    ["ctx", "", "| Repo | Estado | main@ |"],
    ["add", "+", `| \`${repo.name}\` | ${repo.state} | \`${repo.sha}\` |`],
  ];
  return (
    <div className="ac-review">
      <div className="ac-review-main">
        <Empty title="Sin PR que revisar">
          Esta revisión muestra el commit de documentación que sí está en <code>main</code>; no hay propuesta de código abierta.
        </Empty>
        <div className="ac-diff-card">
          <header>
            <span className="ac-mono">fichas/{repo.name}.md</span>
            <Tag tone="ok">+62 −0</Tag>
          </header>
          <div className="ac-diff">
            {lines.map(([kind, a, b], i) => (
              <div className={`ac-diff-line ac-diff-line--${kind}`} key={i}>
                <span className="ac-ln">{String(1 + i).padStart(2, "0")}</span>
                <code>
                  <span className="ac-key">{a}</span>
                  {b}
                </code>
              </div>
            ))}
          </div>
        </div>
        {[
          ["Estado sin redondear", `Se conserva ${repo.state}: ${repo.testsLabel}.`],
          ["Nada ejecutado", "La ficha dice explícitamente que no se ha clonado ni ejecutado el repo."],
        ].map(([title, body]) => (
          <article className="ac-comment" key={title}>
            <span className="ac-avatar">AG</span>
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
        <Panel title="Revisión" meta="Documentación, no código">
          <div className="ac-progress-list">
            <Progress label="Enlaces relativos" value={100} />
            <Progress label="Estados revisados" value={100} />
          </div>
          <button type="button" className="ac-btn ac-btn--solid ac-wide">
            <Check size={13} /> Aprobado y en main
          </button>
          <button type="button" className="ac-btn ac-btn--ghost ac-wide">
            Solicitar cambios
          </button>
        </Panel>
        <Panel title="Comprobaciones" meta="Ejecutadas hoy">
          {[
            ["enlaces", "OK"],
            ["typecheck", "OK"],
            ["build", "OK"],
          ].map(([c, state]) => (
            <div className="ac-check-row" key={c}>
              <span className="ac-mono">{c}</span>
              <Tag tone="ok">{state}</Tag>
            </div>
          ))}
        </Panel>
      </aside>
    </div>
  );
}

function Deploys() {
  const deployables = REPOS.filter((r) => r.deploy !== "Sin desplegar");
  return (
    <>
      <Panel title="Último despliegue" meta="Ningún vertical está en producción">
        <div className="ac-pipeline">
          {[
            ["Commit", GitCommitHorizontal, "ok"],
            ["Build", Braces, "wait"],
            ["Preview", Globe, "wait"],
            ["Producción", Rocket, "wait"],
          ].map(([label, Icon, state], i) => {
            const I = Icon as Icon;
            return (
              <div className="ac-pipe-stage" key={String(label)}>
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
          <span className="ac-mono">main · {READ_DATE}</span>
          <Tag tone="off">0 de 17 desplegados</Tag>
          <button type="button" className="ac-btn ac-btn--solid">
            <Rocket size={13} /> Promover a producción
          </button>
        </div>
        <Empty title="El despliegue está deshabilitado a propósito">
          Ningún repo declara un entorno de producción verificado. Marketing, legal y ciberseguridad tienen código; gestoría y
          vídeo son producto local.
        </Empty>
      </Panel>
      <Panel title="Lo que sí corre" meta="Local o Pages, sin dominio propio" action="Ver todos">
        <Table
          cols={["Repo", "Dónde", "Commit", "Estado"]}
          rows={deployables.map((r) => [r.name, r.deploy, r.sha, r.deploy.includes("Pages") ? "Publicado" : "Local"])}
        />
      </Panel>
      <div className="ac-cols">
        <Panel title="Vercel" meta="Sin proyecto vinculado">
          <div className="ac-conn">
            <span className="ac-conn-icon">
              <Rocket size={15} />
            </span>
            <span>
              <b>sin conectar</b>
              <small className="ac-mono">0 proyectos</small>
            </span>
            <Tag tone="off">—</Tag>
          </div>
        </Panel>
        <Panel title="Cloudflare" meta="Sin recursos">
          <div className="ac-conn">
            <span className="ac-conn-icon">
              <Server size={15} />
            </span>
            <span>
              <b>sin conectar</b>
              <small className="ac-mono">0 Workers · 0 D1 · 0 R2</small>
            </span>
            <Tag tone="off">—</Tag>
          </div>
        </Panel>
      </div>
    </>
  );
}

function Infra() {
  const cards: [string, string, string, "ok" | "warn" | "off"][] = [
    ["github-repo", "17 repos", "lectura", "ok"],
    ["github-pages", "demo UI Lab", "agente", "ok"],
    ["postgres-local", "marketing · clientes", "sin instancia", "warn"],
    ["sqlite", "gestoría · vídeo · iadev", "local", "ok"],
    ["ffmpeg", "render de vídeo", "local", "ok"],
    ["workers", "Cloudflare", "sin conectar", "off"],
  ];
  return (
    <>
      <div className="ac-grid ac-grid--3">
        {cards.map(([name, kind, latency, tone]) => (
          <article className="ac-infra" key={name}>
            <header>
              <span className="ac-conn-icon">
                <Server size={15} />
              </span>
              <Tag tone={tone === "ok" ? "ok" : tone === "warn" ? "warn" : "off"}>
                {tone === "ok" ? "Declarado" : tone === "warn" ? "Sin verificar" : "Sin conectar"}
              </Tag>
            </header>
            <h3>{name}</h3>
            <p className="ac-mono">{kind}</p>
            <div className="ac-infra-meta">
              <span>
                Dónde <b>{latency}</b>
              </span>
              <span>
                Región <b>local</b>
              </span>
            </div>
          </article>
        ))}
      </div>
      <Panel title="Almacén por repo" meta="Lo que cada README declara" action="Ver consola">
        <Table
          cols={["Repo", "Almacén", "Estado"]}
          rows={REPOS.filter((r) => r.storage !== "Ninguna").map((r) => [r.name, r.storage, r.state])}
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
      <Empty title="Ningún dominio propio verificado">
        Los 17 repos no declaran DNS ni certificados propios. Solo existe el host de GitHub Pages del demo y la homepage de
        <code> agente</code>.
      </Empty>
      <Panel title="Hosts conocidos" meta="Leídos de GitHub" action="Ver DNS">
        <Table
          cols={["Host", "Proyecto", "Tipo", "SSL", "Estado"]}
          rows={[
            ["uniscrolliabrain-cloud.github.io/agente", "agente", "GitHub Pages", "Válido", "Activo"],
            ["agentiapro-ui-lab.vercel.app", "agente", "Homepage", "Válido", "Externo"],
          ]}
        />
      </Panel>
      <div className="ac-cols">
        <Panel title="Registros DNS" meta="Sin zona gestionada">
          <Table cols={["Tipo", "Nombre", "Valor"]} rows={[["—", "—", "sin registros en esta demo"]]} />
        </Panel>
        <Panel title="Certificados" meta="Solo los del host">
          {["github.io/agente", "agentiapro-ui-lab.vercel.app"].map((d) => (
            <div className="ac-conn" key={d}>
              <span className="ac-conn-icon">
                <Lock size={14} />
              </span>
              <span>
                <b>{d}</b>
                <small className="ac-mono">gestionado por el host</small>
              </span>
              <Tag tone="ok">Válido</Tag>
            </div>
          ))}
        </Panel>
      </div>
    </>
  );
}

function DataView() {
  const repo = useRepo();
  return (
    <>
      <div className="ac-query">
        <div className="ac-query-top">
          <span className="ac-mono">
            <Database size={12} /> {repo.name} · {repo.state}
          </span>
          <Tag tone={repo.storage === "Ninguna" ? "off" : "warn"}>Sin conexión</Tag>
        </div>
        <pre className="ac-query-code">
          <span className="ac-key">--</span> {repo.storage}
          {"\n"}
          <span className="ac-key">select</span> * <span className="ac-key">from</span> tablas
          <span className="ac-key"> limit</span> 50;
        </pre>
        <div className="ac-query-foot">
          <span className="ac-mono">0 filas · sin motor conectado</span>
          <button type="button" className="ac-btn ac-btn--solid">
            <Play size={13} /> Ejecutar
          </button>
        </div>
      </div>
      <div className="ac-cols">
        <Panel title="Almacén declarado" meta={repo.name}>
          <div className="ac-context">
            <span className="ac-file-chip">
              <Database size={13} /> {repo.storage}
            </span>
          </div>
          <p className="ac-context-note">
            La demo no abre bases de datos: muestra lo que el repo declara. Los datos fiscales de gestoría y el material de
            vídeo viven en local y nunca se suben.
          </p>
        </Panel>
        <Panel title="Repos con persistencia" meta="Según README">
          <Table
            cols={["Repo", "Almacén"]}
            rows={REPOS.filter((r) => r.storage !== "Ninguna" && r.storage !== "Ninguna: solo contratos de ingesta").map((r) => [
              r.name,
              r.storage,
            ])}
          />
        </Panel>
      </div>
    </>
  );
}

function Env() {
  const repo = useRepo();
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
      <Panel title={`Variables de ${repo.name}`} meta="Solo nombres: ningún valor vive en la demo" action="Sincronizar">
        {repo.env.length ? (
          <Table
            cols={["Clave", "Entorno", "Valor", "Actualizada", "Estado"]}
            rows={repo.env.map((k) => [k, "Producción", "••••••••", READ_DATE, "Sin valor"])}
          />
        ) : (
          <Empty title="Este repo no declara variables">
            No hay <code>.env.example</code> en la raíz. No se inventan claves para rellenar la tabla.
          </Empty>
        )}
      </Panel>
      <div className="ac-cols">
        <Panel title="Buenas prácticas" meta="Sobre los nombres leídos">
          {[
            ["Secretos fuera del navegador", "ok"],
            ["Ningún valor en la demo", "ok"],
            ["Revisar claves de proveedor antes de desplegar", "warn"],
          ].map(([l, tone]) => (
            <div className="ac-check-row" key={l}>
              <span>{l}</span>
              <Tag tone={tone as "ok" | "warn"}>{tone === "ok" ? "OK" : "Revisar"}</Tag>
            </div>
          ))}
        </Panel>
        <Panel title="Últimos cambios" meta="Hoy">
          {repo.env.slice(0, 3).map((k) => (
            <Row icon={KeyRound} title={k} meta={`${repo.name} · leída de .env.example`} tag="Nombre" key={k} />
          ))}
          {!repo.env.length && <Empty title="Nada que listar">Sin variables declaradas.</Empty>}
        </Panel>
      </div>
    </>
  );
}

function Tests() {
  const counted = REPOS.filter((r) => r.tests !== null);
  return (
    <>
      <div className="ac-stats ac-stats--3">
        {[
          ["Pruebas declaradas", String(TOTAL_TESTS), "suma de 6 repos"],
          ["Repos con recuento", String(counted.length), "el resto no lo declara"],
          ["Ejecutadas aquí", "0", "esta demo no ejecuta tests"],
        ].map(([label, value, note]) => (
          <div className="ac-stat" key={label}>
            <small>{label}</small>
            <strong>{value}</strong>
            <span>{note}</span>
          </div>
        ))}
      </div>
      <div className="ac-cols">
        <Panel title="Evidencia por repo" meta="Lo que dice el README">
          <div className="ac-progress-list">
            {[
              ["Marketing · 169", 100],
              ["Legal · 221", 100],
              ["Ciberseguridad · 311", 100],
              ["Branding · 131", 100],
              ["Clientes · 114", 100],
              ["Finanzas · 41", 100],
            ].map(([label, value]) => (
              <Progress key={String(label)} label={String(label)} value={Number(value)} />
            ))}
          </div>
        </Panel>
        <Panel title="Ejecuciones" meta="Sin runners conectados">
          <Bars n={7} />
          <div className="ac-legend">
            <span>
              <i /> declaradas
            </span>
            <span>
              <i data-v="1" /> ejecutadas
            </span>
          </div>
        </Panel>
      </div>
      <Panel title="Suites" meta="Recuento declarado, no reproducido" action="Ejecutar todas">
        <Table
          cols={["Repo", "Pruebas", "Estado", "Fuente"]}
          rows={REPOS.map((r) => [r.name, r.tests === null ? "—" : String(r.tests), r.stateLabel, r.testsLabel])}
        />
      </Panel>
    </>
  );
}

function Logs() {
  return (
    <>
      <div className="ac-cols ac-cols--wide">
        <Panel title="Sin runtime desplegado" meta="No hay métricas reales que mostrar" action="Ver trazas">
          <Bars n={9} />
          <div className="ac-legend">
            <span>
              <i /> solicitudes
            </span>
            <span>
              <i data-v="1" /> errores
            </span>
          </div>
        </Panel>
        <Panel title="Salud" meta="Del build del demo, no de los repos">
          <div className="ac-progress-list">
            <Progress label="Typecheck ui-lab" value={100} />
            <Progress label="Build UI Lab" value={100} />
            <Progress label="Despliegues" value={0} />
          </div>
        </Panel>
      </div>
      <Panel title="Flujo de la última verificación" meta="Hoy · 26 nov 2026" action="Pausar">
        <div className="ac-log">
          {[
            ["00:00:00", "info", "fichas: 18 · líneas: 1039"],
            ["00:00:01", "info", "BROKEN none"],
            ["00:00:02", "info", "typecheck ui-lab: 0 errores"],
            ["00:00:03", "info", "build UI Lab: 0 errores"],
            ["00:00:04", "info", "push main: b213071c..e0993982"],
            ["00:00:05", "warn", "0 repos desplegados: no hay métricas que leer"],
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
        <Tag tone="info">6 rutas · migración real</Tag>
      </div>
      <div className="ac-grid ac-grid--3">
        {[
          ["Leer un repo sin clonarlo", 100],
          ["Clasificar el estado sin inflarlo", 100],
          ["Documentar variables sin valores", 100],
          ["De esqueleto a implementación", 60],
          ["Producto local a servicio", 40],
          ["Licencia y propiedad", 25],
        ].map(([title, progress], i) => (
          <article className="ac-course" key={String(title)}>
            <div className="ac-card-cover">
              <span className="ac-mono">Ruta 0{i + 1}</span>
              <div className="ac-cover-glyph">
                <GraduationCap size={22} />
              </div>
            </div>
            <div>
              <span className="ac-mono">Módulo 0{i + 1} · Agntia Code</span>
              <h3>{String(title)}</h3>
              <div className="ac-progress">
                <div>
                  <span>Progreso</span>
                  <b>{progress} %</b>
                </div>
                <span className="ac-track">
                  <i style={{ width: `${progress}%` }} />
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
      <Panel title="Rutas" meta="Desde la auditoría a la migración" action="Ver academia">
        {[
          ["Auditar los 17 repos", "Inventario, tamaños, licencias e issues"],
          ["Escribir la ficha", "Estado, comandos, variables y límites"],
          ["Abrir el proyecto en Agntia Code", "Repositorios, ramas y entornos"],
        ].map(([r, note], i) => (
          <button type="button" className="ac-route" key={r}>
            <span className="ac-route-index">0{i + 1}</span>
            <span>
              <b>{r}</b>
              <small>{note}</small>
            </span>
            <Tag>{i === 0 ? "Hecho" : "Continuar"}</Tag>
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
        <Panel title="Entradas recientes" meta="Lo que pasó de verdad en el repo" action="Nueva entrada">
          <ol className="ac-timeline">
            {JOURNAL.map(([when, title, tag, tone]) => (
              <li key={title}>
                <span className="ac-timeline-dot" />
                <div>
                  <small className="ac-mono">{when}</small>
                  <b>{title}</b>
                  <Tag tone={tone as "ok" | "info" | "warn" | "off"}>{tag}</Tag>
                </div>
              </li>
            ))}
          </ol>
        </Panel>
        <Panel title="Decisiones abiertas" meta="Pendientes del propietario">
          {[
            ["Licencia para 14 de los 17 repos", "Sin licencia no se puede reutilizar con claridad."],
            ["README real para agntia-iadev", "Hoy la puerta de entrada tiene 14 bytes."],
          ].map(([d, note]) => (
            <div className="ac-decision" key={d}>
              <b>{d}</b>
              <p>{note}</p>
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
      <Panel title="Qué ha cambiado" meta="Del lorem a los datos reales">
        <div className="ac-grid ac-grid--3">
          {[
            ["17 repos", "Con estado, SHA, comandos y variables"],
            ["18 fichas", "1 039 líneas, enlaces verificados"],
            ["0 despliegues", "Ningún vertical en producción"],
          ].map(([t, note], i) => (
            <div className="ac-change" key={t}>
              <span className="ac-mono">0{i + 1}</span>
              <b>{t}</b>
              <p>{note}</p>
              <Tag>{["+17", "+18", "0"][i]}</Tag>
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
  data: <DataView />,
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
    sortSections,
    bindRow,
    orderDrag,
    orderAnnounce,
  } = useSmartNav<SectionId>({
    storageKey: "agntia_code_smart_v1",
    ids: SECTION_IDS,
    initial: "estudio",
  });
  const [repoName, setRepoName] = useState(() => {
    try {
      const stored = window.localStorage.getItem("agntia_code_repo");
      return stored && REPOS.some((entry) => entry.name === stored) ? stored : "agente";
    } catch {
      return "agente";
    }
  });
  const [projectOpen, setProjectOpen] = useState(false);
  const [sessionId,setSessionId]=useState<string|null>(null);
  const [sessionTitles,setSessionTitles]=useState<Record<string,string>>({});
  const sessionItems=SESSIONS.map(([title,repoName],index)=>({id:String(index),title:sessionTitles[String(index)]??title,preview:repoName}));
  const [env, setEnv] = useState(() => {
    try {
      const stored = window.localStorage.getItem("agntia_code_env");
      return stored === "Producción" ? "Producción" : "Preview";
    } catch {
      return "Preview";
    }
  });
  const [drawer, setDrawer] = useState(false);
  const [notice, setNotice] = useState("");
  const scroller = useRef<HTMLDivElement>(null);
  const section = SECTIONS.find((s) => s.id === sectionId) ?? SECTIONS[0];
  const repo = REPOS.find((r) => r.name === repoName) ?? REPOS[0];

  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 });
  }, [sectionId]);

  useEffect(() => {
    try {
      window.localStorage.setItem("agntia_code_repo", repoName);
      window.localStorage.setItem("agntia_code_env", env);
    } catch {
      // La demo sigue funcionando sin memoria de preferencias.
    }
  }, [repoName, env]);

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
        hint: `${entry.group} · ${entry.variant}`,
        keywords: `${entry.variant} ${entry.id}`,
        icon: <Icon size={15} />,
        canPin: true,
        run: () => choose(entry.id),
      };
    }),
    ...REPOS.map((entry): SmartCommand => ({
      id: `repo-${entry.name}`,
      label: entry.name,
      group: "Proyectos",
      hint: `${entry.state} · ${entry.language}`,
      keywords: `${entry.summary} ${entry.project}`,
      icon: <FolderGit2 size={15} />,
      run: () => {
        setRepoName(entry.name);
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
      hint: `Repositorio ${repo.name}`,
      icon: <Github size={15} />,
      run: () => run("Sincronización simulada: datos de main del 26 nov."),
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
    <RepoCtx.Provider value={repo}>
      <div className="ac-root meta-dock-root" role="dialog" aria-modal="true" aria-label="Agntia Code">
      <MetaDock entries={SECTIONS} activeView={sectionId} onSelectView={choose} namespace="agntia_ac"/>
      <OrderGhost drag={orderDrag}/>
      <OrderAnnounce text={orderAnnounce}/>
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
                <b>{repo.name}</b>
                <small className="ac-mono">
                  <GitBranch size={10} /> main · {repo.sha}
                </small>
              </span>
              <ChevronDown size={13} />
            </button>
            {projectOpen && (
              <div className="ac-project-menu" role="listbox" aria-label="Proyecto">
                {REPOS.map((p) => (
                  <button
                    type="button"
                    key={p.name}
                    role="option"
                    aria-selected={p.name === repoName}
                    onClick={() => {
                      setRepoName(p.name);
                      setProjectOpen(false);
                    }}
                  >
                    <span>
                      {p.name}
                      <small className="ac-mono"> · {p.state}</small>
                    </span>
                    {p.name === repoName && <Check size={13} />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <MetaChats namespace="agntia_code" items={sessionItems} active={sessionId} onSelect={id=>{setSessionId(id);const session=SESSIONS[Number(id)];if(session&&REPOS.some(r=>r.name===session[1]))setRepoName(session[1]);choose("chats")}} onRename={(id,title)=>setSessionTitles(prev=>({...prev,[id]:title}))}/>
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
                    <Icon size={15} />
                    <span>{label}</span>
                    {isPinned(id) && <Pin size={11} className="ac-nav-pinmark" aria-hidden="true" />}
                    {id === "ramas" && <em className="ac-nav-badge">0</em>}
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
              <small>{REPOS.length} repos · 0 tareas en cola</small>
              <button
                type="button"
                className="ac-btn ac-btn--ghost"
                onClick={() => run("Sesión de agente simulada: la demo no ejecuta código.")}
              >
                <Sparkles size={13} /> Abrir sesión
              </button>
            </div>
            <button type="button" className="ac-back" onClick={onClose}>
              <ArrowLeft size={15} /> Volver a la app
            </button>
            <div className="ac-user">
              <span className="ac-avatar">{initials(repo.name)}</span>
              <div>
                <b>{repo.project}</b>
                <small>{repo.language}</small>
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
              <button
                type="button"
                className="ac-icon-btn"
                aria-label="Abrir GitHub"
                onClick={() => run("GitHub en solo lectura: los datos se leyeron el 26 nov 2026.")}
              >
                <Github size={15} />
              </button>
              <button type="button" className="ac-btn ac-btn--solid" onClick={() => run("Conversación de construcción simulada.")}>
                <Sparkles size={14} /> Construir
              </button>
              <span className="ac-avatar ac-avatar--sm">AG</span>
            </div>
          </header>

          <div className="ac-scroll" ref={scroller}>
            <main className="ac-page">
              <header className="ac-page-head">
                <div>
                  <span className="ac-mono ac-path">
                    <SquareTerminal size={11} /> {ORG}/{repo.name} · main@{repo.sha}
                  </span>
                  <h1>{section.label}</h1>
                  <p>{repo.summary}</p>
                </div>
                <div className="ac-head-actions">
                  <span className="ac-live">
                    <span /> {env}
                  </span>
                  <button type="button" className="ac-btn ac-btn--ghost" onClick={() => run("Sincronización simulada: datos de main del 26 nov.")}>
                    <Github size={14} /> Sincronizar
                  </button>
                  <button
                    type="button"
                    className="ac-btn ac-btn--solid"
                    onClick={() => run("Despliegue deshabilitado: 0 de 17 repos están desplegados.")}
                  >
                    <Rocket size={14} /> Desplegar
                  </button>
                </div>
              </header>

              <div className="ac-body" key={`${repo.name}-${section.id}`}>
                {VARIANTS[section.variant]}
              </div>

              <footer className="ac-page-foot">
                <span>AGNTIAPRO · AGNTIA CODE · DEMO</span>
                <span>
                  {repo.name} · {repo.state} · leído el {READ_DATE}
                </span>
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
              <GitCommitHorizontal size={11} /> {repo.sha}
            </span>
            <span className="ac-mono">
              <FolderGit2 size={11} /> {repo.name}
            </span>
            <span className="ac-status-spacer" />
            <span className="ac-mono">
              <CircleAlert size={11} /> {repo.issues}
            </span>
            <span className="ac-mono">
              <Wifi size={11} /> GitHub lectura
            </span>
            <span className="ac-mono">{repo.language}</span>
          </div>
        </div>

        <SmartCommandPalette
          open={paletteOpen}
          tone="code"
          title="Buscar en Agntia Code"
          subtitle={`${SECTIONS.length} workspaces · ${REPOS.length} repos`}
          placeholder="Buscar workspaces, repos o acciones…"
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
    </RepoCtx.Provider>
  );
}
