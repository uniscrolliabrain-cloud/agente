import { z } from 'zod';
import type { Store } from '../../../db.ts';
import { cognitionCardSchema,type CognitionCard } from '../../../../../../packages/domain/src/cognition-card.ts';
import type { CognitiveIdentity,CognitiveRecord } from '../../../../../../packages/domain/src/cognition-v2.ts';
import { cognitiveRecordSchema } from '../../../../../../packages/domain/src/cognition-v2.ts';
import { cognitiveRefSchema } from '../../../../../../packages/domain/src/cognitive-reference.ts';
import type { CognitiveRef } from '../../../../../../packages/domain/src/cognitive-reference.ts';
import type { ContextServingFacade } from './context.ts';
import { DurableEventSink,digest } from './storage.ts';
import { migrateLegacyCard } from './legacy-adapter.ts';
export interface LegacyEvidenceResolver {
 readonly version:string;
 resolve(identity:CognitiveIdentity,reference:{kind:string;id:string}):Promise<CognitiveRef|null>;
}
type PlannedEntry={sourceId:string;sourceRevision:number;sourceDigest:string;record:CognitiveRecord;metadata:Omit<CognitionCard,'title'|'body'>};
type Plan={formatVersion:'1.0';resolverVersion:string;identity:CognitiveIdentity;entries:PlannedEntry[];blocked:{sourceId:string;reason:string}[];nextCursor:string|null;digest:string};
const requestSchema=z.strictObject({key:z.string().min(1).max(200),afterId:z.string().max(200).default(''),limit:z.number().int().min(1).max(100).default(20)});
/** Explicit staged migration. Never edits V1 rows, grants access or infers missing references. */
export class LegacyCardBackfill {
 constructor(readonly db:Store,readonly context:ContextServingFacade,readonly sink:DurableEventSink,
  readonly resolver:LegacyEvidenceResolver,private readonly clock=()=>Date.now()){
  z.string().min(1).max(200).parse(resolver.version);
  if(context.projections.db!==db||!sink.usesTransactionStore(db))throw Error('BACKFILL_REQUIRES_SAME_TRANSACTION_STORE');
 }
 async prepare(identity:CognitiveIdentity,request:z.input<typeof requestSchema>){
  await this.context.assertAuthorized(identity);if(identity.actorId!==identity.owner)throw Error('DENIED');
  const input=requestSchema.parse(request);
  const rows=await this.db.rawQuery<{source_id:string;data:unknown}>(`SELECT id AS source_id,data FROM records
   WHERE owner=$1 AND kind='cognition-cards' AND data->>'tenantId'=$2 AND id>$3 ORDER BY id LIMIT $4`,
   [identity.actorId,identity.tenantId,input.afterId,input.limit+1]);
  const entries:PlannedEntry[]=[],blocked:Plan['blocked']=[];
  for(const row of rows.slice(0,input.limit)){
   const parsed=cognitionCardSchema.safeParse(row.data);
   if(!parsed.success||parsed.data.id!==row.source_id){blocked.push({sourceId:row.source_id,reason:'INVALID_SOURCE'});continue;}
   const card=parsed.data;
   if(card.owner!==identity.owner){blocked.push({sourceId:row.source_id,reason:'SOURCE_OWNER_MISMATCH'});continue;}
   const refs=await this.resolveAll(identity,card);
   if(!refs){blocked.push({sourceId:card.id,reason:'UNRESOLVED_EVIDENCE'});continue;}
   const record=migrateLegacyCard(card,identity),sourceDigest=digest(row.data);
   record.evidence=refs;record.sourceEventId=digest(['legacy-card-import',identity.tenantId,identity.actorId,card.id,card.version,sourceDigest]);
   cognitiveRecordSchema.parse(record);
   const {title:_title,body:_body,...metadata}=card;
   entries.push({sourceId:card.id,sourceRevision:card.version,sourceDigest,record,metadata});
  }
  const content={formatVersion:'1.0' as const,resolverVersion:this.resolver.version,identity,entries,blocked,nextCursor:rows.length>input.limit?rows[input.limit-1].source_id:null};
  const plan:Plan={...content,digest:digest(content)},id=digest([identity.tenantId,identity.actorId,input.key]);
  await this.db.transaction(async()=>{
   await this.context.assertAuthorized(identity);
   await this.db.rawQuery(`INSERT INTO cognition_v2_import_plans(tenant,id,actor,data,state,expires_at)
    VALUES($1,$2,$3,$4::jsonb,'prepared',$5) ON CONFLICT DO NOTHING`,[identity.tenantId,id,identity.actorId,JSON.stringify(plan),new Date(this.clock()+3600000).toISOString()]);
   const [saved]=await this.db.rawQuery<{data:Plan;state:string}>(`SELECT data,state FROM cognition_v2_import_plans WHERE tenant=$1 AND id=$2 AND actor=$3`,[identity.tenantId,id,identity.actorId]);
   if(saved.data.digest!==plan.digest)throw Error('BACKFILL_PLAN_KEY_CONFLICT');
  });
  return {id,planDigest:plan.digest,ready:entries.length,blocked,nextCursor:plan.nextCursor,canApply:blocked.length===0};
 }
 async apply(identity:CognitiveIdentity,id:string,expectedDigest:string){
  z.string().regex(/^[a-f0-9]{64}$/).parse(id);z.string().regex(/^[a-f0-9]{64}$/).parse(expectedDigest);
  await this.context.assertAuthorized(identity);
  return this.db.transaction(async()=>{
   const [row]=await this.db.rawQuery<{data:Plan;state:string;valid:boolean}>(`SELECT data,state,expires_at>$4 AS valid FROM cognition_v2_import_plans
    WHERE tenant=$1 AND id=$2 AND actor=$3 FOR UPDATE`,[identity.tenantId,id,identity.actorId,new Date(this.clock()).toISOString()]);
   if(!row||row.data.digest!==expectedDigest||digest(row.data.identity)!==digest(identity))throw Error('BACKFILL_PLAN_DENIED');
   if(row.data.formatVersion!=='1.0'||row.data.resolverVersion!==this.resolver.version)throw Error('BACKFILL_PLAN_VERSION_UNSUPPORTED');
   const {digest:storedDigest,...content}=row.data;
   if(digest(content)!==storedDigest)throw Error('BACKFILL_PLAN_CORRUPTED');
   if(row.state==='journaled')return {state:'journaled' as const,count:row.data.entries.length};
   if(!row.valid)throw Error('BACKFILL_PLAN_EXPIRED');
   if(row.data.blocked.length)throw Error('BACKFILL_UNRESOLVED_EVIDENCE');
   for(const entry of row.data.entries){
    const [source]=await this.db.rawQuery<{data:unknown}>(`SELECT data FROM records WHERE owner=$1 AND kind='cognition-cards' AND id=$2 FOR UPDATE`,[identity.actorId,entry.sourceId]);
    if(!source||digest(source.data)!==entry.sourceDigest)throw Error('BACKFILL_SOURCE_CHANGED');
    const refs=await this.resolveAll(identity,cognitionCardSchema.parse(source.data));
    if(!refs||digest(refs)!==digest(entry.record.evidence))throw Error('BACKFILL_EVIDENCE_CHANGED');
    await this.context.assertAuthorized(identity);
    const receiptId=digest([identity.actorId,entry.sourceId,entry.sourceRevision]);
    const [previous]=await this.db.rawQuery<{source_digest:string;data:{recordDigest:string}}>(`SELECT source_digest,data FROM cognition_v2_import_receipts
     WHERE tenant=$1 AND actor=$2 AND source_id=$3 AND source_revision=$4`,[identity.tenantId,identity.actorId,entry.sourceId,entry.sourceRevision]);
    if(previous&&(previous.source_digest!==entry.sourceDigest||previous.data.recordDigest!==digest(entry.record)))throw Error('BACKFILL_SOURCE_REVISION_CONFLICT');
    if(previous)continue;
    await this.sink.write({id:entry.record.sourceEventId,tenantId:identity.tenantId,owner:identity.actorId,schemaVersion:'1.0',
     type:'cognition.v2.record.proposed',source:{kind:'system',id:'legacy-card-backfill-v2'},emittedAt:new Date(this.clock()).toISOString(),payload:{record:cognitiveRecordSchema.parse(entry.record)}});
    await this.db.rawQuery(`INSERT INTO cognition_v2_import_receipts(tenant,id,actor,source_id,source_revision,source_digest,data)
     VALUES($1,$2,$3,$4,$5,$6,$7::jsonb)`,[identity.tenantId,receiptId,identity.actorId,entry.sourceId,entry.sourceRevision,entry.sourceDigest,
      JSON.stringify({adapterVersion:'2.0',resolverVersion:this.resolver.version,recordDigest:digest(entry.record),importedAt:new Date(this.clock()).toISOString(),planId:id,recordId:entry.record.id,eventId:entry.record.sourceEventId,sourceMetadata:entry.metadata})]);
   }
   await this.context.assertAuthorized(identity);
   await this.db.rawQuery(`UPDATE cognition_v2_import_plans SET state='journaled' WHERE tenant=$1 AND id=$2 AND actor=$3`,[identity.tenantId,id,identity.actorId]);
   return {state:'journaled' as const,count:row.data.entries.length};
  });
 }
 private async resolveAll(identity:CognitiveIdentity,card:CognitionCard):Promise<CognitiveRef[]|null>{
  const requested=[...new Set([card.thoughtId,...card.evidence.thoughtIds])].map(id=>({kind:'thought',id}));
  requested.push(...card.evidence.entityRefs,...(card.evidence.memoryIds??[]).map(id=>({kind:'memory',id})));
  const refs=new Map<string,CognitiveRef>();
  for(const reference of requested){
   const raw=await this.resolver.resolve(identity,reference),parsed=cognitiveRefSchema.safeParse(raw);
   if(!parsed.success||parsed.data.tenantId!==identity.tenantId)return null;
   if(await this.context.projections.revoked(identity.tenantId,parsed.data.id))return null;
   refs.set(digest(parsed.data),parsed.data);
  }
  return [...refs.values()];
 }
}

/** Initial governed resolver: immutable kernel Thoughts and already migrated
 * cognitive memories. Business entities need their own authorized adapter. */
export function legacyEvidenceResolver(context:ContextServingFacade):LegacyEvidenceResolver{
 return {version:'kernel-thought-v1-cognitive-memory-v1',resolve:async(identity,ref)=>{
  await context.assertAuthorized(identity);
  if(ref.kind==='thought'){
   const thought=await context.projections.db.get<{id:string;tenantId:string;owner:string}>(identity.tenantId,'cognitive-thoughts',ref.id);
   return thought?.id===ref.id&&thought.tenantId===identity.tenantId&&thought.owner===identity.owner?
    {tenantId:identity.tenantId,kind:'thought',id:ref.id,revision:1}:null;
  }
  if(ref.kind==='memory'){
   const memory=await context.resolve(identity,ref.id);
   return memory?.kind==='memory'?{tenantId:identity.tenantId,kind:'memory',id:memory.id,revision:memory.revision}:null;
  }
  return null;
 }};
}
