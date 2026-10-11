// ZENDESK_QUICK_ACTIONS_V1

import { ExternalLink } from "lucide-react";

export default function CustomerQuickActions() {
  return (
    <div className="flex gap-2 border-b border-border-soft px-5 py-3">
      <button
        type="button"
        className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg bg-text px-3 text-[11px] font-semibold text-white"
      >
        Ver en HubSpot
        <ExternalLink className="h-3 w-3" />
      </button>
      <button
        type="button"
        className="inline-flex h-8 flex-1 items-center justify-center rounded-lg border border-border bg-bg-card px-3 text-[11px] font-semibold text-text"
      >
        Holded
      </button>
      <button
        type="button"
        className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg bg-green/15 px-3 text-[11px] font-semibold text-green"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-green" />
        En CRM
      </button>
    </div>
  );
}