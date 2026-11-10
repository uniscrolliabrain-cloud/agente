import assert from "node:assert/strict";
import { test } from "node:test";
import { ALL_WORKSPACES } from "../packages/workspaces/src/index.ts";
import { withDefaultViews } from "../apps/server/src/engine/workspaces/default-views.ts";

test("every workspace exposes at least one view", () => {
  for (const workspace of ALL_WORKSPACES) {
    const normalized = withDefaultViews(workspace);
    assert.ok(normalized.views.length > 0, `${workspace.manifest.id} no tiene vistas`);
    assert.ok(normalized.views[0]?.query, `${workspace.manifest.id} no tiene query`);
  }
});
