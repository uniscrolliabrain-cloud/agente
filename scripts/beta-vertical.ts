const base = process.env.OPENMUSE_URL ?? "http://127.0.0.1:8787";
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
async function req(path: string, init: RequestInit = {}) {
  const res = await fetch(`${base}${path}`, { ...init, headers: { "content-type": "application/json", ...(init.headers ?? {}) } });
  const text = await res.text();
  let body: any; try { body = JSON.parse(text); } catch { body = text; }
  if (!res.ok) throw new Error(`${res.status}: ${JSON.stringify(body)}`);
  return body;
}
const session = await req("/api/session", { method: "POST", body: "{}" });
const h = { Authorization: `Bearer ${session.token}` };
const r = (path: string, init: RequestInit = {}) => req(path, { ...init, headers: { ...h, ...(init.headers ?? {}) } });
await r("/api/skills", { method: "POST", body: JSON.stringify({ id: "alta-cliente", name: "Alta Cliente Agencia", description: "Built-in beta skill", entrypoint: "main.py", requirements: [] }) });
const command = "python3 /workspace/skills/alta-cliente/main.py '" + JSON.stringify({ email: "{{input.email}}", cif: "{{input.cif}}" }) + "'";
await r("/api/sops", { method: "POST", body: JSON.stringify({
  id: "beta-computer", name: "Beta Computer Skill", description: "Runs the built-in skill in the isolated computer", category: "QA",
  trigger: { type: "manual", value: "" }, skillId: "alta-cliente", active: true,
  steps: [
    { id: "run", title: "Run skill", tool: "computer_command", params: { command, operationId: "alta-cliente-smoke" } },
    { id: "report", title: "Save result", tool: "save_artifact", params: { title: "Skill result", summary: "Built-in skill executed", data: { result: "{{run}}" } } }
  ],
  allowedTools: ["computer_command", "save_artifact"]
}) });
const task = await r("/api/agent/tasks", { method: "POST", body: JSON.stringify({ kind: "sop", title: "Beta computer vertical", prompt: "Execute the skill", input: { sopId: "beta-computer", email: "client@example.com", cif: "B12345678" } }) });
for (let i = 0; i < 80; i++) {
  const d = await r(`/api/agent/tasks/${task.id}`);
  if (["succeeded", "failed", "cancelled", "waiting_input", "waiting_approval"].includes(d.task.status)) {
    console.log(JSON.stringify({ ok: d.task.status === "succeeded", status: d.task.status, taskId: task.id, error: d.task.error ?? null }, null, 2));
    if (d.task.status !== "succeeded") process.exitCode = 1;
    process.exit();
  }
  await sleep(500);
}
throw new Error("Timed out waiting for beta computer vertical");
