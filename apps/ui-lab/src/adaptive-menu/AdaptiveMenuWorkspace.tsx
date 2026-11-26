// ADAPTIVE_MENU_V2 — prototipo aislado del menú lateral reordenable.
//
// Réplica del menú de producción (`SidebarV2`): mismas entradas y mismo riel de
// iconos al plegarlo. La única diferencia es el gesto: mantener pulsado un
// elemento, arrastrarlo y soltarlo donde aparece la línea. Sin botones extra,
// sin restablecer, sin orden automático y sin tocar la navegación real.
import { useEffect, useRef, useState, type ComponentType, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent } from "react";
import {
  Activity,
  BarChart3,
  Brain,
  ChevronsRight,
  ClipboardList,
  Files,
  FolderKanban,
  Gauge,
  LayoutDashboard,
  MessageSquareText,
  PanelLeftClose,
  PanelsTopLeft,
  Users,
} from "lucide-react";
import { BrandLockup } from "../../../web/src/components/BrandMark";
import { WhatsAppIcon } from "../../../web/src/components/WhatsAppIcon";
import "../design-system/agntia-tokens.css";
import "./adaptive-menu.css";

type Icon = ComponentType<{ size?: number; className?: string }>;
type MenuItem = { id: string; label: string; icon: Icon; blurb: string };

// Mismas entradas y orden que el menú de producción.
const MENU: MenuItem[] = [
  { id: "today", label: "Centro de mando", icon: Gauge as Icon, blurb: "El estado de la empresa al entrar: prioridades, agentes y actividad del día." },
  { id: "command-studio", label: "Estudio · Demo", icon: PanelsTopLeft as Icon, blurb: "Composición y previsualización de superficies sobre el tenant sintético." },
  { id: "chat", label: "Chat", icon: MessageSquareText as Icon, blurb: "Conversación con LAIA, con hilos, adjuntos y aprobaciones humanas." },
  { id: "tasks", label: "Tareas", icon: LayoutDashboard as Icon, blurb: "Trabajo en curso, responsables y automatizaciones asociadas." },
  { id: "whatsapp", label: "WhatsApp", icon: WhatsAppIcon as Icon, blurb: "Conversaciones de cliente con supervisión y borradores por aprobar." },
  { id: "documents", label: "Documentos", icon: Files as Icon, blurb: "Archivos compartidos, recientes y favoritos de la empresa." },
  { id: "memory", label: "Conocimiento", icon: Brain as Icon, blurb: "Biblioteca editorial, mapa de relaciones y cuadernos de investigación." },
  { id: "projects", label: "Proyectos", icon: FolderKanban as Icon, blurb: "Clientes, propuestas y entregas con su estado real." },
  { id: "control-center", label: "Centro de control", icon: Activity as Icon, blurb: "Actividad de agentes y ejecuciones recientes." },
  { id: "operations", label: "Operaciones", icon: ClipboardList as Icon, blurb: "Procedimientos y trabajo operativo en marcha." },
  { id: "team", label: "Equipo", icon: Users as Icon, blurb: "Personas y agentes IA, disponibilidad y carga de trabajo." },
  { id: "workspace", label: "Workspaces", icon: PanelsTopLeft as Icon, blurb: "Superficies de trabajo montadas para esta empresa." },
  { id: "analytics", label: "Analítica", icon: BarChart3 as Icon, blurb: "Indicadores de negocio por área, con definición y periodo." },
];

const DEFAULT_ORDER = MENU.map((item) => item.id);
const STORAGE_KEY = "agntia_menu_order_v1";
const HOLD_MS = 260;
const MOVE_TOLERANCE = 6;

const byId = new Map(MENU.map((item) => [item.id, item]));

function sanitize(value: unknown): string[] {
  if (!Array.isArray(value)) return DEFAULT_ORDER;
  const ids: string[] = [];
  for (const entry of value) {
    if (typeof entry === "string" && byId.has(entry) && !ids.includes(entry)) ids.push(entry);
  }
  return [...ids, ...DEFAULT_ORDER.filter((id) => !ids.includes(id))];
}

function readOrder(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? sanitize(JSON.parse(raw) as unknown) : DEFAULT_ORDER;
  } catch {
    return DEFAULT_ORDER;
  }
}

type Drag = { id: string; y: number; left: number; width: number; height: number; grab: number };

export default function AdaptiveMenuWorkspace() {
  const [order, setOrder] = useState(DEFAULT_ORDER);
  const [active, setActive] = useState("today");
  const [collapsed, setCollapsed] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [insertAt, setInsertAt] = useState(0);
  const [announce, setAnnounce] = useState("");

  const rows = useRef(new Map<string, HTMLButtonElement>());
  const holdTimer = useRef<number | null>(null);
  const press = useRef<{ id: string; x: number; y: number; el: HTMLButtonElement } | null>(null);
  const suppressUntil = useRef(0);
  const insertRef = useRef(0);
  const dragRef = useRef<Drag | null>(null);

  useEffect(() => {
    setOrder(readOrder());
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(order));
    } catch {
      // Sin almacenamiento, el orden vive solo en esta sesión.
    }
  }, [order]);

  useEffect(
    () => () => {
      if (holdTimer.current) window.clearTimeout(holdTimer.current);
    },
    [],
  );

  const clearHold = () => {
    if (holdTimer.current) {
      window.clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
    press.current = null;
  };

  const beginDrag = (id: string, el: HTMLButtonElement, clientY: number) => {
    const index = order.indexOf(id);
    if (index < 0) return;
    const rect = el.getBoundingClientRect();
    const next: Drag = {
      id,
      y: clientY,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      grab: clientY - rect.top,
    };
    dragRef.current = next;
    insertRef.current = index;
    suppressUntil.current = Number.POSITIVE_INFINITY;
    setInsertAt(index);
    setDrag(next);
    setAnnounce("");
  };

  // El arrastre escucha en window: el elemento recogido sale del flujo y deja
  // de recibir el puntero. También frena el scroll táctil mientras dura.
  useEffect(() => {
    if (!drag) return;
    const current = dragRef.current;
    if (!current) return;

    const onMove = (event: PointerEvent) => {
      setDrag((value) => (value ? { ...value, y: event.clientY } : value));
      let index = 0;
      for (const id of order) {
        if (id === current.id) continue;
        const el = rows.current.get(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (event.clientY > rect.top + rect.height / 2) index += 1;
      }
      if (index !== insertRef.current) {
        insertRef.current = index;
        setInsertAt(index);
      }
    };

    const onUp = () => {
      const to = insertRef.current;
      setOrder((prev) => {
        const from = prev.indexOf(current.id);
        if (from < 0) return prev;
        const next = [...prev];
        next.splice(from, 1);
        next.splice(Math.min(to, next.length), 0, current.id);
        return next;
      });
      const label = byId.get(current.id)?.label ?? current.id;
      setAnnounce(`${label}, posición ${Math.min(to + 1, order.length)} de ${order.length}`);
      suppressUntil.current = performance.now() + 400;
      dragRef.current = null;
      setDrag(null);
    };

    const onCancel = () => {
      dragRef.current = null;
      setDrag(null);
      suppressUntil.current = performance.now() + 200;
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
  }, [drag?.id, order]);

  const onPointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const id = event.currentTarget.dataset.id;
    if (!id) return;
    const el = event.currentTarget;
    press.current = { id, x: event.clientX, y: event.clientY, el };
    if (holdTimer.current) window.clearTimeout(holdTimer.current);
    holdTimer.current = window.setTimeout(() => {
      holdTimer.current = null;
      const held = press.current;
      if (held) beginDrag(held.id, held.el, held.y);
    }, HOLD_MS);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (dragRef.current) return;
    const held = press.current;
    if (!held) return;
    if (Math.abs(event.clientX - held.x) > MOVE_TOLERANCE || Math.abs(event.clientY - held.y) > MOVE_TOLERANCE) clearHold();
  };

  const onItemKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>, id: string) => {
    if (!event.altKey) return;
    const index = order.indexOf(id);
    const next = event.key === "ArrowUp" ? index - 1 : event.key === "ArrowDown" ? index + 1 : null;
    if (next === null) return;
    event.preventDefault();
    if (next < 0 || next >= order.length) {
      setAnnounce("Ya está en el extremo del menú");
      return;
    }
    setOrder((prev) => {
      const array = [...prev];
      const [moved] = array.splice(index, 1);
      if (moved) array.splice(next, 0, moved);
      return array;
    });
    setAnnounce(`${byId.get(id)?.label ?? id}, posición ${next + 1} de ${order.length}`);
  };

  const select = (id: string) => {
    if (performance.now() < suppressUntil.current) return;
    setActive(id);
    setDrawer(false);
  };

  const current = byId.get(active) ?? MENU[0]!;
  const visible = drag ? order.filter((id) => id !== drag.id) : order;

  const row = (id: string) => {
    const item = byId.get(id);
    if (!item) return null;
    const Icon = item.icon;
    const isActive = id === active;
    return (
      <button
        key={id}
        type="button"
        data-id={id}
        ref={(node) => {
          if (node) rows.current.set(id, node);
          else rows.current.delete(id);
        }}
        className={`am-item${isActive ? " is-active" : ""}`}
        aria-current={isActive ? "page" : undefined}
        title={collapsed ? item.label : undefined}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={clearHold}
        onPointerCancel={clearHold}
        onPointerLeave={() => {
          if (!dragRef.current) clearHold();
        }}
        onKeyDown={(event) => onItemKeyDown(event, id)}
        onClick={() => select(id)}
      >
        <Icon size={18} className="am-ico" />
        <span className="am-label">{item.label}</span>
      </button>
    );
  };

  return (
    <div className="am-root agntia-workspace" data-collapsed={collapsed} data-dragging={Boolean(drag)}>
      {drawer && <button type="button" className="am-scrim" aria-label="Cerrar menú" onClick={() => setDrawer(false)} />}

      <aside className="am-sidebar" data-open={drawer} aria-label="Menú lateral de demostración">
        <div className="am-brand-row">
          <span className="am-brand">
            <BrandLockup compact={collapsed} markSize={collapsed ? 26 : 30} />
          </span>
          <button
            type="button"
            className="am-rail-toggle"
            onClick={() => setCollapsed((value) => !value)}
            aria-label={collapsed ? "Desplegar menú" : "Plegar menú"}
            aria-expanded={!collapsed}
            title={collapsed ? "Desplegar menú" : "Plegar menú"}
          >
            {collapsed ? <ChevronsRight size={15} /> : <PanelLeftClose size={15} />}
          </button>
        </div>

        <nav className="am-nav" aria-label="Principal" aria-describedby="am-help">
          <ul className="am-list">
            {visible.map((id, index) => (
              <li key={id} className="am-row">
                {drag && insertAt === index && <span className="am-slot" style={{ height: drag.height }} aria-hidden="true" />}
                {row(id)}
              </li>
            ))}
            {drag && insertAt === visible.length && (
              <li className="am-row" aria-hidden="true">
                <span className="am-slot" style={{ height: drag.height }} />
              </li>
            )}
          </ul>
        </nav>
      </aside>

      <main className="am-main">
        <header className="am-top">
          <button type="button" className="am-burger" onClick={() => setDrawer(true)} aria-label="Abrir menú" aria-expanded={drawer}>
            <PanelsTopLeft size={18} />
          </button>
          <span className="am-kicker">UI LAB · MENÚ</span>
        </header>

        <div className="am-content">
          <section className="am-paper">
            <small>{current.label}</small>
            <h1>{current.label}</h1>
            <p>{current.blurb}</p>
            <div className="am-lines" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
          </section>
        </div>
      </main>

      {drag && (
        <div className="am-item is-drag" style={{ left: drag.left, top: drag.y - drag.grab, width: drag.width, height: drag.height }} aria-hidden="true">
          {(() => {
            const item = byId.get(drag.id);
            if (!item) return null;
            const Icon = item.icon;
            return (
              <>
                <Icon size={18} className="am-ico" />
                <span className="am-label">{item.label}</span>
              </>
            );
          })()}
        </div>
      )}

      <p className="am-sr" role="status" aria-live="polite">
        {announce}
      </p>
      <p className="am-sr" id="am-help">
        Mantén pulsado un elemento y arrástralo para reordenar. Con teclado, Alt y las flechas arriba o abajo.
      </p>
    </div>
  );
}
