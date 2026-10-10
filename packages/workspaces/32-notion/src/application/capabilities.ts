// 32-notion - declaracion de capacidades.
export const CAPABILITIES = [
  { id: "page.create", title: "page.create", kind: "action" as const, risk: "low" as const },
  { id: "page.update", title: "page.update", kind: "action" as const, risk: "low" as const },
  { id: "page.relate", title: "page.relate", kind: "action" as const, risk: "low" as const },
  { id: "page.archive", title: "page.archive", kind: "action" as const, risk: "low" as const },
  { id: "search.knowledge", title: "search.knowledge", kind: "action" as const, risk: "low" as const },
  { id: "knowledge.read", title: "knowledge.read", kind: "action" as const, risk: "low" as const }
] as const;
