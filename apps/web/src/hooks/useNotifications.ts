import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch } from "../api/client";

export interface AgentNotification {
  id: string;
  taskId?: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}

export function useNotifications(enabled: boolean, intervalMs = 8000) {
  const [items, setItems] = useState<AgentNotification[]>([]);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);

  const refresh = useCallback(async () => {
    try {
      const list = await apiFetch<AgentNotification[]>("/api/agent/notifications");
      setItems(list);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error cargando notificaciones");
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    void refresh();
    timerRef.current = window.setInterval(refresh, intervalMs);
    return () => {
      if (timerRef.current !== null) window.clearInterval(timerRef.current);
    };
  }, [enabled, intervalMs, refresh]);

  const markRead = useCallback(async (id: string) => {
    setItems((current) => current.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try {
      await apiFetch(`/api/agent/notifications/${encodeURIComponent(id)}/read`, { method: "POST", body: {} });
    } catch {
      /* si falla, el siguiente refresh reconcilia */
    }
  }, []);

  const markAllRead = useCallback(async () => {
    const unread = items.filter((n) => !n.read);
    if (!unread.length) return;
    setItems((current) => current.map((n) => ({ ...n, read: true })));
    await Promise.all(unread.map((n) =>
      apiFetch(`/api/agent/notifications/${encodeURIComponent(n.id)}/read`, { method: "POST", body: {} }).catch(() => {}),
    ));
  }, [items]);

  const unread = items.filter((n) => !n.read).length;

  return { items, unread, error, refresh, markRead, markAllRead };
}
