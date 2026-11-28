import {
  Fragment,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useMediaQuery } from "../../../web/src/hooks/useMediaQuery";

import type { LucideIcon } from "lucide-react";
import "./meta-dock.css";
type DockEntry<T extends string> = { id: T; label: string; icon: LucideIcon };
const HOLD_MS = 240;
const MOVE_TOLERANCE = 5;

function readIds(key: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === "string") : [];
  } catch {
    return [];
  }
}

function writeIds(key: string, ids: string[]) {
  try {
    localStorage.setItem(key, JSON.stringify(ids));
  } catch {
    // Sin almacenamiento, el orden dura la sesión.
  }
}

export default function MetaDock<T extends string>({entries, activeView, onSelectView, namespace}: {entries: readonly DockEntry<T>[]; activeView:T; onSelectView:(id:T)=>void; namespace:string}) {
  const ORDER_KEY = namespace + "_dock_order_v1";
  const PIN_KEY = namespace + "_dock_pins_v1";
  const [order, setOrder] = useState<string[]>(() => {
    const known = entries.map(e=>e.id as string);
    const stored = [...new Set(readIds(ORDER_KEY))].filter(id=>known.includes(id));
    return [...stored,...known.filter(id=>!stored.includes(id))];
  });
  const [pins, setPins] = useState<string[]>(() => readIds(PIN_KEY));
  // DOCK_RAIL_MOBILE_V1 - en movil la barra pasa a ser una tira horizontal.
  const horizontal = useMediaQuery("(max-width: 900px)");
  const [drag, setDrag] = useState<{
    id: string;
    x: number;
    y: number;
    grabX: number;
    grabY: number;
    width: number;
    height: number;
  } | null>(null);
  const [slot, setSlot] = useState(0);
  const [tip, setTip] = useState<{ label: string; x: number; y: number } | null>(null);
  const rows = useRef(new Map<string, HTMLButtonElement>());
  const press = useRef<{ id: string; x: number; y: number; el: HTMLButtonElement } | null>(null);
  const hold = useRef<number | null>(null);
  const suppress = useRef(0);
  const base = useRef<string[]>([]);
  const insert = useRef(0);
  const axis = useRef<"x" | "y">("y");
  const scrollBox = useRef<HTMLElement | null>(null);

  useEffect(() => writeIds(ORDER_KEY, order), [order]);
  useEffect(() => writeIds(PIN_KEY, pins), [pins]);

  const pinnedIds = order.filter((id) => pins.includes(id));
  const looseIds = order.filter((id) => !pins.includes(id));
  const displayed = [...pinnedIds, ...looseIds];
  const divider = pinnedIds.length;

  const saveOrder = (ids: string[]) => setOrder(ids);

  const clearHold = () => {
    if (hold.current) {
      window.clearTimeout(hold.current);
      hold.current = null;
    }
    press.current = null;
  };

  // El temporizador de pulsación larga no debe sobrevivir al desmontaje.
  useEffect(() => clearHold, []);

  const beginDrag = (id: string, el: HTMLButtonElement, clientX: number, clientY: number) => {
    const rect = el.getBoundingClientRect();
    axis.current = horizontal ? "x" : "y";
    scrollBox.current = el.closest<HTMLElement>(".dock-pin, .dock-scroll");
    base.current = displayed;
    insert.current = Math.max(0, displayed.indexOf(id));
    setSlot(insert.current);
    suppress.current = Number.POSITIVE_INFINITY;
    press.current = null;
    setTip(null);
    setDrag({
      id,
      x: clientX,
      y: clientY,
      grabX: clientX - rect.left,
      grabY: clientY - rect.top,
      width: rect.width,
      height: rect.height,
    });
  };

  useEffect(() => {
    if (!drag) return;
    const moving = drag.id;
    const onMove = (event: PointerEvent) => {
      setDrag((value) => (value ? { ...value, x: event.clientX, y: event.clientY } : value));
      const scroller = scrollBox.current;
      if (scroller) {
        const box = scroller.getBoundingClientRect();
        if (axis.current === "x") {
          if (event.clientX < box.left + 30) scroller.scrollLeft -= 9;
          else if (event.clientX > box.right - 30) scroller.scrollLeft += 9;
        } else if (event.clientY < box.top + 26) scroller.scrollTop -= 9;
        else if (event.clientY > box.bottom - 26) scroller.scrollTop += 9;
      }
      let index = 0;
      for (const id of base.current) {
        if (id === moving) continue;
        const el = rows.current.get(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        const after =
          axis.current === "x"
            ? event.clientX > rect.left + rect.width / 2
            : event.clientY > rect.top + rect.height / 2;
        if (after) index += 1;
      }
      if (index !== insert.current) {
        insert.current = index;
        setSlot(index);
      }
    };
    const onUp = () => {
      const next = base.current.filter((id) => id !== moving);
      next.splice(Math.min(insert.current, next.length), 0, moving);
      saveOrder(next);
      suppress.current = performance.now() + 350;
      setDrag(null);
    };
    const onCancel = () => {
      suppress.current = performance.now() + 200;
      setDrag(null);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);
    window.addEventListener("keydown", onKey);
    // Si la ventana pierde el foco a mitad de arrastre no llega pointerup:
    // el fantasma se quedaba vivo y la barra dejaba de responder.
    window.addEventListener("blur", onCancel);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("blur", onCancel);
    };
    // `displayed` solo cambia al fijar; durante el arrastre se mantiene estable.
  }, [drag?.id]);

  // DOCK_RAIL_V1 - el gesto escucha en window desde el pointerdown: si solo
  // escuchara el botón, al salir de sus 38 px el arrastre se quedaba a medias.
  const onPointerDown = (entry: DockEntry<T>, event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const el = event.currentTarget;
    const startX = event.clientX;
    const startY = event.clientY;
    const touch = event.pointerType === "touch";
    const scroller = el.closest<HTMLElement>(".dock-pin, .dock-scroll");
    const startScroll = scroller?.scrollLeft ?? 0;
    press.current = { id: entry.id, x: startX, y: startY, el };
    if (hold.current) window.clearTimeout(hold.current);
    hold.current = window.setTimeout(() => {
      hold.current = null;
      const held = press.current;
      // Solo en táctil: con ratón el arrastre empieza al mover, nunca por
      // esperar; si no, un clic normal se convertía en un arrastre fantasma
      // que se quedaba colgado y bloqueaba la barra.
      if (held && touch) beginDrag(held.id, held.el, startX, startY);
    }, HOLD_MS);

    function detach() {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
    }

    function release() {
      if (hold.current) {
        window.clearTimeout(hold.current);
        hold.current = null;
      }
      press.current = null;
      detach();
    }
    const onMove = (move: PointerEvent) => {
      const held = press.current;
      if (!held) {
        detach();
        return;
      }
      const dx = move.clientX - startX;
      const dy = move.clientY - startY;
      const moved = Math.abs(dx) > MOVE_TOLERANCE || Math.abs(dy) > MOVE_TOLERANCE;
      if (!moved) return;
      // Al moverse se cancela la pulsacion larga: en el movil ese mismo gesto
      // desplaza la tira en horizontal, sin robarle el gesto al reordenar.
      if (hold.current) {
        window.clearTimeout(hold.current);
        hold.current = null;
      }
      if (!touch) {
        detach();
        beginDrag(entry.id, el, move.clientX, move.clientY);
        return;
      }
      if (horizontal && scroller) {
        scroller.scrollLeft = startScroll - dx;
        suppress.current = performance.now() + 220;
      }
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
  };

  const onPick = (entry: DockEntry<T>, _event: ReactMouseEvent<HTMLButtonElement>) => {
    if (performance.now() < suppress.current) return;

    onSelectView(entry.id);
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>, id: string) => {
    if (!event.altKey) return;
    const direction = event.key === "ArrowUp" ? -1 : event.key === "ArrowDown" ? 1 : 0;
    if (!direction) return;
    event.preventDefault();
    const from = displayed.indexOf(id);
    const to = from + direction;
    if (from < 0 || to < 0 || to >= displayed.length) return;
    const next = [...displayed];
    next.splice(from, 1);
    next.splice(to, 0, id);
    saveOrder(next);
  };

  const showTip = (entry: DockEntry<T>) => (event: ReactMouseEvent<HTMLButtonElement>) => {
    if (drag || horizontal) return;
    const rect = event.currentTarget.getBoundingClientRect();
    setTip({ label: entry.label, x: rect.right + 10, y: rect.top + rect.height / 2 });
  };

  const renderRow = (entry: DockEntry<T>, index: number) => {
    const Icon = entry.icon;
    const active = entry.id === activeView;
    const pinned = pins.includes(entry.id);
    return (
      <Fragment key={entry.id}>
        {drag && slot === index && <span className="dock-slot" aria-hidden="true" />}
        <button
          type="button"
          className="dock-btn"
          data-active={active || undefined}
          data-pinned={pinned || undefined}
          data-dragging={drag?.id === entry.id || undefined}
          ref={(node) => {
            if (node) rows.current.set(entry.id, node);
            else rows.current.delete(entry.id);
          }}
          onClick={(event) => onPick(entry, event)}
          onDoubleClick={()=>{if(performance.now()>=suppress.current)setPins(prev=>prev.includes(entry.id)?prev.filter(id=>id!==entry.id):[entry.id,...prev]);}}
          onPointerDown={(event) => onPointerDown(entry, event)}
          onMouseEnter={showTip(entry)}
          onMouseLeave={() => setTip(null)}
          onKeyDown={(event) => onKeyDown(event, entry.id)}
          aria-label={entry.label}
          aria-pressed={pinned}
          title={undefined}
        >
          <Icon size={17} strokeWidth={1.7} aria-hidden="true" />
        </button>
      </Fragment>
    );
  };

  const dragging = drag ? entries.find((entry) => entry.id === drag.id) : undefined;

  return (
    <aside className="shell__dock" data-orient={horizontal ? "row" : "col"} aria-label="Accesos rápidos">
      <div className="dock">
        <div className="dock-pin" data-empty={divider === 0}>
          {displayed.slice(0, divider).map((id, index) => {
            const entry = entries.find((item) => item.id === id);
            return entry ? renderRow(entry, index) : null;
          })}
        </div>
        {divider > 0 && <span className="dock-divider" aria-hidden="true" />}
        <div className="dock-scroll">
          {displayed.slice(divider).map((id, offset) => {
            const entry = entries.find((item) => item.id === id);
            return entry ? renderRow(entry, divider + offset) : null;
          })}
          {drag && slot === displayed.length && (
            <span className="dock-slot" style={{ margin: "4px auto" }} aria-hidden="true" />
          )}
        </div>
      </div>

      {tip && !drag && (
        <span className="dock-tip" role="tooltip" style={{ left: tip.x, top: tip.y }}>
          {tip.label}
        </span>
      )}
      {drag && dragging && (
        <span
          className="dock-ghost"
          style={{
            left: drag.x - drag.grabX,
            top: drag.y - drag.grabY,
            width: drag.width,
            height: drag.height,
          }}
          aria-hidden="true"
        >
          <dragging.icon size={17} strokeWidth={1.7} />
        </span>
      )}
      <span  className="sr-only">
        Pulsa para abrir; pulsa dos veces para fijar o desfijar. Mantén pulsado y arrastra para reordenar; con teclado,
        Alt y flechas arriba o abajo.
      </span>
    </aside>
  );
}
