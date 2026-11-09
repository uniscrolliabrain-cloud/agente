// KERNEL_SUBSCRIBER_EVENTS_V2
//
// V2 corrige dos fallos:
//   - El contexto se construia sin actorId, que es obligatorio en
//     kernelContextSchema. El safeParse fallaba SIEMPRE y el subscriber no
//     hacia nada: la cognicion del kernel por bus estaba muerta.
//   - Se suscribia por owner y solo para los tenants enumerados al arrancar.
//     Ahora usa subscribeAll y el tenant real del evento, asi que un tenant
//     nuevo funciona sin reiniciar.
//
// Ademas el flujo pasa por runCognitionCycle (fases y cierre idempotente).

import type { Kernel } from "../kernel.ts";
import { kernelContextSchema } from "../context/kernel-context.ts";
import type { EventSubscriberRegistry } from "../../engine/events/subscriber.ts";
import type { SystemEvent } from "../../engine/events/types.ts";
import { logInfo, logWarn } from "../../log.ts";
import { runCognitionCycle } from "../cognition/cycle.ts";

const MAPPING: Record<
  string,
  { role: string; content: (e: SystemEvent) => Record<string, unknown> }
> = {
  "entity.created": { role: "observation", content: (e) => ({ kind: "entity.created", payload: e.payload }) },
  "entity.updated": { role: "observation", content: (e) => ({ kind: "entity.updated", payload: e.payload }) },
  "entity.deleted": { role: "observation", content: (e) => ({ kind: "entity.deleted", payload: e.payload }) },
  "relation.created": { role: "observation", content: (e) => ({ kind: "relation.created", payload: e.payload }) },
  "relation.deleted": { role: "observation", content: (e) => ({ kind: "relation.deleted", payload: e.payload }) },
  "action.executed": { role: "action", content: (e) => ({ kind: "action.executed", payload: e.payload }) },
  "action.failed": { role: "critic", content: (e) => ({ kind: "action.failed", payload: e.payload }) },
  "action.denied": { role: "critic", content: (e) => ({ kind: "action.denied", payload: e.payload }) },
  "task.completed": { role: "reflection", content: (e) => ({ kind: "task.completed", payload: e.payload }) },
  "task.failed": { role: "critic", content: (e) => ({ kind: "task.failed", payload: e.payload }) },
  "sop.completed": { role: "reflection", content: (e) => ({ kind: "sop.completed", payload: e.payload }) },
  "sop.failed": { role: "critic", content: (e) => ({ kind: "sop.failed", payload: e.payload }) },
  "policy.denied": { role: "critic", content: (e) => ({ kind: "policy.denied", payload: e.payload }) },
  "state.changed": { role: "reflection", content: (e) => ({ kind: "state.changed", payload: e.payload }) },
  "state.transition_denied": { role: "critic", content: (e) => ({ kind: "state.transition_denied", payload: e.payload }) },
  "verification.executed": { role: "verifier", content: (e) => ({ kind: "verification.executed", payload: e.payload }) },
  "verification.disagreement": { role: "critic", content: (e) => ({ kind: "verification.disagreement", payload: e.payload }) },
};

export function startKernelEventSubscriber(
  kernel: Kernel,
  subscribers: EventSubscriberRegistry,
  _owners: string[] = [],
): { stop(): void } {
  const handle = subscribers.subscribeAll((event: SystemEvent) => {
    // KERNEL_SUBSCRIBER_NO_LOOP_V1 - los eventos del propio kernel no vuelven
    // a abrir turnos: seria realimentacion infinita.
    if (event.type.startsWith("kernel.")) return;
    const mapping = MAPPING[event.type];
    if (!mapping) return;

    logInfo("kernel.subscriber.received", {
      eventType: event.type,
      sourceId: event.source.id,
      tenantId: event.tenantId,
    });

    const parsed = kernelContextSchema.safeParse({
      tenantId: event.tenantId,
      owner: event.owner,
      role: "system",
      requestId: `kernel-subscriber:${event.id}`,
      actorId: "bus-subscriber",
      ...(event.correlationId ? { correlationId: event.correlationId } : {}),
    });
    if (!parsed.success) {
      // KERNEL_SUBSCRIBER_CONTEXT_LOG_V1 - antes se salia en silencio.
      logWarn("kernel.subscriber.invalid_context", {
        eventType: event.type,
        tenantId: event.tenantId,
        issues: parsed.error.issues.map((issue) => issue.path.join(".")).join(","),
      });
      return;
    }

    void (async () => {
      try {
        const now = new Date().toISOString();
        await runCognitionCycle(kernel, {
          ctx: parsed.data,
          trigger: `bus:${event.type}:${event.id}`,
          observation: {
            role: mapping.role as never,
            content: mapping.content(event),
            attention: {
              id: `${event.id}-attention`,
              author: "system",
              primary: event.source.id,
              secondary: [],
              query: `event:${event.type}`,
              matched: [
                {
                  node: event.source.id,
                  weight: 1,
                  reason: "explicit_reference",
                  metadata: {},
                },
              ],
              ignored: [],
              intent: event.type,
              confidence: 1,
              scope: "turn",
              timestamp: now,
              metadata: { eventId: event.id, sourceKind: event.source.kind },
            },
          },
          close: { reason: "quiescence", closedBy: "system" },
        });
      } catch (error) {
        logWarn("kernel.subscriber.failed", {
          eventType: event.type,
          tenantId: event.tenantId,
          error: error instanceof Error ? error.message : "unknown",
        });
      }
    })();
  });

  return {
    stop() {
      handle.unsubscribe();
    },
  };
}
