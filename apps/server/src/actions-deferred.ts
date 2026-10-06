// C3_DEFERRED_ACTIONS_V1 - undo en servidor. CAS para cancelar y para ejecutar.
// STORE_DEFERRED_IMPORT_V1 - import para StoreDeferredStore.
import type { Store } from "./db.ts";
import type { TenantScopedStore } from "./db-tenant.ts";

export type DeferredStatus =
  | "collecting"
  | "scheduled"
  | "running"
  | "executed"
  | "cancelled"
  | "failed";

export interface DeferredRecord {
  actionId: string;
  owner: string;
  amount?: number;
  signers: string[];
  needed: number;
  executeAt: number | null;
  status: DeferredStatus;
}

export interface DeferredStore {
  get(actionId: string): Promise<DeferredRecord | undefined>;
  put(r: DeferredRecord): Promise<void>;
  due(now: number): Promise<DeferredRecord[]>;
  claim(actionId: string): Promise<boolean>;
  cancelIfOpen(actionId: string): Promise<boolean>;
}

export type DeferredEmit = (
  t: "action.deferred" | "action.cancelled" | "action.executed" | "action.failed",
  p: Record<string, unknown>,
) => void;

export class DeferredActions {
  constructor(
    private store: DeferredStore,
    private run: (owner: string, actionId: string) => Promise<void>,
    private emit: DeferredEmit,
    private cfg: { windowMs?: number; dualAt?: number | null; now?: () => number } = {},
  ) {}

  private now() {
    return this.cfg.now?.() ?? Date.now();
  }

  private needed(amount?: number) {
    const d = this.cfg.dualAt;
    return d != null && amount != null && amount >= d ? 2 : 1;
  }

  // DEFERRED_GET_V1 - wrapper para consultar el registro sin modificarlo.
  async get(actionId: string): Promise<DeferredRecord | undefined> {
    return this.store.get(actionId);
  }

  async decide(owner: string, actionId: string, userId: string, amount?: number) {
    const r: DeferredRecord =
      (await this.store.get(actionId)) ?? {
        actionId,
        owner,
        amount,
        signers: [],
        needed: this.needed(amount),
        executeAt: null,
        status: "collecting",
      };
    if (r.owner !== owner) throw new Error("forbidden");
    if (r.status !== "collecting") throw new Error(`estado invalido: ${r.status}`);
    if (r.signers.includes(userId)) throw new Error("ya has firmado");
    r.signers.push(userId);
    if (r.signers.length >= this.needed(r.amount)) {
      r.status = "scheduled";
      r.executeAt = this.now() + (this.cfg.windowMs ?? 8000);
    }
    await this.store.put(r);
    this.emit("action.deferred", {
      actionId,
      signers: r.signers,
      needed: this.needed(r.amount),
      executeAt: r.executeAt,
    });
    return r;
  }

  async cancel(owner: string, actionId: string, userId: string) {
    const r = await this.store.get(actionId);
    if (!r || r.owner !== owner) throw new Error("not found");
    if (!r.signers.includes(userId)) throw new Error("solo un firmante puede cancelar");
    if (!(await this.store.cancelIfOpen(actionId))) throw new Error("ya no se puede cancelar");
    this.emit("action.cancelled", { actionId, by: userId });
  }

  async tick() {
    const due = await this.store.due(this.now());
    for (const r of due) {
      if (!(await this.store.claim(r.actionId))) continue;
      try {
        await this.run(r.owner, r.actionId);
        await this.store.put({ ...r, status: "executed" });
        this.emit("action.executed", { actionId: r.actionId });
      } catch (e) {
        await this.store.put({ ...r, status: "failed" });
        this.emit("action.failed", { actionId: r.actionId, error: String(e) });
      }
    }
  }
}

// STORE_DEFERRED_STORE_V1 - store persistente sobre records.
export class StoreDeferredStore implements DeferredStore {
  constructor(private readonly db: Store | TenantScopedStore) {}

  async get(actionId: string): Promise<DeferredRecord | undefined> {
    const row = await this.db.get<DeferredRecord & { id: string }>(
      "system",
      "deferred-actions",
      actionId,
    );
    return row ?? undefined;
  }

  async put(r: DeferredRecord): Promise<void> {
    await this.db.put("system", "deferred-actions", { id: r.actionId, ...r });
  }

  async due(now: number): Promise<DeferredRecord[]> {
    const all = await this.db.list<DeferredRecord & { id: string }>(
      "system",
      "deferred-actions",
    );
    return all.filter(
      (r) => r.status === "scheduled" && (r.executeAt ?? Infinity) <= now,
    );
  }

  async claim(actionId: string): Promise<boolean> {
    const r = await this.get(actionId);
    if (r?.status !== "scheduled") return false;
    const updated = await this.db.compareAndSwap<DeferredRecord & { id: string }>(
      "system",
      "deferred-actions",
      actionId,
      { status: "scheduled" },
      { status: "running" },
    );
    return updated !== null;
  }

  async cancelIfOpen(actionId: string): Promise<boolean> {
    const r = await this.get(actionId);
    if (!r || (r.status !== "scheduled" && r.status !== "collecting")) return false;
    const updated = await this.db.compareAndSwap<DeferredRecord & { id: string }>(
      "system",
      "deferred-actions",
      actionId,
      { status: r.status },
      { status: "cancelled" },
    );
    return updated !== null;
  }

  /** STORE_DEFERRED_PURGE_V1 - purga terminales antiguos. */
  async purgeOlderThan(days: number): Promise<number> {
    return this.db.purgeOlderThan("deferred-actions", days);
  }
}

export class MemoryDeferredStore implements DeferredStore {
  private m = new Map<string, DeferredRecord>();
  async get(id: string) {
    return this.m.get(id);
  }
  async put(r: DeferredRecord) {
    this.m.set(r.actionId, { ...r });
  }
  async due(now: number) {
    return [...this.m.values()].filter(
      (r) => r.status === "scheduled" && (r.executeAt ?? Infinity) <= now,
    );
  }
  async claim(id: string) {
    const r = this.m.get(id);
    if (r?.status !== "scheduled") return false;
    r.status = "running";
    return true;
  }
  async cancelIfOpen(id: string) {
    const r = this.m.get(id);
    if (!r || (r.status !== "scheduled" && r.status !== "collecting")) return false;
    r.status = "cancelled";
    return true;
  }
}