// COGNITION_CARD_STORE_V1 - persistencia y recuperacion de tarjetas cognitivas.
//
// Vive en `cognition-cards`, no en `business-entities` ni en `artifacts`: una
// interpretacion del agente no es un hecho de la empresa.

import {
  cognitionCardSchema,
  type CognitionCard,
} from "../../../../../packages/domain/src/cognition-card.ts";
import { nodeMentions } from "../../../../../packages/domain/src/node-ref.ts";

const KIND = "cognition-cards";
const DEFAULT_LIMIT = 50;
const PENDING_LIMIT = 20;

export interface CognitionCardPersistence {
  get(owner: string, kind: string, id: string): Promise<unknown | null>;
  list(
    owner: string,
    kind: string,
    options?: { limit?: number },
  ): Promise<unknown[]>;
  put<T extends { id: string }>(owner: string, kind: string, value: T): Promise<T>;
  compareAndSwap?<T>(
    owner: string,
    kind: string,
    id: string,
    expected: Record<string, unknown>,
    patch: Record<string, unknown>,
  ): Promise<T | null>;
  insertIfAbsent?<T extends { id: string }>(
    owner: string,
    kind: string,
    value: T,
  ): Promise<T | null>;
}

export interface CognitionCardPendingOptions {
  threadId?: string;
  query?: string;
  limit?: number;
  now?: string;
}

export interface CognitionCardSaveResult {
  card: CognitionCard;
  created: boolean;
}

/** Ordena por relevancia determinista: confianza, recencia, consulta y atencion. */
export function rankCognitionCards(
  cards: readonly CognitionCard[],
  options: { query?: string; now?: string } = {},
): CognitionCard[] {
  const nowMs = Date.parse(options.now ?? new Date().toISOString());
  const query = (options.query ?? "").toLowerCase();
  const words = query.split(/\s+/).filter((word) => word.length > 2);
  return [...cards].sort((a, b) => scoreCard(b, nowMs, words, query) - scoreCard(a, nowMs, words, query));
}

function scoreCard(
  card: CognitionCard,
  nowMs: number,
  words: readonly string[],
  query: string,
): number {
  const createdAt = Date.parse(card.provenance.createdAt);
  const age = Number.isFinite(createdAt) ? Math.max(0, nowMs - createdAt) : 0;
  const recency = Math.max(0, 1 - age / (7 * 24 * 60 * 60 * 1000));
  const haystack = `${card.title} ${card.body}`.toLowerCase();
  const lexical =
    words.length > 0
      ? words.filter((word) => haystack.includes(word)).length / words.length
      : 0;
  const attentionMatch = card.attention.matched.some((match) =>
    nodeMentions(query, match.node),
  )
    ? 1
    : 0;
  const scopeBonus = card.scope === "tenant" ? 0.05 : 0;
  return card.confidence * 0.45 + recency * 0.25 + lexical * 0.2 + attentionMatch * 0.1 + scopeBonus;
}

export class CognitionCardStore {
  constructor(private readonly db: CognitionCardPersistence) {}

  async save(card: CognitionCard): Promise<CognitionCardSaveResult> {
    const parsed = cognitionCardSchema.parse(card);
    if (this.db.insertIfAbsent) {
      const inserted = await this.db.insertIfAbsent(parsed.owner, KIND, parsed);
      if (inserted) {
        return { card: cognitionCardSchema.parse(inserted), created: true };
      }
      const existing = await this.db.get(parsed.owner, KIND, parsed.id);
      if (!existing) throw new Error(`CognitionCard no confirmada: ${parsed.id}`);
      return { card: cognitionCardSchema.parse(existing), created: false };
    }
    await this.db.put(parsed.owner, KIND, parsed);
    return { card: parsed, created: true };
  }

  async get(
    tenantId: string,
    owner: string,
    id: string,
  ): Promise<CognitionCard | undefined> {
    const raw = await this.db.get(owner, KIND, id);
    if (!raw) return undefined;
    const parsed = cognitionCardSchema.safeParse(raw);
    if (!parsed.success || parsed.data.tenantId !== tenantId) return undefined;
    return parsed.data;
  }

  async list(
    tenantId: string,
    owner: string,
    limit = DEFAULT_LIMIT,
  ): Promise<CognitionCard[]> {
    const rows = await this.db.list(owner, KIND, {
      limit: Math.min(Math.max(limit * 2, limit), 200),
    });
    return rows
      .map((row) => cognitionCardSchema.safeParse(row))
      .filter((parsed): parsed is { success: true; data: CognitionCard } => parsed.success)
      .map((parsed) => parsed.data)
      .filter((card) => card.tenantId === tenantId)
      .sort((a, b) => b.provenance.createdAt.localeCompare(a.provenance.createdAt))
      .slice(0, limit);
  }

  /**
   * COGNITION_CARD_PENDING_V1 - tarjetas que pueden entrar en el contexto.
   * Una tarjeta de hilo solo se ve en su hilo; una marcada como util se ve en
   * el tenant. Una tarjeta sin hilo se considera del owner.
   */
  async pending(
    tenantId: string,
    owner: string,
    options: CognitionCardPendingOptions = {},
  ): Promise<CognitionCard[]> {
    const now = options.now ?? new Date().toISOString();
    const cards = await this.list(tenantId, owner, PENDING_LIMIT);
    const visible = cards.filter((card) => {
      if (card.status !== "proposed") return false;
      if (card.provenance.expiresAt && card.provenance.expiresAt <= now) return false;
      if (card.scope === "tenant") return true;
      if (!options.threadId) return !card.threadId;
      return !card.threadId || card.threadId === options.threadId;
    });
    return rankCognitionCards(visible, { ...(options.query ? { query: options.query } : {}), now })
      .slice(0, options.limit ?? 3);
  }

  /**
   * Marca la tarjeta como consumida una sola vez, incluso con carreras.
   * Devuelve la tarjeta solo si esta llamada gano la transicion; si otra ya la
   * consumio, devuelve undefined para que el llamador no la inyecte dos veces.
   */
  async markConsumed(
    tenantId: string,
    owner: string,
    id: string,
    at = new Date().toISOString(),
  ): Promise<CognitionCard | undefined> {
    const current = await this.get(tenantId, owner, id);
    if (!current || current.status !== "proposed") return undefined;
    return this.patch(tenantId, owner, id, { status: "proposed" }, {
      status: "consumed",
      consumedAt: at,
    });
  }

  /**
   * Devuelve una tarjeta consumida a pendiente si la llamada al proveedor
   * fallo antes de usarla. Sin esto, un fallo del modelo perderia la tarjeta.
   */
  async release(
    tenantId: string,
    owner: string,
    id: string,
  ): Promise<CognitionCard | undefined> {
    const current = await this.get(tenantId, owner, id);
    if (!current || current.status !== "consumed") return undefined;
    return this.patch(tenantId, owner, id, { status: "consumed" }, {
      status: "proposed",
    });
  }

  /** Marca la tarjeta como util y la promueve al tenant. */
  async markUseful(
    tenantId: string,
    owner: string,
    id: string,
    at = new Date().toISOString(),
  ): Promise<CognitionCard | undefined> {
    const current = await this.get(tenantId, owner, id);
    if (!current) return undefined;
    if (current.scope === "tenant" && current.usefulAt) return current;
    return (
      (await this.patch(tenantId, owner, id, { scope: current.scope }, {
        scope: "tenant",
        usefulAt: at,
      })) ?? current
    );
  }

  private async patch(
    tenantId: string,
    owner: string,
    id: string,
    expected: Record<string, unknown>,
    patch: Record<string, unknown>,
  ): Promise<CognitionCard | undefined> {
    if (this.db.compareAndSwap) {
      const updated = await this.db.compareAndSwap(owner, KIND, id, expected, patch);
      if (updated) return cognitionCardSchema.parse(updated);
      // Otra operacion gano la carrera. El llamador decide si reintenta o
      // considera la tarjeta ya consumida.
      return undefined;
    }
    const current = await this.get(tenantId, owner, id);
    if (!current) return undefined;
    const updated = cognitionCardSchema.parse({ ...current, ...patch });
    await this.db.put(owner, KIND, updated);
    return updated;
  }
}
