// AGENTS_PAGE_V1 - entry point del frente Agentes.
// Compone: hero + perfil + squad + activity log + command bar.
// Y abre la ventana flotante cuando se selecciona Laia.
//
// Desde el chat del homepage se puede invocar "llama a Laia" para traer la
// ventana. Eso se conectará al useChat en una fase posterior. Por ahora el
// input del command bar ya lo detecta.

import { useCallback, useMemo, useState } from "react";
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

  const [windowOpen, setWindowOpen] = useState(true);
  const [windowMinimized, setWindowMinimized] = useState(false);
  const [windowMaximized, setWindowMaximized] = useState(false);
  const [windowPosition, setWindowPosition] = useState({ x: 22, y: 180 });
  const [zIndex, setZIndex] = useState(100);

  const selectedAgent = useMemo(
    () => AGENTS.find((a) => a.id === selected) ?? AGENTS[1],
    [selected],
  );

  const laia = useMemo(() => AGENTS.find((a) => a.id === "laia")!, []);

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
            <span className="agents-page__eyebrow">WORKSPACE · AGENTES</span>
            <h1>Agentes</h1>
            <p>
              Tu equipo de IA operativo. Activo 24/7 — orquesta tareas, memoria y ejecución.
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