import { useEffect, useState } from "react";
import { ApiError, apiFetch } from "../../api/client";
import LegalExternalLink from "../legal/LegalExternalLink";

interface Governance {
  tenantId: string;
  role: string;
  policies: "draft";
  dpa: "pending";
  subprocessors: "pending";
  retention: "pending";
  companyExport: "unavailable";
  incidents: "manual";
}

export default function TenantGovernancePanel() {
  const [governance, setGovernance] = useState<Governance | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    void apiFetch<Governance>("/api/privacy/governance", { signal: controller.signal })
      .then(setGovernance)
      .catch((err: unknown) => {
        if (!controller.signal.aborted && !(err instanceof ApiError && err.status === 403)) setError(true);
      });
    return () => controller.abort();
  }, []);

  if (error) return <p role="status">No se pudo consultar la gobernanza de la empresa.</p>;
  if (!governance) return null;
  return (
    <section>
      <h3>Datos de mi empresa</h3>
      <dl className="governance-status">
        <dt>Políticas</dt>
        <dd>
          <LegalExternalLink page="trust">Borradores y versiones</LegalExternalLink>
        </dd>
        <dt>DPA, subencargados y retención</dt>
        <dd>Pendientes de revisión</dd>
        <dt>Exportación de empresa</dt>
        <dd>Próximamente</dd>
        <dt>Incidentes y solicitudes de empresa</dt>
        <dd>Revisión por la persona responsable de tu organización</dd>
      </dl>
    </section>
  );
}
