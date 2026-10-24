// KERNEL_SUBSCRIBER_STATUS_V1
import type { Store } from "../../db.ts";

export interface KernelSubscriberStatus {
  subscribers: number;
  thoughtsIndexed: number;
  turnsIndexed: number;
  auditsIndexed: number;
  notificationsIndexed: number;
  generatedAt: string;
}

export async function kernelSubscriberStatus(db: Store): Promise<KernelSubscriberStatus> {
  // KERNEL_SUBSCRIBERS_STATUS_DB_V1
  const [thoughts, turns, audits, notifications] = await Promise.all([
    db.list("system", "kernel-thought-index", { limit: 1 }).catch(() => []),
    db.list("system", "kernel-turn-index", { limit: 1 }).catch(() => []),
    db.list("system", "kernel-audit-index", { limit: 1 }).catch(() => []),
    db.list("system", "notifications", { limit: 1 }).catch(() => []),
  ]);
  return {
    subscribers: 6,
    thoughtsIndexed: thoughts.length,
    turnsIndexed: turns.length,
    auditsIndexed: audits.length,
    notificationsIndexed: notifications.length,
    generatedAt: new Date().toISOString(),
  };
}