// ZENDESK_LIST_ACTIONS_V1

import { Archive, ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  total: number;
  pageStart: number;
  pageEnd: number;
  onArchive: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export default function TicketListActions({ total, pageStart, pageEnd, onArchive, onPrev, onNext }: Props) {
  return (
    <div className="flex items-center gap-2 border-b border-border-soft px-4 py-2">
      <label className="flex items-center gap-2 text-xs text-text-2">
        <input type="checkbox" className="h-3.5 w-3.5 cursor-pointer rounded border-border" />
        Seleccionar
      </label>
      <button
        type="button"
        onClick={onArchive}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-bg-card px-2.5 py-1.5 text-xs text-text-2 hover:text-text"
      >
        <Archive className="h-3.5 w-3.5" />
        Archivar IA
      </button>
      <div className="ml-auto flex items-center gap-3 text-xs text-text-3">
        <span>
          {pageStart}-{pageEnd} de {total}
        </span>
        <button
          type="button"
          onClick={onPrev}
          aria-label="Anterior"
          className="grid h-7 w-7 place-items-center rounded-lg border border-border bg-bg-card text-text-3 hover:text-text"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={onNext}
          aria-label="Siguiente"
          className="grid h-7 w-7 place-items-center rounded-lg border border-border bg-bg-card text-text-3 hover:text-text"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}