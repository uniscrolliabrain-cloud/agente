// A2_LIVE_V1 - LiveActivity, prioridad, urgencia. Funcion pura, sin React.

export type LiveActivity =
  | { kind: "alert"; id: string; label: string; since: number; slaSec?: number; amount?: number }
  | { kind: "error"; id: string; label: string; at: number }
  | { kind: "pulse"; id: string; label: string }
  | { kind: "progress"; id: string; label: string; value: number; max: number; etaSec?: number }
  | { kind: "counter"; id: string; label: string; value: number }
  | { kind: "timer"; id: string; label: string; startedAt: number }
  | { kind: "queued"; id: string; position: number }
  | { kind: "stale"; id: string; lastSeen: number }
  | { kind: "done"; id: string; label: string; at: number };

export type LiveKind = LiveActivity["kind"];

const PRIORITY: Record<LiveKind, number> = {
  alert: 0,
  error: 1,
  stale: 2,
  pulse: 3,
  progress: 4,
  counter: 5,
  timer: 6,
  queued: 7,
  done: 8,
};

export function pickPrimary(list: readonly LiveActivity[]): LiveActivity | null {
  let best: LiveActivity | null = null;
  for (const a of list) {
    if (!best) { best = a; continue; }
    const d = PRIORITY[a.kind] - PRIORITY[best.kind];
    if (d < 0) best = a;
    else if (d === 0 && a.kind === "alert" && best.kind === "alert" && a.since > best.since)
      best = a;
  }
  return best;
}

export function alertUrgency(a: Extract<LiveActivity, { kind: "alert" }>): "soft" | "urgent" {
  return a.slaSec && a.since > a.slaSec * 0.5 ? "urgent" : "soft";
}

// FIX_02_LIVE_V2 - isStale eliminado (parámetros sin usar).