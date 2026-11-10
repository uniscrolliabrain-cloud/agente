import assert from "node:assert/strict";
import { test } from "node:test";
import {
  acmeAgentMetricSchema,
  acmeLeadSchema,
  acmeProjectSchema,
  acmeTicketSchema,
} from "../packages/domain/src/acme-dataset.ts";

const validLead = {
  id: "lead-001",
  name: "Promotora Levante",
  domain: "promotora-levante.es",
  status: "oportunidad",
  amountEur: 18400.5,
  nextStep: "Enviar presupuesto de estructura",
  action: "Revisar pliego",
  detail: "Pide reforma de 3 locales en Valencia.",
  updatedAt: "2026-11-04T09:30:00.000Z",
};

test("acme lead valido pasa el schema", () => {
  const parsed = acmeLeadSchema.safeParse(validLead);
  assert.equal(parsed.success, true);
});

test("acme lead sin status se rechaza", () => {
  const { status: _status, ...sinStatus } = validLead;
  const parsed = acmeLeadSchema.safeParse(sinStatus);
  assert.equal(parsed.success, false);
});

test("acme lead con importe en string se rechaza", () => {
  const parsed = acmeLeadSchema.safeParse({ ...validLead, amountEur: "18400" });
  assert.equal(parsed.success, false);
});

test("acme lead admite importe ausente declarado", () => {
  const parsed = acmeLeadSchema.safeParse({ ...validLead, amountEur: null });
  assert.equal(parsed.success, true);
});

test("acme lead con estado fuera del enum se rechaza", () => {
  const parsed = acmeLeadSchema.safeParse({ ...validLead, status: "perdido" });
  assert.equal(parsed.success, false);
});

test("acme project valido pasa y sin alerta la declara como null", () => {
  const parsed = acmeProjectSchema.safeParse({
    id: "obra-014",
    name: "Reforma Calle Colón 14",
    status: "active",
    ownerId: "acme-javier",
    alert: null,
    blocks: ["Falta licencia de obra"],
    linkedMemoryIds: ["mem-221"],
  });
  assert.equal(parsed.success, true);
});

test("acme project con estado fuera del enum se rechaza", () => {
  const parsed = acmeProjectSchema.safeParse({
    id: "obra-014",
    name: "Reforma Calle Colón 14",
    status: "archived",
    ownerId: "acme-javier",
    alert: null,
  });
  assert.equal(parsed.success, false);
});

test("acme ticket exige urgencia del enum cerrado", () => {
  const base = {
    id: "tk-9",
    taskId: "task-9",
    ownerId: "acme-sofia",
    clientId: "cli-3",
    label: "Revisar certificación",
  };
  assert.equal(acmeTicketSchema.safeParse({ ...base, urgency: "urgente" }).success, true);
  assert.equal(acmeTicketSchema.safeParse({ ...base, urgency: "baja" }).success, false);
});

test("acme agent metric no admite confianza fuera de rango ni tareas negativas", () => {
  assert.equal(
    acmeAgentMetricSchema.safeParse({ agentId: "acme-marta", confidence: 0.82, openTasks: 7 }).success,
    true,
  );
  assert.equal(
    acmeAgentMetricSchema.safeParse({ agentId: "acme-marta", confidence: 1.4, openTasks: 7 }).success,
    false,
  );
  assert.equal(
    acmeAgentMetricSchema.safeParse({ agentId: "acme-marta", confidence: 0.5, openTasks: -1 }).success,
    false,
  );
});
