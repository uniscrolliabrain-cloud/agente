// 23-buffer - declaracion de capacidades.
export const CAPABILITIES = [
  { id: "post.compose", title: "post.compose", kind: "action" as const, risk: "low" as const },
  { id: "post.schedule", title: "post.schedule", kind: "action" as const, risk: "low" as const },
  { id: "post.publish", title: "post.publish", kind: "action" as const, risk: "low" as const },
  { id: "post.cancel", title: "post.cancel", kind: "action" as const, risk: "low" as const },
  { id: "post.metrics.collect", title: "post.metrics.collect", kind: "action" as const, risk: "low" as const },
  { id: "post.read", title: "post.read", kind: "action" as const, risk: "low" as const }
] as const;
