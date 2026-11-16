import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createStore } from '../apps/server/src/db.ts';
import { installCognitionV2, CognitiveProjectionStore } from '../apps/server/src/engine/cognition/v2/storage.ts';
import { ContextServingFacade, CardDeliveryLedger } from '../apps/server/src/engine/cognition/v2/context.ts';
import { DeliveryRecoveryWorker } from '../apps/server/src/engine/cognition/v2/delivery-recovery.ts';
import { record } from './fixtures/cognition-v2/record.ts';
import type { CognitiveIdentity } from '../packages/domain/src/cognition-v2.ts';
const alice: CognitiveIdentity={tenantId:'A',actorId:'alice',owner:'alice',policyRevision:'1',purpose:'chat'};
test('C09 recovery fences abandoned deliveries, preserves purpose and knowledge, never synthesizes ACK',async()=>{
 const db=await createStore(); let now=Date.parse('2026-11-16T00:00:00Z');
 try {
  await installCognitionV2(db); const store=new CognitiveProjectionStore(db);
  await store.apply(record(),'1');
  const context=new ContextServingFacade(store,{authorize:async()=>true},()=>now);
  const ledger=new CardDeliveryLedger(context,()=>now);
  const task={...alice,purpose:'task' as const};
  const snapshot=await context.getSnapshot(task,{query:'',maxTokens:4000,maxRefs:10});
  const lease=(await ledger.reserve(task,snapshot.id,'card-1',1000))!;
  assert.equal(await ledger.rendered(task,lease.id,lease.fence),true);
  now+=1001;
  assert.equal(await ledger.recover(alice),1);
  assert.equal(await ledger.ack(task,lease.id,lease.fence,'stale'),false);
  const fresh=(await ledger.reserve(task,snapshot.id,'card-1',1000))!;
  assert.ok(fresh.fence>lease.fence);
  assert.equal(await ledger.ack(task,fresh.id,fresh.fence,'premature'),false);
  assert.equal(await ledger.rendered(task,fresh.id,fresh.fence),true);
  assert.equal(await ledger.ack(task,fresh.id,fresh.fence,'actual-receipt'),true);
  now+=2000; assert.equal(await ledger.recover(alice),0);
  assert.ok(await context.resolve(alice,'card-1'));
  const [audit]=await db.rawQuery<{data:{state:string}}>('SELECT data FROM cognition_v2_delivery_recoveries');
  assert.equal(audit.data.state,'pending');
  await assert.rejects(ledger.reserve(task,snapshot.id,'card-1',NaN),/INVALID_DELIVERY_LEASE/);
 } finally {await db.close();}
});
test('C09 worker persists scan progress across restart, isolates actors and invalidates expired snapshots',async()=>{
 const db=await createStore();let now=Date.parse('2026-11-16T00:00:00Z');
 try {
  await installCognitionV2(db);const store=new CognitiveProjectionStore(db);
  const context=new ContextServingFacade(store,{authorize:async()=>true},()=>now),ledger=new CardDeliveryLedger(context,()=>now);
  for(const actor of ['alice','bob']) {
   await store.apply(record('A',actor,actor),'1');const identity={...alice,actorId:actor,owner:actor};
   const snapshot=await context.getSnapshot(identity,{query:'',maxTokens:4000,maxRefs:10});
   await ledger.reserve(identity,snapshot.id,actor,1000);
  }
  now+=61000;
  const authorize=async(tenant:string,actor:string)=>actor==='alice'?null:{...alice,tenantId:tenant,actorId:actor,owner:actor};
  assert.equal(await new DeliveryRecoveryWorker(ledger,new Set(['A']),authorize,()=>now).tick('A',1),0);
  const restarted=new DeliveryRecoveryWorker(ledger,new Set(['A']),authorize,()=>now);
  assert.equal(await restarted.tick('A',1),1);
  const rows=await db.rawQuery<{actor:string;status:string}>('SELECT actor,status FROM cognition_v2_deliveries ORDER BY actor');
  assert.deepEqual(rows,[{actor:'alice',status:'leased'},{actor:'bob',status:'invalidated'}]);
  await assert.rejects(restarted.tick('B'),/DENIED/);
  assert.equal(await restarted.tick('A',1),0);
 }finally{await db.close();}
});
const postgres=process.env.COGNITION_TEST_POSTGRES_URL;
test('C09 native Postgres workers reconcile one expired lease once under concurrent connections',{skip:!postgres},async()=>{
 const db=await createStore({databaseUrl:postgres}),other=await createStore({databaseUrl:postgres});
 const tenant=`recovery-${crypto.randomUUID()}`;let now=Date.parse('2026-11-16T00:00:00Z');
 try{
  await installCognitionV2(db);const identity={...alice,tenantId:tenant};
  const store=new CognitiveProjectionStore(db);await store.apply(record(tenant,'alice'),'1');
  const policy={authorize:async()=>true};
  const context=new ContextServingFacade(store,policy,()=>now),ledger=new CardDeliveryLedger(context,()=>now);
  const rival=new CardDeliveryLedger(new ContextServingFacade(new CognitiveProjectionStore(other),policy,()=>now),()=>now);
  const snapshot=await context.getSnapshot(identity,{query:'',maxTokens:4000,maxRefs:10});
  const lease=(await ledger.reserve(identity,snapshot.id,'card-1',1000))!;now+=1001;
  const counts=await Promise.all([ledger.recover(identity),rival.recover(identity)]);
  assert.equal(counts.reduce((a,b)=>a+b,0),1);
  const [audit]=await db.rawQuery<{count:string}>('SELECT count(*) AS count FROM cognition_v2_delivery_recoveries WHERE tenant=$1',[tenant]);
  assert.equal(Number(audit.count),1);assert.equal(await ledger.ack(identity,lease.id,lease.fence,'stale'),false);
 }finally{await db.close();await other.close();}
});
