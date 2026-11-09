// VERTICAL_SLICE_DOGFOOD_TEST_V1 - panel, tarjetas y briefing A/B (campana 20).
//
// Cierre de campana:
//   - una tarjeta solo se usa en la empresa y version aprobadas, con permiso y
//     referencias autorizadas;
//   - la explicacion del dia siguiente cita ids, estados y horas reales;
//   - un registro de otra empresa no entra en la explicacion.

import assert from "node:assert/strict";
import { test } from "node:test";
import { buildDailyBriefing } from "../apps/server/src/engine/conversation.ts";
import { renderAuthorizedCard } from "../apps/server/src/engine/context/fixed-card-renderer.ts";
import {
  publishCardVersion,
  type OperationsCard,
} from "../apps/server/src/engine/published-card.ts";

const card: OperationsCard = {
  id: "ops-brief",
  title: "Briefing de operaciones",
  mode: "fixed",
  status: "approved",
  channels: ["panel"],
  requiredFacts: ["reference"],
  template: "Referencia: {{reference}}",
  missingFactScript: "Falta la referencia verificada.",
  fallback: "ask",
  references: [{ kind: "action", id: "act-1" }],
};

const approval = {
  tenantId: "empresa-a",
  approvedBy: "owner-a",
  approvedAt: new Date("2026-11-08T07:00:00Z"),
  version: 1,
  actorTenantId: "empresa-a",
  permissions: ["cards.publish"],
};

test("una tarjeta solo se usa con la empresa, version, hash y permisos aprobados", () => {
  const v1 = publishCardVersion(null, card, approval);
  assert.equal(v1.version, 1);
  assert.equal(v1.card.tenantId, "empresa-a");
  assert.match(v1.card.contentHash, /^[a-f0-9]{64}$/);

  const rendered = renderAuthorizedCard(v1, "panel", { reference: "act-1" }, {
    tenantId: "empresa-a",
    version: 1,
    authorizedReferences: ["action:act-1"],
  });
  assert.equal(rendered.status, "rendered");
  assert.equal(rendered.text, "Referencia: act-1");
  assert.equal(rendered.citation.cardId, "ops-brief");
  assert.equal(rendered.citation.version, 1);
  assert.equal(rendered.citation.contentHash, v1.card.contentHash);
  assert.deepEqual(rendered.citation.references, ["action:act-1"]);

  // Publicar no acepta actores de otra empresa ni falta de permiso.
  assert.throws(
    () => publishCardVersion(null, card, { ...approval, actorTenantId: "empresa-b" }),
    /otra empresa/,
  );
  assert.throws(
    () => publishCardVersion(null, card, { ...approval, permissions: [] }),
    /permiso/,
  );
  assert.throws(
    () => publishCardVersion(null, card, { ...approval, version: 0 }),
    /version/,
  );

  // La version no retrocede y una version posterior invalida la anterior.
  const v2 = publishCardVersion(v1, { ...card, template: "Referencia v2: {{reference}}" }, {
    ...approval,
    version: 2,
  });
  assert.equal(v2.version, 2);
  assert.throws(() => publishCardVersion(v2, card, { ...approval, version: 2 }), /no supera/);
  assert.throws(
    () => renderAuthorizedCard(v2, "panel", { reference: "act-1" }, {
      tenantId: "empresa-a",
      version: 1,
      authorizedReferences: ["action:act-1"],
    }),
    /version/,
  );

  // Otra empresa no puede renderizar la tarjeta aunque tenga el id.
  assert.throws(
    () => renderAuthorizedCard(v1, "panel", { reference: "act-1" }, {
      tenantId: "empresa-b",
      version: 1,
      authorizedReferences: ["action:act-1"],
    }),
    /otra empresa/,
  );

  // Una referencia que no pertenece a los registros autorizados no se renderiza.
  assert.throws(
    () => renderAuthorizedCard(v1, "panel", { reference: "act-1" }, {
      tenantId: "empresa-a",
      version: 1,
      authorizedReferences: [],
    }),
    /Referencia no autorizada/,
  );

  // Manipular el contenido publicado rompe el hash aprobado.
  const tampered = structuredClone(v1);
  (tampered.card.card as { template: string }).template = "Referencia: {{reference}} cambiada";
  assert.throws(
    () => renderAuthorizedCard(tampered, "panel", { reference: "act-1" }, {
      tenantId: "empresa-a",
      version: 1,
      authorizedReferences: ["action:act-1"],
    }),
    /hash/,
  );
});

test("la explicacion del dia siguiente cita registros, estados y horas reales", () => {
  const briefing = buildDailyBriefing([
    {
      tenantId: "empresa-a",
      kind: "task",
      id: "task-1",
      title: "Preparar seguimiento",
      status: "succeeded",
      at: "2026-11-08T08:00:00.000Z",
    },
    {
      tenantId: "empresa-a",
      kind: "action",
      id: "act-8",
      title: "Enviar correo",
      status: "succeeded",
      at: "2026-11-08T08:30:00.000Z",
    },
    {
      tenantId: "empresa-a",
      kind: "action",
      id: "act-9",
      title: "Reservar cita",
      status: "failed",
      at: "2026-11-08T09:30:00.000Z",
    },
  ], { tenantId: "empresa-a", owner: "owner-a", at: new Date("2026-11-09T07:00:00Z") });

  assert.equal(briefing.status, "rendered");
  assert.match(briefing.text, /1 trabajos/);
  assert.match(briefing.text, /1 recibos/);
  assert.match(briefing.text, /1 incidencias/);
  assert.match(briefing.text, /action:act-9/);
  assert.match(briefing.text, /failed/);
  assert.match(briefing.text, /09:30/);
  assert.equal(briefing.citation.version, 1);
  assert.equal(briefing.citation.cardId, "daily-operations");
  assert.deepEqual(briefing.citation.references, ["action:act-9", "action:act-8", "task:task-1"]);
  assert.deepEqual(briefing.records.map((record) => record.id), ["act-9", "act-8", "task-1"]);
});

test("un registro de otra empresa no entra en la explicacion", () => {
  assert.throws(
    () => buildDailyBriefing([{
      tenantId: "empresa-b",
      kind: "action",
      id: "act-b1",
      title: "Accion de B",
      status: "failed",
      at: "2026-11-08T09:00:00.000Z",
    }], { tenantId: "empresa-a", owner: "owner-a" }),
    /otra empresa/,
  );
});

test("sin registros la explicacion no inventa nada", () => {
  const briefing = buildDailyBriefing([], { tenantId: "empresa-a", owner: "owner-a" });
  assert.equal(briefing.status, "empty");
  assert.match(briefing.text, /No hay registros/);
  assert.deepEqual(briefing.records, []);
});
