import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { test } from "node:test";
import { createStore } from "../apps/server/src/db.ts";
import { ActionService } from "../apps/server/src/actions.ts";
import { WorkspaceService, type WorkspaceEffect } from "../apps/server/src/workspace.ts";
import { GoogleAuth } from "../apps/server/src/google-auth.ts";
import { Files } from "../apps/server/src/files.ts";
import { RagService } from "../apps/server/src/engine/rag.ts";
import { GoogleClient } from "../packages/integrations/src/google.ts";
import { encryptSecret } from "../packages/integrations/src/vault.ts";
import { testConfig } from "./helpers/config.ts";

test("a failed Calendar cache deletion preserves the accepted provider response and never resends", async (t) => {
  const db = await createStore();
  try {
    const config = testConfig({ mode: "live", encryptionKey: randomBytes(32).toString("base64") });
    await db.put("owner", "credentials", {
      id: "google",
      connectionId: "connection",
      secret: encryptSecret(
        JSON.stringify({
          connectionId: "connection",
          account: "alice@example.test",
          accessToken: "local",
          expiresAt: Date.now() + 3600000,
          scopes: ["https://www.googleapis.com/auth/calendar.events"],
        }),
        config.encryptionKey!,
      ),
    });
    const cache = Object.create(db) as typeof db;
    cache.remove = async () => {
      throw Error("cache unavailable");
    };
    const auth = new GoogleAuth(db, config);
    const workspace = new WorkspaceService(cache, config, Object.create(Files.prototype), auth, new RagService(db));
    const client = new GoogleClient({ getAccessToken: async () => "local" });
    let calls = 0;
    t.mock.method(client, "deleteEvent", async () => {
      calls++;
    });
    t.mock.method(workspace, "google", () => client);
    let effect: WorkspaceEffect | undefined;
    const actions = new ActionService(db, {
      connected: async () => true,
      connection: async () => ({ id: "connection", account: "alice@example.test" }),
      prepare: async (_owner, input) => ({ input, targetVersion: '"r1"' }),
      execute: async (owner, input, connectionId, targetVersion) => {
        effect = await workspace.executeEffect(owner, input, connectionId, targetVersion);
        return effect.summary;
      },
    });
    const proposal = await actions.propose("owner", {
      kind: "calendar.delete",
      data: { eventId: "event", calendarId: "primary", title: "Synthetic" },
    });
    const result = await actions.decide("owner", proposal.id, proposal.hash, "approve");
    assert.equal(result.status, "succeeded", result.error);
    assert.match(result.result ?? "", /event/);
    assert.equal(effect?.mode, "live");
    assert.equal(effect?.state, "accepted");
    if (effect?.mode === "live")
      assert.deepEqual(effect.evidence, {
        family: "calendar",
        calendarId: "primary",
        eventId: "event",
        operation: "delete",
      });
    await actions.decide("owner", proposal.id, proposal.hash, "approve");
    assert.equal(calls, 1);
  } finally {
    await db.close();
  }
});
