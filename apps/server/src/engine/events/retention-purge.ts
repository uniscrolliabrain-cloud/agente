// RETENTION_PURGE_WIRE_V1
import type { Store } from "../db.ts";
import { retentionDaysFor } from "./retention.ts";

export interface PurgeReport {
  purged: Array<{ kind: string; days: number; removed: number }>;
  generatedAt: string;
}

const KERNEL_KINDS = [
  "kernel-thought-index",
  "kernel-turn-index",
  "kernel-audit-index",
  "meta-hints",
  // RETENTION_PURGE_KINDS_V1 - anadidos: dead letter y audit entries.
  "dead-letter",
  "audit-entries",
];

export async function purgeKernelRetention(
  db: Store,
  extraKinds: Record<string, number> = {},
): Promise<PurgeReport> {
  const report: PurgeReport = { purged: [], generatedAt: new Date().toISOString() };
  for (const kind of KERNEL_KINDS) {
    const days = extraKinds[kind] ?? 90;
    try {
      const removed = await db.purgeOlderThan(kind, days);
      report.purged.push({ kind, days, removed });
    } catch {
      report.purged.push({ kind, days, removed: 0 });
    }
  }
  return report;
}

export function retentionDaysForEvent(type: string): number {
  return retentionDaysFor(type as never);
}