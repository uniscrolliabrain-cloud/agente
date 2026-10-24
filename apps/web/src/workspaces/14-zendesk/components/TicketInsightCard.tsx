// ZENDESK_INSIGHT_CARD_V1

import { Sparkles } from "lucide-react";
import InsightIntent from "./InsightIntent.tsx";
import InsightUrgencyNextStep from "./InsightUrgencyNextStep.tsx";
import InsightChips from "./InsightChips.tsx";
import type { TicketIntelligence } from "../types.ts";

interface Props {
  intelligence: TicketIntelligence;
  chips: string[];
}

export default function TicketInsightCard({ intelligence, chips }: Props) {
  const confidence = Math.round(intelligence.confidence * 100);
  return (
    <div className="mx-5 mt-4 rounded-2xl border border-purple/40 bg-purple-soft/50 p-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-purple" />
        <span className="text-xs font-bold text-purple">Resumen IA</span>
        <span className="ml-1 inline-flex items-center rounded-md bg-bg-card px-1.5 py-0.5 text-[10px] font-semibold text-text-2">
          {confidence}% confianza
        </span>
        <span className="ml-auto inline-flex items-center gap-1.5 rounded-md bg-green/15 px-2 py-0.5 text-[10px] font-semibold text-green">
          <span className="h-1.5 w-1.5 rounded-full bg-green" />
          En vivo
        </span>
      </div>

      <div className="mt-3 flex flex-col gap-3">
        <InsightIntent intent={intelligence.intent} />
        <InsightUrgencyNextStep
          urgency={intelligence.urgency}
          urgencyReason={intelligence.urgencyReason}
          nextStep={intelligence.nextStep}
        />
        <InsightChips chips={chips} />
      </div>
    </div>
  );
}