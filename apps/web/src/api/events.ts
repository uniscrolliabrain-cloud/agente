import { apiFetch } from "./client";

export interface SystemEvent {
  id: string;
  schemaVersion: string;
  owner: string;
  type: string;
  emittedAt: string;
  source: { kind: string; id: string };
  correlationId?: string;
  causationId?: string;
  payload: Record<string, unknown>;
}

export interface EventAggregate {
  type: string;
  count: number;
}

export interface TimelineBucket {
  hour: string;
  count: number;
}

export interface ListOptions {
  type?: string;
  taskId?: string;
  since?: string;
  until?: string;
  limit?: number;
}

export async function listEvents(options: ListOptions = {}): Promise<SystemEvent[]> {
  const params = new URLSearchParams();
  if (options.type) params.set("type", options.type);
  if (options.taskId) params.set("taskId", options.taskId);
  if (options.since) params.set("since", options.since);
  if (options.until) params.set("until", options.until);
  if (options.limit) params.set("limit", String(options.limit));
  const query = params.toString();
  const res = await apiFetch<{ events: SystemEvent[] }>(`/api/events${query ? `?${query}` : ""}`);
  return res.events;
}

export async function aggregateEvents(hours = 24): Promise<EventAggregate[]> {
  const res = await apiFetch<{ aggregates: EventAggregate[] }>(`/api/events/aggregate?hours=${hours}`);
  return res.aggregates;
}

export async function eventTimeline(hours = 24): Promise<TimelineBucket[]> {
  const res = await apiFetch<{ timeline: TimelineBucket[] }>(`/api/events/timeline?hours=${hours}`);
  return res.timeline;
}

export async function listEventTypes(): Promise<{ types: string[]; version: string }> {
  return apiFetch<{ types: string[]; version: string }>("/api/events/schemas");
}