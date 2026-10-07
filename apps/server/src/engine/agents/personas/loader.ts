// PERSONAS_LOADER_V1 - carga AgentPersona desde disco.
//
// Cada persona vive en clientes/<tenant>/personas/<personaId>/persona.json.
// Este modulo:
//   - Lee el archivo.
//   - Parsea JSON.
//   - Valida con agentPersonaSchema.
//   - Devuelve AgentPersona o null (con log si falla).
//
// No conoce el registry ni el bootstrap. Solo lee y valida.

import { readFile, readdir, stat } from "node:fs/promises";
import { join } from "node:path";
import {
  agentPersonaSchema,
  agentStatsSchema,
  type AgentPersona,
  type AgentStats,
} from "../../../../../../packages/domain/src/agent-persona.ts";

const PERSONA_FILE = "persona.json";
const STATS_FILE = "stats.json";

/**
 * PERSONA_LOAD_FILE_V1 - lee y valida un persona.json.
 * Devuelve null si el archivo no existe, no es JSON valido, o no pasa el schema.
 */
export async function loadPersonaFile(filePath: string): Promise<AgentPersona | null> {
  try {
    const raw = await readFile(filePath, "utf8");
    const parsed = JSON.parse(raw);
    const result = agentPersonaSchema.safeParse(parsed);
    if (!result.success) {
      console.warn(
        `[personas/loader] ${filePath} no valida: ${result.error.issues[0]?.message ?? "unknown"}`,
      );
      return null;
    }
    return result.data;
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return null;
    }
    console.warn(
      `[personas/loader] ${filePath} fallo: ${error instanceof Error ? error.message : "unknown"}`,
    );
    return null;
  }
}

/**
 * PERSONA_LOAD_STATS_V1 - lee y valida un stats.json.
 * Si no existe o no valida, devuelve null (el caller decidira defaults).
 */
export async function loadStatsFile(filePath: string): Promise<AgentStats | null> {
  try {
    const raw = await readFile(filePath, "utf8");
    const parsed = JSON.parse(raw);
    const result = agentStatsSchema.safeParse(parsed);
    if (!result.success) {
      console.warn(
        `[personas/loader] ${filePath} no valida: ${result.error.issues[0]?.message ?? "unknown"}`,
      );
      return null;
    }
    return result.data;
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return null;
    }
    console.warn(
      `[personas/loader] ${filePath} fallo: ${error instanceof Error ? error.message : "unknown"}`,
    );
    return null;
  }
}

/**
 * PERSONA_LOAD_DIR_V1 - lista los directorios de personas en un tenant.
 * Devuelve paths absolutos a los subdirectorios que contienen persona.json.
 */
export async function listPersonaDirs(tenantDir: string): Promise<string[]> {
  const dirs: string[] = [];
  let entries: string[];
  try {
    entries = await readdir(tenantDir);
  } catch {
    return [];
  }
  for (const entry of entries) {
    const full = join(tenantDir, entry);
    try {
      const info = await stat(full);
      if (!info.isDirectory()) continue;
      const personaFile = join(full, PERSONA_FILE);
      const personaInfo = await stat(personaFile).catch(() => null);
      if (personaInfo?.isFile()) dirs.push(full);
    } catch {
      continue;
    }
  }
  return dirs;
}

/**
 * PERSONA_LOAD_TENANT_V1 - carga todas las personas de un tenant.
 */
export interface LoadedTenant {
  personas: AgentPersona[];
  stats: Record<string, AgentStats>;
  errors: string[];
}

export async function loadTenantPersonas(tenantDir: string): Promise<LoadedTenant> {
  const dirs = await listPersonaDirs(tenantDir);
  const personas: AgentPersona[] = [];
  const stats: Record<string, AgentStats> = {};
  const errors: string[] = [];
  for (const dir of dirs) {
    const personaFile = join(dir, PERSONA_FILE);
    const persona = await loadPersonaFile(personaFile);
    if (!persona) {
      errors.push(personaFile);
      continue;
    }
    personas.push(persona);
    const statsFile = join(dir, STATS_FILE);
    const loaded = await loadStatsFile(statsFile);
    if (loaded) {
      stats[persona.id] = loaded;
    } else {
      stats[persona.id] = agentStatsSchema.parse({
        archetype: "assistant",
        level: 1,
        status: "idle",
      });
    }
  }
  return { personas, stats, errors };
}