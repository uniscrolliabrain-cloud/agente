// AGENT_PERSONA_TEST_V1 - verifica que los schemas validan correctamente.
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  agentPersonaSchema,
  agentStatsSchema,
} from "../packages/domain/src/agent-persona.ts";
import { computeStats } from "../apps/server/src/engine/agents/personas/stats.ts";
import { activityForPersona } from "../apps/server/src/engine/agents/personas/activity.ts";
import { createStore } from "../apps/server/src/db.ts";
import type { AgentTask } from "../packages/domain/src/agent.ts";
test("agentPersonaSchema: valida una persona minima (Laia)", () => {
  const result = agentPersonaSchema.safeParse({
    id: "laia",
    displayName: "Laia",
    role: "Asistente secretaria",
    personality: {
      traits: ["cool", "ambiciosa", "humilde"],
      tone: "informal-joven",
      formality: "tu",
      quirks: ["sabe controlarse", "sabe disfrutar"],
    },
    capabilities: {
      domains: ["all"],
      scope: "asistencia-transversal",
      knowsEveryone: true,
    },
    values: [
      { id: "humanismo", weight: 0.9 },
      { id: "lucidez", weight: 0.85 },
    ],
    language: "es",
  });
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.id, "laia");
    assert.equal(result.data.displayName, "Laia");
    assert.equal(result.data.capabilities.knowsEveryone, true);
    assert.equal(result.data.values.length, 2);
  }
});

test("agentPersonaSchema: rechaza id con mayusculas", () => {
  const result = agentPersonaSchema.safeParse({
    id: "Laia",
    displayName: "Laia",
    role: "Asistente",
    personality: { traits: [], tone: "cool", formality: "tu", quirks: [] },
    capabilities: {
      domains: [],
      scope: "all",
      knowsEveryone: false,
      crossTenant: false,
    },
    values: [],
    language: "es",
  });
  assert.equal(result.success, false);
});

test("agentPersonaSchema: aplica defaults cuando faltan opcionales", () => {
  const result = agentPersonaSchema.safeParse({
    id: "juan",
    displayName: "Juan",
    role: "Finanzas",
    personality: { tone: "formal" },
    capabilities: { scope: "finanzas" },
    language: "es",
  });
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.personality.formality, "tu");
    assert.deepEqual(result.data.personality.traits, []);
    assert.deepEqual(result.data.capabilities.domains, ["all"]);
    assert.equal(result.data.capabilities.knowsEveryone, false);
    assert.deepEqual(result.data.values, []);
    assert.deepEqual(result.data.peers, []);
    assert.deepEqual(result.data.metadata, {});
  }
});

test("agentStatsSchema: valida stats del agente principal (Lvl 9)", () => {
  const result = agentStatsSchema.safeParse({
    level: 9,
    archetype: "orchestrator",
    totalTasks: 1247,
    precision: 0.982,
    avgTimeMs: 12000,
    uptime: 0.999,
    status: "online",
  });
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.archetype, "orchestrator");
    assert.equal(result.data.level, 9);
    assert.equal(result.data.status, "online");
  }
});

test("agentStatsSchema: rechaza precision fuera de rango", () => {
  const result = agentStatsSchema.safeParse({
    level: 5,
    archetype: "hunter",
    totalTasks: 100,
    precision: 1.5,
    avgTimeMs: 1000,
    uptime: 0.99,
    status: "online",
  });
  assert.equal(result.success, false);
});

test("agentStatsSchema: rechaza arquetipo desconocido", () => {
  const result = agentStatsSchema.safeParse({
    level: 3,
    archetype: "ninja",
    totalTasks: 10,
    precision: 0.9,
    avgTimeMs: 500,
    uptime: 0.9,
    status: "idle",
  });
  assert.equal(result.success, false);
});
// --- Tests de stats y activity (Macro C) ---

function makeTask(
  id: string,
  personaId: string,
  status: AgentTask["status"],
  minutesAgo: number,
): AgentTask {
  const created = new Date(Date.now() - minutesAgo * 60_000).toISOString();
  const updated = new Date(Date.now() - (minutesAgo - 1) * 60_000).toISOString();
  return {
    id,
    tenantId: "default",
    title: `Task ${id}`,
    prompt: "x",
    kind: "agent",
    status,
    plan: [],
    evidence: [],
    input: {},
    state: { roleId: personaId },
    createdAt: created,
    updatedAt: updated,
    attempts: 0,
    leaseId: null,
    leaseUntil: null,
    artifactIds: [],
    assignedTo: personaId,
  };
}

test("computeStats: sin tareas devuelve status offline", async () => {
  const db = await createStore();
  try {
    const stats = await computeStats(db, "owner", "laia", "assistant");
    assert.equal(stats.status, "offline");
    assert.equal(stats.totalTasks, 0);
    assert.equal(stats.level, 1);
  } finally {
    await db.close();
  }
});

test("computeStats: tarea running devuelve status working", async () => {
  const db = await createStore();
  try {
    await db.put("owner", "tasks", makeTask("t1", "laia", "running", 5));
    const stats = await computeStats(db, "owner", "laia", "assistant");
    assert.equal(stats.status, "working");
    assert.equal(stats.currentTask, "Task t1");
  } finally {
    await db.close();
  }
});

test("computeStats: cuenta tareas succeeded y calcula precision", async () => {
  const db = await createStore();
  try {
    for (let i = 0; i < 4; i++) {
      await db.put("owner", "tasks", makeTask(`s${i}`, "laia", "succeeded", 10 + i));
    }
    await db.put("owner", "tasks", makeTask("f1", "laia", "failed", 20));
    const stats = await computeStats(db, "owner", "laia", "assistant");
    assert.equal(stats.totalTasks, 4);
    assert.ok(Math.abs(stats.precision - 0.8) < 0.01);
  } finally {
    await db.close();
  }
});

test("activityForPersona: ordena por updatedAt descendente", async () => {
  const db = await createStore();
  try {
    await db.put("owner", "tasks", makeTask("old", "laia", "succeeded", 60));
    await db.put("owner", "tasks", makeTask("recent", "laia", "running", 2));
    const entries = await activityForPersona(db, "owner", "laia");
    assert.equal(entries.length, 2);
    assert.equal(entries[0].taskId, "recent");
    assert.equal(entries[0].kind, "working");
    assert.equal(entries[1].kind, "success");
  } finally {
    await db.close();
  }
});

test("activityForPersona: ignora tareas de otros owners", async () => {
  const db = await createStore();
  try {
    await db.put("owner", "tasks", makeTask("mine", "laia", "succeeded", 5));
    await db.put("other", "tasks", makeTask("theirs", "laia", "succeeded", 5));
    const entries = await activityForPersona(db, "owner", "laia");
    assert.equal(entries.length, 1);
    assert.equal(entries[0].taskId, "mine");
  } finally {
    await db.close();
  }
});