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
  const [percent, setPercent] = useState(SNAP_PERCENTS[0]);
  const panelRef = useRef<HTMLDivElement>(null);
  const gripRef = useRef<HTMLDivElement>(null);
  const snapRef = useRef(0);

  const applySnap = useCallback((index: number) => {
    const panel = panelRef.current;
    if (!panel) return;
    const viewport = window.visualViewport;
    const height = viewportHeight();
    const layout = document.documentElement;
    const bottom = viewport ? Math.max(0, layout.clientHeight - viewport.height - viewport.offsetTop) : 0;
    panel.style.bottom = `${bottom}px`;
    panel.style.left = `${viewport?.offsetLeft ?? 0}px`;
    panel.style.right = viewport
      ? `${Math.max(0, layout.clientWidth - viewport.width - viewport.offsetLeft)}px`
      : "0";
    panel.style.setProperty("--sheet-visual-height", `${height}px`);
    const minPx = minVisible(panel);
    const px = visiblePx(SNAP_PERCENTS[index] ?? 26, height, minPx);
    panel.style.height = `${px}px`;
    setPercent(Math.round(100 * px / height));
    // Plegada del todo solo queda el tirador y la caja de escribir: una franja de
    // 20 px de mensaje cortado parecia un fallo de pintado.
    panel.classList.toggle("collapsed", px <= minPx + 2);
  }, []);

  const setSnap = useCallback(
    (index: number) => {
      snapRef.current = index;
      applySnap(index);
    },
    [applySnap],
  );

  // Primer pintado en su peldaño, antes de que se vea el panel.
  useLayoutEffect(() => {
    applySnap(snapRef.current);
  }, [applySnap]);

  useEffect(() => {
    const panel = panelRef.current;
    const viewport = window.visualViewport;
    let frame = 0;
    const onResize = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (!panel?.classList.contains("dragging")) applySnap(snapRef.current);
      });
    };
    const observer = new ResizeObserver(onResize);
    for (const element of panel?.querySelectorAll(".mobile-sheet-bar, .side-chat-foot") ?? []) {
      observer.observe(element);
    }
    window.addEventListener("resize", onResize);
    viewport?.addEventListener("resize", onResize);
    viewport?.addEventListener("scroll", onResize);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", onResize);
      viewport?.removeEventListener("resize", onResize);
      viewport?.removeEventListener("scroll", onResize);
    };
  }, [applySnap]);

  useEffect(() => {
    const panel = panelRef.current;
    const grip = gripRef.current;
    if (!panel || !grip) return;

    let drag: { id: number; y: number; height: number; moved: boolean } | null = null;

    const onDown = (event: PointerEvent) => {
      if (!event.isPrimary || event.button !== 0 || drag) return;
      grip.setPointerCapture(event.pointerId);
      drag = { id: event.pointerId, y: event.clientY, height: panel.getBoundingClientRect().height, moved: false };
      panel.style.height = `${drag.height}px`;
      panel.classList.add("dragging");
    };

    const onMove = (event: PointerEvent) => {
      if (drag?.id !== event.pointerId) return;
      const delta = drag.y - event.clientY;
      drag.moved ||= Math.abs(delta) >= TAP_SLOP_PX;
      if (!drag.moved) return;
      const height = viewportHeight();
      const min = minVisible(panel);
      const next = Math.min(height, Math.max(min, drag.height + delta));
      panel.style.height = `${next}px`;
      panel.classList.toggle("collapsed", next <= min + 2);
    };

    const settle = (event: PointerEvent, cancelled: boolean) => {
      if (drag?.id !== event.pointerId) return;
      if (!cancelled) onMove(event);
      const moved = drag.moved;
      drag = null;
      const visible = panel.getBoundingClientRect().height;
      panel.classList.remove("dragging");
      if (cancelled) setSnap(snapRef.current);
      else if (moved) setSnap(nearestSnap(visible, viewportHeight(), minVisible(panel)));
      else setSnap((snapRef.current + 1) % SNAP_PERCENTS.length);
    };

    const onUp = (event: PointerEvent) => settle(event, false);
    const onCancel = (event: PointerEvent) => settle(event, true);
    grip.addEventListener("pointerdown", onDown);
    grip.addEventListener("pointermove", onMove);
    grip.addEventListener("pointerup", onUp);
    grip.addEventListener("pointercancel", onCancel);
    grip.addEventListener("lostpointercapture", onCancel);
    return () => {
      grip.removeEventListener("pointerdown", onDown);
      grip.removeEventListener("pointermove", onMove);
      grip.removeEventListener("pointerup", onUp);
      grip.removeEventListener("pointercancel", onCancel);
      grip.removeEventListener("lostpointercapture", onCancel);
    };
  }, [setSnap]);

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
      const direction = event.key === "ArrowUp" ? 1 : -1;
      setSnap(Math.max(0, Math.min(SNAP_PERCENTS.length - 1, snapRef.current + direction)));
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      setSnap(event.key === "Home" ? 0 : SNAP_PERCENTS.length - 1);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setSnap((snapRef.current + 1) % SNAP_PERCENTS.length);
    }
  };

  return (
    <div
      ref={panelRef}
      className="mobile-chat-sheet"
      data-sheet="MOBILE_SHEET_V2"
      role="dialog"
      aria-label="Chat con tu agente"
    >
      <div className="mobile-sheet-bar">
        <button type="button" className="side-chat-icon" onClick={onClose} aria-label="Cerrar chat">
          <X size={16} />
        </button>
        <div
          ref={gripRef}
          className="mobile-sheet-grip"
          role="slider"
          tabIndex={0}
          aria-label="Altura del chat"
          aria-valuemin={SNAP_PERCENTS[0]}
          aria-valuemax={100}
          aria-valuenow={percent}
          aria-valuetext={`${percent}% del área visible`}
          onKeyDown={onKeyDown}
        />
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
