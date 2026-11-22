import type { CognitiveIdentity } from "../../../../../packages/domain/src/cognition-v2.ts";
import type { VoiceSessionV2 } from "./contracts.ts";
import type { VoiceTurnCoordinator } from "./coordinator.ts";
import type { MediaTransportPort } from "./media-transport.ts";

/**
 * C05 adapter for an explicitly injected, verified-in-C06 media transport.
 * The durable coordinator remains authoritative for consent, tenant, role,
 * expiry, and epoch. This class never creates a voice session or calls an LLM.
 *
 * Deliberately NOT installed on HTTP routes yet: mock transport cannot provide
 * real audio/video and production must not report media ready.
 */
export class VoiceMediaLifecycle {
  constructor(
    private readonly coordinator: Pick<VoiceTurnCoordinator, "inspect" | "interrupt" | "close">,
    private readonly transport: MediaTransportPort,
  ) {}

  async open(identity: CognitiveIdentity, sessionId: string, signal: AbortSignal): Promise<VoiceSessionV2> {
    signal.throwIfAborted();
    const session = await this.coordinator.inspect(identity, sessionId);
    if (!session) throw Error("VOICE_SESSION_NOT_FOUND");
    signal.throwIfAborted();
    await this.transport.open(session, signal);
    // An authorization/consent change while opening must not leave media active.
    try {
      signal.throwIfAborted();
      const current = await this.coordinator.inspect(identity, sessionId);
      if (!current || current.epoch !== session.epoch || current.revision !== session.revision) {
        throw Error("VOICE_STALE_EPOCH");
      }
      return current;
    } catch (error) {
      // Cleanup must run even if the request signal was aborted.
      await this.transport.close(sessionId, new AbortController().signal).catch(() => {});
      throw error;
    }
  }

  async interrupt(identity: CognitiveIdentity, sessionId: string, signal: AbortSignal): Promise<VoiceSessionV2> {
    signal.throwIfAborted();
    // Commit epoch fencing before notifying the transport. A transport failure
    // cannot re-authorize a stale media stream.
    const session = await this.coordinator.interrupt(identity, sessionId);
    await this.transport.interrupt(sessionId, session.epoch, new AbortController().signal);
    return session;
  }

  async close(identity: CognitiveIdentity, sessionId: string, signal: AbortSignal): Promise<VoiceSessionV2> {
    signal.throwIfAborted();
    // Durable closure is authoritative and precedes best-effort media teardown.
    const session = await this.coordinator.close(identity, sessionId);
    await this.transport.close(sessionId, new AbortController().signal);
    return session;
  }
}
