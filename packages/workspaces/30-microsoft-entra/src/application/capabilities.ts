// 30-microsoft-entra - declaracion de capacidades.
export const CAPABILITIES = [
  { id: "principal.create", title: "principal.create", kind: "action" as const, risk: "low" as const },
  { id: "role.assign", title: "role.assign", kind: "action" as const, risk: "low" as const },
  { id: "access.revoke", title: "access.revoke", kind: "action" as const, risk: "low" as const },
  { id: "policy.define", title: "policy.define", kind: "action" as const, risk: "low" as const },
  { id: "session.terminate", title: "session.terminate", kind: "action" as const, risk: "low" as const },
  { id: "principal.list", title: "principal.list", kind: "action" as const, risk: "low" as const },
  { id: "access.matrix", title: "access.matrix", kind: "action" as const, risk: "low" as const }
] as const;
