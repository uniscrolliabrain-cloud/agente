import type { CognitiveIdentity } from "../../../../../../packages/domain/src/cognition-v2.ts";
import type { ContextServingFacade } from "./context.ts";
/** Bounded read projection. Relations never trigger business execution. */
export class CognitiveGraphQuery {
  constructor(readonly context: ContextServingFacade) {}
  async neighbors(identity: CognitiveIdentity, id: string, depth = 1) {
    const root = await this.context.resolve(identity, id);
    if (!root) return null;
    const visited = new Set<string>([id]), nodes = [root], edges: unknown[] = [];
    let frontier = [id];
    for (let step = 0; step < Math.min(3, Math.max(0, depth)) && frontier.length; step++) {
      const next: string[] = [];
      for (const nodeId of frontier) {
        const rows = await this.context.projections.db.rawQuery<{ data: { from: { id: string }; to: { id: string }; relation: string } }>(
          `SELECT data FROM cognition_v2_edges WHERE tenant=$1 AND (data->'from'->>'id'=$2 OR data->'to'->>'id'=$2) ORDER BY id LIMIT 50`, [identity.tenantId, nodeId]);
        for (const { data } of rows) {
          const otherId = data.from.id === nodeId ? data.to.id : data.from.id;
          const other = await this.context.resolve(identity, otherId);
          if (!other) continue; // No title/ID leakage for an inaccessible endpoint.
          edges.push(data);
          if (!visited.has(otherId) && nodes.length < 50) { visited.add(otherId); nodes.push(other); next.push(otherId); }
        }
      }
      frontier = next;
    }
    await this.context.assertAuthorized(identity);
    for (const node of nodes) if (!await this.context.resolve(identity, node.id, node.revision)) throw Error("GRAPH_CHANGED_RETRY");
    return { nodes, edges, truncated: nodes.length >= 50 };
  }
  async evidence(identity: CognitiveIdentity, id: string) {
    const record = await this.context.resolve(identity, id);
    if (!record) return null;
    const refs = [];
    for (const ref of record.evidence) {
      if (ref.kind === "memory" || ref.kind === "card") {
        if (await this.context.resolve(identity, ref.id, ref.revision)) refs.push({ ...ref, available: true });
      } else if (ref.kind === "thought") {
        const [thought] = await this.context.projections.db.rawQuery<{ data: { owner: string; tenantId: string } }>(
          `SELECT data FROM records WHERE owner=$1 AND kind='cognitive-thoughts' AND id=$2`, [identity.tenantId, ref.id]);
        if (thought?.data.tenantId === identity.tenantId && thought.data.owner === identity.owner) refs.push({ ...ref, available: true });
      } else if (ref.kind === "event") {
        const found = await this.context.projections.db.rawQuery(`SELECT event_id FROM cognition_v2_events WHERE tenant=$1 AND event_id=$2 AND event->>'owner'=$3`, [identity.tenantId, ref.id, identity.actorId]);
        if (found.length) refs.push({ ...ref, available: true });
      }
    }
    await this.context.assertAuthorized(identity);
    return { refs, complete: refs.length === record.evidence.length };
  }
}
