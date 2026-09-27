import { useState } from "react";
import { AlertCircle, X } from "lucide-react";
import { updateMe, type AuthUser } from "../api/auth";
import { ApiError } from "../api/client";

interface Props { user: AuthUser; onClose: () => void; onSaved: (u: AuthUser) => void; }

export default function ProfileModal({ user, onClose, onSaved }: Props) {
  const [name, setName] = useState(user.name);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  const clearField = (f: string) => {
    if (!fieldErrors[f]) return;
    const n = { ...fieldErrors }; delete n[f]; setFieldErrors(n);
  };

  const submit = async () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "El nombre es obligatorio";
    if (newPassword) {
      if (!currentPassword) errs.currentPassword = "Introduce tu contrasena actual";
      if (newPassword.length < 8) errs.newPassword = "Minimo 8 caracteres";
      if (newPassword !== confirmPassword) errs.confirmPassword = "No coinciden";
    }
    if (Object.keys(errs).length) { setFieldErrors(errs); setGeneralError(null); return; }
    setBusy(true); setFieldErrors({}); setGeneralError(null); setSaved(false);
    try {
      const updated = await updateMe({
        ...(name.trim() !== user.name ? { name: name.trim() } : {}),
        ...(newPassword ? { currentPassword, newPassword } : {}),
      });
      setSaved(true); setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      onSaved(updated);
    } catch (err) {
      if (err instanceof ApiError && err.fields) {
        setFieldErrors(err.fields);
        setGeneralError(Object.keys(err.fields).length > 1 ? err.message : null);
      } else setGeneralError(err instanceof Error ? err.message : "Error al guardar");
    } finally { setBusy(false); }
  };

  const base: React.CSSProperties = { width: "100%", padding: "9px 11px", border: "1px solid var(--border)", borderRadius: 8, background: "var(--surface)", color: "var(--text)", fontSize: 12.5, outline: "none", fontFamily: "inherit" };
  const fstyle = (f: string): React.CSSProperties => ({ ...base, borderColor: fieldErrors[f] ? "#fca5a5" : "var(--border)", boxShadow: fieldErrors[f] ? "0 0 0 3px #fca5a51a" : "none" });
  const FE = ({ field }: { field: string }) => fieldErrors[field] ? (<div className="field-error"><AlertCircle size={12} /><span>{fieldErrors[field]}</span></div>) : null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal small" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div><div className="modal-title">Mi perfil</div><div className="modal-sub">{user.email}</div></div>
          <button className="ghost-icon-button" onClick={onClose}><X size={17} /></button>
        </div>
        <div className="modal-body">
          {generalError && (<div className="modal-error"><AlertCircle size={16} /><span>{generalError}</span></div>)}
          {saved && !generalError && (<div className="modal-success">Cambios guardados</div>)}
          <label className="modal-label">Nombre</label>
          <input type="text" value={name} onChange={(e) => { setName(e.target.value); clearField("name"); }} style={fstyle("name")} />
          <FE field="name" />
          <div style={{ marginTop: 20, marginBottom: 8, fontSize: 11, fontWeight: 600, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Cambiar contrasena (opcional)</div>
          <label className="modal-label">Contrasena actual</label>
          <input type="password" value={currentPassword} onChange={(e) => { setCurrentPassword(e.target.value); clearField("currentPassword"); }} style={fstyle("currentPassword")} />
          <FE field="currentPassword" />
          <label className="modal-label" style={{ marginTop: 14 }}>Nueva contrasena</label>
          <input type="password" value={newPassword} onChange={(e) => { setNewPassword(e.target.value); clearField("newPassword"); clearField("confirmPassword"); }} placeholder="Minimo 8 caracteres" style={fstyle("newPassword")} />
          <FE field="newPassword" />
          <label className="modal-label" style={{ marginTop: 14 }}>Confirmar</label>
          <input type="password" value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); clearField("confirmPassword"); }} style={fstyle("confirmPassword")} />
          <FE field="confirmPassword" />
          <div className="control-row" style={{ justifyContent: "flex-end", marginTop: 16 }}>
            <button className="ctrl-btn" onClick={onClose} disabled={busy}>Cerrar</button>
            <button className="primary-btn" onClick={submit} disabled={busy} style={{ minWidth: 120 }}>{busy ? "Guardando..." : "Guardar"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
