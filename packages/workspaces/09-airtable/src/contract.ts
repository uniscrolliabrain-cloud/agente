// 09-airtable - contrato publico del workspace.
import type { WorkspaceModule } from "../../../src/contracts/index.ts";
import { CAPABILITIES } from "./application/capabilities.ts";
import { VIEWS } from "./application/views.ts";
import { COMMANDS } from "./application/commands.ts";
import { QUERIES } from "./application/queries.ts";
import { PUBLISHED } from "./events/published.ts";
import { CONSUMED } from "./events/consumed.ts";

export const workspace: WorkspaceModule = {
  manifest: {
    id: "airtable",
    slug: "09-airtable",
    order: 9,
    family: "datos",
    reference: "Airtable",
    title: "Tablas y bases de datos",
    status: "implemented",
    version: 1,
    entrypoint: "./src/index.ts",
    capabilities: [
      "dataset.create_record",
      "dataset.update_record",
      "dataset.define_field",
      "dataset.relate_records",
      "dataset.list_records",
      "dataset.filter_records",
    ],
    dependencies: [
      "domain-core",
    ],
    events: {
      publishes: [
      "dataset.record.created",
      "dataset.record.updated",
      ],
      consumes: [

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
