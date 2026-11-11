// VOICE_AGENTS_V1 - perfil de voz y cara para TODOS los agentes, no solo los dos
// principales. Un agente con perfil tiene voz (ElevenLabs), cara (Anam) y un
// presupuesto de latencia propio; sin perfil no se inventa nada: se marca como
// no configurado y la UI no ofrece llamada.
//
// La seleccion de voz/cara sale del entorno por agente, con un fallback global:
//   ELEVENLABS_VOICE_ID            voz por defecto
//   ELEVENLABS_VOICE_<AGENTE>      voz de ese agente (id en MAYUSCULAS_CON_GUIONES)
//   ANAM_PERSONA_ID                cara por defecto
//   ANAM_PERSONA_<AGENTE>          cara de ese agente
// Asi anadir un agente no obliga a tocar codigo ni a duplicar ids en el repo.

import { createHash } from "node:crypto";

/** Presupuesto de un turno de voz. El de texto no sirve: en voz, 8 s de
 *  primer byte es una llamada muerta. */
export interface VoiceLatencyBudget {
  firstByteMs: number;
  totalMs: number;
  /** Presupuesto del trabajo previo al modelo (snapshot: una lectura). */
  contextMs: number;
}

export interface VoiceProfile {
  agentId: string;
  displayName: string;
  role: string;
  language: string;
  voice: {
    provider: "elevenlabs";
    configured: boolean;
    voiceId: string;
    model: string;
    stability: number;
    similarity: number;
    /** > 1 acelera el habla; el TTS debe ir por encima de tiempo real. */
    speed: number;
  };
  avatar: {
    provider: "anam";
    configured: boolean;
    personaId: string;
    /** Semilla estable para elegir retrato cuando no hay persona de Anam. */
    seed: string;
    style: string;
  };
  latency: VoiceLatencyBudget;
  tools: { profile: "voice-minimal"; allowed: string[] };
}

export interface AgentDescriptor {
  id: string;
  displayName: string;
  role: string;
  language?: string;
  archetype?: string;
}

function envKey(agentId: string): string {
  return agentId.trim().toUpperCase().replace(/[^A-Z0-9]+/g, "_");
}

function read(key: string): string {
  return process.env[key]?.trim() ?? "";
}

function num(key: string, fallback: number): number {
  const raw = Number(process.env[key]);
  return Number.isFinite(raw) ? raw : fallback;
}

/**
 * Semilla determinista: el mismo agente tiene siempre la misma cara aunque se
 * reinicie el servidor o cambie el orden de carga del registro.
 */
export function avatarSeed(agentId: string): string {
  return createHash("sha256").update(`anam:${agentId}`).digest("hex").slice(0, 16);
}

const STYLES: Record<string, string> = {
  orchestrator: "executive",
  hunter: "energetic",
  guardian: "calm",
  strategist: "analytical",
  architect: "technical",
  assistant: "warm",
};

export function voiceProfileFor(agent: AgentDescriptor): VoiceProfile {
  const key = envKey(agent.id);
  const globalVoice = read("ELEVENLABS_VOICE_ID");
  const globalPersona = read("ANAM_PERSONA_ID");
  const voiceId = read(`ELEVENLABS_VOICE_${key}`) || globalVoice;
  const personaId = read(`ANAM_PERSONA_${key}`) || globalPersona;
  return {
    agentId: agent.id,
    displayName: agent.displayName,
    role: agent.role,
    language: agent.language ?? "es",
    voice: {
      provider: "elevenlabs",
      configured: Boolean(voiceId),
      voiceId,
      // flash es el modelo de menor latencia de ElevenLabs; turbo queda como
      // alternativa si el idioma lo necesita.
      model: read("ELEVENLABS_MODEL") || "eleven_flash_v2_5",
      stability: num("ELEVENLABS_STABILITY", 0.4),
      similarity: num("ELEVENLABS_SIMILARITY", 0.75),
      speed: num("ELEVENLABS_SPEED", 1.06),
    },
    avatar: {
      provider: "anam",
      configured: Boolean(personaId),
      personaId,
      seed: avatarSeed(agent.id),
      style: STYLES[agent.archetype ?? ""] ?? "warm",
    },
    latency: {
      firstByteMs: num("VOICE_FIRST_BYTE_MS", 900),
      totalMs: num("VOICE_TOTAL_MS", 20_000),
      contextMs: num("VOICE_CONTEXT_MS", 120),
    },
    tools: { profile: "voice-minimal", allowed: ["agent_status", "delegate_task"] },
  };
}

/**
 * Los agentes de cliente que existen aunque el tenant no haya cargado personas
 * en disco. Es el minimo para que cualquier empresa tenga plantilla con cara y
 * voz desde el primer arranque.
 */
export const DEFAULT_CLIENT_AGENTS: AgentDescriptor[] = [
  { id: "laia", displayName: "Laia", role: "Asistente personal", archetype: "assistant" },
  { id: "direccion", displayName: "Nora", role: "Direccion", archetype: "orchestrator" },
  { id: "comercial", displayName: "Marc", role: "Comercial", archetype: "hunter" },
  { id: "atencion", displayName: "Lucia", role: "Atencion al cliente", archetype: "guardian" },
  { id: "administrativo", displayName: "Elena", role: "Administracion", archetype: "guardian" },
  { id: "finanzas", displayName: "Pablo", role: "Finanzas", archetype: "strategist" },
  { id: "marketing", displayName: "Iria", role: "Marketing", archetype: "hunter" },
  { id: "contenido", displayName: "Dani", role: "Contenido", archetype: "architect" },
  { id: "operaciones", displayName: "Sergio", role: "Operaciones", archetype: "architect" },
  { id: "compras", displayName: "Marta", role: "Compras", archetype: "guardian" },
  { id: "rrhh", displayName: "Ana", role: "Personas", archetype: "assistant" },
  { id: "legal", displayName: "Clara", role: "Legal", archetype: "strategist" },
  { id: "compliance", displayName: "Jorge", role: "Cumplimiento", archetype: "guardian" },
  { id: "investigacion", displayName: "Helena", role: "Investigacion", archetype: "strategist" },
  { id: "calidad", displayName: "Tomas", role: "Calidad", archetype: "guardian" },
  { id: "it", displayName: "Aitor", role: "Sistemas", archetype: "architect" },
  { id: "producto", displayName: "Nerea", role: "Producto", archetype: "architect" },
];

type PersonaLike = {
  id: string;
  displayName: string;
  role: string;
  language?: string;
  avatar?: { style?: string };
};

export interface PersonaSource {
  list(tenantId: string): Array<{ persona: PersonaLike; activation?: { enabled?: boolean } }>;
}

/**
 * Une las personas cargadas del tenant con la plantilla por defecto. Las
 * personas del tenant mandan (nombre y rol reales); la plantilla rellena los
 * huecos para que el panel de llamadas nunca salga vacio.
 */
export function listVoiceAgents(
  personas: PersonaSource | undefined,
  tenantId: string,
): VoiceProfile[] {
  const byId = new Map<string, AgentDescriptor>();
  for (const agent of DEFAULT_CLIENT_AGENTS) byId.set(agent.id, agent);
  let loaded = 0;
  try {
    for (const entry of personas?.list(tenantId) ?? []) {
      const persona = entry.persona;
      if (!persona?.id) continue;
      if (entry.activation?.enabled === false) continue;
      byId.set(persona.id, {
        id: persona.id,
        displayName: persona.displayName,
        role: persona.role,
        ...(persona.language ? { language: persona.language } : {}),
        ...(persona.avatar?.style ? { archetype: persona.avatar.style } : {}),
      });
      loaded += 1;
    }
  } catch {
    // Un registro roto no puede dejar sin agentes al panel de llamadas.
  }
  const profiles = [...byId.values()].map((agent) => voiceProfileFor(agent));
  // Se ordena por nombre para que la rejilla de la videoconferencia sea estable.
  return profiles.sort((a, b) => a.displayName.localeCompare(b.displayName)).map((profile) => ({
    ...profile,
    // `loaded` solo documenta de donde salieron; no cambia el perfil.
    ...(loaded > 0 ? {} : {}),
  }));
}

export function voiceProfileOf(
  personas: PersonaSource | undefined,
  tenantId: string,
  agentId: string,
): VoiceProfile | undefined {
  return listVoiceAgents(personas, tenantId).find((profile) => profile.agentId === agentId);
}
