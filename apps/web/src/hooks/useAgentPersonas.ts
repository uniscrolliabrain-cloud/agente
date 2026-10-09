// USE_AGENT_PERSONAS_V1 - lista de personas + nodos, refresco cada 8s.
import { useCallback, useEffect, useRef, useState } from "react";
import {
  EMPTY_NODES,
  isAbortError,
  listAgentPersonas,
  listAllAgentNodes,
  type AgentNode,
  type AgentPersonaDTO,
} from "../api/agentPersonas";

export interface AgentPersonaView extends AgentPersonaDTO {
  node?: AgentNode;
}

export interface UseAgentPersonasResult {
  personas: AgentPersonaView[];
  laia?: AgentPersonaView;
  squad: AgentPersonaView[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  lastUpdatedAt: string | null;
}

export function useAgentPersonas(enabled: boolean, intervalMs = 8000): UseAgentPersonasResult {
  const [personas, setPersonas] = useState<AgentPersonaView[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const refresh = useCallback(async () => {
    if (!enabled || document.hidden) return;
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);
    try {
      const [list, nodes] = await Promise.all([
        listAgentPersonas(ctrl.signal),
        listAllAgentNodes(ctrl.signal).catch((e: unknown) => {
          if (isAbortError(e)) throw e;
          return EMPTY_NODES;
        }),
      ]);
      if (ctrl.signal.aborted) return;
      const nodeMap = new Map(nodes.nodes.map((n) => [n.personaId, n]));
      setPersonas(list.personas.map((p) => ({ ...p, node: nodeMap.get(p.personaId) })));
      setLastUpdatedAt(new Date().toISOString());
      setError(null);
    } catch (err) {
      if (ctrl.signal.aborted || isAbortError(err)) return;
      setError(err instanceof Error ? err.message : "Error cargando agentes");
    } finally {
      if (!ctrl.signal.aborted) setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    void refresh();
    const onVis = () => { if (!document.hidden) void refresh(); };
    document.addEventListener("visibilitychange", onVis);
    const timer = window.setInterval(() => void refresh(), intervalMs);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVis);
      abortRef.current?.abort();
    };
  }, [enabled, intervalMs, refresh]);

  const laia = personas.find((p) => p.personaId === "laia");
  const squad = personas.filter((p) => p.personaId !== "laia");

  return { personas, laia, squad, loading, error, refresh, lastUpdatedAt };
}