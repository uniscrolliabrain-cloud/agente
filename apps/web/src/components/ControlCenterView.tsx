import { useMemo, useState } from "react";
import { Activity, AlertCircle, CheckCircle2, RefreshCw, Search } from "lucide-react";
import { useEvents } from "../hooks/useEvents";
import { relativeTime } from "../lib/format";
import type { SystemEvent } from "../api/events";

interface Props {
  enabled: boolean;
  onOpenTask?: (taskId: string) => void;
}

// CONTROL_CENTER_NEW_GROUPS_V1 — anadidos los grupos del Business OS.
const TYPE_GROUPS: { label: string; prefix: string }[] = [
  { label: "Tareas", prefix: "task." },
  { label: "SOPs", prefix: "sop." },
  { label: "Acciones", prefix: "action." },
  { label: "Monitores", prefix: "monitor." },
  { label: "Entidades", prefix: "entity." },
  { label: "Relaciones", prefix: "relation." },
  { label: "Politicas", prefix: "policy." },
  { label: "Estados", prefix: "state." },
  { label: "Agentes", prefix: "agent." },
  { label: "Contexto", prefix: "context." },
  { label: "Sistema", prefix: "system." },
  { label: "Auth", prefix: "auth." },
];

function eventIcon(type: string) {
  if (type.endsWith("failed") || type.endsWith("error") || type.endsWith("unknown"))
    return <AlertCircle size={14} />;
  if (type.endsWith("completed") || type.endsWith("executed") || type.endsWith("approved"))
    return <CheckCircle2 size={14} />;
  return <Activity size={14} />;
}

export default function ControlCenterView({ enabled, onOpenTask }: Props) {
  const [group, setGroup] = useState<string>("");
  const [query, setQuery] = useState("");
  const { events, aggregates, timeline, error, loading, refresh } = useEvents(enabled);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return events.filter((event) => {
      if (group && !event.type.startsWith(group)) return false;
      if (!q) return true;
      const haystack = `${event.type} ${event.source.kind} ${event.source.id} ${JSON.stringify(event.payload)}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [events, group, query]);

  const topCount = Math.max(1, ...timeline.map((bucket) => bucket.count));

  return (
    <main className="view-shell">
      <div className="view-header">
        <div>
          <h2>Centro de control</h2>
          <span className="view-header-meta">
            {events.length} eventos · {aggregates.length} tipos
          </span>
        </div>
        <button className="ctrl-btn" onClick={() => void refresh()} disabled={loading}>
          <RefreshCw size={14} />
        </button>
      </div>

      {error && <div className="chat-error" style={{ margin: 16 }}>{error}</div>}

      <div className="rag-search">
        <div className="rag-search-row">
          <Search size={15} />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar en los eventos"
          />
        </div>
        <div className="memory-categories">
          <button className={`ctrl-btn ${group === "" ? "active" : ""}`} onClick={() => setGroup("")}>
            Todos
          </button>
          {TYPE_GROUPS.map((item) => (
            <button
              key={item.prefix}
              className={`ctrl-btn ${group === item.prefix ? "active" : ""}`}
              onClick={() => setGroup(item.prefix)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {timeline.length > 0 && (
        <div style={{ padding: "0 16px 12px" }}>
          <div style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 48 }}>
            {timeline.map((bucket) => (
              <div
                key={bucket.hour}
                title={`${bucket.hour}:00 · ${bucket.count} eventos`}
                style={{
                  flex: 1,
                  height: `${(bucket.count / topCount) * 100}%`,
                  background: "var(--accent)",
                  borderRadius: 2,
                  minHeight: 2,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {filtered.length === 0 && !loading && !error && (
        <div className="view-empty">
          <Activity size={22} />
          <p>Sin eventos todavia.</p>
          <small>Los eventos aparecen en cuanto el agente hace algo.</small>
        </div>
      )}

      {filtered.length > 0 && (
        <div className="view-memory-list">
          {filtered.map((event: SystemEvent) => (
            <div
              key={event.id}
              className="view-memory-card"
              onClick={() => {
                if (event.source.kind === "task" && onOpenTask) onOpenTask(event.source.id);
              }}
              style={{ cursor: event.source.kind === "task" && onOpenTask ? "pointer" : "default" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ color: "var(--text-2)" }}>{eventIcon(event.type)}</span>
                <span className="view-memory-source">{event.type}</span>
                <span className="view-memory-time" style={{ marginLeft: "auto" }}>
                  {relativeTime(event.emittedAt)}
                </span>
              </div>
              <div className="view-memory-text">
                {typeof event.payload.title === "string" ? event.payload.title : event.source.id}
              </div>
              <div className="view-memory-meta">
                <span className="view-memory-source">{event.source.kind}</span>
                <span style={{ opacity: 0.6 }}>{event.source.id.slice(0, 12)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}