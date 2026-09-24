import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import type { AgentTask } from "../../../../packages/domain/src/agent.ts";
import { emailDraftSchema, eventDraftSchema } from "../../../../packages/domain/src/index.ts";
import { sopSchema, type SOP, type SOPStep } from "../../../../packages/domain/src/sop.ts";
import { AppError } from "../errors.ts";
import type { AgentService } from "./service.ts";
import type { TaskContext } from "./worker.ts";

const root = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))));
const interpolate = (value: unknown, task: AgentTask, results: Record<string, unknown>) => {
  if (typeof value !== "string") return value;
  return value.replace(/\{\{\s*([^}]+)\s*\}\}/g, (_, key: string) => {
    const path = key.trim().split(".");
    let current: unknown = results;
    if (path[0] === "input") current = task.input, path.shift();
    else if (path[0] === "state") current = task.state, path.shift();
    for (const part of path) current = current && typeof current === "object" ? (current as Record<string, unknown>)[part] : undefined;
    return current === undefined || current === null ? "" : typeof current === "string" ? current : JSON.stringify(current);
  });
};
const deepInterpolate = (value: unknown, task: AgentTask, results: Record<string, unknown>): unknown => {
  if (typeof value === "string") return interpolate(value, task, results);
  if (Array.isArray(value)) return value.map((x) => deepInterpolate(x, task, results));
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, deepInterpolate(v, task, results)]));
  return value;
};

export class SOPExecutor {
  constructor(private readonly service: AgentService) {}

  async execute(owner: string, initial: AgentTask, ctx: TaskContext): Promise<Partial<AgentTask>> {
    let task = initial;
    const sopId = String(task.state.sopId ?? task.input.sopId ?? "");
    if (!sopId) throw new AppError("SOP task is missing state.sopId", 422);
    const raw = await this.service.db.get(owner, "sops", sopId);
    if (!raw) throw new AppError(`SOP not found: ${sopId}`, 404);
    const sop = sopSchema.parse(raw);
    if (!sop.active) throw new AppError(`SOP is inactive: ${sop.name}`, 409);

    const results = (task.state.sopResults as Record<string, unknown> | undefined) ?? {};
    const stack = (task.state.sopStack as string[] | undefined) ?? [sop.id];
    if (stack.length > 4) throw new AppError("Nested SOP depth limit exceeded", 409);
    if (new Set(stack).size !== stack.length) throw new AppError("SOP cycle detected", 409);

    task = await ctx.checkpoint({
      state: { ...task.state, sopId: sop.id, sopVersion: sop.updatedAt, sopStepIndex: Number(task.state.sopStepIndex ?? 0), sopResults: results, sopStack: stack },
    });

    if (sop.skillId) await this.ensureSkill(owner, sop.skillId, task, ctx);

    let index = Number(task.state.sopStepIndex ?? 0);
    while (index < sop.steps.length) {
      await ctx.guard();
      const step = sop.steps[index];
      if (sop.allowedTools.length && !sop.allowedTools.includes(step.tool)) {
        throw new AppError(`SOP ${sop.id} does not allow tool ${step.tool}`, 422);
      }
      const plan = task.plan.map((p, i) => i === index ? { ...p, status: "running" as const } : p);
      task = await ctx.checkpoint({ plan, state: { ...task.state, sopStepIndex: index } });
      await ctx.event("step", `SOP ${index + 1}/${sop.steps.length}: ${step.title}`);
      const approvalResult = task.state.approvalResult;
      const outcome = approvalResult !== undefined && (step.tool === "prepare_email" || step.tool === "prepare_event")
        ? approvalResult
        : await this.runStep(owner, sop, step, task, ctx, results);
      if (outcome && typeof outcome === "object" && "status" in outcome && (outcome.status === "waiting_input" || outcome.status === "waiting_approval")) {
        const waiting = outcome.status === "waiting_input"
          ? { status: "waiting_input" as const, question: String((outcome as any).question ?? step.prompt ?? step.title), plan: task.plan.map((p, i) => i === index ? { ...p, status: "waiting" as const } : p) }
          : { status: "waiting_approval" as const, actionId: String((outcome as any).actionId ?? task.actionId ?? ""), plan: task.plan.map((p, i) => i === index ? { ...p, status: "waiting" as const } : p) };
        await ctx.checkpoint({ state: { ...task.state, sopStepIndex: index, sopResults: results, ...(approvalResult !== undefined ? { approvalResult: undefined } : {}) } });
        return waiting;
      }
      results[step.id] = outcome;
      task = await ctx.checkpoint({
        plan: task.plan.map((p, i) => i === index ? { ...p, status: "succeeded" as const, detail: typeof outcome === "string" ? outcome.slice(0, 500) : JSON.stringify(outcome).slice(0, 500) } : p),
        state: { ...task.state, sopStepIndex: index + 1, sopResults: results },
      });
      index++;
    }

    const facts = [
      `SOP ${sop.name} completed successfully.`,
      ...Object.entries(results).slice(-8).map(([id, value]) => `Step ${id}: ${typeof value === "string" ? value.slice(0, 500) : JSON.stringify(value).slice(0, 500)}`),
    ];
    await this.service.learn(owner, task, facts);
    return this.service.finish(task, ctx, `SOP “${sop.name}” completed ${sop.steps.length} step(s).`);
  }

  private async runStep(owner: string, sop: SOP, step: SOPStep, task: AgentTask, ctx: TaskContext, results: Record<string, unknown>) {
    const params = deepInterpolate(step.params, task, results) as Record<string, unknown>;
    const prompt = interpolate(step.prompt, task, results);
    switch (step.tool) {
      case "ask_user":
        if (typeof task.state.answer === "string" && task.state.answer.trim()) return { answer: task.state.answer.trim() };
        return { status: "waiting_input", question: prompt || step.title } as const;
      case "read_workspace":
        return this.service.workspace.snapshot(owner);
      case "read_mail_thread": {
        const id = String(params.threadId ?? task.input.threadId ?? prompt);
        const mail = await this.service.workspace.thread(owner, id);
        return mail;
      }
      case "read_web": {
        const url = String(params.url ?? prompt);
        const page = await this.service.browser.observe(owner, url, typeof task.state.browserId === "string" ? task.state.browserId : undefined);
        await ctx.checkpoint({ state: { ...task.state, browserId: page.sessionId } });
        return { title: page.title, url: page.url, text: page.text.slice(0, 30000) };
      }
      case "computer_command": {
        await this.service.computer.start(owner);
        const command = String(params.command ?? prompt);
        const operationId = String(params.operationId ?? createHash("sha256").update(`${task.id}:${step.id}:${command}`).digest("hex").slice(0, 48));
        const receipt = await this.service.computer.execute(owner, { command, cwd: String(params.cwd ?? "/workspace") }, { idempotencyKey: `sop:${task.id}:${operationId}`, signal: ctx.signal });
        if (receipt.status !== "succeeded") throw new Error(receipt.stderr || `Computer command exited ${receipt.status}`);
        return receipt;
      }
      case "query_business": {
        const source = z.enum(["postgres", "csv", "api", "sheets"]).catch("postgres").parse(params.source);
        return this.service.business.query(owner, { source, query: String(params.query ?? prompt), params: params.params as Record<string, unknown> | undefined });
      }
      case "install_python_lib": {
        const requirements = (params.requirements ?? sop.pythonRequirements) as string[];
        if (!requirements.length) return { installed: [], note: "No Python requirements declared" };
        await this.service.computer.start(owner);
        const receipt = await this.service.computer.execute(owner, { command: `python3 -m pip install --no-input ${requirements.map((r) => `'${String(r).replace(/'/g, "'\\''")}'`).join(" ")}` }, { idempotencyKey: `sop:${task.id}:pip:${step.id}`, signal: ctx.signal });
        if (receipt.status !== "succeeded") throw new Error(receipt.stderr || "Python dependency installation failed; the sandbox has no network by design.");
        return receipt;
      }
      case "run_sop": {
        const childId = String(params.sopId ?? prompt);
        if ((task.state.sopStack as string[] | undefined)?.includes(childId)) throw new AppError("SOP cycle detected", 409);
        const child = await this.service.db.get(owner, "sops", childId);
        if (!child) throw new AppError(`Nested SOP not found: ${childId}`, 404);
        // Beta-safe nested execution: run the child in the same durable task and return its outputs.
        const nested = { ...task, state: { ...task.state, sopId: childId, sopStepIndex: 0, sopStack: [...((task.state.sopStack as string[] | undefined) ?? [sop.id]), childId], sopResults: {} } };
        const result = await this.execute(owner, nested, ctx);
        if (result.status && result.status !== "succeeded") return result;
        return result;
      }
      case "save_artifact": {
        const data = (params.data && typeof params.data === "object" ? params.data : { result: results }) as Record<string, unknown>;
        return this.service.artifact(owner, task, "report", String(params.title ?? step.title), String(params.summary ?? (prompt || step.title)), data, `sop:${step.id}`);
      }
      case "prepare_email": {
        const data = emailDraftSchema.parse(params.data ?? {
          to: params.to ?? task.input.email,
          subject: params.subject ?? step.title,
          body: params.body ?? prompt,
          cc: params.cc ?? [], bcc: params.bcc ?? [], attachmentIds: params.attachmentIds ?? [],
        });
        const proposal = await this.service.prepare(owner, task, { kind: "email.send", data }, `sop:${sop.id}:${step.id}:${JSON.stringify(data)}`, ctx);
        return { status: "waiting_approval", actionId: proposal.id };
      }
      case "prepare_event": {
        const data = eventDraftSchema.parse(params.data);
        const proposal = await this.service.prepare(owner, task, { kind: "calendar.create", data }, `sop:${sop.id}:${step.id}:${JSON.stringify(data)}`, ctx);
        return { status: "waiting_approval", actionId: proposal.id };
      }
      case "import_pdf": {
        const file = await this.service.workspace.importAttachment(owner, String(params.reference ?? prompt));
        return { id: file.id, name: file.name, fields: file.fields };
      }
      case "inspect_pdf": {
        const file = await this.service.files.get(owner, String(params.fileId));
        return { id: file.id, name: file.name, fields: file.fields, pageCount: file.pageCount };
      }
      case "fill_pdf": {
        const file = await this.service.files.fill(owner, String(params.fileId), z.record(z.string(), z.union([z.string(), z.boolean()])).parse(params.fields));
        return { id: file.id, name: file.name, fields: file.fields };
      }
      default:
        throw new AppError(`Unsupported SOP tool: ${step.tool}`, 422);
    }
  }

  private async ensureSkill(owner: string, skillId: string, task: AgentTask, ctx: TaskContext) {
    const skill = await this.service.db.get<any>(owner, "skills", skillId);
    if (!skill) throw new AppError(`Skill not found: ${skillId}`, 404);
    if (skill.active === false) throw new AppError(`Skill inactive: ${skillId}`, 409);
    await this.service.computer.start(owner);
    const source = join(root, "apps", "computer", "workspace-template", "skills", skillId);
    try {
      const files = await this.walk(source);
      for (const file of files) {
        const relative = file.slice(source.length + 1).replaceAll("\\", "/");
        const content = await readFile(file);
        const target = `/workspace/skills/${skillId}/${relative}`;
        const parent = target.slice(0, target.lastIndexOf("/"));
        await this.service.computer.mkdir(owner, parent);
        await this.service.computer.write(owner, target, content.toString("utf8"));
      }
      await ctx.event("observation", `Skill installed: ${skill.name}`, `${files.length} file(s) copied into /workspace/skills/${skillId}`);
    } catch {
      // A custom skill may already be installed by the user. The executor should not destroy it.
      await ctx.event("observation", `Skill ready: ${skill.name}`, "Using the existing sandbox skill workspace");
    }
  }

  private async walk(dir: string): Promise<string[]> {
    const { readdir } = await import("node:fs/promises");
    const entries = await readdir(dir, { withFileTypes: true });
    const result: string[] = [];
    for (const entry of entries) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) result.push(...await this.walk(path));
      else result.push(path);
    }
    return result;
  }
}
