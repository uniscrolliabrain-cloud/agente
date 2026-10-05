// PRESENCE_V1 — presencia efímera por recurso.
//
// In-memory. No persiste. Se pierde al reiniciar el proceso.
// Sirve para avisar "otro usuario está editando este thread/proyecto".
//
// Ver: docs/audits/04-multi-usuario-concurrente/miniaudit.md
// ("Sin presence service", "Sin avisos de otro usuario está editando").

const PRESENCE_TTL_MS = 30_000;

export interface PresenceEntry {
  userId: string;
  resourceId: string;
  resourceType: "thread" | "project";
  lastSeen: number;
}

// PRESENCE_MULTI_V1 - Map por usuario. Antes solo guardaba uno.
export class PresenceService {
  private readonly entries = new Map<string, Map<string, PresenceEntry>>();

  private key(resourceType: string, resourceId: string): string {
    return `${resourceType}:${resourceId}`;
  }

  /** Marca presencia del usuario. Devuelve quién más está editando. */
  touch(
    userId: string,
    resourceType: "thread" | "project",
    resourceId: string,
  ): { others: Array<{ userId: string; lastSeen: number }> } {
    const k = this.key(resourceType, resourceId);
    this.gc();
    let bucket = this.entries.get(k);
    if (!bucket) {
      bucket = new Map<string, PresenceEntry>();
      this.entries.set(k, bucket);
    }
    bucket.set(userId, {
      userId,
      resourceId,
      resourceType,
      lastSeen: Date.now(),
    });
    const others: Array<{ userId: string; lastSeen: number }> = [];
    for (const [uid, entry] of bucket) {
      if (uid === userId) continue;
      if (Date.now() - entry.lastSeen < PRESENCE_TTL_MS) {
        others.push({ userId: uid, lastSeen: entry.lastSeen });
      }
    }
    return { others };
  }

  /** PRESENCE_LEAVE_V1 - desconexión explícita. */
  leave(userId: string, resourceType: "thread" | "project", resourceId: string): void {
    const k = this.key(resourceType, resourceId);
    const bucket = this.entries.get(k);
    if (!bucket) return;
    bucket.delete(userId);
    if (bucket.size === 0) this.entries.delete(k);
  }

  /** PRESENCE_GC_V1 - limpia entradas caducadas del Map anidado. */
  private gc(): void {
    const now = Date.now();
    for (const [k, bucket] of this.entries) {
      for (const [uid, entry] of bucket) {
        if (now - entry.lastSeen > PRESENCE_TTL_MS) bucket.delete(uid);
      }
      if (bucket.size === 0) this.entries.delete(k);
    }
  }

  /** PRESENCE_QUERY_V1 - consulta todos los usuarios presentes. */
  query(
    resourceType: "thread" | "project",
    resourceId: string,
  ): Array<{ userId: string; lastSeen: number }> {
    this.gc();
    const k = this.key(resourceType, resourceId);
    const bucket = this.entries.get(k);
    if (!bucket) return [];
    const now = Date.now();
    const result: Array<{ userId: string; lastSeen: number }> = [];
    for (const [uid, entry] of bucket) {
      if (now - entry.lastSeen <= PRESENCE_TTL_MS) {
        result.push({ userId: uid, lastSeen: entry.lastSeen });
      }
    }
    return result;
  }

  clear(): void {
    this.entries.clear();
  }
}

export const globalPresence = new PresenceService();
