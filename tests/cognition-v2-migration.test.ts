import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cognitionCardSchema } from '../packages/domain/src/cognition-card.ts';
import { migrateLegacyCard } from '../apps/server/src/engine/cognition/v2/legacy-adapter.ts';
const identity = { tenantId:'A',actorId:'alice',owner:'alice',policyRevision:'policy-1',purpose:'chat' as const };
const base = { id:'legacy-card',tenantId:'A',owner:'alice',turnId:'turn',thoughtId:'thought',kind:'insight',title:'Generated conclusion',body:'Possibly true',confidence:1,
  evidence:{thoughtIds:['thought']},attention:{primary:'thought:thought'},provenance:{source:'slow.llm',createdAt:'2026-11-15T00:00:00Z'} };
test('C01 migration corpus: knowledge survives prior delivery, lifecycle and privacy remain conservative',()=>{
  for(const status of ['proposed','consumed','expired','superseded'] as const) {
    for(const scope of ['thread','tenant'] as const) {
      const legacy=cognitionCardSchema.parse({...base,status,scope,version:2});
      const record=migrateLegacyCard(legacy,identity);
      assert.equal(record.lifecycle,status==='expired'||status==='superseded'?status:'active');
      assert.equal(record.visibility.scope,'private'); assert.equal(record.visibility.ownerActorId,'alice');
      assert.equal(record.epistemic,'unknown'); assert.equal(record.revision,2);
      assert.deepEqual(record.evidence,[{tenantId:'A',kind:'thought',id:'thought',revision:1}]);
      assert.deepEqual(migrateLegacyCard(legacy,identity),record);
    }
  }
});
test('C01 migration rejects scope substitution and malformed legacy data',()=>{
  const legacy=cognitionCardSchema.parse(base);
  for(const forged of [{...identity,tenantId:'B'},{...identity,owner:'bob'},{...identity,actorId:'bob'}]) {
    assert.throws(()=>migrateLegacyCard(legacy,forged),/MIGRATION_SCOPE_MISMATCH/);
  }
  assert.throws(()=>migrateLegacyCard({...legacy,unexpected:'permissions'} as typeof legacy,identity));
  assert.throws(()=>migrateLegacyCard({...legacy,confidence:2},identity));
  const longId=cognitionCardSchema.parse({...base,id:'x'.repeat(200)});
  assert.ok(migrateLegacyCard(longId,identity).id.length<=200);
  assert.notEqual(migrateLegacyCard(longId,identity).id,migrateLegacyCard(legacy,identity).id);
  assert.notEqual(migrateLegacyCard({...legacy,owner:'bob'},{...identity,actorId:'bob',owner:'bob'}).id,migrateLegacyCard(legacy,identity).id,'same legacy ID in one tenant must not collide across owners');
});
