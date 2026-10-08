// KERNEL_INMEMORY_TURN_STORE_V2 — adaptado a TurnStore V2.
//
// Hoy: un Map. Un solo pod. Suficiente para el kernel en su primera fase.
//
// TODO(KERNEL_STORE_V1): cuando el kernel viva en k3s con N pods,
// implementar StoreTurnStore usando Store.put con kind "cognitive-turns"
// y "cognitive-thoughts". La interfaz no cambia.

import { randomUUID } from "node:crypto";
import { thoughtSchema, type Thought } from "./thought.ts";
import {
  turnSchema,
  type Turn,
  type TurnCloseReason,
} from "./turn.ts";
import type { TurnStore } from "./store.ts";

export class InMemoryTurnStore implements TurnStore {
  private readonly turns = new Map<string, Turn>();
  private readonly thoughts = new Map<string, Thought>();

  // TURN_STORE_PERSONA_V1 - persona funcional que abre el turno. Opcional.
  async openTurn(
    tenantId: string,
    owner: string,
    trigger: string,
    personaId?: string,
  ): Promise<Turn> {
    const turn = turnSchema.parse({
      id: randomUUID(),
      tenantId,
      owner,
      startedAt: new Date().toISOString(),
      status: "open",
      triggers: [trigger],
      ...(personaId ? { personaId } : {}),
    });
    this.turns.set(turn.id, turn);
    return turn;
  }

  async openChildTurn(
    tenantId: string,
    owner: string,
    parentTurnId: string,
    trigger: string,
  ): Promise<Turn> {
    const parent = this.turns.get(parentTurnId);
    if (!parent) throw new Error(`Parent turn not found: ${parentTurnId}`);
    if (parent.tenantId !== tenantId)
      throw new Error(`Tenant mismatch: ${tenantId} != ${parent.tenantId}`);
    const child = turnSchema.parse({
      id: randomUUID(),
      tenantId,
      owner,
      parentTurnId,
      startedAt: new Date().toISOString(),
      status: "open",
      triggers: [trigger],
    });
    parent.childTurnIds.push(child.id);
    this.turns.set(parent.id, parent);
    this.turns.set(child.id, child);
    return child;
  }

  async append(thought: Thought): Promise<Thought> {
    const parsed = thoughtSchema.parse(thought);
    const turn = this.turns.get(parsed.turnId);
    if (!turn) throw new Error(`Turn not found: ${parsed.turnId}`);
    if (turn.status !== "open") throw new Error(`Turn is not open: ${parsed.turnId}`);
    if (turn.tenantId !== parsed.tenantId)
      throw new Error(`Tenant mismatch: ${parsed.tenantId} != ${turn.tenantId}`);
    this.thoughts.set(parsed.id, parsed);
    turn.thoughtIds.push(parsed.id);
    turn.quiescentAt = new Date().toISOString();
    this.turns.set(turn.id, turn);
    return parsed;
  }

  async thoughtsOf(tenantId: string, turnId: string): Promise<Thought[]> {
    const turn = this.turns.get(turnId);
    if (!turn) return [];
    if (turn.tenantId !== tenantId) return [];
    return turn.thoughtIds
      .map((id) => this.thoughts.get(id))
      .filter((t): t is Thought => Boolean(t));
  }

  async closeTurn(
    tenantId: string,
    turnId: string,
    reason: TurnCloseReason,
    closedBy: "presenter" | "quiescence" | "timeout" | "user" | "system",
  ): Promise<Turn> {
    const turn = this.turns.get(turnId);
    if (!turn) throw new Error(`Turn not found: ${turnId}`);
    if (turn.tenantId !== tenantId)
      throw new Error(`Tenant mismatch: ${tenantId} != ${turn.tenantId}`);
    if (turn.status !== "open") return turn;
    turn.status = "closed";
    turn.closedAt = new Date().toISOString();
    turn.closeReason = reason;
    turn.closedBy = closedBy;
    this.turns.set(turn.id, turn);
    return turn;
  }

  async getTurn(tenantId: string, turnId: string): Promise<Turn | undefined> {
    const turn = this.turns.get(turnId);
    if (!turn) return undefined;
    if (turn.tenantId !== tenantId) return undefined;
    return turn;
  }

  async listTurns(tenantId: string, limit: number): Promise<Turn[]> {
    const out: Turn[] = [];
    for (const turn of this.turns.values()) {
      if (turn.tenantId !== tenantId) continue;
      out.push(turn);
      if (out.length >= limit) break;
    }
    return out;
  }
}