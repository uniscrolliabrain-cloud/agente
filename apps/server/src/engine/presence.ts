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

export class PresenceService {
  private readonly entries = new Map<string, PresenceEntry>();

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
    const existing = this.entries.get(k);
    this.entries.set(k, {
      userId,
      resourceId,
      resourceType,
      lastSeen: Date.now(),
    });
    // En una implementación multi-usuario real, la clave incluiría userId.
    // Aquí, para simplificar, guardamos el último que tocó y devolvemos
    // como "others" a los que la key anterior tenía.
    const others: Array<{ userId: string; lastSeen: number }> = [];
    if (existing && existing.userId !== userId && Date.now() - existing.lastSeen < PRESENCE_TTL_MS) {
      others.push({ userId: existing.userId, lastSeen: existing.lastSeen });
    }
    return { others };
  }

  /** Limpia entradas caducadas. */
  private gc(): void {
    const now = Date.now();
    for (const [k, v] of this.entries) {
      if (now - v.lastSeen > PRESENCE_TTL_MS) this.entries.delete(k);
    }
  }

  /** Consulta quién está editando sin tocar presencia. */
  query(
    resourceType: "thread" | "project",
    resourceId: string,
  ): Array<{ userId: string; lastSeen: number }> {
    this.gc();
    const k = this.key(resourceType, resourceId);
    const existing = this.entries.get(k);
    if (!existing) return [];
    if (Date.now() - existing.lastSeen > PRESENCE_TTL_MS) return [];
    return [{ userId: existing.userId, lastSeen: existing.lastSeen }];
  }

  clear(): void {
    this.entries.clear();
  }
}

export const globalPresence = new PresenceService();
