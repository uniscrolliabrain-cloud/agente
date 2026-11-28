// Cabecera editorial: identidad de la empresa, rol, alta de personas/agentes y
// actualización. Los permisos vienen resueltos en `canManageMembers` (servidor),
// igual que en la vista original; aquí no se decide ningún permiso nuevo.
import { Bot, RefreshCw, UserPlus } from "lucide-react";
import { BrandLockup } from "../../../components/BrandMark";
import type { CompanyRole } from "../../../api/company";
import { ROLE_LABEL, todayLabel } from "../../../components/command-center/labels";

interface Props {
  tenantName: string;
  role: CompanyRole | null;
  canManageMembers: boolean;
  updatedAt: string | null;
  updatedLabel: string;
  refreshing: boolean;
  onRefresh: () => void;
  onAddAgent: () => void;
  onAddPerson: () => void;
}

export function EditorialHero({
  tenantName,
  role,
  canManageMembers,
  updatedAt,
  updatedLabel,
  refreshing,
  onRefresh,
  onAddAgent,
  onAddPerson,
}: Props) {
  return (
    <header className="cce-legacy-hero">
      <div className="cce-legacy-hero-top">
        <div className="cce-legacy-hero-identity">
          <BrandLockup markSize={30} />
          <div className="cce-legacy-chips">
            <span className="cce-legacy-chip" title={`Empresa · ${tenantName}`}>
              Empresa · {tenantName}
            </span>
            <span className="cce-legacy-chip cce-legacy-chip--active">Centro de mando</span>
            {role && <span className="cce-legacy-chip">{ROLE_LABEL[role]}</span>}
          </div>
        </div>

        <div className="cce-legacy-hero-actions">
          {canManageMembers && (
            <>
              <button type="button" className="cce-legacy-btn" onClick={onAddAgent}>
                <Bot size={15} aria-hidden="true" /> Añadir agente
              </button>
              <button type="button" className="cce-legacy-btn cce-legacy-btn--primary" onClick={onAddPerson}>
                <UserPlus size={15} aria-hidden="true" /> Añadir persona
              </button>
            </>
          )}
          <button
            type="button"
            className="cce-legacy-icon-btn"
            onClick={onRefresh}
            aria-label="Actualizar"
            title="Actualizar"
          >
            <RefreshCw size={16} className={refreshing ? "cce-legacy-spin" : undefined} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="cce-legacy-hero-title">
        <h1 className="cce-legacy-greeting">Buenos días</h1>
        <p className="cce-legacy-hero-context">
          Esto necesita tu atención <span className="cce-legacy-dot">·</span> {todayLabel()}
          {updatedAt ? (
            <>
              <span className="cce-legacy-dot">·</span>
              <span aria-live="polite">
                Actualizado {updatedLabel === "ahora" ? "ahora" : `hace ${updatedLabel}`}
              </span>
            </>
          ) : null}
        </p>
      </div>
    </header>
  );
}
