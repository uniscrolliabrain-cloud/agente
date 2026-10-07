// AGENT_PROFILE_V1 - panel de perfil debajo del hero.
import { Bot, Cpu, Sparkles, Users } from "lucide-react";
import { AGENTS, type AgentUI } from "./types";

interface Props {
  agent: AgentUI;
}

export default function AgentProfile({ agent }: Props) {
  const reportsToName = agent.reportsTo
    ? AGENTS.find((a) => a.id === agent.reportsTo)?.name
    : "Sistema principal";

  return (
    <section className="agent-profile">
      <div className="agent-profile__heading">
        <div>
          <span className="agent-profile__eyebrow">LO QUE SABE DE TU NEGOCIO</span>
          <h2>Conoce a {agent.name}</h2>
        </div>
        <Sparkles size={20} />
      </div>

      <div className="agent-profile__grid">
        <article>
          <div className="agent-profile__icon">
            <Bot size={18} />
          </div>
          <span>PERSONALIDAD</span>
          <p>{agent.personality.join(" · ")}</p>
        </article>

        <article>
          <div className="agent-profile__icon">
            <Cpu size={18} />
          </div>
          <span>CAPACIDADES</span>
          <p>{agent.capabilities.join(" · ")}</p>
        </article>

        <article>
          <div className="agent-profile__icon">
            <Users size={18} />
          </div>
          <span>REPORTA A</span>
          <p>{reportsToName ?? "Sistema principal"}</p>
        </article>
      </div>
    </section>
  );
}