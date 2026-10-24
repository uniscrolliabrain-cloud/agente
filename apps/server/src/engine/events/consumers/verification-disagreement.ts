// VERIFICATION_DISAGREEMENT_CONSUMER_V1
import type { Store } from "../../../db.ts";
import type { SystemEvent } from "../types.ts";
import { globalSubscribers } from "../subscriber.ts";

export function startVerificationDisagreementConsumer(
  owners: string[],
  db: Store,
): { stop(): void } {
  const handles = owners.map((owner) =>
    globalSubscribers.subscribe(owner, (event: SystemEvent) => {
      if (event.type !== "verification.disagreement") return;
      const p = event.payload as Record<string, unknown>;
      const id = `vd-${event.id}`;
      void db
        .insertIfAbsent(event.owner, "approval-requests", {
          id,
          tenantId: event.tenantId,
          owner: event.owner,
          capabilityId: "verification.disagreement",
          reason: "Deterministico y LLM no coinciden; revisar manualmente",
          risk: "medium",
          status: "pending",
          payload: p,
          requestedAt: event.emittedAt,
          expiresAt: new Date(Date.parse(event.emittedAt) + 7 * 24 * 3600 * 1000).toISOString(),
        })
        .catch(() => {});
    }),
  );
  return {
    stop() {
      for (const h of handles) h.unsubscribe();
    },
  };
}