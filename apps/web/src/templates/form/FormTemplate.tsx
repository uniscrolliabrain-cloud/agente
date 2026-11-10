import type { RuntimeViewSpec } from "@agente/domain/views";

type FormSpec = Extract<RuntimeViewSpec, { kind: "form" }>;

function defaultValue(value: unknown): string | number | undefined {
  return typeof value === "string" || typeof value === "number" ? value : undefined;
}

export default function FormTemplate({ spec }: { spec: FormSpec }) {
  return (
    <section className="tpl tpl--form">
      <h3 className="tpl__title">{spec.title}</h3>
      {spec.fields.length === 0 ? (
        <div className="tpl-empty">No hay campos para mostrar.</div>
      ) : (
        <div className="tpl-form">
          {spec.fields.map((field) => (
            <label className="tpl-field" key={field.key}>
              <span>
                {field.label}
                <small className="tpl-chip tpl-chip--muted">{field.provenance}</small>
              </span>
              {field.type === "textarea" ? (
                <textarea defaultValue={defaultValue(field.value)} rows={3} />
              ) : field.type === "select" ? (
                <select defaultValue={defaultValue(field.value)}>
                  <option value="">Selecciona</option>
                  {(field.options ?? []).map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : field.type === "checkbox" ? (
                <input type="checkbox" defaultChecked={Boolean(field.value)} />
              ) : (
                <input
                  type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                  defaultValue={defaultValue(field.value)}
                />
              )}
            </label>
          ))}
          <p className="tpl-form__note">
            Borrador de solo lectura. Las acciones de escritura se conectan cuando el workspace declare su comando.
          </p>
        </div>
      )}
    </section>
  );
}
