// Reuse the pinned child SDK. No arbitrary HTTP, shell, approval or write proxy.
import { CyberClient } from "@agntia/ciberseguridad";
import { z } from "zod";
import { securityIdentitySchema, securityReadSchema, securityJobStateSchema,
  type SecurityIdentity, type SecurityReadCapability } from "./contracts.ts";
export interface GovernedReadGrant {
  client: Pick<CyberClient, "governedRead">;
  tenantId: string; actorId: string; agentId: string; policyRevision: string;
  resourceId: string; oneUseToken: string; grantId: string; expiresAt: string;
}
export interface SecurityAuthorization {
  // Both callbacks are trusted server dependencies; model input has only a capability.
  current(identity: SecurityIdentity): Promise<boolean>;
  delegation(identity: SecurityIdentity, capability: SecurityReadCapability): Promise<GovernedReadGrant>;
}
const readItemSchema = z.object({
  id: z.string().regex(/^[a-f0-9]{32}(?:[a-f0-9]{32})?$/),
  state: z.string().min(1).max(64).optional(), revision: z.number().int().nonnegative().optional(),
  severity: z.enum(["critical", "high", "medium", "low", "info", "unknown"]).optional(),
}).strip();
export class CyberSdkBridge {
  constructor(private readonly authorization: SecurityAuthorization, private readonly clock = () => Date.now()) {}
  async read(rawIdentity: SecurityIdentity, rawRequest: unknown) {
    const identity = securityIdentitySchema.parse(rawIdentity), request = securityReadSchema.parse(rawRequest);
    if (!await this.authorization.current(identity)) throw Error("SECURITY_PARENT_DENIED");
    const grant = await this.authorization.delegation(identity, request.capability);
    if (grant.tenantId !== identity.tenantId || grant.actorId !== identity.actorId || grant.agentId !== identity.agentId ||
      grant.policyRevision !== identity.policyRevision || !/^[a-f0-9]{32}$/.test(grant.resourceId) ||
      !grant.grantId || !Number.isFinite(Date.parse(grant.expiresAt)) || Date.parse(grant.expiresAt) <= this.clock()) throw Error("SECURITY_GRANT_DENIED");
    if (!await this.authorization.current(identity)) throw Error("SECURITY_PARENT_DENIED");
    // A delegation POST may consume a one-use token. Never blindly retry a timeout.
    const result = await grant.client.governedRead({ token: grant.oneUseToken, capability: request.capability, resource_id: grant.resourceId });
    if (!await this.authorization.current(identity)) throw Error("SECURITY_PARENT_REVOKED");
    if (result.security_guarantee !== false) throw Error("SECURITY_INVALID_GUARANTEE");
    const items = result.data.map((raw) => {
      if (raw.tenant_id !== undefined && raw.tenant_id !== identity.tenantId) throw Error("SECURITY_TENANT_MISMATCH");
      if (request.capability === "assets.read" && raw.id !== grant.resourceId) throw Error("SECURITY_RESOURCE_MISMATCH");
      if (request.capability === "jobs.read") securityJobStateSchema.parse(raw.state);
      if (request.capability === "assets.read") z.enum(["registered", "disabled"]).parse(raw.state);
      if (request.capability === "findings.read") z.enum(["suspected", "confirmed", "false_positive", "accepted_risk", "suppressed", "remediated", "verified_fixed"]).parse(raw.state);
      return readItemSchema.parse(raw);
    });
    return { schemaVersion: "2.0" as const, tenantId: identity.tenantId, actorId: identity.actorId,
      capability: request.capability, delegationId: result.delegation_id, resourceId: grant.resourceId,
      items, coverage: "not_reported" as const, securityGuarantee: false as const };
  }
}
/** Only server code may provide the origin/credential; never forward a browser token. */
export function createScopedCyberClient(configuration: {
  baseUrl: string; approvedOrigins: readonly string[]; identity: SecurityIdentity;
  credential: () => Promise<string>; fetch?: typeof fetch;
}): CyberClient {
  const identity = securityIdentitySchema.parse(configuration.identity);
  return new CyberClient({ baseUrl: configuration.baseUrl, approvedOrigins: configuration.approvedOrigins,
    tenantId: identity.tenantId, credential: configuration.credential, timeoutMs: 5000, fetch: configuration.fetch });
}
