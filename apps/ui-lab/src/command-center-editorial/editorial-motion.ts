import { useLayoutEffect, useRef, type RefObject } from "react";
import { advanceSpring, springSettled, type SpringState } from "./motion-spring";

const REDUCED = "(prefers-reduced-motion: reduce)";
const CURVE = "cubic-bezier(.22, 1, .36, 1)";

/** Una entrada por instancia. Se distinguen identidad y primera carga de datos;
 * filtrar, refrescar y cambiar estados de tarea no reinicia la coreografía.
 */
export function useEditorialEntrance(view: RefObject<HTMLDivElement>, ready: boolean) {
  const identitySeen = useRef(false);
  const contentSeen = useRef(false);
  const running = useRef(new Set<Animation>());

  useLayoutEffect(() => {
    const media = window.matchMedia(REDUCED);
    const cancel = () => {
      for (const animation of running.current) animation.cancel();
      running.current.clear();
    };
    const onChange = () => { if (media.matches) cancel(); };
    media.addEventListener("change", onChange);
    return () => {
      media.removeEventListener("change", onChange);
      cancel();
      // StrictMode re-ejecuta el efecto de montaje en desarrollo.
      identitySeen.current = false;
      contentSeen.current = false;
    };
  }, []);

  useLayoutEffect(() => {
    const root = view.current;
    if (!root) return;
    const reduced = window.matchMedia(REDUCED).matches;
    const animate = (node: HTMLElement | null, delay: number, distance: number, duration: number) => {
      if (!node || reduced || typeof node.animate !== "function") return;
      // Evitar animar contenido fuera del área visible y mantener la interacción.
      if (node.getBoundingClientRect().top > window.innerHeight) return;
      const a = node.animate(
        [{ opacity: .55, transform: `translateY(${distance}px)` }, { opacity: 1, transform: "translateY(0)" }],
        { duration, delay, easing: CURVE, fill: "backwards" },
      );
      running.current.add(a);
      a.onfinish = a.oncancel = () => running.current.delete(a);
    };
    if (!identitySeen.current) {
      identitySeen.current = true;
      animate(root.querySelector<HTMLElement>(":scope > .cce-hero"), 0, 8, 360);
    }
    if (ready && !contentSeen.current) {
      contentSeen.current = true;
      animate(root.querySelector<HTMLElement>(":scope > :is(.cce-briefing, .cc-briefing)"), 35, 8, 420);
      animate(root.querySelector<HTMLElement>(":scope > :is(.cce-kpis, .cc-kpis)"), 70, 6, 340);
      animate(root.querySelector<HTMLElement>(":scope > :is(.cce-section, .cc-section)"), 95, 6, 340);
    }
  }, [view, ready]);
}

/** Movimiento local de la hoja. Se actualiza transform/opacity sin renders React.
 * Cerrar durante la entrada cambia el objetivo, no reinicia posición ni velocidad.
 * La acción empresarial se conserva inmediata; solo el cierre visual espera.
 */
export function useSheetSpring(
  panel: RefObject<HTMLDivElement>,
  backdrop: RefObject<HTMLDivElement>,
  onClose: () => void,
) {
  const closeRef = useRef(onClose);
  useLayoutEffect(() => { closeRef.current = onClose; }, [onClose]);
  const controller = useRef<{ close: () => void } | null>(null);
  useLayoutEffect(() => {
    const element = panel.current;
    const scrim = backdrop.current;
    if (!element || !scrim) return;
    const media = window.matchMedia(REDUCED);
    let state: SpringState = { position: 0, velocity: 0 };
    let target = 1;
    let frame = 0;
    let last = 0;
    let closing = false;
    let finished = false;
    const paint = () => {
      const visible = Math.max(0, Math.min(1, state.position));
      element.style.transform = `translate3d(0, ${(1 - visible) * 100}%, 0)`;
      scrim.style.backgroundColor = `rgba(36, 36, 33, ${visible * .42})`;
    };
    const complete = () => {
      state = { position: target, velocity: 0 };
      paint();
      if (closing && !finished) {
        finished = true;
        closeRef.current();
      }
    };
    const tick = (now: number) => {
      frame = 0;
      const dt = last ? (now - last) / 1000 : 0;
      last = now;
      state = advanceSpring(state, target, dt, 23);
      paint();
      if (springSettled(state, target)) complete();
      else frame = requestAnimationFrame(tick);
    };
    const run = () => {
      if (media.matches) {
        cancelAnimationFrame(frame);
        frame = 0;
        complete();
      } else if (!frame && !finished) {
        last = performance.now();
        frame = requestAnimationFrame(tick);
      }
    };
    const close = () => {
      if (closing || finished) return;
      closing = true;
      target = 0;
      run();
    };
    const onChange = () => { if (media.matches) run(); };
    controller.current = { close };
    paint();
    run();
    media.addEventListener("change", onChange);
    return () => {
      controller.current = null;
      cancelAnimationFrame(frame);
      media.removeEventListener("change", onChange);
      element.style.removeProperty("transform");
      scrim.style.removeProperty("background-color");
    };
  }, [panel, backdrop]);
  return () => {
    if (controller.current) controller.current.close();
    else closeRef.current();
  };
}
