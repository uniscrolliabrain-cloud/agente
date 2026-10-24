// KERNEL_SNAPSHOT_V1 — export/import del estado del grafo por tenant.
//
// Útil para:
//   - debug (reproducir un estado)
//   - recovery (restaurar un punto conocido)
//   - migración de tenant
//
// No reemplaza el audit trail: el snapshot es un atajo, el audit es la
// verdad. Si el snapshot y el audit discrepan, gana el audit.
//
// Ver: auditoría profunda 09.

import type { Kernel } from "./kernel.ts";
import { kernelContextSchema } from "./context/kernel-context.ts";
import type { Thought } from "./graph/thought.ts";
import type { Turn } from "./graph/turn.ts";

export interface KernelSnapshot {
  tenantId: string;
  exportedAt: string;
  turns: Turn[];
  thoughts: Thought[];
}

export async function exportKernelSnapshot(
  kernel: Kernel,
  tenantId: string,
  limit = 500,
): Promise<KernelSnapshot> {
  const ctx = kernelContextSchema.parse({
    tenantId,
    owner: "snapshot-exporter",
    role: "system",
    requestId: `snapshot:${Date.now()}`,
  });
  const turns = await kernel.listTurns(ctx, limit);
  const thoughts: Thought[] = [];
  for (const turn of turns) {
    const ts = await kernel.thoughtsOf(ctx, turn.id);
    thoughts.push(...ts);
  }
  return {
    tenantId,
    exportedAt: new Date().toISOString(),
    turns,
    thoughts,
  };
}

export interface ImportResult {
  imported: number;
  failed: number;
  errors: string[];
}

export async function importKernelSnapshot(
  kernel: Kernel,
  snapshot: KernelSnapshot,
): Promise<ImportResult> {
  const errors: string[] = [];
  let imported = 0;
  let failed = 0;
  // SNAPSHOT_IMPORT_TX_V1 - agrupamos los thoughts en lotes de 50 dentro de
  // una transaccion. Si un lote falla, se revierte el lote entero.
  const BATCH = 50;
  for (let i = 0; i < snapshot.thoughts.length; i += BATCH) {
    const batch = snapshot.thoughts.slice(i, i + BATCH);
    try {
      const store = kernel.deps.store as { transaction?: <T>(fn: () => Promise<T>) => Promise<T> };
      if (typeof store.transaction === "function") {
        await store.transaction(async () => {
          for (const thought of batch) await kernel.deps.store.append(thought);
        });
      } else {
        for (const thought of batch) await kernel.deps.store.append(thought);
      }
      imported += batch.length;
    } catch (error) {
      failed += batch.length;
      errors.push(
        `batch ${i / BATCH}: ${error instanceof Error ? error.message : "unknown"}`,
      );
    }
  }
  return { imported, failed, errors: errors.slice(0, 20) };
}
