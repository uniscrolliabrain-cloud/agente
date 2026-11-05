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
import { currentTenantScope } from "../../tenant-scope.ts";

export interface SubscriberHandle {
  unsubscribe(): void;
}

export interface SubscribeOptions {
  /** Authorized tenant. Without a scope, legacy callers use owner as tenant. */
  tenantId?: string;
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
    const tenantId = options.tenantId ?? currentTenantScope()?.tenantId ?? owner;
    if (!tenantId.trim() || !owner.trim()) throw new Error("Event subscription requires tenant and owner");
    const scope = currentTenantScope();
    if (scope && scope.tenantId !== tenantId) throw new Error("Event subscription tenant mismatch");
    return this.register(JSON.stringify([tenantId, owner]), onEvent, options);
  }

  /** Server consumers process events for this owner in every tenant. HTTP uses subscribe. */
  subscribeInternal(owner: string, onEvent: (event: SystemEvent) => void): SubscriberHandle {
    return this.register(JSON.stringify([null, owner]), onEvent, {});
  }

  private register(key: string, onEvent: (event: SystemEvent) => void, options: SubscribeOptions): SubscriberHandle {
    const id = `sub-${++this.nextId}`;
    const sub: Subscriber = {
      id,
      onEvent,
      types: options.types ? new Set(options.types) : null,
    };
    let set = this.subscribers.get(key);
    if (!set) {
      set = new Set();
      this.subscribers.set(key, set);
    }
    set.add(sub);
    return {
      unsubscribe: () => {
        const s = this.subscribers.get(key);
        if (!s) return;
        s.delete(sub);
        if (s.size === 0) this.subscribers.delete(key);
      },
    };
  }

  /** Llamado por EventBus.emit tras persistir. Fire-and-forget. */
  publish(event: SystemEvent): void {
    if (!event.tenantId?.trim() || !event.owner?.trim()) return;
    const scoped = this.subscribers.get(JSON.stringify([event.tenantId, event.owner]));
    const internal = this.subscribers.get(JSON.stringify([null, event.owner]));
    for (const sub of [...(scoped ?? []), ...(internal ?? [])]) {
      if (sub.types && !sub.types.has(event.type)) continue;
      try {
        sub.onEvent(event);
      } catch {
        // Un subscriber que rompe no puede tumbar el bus.
      }
    }
  }

  count(owner?: string, tenantId?: string): number {
    if (owner) return this.subscribers.get(JSON.stringify([tenantId ?? currentTenantScope()?.tenantId ?? owner, owner]))?.size ?? 0;
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
