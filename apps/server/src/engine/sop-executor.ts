import { createHash } from "node:crypto";
import { readFile, realpath } from "node:fs/promises";
import { join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import type { AgentTask } from "../../../../packages/domain/src/agent.ts";
import { emailDraftSchema, eventDraftSchema } from "../../../../packages/domain/src/index.ts";
import { sopSchema, type SOP, type SOPStep } from "../../../../packages/domain/src/sop.ts";
import { AppError } from "../errors.ts";
import type { AgentService } from "./service.ts";
import { LostLeaseError, type TaskContext } from "./worker.ts";

const root = fileURLToPath(new URL("../../../../", import.meta.url));
const interpolate = (value: unknown, task: AgentTask, results: Record<string, unknown>) => {
  if (typeof value !== "string") return value;
  return value.replace(/\{\{\s*([^}]+)\s*\}\}/g, (_, key: string) => {
    const path = key.trim().split(".");
    let current: unknown = results;
    if (path[0] === "input") current = task.input, path.shift();
    else if (path[0] === "state") current = task.state, path.shift();
    for (const part of path) {
      if (current && typeof current === "object") {
        // Numeric segments index into arrays. Anything else reads a property.
        if (Array.isArray(current) && /^\d+$/.test(part)) {
          current = current[Number(part)];
        } else {
          current = (current as Record<string, unknown>)[part];
        }
      } else {
        current = undefined;
        break;
      }
    }
    return current === undefined || current === null
      ? ""
      : typeof current === "string"
        ? current
        : JSON.stringify(current);
  });
};
const deepInterpolate = (value: unknown, task: AgentTask, results: Record<string, unknown>): unknown => {
  if (typeof value === "string") return interpolate(value, task, results);
  if (Array.isArray(value)) return value.map((x) => deepInterpolate(x, task, results));
  if (value && typeof value === "object")
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, deepInterpolate(v, task, results)]));
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

    // SOP version pinning: once a task starts against a version, later resumes must match it.
    const storedVersion = task.state.sopVersion;
    if (storedVersion !== undefined && storedVersion !== sop.updatedAt)
      throw new AppError(
        `SOP was edited while this task was in flight (started with ${String(storedVersion)}, now ${sop.updatedAt}). Start a new task.`,
        409,
      );

    // Fail-closed: an empty allowlist is a configuration error, not "everything is allowed".
    if (!sop.allowedTools.length)
      throw new AppError(`SOP ${sop.id} has an empty allowedTools allowlist`, 422);
    for (const step of sop.steps)
      if (!sop.allowedTools.includes(step.tool))
        throw new AppError(`SOP ${sop.id} does not allow tool ${step.tool}`, 422);

    const results = (task.state.sopResults as Record<string, unknown> | undefined) ?? {};
    const stack = (task.state.sopStack as string[] | undefined) ?? [sop.id];
    if (stack.length > 4) throw new AppError("Nested SOP depth limit exceeded", 409);
    if (new Set(stack).size !== stack.length) throw new AppError("SOP cycle detected", 409);

    // First run: synthesize the real plan from sop.steps. Resumes keep whatever they had.
    const plan =
      task.plan.length === 0
        ? sop.steps.map((s) => ({ id: s.id, title: s.title, status: "pending" as const }))
        : task.plan;

    task = await ctx.checkpoint({
      plan,
      state: {
        ...task.state,
        sopId: sop.id,
        sopVersion: storedVersion ?? sop.updatedAt,
        sopStepIndex: Number(task.state.sopStepIndex ?? 0),
        sopResults: results,
        sopStack: stack,
      },
    });

    if (sop.skillId) await this.ensureSkill(owner, sop.skillId, task, ctx);

    let index = Number(task.state.sopStepIndex ?? 0);
    while (index < sop.steps.length) {
      await ctx.guard();
      const step = sop.steps[index];
      const planRunning = task.plan.map((p, i) =>
        i === index ? { ...p, status: "running" as const } : p,
      );
      task = await ctx.checkpoint({ plan: planRunning, state: { ...task.state, sopStepIndex: index } });
      await ctx.event("step", `SOP ${index + 1}/${sop.steps.length}: ${step.title}`);

      const pendingApprovalId = task.state.pendingApprovalStepId;
      const approvalResult = task.state.approvalResult;
      const consumingApproval =
        approvalResult !== undefined &&
        pendingApprovalId === step.id &&
        (step.tool === "prepare_email" || step.tool === "prepare_event");

      let outcome: unknown;
      try {
        outcome = consumingApproval
          ? approvalResult
          : await this.runStep(owner, sop, step, task, ctx, results);
      } catch (error) {
        if (error instanceof LostLeaseError || ctx.signal.aborted) throw error;
        if (step.required === false) {
          const detail = error instanceof Error ? error.message : "Step failed";
          await ctx.event("step", `SOP step skipped: ${step.title}`, detail.slice(0, 500));
          results[step.id] = { skipped: true, error: detail.slice(0, 500) };
          task = await ctx.checkpoint({
            plan: task.plan.map((p, i) =>
              i === index
                ? {
                    ...p,
                    status: "succeeded" as const,
                    detail: `Skipped (required: false): ${detail.slice(0, 200)}`,
                  }
                : p,
            ),
            state: {
              ...task.state,
              sopStepIndex: index + 1,
              sopResults: results,
              ...(consumingApproval
                ? { approvalResult: undefined, pendingApprovalStepId: undefined }
                : {}),
            },
          });
          index++;
          continue;
        }
        throw error;
      }

      const consumedAnswer =
        outcome && typeof outcome === "object" && "consumed" in outcome && (outcome as any).consumed === true;

      if (
        outcome &&
        typeof outcome === "object" &&
        "status" in outcome &&
        (outcome.status === "waiting_input" || outcome.status === "waiting_approval")
      ) {
        const waiting =
          outcome.status === "waiting_input"
            ? {
                status: "waiting_input" as const,
                question: String((outcome as any).question ?? step.prompt ?? step.title),
                plan: task.plan.map((p, i) => (i === index ? { ...p, status: "waiting" as const } : p)),
              }
            : {
                status: "waiting_approval" as const,
                actionId: String((outcome as any).actionId ?? task.actionId ?? ""),
                plan: task.plan.map((p, i) => (i === index ? { ...p, status: "waiting" as const } : p)),
              };
        await ctx.checkpoint({
          state: {
            ...task.state,
            sopStepIndex: index,
            sopResults: results,
            ...(outcome.status === "waiting_input"
              ? { pendingInputStepId: (outcome as any).stepId }
              : {}),
            ...(outcome.status === "waiting_approval"
              ? { pendingApprovalStepId: (outcome as any).stepId }
              : {}),
            ...(consumingApproval
              ? { approvalResult: undefined, pendingApprovalStepId: undefined }
              : {}),
          },
        });
        return waiting;
      }

      results[step.id] = outcome;
      task = await ctx.checkpoint({
        plan: task.plan.map((p, i) =>
          i === index
            ? {
                ...p,
                status: "succeeded" as const,
                detail:
                  typeof outcome === "string"
                    ? outcome.slice(0, 500)
                    : JSON.stringify(outcome).slice(0, 500),
              }
            : p,
        ),
        state: {
          ...task.state,
          sopStepIndex: index + 1,
          sopResults: results,
          ...(consumedAnswer ? { answer: undefined, pendingInputStepId: undefined } : {}),
          ...(consumingApproval
            ? { approvalResult: undefined, pendingApprovalStepId: undefined }
            : {}),
        },
      });
      index++;
    }

    // Record a structural evidence entry so the task satisfies finish()'s evidence check.
    task = await ctx.checkpoint({
      evidence: [
        ...task.evidence,
        {
          id: `sop:${sop.id}:${task.id}`,
          kind: "user" as const,
          title: `SOP: ${sop.name}`,
          excerpt: `Completed ${sop.steps.length} step(s) at ${new Date().toISOString()}.`,
        },
      ],
    });

    // Promote ONLY structural facts. Never pass step outcomes: those may contain external content.
    const facts = [
      `SOP "${sop.name}" (${sop.id}) completed successfully.`,
      ...sop.steps.map((step, i) => `Step ${i + 1} "${step.title}" (tool: ${step.tool}).`),
    ];
    await this.service.learn(owner, task, facts);
    return this.service.finish(task, ctx, `SOP “${sop.name}” completed ${sop.steps.length} step(s).`);
  }

  private async runStep(
    owner: string,
    sop: SOP,
    step: SOPStep,
    task: AgentTask,
    ctx: TaskContext,
    results: Record<string, unknown>,
  ): Promise<unknown> {
    const params = deepInterpolate(step.params, task, results) as Record<string, unknown>;
    const prompt = interpolate(step.prompt, task, results);
    switch (step.tool) {
      case "ask_user": {
        const pendingId = task.state.pendingInputStepId;
        const answer = task.state.answer;
        if (pendingId === step.id && typeof answer === "string" && answer.trim())
          return { answer: answer.trim(), consumed: true };
        return { status: "waiting_input", question: prompt || step.title, stepId: step.id } as const;
      }
      case "read_workspace":
        return this.service.workspace.snapshot(owner);
      case "read_mail_thread": {
        const id = String(params.threadId ?? task.input.threadId ?? prompt);
        return this.service.workspace.thread(owner, id);
      }
      case "read_web": {
        const url = String(params.url ?? prompt);
        const page = await this.service.browser.observe(
          owner,
          url,
          typeof task.state.browserId === "string" ? task.state.browserId : undefined,
        );
        await ctx.checkpoint({ state: { ...task.state, browserId: page.sessionId } });
        return { title: page.title, url: page.url, text: page.text.slice(0, 30000) };
      }
      case "computer_command": {
        await this.service.computer.start(owner);
        const command = String(params.command ?? prompt);
        const operationId = String(
          params.operationId ??
            createHash("sha256").update(`${task.id}:${step.id}:${command}`).digest("hex").slice(0, 48),
        );
        const receipt = await this.service.computer.execute(
          owner,
          { command, cwd: String(params.cwd ?? "/workspace") },
          { idempotencyKey: `sop:${task.id}:${operationId}`, signal: ctx.signal },
        );
        if (receipt.status !== "succeeded")
          throw new Error(receipt.stderr || `Computer command exited ${receipt.status}`);
        return receipt;
      }
      case "query_business": {
        const source = z.enum(["postgres", "csv", "api", "sheets"]).catch("postgres").parse(params.source);
        return this.service.business.query(owner, {
          source,
          query: String(params.query ?? prompt),
          params: params.params as Record<string, unknown> | undefined,
        });
      }
      case "save_artifact": {
        const data = (
          params.data && typeof params.data === "object" ? params.data : { result: results }
        ) as Record<string, unknown>;
        return this.service.artifact(
          owner,
          task,
          "report",
          String(params.title ?? step.title),
          String(params.summary ?? (prompt || step.title)),
          data,
          `sop:${step.id}`,
        );
      }
      case "prepare_email": {
        const data = emailDraftSchema.parse(
          params.data ?? {
            to: params.to ?? task.input.email,
            subject: params.subject ?? step.title,
            body: params.body ?? prompt,
            cc: params.cc ?? [],
            bcc: params.bcc ?? [],
            attachmentIds: params.attachmentIds ?? [],
          },
        );
        const proposal = await this.service.prepare(
          owner,
          task,
          { kind: "email.send", data },
          `sop:${sop.id}:${step.id}:${JSON.stringify(data)}`,
          ctx,
        );
        return { status: "waiting_approval", actionId: proposal.id, stepId: step.id };
      }
      case "prepare_event": {
        const data = eventDraftSchema.parse(
          params.data ?? {
            calendarId: params.calendarId ?? "primary",
            title: params.title ?? step.title,
            start: params.start,
            end: params.end,
            allDay: params.allDay ?? false,
            timeZone: params.timeZone,
            location: params.location ?? "",
            description: params.description ?? prompt,
            attendees: params.attendees ?? [],
          },
        );
        const proposal = await this.service.prepare(
          owner,
          task,
          { kind: "calendar.create", data },
          `sop:${sop.id}:${step.id}:${JSON.stringify(data)}`,
          ctx,
        );
        return { status: "waiting_approval", actionId: proposal.id, stepId: step.id };
      }
      case "import_pdf": {
        const file = await this.service.workspace.importAttachment(
          owner,
          String(params.reference ?? prompt),
        );
        return { id: file.id, name: file.name, fields: file.fields };
      }
      case "inspect_pdf": {
        const file = await this.service.files.get(owner, String(params.fileId));
        return { id: file.id, name: file.name, fields: file.fields, pageCount: file.pageCount };
      }
      case "fill_pdf": {
        const file = await this.service.files.fill(
          owner,
          String(params.fileId),
          z.record(z.string(), z.union([z.string(), z.boolean()])).parse(params.fields),
        );
        return { id: file.id, name: file.name, fields: file.fields };
      }
      default:
        throw new AppError(`Unsupported SOP tool: ${step.tool}`, 422);
    }
  }

  private async ensureSkill(owner: string, skillId: string, task: AgentTask, ctx: TaskContext) {
    if (!/^[a-zA-Z0-9_-]+$/.test(skillId))
      throw new AppError(`Invalid skill id: ${skillId}`, 422);

    const skill = await this.service.db.get<any>(owner, "skills", skillId);
    if (!skill) throw new AppError(`Skill not found: ${skillId}`, 404);
    if (skill.active === false) throw new AppError(`Skill inactive: ${skillId}`, 409);

    await this.service.computer.start(owner);

    const skillsRoot = join(root, "apps", "computer", "workspace-template", "skills");
    const source = resolve(skillsRoot, skillId);
    if (source === skillsRoot || !source.startsWith(skillsRoot + sep))
      throw new AppError(`Skill id escapes the skills directory: ${skillId}`, 422);

    let files: Array<{ real: string; relative: string }> | null;
    try {
      const sourceReal = await realpath(source);
      files = await this.walk(sourceReal, sourceReal);
    } catch (error) {
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        (error as { code?: string }).code === "ENOENT"
      ) {
        files = null;
      } else {
        throw error;
      }
    }

    if (files === null) {
      await ctx.event(
        "observation",
        `Skill ready: ${skill.name}`,
        "Using the existing sandbox skill workspace",
      );
      return;
    }

    for (const file of files) {
      const content = await readFile(file.real);
      const target = `/workspace/skills/${skillId}/${file.relative}`;
      const parent = target.slice(0, target.lastIndexOf("/"));
      await this.service.computer.mkdir(owner, parent);
      await this.service.computer.write(owner, target, content.toString("utf8"));
    }
    await ctx.event(
      "observation",
      `Skill installed: ${skill.name}`,
      `${files.length} file(s) copied into /workspace/skills/${skillId}`,
    );
  }

  private async walk(
    dir: string,
    rootDir: string,
    relative = "",
  ): Promise<Array<{ real: string; relative: string }>> {
    const { readdir } = await import("node:fs/promises");
    const entries = await readdir(dir, { withFileTypes: true });
    const result: Array<{ real: string; relative: string }> = [];
    for (const entry of entries) {
      const full = join(dir, entry.name);
      const rel = relative ? `${relative}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        result.push(...(await this.walk(full, rootDir, rel)));
      } else if (entry.isFile() || entry.isSymbolicLink()) {
        const resolved = await realpath(full);
        if (resolved !== rootDir && !resolved.startsWith(rootDir + sep))
          throw new AppError(`Skill file escapes source directory: ${rel}`, 422);
        result.push({ real: resolved, relative: rel });
      }
    }
    return result;
  }
}