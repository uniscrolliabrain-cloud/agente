import type { RuntimeViewSpec } from "@agente/domain/views";

type InboxSpec = Extract<RuntimeViewSpec, { kind: "inbox" }>;

export default function InboxTemplate({
  spec,
  onAction,
}: {
  spec: InboxSpec;
  onAction?: (itemId: string, actionId: string) => void;
}) {
  return (
    <section className="tpl tpl--inbox">
      <h3 className="tpl__title">{spec.title}</h3>
      {spec.items.length === 0 ? (
        <div className="tpl-empty">No hay elementos pendientes.</div>
      ) : (
        <div className="tpl-inbox">
          {spec.items.map((item) => (
            <article className="tpl-inbox__item" key={item.id} data-priority={item.priority}>
              <div>
                <b>{item.title}</b>
                {item.subtitle && <small>{item.subtitle}</small>}
              </div>
              <span className="tpl-chip">{item.priority}</span>
              {onAction && item.actions.length > 0 && (
                <div className="tpl-actions">
                  {item.actions.map((action) => (
                    <button
                      key={action.id}
                      type="button"
                      className="btn"
                      onClick={() => onAction(item.id, action.id)}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
