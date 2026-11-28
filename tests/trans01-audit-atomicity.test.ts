import assert from "node:assert/strict";
import { test } from "node:test";
import { createStore } from "../apps/server/src/db.ts";
import { StoreAuditStore } from "../apps/server/src/kernel/audit/store-store.ts";

test("an entry write failure rolls back its audit anchor", async () => {
  const db = await createStore();
  try {
    const failing = Object.create(db) as typeof db;
    failing.put = async () => { throw new Error("write failed"); };
    const audit = new StoreAuditStore(failing);
    await assert.rejects(() => audit.append({tenantId:"T",owner:"alice",action:"turn.opened",actor:{kind:"system",id:"test"},payload:{}}), /write failed/);
    assert.equal(await db.get("T", "audit-entries", "__audit_anchor__"), null);
  } finally { await db.close(); }
});

test("verification errors prevent verifyAndAppend from writing", async () => {
  const db = await createStore();
  try {
    const audit = new StoreAuditStore(db);
    audit.verify = async () => { throw new Error("read failed"); };
    await assert.rejects(() => audit.verifyAndAppend({tenantId:"T",owner:"alice",action:"turn.opened",actor:{kind:"system",id:"test"},payload:{}}), /read failed|corrupto/);
    assert.equal(await db.count("T", "audit-entries"), 0);
  } finally { await db.close(); }
});

test("verification covers page boundaries, tied timestamps and the chain endpoints", async () => {
  const db = await createStore();
  try {
    const audit = new StoreAuditStore(db);
    const ids: string[] = [];
    await db.transaction(async () => {
      for (let i = 0; i < 1002; i++) {
        const entry = await audit.append({tenantId:"T",owner:"alice",action:"turn.opened",actor:{kind:"system",id:"test"},payload:{sequence:i}});
        ids.push(entry.id);
      }
    });
    assert.equal(await audit.verify("T"), true);
    await db.remove("T", "audit-entries", ids[0]);
    assert.equal(await audit.verify("T"), false);
  } finally { await db.close(); }
});
