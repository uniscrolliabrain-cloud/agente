// Briefing de LAIA como pieza protagonista. El texto llega calculado con datos
// del tenant desde el mismo `briefingText` de producción: aquí no se inventa
// narrativa ni se simula audio o LLM.
import { MessageSquare, Sparkles } from "lucide-react";

interface Props {
  text: string;
  hasFinishedWork: boolean;
  onSeeWork: () => void;
  onOpenChat?: (() => void) | undefined;
}

export function EditorialBriefing({ text, hasFinishedWork, onSeeWork, onOpenChat }: Props) {
  return (
    <section className="cce-briefing" aria-labelledby="cce-briefing-title">
      <div className="cce-briefing-head">
        <Sparkles size={14} aria-hidden="true" />
        <span id="cce-briefing-title">Briefing de LAIA</span>
      </div>
      <p className="cce-briefing-text">{text}</p>
      {(onOpenChat || hasFinishedWork) && (
        <div className="cce-briefing-actions">
          {onOpenChat && (
            <button type="button" className="cce-btn cce-btn--primary" onClick={onOpenChat}>
              <MessageSquare size={14} aria-hidden="true" /> Preguntar a LAIA
            </button>
          )}
          {hasFinishedWork && (
            <button type="button" className="cce-btn" onClick={onSeeWork}>
              Ver qué hizo
            </button>
          )}
        </div>
      )}
    </section>
  );
}
