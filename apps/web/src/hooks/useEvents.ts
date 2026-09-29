import { useCallback, useEffect, useRef, useState } from "react";
import {
  aggregateEvents,
  eventTimeline,
  listEvents,
  type EventAggregate,
  type ListOptions,
  type SystemEvent,
  type TimelineBucket,
} from "../api/events";

export function useEvents(
  enabled: boolean,
  options: ListOptions = {},
  intervalMs = 10000,
) {
  const [events, setEvents] = useState<SystemEvent[]>([]);
  const [aggregates, setAggregates] = useState<EventAggregate[]>([]);
  const [timeline, setTimeline] = useState<TimelineBucket[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const optionsKey = JSON.stringify(options);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    try {
      const parsed = JSON.parse(optionsKey) as ListOptions;
      const [nextEvents, nextAggregates, nextTimeline] = await Promise.all([
        listEvents({ ...parsed, limit: parsed.limit ?? 200 }),
        aggregateEvents(24),
        eventTimeline(24),
      ]);
      if (!mountedRef.current) return;
      setEvents(nextEvents);
      setAggregates(nextAggregates);
      setTimeline(nextTimeline);
      setError(null);
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err instanceof Error ? err.message : "Error cargando eventos");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [enabled, optionsKey]);

  useEffect(() => {
    if (!enabled) return;
    void refresh();
    const timer = window.setInterval(refresh, intervalMs);
    return () => window.clearInterval(timer);
  }, [enabled, intervalMs, refresh]);

  return { events, aggregates, timeline, error, loading, refresh };
}