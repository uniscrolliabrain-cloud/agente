// ORDERED_LIST_V1 - las dos piezas visuales que el gesto necesita y que no
// pueden vivir dentro de un hook: la pieza que sigue al puntero y el anuncio
// para lectores de pantalla. Cada consumidor las monta una vez.
import type { OrderDrag } from "./useOrderedList";
import "./meta-order.css";

export function OrderGhost({ drag }: { drag: OrderDrag | null }) {
  if (!drag) return null;
  return (
    <span
      className="meta-order-ghost"
      style={{ left: drag.left, top: drag.y - drag.grab, width: drag.width, height: drag.height }}
      aria-hidden="true"
    >
      <span>{drag.label}</span>
    </span>
  );
}

export function OrderAnnounce({ text }: { text: string }) {
  return (
    <span className="meta-order-sr" role="status" aria-live="polite">
      {text}
    </span>
  );
}
