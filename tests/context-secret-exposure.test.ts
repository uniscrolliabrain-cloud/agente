import assert from "node:assert/strict";
import { test } from "node:test";
import { renderContext } from "../apps/server/src/engine/context/assembly.ts";
import { ContextEngine } from "../apps/server/src/engine/context/engine.ts";

test("el payload de un evento no llega al prompt, a la telemetría de ensamblado ni a la consola", async (t) => {
  const token = "a09-fake-channel-token-71b4";
  const event = {
    type: "channel.connected",
    emittedAt: "2026-11-07T12:00:00.000Z",
    payload: { token },
  };
  const emitted: unknown[][] = [];
  const consoleSpies = [
    t.mock.method(console, "debug"),
    t.mock.method(console, "info"),
    t.mock.method(console, "log"),
    t.mock.method(console, "warn"),
    t.mock.method(console, "error"),
  ];
  const dependencies = [
    {
      get: async () => ({ id: "laia", name: "Laia", tone: "concise", objetivo: "Revisar conexiones" }),
      list: async () => [],
    },
    {
      getEntity: async () => ({ id: "channel", type: "channel", name: "Canal", properties: {} }),
      listRelations: async () => [],
    },
    { recall: async () => ({ ragHits: [] }) },
    {
      list: async () => [event],
      emit: async (...args: unknown[]) => { emitted.push(args); },
    },
  ] as unknown as ConstructorParameters<typeof ContextEngine>;

  const context = await new ContextEngine(...dependencies).assemble("tenant-a", {
    roleId: "laia",
    query: "estado del canal",
    entityId: "channel",
  });

  assert.equal(context.events[0]?.payload.token, token, "el evento de entrada contiene el testigo");
  const prompt = renderContext(context);
  assert.match(prompt, /channel\.connected/, "se renderizó el evento con el payload sensible");
  assert.equal(emitted.length, 1);
  assert.equal(emitted[0]?.[1], "context.assembled");
  assert.equal(prompt.includes(token), false);
  assert.equal(JSON.stringify(emitted).includes(token), false);
  const consoleArgs = consoleSpies.flatMap((spy) => spy.mock.calls.map((call) => call.arguments));
  assert.equal(JSON.stringify(consoleArgs).includes(token), false);
});
