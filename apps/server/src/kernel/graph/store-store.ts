// KERNEL_STORE_STORE_V1 — TurnStore persistente sobre el Store del repo.
//
// El Store del repo expone:
//   put(owner, kind, value: {id})
//   get(owner, kind, id)
//   list(owner, kind, options?)
//
// El kernel trabaja con (tenantId, kind, id). En el modelo actual del repo,
// tenantId se mapea directamente a owner. Cuando el repo pase a multi-tenant
// real, esta capa es la que compone el owner (por ejemplo `${tenantId}:${owner}`)
// sin tocar el resto del kernel.
//
// Firma del StorePort (corregida en K-ARREGLO):
//   put(tenantId, kind, id, data) — antes estaba (kind, id, tenantId, data)
//   get(tenantId, kind, id)
//   list(tenantId, kind, limit)

import { randomUUID } from "node:crypto";
import { thoughtSchema, type Thought } from "./thought.ts";
import { turnSchema, type Turn, type TurnCloseReason, type TurnClosedBy } from "./turn.ts";
import type { TurnStore } from "./store.ts";

export interface StorePort {
  put(tenantId: string, kind: string, id: string, data: unknown): Promise<void>;
  get(tenantId: string, kind: string, id: string): Promise<unknown>;
  list(tenantId: string, kind: string, limit: number): Promise<{ id: string; data: unknown }[]>;
}

const TURNS_KIND = "cognitive-turns";
const THOUGHTS_KIND = "cognitive-thoughts";

export class StoreTurnStore implements TurnStore {
  private readonly store: StorePort;

  constructor(store: StorePort) {
    this.store = store;
  }

  async openTurn(tenantId: string, owner: string, trigger: string): Promise<Turn> {
    const turn = turnSchema.parse({
      id: randomUUID(),
      tenantId,
      owner,
      startedAt: new Date().toISOString(),
      status: "open",
      triggers: [trigger],
    });
    await this.store.put(tenantId, TURNS_KIND, turn.id, turn);
    return turn;
  }

  async openChildTurn(
    tenantId: string,
    owner: string,
    parentTurnId: string,
    trigger: string,
  ): Promise<Turn> {
    const raw = await this.store.get(tenantId, TURNS_KIND, parentTurnId);
    if (!raw) throw new Error(`Parent turn not found: ${parentTurnId}`);
    const parent = turnSchema.parse(raw);
    if (parent.tenantId !== tenantId) {
      throw new Error(`Tenant mismatch: ${tenantId} != ${parent.tenantId}`);
    }
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
    await this.store.put(tenantId, TURNS_KIND, parent.id, parent);
    await this.store.put(tenantId, TURNS_KIND, child.id, child);
    return child;
  }

  async append(thought: Thought): Promise<Thought> {
    const parsed = thoughtSchema.parse(thought);
    const raw = await this.store.get(parsed.tenantId, TURNS_KIND, parsed.turnId);
    if (!raw) throw new Error(`Turn not found: ${parsed.turnId}`);
    const turn = turnSchema.parse(raw);
    if (turn.status !== "open") throw new Error(`Turn is not open: ${parsed.turnId}`);
    if (turn.tenantId !== parsed.tenantId) {
      throw new Error(`Tenant mismatch: ${parsed.tenantId} != ${turn.tenantId}`);
    }
    await this.store.put(parsed.tenantId, THOUGHTS_KIND, parsed.id, parsed);
    turn.thoughtIds.push(parsed.id);
    turn.quiescentAt = new Date().toISOString();
    await this.store.put(turn.tenantId, TURNS_KIND, turn.id, turn);
    return parsed;
  }

  async thoughtsOf(tenantId: string, turnId: string): Promise<Thought[]> {
    const raw = await this.store.get(tenantId, TURNS_KIND, turnId);
    if (!raw) return [];
    const turn = turnSchema.parse(raw);
    if (turn.tenantId !== tenantId) return [];
    const out: Thought[] = [];
    for (const tid of turn.thoughtIds) {
      const td = await this.store.get(tenantId, THOUGHTS_KIND, tid);
      if (td) out.push(thoughtSchema.parse(td));
    }
    return out;
  }

  async closeTurn(
    tenantId: string,
    turnId: string,
    reason: TurnCloseReason,
    closedBy: TurnClosedBy,
  ): Promise<Turn> {
    const raw = await this.store.get(tenantId, TURNS_KIND, turnId);
    if (!raw) throw new Error(`Turn not found: ${turnId}`);
    const turn = turnSchema.parse(raw);
    if (turn.tenantId !== tenantId) {
      throw new Error(`Tenant mismatch: ${tenantId} != ${turn.tenantId}`);
    }
    if (turn.status !== "open") return turn;
    turn.status = "closed";
    turn.closedAt = new Date().toISOString();
    turn.closeReason = reason;
    turn.closedBy = closedBy;
    await this.store.put(tenantId, TURNS_KIND, turn.id, turn);
    return turn;
  }

  async getTurn(tenantId: string, turnId: string): Promise<Turn | undefined> {
    const raw = await this.store.get(tenantId, TURNS_KIND, turnId);
    if (!raw) return undefined;
    const turn = turnSchema.parse(raw);
    if (turn.tenantId !== tenantId) return undefined;
    return turn;
  }

  async listTurns(tenantId: string, limit: number): Promise<Turn[]> {
    const rows = await this.store.list(tenantId, TURNS_KIND, limit);
    return rows.map((row) => turnSchema.parse(row.data));
  }
}