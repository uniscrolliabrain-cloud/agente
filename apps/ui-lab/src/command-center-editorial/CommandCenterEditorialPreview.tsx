// Vista de laboratorio del Centro de Mando editorial.
//
// Carga los mismos datos que producción a través del cliente real
// (`getCompanyOverview`). En UI Lab y en el artifact estático responde el router
// demo del navegador (tenant Interfaz), así que no hay red ni backend: las altas
// de persona/agente se ejecutan contra ese mismo router y la vista se refresca.
import { useCallback, useEffect, useState } from "react";
import { getCompanyOverview, type CompanyOverview } from "../../../web/src/api/company";
import { isDemoSession } from "../../../web/src/api/client";
import { CommandCenterEditorial } from "./CommandCenterEditorial";

const LAB_STATES = new Set(["loading", "error", "empty"]);

/** Fixture de laboratorio para la empresa recién compilada (sin actividad). */
const EMPTY_OVERVIEW: CompanyOverview = {
  tenant: { id: "interfaz", name: "Interfaz" },
  role: "owner",
  canManageMembers: true,
  members: [],
  agents: [],
  tasks: { total: 0, running: 0, waiting: 0, succeeded: 0, failed: 0, recent: [] },
};

export default function CommandCenterEditorialPreview() {
  const [overview, setOverview] = useState<CompanyOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [, setTick] = useState(0);
  const labState = new URLSearchParams(location.search).get("cce-state");

  const load = useCallback(async (background = false): Promise<void> => {
    if (background) setRefreshing(true);
    else setLoading(true);
    try {
      setOverview(await getCompanyOverview());
      setUpdatedAt(new Date().toISOString());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar la empresa");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    // Arnés de QA: `?cce-state=loading|error|empty` pinta estados no ideales sin
    // tocar datos ni backend. No es comportamiento de producto.
    if (labState && LAB_STATES.has(labState)) {
      if (labState === "loading") setLoading(true);
      if (labState === "error") {
        setLoading(false);
        setError("No se pudo cargar la empresa");
      }
      if (labState === "empty") {
        setLoading(false);
        setOverview(EMPTY_OVERVIEW);
        setUpdatedAt(new Date().toISOString());
      }
      return;
    }
    void load();
    const poll = window.setInterval(() => void load(true), 30000);
    const tick = window.setInterval(() => setTick((n) => n + 1), 15000);
    return () => {
      window.clearInterval(poll);
      window.clearInterval(tick);
    };
  }, [load, labState]);

  return (
    <CommandCenterEditorial
      overview={overview}
      loading={loading}
      refreshing={refreshing}
      error={error}
      updatedAt={updatedAt}
      // El arnés `empty` simula una empresa real sin actividad: sin sesión demo cambia
      // el copy del aviso («Todavía no hay actividad…») sin tocar datos ni backend.
      demoSession={labState === "empty" ? false : isDemoSession()}
      onRefresh={() => void load(true)}
      onReload={() => load(true)}
      labNavigation
    />
  );
}
