import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createStore,type Store } from '../apps/server/src/db.ts';
import { installCognitionV2,CognitiveProjectionStore,digest } from '../apps/server/src/engine/cognition/v2/storage.ts';
import { ContextServingFacade } from '../apps/server/src/engine/cognition/v2/context.ts';
import { DurableJevEgressGate,type JevEgressPolicy } from '../apps/server/src/engine/cognition/v2/jev-egress.ts';
import { TypesafeJevClassifier } from '../apps/server/src/engine/cognition/v2/jev-classifier.ts';
import type { SemanticEvaluationContext } from '../apps/server/src/engine/cognition/v2/slow.ts';
import { record } from './fixtures/cognition-v2/record.ts';
const target={provider:'typesafe',model:'jev-1.14.0',ontologyId:'agntiapro.cards',ontologyVersion:'1.0.0'} as const;
async function fixture(db:Store,tenant='A'){
 await installCognitionV2(db);const store=new CognitiveProjectionStore(db);await store.apply(record(tenant),'1');
 let now=Date.parse('2026-11-16T00:00:00Z'),allowed=true,policyRevision='consent-1';
 const context=new ContextServingFacade(store,{authorize:async i=>allowed&&i.tenantId===tenant&&i.actorId==='alice'},()=>now);
 const scope:SemanticEvaluationContext={identity:{tenantId:tenant,actorId:'alice',owner:'alice',purpose:'task',policyRevision:'1'},operationId:'slow-job-1',contextDigest:'context-digest',evidence:[{tenantId:tenant,kind:'card',id:'card-1',revision:1}],ontologyId:'agntiapro.cards',ontologyVersion:'1.0.0'};
 const policy:JevEgressPolicy={authorize:async()=>allowed?{consentId:'synthetic-consent',revision:policyRevision,expiresAt:'2026-11-17T00:00:00Z',maxDailyRequests:2,maxInFlight:1}:null,minimize:async()=> 'PUBLIC_SYNTHETIC_MINIMIZED'};
 const make=(connection=db)=>new DurableJevEgressGate(connection,new ContextServingFacade(new CognitiveProjectionStore(connection),context.policy,()=>now),tenant,policy,()=>now);
 return {scope,context,policy,make,clock:()=>now,advance:()=>{now+=30001;},deny:()=>{allowed=false;},revise:()=>{policyRevision='consent-2';}};
}
test('C08 durable gateway reserves quota once, persists no private text, reconciles uncertain attempts across restart',async()=>{
 const db=await createStore();try{
  const f=await fixture(db),gate=f.make(),signal=new AbortController().signal;
  const grant=(await gate.prepare('PRIVATE_RAW_CANDIDATE',f.scope,signal,target))!;assert.ok(grant);assert.equal(await gate.isCurrent(grant,f.scope,signal),true);
  assert.equal(await f.make().prepare('PRIVATE_RAW_CANDIDATE',f.scope,signal,target),null,'restart cannot authorize a duplicate external attempt');
  const result={state:'succeeded' as const,requestDigest:digest('request'),model:target.model,usage:{input_tokens:4,output_tokens:1}};
  await gate.record(grant,result);await f.make().record(grant,result);
  await assert.rejects(gate.record(grant,{...result,state:'failed'}),/ACCOUNTING_CONFLICT/);
  const second=(await f.make().prepare('PRIVATE_RAW_CANDIDATE',{...f.scope,operationId:'slow-job-2'},signal,target))!;assert.ok(second);
  f.advance();assert.equal(await f.make().reconcileExpired(),1);assert.equal(await gate.isCurrent(second,{...f.scope,operationId:'slow-job-2'},signal),false);
  assert.equal(await gate.prepare('PRIVATE_RAW_CANDIDATE',{...f.scope,operationId:'slow-job-3'},signal,target),null,'uncertain billing never refunds quota');
  const [quota]=await db.rawQuery<{calls:number}>('SELECT calls FROM cognition_v2_egress_quotas');assert.equal(quota.calls,2);
  const rows=await db.rawQuery('SELECT * FROM cognition_v2_egress_receipts');assert.ok(!JSON.stringify(rows).includes('PRIVATE_RAW_CANDIDATE'));assert.ok(!JSON.stringify(rows).includes('PUBLIC_SYNTHETIC_MINIMIZED'));
 }finally{await db.close();}
});
test('C08 gateway checks actor/tenant, current evidence, consent, grant integrity and cancellation before any egress',async()=>{
 const db=await createStore();try{
  const f=await fixture(db),gate=f.make(),signal=new AbortController().signal;
  await assert.rejects(gate.prepare('data',{...f.scope,identity:{...f.scope.identity,tenantId:'B'}},signal,target),/DENIED/);
  await assert.rejects(gate.prepare('data',{...f.scope,identity:{...f.scope.identity,actorId:'bob'}},signal,target),/DENIED/);
  await assert.rejects(gate.prepare('data',{...f.scope,operationId:undefined},signal,target),/DENIED/);
  const grant=(await gate.prepare('data',f.scope,signal,target))!;
  assert.equal(await gate.isCurrent({...grant,text:'substituted'},f.scope,signal),false);
  await assert.rejects(gate.record({...grant,text:'substituted'},{state:'failed',requestDigest:digest('x')}),/DENIED/);
  f.revise();assert.equal(await gate.isCurrent(grant,f.scope,signal),false);
  f.deny();assert.equal(await gate.isCurrent(grant,f.scope,signal),false);
  const abort=new AbortController();abort.abort();await assert.rejects(gate.prepare('data',f.scope,abort.signal,target));
  await gate.record(grant,{state:'failed',requestDigest:digest('x'),reason:'JEV_EGRESS_REVOKED'});
  assert.equal((await db.rawQuery<{state:string}>('SELECT state FROM cognition_v2_egress_receipts'))[0].state,'failed','revocation cannot prevent accounting of an attempted call');
 }finally{await db.close();}
});
test('C08 adapter consumes durable minimized grants and records usage without promoting factuality',async()=>{
 const db=await createStore();try{
  const f=await fixture(db);let sent=0;
  const classifier=new TypesafeJevClassifier({apiKey:'SYNTHETIC_TEST_ONLY',model:target.model,allowedTenants:new Set(['A'])},f.make(),async(_url,init)=>{
   sent++;const body=String(init?.body);assert.ok(!body.includes('PRIVATE_RAW_CANDIDATE'));assert.ok(body.includes('PUBLIC_SYNTHETIC_MINIMIZED'));
   const payload=JSON.parse(body),answers=Object.fromEntries(Object.entries(payload.questions as Record<string,{criteria:Record<string,string>}>).map(([name,q])=>[name,{type:'choice',choice:'unknown',confidence:0,probabilities:Object.fromEntries(Object.keys(q.criteria).map(k=>[k,k==='unknown'?1:0]))}]));
   return new Response(JSON.stringify({model:target.model,answers,usage:{input_tokens:10,output_tokens:5}}),{status:200});
  },f.clock);
  const result=await classifier.classify('PRIVATE_RAW_CANDIDATE',new AbortController().signal,f.scope) as {review:string;uncertainty:number};
  assert.equal(result.review,'proposed');assert.equal(result.uncertainty,1);
  await assert.rejects(classifier.classify('PRIVATE_RAW_CANDIDATE',new AbortController().signal,f.scope),/DENIED/);assert.equal(sent,1);
  assert.equal((await db.rawQuery<{state:string}>('SELECT state FROM cognition_v2_egress_receipts'))[0].state,'succeeded');
 }finally{await db.close();}
});
const postgres=process.env.COGNITION_TEST_POSTGRES_URL;
test('C08 native concurrent workers admit one in-flight request and rollback quota with failed transaction',{skip:!postgres},async()=>{
 const db=await createStore({databaseUrl:postgres}),rival=await createStore({databaseUrl:postgres});try{
  const f=await fixture(db,'egress-'+crypto.randomUUID()),signal=new AbortController().signal;
  const grants=await Promise.all([f.make().prepare('body',f.scope,signal,target),f.make(rival).prepare('body',{...f.scope,operationId:'other-job'},signal,target)]);
  assert.equal(grants.filter(Boolean).length,1);
  const grant=grants.find(Boolean)!;await f.make().record(grant,{state:'failed',requestDigest:digest('failed'),reason:'JEV_TRANSPORT_FAILED'});
  await assert.rejects(db.transaction(async()=>{assert.ok(await f.make().prepare('body',{...f.scope,operationId:'rollback'},signal,target));throw Error('synthetic crash');}),/synthetic crash/);
  const [quota]=await db.rawQuery<{calls:number}>('SELECT calls FROM cognition_v2_egress_quotas WHERE tenant=$1',[f.scope.identity.tenantId]);assert.equal(quota.calls,1);
  assert.ok(await f.make(rival).prepare('body',{...f.scope,operationId:'rollback'},signal,target));
 }finally{await db.close();await rival.close();}
});
test('C08 cancellation bounds a stuck minimizer and revoked evidence invalidates a persisted grant',async()=>{
 const db=await createStore();try{
  const f=await fixture(db),gate=f.make(),signal=new AbortController().signal;
  const grant=(await gate.prepare('candidate',f.scope,signal,target))!;
  await f.context.projections.revoke('A','source');assert.equal(await gate.isCurrent(grant,f.scope,signal),false);
  const second=await fixture(db,'other');let started!:()=>void;
  const ready=new Promise<void>(r=>{started=r;});second.policy.minimize=async()=>{started();return new Promise(()=>{});};
  const controller=new AbortController(),pending=second.make().prepare('private',second.scope,controller.signal,target);
  await ready;controller.abort();await assert.rejects(pending,/CANCELLED/);
  assert.equal((await db.rawQuery('SELECT id FROM cognition_v2_egress_receipts WHERE tenant=$1',['other'])).length,0);
 }finally{await db.close();}
});
