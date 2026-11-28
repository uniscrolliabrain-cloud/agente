// C16_PROMPT_RUNTIME_V2: el prompt es un objeto durable del runtime, no una
// variable local del closure de chat.
//
// Antes de esto `runtime.chat` concatenaba preambulo + segmentos en una `const`
// y la pasaba al proveedor: ese texto no existia para nadie mas. Ni Slow podia
// citarlo, ni el owner podia auditarlo, ni se podia reconstruir por que Fast
// respondio lo que respondio.
//
// Ahora el runtime compone un `PromptEnvelopeV2`, lo persiste (fila + evento con
// digest) y entrega `envelope.text` al proveedor. El texto queda accesible por
// id a la identidad autenticada que lo produjo; cualquier lane (Slow incluido)
// lo resuelve con `PromptRegistry.resolve`.
//
// Limites deliberados:
//   - Es texto autorizado, no un log: nunca se emite a metricas ni a telemetria.
//   - Caduca (TTL) y se conserva por tenant+actor; sin identidad no hay lectura.
//   - El evento solo lleva puntero y digest, para que el log durable no duplique
//     el contenido ni lo filtre por consumidores que no pueden leerlo.
import { z } from "zod";
import {
  cognitiveIdentitySchema,
  type CognitiveIdentity,
} from "../../../../../../packages/domain/src/cognition-v2.ts";
import { payloadSchemas } from "../../events/schemas.ts";
import type { SystemEvent } from "../../events/types.ts";
import type { ContextServingFacade, ContextSnapshotV2 } from "./context.ts";
import { digest, type DurableEventSink, type SqlStore } from "./storage.ts";

const hexDigest = z.string().regex(/^[a-f0-9]{64}$/);
const idSchema = z.string().min(1).max(200);

/** Mensaje exacto entregado al proveedor, no el historial completo del hilo. */
export const promptMessageV2Schema = z.strictObject({
  id: idSchema,
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(24000),
});

export const promptEnvelopeV2Schema = z.strictObject({
  schemaVersion: z.literal("2.0"),
  id: idSchema,
  tenantId: z.string().min(1).max(100),
  actorId: z.string().min(1).max(200),
  lane: z.enum(["fast", "slow"]),
  runKey: z.string().min(1).max(200),
  threadId: idSchema,
  runId: idSchema,
  identity: cognitiveIdentitySchema,
  snapshotId: idSchema,
  snapshotDigest: hexDigest,
  watermark: z.string().regex(/^\d{1,20}$/),
  /** Prompt de sistema tal cual se entrega al proveedor. */
  text: z.string().min(1).max(48000),
  /** Mensajes del turno tal cual se entregan al proveedor. */
  messages: z.array(promptMessageV2Schema).max(100),
  /** Digest del par (text, messages): es lo que se publica en el evento. */
  digest: hexDigest,
  tokens: z.number().int().nonnegative(),
  messageTokens: z.number().int().nonnegative(),
  segments: z
    .array(
      z.strictObject({
        id: idSchema,
        revision: z.number().int().positive(),
        sourceEventId: idSchema,
        tokens: z.number().int().nonnegative(),
      }),
    )
    .max(100),
  createdAt: z.iso.datetime({ offset: true }),
  expiresAt: z.iso.datetime({ offset: true }),
});
export type PromptEnvelopeV2 = z.infer<typeof promptEnvelopeV2Schema>;
export type PromptLane = PromptEnvelopeV2["lane"];
export type PromptMessageV2 = z.infer<typeof promptMessageV2Schema>;

/** Retencion declarada del texto: el puntero del evento vive mas que el texto. */
export const PROMPT_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export interface PromptInput {
  lane: PromptLane;
  runKey: string;
  threadId: string;
  runId: string;
  snapshot: Pick<ContextSnapshotV2, "id" | "digest" | "watermark" | "refs" | "segments">;
  text: string;
  messages: PromptMessageV2[];
}

export class PromptRegistry {
  constructor(
    private readonly db: SqlStore,
    private readonly sink: DurableEventSink,
    private readonly context: Pick<ContextServingFacade, "assertAuthorized">,
    private readonly clock = () => Date.now(),
  ) {}

  /** Un prompt por run: la clave ya es unica por tenant+actor+thread+run. */
  idFor(identity: CognitiveIdentity, lane: PromptLane, runKey: string): string {
    return `prompt:${digest(["prompt-v2", identity.tenantId, identity.actorId, lane, runKey])}`;
  }

  /**
   * Persiste el sobre y publica el evento `cognition.v2.prompt.rendered` en la
   * misma transaccion. Si el registro falla, el chat no debe llamar al modelo:
   * un prompt que no pasa por el runtime no se ejecuta.
   */
  async record(identity: CognitiveIdentity, input: PromptInput): Promise<PromptEnvelopeV2> {
    await this.context.assertAuthorized(identity);
    const segments = input.snapshot.segments.map((segment, index) => {
      const ref = input.snapshot.refs[index];
      if (!ref) throw Error("PROMPT_SEGMENT_UNANCHORED");
      return {
        id: ref.id,
        revision: ref.revision,
        sourceEventId: ref.sourceEventId,
        tokens: segment.tokens,
      };
    });
    if (segments.length !== input.snapshot.refs.length) throw Error("PROMPT_SEGMENT_UNANCHORED");
    const id = this.idFor(identity, input.lane, input.runKey);
    const now = this.clock();
    const envelope = promptEnvelopeV2Schema.parse({
      schemaVersion: "2.0",
      id,
      tenantId: identity.tenantId,
      actorId: identity.actorId,
      lane: input.lane,
      runKey: input.runKey,
      threadId: input.threadId,
      runId: input.runId,
      identity,
      snapshotId: input.snapshot.id,
      snapshotDigest: input.snapshot.digest,
      watermark: input.snapshot.watermark,
      text: input.text,
      messages: input.messages,
      digest: digest({ text: input.text, messages: input.messages }),
      tokens: Buffer.byteLength(input.text, "utf8"),
      messageTokens: Buffer.byteLength(JSON.stringify(input.messages), "utf8"),
      segments,
      createdAt: new Date(now).toISOString(),
      expiresAt: new Date(now + PROMPT_TTL_MS).toISOString(),
    });
    const event: SystemEvent = {
      id: digest([id, "rendered"]),
      tenantId: identity.tenantId,
      owner: identity.actorId,
      type: "cognition.v2.prompt.rendered",
      schemaVersion: "1.0",
      emittedAt: envelope.createdAt,
      source: { kind: "system", id: "prompt-v2" },
      correlationId: input.runKey,
      payload: {
        promptId: id,
        lane: envelope.lane,
        digest: envelope.digest,
        tokens: envelope.tokens + envelope.messageTokens,
        snapshotId: envelope.snapshotId,
        runKey: envelope.runKey,
        messageCount: envelope.messages.length,
        segmentCount: envelope.segments.length,
      },
    };
    payloadSchemas[event.type].parse(event.payload);
    await this.db.transaction(async () => {
      const inserted = await this.db.rawQuery<{ id: string }>(
        `INSERT INTO cognition_v2_prompts(tenant,id,actor,lane,snapshot_id,digest,data,created_at,expires_at)
         VALUES($1,$2,$3,$4,$5,$6,$7::jsonb,$8,$9) ON CONFLICT DO NOTHING RETURNING id`,
        [envelope.tenantId, envelope.id, envelope.actorId, envelope.lane, envelope.snapshotId,
          envelope.digest, JSON.stringify(envelope), envelope.createdAt, envelope.expiresAt],
      );
      if (!inserted.length) {
        const [existing] = await this.db.rawQuery<{ data: PromptEnvelopeV2 }>(
          `SELECT data FROM cognition_v2_prompts WHERE tenant=$1 AND id=$2`, [envelope.tenantId, envelope.id],
        );
        // Un reintento del mismo run reusa el sobre; un contenido distinto con
        // la misma clave es un fallo de identidad, no un caso a resolver.
        if (!existing || digest(existing.data) !== digest(envelope)) throw Error("PROMPT_ID_CONFLICT");
        return;
      }
      await this.sink.write(event);
    });
    return envelope;
  }

  /** Lectura autorizada por identidad. Fuera del actor o caducado: null. */
  async resolve(identity: CognitiveIdentity, id: string): Promise<PromptEnvelopeV2 | null> {
    if (!idSchema.safeParse(id).success) return null;
    await this.context.assertAuthorized(identity);
    const [row] = await this.db.rawQuery<{ data: unknown }>(
      `SELECT data FROM cognition_v2_prompts WHERE tenant=$1 AND id=$2 AND actor=$3`,
      [identity.tenantId, id, identity.actorId],
    );
    const parsed = promptEnvelopeV2Schema.safeParse(row?.data);
    if (!parsed.success) return null;
    const envelope = parsed.data;
    if (envelope.tenantId !== identity.tenantId || envelope.actorId !== identity.actorId) return null;
    if (Date.parse(envelope.expiresAt) <= this.clock()) return null;
    // El digest publicado tiene que cuadrar con el texto servido: un sobre
    // manipulado en la base no se puede presentar como el prompt que corrio.
    if (envelope.digest !== digest({ text: envelope.text, messages: envelope.messages })) return null;
    return envelope;
  }

  /** Historial de prompts de un run/turno, para la traza completa. */
  async list(identity: CognitiveIdentity, runKey: string, limit = 20): Promise<PromptEnvelopeV2[]> {
    await this.context.assertAuthorized(identity);
    const rows = await this.db.rawQuery<{ data: unknown }>(
      `SELECT data FROM cognition_v2_prompts WHERE tenant=$1 AND actor=$2 AND data->>'runKey'=$3
       ORDER BY created_at DESC LIMIT $4`,
      [identity.tenantId, identity.actorId, runKey, Math.max(1, Math.min(100, limit))],
    );
    return rows
      .map((row) => promptEnvelopeV2Schema.safeParse(row.data))
      .filter((parsed): parsed is { success: true; data: PromptEnvelopeV2 } => parsed.success)
      .map((parsed) => parsed.data);
  }
}
