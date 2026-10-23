// FIELD_FILTER_V1 - filtra campos por clasificacion usando el mapa servidor.
// Se aplica en withRead, withWrite, serializadores, listados, busquedas, agregaciones.
import type { PolicyDecisionPoint, PolicyContext, PolicyTarget } from "./pdp.ts";
import {
  DEFAULT_CLASSIFICATION,
  type FieldClassification,
} from "../../../../../packages/domain/src/classification.ts";

export class FieldFilter {
  constructor(
    private readonly pdp: PolicyDecisionPoint,
    private readonly classification: Record<string, Record<string, FieldClassification>> = DEFAULT_CLASSIFICATION,
  ) {}

  async filter<T extends Record<string, unknown>>(
    ctx: PolicyContext,
    resource: string,
    record: T,
    target: PolicyTarget,
  ): Promise<T> {
    const map = this.classification[resource];
    if (!map) return record;
    const out: Record<string, unknown> = { ...record };
    for (const [field, classification] of Object.entries(map)) {
      if (!(field in out)) continue;
      if (classification === "public" || classification === "internal") continue;
      const decision = await this.pdp.can(
        ctx,
        "read",
        resource as never,
        field,
        { ...target, classification },
      );
      if (decision === "deny") {
        out[field] = "[REDACTED]";
      }
    }
    return out as T;
  }

  async filterList<T extends Record<string, unknown>>(
    ctx: PolicyContext,
    resource: string,
    records: T[],
    target: PolicyTarget,
  ): Promise<T[]> {
    const out: T[] = [];
    for (const r of records) {
      out.push(await this.filter(ctx, resource, r, target));
    }
    return out;
  }
}