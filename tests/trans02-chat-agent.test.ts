import assert from "node:assert/strict";
import { test } from "node:test";
import { of } from "rxjs";
import { EventType, type RunAgentInput } from "@ag-ui/core";
import { CognitionV2ChatAgent } from "../apps/server/src/engine/cognition/v2/chat-agent.ts";

test("C06 opted-in AG-UI adapter delegates only to Cognition V2 with the scoped owner", async () => {
  const seen: { owner: string; input: RunAgentInput }[] = [];
  const input = { threadId: "thread-a", runId: "run-a", messages: [], state: {}, tools: [], context: [], forwardedProps: {} } as RunAgentInput;
  const runtime = {
    chat(owner: string, received: RunAgentInput) {
      seen.push({ owner, input: received });
      return of({ type: EventType.RUN_FINISHED, threadId: received.threadId, runId: received.runId });
    },
  };
  const agent = new CognitionV2ChatAgent(runtime, "tenant-a:alice");
  const events: unknown[] = [];
  await new Promise<void>((resolve, reject) => agent.run(input).subscribe({
    next: event => events.push(event), error: reject, complete: resolve,
  }));
  assert.deepEqual(seen, [{ owner: "tenant-a:alice", input }]);
  assert.deepEqual(events, [{ type: EventType.RUN_FINISHED, threadId: "thread-a", runId: "run-a" }]);
});

test("C06 CopilotKit callback dispatch preserves V2 runtime after run is extracted", async () => {
  const calls: string[] = [];
  const runtime = {
    chat(owner: string, input: RunAgentInput) {
      calls.push(owner);
      return of({ type: EventType.RUN_FINISHED, threadId: input.threadId, runId: input.runId });
    },
  };
  const adapter = new CognitionV2ChatAgent(runtime, "alice");
  const extractedRun = adapter.run;
  const input = { threadId: "thread-1", runId: "run-1", messages: [], state: {}, tools: [], context: [], forwardedProps: {} } as RunAgentInput;
  await new Promise<void>((resolve, reject) =>
    extractedRun(input).subscribe({ error: reject, complete: resolve }));
  assert.deepEqual(calls, ["alice"]);
});

test("C06 CopilotKit per-request clone retains scoped cognition runtime and owner", async () => {
  const calls: string[] = [];
  const runtime = {
    chat(owner: string, input: RunAgentInput) {
      calls.push(owner);
      return of({ type: EventType.RUN_FINISHED, threadId: input.threadId, runId: input.runId });
    },
  };
  const original = new CognitionV2ChatAgent(runtime, "tenant-a:alice");
  const copied = original.clone();
  assert.notEqual(copied, original);
  const input = { threadId: "clone-thread", runId: "clone-run", messages: [], state: {}, tools: [], context: [], forwardedProps: {} } as RunAgentInput;
  const runFromClone = copied.run;
  await new Promise<void>((resolve, reject) => runFromClone(input).subscribe({
    error: reject, complete: resolve,
  }));
  assert.deepEqual(calls, ["tenant-a:alice"]);
});

test("C06 independently cloned agents never switch the authorized owner", async () => {
  const seen: string[] = [];
  const runtime = {
    chat(owner: string, input: RunAgentInput) {
      seen.push(owner);
      return of({ type: EventType.RUN_FINISHED, threadId: input.threadId, runId: input.runId });
    },
  };
  const first = new CognitionV2ChatAgent(runtime, "tenant-a:alice").clone();
  const second = new CognitionV2ChatAgent(runtime, "tenant-b:bob").clone();
  const input = { threadId: "thread", runId: "run", messages: [], state: {}, tools: [], context: [], forwardedProps: {} } as RunAgentInput;
  await Promise.all([first, second].map(agent => new Promise<void>((resolve, reject) =>
    agent.run(input).subscribe({ error: reject, complete: resolve }))));
  assert.deepEqual(seen, ["tenant-a:alice", "tenant-b:bob"]);
});
