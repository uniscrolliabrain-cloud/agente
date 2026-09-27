import { useCallback, useEffect, useRef, useState } from "react";
import { listTasks } from "../api/tasks";
import type { AgentTask } from "../types/api";

export function useTasks(intervalMs: number, enabled: boolean) {
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [workerRunning, setWorkerRunning] = useState(false);
  const [workerLastTickAt, setWorkerLastTickAt] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<number | null>(null);

  const refresh = useCallback(async () => {
    try {
      const ws = await listTasks();
      setTasks(ws.tasks);
      setWorkerRunning(ws.worker.running);
      setWorkerLastTickAt(ws.worker.lastTickAt);
      setError(null);
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
