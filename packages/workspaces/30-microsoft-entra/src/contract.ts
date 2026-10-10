// 30-microsoft-entra - contrato publico del workspace.
import type { WorkspaceModule } from "../../../src/contracts/index.ts";
import { CAPABILITIES } from "./application/capabilities.ts";
import { VIEWS } from "./application/views.ts";
import { COMMANDS } from "./application/commands.ts";
import { QUERIES } from "./application/queries.ts";
import { PUBLISHED } from "./events/published.ts";
import { CONSUMED } from "./events/consumed.ts";

export const workspace: WorkspaceModule = {
  manifest: {
    id: "microsoft-entra",
    slug: "30-microsoft-entra",
    order: 30,
    family: "gobierno",
    reference: "Microsoft Entra",
    title: "Identidad, accesos y seguridad",
    status: "implemented",
    version: 1,
    entrypoint: "./src/index.ts",
    capabilities: [
      "principal.create",
      "role.assign",
      "access.revoke",
      "policy.define",
      "session.terminate",
      "principal.list",
      "access.matrix",
    ],
    dependencies: [
      "domain-core",
      "personas",
      "compliance",
    ],
    events: {
      publishes: [
      "principal.created",
      "role.assigned",
      "access.revoked",
      "policy.updated",
      ],
      consumes: [
      "employee.created",
      "employment.closed",
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
