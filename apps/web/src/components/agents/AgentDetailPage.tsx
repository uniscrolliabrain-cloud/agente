// AGENT_DETAIL_PAGE_V1 - pagina individual por agente.
import { useMemo } from "react";
import { useAgentNode } from "../../hooks/useAgentNode";
import { useAgentPersonas } from "../../hooks/useAgentPersonas";
import AgentActivityFeed from "./AgentActivityFeed";
import AgentAttentionPanel from "./AgentAttentionPanel";
import AgentHeroV2 from "./AgentHeroV2";
import AgentKnowledgeCard from "./AgentKnowledgeCard";
import AgentStatsGrid from "./AgentStatsGrid";
import { fmtTime, personaToAgentUI } from "./types";
import "./agents.css";

interface Props {
  personaId: string;
  enabled: boolean;
  onBack: () => void;
}

export default function AgentDetailPage({ personaId, enabled, onBack }: Props) {
  const { personas, loading, error, lastUpdatedAt } = useAgentPersonas(enabled);
  const persona = useMemo(
    () => personas.find((p) => p.personaId === personaId),
    [personas, personaId],
  );
  const { node, attention, activity, loading: nodeLoading } = useAgentNode(personaId, enabled);
  const agent = useMemo(() => (persona ? personaToAgentUI(persona) : null), [persona]);

  if (!enabled) return null;
  if (loading && !agent) {
    return (
      <div className="agents-page">
        <div className="agents-page__inner">Cargando agente…</div>
      </div>
    );
  }
  if (!agent) {
    return (
      <div className="agents-page">
        <div className="agents-page__inner">
          <button type="button" className="btn" onClick={onBack}>← Volver</button>
          <p>{error ?? `Agente no encontrado: ${personaId}`}</p>
        </div>
      </div>
    );
  }

  const knowledge = (node?.memory ?? []).slice(0, 6).map((m) => ({ id: m.id, text: m.text }));
  const contextLine = lastUpdatedAt
    ? `Sincronizado ${fmtTime(lastUpdatedAt)} · ${agent.name}`
    : agent.name;

  return (
    <div className="agents-page">
      <div className="agents-page__inner">
        <button type="button" className="btn" onClick={onBack}>← Volver a agentes</button>
        {error && <div className="agents-page__error">{error}</div>}
        <AgentHeroV2 agent={agent} onTalk={() => {}} onLogs={() => {}} onConfig={() => {}} />
        <AgentStatsGrid agent={agent} />
        <div className="agents-grid-2">
          <AgentKnowledgeCard items={knowledge} contextLine={contextLine} />
          <div id="agents-activity">
            <AgentActivityFeed entries={activity} loading={nodeLoading} agentName={agent.name} />
          </div>
        </div>
        <AgentAttentionPanel attention={attention} />
      </div>
    </div>
  );
}
