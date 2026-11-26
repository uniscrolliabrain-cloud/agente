# Dos cierres incompatibles del mismo despacho

Se ejecutó ActionService.propose y ActionService.decide contra PGlite y PostgreSQL 17.12. El adaptador de correo fue un doble local cuya promesa se liberó en un orden controlado. El experimento envejece únicamente la fecha del intento en una base efímera para que el barrido lo seleccione. La llamada de red está sustituida, mientras que claim, lecturas, CAS y persistencia se ejecutan con la implementación del repositorio.

| Orden | Filas contabilizadas por el barrido | Ejecuciones del doble | Acción final | Intención final | Resultado según la intención |
|---|---:|---:|---|---|---|
| La acción recibe su confirmación antes del CAS del barrido | 0 | 1 | succeeded | reconciled | outcome_unknown |
| El barrido termina antes de devolver la confirmación al escritor | 1 | 1 | succeeded | reconciled | outcome_unknown |
| Control sin barrido | 0 | 1 | succeeded | settled | succeeded |

Resultados idénticos en ambos backends. En el primer orden el CAS sobre la acción ya no encuentra executing, pero el segundo CAS logra escribir outcome_unknown en la intención pendiente. En el segundo orden run persiste la confirmación por put y settleDispatch solo intenta actualizar una intención pending. El registro reconciled conserva su estado anterior. Las dos causas obligan a revisar tanto el escritor ordinario como el reconciliador.

El siguiente experimento se ejecuta desde la raíz de Trans01 con Node 24.22.3 y tsx del lockfile. Guardar temporalmente el bloque como archivo .mts fuera del checkout. Las rutas de importación identifican el worktree utilizado. Para la variante PostgreSQL sustituir createStore() por createStore({databaseUrl:process.env.TEST_DATABASE_URL}) apuntando a una base efímera vacía. El script verifica el comportamiento observado en la revisión auditada. Tras el futuro arreglo deberán cambiar las expectativas de resultado incoherente.

```ts
import assert from 'node:assert/strict';
import {createStore} from '/workspace/astra-trans01/apps/server/src/db.ts';
import {ActionService} from '/workspace/astra-trans01/apps/server/src/actions.ts';

const db=await createStore();
try {
 for (const timing of ['receipt-first','sweep-first','control']){
  const owner=timing;
  let releaseProvider, announceCall,releaseSettle,announceSettle;
  const providerWait=new Promise(r=>releaseProvider=r), providerIn=new Promise(r=>announceCall=r);
  const settleWait=new Promise(r=>releaseSettle=r), atSettle=new Promise(r=>announceSettle=r);
  const writer=Object.create(db);
  writer.compareAndSwap=async (...args)=>{
   if(args[1]==='action-dispatch'&&args[4]?.status==='settled'){
    announceSettle(); await settleWait;
   }
   return db.compareAndSwap(...args);
  };
  const opts={connected:async()=>true,execute:async()=>{calls++;announceCall();await providerWait;return 'fixture-confirmation';}};
  let calls=0;
  const action=new ActionService(writer,opts);
  const proposal=await action.propose(owner,{kind:'email.send',data:{to:['a@example.test'],subject:'test',body:'fixture',cc:[],bcc:[],attachmentIds:[]}});
  const deciding=action.decide(owner,proposal.id,proposal.hash,'approve');
  await providerIn;
  const intent=await db.get(owner,'action-dispatch',proposal.id);
  await db.put(owner,'action-dispatch',{...intent,decidedAt:'2001-01-01T00:00:00Z'});
  const reader=Object.create(db);
  reader.compareAndSwap=async (...args)=>{
    if(args[1]==='actions'&&timing==='receipt-first'){releaseProvider();await atSettle;}
    return db.compareAndSwap(...args);
  };
  const count=timing==='control'?0:await new ActionService(reader,opts).reconcileDispatchIntents();
  releaseProvider();releaseSettle();await deciding;
  const a=await db.get(owner,'actions',proposal.id), i=await db.get(owner,'action-dispatch',proposal.id);
  console.log(JSON.stringify({timing,count,calls,action:a.status,intent:i.status,actionStatus:i.actionStatus}));
  assert.equal(calls,1);assert.equal(a.status,'succeeded');
  assert.equal(i.actionStatus,timing==='control'?'succeeded':'outcome_unknown');
 }
} finally {await db.close();}

```
