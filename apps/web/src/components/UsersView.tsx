import { useEffect, useState } from "react";
import { Check, Plus, Trash2, UserCog, UserX, X } from "lucide-react";
import { deleteUser, listUsers, userTasks, type AuthUser, type UserTaskSummary } from "../api/auth";
import UserModal from "./UserModal";

interface Props {
  currentUserId: string;
}

function relativeTime(iso?: string): string {
  if (!iso) return "—";
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 60000) return "ahora";
  if (ms < 3600000) return `${Math.floor(ms / 60000)}m`;
  if (ms < 86400000) return `${Math.floor(ms / 3600000)}h`;
  return `${Math.floor(ms / 86400000)}d`;
}

export default function UsersView({ currentUserId }: Props) {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AuthUser | null>(null);
  const [detail, setDetail] = useState<{ user: AuthUser; tasks: UserTaskSummary[]; total: number } | null>(null);

  const load = async () => {
    try {
      const list = await listUsers();
      setUsers(list);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error cargando usuarios");
    }
  };

  useEffect(() => { void load(); }, []);

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (u: AuthUser) => { setEditing(u); setModalOpen(true); };

  const remove = async (u: AuthUser) => {
    if (!confirm(`¿Borrar a ${u.name} (${u.email})? Esta accion no se puede deshacer.`)) return;
    try {
      await deleteUser(u.id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al borrar");
    }
  };

  const openDetail = async (u: AuthUser) => {
    try {
      const res = await userTasks(u.id, 20);
      setDetail({ user: u, tasks: res.tasks, total: res.total });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error cargando tareas");
    }
  };

  return (
    <main className="view-shell">
      <div className="view-header">
        <div>
          <h2>Usuarios</h2>
          <span className="view-header-meta">{users.length} cuentas</span>
        </div>
        <button className="primary-btn" onClick={openCreate}>
          <Plus size={14} style={{ verticalAlign: "middle", marginRight: 6 }} />
          Nuevo usuario
        </button>
      </div>

      {error && <div className="chat-error" style={{ margin: 16 }}>{error}</div>}

      <div className="users-grid">
        {users.map((u) => {
          const isMe = u.id === currentUserId;
          return (
            <div key={u.id} className={`user-card ${!u.active ? "inactive" : ""}`}>
              <div className="user-card-top">
                <div className="user-card-avatar">{u.name.slice(0, 1).toUpperCase()}</div>
                <div className="user-card-info">
                  <div className="user-card-name">
                    {u.name} {isMe && <span className="user-card-you">tu</span>}
                  </div>
                  <div className="user-card-email">{u.email}</div>
                </div>
                <span className={`user-card-role ${u.role}`}>{u.role}</span>
              </div>

              <div className="user-card-meta">
                <span className={`user-card-status ${u.active ? "on" : "off"}`}>
                  {u.active ? <Check size={11} /> : <X size={11} />}
                  {u.active ? "Activo" : "Inactivo"}
                </span>
                {u.createdAt && <span className="user-card-time">desde {relativeTime(u.createdAt)}</span>}
              </div>

              {(u.setup.sopIds.length > 0 || u.setup.greeting) && (
                <div className="user-card-setup">
                  {u.setup.sopIds.length > 0 && (
                    <span className="user-card-setup-line">
                      <b>{u.setup.sopIds.length}</b> SOP{u.setup.sopIds.length !== 1 ? "s" : ""} asignado{u.setup.sopIds.length !== 1 ? "s" : ""}
                    </span>
                  )}
                  {u.setup.greeting && <span className="user-card-setup-line">greeting personalizado</span>}
                </div>
              )}

              <div className="user-card-actions">
                <button className="user-card-btn" onClick={() => openDetail(u)} title="Ver tareas">
                  <UserCog size={13} /> Tareas
                </button>
                <button className="user-card-btn" onClick={() => openEdit(u)} title="Editar">
                  Editar
                </button>
                {!isMe && (
                  <button className="user-card-btn danger" onClick={() => remove(u)} title="Borrar">
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {users.length === 0 && !error && (
          <div className="view-empty">
            <UserX size={22} />
            <p>No hay usuarios todavia.</p>
            <small>Crea el primero con el boton de arriba.</small>
          </div>
        )}
      </div>

      {modalOpen && (
        <UserModal
          editing={editing}
          onClose={() => setModalOpen(false)}
          onSaved={async () => { setModalOpen(false); await load(); }}
        />
      )}

      {detail && (
        <div className="modal-overlay" onClick={() => setDetail(null)}>
          <div className="modal small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <div className="modal-title">Tareas de {detail.user.name}</div>
                <div className="modal-sub">{detail.total} en total · {detail.tasks.length} mas recientes</div>
              </div>
              <button className="ghost-icon-button" onClick={() => setDetail(null)}><X size={17} /></button>
            </div>
            <div className="modal-body">
              {detail.tasks.length === 0 ? (
                <div className="muted">Sin tareas todavia.</div>
              ) : (
                <div className="plan-list">
                  {detail.tasks.map((t) => (
                    <div key={t.id} className="plan-item">
                      <span className="plan-num">{t.kind.slice(0, 2).toUpperCase()}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</div>
                        <div style={{ fontSize: 10, color: "var(--text-3)", marginTop: 2 }}>{t.status} · {relativeTime(t.updatedAt)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
