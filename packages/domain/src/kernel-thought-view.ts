// FIX 03 - Vista TypeScript plana del Thought canonico (Zod en kernel/graph/thought.ts).
// Solo se usa para consumidores que no pueden importar Zod. No es un contrato nuevo.
export interface KernelThoughtView {
  id: string;
  tenantId: string;
  turnId: string;
  owner: string;
  role: string;
  actor: { kind: string; id: string; personaId?: string };
  content: string | Record<string, unknown>;
  provenance: { source: string; timestamp: string; parentId?: string; correlationId?: string };
  edges: Array<{ toThoughtId: string; kind: string; weight: number; confidence: number; createdAt?: string }>;
  context: { entities: string[]; policies: string[]; skills: string[]; priorThoughts: string[] };
}