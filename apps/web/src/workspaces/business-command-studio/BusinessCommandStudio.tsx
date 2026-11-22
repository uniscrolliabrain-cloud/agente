import {
  BarChart3,
  Box,
  Eye,
  Gamepad2,
  GitBranch,
  LayoutPanelLeft,
  Maximize2,
  Minimize2,
  Plus,
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { actors, initialState, projects, reducer, visibleActivities, type Action, type View } from "./model";
import Inspector from "./Inspector";
import Timeline from "./Timeline";
import Visualizer, { SelectionPreview } from "./Visualizer";
import "../../design-system/agntia-tokens.css";
import "./studio.css";

const views: { name: View; icon: typeof Box }[] = [
  { name: "Kanban", icon: LayoutPanelLeft },
  { name: "Grafo", icon: GitBranch },
  { name: "Digital Twin", icon: Box },
  { name: "Empresa 360°", icon: BarChart3 },
];

export default function BusinessCommandStudio() {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const [creating, setCreating] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [mobileInspector, setMobileInspector] = useState(false);
  const [resetPrompt, setResetPrompt] = useState(false);
  const resetButtonRef = useRef<HTMLButtonElement>(null);
  const closeReset = () => {
    setResetPrompt(false);
    requestAnimationFrame(() => resetButtonRef.current?.focus());
  };
  const inspectorRef = useRef<HTMLDivElement>(null);
  const send = useCallback((action: Action) => {
    dispatch(action);
    if (action.type === "select") {
      setCreating(false);
      setMobileInspector(true);
    }
  }, []);
  useEffect(() => {
    if (!state.playing) return;
    const timer = window.setInterval(() => dispatch({ type: "tick" }), 180);
    return () => window.clearInterval(timer);
  }, [state.playing]);
  const openCreate = () => {
    setCreating(true);
    setExpanded(false);
    setMobileInspector(true);
    requestAnimationFrame(() => inspectorRef.current?.scrollIntoView({ block: "nearest", behavior: "auto" }));
  };
  const items = visibleActivities(state);
  return (
    <div className="agntia-workspace bcs-workspace" data-expanded={expanded}>
      <header className="bcs-header">
        <div>
          <div className="bcs-header-context">
            <span>ACME</span>
            <span className="bcs-demo-tag">Entorno demo</span>
            <span className="bcs-header-caption">Observar. Dirigir. Conectar.</span>
          </div>
          <h1>
            Estudio de operaciones<span>.</span>
          </h1>
        </div>
        <div className="bcs-header-actions">
          <button
            className="bcs-mode"
            aria-pressed={state.editing}
            onClick={() => dispatch({ type: "editing", value: !state.editing })}
          >
            {state.editing ? <Gamepad2 size={16} /> : <Eye size={16} />}
            <span>{state.editing ? "Game Master" : "Observar"}</span>
            <span className="bcs-switch" data-on={state.editing} />
          </button>
          <button
            className="bcs-icon-button"
            aria-label="Reiniciar escenario demo"
            ref={resetButtonRef}
            onClick={() => setResetPrompt(true)}
          >
            <RotateCcw size={16} />
          </button>
          <button className="bcs-button bcs-dark" disabled={!state.editing} onClick={openCreate}>
            <Plus size={16} />
            <span>Nueva actividad</span>
          </button>
        </div>
      </header>
      <div className="bcs-upper">
        <div className="bcs-inspector-wrap" ref={inspectorRef} data-mobile-open={mobileInspector}>
          <Inspector state={state} dispatch={send} creating={creating} setCreating={setCreating} />
        </div>
        <section className="bcs-preview bcs-panel" aria-label="Visualizador de operaciones">
          <header className="bcs-preview-header">
            <div className="bcs-preview-heading">
              <span className="bcs-eyebrow">VISUALIZADOR</span>
              <h2>
                {state.view === "Kanban"
                  ? "El trabajo, en perspectiva."
                  : state.view === "Grafo"
                    ? "Todo está conectado."
                    : state.view === "Digital Twin"
                      ? "El pulso de tu empresa."
                      : "La visión completa."}
              </h2>
            </div>
            <div className="bcs-preview-tools">
              <button
                className="bcs-icon-button bcs-mobile-detail"
                aria-expanded={mobileInspector}
                aria-label="Mostrar u ocultar inspector"
                onClick={() => setMobileInspector((v) => !v)}
              >
                <SlidersHorizontal size={17} />
              </button>
              <button
                className="bcs-icon-button bcs-expand"
                aria-label={expanded ? "Restaurar visualizador" : "Ampliar visualizador"}
                onClick={() => setExpanded((v) => !v)}
              >
                {expanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
            </div>
          </header>
          <div className="bcs-view-toolbar">
            <div className="bcs-tabs" aria-label="Vistas del estudio">
              {views.map(({ name, icon: Icon }) => (
                <button
                  key={name}
                  aria-pressed={state.view === name}
                  onClick={() => send({ type: "view", view: name })}
                >
                  <Icon size={14} />
                  <span>{name}</span>
                </button>
              ))}
            </div>
            <label className="bcs-scope">
              <span className="bcs-sr-only">Ámbito del visualizador</span>
              <select value={state.scope} onChange={(e) => send({ type: "scope", scope: e.target.value })}>
                <option value="all">Toda la empresa</option>
                <optgroup label="Proyectos">
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Personas y agentes">
                  {actors.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} · {a.kind}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Clientes">
                  <option>Estudio Norte</option>
                  <option>ACME</option>
                </optgroup>
              </select>
            </label>
          </div>
          <div className="bcs-visualizer-body" key={state.view}>
            <Visualizer state={state} items={items} dispatch={send} />
          </div>
          <SelectionPreview state={state} />
        </section>
      </div>
      <Timeline state={state} dispatch={send} />
      <span className="bcs-sr-only" role="status" aria-live="polite">
        {state.revision
          ? `Escenario local actualizado. ${state.activities.length} actividades. Cambio ${state.revision}.`
          : "Escenario ACME de demostración cargado."}
      </span>
      {resetPrompt && (
        <div className="bcs-reset-overlay">
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="bcs-reset-title"
            className="bcs-reset-dialog"
            onKeyDown={(event) => {
              if (event.key === "Escape") closeReset();
              if (event.key === "Tab") {
                const buttons = event.currentTarget.querySelectorAll("button");
                if (!event.shiftKey && document.activeElement === buttons[1]) {
                  event.preventDefault();
                  buttons[0].focus();
                } else if (event.shiftKey && document.activeElement === buttons[0]) {
                  event.preventDefault();
                  buttons[1].focus();
                }
              }
            }}
          >
            <h2 id="bcs-reset-title">Volver al escenario inicial</h2>
            <p>Se descartarán los cambios de esta demo. Los datos de tu empresa no se modifican.</p>
            <div>
              <button autoFocus className="bcs-button" onClick={closeReset}>
                Conservar cambios
              </button>
              <button
                className="bcs-button bcs-primary"
                onClick={() => {
                  dispatch({ type: "reset" });
                  setCreating(false);
                  closeReset();
                }}
              >
                Reiniciar demo
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
