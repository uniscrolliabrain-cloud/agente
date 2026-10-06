// CAPABILITIES_BOOTSTRAP_V1 - registra las capabilities del sistema al arrancar.

import { CapabilityRegistry } from "./registry.ts";
import { validateAgainstMetamodel } from "../../../../../packages/domain/src/ontology.ts";
import { BASE_VOCABULARY } from "../../../../../packages/domain/src/ontology-seed.ts";

export function bootstrapCapabilities(registry: CapabilityRegistry): void {
  // Tools de SOP
  const tools: Array<{ id: string; actionType: string; family: string; risk: string; sideEffects: Array<{ kind: string; target: string; reversible: boolean }>; requiresApproval: boolean }> = [
    { id: "read_mail_thread", actionType: "Read", family: "COMMUNICATION", risk: "low", sideEffects: [{ kind: "read", target: "email", reversible: true }], requiresApproval: false },
    { id: "read_workspace", actionType: "Read", family: "DATA", risk: "low", sideEffects: [{ kind: "read", target: "workspace", reversible: true }], requiresApproval: false },
    { id: "import_pdf", actionType: "Retrieve", family: "DOCUMENTS", risk: "low", sideEffects: [{ kind: "read", target: "files", reversible: true }], requiresApproval: false },
    { id: "inspect_pdf", actionType: "Read", family: "DOCUMENTS", risk: "low", sideEffects: [{ kind: "read", target: "files", reversible: true }], requiresApproval: false },
    { id: "fill_pdf", actionType: "Write", family: "DOCUMENTS", risk: "low", sideEffects: [{ kind: "write", target: "files", reversible: true }], requiresApproval: false },
    { id: "prepare_email", actionType: "Communicate", family: "COMMUNICATION", risk: "medium", sideEffects: [{ kind: "external_write", target: "email", reversible: false }], requiresApproval: true },
    { id: "prepare_event", actionType: "Create", family: "AUTOMATION", risk: "medium", sideEffects: [{ kind: "external_write", target: "calendar", reversible: false }], requiresApproval: true },
    { id: "read_web", actionType: "Read", family: "WEB", risk: "low", sideEffects: [{ kind: "read", target: "web", reversible: true }], requiresApproval: false },
    { id: "save_artifact", actionType: "Write", family: "DATA", risk: "low", sideEffects: [{ kind: "write", target: "artifacts", reversible: true }], requiresApproval: false },
    { id: "ask_user", actionType: "Communicate", family: "COMMUNICATION", risk: "low", sideEffects: [], requiresApproval: false },
    { id: "computer_command", actionType: "Execute", family: "SOFTWARE", risk: "medium", sideEffects: [{ kind: "write", target: "sandbox", reversible: false }], requiresApproval: false },
    { id: "query_business", actionType: "Retrieve", family: "DATA", risk: "low", sideEffects: [{ kind: "read", target: "business", reversible: true }], requiresApproval: false },
    { id: "recall_memory", actionType: "Retrieve", family: "DATA", risk: "low", sideEffects: [{ kind: "read", target: "memory", reversible: true }], requiresApproval: false },
    { id: "llm_generate", actionType: "Transform", family: "CONTENT", risk: "low", sideEffects: [], requiresApproval: false },
    { id: "transition_entity", actionType: "Update", family: "DATA", risk: "medium", sideEffects: [{ kind: "write", target: "entity", reversible: false }], requiresApproval: false },
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
      actionType: t.actionType as "Read" | "Write" | "Execute" | "Retrieve" | "Communicate" | "Create" | "Update" | "Transform",
      family: t.family as "COMMUNICATION" | "DATA" | "DOCUMENTS" | "AUTOMATION" | "WEB" | "SOFTWARE" | "CONTENT",
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
    actionType: string;
    family: string;
    description: string;
    risk: "low" | "medium" | "high" | "critical";
    sideEffects: Array<{ kind: string; target: string; reversible: boolean }>;
    requiresApproval: boolean;
  }> = [
    { id: "run_sop", kind: "composite", actionType: "Execute", family: "AUTOMATION", description: "Ejecuta un SOP registrado", risk: "low", sideEffects: [], requiresApproval: false },
    { id: "send_email", kind: "composite", actionType: "Communicate", family: "COMMUNICATION", description: "Envía email (preparado + aprobado)", risk: "medium", sideEffects: [{ kind: "external_write", target: "email", reversible: false }], requiresApproval: true },
    { id: "send_whatsapp", kind: "composite", actionType: "Communicate", family: "COMMUNICATION", description: "Envía WhatsApp (preparado + aprobado)", risk: "medium", sideEffects: [{ kind: "external_write", target: "whatsapp", reversible: false }], requiresApproval: true },
    { id: "create_calendar_event", kind: "composite", actionType: "Create", family: "AUTOMATION", description: "Crea evento (preparado + aprobado)", risk: "medium", sideEffects: [{ kind: "external_write", target: "calendar", reversible: false }], requiresApproval: true },
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
      actionType: c.actionType as "Read" | "Write" | "Execute" | "Retrieve" | "Communicate" | "Create" | "Update" | "Transform",
      family: c.family as "COMMUNICATION" | "DATA" | "DOCUMENTS" | "AUTOMATION" | "WEB" | "SOFTWARE" | "CONTENT",
      risk: c.risk,
      cost: {},
      idempotency: "idempotent",
      retryable: false,
      compensatable: false,
      requiresApproval: c.requiresApproval,
      tags: ["composite"],
    });
  }

  // ONTOLOGY_VALIDATE_BOOTSTRAP_V1 - valida el vocabulario declarado contra el metamodelo. Fail-closed.
  validateAgainstMetamodel({
    capabilityKinds: tools.map((t) => t.id).concat(composites.map((c) => c.id)),
    baseVocabulary: BASE_VOCABULARY,
  });
}