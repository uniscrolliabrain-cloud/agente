// 34-trello - declaracion de capacidades.
export const CAPABILITIES = [
  { id: "board.create", title: "board.create", kind: "action" as const, risk: "low" as const },
  { id: "card.create", title: "card.create", kind: "action" as const, risk: "low" as const },
  { id: "card.move", title: "card.move", kind: "action" as const, risk: "low" as const },
  { id: "card.assign", title: "card.assign", kind: "action" as const, risk: "low" as const },
  { id: "card.archive", title: "card.archive", kind: "action" as const, risk: "low" as const },
  { id: "board.list", title: "board.list", kind: "action" as const, risk: "low" as const },
  { id: "card.history", title: "card.history", kind: "action" as const, risk: "low" as const }
] as const;
