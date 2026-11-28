// SPLIT_PANE_V1 - dos vistas a la vez, con el mismo comportamiento que en la
// app: a la derecha en escritorio, arriba en móvil, separador ajustable con el
// puntero y con las flechas. Sin panel secundario no envuelve nada, así que una
// meta-app sin dividir se pinta exactamente igual que antes.
import { useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { X } from "lucide-react";
import { useMediaQuery } from "../hooks/useMediaQuery";
import "./split-pane.css";

type Props = {
  /** Etiqueta de lo que se muestra al lado. */
  label: string;
  /** Panel secundario; si falta, solo se pinta el principal. */
  side?: ReactNode;
  onClose: () => void;
  children: ReactNode;
};

const SPLIT_MIN = 0.2;

/** SPLIT_PANE_V1 - aviso de destino mientras la fila se arrastra fuera de la barra. */
export function SplitDropHint({ active, label }: { active: boolean; label?: string }) {
  if (!active) return null;
  return <span className="meta-split-hint">{label ?? "Suelta para abrir al lado"}</span>;
}

export default function SplitPane({ label, side, onClose, children }: Props) {
  const [ratio, setRatio] = useState(0.5);
  const area = useRef<HTMLDivElement>(null);
  const mobile = useMediaQuery("(max-width: 900px)");

  if (!side) return <>{children}</>;

  const clamp = (value: number) => Math.min(1 - SPLIT_MIN, Math.max(SPLIT_MIN, value));

  const startDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    const box = area.current?.getBoundingClientRect();
    if (!box) return;
    const move = (pointer: PointerEvent) => {
      const next = mobile ? (pointer.clientY - box.top) / box.height : (pointer.clientX - box.left) / box.width;
      setRatio(clamp(next));
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };

  const onHandleKey = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? 0.1 : 0.02;
    const grow = mobile ? event.key === "ArrowDown" : event.key === "ArrowRight";
    const shrink = mobile ? event.key === "ArrowUp" : event.key === "ArrowLeft";
    if (!grow && !shrink) return;
    event.preventDefault();
    setRatio((value) => clamp(value + (grow ? step : -step)));
  };

  const style: CSSProperties = mobile
    ? { gridTemplateColumns: "minmax(0, 1fr)", gridTemplateRows: `${ratio}fr 10px ${1 - ratio}fr` }
    : { gridTemplateColumns: `${ratio}fr 10px ${1 - ratio}fr` };

  return (
    <div className="meta-split" data-split="true" data-orient={mobile ? "row" : "column"} style={style} ref={area}>
      <div className="meta-split-pane" data-pane="main">
        {children}
      </div>
      <div
        className="meta-split-handle"
        role="separator"
        aria-label="Reparto de los dos paneles"
        aria-orientation={mobile ? "horizontal" : "vertical"}
        aria-valuemin={SPLIT_MIN * 100}
        aria-valuemax={(1 - SPLIT_MIN) * 100}
        aria-valuenow={Math.round(ratio * 100)}
        tabIndex={0}
        onPointerDown={startDrag}
        onKeyDown={onHandleKey}
      >
        <span />
      </div>
      <div className="meta-split-pane" data-pane="side">
        <header className="meta-split-head">
          <span>{label}</span>
          <button type="button" onClick={onClose} aria-label="Cerrar el panel dividido">
            <X size={14} />
          </button>
        </header>
        <div className="meta-split-body">{side}</div>
      </div>
    </div>
  );
}
