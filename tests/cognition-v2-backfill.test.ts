import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createStore } from '../apps/server/src/db.ts';
import { cognitionCardSchema } from '../packages/domain/src/cognition-card.ts';
import { installCognitionV2,CognitiveProjectionStore,DurableEventSink } from '../apps/server/src/engine/cognition/v2/storage.ts';
import { ContextServingFacade } from '../apps/server/src/engine/cognition/v2/context.ts';
import { LegacyCardBackfill } from '../apps/server/src/engine/cognition/v2/legacy-backfill.ts';
import { CognitiveProjector } from '../apps/server/src/engine/cognition/v2/projector.ts';
const identity={tenantId:'A',actorId:'alice',owner:'alice',policyRevision:'1',purpose:'chat' as const};
const legacy=(id:string)=>cognitionCardSchema.parse({id,tenantId:'A',owner:'alice',turnId:'turn',thoughtId:'primary',kind:'decision',title:'Propuesta antigua',body:'No es una aprobación',status:'consumed',scope:'tenant',confidence:1,
 evidence:{thoughtIds:['secondary']},attention:{primary:'invoice:1'},provenance:{source:'slow.llm',model:'legacy-model',createdAt:'2026-11-15T00:00:00Z'},version:1});
const resolver={version:'synthetic-v1',resolve:async(ctx:typeof identity,ref:{kind:string;id:string})=>ref.kind==='thought'?{tenantId:ctx.tenantId,kind:'thought' as const,id:ref.id,revision:1}:null};
test('C01 preview blocks unresolved references and filters source tenant before pagination',async()=>{
 const db=await createStore();
 try{
  await installCognitionV2(db);const context=new ContextServingFacade(new CognitiveProjectionStore(db),{authorize:async()=>true});
  const card=legacy('a');card.evidence.entityRefs=[{kind:'entity',id:'invoice'}];await db.put('alice','cognition-cards',card);
  await db.put('alice','cognition-cards',{...legacy('b'),tenantId:'B'});
  const backfill=new LegacyCardBackfill(db,context,new DurableEventSink(db,db,new Set(['A'])),resolver);
  const plan=await backfill.prepare(identity,{key:'dry-run',limit:1});assert.equal(plan.ready,0);assert.equal(plan.blocked.length,1);assert.equal(plan.nextCursor,null);
  await assert.rejects(backfill.apply(identity,plan.id,plan.planDigest),/UNRESOLVED/);
  assert.equal((await context.projections.latest('A')).length,0);
  assert.equal((await db.get('alice','cognition-cards','a'))?.status,'consumed');
 }finally{await db.close();}
});
test('C01 staged backfill preserves metadata, primary/additional thoughts and knowledge; applies idempotently through journal',async()=>{
 const db=await createStore();
 try{
  await installCognitionV2(db);const context=new ContextServingFacade(new CognitiveProjectionStore(db),{authorize:async()=>true});
  await db.put('alice','cognition-cards',legacy('a'));await db.put('alice','cognition-cards',legacy('b'));
  const sink=new DurableEventSink(db,db,new Set(['A'])),backfill=new LegacyCardBackfill(db,context,sink,resolver);
  const first=await backfill.prepare(identity,{key:'first',limit:1});assert.equal(first.nextCursor,'a');assert.equal(first.ready,1);
  assert.deepEqual(await backfill.apply(identity,first.id,first.planDigest),{state:'journaled',count:1});
  assert.deepEqual(await backfill.apply(identity,first.id,first.planDigest),{state:'journaled',count:1});
  const next=await backfill.prepare(identity,{key:'next',afterId:first.nextCursor!,limit:1});await backfill.apply(identity,next.id,next.planDigest);
  assert.equal((await context.projections.latest('A')).length,0,'journal acceptance is not projection completion');
  await new CognitiveProjector(context.projections).tick('A');
  const cards=await context.projections.latest('A');assert.equal(cards.length,2);
  for(const card of cards){
   assert.equal(card.epistemic,'unknown');assert.equal(card.visibility.scope,'private');assert.equal(card.lifecycle,'active');
   assert.deepEqual(card.evidence.map(r=>r.id),['primary','secondary']);
   const [event]=await db.rawQuery('SELECT event_id FROM cognition_v2_events WHERE tenant=$1 AND event_id=$2',['A',card.sourceEventId]);assert.ok(event);
  }
  const receipts=await db.rawQuery<{data:{sourceMetadata:{scope:string;status:string;provenance:{model:string}}}}>('SELECT data FROM cognition_v2_import_receipts');
  assert.equal(receipts.length,2);assert.equal(receipts[0].data.sourceMetadata.scope,'tenant');assert.equal(receipts[0].data.sourceMetadata.status,'consumed');assert.equal(receipts[0].data.sourceMetadata.provenance.model,'legacy-model');
  await assert.rejects(backfill.apply({...identity,tenantId:'B'},first.id,first.planDigest),/DENIED/);
  await db.put('alice','cognition-cards',{...legacy('a'),body:'Changed without revision'});
  const changed=await backfill.prepare(identity,{key:'changed',limit:1});
  await assert.rejects(backfill.apply(identity,changed.id,changed.planDigest),/REVISION_CONFLICT/);
 }finally{await db.close();}
});
test('C01 backfill rejects changed/expired plans and rolls back journal, receipts and plan state on a crash',async()=>{
 const db=await createStore();let now=Date.now();
 try{
  await installCognitionV2(db);const context=new ContextServingFacade(new CognitiveProjectionStore(db),{authorize:async()=>true});
  await db.put('alice','cognition-cards',legacy('a'));await db.put('alice','cognition-cards',legacy('b'));
  let count=0;const sink=new class extends DurableEventSink{override async write(event:Parameters<DurableEventSink['write']>[0]){await super.write(event);if(++count===2)throw Error('synthetic crash');}}(db,db,new Set(['A']));
  const backfill=new LegacyCardBackfill(db,context,sink,resolver,()=>now);
  const foreign=await createStore();
  try{assert.throws(()=>new LegacyCardBackfill(db,context,new DurableEventSink(db,foreign,new Set(['A'])),resolver),/SAME_TRANSACTION_STORE/);}
  finally{await foreign.close();}
  const plan=await backfill.prepare(identity,{key:'crash'});
  await assert.rejects(backfill.apply(identity,plan.id,plan.planDigest),/synthetic crash/);
  assert.equal((await db.rawQuery('SELECT * FROM cognition_v2_events')).length,0);
  assert.equal((await db.rawQuery('SELECT * FROM cognition_v2_import_receipts')).length,0);
  const [state]=await db.rawQuery<{state:string}>('SELECT state FROM cognition_v2_import_plans WHERE id=$1',[plan.id]);assert.equal(state.state,'prepared');
  now+=3600001;await assert.rejects(backfill.apply(identity,plan.id,plan.planDigest),/EXPIRED/);
  const stale=await backfill.prepare(identity,{key:'stale',limit:1});
  await db.put('alice','cognition-cards',{...legacy('a'),body:'Modified'});
  await assert.rejects(backfill.apply(identity,stale.id,stale.planDigest),/SOURCE_CHANGED/);
  await assert.rejects(backfill.prepare(identity,{key:'stale',limit:1}),/KEY_CONFLICT/);
 }finally{await db.close();}
});
const postgres=process.env.COGNITION_TEST_POSTGRES_URL;
test('C01 native concurrent backfill journals one import across two connections',{skip:!postgres},async()=>{
 const db=await createStore({databaseUrl:postgres}),other=await createStore({databaseUrl:postgres});
 const actor={...identity,tenantId:`backfill-${crypto.randomUUID()}`};
 try{
  await installCognitionV2(db);const source={...legacy(`legacy-${crypto.randomUUID()}`),tenantId:actor.tenantId};await db.put(actor.owner,'cognition-cards',source);
  const policy={authorize:async()=>true};
  const context=new ContextServingFacade(new CognitiveProjectionStore(db),policy),rivalContext=new ContextServingFacade(new CognitiveProjectionStore(other),policy);
  const one=new LegacyCardBackfill(db,context,new DurableEventSink(db,db,new Set([actor.tenantId])),resolver);
  const two=new LegacyCardBackfill(other,rivalContext,new DurableEventSink(other,other,new Set([actor.tenantId])),resolver);
  const plan=await one.prepare(actor,{key:'native'});
  await Promise.all([one.apply(actor,plan.id,plan.planDigest),two.apply(actor,plan.id,plan.planDigest)]);
  const [events]=await db.rawQuery<{count:string}>('SELECT count(*) AS count FROM cognition_v2_events WHERE tenant=$1',[actor.tenantId]);
  const [receipts]=await db.rawQuery<{count:string}>('SELECT count(*) AS count FROM cognition_v2_import_receipts WHERE tenant=$1',[actor.tenantId]);
  assert.equal(Number(events.count),1);assert.equal(Number(receipts.count),1);
 }finally{await db.close();await other.close();}
});
test('C01 backfill rejects stored plan tampering and evidence revoked after preview',async()=>{
 const db=await createStore();
 try{
  await installCognitionV2(db);const context=new ContextServingFacade(new CognitiveProjectionStore(db),{authorize:async()=>true});
  await db.put('alice','cognition-cards',legacy('a'));
  const backfill=new LegacyCardBackfill(db,context,new DurableEventSink(db,db,new Set(['A'])),resolver);
  const corrupt=await backfill.prepare(identity,{key:'corrupt'});
  const changedResolver=new LegacyCardBackfill(db,context,new DurableEventSink(db,db,new Set(['A'])),{...resolver,version:'changed-version'});
  await assert.rejects(changedResolver.apply(identity,corrupt.id,corrupt.planDigest),/VERSION_UNSUPPORTED/);
  const [row]=await db.rawQuery<{data:{entries:{record:{body:string}}[]}}>('SELECT data FROM cognition_v2_import_plans WHERE id=$1',[corrupt.id]);
  row.data.entries[0].record.body='Changed after preparation';
  await db.rawQuery('UPDATE cognition_v2_import_plans SET data=$2::jsonb WHERE id=$1',[corrupt.id,JSON.stringify(row.data)]);
  await assert.rejects(backfill.apply(identity,corrupt.id,corrupt.planDigest),/CORRUPTED/);
  const revoked=await backfill.prepare(identity,{key:'revoked'});await context.projections.revoke('A','primary');
  await assert.rejects(backfill.apply(identity,revoked.id,revoked.planDigest),/EVIDENCE_CHANGED/);
  const again=await backfill.prepare(identity,{key:'after-revocation'});assert.equal(again.canApply,false);
  assert.equal((await db.rawQuery('SELECT * FROM cognition_v2_import_receipts')).length,0);
 }finally{await db.close();}
});
