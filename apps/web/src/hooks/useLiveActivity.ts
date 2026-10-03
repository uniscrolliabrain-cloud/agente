// BUG01_LIVEACTIVITY_V2 - reducer con acciones tipadas; sin stale_check falso.
import { useEffect, useReducer, useRef } from "react";
import { applyEvent, type BusEvent, type LiveState } from "../lib/applyEvent";

export interface UseLiveActivityOptions {
  streamUrl?: string;
  poll: (sinceId?: string) => Promise<BusEvent[]>;
  pollMs?: number;
}

type Action =
  | { type: "feed"; event: BusEvent }
  | { type: "reset" };

function reducer(state: LiveState, action: Action): LiveState {
  switch (action.type) {
    case "feed":
      return applyEvent(state, action.event);
    case "reset":
      return new Map();
    default:
      return state;
  }
}

export function useLiveActivity(opts: UseLiveActivityOptions): LiveState {
  const [state, dispatch] = useReducer(reducer, new Map() as LiveState);
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
      dispatch({ type: "feed", event: e });
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

    return () => {
      stop = true;
      es?.close();
      if (tm) clearTimeout(tm);
    };
  }, [opts.streamUrl]);

  return state;
}

export type { BusEvent, LiveState };
export { applyEvent };