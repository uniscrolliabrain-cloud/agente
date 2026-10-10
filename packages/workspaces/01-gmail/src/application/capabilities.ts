// 01-gmail - declaracion de capacidades.
export const CAPABILITIES = [
  { id: "email.read", title: "email.read", kind: "action" as const, risk: "low" as const },
  { id: "email.search", title: "email.search", kind: "action" as const, risk: "low" as const },
  { id: "email.send", title: "email.send", kind: "action" as const, risk: "low" as const },
  { id: "email.compose", title: "email.compose", kind: "action" as const, risk: "low" as const },
  { id: "email.label", title: "email.label", kind: "action" as const, risk: "low" as const },
  { id: "email.archive", title: "email.archive", kind: "action" as const, risk: "low" as const },
  { id: "email.attach", title: "email.attach", kind: "action" as const, risk: "low" as const },
  { id: "email.link_thread", title: "email.link_thread", kind: "action" as const, risk: "low" as const }
] as const;
