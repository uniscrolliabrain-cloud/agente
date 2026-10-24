// ZENDESK_COWRITE_PANEL_V1

import { Paperclip, Send, Sparkles, Wand2 } from "lucide-react";
import CoWriteToggle from "./CoWriteToggle.tsx";
import CoWriteEditor from "./CoWriteEditor.tsx";
import type { CoWriteDraft } from "../types.ts";

interface Props {
  draft: CoWriteDraft | null;
  onGenerate: () => void;
  onToggle: () => void;
  onSetBody: (body: string) => void;
}

export default function CoWritePanel({ draft, onGenerate, onToggle, onSetBody }: Props) {
  if (!draft) return null;
  return (
    <div className="border-t border-border-soft px-5 py-4">
      <CoWriteToggle active={draft.active} onToggle={onToggle} />

      <p className="mt-2 text-[11px] text-text-3">
        Responder a {draft.recipient} - {draft.templateName}
      </p>

      <div className="mt-3">
        <CoWriteEditor value={draft.body} onChange={onSetBody} disabled={!draft.active} />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onGenerate}
          disabled={!draft.active}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-purple-soft px-3 text-[11px] font-semibold text-purple hover:bg-purple/15 disabled:opacity-50"
        >
          <Wand2 className="h-3.5 w-3.5" />
          Reescribir con IA
        </button>
        <button
          type="button"
          disabled={!draft.active}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-bg-card px-3 text-[11px] font-semibold text-text-2 hover:text-text disabled:opacity-50"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Usar {draft.templateName}
        </button>
        <button
          type="button"
          disabled={!draft.active}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-bg-card px-3 text-[11px] font-semibold text-text-2 hover:text-text disabled:opacity-50"
        >
          <Paperclip className="h-3.5 w-3.5" />
          Adjuntar propuesta
        </button>
        <button
          type="button"
          disabled={!draft.active}
          className="ml-auto inline-flex h-8 items-center gap-1.5 rounded-lg bg-text px-3 text-[11px] font-semibold text-white disabled:opacity-50"
        >
          <Send className="h-3.5 w-3.5" />
          Enviar con IA
        </button>
      </div>
    </div>
  );
}