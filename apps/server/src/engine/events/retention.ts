// EVENTS_RETENTION_V1 â€” retenciÃ³n por tipo de evento.
//
// Hoy `purgeOlderThan("system-events", 90)` borra todo a los 90 dÃ­as.
// Pero los eventos de auth son sensibles (interesa retenerlos mÃ¡s), los de
// monitor cambian poco (borrar antes), y los de task son la espina dorsal.
//
// Ver: docs/audits/08-bus-de-eventos/miniaudit.md ("RetenciÃ³n uniforme 90 dÃ­as"),
// docs/audits/08-bus-de-eventos/roadmap.md Â§8.

import type { SystemEventType } from "./types.ts";

export interface RetentionRule {
  /** PatrÃ³n del tipo (substring o match exacto). */
  pattern: string;
  /** DÃ­as de retenciÃ³n. */
  days: number;
  /** Motivo (documenta la decisiÃ³n). */
  reason: string;
}

export const RETENTION_RULES: RetentionRule[] = [
  // Eventos de seguridad: retenciÃ³n larga para auditorÃ­a.
  { pattern: "auth.", days: 365, reason: "SOC-2 requiere 1 aÃ±o de logs de auth" },
  { pattern: "policy.", days: 365, reason: "Decisiones de policy para auditorÃ­a" },
  { pattern: "state.", days: 365, reason: "Transiciones de estado para auditorÃ­a" },
  // Eventos de task: retenciÃ³n media.
  { pattern: "task.", days: 90, reason: "Espina dorsal operativa" },
  { pattern: "sop.", days: 90, reason: "Trazabilidad de SOPs" },
  { pattern: "action.", days: 90, reason: "Aprobaciones y efectos externos" },
  { pattern: "agent.", days: 90, reason: "Runtimes de agente" },
  { pattern: "context.", days: 30, reason: "Contexto efÃ­mero" },
  { pattern: "entity.", days: 180, reason: "Business graph cambios" },
  { pattern: "relation.", days: 180, reason: "Business graph relaciones" },
  // Monitor: alta frecuencia, retenciÃ³n corta.
  { pattern: "monitor.", days: 30, reason: "Alta frecuencia, valor histÃ³rico bajo" },
  // Sistema: corta.
  { pattern: "system.maintenance", days: 7, reason: "Ruido operativo" },
  { pattern: "system.startup", days: 30, reason: "Eventos de arranque" },
  { pattern: "system.error", days: 180, reason: "Errores para diagnÃ³stico" },
  { pattern: "system.google_disconnected", days: 30, reason: "Estado de conexiÃ³n" },
  // View: efÃ­mero.
  { pattern: "view.", days: 7, reason: "Vistas servidas efÃ­meras" },
];

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
 * Agrupa los tipos por dÃ­as de retenciÃ³n para hacer purgas eficientes.
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
