// TRANS01_S01_COMPUTER_AUTHZ_V1 - computer_command deja de saltarse la
// autorizacion cuando falta governance o el rol fue borrado, y no despacha
// tras un abort. No duplica el executor ni cambia los otros pasos del SOP.
import assert from "node:assert/strict";
import { test } from "node:test";
import { SOPExecutor } from "../apps/server/src/engine/sop-executor.ts";

type Calls = { start: number; execute: number };

function fakeService(options: {
  governance?: unknown;
  role?: Record<string, unknown> | null;
  allowed?: boolean;
}) {
  const calls: Calls = { start: 0, execute: 0 };
  const service = {
    governance: options.governance,
    db: {
      get: async () => (options.role === undefined ? null : options.role),
    },
    computer: {
      start: async () => {
        calls.start += 1;
      },
      execute: async () => {
        calls.execute += 1;
        return { status: "succeeded", stdout: "ok", stderr: "" };
      },
    },
  };
  return { service, calls };
}

const governanceAllowing = {
  canExecuteTool: async () => ({ allowed: true }),
  canExecuteAction: async () => ({ allowed: true }),
};

const governanceDenying = {
  canExecuteTool: async () => ({ allowed: false, reason: "tool denied" }),
  canExecuteAction: async () => ({ allowed: false, reason: "tool denied" }),
};

const task = {
  id: "task-sop",
  tenantId: "tenant-sop",
  input: {},
  state: { roleId: "role-1" },
  prompt: "limpia",
} as never;

const step = {
  id: "s1",
  title: "comando",
  tool: "computer_command",
  params: { command: "echo hi" },
} as never;

function context(aborted = false) {
  const controller = new AbortController();
  if (aborted) controller.abort();
  return { signal: controller.signal, checkpoint: async () => {} } as never;
}

async function runStep(service: unknown, ctx: unknown) {
  const executor = new SOPExecutor(service as never, undefined, undefined, undefined);
  const call = (
    executor as unknown as {
      runStep: (
        owner: string,
        sop: unknown,
        step: unknown,
        task: unknown,
        ctx: unknown,
        results: Record<string, unknown>,
      ) => Promise<unknown>;
    }
  ).runStep.bind(executor);
  return call("owner-sop", { id: "sop", name: "SOP", steps: [] }, step, task, ctx, {});
}

test("sin governance un paso con rol no ejecuta el comando", async () => {
  const { service, calls } = fakeService({ role: { id: "role-1", name: "Agent" } });
  await assert.rejects(runStep(service, context()), /requires governance/);
  assert.equal(calls.start, 0);
  assert.equal(calls.execute, 0);
});

test("un rol borrado no permite el comando", async () => {
  const { service, calls } = fakeService({ governance: governanceAllowing, role: null });
  await assert.rejects(runStep(service, context()), /not found for authz/);
  assert.equal(calls.start, 0);
  assert.equal(calls.execute, 0);
});

test("una denegacion de governance no llega al computer", async () => {
  const { service, calls } = fakeService({
    governance: governanceDenying,
    role: { id: "role-1", name: "Agent" },
    allowed: false,
  });
  await assert.rejects(runStep(service, context()), /tool denied/);
  assert.equal(calls.start, 0);
  assert.equal(calls.execute, 0);
});

test("con autorizacion el comando se ejecuta una vez", async () => {
  const { service, calls } = fakeService({
    governance: governanceAllowing,
    role: { id: "role-1", name: "Agent" },
    allowed: true,
  });
  const receipt = (await runStep(service, context())) as { status?: string };
  assert.equal(receipt.status, "succeeded");
  assert.equal(calls.start, 1);
  assert.equal(calls.execute, 1);
});

test("un contexto abortado no inicia el computer", async () => {
  const { service, calls } = fakeService({
    governance: governanceAllowing,
    role: { id: "role-1", name: "Agent" },
    allowed: true,
  });
  await assert.rejects(runStep(service, context(true)), /aborted/);
  assert.equal(calls.start, 0);
  assert.equal(calls.execute, 0);
});
