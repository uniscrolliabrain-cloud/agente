// 21-stripe - contrato publico del workspace.
import type { WorkspaceModule } from "../../../src/contracts/index.ts";
import { CAPABILITIES } from "./application/capabilities.ts";
import { VIEWS } from "./application/views.ts";
import { COMMANDS } from "./application/commands.ts";
import { QUERIES } from "./application/queries.ts";
import { PUBLISHED } from "./events/published.ts";
import { CONSUMED } from "./events/consumed.ts";

export const workspace: WorkspaceModule = {
  manifest: {
    id: "stripe",
    slug: "21-stripe",
    order: 21,
    family: "finanzas",
    reference: "Stripe Dashboard",
    title: "Analitica y dashboards",
    status: "implemented",
    version: 1,
    entrypoint: "./src/index.ts",
    capabilities: [
      "payment.record","refund.issue","dispute.open","dispute.resolve",
      "revenue.read","payment.list","subscription.manage",
    ],
    dependencies: ["domain-core", "holded"],
    events: {
      publishes: ["payment.succeeded","payment.failed","refund.issued","dispute.opened"],
      consumes: ["invoice.issued","subscription.renewed"],
    },
  },
  capabilities: CAPABILITIES,
  views: VIEWS,
  publishes: PUBLISHED.map((t) => ({ type: t, version: 1, description: t })),
  consumes: CONSUMED.map((t) => ({ type: t, version: 1, description: t, source: "external" })),
  commands: COMMANDS,
  queries: QUERIES,
};
