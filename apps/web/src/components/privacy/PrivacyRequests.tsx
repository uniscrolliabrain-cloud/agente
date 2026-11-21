import { useEffect, useRef, useState } from "react";
import type { PrivacyRequest, PrivacyRequestType } from "@agente/domain/privacy";
import { apiFetch } from "../../api/client";

const labels: Record<PrivacyRequestType, string> = {
  access: "Solicitar copia",
  portability: "Solicitar portabilidad",
  rectification: "Solicitar rectificación",
  erasure: "Solicitar eliminación",
  restriction: "Solicitar limitación",
  objection: "Presentar oposición",
};
const statusLabels: Record<PrivacyRequest["status"], string> = {
  received: "Recibida",
  in_review: "En revisión",
  answered: "Respondida",
};
const path = "/api/privacy/requests";

export default function PrivacyRequests({ demo }: { demo: boolean }) {
  const [requests, setRequests] = useState<PrivacyRequest[] | null>(null);
  const [pending, setPending] = useState<PrivacyRequestType | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const pendingIds = useRef(new Map<PrivacyRequestType, string>());

  useEffect(() => {
    if (demo) return;
    const controller = new AbortController();
    void apiFetch<PrivacyRequest[]>(path, { signal: controller.signal })
      .then(setRequests)
      .catch(() => { if (!controller.signal.aborted) setError("No se pudieron cargar las solicitudes."); });
    return () => controller.abort();
  }, [demo]);

  async function request(type: PrivacyRequestType) {
    if (pending) return;
    const id = pendingIds.current.get(type) ?? crypto.randomUUID();
    pendingIds.current.set(type, id);
    setPending(type);
    setError("");
    setNotice("");
    try {
      const receipt = await apiFetch<PrivacyRequest>(path, { method: "POST", body: { id, type } });
      pendingIds.current.delete(type);
      setRequests((current) => [receipt, ...(current ?? []).filter((row) => row.id !== receipt.id)]);
      setNotice("Solicitud registrada para revisión.");
    } catch {
      setError("No se pudo confirmar el registro. Puedes reintentar.");
    } finally {
      setPending(null);
    }
  }

  return (
    <>
      <section>
        <h3>Mis datos</h3>
        <p>Registramos las solicitudes de esta cuenta para revisión humana. La eliminación puede estar limitada por obligaciones de conservación.</p>
        {demo ? <p>Inicia sesión con tu cuenta para enviar solicitudes.</p> : (
          <div className="privacy-actions">
            {Object.entries(labels).map(([type, label]) => (
              <button type="button" key={type} disabled={pending !== null || requests === null}
                onClick={() => void request(type as PrivacyRequestType)}>{label}</button>
            ))}
          </div>
        )}
      </section>
      {!demo && (
        <section>
          <h3>Mis solicitudes</h3>
          {error && <p role="alert">{error}</p>}
          {notice && <p role="status">{notice}</p>}
          {requests?.length === 0 && <p>Todavía no hay solicitudes.</p>}
          {requests && requests.length > 0 && (
            <ul>
              {requests.map((item) => (
                <li key={item.id}>
                  {labels[item.type]} · {statusLabels[item.status]} · {new Date(item.createdAt).toLocaleDateString("es")}
                  <br /><small>Referencia {item.id}</small>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </>
  );
}
