// FLOW_MODEL_V1 - estructura formal de flujo organizacional.
// Construido desde AgentPersona.reportsTo y AgentPersona.peers.
// NO desde AgentRole (AgentRole no tiene reportsTo ni peers).
// reportsTo: a quién reporta el actor.
// peers: pares simétricos.
// assigners/approvers/reviewers NO se persisten en Flow.
// Se resuelven desde Policy (F2).
//
// 3: FlowRelation resuelve personaId contra un Actor real del mismo
//    tenant. No asume personaId === actorId. Rechaza cruces de tenant.
//    Ser par no implica poder asignar, aprobar o escalar.
import { z } from "zod";

export const flowRelationSchema = z.object({
  // 3: actorId es el id del Actor resuelto, no el personaId.
  actorId: z.string().min(1).max(200),
  // 3: personaId es el id original de AgentPersona, para trazabilidad.
  personaId: z.string().min(1).max(80),
  kind: z.enum(["human", "agent"]),
  role: z.enum(["owner", "manager", "employee", "hr", "compliance", "agent"]),
  // 3: tenantId valida que la relación no cruza tenants.
  tenantId: z.string().min(1).max(100),
});

export const flowSchema = z.object({
  reportsTo: flowRelationSchema.optional(),
  peers: z.array(flowRelationSchema).max(50).default([]),
});

export type FlowRelation = z.infer<typeof flowRelationSchema>;
export type Flow = z.infer<typeof flowSchema>;
