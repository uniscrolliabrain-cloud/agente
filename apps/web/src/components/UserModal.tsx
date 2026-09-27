import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { createUser, updateUser, type AuthUser } from "../api/auth";

interface Props {
  editing: AuthUser | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function UserModal({ editing, onClose, onSaved }: Props) {
  const [email, setEmail] = useState(editing?.email ?? "");
  const [name, setName] = useState(editing?.name ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "user">(editing?.role ?? "user");
  const [active, setActive] = useState(editing?.active ?? true);
  const [greeting, setGreeting] = useState(editing?.setup.greeting ?? "");
  const [sopIdsText, setSopIdsText] = useState((editing?.setup.sopIds ?? []).join(", "));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const isEdit = Boolean(editing);

  useEffect(() => {
    if (!isEdit && !password) setPassword("");
  }, [isEdit, password]);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      const setup = {
        greeting: greeting.trim(),
        sopIds: sopIdsText
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };
      if (isEdit && editing) {
        const patch: Record<string, unknown> = {
          name: name.trim(),
          role,
          active,
          setup,
        };
        if (password) patch.password = password;
        await updateUser(editing.id, patch as any);
      } else {
        if (!password) throw new Error("La contrasena es obligatoria");
        await createUser({
          email: email.trim(),
          name: name.trim(),
          password,
          role,
          setup,
        });
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal small" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <div className="modal-title">{isEdit ? "Editar usuario" : "Nuevo usuario"}</div>
            <div className="modal-sub">{isEdit ? editing?.email : "Alta manual"}</div>
          </div>
          <button className="ghost-icon-button" onClick={onClose}><X size={17} /></button>
        </div>
        <div className="modal-body">
          {error && <div className="chat-error">{error}</div>}

          <div className="answer-box">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isEdit}
              placeholder="tu@empresa.com"
              style={{ width: "100%", padding: "8px 10px", border: "1px solid var(--border)", borderRadius: 7, background: "var(--surface)", color: "var(--text)", fontSize: 12, outline: "none", marginBottom: 12 }}
            />

            <label>Nombre</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre completo"
              style={{ width: "100%", padding: "8px 10px", border: "1px solid var(--border)", borderRadius: 7, background: "var(--surface)", color: "var(--text)", fontSize: 12, outline: "none", marginBottom: 12 }}
            />

            <label>{isEdit ? "Nueva contrasena (opcional)" : "Contrasena"}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isEdit ? "Dejar vacio para no cambiar" : "Minimo 8 caracteres"}
              style={{ width: "100%", padding: "8px 10px", border: "1px solid var(--border)", borderRadius: 7, background: "var(--surface)", color: "var(--text)", fontSize: 12, outline: "none", marginBottom: 12 }}
            />

            <label>Rol</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "admin" | "user")}
              style={{ width: "100%", padding: "8px 10px", border: "1px solid var(--border)", borderRadius: 7, background: "var(--surface)", color: "var(--text)", fontSize: 12, outline: "none", marginBottom: 12 }}
            >
              <option value="user">Usuario</option>
              <option value="admin">Administrador</option>
            </select>

            {isEdit && (
              <>
                <label>Estado</label>
                <select
                  value={active ? "1" : "0"}
                  onChange={(e) => setActive(e.target.value === "1")}
                  style={{ width: "100%", padding: "8px 10px", border: "1px solid var(--border)", borderRadius: 7, background: "var(--surface)", color: "var(--text)", fontSize: 12, outline: "none", marginBottom: 12 }}
                >
                  <option value="1">Activo</option>
                  <option value="0">Desactivado</option>
                </select>
              </>
            )}

            <label>Greeting personalizado (aparece en el chat vacio)</label>
            <textarea
              value={greeting}
              onChange={(e) => setGreeting(e.target.value)}
              placeholder="Hola Maria, ¿en que te ayudo hoy?"
              rows={2}
              style={{ width: "100%", padding: "8px 10px", border: "1px solid var(--border)", borderRadius: 7, background: "var(--surface)", color: "var(--text)", fontSize: 12, outline: "none", marginBottom: 12, resize: "vertical" }}
            />

            <label>SOPs asignados (ids separados por coma)</label>
            <input
              type="text"
              value={sopIdsText}
              onChange={(e) => setSopIdsText(e.target.value)}
              placeholder="resumen-negocio, follow-up-3-dias"
              style={{ width: "100%", padding: "8px 10px", border: "1px solid var(--border)", borderRadius: 7, background: "var(--surface)", color: "var(--text)", fontSize: 12, outline: "none" }}
            />
          </div>

          <div className="control-row" style={{ justifyContent: "flex-end", marginTop: 12 }}>
            <button className="ctrl-btn" onClick={onClose} disabled={busy}>Cancelar</button>
            <button className="primary-btn" onClick={submit} disabled={busy || !name.trim() || (!isEdit && (!email.trim() || !password))}>
              {busy ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear usuario"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
