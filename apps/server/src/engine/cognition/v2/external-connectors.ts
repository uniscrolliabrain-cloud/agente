/**
 * Backend integration boundary for external cognition/media vendors.
 * The runtime and kernel own decisions; vendors are replaceable I/O ports.
 * C06 ships with NO outbound calls, secrets or fabricated readiness.
 */
export type ExternalConnector = "jev" | "anam" | "elevenlabs";
export type ConnectorState = "stub" | "verified" | "disabled";

export interface ConnectorReadiness {
  provider: ExternalConnector;
  state: ConnectorState;
  canConnect: boolean;
  reason: "STUB_ONLY" | "DISABLED" | "VERIFIED";
}

export interface ConnectorAuthorization {
  tenantId: string;
  actorId: string;
  policyRevision: string;
  operationId: string;
  /** Explicit, kernel-authorized outbound grant. Never a prompt claim. */
  grantId: string;
  expiresAt: string;
}

export interface ExternalConnectorPort<Input, Output> {
  readonly provider: ExternalConnector;
  readonly state: ConnectorState;
  execute(input: Input, authorization: ConnectorAuthorization, signal: AbortSignal): Promise<Output>;
}

export class StubExternalConnector<Input, Output> implements ExternalConnectorPort<Input, Output> {
  readonly state = "stub" as const;
  constructor(readonly provider: ExternalConnector) {}
  async execute(_input: Input, _authorization: ConnectorAuthorization, signal: AbortSignal): Promise<Output> {
    signal.throwIfAborted();
    throw Error(`CONNECTOR_STUB_ONLY:${this.provider}`);
  }
}

export function connectorReadiness(port: Pick<ExternalConnectorPort<unknown, unknown>, "provider" | "state">): ConnectorReadiness {
  return {
    provider: port.provider,
    state: port.state,
    canConnect: port.state === "verified",
    reason: port.state === "verified" ? "VERIFIED" : port.state === "disabled" ? "DISABLED" : "STUB_ONLY",
  };
}

/**
 * A future provider implementation must receive a kernel-issued grant.
 * Reject missing, expired, cross-tenant and cross-actor grants before egress.
 * This helper does not itself validate a signature or durable grant record:
 * the kernel egress gate must do that separately.
 */
export function assertConnectorGrant(
  grant: ConnectorAuthorization,
  expected: { tenantId: string; actorId: string; policyRevision: string; operationId: string },
  now = Date.now(),
): void {
  if (!grant || !grant.grantId?.trim() || !grant.tenantId?.trim() || !grant.actorId?.trim() ||
    grant.tenantId !== expected.tenantId || grant.actorId !== expected.actorId ||
    grant.policyRevision !== expected.policyRevision || grant.operationId !== expected.operationId ||
    !Number.isFinite(Date.parse(grant.expiresAt)) || Date.parse(grant.expiresAt) <= now) {
    throw Error("CONNECTOR_GRANT_DENIED");
  }
}

export const externalConnectorStubs = {
  jev: new StubExternalConnector<unknown, never>("jev"),
  anam: new StubExternalConnector<unknown, never>("anam"),
  elevenlabs: new StubExternalConnector<unknown, never>("elevenlabs"),
} as const;
