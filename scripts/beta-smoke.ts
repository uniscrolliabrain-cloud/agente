const base = process.env.OPENMUSE_URL ?? "http://127.0.0.1:8787";
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
async function request(path: string, init: RequestInit = {}) {
  const res = await fetch(`${base}${path}`, { ...init, headers: { "content-type": "application/json", ...(init.headers ?? {}) } });
  const text = await res.text();
  let body: any; try { body = JSON.parse(text); } catch { body = text; }
  if (!res.ok) throw new Error(`${init.method ?? "GET"} ${path} -> ${res.status}: ${JSON.stringify(body)}`);
  return body;
}
const session = await request("/api/session", { method: "POST", body: "{}" });
const auth = { Authorization: `Bearer ${session.token}` };
const r = (path: string, init: RequestInit = {}) => request(path, { ...init, headers: { ...auth, ...(init.headers ?? {}) } });
await r("/api/agent/sample-business-records", { method: "POST", body: JSON.stringify([{ id: "client-1", name: "Acme Demo", cif: "B12345678", email: "client@example.com" }]) });
await r("/api/skills", { method: "POST", body: JSON.stringify({ id: "beta-report", name: "Beta Report", description: "No-op metadata skill for smoke testing", entrypoint: "main.py" }) });
await r("/api/sops", { method: "POST", body: JSON.stringify({
  id: "beta-vertical", name: "Beta Vertical", description: "Deterministic smoke SOP", category: "QA",
  trigger: { type: "manual", value: "" }, active: true,
  steps: [
    { id: "lookup", title: "Lookup client", tool: "query_business", params: { source: "postgres", query: "SELECT * FROM clients WHERE cif = '{{input.cif}}'" } },
    { id: "report", title: "Save report", tool: "save_artifact", params: { title: "Client lookup", summary: "Client lookup completed", data: { lookup: "{{lookup}}" } } }
  ],
  allowedTools: ["query_business", "save_artifact"]
}) });
const task = await r("/api/agent/tasks", { method: "POST", body: JSON.stringify({ kind: "sop", title: "Beta smoke", prompt: "Run the beta vertical SOP", input: { sopId: "beta-vertical", cif: "B12345678" } }) });
let latest: any = task;
for (let i = 0; i < 60; i++) {
  latest = await r(`/api/agent/tasks/${task.id}`);
  const status = latest.task.status;
  if (["succeeded", "failed", "cancelled", "waiting_input", "waiting_approval"].includes(status)) break;
  await sleep(250);
}
if (latest.task.status !== "succeeded") throw new Error(`SOP smoke did not finish: ${latest.task.status} ${latest.task.error ?? latest.task.question ?? ""}`);
const workspace = await r("/api/agent");
const learned = workspace.memories.filter((m: any) => m.source === `sop:${task.id}`);
const artifacts = latest.artifacts.filter((a: any) => a.taskId === task.id);
if (!learned.length || !artifacts.length) throw new Error("SOP completed but learning/artifact assertions failed");
console.log(JSON.stringify({ ok: true, taskId: task.id, status: latest.task.status, artifacts: artifacts.length, learned: learned.length }, null, 2));
