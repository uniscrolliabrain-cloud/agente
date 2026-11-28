// LONGITUDINAL_MOUNT_V1 - montaje del modulo longitudinal sobre la base durable.
//
// Hasta ahora `segmentText`, `validateNarrativeExtraction`, `packLongitudinalContext`
// y `selectSkills` solo los llamaban sus propios tests: el modulo estaba
// IMPLEMENTED_TESTED pero UNMOUNTED. Este fichero aporta el recorrido que faltaba
// (evento -> segmentos con procedencia -> persistencia idempotente -> seleccion ->
// contexto), con tres reglas no negociables:
//   1. el tenant sale SIEMPRE de la identidad autenticada, nunca de un parametro;
//   2. reprocesar el mismo evento no duplica: la clave es (tenant, evento, indice)
//      y un contenido distinto con la misma clave es un conflicto, no una sobrescritura;
//   3. el pack que se entrega es el que valida packLongitudinalContext, con su
//      presupuesto y sus cuotas; nada de concatenar texto a mano.
import { createHash } from "node:crypto";
import type { Store } from "../../../../db.ts";
import { cognitiveRefSchema } from "../../../../../../../packages/domain/src/cognitive-reference.ts";
import { packLongitudinalContext, type ContextPackItem } from "./pack.ts";
import { segmentText, type ProvenanceSegment } from "./segments.ts";

/** Identidad autenticada. El tenant no se acepta como argumento suelto. */
export interface LongitudinalIdentity {
  tenantId: string;
  actorId: string;
  owner: string;
}

export interface LongitudinalSource {
  /** Id del evento del journal que origina el texto. */
  sourceEventId: string;
  /** Texto exacto de la fuente. */
  text: string;
  /** SHA-256 opcional del texto completo; si viene y no coincide, no se persiste. */
  sourceDigest?: string;
}

export interface LongitudinalIngestResult {
  segments: number;
  created: number;
  sourceDigest: string;
}

export interface LongitudinalPurge {
  /** Retencion por antiguedad: borra lo anterior a N dias. */
  olderThanDays?: number;
  /** Supresion de un evento concreto (todas sus filas del tenant). */
  sourceEventId?: string;
  /** Supresion total de la memoria del tenant. */
  everything?: boolean;
}

export interface LongitudinalPurgeResult {
  deleted: number;
  scope: "older_than" | "source_event" | "tenant";
  cutoff?: string;
}

export interface LongitudinalQuery {
  query?: string;
  limit?: number;
  budget?: number;
  quotas?: Record<"anchor" | "brief" | "narrative" | "general", number>;
}

export interface LongitudinalContext {
  items: ContextPackItem[];
  serialized: string;
  bytes: number;
  used: Record<"anchor" | "brief" | "narrative" | "general", number>;
  omittedMandatory: ContextPackItem["ref"][];
  degraded: boolean;
}

const DEFAULT_QUOTAS = { anchor: 16_000, brief: 16_000, narrative: 16_000, general: 16_000 };

/** Tablas propias; no toca ninguna existente. */
export async function installLongitudinal(db: Store): Promise<void> {
  for (const sql of [
    `CREATE TABLE IF NOT EXISTS cognition_v2_longitudinal_segments (
      tenant text NOT NULL,
      source_event_id text NOT NULL,
      segment_index integer NOT NULL,
      source_digest text NOT NULL,
      digest text NOT NULL,
      start_offset integer NOT NULL,
      end_offset integer NOT NULL,
      text text NOT NULL,
      created_at timestamptz NOT NULL,
      PRIMARY KEY(tenant, source_event_id, segment_index))`,
    `CREATE INDEX IF NOT EXISTS cognition_v2_longitudinal_recent
      ON cognition_v2_longitudinal_segments(tenant, created_at DESC)`,
  ])
    await db.rawQuery(sql);
}

const sha256 = (text: string) => createHash("sha256").update(text).digest("hex");

function assertIdentity(identity: LongitudinalIdentity): LongitudinalIdentity {
  if (
    !identity ||
    typeof identity.tenantId !== "string" ||
    identity.tenantId.length === 0 ||
    identity.tenantId.length > 200 ||
    typeof identity.actorId !== "string" ||
    identity.actorId.length === 0 ||
    typeof identity.owner !== "string" ||
    identity.owner.length === 0
  )
    throw Error("LONGITUDINAL_IDENTITY_REQUIRED");
  return identity;
}

/**
 * Memoria longitudinal de un tenant: escribe segmentos con procedencia y
 * devuelve packs de contexto autorizados. No decide verdad ni publica cards.
 */
export class LongitudinalMemory {
  constructor(private readonly db: Store) {}

  /** Escribe los segmentos de una fuente; reprocesar no duplica. */
  async ingest(identity: LongitudinalIdentity, source: LongitudinalSource): Promise<LongitudinalIngestResult> {
    assertIdentity(identity);
    if (typeof source?.sourceEventId !== "string" || source.sourceEventId.length === 0 || source.sourceEventId.length > 200)
      throw Error("LONGITUDINAL_SOURCE_INVALID");
    if (typeof source.text !== "string" || source.text.length === 0) throw Error("LONGITUDINAL_SOURCE_INVALID");
    const sourceDigest = sha256(source.text);
    if (source.sourceDigest !== undefined && source.sourceDigest !== sourceDigest)
      throw Error("LONGITUDINAL_SOURCE_CHANGED");
    const segments: ProvenanceSegment[] = segmentText(source.text);
    const now = new Date().toISOString();
    let created = 0;
    for (let index = 0; index < segments.length; index++) {
      const segment = segments[index];
      const inserted = await this.db.rawQuery<{ segment_index: number }>(
        `INSERT INTO cognition_v2_longitudinal_segments
          (tenant, source_event_id, segment_index, source_digest, digest, start_offset, end_offset, text, created_at)
         VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)
         ON CONFLICT (tenant, source_event_id, segment_index) DO NOTHING
         RETURNING segment_index`,
        [identity.tenantId, source.sourceEventId, index, sourceDigest, segment.digest, segment.start, segment.end, segment.text, now],
      );
      if (inserted.length > 0) {
        created++;
        continue;
      }
      // Ya existia: solo es idempotencia si el contenido coincide.
      const [existing] = await this.db.rawQuery<{ digest: string; source_digest: string }>(
        `SELECT digest, source_digest FROM cognition_v2_longitudinal_segments
         WHERE tenant=$1 AND source_event_id=$2 AND segment_index=$3`,
        [identity.tenantId, source.sourceEventId, index],
      );
      if (!existing || existing.digest !== segment.digest || existing.source_digest !== sourceDigest)
        throw Error("LONGITUDINAL_SEGMENT_CONFLICT");
    }
    return { segments: segments.length, created, sourceDigest };
  }

  /**
   * Borrado por tenant: retencion por antiguedad y supresion (evento o tenant).
   * Siempre acotado a la identidad autenticada; no existe variante sin tenant.
   * Exige exactamente un criterio: un DELETE sin criterio se rechaza en vez de
   * vaciar la tabla por error.
   */
  async purge(identity: LongitudinalIdentity, criteria: LongitudinalPurge): Promise<LongitudinalPurgeResult> {
    assertIdentity(identity);
    const selected = [
      criteria?.olderThanDays !== undefined,
      criteria?.sourceEventId !== undefined,
      criteria?.everything !== undefined,
    ].filter(Boolean).length;
    if (selected !== 1) throw Error("LONGITUDINAL_PURGE_INVALID");

    if (criteria.olderThanDays !== undefined) {
      const days = criteria.olderThanDays;
      if (!Number.isSafeInteger(days) || days < 1 || days > 36_500) throw Error("LONGITUDINAL_PURGE_INVALID");
      const cutoff = new Date(Date.now() - days * 86_400_000).toISOString();
      const removed = await this.db.rawQuery<{ segment_index: number }>(
        `DELETE FROM cognition_v2_longitudinal_segments
         WHERE tenant=$1 AND created_at < $2::timestamptz
         RETURNING segment_index`,
        [identity.tenantId, cutoff],
      );
      return { deleted: removed.length, scope: "older_than", cutoff };
    }

    if (criteria.sourceEventId !== undefined) {
      if (
        typeof criteria.sourceEventId !== "string" ||
        criteria.sourceEventId.length === 0 ||
        criteria.sourceEventId.length > 200
      )
        throw Error("LONGITUDINAL_PURGE_INVALID");
      const removed = await this.db.rawQuery<{ segment_index: number }>(
        `DELETE FROM cognition_v2_longitudinal_segments
         WHERE tenant=$1 AND source_event_id=$2
         RETURNING segment_index`,
        [identity.tenantId, criteria.sourceEventId],
      );
      return { deleted: removed.length, scope: "source_event" };
    }

    if (criteria.everything !== true) throw Error("LONGITUDINAL_PURGE_INVALID");
    const removed = await this.db.rawQuery<{ segment_index: number }>(
      `DELETE FROM cognition_v2_longitudinal_segments WHERE tenant=$1 RETURNING segment_index`,
      [identity.tenantId],
    );
    return { deleted: removed.length, scope: "tenant" };
  }

  /** Segmentos del tenant, del mas reciente al mas antiguo, filtrados por consulta. */
  async segments(identity: LongitudinalIdentity, query: LongitudinalQuery = {}): Promise<ContextPackItem[]> {
    assertIdentity(identity);
    const limit = query.limit ?? 200;
    if (!Number.isSafeInteger(limit) || limit < 1 || limit > 1000) throw Error("LONGITUDINAL_QUERY_INVALID");
    const needle = (query.query ?? "").trim().toLocaleLowerCase();
    if (needle.length > 500) throw Error("LONGITUDINAL_QUERY_INVALID");
    const rows = await this.db.rawQuery<{
      source_event_id: string;
      segment_index: number;
      text: string;
      created_at: string;
    }>(
      `SELECT source_event_id, segment_index, text, created_at
       FROM cognition_v2_longitudinal_segments
       WHERE tenant=$1 AND ($2::text = '' OR strpos(lower(text), $2::text) > 0)
       ORDER BY created_at DESC, source_event_id ASC, segment_index ASC
       LIMIT $3`,
      [identity.tenantId, needle, limit],
    );
    const seen = new Set<string>();
    const items: ContextPackItem[] = [];
    for (const row of rows) {
      const ref = cognitiveRefSchema.parse({
        tenantId: identity.tenantId,
        kind: "event",
        id: `${row.source_event_id}#${row.segment_index}`,
        revision: 1,
      });
      const key = JSON.stringify(ref);
      if (seen.has(key)) continue;
      seen.add(key);
      items.push({ ref, text: row.text, priority: 50, group: "narrative", mandatory: false });
    }
    return items;
  }

  /** Pack listo para la atencion: mismo validador que usa el nucleo. */
  async context(identity: LongitudinalIdentity, query: LongitudinalQuery = {}): Promise<LongitudinalContext> {
    const items = await this.segments(identity, query);
    return packLongitudinalContext(items, query.budget ?? 8_000, query.quotas ?? DEFAULT_QUOTAS);
  }
}
