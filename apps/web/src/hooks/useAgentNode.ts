// USE_AGENT_NODE_V1 - node + activity de una persona, refresco cada 10s.
import { useCallback, useEffect, useRef, useState } from "react";
import {
  getAgentActivity,
  getAgentAttention,
  getAgentNode,
  isAbortError,
  type AgentActivityEntry,
  type AgentAttention,
  type AgentNode,
} from "../api/agentPersonas";

export function useAgentNode(personaId: string | null, enabled: boolean, intervalMs = 10000) {
  const [node, setNode] = useState<AgentNode | null>(null);
  const [attention, setAttention] = useState<AgentAttention | null>(null);
  const [activity, setActivity] = useState<AgentActivityEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setNode(null);
    setAttention(null);
    setActivity([]);
    setError(null);
  }, [personaId]);

  const refresh = useCallback(async () => {
    if (!enabled || !personaId || document.hidden) return;
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);
    try {
      const [n, a, act] = await Promise.all([
        getAgentNode(personaId, ctrl.signal),
        getAgentAttention(personaId, ctrl.signal).catch(() => null),
        getAgentActivity(personaId, 20, ctrl.signal).catch(() => null),
      ]);
      if (ctrl.signal.aborted) return;
      setNode(n);
      setAttention(a);
      setActivity(act?.activity ?? []);
      setError(null);
    } catch (err) {
      if (ctrl.signal.aborted || isAbortError(err)) return;
      setError(err instanceof Error ? err.message : "Error cargando agente");
    } finally {
      if (!ctrl.signal.aborted) setLoading(false);
    }
  }, [enabled, personaId]);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => void refresh(), intervalMs);
    return () => {
      window.clearInterval(timer);
      abortRef.current?.abort();
    };
  }, [refresh, intervalMs]);

  return { node, attention, activity, loading, error, refresh };
}