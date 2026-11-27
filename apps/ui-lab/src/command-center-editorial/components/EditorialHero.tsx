// Cabecera editorial: identidad de la empresa, rol, alta de personas/agentes y
// actualización. Los permisos vienen resueltos en `canManageMembers` (servidor),
// igual que en la vista original; aquí no se decide ningún permiso nuevo.
import { Bot, RefreshCw, UserPlus } from "lucide-react";
import { BrandLockup } from "../../../../web/src/components/BrandMark";
import type { CompanyRole } from "../../../../web/src/api/company";
import { ROLE_LABEL, todayLabel } from "../../../../web/src/components/command-center/labels";

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
    <header className="cce-hero">
      <div className="cce-hero-top">
        <div className="cce-hero-identity">
          <BrandLockup markSize={30} />
          <div className="cce-chips">
            <span className="cce-chip" title={`Empresa · ${tenantName}`}>
              Empresa · {tenantName}
            </span>
            <span className="cce-chip cce-chip--active" aria-current="page">Centro de mando</span>
            {role && <span className="cce-chip">{ROLE_LABEL[role]}</span>}
          </div>
        </div>

        <div className="cce-hero-actions">
          {canManageMembers && (
            <>
              <button type="button" className="cce-btn" onClick={onAddAgent}>
                <Bot size={15} aria-hidden="true" /> Añadir agente
              </button>
              <button type="button" className="cce-btn cce-btn--primary" onClick={onAddPerson}>
                <UserPlus size={15} aria-hidden="true" /> Añadir persona
              </button>
            </>
          )}
          <button
            type="button"
            className="cce-icon-btn"
            onClick={onRefresh}
            aria-label="Actualizar"
            title="Actualizar"
          >
            <RefreshCw size={16} className={refreshing ? "cce-spin" : undefined} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="cce-hero-title">
        <h1 className="cce-greeting">Buenos días</h1>
        <p className="cce-hero-context">
          Esto necesita tu atención <span className="cce-dot">·</span> {todayLabel()}
          {updatedAt ? (
            <>
              <span className="cce-dot">·</span>
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
