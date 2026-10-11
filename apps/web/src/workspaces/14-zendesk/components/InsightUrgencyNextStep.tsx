// ZENDESK_INSIGHT_URGENCY_V1

import type { UrgencyLevel } from "../types.ts";

const URGENCY_TONE = {
  ALTA: "text-warn-text",
  Media: "text-text-2",
  Baja: "text-text-3",
};

interface Props {
  urgency: UrgencyLevel;
  urgencyReason: string;
  nextStep: string;
}

export default function InsightUrgencyNextStep({ urgency, urgencyReason, nextStep }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-text-3">Urgencia</p>
        <p className={"mt-1 text-sm font-bold " + URGENCY_TONE[urgency]}>{urgency}</p>
        <p className="mt-0.5 text-[11px] text-text-3">{urgencyReason}</p>
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-text-3">Proximo paso</p>
        <p className="mt-1 text-sm text-text">{nextStep}</p>
      </div>
    </div>
  );
}