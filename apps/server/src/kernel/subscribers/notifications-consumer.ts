// KERNEL_NOTIFICATIONS_CONSUMER_V2 - notificaciones globales por tenant.

import type { Store } from "../../db.ts";
import type { SystemEvent } from "../../engine/events/types.ts";
import { globalSubscribers } from "../../engine/events/subscriber.ts";

const NOTIFY: Record<string, (e: SystemEvent) => { title: string; body: string } | null> = {
  "kernel.thought.critic": (e) => {
    const p = e.payload as Record<string, unknown>;
    const role = typeof p.role === "string" ? p.role : "critic";
    return {
      title: "Critica del kernel",
      body: `Rol ${role} emitio una critica en el turno ${String(p.turnId ?? "")}`,
    };
  },
  "verification.disagreement": (e) => {
    const p = e.payload as Record<string, unknown>;
    return {
      title: "Verificacion con desacuerdo",
      body: `Deterministico y LLM no coinciden para ${String(p.taskId ?? p.goalId ?? "objetivo")}`,
    };
  },
  "policy.denied": (e) => {
    const p = e.payload as Record<string, unknown>;
    return { title: "Politica denegada", body: String(p.reason ?? "Una accion fue denegada por politica") };
  },
};

export function startKernelNotificationsConsumer(
  db: Store,
  _owners: string[] = [],
): { stop(): void } {
  const handle = globalSubscribers.subscribeAll((event: SystemEvent) => {
    const builder = NOTIFY[event.type];
    if (!builder) return;
    const content = builder(event);
    if (!content) return;
    void db
      .insertIfAbsent(event.owner, "notifications", {
        id: `kn-${event.id}`,
        title: content.title.slice(0, 200),
        body: content.body.slice(0, 2000),
        createdAt: event.emittedAt,
        read: false,
      })
      .catch(() => {});
  });
  return {
    stop() {
      handle.unsubscribe();
    },
  };
}
