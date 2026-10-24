// D3_USE_VIEW_RESOLVER_V1 - resuelve un intent contra el backend.
import { useCallback, useState } from "react";
import { apiFetch } from "../api/client";
import type { RuntimeViewSpec } from "@openmuse/domain/views"; // FIX_02_D

export function useViewResolver() {
  const [spec, setSpec] = useState<RuntimeViewSpec | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolve = useCallback(async (intent: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<{ spec: RuntimeViewSpec | null }>("/api/views/resolve", {
        method: "POST",
        body: { intent },
      });
      setSpec(res.spec);
      return res.spec;
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo resolver la vista");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => setSpec(null), []);

  return { spec, loading, error, resolve, clear };
}