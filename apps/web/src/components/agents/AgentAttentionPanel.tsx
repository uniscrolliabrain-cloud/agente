import type { AgentAttention } from "../../api/agentPersonas";
import { toPercent } from "./types";

export default function AgentAttentionPanel({ attention }: { attention: AgentAttention | null }) {
  return (
    <section className="agent-attention">
      <header className="agent-knowledge__head">
        <h3>Atención</h3>
        <span>{attention ? `${attention.totalThoughts} pensamientos` : "—"}</span>
      </header>
      {!attention || attention.topMatched.length === 0 ? (
        <div className="agent-activity__empty">Sin datos de atención</div>
      ) : (
        <ul className="agent-attention__list">
          {attention.topMatched.map((m) => (
            <li key={`${m.node}-${m.reason}`}>
              <div className="agent-attention__row">
                <strong>{m.node}</strong>
                <span>{Math.round(toPercent(m.weight))}%</span>
              </div>
              <small>{m.reason}</small>
              <div className="agent-attention__bar">
                <i style={{ width: `${toPercent(m.weight)}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}