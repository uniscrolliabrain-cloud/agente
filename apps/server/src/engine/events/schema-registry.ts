import type { z } from "zod";
import type { SystemEventType } from "./types.ts";

/**
 * Registro consultable de schemas por tipo de evento.
 *
 * Por que un registry y no un Map privado:
 *   - El endpoint GET /api/events/schemas (Fase 2) necesita listarlo.
 *   - Jev AI / kernel Pydantic (futuro) necesita leer el catalogo,
 *     no adivinar el formato de los eventos escritos.
 *   - Si un tipo evoluciona a 1.1, se registran ambos y los eventos
 *     viejos siguen validando contra 1.0.
 */

export interface EventSchema<T = unknown> {
  type: SystemEventType;
  version: string;
  schema: z.ZodType<T>;
}

export class SchemaRegistry {
  private readonly entries = new Map<string, EventSchema>();

  register<T>(entry: EventSchema<T>): void {
    const key = `${entry.type}@${entry.version}`;
    if (this.entries.has(key)) {
      throw new Error(`Event schema already registered: ${key}`);
    }
    this.entries.set(key, entry as EventSchema);
  }

  get(type: SystemEventType, version: string): EventSchema {
    const key = `${type}@${version}`;
    const entry = this.entries.get(key);
    if (!entry) throw new Error(`Unknown event schema: ${key}`);
    return entry;
  }

  list(): EventSchema[] {
    return [...this.entries.values()];
  }
}