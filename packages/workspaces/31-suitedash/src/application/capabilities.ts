// 31-suitedash - declaracion de capacidades.
export const CAPABILITIES = [
  { id: "portal.invite", title: "portal.invite", kind: "action" as const, risk: "low" as const },
  { id: "portal.revoke", title: "portal.revoke", kind: "action" as const, risk: "low" as const },
  { id: "request.submit", title: "request.submit", kind: "action" as const, risk: "low" as const },
  { id: "case.update", title: "case.update", kind: "action" as const, risk: "low" as const },
  { id: "document.share", title: "document.share", kind: "action" as const, risk: "low" as const },
  { id: "case.timeline", title: "case.timeline", kind: "action" as const, risk: "low" as const }
] as const;
