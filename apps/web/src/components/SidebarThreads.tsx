// SIDEBAR_THREADS_V2 - lista compacta de conversaciones con menu por hilo.
// Cada fila mide una linea + meta, para que la columna no parezca una pila de
// tarjetas. El menu (tres puntos) permite renombrar, mover a proyecto y enviar
// la conversacion a una persona del equipo o a un agente del tenant.
import { useEffect, useRef, useState, type MouseEvent } from "react";
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
}

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
    <div className="conv-list">
      {threads.map((thread) => {
        const active = thread.id === activeThreadId;
        const meta = [assignedName(thread), projectName(thread.projectId)].filter(Boolean).join(" · ");
        return (
          <div key={thread.id} className="conv-row" data-active={active || undefined}>
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
                onClick={() => onSelect(thread.id)}
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
        );
      })}

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
