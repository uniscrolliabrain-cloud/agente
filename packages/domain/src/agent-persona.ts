// AGENT_PERSONA_V1 - schema base de personas funcionales del sistema.
//
// Una AgentPersona NO es un prompt. Es la descripcion estatica de una
// persona funcional: quien es, como habla, que arquetipo tiene, que
// valores la guian, que stats tiene. El prompt se ensambla en runtime.
//
// Ver: docs/audits/09-kernel-cognitivo/09z-personas.md (a crear)

import { z } from "zod";

// ---------------------------------------------------------------------
// Arquetipos y estado
// ---------------------------------------------------------------------

export const agentArchetypeSchema = z.enum([
  "orchestrator",
  "hunter",
  "guardian",
  "strategist",
  "architect",
  "assistant",
]);

export const agentStatusSchema = z.enum([
  "online",
  "idle",
  "working",
  "standby",
  "offline",
]);

export const agentGenderSchema = z.enum([
  "female",
  "male",
  "non-binary",
  "unspecified",
]);

export const agentFormalitySchema = z.enum(["tu", "usted", "neutral"]);

// ---------------------------------------------------------------------
// Personalidad
// ---------------------------------------------------------------------

export const agentPersonalitySchema = z
  .object({
    traits: z.array(z.string().min(1).max(80)).max(20).default([]),
    tone: z.string().min(1).max(120),
    formality: agentFormalitySchema.default("tu"),
    quirks: z.array(z.string().min(1).max(300)).max(20).default([]),
  })
  .strict();

// ---------------------------------------------------------------------
// Capacidades
// ---------------------------------------------------------------------

export const agentCapabilitiesSchema = z
  .object({
    domains: z.array(z.string().min(1).max(80)).max(20).default(["all"]),
    scope: z.string().min(1).max(120),
    knowsEveryone: z.boolean().default(false),
    crossTenant: z.boolean().default(false),
  })
  .strict();

// ---------------------------------------------------------------------
// Valores (referencias al catalogo universal)
// ---------------------------------------------------------------------

export const agentValueRefSchema = z
  .object({
    id: z.string().min(1).max(80),
    weight: z.number().min(0).max(1),
  })
  .strict();

// ---------------------------------------------------------------------
// Avatar
// ---------------------------------------------------------------------

export const agentAvatarSchema = z
  .object({
    kind: z.enum(["generated-portrait", "initials", "image"]).default("initials"),
    seed: z.string().max(120).optional(),
    url: z.string().url().max(2000).optional(),
    style: z.string().max(120).optional(),
  })
  .strict();

// ---------------------------------------------------------------------
// Stats (gamificacion)
// ---------------------------------------------------------------------

export const agentStatsSchema = z
  .object({
    level: z.number().int().min(1).max(99).default(1),
    archetype: agentArchetypeSchema,
    totalTasks: z.number().int().nonnegative().default(0),
    precision: z.number().min(0).max(1).default(0),
    avgTimeMs: z.number().int().nonnegative().default(0),
    uptime: z.number().min(0).max(1).default(0),
    status: agentStatusSchema.default("idle"),
    currentTask: z.string().max(300).optional(),
  })
  .strict();

// ---------------------------------------------------------------------
// AgentPersona
// ---------------------------------------------------------------------

export const agentPersonaSchema = z
  .object({
    id: z
      .string()
      .min(1)
      .max(80)
      .regex(/^[a-z][a-z0-9-]*$/, "id must be kebab-case lowercase"),
    displayName: z.string().min(1).max(80),
    role: z.string().min(1).max(200),
    age: z.number().int().min(18).max(99).optional(),
    gender: agentGenderSchema.optional(),
    personality: agentPersonalitySchema,
    capabilities: agentCapabilitiesSchema,
    values: z.array(agentValueRefSchema).max(20).default([]),
    reportsTo: z.string().min(1).max(80).optional(),
    peers: z.array(z.string().min(1).max(80)).max(50).default([]),
    avatar: agentAvatarSchema.optional(),
    language: z.string().min(2).max(10).default("es"),
    metadata: z.record(z.string(), z.unknown()).default({}),
  })
  .strict();

// ---------------------------------------------------------------------
// Tipos inferidos
// ---------------------------------------------------------------------

export type AgentArchetype = z.infer<typeof agentArchetypeSchema>;
export type AgentStatus = z.infer<typeof agentStatusSchema>;
export type AgentGender = z.infer<typeof agentGenderSchema>;
export type AgentFormality = z.infer<typeof agentFormalitySchema>;
export type AgentPersonality = z.infer<typeof agentPersonalitySchema>;
export type AgentCapabilities = z.infer<typeof agentCapabilitiesSchema>;
export type AgentValueRef = z.infer<typeof agentValueRefSchema>;
export type AgentAvatar = z.infer<typeof agentAvatarSchema>;
export type AgentStats = z.infer<typeof agentStatsSchema>;
export type AgentPersona = z.infer<typeof agentPersonaSchema>;
// ---------------------------------------------------------------------
// Metadatos de arquetipos (para UI)
// ---------------------------------------------------------------------

export const ARCHETYPE_META = {
  orchestrator: {
    name: "Orquestador",
    description: "Coordina y delega al squad",
    color: "#7C5CFC",
  },
  hunter: {
    name: "Cazador",
    description: "Busca oportunidades",
    color: "#5C9CFC",
  },
  guardian: {
    name: "Guardian",
    description: "Protege y resuelve problemas",
    color: "#5CFC8C",
  },
  strategist: {
    name: "Estratega",
    description: "Planifica a largo plazo",
    color: "#FCD45C",
  },
  architect: {
    name: "Arquitecto",
    description: "Construye sistemas",
    color: "#FC9C5C",
  },
  assistant: {
    name: "Asistente",
    description: "Asiste transversalmente",
    color: "#C45CFC",
  },
} as const satisfies Record<AgentArchetype, { name: string; description: string; color: string }>;
