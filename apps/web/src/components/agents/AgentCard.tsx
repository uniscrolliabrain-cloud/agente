// AGENT_CARD_V1 - card individual del squad.
import { ChevronRight } from "lucide-react";
import { type AgentUI, statusLabel, statusColor } from "./types";
import type { CSSProperties } from "react";

interface Props {
  agent: AgentUI;
  selected: boolean;
  onClick: () => void;
  index: number;
}

export default function AgentCard({ agent, selected, onClick, index }: Props) {
  const style = {
    "--agent-color": agent.color,
    "--agent-accent": agent.accent,
    "--agent-delay": `${index * 65}ms`,
  } as CSSProperties;

  const avatarBg =
    agent.id === "laia"
      ? "linear-gradient(135deg,#7C5CFC,#E34BAE)"
      : agent.color;

  return (
    <button
      type="button"
      className={`agent-card ${selected ? "agent-card--selected" : ""}`}
      style={style}
      onClick={onClick}
    >
      <div className="agent-card__top">
        <div className="agent-card__avatar" style={{ background: avatarBg }}>
          {agent.icon}
        </div>
        <div className="agent-card__rarity">{agent.rarity}</div>
        <div className="agent-card__level">LVL {agent.level}</div>
      </div>

      <div className="agent-card__body">
        <div className="agent-card__name">{agent.name}</div>
        <div className="agent-card__role">{agent.role}</div>

        <div className="agent-card__hp">
          <span>HP</span>
          <strong>{agent.hp}%</strong>
          <div className="agent-card__hp-track">
            <span style={{ width: `${agent.hp}%`, background: agent.color }} />
          </div>
        </div>
      </div>

      <div className="agent-card__footer">
        <span className={`agent-status agent-status--${agent.status}`}>
          <i style={{ background: statusColor(agent.status) }} />
          {statusLabel(agent.status)}
        </span>
        <ChevronRight size={15} />
      </div>
    </button>
  );
}