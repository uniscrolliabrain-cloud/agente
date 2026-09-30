import assert from "node:assert/strict";
import { test } from "node:test";
import { StateMachineEngine, stateMachineSchema } from "../apps/server/src/engine/policy/state-machine.ts";

const machine = stateMachineSchema.parse({
  id: "job",
  entityType: "job",
  initial: "nuevo",
  states: ["nuevo", "asignado", "en_curso", "completado"],
  transitions: [
    { from: "nuevo", to: "asignado", action: "assign_technician" },
    { from: "asignado", to: "en_curso", action: "start_job" },
    { from: "en_curso", to: "completado", action: "finish_job", roleId: "operaciones" },
  ],
});

test("stateMachineSchema rechaza estados inexistentes en transiciones", () => {
  assert.throws(() =>
    stateMachineSchema.parse({
      id: "bad", entityType: "x", initial: "a", states: ["a", "b"],
      transitions: [{ from: "a", to: "c", action: "go" }],
    }),
  );
});

test("transicion permitida devuelve from/to/action", async () => {
  const engine = new StateMachineEngine();
  const result = await engine.transition("owner", machine, "job-1", "nuevo", "asignado");
  assert.equal(result.from, "nuevo");
  assert.equal(result.to, "asignado");
  assert.equal(result.action, "assign_technician");
});

test("transicion no declarada lanza 409", async () => {
  const engine = new StateMachineEngine();
  await assert.rejects(
    engine.transition("owner", machine, "job-1", "nuevo", "completado"),
    /not allowed/i,
  );
});

test("transicion con roleId fija: solo ese rol puede ejecutarla", async () => {
  const engine = new StateMachineEngine();
  const ok = await engine.transition("owner", machine, "job-1", "en_curso", "completado", "operaciones");
  assert.equal(ok.to, "completado");
  await assert.rejects(
    engine.transition("owner", machine, "job-1", "en_curso", "completado", "legal"),
    /cannot execute/i,
  );
});

test("transicion sin roleId declarado admite cualquier rol", async () => {
  const engine = new StateMachineEngine();
  const result = await engine.transition("owner", machine, "job-1", "nuevo", "asignado", "cualquier-rol");
  assert.equal(result.to, "asignado");
});
