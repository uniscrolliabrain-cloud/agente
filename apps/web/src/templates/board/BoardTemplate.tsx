import type { RuntimeViewSpec } from "@agente/domain/views";

type BoardSpec = Extract<RuntimeViewSpec, { kind: "board" }>;

export default function BoardTemplate({ spec }: { spec: BoardSpec }) {
  return (
    <section className="tpl tpl--board">
      <h3 className="tpl__title">{spec.title}</h3>
      {spec.columns.length === 0 ? (
        <div className="tpl-empty">No hay columnas para mostrar.</div>
      ) : (
        <div className="tpl-board">
          {spec.columns.map((column) => (
            <div className="tpl-board__column" key={column.id}>
              <h4>
                {column.label}
                <span>{spec.cards.filter((card) => card.columnId === column.id).length}</span>
              </h4>
              {spec.cards
                .filter((card) => card.columnId === column.id)
                .map((card) => (
                  <article className="tpl-board__card" key={card.id}>
                    <b>{card.title}</b>
                    {card.subtitle && <small>{card.subtitle}</small>}
                    {card.updatedAt && <time>{card.updatedAt}</time>}
                  </article>
                ))}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
