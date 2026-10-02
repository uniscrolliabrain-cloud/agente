// CAPABILITIES_BOOTSTRAP_V1 - registra las capabilities del sistema al arrancar.

import { CapabilityRegistry } from "./registry.ts";

export function bootstrapCapabilities(registry: CapabilityRegistry): void {
  // Tools de SOP
  const tools: Array<{ id: string; risk: string; sideEffects: Array<{ kind: string; target: string; reversible: boolean }>; requiresApproval: boolean }> = [
    { id: "read_mail_thread", risk: "low", sideEffects: [{ kind: "read", target: "email", reversible: true }], requiresApproval: false },
    { id: "read_workspace", risk: "low", sideEffects: [{ kind: "read", target: "workspace", reversible: true }], requiresApproval: false },
    { id: "import_pdf", risk: "low", sideEffects: [{ kind: "read", target: "files", reversible: true }], requiresApproval: false },
    { id: "inspect_pdf", risk: "low", sideEffects: [{ kind: "read", target: "files", reversible: true }], requiresApproval: false },
    { id: "fill_pdf", risk: "low", sideEffects: [{ kind: "write", target: "files", reversible: true }], requiresApproval: false },
    { id: "prepare_email", risk: "medium", sideEffects: [{ kind: "external_write", target: "email", reversible: false }], requiresApproval: true },
    { id: "prepare_event", risk: "medium", sideEffects: [{ kind: "external_write", target: "calendar", reversible: false }], requiresApproval: true },
    { id: "read_web", risk: "low", sideEffects: [{ kind: "read", target: "web", reversible: true }], requiresApproval: false },
    { id: "save_artifact", risk: "low", sideEffects: [{ kind: "write", target: "artifacts", reversible: true }], requiresApproval: false },
    { id: "ask_user", risk: "low", sideEffects: [], requiresApproval: false },
    { id: "computer_command", risk: "medium", sideEffects: [{ kind: "write", target: "sandbox", reversible: false }], requiresApproval: false },
    { id: "query_business", risk: "low", sideEffects: [{ kind: "read", target: "business", reversible: true }], requiresApproval: false },
    { id: "recall_memory", risk: "low", sideEffects: [{ kind: "read", target: "memory", reversible: true }], requiresApproval: false },
    { id: "llm_generate", risk: "low", sideEffects: [], requiresApproval: false },
    { id: "transition_entity", risk: "medium", sideEffects: [{ kind: "write", target: "entity", reversible: false }], requiresApproval: false },
  ];

  for (const t of tools) {
    registry.register({
      id: t.id,
      version: "1.0.0",
      name: t.id,
      description: t.id,
      kind: "tool",
      inputs: {},
      outputs: {},
      preconditions: [],
      sideEffects: t.sideEffects.map((s) => ({
        kind: s.kind as "read" | "write" | "external_write" | "notification",
        target: s.target,
        reversible: s.reversible,
      })),
      permissions: [],
      risk: t.risk as "low" | "medium" | "high" | "critical",
      cost: {},
      idempotency: "idempotent",
      retryable: false,
      compensatable: false,
      requiresApproval: t.requiresApproval,
      tags: ["tool"],
    });
  }

  // CAPABILITIES_EXTENDED_V1 - capabilities de alto nivel (no tools).
  const composites: Array<{
    id: string;
    kind: "sop" | "composite" | "skill";
    description: string;
    risk: "low" | "medium" | "high" | "critical";
    sideEffects: Array<{ kind: string; target: string; reversible: boolean }>;
    requiresApproval: boolean;
  }> = [
    { id: "run_sop", kind: "composite", description: "Ejecuta un SOP registrado", risk: "low", sideEffects: [], requiresApproval: false },
    { id: "send_email", kind: "composite", description: "Envía email (preparado + aprobado)", risk: "medium", sideEffects: [{ kind: "external_write", target: "email", reversible: false }], requiresApproval: true },
    { id: "send_whatsapp", kind: "composite", description: "Envía WhatsApp (preparado + aprobado)", risk: "medium", sideEffects: [{ kind: "external_write", target: "whatsapp", reversible: false }], requiresApproval: true },
    { id: "create_calendar_event", kind: "composite", description: "Crea evento (preparado + aprobado)", risk: "medium", sideEffects: [{ kind: "external_write", target: "calendar", reversible: false }], requiresApproval: true },
  ];
  for (const c of composites) {
    registry.register({
      id: c.id,
      version: "1.0.0",
      name: c.id,
      description: c.description,
      kind: c.kind,
      inputs: {},
      outputs: {},
      preconditions: [],
      sideEffects: c.sideEffects.map((s) => ({
        kind: s.kind as "read" | "write" | "external_write" | "notification",
        target: s.target,
        reversible: s.reversible,
      })),
      permissions: [],
      risk: c.risk,
      cost: {},
      idempotency: "idempotent",
      retryable: false,
      compensatable: false,
      requiresApproval: c.requiresApproval,
      tags: ["composite"],
    });
  }
}