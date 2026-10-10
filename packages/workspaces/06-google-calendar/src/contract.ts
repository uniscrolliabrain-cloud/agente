// 06-google-calendar - contrato publico del workspace.
import type { WorkspaceModule } from "../../../src/contracts/index.ts";
import { CAPABILITIES } from "./application/capabilities.ts";
import { VIEWS } from "./application/views.ts";
import { COMMANDS } from "./application/commands.ts";
import { QUERIES } from "./application/queries.ts";
import { PUBLISHED } from "./events/published.ts";
import { CONSUMED } from "./events/consumed.ts";

export const workspace: WorkspaceModule = {
  manifest: {
    id: "google-calendar",
    slug: "06-google-calendar",
    order: 6,
    family: "trabajo",
    reference: "Google Calendar",
    title: "Calendario y agenda",
    status: "implemented",
    version: 1,
    entrypoint: "./src/index.ts",
    capabilities: [
      "calendar.create",
      "calendar.reschedule",
      "calendar.cancel",
      "calendar.add_participant",
      "calendar.check_availability",
      "calendar.block_time",
      "calendar.read",
    ],
    dependencies: [
      "domain-core",
      "crm",
      "personas",
    ],
    events: {
      publishes: [
      "calendar.event.created",
      "calendar.event.rescheduled",
      "calendar.event.cancelled",
      ],
      consumes: [
      "task.created",
      "opportunity.created",
      "leave.approved",
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
