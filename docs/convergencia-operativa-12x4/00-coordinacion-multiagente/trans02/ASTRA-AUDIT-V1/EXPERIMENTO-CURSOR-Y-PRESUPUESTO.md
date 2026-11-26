# Intercalación de una proyección durante la selección

Prueba local en PGlite y PostgreSQL 17.12, código funcional de Trans02 en `89c5925d7a30e70ff41cd81539408d8b0282b92c`. Se usó el sink, el proyector y el selector reales, una política sintética permisiva y registros privados del mismo actor. Se introdujo una barrera de prueba en latest después de leer las filas. El evento publicado durante la barrera produce una card adicional cuya consulta coincide con el texto buscado. No se modificaron el cursor ni el JSON persistido del snapshot por fuera de sus APIs.

| Observación | Resultado en ambos backends |
|---|---|
| Snapshot calculado durante la publicación | Solo alpha, watermark 2 |
| Reutilización inmediata de prepared | Solo alpha, mismo snapshot, watermark 2 |
| Lectura nueva sin cambiar el corpus | beta seguida de alpha, watermark 2 |
| Lectura del snapshot anterior tras corregir alpha a revisión 2 | Devuelve null |
| Petición inicial con 64 bytes y una ref | Cero refs |
| Misma consulta con 4000 bytes y tres refs, caché caliente | Cero refs, mismo snapshot de la petición pequeña |
| Control en frío con 4000 bytes y tres refs | Dos refs |

Las aserciones verifican la existencia de ambos defectos y el control de corrección de revisiones. La prueba demuestra inconsistencia de selección y pérdida de contexto disponible en las condiciones descritas. El alcance de autorización se mantiene fijo durante el experimento.

Desde la raíz del worktree, guardar el siguiente bloque en un archivo temporal .mts y ejecutarlo con node --import tsx. La variable opcional ASTRA_TEST_POSTGRES_URL selecciona una base PostgreSQL efímera. Sin ella se usa PGlite.

```ts
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {createStore} from '/workspace/astra-trans02/apps/server/src/db.ts';
import {CognitiveProjectionStore,DurableEventSink,installCognitionV2} from '/workspace/astra-trans02/apps/server/src/engine/cognition/v2/storage.ts';
import {CognitiveProjector} from '/workspace/astra-trans02/apps/server/src/engine/cognition/v2/projector.ts';
import {ContextServingFacade} from '/workspace/astra-trans02/apps/server/src/engine/cognition/v2/context.ts';
import {record} from '/workspace/astra-trans02/tests/fixtures/cognition-v2/record.ts';

const db=await createStore({databaseUrl:process.env.ASTRA_TEST_POSTGRES_URL});
try {
  await installCognitionV2(db);
  const tenant=randomUUID();
  const identity={tenantId:tenant,owner:'alice',actorId:'alice',policyRevision:'1',purpose:'chat' as const};
  const store=new CognitiveProjectionStore(db);
  const sink=new DurableEventSink(db,db,new Set([tenant]));
  const projector=new CognitiveProjector(store);
  const context=new ContextServingFacade(store,{authorize:async()=>true});
  async function publish(id:string,body:string,revision=1) {
    const item={...record(tenant,'alice',id),body,revision};
    await sink.write({id:randomUUID(),tenantId:tenant,owner:'alice',schemaVersion:'1.0',type:'cognition.v2.record.proposed',
      source:{kind:'system',id:'audit-fixture'},emittedAt:item.createdAt,payload:{record:item}});
    assert.equal(await projector.tick(tenant),1);
  }

  await publish('alpha','analítica preliminar');
  const latest=store.latest.bind(store);
  let interrupt=true;
  store.latest=async (...args)=>{
    const rows=await latest(...args);
    if(interrupt){interrupt=false;await publish('beta','conciliación');}
    return rows;
  };
  const params={query:'conciliación',maxTokens:4000,maxRefs:3};
  const during=await context.getSnapshot(identity,params);
  const reused=await context.prepared(identity,params.query,params.maxTokens,params.maxRefs);
  const fresh=await context.getSnapshot(identity,params);
  console.log(JSON.stringify({phase:'cursor',during:during.refs.map(r=>r.id),cached:reused.refs.map(r=>r.id),cold:fresh.refs.map(r=>r.id),watermarks:[during.watermark,reused.watermark,fresh.watermark]}));
  assert.equal(reused.id,during.id);
  assert.deepEqual(reused.refs.map(r=>r.id),['alpha']);
  assert.deepEqual(fresh.refs.map(r=>r.id),['beta','alpha']);
  assert.equal(during.watermark,'2');
  await publish('alpha','revisión corregida',2);
  assert.equal(await context.readSnapshot(identity,during.id),null);

  const small=await context.prepared(identity,'segundo presupuesto',64,1);
  const warm=await context.prepared(identity,'segundo presupuesto',4000,3);
  const cold=await context.getSnapshot(identity,{query:'segundo presupuesto',maxTokens:4000,maxRefs:3});
  assert.equal(small.id,warm.id);
  console.log(JSON.stringify({phase:'budget',small:small.refs.length,warm:warm.refs.length,cold:cold.refs.length}));
  assert.equal(warm.refs.length,0);
  assert.equal(cold.refs.length,2);
}finally{await db.close();}

```
