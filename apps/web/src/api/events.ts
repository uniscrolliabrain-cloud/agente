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

/**
   * EVENTS_SSE_CLIENT_V1 — cliente SSE con reconexión exponencial.
   * Ver: docs/audits/08-bus-de-eventos/roadmap.md §8.
   */
  export interface EventsStreamHandle {
    close(): void;
  }

  export function subscribeEvents(
    onEvent: (event: SystemEvent) => void,
    options: { types?: string[]; onError?: (err: Error) => void } = {},
  ): EventsStreamHandle {
    let backoff = 1000;
    let cancelled = false;
    let source: EventSource | null = null;

    const connect = () => {
      if (cancelled) return;
      const session = localStorage.getItem("openmuse_auth");
      const token = session ? (JSON.parse(session).token as string) : "";
      const url = new URL("/api/events/stream", window.location.origin);
      if (options.types?.length) url.searchParams.set("types", options.types.join(","));
      // EventSource no permite headers; pasamos el token por query.
      url.searchParams.set("token", token);
      source = new EventSource(url.toString());
      source.addEventListener("event", (e) => {
        try {
          onEvent(JSON.parse((e as MessageEvent).data) as SystemEvent);
        } catch {
          /* payload no JSON */
        }
        backoff = 1000;
      });
      source.addEventListener("ready", () => {
        backoff = 1000;
      });
      source.onerror = () => {
        source?.close();
        if (cancelled) return;
        options.onError?.(new Error("SSE disconnected"));
        backoff = Math.min(backoff * 2, 30000);
        setTimeout(connect, backoff);
      };
    };

    connect();
    return {
      close() {
        cancelled = true;
        source?.close();
      },
    };
  }

  export async function listEventTypes(): Promise<{ types: string[]; version: string }> {
  return apiFetch<{ types: string[]; version: string }>("/api/events/schemas");
}