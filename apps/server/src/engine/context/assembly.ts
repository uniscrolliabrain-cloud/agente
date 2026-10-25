import type { ContextPackage } from "./engine.ts";
import { scoreItem, estimateTokens, selectWithinBudget, allocationWithDefaults, type BudgetAllocation } from "./budget.ts";

// CONTEXT_ASSEMBLY_V1 â€” renderiza el ContextPackage a texto listo para
// inyectar en el prompt. Presupuesto por campo para no explotar tokens.

const MAX_ROLE_MEMORIES = 8;
const MAX_ENTITY_PROPERTIES = 20;
const MAX_RELATIONS = 15;
const MAX_EVENTS = 10;
const MAX_RECALL_HITS = 5;

// FEEDBACK_SCORING_APPLIED_V1 - antes el feedback del usuario
// (FeedbackCollector/FeedbackScoring) se guardaba pero no se usaba. Ahora
// el scoring del contexto aplica un multiplicador por fuente: tareas con
// feedback "useful" pesan mas, "not_useful" pesan menos. El multiplicador
// se pasa como parametro opcional; sin el, comportamiento previo.
  // CONTEXT_ASSEMBLY_MULTIPLIERS_V1
// B-05/B-27 - attention.matched eleva el score de una memoria si su nodo
// coincide con el primary o con un matched del AttentionVector.
function attentionBoost(memory: { text: string; category?: string }, attention?: { primary: string; matched: Array<{ node: string; weight: number }> }): number {
  if (!attention) return 0;
  const text = memory.text.toLowerCase();
  let boost = 0;
  if (text.includes(attention.primary.toLowerCase())) boost += 0.3;
  for (const m of attention.matched) {
    if (text.includes(m.node.toLowerCase())) boost += m.weight * 0.2;
  }
  return boost;
}

export function renderContext(
  pkg: ContextPackage,
  options: { multipliers?: Record<string, number>; budget?: BudgetAllocation; attention?: { primary: string; matched: Array<{ node: string; weight: number }> } } = {},
): string {
  void options.multipliers;
  const parts: string[] = [];
  parts.push(`Rol activo: ${pkg.role.name} (${pkg.role.tone}).`);
  parts.push(`Objetivo: ${pkg.role.objetivo}`);
  if (pkg.role.memories.length > 0) {
    // CONTEXT_BUDGET_WIRE_V1 - ordenar por scoreItem.
    // FIX 14 - scoreItem con semantica real:
    //   - semantic: similitud con la query (substring simple, no embeddings).
    //   - recency: 1 si fue creada hoy, decae con la edad.
    //   - authority: 1 si es rol-* (canon del rol), 0.5 si es memoria general.
    //   - roleMatch: 1 si roleId coincide, 0.5 si no.
    const query = (pkg.role.name + " " + pkg.role.objetivo).toLowerCase();
    const nowMs = Date.now();
    const scored = [...pkg.role.memories]
      .map((m, i) => {
        const text = m.text.toLowerCase();
        const words = query.split(/\\s+/).filter((w) => w.length > 2);
        const matches = words.filter((w) => text.includes(w)).length;
        const semantic = words.length > 0 ? matches / words.length : 0;
        const ageMs = nowMs - Date.parse(m.createdAt ?? new Date().toISOString());
        const recency = Math.max(0, 1 - ageMs / (30 * 24 * 60 * 60 * 1000));
        const authority = m.category?.startsWith("rol-") ? 1 : 0.5;
        const roleMatch = m.roleId === pkg.role.id ? 1 : 0.5;
        return {
          m,
          score: scoreItem({ semantic, recency, authority, roleMatch }) + (pkg.role.memories.length - i) * 0.001 + attentionBoost(m, options.attention),
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_ROLE_MEMORIES)
      .map((x) => x.m);
    // FIX_12_2_BUDGET_APPLIED_V1 - cortar por presupuesto de tokens.
    const budget = allocationWithDefaults(options.budget as BudgetAllocation | undefined);
    const items = scored.map((m) => ({
      value: `- [${m.category ?? "memoria"}] ${m.text}`,
      tokens: estimateTokens(m.text),
      score: 1,
    }));
    const selected = selectWithinBudget(items, budget.roleTokens);
    const mems = selected.map((i) => i.value);
    if (mems.length > 0) {
      parts.push(`Memorias del rol (datos):\\n${mems.join("\\n")}`);
    }
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
  // FIX_LEARNING_IN_PKG_V1_RENDER - pinta los facts aprendidos por LearningObserver.
  if (pkg.learning.length > 0) {
    const facts = pkg.learning.slice(0, 10);
    parts.push(
      "Aprendizajes previos (datos):" + String.fromCharCode(10) +
        facts.map((f) => "- [" + f.source + "] " + f.text.slice(0, 300)).join(String.fromCharCode(10)),
    );
  }
  return parts.join("\\n\\n");
}
