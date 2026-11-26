// SIDEBAR_THREADS_V2 - lista compacta de conversaciones con menu por hilo.
// Cada fila mide una linea + meta, para que la columna no parezca una pila de
// tarjetas. El menu (tres puntos) permite renombrar, mover a proyecto y enviar
// la conversacion a una persona del equipo o a un agente del tenant.
import { Fragment, useEffect, useRef, useState, type MouseEvent, type PointerEvent as ReactPointerEvent } from "react";
import { FolderKanban, MoreHorizontal, Pin, Send, Trash2, UserRound } from "lucide-react";
import type { Thread } from "../api/threads";
import { listProjects, type Project } from "../api/projects";
import { getCompanyOverview, type CompanyAgent, type CompanyMember } from "../api/company";

export interface ThreadPatch {
  projectId?: string | null;
  assignedTo?: string | null;
  assignedKind?: "human" | "agent" | null;
}

interface Props {
  threads: Thread[];
  activeThreadId: string | null;
  onSelect: (id: string) => void;
  onRename: (id: string, title: string) => Promise<unknown> | void;
  onPatch: (id: string, patch: ThreadPatch) => Promise<unknown> | void;
  onDelete?: (id: string) => Promise<unknown> | void;
  /** CHATS_PANEL_V1 - fijar conversaciones solo en el clon de demostración. */
  pinned?: string[];
  onTogglePin?: (id: string) => void;
  /** CHATS_ORDER_V1 - pulsación larga para reordenar y triple clic para subir
   *  un chat arriba, también solo en el clon. */
  reorderable?: boolean;
  onReorder?: (ids: string[]) => void;
  onMoveToTop?: (id: string) => void;
  /** SPLIT_PANE_V1 - sacar la fila de la barra abre el chat en el otro panel. */
  onSplitDrop?: (id: string) => void;
  onSplitHover?: (over: boolean) => void;
}

// CHATS_ORDER_V1 - misma mecánica que el menú: pulsación larga, hueco con
// línea y pieza que sigue al puntero; un triple clic sube la fila arriba.
interface ConvDrag {
  id: string;
  title: string;
  y: number;
  left: number;
  width: number;
  height: number;
  grab: number;
}
const HOLD_MS = 260;
const MOVE_TOLERANCE = 6;
const TRIPLE_MS = 700;

interface MenuAnchor {
  id: string;
  top: number;
  left: number;
}

const MENU_W = 244;

function shortTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(ms) || ms < 0) return "";
  if (ms < 60000) return "ahora";
  if (ms < 3600000) return `${Math.floor(ms / 60000)}m`;
  if (ms < 86400000) return `${Math.floor(ms / 3600000)}h`;
  return `${Math.floor(ms / 86400000)}d`;
}

export default function SidebarThreads({
  threads,
  activeThreadId,
  onSelect,
  onRename,
  onPatch,
  onDelete,
  pinned,
  onTogglePin,
  reorderable,
  onReorder,
  onMoveToTop,
  onSplitDrop,
  onSplitHover,
}: Props) {
  const isPinned = (id: string) => Boolean(pinned?.includes(id));
  const [anchor, setAnchor] = useState<MenuAnchor | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoaded, setProjectsLoaded] = useState(false);
  const [humans, setHumans] = useState<CompanyMember[]>([]);
  const [agents, setAgents] = useState<CompanyAgent[]>([]);
  const [loadedPeople, setLoadedPeople] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!renamingId) return;
    inputRef.current?.focus();
    inputRef.current?.select();
  }, [renamingId]);

  // CHATS_ORDER_V1 - reordenar con pulsación larga y subir con triple clic.
  const [drag, setDrag] = useState<ConvDrag | null>(null);
  const [drop, setDrop] = useState(0);
  const rows = useRef(new Map<string, HTMLDivElement>());
  const hold = useRef<number | null>(null);
  const press = useRef<{ id: string; x: number; y: number; el: HTMLElement } | null>(null);
  const insert = useRef(0);
  const suppress = useRef(0);
  const base = useRef<string[]>([]);
  const clicks = useRef<{ id: string; count: number; at: number }>({ id: "", count: 0, at: 0 });
  const reorderRef = useRef(onReorder);
  const splitRef = useRef(onSplitDrop);
  const splitHoverRef = useRef(onSplitHover);
  const outside = useRef(false);
  const asideBox = useRef<DOMRect | null>(null);

  useEffect(() => {
    reorderRef.current = onReorder;
    splitRef.current = onSplitDrop;
    splitHoverRef.current = onSplitHover;
  }, [onReorder, onSplitDrop, onSplitHover]);

  const clearHold = () => {
    if (hold.current) window.clearTimeout(hold.current);
    hold.current = null;
    press.current = null;
  };

  const beginDrag = (thread: Thread, el: HTMLElement, clientY: number) => {
    const rect = el.getBoundingClientRect();
    asideBox.current = document.querySelector(".v2-sidebar")?.getBoundingClientRect() ?? null;
    outside.current = false;
    base.current = threads.map((item) => item.id);
    insert.current = Math.max(0, base.current.indexOf(thread.id));
    suppress.current = Number.POSITIVE_INFINITY;
    setDrop(insert.current);
    setDrag({ id: thread.id, title: thread.title, y: clientY, left: rect.left, width: rect.width, height: rect.height, grab: clientY - rect.top });
  };

  useEffect(() => {
    if (!drag) return;
    const moving = drag.id;
    const onMove = (event: PointerEvent) => {
      setDrag((value) => (value ? { ...value, y: event.clientY } : value));
      const leave = Boolean(splitRef.current && asideBox.current && event.clientX > asideBox.current.right + 8);
      if (leave !== outside.current) {
        outside.current = leave;
        splitHoverRef.current?.(leave);
      }
      if (leave) return;
      let index = 0;
      for (const id of base.current) {
        if (id === moving) continue;
        const el = rows.current.get(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (event.clientY > rect.top + rect.height / 2) index += 1;
      }
      if (index !== insert.current) {
        insert.current = index;
        setDrop(index);
      }
    };
    const onUp = () => {
      if (outside.current) {
        // SPLIT_PANE_V1 - soltar fuera de la barra abre ese chat al lado.
        outside.current = false;
        splitHoverRef.current?.(false);
        splitRef.current?.(moving);
        suppress.current = performance.now() + 400;
        setDrag(null);
        return;
      }
      const next = base.current.filter((id) => id !== moving);
      next.splice(Math.min(insert.current, next.length), 0, moving);
      reorderRef.current?.(next);
      suppress.current = performance.now() + 400;
      setDrag(null);
    };
    const onCancel = () => {
      suppress.current = performance.now() + 200;
      outside.current = false;
      splitHoverRef.current?.(false);
      setDrag(null);
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
  }, [drag?.id]);

  const onRowPointerDown = (thread: Thread) => (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!reorderable) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (renamingId) return;
    const el = event.currentTarget;
    clearHold();
    press.current = { id: thread.id, x: event.clientX, y: event.clientY, el };
    hold.current = window.setTimeout(() => {
      hold.current = null;
      if (press.current) beginDrag(thread, el, press.current.y);
    }, HOLD_MS);
  };

  const onRowPointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (drag) return;
    const held = press.current;
    if (!held) return;
    const moved =
      Math.abs(event.clientX - held.x) > MOVE_TOLERANCE || Math.abs(event.clientY - held.y) > MOVE_TOLERANCE;
    if (!moved) return;
    // Con ratón el arrastre arranca al moverse; en táctil, con la pulsación
    // larga, para que el dedo siga desplazando la lista.
    if (event.pointerType !== "touch") {
      const thread = threads.find((item) => item.id === held.id);
      const el = held.el;
      clearHold();
      if (thread) beginDrag(thread, el, event.clientY);
      return;
    }
    clearHold();
  };

  const onRowClick = (thread: Thread) => () => {
    if (performance.now() < suppress.current) return;
    if (reorderable && onMoveToTop) {
      const now = performance.now();
      const state = clicks.current;
      const count = state.id === thread.id && now - state.at < TRIPLE_MS ? state.count + 1 : 1;
      clicks.current = { id: thread.id, count, at: now };
      if (count >= 3) {
        clicks.current = { id: thread.id, count: 0, at: 0 };
        onMoveToTop(thread.id);
        return;
      }
    }
    onSelect(thread.id);
  };

  const openMenu = (id: string, event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    const left = Math.max(8, Math.min(rect.right - MENU_W, window.innerWidth - MENU_W - 8));
    const top = Math.min(rect.bottom + 4, Math.max(8, window.innerHeight - 372));
    setAnchor({ id, top, left });
    // PROJECTS_FOR_THREAD_V1 - se cargan al abrir el menu, no al montar la barra.
    if (!projectsLoaded) {
      void listProjects()
        .then((list) => setProjects(list))
        .catch(() => setProjects([]))
        .finally(() => setProjectsLoaded(true));
    }
    if (!loadedPeople) {
      void getCompanyOverview()
        .then((o) => {
          setHumans(o.members.filter((m) => m.active));
          setAgents(o.agents.filter((a) => a.active));
          setLoadedPeople(true);
        })
        .catch(() => setLoadedPeople(true));
    }
  };

  const closeMenu = () => setAnchor(null);

  const startRename = (thread: Thread) => {
    closeMenu();
    setDraft(thread.title);
    setRenamingId(thread.id);
  };

  const commitRename = async (id: string) => {
    const title = draft.trim();
    setRenamingId(null);
    if (!title) return;
    const current = threads.find((t) => t.id === id);
    if (current && current.title === title) return;
    await onRename(id, title);
  };

  const apply = async (id: string, patch: ThreadPatch) => {
    closeMenu();
    await onPatch(id, patch);
  };

  const menuThread = anchor ? threads.find((t) => t.id === anchor.id) : undefined;
  const projectName = (id?: string | null) => projects.find((p) => p.id === id)?.name ?? "";
  const assignedName = (thread: Thread) => {
    if (!thread.assignedTo) return "";
    const list = thread.assignedKind === "agent" ? agents : humans;
    return list.find((item) => ("id" in item ? item.id : item.userId) === thread.assignedTo)?.name ?? "";
  };

  if (threads.length === 0) {
    return <div className="conv-empty">Sin conversaciones</div>;
  }

  return (
    <div className="conv-list" data-reorder={reorderable ? "true" : undefined}>
      {threads.map((thread, index) => {
        const active = thread.id === activeThreadId;
        const meta = [assignedName(thread), projectName(thread.projectId)].filter(Boolean).join(" · ");
        return (
          <Fragment key={thread.id}>
          {drag && drop === index && (
            <span className="conv-slot" style={{ height: drag.height }} aria-hidden="true" />
          )}
          <div
            className="conv-row"
            data-active={active || undefined}
            ref={(node) => {
              if (node) rows.current.set(thread.id, node);
              else rows.current.delete(thread.id);
            }}
          >
            {renamingId === thread.id ? (
              <input
                ref={inputRef}
                className="conv-rename"
                value={draft}
                maxLength={200}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={() => void commitRename(thread.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void commitRename(thread.id);
                  if (e.key === "Escape") setRenamingId(null);
                }}
                aria-label="Renombrar conversación"
              />
            ) : (
              <button
                type="button"
                className="conv-main"
                onClick={onRowClick(thread)}
                onPointerDown={onRowPointerDown(thread)}
                onPointerMove={onRowPointerMove}
                onPointerUp={clearHold}
                onPointerCancel={clearHold}
                onPointerLeave={() => {
                  if (!drag) clearHold();
                }}
                title={thread.title}
              >
                <span className="conv-title">
                  {isPinned(thread.id) && (
                    <span className="conv-pin" title="Fijado">
                      <Pin size={11} aria-hidden="true" />
                    </span>
                  )}
                  {thread.title}
                </span>
                <span className="conv-meta">{meta || shortTime(thread.updatedAt)}</span>
              </button>
            )}
            <button
              type="button"
              className="conv-kebab"
              onClick={(e) => openMenu(thread.id, e)}
              aria-haspopup="menu"
              aria-expanded={anchor?.id === thread.id}
              aria-label={`Acciones de ${thread.title}`}
              title="Acciones"
            >
              <MoreHorizontal size={15} />
            </button>
          </div>
          </Fragment>
        );
      })}

      {drag && drop === threads.length && (
        <span className="conv-slot" style={{ height: drag.height }} aria-hidden="true" />
      )}

      {drag && (
        <span
          className="conv-ghost"
          style={{ left: drag.left, top: drag.y - drag.grab, width: drag.width, height: drag.height }}
          aria-hidden="true"
        >
          {drag.title}
        </span>
      )}

      {anchor && menuThread && (
        <>
          <button type="button" className="conv-menu-backdrop" aria-label="Cerrar menú" onClick={closeMenu} />
          <div className="conv-menu" role="menu" style={{ top: anchor.top, left: anchor.left }}>
            <button type="button" className="conv-menu-item" role="menuitem" onClick={() => startRename(menuThread)}>
              Renombrar
            </button>
            {onTogglePin && (
              <button
                type="button"
                className="conv-menu-item"
                role="menuitem"
                onClick={() => {
                  closeMenu();
                  onTogglePin(menuThread.id);
                }}
              >
                <Pin size={12} aria-hidden="true" /> {isPinned(menuThread.id) ? "Desfijar de Chats" : "Fijar en Chats"}
              </button>
            )}

            <div className="conv-menu-label">
              <FolderKanban size={12} aria-hidden="true" /> Proyecto
            </div>
            <div className="conv-menu-scroll">
              {projects.length === 0 && <div className="conv-menu-hint">Sin proyectos todavía</div>}
              {projects.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  className="conv-menu-item"
                  role="menuitem"
                  data-selected={menuThread.projectId === project.id || undefined}
                  onClick={() => void apply(menuThread.id, { projectId: project.id })}
                >
                  {project.name}
                </button>
              ))}
              {menuThread.projectId && (
                <button
                  type="button"
                  className="conv-menu-item muted"
                  role="menuitem"
                  onClick={() => void apply(menuThread.id, { projectId: null })}
                >
                  Quitar del proyecto
                </button>
              )}
            </div>

            <div className="conv-menu-label">
              <UserRound size={12} aria-hidden="true" /> Enviar a una persona
            </div>
            <div className="conv-menu-scroll">
              {humans.length === 0 && <div className="conv-menu-hint">Sin personas en el equipo</div>}
              {humans.map((member) => (
                <button
                  key={member.userId}
                  type="button"
                  className="conv-menu-item"
                  role="menuitem"
                  data-selected={
                    (menuThread.assignedKind !== "agent" && menuThread.assignedTo === member.userId) || undefined
                  }
                  onClick={() =>
                    void apply(menuThread.id, { assignedTo: member.userId, assignedKind: "human" })
                  }
                >
                  {member.name || member.email}
                </button>
              ))}
            </div>

            <div className="conv-menu-label">
              <Send size={12} aria-hidden="true" /> Enviar a un agente
            </div>
            <div className="conv-menu-scroll">
              {agents.length === 0 && <div className="conv-menu-hint">Sin agentes activos</div>}
              {agents.map((agent) => (
                <button
                  key={agent.id}
                  type="button"
                  className="conv-menu-item"
                  role="menuitem"
                  data-selected={
                    (menuThread.assignedKind === "agent" && menuThread.assignedTo === agent.id) || undefined
                  }
                  onClick={() => void apply(menuThread.id, { assignedTo: agent.id, assignedKind: "agent" })}
                >
                  {agent.name}
                </button>
              ))}
            </div>

            {menuThread.assignedTo && (
              <button
                type="button"
                className="conv-menu-item muted"
                role="menuitem"
                onClick={() => void apply(menuThread.id, { assignedTo: null, assignedKind: null })}
              >
                Quitar responsable
              </button>
            )}

            {onDelete && (
              <button
                type="button"
                className="conv-menu-item danger"
                role="menuitem"
                onClick={() => {
                  const id = menuThread.id;
                  closeMenu();
                  void onDelete(id);
                }}
              >
                <Trash2 size={12} aria-hidden="true" /> Borrar conversación
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
