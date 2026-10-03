// EMPLOYEE_PROFILE_VIEW_STUB_V1
// El componente real (perfil del empleado digital con pestanas de actividad,
// memoria del rol y SOPs asignados) se implementa en la Fase 3 del plan de
// reconciliacion. Este fichero quedo contaminado con codigo de servidor
// (imports de Hono, AgentService, UserService) por un copy-paste accidental.
// El backend real vive en apps/server/src/admin-routes.ts.

interface Props {
  roleId: string;
  onClose?: () => void;
}

export default function EmployeeProfileView({ roleId, onClose }: Props) {
  return (
    <div className="v3-cc-main" style={{ maxWidth: 900 }}>
      <div className="v3-cc-header">
        <h1 className="v3-cc-title">Perfil del empleado digital</h1>
        <div className="v3-cc-sub">Rol: {roleId}</div>
        {onClose && (
          <button className="v2-pill" onClick={onClose}>Cerrar</button>
        )}
      </div>
      <div className="v3-cc-panel" style={{ marginTop: 12 }}>
        <div className="v3-cc-empty">
          La ficha del empleado (actividad, memoria viva, SOPs asignados) se
          activa en la Fase 3 del plan de reconciliacion.
        </div>
      </div>
    </div>
  );
}