import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const run = promisify(execFile);
const root = fileURLToPath(new URL("../../../", import.meta.url));

test("worker restores tenant, requester and checkpoint from disk in another process", { timeout: 240000 }, async () => {
  const prefix = join(tmpdir(), "nc-worker-restart-");
  const dataDir = await mkdtemp(prefix);
  const common = `import assert from 'node:assert/strict';
    import {createStore} from './apps/server/src/db.ts';
    import {TenantScopedStore} from './apps/server/src/db-tenant.ts';
    import {TaskWorker} from './apps/server/src/engine/worker.ts';
    import {currentTenantScope} from './apps/server/src/tenant-scope.ts';
    const store=await createStore({dataDir:${JSON.stringify(dataDir)}});
    const db=new TenantScopedStore(store,async()=>currentTenantScope()?.tenantId??'tenant-a');
    const owner='restart-user';`;
  const first = common + `
    const now=new Date().toISOString();
    const make=(tenantId,status)=>({id:'same-id',tenantId,requestedBy:'actor-'+tenantId,
      executionContext:{tenantId,owner,actorId:'actor-'+tenantId},title:'restart',prompt:'test',kind:'agent',status,
      plan:[],evidence:[],input:{},state:{},createdAt:now,updatedAt:now,attempts:0,artifactIds:[],leaseId:null,leaseUntil:null});
    await store.put('tenant-a:'+owner,'tasks',make('tenant-a','paused'));
    await store.put('tenant-b:'+owner,'tasks',make('tenant-b','queued'));
    const worker=new TaskWorker(db,async(_owner,task,ctx)=>{
      assert.equal(currentTenantScope().tenantId,'tenant-b');
      await ctx.checkpoint({state:{phase:1}});
      // Close storage to flush it, then terminate before the handler returns.
      // This proves process restart, not an unflushed power-loss guarantee.
      await store.close();
      console.log('checkpoint-persisted');
      process.exit(27);
    },{now:()=>Date.now()-120000,leaseMs:60000});
    await worker.tick();`;
  try {
    await assert.rejects(run(process.execPath, ["--import", "tsx", "--input-type=module", "-e", first], { cwd: root, timeout: 110000 }), (error: unknown) => {
      const result = error as { code?: number; stdout?: string };
      assert.equal(result.code, 27, String(error));
      assert.match(result.stdout ?? "", /checkpoint-persisted/);
      return true;
    });
    const second = common + `
      assert.deepEqual(db.allTenantPrefixes(),[]);
      let calls=0;
      await new TaskWorker(db,async(_owner,task,ctx)=>{
        calls++;
        assert.equal(task.state.phase,1);
        assert.equal(currentTenantScope().tenantId,'tenant-b');
        assert.equal(currentTenantScope().actorId,'actor-tenant-b');
        await ctx.guard();
        await ctx.event('step','resumed from checkpoint');
        return {status:'succeeded',state:{phase:2}};
      }).tick();
      const a=await store.get('tenant-a:'+owner,'tasks','same-id');
      const b=await store.get('tenant-b:'+owner,'tasks','same-id');
      const aEvents=await store.list('tenant-a:'+owner,'run-events');
      const bEvents=await store.list('tenant-b:'+owner,'run-events');
      console.log(JSON.stringify({calls,a:a.status,b:b.status,phase:b.state.phase,attempts:b.attempts,
        requester:b.requestedBy,aEvents:aEvents.length,bEvents:bEvents.length}));
      await store.close();`;
    const result = await run(process.execPath, ["--import", "tsx", "--input-type=module", "-e", second], { cwd: root, timeout: 110000 });
    const evidence = JSON.parse(result.stdout.trim().split("\n").at(-1)!);
    assert.equal(evidence.calls, 1);
    assert.equal(evidence.a, "paused");
    assert.equal(evidence.b, "succeeded");
    assert.equal(evidence.phase, 2);
    assert.equal(evidence.attempts, 2);
    assert.equal(evidence.requester, "actor-tenant-b");
    assert.equal(evidence.aEvents, 0);
    assert.ok(evidence.bEvents > 0);
  } finally {
    const target = resolve(dataDir);
    assert.ok(target.startsWith(resolve(prefix)) && target !== resolve(tmpdir()));
    await rm(target, { recursive: true, force: true });
  }
});
