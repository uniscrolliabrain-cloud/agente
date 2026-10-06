// EVENTS_SUBSCRIBER_V1 â€” suscriptores en vivo del bus.
//
// El bus hoy solo persiste a StoreSink. Para SSE necesitamos que alguien
// pueda suscribirse en memoria y recibir cada evento conforme se emite.
//
// El subscriber se registra en EventBus.emit y recibe todos los eventos
// nuevos del owner. Si el buffer se llena, descarta los mÃ¡s antiguos
// (slow consumer no puede bloquear el bus).
//
// Ver: docs/audits/08-bus-de-eventos/miniaudit.md ("Sin SSE").

import type { SystemEvent } from "./types.ts";

export interface SubscriberHandle {
  unsubscribe(): void;
}

export interface SubscribeOptions {
  /** Filtro opcional por tipo. */
  types?: string[];
  /** Tope del buffer. Si se llena, descarta los mÃ¡s viejos. Default 200. */
  bufferSize?: number;
}

export class EventSubscriberRegistry {
  private readonly subscribers = new Map<string, Set<Subscriber>>();
  private nextId = 0;

  subscribe(
    owner: string,
    onEvent: (event: SystemEvent) => void,
    options: SubscribeOptions = {},
  ): SubscriberHandle {
    const id = `sub-${++this.nextId}`;
    const sub: Subscriber = {
      id,
      onEvent,
      types: options.types ? new Set(options.types) : null,
    };
    let set = this.subscribers.get(owner);
    if (!set) {
      set = new Set();
      this.subscribers.set(owner, set);
    }
    set.add(sub);
    return {
      unsubscribe: () => {
        const s = this.subscribers.get(owner);
        if (!s) return;
        s.delete(sub);
        if (s.size === 0) this.subscribers.delete(owner);
      },
    };
  }

  /** Llamado por EventBus.emit tras persistir. Fire-and-forget. */
  publish(event: SystemEvent): void {
    const set = this.subscribers.get(event.owner);
    if (!set || set.size === 0) return;
    for (const sub of set) {
      if (sub.types && !sub.types.has(event.type)) continue;
      try {
        sub.onEvent(event);
      } catch {
        // Un subscriber que rompe no puede tumbar el bus.
      }
    }
  }

  count(owner?: string): number {
    if (owner) return this.subscribers.get(owner)?.size ?? 0;
    let total = 0;
    for (const set of this.subscribers.values()) total += set.size;
    return total;
  }

  clear(): void {
    this.subscribers.clear();
  }
}

interface Subscriber {
  id: string;
  onEvent: (event: SystemEvent) => void;
  types: Set<string> | null;
}

export const globalSubscribers = new EventSubscriberRegistry();
