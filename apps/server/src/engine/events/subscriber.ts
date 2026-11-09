// EVENTS_SUBSCRIBER_V2 - suscriptores en vivo del bus con tres ambitos.
//
// V1 solo indexaba por owner. Eso mezclaba dos conceptos: el usuario que
// provoca el evento y la empresa donde ocurre. Ahora hay owner, tenant y "all".
// Los consumidores del kernel usan subscribeAll + event.tenantId, asi que un
// tenant nuevo no necesita reiniciar el proceso para tener cognicion.

import type { SystemEvent } from "./types.ts";

export interface SubscriberHandle {
  unsubscribe(): void;
}

export interface SubscribeOptions {
  /** Filtro opcional por tipo. */
  types?: string[];
  /** Tope del buffer. Si se llena, descarta los mas viejos. Default 200. */
  bufferSize?: number;
}

export class EventSubscriberRegistry {
  private readonly byOwner = new Map<string, Set<Subscriber>>();
  private readonly byTenant = new Map<string, Set<Subscriber>>();
  private readonly all = new Set<Subscriber>();
  private nextId = 0;

  private make(onEvent: (event: SystemEvent) => void, options: SubscribeOptions): Subscriber {
    return {
      id: `sub-${++this.nextId}`,
      onEvent,
      types: options.types ? new Set(options.types) : null,
    };
  }

  private add(
    map: Map<string, Set<Subscriber>>,
    key: string,
    sub: Subscriber,
  ): SubscriberHandle {
    let set = map.get(key);
    if (!set) {
      set = new Set();
      map.set(key, set);
    }
    set.add(sub);
    return {
      unsubscribe: () => {
        const current = map.get(key);
        if (!current) return;
        current.delete(sub);
        if (current.size === 0) map.delete(key);
      },
    };
  }

  /** Suscripcion por owner (SSE de un usuario). */
  subscribe(
    owner: string,
    onEvent: (event: SystemEvent) => void,
    options: SubscribeOptions = {},
  ): SubscriberHandle {
    return this.add(this.byOwner, owner, this.make(onEvent, options));
  }

  /** Suscripcion por tenant (consumidores de empresa). */
  subscribeTenant(
    tenantId: string,
    onEvent: (event: SystemEvent) => void,
    options: SubscribeOptions = {},
  ): SubscriberHandle {
    return this.add(this.byTenant, tenantId, this.make(onEvent, options));
  }

  /**
   * Suscripcion global. El consumidor decide con event.tenantId/owner.
   * Es el modo de los indices del kernel: no depende de enumerar owners al
   * arrancar ni de que owner coincida con tenantId.
   */
  subscribeAll(
    onEvent: (event: SystemEvent) => void,
    options: SubscribeOptions = {},
  ): SubscriberHandle {
    const sub = this.make(onEvent, options);
    this.all.add(sub);
    return {
      unsubscribe: () => {
        this.all.delete(sub);
      },
    };
  }

  /** Llamado por EventBus.emit tras persistir. Devuelve cuantos recibieron. */
  publish(event: SystemEvent): number {
    const seen = new Set<string>();
    let delivered = 0;
    const deliver = (sub: Subscriber) => {
      if (seen.has(sub.id)) return;
      seen.add(sub.id);
      if (sub.types && !sub.types.has(event.type)) return;
      try {
        sub.onEvent(event);
        delivered += 1;
      } catch {
        // Un subscriber que rompe no puede tumbar el bus.
      }
    };
    for (const sub of this.byOwner.get(event.owner) ?? []) deliver(sub);
    for (const sub of this.byTenant.get(event.tenantId) ?? []) deliver(sub);
    for (const sub of this.all) deliver(sub);
    return delivered;
  }

  count(owner?: string): number {
    if (owner) {
      return (this.byOwner.get(owner)?.size ?? 0) + this.all.size;
    }
    let total = this.all.size;
    for (const set of this.byOwner.values()) total += set.size;
    for (const set of this.byTenant.values()) total += set.size;
    return total;
  }

  clear(): void {
    this.byOwner.clear();
    this.byTenant.clear();
    this.all.clear();
  }
}

interface Subscriber {
  id: string;
  onEvent: (event: SystemEvent) => void;
  types: Set<string> | null;
}

export const globalSubscribers = new EventSubscriberRegistry();
