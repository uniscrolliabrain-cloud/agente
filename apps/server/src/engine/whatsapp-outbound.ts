import { createHash, randomUUID } from "node:crypto";
import { z } from "zod";
import type { TenantScopedStore } from "../db-tenant.ts";
import { currentTenantScope } from "../tenant-scope.ts";
import { AppError, OutcomeUnknownError } from "../../../../packages/domain/src/errors.ts";
import { encryptSecret, decryptSecret } from "../../../../packages/integrations/src/vault.ts";
import { WhatsAppClient, type WhatsAppSendResult } from "../../../../packages/integrations/src/stubs/whatsapp.ts";

const CONNECTIONS = "whatsapp-connections";
const DRAFTS = "whatsapp-drafts";
const OPERATIONS = "whatsapp-outbound-operations";
const phone = z.string().trim().regex(/^\+?[0-9]{6,20}$/).transform((v) => v.replace(/^\+/, ""));
const content = z.string().min(1).max(4000).refine((v) => v.trim().length > 0);
const intent = z.string().min(8).max(200).regex(/^[A-Za-z0-9._:-]+$/);
export const whatsappDraftInput = z.object({ to: phone, text: content }).strict();
export const whatsappApprovalInput = z.object({ revision: z.string().regex(/^[a-f0-9]{64}$/) }).strict();
export const whatsappReconciliationInput = z.object({
  revision: z.string().regex(/^[a-f0-9]{64}$/),
  result: z.enum(["provider_accepted", "confirmed_not_sent"]),
  evidenceRef: z.string().min(3).max(200).regex(/^[A-Za-z0-9._:-]+$/),
  providerId: z.string().min(1).max(300).optional(),
  providerChecked: z.literal(true),
}).strict().refine((v) => v.result !== "provider_accepted" || Boolean(v.providerId?.trim()));
const connectionSchema = z.object({
  id: z.literal("whatsapp"), provider: z.literal("evolution"),
  tenantId: z.string().min(1), owner: z.string().min(1),
  generation: z.string().uuid(), baseUrl: z.string().url(), instance: z.string().min(1).max(200),
  secret: z.string().min(1), enabled: z.boolean(), allowedRecipients: z.array(phone).min(1).max(100),
  updatedAt: z.string(),
});
export type WhatsAppConnection = z.infer<typeof connectionSchema>;
export interface OutboundIdentity { tenantId: string; owner: string; actorId: string }
interface Draft {
  id: string; tenantId: string; owner: string; to: string; text: string;
  connectionGeneration: string; createdAt: string; expiresAt: string;
  status: string;
}
type OperationStatus = "dispatching" | "accepted" | "rejected" | "failed" | "outcome_unknown";
interface Operation {
  id: string; draftId: string; tenantId: string; owner: string; actorId: string;
  revision: string; to: string; text: string; connectionGeneration: string;
  status: OperationStatus; startedAt: string; attemptId: string;
  providerId?: string; resolvedAt?: string; errorCode?: string;
  reconciliation?: { result: string; evidenceRef: string; actorId: string; at: string; priorStatus: string };
}
type OutboundStore = Pick<TenantScopedStore, "get" | "list" | "insertIfAbsent" | "compareAndSwap" | "put">;
type Sender = Pick<WhatsAppClient, "sendText">;
interface OutboundOptions {
  encryptionKey?: string;
  enabled: boolean;
  now?: () => Date;
  sender?: (connection: WhatsAppConnection, apiKey: string) => Sender;
}
function sha(value: unknown): string { return createHash("sha256").update(JSON.stringify(value)).digest("hex"); }
function requireIdentity(identity: OutboundIdentity): void {
  const scope = currentTenantScope();
  if (!scope || scope.tenantId !== identity.tenantId || scope.actorId !== identity.actorId) throw new AppError("Scope de salida WhatsApp no valido", 403);
  if (!/^[A-Za-z0-9_-]{1,100}$/.test(identity.tenantId) || !identity.owner || identity.owner.length > 200 || !identity.actorId || identity.actorId.length > 200 || identity.owner.includes(":")) {
    throw new AppError("Identidad de salida WhatsApp no valida", 403);
  }
}
function validateBaseUrl(value: string): string {
  let url: URL;
  try { url = new URL(value); } catch { throw new AppError("URL de Evolution no valida", 422); }
  if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash) {
    throw new AppError("Evolution requiere URL HTTPS sin credenciales, query ni fragmento", 422);
  }
  return url.toString().replace(/\/+$/, "");
}
function assertConnectionScope(connection: WhatsAppConnection, identity: OutboundIdentity): void {
  if (connection.tenantId !== identity.tenantId || connection.owner !== identity.owner) {
    throw new AppError("La conexion WhatsApp no pertenece a esta empresa y usuario", 403);
  }
}
function revisionFor(draft: Pick<Draft, "id" | "tenantId" | "owner" | "to" | "text" | "connectionGeneration" | "expiresAt">): string {
  return sha([draft.id, draft.tenantId, draft.owner, draft.to, draft.text, draft.connectionGeneration, draft.expiresAt]);
}

/** Operator-only helper: never mounted as a public credential-writing endpoint. */
export async function provisionWhatsAppConnection(db: OutboundStore, identity: OutboundIdentity, input: {
  baseUrl: string; instance: string; apiKey: string; enabled: boolean; allowedRecipients: string[];
}, encryptionKey: string): Promise<Omit<WhatsAppConnection, "secret">> {
  requireIdentity(identity);
  const baseUrl = validateBaseUrl(input.baseUrl);
  if (!input.apiKey.trim()) throw new AppError("Falta credencial de Evolution", 422);
  const generation = randomUUID();
  let secret: string;
  try { secret = encryptSecret(JSON.stringify({ tenantId: identity.tenantId, owner: identity.owner, generation, baseUrl, instance: input.instance, apiKey: input.apiKey.trim() }), encryptionKey); }
  catch { throw new AppError("Configura la clave de cifrado de credenciales", 503); }
  const connection = connectionSchema.parse({
    id: "whatsapp", provider: "evolution", tenantId: identity.tenantId, owner: identity.owner,
    generation, baseUrl, instance: input.instance, secret,
    enabled: input.enabled, allowedRecipients: input.allowedRecipients, updatedAt: new Date().toISOString(),
  });
  await db.put(identity.owner, CONNECTIONS, connection);
  const { secret: _secret, ...publicConnection } = connection;
  return publicConnection;
}

/** Persistent decision ledger is authoritative, even if a legacy draft writer overwrites its cache. */
export class WhatsAppOutbound {
  constructor(private readonly db: OutboundStore, private readonly options: OutboundOptions) {}
  private now(): Date { return this.options.now?.() ?? new Date(); }
  private async connection(identity: OutboundIdentity): Promise<WhatsAppConnection> {
    requireIdentity(identity);
    const parsed = connectionSchema.safeParse(await this.db.get(identity.owner, CONNECTIONS, "whatsapp"));
    if (!parsed.success) throw new AppError("Provisiona la conexion WhatsApp de esta empresa", 503);
    assertConnectionScope(parsed.data, identity);
    validateBaseUrl(parsed.data.baseUrl);
    return parsed.data;
  }
  async connectionStatus(identity: OutboundIdentity) {
    const connection = await this.connection(identity);
    return { provider: connection.provider, instance: connection.instance, generation: connection.generation,
      enabled: connection.enabled, outboundEnabled: this.options.enabled, allowedRecipients: connection.allowedRecipients };
  }
  async createDraft(identity: OutboundIdentity, input: unknown, idempotencyKey: string) {
    requireIdentity(identity);
    const parsed = whatsappDraftInput.safeParse(input);
    if (!parsed.success || !intent.safeParse(idempotencyKey).success) throw new AppError("Destinatario, texto o Idempotency-Key no validos", 422);
    const connection = await this.connection(identity);
    if (!connection.enabled) throw new AppError("La conexion WhatsApp esta desactivada", 409);
    if (!connection.allowedRecipients.includes(parsed.data.to)) throw new AppError("Destinatario fuera de la lista del piloto", 403);
    const candidate: Draft = { id: sha([identity.tenantId, identity.owner, idempotencyKey]),
      tenantId: identity.tenantId, owner: identity.owner, ...parsed.data, connectionGeneration: connection.generation,
      createdAt: this.now().toISOString(), expiresAt: new Date(this.now().getTime() + 30 * 60_000).toISOString(), status: "awaiting_review" };
    const inserted = await this.db.insertIfAbsent(identity.owner, DRAFTS, candidate);
    const draft = inserted ?? await this.db.get<Draft>(identity.owner, DRAFTS, candidate.id);
    if (!draft) throw new AppError("No se pudo confirmar el borrador", 503);
    this.assertDraftScope(draft, identity);
    if (draft.to !== candidate.to || draft.text !== candidate.text || draft.connectionGeneration !== connection.generation) {
      throw new AppError("Idempotency-Key ya utilizada con otro contenido o conexion", 409);
    }
    return this.view(identity, draft);
  }
  async drafts(identity: OutboundIdentity) {
    requireIdentity(identity);
    const rows = await this.db.list<Draft>(identity.owner, DRAFTS, { limit: 100 });
    return Promise.all(rows.map((draft) => this.view(identity, draft)));
  }
  private assertDraftScope(draft: Draft, identity: OutboundIdentity): void {
    if (draft.tenantId !== identity.tenantId || draft.owner !== identity.owner) {
      throw new AppError("Borrador antiguo sin ambito explicito: preparalo de nuevo", 409);
    }
  }
  private async draft(identity: OutboundIdentity, id: string, revision: string): Promise<Draft> {
    requireIdentity(identity);
    const draft = await this.db.get<Draft>(identity.owner, DRAFTS, id);
    if (!draft) throw new AppError("Draft not found", 404);
    this.assertDraftScope(draft, identity);
    if (!whatsappApprovalInput.safeParse({ revision }).success || revision !== revisionFor(draft)) {
      throw new AppError("El borrador ha cambiado: revisa destinatario y contenido otra vez", 409);
    }
    return draft;
  }
  private async view(identity: OutboundIdentity, draft: Draft) {
    // Explicit foreign metadata is an isolation error, never a legacy draft to display.
    if ((draft.tenantId && draft.tenantId !== identity.tenantId) || (draft.owner && draft.owner !== identity.owner)) throw new AppError("Borrador de otra empresa o usuario", 403);
    // Legacy drafts stay visible for migration but cannot be sent with implicit credentials/scope.
    const legacy = draft.tenantId !== identity.tenantId || draft.owner !== identity.owner || !draft.connectionGeneration || !draft.expiresAt;
    const operation = await this.db.get<Operation>(identity.owner, OPERATIONS, draft.id);
    if (operation && (operation.tenantId !== identity.tenantId || operation.owner !== identity.owner)) throw new AppError("Ambito de operacion no valido", 403);
    return { id: draft.id, to: operation?.to ?? draft.to, text: operation?.text ?? draft.text,
      status: operation?.status ?? draft.status, createdAt: draft.createdAt, expiresAt: draft.expiresAt,
      revision: operation?.revision ?? (legacy ? null : revisionFor(draft)), needsReprepare: legacy && !operation,
      providerId: operation?.providerId, errorCode: operation?.errorCode, reconciliation: operation?.reconciliation,
      requiresReconciliation: operation?.status === "outcome_unknown" || (operation?.status === "dispatching" && this.now().getTime() - Date.parse(operation.startedAt) > 60_000) };
  }
  private operation(identity: OutboundIdentity, draft: Draft, revision: string, status: OperationStatus): Operation {
    return { id: draft.id, draftId: draft.id, ...identity, revision, to: draft.to, text: draft.text,
      connectionGeneration: draft.connectionGeneration, status, startedAt: this.now().toISOString(), attemptId: randomUUID() };
  }
  private replay(operation: Operation, identity: OutboundIdentity, revision: string) {
    if (operation.tenantId !== identity.tenantId || operation.owner !== identity.owner || operation.revision !== revision) {
      throw new AppError("La operacion existente no coincide con esta aprobacion", 409);
    }
    return { ok: operation.status === "accepted", status: operation.status, operationId: operation.id,
      providerId: operation.providerId, replay: true,
      requiresReconciliation: operation.status === "outcome_unknown" || operation.status === "dispatching" };
  }
  async reject(identity: OutboundIdentity, id: string, revision: string) {
    const draft = await this.draft(identity, id, revision);
    const existing = await this.db.get<Operation>(identity.owner, OPERATIONS, id);
    if (existing) {
      if (existing.status !== "rejected") throw new AppError("La decision ya esta tomada; no se puede rechazar un envio", 409);
      return { ...this.replay(existing, identity, revision), ok: true };
    }
    if (draft.status !== "awaiting_review") throw new AppError("Draft already resolved", 409);
    const decision = this.operation(identity, draft, revision, "rejected");
    const inserted = await this.db.insertIfAbsent(identity.owner, OPERATIONS, decision);
    if (!inserted) throw new AppError("Otra peticion ha resuelto el borrador", 409);
    await this.cacheStatus(identity, draft, "rejected");
    return { ok: true, status: "rejected", operationId: id };
  }
  private async cacheStatus(identity: OutboundIdentity, draft: Draft, status: string): Promise<void> {
    await this.db.compareAndSwap(identity.owner, DRAFTS, draft.id,
      { status: "awaiting_review", to: draft.to, text: draft.text, connectionGeneration: draft.connectionGeneration }, { status });
  }
  async approve(identity: OutboundIdentity, id: string, revision: string) {
    const draft = await this.draft(identity, id, revision);
    const prior = await this.db.get<Operation>(identity.owner, OPERATIONS, id);
    if (prior) return this.replay(prior, identity, revision);
    if (draft.status !== "awaiting_review" || !Number.isFinite(Date.parse(draft.expiresAt)) || this.now().getTime() >= Date.parse(draft.expiresAt)) {
      throw new AppError("Borrador resuelto o caducado; preparalo y revisalo de nuevo", 409);
    }
    if (!this.options.enabled) throw new AppError("La salida WhatsApp no esta activada", 503);
    const connection = await this.connection(identity);
    if (!connection.enabled || connection.generation !== draft.connectionGeneration) throw new AppError("La conexion ha cambiado o esta desactivada; prepara otro borrador", 409);
    if (!connection.allowedRecipients.includes(draft.to)) throw new AppError("Destinatario fuera de la lista del piloto", 403);
    let apiKey: string;
    try {
      const payload = z.object({ tenantId: z.string(), owner: z.string(), generation: z.string(), baseUrl: z.string(), instance: z.string(), apiKey: z.string().min(1) })
        .parse(JSON.parse(decryptSecret(connection.secret, this.options.encryptionKey ?? "")));
      if (payload.tenantId !== identity.tenantId || payload.owner !== identity.owner || payload.generation !== connection.generation || payload.baseUrl !== connection.baseUrl || payload.instance !== connection.instance) throw new Error("Credential scope mismatch");
      apiKey = payload.apiKey;
    }
    catch { throw new AppError("No se pudo abrir la credencial de WhatsApp", 503); }
    const operation = this.operation(identity, draft, revision, "dispatching");
    const inserted = await this.db.insertIfAbsent(identity.owner, OPERATIONS, operation);
    if (!inserted) {
      const current = await this.db.get<Operation>(identity.owner, OPERATIONS, id);
      if (!current) throw new AppError("No se pudo confirmar la operacion", 503);
      return this.replay(current, identity, revision);
    }
    // From this point no retry may dispatch again, even after a crash or an overwritten draft.
    let status: OperationStatus, providerId: string | undefined, errorCode: string | undefined;
    try {
      const latest = await this.connection(identity);
      if (!latest.enabled || latest.generation !== connection.generation || !latest.allowedRecipients.includes(draft.to)) {
        throw new AppError("La conexion cambio antes del envio", 409);
      }
      const sender = this.options.sender?.(connection, apiKey) ?? new WhatsAppClient({ apiKey, baseUrl: connection.baseUrl, instance: connection.instance });
      const result: WhatsAppSendResult = await sender.sendText(operation.to, operation.text);
      if (!result.accepted || !result.id) throw new OutcomeUnknownError();
      status = "accepted"; providerId = result.id;
    } catch (error) {
      // Unknown runtime failures are conservative: a failed response is not proof that no effect happened.
      status = error instanceof AppError && error.status < 500 ? "failed" : "outcome_unknown";
      errorCode = status === "failed" ? "provider_rejected_or_connection_changed" : "provider_outcome_unknown";
    }
    const saved = await this.db.compareAndSwap<Operation>(identity.owner, OPERATIONS, id,
      { status: "dispatching", attemptId: operation.attemptId }, { status, providerId, errorCode, resolvedAt: this.now().toISOString() });
    if (!saved) throw new AppError("El resultado requiere reconciliacion; no reintentes el envio", 503);
    await this.cacheStatus(identity, draft, status);
    return { ok: status === "accepted", status, operationId: id, providerId, replay: false, requiresReconciliation: status === "outcome_unknown" };
  }
  /** Records a human/provider check only; it never dispatches or clears the original operation. */
  async reconcile(identity: OutboundIdentity, id: string, input: unknown) {
    requireIdentity(identity);
    const parsed = whatsappReconciliationInput.safeParse(input);
    if (!parsed.success) throw new AppError("Comprueba el proveedor e indica resultado, revision y referencia", 422);
    const operation = await this.db.get<Operation>(identity.owner, OPERATIONS, id);
    if (!operation) throw new AppError("Operacion no encontrada", 404);
    this.replay(operation, identity, parsed.data.revision); // validates scope and exact original approval
    if (operation.reconciliation) {
      if (operation.reconciliation.result !== parsed.data.result || operation.reconciliation.evidenceRef !== parsed.data.evidenceRef ||
        (parsed.data.result === "provider_accepted" && operation.providerId !== parsed.data.providerId)) {
        throw new AppError("La operacion ya tiene otra reconciliacion", 409);
      }
      return { ...this.replay(operation, identity, parsed.data.revision), reconciled: true };
    }
    const stillRunning = operation.status === "dispatching" && this.now().getTime() - Date.parse(operation.startedAt) <= 60_000;
    if (stillRunning || (operation.status !== "dispatching" && operation.status !== "outcome_unknown")) {
      throw new AppError("La operacion no admite reconciliacion en este estado", 409);
    }
    if (!operation.attemptId || !Number.isFinite(Date.parse(operation.startedAt))) throw new AppError("Operacion sin fecha valida; requiere revision tecnica", 409);
    const status = parsed.data.result === "provider_accepted" ? "accepted" : "failed";
    const saved = await this.db.compareAndSwap<Operation>(identity.owner, OPERATIONS, id,
      { status: operation.status, attemptId: operation.attemptId }, {
        status, providerId: parsed.data.providerId ?? operation.providerId, resolvedAt: this.now().toISOString(), errorCode: "operator_reconciled",
        reconciliation: { result: parsed.data.result, evidenceRef: parsed.data.evidenceRef, actorId: identity.actorId,
          at: this.now().toISOString(), priorStatus: operation.status },
      });
    if (!saved) throw new AppError("La operacion cambio; vuelve a consultar su estado", 409);
    return { ...this.replay(saved, identity, parsed.data.revision), reconciled: true, replay: false };
  }}
