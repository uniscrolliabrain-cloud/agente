// AGENT_HERO_V1 - hero grande del agente seleccionado.
import { Activity, MessageSquare, Settings } from "lucide-react";
import { type AgentUI } from "./types";
import type { CSSProperties } from "react";

interface Props {
  agent: AgentUI;
  onOpen: () => void;
}

export default function AgentHero({ agent, onOpen }: Props) {
  const style = {
    "--hero-color": agent.color,
    "--hero-accent": agent.accent,
  } as CSSProperties;

  return (
    <section id="agent-hero" className="agents-hero" style={style}>
      <div className="agents-hero__glow" />

      <div className="agents-hero__header">
        <div className="agents-hero__eyebrow">
          <span className="agents-hero__live-dot" />
          AGENTE ACTIVO
        </div>
        <div className="agents-hero__level">LVL {agent.level}</div>
      </div>

      <div className="agents-hero__main">
        <div className="agents-hero__portrait">
          <span>{agent.icon}</span>
          <div className="agents-hero__portrait-status" />
        </div>

        <div className="agents-hero__identity">
          <div className="agents-hero__name-row">
            <h1>{agent.name}</h1>
            <span className="agents-hero__badge">{agent.rarity}</span>
          </div>
          <div className="agents-hero__role">{agent.role}</div>
          <p>{agent.description}</p>
          <div className="agents-hero__chips">
            {agent.capabilities.slice(0, 4).map((c) => (
              <span key={c}>{c}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="agents-hero__stats">
        <div>
          <span>TAREAS</span>
          <strong>{agent.id === "laia" ? "1,248" : "892"}</strong>
        </div>
        <div>
          <span>PRECISIÓN</span>
          <strong>{agent.id === "laia" ? "99.8%" : "96.4%"}</strong>
        </div>
        <div>
          <span>TIEMPO MEDIO</span>
          <strong>{agent.id === "laia" ? "8s" : "12s"}</strong>
        </div>
        <div>
          <span>UPTIME</span>
          <strong>99.9%</strong>
        </div>
      </div>

      <div className="agents-hero__actions">
        <button type="button" className="agents-button agents-button--primary" onClick={onOpen}>
          <MessageSquare size={16} />
          Hablar con {agent.name}
        </button>
        <button type="button" className="agents-button">
          <Activity size={16} />
          Ver logs
        </button>
        <button type="button" className="agents-button">
          <Settings size={16} />
          Configurar
        </button>
      </div>
    </section>
  );
}