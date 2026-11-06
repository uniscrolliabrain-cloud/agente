// VOICE_ROUTES_V1 - agente de telefono: estado del canal, marcar y consultar.
//
// El scope se resuelve igual que en WhatsApp: la empresa sale del claim firmado
// (currentTenantScope) y, en modo session, de una membership unica y explicita.
// Nunca de un tenantId que mande el cliente.
//
// Cada llamada se guarda bajo el owner y con su tenantId, de modo que el
// historial es auditable y no se cruza entre empresas. Con Idempotency-Key el
// reintento devuelve la llamada ya creada en vez de marcar dos veces al lead.
import { createHash } from "node:crypto";
import { Hono } from "hono";
import { z } from "zod";
import { VapiClient } from "../../../packages/integrations/src/vapi.ts";
import { AppError } from "./errors.ts";
import { backgroundFailure } from "./log.ts";
import { TenantScopedStore } from "./db-tenant.ts";
import { currentTenantScope, runInTenantScope } from "./tenant-scope.ts";
import type { AgentService } from "./engine/service.ts";

const KIND = "voice-calls";
const TERMINAL = new Set(["ended", "failed", "canceled", "cancelled"]);

const callSchema = z.object({
  id: z.string().min(1),
  tenantId: z.string().min(1),
  owner: z.string().min(1),
  to: z.string().min(1),
  assistantId: z.string().min(1),
  status: z.string().min(1),
  createdAt: z.string(),
  updatedAt: z.string(),
  metadata: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
});
type CallRecord = z.infer<typeof callSchema>;

const createInput = z
  .object({
    to: z.string().trim().min(6).max(20),
    assistantId: z.string().trim().min(1).max(200).optional(),
    name: z.string().trim().min(1).max(200).optional(),
    metadata: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
  })
  .strict();

export function voiceRoutes(service: Pick<AgentService, "db" | "config" | "tenantService">) {
  const app = new Hono<{ Variables: { owner: string; tenantId: string } }>();

  app.use("*", async (c, next) => {
    const owner = c.get("owner");
    if (!owner) throw new AppError("Sesion requerida", 401);
    if (!(service.db instanceof TenantScopedStore)) {
      throw new AppError("Voz requiere almacenamiento aislado por empresa", 503);
    }
    const scope = currentTenantScope();
    let tenantId = scope?.tenantId;
    if (scope && scope.actorId !== owner) throw new AppError("Actor no valido", 403);
    if (!tenantId) {
      const memberships = (await service.tenantService?.membershipsFor(owner)) ?? [];
      const tenants = [...new Set(memberships.map((row) => row.tenantId))];
      if (tenants.length !== 1) throw new AppError("Selecciona una empresa autorizada", 409);
      tenantId = tenants[0];
    }
    c.set("tenantId", tenantId);
    await runInTenantScope({ tenantId, actorId: owner }, next);
  });

  const client = () =>
    new VapiClient({
      apiKey: service.config.vapiApiKey,
      assistantId: service.config.vapiAssistantId,
      phoneNumberId: process.env.VAPI_PHONE_NUMBER_ID?.trim() || undefined,
    });

  // Estado local del canal: no llama a Vapi, se puede sondear sin coste.
  app.get("/status", (c) =>
    c.json({
      configured: client().configured,
      assistantId: client().assistantId ?? null,
      telephony: Boolean(process.env.VAPI_PHONE_NUMBER_ID?.trim()),
      outboundEnabled: process.env.VOICE_OUTBOUND_ENABLED === "true",
    }),
  );

  app.get("/calls", async (c) => {
    const owner = c.get("owner");
    const tenantId = c.get("tenantId");
    const rows = await service.db.list<CallRecord>(owner, KIND, { limit: 50 });
    const calls = rows.filter((row) => row.tenantId === tenantId);
    return c.json({ calls });
  });

  app.post("/calls", async (c) => {
    const owner = c.get("owner");
    const tenantId = c.get("tenantId");
    const body = createInput.parse(await c.req.json());
    const idempotencyKey = c.req.header("Idempotency-Key")?.trim();
    if (idempotencyKey && !/^[A-Za-z0-9._:-]{8,200}$/.test(idempotencyKey)) {
      throw new AppError("Idempotency-Key invalida", 422);
    }
    if (process.env.VOICE_OUTBOUND_ENABLED !== "true") {
      throw new AppError("La voz saliente no esta activada (VOICE_OUTBOUND_ENABLED)", 503);
    }

    // VOICE_IDEMPOTENCY_V1 - con clave, el reintento devuelve la llamada previa.
    const recordId = idempotencyKey
      ? createHash("sha256").update(`${tenantId}:${owner}:${idempotencyKey}`).digest("hex")
      : null;

    const assistantId = body.assistantId ?? client().assistantId;
    if (!assistantId) {
      throw new AppError("Falta VAPI_ASSISTANT_ID: elige el asistente", 503);
    }
    const now = new Date().toISOString();

    // VOICE_IDEMPOTENCY_RESERVE_V1 - la reserva se inserta ANTES de llamar a
    // Vapi, con insertIfAbsent (INSERT ... ON CONFLICT DO NOTHING). Antes era
    // get -> llamar -> put: dos peticiones simultaneas con la misma clave no
    // veian nada y las dos marcaban al lead. El que pierde la reserva no llama.
    if (recordId) {
      const reservation: CallRecord = {
        id: recordId,
        tenantId,
        owner,
        to: body.to,
        assistantId,
        status: "pending",
        createdAt: now,
        updatedAt: now,
        ...(body.metadata ? { metadata: body.metadata } : {}),
      };
      const claimed = await service.db.insertIfAbsent<CallRecord>(owner, KIND, reservation);
      if (!claimed) {
        const existing = await service.db.get<CallRecord>(owner, KIND, recordId);
        if (!existing) throw new AppError("Llamada en curso", 409);
        if (existing.tenantId !== tenantId) throw new AppError("Llamada de otra empresa", 403);
        // Reserva viva: el dueno esta llamando a Vapi en este momento. No hay
        // llamada confirmada que devolver, asi que 409 y no un replay falso.
        if (existing.status === "pending") {
          throw new AppError("Llamada en curso con esa Idempotency-Key", 409);
        }
        return c.json({ call: existing, replay: true });
      }
    }

    let call: Awaited<ReturnType<VapiClient["createCall"]>>;
    try {
      call = await client().createCall({
        assistantId,
        customer: { number: body.to, ...(body.name ? { name: body.name } : {}) },
        // VOICE_METADATA_PRECEDENCE_V1 - tenantId y owner van AL FINAL. Antes el
        // cliente podia sobrescribirlos desde body.metadata y falsear la empresa
        // que viajaba al proveedor (y que vuelve en el webhook).
        metadata: { ...(body.metadata ?? {}), tenantId, owner },
      });
    } catch (error) {
      // No hay llamada: se libera la reserva para que el reintento valga.
      if (recordId) await service.db.remove(owner, KIND, recordId).catch(() => undefined);
      throw error;
    }

    const record: CallRecord = callSchema.parse({
      id: recordId ?? call.id,
      tenantId,
      owner,
      to: body.to,
      assistantId,
      status: call.status ?? "queued",
      createdAt: call.createdAt ?? now,
      updatedAt: new Date().toISOString(),
      ...(body.metadata ? { metadata: body.metadata } : {}),
    });
    try {
      await service.db.put(owner, KIND, { ...record, providerId: call.id });
    } catch (error) {
      // Vapi ya acepto la llamada: perder el providerId impide refrescar su
      // estado, asi que ademas de fallar se deja rastro con el id del proveedor.
      backgroundFailure("voice.persist_call", error, { providerId: call.id, tenantId });
      throw error;
    }
    return c.json({ call: record, providerId: call.id, replay: false }, 201);
  });

  app.get("/calls/:id", async (c) => {
    const owner = c.get("owner");
    const tenantId = c.get("tenantId");
    const id = c.req.param("id");
    const record = await service.db.get<CallRecord>(owner, KIND, id);
    if (!record || record.tenantId !== tenantId) throw new AppError("Llamada no encontrada", 404);
    if (c.req.query("refresh") !== "1" || TERMINAL.has(record.status)) return c.json({ call: record });
    // Refresco best-effort: si Vapi no contesta se devuelve el estado local, que
    // sigue siendo la verdad que conocemos, en vez de un 502 sin datos.
    try {
      const providerId = (record as CallRecord & { providerId?: string }).providerId ?? record.id;
      const live = await client().getCall(providerId);
      const updated: CallRecord = callSchema.parse({
        ...record,
        status: live.status ?? record.status,
        updatedAt: new Date().toISOString(),
      });
      await service.db.put(owner, KIND, { ...updated, providerId });
      return c.json({ call: updated });
    } catch (error) {
      if (error instanceof AppError) return c.json({ call: record, stale: true });
      throw error;
    }
  });

  return app;
}
