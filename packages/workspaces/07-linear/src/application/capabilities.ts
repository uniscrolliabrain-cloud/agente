// 07-linear - declaracion de capacidades.
export const CAPABILITIES = [
  { id: "work.create", title: "work.create", kind: "action" as const, risk: "low" as const },
  { id: "work.assign", title: "work.assign", kind: "action" as const, risk: "low" as const },
  { id: "work.change_status", title: "work.change_status", kind: "action" as const, risk: "low" as const },
  { id: "work.add_dependency", title: "work.add_dependency", kind: "action" as const, risk: "low" as const },
  { id: "work.close", title: "work.close", kind: "action" as const, risk: "low" as const },
  { id: "work.list", title: "work.list", kind: "action" as const, risk: "low" as const },
  { id: "work.read", title: "work.read", kind: "action" as const, risk: "low" as const }
] as const;
