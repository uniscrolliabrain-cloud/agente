// WORKSPACE_DEFAULT_VIEWS_V1 - los 34 modulos historicos no declaraban vistas.
// En vez de inventar una vista por cada integracion, exponemos una tabla
// generica que ejecuta la primera query real del modulo. Si la query devuelve
// vacio, la UI muestra una tabla vacia; no se fabrican filas.
import type { WorkspaceModule, WorkspaceViewDeclaration } from "@agente/workspaces";

export function defaultWorkspaceView(module: WorkspaceModule): WorkspaceViewDeclaration {
  const firstQuery = Object.keys(module.queries)[0] ?? `${module.manifest.id}.empty`;
  return {
    id: "default",
    intent: module.manifest.title,
    kind: "table",
    title: module.manifest.title,
    query: firstQuery,
    actions: [],
  };
}

export function withDefaultViews(module: WorkspaceModule): WorkspaceModule {
  if (module.views.length > 0) return module;
  return { ...module, views: [defaultWorkspaceView(module)] };
}
