// MOBILE_SHEET_V2 - hoja inferior arrastrable, como el panel de Google Maps.
// El alto del panel es el alto visible: barra arriba, conversacion en medio y el
// compositor abajo, que es lo que hace que al plegarla se vea el final del hilo y
// no el principio. Durante el gesto solo se escribe style.height (sin setState),
// y el estado de la hoja no vive en App: arrastrarla no re-renderiza la app.
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Maximize2, Settings, X } from "lucide-react";
import SidebarChat, { type DockChat } from "./SidebarChat";
import "./MobileChatSheet.css";

const SNAP_PERCENTS = [26, 45, 68, 100];
// En un movil de 623 px el 26% son 162 px y el compositor se corta. El minimo no
// es un numero fijo: se mide la fila del tirador y el compositor reales, porque
// el safe-area de un iPhone suma ~34 px y el boton de enviar quedaba cortado.
const MIN_VISIBLE_PX = 184;
const MIN_GAP_PX = 12;
const TAP_SLOP_PX = 8;

function viewportHeight(): number {
  return window.visualViewport?.height ?? window.innerHeight ?? 1;
}

function minVisible(panel: HTMLElement | null): number {
  const bar = panel?.querySelector<HTMLElement>(".mobile-sheet-bar");
  const foot = panel?.querySelector<HTMLElement>(".side-chat-foot");
  // El cuerpo no suma: plegada del todo se oculta y el compositor sube hasta la
  // barra. Sumarlo dejaba una banda vacia entre el tirador y la caja de escribir.
  const needed = (bar?.offsetHeight ?? 0) + (foot?.offsetHeight ?? 0) + MIN_GAP_PX;
  return Math.max(MIN_VISIBLE_PX, needed);
}

function visiblePx(percent: number, height: number, minPx: number): number {
  return Math.min(height, Math.max(minPx, (height * percent) / 100));
}

function nearestSnap(visible: number, height: number, minPx: number): number {
  let best = 0;
  let bestDelta = Number.POSITIVE_INFINITY;
  SNAP_PERCENTS.forEach((percent, index) => {
    const delta = Math.abs(visiblePx(percent, height, minPx) - visible);
    if (delta < bestDelta) {
      bestDelta = delta;
      best = index;
    }
  });
  return best;
}

interface Props {
  chat: DockChat;
  tenantLabel: string;
  onClose: () => void;
  onOpenFullChat: () => void;
  onOpenSettings: () => void;
}

export default function MobileChatSheet({
  chat,
  tenantLabel,
  onClose,
  onOpenFullChat,
  onOpenSettings,
}: Props) {
  const [snapIndex, setSnapIndex] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const snapRef = useRef(0);

  const applySnap = useCallback((index: number) => {
    const panel = panelRef.current;
    if (!panel) return;
    const height = viewportHeight();
    const minPx = minVisible(panel);
    const px = visiblePx(SNAP_PERCENTS[index] ?? 26, height, minPx);
    panel.style.height = `${px}px`;
    // Plegada del todo solo queda el tirador y la caja de escribir: una franja de
    // 20 px de mensaje cortado parecia un fallo de pintado.
    panel.classList.toggle("collapsed", px <= minPx + 2);
  }, []);

  const setSnap = useCallback(
    (index: number) => {
      snapRef.current = index;
      setSnapIndex(index);
      applySnap(index);
    },
    [applySnap],
  );

  // Primer pintado en su peldaño, antes de que se vea el panel.
  useLayoutEffect(() => {
    applySnap(snapRef.current);
  }, [applySnap]);

  useEffect(() => {
    const onResize = () => applySnap(snapRef.current);
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    window.visualViewport?.addEventListener("resize", onResize);
    const viewport = window.visualViewport;
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      viewport?.removeEventListener("resize", onResize);
    };
  }, [applySnap]);

  useEffect(() => {
    const panel = panelRef.current;
    const bar = barRef.current;
    if (!panel || !bar) return;

    // Diagnostico sin interfaz: en el movil, `window.__sheetDebug` dice si el
    // navegador entrega el gesto o lo cancela antes de que llegue.
    const debug = { down: 0, move: 0, cancel: 0, kind: "" };
    (window as unknown as { __sheetDebug?: typeof debug }).__sheetDebug = debug;

    let active = false;
    let pointerId: number | null = null;
    let startY = 0;
    let startHeight = 0;
    let maxHeight = 0;
    let minPx = MIN_VISIBLE_PX;
    let travelled = 0;

    const begin = (clientY: number, kind: string) => {
      const rect = panel.getBoundingClientRect();
      maxHeight = viewportHeight();
      minPx = minVisible(panel);
      startHeight = rect.height;
      startY = clientY;
      travelled = 0;
      active = true;
      debug.down += 1;
      debug.kind = kind;
      panel.classList.add("dragging");
    };

    const moveTo = (clientY: number) => {
      if (!active) return;
      const next = Math.max(minPx, Math.min(maxHeight, startHeight + (startY - clientY)));
      travelled = Math.max(travelled, Math.abs(next - startHeight));
      panel.style.height = `${next}px`;
      panel.classList.toggle("collapsed", next <= minPx + 2);
      debug.move += 1;
    };

    const finish = () => {
      if (!active) return;
      active = false;
      pointerId = null;
      panel.classList.remove("dragging");
      const height = panel.getBoundingClientRect().height;
      if (travelled < TAP_SLOP_PX) {
        setSnap((snapRef.current + 1) % SNAP_PERCENTS.length);
        return;
      }
      setSnap(nearestSnap(height, maxHeight, minPx));
    };

    const isControl = (target: EventTarget | null) =>
      (target as HTMLElement | null)?.closest("button, a, input, textarea, select") ?? null;

    const touchAvailable = "ontouchstart" in window || navigator.maxTouchPoints > 0;

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      // En tactil manda la via de touch: los dos caminos a la vez se pelean.
      if (event.pointerType !== "mouse" && touchAvailable) return;
      if (isControl(event.target)) return;
      pointerId = event.pointerId;
      try {
        bar.setPointerCapture(event.pointerId);
      } catch {
        /* navegadores sin captura de puntero */
      }
      begin(event.clientY, "pointer");
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!active || pointerId === null || event.pointerId !== pointerId) return;
      if (event.cancelable) event.preventDefault();
      moveTo(event.clientY);
    };
    const onPointerUp = (event: PointerEvent) => {
      if (pointerId !== null && event.pointerId !== pointerId) return;
      // El ultimo pointermove puede llegar fundido con el up: se aplica la
      // posicion final del dedo antes de calcular el peldaño.
      moveTo(event.clientY);
      finish();
    };
    const onPointerCancel = () => {
      debug.cancel += 1;
      finish();
    };

    const onTouchStart = (event: TouchEvent) => {
      if (active || isControl(event.target)) return;
      if (event.cancelable) event.preventDefault();
      const touch = event.touches[0];
      if (touch) begin(touch.clientY, "touch");
    };
    const onTouchMove = (event: TouchEvent) => {
      if (!active) return;
      // Sin preventDefault el navegador se lleva el gesto como scroll de pagina.
      if (event.cancelable) event.preventDefault();
      const touch = event.touches[0];
      if (touch) moveTo(touch.clientY);
    };
    const onTouchEnd = (event: TouchEvent) => {
      const touch = event.changedTouches[0];
      if (touch) moveTo(touch.clientY);
      finish();
    };
    const onTouchCancel = () => {
      debug.cancel += 1;
      finish();
    };

    bar.addEventListener("pointerdown", onPointerDown);
    bar.addEventListener("pointermove", onPointerMove);
    bar.addEventListener("pointerup", onPointerUp);
    bar.addEventListener("pointercancel", onPointerCancel);
    bar.addEventListener("touchstart", onTouchStart, { passive: false });
    bar.addEventListener("touchmove", onTouchMove, { passive: false });
    bar.addEventListener("touchend", onTouchEnd);
    bar.addEventListener("touchcancel", onTouchCancel);

    return () => {
      bar.removeEventListener("pointerdown", onPointerDown);
      bar.removeEventListener("pointermove", onPointerMove);
      bar.removeEventListener("pointerup", onPointerUp);
      bar.removeEventListener("pointercancel", onPointerCancel);
      bar.removeEventListener("touchstart", onTouchStart);
      bar.removeEventListener("touchmove", onTouchMove);
      bar.removeEventListener("touchend", onTouchEnd);
      bar.removeEventListener("touchcancel", onTouchCancel);
    };
  }, [setSnap]);

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
      const direction = event.key === "ArrowUp" ? 1 : -1;
      setSnap(Math.max(0, Math.min(SNAP_PERCENTS.length - 1, snapRef.current + direction)));
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setSnap((snapRef.current + 1) % SNAP_PERCENTS.length);
    }
  };

  const percent = SNAP_PERCENTS[snapIndex] ?? SNAP_PERCENTS[0];

  return (
    <div
      ref={panelRef}
      className="mobile-chat-sheet"
      data-sheet="MOBILE_SHEET_V2"
      role="dialog"
      aria-label="Chat con tu agente"
    >
      <div
        ref={barRef}
        className="mobile-sheet-bar"
        role="slider"
        tabIndex={0}
        aria-label="Altura del chat"
        aria-valuemin={SNAP_PERCENTS[0]}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-valuetext={`${percent}% de la pantalla`}
        onKeyDown={onKeyDown}
      >
        <button type="button" className="side-chat-icon" onClick={onClose} aria-label="Cerrar chat">
          <X size={16} />
        </button>
        <span className="mobile-sheet-grip" aria-hidden="true" />
        <div className="mobile-sheet-actions">
          <button type="button" className="side-chat-icon" onClick={onOpenSettings} aria-label="Ajustes">
            <Settings size={15} />
          </button>
          <button
            type="button"
            className="side-chat-icon"
            onClick={onOpenFullChat}
            aria-label="Abrir chat completo"
            title="Abrir chat completo"
          >
            <Maximize2 size={14} />
          </button>
        </div>
      </div>

      <SidebarChat
        chat={chat}
        tenantLabel={tenantLabel}
        variant="sheet"
        onClose={onClose}
        onOpenFullChat={onOpenFullChat}
        onOpenSettings={onOpenSettings}
      />
    </div>
  );
}
