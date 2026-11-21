// C13_VOICE_CONTRACTS_V2: a presentation channel, never permission to execute.
import { z } from "zod";
import type { CognitiveIdentity } from "../../../../../packages/domain/src/cognition-v2.ts";
const id = z.string().min(1).max(200);
const time = z.iso.datetime({ offset: true });
export const voiceSessionInputSchema = z.strictObject({
  agentId: id, roleId: id, threadId: id, consentReceiptId: id,
  contextSnapshotId: id,
});
export const voiceSessionSchema = z.strictObject({
  schemaVersion: z.literal("2.0"), sessionId: id, tenantId: id, actorId: id,
  agentId: id, roleId: id, threadId: id, consentReceiptId: id,
  contextSnapshotId: id, policyRevision: id,
  state: z.enum(["authorized", "ready", "processing", "interrupted", "closed", "failed"]),
  revision: z.number().int().positive(), epoch: z.number().int().nonnegative(),
  createdAt: time, lastActivityAt: time, expiresAt: time,
  closedReason: z.enum(["user", "silence", "timeout", "consent_revoked", "error"]).optional(),
});
export type VoiceSessionV2 = z.infer<typeof voiceSessionSchema>;
export const transcriptInputSchema = z.strictObject({
  utteranceId: id, revision: z.number().int().positive(),
  status: z.enum(["partial", "final"]), text: z.string().min(1).max(4000),
});
export interface VoiceTurnV2 {
  turnId: string; tenantId: string; sessionId: string; actorId: string;
  utteranceId: string; utteranceRevision: number; epoch: number;
  state: "accepted" | "rendering" | "completed" | "interrupted" | "failed";
  renderFence?: number; renderLeaseUntil?: string;
  transcriptDigest: string; receiptId?: string;
}
export interface AvatarProviderPort {
  readonly name: string;
  readonly verified: boolean;
  readonly verificationRef?: string;
  createSession(session: VoiceSessionV2, signal: AbortSignal): Promise<{ providerSessionId: string; ephemeralToken: string; expiresAt: string }>;
  interrupt(providerSessionId: string, epoch: number, signal: AbortSignal): Promise<void>;
  close(providerSessionId: string, signal: AbortSignal): Promise<void>;
}
/** No fake HTTP adapter: an unverified provider cannot open media or receive data. */
export class UnavailableAvatarProvider implements AvatarProviderPort {
  readonly name = "unconfigured";
  readonly verified = false;
  async createSession(): Promise<never> { throw Error("BLOCKED_EXTERNAL_PROVIDER"); }
  async interrupt(): Promise<never> { throw Error("BLOCKED_EXTERNAL_PROVIDER"); }
  async close(): Promise<never> { throw Error("BLOCKED_EXTERNAL_PROVIDER"); }
}
export interface SharedFastVoiceInput {
  threadId: string;
  turnId: string;
  text: string;
  contextSnapshotId: string;
  roleId: string;
}
export interface SharedFastVoicePort {
  stream(identity: CognitiveIdentity, input: SharedFastVoiceInput,
    signal: AbortSignal, onText: (text: string) => Promise<void>): Promise<{ receiptId: string; text: string }>;
}
