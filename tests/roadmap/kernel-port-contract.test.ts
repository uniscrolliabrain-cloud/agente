// B-31 - test de contrato entre KernelPort (dominio) y Kernel (implementacion).
import { test } from "node:test";
import assert from "node:assert/strict";
import { Kernel } from "../../apps/server/src/kernel/kernel.ts";
import type { KernelPort } from "../../packages/domain/src/kernel.ts";

test("B-31: Kernel implementa KernelPort", () => {
  const proto = Kernel.prototype as unknown as Record<string, unknown>;
  const methods: Array<keyof KernelPort> = [
    "openTurn", "openChildTurn", "closeTurn",
    "appendThought", "thoughtsOf", "listTurns", "listOpenTurnsForThread",
  ];
  for (const m of methods) {
    assert.equal(typeof proto[m as string], "function", `Kernel.${String(m)} debe existir`);
  }
});