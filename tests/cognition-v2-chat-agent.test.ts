import assert from "node:assert/strict";
import { test } from "node:test";
import { of } from "rxjs";
import { EventType, type RunAgentInput } from "@ag-ui/core";
import { CognitionV2ChatAgent } from "../apps/server/src/engine/cognition/v2/chat-agent.ts";
import type { CognitionV2Runtime } from "../apps/server/src/engine/cognition/v2/runtime.ts";

test("C06 opted-in AG-UI adapter delegates only to Cognition V2 with the scoped owner", async () => {
  const seen: { owner: string; input: RunAgentInput }[] = [];
  const input = { threadId: "thread-a", runId: "run-a", messages: [], state: {}, tools: [], context: [], forwardedProps: {} } as RunAgentInput;
  const runtime = {
    chat(owner: string, received: RunAgentInput) {
      seen.push({ owner, input: received });
      return of({ type: EventType.RUN_FINISHED, threadId: received.threadId, runId: received.runId });
    },
  } as unknown as CognitionV2Runtime;
  const agent = new CognitionV2ChatAgent(runtime, "tenant-a:alice");
  const events: unknown[] = [];
  await new Promise<void>((resolve, reject) => agent.run(input).subscribe({
    next: event => events.push(event), error: reject, complete: resolve,
  }));
  assert.deepEqual(seen, [{ owner: "tenant-a:alice", input }]);
  assert.deepEqual(events, [{ type: EventType.RUN_FINISHED, threadId: "thread-a", runId: "run-a" }]);
});
