import { AppError } from "../errors.ts";
import {
  StateMachineEngine,
  stateMachineSchema,
  type StateMachine,
} from "./policy/state-machine.ts";
import type { Store } from "../db.ts";
import type { EventBus } from "./events/index.ts";

// STATE_MACHINES_REGISTRY_V1 — CRUD de maquinas de estado por owner. La definicion
// vive en records con kind "state-machines". El StateMachineEngine solo ejecuta la
// transicion; aqui se persiste, se lista y se valida el schema.

const KIND = "state-machines";

export class StateMachineRegistry {
  constructor(
    private readonly db: Store,
    private readonly engine: StateMachineEngine,
    private readonly bus?: EventBus,
  ) {}

  async get(owner: string, id: string): Promise<StateMachine | null> {
    return this.db.get<StateMachine>(owner, KIND, id);
  }

  async list(owner: string): Promise<StateMachine[]> {
    return this.db.list<StateMachine>(owner, KIND);
  }

  async upsert(owner: string, raw: unknown): Promise<StateMachine> {
    const parsed = stateMachineSchema.parse(raw);
    await this.db.put(owner, KIND, parsed);
    return parsed;
  }

  async remove(owner: string, id: string): Promise<void> {
    const existing = await this.db.get<StateMachine>(owner, KIND, id);
    if (!existing) throw new AppError("State machine not found", 404);
    await this.db.remove(owner, KIND, id);
  }

  /**
   * Aplica una transicion sobre una entidad. Delega la validacion al StateMachineEngine.
   */
  async apply(
    owner: string,
    machineId: string,
    entityId: string,
    from: string,
    to: string,
    roleId?: string,
  ) {
    const machine = await this.get(owner, machineId);
    if (!machine) throw new AppError(`State machine not found: ${machineId}`, 404);
    return this.engine.transition(owner, machine, entityId, from, to, roleId);
  }
}
