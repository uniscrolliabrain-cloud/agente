// VOICE_SNAPSHOT_V1 - el contexto de una llamada se calcula UNA vez, al abrir
// la sesion, y cada turno lo lee con un solo get(). Ese es el cambio que hace
// viable la voz: el turno deja de pagar recall + contexto + rol.
//
// Se guarda bajo el owner con su tenantId dentro del registro; la lectura
// comprueba ambos, asi que un snapshot no cruza empresas.

import { VOICE_SESSIONS_KIND } from "./sessions.ts";

export const VOICE_CONTEXT_KIND = "voice-context";

export interface VoiceSnapshot {
  id: string;
  owner: string;
  tenantId: string;
  agentId: string;
  text: string;
  builtAt: string;
  expiresAt: string;
  turns: number;
}

/** Tope duro del snapshot: en voz, contexto largo es latencia y ruido. */
const MAX_SNAPSHOT_CHARS = 3500;

export interface SnapshotDeps {
  db: {
    get<T = Record<string, unknown>>(owner: string, kind: string, id: string): Promise<T | null>;
    put<T extends { id: string }>(owner: string, kind: string, value: T): Promise<T>;
  };
  memory: {
    recall(
      owner: string,
      query: string,
      options?: { history?: string[]; ragLimit?: number; memoryLimit?: number },
    ): Promise<{ text: string }>;
  };
  systemContext: (owner: string) => Promise<{
    pendingApprovals: unknown[];
    recentFailures: unknown[];
    health: { google: boolean; worker: boolean };
  }>;
  tenantIdFor?: (owner: string) => Promise<string>;
}

export function snapshotId(tenantId: string, agentId: string, agentKey = "session"): string {
  // Un snapshot por empresa+agente+sentido de conversacion; el id nunca lleva
  // datos personales, solo la clave de cache.
  return `${tenantId}:${agentId}:${agentKey}`.replace(/[^a-zA-Z0-9:_-]/g, "-").slice(0, 180);
}

function ttlMs(): number {
  const raw = Number(process.env.VOICE_SNAPSHOT_TTL_MS);
  return Number.isFinite(raw) && raw > 0 ? raw : 10 * 60_000;
}

function clip(text: string, max = MAX_SNAPSHOT_CHARS): string {
  const clean = text.replace(/\s+\n/g, "\n").trim();
  return clean.length > max ? `${clean.slice(0, max)}\n…[recortado]` : clean;
}

export interface BuildSnapshotInput {
  owner: string;
  tenantId: string;
  agentId: string;
  agentName: string;
  role: string;
  query?: string;
  agentKey?: string;
}

/**
 * Construye el snapshot en una sola pasada. `memory.recall` y `systemContext`
 * van en paralelo: aunque esto ocurre al abrir la sesion (y Anam tarda 4-5 s en
 * estar lista), tampoco conviene sumar dos esperas.
 */
export async function buildVoiceSnapshot(
  deps: SnapshotDeps,
  input: BuildSnapshotInput,
): Promise<VoiceSnapshot> {
  const [recall, ops] = await Promise.all([
    deps.memory
      .recall(input.owner, input.query ?? `${input.agentName} ${input.role}`, {
        ragLimit: 3,
        memoryLimit: 8,
      })
      .catch(() => ({ text: "" })),
    deps
      .systemContext(input.owner)
      .catch(() => ({ pendingApprovals: [], recentFailures: [], health: { google: false, worker: false } })),
  ]);

  const parts = [
    `Eres ${input.agentName}, ${input.role}. Hablas en voz: frases cortas, sin markdown, sin listas.`,
    `Idioma: espanol. Nada de terminos internos (kernel, capability, workflow, SOP).`,
    ops.pendingApprovals.length > 0
      ? `Pendiente: ${ops.pendingApprovals.length} aprobacion(es) esperando revision.`
      : "",
    ops.recentFailures.length > 0
      ? `Fallos recientes: ${ops.recentFailures.length} en la ultima hora.`
      : "",
    ops.health.google ? "" : "Aviso: Google esta desconectado; no prometas acciones sobre correo o calendario.",
    recall.text,
  ].filter(Boolean);

  const at = new Date();
  const snapshot: VoiceSnapshot = {
    id: snapshotId(input.tenantId, input.agentId, input.agentKey),
    owner: input.owner,
    tenantId: input.tenantId,
    agentId: input.agentId,
    text: clip(parts.join("\n\n")),
    builtAt: at.toISOString(),
    expiresAt: new Date(at.getTime() + ttlMs()).toISOString(),
    turns: 0,
  };
  await deps.db.put(input.owner, VOICE_CONTEXT_KIND, snapshot);
  return snapshot;
}

/** Una lectura. Devuelve null si no existe, es de otra empresa o caduco. */
export async function readVoiceSnapshot(
  deps: Pick<SnapshotDeps, "db">,
  owner: string,
  tenantId: string,
  id: string,
  now = Date.now(),
): Promise<VoiceSnapshot | null> {
  const found = await deps.db.get<VoiceSnapshot>(owner, VOICE_CONTEXT_KIND, id);
  if (!found) return null;
  if (found.tenantId !== tenantId) return null;
  if (Date.parse(found.expiresAt) <= now) return null;
  return found;
}

/**
 * Refresco en segundo plano cada N turnos: el turno sigue leyendo el snapshot
 * viejo mientras el nuevo se construye. Nunca bloquea la respuesta.
 */
export function maybeRefreshSnapshot(
  deps: SnapshotDeps,
  snapshot: VoiceSnapshot,
  input: BuildSnapshotInput,
  everyTurns = 5,
): void {
  const nextTurns = snapshot.turns + 1;
  if (nextTurns % everyTurns !== 0) return;
  void buildVoiceSnapshot(deps, { ...input, agentKey: snapshot.id.split(":").at(-1) }).catch(
    () => undefined,
  );
}

export { VOICE_SESSIONS_KIND };
