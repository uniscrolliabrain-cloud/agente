import { fmtDuration, fmtPct, type AgentUI } from "./types";

export default function AgentStatsGrid({ agent }: { agent: AgentUI }) {
  const items: Array<[string, string]> = [
    ["TAREAS", agent.tasks.toLocaleString("es-ES")],
    ["PRECISIÓN", fmtPct(agent.precision)],
    ["TIEMPO MEDIO", fmtDuration(agent.avgTimeMs)],
    ["UPTIME", fmtPct(agent.uptime)],
  ];
  return (
    <div className="agents-stats">
      {items.map(([label, value]) => (
        <div key={label} className="agents-stats__item">
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
      ))}
    </div>
  );
}