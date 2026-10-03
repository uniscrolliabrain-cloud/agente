// D3_QUEUE_V1 - template queue real.
import type { ViewSpec } from "@openmuse/domain/views";

interface Props {
  spec: Extract<ViewSpec, { kind: "queue" }>;
  onAction?: (itemId: string, actionId: string) => void;
}

export default function QueueTemplate({ spec, onAction }: Props) {
  return (
    <section className="tpl tpl--queue">
      <h3 className="tpl__title">{spec.title}</h3>
      <div className="tpl-queue__list">
        {spec.items.map((i) => (
          <div className="tpl-queue__item" key={i.id} data-status={i.status}>
            <div className="tpl-queue__body">
              <b className="tpl-queue__title">{i.title}</b>
              {i.subtitle && <small className="tpl-queue__sub">{i.subtitle}</small>}
            </div>
            {i.actions.length > 0 && (
              <div className="tpl-queue__actions">
                {i.actions.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    className={`btn ${a.kind === "primary" ? "primary" : ""}`}
                    onClick={() => onAction?.(i.id, a.id)}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        {spec.items.length === 0 && (
          <div className="tpl-queue__empty">Sin elementos.</div>
        )}
      </div>
    </section>
  );
}