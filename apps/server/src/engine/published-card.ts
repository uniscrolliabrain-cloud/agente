import { createHash } from "node:crypto";
import type { PublishedCard } from "../../../../packages/domain/src/published-card.ts";

type JsonValue = null | boolean | number | string | readonly JsonValue[] | { readonly [key: string]: JsonValue };

export const CARD_CHANNELS = ["panel", "email", "whatsapp", "voice"] as const;
export type CardChannel = (typeof CARD_CHANNELS)[number];

export const CARD_REFERENCE_KINDS = ["task", "action", "lead", "connection", "thread"] as const;
export type CardReferenceKind = (typeof CARD_REFERENCE_KINDS)[number];

export type CardReference = {
  readonly kind: CardReferenceKind;
  readonly id: string;
};

/** Tarjeta operativa aprobada: un texto fijo con slots y referencias verificables. */
export type OperationsCard = {
  readonly id: string;
  readonly title: string;
  readonly mode: "fixed";
  readonly status: "approved";
  readonly channels: readonly CardChannel[];
  readonly requiredFacts: readonly string[];
  readonly template: string;
  readonly missingFactScript: string;
  readonly fallback: "explain_missing" | "ask" | "escalate";
  readonly references: readonly CardReference[];
};

/** Una tarjeta publicada solo vale con la version con la que se aprobo. */
export interface CardBinding<Card> {
  readonly version: number;
  readonly card: PublishedCard<Card>;
}

export interface PublishApproval {
  readonly tenantId: string;
  readonly approvedBy: string;
  readonly approvedAt: Date;
  readonly version: number;
  readonly actorTenantId: string;
  readonly permissions: readonly string[];
}

function canonicalJson(value: JsonValue): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return "[" + value.map(canonicalJson).join(",") + "]";
  return "{" + Object.entries(value)
    .sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)
    .map(([key, item]) => JSON.stringify(key) + ":" + canonicalJson(item))
    .join(",") + "}";
}

export function cardContentHash(card: JsonValue): string {
  return createHash("sha256").update(canonicalJson(card)).digest("hex");
}

export function makePublishedCard<Card extends JsonValue>(
  card: Card,
  approval: { tenantId: string; approvedBy: string; approvedAt: Date },
): PublishedCard<Card> {
  const snapshot = structuredClone(card);
  return {
    tenantId: approval.tenantId,
    card: snapshot,
    approvedBy: approval.approvedBy,
    approvedAt: approval.approvedAt.toISOString(),
    contentHash: cardContentHash(snapshot),
  };
}

function assertReference(reference: CardReference): void {
  if (!CARD_REFERENCE_KINDS.includes(reference.kind)) {
    throw new Error(`Referencia de tarjeta no admitida: ${String(reference.kind)}`);
  }
  const id = reference.id.trim();
  if (!id || id.length > 200 || /[\s\p{Cc}\u2028\u2029]/u.test(id)) {
    throw new Error("Una referencia de tarjeta necesita un id valido");
  }
}

function assertCardShape(card: Record<string, unknown>): void {
  if (card.mode !== undefined && card.mode !== "fixed") {
    throw new Error("Solo se publican tarjetas de modo fijo");
  }
  if (card.status !== undefined && card.status !== "approved") {
    throw new Error("Solo se publica una tarjeta aprobada");
  }
  if (card.channels !== undefined) {
    if (!Array.isArray(card.channels) || card.channels.length === 0 ||
        card.channels.some((channel) => !CARD_CHANNELS.includes(channel as CardChannel))) {
      throw new Error("La tarjeta declara un canal no admitido");
    }
  }
  if (card.requiredFacts !== undefined) {
    if (!Array.isArray(card.requiredFacts) ||
        card.requiredFacts.some((fact) => typeof fact !== "string" || !fact.trim())) {
      throw new Error("La tarjeta declara hechos requeridos invalidos");
    }
  }
  if (card.references !== undefined) {
    if (!Array.isArray(card.references)) throw new Error("Las referencias deben ser una lista");
    for (const reference of card.references as CardReference[]) assertReference(reference);
  }
}

/**
 * Publica una version nueva de una tarjeta. Exige tenant del actor, permiso de
 * publicacion y version creciente: republicar la misma version no reemplaza la
 * evidencia que ya se mostro.
 */
export function publishCardVersion<Card extends JsonValue>(
  existing: CardBinding<Card> | null,
  card: Card,
  approval: PublishApproval,
): CardBinding<Card> {
  if (approval.actorTenantId !== approval.tenantId) {
    throw new Error("El actor no puede publicar tarjetas de otra empresa");
  }
  if (!approval.permissions.includes("cards.publish")) {
    throw new Error("Falta permiso para publicar tarjetas");
  }
  if (!Number.isInteger(approval.version) || approval.version < 1) {
    throw new Error("La version de la tarjeta debe ser un entero positivo");
  }
  if (existing && approval.version <= existing.version) {
    throw new Error(`La version ${approval.version} no supera la publicada (${existing.version})`);
  }
  if (card !== null && typeof card === "object" && !Array.isArray(card)) {
    assertCardShape(card as unknown as Record<string, unknown>);
  }
  return { version: approval.version, card: makePublishedCard(card, approval) };
}

/**
 * Comprueba que la version y el contenido son los aprobados y que la tarjeta
 * pertenece a la empresa que la va a usar.
 */
export function assertCardBinding<Card extends JsonValue>(
  binding: CardBinding<Card>,
  access: { tenantId: string; version: number },
): void {
  if (binding.card.tenantId !== access.tenantId) {
    throw new Error("La tarjeta pertenece a otra empresa");
  }
  if (binding.version !== access.version) {
    throw new Error(`La tarjeta publicada es la version ${binding.version}, no la ${access.version}`);
  }
  if (cardContentHash(binding.card.card) !== binding.card.contentHash) {
    throw new Error("El contenido de la tarjeta no coincide con el hash aprobado");
  }
}
