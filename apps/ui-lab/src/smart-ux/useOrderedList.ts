// ORDERED_LIST_V1 - un solo gesto de orden para toda la capa compartida.
// La mecánica está copiada de la que ya funciona en la app (SIDEBAR_ORDER_V1 y
// CHATS_ORDER_V1), no reinventada: pulsación larga en táctil, arrastre inmediato
// con ratón, línea en la fila de destino, Alt+flechas con teclado y, si se pide,
// triple clic para subir una fila arriba.
// No pinta nada: devuelve estado y manejadores para que cada consumidor ponga su
// aspecto. Solo guarda preferencias de interfaz, nunca datos de negocio.
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";

/** Caja de la pieza que sigue al puntero mientras se arrastra. */
export type OrderDrag = {
  id: string;
  label: string;
  y: number;
  left: number;
  width: number;
  height: number;
  grab: number;
};

export type OrderDropMarker = "before" | "after" | null;

type Options = {
  /** Identificadores canónicos, en el orden que declara el producto. */
  ids: readonly string[];
  /** Clave de almacenamiento propia de esta lista. */
  storageKey: string;
  enabled?: boolean;
  holdMs?: number;
  tolerance?: number;
  /** CHATS_ORDER_V1 - triple clic sube la fila arriba. */
  tripleClickToTop?: boolean;
  onChange?: (next: string[]) => void;
  /** SPLIT_PANE_V1 - soltar fuera de la barra devuelve el id que se abre al lado. */
  onDropOutside?: (id: string) => void;
  /** Selector de la barra: su borde derecho marca la zona de destino. */
  railSelector?: string;
};

const TRIPLE_MS = 700;

function readIds(key: string): string[] {
  try {
    const raw = window.localStorage.getItem(key);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === "string") : [];
  } catch {
    return [];
  }
}

function writeIds(key: string, ids: string[]): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(ids));
  } catch {
    // Sin almacenamiento (modo privado, iframe restringido) el orden dura la sesión.
  }
}

export function useOrderedList({
  ids,
  storageKey,
  enabled = true,
  holdMs = 260,
  tolerance = 6,
  tripleClickToTop = false,
  onChange,
  onDropOutside,
  railSelector,
}: Options) {
  const signature = ids.join("|");
  const [order, setOrder] = useState<string[]>([]);
  const [drag, setDrag] = useState<OrderDrag | null>(null);
  const [dropBefore, setDropBefore] = useState<string | null>(null);
  const [dropAtEnd, setDropAtEnd] = useState(false);
  const [announce, setAnnounce] = useState("");
  /** El puntero está fuera de la barra: soltar abre el panel dividido. */
  const [outside, setOutside] = useState(false);
  const rows = useRef(new Map<string, HTMLElement>());
  const labels = useRef(new Map<string, string>());
  const hold = useRef<number | null>(null);
  const press = useRef<{ id: string; label: string; x: number; y: number; el: HTMLElement } | null>(null);
  const before = useRef<string | null>(null);
  const atEnd = useRef(false);
  const suppress = useRef(0);
  const base = useRef<string[]>([]);
  const change = useRef(onChange);
  const dropOut = useRef(onDropOutside);
  const railBox = useRef<DOMRect | null>(null);
  const isOutside = useRef(false);
  const clicks = useRef<{ id: string; count: number; at: number }>({ id: "", count: 0, at: 0 });

  useEffect(() => {
    change.current = onChange;
    dropOut.current = onDropOutside;
  }, [onChange, onDropOutside]);

  // El orden guardado se respeta; lo nuevo que aún no estaba se añade al final.
  useEffect(() => {
    if (!enabled) return;
    const canonical = signature.split("|").filter(Boolean);
    const stored = readIds(storageKey);
    setOrder([...stored.filter((id) => canonical.includes(id)), ...canonical.filter((id) => !stored.includes(id))]);
  }, [enabled, signature, storageKey]);

  const orderedIds = useMemo(() => {
    const canonical = signature.split("|").filter(Boolean);
    if (!enabled || !order.length) return canonical;
    const rank = new Map(order.map((id, index) => [id, index]));
    return [...canonical].sort((a, b) => (rank.get(a) ?? Number.MAX_SAFE_INTEGER) - (rank.get(b) ?? Number.MAX_SAFE_INTEGER));
  }, [enabled, order, signature]);

  const rank = useMemo(() => new Map(orderedIds.map((id, index) => [id, index])), [orderedIds]);

  /** Ordena cualquier lista de elementos con `id` según el orden guardado. */
  const sortList = useCallback(
    <T extends { id: string }>(list: readonly T[]): T[] =>
      [...list].sort((a, b) => (rank.get(a.id) ?? Number.MAX_SAFE_INTEGER) - (rank.get(b.id) ?? Number.MAX_SAFE_INTEGER)),
    [rank],
  );

  const save = useCallback(
    (next: string[]) => {
      setOrder(next);
      writeIds(storageKey, next);
      change.current?.(next);
    },
    [storageKey],
  );

  const clearHold = useCallback(() => {
    if (hold.current) window.clearTimeout(hold.current);
    hold.current = null;
    press.current = null;
  }, []);

  useEffect(() => clearHold, [clearHold]);

  const beginDrag = useCallback(
    (id: string, label: string, el: HTMLElement, clientY: number) => {
      const rect = el.getBoundingClientRect();
      railBox.current = railSelector ? (document.querySelector(railSelector)?.getBoundingClientRect() ?? null) : null;
      isOutside.current = false;
      setOutside(false);
      base.current = orderedIds;
      before.current = null;
      atEnd.current = false;
      setDropBefore(null);
      setDropAtEnd(false);
      suppress.current = Number.POSITIVE_INFINITY;
      press.current = null;
      setDrag({ id, label, y: clientY, left: rect.left, width: rect.width, height: rect.height, grab: clientY - rect.top });
    },
    [orderedIds, railSelector],
  );

  // El gesto escucha en window desde que empieza: si solo escuchara en la fila,
  // mover el puntero fuera de ella cortaría el arrastre.
  useEffect(() => {
    if (!drag) return;
    const moving = drag.id;
    const label = drag.label;
    const onMove = (event: PointerEvent) => {
      setDrag((value) => (value ? { ...value, y: event.clientY } : value));
      // SPLIT_PANE_V1 - fuera de la barra se ofrece el panel dividido y se deja
      // de calcular el hueco de la lista.
      const out = Boolean(dropOut.current && railBox.current && event.clientX > railBox.current.right + 8);
      if (out !== isOutside.current) {
        isOutside.current = out;
        setOutside(out);
      }
      if (out) return;
      let target: string | null = null;
      for (const id of base.current) {
        if (id === moving) continue;
        const el = rows.current.get(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (event.clientY < rect.top + rect.height / 2) {
          target = id;
          break;
        }
      }
      const end = target === null;
      if (target !== before.current || end !== atEnd.current) {
        before.current = target;
        atEnd.current = end;
        setDropBefore(target);
        setDropAtEnd(end);
      }
    };
    const finish = (commit: boolean) => {
      const next = base.current.filter((id) => id !== moving);
      if (commit && isOutside.current) {
        // SPLIT_PANE_V1 - soltar fuera de la barra: esa fila se abre al lado.
        isOutside.current = false;
        setOutside(false);
        dropOut.current?.(moving);
        suppress.current = performance.now() + 400;
        before.current = null;
        atEnd.current = false;
        setDropBefore(null);
        setDropAtEnd(false);
        setDrag(null);
        return;
      }
      if (commit) {
        const at = before.current ? next.indexOf(before.current) : -1;
        if (at >= 0) next.splice(at, 0, moving);
        else next.push(moving);
        save(next);
        setAnnounce(`${label}, posición ${next.indexOf(moving) + 1} de ${next.length}`);
      }
      suppress.current = performance.now() + 400;
      before.current = null;
      atEnd.current = false;
      setDropBefore(null);
      setDropAtEnd(false);
      setDrag(null);
    };
    const onUp = () => finish(true);
    const onCancel = () => finish(false);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") finish(false);
    };
    const stopTouch = (event: TouchEvent) => event.preventDefault();
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);
    window.addEventListener("keydown", onKey);
    window.addEventListener("touchmove", stopTouch, { passive: false });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("touchmove", stopTouch);
    };
    // Depende del id, no del objeto: si dependiera del objeto, el efecto se
    // volvería a suscribir en cada píxel del arrastre.
  }, [drag?.id, drag?.label, save]);

  const onRowPointerDown = (id: string, label: string) => (event: ReactPointerEvent<HTMLElement>) => {
    if (!enabled) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const el = event.currentTarget;
    clearHold();
    press.current = { id, label, x: event.clientX, y: event.clientY, el };
    hold.current = window.setTimeout(() => {
      hold.current = null;
      const held = press.current;
      if (held) beginDrag(held.id, held.label, held.el, held.y);
    }, holdMs);
  };

  const onRowPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (drag) return;
    const held = press.current;
    if (!held) return;
    const moved = Math.abs(event.clientX - held.x) > tolerance || Math.abs(event.clientY - held.y) > tolerance;
    if (!moved) return;
    // Con ratón el arrastre arranca al moverse, sin esperar la pulsación larga;
    // en táctil se mantiene la espera para no robarle el scroll a la lista.
    if (event.pointerType !== "touch") {
      const { id, label, el } = held;
      clearHold();
      beginDrag(id, label, el, event.clientY);
      return;
    }
    clearHold();
  };

  const onRowKeyDown = (event: ReactKeyboardEvent<HTMLElement>, id: string) => {
    if (!enabled || !event.altKey) return;
    const direction = event.key === "ArrowUp" ? -1 : event.key === "ArrowDown" ? 1 : 0;
    if (!direction) return;
    event.preventDefault();
    const from = orderedIds.indexOf(id);
    const to = from + direction;
    if (from < 0) return;
    if (to < 0 || to >= orderedIds.length) {
      setAnnounce("Extremo de la lista");
      return;
    }
    const next = [...orderedIds];
    next.splice(from, 1);
    next.splice(to, 0, id);
    save(next);
    setAnnounce(`${labels.current.get(id) ?? id}, posición ${to + 1} de ${next.length}`);
  };

  const moveToTop = useCallback(
    (id: string) => {
      const next = [id, ...orderedIds.filter((entry) => entry !== id)];
      save(next);
      setAnnounce(`${labels.current.get(id) ?? id}, primera posición de ${next.length}`);
    },
    [orderedIds, save],
  );

  /** true = el clic ya se usó para ordenar y no debe abrir la fila. */
  const onRowClick = (id: string): boolean => {
    const now = performance.now();
    if (now < suppress.current) return true;
    if (!tripleClickToTop) return false;
    const current = clicks.current;
    clicks.current =
      current.id === id && now - current.at < TRIPLE_MS ? { id, count: current.count + 1, at: now } : { id, count: 1, at: now };
    if (clicks.current.count < 3) return false;
    clicks.current = { id: "", count: 0, at: 0 };
    moveToTop(id);
    return true;
  };

  const registerRow = (id: string, label: string) => (el: HTMLElement | null) => {
    if (el) {
      rows.current.set(id, el);
      labels.current.set(id, label);
    } else {
      rows.current.delete(id);
    }
  };

  const dropMarker = (id: string): OrderDropMarker =>
    dropBefore === id ? "before" : dropAtEnd && orderedIds[orderedIds.length - 1] === id ? "after" : null;

  /** Props listas para una fila: ref, gestos y marca de destino. */
  const bindRow = (id: string, label?: string) => ({
    ref: registerRow(id, label ?? id),
    onPointerDown: onRowPointerDown(id, label ?? id),
    onPointerMove: onRowPointerMove,
    onKeyDown: (event: ReactKeyboardEvent<HTMLElement>) => onRowKeyDown(event, id),
    "data-order-drop": dropMarker(id) ?? undefined,
  });

  return {
    /** Ids en el orden guardado. */
    orderedIds,
    /** Ordena una lista de elementos con `id`. */
    sortList,
    drag,
    /** Soltar ahora abre el panel dividido en vez de reordenar. */
    outside,
    dropBefore,
    dropAtEnd,
    /** "before" / "after" / null para la fila indicada. */
    dropMarker,
    announce,
    bindRow,
    onRowClick,
    moveToTop,
    saveOrder: save,
  };
}

export type OrderedList = ReturnType<typeof useOrderedList>;
