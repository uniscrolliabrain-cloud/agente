import type { SOP } from "../../../../packages/domain/src/sop.ts";
import { AppError } from "../errors.ts";
import { backgroundFailure } from "../log.ts";
import type { AgentService } from "./service.ts";

interface TriggerState {
  id: string;
  lastFiredAt?: string;
  seenMessageIds?: string[];
}

/**
 * Parses the SOP.trigger.value for cron-style SOPs. Supported forms:
 *   - every:Nm          every N minutes (1-59)
 *   - every:Nh          every N hours (1-23)
 *   - daily:HH:MM       once per day at HH:MM UTC
 *   - weekly:DOW:HH:MM  once per week (mon|tue|wed|thu|fri|sat|sun) at HH:MM UTC
 *
 * Anything else is rejected at parse time so a typo cannot silently never fire.
 */
export function parseCron(value: string): (now: Date) => boolean {
  const trimmed = value.trim();
  const everyMin = /^every:(\d{1,2})m$/.exec(trimmed);
  if (everyMin) {
    const n = Number(everyMin[1]);
    if (n < 1 || n > 59) throw new AppError("Cron 'every:Nm' requires N between 1 and 59", 422);
    return (now) => now.getUTCMinutes() % n === 0 && now.getUTCSeconds() < 30;
  }
  const everyHour = /^every:(\d{1,2})h$/.exec(trimmed);
  if (everyHour) {
    const n = Number(everyHour[1]);
    if (n < 1 || n > 23) throw new AppError("Cron 'every:Nh' requires N between 1 and 23", 422);
    return (now) =>
      now.getUTCHours() % n === 0 && now.getUTCMinutes() === 0 && now.getUTCSeconds() < 30;
  }
  const daily = /^daily:(\d{2}):(\d{2})$/.exec(trimmed);
  if (daily) {
    const h = Number(daily[1]);
    const m = Number(daily[2]);
    if (h > 23 || m > 59) throw new AppError("Cron 'daily:HH:MM' requires valid time", 422);
    return (now) => now.getUTCHours() === h && now.getUTCMinutes() === m;
  }
  const weekly = /^weekly:(mon|tue|wed|thu|fri|sat|sun):(\d{2}):(\d{2})$/.exec(trimmed);
  if (weekly) {
    const days: Record<string, number> = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };
    const dow = days[weekly[1]];
    const h = Number(weekly[2]);
    const m = Number(weekly[3]);
    if (h > 23 || m > 59) throw new AppError("Cron 'weekly:DAY:HH:MM' requires valid time", 422);
    return (now) => now.getUTCDay() === dow && now.getUTCHours() === h && now.getUTCMinutes() === m;
  }
  throw new AppError(
    `Unsupported cron value "${value}". Use every:Nm, every:Nh, daily:HH:MM or weekly:day:HH:MM`,
    422,
  );
}

export class SOPTriggerEvaluator {
  constructor(private readonly service: AgentService) {}

  async evaluate(owner: string, sop: SOP): Promise<number> {
    if (!sop.active) return 0;
    if (sop.trigger.type === "cron") return this.evaluateCron(owner, sop);
    if (sop.trigger.type === "email_subject") return this.evaluateEmail(owner, sop);
    return 0;
  }

  private async state(owner: string, sopId: string): Promise<TriggerState> {
    const existing = await this.service.db.get<TriggerState>(owner, "sop-trigger-state", sopId);
    return existing ?? { id: sopId };
  }

  private async evaluateCron(owner: string, sop: SOP): Promise<number> {
    if (!sop.trigger.value.trim()) return 0;
    let matcher: (now: Date) => boolean;
    try {
      matcher = parseCron(sop.trigger.value);
    } catch (error) {
      backgroundFailure(`sop ${sop.id} cron parse`, error);
      return 0;
    }
    const now = new Date();
    if (!matcher(now)) return 0;
    const state = await this.state(owner, sop.id);
    const bucket = now.toISOString().slice(0, 16);
    if (state.lastFiredAt === bucket) return 0;
    await this.service.createTask(
      owner,
      {
        kind: "sop",
        title: `${sop.name} (cron)`,
        prompt: `Scheduled trigger for ${sop.name} at ${now.toISOString()}`,
        input: { sopId: sop.id, trigger: { type: "cron", firedAt: now.toISOString() } },
      },
      `sop-cron:${sop.id}:${bucket}`,
    );
    await this.service.db.put(owner, "sop-trigger-state", { ...state, lastFiredAt: bucket });
    return 1;
  }

  private async evaluateEmail(owner: string, sop: SOP): Promise<number> {
    const pattern = sop.trigger.value.trim();
    if (!pattern) return 0;
    let regex: RegExp;
    try {
      regex = new RegExp(pattern, "i");
    } catch (error) {
      backgroundFailure(`sop ${sop.id} email regex parse`, error);
      return 0;
    }
    const state = await this.state(owner, sop.id);
    const seen = new Set(state.seenMessageIds ?? []);
    let mail: { id: string; subject: string; threadId: string }[];
    try {
      const workspace = await this.service.workspace.snapshot(owner);
      mail = workspace.mail.map((m) => ({ id: m.id, subject: m.subject, threadId: m.threadId }));
    } catch {
      return 0;
    }
    let fired = 0;
    const newlySeen: string[] = [];
    for (const message of mail) {
      if (seen.has(message.id)) continue;
      if (!regex.test(message.subject)) continue;
      seen.add(message.id);
      newlySeen.push(message.id);
      await this.service.createTask(
        owner,
        {
          kind: "sop",
          title: `${sop.name}: ${message.subject.slice(0, 80)}`,
          prompt: `Triggered by email subject match: ${message.subject}`,
          input: {
            sopId: sop.id,
            messageId: message.id,
            threadId: message.threadId,
            trigger: { type: "email_subject" },
          },
        },
        `sop-email:${sop.id}:${message.id}`,
      );
      fired++;
    }
    if (newlySeen.length > 0) {
      const capped = [...seen].slice(-1000);
      await this.service.db.put(owner, "sop-trigger-state", { ...state, seenMessageIds: capped });
    }
    return fired;
  }
}