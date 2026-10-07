// AGENT_SQUAD_V1 - grid del squad activo con filtros.
import { Plus, Sparkles } from "lucide-react";
import AgentCard from "./AgentCard";
import { AGENTS, type AgentId, type AgentArchetype } from "./types";

interface Props {
  selected: AgentId;
  onSelect: (id: AgentId) => void;
}

const FILTERS: Array<{ id: "all" | AgentArchetype; label: string }> = [
  { id: "all", label: "Todos" },
  { id: "hunter", label: "Cazador" },
  { id: "guardian", label: "Guardián" },
  { id: "strategist", label: "Estratega" },
  { id: "architect", label: "Arquitecto" },
];

export default function AgentSquad({ selected, onSelect }: Props) {
  const withoutPrincipal = AGENTS.filter((a) => a.id !== "openmuse");

  return (
    <section className="agent-squad">
      <div className="agent-section-heading">
        <div>
          <span className="agent-section-heading__eyebrow">SQUAD ACTIVO</span>
          <h2>Equipo operativo</h2>
        </div>
        <span className="agent-section-count">{withoutPrincipal.length}/6 AGENTES</span>
      </div>

      <div className="agent-filters">
        {FILTERS.map((f) => (
          <button key={f.id} className={f.id === "all" ? "is-active" : ""}>
            {f.label}
          </button>
        ))}
      </div>

      <div className="agent-grid">
        {withoutPrincipal.map((agent, index) => (
          <AgentCard
            key={agent.id}
            agent={agent}
            index={index}
            selected={selected === agent.id}
            onClick={() => onSelect(agent.id)}
          />
        ))}

        <button className="agent-card agent-card--empty" type="button">
          <Plus size={22} />
          <strong>Invocar agente</strong>
          <span>Slot libre</span>
        </button>

        <button className="agent-card agent-card--empty" type="button">
          <Sparkles size={22} />
          <strong>Crear agente</strong>
          <span>Nuevo rol</span>
        </button>
      </div>
    </section>
  );
}