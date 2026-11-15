import { z } from "zod";
import type { CognitiveIdentity } from "../../../../../../packages/domain/src/cognition-v2.ts";
import type { ContextServingFacade } from "./context.ts";
const receiptSchema = z.strictObject({ jobId: z.string().min(1), state: z.enum(["queued", "running", "completed", "failed", "cancelled"]), receiptId: z.string().min(1) });
export async function presentCognitiveJourney(context: ContextServingFacade, identity: CognitiveIdentity, after = "0") {
  await context.assertAuthorized(identity);
  if (!/^\d{1,20}$/.test(after)) throw Error("INVALID_CURSOR");
  const events = await context.projections.db.rawQuery<{ sequence: string; event: { id: string; emittedAt: string; payload: unknown } }>(
    `SELECT sequence,event FROM cognition_v2_events WHERE tenant=$1 AND sequence>$2
      AND event->>'owner'=$3 AND event->>'type'='cognition.v2.slow.status' ORDER BY sequence LIMIT 100`, [identity.tenantId, after, identity.actorId]);
  const phases = events.map(({ sequence, event }) => ({ sequence: String(sequence), eventId: event.id, at: event.emittedAt, ...receiptSchema.parse(event.payload) }));
  await context.assertAuthorized(identity);
  return { schemaVersion: "2.0", phases, nextCursor: phases.at(-1)?.sequence ?? after };
}
