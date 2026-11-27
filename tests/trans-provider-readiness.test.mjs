import test from "node:test";
import assert from "node:assert/strict";
import { SPECS, inspect, probe, main } from "../scripts/trans-provider-readiness.mjs";
const spec=id=>SPECS.find(s=>s.id===id);
const ok=()=>new Response(null,{status:200});
test("all 42 identifiers are unique and all campaigns covered",()=>{
 assert.equal(SPECS.length,new Set(SPECS.map(s=>s.id)).size);
 assert.equal(new Set(SPECS.flatMap(s=>s.campaigns)).size,7);
});
test("without credentials every provider remains an explicit stub",()=>{
 assert.ok(SPECS.every(s=>inspect(s,{}).status.startsWith("stub")));
});
test("aliases preserve separation of Slow and JEV",()=>{
 assert.equal(inspect(spec("slow-deepseek"),{OPENROUTER_API_KEY:"fixture",SLOW_LLM_MODEL:"model"}).status,"stub_missing_config");
 assert.equal(inspect(spec("jev"),{OPEN_ROUTER_API_KEY:"fixture",OPENROUTER_API_KEY:"fixture"}).status,"invalid_config");
 assert.equal(inspect(spec("whatsapp"),{WHATSAPP_ACCESS_TOKEN:"fixture",WHATSAPP_PHONE_NUMBER_ID:"fixture",WHATSAPP_BUSINESS_ACCOUNT_ID:"fixture"}).status,"configured_unverified");
});
test("database role guard rejects identical DSNs",()=>{
 assert.equal(inspect(spec("db-migrations"),{DATABASE_URL:"fixture",DATABASE_MIGRATION_URL:"fixture"}).status,"invalid_config");
 assert.equal(inspect(spec("db-business"),{DATABASE_URL:"fixture",BUSINESS_DATABASE_URL:"fixture"}).status,"invalid_config");
});
test("missing config and pending wiring never invoke transport",async()=>{
 const never=()=>assert.fail("transport invoked");
 assert.equal((await probe(spec("gemini"),{},never)).status,"stub_missing_config");
 assert.equal((await probe(spec("fast-muse"),{MUSE_API_KEY:"fixture",FAST_LLM_MODEL:"fixture"},never)).status,"stub_wiring_pending");
});
test("configured probe uses correct credential but emits only status",async()=>{
 let calls=0;
 const secret="unique-secret-fixture";
 const result=await probe(spec("gemini"),{GEMINI_API_KEY:secret},async(url,opts)=>{
  calls++;assert.equal(opts.headers["x-goog-api-key"],secret);
  assert.ok(!url.includes(secret));assert.equal(opts.redirect,"error");return ok();
 });
 assert.equal(calls,1);assert.equal(result.status,"probe_pass");assert.ok(!JSON.stringify(result).includes(secret));
});
test("403 and transport errors are sanitized",async()=>{
 const env={GEMINI_API_KEY:"fixture"};
 const denied=await probe(spec("gemini"),env,async()=>new Response("private-response",{status:403}));
 assert.equal(denied.checks[0].status,"permission_denied");
 assert.ok(!JSON.stringify(denied).includes("private-response"));
 const failed=await probe(spec("gemini"),env,async()=>{throw new Error("private-exception");});
 assert.equal(failed.status,"probe_failed");assert.ok(!JSON.stringify(failed).includes("private-exception"));
});
const googleEnv={GOOGLE_CLIENT_ID:"id",GOOGLE_CLIENT_SECRET:"secret",GOOGLE_REFRESH_TOKEN:"refresh",GOOGLE_TEST_ACCOUNT_EMAIL:"fixture@example.invalid"};
const scopes=["gmail.modify","drive.readonly","drive.file","calendar.readonly","calendar.events","meetings.space.created","meetings.space.readonly","documents","spreadsheets","presentations","contacts.readonly","tasks"].map(s=>"https://www.googleapis.com/auth/"+s).join(" ");
test("Google refresh and twelve scopes, six API reads, no token in report",async()=>{
 let count=0;
 const row=await probe(spec("google-workspace"),googleEnv,async(url,opts)=>{
  count++;
  if(count===1){assert.equal(opts.method,"POST");return Response.json({access_token:"private-access",scope:scopes});}
  assert.equal(opts.headers.Authorization,"Bearer private-access");
  if(count===2)return Response.json({emailAddress:googleEnv.GOOGLE_TEST_ACCOUNT_EMAIL});
  return ok();
 });
 assert.equal(count,7);assert.equal(row.status,"probe_pass");assert.ok(!JSON.stringify(row).includes("private-access"));
});
test("wrong Google account stops before other Workspace APIs",async()=>{
 let count=0;
 const row=await probe(spec("google-workspace"),googleEnv,async()=>{
  count++;
  return count===1?Response.json({access_token:"fixture",scope:scopes}):Response.json({emailAddress:"wrong@example.invalid"});
 });
 assert.equal(count,2);assert.equal(row.status,"probe_failed");assert.ok(row.checks.some(c=>c.status==="account_mismatch"));
});
test("live probes need an explicit provider filter",async()=>{
 await assert.rejects(main(["--probe"],{}));
 await assert.rejects(main(["--only=unknown"],{}));
});
