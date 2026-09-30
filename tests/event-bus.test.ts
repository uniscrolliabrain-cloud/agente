// EVENTBUS_STRICT_TEST — valida que todo tipo de SYSTEM_EVENT_TYPES tiene schema y que
// un payload minimo valido no revienta al emitir. Ademas, falla si un tipo del enum no
// aparece en ningun bus.emit del repo (defensa contra schemas decorativos).
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import { createStore } from "../apps/server/src/db.ts";
import { EventBus } from "../apps/server/src/engine/events/index.ts";
import { SYSTEM_EVENT_TYPES } from "../apps/server/src/engine/events/types.ts";
import { payloadSchemas } from "../apps/server/src/engine/events/schemas.ts";

const minimalPayload: Record<string, Record<string, unknown>> = {
  "task.created": { title: "T", kind: "agent" },
  "task.status_changed": { from: "queued", to: "running" },
  "task.completed": { title: "T" },
  "task.failed": { title: "T" },
  "task.waiting_input": { title: "T" },
  "task.waiting_approval": { title: "T" },
  "task.controlled": { action: "pause" },
  "sop.step_started": { index: 0, title: "T" },
  "sop.step_completed": { index: 0, title: "T" },
  "sop.step_skipped": { index: 0, title: "T" },
  "sop.failed": {},
  "action.proposed": { title: "T", kind: "email.send" },
  "action.approved": { title: "T" },
  "action.denied": { title: "T" },
  "action.executed": { title: "T" },
  "action.failed": { title: "T" },
  "action.outcome_unknown": { title: "T" },
  "monitor.check": { url: "https://example.com", matched: false },
  "monitor.changed": { url: "https://example.com", excerpt: "x" },
  "monitor.failed": { url: "https://example.com" },
  "system.startup": { mode: "sample" },
  "system.error": { message: "x" },
  "system.maintenance": { tasks: 0, monitors: 0 },
  "system.google_disconnected": { owner: "o" },
  "auth.login": { userId: "u" },
  "auth.login_failed": { email: "e@e.com" },
};

test("todo SystemEventType tiene schema y un payload minimo valido", () => {
  for (const type of SYSTEM_EVENT_TYPES) {
    const schema = payloadSchemas[type];
    assert.ok(schema, `falta schema para ${type}`);
    const payload = minimalPayload[type];
    assert.ok(payload, `falta payload minimo para ${type} en el test`);
    const parsed = schema.safeParse(payload);
    assert.ok(
      parsed.success,
      `payload minimo invalido para ${type}: ${parsed.success ? "" : JSON.stringify(parsed.error.issues)}`,
    );
  }
});

test("EventBus.emit no lanza con ningun tipo del enum", async () => {
  const db = await createStore();
  try {
    const bus = new EventBus(db);
    for (const type of SYSTEM_EVENT_TYPES) {
      await bus.emit("owner", type, { kind: "system", id: "test" }, minimalPayload[type]);
    }
    const stored = await db.list("owner", "system-events");
    assert.ok(stored.length >= 1, "el bus no escribio nada");
  } finally {
    await db.close();
  }
});

test("todo SystemEventType del enum aparece en algun bus.emit del repo", async () => {
  const root = (Get-Location).Path;
  const skipDirs = new Set(["node_modules", ".git", "dist", "artifacts", "backups", ".openmuse"]);
  const files: string[] = [];
  async function walk(dir: string) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      if (skipDirs.has(entry.name)) continue;
      const full = join(dir, entry.name);
      if (entry.isDirectory()) await walk(full);
      else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) files.push(full);
    }
  }
  await walk(join(root, "apps"));
  await walk(join(root, "packages"));
  const sources: string[] = [];
  for (const file of files) sources.push(await readFile(file, "utf8"));
  const blob = sources.join("\n");
  const missing: string[] = [];
  for (const type of SYSTEM_EVENT_TYPES) {
    const pattern = new RegExp(`["'\`]${type.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["'\`]`);
    if (!pattern.test(blob)) missing.push(type);
  }
  assert.deepEqual(
    missing,
    [],
    `estos tipos estan declarados pero no se emiten en ningun sitio: ${missing.join(", ")}`,
  );
});