// UI_TEMPLATES_V1
import type { ViewSpec } from "../../view/spec.ts";
import FormRenderer from "../../forms/FormRenderer.tsx";
export default function FormTemplate({ spec }: { spec: ViewSpec }) {
  return <div className="rounded-xl border p-4"><h2 className="font-semibold">{spec.title} — form</h2><div className="mt-3"><FormRenderer spec={{ id: spec.id, title: spec.title, fields: (spec.columns ?? []).map(c=>({key:c.key,label:c.label,type:c.type})), provenance: spec.provenance.source }} /></div></div>;
}