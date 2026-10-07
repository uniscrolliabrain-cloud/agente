// AGENT_ACTIVITY_LOG_V1 - activity log del squad.
import { Activity, AlertTriangle } from "lucide-react";
import { RUNTIME_LOGS } from "./types";
import type { CSSProperties } from "react";

export default function AgentActivityLog() {
  return (
    <section className="agent-activity">
      <div className="agent-section-heading">
        <div>
          <span className="agent-section-heading__eyebrow">ACTIVITY LOG</span>
          <h2>Actividad del squad</h2>
        </div>
        <span className="agent-live">
          <i />
          LIVE
        </span>
      </div>

      <div className="agent-activity__list">
        {RUNTIME_LOGS.map((log, index) => (
          <div
            key={`${log.time}-${index}`}
            className="agent-activity__row"
            style={{ "--agent-delay": `${index * 50}ms` } as CSSProperties}
          >
            <div className={`agent-activity__indicator agent-activity__indicator--${log.type}`}>
              {log.type === "warn" ? <AlertTriangle size={13} /> : <Activity size={13} />}
            </div>
            <span className="agent-activity__time">{log.time}</span>
            <span className="agent-activity__message">{log.message}</span>
            <span className={`agent-activity__state agent-activity__state--${log.type}`}>
              {log.type === "warn" ? "WARNING" : log.type === "error" ? "FAILED" : "SUCCESS"}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}