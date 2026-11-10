// acme-suministros - contrato publico del workspace.
// Tenant: acme. Catalogo global, datos por tenant.
import type { WorkspaceModule } from "../../src/contracts/index.ts";
import { CAPABILITIES } from "./application/capabilities.ts";
import { VIEWS } from "./application/views.ts";
import { COMMANDS } from "./application/commands.ts";
import { QUERIES } from "./application/queries.ts";

export const workspace: WorkspaceModule = {
  manifest: {
    id: "acme-suministros",
    slug: "acme-suministros",
    order: 37,
    family: "operaciones",
    reference: "ACME Suministros",
    title: "Suministros y compras",
    status: "implemented",
    version: 1,
    entrypoint: "./src/index.ts",
    capabilities: [
      "suministros.resumen",
      "suministros.pedidos",
      "suministros.aprobaciones",
      "suministros.avisos",
      "suministros.documentos",
      "suministros.ficha",
      "suministros.pedido-nuevo",
    ],
    dependencies: ["domain-core", "documents"],
    events: { publishes: [], consumes: [] },
  },
  capabilities: CAPABILITIES,
  views: VIEWS,
  publishes: [],
  consumes: [],
  commands: COMMANDS,
  queries: QUERIES,
};
