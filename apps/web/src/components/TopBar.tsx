import { PanelLeft, PanelRight } from "lucide-react";

interface Props {
  status: "ok" | "working" | "offline" | "error";
  statusLabel: string;
  leftOpen: boolean;
  rightOpen: boolean;
  onToggleLeft: () => void;
  onToggleRight: () => void;
}

export default function TopBar(props: Props) {
  return (
    <header className="topbar">
      <button
        className="icon-btn"
        onClick={props.onToggleLeft}
        aria-label="Mostrar u ocultar barra lateral"
        aria-controls="sidebar"
        aria-expanded={props.leftOpen}
      >
        <PanelLeft size={17} strokeWidth={1.8} />
      </button>

      <div className="topbar__right">
        <span className="status" role="status" data-state={props.status}>
          <span className="status__dot" aria-hidden="true" />
          {props.statusLabel}
        </span>
        <button
          className="icon-btn"
          onClick={props.onToggleRight}
          aria-label="Mostrar u ocultar panel de tareas"
          aria-controls="panel"
          aria-expanded={props.rightOpen}
        >
          <PanelRight size={17} strokeWidth={1.8} />
        </button>
      </div>
    </header>
  );
}
