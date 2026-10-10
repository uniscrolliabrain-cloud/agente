// 08-chatgpt - declaracion de capacidades.
export const CAPABILITIES = [
  { id: "assistant.send_message", title: "assistant.send_message", kind: "action" as const, risk: "low" as const },
  { id: "assistant.trigger_tool", title: "assistant.trigger_tool", kind: "action" as const, risk: "low" as const },
  { id: "assistant.approve_action", title: "assistant.approve_action", kind: "action" as const, risk: "low" as const },
  { id: "assistant.list_conversations", title: "assistant.list_conversations", kind: "action" as const, risk: "low" as const }
] as const;
