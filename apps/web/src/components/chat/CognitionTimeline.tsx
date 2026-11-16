import { useEffect, useState } from "react";
import { ApiError, apiFetch } from "../../api/client";
type Phase = { sequence: string; eventId: string; jobId: string; at: string; receiptId: string; state: "queued" | "running" | "completed" | "failed" | "cancelled" };
type Journey = { phases: Phase[]; nextCursor: string };
const labels: Record<Phase["state"], string> = { queued: "Análisis en cola", running: "Análisis iniciado", completed: "Análisis guardado", failed: "Análisis fallido", cancelled: "Análisis cancelado" };
export function CognitionTimeline({ refreshKey }: { refreshKey: string }) {
  const [phases, setPhases] = useState<Phase[]>([]);
  const [stale, setStale] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    let cursor = "0", active = false, disabled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    setPhases([]); setStale(false);
    const poll = async () => {
      if (active || disabled || controller.signal.aborted) return;
      clearTimeout(timer);
      if (document.hidden || !navigator.onLine) {
        timer = setTimeout(() => void poll(), 3000); return;
      }
      active = true;
      let caughtUp = false;
      try {
        for (let page = 0; page < 4 && !controller.signal.aborted; page++) {
          const result = await apiFetch<Journey>(`/api/cognition-v2/journey?after=${cursor}`, { signal: controller.signal });
          if (controller.signal.aborted) return;
          if (!/^\d{1,20}$/.test(result.nextCursor) || BigInt(result.nextCursor) < BigInt(cursor)) throw Error("Invalid journey cursor");
          if (result.phases.length && result.nextCursor === cursor) throw Error("Journey cursor did not advance");
          cursor = result.nextCursor;
          setPhases((previous) => {
            const entries = new Map(previous.map((phase) => [phase.eventId, phase]));
            for (const phase of result.phases) entries.set(phase.eventId, phase);
            return [...entries.values()].slice(-50);
          });
          setStale(false);
          if (result.phases.length < 100) { caughtUp = true; break; }
        }
      } catch (error) {
        if (controller.signal.aborted) return;
        if (error instanceof ApiError && [401, 403, 404].includes(error.status)) {
          disabled = true; setPhases([]); setStale(false);
        } else setStale(true);
      } finally {
        active = false;
        if (!controller.signal.aborted && !disabled) timer = setTimeout(() => void poll(), caughtUp ? 3000 : 1000);
      }
    };
    const resume = () => { if (!document.hidden && navigator.onLine) void poll(); };
    document.addEventListener("visibilitychange", resume);
    window.addEventListener("online", resume);
    void poll();
    return () => {
      controller.abort(); clearTimeout(timer);
      document.removeEventListener("visibilitychange", resume);
      window.removeEventListener("online", resume);
    };
  }, [refreshKey]);
  if (!phases.length) return null;
  return <details className="cognition-journey">
    <summary>Tus análisis recientes</summary>
    {stale && <p role="status">Actualización pendiente de conexión.</p>}
    <ol>{phases.slice(-8).map((phase) => <li key={phase.eventId}>
      <span>{labels[phase.state]}</span>{" "}<time dateTime={phase.at}>{new Date(phase.at).toLocaleTimeString()}</time>
    </li>)}</ol>
  </details>;
}
