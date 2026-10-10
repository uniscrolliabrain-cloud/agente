// 16-n8n - declaracion de capacidades.
export const CAPABILITIES = [
  { id: "workflow.create", title: "workflow.create", kind: "action" as const, risk: "low" as const },
  { id: "workflow.enable", title: "workflow.enable", kind: "action" as const, risk: "low" as const },
  { id: "workflow.disable", title: "workflow.disable", kind: "action" as const, risk: "low" as const },
  { id: "workflow.trigger", title: "workflow.trigger", kind: "action" as const, risk: "low" as const },
  { id: "workflow.read", title: "workflow.read", kind: "action" as const, risk: "low" as const },
  { id: "workflow.list_executions", title: "workflow.list_executions", kind: "action" as const, risk: "low" as const }
] as const;
