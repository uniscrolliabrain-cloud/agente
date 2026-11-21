import type { VoiceSessionV2 } from "./contracts.ts";

/**
 * C05 local media lifecycle port. This is not a provider integration.
 * C06 may implement this interface only after provider verification.
 */
export interface MediaTransportPort {
  open(session: VoiceSessionV2, signal: AbortSignal): Promise<void>;
  interrupt(sessionId: string, epoch: number, signal: AbortSignal): Promise<void>;
  close(sessionId: string, signal: AbortSignal): Promise<void>;
}

type State = { epoch: number; closed: boolean };
/**
 * Deterministic, network-free transport for C05 integration tests.
 * Tracks epoch fencing and idempotent shutdown without claiming media playback.
 */
export class MockMediaTransport implements MediaTransportPort {
  private readonly states = new Map<string, State>();

  async open(session: VoiceSessionV2, signal: AbortSignal): Promise<void> {
    signal.throwIfAborted();
    if (session.state === "closed" || session.state === "failed") throw Error("VOICE_SESSION_CLOSED");
    const existing = this.states.get(session.sessionId);
    if (existing?.closed) throw Error("VOICE_SESSION_CLOSED");
    if (existing && existing.epoch > session.epoch) throw Error("VOICE_STALE_EPOCH");
    this.states.set(session.sessionId, { epoch: session.epoch, closed: false });
  }

  async interrupt(sessionId: string, epoch: number, signal: AbortSignal): Promise<void> {
    signal.throwIfAborted();
    const state = this.states.get(sessionId);
    if (!state || state.closed) throw Error("VOICE_SESSION_CLOSED");
    if (!Number.isSafeInteger(epoch) || epoch < state.epoch) throw Error("VOICE_STALE_EPOCH");
    state.epoch = epoch;
  }

  async close(sessionId: string, signal: AbortSignal): Promise<void> {
    signal.throwIfAborted();
    const state = this.states.get(sessionId);
    if (state) state.closed = true;
  }

  /** No network or media bytes; status is only useful for tests. */
  inspect(sessionId: string): Readonly<State> | undefined {
    const state = this.states.get(sessionId);
    return state ? { ...state } : undefined;
  }
}
