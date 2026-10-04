// EVENTS_RETENTION_V1 — retención por tipo de evento.
//
// Hoy `purgeOlderThan("system-events", 90)` borra todo a los 90 días.
// Pero los eventos de auth son sensibles (interesa retenerlos más), los de
// monitor cambian poco (borrar antes), y los de task son la espina dorsal.
//
// Ver: docs/audits/08-bus-de-eventos/miniaudit.md ("Retención uniforme 90 días"),
// docs/audits/08-bus-de-eventos/roadmap.md §8.

import type { SystemEventType } from "./types.ts";

export interface RetentionRule {
  /** Patrón del tipo (substring o match exacto). */
  pattern: string;
  /** Días de retención. */
  days: number;
  /** Motivo (documenta la decisión). */
  reason: string;
}

export const RETENTION_RULES: RetentionRule[] = [
  // Eventos de seguridad: retención larga para auditoría.
  { pattern: "auth.", days: 365, reason: "SOC-2 requiere 1 año de logs de auth" },
  { pattern: "policy.", days: 365, reason: "Decisiones de policy para auditoría" },
  { pattern: "state.", days: 365, reason: "Transiciones de estado para auditoría" },
  // Eventos de task: retención media.
  { pattern: "task.", days: 90, reason: "Espina dorsal operativa" },
  { pattern: "sop.", days: 90, reason: "Trazabilidad de SOPs" },
  { pattern: "action.", days: 90, reason: "Aprobaciones y efectos externos" },
  { pattern: "agent.", days: 90, reason: "Runtimes de agente" },
  { pattern: "context.", days: 30, reason: "Contexto efímero" },
  { pattern: "entity.", days: 180, reason: "Business graph cambios" },
  { pattern: "relation.", days: 180, reason: "Business graph relaciones" },
  // Monitor: alta frecuencia, retención corta.
  { pattern: "monitor.", days: 30, reason: "Alta frecuencia, valor histórico bajo" },
  // Sistema: corta.
  { pattern: "system.maintenance", days: 7, reason: "Ruido operativo" },
  { pattern: "system.startup", days: 30, reason: "Eventos de arranque" },
  { pattern: "system.error", days: 180, reason: "Errores para diagnóstico" },
  { pattern: "system.google_disconnected", days: 30, reason: "Estado de conexión" },
  // View: efímero.
  { pattern: "view.", days: 7, reason: "Vistas servidas efímeras" },
];

export function retentionDaysFor(type: SystemEventType): number {
  for (const rule of RETENTION_RULES) {
    if (type === rule.pattern || type.startsWith(rule.pattern)) {
      return rule.days;
    }
  }
  return 90; // Default conservador.
}

/**
 * Agrupa los tipos por días de retención para hacer purgas eficientes.
 */
export function groupTypesByRetention(types: readonly SystemEventType[]): Map<number, string[]> {
  const grouped = new Map<number, string[]>();
  for (const type of types) {
    const days = retentionDaysFor(type);
    const list = grouped.get(days) ?? [];
    list.push(type);
    grouped.set(days, list);
  }
  return grouped;
}
