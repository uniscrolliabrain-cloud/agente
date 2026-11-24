import assert from "node:assert/strict";
import { test } from "node:test";
import {
  DAY_END,
  DAY_START,
  PRESENT,
  initialState,
  reducer,
  selectionActivities,
  visibleActivities,
  validActivity,
  position,
  packIntervals,
  timeLabel,
} from "../apps/web/src/workspaces/business-command-studio/model.ts";

test("all demo fixtures have valid intervals and resolvable dependencies", () => {
  const state = initialState();
  assert.equal(new Set(state.activities.map((a) => a.id)).size, state.activities.length);
  for (const item of state.activities) {
    assert.ok(validActivity(item), item.id);
    if (item.dependsOn) assert.ok(state.activities.some((a) => a.id === item.dependsOn));
  }
});
test("actor, project and client selections use the same activity identities", () => {
  const state = initialState();
  const actor = reducer(state, { type: "select", selection: { kind: "actor", id: "laia" } });
  assert.deepEqual(
    selectionActivities(actor).map((a) => a.id),
    state.activities.filter((a) => a.actor === "laia").map((a) => a.id),
  );
  const client = reducer(state, { type: "select", selection: { kind: "client", id: "Estudio Norte" } });
  assert.deepEqual(
    selectionActivities(client).map((a) => a.id),
    state.activities.filter((a) => a.project === "campaign").map((a) => a.id),
  );
});
test("selection outside filtered scope reveals the selected activity", () => {
  let state = reducer(initialState(), { type: "scope", scope: "pilar" });
  assert.ok(visibleActivities(state).every((a) => a.actor === "pilar"));
  state = reducer(state, { type: "select", selection: { kind: "activity", id: "demo-budget" } });
  assert.ok(visibleActivities(state).some((a) => a.id === "demo-budget"));
});
test("clock clamps, pauses on seek, and playback ends without changing domain state", () => {
  const initial = initialState();
  let state = reducer(initial, { type: "clock", clock: DAY_END - 1 });
  state = reducer(state, { type: "play" });
  state = reducer(state, { type: "tick" });
  assert.equal(state.clock, DAY_END);
  assert.equal(state.playing, false);
  assert.deepEqual(state.activities, initial.activities);
  assert.equal(reducer(state, { type: "clock", clock: -10 }).clock, DAY_START);
  assert.equal(reducer(state, { type: "clock", clock: NaN }), state);
  assert.equal(reducer(state, { type: "present" }).clock, PRESENT);
  assert.equal(position(DAY_START), 0);
  assert.equal(position(DAY_END), 100);
  assert.equal(timeLabel(PRESENT), "11:00");
});
test("observer cannot create, edit, or approve even if a save action is dispatched", () => {
  const state = reducer(initialState(), { type: "editing", value: false });
  assert.equal(reducer(state, { type: "save", activity: { ...state.activities[0], stage: "Completado" } }), state);
  assert.equal(reducer(state, { type: "save", activity: { ...state.activities[0], id: "demo-new" } }), state);
});
test("save updates one record used by every view; reset restores pristine fixture", () => {
  const original = initialState();
  const item = { ...original.activities[0], actor: "pilar", stage: "Revisión" as const, start: 800, end: 900 };
  const state = reducer(original, { type: "save", activity: item });
  assert.equal(state.activities.length, original.activities.length);
  assert.equal(selectionActivities(state)[0].actor, "pilar");
  assert.equal(state.revision, 1);
  assert.deepEqual(reducer(state, { type: "reset" }), original);
});
test("invalid duration, unknown actor and real record ids cannot be saved", () => {
  const state = initialState();
  for (const patch of [
    { start: 850, end: 840 },
    { actor: "real-user-id" },
    { id: "task:production" },
    { title: "  " },
    { end: DAY_END + 1 },
  ]) {
    assert.equal(reducer(state, { type: "save", activity: { ...state.activities[0], ...patch } }), state);
  }
});

test("overlapping activities get sublanes while adjacent intervals reuse a lane", () => {
  const result = packIntervals([
    { start: 600, end: 690 },
    { start: 610, end: 660 },
    { start: 660, end: 700 },
    { start: 700, end: 720 },
  ]);
  assert.equal(result.tracks, 2);
  for (const a of result.blocks)
    for (const b of result.blocks) {
      if (a !== b && a.track === b.track) assert.ok(a.item.end <= b.item.start || b.item.end <= a.item.start);
    }
});
