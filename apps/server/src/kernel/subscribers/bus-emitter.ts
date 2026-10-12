// KERNEL_SUBSCRIBER_BUS_EMITTER_V1
import type { Kernel } from "../kernel.ts";
import type { EventBus } from "../../engine/events/index.ts";
import type { Thought, ThoughtRole } from "../graph/thought.ts";
// LOG_BUS_EMITTER_V1
import { logInfo } from "../../log.ts";

const EMITTING_ROLES: ReadonlySet<ThoughtRole> = new Set([
  "action",
  "response",
  "reflection",
  "critic",
  "delegation",
]);

const TYPE_BY_ROLE: Record<string, string> = {
  action: "kernel.thought.action",
  response: "kernel.thought.response",
  reflection: "kernel.thought.reflection",
  critic: "kernel.thought.critic",
  delegation: "kernel.thought.delegation",
};

export class KernelBusEmitter {
  constructor(
    private readonly kernel: Kernel,
    private readonly bus: EventBus,
  ) {}

  attach(): void {
    // BUS_EMITTER_TURN_OPENED_V1
    this.kernel.deps.onTurnOpened = (turn) => {
      void this.bus
        .emit(
          turn.owner,
          "kernel.turn.opened" as never,
          { kind: "system", id: turn.id },
          {
            turnId: turn.id,
            owner: turn.owner,
            tenantId: turn.tenantId,
            triggers: turn.triggers,
          },
          { tenantId: turn.tenantId },
        )
        .catch(() => {});
    };
    this.kernel.deps.onThoughtAppended = (thought: Thought) => {
      if (!EMITTING_ROLES.has(thought.role)) return;
      const type = TYPE_BY_ROLE[thought.role];
      if (!type) return;
      // LOG_BUS_EMITTER_USED_V1
      logInfo("kernel.bus.emitting", { thoughtId: thought.id, role: thought.role });
      void this.bus
        .emit(
          thought.owner,
          type as never,
          { kind: "system", id: thought.id },
          {
            thoughtId: thought.id,
            // BUS_EMITTER_PERSONA_V1
            ...(thought.actor.personaId ? { personaId: thought.actor.personaId } : {}),
            turnId: thought.turnId,
            role: thought.role,
            actorKind: thought.actor.kind,
            actorId: thought.actor.id,
            owner: thought.owner,
            tenantId: thought.tenantId,
            ...(thought.provenance.correlationId ? { correlationId: thought.provenance.correlationId } : {}),
          },
          { tenantId: thought.tenantId },
        )
        .catch(() => {});
    };
  }

  detach(): void {
    this.kernel.deps.onThoughtAppended = undefined;
  }
}