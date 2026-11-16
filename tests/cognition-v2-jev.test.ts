import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdir,writeFile } from 'node:fs/promises';
import { TypesafeJevClassifier,type JevEgressGate,type JevEgressGrant } from '../apps/server/src/engine/cognition/v2/jev-classifier.ts';
import type { SemanticEvaluationContext } from '../apps/server/src/engine/cognition/v2/slow.ts';
import { classificationV2Schema } from '../packages/domain/src/cognition-v2.ts';
import { digest } from '../apps/server/src/engine/cognition/v2/storage.ts';
const scope:SemanticEvaluationContext={identity:{tenantId:'tenant-private',actorId:'actor-private',owner:'actor-private',policyRevision:'policy-private',purpose:'chat'},evidence:[{tenantId:'tenant-private',kind:'card',id:'source-private',revision:1}],contextDigest:'context-private',ontologyId:'agntiapro.cards',ontologyVersion:'1.0.0'};
class Gate implements JevEgressGate{
 records:Parameters<JevEgressGate['record']>[1][]=[];checks=0;revoked=false;
 async prepare(body:string,s:SemanticEvaluationContext):Promise<JevEgressGrant|null>{return {provider:'typesafe',model:'jev-1.14.0',ontologyId:'agntiapro.cards',ontologyVersion:'1.0.0',receiptId:'egress-private',text:'PUBLIC SYNTHETIC CANDIDATE',sourceDigest:digest(body),contextDigest:s.contextDigest,evidenceDigest:digest(s.evidence),policyRevision:s.identity.policyRevision,expiresAt:'2099-01-01T00:00:00Z'};}
 async isCurrent(){this.checks++;return !this.revoked;}
 async record(_grant:JevEgressGrant,result:Parameters<JevEgressGate['record']>[1]){this.records.push(result);}
}
function classifier(gate:JevEgressGate,transport:typeof fetch,allowed=new Set(['tenant-private'])){return new TypesafeJevClassifier({apiKey:'SYNTHETIC-KEY-DO-NOT-LOG',model:'jev-1.14.0',allowedTenants:allowed},gate,transport);}
function answer(payload:{questions:Record<string,{criteria:Record<string,string>}>},family='risk'){
 const answers:Record<string,unknown>={};
 for(const [name,q] of Object.entries(payload.questions)){
  const choice=name==='family'?family:name==='expand'||name==='protect'?'strong':'unknown';
  answers[name]={type:'choice',choice,confidence:.95,probabilities:Object.fromEntries(Object.keys(q.criteria).map(k=>[k,k===choice?1:0]))};
 }
 return {model:'jev-1.14.0',answers,usage:{input_tokens:120,output_tokens:12}};
}
test('C08 verified REST contract minimizes egress, pins model and preserves proposed confidence and independent poles',async()=>{
 const gate=new Gate();let calls=0;
 const adapter=classifier(gate,async(url,options)=>{
  calls++;assert.equal(String(url),'https://api.typesafe.ai/v1/systemone');assert.equal(options?.redirect,'error');
  assert.equal(new Headers(options?.headers).get('Authorization'),'Bearer SYNTHETIC-KEY-DO-NOT-LOG');
  const body=String(options?.body);
  for(const secret of ['SECRET-CONTENT','tenant-private','actor-private','source-private','policy-private','context-private','egress-private'])assert.equal(body.includes(secret),false);
  const request=JSON.parse(body);assert.equal(request.model,'jev-1.14.0');assert.equal(Object.keys(request.questions).length,7);
  const response=answer(request);
  await mkdir('artifacts/cognition-v2',{recursive:true});
  await writeFile('artifacts/cognition-v2/jev-contract-fixture.json',JSON.stringify({scope:'synthetic fixture; no real inference request',request,response},null,2));
  return Response.json(response);
 });
 const result=classificationV2Schema.parse(await adapter.classify('SECRET-CONTENT',new AbortController().signal,scope));
 assert.equal(calls,1);assert.equal(result.review,'proposed');assert.equal(result.uncertainty,1);assert.equal(result.providerEvidence?.calibration,'not_locally_verified');
 assert.equal(result.ontology?.family,'risk');assert.deepEqual(result.ontology?.profile.business_orientation,{expand:1,protect:1});
 assert.equal(result.ontology?.profile.epistemic_work.verify,null);assert.equal(result.ontology?.dimensions.business_impact,null);
 assert.equal(gate.records[0].state,'succeeded');assert.deepEqual(gate.records[0].usage,{input_tokens:120,output_tokens:12});
 assert.equal(JSON.stringify(adapter).includes('SYNTHETIC-KEY'),false);
});
test('C08 unknown is explicit and never converted into zero, certainty or permission',async()=>{
 const adapter=classifier(new Gate(),async(_url,o)=>Response.json(answer(JSON.parse(String(o?.body)),'unknown')));
 const result=classificationV2Schema.parse(await adapter.classify('text',new AbortController().signal,scope));
 assert.equal(result.ontology?.family,null);assert.equal(result.ontology?.profile.knowledge_strategy.explore,null);assert.deepEqual(result.labels,['uncertain']);
 assert.equal('approved' in result,false);
});
test('C08 denied tenant, stale policy grant and pre-aborted requests make no provider call',async()=>{
 let calls=0;const transport:typeof fetch=async()=>{calls++;throw Error('must not send');};
 await assert.rejects(classifier(new Gate(),transport,new Set(['other'])).classify('text',new AbortController().signal,scope),/EGRESS_DENIED/);
 const invalid=new class extends Gate{override async prepare(body:string,s:SemanticEvaluationContext){return {...(await super.prepare(body,s))!,policyRevision:'forged'};}}();
 await assert.rejects(classifier(invalid,transport).classify('text',new AbortController().signal,scope),/EGRESS_DENIED/);
 const aborted=new AbortController();aborted.abort();await assert.rejects(classifier(new Gate(),transport).classify('text',aborted.signal,scope));
 assert.equal(calls,0);
});
test('C08 malformed labels, probability distributions, version drift and oversized responses fail with audit',async()=>{
 const mutations=[(r:any)=>({...r,approved:true}),(r:any)=>({...r,model:'jev-latest'}),(r:any)=>{r.answers.family.choice='execute_action';return r;},(r:any)=>{r.answers.family.probabilities.risk=.2;return r;}];
 for(const mutate of mutations){
  const gate=new Gate(),adapter=classifier(gate,async(_url,o)=>Response.json(mutate(answer(JSON.parse(String(o?.body))))));
  await assert.rejects(adapter.classify('text',new AbortController().signal,scope));assert.equal(gate.records[0].state,'failed');
 }
 const gate=new Gate();await assert.rejects(classifier(gate,async()=>new Response('x'.repeat(65537))).classify('text',new AbortController().signal,scope),/RESPONSE_TOO_LARGE/);
 assert.equal(gate.records[0].state,'failed');assert.equal(gate.records[0].usage,undefined,'unknown billed usage is never recorded as zero');
});
test('C08 cancellation, revocation and 429 do not retry or return a stale classification',async()=>{
 const cancelled=new AbortController(),gate=new Gate();let calls=0;
 const adapter=classifier(gate,async(_url,options)=>new Promise<Response>((_resolve,reject)=>{calls++;options!.signal!.addEventListener('abort',()=>reject(Error('aborted')),{once:true});}));
 const pending=adapter.classify('text',cancelled.signal,scope);setTimeout(()=>cancelled.abort(),10);
 await assert.rejects(pending,/JEV_CANCELLED/);assert.equal(calls,1);assert.equal(gate.records[0].state,'failed');
 const revoked=new Gate();await assert.rejects(classifier(revoked,async(_u,o)=>{revoked.revoked=true;return Response.json(answer(JSON.parse(String(o?.body))));}).classify('text',new AbortController().signal,scope),/EGRESS_REVOKED/);
 let attempts=0;const rate=new Gate();await assert.rejects(classifier(rate,async()=>{attempts++;return new Response('sensitive provider error',{status:429});}).classify('text',new AbortController().signal,scope),/JEV_HTTP_429/);assert.equal(attempts,1);
 const network=new Gate();await assert.rejects(classifier(network,async()=>{throw Error('SYNTHETIC-KEY-DO-NOT-LOG');}).classify('text',new AbortController().signal,scope),/^Error: JEV_TRANSPORT_FAILED$/);
 assert.equal(JSON.stringify(network.records).includes('SYNTHETIC-KEY'),false);
});
test('C08 accounting uncertainty is explicit and never overwritten with a contradictory failure receipt',async()=>{
 let attempts=0;const gate=new class extends Gate{override async record(){attempts++;throw Error('commit acknowledgement lost');}}();
 const adapter=classifier(gate,async(_u,o)=>Response.json(answer(JSON.parse(String(o?.body)))));
 await assert.rejects(adapter.classify('text',new AbortController().signal,scope),/ACCOUNTING_UNKNOWN/);assert.equal(attempts,1);
});
test('C08 documented adapter plugs into durable Slow without overriding hypotheses or concealing evaluator disagreement',async()=>{
 const {createStore}=await import('../apps/server/src/db.ts');
 const {installCognitionV2,CognitiveProjectionStore,DurableEventSink}=await import('../apps/server/src/engine/cognition/v2/storage.ts');
 const {ContextServingFacade}=await import('../apps/server/src/engine/cognition/v2/context.ts');
 const {SlowCognitionQueue}=await import('../apps/server/src/engine/cognition/v2/slow.ts');
 const {CognitiveProjector}=await import('../apps/server/src/engine/cognition/v2/projector.ts');
 const {emptyOntologyProposal}=await import('../apps/server/src/engine/cognition/chromatic/card-ontology.ts');
 const {persistentKernel}=await import('./fixtures/cognition-v2/kernel.ts');const {record}=await import('./fixtures/cognition-v2/record.ts');
 const db=await createStore();
 try{
  await installCognitionV2(db);const store=new CognitiveProjectionStore(db);await store.apply(record(),'1');
  const context=new ContextServingFacade(store,{authorize:async()=>true}),sink=new DurableEventSink(db,db,new Set(['A']));
  const gate=new Gate(),adapter=new TypesafeJevClassifier({apiKey:'synthetic',model:'jev-1.14.0',allowedTenants:new Set(['A'])},gate,async(_u,o)=>Response.json(answer(JSON.parse(String(o?.body)))));
  const queue=new SlowCognitionQueue(db,sink,context,{infer:async(input)=>{
   const ontology=emptyOntologyProposal(input.evidence);ontology.family='opportunity';
   return {title:'Oportunidad propuesta',body:'Hipótesis no verificada',epistemic:'hypothesis',evidence:input.evidence,ontology};
  }},adapter);
  const kernel=persistentKernel(db);queue.capture=(identity,input)=>kernel.captureAsyncResult({tenantId:identity.tenantId,owner:identity.owner,actorId:identity.actorId,role:'system',requestId:input.operationId},input);
  const identity={tenantId:'A',actorId:'alice',owner:'alice',policyRevision:'1',purpose:'chat' as const};
  const job=await queue.enqueue({identity,prompt:'Analizar',evidence:[{tenantId:'A',kind:'card',id:'card-1',revision:1}]},'jev-integration');
  await queue.tick('A');await new CognitiveProjector(store).tick('A');
  const card=await context.resolve(identity,`slow:${job.id}`);assert.ok(card);assert.equal(card.epistemic,'hypothesis');
  assert.equal(card.ontology?.family,null);assert.equal(card.ontology?.disputed,true);assert.equal(card.ontology?.assessments.length,2);
  assert.equal(card.classification?.providerEvidence?.model,'jev-1.14.0');assert.equal(card.classification?.providerEvidence?.usage.input_tokens,120);
  assert.equal(card.classification?.providerEvidence?.requestDigest,gate.records[0].requestDigest);
 }finally{await db.close();}
});
