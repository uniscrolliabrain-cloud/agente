import { Brain } from "lucide-react";
import type { MemoryEntry } from "../hooks/useWorkspaceData";

interface Props {
  memories: MemoryEntry[];
}

function relativeTime(iso?: string): string {
  if (!iso) return "";
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 60000) return "ahora";
  if (ms < 3600000) return `${Math.floor(ms / 60000)}m`;
  if (ms < 86400000) return `${Math.floor(ms / 3600000)}h`;
  return `${Math.floor(ms / 86400000)}d`;
}

export default function MemoryView({ memories }: Props) {
  return (
    <main className="view-shell">
      <div className="view-header">
        <h2>Memoria</h2>
        <span className="view-header-meta">{memories.length} entradas</span>
      </div>

      {memories.length === 0 ? (
        <div className="view-empty">
          <Brain size={22} />
          <p>El agente aún no ha aprendido nada.</p>
          <small>Cuando termines tareas con SOPs, se guardarán recuerdos aquí.</small>
        </div>
      ) : (
        <div className="view-memory-list">
          {memories.map((m) => (
            <div key={m.id} className="view-memory-card">
              <div className="view-memory-text">{m.text}</div>
              {m.source && (
                <div className="view-memory-meta">
                  <span className="view-memory-source">{m.source}</span>
                  {m.createdAt && <span className="view-memory-time">{relativeTime(m.createdAt)}</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
