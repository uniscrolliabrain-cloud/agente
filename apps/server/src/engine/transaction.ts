// ENGINE_TRANSACTION_V1 - helpers de transaccion para el engine.
//
// Cierra las carreras get+put que teniamos en createMonitor, seedAgents, createGoal,
// decideIdea. Tambien envuelve operaciones multi-paso en un solo BEGIN/COMMIT.

import type { Store } from "../db.ts";
import type { TenantScopedStore } from "../db-tenant.ts";
import { AppError } from "../errors.ts";

/**
 * withTransaction - envuelve un callback en BEGIN/COMMIT/ROLLBACK.
 * Reexporta db.transaction() para que el engine no importe Store directamente
 * cuando solo necesita esto.
 */
export async function withTransaction<T>(
  db: Store,
  fn: (tx: Store) => Promise<T>,
): Promise<T> {
  return db.transaction(fn);
}

/**
 * upsertIdempotent - inserta si no existe, devuelve la existente si ya estaba.
 *
 * Cierra la carrera get+put: si dos procesos intentan crear el mismo id a la vez,
 * insertIfAbsent hace que solo uno gane y el otro recibe la fila del ganador.
 *
 * Uso:
 *   const goal = await upsertIdempotent(db, owner, "goals", { id, title, ... });
 */
export async function upsertIdempotent<T extends { id: string }>(
  db: Store | TenantScopedStore,
  owner: string,
  kind: string,
  value: T,
): Promise<T> {
  const inserted = await db.insertIfAbsent(owner, kind, value);
  if (inserted) return inserted;
  const existing = await db.get<T>(owner, kind, value.id);
  if (!existing) {
    throw new AppError(
      `Record ${kind}/${value.id} desaparecio despues de un conflicto de insercion`,
      500,
    );
  }
  return existing;
}

/**
 * withIdempotency - envuelve una operacion que puede ejecutarse dos veces.
 *
 * Si key ya existe en records/<kind>-idempotency, devuelve el resultado guardado.
 * Si no, ejecuta el callback, guarda el resultado y lo devuelve.
 *
 * Uso:
 *   const task = await withIdempotency(db, owner, "task-create", key, async () => {
 *     return createTask(...);
 *   });
 */
export async function withIdempotency<T>(
  db: Store,
  owner: string,
  kind: string,
  key: string,
  fn: () => Promise<T>,
): Promise<T> {
  const id = `${kind}:${key}`;
  const existing = await db.get<{ result: T }>(owner, "idempotency", id);
  if (existing) return existing.result;
  const result = await fn();
  await db.insertIfAbsent(owner, "idempotency", { id, result, createdAt: new Date().toISOString() });
  return result;
}
