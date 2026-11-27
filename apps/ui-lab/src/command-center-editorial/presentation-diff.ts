import type { CompanyOverview } from "../../../web/src/api/company";

/** Observaciones presentacionales, no eventos de dominio ni prioridades nuevas. */
export interface PresentationSnapshot {
  tenantId: string;
  values: ReadonlyMap<string, string>;
}

export function presentationSnapshot(overview: CompanyOverview): PresentationSnapshot {
  const { tasks, agents, members } = overview;
  const active = agents.filter((agent) => agent.active).length;
  const values = new Map<string, string>([
    ["kpi:aprobaciones", JSON.stringify([tasks.waiting, tasks.failed])],
    ["kpi:en-marcha", JSON.stringify([tasks.running, tasks.total])],
    ["kpi:agentes", JSON.stringify([active, agents.length])],
    ["kpi:equipo", String(members.length)],
    ["block:agentes", JSON.stringify([active, agents.length])],
    ["block:en-marcha", JSON.stringify([tasks.running, tasks.total, tasks.succeeded])],
    ["block:aprobaciones", String(tasks.waiting)],
    ["block:equipo", String(members.length)],
    ["block:incidencias", String(tasks.failed)],
    ["block:actividad", JSON.stringify([tasks.total, tasks.running, tasks.waiting, tasks.succeeded, tasks.failed])],
  ]);
  // Una fecha actualizada no prueba un cambio visible. Comparar los atributos
  // que afectan a la representación, no updatedAt, polling ni orden del array.
  for (const task of tasks.recent) {
    values.set("task:" + task.id, JSON.stringify([
      task.status, task.title, task.kind, task.assignedTo ?? null, task.owner,
    ]));
  }
  for (const agent of agents) {
    values.set("agent:" + agent.id, JSON.stringify([agent.active, agent.name]));
  }
  for (const member of members) {
    values.set("member:" + member.userId, JSON.stringify([member.name, member.email, member.role]));
  }
  return { tenantId: overview.tenant.id, values };
}

/** Solo cambios comprobables de elementos presentes en ambos snapshots.
 * No inferir novedades por la entrada de un registro en una ventana limitada.
 */
export function changedPresentationKeys(
  previous: PresentationSnapshot | null,
  current: PresentationSnapshot | null,
): ReadonlySet<string> {
  const changed = new Set<string>();
  if (!previous || !current || previous.tenantId !== current.tenantId) return changed;
  for (const [key, value] of current.values) {
    if (previous.values.has(key) && previous.values.get(key) !== value) changed.add(key);
  }
  return changed;
}
