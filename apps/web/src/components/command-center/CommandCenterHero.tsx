// COMMAND_CENTER_HERO_V1 - cabecera del centro de mando.
// Saludo sin nombre ("Buenos dias") y, solo para el owner de la empresa, los dos
// atajos de alta. El rol de plataforma no pinta aqui: `canManageMembers` ya lo
// resuelve el servidor desde la membership.
import { Bot, RefreshCw, UserPlus } from "lucide-react";
import { BrandLockup } from "../BrandMark";
import type { CompanyRole } from "../../api/company";
import { relativeTime } from "../../lib/format";
import { ROLE_LABEL, todayLabel } from "./labels";

interface Props {
  tenantName: string;
  role: CompanyRole | null;
  canManageMembers: boolean;
  updatedAt: string | null;
  refreshing: boolean;
  onRefresh: () => void;
  onAddAgent: () => void;
  onAddPerson: () => void;
}

export function CommandCenterHero({
  tenantName,
  role,
  canManageMembers,
  updatedAt,
  refreshing,
  onRefresh,
  onAddAgent,
  onAddPerson,
}: Props) {
  const updated = updatedAt ? relativeTime(updatedAt) : "";

  return (
    <header className="cc-hero">
      <div className="cc-hero-top">
        <BrandLockup />
        <span className="cc-chip">Empresa · {tenantName}</span>
        <span className="cc-chip active">Centro de mando</span>
        {role && <span className="cc-chip">{ROLE_LABEL[role]}</span>}

        <div className="cc-hero-actions">
          {canManageMembers && (
            <>
              <button type="button" className="cc-btn" onClick={onAddAgent}>
                <Bot size={14} /> Añadir agente
              </button>
              <button type="button" className="cc-btn primary" onClick={onAddPerson}>
                <UserPlus size={14} /> Añadir persona
              </button>
            </>
          )}
          <button
            type="button"
            className="cc-icon"
            onClick={onRefresh}
            aria-label="Actualizar"
            title="Actualizar"
          >
            <RefreshCw size={15} className={refreshing ? "cc-spin" : undefined} />
          </button>
        </div>
      </div>

      <div>
        <h1 className="cc-title">Buenos días</h1>
        <p className="cc-sub">
          Esto necesita tu atención · {todayLabel()}
          {updated ? ` · Actualizado ${updated === "ahora" ? "ahora" : `hace ${updated}`}` : ""}
        </p>
      </div>
    </header>
  );
}
