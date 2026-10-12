// KERNEL_SUBSCRIBER_EVENTS_V1
import type { Kernel } from "../kernel.ts";
import { kernelContextSchema } from "../context/kernel-context.ts";
import type { EventSubscriberRegistry } from "../../engine/events/subscriber.ts";
import type { SystemEvent } from "../../engine/events/types.ts";
// LOG_KERNEL_SUBSCRIBERS_V1
import { logInfo } from "../../log.ts";

const MAPPING: Record<string, { role: string; content: (e: SystemEvent) => Record<string, unknown> }> = {
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
  owners: string[],
): { stop(): void } {
  const handles = owners.map((owner) =>
    subscribers.subscribe(owner, (event: SystemEvent) => {
      const mapping = MAPPING[event.type];
      if (!mapping) return;
      // LOG_KERNEL_SUBSCRIBERS_USED_V1
      logInfo("kernel.subscriber.received", { eventType: event.type, sourceId: event.source.id });
      const parsed = kernelContextSchema.safeParse({
        tenantId: event.tenantId,
        owner: event.owner,
        role: "system",
        requestId: `kernel-subscriber:${event.id}`,
        ...(event.correlationId ? { correlationId: event.correlationId } : {}),
      });
      if (!parsed.success) return;
      void (async () => {
        try {
          const turn = await kernel.openTurn(parsed.data, `bus:${event.type}:${event.id}`);
          const now = new Date().toISOString();
          await kernel.appendThought(parsed.data, {
            turnId: turn.id,
            actor: { kind: "system", id: "bus-subscriber" },
            role: mapping.role as never,
            content: mapping.content(event),
            attention: {
              id: `${event.id}-attention`,
              author: "system",
              primary: event.source.id,
              secondary: [],
              query: `event:${event.type}`,
              matched: [{ node: event.source.id, weight: 1, reason: "event source", metadata: {} }],
              ignored: [],
              intent: event.type,
              confidence: 1,
              scope: "turn",
              timestamp: now,
              metadata: { eventId: event.id, sourceKind: event.source.kind },
            },
            context: { entities: [], policies: [], skills: [], priorThoughts: [] },
            edges: [],
            provenance: { source: "bus.subscriber", timestamp: now, ...(event.correlationId ? { correlationId: event.correlationId } : {}) },
          });
          // KERNEL_EVENTS_CLOSE_GUARD_V1 - solo cerrar si sigue abierto.
          const stillOpen = await kernel.getTurn(parsed.data, turn.id).catch(() => undefined);
          if (stillOpen && stillOpen.status === "open") {
            await kernel.closeTurn(parsed.data, turn.id, "quiescence", "system");
          }
        } catch {
          /* best-effort */
        }
      })();
    }),
  );
  return {
    stop() {
      for (const h of handles) h.unsubscribe();
    },
  };
}