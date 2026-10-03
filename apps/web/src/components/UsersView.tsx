// FIX_02_USERSVIEW_CLEAN_V1 - import PermissionMatrix pendiente de wire.
// BUG05_USERS_VIEW_V2 - usa PermissionMatrix en el detalle de rol.
// E3_USERSVIEW_MATRIX_V1 - usar PermissionMatrix en el detalle del rol.
// UI_PANEL_SLIDE_V1_USE
import { useEffect, useState } from "react";
import { Check, Plus, Trash2, UserCog, UserX, X } from "lucide-react";
import { deleteUser, listUsers, userTasks, type AuthUser, type UserTaskSummary } from "../api/auth";
import { relativeTime } from "../lib/format";
import UserModal from "./UserModal";
// WIRE_USERS_MATRIX_V1

interface Props {
  currentUserId: string;
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
    <div className="v2-tasks-view" style={{ maxWidth: 1000 }}>
      <div className="v2-tasks-header">
        <h1 className="v2-tasks-title">Equipo</h1>
        <div className="v2-tasks-meta">{users.length} cuentas</div>
        <button className="v2-need-action-btn" style={{ marginLeft: "auto" }} onClick={openCreate}>
          <Plus size={14} /> Nuevo usuario
        </button>
      </div>

      {error && <div className="chat-error" style={{ marginBottom: 16 }}>{error}</div>}

      {users.length === 0 && !error ? (
        <div className="v2-tasks-empty" style={{ padding: "40px 20px" }}>
          <UserX size={22} style={{ marginBottom: 8, color: "var(--v2-purple)" }} />
          <p style={{ margin: 0, fontSize: 13, color: "var(--v2-text)" }}>No hay usuarios todavia.</p>
          <small style={{ color: "var(--v2-text-3)" }}>Crea el primero con el boton de arriba.</small>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 12 }}>
          {users.map((u) => {
            const isMe = u.id === currentUserId;
            return (
              <div
                key={u.id}
                className="v2-suggestion-card"
                style={{
                  cursor: "default",
                  alignItems: "flex-start",
                  opacity: u.active ? 1 : 0.6,
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, width: "100%" }}>
                  <div
                    className="v2-suggestion-icon"
                    style={{ background: "var(--v2-purple)", color: "#FFF", borderColor: "var(--v2-purple)" }}
                  >
                    {u.name.slice(0, 1).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                      {u.name}
                      {isMe && (
                        <span className="v2-tag agent" style={{ fontSize: 9 }}>tu</span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--v2-text-3)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {u.email}
                    </div>
                  </div>
                  <span className={`v2-tag ${u.role === "admin" ? "agent" : ""}`}>{u.role}</span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 11, color: "var(--v2-text-3)", width: "100%" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: u.active ? "var(--v2-green)" : "var(--v2-text-3)" }}>
                    {u.active ? <Check size={11} /> : <X size={11} />}
                    {u.active ? "Activo" : "Inactivo"}
                  </span>
                  {u.createdAt && <span>desde {relativeTime(u.createdAt)}</span>}
                </div>

                {(u.setup.sopIds.length > 0 || u.setup.greeting) && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 3, padding: "8px 10px", background: "#FFF", border: "1px solid var(--v2-border)", borderRadius: 8, fontSize: 10.5, color: "var(--v2-text-2)", width: "100%" }}>
                    {u.setup.sopIds.length > 0 && (
                      <span><b style={{ color: "var(--v2-text)" }}>{u.setup.sopIds.length}</b> SOP{u.setup.sopIds.length !== 1 ? "s" : ""} asignado{u.setup.sopIds.length !== 1 ? "s" : ""}</span>
                    )}
                    {u.setup.greeting && <span>greeting personalizado</span>}
                  </div>
                )}

                <div style={{ display: "flex", gap: 6, paddingTop: 8, borderTop: "1px solid var(--v2-border)", marginTop: "auto", width: "100%" }}>
                  <button className="v2-pill" style={{ flex: 1, justifyContent: "center" }} onClick={() => openDetail(u)} title="Ver tareas">
                    <UserCog size={13} /> Tareas
                  </button>
                  <button className="v2-pill" style={{ flex: 1, justifyContent: "center" }} onClick={() => openEdit(u)} title="Editar">
                    Editar
                  </button>
                  {!isMe && (
                    <button className="v2-pill" onClick={() => remove(u)} title="Borrar" style={{ color: "var(--v2-warn-text)" }}>
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

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
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {detail.tasks.map((t) => (
                    <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 11px", background: "var(--v2-bg-soft)", border: "1px solid var(--v2-border)", borderRadius: 8, fontSize: 11 }}>
                      <span className="v2-tag">{t.kind.slice(0, 2).toUpperCase()}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</div>
                        <div style={{ fontSize: 10, color: "var(--v2-text-3)", marginTop: 2 }}>{t.status} · {relativeTime(t.updatedAt) || "sin fecha"}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}