// 15-docusign - declaracion de capacidades.
export const CAPABILITIES = [
  { id: "envelope.prepare", title: "envelope.prepare", kind: "action" as const, risk: "low" as const },
  { id: "envelope.send", title: "envelope.send", kind: "action" as const, risk: "low" as const },
  { id: "envelope.record_signature", title: "envelope.record_signature", kind: "action" as const, risk: "low" as const },
  { id: "envelope.cancel", title: "envelope.cancel", kind: "action" as const, risk: "low" as const },
  { id: "envelope.read", title: "envelope.read", kind: "action" as const, risk: "low" as const },
  { id: "envelope.list_pending", title: "envelope.list_pending", kind: "action" as const, risk: "low" as const }
] as const;
