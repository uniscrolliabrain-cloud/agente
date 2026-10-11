// ZENDESK_COWRITE_TOGGLE_V1

import { PenLine } from "lucide-react";

interface Props {
  active: boolean;
  onToggle: () => void;
}

export default function CoWriteToggle({ active, onToggle }: Props) {
  const statusCls = active ? "text-green" : "text-text-3";
  const trackCls = active ? "bg-green" : "bg-border-strong";
  const knobCls = active ? "left-[18px]" : "left-0.5";
  return (
    <div className="flex items-center gap-2">
      <PenLine className="h-4 w-4 text-purple" />
      <span className="text-xs font-bold text-text">Co-escritura IA</span>
      <span className={"ml-1 text-[10px] font-bold " + statusCls}>
        {active ? "Activa" : "Inactiva"}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={active}
        onClick={onToggle}
        className={"ml-auto relative h-5 w-9 shrink-0 rounded-full transition-colors " + trackCls}
      >
        <span className={"absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all " + knobCls} />
      </button>
    </div>
  );
}