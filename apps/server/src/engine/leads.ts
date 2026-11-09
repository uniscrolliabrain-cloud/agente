// LEADS_PIPELINE_V1 (campana 17) - Places devuelve candidatos transitorios y
// una ficha solo existe cuando un comercial la acepta. Buscar nunca escribe.
//
// Politica de datos: el contenido de Places no se persiste al buscar; se guarda
// solo la ficha aceptada, con su origen acreditado (proveedor, consulta y
// fecha) y las notas humanas. El dominio es una senal comercial, no la clave de
// unicidad: dos negocios de la misma cadena son fichas distintas.
import { createHash } from "node:crypto";
import { z } from "zod";
import {
  GoogleMapsClient,
  type PlaceSearchInput,
} from "../../../../packages/integrations/src/google-maps.ts";
import type { TenantScopedStore } from "../db-tenant.ts";
import { AppError } from "../errors.ts";

const KIND = "leads";
const MAX_NOTES = 5000;
// La ficha vive en el pipeline de la empresa, no en el cajon de un comercial:
// los dos seudonimos de A aceptan la misma ficha y B tiene la suya, porque la
// clave de almacenamiento incluye el tenant.
const PIPELINE_OWNER = "pipeline";

/** Referencia estable por empresa: el placeId solo es unico dentro de Google. */
export const leadRef = (tenantId: string, placeId: string) =>
  `lead_${createHash("sha256").update(`${tenantId}:${placeId}`).digest("hex").slice(0, 32)}`;

export function domainOf(website: string | undefined): string | undefined {
  if (!website) return undefined;
  try {
    const host = new URL(website).hostname.toLowerCase().replace(/^www\./, "");
    return host || undefined;
  } catch {
    return undefined;
  }
}

export interface LeadSourceCredit {
  provider: "google_places";
  placeId: string;
  query: string;
  discoveredAt: string;
}

export interface LeadFicha {
  id: string;
  ref: string;
  placeId: string;
  tenantId: string;
  owner: string;
  acceptedBy: string[];
  name: string;
  address: string;
  phone?: string;
  website?: string;
  domain?: string;
  rating?: number;
  reviews?: number;
  mapsUrl?: string;
  businessStatus?: string;
  notes: string;
  status: "accepted";
  source: LeadSourceCredit;
  acceptedAt: string;
  updatedAt: string;
}

export interface LeadCandidate {
  ref: string;
  placeId: string;
  name: string;
  address: string;
  phone?: string;
  website?: string;
  domain?: string;
  rating?: number;
  reviews?: number;
  mapsUrl?: string;
  businessStatus?: string;
  accepted: boolean;
  acceptedRef?: string;
  discoveredAt: string;
}

interface StoredLead {
  id: string;
  ref?: string;
  placeId?: string;
  tenantId: string;
  owner?: string;
  acceptedBy?: string[];
  name: string;
  address?: string;
  phone?: string;
  website?: string;
  rating?: number;
  reviews?: number;
  mapsUrl?: string;
  businessStatus?: string;
  status?: string;
  source?: LeadSourceCredit | string | Record<string, unknown>;
  query?: string;
  discoveredAt?: string;
  notes?: string;
  acceptedAt?: string;
  updatedAt?: string;
}

export const leadAcceptInput = z
  .object({
    placeId: z
      .string()
      .trim()
      .min(1)
      .max(512)
      .regex(/^[A-Za-z0-9_-]+$/, "placeId invalido"),
    name: z.string().trim().min(1).max(300),
    address: z.string().max(1000).default(""),
    phone: z.string().max(40).optional(),
    website: z.url().max(2000).optional(),
    rating: z.number().min(0).max(5).optional(),
    reviews: z.number().int().nonnegative().optional(),
    mapsUrl: z.url().max(2000).optional(),
    businessStatus: z.string().max(60).optional(),
    notes: z.string().max(MAX_NOTES).optional(),
    query: z.string().max(500).optional(),
  })
  .strict();
export type LeadAcceptInput = z.input<typeof leadAcceptInput>;
export type LeadAcceptRequest = z.infer<typeof leadAcceptInput>;

// LEAD_FOLLOW_UP_V1 (campana 19) - seguimiento supervisado por lead e hilo.
// El seguimiento no vive en la cabeza de un comercial: se guarda por empresa,
// lead y paso, con su hilo, su fecha y el estado que lo cancela.
const FOLLOW_UP_KIND = "lead-follow-ups";
const OPPOSITION_KIND = "lead-oppositions";
export const MAX_FOLLOW_UP_STEPS = 3;

export type LeadFollowUpStatus =
  | "scheduled"
  | "awaiting_approval"
  | "sent"
  | "replied"
  | "booked"
  | "opted_out"
  | "suspended"
  | "cancelled";

export interface LeadFollowUp {
  id: string;
  ref: string;
  tenantId: string;
  step: number;
  status: LeadFollowUpStatus;
  threadId: string;
  replyToMessageId: string;
  to: string;
  subject: string;
  scheduledFor: string;
  actionId?: string;
  sentAt?: string;
  sentMessageId?: string;
  replyMessageId?: string;
  repliedAt?: string;
  cancelledReason?: string;
  cancelledAt?: string;
  appointment?: { receiptId: string; eventId: string; startsAt: string; threadId: string };
  createdAt: string;
  updatedAt: string;
}

export type OppositionReason = "baja" | "respuesta" | "suspension" | "resultado_ambiguo" | "manual";

export interface LeadOpposition {
  id: string;
  ref: string;
  tenantId: string;
  reason: OppositionReason;
  source: string;
  createdAt: string;
}

export interface FollowUpEligibility {
  eligible: boolean;
  reasons: string[];
}

export interface InboundFollowUpMessage {
  id: string;
  threadId: string;
  from: string;
  subject?: string;
  body?: string;
  date: string;
}

const normEmail = (value: string) => {
  const match = /<([^>]+)>/.exec(value);
  return (match?.[1] ?? value).trim().toLowerCase();
};

const isOpenFollowUp = (status: LeadFollowUpStatus) =>
  status === "scheduled" || status === "awaiting_approval" || status === "sent";

/**
 * Elegibilidad explicita: un paso solo nace si hay contacto, hilo, fecha futura
 * y el paso anterior se envio. La lista de oposicion manda sobre todo lo demas.
 */
export function followUpEligibility(input: {
  ficha: LeadFicha;
  step: number;
  contactEmail: string;
  threadId: string;
  replyToMessageId: string;
  scheduledFor: string;
  followUps: LeadFollowUp[];
  opposed: boolean;
  now?: string;
}): FollowUpEligibility {
  const reasons: string[] = [];
  const now = input.now ?? new Date().toISOString();
  const own = input.followUps.filter((followUp) => followUp.ref === input.ficha.ref);
  if (input.ficha.status !== "accepted") reasons.push("ficha no aceptada");
  if (input.ficha.businessStatus && input.ficha.businessStatus !== "OPERATIONAL")
    reasons.push("negocio no operativo");
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(input.contactEmail)) reasons.push("contacto ausente");
  if (!input.threadId.trim()) reasons.push("hilo ausente");
  if (!input.replyToMessageId.trim()) reasons.push("mensaje de origen ausente");
  if (input.opposed) reasons.push("el contacto pidio la baja");
  if (!Number.isInteger(input.step) || input.step < 1 || input.step > MAX_FOLLOW_UP_STEPS)
    reasons.push("paso fuera de rango");
  if (
    !Number.isFinite(Date.parse(input.scheduledFor)) ||
    Date.parse(input.scheduledFor) <= Date.parse(now)
  )
    reasons.push("fecha de envio en el pasado");
  if (own.some((followUp) => isOpenFollowUp(followUp.status)))
    reasons.push("ya hay un seguimiento abierto");
  if (own.some((followUp) => followUp.status === "replied")) reasons.push("el contacto ya respondio");
  if (own.some((followUp) => followUp.status === "booked")) reasons.push("ya hay una cita");
  if (own.some((followUp) => followUp.step === input.step)) reasons.push("paso ya preparado");
  if (
    input.step > 1 &&
    !own.some(
      (followUp) =>
        followUp.step === input.step - 1 &&
        (followUp.status === "sent" ||
          followUp.status === "replied" ||
          followUp.status === "booked"),
    )
  )
    reasons.push("el paso anterior no se envio");
  return { eligible: reasons.length === 0, reasons };
}

/** Respuesta del contacto en el hilo, posterior al seguimiento y con su identidad. */
export function detectFollowUpReply(
  followUp: LeadFollowUp,
  messages: InboundFollowUpMessage[],
): InboundFollowUpMessage | undefined {
  const baseline = followUp.sentAt ?? followUp.createdAt;
  return messages
    .filter(
      (message) =>
        message.threadId === followUp.threadId &&
        normEmail(message.from) === normEmail(followUp.to) &&
        Date.parse(message.date) > Date.parse(baseline),
    )
    .sort((a, b) => b.date.localeCompare(a.date))[0];
}

export function looksLikeOptOut(text: string): boolean {
  return /\b(baja|dar de baja|date de baja|unsubscribe|dejar de escribir|no me escrib|remove me)\b/i.test(
    text,
  );
}

export class LeadsService {
  constructor(
    private readonly db: TenantScopedStore,
    private readonly maps: GoogleMapsClient,
  ) {}

  /**
   * Buscar devuelve candidatos y no toca el pipeline: cero escrituras. La
   * procedencia viaja con el candidato solo para que el comercial la vea; la
   * fecha acreditada se sella al aceptar.
   */
  async discover(
    tenantId: string,
    input: PlaceSearchInput,
  ): Promise<{ found: number; candidates: LeadCandidate[]; accepted: number }> {
    const found = await this.maps.searchLeads(input);
    const fichas = await this.list(tenantId);
    const byPlaceId = new Map(fichas.map((ficha) => [ficha.placeId, ficha]));
    const discoveredAt = new Date().toISOString();
    const candidates = found.map((place) => {
      const existing = byPlaceId.get(place.placeId);
      const domain = domainOf(place.website);
      const businessStatus = place.businessStatus ?? place.status;
      return {
        ref: leadRef(tenantId, place.placeId),
        placeId: place.placeId,
        name: place.name,
        address: place.address,
        ...(place.phone ? { phone: place.phone } : {}),
        ...(place.website ? { website: place.website } : {}),
        ...(domain ? { domain } : {}),
        ...(place.rating !== undefined ? { rating: place.rating } : {}),
        ...(place.reviews !== undefined ? { reviews: place.reviews } : {}),
        ...(place.mapsUrl ? { mapsUrl: place.mapsUrl } : {}),
        ...(businessStatus ? { businessStatus } : {}),
        accepted: Boolean(existing),
        ...(existing ? { acceptedRef: existing.ref } : {}),
        discoveredAt,
      };
    });
    return {
      found: found.length,
      candidates,
      accepted: candidates.filter((candidate) => candidate.accepted).length,
    };
  }

  /** Fichas aceptadas de la empresa, con las filas legacy normalizadas al leer. */
  async list(tenantId: string): Promise<LeadFicha[]> {
    const rows = await this.db.scanByPrefix<StoredLead>(KIND, tenantId, 2000);
    const groups = new Map<string, LeadFicha[]>();
    for (const { value } of rows) {
      if (value.tenantId !== tenantId) continue;
      const ficha = this.normalize(value, tenantId);
      groups.set(ficha.ref, [...(groups.get(ficha.ref) ?? []), ficha]);
    }
    return [...groups.values()]
      .map(
        (group) =>
          group.find((ficha) => ficha.id === ficha.ref) ??
          group.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0],
      )
      .sort((a, b) => b.acceptedAt.localeCompare(a.acceptedAt));
  }

  /**
   * Aceptar es idempotente por empresa y referencia: el segundo comercial que
   * acepta la misma ficha no duplica fila, no pisa notas y queda registrado en
   * `acceptedBy`.
   */
  async accept(
    actor: string,
    tenantId: string,
    input: LeadAcceptRequest,
  ): Promise<{ lead: LeadFicha; created: boolean }> {
    const now = new Date().toISOString();
    const rows = (await this.db.scanByPrefix<StoredLead>(KIND, tenantId, 2000)).filter(
      ({ value }) => value.tenantId === tenantId,
    );
    const shared = rows.find(
      ({ value }) => value.ref && (value.placeId ?? value.id) === input.placeId,
    );
    if (shared) return { lead: await this.merge(actor, this.normalize(shared.value, tenantId), input, now), created: false };

    const legacy = rows.find(({ value }) => !value.ref && value.id === input.placeId);
    const ref = leadRef(tenantId, input.placeId);
    const base = legacy
      ? this.withInput(this.normalize(legacy.value, tenantId), input)
      : this.fresh(actor, tenantId, input, now);
    const ficha: LeadFicha = {
      ...base,
      acceptedBy: this.actors(base.acceptedBy, actor),
      // Las notas que ya existian mandan: aceptar dos veces nunca las borra.
      notes: base.notes || input.notes || "",
      updatedAt: now,
    };
    const inserted = await this.db.insertIfAbsent(PIPELINE_OWNER, KIND, ficha);
    if (!inserted) {
      // Carrera entre dos comerciales: gana el primero y el segundo se une.
      const raced = await this.db.get<StoredLead>(PIPELINE_OWNER, KIND, ref);
      if (!raced) throw new AppError("La ficha no se pudo guardar; reintenta", 409);
      return { lead: await this.merge(actor, this.normalize(raced, tenantId), input, now), created: false };
    }
    // Migracion perezosa: la fila legacy se retira solo despues de escribir la
    // ficha nueva, con sus notas y su origen ya preservados.
    if (legacy) await this.db.remove(legacy.owner, KIND, legacy.value.id);
    return { lead: inserted as LeadFicha, created: true };
  }

  /** Seguimientos de la empresa, opcionalmente de un lead. */
  async followUps(tenantId: string, ref?: string): Promise<LeadFollowUp[]> {
    const rows = await this.db.scanByPrefix<LeadFollowUp>(FOLLOW_UP_KIND, tenantId, 2000);
    return rows
      .map(({ value }) => value)
      .filter((followUp) => followUp.tenantId === tenantId && (!ref || followUp.ref === ref))
      .sort((a, b) => a.ref.localeCompare(b.ref) || a.step - b.step);
  }

  async opposition(tenantId: string, ref: string): Promise<LeadOpposition | null> {
    const row = await this.db.get<LeadOpposition>(PIPELINE_OWNER, OPPOSITION_KIND, ref);
    return row && row.tenantId === tenantId ? row : null;
  }

  /**
   * Baja o suspension: la lista de oposicion manda sobre cualquier paso abierto.
   * Repetirla no duplica el seguimiento ni lo reabre.
   */
  async oppose(
    tenantId: string,
    ref: string,
    input: { reason: OppositionReason; source: string; at?: string },
  ): Promise<{ opposition: LeadOpposition; cancelled: LeadFollowUp[] }> {
    const at = input.at ?? new Date().toISOString();
    const opposition: LeadOpposition = {
      id: ref,
      ref,
      tenantId,
      reason: input.reason,
      source: input.source,
      createdAt: at,
    };
    await this.db.put(PIPELINE_OWNER, OPPOSITION_KIND, opposition);
    const status: LeadFollowUpStatus =
      input.reason === "suspension"
        ? "suspended"
        : input.reason === "resultado_ambiguo"
          ? "cancelled"
          : "opted_out";
    const cancelled: LeadFollowUp[] = [];
    for (const followUp of (await this.followUps(tenantId, ref)).filter((item) =>
      isOpenFollowUp(item.status),
    )) {
      const next = await this.markFollowUp(
        tenantId,
        ref,
        followUp.step,
        { status, cancelledReason: input.reason, cancelledAt: at },
        followUp.status,
      );
      if (next) cancelled.push(next);
    }
    return { opposition, cancelled };
  }

  async markFollowUp(
    tenantId: string,
    ref: string,
    step: number,
    patch: Partial<LeadFollowUp>,
    expectedStatus?: LeadFollowUpStatus,
  ): Promise<LeadFollowUp | null> {
    const id = `${ref}:${step}`;
    const current = await this.db.get<LeadFollowUp>(PIPELINE_OWNER, FOLLOW_UP_KIND, id);
    if (!current || current.tenantId !== tenantId) return null;
    if (expectedStatus && current.status !== expectedStatus) return null;
    return this.db.compareAndSwap<LeadFollowUp>(
      PIPELINE_OWNER,
      FOLLOW_UP_KIND,
      id,
      { status: current.status },
      { ...patch, updatedAt: new Date().toISOString() },
    );
  }

  /**
   * Programa un paso durable por lead. La clave incluye lead y paso, asi que
   * reintentar la preparacion no duplica el seguimiento ni reinicia la cuenta.
   */
  async scheduleFollowUp(
    tenantId: string,
    input: {
      ref: string;
      step: number;
      threadId: string;
      replyToMessageId: string;
      to: string;
      subject: string;
      scheduledFor: string;
    },
  ): Promise<{ followUp: LeadFollowUp; created: boolean; eligibility: FollowUpEligibility }> {
    const id = `${input.ref}:${input.step}`;
    const existing = await this.db.get<LeadFollowUp>(PIPELINE_OWNER, FOLLOW_UP_KIND, id);
    if (existing && existing.tenantId === tenantId) {
      return {
        followUp: existing,
        created: false,
        eligibility: { eligible: true, reasons: [] },
      };
    }
    const ficha = (await this.list(tenantId)).find((item) => item.ref === input.ref);
    if (!ficha) throw new AppError("La ficha no esta aceptada en esta empresa", 404);
    const followUps = await this.followUps(tenantId);
    const opposed = Boolean(await this.opposition(tenantId, input.ref));
    const eligibility = followUpEligibility({
      ficha,
      step: input.step,
      contactEmail: input.to,
      threadId: input.threadId,
      replyToMessageId: input.replyToMessageId,
      scheduledFor: input.scheduledFor,
      followUps,
      opposed,
    });
    if (!eligibility.eligible)
      throw new AppError(
        `No se puede programar el seguimiento: ${eligibility.reasons.join(", ")}`,
        422,
      );
    const now = new Date().toISOString();
    const followUp: LeadFollowUp = {
      id,
      ref: input.ref,
      tenantId,
      step: input.step,
      status: "scheduled",
      threadId: input.threadId,
      replyToMessageId: input.replyToMessageId,
      to: input.to,
      subject: input.subject,
      scheduledFor: input.scheduledFor,
      createdAt: now,
      updatedAt: now,
    };
    const inserted = await this.db.insertIfAbsent(PIPELINE_OWNER, FOLLOW_UP_KIND, followUp);
    if (!inserted) {
      const raced = await this.db.get<LeadFollowUp>(PIPELINE_OWNER, FOLLOW_UP_KIND, id);
      if (!raced) throw new AppError("El seguimiento no se pudo guardar; reintenta", 409);
      return { followUp: raced, created: false, eligibility };
    }
    return { followUp: inserted, created: true, eligibility };
  }

  /**
   * Respuesta del contacto. La identidad se comprueba aqui, no en la UI: un
   * mensaje de otro remitente en el mismo hilo no responde por el lead.
   */
  async recordInbound(
    tenantId: string,
    ref: string,
    input: { messageId: string; from: string; at: string; optOut: boolean },
  ): Promise<LeadFollowUp | null> {
    const followUp = (await this.followUps(tenantId, ref))
      .filter((item) => isOpenFollowUp(item.status))
      .sort((a, b) => b.step - a.step)[0];
    if (!followUp) return null;
    if (normEmail(input.from) !== normEmail(followUp.to))
      throw new AppError("El remitente no es el contacto del seguimiento", 409);
    if (input.optOut) {
      await this.oppose(tenantId, ref, {
        reason: "baja",
        source: `mail:${input.messageId}`,
        at: input.at,
      });
      return (await this.followUps(tenantId, ref)).find((item) => item.step === followUp.step) ?? null;
    }
    return this.markFollowUp(
      tenantId,
      ref,
      followUp.step,
      { status: "replied", replyMessageId: input.messageId, repliedAt: input.at },
      followUp.status,
    );
  }

  /** Una cita solo existe despues de una respuesta y con el recibo del proveedor. */
  async bookAppointment(
    tenantId: string,
    ref: string,
    input: { receiptId: string; eventId: string; startsAt: string; threadId?: string },
  ): Promise<LeadFollowUp> {
    const followed = (await this.followUps(tenantId, ref)).find((item) => item.status === "replied");
    if (!followed) throw new AppError("Solo se agenda una cita despues de una respuesta", 409);
    if (!input.receiptId.trim()) throw new AppError("La cita necesita el recibo del envio", 409);
    if (!input.eventId.trim() || !Number.isFinite(Date.parse(input.startsAt)))
      throw new AppError("La cita necesita evento y hora", 422);
    const updated = await this.markFollowUp(
      tenantId,
      ref,
      followed.step,
      {
        status: "booked",
        appointment: {
          receiptId: input.receiptId,
          eventId: input.eventId,
          startsAt: input.startsAt,
          threadId: input.threadId ?? followed.threadId,
        },
      },
      "replied",
    );
    if (!updated) throw new AppError("El seguimiento cambio; revisa la respuesta", 409);
    return updated;
  }

  private async merge(
    actor: string,
    current: LeadFicha,
    input: LeadAcceptRequest,
    now: string,
  ): Promise<LeadFicha> {
    const acceptedBy = this.actors(current.acceptedBy, actor);
    const notes = current.notes || input.notes || "";
    if (acceptedBy.length === current.acceptedBy.length && notes === current.notes) return current;
    const patch = { acceptedBy, notes, updatedAt: now };
    const updated = await this.db.compareAndSwap<LeadFicha>(PIPELINE_OWNER, KIND, current.id, {
      ref: current.ref,
    }, patch);
    return updated ?? { ...current, ...patch };
  }

  private actors(current: string[], actor: string): string[] {
    return current.includes(actor) ? current : [...current, actor];
  }

  private fresh(
    actor: string,
    tenantId: string,
    input: LeadAcceptRequest,
    now: string,
  ): LeadFicha {
    const ref = leadRef(tenantId, input.placeId);
    const domain = domainOf(input.website);
    return {
      id: ref,
      ref,
      placeId: input.placeId,
      tenantId,
      owner: actor,
      acceptedBy: [actor],
      name: input.name,
      address: input.address ?? "",
      ...(input.phone ? { phone: input.phone } : {}),
      ...(input.website ? { website: input.website } : {}),
      ...(domain ? { domain } : {}),
      ...(input.rating !== undefined ? { rating: input.rating } : {}),
      ...(input.reviews !== undefined ? { reviews: input.reviews } : {}),
      ...(input.mapsUrl ? { mapsUrl: input.mapsUrl } : {}),
      ...(input.businessStatus ? { businessStatus: input.businessStatus } : {}),
      notes: input.notes ?? "",
      status: "accepted",
      source: {
        provider: "google_places",
        placeId: input.placeId,
        query: input.query ?? "",
        discoveredAt: now,
      },
      acceptedAt: now,
      updatedAt: now,
    };
  }

  /** Una fila legacy conserva sus datos; la peticion solo rellena lo que falta. */
  private withInput(ficha: LeadFicha, input: LeadAcceptRequest): LeadFicha {
    const domain = ficha.domain ?? domainOf(input.website);
    return {
      ...ficha,
      name: ficha.name || input.name,
      address: ficha.address || input.address || "",
      ...(!ficha.phone && input.phone ? { phone: input.phone } : {}),
      ...(!ficha.website && input.website ? { website: input.website } : {}),
      ...(domain ? { domain } : {}),
      ...(ficha.rating === undefined && input.rating !== undefined ? { rating: input.rating } : {}),
      ...(ficha.reviews === undefined && input.reviews !== undefined ? { reviews: input.reviews } : {}),
      ...(!ficha.mapsUrl && input.mapsUrl ? { mapsUrl: input.mapsUrl } : {}),
      ...(!ficha.businessStatus && input.businessStatus ? { businessStatus: input.businessStatus } : {}),
      ...(ficha.source.query || !input.query
        ? {}
        : { source: { ...ficha.source, query: input.query } }),
    };
  }

  private normalize(row: StoredLead, tenantId: string): LeadFicha {
    const placeId = row.placeId ?? row.id;
    const ref = row.ref ?? leadRef(tenantId, placeId);
    const credited =
      row.source && typeof row.source === "object"
        ? (row.source as LeadSourceCredit)
        : null;
    const acceptedAt = row.acceptedAt ?? row.discoveredAt ?? new Date(0).toISOString();
    const acceptedBy = row.acceptedBy?.length
      ? [...new Set(row.acceptedBy)]
      : row.owner
        ? [row.owner]
        : [];
    const domain = domainOf(row.website);
    return {
      id: row.ref ?? row.id,
      ref,
      placeId,
      tenantId,
      owner: row.owner ?? acceptedBy[0] ?? "",
      acceptedBy,
      name: row.name,
      address: row.address ?? "",
      ...(row.phone ? { phone: row.phone } : {}),
      ...(row.website ? { website: row.website } : {}),
      ...(domain ? { domain } : {}),
      ...(row.rating !== undefined ? { rating: row.rating } : {}),
      ...(row.reviews !== undefined ? { reviews: row.reviews } : {}),
      ...(row.mapsUrl ? { mapsUrl: row.mapsUrl } : {}),
      ...(row.businessStatus ? { businessStatus: row.businessStatus } : {}),
      notes: row.notes ?? "",
      status: "accepted",
      source: {
        provider: "google_places",
        placeId,
        query: credited?.query ?? row.query ?? "",
        discoveredAt: credited?.discoveredAt ?? row.discoveredAt ?? acceptedAt,
      },
      acceptedAt,
      updatedAt: row.updatedAt ?? acceptedAt,
    };
  }
}
