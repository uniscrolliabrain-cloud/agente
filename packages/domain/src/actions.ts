// ACTIONS_V1 - 16 verbos universales de accion.
//
// Los verbos son universales (kernel), no de dominio. Toda capacidad
// declara su `actionType` en este enum. Combinaciones logicas se expresan
// como pipelines, nunca como "acciones hibridas".
//
// Ver: docs/audits/09-kernel-cognitivo/09z-fundamentos.md

import { z } from "zod";

export const actionTypeSchema = z.enum([
  "Discover", "Search", "Retrieve", "Read", "Write", "Create",
  "Transform", "Analyze", "Classify", "Validate", "Communicate",
  "Publish", "Execute", "Update", "Delete", "Monitor",
]);

export type ActionType = z.infer<typeof actionTypeSchema>;

export const ACTION_TYPES = [
  "Discover", "Search", "Retrieve", "Read", "Write", "Create",
  "Transform", "Analyze", "Classify", "Validate", "Communicate",
  "Publish", "Execute", "Update", "Delete", "Monitor",
] as const;

if (ACTION_TYPES.length !== 16) {
  throw new Error("ACTIONS_V1: deben ser exactamente 16 verbos");
}

/**
 * Pares (Action, Entity) prohibidos por defecto.
 * Se comprueba en PolicyEngine antes de ejecutar.
 * Formato: "Action:Entity" con Entity en PascalCase sin prefijo core.
 */
export const FORBIDDEN_ACTION_ENTITY_PAIRS: ReadonlySet<string> = new Set([
  "Delete:Person",
  "Delete:Organization",
  "Delete:Company",
  "Delete:Email",
  "Delete:Message",
  "Delete:Event",
  "Publish:Person",
  "Publish:Email",
  "Publish:Message",
]);

export function isValidAction(action: string): action is ActionType {
  return (ACTION_TYPES as readonly string[]).includes(action);
}

export function isForbiddenPair(action: string, entityType: string): boolean {
  const short = entityType.startsWith("core.") ? entityType.slice(5) : entityType;
  const normalized = short
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\s/g, "");
  return FORBIDDEN_ACTION_ENTITY_PAIRS.has(`${action}:${normalized}`);
}