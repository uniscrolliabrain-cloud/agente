// AGENTS_PAGE_V1 - entry point del frente Agentes.
// Compone: hero + perfil + squad + activity log + command bar.
// Y abre la ventana flotante cuando se selecciona Laia.
//
// Desde el chat del homepage se puede invocar "llama a Laia" para traer la
// ventana. Eso se conectarÃƒÂ¡ al useChat en una fase posterior. Por ahora el
// input del command bar ya lo detecta.

// AGENTS_PAGE_FETCH_V1 - lee personas reales del backend.
import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../api/client";
import { toAgentUI, type AgentUI } from "./types";
import { Plus, Search } from "lucide-react";
import { AGENTS, type AgentId } from "./types";
import AgentHero from "./AgentHero";
import AgentProfile from "./AgentProfile";
import AgentSquad from "./AgentSquad";
import AgentActivityLog from "./AgentActivityLog";
import AgentCommandBar from "./AgentCommandBar";
import LaiaFloatingWindow from "./floating/LaiaFloatingWindow";
import AgentDockLauncher from "./floating/AgentDockLauncher";

export default function AgentsPage() {
  const [selected, setSelected] = useState<AgentId>("laia");
  // AGENTS_PAGE_FETCH_V1 - estado de personas reales.
  const [remoteAgents, setRemoteAgents] = useState<AgentUI[] | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await apiFetch<{ personas: Array<{ personaId: string; displayName: string; role: string; archetype: string; stats: unknown; avatar: unknown; reportsTo: string | null; peers: string[] }> }>("/api/agent-personas");
        if (cancelled) return;
        const mapped = res.personas.map((p) => toAgentUI(
          {
            id: p.personaId,
            displayName: p.displayName,
            role: p.role,
            personality: { traits: [], tone: p.archetype, quirks: [] },
            capabilities: { domains: [], scope: "" },
            ...(p.reportsTo ? { reportsTo: p.reportsTo } : {}),
          },
          p.stats as never,
          "#7C5CFC",
          "#EDE8FF",
        ));
        setRemoteAgents(mapped);
      } catch (err) {
        if (cancelled) return;
        setFetchError(err instanceof Error ? err.message : "Error cargando agentes");
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const realAgents = remoteAgents ?? AGENTS;

  const [windowOpen, setWindowOpen] = useState(true);
  const [windowMinimized, setWindowMinimized] = useState(false);
  const [windowMaximized, setWindowMaximized] = useState(false);
  const [windowPosition, setWindowPosition] = useState({ x: 22, y: 180 });
  const [zIndex, setZIndex] = useState(100);

  // AGENTS_PAGE_USE_REAL_V1 - usa realAgents en vez de AGENTS mock.
  const selectedAgent = useMemo(
    () => realAgents.find((a) => a.id === selected) ?? realAgents[1] ?? AGENTS[1],
    [selected, realAgents],
  );

  const laia = useMemo(
    () => realAgents.find((a) => a.id === "laia") ?? AGENTS.find((a) => a.id === "laia")!,
    [realAgents],
  );

  const openLaia = useCallback(() => {
    setSelected("laia");
    setWindowOpen(true);
    setWindowMinimized(false);
    setWindowMaximized(false);
    setWindowPosition({ x: 24, y: 120 });
    setZIndex((v) => v + 1);
  }, []);

  const openAgent = useCallback(
    (id: AgentId) => {
      setSelected(id);
      if (id === "laia") {
        setWindowOpen(true);
        setWindowMinimized(false);
        setWindowMaximized(false);
        setWindowPosition({ x: 24, y: 120 });
        setZIndex((v) => v + 1);
      }
    },
    [],
  );

  const closeWindow = () => {
    setWindowOpen(false);
    setWindowMinimized(false);
  };

  const minimizeWindow = () => {
    setWindowMinimized(true);
  };

  const maximizeWindow = () => {
    setWindowMaximized((v) => !v);
  };

  const showDock = !windowOpen || windowMinimized;

  return (
    <div className="agents-page">
      <div className="agents-page__inner">
        <div className="agents-page__top">
          <div>
            <span className="agents-page__eyebrow">WORKSPACE Ã‚Â· AGENTES</span>
            <h1>Agentes</h1>
            <p>
              Tu equipo de IA operativo. Activo 24/7 Ã¢â‚¬â€ orquesta tareas, memoria y ejecuciÃƒÂ³n.
            </p>
          </div>

          <div className="agents-page__actions">
            <button type="button" className="agents-button">
              <Search size={16} />
              Buscar
            </button>
            <button type="button" className="agents-button agents-button--dark">
              <Plus size={16} />
              Crear nuevo agente
            </button>
          </div>
        </div>

        <AgentHero
          agent={selectedAgent}
          onOpen={() => {
            if (selected === "laia") openLaia();
          }}
        />

        <AgentProfile agent={selectedAgent} />

        <AgentSquad selected={selected} onSelect={openAgent} />

        <AgentActivityLog />

        <AgentCommandBar onOpenLaia={openLaia} />
      </div>

      {windowOpen && !windowMinimized && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            pointerEvents: "none",
            zIndex,
          }}
        >
          <div style={{ pointerEvents: "auto" }}>
            <LaiaFloatingWindow
              agent={laia}
              minimized={windowMinimized}
              maximized={windowMaximized}
              position={windowPosition}
              onMinimize={minimizeWindow}
              onMaximize={maximizeWindow}
              onClose={closeWindow}
              onMove={setWindowPosition}
              onFocus={() => setZIndex((v) => v + 1)}
            />
          </div>
        </div>
      )}

      {showDock && (
        <AgentDockLauncher
          agentName={laia.name}
          role={laia.role}
          icon={laia.icon}
          onOpen={openLaia}
        />
      )}
    </div>
  );
}