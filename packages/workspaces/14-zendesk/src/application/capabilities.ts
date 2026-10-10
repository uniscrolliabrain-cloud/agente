// 14-zendesk - declaracion de capacidades.
export const CAPABILITIES = [
  { id: "ticket.create", title: "ticket.create", kind: "action" as const, risk: "low" as const },
  { id: "ticket.assign", title: "ticket.assign", kind: "action" as const, risk: "low" as const },
  { id: "ticket.escalate", title: "ticket.escalate", kind: "action" as const, risk: "low" as const },
  { id: "ticket.resolve", title: "ticket.resolve", kind: "action" as const, risk: "low" as const },
  { id: "ticket.reopen", title: "ticket.reopen", kind: "action" as const, risk: "low" as const },
  { id: "ticket.list", title: "ticket.list", kind: "action" as const, risk: "low" as const },
  { id: "ticket.read", title: "ticket.read", kind: "action" as const, risk: "low" as const }
] as const;
