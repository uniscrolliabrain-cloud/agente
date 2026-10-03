// NOTIFICATIONS_DROPDOWN_V1 - campana en el topbar con lista.

import { useEffect, useRef, useState } from "react";
import { Bell, Check, CheckCheck } from "lucide-react";
import { apiFetch } from "../api/client";

interface Notif {
  id: string;
  type?: string;
  taskId?: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}

const TYPE_ICON: Record<string, string> = {
  "task-done": "✓",
  review: "!",
  input: "?",
  escalate: "↑",
  "watch-error": "⚠",
  info: "i",
};

export default function NotificationsDropdown() {
  const [items, setItems] = useState<Notif[]>([]);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const load = async () => {
    try {
      const list = await apiFetch<Notif[]>("/api/agent/notifications");
      setItems(list);
    } catch { /* silencio */ }
  };

  useEffect(() => {
    void load();
    const t = window.setInterval(load, 8000);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const unread = items.filter((n) => !n.read).length;
  const visible = filter ? items.filter((n) => n.type === filter) : items;
  const types = Array.from(new Set(items.map((n) => n.type ?? "info")));

  const markRead = async (id: string) => {
    setItems((current) => current.map((n) => (n.id === id ? { ...n, read: true } : n)));
    await apiFetch(`/api/agent/notifications/${id}/read`, { method: "POST", body: {} }).catch(() => {});
  };

  const markAllRead = async () => {
    const unreadIds = items.filter((n) => !n.read).map((n) => n.id);
    setItems((current) => current.map((n) => ({ ...n, read: true })));
    for (const id of unreadIds) {
      await apiFetch(`/api/agent/notifications/${id}/read`, { method: "POST", body: {} }).catch(() => {});
    }
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        className="v2-pill"
        style={{ position: "relative" }}
        onClick={() => setOpen(!open)}
        title="Notificaciones"
      >
        <Bell size={14} />
        {unread > 0 && (
          <span
            style={{
              position: "absolute",
              top: -4,
              right: -4,
              background: "var(--v2-purple)",
              color: "#fff",
              fontSize: 9,
              borderRadius: 999,
              padding: "1px 5px",
              minWidth: 14,
              textAlign: "center",
            }}
          >
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          className="v3-cc-panel"
          style={{
            position: "absolute",
            top: 36,
            right: 0,
            width: 340,
            maxHeight: 460,
            overflowY: "auto",
            zIndex: 100,
            boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <strong style={{ fontSize: 13 }}>Notificaciones</strong>
            {unread > 0 && (
              <button className="v2-pill" onClick={markAllRead} title="Marcar todas como leídas">
                <CheckCheck size={12} /> Todas
              </button>
            )}
          </div>

          {types.length > 1 && (
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 8 }}>
              <button className={`v2-pill ${filter === null ? "active" : ""}`} onClick={() => setFilter(null)}>Todas</button>
              {types.map((t) => (
                <button key={t} className={`v2-pill ${filter === t ? "active" : ""}`} onClick={() => setFilter(t)}>
                  {t}
                </button>
              ))}
            </div>
          )}

          {visible.length === 0 && <div className="v3-cc-empty" style={{ fontSize: 11 }}>Sin notificaciones.</div>}

          {visible.slice(0, 20).map((n) => (
            <div
              key={n.id}
              className="v3-task-row"
              style={{ cursor: "pointer", opacity: n.read ? 0.6 : 1, padding: "6px 0" }}
              onClick={() => void markRead(n.id)}
            >
              <span
                className="v2-tag"
                style={{ background: n.read ? "var(--v2-bg-soft)" : "var(--v2-purple-soft, #f0ebff)" }}
              >
                {TYPE_ICON[n.type ?? "info"] ?? "i"}
              </span>
              <div className="v3-task-body">
                <div className="v3-task-title">{n.title}</div>
                <div className="v3-task-sub">{n.body.slice(0, 120)}</div>
                <div className="v3-task-sub" style={{ fontSize: 10 }}>
                  {new Date(n.createdAt).toLocaleString("es-ES")}
                </div>
              </div>
              {!n.read && <Check size={12} style={{ color: "var(--v2-purple)" }} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
// NOTIF_SSE_BACKOFF_V1 - SSE con reconexion exponencial si cae.
export function subscribeNotificationsSSE(
  onMessage: (notif: unknown) => void,
  onError: (err: Error) => void,
): () => void {
  let backoff = 1000;
  let cancelled = false;
  let source: EventSource | null = null;

  const connect = () => {
    if (cancelled) return;
    try {
      source = new EventSource("/api/notifications/stream");
      source.onmessage = (e) => {
        try { onMessage(JSON.parse(e.data)); } catch { /* ignorar */ }
        backoff = 1000;
      };
      source.onerror = () => {
        source?.close();
        if (cancelled) return;
        onError(new Error("SSE disconnected"));
        backoff = Math.min(backoff * 2, 30000);
        setTimeout(connect, backoff);
      };
    } catch (err) {
      onError(err instanceof Error ? err : new Error("SSE failed"));
      backoff = Math.min(backoff * 2, 30000);
      setTimeout(connect, backoff);
    }
  };

  connect();
  return () => {
    cancelled = true;
    source?.close();
  };
}