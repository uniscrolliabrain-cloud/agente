// Checkpoint-only synthetic reproduction. No model, network or persistent tenant data.
import { randomUUID } from 'node:crypto';
import { EventType,type BaseEvent,type RunAgentInput } from '@ag-ui/core';
import { createStore } from '../apps/server/src/db.ts';
import { TenantService } from '../apps/server/src/engine/tenant.ts';
import { CognitionV2Runtime } from '../apps/server/src/engine/cognition/v2/runtime.ts';
import { installCognitionV2 } from '../apps/server/src/engine/cognition/v2/storage.ts';
import { runInTenantScope } from '../apps/server/src/tenant-scope.ts';
import { testConfig } from '../tests/helpers/config.ts';
import { record } from '../tests/fixtures/cognition-v2/record.ts';
const db=await createStore();
try{
 await installCognitionV2(db);const memberships=new TenantService(db,testConfig());
 await memberships.addMembership('checkpoint-user','checkpoint-tenant','member');
 await db.put('system','users',{id:'checkpoint-user',data:{active:true}});
 const runtime=new CognitionV2Runtime(db,db,new Set(['checkpoint-tenant']),memberships,{stream:async(_input,prompt,_profile,_signal,emit)=>{
  if(!prompt.includes('Dato no verificado'))throw Error('fixture source missing');
  emit({type:EventType.TEXT_MESSAGE_CONTENT,messageId:'reply',delta:'fixture'});return 'fixture';
 }});
 const identity=await runtime.identity('checkpoint-tenant','checkpoint-user','checkpoint-user','chat');
 await runtime.context.projections.apply({...record('checkpoint-tenant','checkpoint-user'),visibility:{tenantId:'checkpoint-tenant',ownerActorId:'checkpoint-user',scope:'private',allowedActorIds:[],policyRevision:identity.policyRevision}},'1');
 for(let i=0;i<3;i++){
  const input:RunAgentInput={threadId:'checkpoint-thread',runId:randomUUID(),state:{},tools:[],context:[],forwardedProps:{},messages:[{id:randomUUID(),role:'user',content:'Same question'}]};
  await new Promise<void>((resolve,reject)=>runInTenantScope({tenantId:identity.tenantId,actorId:identity.actorId},()=>runtime.chat(identity.actorId,input)).subscribe({next:(e:BaseEvent)=>{if(e.type===EventType.RUN_ERROR)reject(Error('synthetic run failed'));},error:reject,complete:resolve}));
 }
 const [runs]=await db.rawQuery<{count:string}>("SELECT count(*) AS count FROM cognition_v2_chat_runs WHERE tenant='checkpoint-tenant' AND state='completed'");
 const [deliveries]=await db.rawQuery<{count:string}>("SELECT count(*) AS count FROM cognition_v2_deliveries WHERE tenant='checkpoint-tenant' AND status='acknowledged'");
 const completedRuns=Number(runs.count),acknowledgedDeliveries=Number(deliveries.count);
 console.log(JSON.stringify({scope:'local synthetic fixture',completedRuns,acknowledgedDeliveries,expectedPerRunDeliveries:completedRuns,finding:completedRuns!==acknowledgedDeliveries?'REPRODUCED':'NOT_REPRODUCED'},null,2));
 process.exitCode=completedRuns!==acknowledgedDeliveries?1:0;
}finally{await db.close();}
