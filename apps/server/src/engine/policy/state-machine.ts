import { z } from "zod";
import type { EventBus } from "../events/index.ts";
import { AppError } from "../../errors.ts";

// STATE_MACHINE_V1 — maquina de estados declarativa para entidades.
// Una entidad con `status` y una maquina asociada solo puede transitar
// entre estados permitidos. Toda transicion emite al bus.

export const transitionSchema = z.object({
  from: z.string().min(1).max(100),
  to: z.string().min(1).max(100),
  action: z.string().min(1).max(100),
  // Opcional: nombre del rol que puede ejecutar la transicion.
  roleId: z.string().max(100).optional(),
});

export const stateMachineSchema = z
  .object({
    id: z.string().min(1).max(100),
    entityType: z.string().min(1).max(100),
    initial: z.string().min(1).max(100),
    states: z.array(z.string().min(1).max(100)).min(1).max(100),
    transitions: z.array(transitionSchema).max(500),
  })
  .superRefine((value, ctx) => {
    if (!value.states.includes(value.initial))
      ctx.addIssue({ code: "custom", message: "initial must be in states" });
    for (const [index, transition] of value.transitions.entries()) {
      if (!value.states.includes(transition.from))
        ctx.addIssue({ code: "custom", path: [index, "from"], message: "from must be in states" });
      if (!value.states.includes(transition.to))
        ctx.addIssue({ code: "custom", path: [index, "to"], message: "to must be in states" });
    }
  });

export type StateMachine = z.infer<typeof stateMachineSchema>;
export type Transition = z.infer<typeof transitionSchema>;

export interface TransitionResult {
  from: string;
  to: string;
  action: string;
}

export class StateMachineEngine {
  constructor(private readonly bus?: EventBus) {}

  async transition(
    owner: string,
    machine: StateMachine,
    entityId: string,
    from: string,
    to: string,
    roleId?: string,
  ): Promise<TransitionResult> {
    const transition = machine.transitions.find(
      (candidate) => candidate.from === from && candidate.to === to,
    );
    if (!transition) {
      await this.bus?.emit(owner, "state.transition_denied", { kind: "state", id: `${machine.id}:${entityId}` }, {
        entityId,
        stateMachine: machine.id,
        from,
        attempted: to,
        reason: `Transition ${from} -> ${to} is not allowed`,
      });
      throw new AppError(`Transition ${from} -> ${to} not allowed by ${machine.id}`, 409);
    }
    if (transition.roleId && roleId && transition.roleId !== roleId) {
      await this.bus?.emit(owner, "state.transition_denied", { kind: "state", id: `${machine.id}:${entityId}` }, {
        entityId,
        stateMachine: machine.id,
        from,
        attempted: to,
        reason: `Role ${roleId} cannot execute this transition`,
      });
      throw new AppError(`Role ${roleId} cannot execute ${from} -> ${to}`, 403);
    }
    await this.bus?.emit(owner, "state.changed", { kind: "state", id: `${machine.id}:${entityId}` }, {
      entityId,
      stateMachine: machine.id,
      from,
      to,
    });
    return { from, to, action: transition.action };
  }
}
