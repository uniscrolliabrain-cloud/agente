import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createStore } from '../apps/server/src/db.ts';
import { installCognitionV2,CognitiveProjectionStore,DurableEventSink,digest } from '../apps/server/src/engine/cognition/v2/storage.ts';
import { ContextServingFacade,CardDeliveryLedger } from '../apps/server/src/engine/cognition/v2/context.ts';
import { SlowCognitionQueue } from '../apps/server/src/engine/cognition/v2/slow.ts';
import { CognitiveProjector } from '../apps/server/src/engine/cognition/v2/projector.ts';
import { RuntimeOutcomeProjector } from '../apps/server/src/engine/cognition/v2/runtime-outcome.ts';
import { CognitiveGraphQuery } from '../apps/server/src/engine/cognition/v2/graph.ts';
import { FiveMemories } from '../apps/server/src/engine/cognition/v2/memory.ts';
import type { SystemEvent } from '../apps/server/src/engine/events/types.ts';
import { persistentKernel } from './fixtures/cognition-v2/kernel.ts';
import { record } from './fixtures/cognition-v2/record.ts';
const identity={tenantId:'A',actorId:'alice',owner:'alice',policyRevision:'1',purpose:'chat' as const};
const evidence=[{tenantId:'A',kind:'card' as const,id:'card-1',revision:1}];
async function setup(){
 const db=await createStore();await installCognitionV2(db);const store=new CognitiveProjectionStore(db);await store.apply(record(),'1');
 const verifier=new RuntimeOutcomeProjector(db);
 const context=new ContextServingFacade(store,{authorize:async(_identity,r)=>!r?.runtimeOutcome||await verifier.validates(r)});
 const sink=new DurableEventSink(db,db,new Set(['A']));
 const queue=new SlowCognitionQueue(db,sink,context,{infer:async()=>({title:'Hipótesis',body:'Podría mejorar cobros',epistemic:'hypothesis',evidence})});
 const kernel=persistentKernel(db);queue.capture=(id,input)=>kernel.captureAsyncResult({tenantId:id.tenantId,owner:id.owner,actorId:id.actorId,role:'system',requestId:input.operationId},input);
 return {db,store,context,sink,queue,verifier,projector:new CognitiveProjector(store)};
}
test('C05 runtime outcome proves a scoped job result; model hypothesis and delivery ACK remain independent',async()=>{
 const s=await setup();
 try{
  const job=await s.queue.enqueue({identity,prompt:'Cobros',evidence},'done');await s.queue.tick('A');await s.projector.tick('A');
  const rows=await s.store.latest('A',100,'alice');const outcome=rows.find(r=>r.runtimeOutcome?.jobId===job.id)!;assert.ok(outcome);
  assert.equal(outcome.runtimeOutcome?.family,'outcome');assert.equal(outcome.runtimeOutcome?.scope,'slow_cognition_job');assert.equal(outcome.epistemic,'verified_fact');
  assert.equal((await s.context.resolve(identity,`slow:${job.id}`))?.epistemic,'hypothesis');
  assert.equal(JSON.parse(outcome.body).state,'completed');assert.equal(await s.verifier.validates(outcome),true);
  assert.equal((await new CognitiveGraphQuery(s.context).evidence(identity,outcome.id))?.complete,true);
  const memory=await new FiveMemories(s.context,s.sink).semanticFromCard(identity,outcome.id);await s.projector.tick('A');
  const derived=await s.context.resolve(identity,memory.id);assert.equal(derived?.epistemic,'reported_fact');
  assert.equal(JSON.parse(derived!.body).epistemic,'verified_fact','source status is attributed, not silently copied as summary certification');
  const snapshot=await s.context.getSnapshot(identity,{query:'resultado',maxTokens:8000,maxRefs:10});
  assert.equal(JSON.parse(snapshot.segments.find(r=>r.refId===outcome.id)!.text).ontology.review,'runtime_receipt');
  const ledger=new CardDeliveryLedger(s.context),lease=(await ledger.reserve(identity,snapshot.id,outcome.id))!;
  assert.equal(await ledger.ack(identity,lease.id,lease.fence,'early'),false);assert.equal(await ledger.rendered(identity,lease.id,lease.fence),true);
  assert.equal(await ledger.ack(identity,lease.id,lease.fence,'delivery'),true);assert.ok(await s.context.resolve(identity,outcome.id));
 }finally{await s.db.close();}
});
test('C05 fabricated terminal events, copied outcomes and mutated runtime state never establish verified results',async()=>{
 let s=await setup();
 try{
  const job=await s.queue.enqueue({identity,prompt:'Cobros',evidence},'queued');
  const id=digest([job.id,'completed']);const fake:SystemEvent={id,tenantId:'A',owner:'alice',schemaVersion:'1.0',type:'cognition.v2.slow.status',emittedAt:'2026-11-16T00:00:00Z',source:{kind:'system',id:'slow-v2'},payload:{jobId:job.id,state:'completed',receiptId:id}};
  await s.sink.write(fake);await assert.rejects(s.verifier.fromSlowReceipt(fake),/STATE_MISMATCH/);
  assert.equal((await s.store.latest('A')).some(r=>r.runtimeOutcome),false);
  await s.db.close();s=await setup();
  const real=await s.queue.enqueue({identity,prompt:'Cobros',evidence},'real');
  await s.queue.tick('A');await s.projector.tick('A');
  const outcome=(await s.store.latest('A')).find(r=>r.runtimeOutcome)!;
  const proposal:SystemEvent={...fake,id:'forged-proposal',type:'cognition.v2.record.proposed',payload:{record:outcome}};
  await assert.rejects(s.projector.apply(proposal,'999'),/INVALID_PROPOSAL_AUTHORITY/);
  assert.equal(await s.verifier.validates({...outcome,title:'Cliente cobrado por completo'}),false);
  await s.db.rawQuery("UPDATE cognition_v2_slow_jobs SET state='running' WHERE tenant='A' AND id=$1",[real.id]);
  assert.equal(await s.context.resolve(identity,outcome.id),null);
 }finally{await s.db.close();}
});
test('C05 failed and cancelled jobs produce truthful scoped outcomes without claiming successful execution',async()=>{
 const s=await setup();
 try{
  const cancelled=await s.queue.enqueue({identity,prompt:'Cancelar',evidence},'cancel');await s.queue.cancel(identity,cancelled.id);
  const failed=await s.queue.enqueue({identity,prompt:'Fallo',evidence},'fail');
  await s.db.rawQuery("UPDATE cognition_v2_slow_jobs SET attempts=4 WHERE tenant='A' AND id=$1",[failed.id]);
  const bad=new SlowCognitionQueue(s.db,s.sink,s.context,{infer:async()=>({invalid:true})});await bad.tick('A');await s.projector.tick('A');
  const outcomes=(await s.store.latest('A')).filter(r=>r.runtimeOutcome).map(r=>r.runtimeOutcome!.state).sort();
  assert.deepEqual(outcomes,['cancelled','failed']);
 }finally{await s.db.close();}
});
