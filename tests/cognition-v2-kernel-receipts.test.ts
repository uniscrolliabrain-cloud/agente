import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createStore} from '../apps/server/src/db.ts';
import {TenantScopedStore} from '../apps/server/src/db-tenant.ts';
import {currentTenantScope} from '../apps/server/src/tenant-scope.ts';
import {installCognitionV2,DurableEventSink} from '../apps/server/src/engine/cognition/v2/storage.ts';
import {KernelReceiptProjector} from '../apps/server/src/engine/cognition/v2/kernel-receipts.ts';
import type {SystemEvent} from '../apps/server/src/engine/events/types.ts';
const event=(tenantId:string,id='same-event'):SystemEvent=>({id,tenantId,owner:'alice',type:'policy.denied',schemaVersion:'1.0',emittedAt:'2026-11-16T00:00:00Z',source:{kind:'system',id:'kernel'},payload:{reason:'synthetic denial'}} as SystemEvent);
test('C02 audit and notification effects rollback together with inbox, then recover from durable journal after restart',async()=>{
 const db=await createStore();let now=Date.parse('2026-11-16T00:00:00Z');
 try{
  await installCognitionV2(db);const tenants=new Set(['A','B']);
  const records=new TenantScopedStore(db,async()=>currentTenantScope()!.tenantId);
  const sink=new DurableEventSink(db,records,tenants);await sink.write(event('A'));await sink.write(event('B'));
  const insert=db.insertIfAbsent.bind(db);db.insertIfAbsent=async(owner,kind,value)=>{if(kind==='notifications')throw Error('synthetic store failure');return insert(owner,kind,value);};
  const first=new KernelReceiptProjector(db,records,tenants,()=>now);assert.equal(await first.tick('A'),0);
  assert.equal(await db.get('A:A','kernel-audit-index','ka-same-event'),null,'partial audit write rolled back');
  assert.equal(Number((await db.rawQuery<{sequence:string}>("SELECT sequence FROM cognition_v2_cursors WHERE tenant='A' AND consumer='kernel-receipts-v2.1'"))[0].sequence),0);
  db.insertIfAbsent=insert;now+=1001;
  const restarted=new KernelReceiptProjector(db,records,tenants,()=>now);assert.equal(await restarted.tick('A'),1);assert.equal(await restarted.tick('B'),1);
  assert.ok(await db.get('A:A','kernel-audit-index','ka-same-event'));assert.ok(await db.get('B:B','kernel-audit-index','ka-same-event'));
  const notification=await db.get<{id:string;read:boolean}>('A:alice','notifications','kn-same-event');assert.ok(notification);
  await db.put('A:alice','notifications',{...notification,read:true});
  await db.rawQuery("UPDATE cognition_v2_cursors SET sequence=0 WHERE tenant='A' AND consumer='kernel-receipts-v2.1'");
  assert.equal(await restarted.tick('A'),1);assert.equal((await db.get<{read:boolean}>('A:alice','notifications','kn-same-event'))?.read,true,'replay never resets user read state');
  assert.equal((await db.list('A:alice','notifications')).length,1);assert.equal((await db.list('B:alice','notifications')).length,1);
  await assert.rejects(restarted.tick('C'),/DENIED/);
 }finally{await db.close();}
});
const postgres=process.env.COGNITION_TEST_POSTGRES_URL;
test('C02 native competing receipt workers commit one projection under tenant fence',{skip:!postgres},async()=>{
 const db=await createStore({databaseUrl:postgres}),other=await createStore({databaseUrl:postgres});
 try{
  await installCognitionV2(db);const tenant='receipts-'+crypto.randomUUID(),tenants=new Set([tenant]);
  await new DurableEventSink(db,db,tenants).write(event(tenant));
  const workers=[new KernelReceiptProjector(db,db,tenants),new KernelReceiptProjector(other,other,tenants)];
  const counts=await Promise.all(workers.map(w=>w.tick(tenant)));assert.equal(counts.reduce((a,b)=>a+b,0),1);
  assert.equal((await db.list(tenant+':alice','notifications')).length,1);
  assert.equal((await db.rawQuery("SELECT event_id FROM cognition_v2_inbox WHERE tenant=$1 AND consumer='kernel-receipts-v2.1' AND status='committed'",[tenant])).length,1);
 }finally{await db.close();await other.close();}
});

test('C02 durable tenants bypass live-only callbacks while non-migrated tenants retain compatibility',async()=>{
 const {globalSubscribers}=await import('../apps/server/src/engine/events/subscriber.ts');
 const {startKernelAuditConsumer}=await import('../apps/server/src/kernel/subscribers/audit-consumer.ts');
 const {startKernelNotificationsConsumer}=await import('../apps/server/src/kernel/subscribers/notifications-consumer.ts');
 const db=await createStore();const handles=[startKernelAuditConsumer(db,[],new Set(['A'])),startKernelNotificationsConsumer(db,[],new Set(['A']))];
 try{
  globalSubscribers.publish(event('A'));await new Promise(r=>setImmediate(r));
  assert.equal(await db.get('A','kernel-audit-index','ka-same-event'),null);assert.equal(await db.get('alice','notifications','kn-same-event'),null);
  globalSubscribers.publish(event('B'));await new Promise(r=>setTimeout(r,50));
  assert.ok(await db.get('B','kernel-audit-index','ka-same-event'));assert.ok(await db.get('alice','notifications','kn-same-event'));
 }finally{for(const h of handles)h.stop();await db.close();}
});
