// EDIT_LOCK_V1 — lock optimista in-process por recurso.
//
// Complementa el CAS del store: si dos requests del MISMO usuario
// intentan editar el mismo proyecto a la vez (doble click, doble tab),
// el segundo falla rápido con 409 sin tocar la DB.
//
// Ver: docs/audits/04-multi-usuario-concurrente/miniaudit.md
// ("Sin locks de edición").

const LOCK_TTL_MS = 10_000;

interface Lock {
  userId: string;
  resourceId: string;
  acquiredAt: number;
}

export class EditLock {
  private readonly locks = new Map<string, Lock>();

  private key(resourceType: string, resourceId: string): string {
    return `${resourceType}:${resourceId}`;
  }

  /** Intenta adquirir. Devuelve null si otro ya lo tiene. */
  acquire(userId: string, resourceType: string, resourceId: string): Lock | null {
    this.gc();
    const k = this.key(resourceType, resourceId);
    const existing = this.locks.get(k);
    if (existing && existing.userId !== userId) {
      return null;
    }
    const lock: Lock = { userId, resourceId, acquiredAt: Date.now() };
    this.locks.set(k, lock);
    return lock;
  }

  /** Libera el lock si es del usuario. */
  release(userId: string, resourceType: string, resourceId: string): void {
    const k = this.key(resourceType, resourceId);
    const existing = this.locks.get(k);
    if (existing && existing.userId === userId) {
      this.locks.delete(k);
    }
  }

  private gc(): void {
    const now = Date.now();
    for (const [k, v] of this.locks) {
      if (now - v.acquiredAt > LOCK_TTL_MS) this.locks.delete(k);
    }
  }

  clear(): void {
    this.locks.clear();
  }
}

export const globalEditLock = new EditLock();
