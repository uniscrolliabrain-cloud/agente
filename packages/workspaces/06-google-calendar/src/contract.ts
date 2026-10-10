// 06-google-calendar - contrato publico del workspace.
import type { WorkspaceModule } from "../../../src/contracts/index.ts";
import { CAPABILITIES } from "./application/capabilities.ts";
import { VIEWS } from "./application/views.ts";
import { PUBLISHED } from "./events/published.ts";
import { CONSUMED } from "./events/consumed.ts";

export const workspace: WorkspaceModule = {
  manifest: {
    id: "google-calendar",
    slug: "06-google-calendar",
    order: 6,
    family: "trabajo" as never,
    reference: "Google Calendar",
    title: "Calendario y agenda",
    status: "scaffold",
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
    dependencies: [],
    events: { publishes: [], consumes: [] },
  },
  capabilities: CAPABILITIES,
  views: VIEWS,
  publishes: PUBLISHED.map((t) => ({ type: t, version: 1, description: t })),
  consumes: CONSUMED.map((t) => ({ type: t, version: 1, description: t, source: "external" })),
};