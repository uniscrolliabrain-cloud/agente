// WORKSPACE_SHELL_V2 - selecciona workspace, lista sus vistas declaradas y
// ejecuta la vista elegida contra el adapter del servidor.
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { ChevronDown } from "lucide-react";
import type { WorkspaceListEntry } from "../api/workspaces";
import { useWorkspaceView } from "../hooks/useWorkspaceView";
import ViewRenderer from "../view/ViewRenderer";

interface Props {
  workspaces: WorkspaceListEntry[];
  workspaceId: string | null;
  onSelectWorkspace: (id: string) => void;
}

export default function WorkspaceShell({ workspaces, workspaceId, onSelectWorkspace }: Props) {
  const [selectedViewId, setSelectedViewId] = useState<string | null>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const { detail, view, loading, error } = useWorkspaceView(workspaceId, selectedViewId);

  useEffect(() => {
    setSelectedViewId(null);
  }, [workspaceId]);

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const definitions = detail?.viewDefinitions ?? [];
    if (definitions.length === 0) return;
    let nextIndex: number | null = null;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % definitions.length;
    if (event.key === "ArrowLeft") nextIndex = (index - 1 + definitions.length) % definitions.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = definitions.length - 1;
    if (nextIndex === null) return;
    event.preventDefault();
    setSelectedViewId(definitions[nextIndex].id);
    tabRefs.current[nextIndex]?.focus();
  };

  if (!workspaceId) {
    return (
      <div className="workspace-shell empty">
        <h2>Workspaces</h2>
        <p>Elige un workspace para ver sus vistas declaradas.</p>
        <div className="workspace-shell-list">
          {workspaces.map((workspace) => (
            <button
              key={workspace.id}
              type="button"
              className="workspace-shell-card"
              onClick={() => onSelectWorkspace(workspace.id)}
            >
              <b>{workspace.title}</b>
              <small>{workspace.family} · {workspace.reference}</small>
            </button>
          ))}
          {workspaces.length === 0 && <div className="workspace-shell-empty">No hay workspaces disponibles.</div>}
        </div>
      </div>
    );
  }

  const activeViewId = selectedViewId ?? detail?.viewDefinitions[0]?.id ?? null;

  return (
    <div className="workspace-shell">
      <header className="workspace-shell-header">
        <div>
          <h1>{detail?.manifest.title ?? workspaceId}</h1>
          <span className="workspace-shell-family">{detail?.manifest.family ?? "workspace"}</span>
        </div>
        <div className="workspace-shell-select-wrap">
          <select
            className="workspace-shell-select"
            value={workspaceId}
            onChange={(event) => onSelectWorkspace(event.target.value)}
            aria-label="Cambiar workspace"
          >
            {workspaces.map((workspace) => (
              <option key={workspace.id} value={workspace.id}>
                {workspace.title}
              </option>
            ))}
          </select>
          <ChevronDown className="workspace-shell-select-icon" size={14} aria-hidden="true" />
        </div>
      </header>

      {detail && detail.viewDefinitions.length > 0 && (
        <nav className="workspace-shell-tabs" role="tablist" aria-label="Vistas del workspace">
          {detail.viewDefinitions.map((definition, index) => (
            <button
              key={definition.id}
              type="button"
              role="tab"
              id={`workspace-tab-${definition.id}`}
              aria-selected={definition.id === activeViewId}
              aria-controls="workspace-view-panel"
              tabIndex={definition.id === activeViewId ? 0 : -1}
              ref={(element) => { tabRefs.current[index] = element; }}
              className={definition.id === activeViewId ? "active" : ""}
              onClick={() => setSelectedViewId(definition.id)}
              onKeyDown={(event) => handleTabKeyDown(event, index)}
            >
              {definition.title}
            </button>
          ))}
        </nav>
      )}

      <section
        className="workspace-shell-body"
        id="workspace-view-panel"
        role="tabpanel"
        aria-labelledby={activeViewId ? `workspace-tab-${activeViewId}` : undefined}
      >
        {loading ? (
          <div className="workspace-shell-empty">Cargando vista...</div>
        ) : error ? (
          <div className="workspace-shell-error" role="alert">{error}</div>
        ) : view ? (
          <ViewRenderer spec={view.spec} />
        ) : (
          <div className="workspace-shell-empty">Este workspace no declara vistas todavía.</div>
        )}
      </section>
    </div>
  );
}
