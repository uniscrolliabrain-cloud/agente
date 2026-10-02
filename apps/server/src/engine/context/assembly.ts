import type { ContextPackage } from "./engine.ts";
import { scoreItem } from "./budget.ts";

// CONTEXT_ASSEMBLY_V1 — renderiza el ContextPackage a texto listo para
// inyectar en el prompt. Presupuesto por campo para no explotar tokens.

const MAX_ROLE_MEMORIES = 8;
const MAX_ENTITY_PROPERTIES = 20;
const MAX_RELATIONS = 15;
const MAX_EVENTS = 10;
const MAX_RECALL_HITS = 5;

export function renderContext(pkg: ContextPackage): string {
  const parts: string[] = [];
  parts.push(`Rol activo: ${pkg.role.name} (${pkg.role.tone}).`);
  parts.push(`Objetivo: ${pkg.role.objetivo}`);
  if (pkg.role.memories.length > 0) {
    // CONTEXT_BUDGET_WIRE_V1 - ordenar por scoreItem.
    const scored = [...pkg.role.memories]
      .map((m, i) => ({
        m,
        score: scoreItem({
          semantic: 0.5,
          recency: 0.5,
          authority: m.category?.startsWith("rol-") ? 0.8 : 0.5,
          roleMatch: 0.9,
        }) + (pkg.role.memories.length - i) * 0.001,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_ROLE_MEMORIES)
      .map((x) => x.m);
    const mems = scored;
    parts.push(
      `Memorias del rol (datos):\\n${mems.map((m) => `- [${m.category ?? "memoria"}] ${m.text}`).join("\\n")}`,
    );
  }
  if (pkg.entity) {
    parts.push(`Entidad: ${pkg.entity.type} "${pkg.entity.name}" (${pkg.entity.id})`);
    if (pkg.entity.status) parts.push(`Estado: ${pkg.entity.status}`);
    const props = Object.entries(pkg.entity.properties).slice(0, MAX_ENTITY_PROPERTIES);
    if (props.length > 0)
      parts.push(
        `Propiedades (datos):\\n${props.map(([k, v]) => `- ${k}: ${JSON.stringify(v)}`).join("\\n")}`,
      );
  }
  if (pkg.relations.length > 0) {
    const rels = pkg.relations.slice(0, MAX_RELATIONS);
    parts.push(`Relaciones:\\n${rels.map((r) => `- ${r.type}: ${r.fromEntityId} -> ${r.toEntityId}`).join("\\n")}`);
  }
  if (pkg.events.length > 0) {
    const evs = pkg.events.slice(0, MAX_EVENTS);
    parts.push(`Eventos recientes:\\n${evs.map((e) => `- ${e.type} @ ${e.emittedAt}`).join("\\n")}`);
  }
  if (pkg.recall.ragHits.length > 0) {
    const hits = pkg.recall.ragHits.slice(0, MAX_RECALL_HITS);
    parts.push(`Documentos relevantes:\\n${hits.map((h) => `- [${h.sourceName}] ${h.text.slice(0, 400)}`).join("\\n")}`);
  }
  return parts.join("\\n\\n");
}
