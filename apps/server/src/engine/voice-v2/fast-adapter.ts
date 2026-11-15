// C13_SHARED_FAST_ADAPTER_V2: voice reuses the chat runtime and its authority.
import { EventType } from "@ag-ui/core";
import type { Subscription } from "rxjs";
import type { CognitiveIdentity } from "../../../../../packages/domain/src/cognition-v2.ts";
import type { CognitionV2Runtime } from "../cognition/v2/runtime.ts";
import { runInTenantScope } from "../../tenant-scope.ts";
import { digest } from "../cognition/v2/storage.ts";
import type { SharedFastVoicePort } from "./contracts.ts";
export class CognitionFastVoiceAdapter implements SharedFastVoicePort {
  constructor(readonly runtime: CognitionV2Runtime) {}
  async stream(identity: CognitiveIdentity, input: { threadId: string; turnId: string; text: string; contextSnapshotId: string },
    signal: AbortSignal, onText: (text: string) => Promise<void>): Promise<{ receiptId: string; text: string }> {
    // A voice session may reference only an authorized, currently valid snapshot.
    if (!await this.runtime.context.readSnapshot(identity, input.contextSnapshotId)) throw Error("VOICE_CONTEXT_REVOKED");
    return new Promise((resolve, reject) => {
      let text = "", succeeded = false, ended = false;
      let subscription: Subscription | undefined;
      let writes = Promise.resolve();
      const finish = (error?: Error) => {
        if (ended) return; ended = true; signal.removeEventListener("abort", abort);
        subscription?.unsubscribe();
        if (error) reject(error);
        else void writes.then(() => resolve({ text, receiptId: digest([identity.tenantId, input.turnId, text]) }), reject);
      };
      const abort = () => finish(Error("VOICE_INTERRUPTED"));
      if (signal.aborted) { abort(); return; }
      signal.addEventListener("abort", abort, { once: true });
      subscription = runInTenantScope({ tenantId: identity.tenantId, actorId: identity.actorId }, () =>
        this.runtime.chat(identity.owner, { threadId: input.threadId, runId: input.turnId,
          messages: [{ id: `${input.turnId}:user`, role: "user", content: input.text }], state: {}, tools: [], context: [], forwardedProps: {} })
          .subscribe({
            next: (event) => {
              if (event.type === EventType.TEXT_MESSAGE_CONTENT && "delta" in event && typeof event.delta === "string") {
                const delta = event.delta; text += delta; writes = writes.then(() => onText(delta));
                void writes.catch(() => finish(Error("VOICE_OUTPUT_REJECTED")));
              } else if (event.type === EventType.RUN_ERROR) finish(Error("VOICE_FAST_FAILED"));
              else if (event.type === EventType.RUN_FINISHED) succeeded = true;
            },
            error: () => finish(Error("VOICE_FAST_FAILED")),
            complete: () => finish(succeeded ? undefined : Error("VOICE_FAST_INCOMPLETE")),
          }));
      if (ended) subscription.unsubscribe();
    });
  }
}
