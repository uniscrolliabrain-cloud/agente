// WORKSPACE_VIEW_HOOK_V1 - carga la definicion del workspace y ejecuta una de
// sus vistas declaradas. No usa el resolver del chat: la vista del workspace
// tiene su propio workspaceId y su propia query.
import { useEffect, useState } from "react";
import type { ViewEnvelope } from "@agente/domain/view-envelope";
import {
  getWorkspaceDetail,
  getWorkspaceView,
  type WorkspaceDetail,
} from "../api/workspaces";

export function useWorkspaceView(workspaceId: string | null, viewId: string | null) {
  const [detail, setDetail] = useState<WorkspaceDetail | null>(null);
  const [view, setView] = useState<ViewEnvelope | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!workspaceId) {
      setDetail(null);
      setView(null);
      setError(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    void (async () => {
      try {
        const nextDetail = await getWorkspaceDetail(workspaceId);
        if (cancelled) return;
        setDetail(nextDetail);
        const target = viewId ?? nextDetail.viewDefinitions[0]?.id;
        if (!target) {
          setView(null);
          return;
        }
        const nextView = await getWorkspaceView(workspaceId, target);
        if (!cancelled) setView(nextView);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "No se pudo cargar el workspace");
          setView(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [workspaceId, viewId]);

  return { detail, view, loading, error };
}
