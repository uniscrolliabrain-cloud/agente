// 02-whatsapp - declaracion de capacidades.
export const CAPABILITIES = [
  { id: "messaging.read", title: "messaging.read", kind: "action" as const, risk: "low" as const },
  { id: "messaging.send", title: "messaging.send", kind: "action" as const, risk: "low" as const },
  { id: "messaging.send_template", title: "messaging.send_template", kind: "action" as const, risk: "low" as const },
  { id: "messaging.send_media", title: "messaging.send_media", kind: "action" as const, risk: "low" as const },
  { id: "messaging.link_identity", title: "messaging.link_identity", kind: "action" as const, risk: "low" as const },
  { id: "messaging.mark_read", title: "messaging.mark_read", kind: "action" as const, risk: "low" as const }
] as const;
