// FORM_BUILDER_V1 - construye FormSpec desde Business Schema + Graph + memoria.

import type { Store } from "../db.ts";
import type { BusinessGraph } from "./business/graph.ts";
import type { MemoryService } from "./memory.ts";
import type { FormFieldSpec, FormSpec } from "../../../../packages/domain/src/form-spec.ts";

export interface BuildFormInput {
  owner: string;
  entityType: string;
  title?: string;
  initial?: Record<string, unknown>;
}

export class FormBuilder {
  constructor(
    private readonly db: Store,
    private readonly graph: BusinessGraph | undefined,
    private readonly memory: MemoryService | undefined,
  ) {}

  async build(input: BuildFormInput): Promise<FormSpec> {
    const schema = await this.db
      .get<{
        entities: Array<{
          type: string;
          label: string;
          fields: Array<{
            name: string;
            label: string;
            type: string;
            required?: boolean;
            enumValues?: string[];
          }>;
        }>;
      }>(input.owner, "business-schemas", "default")
      .catch(() => null);

    const entityDef = schema?.entities.find((e) => e.type === input.entityType);
    const fields: FormFieldSpec[] = [];

    if (entityDef) {
      for (const f of entityDef.fields) {
        const prefill = input.initial?.[f.name];
        const fieldType = mapFieldType(f.type);
        fields.push({
          key: f.name,
          label: f.label,
          type: fieldType,
          required: Boolean(f.required),
          ...(f.enumValues ? { options: f.enumValues } : {}),
          ...(prefill !== undefined ? { value: prefill } : {}),
          provenance: prefill !== undefined ? "sugerido" : "missing",
        });
      }
    }

    // Autoprecarga desde memoria (preferencias, tono).
    if (this.memory) {
      const recalled = await this.memory.recall(input.owner, input.entityType).catch(() => null);
      for (const m of recalled?.memories ?? []) {
        const key = `mem_${m.id.slice(0, 8)}`;
        fields.push({
          key,
          label: `Memoria: ${m.text.slice(0, 60)}`,
          type: "text",
          required: false,
          value: m.text,
          provenance: "sugerido",
        });
      }
    }

    return {
      id: `form-${input.entityType}-${Date.now()}`,
      title: input.title ?? `Alta de ${entityDef?.label ?? input.entityType}`,
      entityType: input.entityType,
      fields,
      submitLabel: "Crear",
      cancelLabel: "Cancelar",
      provenance: { source: "form-builder" },
    };
  }
}

function mapFieldType(t: string): FormFieldSpec["type"] {
  if (t === "number" || t === "money") return "number";
  if (t === "boolean") return "checkbox";
  if (t === "date" || t === "datetime") return "date";
  if (t === "enum") return "select";
  if (t === "json") return "textarea";
  return "text";
}