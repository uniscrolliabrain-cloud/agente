// WS_HOOK_V1 - listado de workspaces disponible.
import { useEffect, useState } from "react";
import { listWorkspaces, type WorkspaceListEntry } from "../api/workspaces.ts";

export function useWorkspaces(enabled: boolean) {
  const [workspaces, setWorkspaces] = useState<WorkspaceListEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    setLoading(true);
    listWorkspaces()
      .then((list) => { if (!cancelled) { setWorkspaces(list); setError(null); } })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : "error"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [enabled]);

  return { workspaces, loading, error };
}
