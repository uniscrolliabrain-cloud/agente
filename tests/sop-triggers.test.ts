import assert from "node:assert/strict";
import { test } from "node:test";
import { AppError } from "../apps/server/src/errors.ts";
import { analyzeSpending } from "../apps/server/src/engine/finance.ts";
import { parseCron } from "../apps/server/src/engine/sop-triggers.ts";
import { sopStepSchema } from "../packages/domain/src/sop.ts";

const at = (iso: string) => new Date(iso);

test("every:Nm matches any second of the matching minute", () => {
  const every7 = parseCron("every:7m");
  // El mantenimiento corre cada 60 s con una fase cualquiera. El filtro `seconds < 30` que
  // habia aqui hacia que un SOP programado no disparara nunca con esa fase.
  assert.equal(every7(at("2026-09-28T12:14:00Z")), true);
  assert.equal(every7(at("2026-09-28T12:14:45Z")), true);
  assert.equal(every7(at("2026-09-28T12:14:59Z")), true);
  assert.equal(every7(at("2026-09-28T12:15:45Z")), false);
  assert.equal(every7(at("2026-09-28T12:21:45Z")), true);
});

test("every:1m and every:Nh still behave", () => {
  const every1 = parseCron("every:1m");
  assert.equal(every1(at("2026-09-28T12:14:45Z")), true);
  assert.equal(every1(at("2026-09-28T12:15:45Z")), true);
  const hourly = parseCron("every:2h");
  assert.equal(hourly(at("2026-09-28T10:00:45Z")), true);
  assert.equal(hourly(at("2026-09-28T10:01:00Z")), false);
  assert.equal(hourly(at("2026-09-28T11:00:00Z")), false);
});

test("daily and weekly crons are unchanged", () => {
  const daily = parseCron("daily:09:00");
  assert.equal(daily(at("2026-09-28T09:00:59Z")), true);
  assert.equal(daily(at("2026-09-28T09:01:00Z")), false);
  const weekly = parseCron("weekly:fri:18:00");
  assert.equal(weekly(at("2026-09-25T18:00:30Z")), true);
  assert.equal(weekly(at("2026-09-25T18:01:00Z")), false);
});

test("an unsupported or out-of-range cron is a 422, not a silent never-fire", () => {
  assert.throws(() => parseCron("every:99m"), (error: unknown) => {
    assert.ok(error instanceof AppError);
    assert.equal(error.status, 422);
    return true;
  });
  assert.throws(() => parseCron("hourly"), AppError);
});

test("the SOP step schema is closed: an unknown tool never reaches the executor", () => {
  // El default del switch de sop-executor es defensa en profundidad. La primera linea de
  // defensa es el enum: una tool inventada no pasa ni por la base de datos ni por zod.
  assert.equal(sopStepSchema.safeParse({ id: "a", title: "A", tool: "teletransportarse" }).success, false);
  assert.equal(sopStepSchema.safeParse({ id: "a", title: "A", tool: "llm_generate" }).success, true);
});

test("finance errors are AppError 422 so the front can show them", () => {
  const cases: [string, RegExp][] = [
    ["date,description,amount\n2026-09-28,x,10\n", /columns/],
    ["date,description,amount,category\n", /1 and 5,000/],
    ["date,description,amount,category\n28/09/2026,x,10,iva", /ISO date/],
    ['date,description,amount,category\n2026-09-28,"abierto,10,iva', /unclosed/],
  ];
  for (const [csv, message] of cases) {
    assert.throws(
      () => analyzeSpending(csv),
      (error: unknown) => {
        assert.ok(error instanceof AppError, `esperaba AppError y llego ${String(error)}`);
        assert.equal(error.status, 422);
        assert.match(error.message, message);
        return true;
      },
    );
  }
  const ok = analyzeSpending(
    "date,description,amount,category\n2026-09-28,hosting,-1200,servicios\n2026-09-27,ventas,3500,ventas",
  );
  assert.equal(ok.income, 1200);
  assert.equal(ok.spending, 3500);
  assert.equal(ok.saved, -2300);
});
