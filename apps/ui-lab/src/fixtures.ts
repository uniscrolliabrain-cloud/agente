// AGNTIA_DEMO_REVIEW_V1 — preview-only fixtures, no API, no external effects.
import type { AgentTask } from "../../web/src/types/api";
import type { MemoryEntry, FileEntry } from "../../web/src/hooks/useWorkspaceData";
const now = "2026-11-23T09:00:00.000Z";
export const memories: MemoryEntry[] = [
  { id: "demo-memory-bruma", text: "Taller Bruma · Diagnóstico de compilación\nCuatro personas. Consultas sin responder y agenda dispersa. Prioridad: atención y seguimiento comercial.", source: "agntia-demo · simulación", createdAt: now },
  { id: "demo-memory-caliza", text: "Estudio Caliza · Política de publicación\nNinguna campaña se publica sin aprobación del owner. La propuesta está preparada, no enviada.", source: "agntia-demo · simulación", createdAt: now },
  { id: "demo-memory-ladera", text: "Mercado Ladera · Consentimiento\nLa conexión de mensajería sigue pendiente de autorización; no hay integración externa activa.", source: "agntia-demo · simulación", createdAt: now },
];
export const files: FileEntry[] = [
  { id: "demo-file-bruma", name: "Diagnostico-Taller-Bruma.pdf", mimeType: "application/pdf", size: 124000, createdAt: now },
  { id: "demo-file-caliza", name: "Propuesta-Estudio-Caliza.pdf", mimeType: "application/pdf", size: 87000, createdAt: now },
];
const base = { prompt: "Escenario sintético de AgntiaPro", kind: "agent" as const, plan: [], evidence: [], input: {}, state: {}, createdAt: now, updatedAt: now, attempts: 0, artifactIds: [] };
export const tasks: AgentTask[] = [
  { id: "demo-caliza-approval", title: "Aprobar campaña · Estudio Caliza", status: "waiting_approval", assignedTo: "agent-marcos", ...base },
  { id: "demo-ontology-bruma", title: "Compilar procesos · Taller Bruma", status: "running", assignedTo: "agent-marcos", ...base },
  { id: "demo-ladera-consent", title: "Validar autorización · Mercado Ladera", status: "waiting_input", assignedTo: "agent-pedro", ...base },
  { id: "demo-costa-docs", title: "Revisar expediente · Costa Nido", status: "succeeded", assignedTo: "agent-juan", ...base },
];
