// AGENTS_PAGE_V1 - entry point del frente Agentes.
import { useCallback, useMemo, useState } from "react";
import { useAgentNode } from "../../hooks/useAgentNode";
import { useAgentPersonas } from "../../hooks/useAgentPersonas";
import { useAgentWindow } from "../../contexts/AgentWindowContext";
import { refreshAllStats } from "../../api/agentPersonas";
import AgentActivityFeed from "./AgentActivityFeed";
import AgentAttentionPanel from "./AgentAttentionPanel";
import AgentCommandBar from "./AgentCommandBar";
import AgentHeroV2 from "./AgentHeroV2";
import AgentKnowledgeCard from "./AgentKnowledgeCard";
import AgentSquad from "./AgentSquad";
import AgentStatsGrid from "./AgentStatsGrid";
import { fmtTime, personaToAgentUI } from "./types";
import "./agents.css";

interface Props {
  enabled: boolean;
  onOpenAgent?: (id: string) => void;
}

export default function AgentsPage({ enabled, onOpenAgent }: Props) {
  const { personas, laia, loading, error, refresh, lastUpdatedAt } = useAgentPersonas(enabled);
  const [requestedId, setRequestedId] = useState<string | null>("laia");
  const { open: openWindowGlobal } = useAgentWindow(); // FLOATING_WINDOW_PERSISTENT_V1

  const selected = useMemo(
    () => personas.find((p) => p.personaId === requestedId) ?? laia ?? personas[0],
    [personas, requestedId, laia],
  );
  const selectedId = selected?.personaId ?? null;
  const { node, attention, activity, loading: nodeLoading } = useAgentNode(selectedId, enabled);

  const agents = useMemo(() => personas.map(personaToAgentUI), [personas]);
  const selectedAgent = useMemo(() => (selected ? personaToAgentUI(selected) : null), [selected]);

  const openWindow = useCallback(() => {
    if (selectedAgent) openWindowGlobal(selectedAgent.id);
  }, [selectedAgent, openWindowGlobal]);

  const refreshStats = useCallback(async () => {
    try {
      await refreshAllStats();
      await refresh();
    } catch {
      // silencioso
    }
  }, [refresh]);

  const scrollToActivity = useCallback(
    () => document.getElementById("agents-activity")?.scrollIntoView({ behavior: "smooth" }),
    [],
  );

  if (!enabled) return null;
  if (!selectedAgent) {
    return (
      <div className="agents-page">
        <div className="agents-page__inner">
          {loading ? "Cargando agentes…" : error ?? "Sin agentes"}
        </div>
      </div>
    );
  }

  const knowledge = (node?.memory ?? []).slice(0, 6).map((m) => ({ id: m.id, text: m.text }));
  const contextLine = lastUpdatedAt
    ? `Sincronizado ${fmtTime(lastUpdatedAt)} · ${selectedAgent.name}`
    : selectedAgent.name;

  return (
    <div className="agents-page">
      <div className="agents-page__inner">
        {error && <div className="agents-page__error">{error}</div>}
        <AgentHeroV2 agent={selectedAgent} onTalk={openWindow} onLogs={scrollToActivity} onConfig={() => {}} />
        <AgentStatsGrid agent={selectedAgent} />
        <button type="button" className="btn" onClick={() => void refreshStats()}>Actualizar stats</button>
        <div className="agents-grid-2">
          <AgentKnowledgeCard items={knowledge} contextLine={contextLine} />
          <div id="agents-activity">
            <AgentActivityFeed entries={activity} loading={nodeLoading} agentName={selectedAgent.name} />
          </div>
        </div>
        <AgentAttentionPanel attention={attention} />
        <AgentSquad
          agents={agents}
          selectedId={selectedId}
          onSelect={(id) => {
            if (onOpenAgent) onOpenAgent(id); // AGENT_DETAIL_FROM_SQUAD_V1
            else setRequestedId(id);
          }}
        />
        <AgentCommandBar
          onOpenLaia={() => { setRequestedId("laia"); openWindow(); }}
          onStatus={scrollToActivity}
          onSync={() => void refresh()}
        />
      </div>
    </div>
  );
}
