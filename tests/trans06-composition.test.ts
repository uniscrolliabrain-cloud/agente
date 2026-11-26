import assert from "node:assert/strict";
import { test } from "node:test";
import { boundedReach, coverage, exactOrganizationalRefKey } from "../packages/domain/src/organizational-primitives.ts";
const key = (id: string, tenantId = "a") => exactOrganizationalRefKey({ tenantId, kind: "card", id, revision: 1 });
const [a, b, c, d] = ["a", "b", "c", "d"].map((id) => key(id));
const graph = new Map([
  [a, [b, c]],
  [b, [d]],
  [c, [d]],
  [d, [a]],
]);
const full = { depth: 3, nodes: 50, edges: 100 };

test("authorized diamond and cycle are traversed once with explicit bounds", () => {
  const result = boundedReach(a, graph, full);
  assert.deepEqual(result.refs, [a, b, c, d]);
  assert.equal(result.examined, 5);
  assert.equal(result.truncated, false);
  assert.equal(result.depthLimited, false);
  const depth = boundedReach(a, graph, { ...full, depth: 0 });
  assert.deepEqual(depth.refs, [a]);
  assert.equal(depth.depthLimited, true);
  assert.equal(boundedReach(a, graph, { ...full, nodes: 2 }).truncated, true);
  assert.equal(boundedReach(a, graph, { ...full, edges: 1 }).truncated, true);
});

test("materialized adjacency rejects foreign, missing, unordered and duplicate endpoints", () => {
  assert.throws(
    () =>
      boundedReach(
        a,
        new Map([
          [a, [key("foreign", "b")]],
          [key("foreign", "b"), []],
        ]),
        full,
      ),
    /UNAUTHORIZED|ADJACENCY/,
  );
  assert.throws(() => boundedReach(a, new Map([[a, [b]]]), full), /ENDPOINT/);
  assert.throws(
    () =>
      boundedReach(
        a,
        new Map([
          [a, [c, b]],
          [b, []],
          [c, []],
        ]),
        full,
      ),
    /UNORDERED/,
  );
  assert.throws(
    () =>
      boundedReach(
        a,
        new Map([
          [a, [b, b]],
          [b, []],
        ]),
        full,
      ),
    /DUPLICATE/,
  );
  assert.throws(() => boundedReach(a, graph, { ...full, depth: 4 }));
});

test("zero-denominator coverage remains unknown and duplicate oracle refs fail", () => {
  assert.deepEqual(coverage([], []), { hit: 0, total: 0, ratio: null });
  assert.deepEqual(coverage([a, b], [b]), { hit: 1, total: 2, ratio: 0.5 });
  assert.throws(() => coverage([a, a], [a]), /DUPLICATE/);
});
