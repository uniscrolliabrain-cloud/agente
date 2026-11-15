import { useEffect, useState } from "react";
import { apiFetch } from "../../api/client";
type Phase = { eventId: string; jobId: string; at: string; receiptId: string; state: "queued" | "running" | "completed" | "failed" | "cancelled" };
const labels: Record<Phase["state"], string> = { queued: "Análisis en cola", running: "Análisis iniciado", completed: "Análisis guardado", failed: "Análisis fallido", cancelled: "Análisis cancelado" };
export function CognitionTimeline({ refreshKey }: { refreshKey: string }) {
  const [phases, setPhases] = useState<Phase[]>([]);
  useEffect(() => {
    const controller = new AbortController();
    setPhases([]);
    void apiFetch<{ phases: Phase[] }>("/api/cognition-v2/journey", { signal: controller.signal })
      .then((result) => { if (!controller.signal.aborted) setPhases(result.phases.slice(-8)); })
      .catch(() => {});
    return () => controller.abort();
  }, [refreshKey]);
  if (!phases.length) return null;
  return <details className="cognition-journey">
    <summary>Tus análisis recientes</summary>
    <ol>{phases.map((phase) => <li key={phase.eventId}>
      <span>{labels[phase.state]}</span>{" "}<time dateTime={phase.at}>{new Date(phase.at).toLocaleTimeString()}</time>
    </li>)}</ol>
  </details>;
}
