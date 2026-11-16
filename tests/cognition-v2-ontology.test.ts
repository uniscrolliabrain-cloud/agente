import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createStore } from '../apps/server/src/db.ts';
import { cardFamilySchema,cardOntologyProposalSchema,cardDimensionsSchema,cardOntologyAnnotationSchema } from '../packages/domain/src/card-ontology.ts';
import { cognitiveRecordSchema } from '../packages/domain/src/cognition-v2.ts';
import { CardOntologyService,emptyOntologyProposal,CARD_ONTOLOGY_DECISION,approvedCardOntology } from '../apps/server/src/engine/cognition/chromatic/card-ontology.ts';
import { normalizeChromaticVector } from '../apps/server/src/engine/cognition/chromatic/ontology-registry.ts';
import { installCognitionV2,CognitiveProjectionStore,DurableEventSink,digest } from '../apps/server/src/engine/cognition/v2/storage.ts';
import { ContextServingFacade } from '../apps/server/src/engine/cognition/v2/context.ts';
import { SlowCognitionQueue } from '../apps/server/src/engine/cognition/v2/slow.ts';
import { CognitiveProjector } from '../apps/server/src/engine/cognition/v2/projector.ts';
import { persistentKernel } from './fixtures/cognition-v2/kernel.ts';
import { record } from './fixtures/cognition-v2/record.ts';
const ref={tenantId:'A',kind:'card' as const,id:'card-1',revision:1};
const identity={tenantId:'A',actorId:'alice',owner:'alice',policyRevision:'1',purpose:'chat' as const};
test('C05 approved vocabulary has eight families, six independent nullable poles and ten typed dimensions',()=>{
 assert.equal(cardFamilySchema.options.length,8);assert.equal(cardDimensionsSchema.keyof().options.length,10);
 const raw=emptyOntologyProposal([ref]);
 assert.equal(Object.values(raw.profile).flatMap(Object.values).length,6);
 raw.family='opportunity';raw.profile.business_orientation={expand:.9,protect:.9};
 assert.deepEqual(cardOntologyProposalSchema.parse(raw).profile.business_orientation,{expand:.9,protect:.9});
 for(const patch of [{permissions:['admin']},{ontologyVersion:'future'},{family:'approved_action'},
  {profile:{...raw.profile,unknown:{a:0}}},{evidenceRefs:[ref,{...ref,tenantId:'B'}]},
  {dimensions:{...raw.dimensions,relevance:.5}}])assert.equal(cardOntologyProposalSchema.safeParse({...raw,...patch}).success,false);
 assert.equal(cardOntologyProposalSchema.safeParse({...raw,profile:{...raw.profile,business_orientation:{expand:NaN,protect:null}}}).success,false);
 assert.deepEqual(normalizeChromaticVector(approvedCardOntology,{}).map(x=>x.value),[null,null,null]);
});
test('C05 approval is persisted and revocable; disagreement remains explicit and cannot mint outcomes or certainty',async()=>{
 const db=await createStore();
 try{
  const service=new CardOntologyService(db);await service.install();await service.assertApproved();
  const slow=emptyOntologyProposal([ref]);slow.family='risk';slow.profile.business_orientation.protect=.8;
  const jev=structuredClone(slow);jev.family='opportunity';jev.profile.business_orientation.expand=.9;
  const input={slow,evaluator:{proposal:jev,name:'jev' as const,version:'synthetic-fixture'},evidence:[ref],contextDigest:'ctx',evaluatedAt:'2026-11-16T00:00:00Z'};
  const annotation=await service.annotate(input);
  assert.equal(annotation.family,null);assert.equal(annotation.disputed,true);assert.equal(annotation.assessments.length,2);
  assert.equal(annotation.profile.business_orientation.expand,.9);assert.equal(annotation.profile.business_orientation.protect,.8);
  assert.equal(annotation.dimensions.relevance,null);
  assert.equal(cardOntologyAnnotationSchema.safeParse({...annotation,family:'outcome'}).success,false);
  const candidate={...record(),ontology:annotation};assert.equal(cognitiveRecordSchema.safeParse(candidate).success,false,'anchors must exist on the enclosing record');
  assert.equal(cognitiveRecordSchema.safeParse({...record(),classification:{classifier:'jev',version:'fixture',labels:[],uncertainty:1,review:'proposed',ontology:{...slow,evidenceRefs:[{...ref,tenantId:'B'}]}}}).success,false);
  await assert.rejects(service.annotate({...input,slow:{...slow,evidenceRefs:[{...ref,tenantId:'B'}]}}),/UNANCHORED/);
  await assert.rejects(service.annotate({...input,slow:{...slow,contextDigest:'forged'}}),/CONTEXT_MISMATCH/);
  const outcome=await service.annotate({...input,slow:{...slow,family:'outcome'},evaluator:undefined});
  assert.equal(outcome.family,null);assert.equal(outcome.disputed,true);
  await db.put('system','ontology-approval-revocations',{id:CARD_ONTOLOGY_DECISION,reason:'test'});
  await assert.rejects(service.assertApproved(),/REVOKED/);
  await assert.rejects(service.install(),/APPROVAL_REQUIRED/);
 }finally{await db.close();}
});
test('C05 Slow produces durable annotated cards; replay is stable, context is compact and ontology revocation hides derivatives',async()=>{
 const db=await createStore();
 try{
  await installCognitionV2(db);const store=new CognitiveProjectionStore(db);await store.apply(record(),'1');
  const service=new CardOntologyService(db);
  const context=new ContextServingFacade(store,{authorize:async(_identity,r)=>{
   if(r?.ontology)await service.assertApproved();return true;
  }});
  const sink=new DurableEventSink(db,db,new Set(['A']));
  const queue=new SlowCognitionQueue(db,sink,context,{infer:async(input)=>{
   const ontology=emptyOntologyProposal(input.evidence);ontology.family='risk';ontology.profile.business_orientation.protect=.8;
   ontology.dimensions.relevance=.6;ontology.contextDigest=input.contextDigest;
   return {title:'Exposición de cobro',body:'Podría afectar a la liquidez',epistemic:'hypothesis',evidence:input.evidence,ontology};
  }});
  const kernel=persistentKernel(db);
  queue.capture=(id,input)=>kernel.captureAsyncResult({tenantId:id.tenantId,owner:id.owner,actorId:id.actorId,role:'system',requestId:input.operationId},input);
  const job=await queue.enqueue({identity,prompt:'Analizar cobros',evidence:[ref]},'ontology-test');
  await queue.tick('A');const projector=new CognitiveProjector(store);await projector.tick('A');
  const card=await context.resolve(identity,`slow:${job.id}`);assert.ok(card);assert.equal(card.ontology?.family,'risk');
  assert.equal(card.epistemic,'hypothesis');assert.equal(card.ontology?.review,'proposed');
  const badClassifier=new SlowCognitionQueue(db,sink,context,queue.provider,{classify:async(_body,_signal,scope)=>{
   assert.equal(scope?.identity.tenantId,'A');
   const ontology=emptyOntologyProposal([{...ref,tenantId:'B'}]);ontology.family='opportunity';
   return {classifier:'jev',version:'synthetic-invalid-provider',labels:[],uncertainty:0,review:'proposed',ontology};
  }});
  badClassifier.capture=queue.capture;
  const fallback=await badClassifier.enqueue({identity,prompt:'Analizar cobros',evidence:[ref]},'invalid-classifier');
  await badClassifier.tick('A');await projector.tick('A');
  const fallbackCard=await context.resolve(identity,`slow:${fallback.id}`);
  assert.equal(fallbackCard?.classification?.fallbackReason,'unanchored_evidence');
  assert.equal(fallbackCard?.ontology?.family,'risk','invalid optional evaluator must not block valid Slow output');
  const snapshot=await context.getSnapshot(identity,{query:'liquidez',maxTokens:8000,maxRefs:10});
  const segment=snapshot.segments.find(s=>s.refId===card.id)!;assert.equal(JSON.parse(segment.text).ontology.family,'risk');
  assert.equal(segment.text.includes('assessments'),false,'provider evaluations are not dumped into Fast context');
  const before=digest(await store.latest('A',100,'alice'));
  const events=await db.rawQuery<{event:Parameters<typeof projector.apply>[0]}>('SELECT event FROM cognition_v2_events ORDER BY sequence');
  for(const {event} of events)await projector.apply(event,'999');
  assert.equal(digest(await store.latest('A',100,'alice')),before);
  await db.put('system','ontology-approval-revocations',{id:CARD_ONTOLOGY_DECISION});
  assert.equal(await context.resolve(identity,card.id),null);assert.equal(await context.readSnapshot(identity,snapshot.id),null);
 }finally{await db.close();}
});
