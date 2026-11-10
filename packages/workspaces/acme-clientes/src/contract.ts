// acme-clientes - contrato publico del workspace.
// Tenant: acme. Catalogo global, datos por tenant: otro tenant ve las
// mismas vistas y ninguna fila de acme.
import type { WorkspaceModule } from "../../src/contracts/index.ts";
import { CAPABILITIES } from "./application/capabilities.ts";
import { VIEWS } from "./application/views.ts";
import { COMMANDS } from "./application/commands.ts";
import { QUERIES } from "./application/queries.ts";

export const workspace: WorkspaceModule = {
  manifest: {
    id: "acme-clientes",
    slug: "acme-clientes",
    order: 36,
    family: "comunicacion",
    reference: "ACME Clientes",
    title: "Clientes y negocio",
    status: "implemented",
    version: 1,
    entrypoint: "./src/index.ts",
    capabilities: [
      "clientes.resumen",
      "clientes.oportunidades",
      "clientes.facturas",
      "clientes.bandeja",
      "clientes.cartera",
      "clientes.ficha",
      "clientes.alta",
    ],
    dependencies: ["domain-core", "messaging"],
    events: { publishes: [], consumes: [] },
  },
  capabilities: CAPABILITIES,
  views: VIEWS,
  publishes: [],
  consumes: [],
  commands: COMMANDS,
  queries: QUERIES,
};
