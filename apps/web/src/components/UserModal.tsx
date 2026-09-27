import { useState } from "react";
import { AlertCircle, X } from "lucide-react";
import { createUser, updateUser, type AuthUser } from "../api/auth";
import { ApiError } from "../api/client";

interface Props {
  editing: AuthUser | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function UserModal({ editing, onClose, onSaved }: Props) {
  const isEdit = Boolean(editing);
  const [email, setEmail] = useState(editing?.email ?? "");
  const [name, setName] = useState(editing?.name ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "user">(editing?.role ?? "user");
  const [active, setActive] = useState(editing?.active ?? true);
  const [greeting, setGreeting] = useState(editing?.setup.greeting ?? "");
  const [sopIdsText, setSopIdsText] = useState((editing?.setup.sopIds ?? []).join(", "));
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const clearField = (field: string) => {
    if (!fieldErrors[field]) return;
    const next = { ...fieldErrors };
    delete next[field];
    setFieldErrors(next);
  };

  const validateClient = (): Record<string, string> => {
    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = "El nombre es obligatorio";
    if (!isEdit) {
      if (!email.trim()) errors.email = "El email es obligatorio";
      else if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email.trim()))
        errors.email = "El email no tiene un formato valido";
      if (!password) errors.password = "La contrasena es obligatoria";
      else if (password.length < 8)
        errors.password = "La contrasena debe tener al menos 8 caracteres";
    } else if (password && password.length < 8) {
      errors.password = "La contrasena debe tener al menos 8 caracteres";
    }
    return errors;
  };

  const submit = async () => {
    const clientErrors = validateClient();
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      setGeneralError(null);
      return;
    }
    setFieldErrors({});
    setGeneralError(null);
    setBusy(true);
    try {
      const setup = {
        greeting: greeting.trim(),
        sopIds: sopIdsText
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };
      if (isEdit && editing) {
        const patch: Record<string, unknown> = { name: name.trim(), role, active, setup };
        if (password) patch.password = password;
        await updateUser(editing.id, patch as Parameters<typeof updateUser>[1]);
      } else {
        await createUser({ email: email.trim(), name: name.trim(), password, role, setup });
      }
      onSaved();
    } catch (err) {
      if (err instanceof ApiError && err.fields) {
        setFieldErrors(err.fields);
        setGeneralError(Object.keys(err.fields).length > 1 ? err.message : null);
      } else {
        setGeneralError(err instanceof Error ? err.message : "Error al guardar");
      }
    } finally {
      setBusy(false);
    }
  };

  const baseField: React.CSSProperties = {
    width: "100%",
    padding: "9px 11px",
    border: "1px solid var(--border)",
    borderRadius: 8,
    background: "var(--surface)",
    color: "var(--text)",
    fontSize: 12.5,
    outline: "none",
    fontFamily: "inherit",
  };

  const fieldStyle = (field: string): React.CSSProperties => ({
    ...baseField,
    borderColor: fieldErrors[field] ? "#fca5a5" : "var(--border)",
    boxShadow: fieldErrors[field] ? "0 0 0 3px #fca5a51a" : "none",
  });

  const FieldError = ({ field }: { field: string }) =>
    fieldErrors[field] ? (
      <div className="field-error">
        <AlertCircle size={12} />
        <span>{fieldErrors[field]}</span>
      </div>
    ) : null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal small" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <div className="modal-title">{isEdit ? "Editar usuario" : "Nuevo usuario"}</div>
            <div className="modal-sub">
              {isEdit ? editing?.email : "Alta manual de una cuenta de empresa"}
            </div>
          </div>
          <button className="ghost-icon-button" onClick={onClose}><X size={17} /></button>
        </div>
        <div className="modal-body">
          {generalError && (
            <div className="modal-error">
              <AlertCircle size={16} />
              <span>{generalError}</span>
            </div>
          )}

          <label className="modal-label">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); clearField("email"); }}
            disabled={isEdit}
            placeholder="tu@empresa.com"
            style={{ ...fieldStyle("email"), opacity: isEdit ? 0.6 : 1 }}
          />
          <FieldError field="email" />

          <label className="modal-label" style={{ marginTop: 14 }}>Nombre completo</label>
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); clearField("name"); }}
            placeholder="Maria Garcia"
            style={fieldStyle("name")}
          />
          <FieldError field="name" />

          <label className="modal-label" style={{ marginTop: 14 }}>
            {isEdit ? "Nueva contrasena (opcional)" : "Contrasena"}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); clearField("password"); }}
            placeholder={isEdit ? "Dejar vacio para no cambiar" : "Minimo 8 caracteres"}
            style={fieldStyle("password")}
          />
          <FieldError field="password" />

          <label className="modal-label" style={{ marginTop: 14 }}>Rol</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as "admin" | "user")}
            style={{ ...baseField, marginBottom: 14 }}
          >
            <option value="user">Usuario</option>
            <option value="admin">Administrador</option>
          </select>

          {isEdit && (
            <>
              <label className="modal-label">Estado</label>
              <select
                value={active ? "1" : "0"}
                onChange={(e) => setActive(e.target.value === "1")}
                style={{ ...baseField, marginBottom: 14 }}
              >
                <option value="1">Activo</option>
                <option value="0">Desactivado</option>
              </select>
            </>
          )}

          <label className="modal-label">Greeting (aparece en el chat vacio)</label>
          <textarea
            value={greeting}
            onChange={(e) => setGreeting(e.target.value)}
            placeholder="Hola Maria, en que te ayudo hoy?"
            rows={2}
            style={{ ...baseField, resize: "vertical", marginBottom: 14 }}
          />

          <label className="modal-label">SOPs asignados (ids separados por coma)</label>
          <input
            type="text"
            value={sopIdsText}
            onChange={(e) => setSopIdsText(e.target.value)}
            placeholder="resumen-negocio, follow-up-3-dias"
            style={{ ...baseField, marginBottom: 14 }}
          />

          <div className="control-row" style={{ justifyContent: "flex-end", marginTop: 6 }}>
            <button className="ctrl-btn" onClick={onClose} disabled={busy}>Cancelar</button>
            <button
              className="primary-btn"
              onClick={submit}
              disabled={busy}
              style={{ minWidth: 120 }}
            >
              {busy ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear usuario"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
