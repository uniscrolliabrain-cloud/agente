import { Activity, MessageSquare, Settings } from "lucide-react";
import { fmtPct, type AgentUI } from "./types";

interface Props {
  agent: AgentUI;
  onTalk: () => void;
  onLogs: () => void;
  onConfig: () => void;
}

export default function AgentHeroV2({ agent, onTalk, onLogs, onConfig }: Props) {
  return (
    <section className="agents-hero">
      <div className="agents-hero__glow" />
      <div className="agents-hero__header">
        <span className="agents-hero__eyebrow">
          <i className="agents-hero__live-dot" />
          AGENTE ACTIVO
        </span>
        <span className="agents-hero__level">LVL {agent.level}</span>
        <span className="agents-hero__rarity">{agent.rarity}</span>
      </div>
      <div className="agents-hero__main">
        <div className="agents-hero__portrait">{agent.name.slice(0, 1).toUpperCase()}</div>
        <div className="agents-hero__identity">
          <h1>{agent.name}</h1>
          <div className="agents-hero__role">
            <span>{agent.role}</span>
            <span className={`agent-status agent-status--${agent.status}`}>
              <i />
              {agent.status}
            </span>
          </div>
          {agent.description && <p>{agent.description}</p>}
          {agent.currentTask && <p>Tarea actual: {agent.currentTask}</p>}
          {agent.capabilities.length > 0 && (
            <div className="agents-hero__chips">
              {agent.capabilities.map((c) => (
                <span key={c}>{c}</span>
              ))}
            </div>
          )}
        </div>
        <div className="agents-hero__integrity">
          <span>UPTIME</span>
          <strong>{fmtPct(agent.uptime)}</strong>
          <div className="agents-hero__integrity-bar">
            <i style={{ width: `${agent.uptime}%` }} />
          </div>
        </div>
      </div>
      <div className="agents-hero__actions">
        <button type="button" className="btn btn--primary" onClick={onTalk}>
          <MessageSquare size={14} /> Hablar con {agent.name}
        </button>
        <button type="button" className="btn" onClick={onLogs}>
          <Activity size={14} /> Ver logs
        </button>
        <button type="button" className="btn" onClick={onConfig}>
          <Settings size={14} /> Configurar
        </button>
      </div>
    </section>
  );
}