export const SYSTEM_EVENT_TYPES = [
  "task.created",
  "task.status_changed",
  "task.completed",
  "task.failed",
  "task.waiting_input",
  "task.waiting_approval",
  "task.controlled",
  "sop.step_started",
  "sop.step_completed",
  "sop.step_skipped",
  "sop.failed",
  "action.proposed",
  "action.approved",
  "action.denied",
  "action.executed",
  "action.failed",
  "action.outcome_unknown",
  "monitor.check",
  "monitor.changed",
  "monitor.failed",
  "system.startup",
  "system.error",
  "system.maintenance",
  "system.google_disconnected",
  "auth.login",
  "auth.login_failed",
  // A2_EVENTS_V1 - undo diferido y cancelacion de acciones.
  "action.deferred",
  "action.cancelled",
  // D2_VIEW_RESOLVED_V1 - el agente sirve una vista.
  "view.resolved",
  // EVENTS_V2 â€” business graph, policy, state machine, agent runtime, context.
  "entity.created",
  "entity.updated",
  "entity.deleted",
  "relation.created",
  "relation.deleted",
  "policy.evaluated",
  "policy.denied",
  "state.changed",
  "state.transition_denied",
  "agent.runtime_spawned",
  "agent.runtime_completed",
  "agent.runtime_failed",
  "context.assembled",
  // VERIFICATION_EVENT_V1
  "verification.executed",
  "verification.disagreement",
] as const;

export type SystemEventType = (typeof SYSTEM_EVENT_TYPES)[number];

export interface SystemEventSource {
  kind: "task" | "sop" | "action" | "monitor" | "system" | "auth" | "entity" | "relation" | "policy" | "state" | "agent" | "context";
  id: string;
}

export interface SystemEvent<T = Record<string, unknown>> {
  id: string;
  schemaVersion: "1.0";
  tenantId: string;
  owner: string;
  type: SystemEventType;
  emittedAt: string;
  source: SystemEventSource;
  correlationId?: string;
  causationId?: string;
  payload: T;
}

export interface EventFilter {
  type?: SystemEventType | SystemEventType[];
  since?: string;
  until?: string;
  limit?: number;
  sourceId?: string;
  projectId?: string;
  // EVENTS_SINCE_ID_V1 - polling incremental.
  sinceId?: string;
}

export interface EventAggregate {
  type: SystemEventType;
  count: number;
}

export interface EventSink {
  write(event: SystemEvent): Promise<void>;
}

export interface EventQuery {
  recent(owner: string, filter: EventFilter): Promise<SystemEvent[]>;
  aggregate(owner: string, hours: number): Promise<EventAggregate[]>;
}