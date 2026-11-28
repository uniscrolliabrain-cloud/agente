// Node 22: node --experimental-strip-types --test apps/ui-lab/scripts/test-command-center-motion.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { advanceSpring, springSettled } from "../src/command-center-editorial/motion-spring.ts";
const initial = {position: 0, velocity: 0};
const near = (a,b) => assert.ok(Math.abs(a-b) < 1e-9, `${a} != ${b}`);
test("critically damped entry remains monotone and approaches target", () => {
  let state = initial;
  for (let i=0;i<120;i++) {
    const next=advanceSpring(state,1,1/120,23);
    assert.ok(next.position >= state.position && next.position <= 1);
    state=next;
  }
  assert.ok(springSettled(state,1));
});
test("frame-rate invariance of analytic solution", () => {
  const a=advanceSpring(initial,1,.2,23);
  let b=initial;
  for(let i=0;i<12;i++) b=advanceSpring(b,1,1/60,23);
  near(a.position,b.position); near(a.velocity,b.velocity);
});
test("reverse target preserves position and velocity at interruption", () => {
  const state=advanceSpring(initial,1,.05,23);
  assert.deepEqual(advanceSpring(state,0,0,23),state);
  const next=advanceSpring(state,0,.000001,23);
  assert.ok(Math.abs(next.velocity-state.velocity)<.001);
  assert.ok(springSettled(advanceSpring(state,0,1,23),0));
});
test("settled state is invariant", () => {
  assert.deepEqual(advanceSpring({position:1,velocity:0},1,1,23),{position:1,velocity:0});
});
