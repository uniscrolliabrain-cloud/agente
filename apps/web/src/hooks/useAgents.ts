import { useCallback, useEffect, useRef, useState } from "react";
import { createAgent as apiCreateAgent, listAgents, type AgentRole } from "../api/agents";

/** Roles de agente del usuario. El alta es la unica operacion: el backend no expone borrado. */
export function useAgents(enabled: boolean) {
  const [agents, setAgents] = useState<AgentRole[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    try {
      const list = await listAgents();
      if (!mountedRef.current) return;
      setAgents(list);
      setError(null);
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err instanceof Error ? err.message : "Error cargando los agentes");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const create = useCallback(async (input: Omit<AgentRole, "active"> & { active: boolean }) => {
    const created = await apiCreateAgent(input);
    if (mountedRef.current) setAgents((current) => [...current, created]);
    return created;
  }, []);

  return { agents, error, loading, refresh, create };
}
