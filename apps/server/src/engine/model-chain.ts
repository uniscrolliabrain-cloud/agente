import { type BaseEvent, EventType, type RunAgentInput } from "@ag-ui/core";
import { Observable } from "rxjs";
import type { Config } from "../config.ts";

/** Provider events that prove the client already received model output for this run. */
const producedOutput = new Set<string>([
  EventType.TEXT_MESSAGE_START,
  EventType.TEXT_MESSAGE_CONTENT,
  EventType.TEXT_MESSAGE_CHUNK,
  EventType.TEXT_MESSAGE_END,
  EventType.TOOL_CALL_START,
  EventType.TOOL_CALL_ARGS,
  EventType.TOOL_CALL_END,
  EventType.TOOL_CALL_RESULT,
]);

export interface ModelRun {
  run(input: RunAgentInput): Observable<BaseEvent>;
  abortRun(): void;
}

/**
 * Ordered model specifiers: the primary model first, then the configured fallback.
 * "openai/unconfigured" preserves the previous behaviour when no model is configured at all.
 */
export function modelChain(config: Config): string[] {
  const specs = [config.model, config.modelFallback].flatMap((spec) =>
    spec?.trim() ? [spec.trim()] : [],
  );
  return specs.length ? [...new Set(specs)] : ["openai/unconfigured"];
}

/**
 * Runs `input` against the first specifier that answers. The next specifier is only used when the
 * current one fails before producing client-visible output, so a half-streamed answer is never
 * restarted and the failure that triggered the fallback is never surfaced.
 *
 * Each attempt carries a monotonically increasing attemptId. Once a new attempt starts, any
 * subsequent event/error/complete from the previous subscription is ignored, so a late
 * RUN_ERROR+RUN_FINISHED pair from the primary cannot terminate the outer observable before
 * the fallback has had a chance to run.
 */
export function runWithModelFallback(
  specs: string[],
  create: (spec: string) => ModelRun,
  input: RunAgentInput,
): { events: Observable<BaseEvent>; abort: () => void } {
  let current: ModelRun | undefined;
  const events = new Observable<BaseEvent>((subscriber) => {
    let index = 0;
    let announceStart = true;
    let stopped = false;
    let subscription: { unsubscribe: () => void } | undefined;
    let attemptId = 0;

    const hasFallback = () => index + 1 < specs.length;

    const startNextAttempt = () => {
      subscription?.unsubscribe();
      index += 1;
      announceStart = false;
      attempt();
    };

    const attempt = () => {
      const myId = ++attemptId;
      const agent = create(specs[index]);
      current = agent;
      let answered = false;
      subscription = agent.run(input).subscribe({
        next: (event) => {
          if (myId !== attemptId) return;
          if (producedOutput.has(event.type)) answered = true;
          if (event.type === EventType.RUN_STARTED && !announceStart) return;
          if (event.type === EventType.RUN_ERROR && !answered && hasFallback()) {
            startNextAttempt();
            return;
          }
          subscriber.next(event);
        },
        error: (error) => {
          if (myId !== attemptId) return;
          if (stopped) return;
          if (!answered && hasFallback()) {
            startNextAttempt();
            return;
          }
          subscriber.error(error);
        },
        complete: () => {
          if (myId !== attemptId) return;
          if (!stopped) subscriber.complete();
        },
      });
    };

    attempt();
    return () => {
      stopped = true;
      subscription?.unsubscribe();
    };
  });
  return { events, abort: () => current?.abortRun() };
}