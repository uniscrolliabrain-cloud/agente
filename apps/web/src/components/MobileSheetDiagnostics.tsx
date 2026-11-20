import { useEffect, useState } from "react";

const gestureEvents = [
  "touchstart",
  "touchmove",
  "touchend",
  "touchcancel",
  "pointerdown",
  "pointermove",
  "pointerup",
  "pointercancel",
] as const;

export default function MobileSheetDiagnostics() {
  const [snapshot, setSnapshot] = useState("");

  useEffect(() => {
    const counters = Object.fromEntries(gestureEvents.map((event) => [event, 0]));
    const count = (event: Event) => {
      if (event.target instanceof Element && event.target.closest(".mobile-sheet-bar")) {
        counters[event.type] += 1;
      }
    };

    function capture() {
      const viewport = window.visualViewport;
      const panel = document.querySelector(".mobile-chat-sheet");
      const send = panel?.querySelector(".v2-send");
      const box = send?.getBoundingClientRect();
      const hit = box && document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2);
      const rectangles = Object.fromEntries(
        [".mobile-sheet-grip", ".side-chat-body", ".side-chat-foot", "textarea", ".v2-send"].map((selector) => [
          selector,
          panel?.querySelector(selector)?.getBoundingClientRect().toJSON(),
        ]),
      );
      setSnapshot(
        JSON.stringify(
          {
            build: import.meta.env.VITE_BUILD_SHA ?? "local",
            layout: { width: innerWidth, height: innerHeight, clientHeight: document.documentElement.clientHeight },
            visual: viewport && {
              width: viewport.width,
              height: viewport.height,
              offsetTop: viewport.offsetTop,
              offsetLeft: viewport.offsetLeft,
              scale: viewport.scale,
            },
            sheet: panel?.getBoundingClientRect().toJSON(),
            rectangles,
            activeTag: document.activeElement?.tagName,
            hitTag: hit?.tagName,
            sendHit: Boolean(hit && send?.contains(hit)),
            fabCount: document.querySelectorAll(".chat-fab").length,
            fabVisible: Boolean(document.querySelector(".chat-fab")?.getClientRects().length),
            snap: panel?.querySelector('[role="slider"]')?.getAttribute("aria-valuenow"),
            dragging: Boolean(panel?.classList.contains("dragging")),
            counters,
          },
          null,
          2,
        ),
      );
    }

    for (const event of gestureEvents) {
      window.addEventListener(event, count, { capture: true, passive: true });
    }
    capture();
    const timer = window.setInterval(capture, 250);
    return () => {
      window.clearInterval(timer);
      for (const event of gestureEvents) {
        window.removeEventListener(event, count, true);
      }
    };
  }, []);

  return (
    <details style={{ position: "fixed", top: 0, right: 0, zIndex: 101 }}>
      <summary>Diagnóstico de la hoja</summary>
      <textarea aria-label="Métricas de la hoja" value={snapshot} readOnly rows={8} />
      <button type="button" onClick={() => void navigator.clipboard?.writeText(snapshot)}>
        Copiar métricas
      </button>
    </details>
  );
}
