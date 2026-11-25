import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

const positions = ["Estrecho", "Normal", "Amplio", "Máximo"];
const defaultPosition = 1;

function widths() {
  const max = Math.min(660, Math.round(document.documentElement.clientWidth * 0.58));
  return [312, 390, 510, 660].map((width) => Math.round(312 + (width - 312) * (max - 312) / 348));
}

export default function DesktopChatDock({ children }: { children: ReactNode }) {
  const dock = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(defaultPosition);
  const drag = useRef<{ id: number; x: number; width: number; moved: boolean } | null>(null);
  const dragged = useRef(false);

  function setWidth(width: number) {
    dock.current?.closest<HTMLElement>(".shell")?.style.setProperty("--desktop-chat-width", `${width}px`);
  }

  useLayoutEffect(() => {
    const shell = dock.current?.closest<HTMLElement>(".shell");
    const fit = () => shell?.style.setProperty("--desktop-chat-width", `${widths()[position]}px`);
    fit();
    window.addEventListener("resize", fit);
    return () => {
      window.removeEventListener("resize", fit);
      shell?.style.removeProperty("--desktop-chat-width");
    };
  }, [position]);

  const settle = (pointerId: number, cancelled: boolean) => {
    const gesture = drag.current;
    const panel = dock.current;
    if (!panel || gesture?.id !== pointerId) return;
    drag.current = null;
    dragged.current = cancelled || gesture.moved;
    if (gesture.moved || cancelled) {
      const stops = widths();
      const width = panel.getBoundingClientRect().width;
      const nearest = stops.reduce((best, stop, index) =>
        Math.abs(stop - width) < Math.abs(stops[best] - width) ? index : best, 0);
      const next = cancelled ? position : nearest;
      setWidth(stops[next]);
      setPosition(next);
    }
    panel.closest(".shell")?.classList.remove("desktop-chat-resizing");
  };

  return (
    <div className="desktop-chat-dock" ref={dock}>
      {children}
      <button
        type="button"
        className="desktop-chat-grip"
        role="slider"
        aria-label="Ancho del chat lateral"
        aria-valuemin={1}
        aria-valuemax={positions.length}
        aria-valuenow={position + 1}
        aria-valuetext={positions[position]}
        title="Haz clic para cambiar el ancho o arrastra"
        onPointerDown={(event) => {
          if (!event.isPrimary || event.button !== 0 || !dock.current) return;
          dragged.current = false;
          event.currentTarget.setPointerCapture(event.pointerId);
          drag.current = { id: event.pointerId, x: event.clientX, width: dock.current.getBoundingClientRect().width, moved: false };
          dock.current.closest(".shell")?.classList.add("desktop-chat-resizing");
        }}
        onPointerMove={(event) => {
          const gesture = drag.current;
          if (gesture?.id !== event.pointerId) return;
          const delta = event.clientX - gesture.x;
          gesture.moved ||= Math.abs(delta) >= 5;
          if (!gesture.moved) return;
          const stops = widths();
          setWidth(Math.max(stops[0], Math.min(stops[stops.length - 1], gesture.width + delta)));
        }}
        onPointerUp={(event) => settle(event.pointerId, false)}
        onPointerCancel={(event) => settle(event.pointerId, true)}
        onLostPointerCapture={(event) => settle(event.pointerId, true)}
        onClick={(event) => {
          if (!event.detail || !dragged.current) setPosition((current) => (current + 1) % positions.length);
        }}
        onKeyDown={(event) => {
          const delta = event.key === "ArrowRight" || event.key === "ArrowUp" ? 1
            : event.key === "ArrowLeft" || event.key === "ArrowDown" ? -1 : 0;
          if (delta) {
            event.preventDefault();
            setPosition((current) => Math.max(0, Math.min(positions.length - 1, current + delta)));
          } else if (event.key === "Home" || event.key === "End") {
            event.preventDefault();
            setPosition(event.key === "Home" ? 0 : positions.length - 1);
          }
        }}
      />
    </div>
  );
}
