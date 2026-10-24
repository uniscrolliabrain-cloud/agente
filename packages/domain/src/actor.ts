// ACTOR_MODEL_V1 - actor como vista derivada del JWT + User.
// Sin persistencia. Sin ActorRegistry. Se computa en cada request.
// HumanActor desde User. AgentActor desde AgentRole.
// ActorFlow es F3, no F1.
// B1 aplicada: AgentActor.id = runtimeId, runtimeId obligatorio.
import { z } from "zod";

export const actorKindSchema = z.enum(["human", "agent"]);

export const actorRoleSchema = z.enum([
  "owner", "manager", "employee", "hr", "compliance", "agent",
]);

export const actorProfileSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.email().optional(),
  avatar: z.string().max(2000).optional(),
  timezone: z.string().max(100).optional(),
  language: z.string().min(2).max(10).default("es"),
});

export const actorRolesSchema = z.array(actorRoleSchema).min(1).max(10);

export const humanActorSchema = z.object({
  kind: z.literal("human"),
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  userId: z.string().min(1).max(200),
  roles: actorRolesSchema,
  profile: actorProfileSchema,
  active: z.boolean(),
});

// B1 aplicada: id = runtimeId (instancia estable). roleId es el rol
// que ejecuta. personaId es la persona funcional si aplica. runtimeId
// es obligatorio: sin el, el actor no se construye (fail-closed).
export const agentActorSchema = z.object({
  kind: z.literal("agent"),
  id: z.string().min(1).max(200),          // = runtimeId
  tenantId: z.string().min(1).max(100),
  roleId: z.string().min(1).max(200),
  personaId: z.string().min(1).max(200).optional(),
  runtimeId: z.string().min(1).max(200),   // obligatorio
  kernelTurnId: z.string().max(200).optional(),
  roles: actorRolesSchema,
  profile: actorProfileSchema,
  active: z.boolean(),
});

export const actorSchema = z.discriminatedUnion("kind", [
  humanActorSchema,
  agentActorSchema,
]);

export type ActorKind = z.infer<typeof actorKindSchema>;
export type ActorRole = z.infer<typeof actorRoleSchema>;
export type ActorProfile = z.infer<typeof actorProfileSchema>;
export type HumanActor = z.infer<typeof humanActorSchema>;
export type AgentActor = z.infer<typeof agentActorSchema>;
export type Actor = z.infer<typeof actorSchema>;
