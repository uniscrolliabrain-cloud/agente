import { Check, ChevronRight, CirclePlus, Clock3, Eye, Flag, Layers3, Pencil, X } from "lucide-react";
import { useEffect, useRef, useState, type Dispatch, type FormEvent } from "react";
import {
  actors,
  projects,
  selectionActivities,
  stages,
  timeLabel,
  timeValue,
  validActivity,
  type Action,
  type Activity,
  type ActivityKind,
  type StudioState,
} from "./model";
import { Avatar } from "./Visualizer";

export default function Inspector({
  state,
  dispatch,
  creating,
  setCreating,
}: {
  state: StudioState;
  dispatch: Dispatch<Action>;
  creating: boolean;
  setCreating: (value: boolean) => void;
}) {
  const related = selectionActivities(state);
  const item = state.selection.kind === "activity" ? related[0] : undefined;
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [kind, setKind] = useState<ActivityKind>("Tarea");
  const titleRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    setEditing(false);
    setError("");
  }, [state.selection.id]);
  useEffect(() => {
    if (creating || editing) titleRef.current?.focus();
  }, [creating, editing]);
  const formOpen = creating || editing;
  const actor = actors.find((a) => a.id === (state.selection.kind === "actor" ? state.selection.id : item?.actor));
  const project = projects.find(
    (p) => p.id === (state.selection.kind === "project" ? state.selection.id : item?.project),
  );
  const heading =
    item?.title ?? actor?.name ?? project?.name ?? (state.selection.kind === "client" ? state.selection.id : "AgntiaPro");
  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const activity: Activity = {
      id: editing && item ? item.id : `demo-${crypto.randomUUID()}`,
      title: String(data.get("title")).trim(),
      kind: editing && item ? item.kind : kind,
      actor: String(data.get("actor")),
      project: String(data.get("project")),
      stage: data.get("stage") as Activity["stage"],
      start: timeValue(String(data.get("start"))),
      end: timeValue(String(data.get("end"))),
      detail: String(data.get("detail") ?? ""),
      output: editing && item ? item.output : "Entrega por definir",
      priority: data.get("priority") as Activity["priority"],
      ...(editing && item?.dependsOn ? { dependsOn: item.dependsOn } : {}),
    };
    if (!validActivity(activity)) {
      setError("Revisa el horario: entre 08:00 y 18:00, con el final posterior al inicio.");
      return;
    }
    dispatch({ type: "save", activity });
    setCreating(false);
    setEditing(false);
    setError("");
  };
  return (
    <aside className="bcs-inspector bcs-panel" aria-label="Inspector contextual">
      <header>
        <span className="bcs-eyebrow">{formOpen ? "CREAR Y ORGANIZAR" : "INSPECTOR · CONTEXTO"}</span>
        {formOpen ? (
          <button
            className="bcs-icon-button"
            aria-label="Cerrar formulario"
            onClick={() => {
              setCreating(false);
              setEditing(false);
              setError("");
            }}
          >
            <X size={16} />
          </button>
        ) : (
          <span className="bcs-live-label">Demo</span>
        )}
      </header>
      {formOpen ? (
        <form key={editing ? item?.id : "new"} onSubmit={save} className="bcs-editor">
          <h2>{editing ? "Editar actividad" : "Una nueva pieza."}</h2>
          {!editing && (
            <div className="bcs-kind-picker">
              {(["Tarea", "Evento", "Proyecto", "SOP"] as ActivityKind[]).map((k) => (
                <button type="button" key={k} aria-pressed={kind === k} onClick={() => setKind(k)}>
                  {k}
                </button>
              ))}
            </div>
          )}
          <label>
            Título
            <input
              ref={titleRef}
              name="title"
              required
              maxLength={100}
              placeholder="¿Qué hay que hacer?"
              defaultValue={editing ? item?.title : ""}
            />
          </label>
          <label>
            Responsable
            <select name="actor" defaultValue={editing ? item?.actor : (actor?.id ?? "laia")}>
              {actors.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} · {a.kind}
                </option>
              ))}
            </select>
          </label>
          <label>
            Proyecto
            <select name="project" defaultValue={editing ? item?.project : (project?.id ?? "campaign")}>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <div className="bcs-form-pair">
            <label>
              Inicio
              <input
                type="time"
                name="start"
                required
                min="08:00"
                max="17:59"
                defaultValue={editing && item ? timeLabel(item.start) : "14:00"}
              />
            </label>
            <label>
              Final
              <input
                type="time"
                name="end"
                required
                min="08:01"
                max="18:00"
                defaultValue={editing && item ? timeLabel(item.end) : "15:00"}
              />
            </label>
          </div>
          <div className="bcs-form-pair">
            <label>
              Estado
              <select name="stage" defaultValue={editing ? item?.stage : "Pendiente"}>
                {stages.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label>
              Prioridad
              <select name="priority" defaultValue={editing ? item?.priority : "Normal"}>
                <option>Normal</option>
                <option>Alta</option>
              </select>
            </label>
          </div>
          <label>
            Contexto
            <textarea
              name="detail"
              rows={2}
              maxLength={1000}
              placeholder="Lo que el equipo debe saber…"
              defaultValue={editing ? item?.detail : ""}
            />
          </label>
          {error && (
            <p className="bcs-form-error" role="alert">
              {error}
            </p>
          )}
          <button className="bcs-button bcs-primary" type="submit" disabled={!state.editing}>
            <Check size={15} />
            {editing ? "Guardar cambios" : "Crear en la demo"}
          </button>
          <p className="bcs-fineprint">Se añade al escenario local. No ejecuta trabajo real.</p>
        </form>
      ) : (
        <div className="bcs-inspector-content">
          <div className="bcs-inspector-symbol">{actor ? <Avatar actor={actor} /> : <Layers3 size={21} />}</div>
          <span className="bcs-inspector-type">
            {item
              ? `${item.kind} · ${item.stage}`
              : actor
                ? `${actor.kind} · ${actor.role}`
                : state.selection.kind === "client"
                  ? "Cuenta de cliente"
                  : project
                    ? "Proyecto"
                    : "Vista de empresa"}
          </span>
          <h2>{heading}</h2>
          <p className="bcs-inspector-description">
            {item?.detail ??
              (actor
                ? `Actividad de ${actor.name} en la jornada de AgntiaPro. Selecciona una pieza para ver su contexto.`
                : (project?.output ??
                  "Observa el trabajo del equipo, sus dependencias y las decisiones que necesitan tu atención."))}
          </p>
          {item && (
            <>
              <dl className="bcs-properties">
                <div>
                  <dt>Responsable</dt>
                  <dd>
                    <button onClick={() => dispatch({ type: "select", selection: { kind: "actor", id: item.actor } })}>
                      {actor?.name}
                      <ChevronRight size={12} />
                    </button>
                  </dd>
                </div>
                <div>
                  <dt>Proyecto</dt>
                  <dd>
                    <button
                      onClick={() => dispatch({ type: "select", selection: { kind: "project", id: item.project } })}
                    >
                      {project?.name}
                    </button>
                  </dd>
                </div>
                <div>
                  <dt>Horario</dt>
                  <dd>
                    {timeLabel(item.start)}–{timeLabel(item.end)}
                  </dd>
                </div>
                <div>
                  <dt>Prioridad</dt>
                  <dd>{item.priority}</dd>
                </div>
              </dl>
              <div className="bcs-output">
                <span>
                  <Flag size={13} />
                  Entrega esperada
                </span>
                <strong>{item.output}</strong>
              </div>
              {item.dependsOn && (
                <button
                  className="bcs-dependency"
                  onClick={() => dispatch({ type: "select", selection: { kind: "activity", id: item.dependsOn! } })}
                >
                  Depende de <strong>{state.activities.find((a) => a.id === item.dependsOn)?.title}</strong>
                  <ChevronRight size={13} />
                </button>
              )}
              <div className="bcs-inspector-buttons">
                <button className="bcs-button bcs-primary" disabled={!state.editing} onClick={() => setEditing(true)}>
                  <Pencil size={14} />
                  Editar
                </button>
                <button className="bcs-button" onClick={() => dispatch({ type: "clock", clock: item.start })}>
                  <Clock3 size={14} />
                  Situar
                </button>
              </div>
              {item.stage === "Aprobación" && (
                <button
                  className="bcs-button bcs-approve"
                  disabled={!state.editing}
                  onClick={() => dispatch({ type: "save", activity: { ...item, stage: "Completado" } })}
                >
                  <Check size={14} />
                  Simular aprobación
                </button>
              )}
            </>
          )}
          {!item && (
            <div className="bcs-related">
              <span className="bcs-eyebrow">{related.length} ACTIVIDADES VINCULADAS</span>
              {related.map((a) => (
                <button
                  key={a.id}
                  onClick={() => dispatch({ type: "select", selection: { kind: "activity", id: a.id } })}
                >
                  <span>
                    <strong>{a.title}</strong>
                    <small>
                      {a.stage} · {timeLabel(a.start)}
                    </small>
                  </span>
                  <ChevronRight size={14} />
                </button>
              ))}
            </div>
          )}
          {!state.editing && (
            <p className="bcs-observe-note">
              <Eye size={14} />
              Modo observar. Activa Game Master para editar la demo.
            </p>
          )}
          <button className="bcs-new-context" disabled={!state.editing} onClick={() => setCreating(true)}>
            <CirclePlus size={16} />
            Crear nueva actividad
          </button>
        </div>
      )}
    </aside>
  );
}
