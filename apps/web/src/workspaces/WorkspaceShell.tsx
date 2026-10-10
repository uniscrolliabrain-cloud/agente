// WORKSPACE_SHELL_V1 - contenedor de un workspace activo.
import { getWorkspace } from "./registry.ts";
import ViewRenderer from "../view/ViewRenderer.tsx";
import type { RuntimeViewSpec } from "@openmuse/domain/views";

interface Props {
  workspaceId: string | null;
  spec: RuntimeViewSpec | null;
}

export default function WorkspaceShell({ workspaceId, spec }: Props) {
  const entry = workspaceId ? getWorkspace(workspaceId) : undefined;
  if (!entry) {
    return (
      <div className="workspace-shell empty">
        <h2>Selecciona un workspace</h2>
        <p>Elige uno en el menu lateral para empezar.</p>
      </div>
    );
  }
  return (
    <div className="workspace-shell">
      <header className="workspace-shell-header">
        <h1>{entry.title}</h1>
        <span className="workspace-shell-family">{entry.family}</span>
      </header>
      <section className="workspace-shell-body">
        {spec ? <ViewRenderer spec={spec} /> : <div className="workspace-shell-empty">Sin vista activa</div>}
      </section>
    </div>
  );
}
