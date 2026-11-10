import type { RuntimeViewSpec } from "@agente/domain/views";

type TableSpec = Extract<RuntimeViewSpec, { kind: "table" }>;

function format(value: unknown): string {
  if (value === null || value === undefined) return "—";
  return typeof value === "object" ? JSON.stringify(value) : String(value);
}

export default function TableTemplate({ spec }: { spec: TableSpec }) {
  return (
    <section className="tpl tpl--table">
      <h3 className="tpl__title">{spec.title}</h3>
      {spec.rows.length === 0 ? (
        <div className="tpl-empty">No hay datos para esta vista.</div>
      ) : (
        <div className="tpl-table-wrap">
          <table className="tpl-table">
            <thead>
              <tr>
                {spec.columns.map((column) => (
                  <th key={column.key} style={{ textAlign: column.align }}>
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {spec.rows.map((row, index) => (
                <tr key={String(row.id ?? index)}>
                  {spec.columns.map((column) => (
                    <td key={column.key} style={{ textAlign: column.align }}>
                      {format(row[column.key])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
