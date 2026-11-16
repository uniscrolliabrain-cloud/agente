import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createStore } from '../apps/server/src/db.ts';
import { installCognitionV2,CognitiveProjectionStore } from '../apps/server/src/engine/cognition/v2/storage.ts';
import { ContextServingFacade } from '../apps/server/src/engine/cognition/v2/context.ts';
import { record } from './fixtures/cognition-v2/record.ts';
const identity={tenantId:'A',actorId:'alice',owner:'alice',policyRevision:'1',purpose:'chat' as const};
test('C10 prepared context is bound to query, policy and watermark rather than reusing an unrelated recent snapshot',async()=>{
 const db=await createStore();
 try{
  await installCognitionV2(db);const store=new CognitiveProjectionStore(db);
  await store.apply({...record('A','alice','alpha'),body:'alpha alpha'},'1');
  await store.apply({...record('A','alice','beta'),body:'beta beta'},'2');
  const context=new ContextServingFacade(store,{authorize:async()=>true});
  const first=await context.prepared(identity,'alpha',4000,1);assert.equal(first.refs[0].id,'alpha');
  assert.equal((await context.prepared(identity,'alpha',4000,1)).id,first.id);
  const second=await context.prepared(identity,'beta',4000,1);assert.equal(second.refs[0].id,'beta');assert.notEqual(second.id,first.id);
  for(let i=0;i<6;i++)await context.getSnapshot(identity,{query:`other-${i}`,maxTokens:4000,maxRefs:1});
  assert.equal((await context.prepared(identity,'alpha',4000,1)).id,first.id,'unrelated snapshots must not crowd a matching cache entry out');
  await store.revoke('A','alpha');
  const refreshed=await context.prepared(identity,'alpha',4000,1);assert.notEqual(refreshed.id,first.id);
  assert.equal(refreshed.refs.some(r=>r.id==='alpha'),false);
  const privateSnapshot=await context.prepared({...identity,actorId:'bob',owner:'bob'},'alpha',4000,1);
  assert.equal(privateSnapshot.refs.length,0);
 }finally{await db.close();}
});
