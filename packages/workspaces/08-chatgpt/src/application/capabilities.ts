// WS_CAPABILITIES_FULL_V1 - declaracion completa de capacidades (9 campos).
// Los 5 campos ampliados (description, sideEffects, requiresApproval, inputs, outputs)
// los exige capabilityDeclarationSchema. Se rellenan aqui para no romper el contrato.
import type { CapabilityDeclaration } from "../../../src/contracts/index.ts";

export const CAPABILITIES: readonly CapabilityDeclaration[] = [
  {
    id: "assistant.send_message",
    title: "assistant.send_message",
    description: "assistant.send_message",
    kind: "action",
    risk: "low",
    sideEffects: true,
    requiresApproval: false,
    inputs: {},
    outputs: {},
  },
  {
    id: "assistant.trigger_tool",
    title: "assistant.trigger_tool",
    description: "assistant.trigger_tool",
    kind: "action",
    risk: "low",
    sideEffects: true,
    requiresApproval: false,
    inputs: {},
    outputs: {},
  },
  {
    id: "assistant.approve_action",
    title: "assistant.approve_action",
    description: "assistant.approve_action",
    kind: "action",
    risk: "low",
    sideEffects: true,
    requiresApproval: false,
    inputs: {},
    outputs: {},
  },
  {
    id: "assistant.list_conversations",
    title: "assistant.list_conversations",
    description: "assistant.list_conversations",
    kind: "action",
    risk: "low",
    sideEffects: true,
    requiresApproval: false,
    inputs: {},
    outputs: {},
  },
];
