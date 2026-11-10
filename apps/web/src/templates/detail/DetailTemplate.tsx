import type { RuntimeViewSpec } from "@agente/domain/views";

type DetailSpec = Extract<RuntimeViewSpec, { kind: "detail" }>;

function format(value: unknown): string {
  if (value === null || value === undefined) return "—";
  return String(value);
}

export default function DetailTemplate({ spec }: { spec: DetailSpec }) {
  return (
    <section className="tpl tpl--detail">
      <h3 className="tpl__title">{spec.title}</h3>
      {spec.properties.length === 0 ? (
        <div className="tpl-empty">No hay propiedades para mostrar.</div>
      ) : (
        <dl className="tpl-props">
          {spec.properties.map((property) => (
            <div className="tpl-prop" key={property.key}>
              <dt>{property.label}</dt>
              <dd>
                {format(property.value)}
                <span className="tpl-chip tpl-chip--muted">{property.provenance}</span>
              </dd>
            </div>
          ))}
        </dl>
      )}
      {spec.relations.length > 0 && (
        <div className="tpl-relations">
          <h4>Relaciones</h4>
          <ul>
            {spec.relations.map((relation) => (
              <li key={relation.id}>
                <span>{relation.targetName}</span>
                <small>{relation.type}</small>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
