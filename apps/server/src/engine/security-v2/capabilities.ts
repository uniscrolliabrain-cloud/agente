import type { CyberSdkBridge } from "./sdk-adapter.ts";
import type { SecurityIdentity } from "./contracts.ts";
/** Explicit registry input, not automatic registration or a generic tool gateway. */
export const SECURITY_READ_CAPABILITIES = [
  { id: "security.assets.read", child: "assets.read", version: "2.0.0", sideEffects: ["delegation.consume"], idempotency: "at-most-once", retryable: false, requiresDelegation: true },
  { id: "security.findings.read", child: "findings.read", version: "2.0.0", sideEffects: ["delegation.consume"], idempotency: "at-most-once", retryable: false, requiresDelegation: true },
  { id: "security.jobs.read", child: "jobs.read", version: "2.0.0", sideEffects: ["delegation.consume"], idempotency: "at-most-once", retryable: false, requiresDelegation: true },
] as const;
export function governedSecurityTools(bridge: CyberSdkBridge, identity: () => Promise<SecurityIdentity>) {
  return Object.fromEntries(SECURITY_READ_CAPABILITIES.map((capability) => [capability.id, {
    description: "Read a server-selected security resource through an existing approved one-use delegation.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    execute: async (input: unknown) => {
      if (!input || typeof input !== "object" || Array.isArray(input) || Object.keys(input).length) throw Error("SECURITY_CLOSED_INPUT");
      return bridge.read(await identity(), { capability: capability.child });
    },
  }]));
}
