import type { AgentActivityEntry } from "../../api/agentPersonas";
import { fmtTime } from "./types";

interface Props {
  entries: AgentActivityEntry[];
  loading: boolean;
  agentName: string;
}

export default function AgentActivityFeed({ entries, loading, agentName }: Props) {
  return (
    <section className="agent-activity">
      <header className="agent-activity__head">
        <h3>Activity Log · {agentName}</h3>
        {loading && <span className="agent-activity__live">SYNC</span>}
      </header>
      <div className="agent-activity__list">
        {entries.length === 0 ? (
          <div className="agent-activity__empty">{loading ? "Cargando…" : "Sin actividad reciente"}</div>
        ) : (
          entries.map((e, i) => (
            <div
              key={`${e.taskId ?? e.at}-${e.subject}-${i}`}
              className="agent-activity__row"
              style={{ "--agent-delay": `${Math.min(i, 8) * 40}ms` } as React.CSSProperties}
            >
              <i className={`agent-activity__dot agent-activity__dot--${e.kind}`} />
              <span className="agent-activity__time">{fmtTime(e.at)}</span>
              <span className="agent-activity__text">
                <strong>{e.verb}</strong> {e.subject}
              </span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}