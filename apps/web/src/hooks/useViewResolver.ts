// VIEW_RESOLVER_HOOK_V2 - una peticion viva, respuesta correlacionada y
// envelope completo. Un intent sin vista no borra la vista actual.
import { useCallback, useRef, useState } from "react";
import type { ViewEnvelope } from "@agente/domain/view-envelope";
import { apiFetch } from "../api/client";

export interface ResolveViewOptions {
  workspaceId?: string;
  viewId?: string;
  entityId?: string;
  messageId?: string;
  threadId?: string;
}

export function useViewResolver() {
  const [view, setView] = useState<ViewEnvelope | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sequence = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  const resolve = useCallback(async (intent: string, options: ResolveViewOptions = {}) => {
    const requestId = ++sequence.current;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<{ view: ViewEnvelope | null }>("/api/views/resolve", {
        method: "POST",
        body: { intent, ...options },
        signal: controller.signal,
      });
      if (requestId !== sequence.current) return null;
      if (res.view) setView(res.view);
      return res.view;
    } catch (err) {
      if (controller.signal.aborted) return null;
      if (requestId === sequence.current) {
        setError(err instanceof Error ? err.message : "No se pudo resolver la vista");
      }
      return null;
    } finally {
      if (requestId === sequence.current) setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    sequence.current += 1;
    abortRef.current?.abort();
    abortRef.current = null;
    setView(null);
    setLoading(false);
    setError(null);
  }, []);

  return { view, spec: view?.spec ?? null, loading, error, resolve, clear };
}
