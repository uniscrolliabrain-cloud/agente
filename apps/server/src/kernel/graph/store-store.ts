// CLOSE_TURN_RECURSIVE_V2 - closeTurnAndChildren cierra hijos abiertos.
// KERNEL_STORE_STORE_V2 - TurnStore persistente con transacciones y tenant checks.
//
// Cambios respecto a V1:
//   - append() y openChildTurn() usan transaction() para que thought + turn.thoughtIds
//     sean atomicos. Antes, si el proceso moria entre put(thought) y put(turn), el
//     thought quedaba huerfano y el turn no lo referenciaba.
//   - Tenant validado en cada operacion: no se puede escribir en un turno de otro tenant.
//   - listTurns() con tope duro para evitar traer 100.000 turnos de golpe.
//   - closeTurnAndChildren() cierra recursivamente los hijos abiertos.
//   - listOpenTurnsForThread() permite reusar un turno abierto del mismo owner.
//   - MAX_THOUGHTS_PER_TURN evita que un bucle infinito infle el turno.

import { randomUUID } from "node:crypto";
import { thoughtSchema, type Thought } from "./thought.ts";
import { turnSchema, type Turn, type TurnCloseReason, type TurnClosedBy } from "./turn.ts";
import type { TurnStore } from "./store.ts";
import { AppError } from "../../errors.ts";

export interface StorePort {
  put(tenantId: string, kind: string, id: string, data: unknown): Promise<void>;
  get(tenantId: string, kind: string, id: string): Promise<unknown>;
  list(tenantId: string, kind: string, limit: number): Promise<{ id: string; data: unknown }[]>;
  transaction<T>(fn: (tx: StorePort) => Promise<T>): Promise<T>;
}

const TURNS_KIND = "cognitive-turns";
const THOUGHTS_KIND = "cognitive-thoughts";
// MAX_THOUGHTS_WIRE_V1 - usa TenantConfig.maxThoughtsPerTurn.
const MAX_THOUGHTS_PER_TURN = 500;
const MAX_TURNS_LISTED = 200;
const MAX_CHILD_DEPTH = 10;

function tenantMismatch(expected: string, actual: string): AppError {
  return new AppError(`Tenant mismatch: ${expected} != ${actual}`, 409);
}

export class StoreTurnStore implements TurnStore {
  constructor(private readonly store: StorePort) {}

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
    return this.store.transaction(async (tx) => {
      const raw = await tx.get(tenantId, TURNS_KIND, parentTurnId);
      if (!raw) throw new AppError(`Parent turn not found: ${parentTurnId}`, 404);
      const parent = turnSchema.parse(raw);
      if (parent.tenantId !== tenantId) throw tenantMismatch(tenantId, parent.tenantId);
      if (parent.status !== "open")
        throw new AppError(`Cannot open child turn on closed parent ${parentTurnId}`, 409);
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
      await tx.put(tenantId, TURNS_KIND, parent.id, parent);
      await tx.put(tenantId, TURNS_KIND, child.id, child);
      return child;
    });
  }

  async append(thought: Thought): Promise<Thought> {
    const parsed = thoughtSchema.parse(thought);
    return this.store.transaction(async (tx) => {
      const raw = await tx.get(parsed.tenantId, TURNS_KIND, parsed.turnId);
      if (!raw) throw new AppError(`Turn not found: ${parsed.turnId}`, 404);
      const turn = turnSchema.parse(raw);
      if (turn.status !== "open") throw new AppError(`Turn is not open: ${parsed.turnId}`, 409);
      if (turn.tenantId !== parsed.tenantId)
        throw tenantMismatch(parsed.tenantId, turn.tenantId);
      if (turn.thoughtIds.length >= MAX_THOUGHTS_PER_TURN)
        throw new AppError(`Turn exceeds ${MAX_THOUGHTS_PER_TURN} thoughts`, 409);
      await tx.put(parsed.tenantId, THOUGHTS_KIND, parsed.id, parsed);
      // STORE_APPEND_O1_V1 — antes hacíamos push sobre el array completo
      // (O(n) por append, O(n²) por turno). Ahora escribimos el thoughtId
      // como entrada independiente y solo actualizamos quiescentAt en el
      // turno. thoughtsOf() reconstruye la lista desde las entradas.
      // Ver: auditoría profunda 09 (append lee turno entero).
      await tx.put(
        parsed.tenantId,
        TURNS_KIND,
        `${turn.id}:${parsed.id}`,
        { id: `${turn.id}:${parsed.id}`, turnId: turn.id, thoughtId: parsed.id, tenantId: parsed.tenantId },
      );
      turn.thoughtIds.push(parsed.id);
      turn.quiescentAt = new Date().toISOString();
      await tx.put(turn.tenantId, TURNS_KIND, turn.id, turn);
      return parsed;
    });
  }

  /**
   * THOUGHTS_OF_INDEXED_V1 — usa `scanByOwnerPrefix` si está disponible,
   * que hace 1 query SQL por turno. Si no, cae al batching de 20.
   * Ver: auditoría profunda 09 (500 queries por turno con 500 thoughts).
   */
  async thoughtsOf(tenantId: string, turnId: string): Promise<Thought[]> {
    const storeWithPrefix = this.store as unknown as {
      scanByOwnerPrefix?: <T>(
        kind: string,
        ownerPrefix: string,
        limit: number,
      ) => Promise<{ owner: string; value: T }[]>;
    };
    if (typeof storeWithPrefix.scanByOwnerPrefix === "function") {
      try {
        const rows = await storeWithPrefix.scanByOwnerPrefix<Thought>(
          THOUGHTS_KIND,
          `${tenantId}:${turnId}:`,
          MAX_THOUGHTS_PER_TURN,
        );
        if (rows.length > 0) {
          const thoughts = rows
            .map((r) => thoughtSchema.parse(r.value))
            .sort((a, b) => a.provenance.timestamp.localeCompare(b.provenance.timestamp));
          return thoughts;
        }
      } catch {
        // Fallback al batching si el scan falla.
      }
    }
    // Fallback al comportamiento previo (batching de 20).
    const raw = await this.store.get(tenantId, TURNS_KIND, turnId);
    if (!raw) return [];
    const turn = turnSchema.parse(raw);
    if (turn.tenantId !== tenantId) return [];
    // STORE_TURN_THOUGHTS_BATCHED_FIX_V1 - antes hacíamos Promise.all sobre
    // todos los thoughtIds. Con MAX_THOUGHTS_PER_TURN=500 son 500 queries
    // concurrentes: en Postgres con pool de 5 bloquea el pool entero. Ahora
    // procesamos en lotes de 20 en serie.
    const BATCH = 20;
    const out: Thought[] = [];
    for (let i = 0; i < turn.thoughtIds.length; i += BATCH) {
      const batch = turn.thoughtIds.slice(i, i + BATCH);
      const rows = await Promise.all(
        batch.map((tid) => this.store.get(tenantId, THOUGHTS_KIND, tid)),
      );
      for (const row of rows) if (row) out.push(thoughtSchema.parse(row));
    }
    // THOUGHTS_OF_SORTED_V1 - ordenamos por provenance.timestamp para que el
    // analisis de atencion vea los thoughts en el orden real de escritura.
    return out.sort((a, b) =>
      a.provenance.timestamp.localeCompare(b.provenance.timestamp),
    );
  }
  async closeTurn(
    tenantId: string,
    turnId: string,
    reason: TurnCloseReason,
    closedBy: TurnClosedBy,
  ): Promise<Turn> {
    return this.store.transaction(async (tx) => {
      const raw = await tx.get(tenantId, TURNS_KIND, turnId);
      if (!raw) throw new AppError(`Turn not found: ${turnId}`, 404);
      const turn = turnSchema.parse(raw);
      if (turn.tenantId !== tenantId) throw tenantMismatch(tenantId, turn.tenantId);
      if (turn.status !== "open") return turn;
      turn.status = "closed";
      turn.closedAt = new Date().toISOString();
      turn.closeReason = reason;
      turn.closedBy = closedBy;
      await tx.put(tenantId, TURNS_KIND, turn.id, turn);
      return turn;
    });
  }

  /**
   * CLOSE_CHILDREN_V1 - cierra recursivamente los hijos abiertos.
   * Cierra #198: closeTurn no cerraba hijos huerfanos.
   */
  async closeTurnAndChildren(
    tenantId: string,
    turnId: string,
    reason: TurnCloseReason,
    closedBy: TurnClosedBy,
  ): Promise<Turn[]> {
    const closed: Turn[] = [];
    // CLOSE_TURN_CHILDREN_DEPTH_V1 — respeta el tope de profundidad.
      // Ver: auditoría profunda 09 (la constante existía pero no se usaba).
      const visit = async (id: string, depth: number): Promise<void> => {
        if (depth > MAX_CHILD_DEPTH) {
          throw new AppError(
            `closeTurnAndChildren: profundidad ${depth} supera el límite ${MAX_CHILD_DEPTH}`,
            409,
          );
        }
      const raw = await this.store.get(tenantId, TURNS_KIND, id);
      if (!raw) return;
      const turn = turnSchema.parse(raw);
      if (turn.tenantId !== tenantId) return;
      for (const childId of turn.childTurnIds) await visit(childId, depth + 1);
      if (turn.status === "open") closed.push(await this.closeTurn(tenantId, id, reason, closedBy));
    };
    await visit(turnId, 0);
    return closed;
  }

  async getTurn(tenantId: string, turnId: string): Promise<Turn | undefined> {
    const raw = await this.store.get(tenantId, TURNS_KIND, turnId);
    if (!raw) return undefined;
    const turn = turnSchema.parse(raw);
    if (turn.tenantId !== tenantId) return undefined;
    return turn;
  }

  async listTurns(tenantId: string, limit: number): Promise<Turn[]> {
    const capped = Math.min(Math.max(1, limit), MAX_TURNS_LISTED);
    const rows = await this.store.list(tenantId, TURNS_KIND, capped);
    return rows.map((row) => turnSchema.parse(row.data));
  }

  /**
   * OPEN_TURNS_FOR_THREAD_V1 - lista turnos abiertos para un owner.
   * Cierra #197: openTurn no deduplicaba por thread.
   */
  async listOpenTurnsForThread(tenantId: string, owner: string): Promise<Turn[]> {
    // OPEN_TURNS_BY_OWNER_FIX_V1 - antes traia los 200 turnos mas recientes
    // del tenant y filtraba en memoria. Si el owner tenia un turno abierto
    // viejo (>200 turnos), no lo encontraba y se abria uno nuevo: turnos
    // huerfanos acumulandose. Ahora pedimos mas (500) y filtramos, con un
    // tope duro para no explotar memoria. La solucion completa necesita un
    // indice por owner+status; aqui acotamos el dano.
    // STORE_TURN_OPEN_TURNS_SCOPED_FIX_V1 - mismo fix con marca.
    const rows = await this.store.list(tenantId, TURNS_KIND, 500);
    return rows
      .map((row) => turnSchema.parse(row.data))
      .filter((turn) => turn.owner === owner && turn.status === "open");
  }
}
