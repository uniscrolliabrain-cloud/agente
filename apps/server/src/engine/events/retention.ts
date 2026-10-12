// EVENTS_RETENTION_V1 Ã¢â‚¬â€ retenciÃƒÂ³n por tipo de evento.
//
// Hoy `purgeOlderThan("system-events", 90)` borra todo a los 90 dÃƒÂ­as.
// Pero los eventos de auth son sensibles (interesa retenerlos mÃƒÂ¡s), los de
// monitor cambian poco (borrar antes), y los de task son la espina dorsal.
//
// Ver: docs/audits/08-bus-de-eventos/miniaudit.md ("RetenciÃƒÂ³n uniforme 90 dÃƒÂ­as"),
// docs/audits/08-bus-de-eventos/roadmap.md Ã‚Â§8.

import type { SystemEventType } from "./types.ts";

export interface RetentionRule {
  /** PatrÃƒÂ³n del tipo (substring o match exacto). */
  pattern: string;
  /** DÃƒÂ­as de retenciÃƒÂ³n. */
  days: number;
  /** Motivo (documenta la decisiÃƒÂ³n). */
  reason: string;
}

export const RETENTION_RULES: RetentionRule[] = [
  // Eventos de seguridad: retenciÃƒÂ³n larga para auditorÃƒÂ­a.
  { pattern: "auth.", days: 365, reason: "SOC-2 requiere 1 aÃƒÂ±o de logs de auth" },
  { pattern: "policy.", days: 365, reason: "Decisiones de policy para auditorÃƒÂ­a" },
  { pattern: "state.", days: 365, reason: "Transiciones de estado para auditorÃƒÂ­a" },
  // Eventos de task: retenciÃƒÂ³n media.
  { pattern: "task.", days: 90, reason: "Espina dorsal operativa" },
  { pattern: "sop.", days: 90, reason: "Trazabilidad de SOPs" },
  { pattern: "action.", days: 90, reason: "Aprobaciones y efectos externos" },
  { pattern: "agent.", days: 90, reason: "Runtimes de agente" },
  { pattern: "context.", days: 30, reason: "Contexto efÃƒÂ­mero" },
  { pattern: "entity.", days: 180, reason: "Business graph cambios" },
  { pattern: "relation.", days: 180, reason: "Business graph relaciones" },
  // Monitor: alta frecuencia, retenciÃƒÂ³n corta.
  { pattern: "monitor.", days: 30, reason: "Alta frecuencia, valor histÃƒÂ³rico bajo" },
  // Sistema: corta.
  { pattern: "system.maintenance", days: 7, reason: "Ruido operativo" },
  { pattern: "system.startup", days: 30, reason: "Eventos de arranque" },
  { pattern: "system.error", days: 180, reason: "Errores para diagnÃƒÂ³stico" },
  { pattern: "system.google_disconnected", days: 30, reason: "Estado de conexiÃƒÂ³n" },
  // View: efÃƒÂ­mero.
  { pattern: "view.", days: 7, reason: "Vistas servidas efÃƒÂ­meras" },
];

  // EVENTS_RETENTION_RULE_V1
export function retentionDaysFor(type: SystemEventType): number {
  for (const rule of RETENTION_RULES) {
    // RETENTION_MATCH_STRICT_V1 - exacto o prefijo con punto.
    const prefix = rule.pattern.endsWith(".") ? rule.pattern : rule.pattern + ".";
    if (type === rule.pattern || type.startsWith(prefix)) {
      return rule.days;
    }
  }
  return 90;
}

/**
 * Agrupa los tipos por dÃƒÂ­as de retenciÃƒÂ³n para hacer purgas eficientes.
 */
  // EVENTS_RETENTION_GROUP_V1
export function groupTypesByRetention(types: readonly SystemEventType[]): Map<number, string[]> {
  const grouped = new Map<number, string[]>();
  for (const type of types) {
    // RETENTION_GROUP_DEFAULT_V1 - retentionDaysFor ya devuelve 90 si no hay match.
    const days = retentionDaysFor(type);
    const list = grouped.get(days) ?? [];
    list.push(type);
    grouped.set(days, list);
  }
  return grouped;
}
