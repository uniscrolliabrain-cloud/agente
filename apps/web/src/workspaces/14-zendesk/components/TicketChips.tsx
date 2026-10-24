// ZENDESK_CHIPS_V1

import type { TicketInsight } from "../types.ts";

const TONES = {
  purple: "bg-purple-soft text-purple",
  warn: "bg-warn text-warn-text",
  green: "bg-green/15 text-green",
  info: "bg-info text-info-text",
};

interface Props {
  insights: TicketInsight[];
}

export default function TicketChips({ insights }: Props) {
  if (insights.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {insights.slice(0, 2).map((i) => (
        <span key={i.id} className={"inline-block max-w-full truncate rounded-md px-1.5 py-0.5 text-[10px] font-medium " + TONES[i.tone]}>
          {i.text}
        </span>
      ))}
    </div>
  );
}