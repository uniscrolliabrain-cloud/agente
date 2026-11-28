// OBSERVABILITY_METAAPP_V1 - tercer clon del laboratorio.
//
// Hermano de Tu Empresa (company-v2) y Agntia Code (code-v1): se abre desde
// Ajustes > Observabilidad y Ciberseguridad y tapa el shell mientras está
// abierto. Es una meta-app de demostración: los 18 workspaces están descritos
// con relleno (lorem ipsum) a propósito. Primero se valida la estructura de
// navegación; el contenido real se sustituye cuando el runtime exponga el dump
// de trazas.
//
// Qué NO hace: no consulta el backend, no pide métricas, no ejecuta ningún
// comando y no presenta los textos de relleno como datos medidos.
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowLeft,
  Brain,
  ChevronRight,
  ClipboardCheck,
  Cpu,
  FileCheck2,
  Hourglass,
  IdCard,
  KeyRound,
  Layers,
  Library,
  Menu,
  Network,
  PanelLeft,
  Pin,
  Radio,
  Route,
  ScanSearch,
  Search,
  ShieldCheck,
  Siren,
  X,
  Zap,
} from "lucide-react";
import "../design-system/agntia-tokens.css";
import MetaChats from "../smart-ux/MetaChats";
import MetaDock from "../smart-ux/MetaDock";
import { OrderAnnounce, OrderGhost } from "../../../web/src/ux/OrderGhost";
import SplitPane, { SplitDropHint } from "../../../web/src/ux/SplitPane";
import {
  SmartCommandPalette,
  SmartShortcuts,
  useSmartNav,
  type SmartCommand,
  type SmartShortcut,
} from "../smart-ux/smart-ux";
import "./observability.css";

type Icon = typeof Route;

export type ObservabilitySectionId =
  | "trazas"
  | "thoughts"
  | "contexto"
  | "entregas"
  | "fast"
  | "slow"
  | "jev"
  | "tarjetas"
  | "rag"
  | "grafo"
  | "memoria"
  | "kernel"
  | "bus"
  | "metricas"
  | "alertas"
  | "rls"
  | "egress"
  | "auditoria";

type Section = {
  id: ObservabilitySectionId;
  label: string;
  icon: Icon;
  group: string;
  title: string;
  lead: string;
};

const GROUPS = ["Trazas", "Cognición", "Plataforma", "Seguridad"] as const;

// 18 workspaces = 18 puntos de impresión del runtime. Los ids siguen el orden
// en que se leen en una traza: entrada -> contexto -> motores -> plataforma ->
// seguridad.
const SECTIONS: Section[] = [
  { id: "trazas", label: "Traza completa", icon: Route, group: "Trazas", title: "Una traza, de la entrada al recibo", lead: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aquí se imprimirá la cadena completa de un turno con una sola clave de correlación." },
  { id: "thoughts", label: "Thoughts", icon: Brain, group: "Trazas", title: "Thoughts con su atención", lead: "Sed do eiusmod tempor incididunt ut labore. Cada pensamiento mostrará rol, actor, vector de atención, aristas y procedencia." },
  { id: "contexto", label: "Contexto y snapshots", icon: Layers, group: "Trazas", title: "Qué vio el modelo, literalmente", lead: "Ut enim ad minim veniam, quis nostrud exercitation. Segmentos, tokens, marcas de agua y por qué entró o quedó fuera cada referencia." },
  { id: "entregas", label: "Entregas y recibos", icon: FileCheck2, group: "Trazas", title: "Reserva, render y ack", lead: "Duis aute irure dolor in reprehenderit. Lease, fence y recibo por tarjeta entregada, con la diferencia entre «consumido» y «recibido»." },
  { id: "fast", label: "Fast", icon: Zap, group: "Cognición", title: "El prompt que recibió Fast", lead: "Excepteur sint occaecat cupidatat non proident. Prompt registrado, mensajes enviados, latencia, presupuesto y eventos públicos emitidos." },
  { id: "slow", label: "Slow", icon: Hourglass, group: "Cognición", title: "Trabajo durable, paso a paso", lead: "Sunt in culpa qui officia deserunt. Cola, fence, intentos, presupuesto de contexto y de salida, y por qué un job terminó en fallo." },
  { id: "jev", label: "JEV", icon: ScanSearch, group: "Cognición", title: "Las siete preguntas del clasificador", lead: "Mollit anim id est laborum. Respuestas con sus probabilidades, modelo reportado, uso y recibo de salida (egress)." },
  { id: "tarjetas", label: "Tarjetas", icon: IdCard, group: "Cognición", title: "De pensamiento a tarjeta", lead: "At vero eos et accusamus. Tarjeta, evidencia, epistemia, familia ontológica y revisión propuesta frente a aprobada." },
  { id: "rag", label: "RAG", icon: Library, group: "Cognición", title: "Qué se recuperó y qué se descartó", lead: "Nam libero tempore, cum soluta nobis. Consulta, aciertos, revisiones obsoletas y estado degradado de la fuente." },
  { id: "grafo", label: "Grafo", icon: Network, group: "Cognición", title: "Aristas y su procedencia", lead: "Temporibus autem quibusdam et aut officiis. Vecinos, profundidad, revisiones enlazadas y aristas rechazadas por cambio." },
  { id: "memoria", label: "Memoria longitudinal", icon: Brain, group: "Cognición", title: "Segmentos, retención y borrado", lead: "Itaque earum rerum hic tenetur. Segmentos por evento, contexto narrativo empaquetado y ejecuciones de purga por antigüedad." },
  { id: "kernel", label: "Kernel", icon: Cpu, group: "Plataforma", title: "Turnos, hijos y cierre", lead: "Quis autem vel eum iure reprehenderit. Árbol de turnos, quién abrió y cerró, con qué motivo y qué auditoría dejó cada paso." },
  { id: "bus", label: "Bus de eventos", icon: Radio, group: "Plataforma", title: "Log durable y cursores", lead: "Nemo enim ipsam voluptatem. Secuencia por tenant, causalidad, deduplicación y retraso de cada consumidor." },
  { id: "metricas", label: "Métricas y SLO", icon: Activity, group: "Plataforma", title: "Series, cuantiles y huecos", lead: "Neque porro quisquam est. Latencia por etapa, saturación de carriles y la diferencia entre «cero medido» y «no disparó»." },
  { id: "alertas", label: "Alertas y readiness", icon: Siren, group: "Plataforma", title: "Qué está listo y qué no", lead: "Qui dolorem ipsum quia dolor. Preflight de secretos, estado de workers y alertas que distinguen silencio de avería." },
  { id: "rls", label: "Aislamiento y RLS", icon: ShieldCheck, group: "Seguridad", title: "Quién puede ver qué", lead: "Ut enim ad minima veniam. Identidad, política vigente, aislamiento por tenant y pruebas de fuga entre cuentas." },
  { id: "egress", label: "Secretos y egress", icon: KeyRound, group: "Seguridad", title: "Qué sale y con qué permiso", lead: "Quis nostrum exercitationem. Nombres de variables, nunca valores; permisos de salida, cuotas y caducidad de cada concesión." },
  { id: "auditoria", label: "Auditoría y cumplimiento", icon: ClipboardCheck, group: "Seguridad", title: "La cadena que se puede verificar", lead: "At vero eos et accusamus et iusto. Entradas de auditoría con hash, verificación de cadena y límites declarados del sistema." },
];

const SECTION_IDS = SECTIONS.map((section) => section.id);

/* ------------------------------------------------------------------ chats
 * Igual que en Tu Empresa y Agntia Code, el rail lleva la lista de
 * conversaciones del entorno. Aquí son investigaciones abiertas sobre trazas:
 * ninguna se ejecuta, todas existen para validar el comportamiento del rail. */
type ObsChat = { id: string; title: string; preview: string };

const SEED_CHATS: ObsChat[] = [
  { id: "q1", title: "Por qué el turno 4182 tardó 9 s", preview: "Sospecha del carril Fast, sin confirmar." },
  { id: "q2", title: "JEV rechazó tres tarjetas seguidas", preview: "Comparar respuesta del clasificador con el recibo." },
  { id: "q3", title: "Lectura cruzada entre dos tenants", preview: "Solo estructura: ninguna consulta real de datos." },
];

const LOREM_ROWS = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  "Ut enim ad minim veniam, quis nostrud exercitation ullamco.",
  "Duis aute irure dolor in reprehenderit in voluptate velit esse.",
  "Excepteur sint occaecat cupidatat non proident, sunt in culpa.",
  "Mollit anim id est laborum, sed ut perspiciatis unde omnis.",
];

const LOREM_STATS = ["00", "—", "0 ms", "n/d"];

function Block({ title, hint }: { title: string; hint: string }) {
  return (
    <section className="ob-panel">
      <header>
        <h2>{title}</h2>
        <small>{hint}</small>
      </header>
      <ul className="ob-rows">
        {LOREM_ROWS.map((row, index) => (
          <li key={row}>
            <span className="ob-dot" aria-hidden="true" data-i={index} />
            <span>{row}</span>
            <em>lorem</em>
          </li>
        ))}
      </ul>
    </section>
  );
}

// SPLIT_PANE_V1 - el cuerpo de un workspace, extraído para poder pintar dos a
// la vez sin duplicar contenido.
function Workspace({ section }: { section: Section }) {
  return (
    <>
      <article className="ob-hero">
        <span className="ob-kicker">
          {section.group} · workspace {String(SECTION_IDS.indexOf(section.id) + 1).padStart(2, "0")} de 18
        </span>
        <h1>{section.title}</h1>
        <p>{section.lead}</p>
        <div className="ob-hero-tags">
          <span>Sin backend</span>
          <span>Texto de relleno</span>
          <span>Estructura validada</span>
        </div>
      </article>

      <div className="ob-stats" aria-label="Indicadores de relleno">
        {["Eventos", "Traza media", "Latencia p99", "Incidencias"].map((label, index) => (
          <div className="ob-stat" key={label}>
            <small>{label}</small>
            <b>{LOREM_STATS[index]}</b>
            <em>lorem ipsum</em>
          </div>
        ))}
      </div>

      <div className="ob-grid">
        <Block title="Qué se imprimirá aquí" hint="Contrato de datos previsto" />
        <Block title="Estado del contrato" hint="Lo que tiene que existir antes de conectar" />
      </div>
    </>
  );
}

export default function ObservabilityApp({ onClose }: { onClose: () => void }) {
  const nav = useSmartNav<ObservabilitySectionId>({
    storageKey: "agntia_obs_nav_v1",
    ids: SECTION_IDS,
    initial: "trazas",
    onDropOutside: (id) => setSplitId(id as ObservabilitySectionId),
    railSelector: ".ob-rail",
  });
  // SPLIT_PANE_V1 - el workspace que se mira al lado.
  const [splitId, setSplitId] = useState<ObservabilitySectionId | null>(null);
  const splitSection = splitId ? (SECTIONS.find((entry) => entry.id === splitId) ?? null) : null;
  const [drawer, setDrawer] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [chats, setChats] = useState<ObsChat[]>(SEED_CHATS);
  const [chatId, setChatId] = useState<string | null>(null);

  const section = SECTIONS.find((entry) => entry.id === nav.sectionId) ?? SECTIONS[0];
  const { go, pins, isPinned, togglePin, collapsed, setCollapsed, openPalette, openShortcuts, sortSections, bindRow, orderDrag, orderAnnounce, orderOutside } = nav;

  // Mismo contrato que los otros dos clones: la meta-app escucha en captura y
  // corta la propagación para que el shell que queda debajo no abra a la vez su
  // propia paleta ni intercepte Esc. Después, precedencia de capas al cerrar.
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
        if (nav.paletteOpen) nav.closePalette();
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
      if (nav.paletteOpen) nav.closePalette();
      else if (nav.shortcutsOpen) nav.closeShortcuts();
      else if (drawer) setDrawer(false);
      else onClose();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [
    drawer,
    onClose,
    openPalette,
    openShortcuts,
    setCollapsed,
    nav.paletteOpen,
    nav.closePalette,
    nav.shortcutsOpen,
    nav.closeShortcuts,
  ]);

  const commands = useMemo<SmartCommand[]>(
    () =>
      SECTIONS.map((entry) => ({
        id: entry.id,
        label: entry.label,
        group: "Ir a",
        hint: entry.group,
        keywords: entry.title,
        canPin: true,
        run: () => {
          go(entry.id);
          setDrawer(false);
        },
      })),
    [go],
  );

  const shortcuts: SmartShortcut[] = [
    { keys: "⌘K", label: "Buscar workspace o acción", group: "Navegación" },
    { keys: "/", label: "Abrir la búsqueda", group: "Navegación" },
    { keys: "⌘B", label: "Plegar o expandir el menú", group: "Navegación" },
    { keys: "?", label: "Ver todos los atajos", group: "Navegación" },
    { keys: "esc", label: "Cerrar capas y volver a la app", group: "Navegación" },
    { keys: "doble clic", label: "Fijar o desfijar un acceso", group: "Accesos" },
    { keys: "alt + ↑↓", label: "Mover un acceso fijado", group: "Accesos" },
  ];

  return (
    <div
      className={"ob-root meta-dock-root" + (collapsed ? " is-collapsed" : "")}
      role="dialog"
      aria-modal="true"
      aria-label="Observabilidad y Ciberseguridad · meta-app de laboratorio"
    >
      <MetaDock entries={SECTIONS} activeView={section.id} onSelectView={go} namespace="agntia_obs" />
      <OrderGhost drag={orderDrag} />
      <OrderAnnounce text={orderAnnounce} />
      <SplitDropHint active={orderOutside} />
      <button
        type="button"
        className={"ob-scrim" + (drawer ? " is-on" : "")}
        aria-label="Cerrar menú"
        onClick={() => setDrawer(false)}
      />

      <aside className={"ob-rail" + (drawer ? " is-open" : "")}>
        <div className="ob-brand">
          <div className="ob-brand-mark" aria-hidden="true">
            <span />
          </div>
          <div className="ob-brand-text">
            <small>AgntiaPro</small>
            <strong>Observabilidad</strong>
            <em>y Ciberseguridad</em>
          </div>
          <button type="button" className="ob-rail-close" aria-label="Cerrar menú" onClick={() => setDrawer(false)}>
            <X size={16} />
          </button>
        </div>

        <MetaChats
          namespace="agntia_obs"
          items={chats}
          active={chatId}
          onSelect={(id) => {
            setChatId(id);
            setDrawer(false);
          }}
          onRename={(id, title) => setChats((list) => list.map((chat) => (chat.id === id ? { ...chat, title } : chat)))}
          onNew={() =>
            setChats((list) => [
              {
                id: `q${Date.now()}`,
                title: "Nueva investigación",
                preview: "Solo interfaz: aquí se abrirá una traza concreta.",
              },
              ...list,
            ])
          }
        />

        <nav className="ob-nav" aria-label="Workspaces de observabilidad">
          {pins.length > 0 && (
            <div className="ob-nav-group">
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
                    className={id === section.id ? "is-active" : ""}
                    aria-current={id === section.id ? "page" : undefined}
                    onClick={() => {
                      go(pinned.id);
                      setDrawer(false);
                    }}
                  >
                    <Icon size={16} />
                    <span>{pinned.label}</span>
                    <Pin size={11} className="ob-nav-pinmark" aria-hidden="true" />
                  </button>
                );
              })}
            </div>
          )}
          {GROUPS.map((group) => (
            <div className="ob-nav-group" key={group}>
              <small>{group}</small>
              {sortSections(SECTIONS.filter((entry) => entry.group === group)).map(({ id, label, icon: Icon }) => (
                <button
                  type="button"
                  key={id}
                  {...bindRow(id, label)}
                  className={id === section.id ? "is-active" : ""}
                  aria-current={id === section.id ? "page" : undefined}
                  title={label}
                  onClick={() => {
                    go(id);
                    setDrawer(false);
                  }}
                >
                  <Icon size={16} />
                  <span>{label}</span>
                  {isPinned(id) && <Pin size={11} className="ob-nav-pinmark" aria-hidden="true" />}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="ob-rail-foot">
          <div className="ob-progress">
            <div>
              <span>Workspaces</span>
              <b>18 / 18</b>
            </div>
            <span className="ob-track">
              <i style={{ width: "100%" }} />
            </span>
            <small>Estructura lista · contenido lorem ipsum</small>
          </div>
          <button type="button" className="ob-back" onClick={onClose}>
            <ArrowLeft size={15} />
            <span>Volver a la app</span>
          </button>
          <div className="ob-user">
            <span className="ob-avatar">OW</span>
            <div>
              <b>Agntia Demo</b>
              <small>Propietario · demo</small>
            </div>
            <PanelLeft size={15} />
          </div>
        </div>
      </aside>

      <div className="ob-stage">
        <header className="ob-top">
          <div className="ob-top-left">
            <button type="button" className="ob-icon-btn ob-only-mobile" aria-label="Abrir menú" onClick={() => setDrawer(true)}>
              <Menu size={17} />
            </button>
            <button
              type="button"
              className="ob-icon-btn ob-only-desktop"
              aria-label={collapsed ? "Expandir menú" : "Plegar menú"}
              onClick={() => setCollapsed((value) => !value)}
            >
              <PanelLeft size={17} />
            </button>
            <nav className="ob-crumb" aria-label="Ruta">
              <button type="button" className="ob-crumb-root" onClick={() => go("trazas")}>
                Observabilidad
              </button>
              <ChevronRight size={13} />
              <span>{section.group}</span>
              <ChevronRight size={13} />
              <b aria-current="page">{section.label}</b>
            </nav>
          </div>
          <div className="ob-top-right">
            <button
              type="button"
              className="ob-icon-btn"
              aria-label="Buscar en observabilidad"
              aria-haspopup="dialog"
              onClick={openPalette}
            >
              <Search size={16} />
            </button>
            <span className="ob-demo">
              <span /> Lorem ipsum
            </span>
            <button
              type="button"
              className="ob-top-search"
              onClick={openPalette}
              aria-haspopup="dialog"
              aria-keyshortcuts="Meta+K Control+K"
              title="Buscar workspaces y acciones (⌘K)"
            >
              <Search size={14} />
              <span>Buscar en los 18 workspaces…</span>
              <kbd>⌘K</kbd>
            </button>
            <button
              type="button"
              className="ob-btn ob-btn--ghost ob-only-desktop"
              onClick={() => setNotice("El dump real llegará cuando el runtime exponga la traza.")}
            >
              Exportar traza
            </button>
            <button
              type="button"
              className="ob-btn ob-btn--solid"
              onClick={() => togglePin(section.id)}
              aria-pressed={isPinned(section.id)}
            >
              <Pin size={14} /> {isPinned(section.id) ? "Fijado" : "Fijar"}
            </button>
          </div>
        </header>

        <div className="ob-scroll">
          <SplitPane
            label={splitSection?.title ?? ""}
            {...(splitSection ? { side: <Workspace section={splitSection} /> } : {})}
            onClose={() => setSplitId(null)}
          >
            <Workspace section={section} />
          </SplitPane>

          <footer className="ob-note">
            <b>Contenido de relleno.</b> Este workspace existe para validar navegación, densidad y comportamiento. Ningún texto ni
            cifra de esta pantalla describe el sistema real.
          </footer>
        </div>
      </div>

      {notice && (
        <div className="ob-toast" role="status">
          <span>{notice}</span>
          <button type="button" aria-label="Cerrar aviso" onClick={() => setNotice(null)}>
            <X size={14} />
          </button>
        </div>
      )}

      <SmartCommandPalette
        open={nav.paletteOpen}
        tone="code"
        title="Observabilidad y Ciberseguridad"
        subtitle={`${SECTIONS.length} workspaces`}
        placeholder="Buscar workspace o acción…"
        commands={commands}
        recents={nav.recents}
        pins={pins}
        onTogglePin={togglePin}
        onClose={nav.closePalette}
        onShowShortcuts={nav.openShortcuts}
      />
      <SmartShortcuts
        open={nav.shortcutsOpen}
        tone="code"
        title="Atajos · Observabilidad"
        shortcuts={shortcuts}
        onClose={nav.closeShortcuts}
      />
    </div>
  );
}
