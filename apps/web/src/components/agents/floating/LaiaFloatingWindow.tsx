// LAIA_FLOATING_WINDOW_V1 - ventana flotante desacoplada por agente.
// NO es un modal. NO overlay. Se superpone al workspace.
// Draggable por el chrome con PointerEvents.
// Traffic lights: cerrar (rojo), minimizar (amarillo), maximizar (verde).
// Minimizar o cerrar -> dock inferior izquierdo (gestionado por el padre).

import { useRef, useState } from "react";
import { useReducedMotion } from "../../../hooks/useReducedMotion";
import { RUNTIME_LOGS, AGENTS, type AgentUI, statusColor } from "../types";

type PopupTab = "perfil" | "runtime" | "squad" | "memoria";

interface Props {
  agent: AgentUI;
  minimized: boolean;
  maximized: boolean;
  position: { x: number; y: number };
  onMinimize: () => void;
  onMaximize: () => void;
  onClose: () => void;
  onMove: (position: { x: number; y: number }) => void;
  onFocus: () => void;
}

export default function LaiaFloatingWindow({
  agent,
  minimized,
  maximized,
  position,
  onMinimize,
  onMaximize,
  onClose,
  onMove,
  onFocus,
}: Props) {
  const reducedMotion = useReducedMotion();
  const [tab, setTab] = useState<PopupTab>("perfil");
  const [input, setInput] = useState("");

  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const startPosition = useRef({ x: 0, y: 0 });

  const handlePointerDown = (event: React.PointerEvent<HTMLElement>) => {
    if (maximized) return;
    dragging.current = true;
    dragStart.current = { x: event.clientX, y: event.clientY };
    startPosition.current = { ...position };
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    onFocus();
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    if (!dragging.current) return;
    const dx = event.clientX - dragStart.current.x;
    const dy = event.clientY - dragStart.current.y;
    onMove({ x: startPosition.current.x + dx, y: startPosition.current.y + dy });
  };

  const handlePointerUp = () => {
    dragging.current = false;
  };

  const className = [
    "laia-window",
    maximized ? "laia-window--maximized" : "",
    minimized ? "laia-window--hidden" : "",
    reducedMotion ? "laia-window--reduced-motion" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const style = maximized ? undefined : { left: position.x, top: position.y };

  const otherAgents = AGENTS.filter((a) => a.id !== "laia" && a.id !== "openmuse");

  return (
    <div className={className} style={style} onPointerDown={onFocus} role="dialog" aria-label={`Ventana de ${agent.name}`}>
      <header
        className="laia-window__chrome"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div className="laia-window__traffic">
          <button
            type="button"
            className="laia-window__traffic-dot laia-window__traffic-dot--red"
            onClick={onClose}
            aria-label="Cerrar"
          />
          <button
            type="button"
            className="laia-window__traffic-dot laia-window__traffic-dot--yellow"
            onClick={onMinimize}
            aria-label="Minimizar"
          />
          <button
            type="button"
            className="laia-window__traffic-dot laia-window__traffic-dot--green"
            onClick={onMaximize}
            aria-label="Maximizar"
          />
        </div>

        <div className="laia-window__title">
          <span>{agent.name.toUpperCase()}.exe</span>
          <small>— {agent.role}</small>
        </div>

        <div className="laia-window__lvl">LVL {agent.level}</div>
      </header>

      <div className="laia-window__identity">
        <div
          className="laia-window__avatar"
          style={{ background: "linear-gradient(135deg,#7C5CFC,#E34BAE)" }}
        >
          {agent.icon}
        </div>
        <div>
          <div className="laia-window__name">
            {agent.name.toUpperCase()}
            <span>{agent.role.toUpperCase()}</span>
          </div>
          <p>{agent.description}</p>
        </div>
      </div>

      <div className="laia-window__stats">
        <div>
          <span>RUNTIME</span>
          <strong>99.98%</strong>
          <div className="laia-window__bar">
            <i style={{ width: "99.98%" }} />
          </div>
        </div>
        <div>
          <span>HP</span>
          <strong>{agent.hp}%</strong>
          <div className="laia-window__bar laia-window__bar--green">
            <i style={{ width: `${agent.hp}%` }} />
          </div>
        </div>
        <div>
          <span>QUEUE</span>
          <strong>12 tareas</strong>
          <small>0 bloqueos</small>
        </div>
      </div>

      <nav className="laia-window__tabs">
        {(
          [
            ["perfil", "Perfil"],
            ["runtime", "Runtime"],
            ["squad", "Squad"],
            ["memoria", "Memoria"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={tab === id ? "is-active" : ""}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </nav>

      <main className="laia-window__content">
        {tab === "perfil" && (
          <div className="laia-panel">
            <span className="laia-panel__label">PERSONALIDAD</span>
            <p>
              Cercana, resolutiva, guardiana. Habla claro, sin humo. Si algo falla, lo arreglo antes
              de que lo notes.
            </p>
            <div className="laia-panel__chips">
              {agent.capabilities.map((c) => (
                <span key={c}>{c}</span>
              ))}
            </div>
            <div className="laia-panel__divider" />
            <span className="laia-panel__label">OBJETIVO</span>
            <p>Que todo funcione y tú no tengas que vigilarlo.</p>
          </div>
        )}

        {tab === "runtime" && (
          <div className="laia-runtime">
            {RUNTIME_LOGS.map((log, i) => (
              <div className="laia-runtime__row" key={i}>
                <span>{log.time}</span>
                <i className={`laia-runtime__dot laia-runtime__dot--${log.type}`} />
                <p>{log.message}</p>
              </div>
            ))}
          </div>
        )}

        {tab === "squad" && (
          <div className="laia-squad">
            {otherAgents.map((a) => (
              <div className="laia-squad__member" key={a.id}>
                <div className="laia-squad__avatar" style={{ background: a.color }}>
                  {a.icon}
                </div>
                <div>
                  <strong>{a.name}</strong>
                  <span>{a.role}</span>
                </div>
                <i style={{ background: statusColor(a.status) }} />
              </div>
            ))}
          </div>
        )}

        {tab === "memoria" && (
          <div className="laia-panel">
            <span className="laia-panel__label">MEMORIA OPERATIVA</span>
            <div className="laia-memory">
              <div>
                <strong>12</strong>
                <span>embeddings activos</span>
              </div>
              <div>
                <strong>47</strong>
                <span>memorias de negocio</span>
              </div>
              <div>
                <strong>99.4%</strong>
                <span>sincronización</span>
              </div>
            </div>
            <p>
              Laia utiliza memoria de identidad, dominio, preferencias e historial.
            </p>
          </div>
        )}
      </main>

      <footer className="laia-window__chat">
        <div className="laia-window__chat-label">
          <span />
          {agent.name} está activa
        </div>
        <div className="laia-window__chat-row">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") setInput("");
            }}
            placeholder={`Habla con ${agent.name}...`}
          />
          <button type="button" onClick={() => setInput("")}>
            →
          </button>
        </div>
      </footer>
    </div>
  );
}