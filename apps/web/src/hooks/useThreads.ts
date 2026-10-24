import { useCallback, useEffect, useRef, useState } from "react";
import {
  createThread as apiCreateThread,
  deleteThread as apiDeleteThread,
  listThreads,
  renameThread as apiRenameThread,
  type Thread,
} from "../api/threads";

const ACTIVE_KEY = "openmuse_active_thread";

export function useThreads(enabled: boolean) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeId, setActiveId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(ACTIVE_KEY);
    } catch {
      return null;
    }
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const mountedRef = useRef(true);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    try {
      const list = await listThreads();
      if (!mountedRef.current) return;
      setThreads(list);
      setError(null);
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err instanceof Error ? err.message : "Error cargando conversaciones");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;
    void refresh();
  }, [enabled, refresh]);

  useEffect(() => {
    try {
      if (activeId) localStorage.setItem(ACTIVE_KEY, activeId);
      else localStorage.removeItem(ACTIVE_KEY);
    } catch {
      /* localStorage puede fallar en modo privado */
    }
  }, [activeId]);

  const createNew = useCallback(
    async (title?: string): Promise<Thread | null> => {
      try {
        const thread = await apiCreateThread(title);
        setThreads((current) => [thread, ...current]);
        setActiveId(thread.id);
        setError(null);
        return thread;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error creando conversación");
        return null;
      }
    },
    [],
  );

  const rename = useCallback(async (id: string, title: string) => {
    try {
      const updated = await apiRenameThread(id, title);
      setThreads((current) => current.map((t) => (t.id === id ? updated : t)));
      setError(null);
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error renombrando");
      return null;
    }
  }, []);

  const remove = useCallback(
    async (id: string) => {
      try {
        await apiDeleteThread(id);
        setThreads((current) => {
          const next = current.filter((t) => t.id !== id);
          if (id === activeId) {
            setActiveId(next.length > 0 ? next[0].id : null);
          }
          return next;
        });
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error borrando");
      }
    },
    [activeId],
  );

  const select = useCallback((id: string | null) => {
    setActiveId(id);
  }, []);

  const touch = useCallback((id: string, updatedAt?: string) => {
    setThreads((current) => {
      const idx = current.findIndex((t) => t.id === id);
      if (idx < 0) return current;
      const item = current[idx];
      const next = [...current];
      next[idx] = { ...item, updatedAt: updatedAt ?? new Date().toISOString() };
      next.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      return next;
    });
  }, []);

  return {
    threads,
    activeId,
    error,
    loading,
    refresh,
    createNew,
    rename,
    remove,
    select,
    touch,
  };
}