// A2_APPLY_EVENT_V1 - reducer puro SystemEvent -> LiveActivity.
import type { LiveActivity } from "@openmuse/domain/live";

export interface BusEvent {
  id: string;
  type: string;
  at: number;
  payload?: Record<string, unknown>;
}

export type LiveState = Map<string, LiveActivity[]>;

function upsert(state: LiveState, itemId: string, activity: LiveActivity): LiveState {
  const next = new Map(state);
  const list = next.get(itemId) ?? [];
  const filtered = list.filter((a) => a.kind !== activity.kind);
  next.set(itemId, [...filtered, activity]);
  return next;
}

function remove(state: LiveState, itemId: string, kind?: string): LiveState {
  const next = new Map(state);
  if (!kind) {
    next.delete(itemId);
    return next;
  }
  const list = next.get(itemId) ?? [];
  const filtered = list.filter((a) => a.kind !== kind);
  if (filtered.length === 0) next.delete(itemId);
  else next.set(itemId, filtered);
  return next;
}

export function applyEvent(prev: LiveState, ev: BusEvent): LiveState {
  const p = (ev.payload ?? {}) as Record<string, unknown>;
  const taskId = typeof p.taskId === "string" ? p.taskId : undefined;
  const actionId = typeof p.actionId === "string" ? p.actionId : undefined;

  switch (ev.type) {
    case "sop.step_started": {
      if (!taskId) return prev;
      return upsert(prev, taskId, {
        kind: "progress",
        id: taskId,
        label: typeof p.title === "string" ? p.title : "procesando",
        value: typeof p.index === "number" ? p.index : 0,
        max: typeof p.total === "number" ? p.total : 1,
      });
    }
    case "task.status_changed": {
      if (!taskId) return prev;
      const to = typeof p.to === "string" ? p.to : "";
      if (to === "running") {
        return upsert(prev, taskId, { kind: "timer", id: taskId, label: "corriendo", startedAt: ev.at });
      }
      if (to === "failed") {
        return upsert(prev, taskId, { kind: "error", id: taskId, label: "fallo", at: ev.at });
      }
      return prev;
    }
    case "task.completed": {
      if (!taskId) return prev;
      return upsert(prev, taskId, { kind: "done", id: taskId, label: "completado", at: ev.at });
    }
    case "action.deferred": {
      if (!actionId) return prev;
      const signers = Array.isArray(p.signers) ? p.signers.length : 0;
      const needed = typeof p.needed === "number" ? p.needed : 1;
      const executeAt = typeof p.executeAt === "number" ? p.executeAt : null;
      if (executeAt === null) {
        return upsert(prev, actionId, {
          kind: "alert",
          id: actionId,
          label: `Firma ${signers}/${needed}`,
          since: ev.at,
        });
      }
      return remove(prev, actionId);
    }
    case "action.executed":
    case "action.cancelled":
    case "action.failed": {
      if (!actionId) return prev;
      return remove(prev, actionId);
    }
    default:
      return prev;
  }
}

export function markStale(state: LiveState, now: number, thresholdMs = 300000): LiveState {
  const next = new Map(state);
  for (const [id, list] of next) {
    const hasActive = list.some((a) => a.kind === "timer" || a.kind === "progress" || a.kind === "pulse");
    if (!hasActive) continue;
    const hasStale = list.some((a) => a.kind === "stale");
    if (hasStale) continue;
    next.set(id, [...list, { kind: "stale", id, lastSeen: now - thresholdMs }]);
  }
  return next;
}