// 04-holded - contrato publico del workspace.
import type { WorkspaceModule } from "../../../src/contracts/index.ts";
import { CAPABILITIES } from "./application/capabilities.ts";
import { VIEWS } from "./application/views.ts";
import { COMMANDS } from "./application/commands.ts";
import { QUERIES } from "./application/queries.ts";
import { PUBLISHED } from "./events/published.ts";
import { CONSUMED } from "./events/consumed.ts";

export const workspace: WorkspaceModule = {
  manifest: {
    id: "holded",
    slug: "04-holded",
    order: 4,
    family: "finanzas",
    reference: "Holded",
    title: "ERP, facturacion y administracion",
    status: "implemented",
    version: 1,
    entrypoint: "./src/index.ts",
    capabilities: [
      "invoice.create_draft",
      "invoice.issue",
      "invoice.void",
      "credit_note.create",
      "payment.register",
      "expense.record",
      "counterparty.upsert",
    ],
    dependencies: [
      "domain-core",
      "documents",
      "crm",
      "treasury",
    ],
    events: {
      publishes: [
      "invoice.drafted",
      "invoice.issued",
      "invoice.paid",
      "invoice.voided",
      "expense.recorded",
      ],
      consumes: [
      "opportunity.stage.changed",
      "purchase.order.received",
      "payment.succeeded",
      ],
    },
  },
  capabilities: CAPABILITIES,
  views: VIEWS,
  publishes: PUBLISHED.map((t) => ({ type: t, version: 1, description: t })),
  consumes: CONSUMED.map((t) => ({ type: t, version: 1, description: t, source: "external" })),
  commands: COMMANDS,
  queries: QUERIES,
};
