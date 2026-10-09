import { Maximize2, Minus, X } from "lucide-react";
import { useRef, useState, type PointerEvent as RPointerEvent } from "react";
import type { AgentNode } from "../../../api/agentPersonas";
import { fmtDuration, fmtPct, thoughtText, type AgentUI } from "../types";

type Tab = "perfil" | "runtime" | "squad" | "memoria";
const TABS: Array<[Tab, string]> = [
  ["perfil", "Perfil"], ["runtime", "Runtime"], ["squad", "Squad"], ["memoria", "Memoria"],
];

interface Props {
  agent: AgentUI;
  node: AgentNode | null;
  maximized: boolean;
  position: { x: number; y: number };
  zIndex: number;
  onMinimize: () => void;
  onMaximize: () => void;
  onClose: () => void;
  onMove: (p: { x: number; y: number }) => void;
  onFocus: () => void;
}

export default function LaiaFloatingWindow({
  agent, node, maximized, position, zIndex,
  onMinimize, onMaximize, onClose, onMove, onFocus,
}: Props) {
  const [tab, setTab] = useState<Tab>("perfil");
  const drag = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null);

  const onDown = (e: RPointerEvent<HTMLDivElement>) => {
    onFocus();
    if (maximized || (e.target as HTMLElement).closest("button")) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { sx: e.clientX, sy: e.clientY, ox: position.x, oy: position.y };
  };
  const onMoveEv = (e: RPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    onMove({
      x: Math.max(0, d.ox + e.clientX - d.sx),
      y: Math.max(0, d.oy + e.clientY - d.sy),
    });
  };
  const onUp = (e: RPointerEvent<HTMLDivElement>) => {
    drag.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const recent = node?.thoughts.slice(-3).reverse() ?? [];

  return (
    <aside
      className={`laia-window${maximized ? " laia-window--max" : ""}`}
      style={maximized ? { zIndex } : { zIndex, transform: `translate(${position.x}px, ${position.y}px)` }}
      onPointerDown={onFocus}
      role="dialog"
      aria-label={`${agent.name} — ventana`}
    >
      <div
        className="laia-window__bar"
        onPointerDown={onDown}
        onPointerMove={onMoveEv}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        <strong>{agent.name} · {agent.archetype}</strong>
        <span className="laia-window__lvl">LVL {agent.level}</span>
        <button type="button" onClick={onMinimize} aria-label="Minimizar"><Minus size={13} /></button>
        <button type="button" onClick={onMaximize} aria-label="Maximizar"><Maximize2 size={13} /></button>
        <button type="button" onClick={onClose} aria-label="Cerrar"><X size={13} /></button>
      </div>

      <div className="laia-window__stats">
        <div><span>PRECISIÓN</span><strong>{fmtPct(agent.precision)}</strong></div>
        <div><span>HP</span><strong>{agent.hp}%</strong></div>
        <div><span>TAREAS</span><strong>{agent.tasks.toLocaleString("es-ES")}</strong></div>
      </div>

      <nav className="laia-window__tabs">
        {TABS.map(([id, label]) => (
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

      <div className="laia-window__body">
        {tab === "perfil" && (
          <>
            {agent.description && <p>{agent.description}</p>}
            <div className="agents-hero__chips">
              {agent.capabilities.map((c) => <span key={c}>{c}</span>)}
            </div>
            <h4>Mensajes recientes</h4>
            {recent.length === 0 ? (
              <p className="laia-window__muted">Sin mensajes</p>
            ) : (
              recent.map((t) => (
                <div key={t.id} className="laia-window__msg">{thoughtText(t.content).slice(0, 160)}</div>
              ))
            )}
          </>
        )}
        {tab === "runtime" && (
          <ul className="laia-window__list">
            <li>Estado: {agent.status}</li>
            <li>Uptime: {fmtPct(agent.uptime)}</li>
            <li>Tiempo medio: {fmtDuration(agent.avgTimeMs)}</li>
            <li>Tarea actual: {agent.currentTask ?? "—"}</li>
          </ul>
        )}
        {tab === "squad" && (
          <ul className="laia-window__list">
            <li>Reporta a: {agent.reportsTo ?? "—"}</li>
            <li>Peers: {agent.peers.length ? agent.peers.join(", ") : "—"}</li>
          </ul>
        )}
        {tab === "memoria" &&
          (node?.memory.length ? (
            <ul className="laia-window__list">
              {node.memory.slice(0, 10).map((m) => <li key={m.id}>{m.text}</li>)}
            </ul>
          ) : (
            <p className="laia-window__muted">Sin memoria</p>
          ))}
      </div>

      <footer className="laia-window__foot">
        <span className={`agent-status agent-status--${agent.status}`}><i />{agent.name} está {agent.status}</span>
      </footer>
    </aside>
  );
}
