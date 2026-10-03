// UI_TEMPLATES_V1
import type { ViewSpec } from "../../view/spec.ts";
import FormRenderer from "../../forms/FormRenderer.tsx";

const FIELD_TYPES = ["text", "number", "date", "select", "textarea"] as const;
function toFieldType(type: string): (typeof FIELD_TYPES)[number] {
  return (FIELD_TYPES as readonly string[]).includes(type)
    ? (type as (typeof FIELD_TYPES)[number])
    : "text";
}

export default function FormTemplate({ spec }: { spec: ViewSpec }) {
  const fields = (spec.columns ?? []).map((c) => ({
    key: c.key,
    label: c.label,
    type: toFieldType(c.type),
    provenance: "missing" as const,
  }));
  const formSpec = {
    id: spec.id,
    title: spec.title,
    entityType: String((spec.provenance as Record<string, unknown> | undefined)?.source ?? "entity"),
    fields,
  };
  return (
    <div className="rounded-xl border p-4">
      <h2 className="font-semibold">{spec.title} — form</h2>
      <div className="mt-3">
        <FormRenderer spec={formSpec} />
      </div>
    </div>
  );
}
