// A2_USE_LIVE_ACTIVITY_V1 - polling a /api/events con sinceId, backoff y pausa.
import { useEffect, useReducer, useRef } from "react";
import { applyEvent, markStale, type BusEvent, type LiveState } from "../lib/applyEvent";

export interface UseLiveActivityOptions {
  streamUrl?: string;
  poll: (sinceId?: string) => Promise<BusEvent[]>;
  pollMs?: number;
}

export function useLiveActivity(opts: UseLiveActivityOptions): LiveState {
  const [state, dispatch] = useReducer(applyEvent, new Map() as LiveState);
  const lastId = useRef<string | undefined>(undefined);
  const optsRef = useRef(opts);
  optsRef.current = opts;

  useEffect(() => {
    let stop = false;
    let es: EventSource | undefined;
    let tm: ReturnType<typeof setTimeout> | undefined;
    let wait = optsRef.current.pollMs ?? 5000;

    const feed = (e: BusEvent) => {
      lastId.current = e.id;
      dispatch(e);
    };

    const startPolling = () => {
      const tick = async () => {
        if (stop) return;
        if (typeof document !== "undefined" && document.hidden) {
          tm = setTimeout(tick, 2000);
          return;
        }
        try {
          const events = await optsRef.current.poll(lastId.current);
          for (const e of events) feed(e);
          wait = optsRef.current.pollMs ?? 5000;
        } catch {
          wait = Math.min(wait * 2, 30000);
        }
        tm = setTimeout(tick, wait);
      };
      void tick();
    };

    if (opts.streamUrl && typeof window !== "undefined" && "EventSource" in window) {
      es = new EventSource(opts.streamUrl);
      es.onmessage = (m) => {
        try { feed(JSON.parse(m.data) as BusEvent); } catch { /* ignorar */ }
      };
      es.onerror = () => {
        es?.close();
        es = undefined;
        if (!stop && !tm) startPolling();
      };
    } else {
      startPolling();
    }

    const staleTimer = setInterval(() => {
      dispatch({ id: "stale-tick", type: "__stale_check__", at: Date.now() } as BusEvent);
    }, 60000);

    return () => {
      stop = true;
      clearInterval(staleTimer);
      es?.close();
      if (tm) clearTimeout(tm);
    };
  }, [opts.streamUrl]);

  return state;
}

// Re-export por conveniencia.
export type { BusEvent, LiveState };
export { applyEvent, markStale };