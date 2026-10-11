// ZENDESK_STATUS_V1

import { Zap } from "lucide-react";

interface Props {
  agentName?: string;
}

export default function AgentStatusPill({ agentName = "ACME" }: Props) {
  return (
    <div className="mx-4 mt-1 flex items-center gap-2 rounded-full border border-border bg-bg-card px-3 py-1.5">
      <span className="h-2 w-2 shrink-0 rounded-full bg-green" aria-hidden />
      <span className="min-w-0 flex-1 truncate text-xs font-medium text-text">Agente activo {agentName}</span>
      <Zap className="h-3.5 w-3.5 shrink-0 text-purple" />
    </div>
  );
}