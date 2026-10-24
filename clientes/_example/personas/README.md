# Personas de ejemplo

Cada carpeta dentro de `personas/` es una persona funcional del sistema.
Su estructura:

    <persona-id>/
      persona.json    # identidad, personalidad, valores, capabilities
      stats.json      # gamificacion: level, archetype, precision, uptime

## Como anadir una persona

1. Crear carpeta con id kebab-case (por ejemplo `juan`).
2. Copiar `persona.json` de una existente y ajustar.
3. Copiar `stats.json` y ajustar (o dejar los defaults si no importan).
4. Validar con `pnpm test agent-persona`.

## Esquema

Ver `packages/domain/src/agent-persona.ts` para el schema Zod completo.