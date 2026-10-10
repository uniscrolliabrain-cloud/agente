// 25-intercom - declaracion de capacidades.
export const CAPABILITIES = [
  { id: "conversation.open", title: "conversation.open", kind: "action" as const, risk: "low" as const },
  { id: "conversation.send", title: "conversation.send", kind: "action" as const, risk: "low" as const },
  { id: "conversation.route", title: "conversation.route", kind: "action" as const, risk: "low" as const },
  { id: "conversation.close", title: "conversation.close", kind: "action" as const, risk: "low" as const },
  { id: "customer.timeline", title: "customer.timeline", kind: "action" as const, risk: "low" as const },
  { id: "conversation.list", title: "conversation.list", kind: "action" as const, risk: "low" as const }
] as const;
