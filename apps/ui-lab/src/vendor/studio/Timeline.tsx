import {
  ChevronDown,
  ChevronRight,
  Clock3,
  Database,
  Flag,
  GitBranch,
  Layers3,
  Pause,
  Play,
  RotateCcw,
  Users,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useState, type Dispatch, type ReactNode } from "react";
import {
  DAY_END,
  DAY_START,
  PRESENT,
  actors,
  projects,
  position,
  packIntervals,
  selectionActivities,
  timeLabel,
  type Action,
  type Selection,
  type StudioState,
} from "./model";
import { Avatar } from "./Visualizer";

interface Block {
  id: string;
  label: string;
  start: number;
  end: number;
  selection: Selection;
  tone: string;
}
export default function Timeline({ state, dispatch }: { state: StudioState; dispatch: Dispatch<Action> }) {
  const [collapsed, setCollapsed] = useState<string[]>([]);
  const [zoom, setZoom] = useState(false);
  const selected = selectionActivities(state).map((a) => a.id);
  const toggle = (name: string) =>
    setCollapsed((value) => (value.includes(name) ? value.filter((v) => v !== name) : [...value, name]));
  const block = (b: Block, track: number) => (
    <button
      key={b.id}
      className="bcs-time-block"
      data-tone={b.tone}
      data-selected={
        state.selection.kind !== "company" &&
        (state.selection.id === b.selection.id ||
          (b.selection.kind === "activity" && selected.includes(b.selection.id)))
      }
      style={{
        left: `${position(b.start)}%`,
        width: `${((b.end - b.start) / (DAY_END - DAY_START)) * 100}%`,
        top: 5 + track * 30,
      }}
      onClick={() => dispatch({ type: "select", selection: b.selection })}
      title={`${b.label} · ${timeLabel(b.start)}–${timeLabel(b.end)}`}
      aria-label={`${b.label}, ${timeLabel(b.start)} a ${timeLabel(b.end)}`}
    >
      <span>{b.label}</span>
    </button>
  );
  const lane = (id: string, label: ReactNode, blocks: Block[]) => {
    const packed = packIntervals(blocks);
    return (
      <div className="bcs-time-row" key={id} style={{ height: Math.max(36, packed.tracks * 30 + 4) }}>
        <div className="bcs-lane-label">{label}</div>
        <div className="bcs-lane-track">{packed.blocks.map(({ item, track }) => block(item, track))}</div>
      </div>
    );
  };
  const group = (name: string, icon: ReactNode, content: ReactNode) => (
    <div className="bcs-time-group" key={name}>
      <button className="bcs-group-toggle" aria-expanded={!collapsed.includes(name)} onClick={() => toggle(name)}>
        {collapsed.includes(name) ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
        {icon}
        <span>{name}</span>
      </button>
      {!collapsed.includes(name) && content}
    </div>
  );
  const activityBlock = (id: string, tone: string): Block | undefined => {
    const a = state.activities.find((item) => item.id === id);
    return (
      a && { id: a.id, label: a.title, start: a.start, end: a.end, selection: { kind: "activity", id: a.id }, tone }
    );
  };
  const blocksFor = (ids: string[], tone: string) =>
    ids.map((id) => activityBlock(id, tone)).filter((b): b is Block => !!b);
  return (
    <section className="bcs-timeline bcs-panel" aria-label="Timeline multicapa">
      <header className="bcs-timeline-header">
        <div>
          <span className="bcs-eyebrow">EL TIEMPO, EN CONTEXTO</span>
          <h2>La jornada, conectada.</h2>
        </div>
        <div className="bcs-timeline-actions">
          <span className="bcs-badge bcs-clock-label">
            {timeLabel(state.clock)}{" "}
            <span>· {state.clock < PRESENT ? "Pasado" : state.clock > PRESENT ? "Previsto" : "Presente"}</span>
          </span>
          <button className="bcs-button" onClick={() => dispatch({ type: "present" })}>
            <RotateCcw size={14} />
            <span>Volver a ahora</span>
          </button>
          <button
            className="bcs-icon-button"
            aria-label={zoom ? "Reducir timeline" : "Ampliar timeline"}
            onClick={() => setZoom((v) => !v)}
          >
            {zoom ? <ZoomOut size={17} /> : <ZoomIn size={17} />}
          </button>
        </div>
      </header>
      <div
        className="bcs-time-scroll"
        tabIndex={0}
        aria-label="Pistas de la jornada; desplazamiento horizontal disponible"
      >
        <div className="bcs-time-canvas" style={{ minWidth: zoom ? 1500 : 840 }}>
          <div className="bcs-time-ruler">
            <span>Dom, 22 nov · Demo</span>
            <div
              onClick={(event) => {
                const rect = event.currentTarget.getBoundingClientRect();
                dispatch({
                  type: "clock",
                  clock: Math.round(DAY_START + ((event.clientX - rect.left) / rect.width) * (DAY_END - DAY_START)),
                });
              }}
            >
              {Array.from({ length: 11 }, (_, i) => (
                <span key={i} style={{ left: `${i * 10}%` }}>
                  {timeLabel(DAY_START + i * 60)}
                </span>
              ))}
            </div>
          </div>
          <div className="bcs-tracks">
            {group(
              "Personas y agentes",
              <Users size={14} />,
              actors.map((actor) =>
                lane(
                  actor.id,
                  <button onClick={() => dispatch({ type: "select", selection: { kind: "actor", id: actor.id } })}>
                    <Avatar actor={actor} small />
                    <strong>{actor.name}</strong>
                    <small>{actor.kind}</small>
                  </button>,
                  state.activities
                    .filter((a) => a.actor === actor.id)
                    .map((a) => ({
                      id: a.id,
                      label: a.title,
                      start: a.start,
                      end: a.end,
                      selection: { kind: "activity", id: a.id },
                      tone: actor.kind === "Agente" ? "violet" : actor.kind === "Humano" ? "sage" : "sand",
                    })),
                ),
              ),
            )}
            {group(
              "Procesos de negocio",
              <GitBranch size={14} />,
              lane(
                "process",
                "Captación · Entrega",
                blocksFor(["demo-brief-bruma", "demo-ontology-bruma", "demo-caliza-proposal", "demo-caliza-approval"], "neutral"),
              ),
            )}
            {group(
              "Proyectos y clientes",
              <Layers3 size={14} />,
              projects.map((project) => {
                const activities = state.activities.filter((a) => a.project === project.id);
                return lane(
                  project.id,
                  <button onClick={() => dispatch({ type: "select", selection: { kind: "project", id: project.id } })}>
                    {project.name}
                  </button>,
                  activities.length
                    ? [
                        {
                          id: project.id,
                          label: `${project.name} · ${project.client}`,
                          start: Math.min(...activities.map((a) => a.start)),
                          end: Math.max(...activities.map((a) => a.end)),
                          selection: { kind: "project", id: project.id },
                          tone: "violet",
                        },
                      ]
                    : [],
                );
              }),
            )}
            {group(
              "Datos e integraciones",
              <Database size={14} />,
              lane("data", "Entradas previstas", [
                {
                  id: "in-brief",
                  label: "Brief del cliente",
                  start: 480,
                  end: 595,
                  selection: { kind: "activity", id: "demo-brief-bruma" },
                  tone: "neutral",
                },
                {
                  id: "in-crm",
                  label: "CRM · Contactos",
                  start: 780,
                  end: 890,
                  selection: { kind: "activity", id: "demo-ontology-bruma" },
                  tone: "neutral",
                },
                {
                  id: "in-client",
                  label: "Feedback del cliente",
                  start: 960,
                  end: 1080,
                  selection: { kind: "client", id: "Taller Bruma" },
                  tone: "neutral",
                },
              ]),
            )}
            {group(
              "Riesgos y aprobaciones",
              <Flag size={14} />,
              lane(
                "risks",
                "Puntos de decisión",
                state.activities
                  .filter((a) => a.stage === "Aprobación")
                  .map((a) => ({
                    id: `risk-${a.id}`,
                    label: a.title,
                    start: a.start,
                    end: a.end,
                    selection: { kind: "activity", id: a.id },
                    tone: "amber",
                  })),
              ),
            )}
            <div className="bcs-playhead-track" aria-hidden="true">
              <div className="bcs-playhead" style={{ left: `${position(state.clock)}%` }}>
                <span />
              </div>
            </div>
          </div>
        </div>
      </div>
      <footer className="bcs-transport">
        <button
          className="bcs-play-button"
          aria-label={state.playing ? "Pausar jornada" : "Reproducir jornada"}
          onClick={() => dispatch({ type: "play" })}
        >
          {state.playing ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
        </button>
        <span>Recorrer jornada</span>
        <input
          aria-label="Reloj compartido de la jornada"
          type="range"
          min={DAY_START}
          max={DAY_END}
          value={state.clock}
          onChange={(e) => dispatch({ type: "clock", clock: Number(e.target.value) })}
        />
        <output>{timeLabel(state.clock)}</output>
        <span className="bcs-transport-note">
          <Clock3 size={13} />
          Tiempo simulado
        </span>
      </footer>
    </section>
  );
}
