import assert from "node:assert/strict";
import { test } from "node:test";
import { toolsReducer, type ToolCall } from "../apps/web/src/lib/toolsReducer.ts";

test("RUN_STARTED resetea la lista", () => {
  const state: ToolCall[] = [
    { id: "1", name: "x", status: "done", startedAt: 1, endedAt: 2 },
  ];
  assert.deepEqual(toolsReducer(state, { type: "RUN_STARTED" }), []);
});

test("TOOL_CALL_START anade con status running", () => {
  const next = toolsReducer([], { type: "TOOL_CALL_START", id: "1", name: "x", at: 100 });
  assert.equal(next.length, 1);
  assert.equal(next[0].status, "running");
  assert.equal(next[0].name, "x");
});

test("TOOL_CALL_START duplicado no anade dos veces", () => {
  const s1 = toolsReducer([], { type: "TOOL_CALL_START", id: "1", name: "x", at: 100 });
  const s2 = toolsReducer(s1, { type: "TOOL_CALL_START", id: "1", name: "x", at: 200 });
  assert.equal(s2.length, 1);
});

test("TOOL_CALL_END marca done", () => {
  const s1 = toolsReducer([], { type: "TOOL_CALL_START", id: "1", name: "x", at: 100 });
  const s2 = toolsReducer(s1, { type: "TOOL_CALL_END", id: "1", at: 200 });
  assert.equal(s2[0].status, "done");
  assert.equal(s2[0].endedAt, 200);
});

test("TOOL_CALL_END con error marca error", () => {
  const s1 = toolsReducer([], { type: "TOOL_CALL_START", id: "1", name: "x", at: 100 });
  const s2 = toolsReducer(s1, { type: "TOOL_CALL_END", id: "1", at: 200, error: true });
  assert.equal(s2[0].status, "error");
});

test("TOOL_CALL_END de id desconocido no cambia", () => {
  const s1 = toolsReducer([], { type: "TOOL_CALL_START", id: "1", name: "x", at: 100 });
  const s2 = toolsReducer(s1, { type: "TOOL_CALL_END", id: "999", at: 200 });
  assert.deepEqual(s2, s1);
});