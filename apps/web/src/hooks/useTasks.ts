import { useCallback, useEffect, useRef, useState } from "react";
import { listTasks } from "../api/tasks";
import type { AgentTask } from "../types/api";

export function useTasks(intervalMs: number, enabled: boolean) {
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [workerRunning, setWorkerRunning] = useState(false);
  const [workerLastTickAt, setWorkerLastTickAt] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<number | null>(null);
  // POLL_NO_OP_SETSTATE_V1 - el sondeo cada 3 s creaba arrays nuevos y re-renderizaba
  // toda la app aunque nada hubiera cambiado. Se compara antes de tocar el estado.
  const lastSignatureRef = useRef<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const ws = await listTasks();
      setError(null);
      const signature = JSON.stringify({ tasks: ws.tasks, worker: ws.worker });
      if (signature === lastSignatureRef.current) return;
      lastSignatureRef.current = signature;
      setTasks(ws.tasks);
      setWorkerRunning(ws.worker.running);
      setWorkerLastTickAt(ws.worker.lastTickAt);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error cargando tareas");
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    void refresh();
    intervalRef.current = window.setInterval(refresh, intervalMs);
    return () => {
      if (intervalRef.current !== null) window.clearInterval(intervalRef.current);
    };
  }, [enabled, intervalMs, refresh]);

  return { tasks, workerRunning, workerLastTickAt, error, refresh };
}
