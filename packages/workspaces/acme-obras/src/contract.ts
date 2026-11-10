// acme-obras - contrato publico del workspace.
// Tenant: acme. El catalogo es global (los 37 modulos los ve cualquier
// tenant); los datos solo existen en el backend aislado de acme. Un tenant
// sin obras ve las mismas vistas vacias, nunca filas de otra empresa.
import type { WorkspaceModule } from "../../src/contracts/index.ts";
import { CAPABILITIES } from "./application/capabilities.ts";
import { VIEWS } from "./application/views.ts";
import { COMMANDS } from "./application/commands.ts";
import { QUERIES } from "./application/queries.ts";

export const workspace: WorkspaceModule = {
  manifest: {
    id: "acme-obras",
    slug: "acme-obras",
    order: 35,
    family: "trabajo",
    reference: "ACME Obras",
    title: "Obras y ejecución",
    // Honesto: declarado y registrado, verificado end-to-end en E20.
    status: "implemented",
    version: 1,
    entrypoint: "./src/index.ts",
    capabilities: [
      "obra.resumen",
      "obra.tablero",
      "obra.tareas",
      "obra.incidencias",
      "obra.partes",
      "obra.detalle",
      "obra.parte.nuevo",
    ],
    dependencies: ["domain-core", "documents"],
    // ACME no publica ni consume eventos del bus en esta etapa.
    events: { publishes: [], consumes: [] },
  },
  capabilities: CAPABILITIES,
  views: VIEWS,
  publishes: [],
  consumes: [],
  commands: COMMANDS,
  queries: QUERIES,
};
