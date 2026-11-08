import { createHash } from "node:crypto";
import type { PublishedCard } from "../../../../packages/domain/src/published-card.ts";

type JsonValue = null | boolean | number | string | readonly JsonValue[] | { readonly [key: string]: JsonValue };

function canonicalJson(value: JsonValue): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return "[" + value.map(canonicalJson).join(",") + "]";
  return "{" + Object.entries(value)
    .sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)
    .map(([key, item]) => JSON.stringify(key) + ":" + canonicalJson(item))
    .join(",") + "}";
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
    contentHash: createHash("sha256").update(canonicalJson(snapshot)).digest("hex"),
  };
}
