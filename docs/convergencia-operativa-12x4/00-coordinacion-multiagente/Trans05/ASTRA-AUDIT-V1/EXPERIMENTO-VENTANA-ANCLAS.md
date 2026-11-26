# Prueba del límite de candidatos anterior al ranking

Ejecutar desde la raíz del worktree de Trans05 mediante node --import tsx y un archivo temporal .mts. El store embebido es efímero y las únicas fuentes son las fixtures del repositorio.

```ts
import assert from 'node:assert/strict';
import {createStore} from '/workspace/astra-trans05/apps/server/src/db.ts';
import {installCognitionV2,CognitiveProjectionStore} from '/workspace/astra-trans05/apps/server/src/engine/cognition/v2/storage.ts';
import {ContextServingFacade} from '/workspace/astra-trans05/apps/server/src/engine/cognition/v2/context.ts';
import {record} from '/workspace/astra-trans05/tests/fixtures/cognition-v2/record.ts';
const db=await createStore();
try{
 await installCognitionV2(db);
 const store=new CognitiveProjectionStore(db),ctx=new ContextServingFacade(store,{authorize:async()=>true});
 for (const [tenant,id] of [['T1','z-anchor'],['T2','a-anchor']]) {
   for(let i=0;i<12;i++) await store.apply({...record(tenant,'alice','m-'+i),title:'Registro general'},String(i+1));
   await store.apply({...record(tenant,'alice',id),title:'Prioridad aprobada',body:'conciliación',createdAt:'2026-11-25T00:00:00Z'},'13');
   const ident={tenantId:tenant,owner:'alice',actorId:'alice',purpose:'chat',policyRevision:'1'} as const;
   const snap=await ctx.getSnapshot(ident,{query:'conciliación',maxRefs:1,maxTokens:4000});
   console.log(JSON.stringify({source:id,visible:!!await ctx.resolve(ident,id,1),winner:snap.refs[0]?.id,truncated:snap.truncated}));
   assert.equal(snap.refs[0]?.id===id,tenant==='T2');
 }
}finally{await db.close();}

```
