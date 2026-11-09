// FIELD_FILTER_V1 - filtra campos por clasificacion usando el mapa servidor.
// Se aplica en withRead, withWrite, serializadores, listados, busquedas, agregaciones.
import type { PolicyDecisionPoint, PolicyContext, PolicyTarget } from "./pdp.ts";
import {
  DEFAULT_CLASSIFICATION,
  classifyRecord,
  type ClassifiedRecord,
  type FieldClassification,
} from "../../../../../packages/domain/src/classification.ts";
import type {
  FieldPolicy,
  PolicyActionV2,
} from "../../../../../packages/domain/src/policy-context.ts";

// FIELD_POLICY_DEFAULT_V1 - la politica por defecto se deriva del mapa de
// clasificacion: un campo "secret" no es legible ni escribible; el resto de
// campos clasificados son legibles. Antes no habia FieldPolicy aplicada.
export function defaultFieldPolicies(
  classification: Record<string, Record<string, FieldClassification>> = DEFAULT_CLASSIFICATION,
): FieldPolicy[] {
  return Object.entries(classification).map(([resource, fields]) => {
    const entries = Object.entries(fields);
    return {
      id: `${resource}-default`,
      resource,
      readable: entries
        .filter(([, level]) => level !== "secret")
        .map(([field]) => field),
      writable: entries
        .filter(([, level]) => level === "public" || level === "internal")
        .map(([field]) => field),
    };
  });
}

export class FieldFilter {
  constructor(
    private readonly pdp: PolicyDecisionPoint,
    private readonly classification: Record<string, Record<string, FieldClassification>> = DEFAULT_CLASSIFICATION,
    private readonly policies: FieldPolicy[] = defaultFieldPolicies(classification),
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
    const classified: ClassifiedRecord = classifyRecord(map);
    const policy = this.policies.find((p) => p.resource === resource);
    for (const { field, classification } of classified.fields) {
      if (!(field in out)) continue;
      if (classification === "public" || classification === "internal") continue;
      if (policy && !policy.readable.includes(field)) {
        out[field] = "[REDACTED]";
        continue;
      }
      const action: PolicyActionV2 = "read";
      const decision = await this.pdp.can(
        ctx,
        action,
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
