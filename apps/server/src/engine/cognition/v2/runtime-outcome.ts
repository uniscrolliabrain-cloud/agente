import type { Store } from '../../../db.ts';
import { cognitiveRecordSchema,cognitiveIdentitySchema,type CognitiveRecord } from '../../../../../../packages/domain/src/cognition-v2.ts';
import { runtimeOutcomeSchema,type RuntimeOutcome } from '../../../../../../packages/domain/src/runtime-outcome.ts';
import type { SystemEvent } from '../../events/types.ts';
import { slowStatusPayloadSchema } from '../../events/schemas.ts';
import { CardOntologyService,CARD_ONTOLOGY_DECISION } from '../chromatic/card-ontology.ts';
import { CARD_ONTOLOGY_ID,CARD_ONTOLOGY_VERSION } from '../../../../../../packages/domain/src/card-ontology.ts';
import { digest } from './storage.ts';
const titles={completed:'Resultado del análisis guardado',failed:'El trabajo de análisis terminó con error',cancelled:'Solicitud de análisis cancelada'};
export class RuntimeOutcomeProjector {
 constructor(readonly db:Store){}
 async fromSlowReceipt(event:SystemEvent):Promise<CognitiveRecord>{
  if(event.type!=='cognition.v2.slow.status')throw Error('INVALID_RUNTIME_RECEIPT');
  const status=slowStatusPayloadSchema.parse(event.payload);
  if(status.state!=='completed'&&status.state!=='failed'&&status.state!=='cancelled')throw Error('NON_TERMINAL_RECEIPT');
  const [persisted]=await this.db.rawQuery<{event:SystemEvent}>('SELECT event FROM cognition_v2_events WHERE tenant=$1 AND event_id=$2',[event.tenantId,event.id]);
  if(!persisted||digest(persisted.event)!==digest(event)||status.receiptId!==event.id||event.id!==digest([status.jobId,status.state])||event.source.id!=='slow-v2')throw Error('INVALID_RUNTIME_RECEIPT');
  const [job]=await this.db.rawQuery<{identity:unknown;state:string}>(`SELECT data->'identity' AS identity,state FROM cognition_v2_slow_jobs WHERE tenant=$1 AND id=$2 AND actor=$3`,[event.tenantId,status.jobId,event.owner]);
  if(!job||job.state!==status.state)throw Error('RUNTIME_RECEIPT_STATE_MISMATCH');
  const identity=cognitiveIdentitySchema.parse(job.identity);
  if(identity.tenantId!==event.tenantId||identity.actorId!==event.owner||identity.owner!==event.owner)throw Error('RUNTIME_RECEIPT_SCOPE_MISMATCH');
  const ontology=new CardOntologyService(this.db);await ontology.assertApproved();
  const receiptRef={tenantId:event.tenantId,kind:'receipt' as const,id:event.id,revision:1};
  const outcome:RuntimeOutcome=runtimeOutcomeSchema.parse({ontologyId:CARD_ONTOLOGY_ID,ontologyVersion:CARD_ONTOLOGY_VERSION,
   approvalDecisionId:CARD_ONTOLOGY_DECISION,verifierVersion:'slow-job-receipt-v1',family:'outcome',scope:'slow_cognition_job',
   jobId:status.jobId,state:status.state,observedAt:event.emittedAt,receiptRef});
  return cognitiveRecordSchema.parse({schemaVersion:'2.0',id:`outcome:${event.id}`,tenantId:event.tenantId,revision:1,kind:'card',
   title:titles[status.state],body:JSON.stringify({scope:outcome.scope,jobId:status.jobId,state:status.state,receiptId:event.id}),
   epistemic:'verified_fact',evidence:[receiptRef],sourceEventId:event.id,sourceRevision:1,
   visibility:{tenantId:event.tenantId,ownerActorId:identity.actorId,scope:'private',allowedActorIds:[],policyRevision:identity.policyRevision},
   signals:{relevance:.5,confidence:0,novelty:0,urgency:0,contradiction:0},runtimeOutcome:outcome,lifecycle:'active',createdAt:event.emittedAt});
 }
 async validates(record:CognitiveRecord):Promise<boolean>{
  if(!record.runtimeOutcome)return false;
  const [source]=await this.db.rawQuery<{event:SystemEvent}>('SELECT event FROM cognition_v2_events WHERE tenant=$1 AND event_id=$2',[record.tenantId,record.runtimeOutcome.receiptRef.id]);
  if(!source)return false;
  try{return digest(await this.fromSlowReceipt(source.event))===digest(record);}catch{return false;}
 }
}
