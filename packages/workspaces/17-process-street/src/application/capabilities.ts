// 17-process-street - declaracion de capacidades.
export const CAPABILITIES = [
  { id: "sop.create", title: "sop.create", kind: "action" as const, risk: "low" as const },
  { id: "sop.start_run", title: "sop.start_run", kind: "action" as const, risk: "low" as const },
  { id: "sop.complete_step", title: "sop.complete_step", kind: "action" as const, risk: "low" as const },
  { id: "sop.abort_run", title: "sop.abort_run", kind: "action" as const, risk: "low" as const },
  { id: "sop.read", title: "sop.read", kind: "action" as const, risk: "low" as const },
  { id: "sop.pending_steps", title: "sop.pending_steps", kind: "action" as const, risk: "low" as const }
] as const;
