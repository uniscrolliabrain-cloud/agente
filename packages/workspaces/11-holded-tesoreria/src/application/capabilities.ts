// 11-holded-tesoreria - declaracion de capacidades.
export const CAPABILITIES = [
  { id: "bank.import_statement", title: "bank.import_statement", kind: "action" as const, risk: "low" as const },
  { id: "bank.reconcile", title: "bank.reconcile", kind: "action" as const, risk: "low" as const },
  { id: "bank.flag_discrepancy", title: "bank.flag_discrepancy", kind: "action" as const, risk: "low" as const },
  { id: "treasury.close_period", title: "treasury.close_period", kind: "action" as const, risk: "low" as const },
  { id: "treasury.cash_position", title: "treasury.cash_position", kind: "action" as const, risk: "low" as const },
  { id: "treasury.list_transactions", title: "treasury.list_transactions", kind: "action" as const, risk: "low" as const }
] as const;
