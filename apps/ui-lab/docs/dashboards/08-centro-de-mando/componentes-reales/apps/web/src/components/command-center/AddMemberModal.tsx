// COMMAND_CENTER_MEMBER_MODAL_V1 - alta de una persona por el owner.
// Se extrajo de la vista para que el formulario del centro de mando sea un
// componente propio; el contrato con POST /api/company/members no cambia.
import { useState } from "react";
import { X } from "lucide-react";
import { addCompanyMember } from "../../api/company";

interface Props {
  isOwner: boolean;
  onClose: () => void;
  onCreated: (result: Awaited<ReturnType<typeof addCompanyMember>>) => void | Promise<void>;
}

export function AddMemberModal({ isOwner, onClose, onCreated }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "member">("member");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!email.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      await onCreated(
        await addCompanyMember({
          email: email.trim(),
          role,
          ...(name.trim() ? { name: name.trim() } : {}),
          ...(password ? { password } : {}),
        }),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo añadir a la persona");
      setBusy(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal small" onClick={(event) => event.stopPropagation()}>
        <div className="modal-head">
          <div>
            <div className="modal-title">Añadir persona</div>
            <div className="modal-sub">Alta directa en tu empresa</div>
          </div>
          <button className="ghost-icon-button" onClick={onClose} aria-label="Cerrar">
            <X size={17} />
          </button>
        </div>
        <div className="modal-body" style={{ display: "grid", gap: 12 }}>
          {error && <div className="chat-error">{error}</div>}

          <p className="cc-modal-hint">
            Si el email ya tiene cuenta, solo se le añade a esta empresa. Si no, se crea la
            cuenta con estos datos. Después podrá entrar con Google o GitHub usando el mismo
            email.
          </p>

          <label className="modal-label" htmlFor="member-name">
            Nombre
          </label>
          <input
            id="member-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ej: Marta Ruiz"
            autoFocus
          />

          <label className="modal-label" htmlFor="member-email">
            Email
          </label>
          <input
            id="member-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="marta@empresa.com"
          />

          <label className="modal-label" htmlFor="member-password">
            Contraseña
          </label>
          <input
            id="member-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Mínimo 8 caracteres"
          />

          <label className="modal-label" htmlFor="member-role">
            Rol en la empresa
          </label>
          <select
            id="member-role"
            value={role}
            onChange={(event) => setRole(event.target.value as "admin" | "member")}
          >
            <option value="member">Miembro · trabaja, no aprueba</option>
            <option value="admin">Admin · trabaja y aprueba</option>
          </select>

          <div className="control-row" style={{ justifyContent: "flex-end", marginTop: 4 }}>
            <button className="ctrl-btn" onClick={onClose} disabled={busy}>
              Cancelar
            </button>
            <button
              className="primary-btn"
              onClick={() => void submit()}
              disabled={busy || !email.trim() || !isOwner}
              title={isOwner ? undefined : "Solo el owner puede dar de alta personas"}
            >
              {busy ? "Añadiendo…" : "Añadir a la empresa"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
