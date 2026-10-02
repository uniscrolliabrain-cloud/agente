// UI_TEMPLATES_V1
import type { ViewSpec } from "../../view/spec.ts";
import FormRenderer from "../../forms/FormRenderer.tsx";
// UI_TEMPLATES_V1 - las columnas "chip" y "action" no son tipos de campo de
// formulario (FormField solo admite text/number/date/select/textarea), asi que
// se degradan a "text" en vez de romper el typecheck.
const FIELD_TYPES = ["text", "number", "date", "select", "textarea"] as const;
function toFieldType(type: string): (typeof FIELD_TYPES)[number] {
  return (FIELD_TYPES as readonly string[]).includes(type)
    ? (type as (typeof FIELD_TYPES)[number])
    : "text";
}
export default function FormTemplate({ spec }: { spec: ViewSpec }) {
  return <div className="rounded-xl border p-4"><h2 className="font-semibold">{spec.title} — form</h2><div className="mt-3"><FormRenderer spec={{ id: spec.id, title: spec.title, fields: (spec.columns ?? []).map(c=>({key:c.key,label:c.label,type:toFieldType(c.type)})), provenance: String(spec.provenance?.source ?? "") }} /></div></div>;
}