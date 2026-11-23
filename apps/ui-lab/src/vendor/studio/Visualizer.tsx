import { ArrowUpRight, Bot, Check, Clock3, GitBranch, Layers3, LockKeyhole, Users } from "lucide-react";
import type { Dispatch } from "react";
import {
  actors,
  projects,
  stages,
  selectionActivities,
  phase,
  timeLabel,
  type Action,
  type Activity,
  type Actor,
  type StudioState,
} from "./model";

export function Avatar({ actor, small = false }: { actor: Actor; small?: boolean }) {
  return (
    <span className={`bcs-avatar ${small ? "bcs-avatar-small" : ""}`} data-kind={actor.kind}>
      {actor.portrait ? <img src={actor.portrait} alt="" /> : actor.initials}
    </span>
  );
}
function Card({ item, state, dispatch }: { item: Activity; state: StudioState; dispatch: Dispatch<Action> }) {
  const actor = actors.find((a) => a.id === item.actor)!;
  const selected = selectionActivities(state).some((a) => a.id === item.id) && state.selection.kind !== "company";
  return (
    <button
      className="bcs-card"
      data-selected={selected}
      onClick={() => dispatch({ type: "select", selection: { kind: "activity", id: item.id } })}
      aria-pressed={selected}
    >
      <span className="bcs-card-top">
        <span>{item.kind}</span>
        {item.priority === "Alta" ? (
          <span className="bcs-priority">Prioridad alta</span>
        ) : (
          <span>{timeLabel(item.start)}</span>
        )}
      </span>
      <strong>{item.title}</strong>
      <span className="bcs-card-project">{projects.find((p) => p.id === item.project)?.name}</span>
      <span className="bcs-card-footer">
        <span>
          <Avatar actor={actor} small />
          {actor.name}
        </span>
        {item.stage === "Completado" ? (
          <Check size={14} />
        ) : item.stage === "Aprobación" ? (
          <LockKeyhole size={14} />
        ) : (
          <span className="bcs-card-duration">{item.end - item.start} min</span>
        )}
      </span>
    </button>
  );
}

export default function Visualizer({
  state,
  items,
  dispatch,
}: {
  state: StudioState;
  items: Activity[];
  dispatch: Dispatch<Action>;
}) {
  if (state.view === "Kanban")
    return (
      <div className="bcs-kanban" aria-label="Tablero de actividades AgntiaPro">
        {stages.map((stage) => (
          <section className="bcs-column" key={stage} data-stage={stage}>
            <h3>
              <span className="bcs-stage-dot" />
              {stage}
              <span className="bcs-count">{items.filter((a) => a.stage === stage).length}</span>
            </h3>
            <div className="bcs-column-items">
              {items
                .filter((a) => a.stage === stage)
                .map((item) => (
                  <Card key={item.id} item={item} state={state} dispatch={dispatch} />
                ))}
              {!items.some((a) => a.stage === stage) && <p className="bcs-column-empty">Sin actividades</p>}
            </div>
          </section>
        ))}
      </div>
    );

  if (state.view === "Grafo") {
    const nodePosition = (index: number) => ({ x: 24 + (index % 4) * 222, y: 24 + Math.floor(index / 4) * 132 });
    return (
      <div className="bcs-graph-scroll">
        <div className="bcs-graph" style={{ height: Math.max(300, Math.ceil(items.length / 4) * 132 + 36) }}>
          <svg width="920" height="100%" aria-hidden="true">
            <defs>
              <marker id="bcs-edge-end" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6" fill="#b4aad8" />
              </marker>
            </defs>
            {items.map((item, index) => {
              const parent = items.findIndex((a) => a.id === item.dependsOn);
              if (parent < 0) return null;
              const from = nodePosition(parent),
                to = nodePosition(index);
              return (
                <path
                  key={item.id}
                  d={`M${from.x + 96},${from.y + 84} C${from.x + 96},${from.y + 112} ${to.x + 96},${to.y - 24} ${to.x + 96},${to.y}`}
                  fill="none"
                  stroke="#b4aad8"
                  strokeWidth="1.5"
                  markerEnd="url(#bcs-edge-end)"
                />
              );
            })}
          </svg>
          {items.map((item, index) => {
            const pos = nodePosition(index);
            return (
              <button
                key={item.id}
                className="bcs-graph-node"
                data-selected={state.selection.id === item.id}
                style={{ left: pos.x, top: pos.y }}
                onClick={() => dispatch({ type: "select", selection: { kind: "activity", id: item.id } })}
              >
                <span>
                  <GitBranch size={13} />
                  {item.stage}
                </span>
                <strong>{item.title}</strong>
                <small>{actors.find((a) => a.id === item.actor)?.name}</small>
              </button>
            );
          })}
          {!items.length && <p>No hay relaciones en este ámbito.</p>}
        </div>
        <p className="bcs-view-note">
          <GitBranch size={13} />
          Las líneas indican dependencias del escenario. Selecciona un nodo para inspeccionarlo.
        </p>
      </div>
    );
  }

  if (state.view === "Digital Twin")
    return (
      <div className="bcs-twin">
        <div className="bcs-twin-heading">
          <div>
            <span className="bcs-eyebrow">AgntiaPro · Modelo operativo</span>
            <h3>Una empresa. Un mismo pulso.</h3>
          </div>
          <span className="bcs-badge">
            <Clock3 size={13} />
            {timeLabel(state.clock)}
          </span>
        </div>
        <div className="bcs-rooms">
          {[
            { title: "Coordinación", subtitle: "Del contexto a la acción", ids: ["laia", "marcos"], icon: Bot },
            {
              title: "Personas y finanzas",
              subtitle: "Decisiones con criterio",
              ids: ["antonio", "pilar"],
              icon: Users,
            },
            {
              title: "Estudio creativo",
              subtitle: "Ideas que se convierten en entregas",
              ids: ["manuel"],
              icon: Layers3,
            },
          ].map((room) => (
            <section className="bcs-room" key={room.title}>
              <room.icon size={21} strokeWidth={1.5} />
              <h4>{room.title}</h4>
              <p>{room.subtitle}</p>
              {actors
                .filter((a) => room.ids.includes(a.id))
                .map((actor) => {
                  const active = items.find(
                    (item) => item.actor === actor.id && item.start <= state.clock && item.end > state.clock,
                  );
                  return (
                    <button
                      key={actor.id}
                      className="bcs-person"
                      data-selected={state.selection.id === actor.id}
                      onClick={() => dispatch({ type: "select", selection: { kind: "actor", id: actor.id } })}
                    >
                      <Avatar actor={actor} />
                      <span>
                        <strong>{actor.name}</strong>
                        <small>{active?.title ?? "Sin actividad en este intervalo"}</small>
                      </span>
                      <span className="bcs-person-dot" data-active={!!active} />
                    </button>
                  );
                })}
            </section>
          ))}
        </div>
        <p className="bcs-view-note">
          Modelo visual de demostración. La actividad cambia al mover el reloj; no representa presencia ni predicciones
          reales.
        </p>
      </div>
    );

  const done = items.filter((a) => a.stage === "Completado").length;
  const active = items.filter((a) => a.stage === "En curso").length;
  const approval = items.filter((a) => a.stage === "Aprobación").length;
  return (
    <div className="bcs-overview">
      <div className="bcs-metrics">
        {[
          { label: "Actividades", value: items.length, note: "En el ámbito seleccionado" },
          { label: "En curso", value: active, note: "Trabajo en marcha" },
          { label: "Decisiones", value: approval, note: "Requieren aprobación" },
          { label: "Completadas", value: done, note: "Con entrega preparada" },
        ].map((metric) => (
          <div key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <small>{metric.note}</small>
          </div>
        ))}
      </div>
      <div className="bcs-portfolio">
        {projects.map((project) => {
          const projectItems = items.filter((item) => item.project === project.id);
          const progress = projectItems.length
            ? Math.round(
                (projectItems.filter((item) => item.stage === "Completado").length / projectItems.length) * 100,
              )
            : 0;
          return (
            <button
              key={project.id}
              data-selected={state.selection.id === project.id}
              onClick={() => dispatch({ type: "select", selection: { kind: "project", id: project.id } })}
            >
              <span className="bcs-portfolio-icon">
                <Layers3 size={19} />
              </span>
              <span>
                <strong>{project.name}</strong>
                <small>
                  {project.client} · {projectItems.length} actividades
                </small>
              </span>
              <span className="bcs-progress">
                <span style={{ width: `${progress}%` }} />
              </span>
              <b>{progress}%</b>
              <ArrowUpRight size={16} />
            </button>
          );
        })}
      </div>
      <div className="bcs-client-row">
        <span>Mirar por cliente</span>
        {Array.from(new Set(projects.map((project) => project.client))).map((client) => (
          <button key={client} onClick={() => dispatch({ type: "select", selection: { kind: "client", id: client } })}>
            {client}
            <ArrowUpRight size={14} />
          </button>
        ))}
      </div>
    </div>
  );
}

export function SelectionPreview({ state }: { state: StudioState }) {
  const selected = selectionActivities(state);
  const first = selected[0];
  const title =
    state.selection.kind === "activity"
      ? first?.title
      : state.selection.kind === "actor"
        ? actors.find((a) => a.id === state.selection.id)?.name
        : state.selection.kind === "project"
          ? projects.find((p) => p.id === state.selection.id)?.name
          : state.selection.kind === "client"
            ? state.selection.id
            : "Toda la empresa";
  return (
    <div className="bcs-selection-summary">
      <span className="bcs-selection-indicator" />
      <strong>{title}</strong>
      <span>
        {state.selection.kind === "activity" && first
          ? phase(first, state.clock)
          : `${selected.length} actividades vinculadas`}
      </span>
    </div>
  );
}
