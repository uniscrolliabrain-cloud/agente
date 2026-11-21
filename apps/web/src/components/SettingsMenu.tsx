// SIDEBAR_SETTINGS_V1 - menu de ajustes y cuenta del pie de la barra lateral.
// Antes el icono de engranaje no hacia nada y no habia forma de cerrar sesion
// desde el panel: solo borrando el almacenamiento del navegador.
import { useEffect } from "react";
import { Building2, ChevronRight, LogOut, Sparkles, UserRound } from "lucide-react";
import { BrandLockup } from "./BrandMark";
import { initialsOf } from "./team/data";

interface Props {
  open: boolean;
  onClose: () => void;
  userName: string;
  userEmail: string | null;
  userRole: string;
  tenantLabel: string;
  demo: boolean;
  onOpenProfile: () => void;
  onExitDemo: () => void;
  onLogout: () => void;
}

export default function SettingsMenu({
  open,
  onClose,
  userName,
  userEmail,
  userRole,
  tenantLabel,
  demo,
  onOpenProfile,
  onExitDemo,
  onLogout,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <button type="button" className="settings-backdrop" aria-label="Cerrar ajustes" onClick={onClose} />
      <div className="settings-menu" role="dialog" aria-modal="false" aria-label="Ajustes y cuenta">
        <div className="settings-head">
          <div className="settings-avatar">{initialsOf(userName) || "?"}</div>
          <div className="settings-id">
            <b>{userName}</b>
            <span>{userEmail ?? "Sesión local"}</span>
            <small>{userRole === "admin" ? "Administrador" : "Usuario"}</small>
          </div>
        </div>

        <div className="settings-section">
          <button
            type="button"
            className="settings-item"
            onClick={() => {
              onClose();
              onOpenProfile();
            }}
          >
            <UserRound size={15} />
            <span>Mi perfil</span>
            <ChevronRight size={14} className="settings-chevron" />
          </button>
          <div className="settings-item static">
            <Building2 size={15} />
            <span>{tenantLabel}</span>
            <small>{demo ? "Demo" : "Empresa"}</small>
          </div>
        </div>

        {demo && (
          <div className="settings-section">
            <button
              type="button"
              className="settings-item"
              onClick={() => {
                onClose();
                onExitDemo();
              }}
            >
              <Sparkles size={15} />
              <span>Salir del tenant demo</span>
            </button>
          </div>
        )}

        <div className="settings-section">
          <button
            type="button"
            className="settings-item danger"
            onClick={() => {
              onClose();
              onLogout();
            }}
          >
            <LogOut size={15} />
            <span>Cerrar sesión</span>
          </button>
        </div>

        <div className="settings-foot"><BrandLockup markSize={24} /></div>
      </div>
    </>
  );
}
