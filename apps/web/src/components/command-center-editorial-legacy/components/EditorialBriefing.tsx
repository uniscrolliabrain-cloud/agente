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
    <section className="cce-legacy-briefing" aria-labelledby="cce-legacy-briefing-title">
      <div className="cce-legacy-briefing-head">
        <Sparkles size={14} aria-hidden="true" />
        <span id="cce-legacy-briefing-title">Briefing de LAIA</span>
      </div>
      <p className="cce-legacy-briefing-text">{text}</p>
      {(onOpenChat || hasFinishedWork) && (
        <div className="cce-legacy-briefing-actions">
          {onOpenChat && (
            <button type="button" className="cce-legacy-btn cce-legacy-btn--primary" onClick={onOpenChat}>
              <MessageSquare size={14} aria-hidden="true" /> Preguntar a LAIA
            </button>
          )}
          {hasFinishedWork && (
            <button type="button" className="cce-legacy-btn" onClick={onSeeWork}>
              Ver qué hizo
            </button>
          )}
        </div>
      )}
    </section>
  );
}
