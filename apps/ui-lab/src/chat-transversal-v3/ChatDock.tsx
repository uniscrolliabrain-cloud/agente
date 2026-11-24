// CHAT_TRANSVERSAL_V3 — dock izquierdo de escritorio. Puerta del algoritmo
// original de DesktopChatDock: mismas anchuras nominales (312/390/510/660),
// mismas correcciones de viewport y mismo snap al soltar el tirador.
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";

const POSITIONS = ["Estrecho", "Normal", "Amplio", "Máximo"] as const;
const DEFAULT_POSITION = 1;
const NOMINAL = [312, 390, 510, 660];
const DRAG_SLOP_PX = 5;

/** Anchos reales: 660 nominal se recorta al 58 % del viewport y se interpola. */
export function dockWidths(clientWidth: number): number[] {
  const max = Math.min(660, Math.round(clientWidth * 0.58));
  return NOMINAL.map((width) => Math.round(312 + ((width - 312) * (max - 312)) / 348));
}

interface Props {
  children: ReactNode;
  expanded: boolean;
  onWidthChange?: (width: number) => void;
}

export default function ChatDock({ children, expanded, onWidthChange }: Props) {
  const dockRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<number>(DEFAULT_POSITION);
  const drag = useRef<{ id: number; x: number; width: number; moved: boolean } | null>(null);
  const dragged = useRef(false);
  const host = useRef<HTMLElement | null>(null);

  const setWidth = useCallback(
    (width: number) => {
      host.current?.style.setProperty("--ctv-dock-width", `${width}px`);
      onWidthChange?.(width);
    },
    [onWidthChange],
  );

  useLayoutEffect(() => {
    host.current = dockRef.current?.closest<HTMLElement>(".ctv") ?? null;
    const fit = () => {
      const viewport = document.documentElement.clientWidth;
      setWidth(Math.max(288, Math.min(dockWidths(viewport)[position], viewport - 220)));
    };
    fit();
    window.addEventListener("resize", fit);
    return () => {
      window.removeEventListener("resize", fit);
      host.current?.style.removeProperty("--ctv-dock-width");
    };
  }, [position, setWidth]);

  useEffect(() => {
    if (expanded) setPosition(POSITIONS.length - 1);
  }, [expanded]);

  const settle = (pointerId: number, cancelled: boolean) => {
    const gesture = drag.current;
    const dock = dockRef.current;
    if (!dock || gesture?.id !== pointerId) return;
    drag.current = null;
    dragged.current = cancelled || gesture.moved;
    if (gesture.moved || cancelled) {
      const stops = dockWidths(document.documentElement.clientWidth);
      const width = dock.getBoundingClientRect().width;
      const nearest = stops.reduce(
        (best, stop, index) => (Math.abs(stop - width) < Math.abs(stops[best] - width) ? index : best),
        0,
      );
      const next = cancelled ? position : nearest;
      setWidth(stops[next]);
      setPosition(next);
    }
    host.current?.classList.remove("ctv-resizing");
  };

  return (
    <div className="ctv-dock" ref={dockRef}>
      {children}
      <button
        type="button"
        className="ctv-grip"
        role="slider"
        aria-label="Ancho del chat lateral"
        aria-valuemin={1}
        aria-valuemax={POSITIONS.length}
        aria-valuenow={position + 1}
        aria-valuetext={POSITIONS[position]}
        title="Haz clic para cambiar el ancho o arrastra"
        onPointerDown={(event) => {
          if (!event.isPrimary || event.button !== 0) return;
          dragged.current = false;
          event.currentTarget.setPointerCapture(event.pointerId);
          drag.current = {
            id: event.pointerId,
            x: event.clientX,
            width: dockRef.current?.getBoundingClientRect().width ?? 390,
            moved: false,
          };
          host.current?.classList.add("ctv-resizing");
        }}
        onPointerMove={(event) => {
          const gesture = drag.current;
          if (gesture?.id !== event.pointerId) return;
          const delta = event.clientX - gesture.x;
          gesture.moved ||= Math.abs(delta) >= DRAG_SLOP_PX;
          if (!gesture.moved) return;
          const stops = dockWidths(document.documentElement.clientWidth);
          const max = Math.min(stops[stops.length - 1], document.documentElement.clientWidth - 220);
          setWidth(Math.max(stops[0], Math.min(max, gesture.width + delta)));
        }}
        onPointerUp={(event) => settle(event.pointerId, false)}
        onPointerCancel={(event) => settle(event.pointerId, true)}
        onLostPointerCapture={(event) => settle(event.pointerId, true)}
        onClick={(event) => {
          if (!event.detail || !dragged.current) setPosition((current) => (current + 1) % POSITIONS.length);
        }}
        onKeyDown={(event) => {
          const delta =
            event.key === "ArrowRight" || event.key === "ArrowUp"
              ? 1
              : event.key === "ArrowLeft" || event.key === "ArrowDown"
                ? -1
                : 0;
          if (delta) {
            event.preventDefault();
            setPosition((current) => Math.max(0, Math.min(POSITIONS.length - 1, current + delta)));
          } else if (event.key === "Home" || event.key === "End") {
            event.preventDefault();
            setPosition(event.key === "Home" ? 0 : POSITIONS.length - 1);
          }
        }}
      />
    </div>
  );
}
