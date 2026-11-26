// B3_SIDEBAR_LIVE_V1 - LiveItem disponible para usar en la lista de recientes.
// B1_SIDEBAR_V1
// SIDEBAR_RAIL_V1 - con la barra plegada quedan los iconos en un rail con
// tooltip al pasar por encima; los ajustes viven abajo, en color de acento.
import {
  Activity,
  BarChart3,
  Brain,
  ChevronsRight,
  ClipboardList,
  Files,
  FolderKanban,
  Gauge,
  GraduationCap,
  LayoutDashboard,
  LayoutGrid,
  MessageSquareText,
  PanelsTopLeft,
  PanelLeftClose,
  Search,
  Settings,
  UserCog,
  Users,
} from "lucide-react";
import { Fragment, useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type MouseEvent, type PointerEvent as ReactPointerEvent } from "react";
import type { Thread } from "../api/threads";
// SIDEBAR_THREADS_V2 - filas compactas con menu por conversacion.
import SidebarThreads, { type ThreadPatch } from "./SidebarThreads";
// BRAND_MARK_V1 - la marca AgntiaPro tambien en la barra lateral.
import { BrandLockup } from "./BrandMark";
import { WhatsAppIcon } from "./WhatsAppIcon";

// WS_UI_APPVIEW_V1 - anadida entrada workspace.
// SIDEBAR_BRAND_AGNTIA_V1
export type AppView = "today" | "chat" | "tasks" | "documents" | "projects" | "control-center" | "memory" | "users" | "team" | "workspace" | "centro-mando" | "whatsapp" | "operations" | "command-studio" | "apps" | "formation";

interface Props {
  activeView: AppView;
  onSelectView: (view: AppView) => void;
  isAdmin: boolean;
  activeThreadId: string | null;
  threads: Thread[];
  onSelectThread: (id: string) => void;
  /** SIDEBAR_THREADS_V2 - acciones del menu de cada conversacion. */
  onRenameThread: (id: string, title: string) => Promise<unknown> | void;
  onPatchThread: (id: string, patch: ThreadPatch) => Promise<unknown> | void;
  onDeleteThread?: (id: string) => Promise<unknown> | void;
  userName: string;
  userRole: string;
  onOpenProfile: () => void;
  /** DEMO_TENANT_V1 - aviso y salida del tenant sintetico. */
  demo?: { active: boolean; onExit: () => void };
  /** SESSION_TENANT_NOTICE_V1 - empresa resuelta por /api/auth/me para esta sesion. */
  tenant?: { id: string } | null;
  /** SIDEBAR_RAIL_V1 - plegada deja solo los iconos. */
  collapsed: boolean;
  onToggleCollapsed?: () => void;
  /** SIDEBAR_SETTINGS_V1 - menu de cuenta y cierre de sesion. */
  onOpenSettings: () => void;
  /** DEMO_VIEWS_V1 - el clon de demostracion anade la entrada Apps; en
   *  produccion el prop va apagado y el menu queda igual. */
  showApps?: boolean;
  /** DEMO_VIEWS_V1 - igual que Apps: Formación solo existe en el clon. */
  showFormation?: boolean;
  /** UI_LAB_LEGACY_V1 - el clon retiró Usuarios, Centro de control, Operaciones
   *  y Workspaces: su superficie vive ya en otros workspaces. Producción no
   *  pasa el prop, así que su menú queda exactamente igual. */
  hideLegacyViews?: boolean;
  /** CARTERA_DEMO_V1 - en el clon, Proyectos pasa a llamarse Cartera porque lo
   *  que se monta es la cartera V2. Producción no pasa el prop y el menú queda
   *  exactamente igual. */
  projectsLabel?: string;
  /** SIDEBAR_ORDER_V1 - pulsación larga y arrastre para reordenar el menú.
   *  Solo el clon de demostración lo enciende; producción no pasa el prop y
   *  conserva su menú exactamente igual. */
  reorderableNav?: boolean;
  /** CHATS_PANEL_V1 - panel de Chats redimensionable y fijable. También solo
   *  en el clon de demostración. */
  chatsPanel?: boolean;
}

// UI_LAB_LEGACY_V1 - vistas retiradas solo en el clon de demostración.
const LEGACY_VIEWS: AppView[] = ["control-center", "operations", "workspace"];

// SIDEBAR_ORDER_V1 - orden manual del menú, guardado en el navegador.
type NavEntry = { id: AppView; label: string; icon: typeof MessageSquareText };
type NavDrag = { id: AppView; y: number; left: number; width: number; height: number; grab: number };
const NAV_ORDER_KEY = "agntia_sidebar_order_v1";
const NAV_HOLD_MS = 260;
const NAV_MOVE_TOLERANCE = 6;
function readNavOrder(): AppView[] {
  try {
    const raw = localStorage.getItem(NAV_ORDER_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? parsed.filter((value): value is AppView => typeof value === "string") : [];
  } catch {
    return [];
  }
}

// CHATS_PANEL_V1 - altura del panel de Chats y conversaciones fijadas.
const CHATS_HEIGHT_KEY = "agntia_chats_panel_height_v1";
const PINNED_KEY = "agntia_pinned_threads_v1";
// CHATS_ORDER_V1 - orden manual de los chats, guardado en el navegador.
const CHAT_ORDER_KEY = "agntia_chats_order_v1";
const CHATS_MIN = 52;
function readChatsHeight(): number {
  try {
    const stored = Number(localStorage.getItem(CHATS_HEIGHT_KEY));
    return Number.isFinite(stored) && stored >= CHATS_MIN ? stored : 232;
  } catch {
    return 232;
  }
}
function readPinnedThreads(): string[] {
  try {
    const raw = localStorage.getItem(PINNED_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === "string") : [];
  } catch {
    return [];
  }
}
function readChatOrder(): string[] {
  try {
    const raw = localStorage.getItem(CHAT_ORDER_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === "string") : [];
  } catch {
    return [];
  }
}

const PRIMARY: { id: AppView; label: string; icon: typeof MessageSquareText }[] = [
  // COMMAND_CENTER_VIEW_V1 - la entrada que abre la empresa al arrancar.
  { id: "today", label: "Centro de mando", icon: Gauge },
  { id: "command-studio", label: "Estudio · Demo", icon: PanelsTopLeft },
  { id: "chat", label: "Chat", icon: MessageSquareText },
  { id: "tasks", label: "Tareas", icon: LayoutDashboard },
  { id: "whatsapp", label: "WhatsApp", icon: WhatsAppIcon },
  { id: "documents", label: "Documentos", icon: Files },
  { id: "memory", label: "Conocimiento", icon: Brain },
  { id: "projects", label: "Proyectos", icon: FolderKanban },
  { id: "control-center", label: "Centro de control", icon: Activity },
  { id: "operations", label: "Operaciones", icon: ClipboardList },
  // TEAM_VIEW_V1 - personas y agentes IA en la misma pantalla.
  { id: "team", label: "Equipo", icon: Users },
  // WS_UI_SIDEBAR_ITEM_V1
  { id: "workspace", label: "Workspaces", icon: PanelsTopLeft },
  // COMMAND_CENTER_VIEW_V1 - la analitica del tenant, separada del centro de mando.
  { id: "centro-mando", label: "Analítica", icon: BarChart3 },
];

export default function SidebarV2({
  activeView,
  onSelectView,
  isAdmin,
  activeThreadId,
  threads,
  onSelectThread,
  onRenameThread,
  onPatchThread,
  onDeleteThread,
  userName,
  userRole,
  onOpenProfile,
  demo,
  tenant,
  collapsed,
  onToggleCollapsed,
  onOpenSettings,
  showApps,
  showFormation,
  hideLegacyViews,
  projectsLabel,
  reorderableNav,
  chatsPanel,
}: Props) {
  // DEMO_VIEWS_V1 - Apps solo aparece cuando el clon inyecta su workspace.
  const demoItems: { id: AppView; label: string; icon: typeof MessageSquareText }[] = [
    ...(showApps ? [{ id: "apps" as const, label: "Apps", icon: LayoutGrid }] : []),
    ...(showFormation ? [{ id: "formation" as const, label: "Formación", icon: GraduationCap }] : []),
  ];
  const primary = (
    hideLegacyViews ? PRIMARY.filter((item) => !LEGACY_VIEWS.includes(item.id)) : PRIMARY
  ).map((item) => (item.id === "projects" && projectsLabel ? { ...item, label: projectsLabel } : item));
  const navItems: { id: AppView; label: string; icon: typeof MessageSquareText }[] = [
    ...primary.slice(0, 2),
    ...demoItems,
    ...primary.slice(2),
  ];

  // SIDEBAR_ORDER_V1 - pulsación larga y arrastre para reordenar. El gesto no
  // añade ajustes ni botones: al coger un elemento aparece el hueco con la línea
  // y al soltarlo se queda ahí.
  const navSignature = navItems.map((item) => item.id).join("|");
  const [navOrder, setNavOrder] = useState<AppView[]>([]);
  const [navDrag, setNavDrag] = useState<NavDrag | null>(null);
  const [navDrop, setNavDrop] = useState(0);
  const [navAnnounce, setNavAnnounce] = useState("");
  const navRows = useRef(new Map<AppView, HTMLButtonElement>());
  const navHold = useRef<number | null>(null);
  const navPress = useRef<{ id: AppView; x: number; y: number; el: HTMLButtonElement } | null>(null);
  const navInsert = useRef(0);
  const navSuppress = useRef(0);
  const navBase = useRef<AppView[]>([]);

  useEffect(() => {
    if (!reorderableNav) return;
    const ids = navSignature.split("|").filter(Boolean) as AppView[];
    const stored = readNavOrder();
    setNavOrder([...stored.filter((id) => ids.includes(id)), ...ids.filter((id) => !stored.includes(id))]);
  }, [reorderableNav, navSignature]);

  const saveNavOrder = (ids: AppView[]) => {
    setNavOrder(ids);
    try {
      localStorage.setItem(NAV_ORDER_KEY, JSON.stringify(ids));
    } catch {
      // Sin almacenamiento, el orden dura la sesión.
    }
  };

  const navRank = (id: AppView) => {
    const at = navOrder.indexOf(id);
    return at < 0 ? Number.MAX_SAFE_INTEGER : at;
  };
  const orderedNav: NavEntry[] = reorderableNav && navOrder.length ? [...navItems].sort((a, b) => navRank(a.id) - navRank(b.id)) : navItems;

  const clearNavHold = () => {
    if (navHold.current) {
      window.clearTimeout(navHold.current);
      navHold.current = null;
    }
    navPress.current = null;
  };

  const beginNavDrag = (entry: NavEntry, el: HTMLButtonElement, clientY: number) => {
    const rect = el.getBoundingClientRect();
    navBase.current = orderedNav.map((item) => item.id);
    const index = navBase.current.indexOf(entry.id);
    navInsert.current = index < 0 ? 0 : index;
    navSuppress.current = Number.POSITIVE_INFINITY;
    setNavDrop(navInsert.current);
    setNavDrag({ id: entry.id, y: clientY, left: rect.left, width: rect.width, height: rect.height, grab: clientY - rect.top });
  };

  useEffect(() => {
    if (!navDrag) return;
    const moving = navDrag.id;
    const onMove = (event: PointerEvent) => {
      setNavDrag((value) => (value ? { ...value, y: event.clientY } : value));
      let index = 0;
      for (const id of navBase.current) {
        if (id === moving) continue;
        const el = navRows.current.get(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (event.clientY > rect.top + rect.height / 2) index += 1;
      }
      if (index !== navInsert.current) {
        navInsert.current = index;
        setNavDrop(index);
      }
    };
    const onUp = () => {
      const without = navBase.current.filter((id) => id !== moving);
      without.splice(Math.min(navInsert.current, without.length), 0, moving);
      saveNavOrder(without);
      const entry = navItems.find((item) => item.id === moving);
      setNavAnnounce(`${entry?.label ?? moving}, posición ${Math.min(navInsert.current + 1, without.length)} de ${without.length}`);
      navSuppress.current = performance.now() + 400;
      setNavDrag(null);
    };
    const onCancel = () => {
      navSuppress.current = performance.now() + 200;
      setNavDrag(null);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    const stopTouch = (event: TouchEvent) => event.preventDefault();
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);
    window.addEventListener("keydown", onKey);
    window.addEventListener("touchmove", stopTouch, { passive: false });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("touchmove", stopTouch);
    };
  }, [navDrag?.id, navSignature]);

  const onNavPointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!reorderableNav) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const id = event.currentTarget.dataset.navId as AppView | undefined;
    const entry = id ? navItems.find((item) => item.id === id) : undefined;
    if (!id || !entry) return;
    const el = event.currentTarget;
    navPress.current = { id, x: event.clientX, y: event.clientY, el };
    if (navHold.current) window.clearTimeout(navHold.current);
    navHold.current = window.setTimeout(() => {
      navHold.current = null;
      const held = navPress.current;
      if (held) beginNavDrag(entry, held.el, held.y);
    }, NAV_HOLD_MS);
  };

  const onNavPointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (navDrag) return;
    const held = navPress.current;
    if (!held) return;
    if (Math.abs(event.clientX - held.x) > NAV_MOVE_TOLERANCE || Math.abs(event.clientY - held.y) > NAV_MOVE_TOLERANCE) clearNavHold();
  };

  const onNavKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>, id: AppView) => {
    if (!reorderableNav || !event.altKey) return;
    const direction = event.key === "ArrowUp" ? -1 : event.key === "ArrowDown" ? 1 : 0;
    if (!direction) return;
    event.preventDefault();
    const ids = orderedNav.map((item) => item.id);
    const from = ids.indexOf(id);
    const to = from + direction;
    if (from < 0) return;
    if (to < 0 || to >= ids.length) {
      setNavAnnounce("Extremo del menú");
      return;
    }
    const next = [...ids];
    next.splice(from, 1);
    next.splice(to, 0, id);
    saveNavOrder(next);
    const entry = navItems.find((item) => item.id === id);
    setNavAnnounce(`${entry?.label ?? id}, posición ${to + 1} de ${next.length}`);
  };
  // CHATS_PANEL_V1 - el panel de Chats se arrastra desde su separador: crece
  // hasta quedarse con toda la barra y, si solo sube un poco, el menú sigue
  // desplazándose por separado. Los fijados van primero.
  const [chatsHeight, setChatsHeight] = useState<number>(() => readChatsHeight());
  const [pinned, setPinned] = useState<string[]>(() => readPinnedThreads());
  const [chatOrder, setChatOrder] = useState<string[]>(() => readChatOrder());
  const topRef = useRef<HTMLDivElement>(null);
  const recentRef = useRef<HTMLDivElement>(null);
  const chatsMax = useRef(0);

  useEffect(() => {
    if (!chatsPanel) return;
    try {
      localStorage.setItem(CHATS_HEIGHT_KEY, String(Math.round(chatsHeight)));
    } catch {
      // Sin almacenamiento, la altura dura la sesión.
    }
  }, [chatsPanel, chatsHeight]);

  useEffect(() => {
    if (!chatsPanel) return;
    try {
      localStorage.setItem(PINNED_KEY, JSON.stringify(pinned));
    } catch {
      // Sin almacenamiento, los fijados duran la sesión.
    }
  }, [chatsPanel, pinned]);

  const measureChatsMax = () => {
    const top = topRef.current;
    if (!top) return CHATS_MIN;
    let fixed = 0;
    for (const child of Array.from(top.children) as HTMLElement[]) {
      if (child === recentRef.current || child.classList.contains("v2-sidebar-nav")) continue;
      fixed += child.getBoundingClientRect().height;
    }
    return Math.max(CHATS_MIN + 60, Math.round(top.clientHeight - fixed));
  };

  const startChatsDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!chatsPanel) return;
    event.preventDefault();
    const startY = event.clientY;
    const startHeight = chatsHeight;
    chatsMax.current = measureChatsMax();
    const move = (pointer: PointerEvent) => {
      setChatsHeight(Math.min(chatsMax.current, Math.max(CHATS_MIN, startHeight + (startY - pointer.clientY))));
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const onChatsKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (!["ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const max = measureChatsMax();
    setChatsHeight((height) => {
      if (event.key === "Home") return CHATS_MIN;
      if (event.key === "End") return max;
      return Math.min(max, Math.max(CHATS_MIN, height + (event.key === "ArrowUp" ? 24 : -24)));
    });
  };

  const togglePin = (id: string) =>
    setPinned((previous) => (previous.includes(id) ? previous.filter((value) => value !== id) : [...previous, id]));

  const saveChatOrder = (ids: string[]) => {
    setChatOrder(ids);
    try {
      localStorage.setItem(CHAT_ORDER_KEY, JSON.stringify(ids));
    } catch {
      // Sin almacenamiento, el orden dura la sesión.
    }
  };

  // CHATS_ORDER_V1 - al arrastrar, los fijados conservan su bloque arriba pero
  // se recolocan entre ellos para que el gesto no se deshaga al soltar.
  const reorderChats = (ids: string[]) => {
    saveChatOrder(ids);
    setPinned((previous) => {
      const ordered = ids.filter((id) => previous.includes(id));
      return [...ordered, ...previous.filter((id) => !ordered.includes(id))];
    });
  };

  // CHATS_ORDER_V1 - triple clic: el chat sube arriba del todo de su bloque.
  const moveChatToTop = (id: string) => {
    const rest = sortedThreads.map((thread) => thread.id).filter((value) => value !== id);
    setPinned((previous) => (previous.includes(id) ? [id, ...previous.filter((value) => value !== id)] : previous));
    saveChatOrder([id, ...rest]);
  };

  const chatRank = (id: string) => {
    const at = chatOrder.indexOf(id);
    return at < 0 ? Number.MAX_SAFE_INTEGER : at;
  };
  const pinRank = (id: string) => {
    const at = pinned.indexOf(id);
    return at < 0 ? Number.MAX_SAFE_INTEGER : at;
  };
  const orderedThreads = chatsPanel && (pinned.length || chatOrder.length)
    ? [...threads].sort((a, b) => pinRank(a.id) - pinRank(b.id) || chatRank(a.id) - chatRank(b.id))
    : threads;
  const sortedThreads = orderedThreads;

  const initials = userName.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();
  // SIDEBAR_THREADS_V2 - todos los hilos, en una lista que ya hace scroll con
  // la columna. Antes solo se veían tres y los demás desaparecían sin aviso.
  const hasPendingTasks = false;
  // El tooltip del rail se pinta en coordenadas de ventana para que no lo
  // recorte el scroll interno de la barra.
  const [railTip, setRailTip] = useState<{ label: string; x: number; y: number } | null>(null);
  const showTip = (label: string) => (event: MouseEvent<HTMLElement>) => {
    if (!collapsed) return;
    const rect = event.currentTarget.getBoundingClientRect();
    setRailTip({ label, x: rect.right + 12, y: rect.top + rect.height / 2 });
  };
  const hideTip = () => setRailTip(null);

  return (
    <aside className="v2-sidebar" data-collapsed={collapsed} data-chats={chatsPanel ? "true" : undefined}>
      <div className="v2-sidebar-top" ref={topRef}>
        <div className="v2-sidebar-head">
          <button
            type="button"
            className="v2-sidebar-brand"
            onClick={() => onSelectView("today")}
            aria-label="Ir al inicio"
          >
            <BrandLockup compact={collapsed} />
          </button>
          {onToggleCollapsed && <button
            type="button"
            className="v2-rail-toggle"
            onClick={onToggleCollapsed}
            aria-label={collapsed ? "Desplegar menú" : "Plegar menú"}
            aria-expanded={!collapsed}
            title={collapsed ? "Desplegar menú" : "Plegar menú"}
          >
            {collapsed ? <ChevronsRight size={15} /> : <PanelLeftClose size={15} />}
          </button>}
        </div>

        {!collapsed && demo?.active && (
          <div className="v2-demo-notice" role="status">
            <span className="v2-demo-dot" aria-hidden="true" />
            <div style={{ minWidth: 0 }}>
              <div className="v2-demo-title">Tenant demo · Interfaz</div>
              <div className="v2-demo-sub">Datos sintéticos</div>
            </div>
            <button type="button" className="v2-demo-exit" onClick={demo.onExit}>
              Salir
            </button>
          </div>
        )}

        {!collapsed && !demo?.active && tenant?.id && (
          <div className="v2-demo-notice" role="status">
            <span className="v2-demo-dot" aria-hidden="true" />
            <div style={{ minWidth: 0 }}>
              <div className="v2-demo-title">Empresa · {tenant.id.toUpperCase()}</div>
              <div className="v2-demo-sub">Sesión verificada</div>
            </div>
          </div>
        )}

        <nav className="v2-sidebar-nav" aria-label="Principal" aria-describedby={reorderableNav ? "v2-nav-order-help" : undefined}>
          {orderedNav.map((item, index) => {
            const Icon = item.icon;
            const active = activeView === item.id;
            return (
              <Fragment key={item.id}>
                {navDrag && navDrop === index && (
                  <span className="v2-nav-slot" style={{ height: navDrag.height }} aria-hidden="true" />
                )}
                <button
                  type="button"
                  data-nav-id={item.id}
                  ref={(node) => {
                    if (node) navRows.current.set(item.id, node);
                    else navRows.current.delete(item.id);
                  }}
                  className={`v2-nav-item ${active ? "active" : ""}`}
                  onClick={() => {
                    if (performance.now() < navSuppress.current) return;
                    onSelectView(item.id);
                  }}
                  onPointerDown={onNavPointerDown}
                  onPointerMove={onNavPointerMove}
                  onPointerUp={clearNavHold}
                  onPointerCancel={clearNavHold}
                  onPointerLeave={() => {
                    if (!navDrag) clearNavHold();
                  }}
                  onKeyDown={(event) => onNavKeyDown(event, item.id)}
                  onMouseEnter={showTip(item.label)}
                  onMouseLeave={hideTip}
                  aria-label={collapsed ? item.label : undefined}
                >
                  <span className="v2-nav-main">
                    <Icon className="v2-nav-icon" />
                    {!collapsed && <span className="v2-nav-label">{item.label}</span>}
                  </span>
                  {!collapsed && item.id === "tasks" && hasPendingTasks && <span className="v2-nav-dot" />}
                </button>
              </Fragment>
            );
          })}
          {reorderableNav && navDrag && navDrop === orderedNav.length && (
            <span className="v2-nav-slot" style={{ height: navDrag.height }} aria-hidden="true" />
          )}
          {isAdmin && !hideLegacyViews && (
            <button
              type="button"
              className={`v2-nav-item ${activeView === "users" ? "active" : ""}`}
              onClick={() => onSelectView("users")}
              onMouseEnter={showTip("Usuarios")}
              onMouseLeave={hideTip}
              aria-label={collapsed ? "Usuarios" : undefined}
            >
              <span className="v2-nav-main">
                <UserCog className="v2-nav-icon" />
                {!collapsed && <span className="v2-nav-label">Usuarios</span>}
              </span>
            </button>
          )}
        </nav>

        {!collapsed && (
          <div
            className="v2-sidebar-recent-block"
            ref={recentRef}
            style={chatsPanel ? { height: chatsHeight } : undefined}
          >
            {chatsPanel && (
              <div
                className="v2-chats-handle"
                role="separator"
                aria-orientation="horizontal"
                aria-label="Altura de Chats"
                aria-valuemin={CHATS_MIN}
                aria-valuenow={Math.round(chatsHeight)}
                tabIndex={0}
                onPointerDown={startChatsDrag}
                onKeyDown={onChatsKeyDown}
              >
                <span aria-hidden="true" />
              </div>
            )}
            <div className="v2-sidebar-recent-title">
              <span className="v2-sidebar-label" style={{ padding: 0, margin: 0 }}>Chats</span>
              <Search size={14} style={{ color: "var(--v2-text-3)" }} />
            </div>
            <div className="v2-sidebar-recent-list">
              <SidebarThreads
                threads={sortedThreads}
                activeThreadId={activeThreadId}
                onSelect={onSelectThread}
                onRename={onRenameThread}
                onPatch={onPatchThread}
                {...(onDeleteThread ? { onDelete: onDeleteThread } : {})}
                {...(chatsPanel ? { pinned, onTogglePin: togglePin, reorderable: true, onReorder: reorderChats, onMoveToTop: moveChatToTop } : {})}
              />
            </div>
          </div>
        )}
      </div>

      <div className="v2-sidebar-footer">
        {collapsed ? (
          <div className="v2-rail-actions">
            <button
              type="button"
              className="v2-rail-action accent"
              onClick={onOpenSettings}
              onMouseEnter={showTip("Ajustes")}
              onMouseLeave={hideTip}
              aria-label="Ajustes"
            >
              <Settings size={17} />
            </button>
            <button type="button" className="v2-rail-avatar" onClick={onOpenProfile} title={userName} aria-label="Mi perfil">
              {initials || "?"}
            </button>
          </div>
        ) : (
          <div className="v2-footer-row">
            <button
              type="button"
              className="v2-user-chip"
              onClick={onOpenProfile}
              style={{ flex: 1, minWidth: 0, border: 0, background: "transparent", cursor: "pointer" }}
            >
              <div className="v2-user-chip-avatar">{initials || "?"}</div>
              <div style={{ textAlign: "left", minWidth: 0 }}>
                <div className="v2-user-chip-name">{userName}</div>
                <div className="v2-user-chip-role">
                  <span className="v2-status-dot" />
                  {userRole === "admin" ? "Admin" : "Usuario"}
                </div>
              </div>
            </button>
            <button
              type="button"
              className="v2-gear"
              onClick={onOpenSettings}
              aria-label="Ajustes y cuenta"
              title="Ajustes y cuenta"
            >
              <Settings size={16} />
            </button>
          </div>
        )}
      </div>

      {collapsed && railTip && (
        <span
          className="v2-rail-tip-fixed"
          role="tooltip"
          style={{ left: railTip.x, top: railTip.y }}
        >
          {railTip.label}
        </span>
      )}
      {navDrag && (() => {
        const entry = orderedNav.find((item) => item.id === navDrag.id);
        const Icon = entry?.icon ?? MessageSquareText;
        return (
          <span
            className="v2-nav-ghost"
            style={{ left: navDrag.left, top: navDrag.y - navDrag.grab, width: navDrag.width, height: navDrag.height }}
            aria-hidden="true"
          >
            <Icon className="v2-nav-icon" />
            {!collapsed && <span>{entry?.label}</span>}
          </span>
        );
      })()}

      {reorderableNav && (
        <>
          <span id="v2-nav-order-help" className="sr-only">
            Mantén pulsado un elemento del menú y arrástralo para reordenarlo. Con teclado, Alt y flechas arriba o abajo.
          </span>
          <span className="sr-only" role="status" aria-live="polite">
            {navAnnounce}
          </span>
        </>
      )}
    </aside>
  );
}
