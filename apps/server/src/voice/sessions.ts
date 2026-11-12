// VOICE_SESSIONS_V1 - ciclo de vida de una llamada con cara y voz.
//
// Anam cobra por minuto de sesion abierta, no por palabra. Por eso la sesion
// tiene presupuesto explicito: silencio, duracion maxima y un reaper para las
// que quedan huerfanas si el navegador se cierra. Todo se guarda bajo el owner
// y con su tenantId, de modo que una empresa nunca ve la sesion de otra.

import { randomUUID } from "node:crypto";

export const VOICE_SESSIONS_KIND = "voice-sessions";

export type VoiceSessionState = "requested" | "connecting" | "live" | "idle" | "closing" | "closed";

export interface VoiceSession {
  id: string;
  owner: string;
  tenantId: string;
  agentId: string;
  state: VoiceSessionState;
  threadId?: string;
  roleId?: string;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  endedAt?: string;
  turns: number;
  seconds: number;
  /** Coste estimado en euros; se rellena al cerrar. */
  costEur: number;
  interruptedAt?: string;
  closedReason?: "user" | "silence" | "timeout" | "error" | "reaped";
  /** Motivo por el que la sesion no puede ir en vivo (sin claves, por ejemplo). */
  blockedReason?: string;
}

export interface SessionStore {
  get<T = Record<string, unknown>>(owner: string, kind: string, id: string): Promise<T | null>;
  put<T extends { id: string }>(owner: string, kind: string, value: T): Promise<T>;
  list<T = Record<string, unknown>>(
    owner: string,
    kind: string,
    options?: { limit?: number },
  ): Promise<T[]>;
  remove(owner: string, kind: string, id: string): Promise<void>;
}

export interface SessionLimits {
  /** Silencio que cierra la sesion (no se paga una llamada muda). */
  silenceMs: number;
  /** Tope duro por sesion; se rota con token nuevo. */
  maxMs: number;
  /** Precio por minuto para el registro de coste. */
  eurPerMinute: number;
}

export function sessionLimits(): SessionLimits {
  const num = (key: string, fallback: number) => {
    const raw = Number(process.env[key]);
    return Number.isFinite(raw) && raw > 0 ? raw : fallback;
  };
  return {
    silenceMs: num("VOICE_SILENCE_MS", 45_000),
    maxMs: num("VOICE_MAX_SESSION_MS", 15 * 60_000),
    eurPerMinute: num("VOICE_EUR_PER_MINUTE", 0.12),
  };
}

function nowIso(): string {
  return new Date().toISOString();
}

export interface CreateSessionInput {
  owner: string;
  tenantId: string;
  agentId: string;
  threadId?: string;
  roleId?: string;
}

export class VoiceSessionService {
  constructor(private readonly db: SessionStore) {}

  async create(input: CreateSessionInput): Promise<VoiceSession> {
    const at = nowIso();
    const session: VoiceSession = {
      id: randomUUID(),
      owner: input.owner,
      tenantId: input.tenantId,
      agentId: input.agentId,
      state: "requested",
      ...(input.threadId ? { threadId: input.threadId } : {}),
      ...(input.roleId ? { roleId: input.roleId } : {}),
      createdAt: at,
      updatedAt: at,
      turns: 0,
      seconds: 0,
      costEur: 0,
    };
    await this.db.put(input.owner, VOICE_SESSIONS_KIND, session);
    return session;
  }

  /**
   * VOICE_SAME_THREAD_V1 - la llamada se ata a un hilo. Si el usuario ya tenia
   * uno abierto, la voz continua esa conversacion; si no, la llamada tiene el
   * suyo y el harness ve los turnos anteriores igual que el chat escrito.
   */
  async attachThread(session: VoiceSession, threadId: string): Promise<VoiceSession> {
    const next: VoiceSession = { ...session, threadId, updatedAt: nowIso() };
    await this.db.put(session.owner, VOICE_SESSIONS_KIND, next);
    return next;
  }

  /** Lectura O(1): el turno de voz no puede permitirse un list(). */
  async get(owner: string, tenantId: string, id: string): Promise<VoiceSession | null> {
    const found = await this.db.get<VoiceSession>(owner, VOICE_SESSIONS_KIND, id);
    if (!found) return null;
    // Aislamiento: la sesion pertenece al owner y a su empresa, o no existe.
    if (found.tenantId !== tenantId) return null;
    return found;
  }

  async touch(session: VoiceSession): Promise<VoiceSession> {
    const at = nowIso();
    const startedAt = session.startedAt ?? at;
    const elapsed = Date.parse(at) - Date.parse(startedAt);
    const next: VoiceSession = {
      ...session,
      state: "live",
      startedAt,
      updatedAt: at,
      turns: session.turns + 1,
      seconds: Math.max(0, Math.round(elapsed / 1000)),
    };
    await this.db.put(session.owner, VOICE_SESSIONS_KIND, next);
    return next;
  }

  async interrupt(session: VoiceSession): Promise<VoiceSession> {
    const next: VoiceSession = { ...session, interruptedAt: nowIso(), updatedAt: nowIso() };
    await this.db.put(session.owner, VOICE_SESSIONS_KIND, next);
    return next;
  }

  async close(
    session: VoiceSession,
    reason: NonNullable<VoiceSession["closedReason"]>,
  ): Promise<VoiceSession> {
    const limits = sessionLimits();
    const at = nowIso();
    const startedAt = session.startedAt ?? session.createdAt;
    const seconds = Math.max(0, Math.round((Date.parse(at) - Date.parse(startedAt)) / 1000));
    const next: VoiceSession = {
      ...session,
      state: "closed",
      endedAt: at,
      updatedAt: at,
      seconds,
      costEur: Number(((seconds / 60) * limits.eurPerMinute).toFixed(4)),
      closedReason: reason,
    };
    await this.db.put(session.owner, VOICE_SESSIONS_KIND, next);
    return next;
  }

  /** Sesiones abiertas del owner, para el panel y para el reaper. */
  async open(owner: string): Promise<VoiceSession[]> {
    const rows = await this.db.list<VoiceSession>(owner, VOICE_SESSIONS_KIND, { limit: 50 });
    return rows.filter((row) => row.state !== "closed");
  }

  /**
   * Cierra sesiones mudas o pasadas de tope. Se llama desde el tick del
   * servidor y nunca en el camino de un turno.
   */
  async reap(owner: string, now = Date.now()): Promise<VoiceSession[]> {
    const limits = sessionLimits();
    const reaped: VoiceSession[] = [];
    for (const session of await this.open(owner)) {
      const last = Date.parse(session.updatedAt);
      const started = Date.parse(session.startedAt ?? session.createdAt);
      const silent = now - last > limits.silenceMs;
      const tooLong = now - started > limits.maxMs;
      if (!silent && !tooLong) continue;
      reaped.push(await this.close(session, silent ? "silence" : "timeout"));
    }
    return reaped;
  }
}
