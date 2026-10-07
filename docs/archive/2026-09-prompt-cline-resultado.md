# Resultado de los bloques de TODO-CLINE

> Fecha: 28 sep 2026. Ejecutado por Cline sobre `origin/main` (`2058269`).
> Reglas aplicadas: una rama por bloque, un commit por punto, typecheck al final de cada
> bloque, sin dependencias nuevas, sin push, sin tocar SOPs / computer / browser worker.
>
> Nota: el briefing `docs/PROMPT-CLINE.md` (bloques C1-C10) **no existe en ninguna rama**.
> La cola ejecutada es `docs/TODO-CLINE.md`, que esta en `feat/client-onboarding`
> (commit `25d64b9`) y define 3 ramas con 13 puntos.

## Resumen

| Rama | Base | Commits | Estado |
| --- | --- | --- | --- |
| `chore/tech-debt` | `origin/main` | 3 | Completa (2 puntos ya estaban hechos) |
| `feat/pgvector` | `origin/main` | 2 | Completa con una desviacion documentada |
| `feat/agent-ui` | `feat/client-onboarding` | 4 | Parcial: falta el registro en el nav |
| `docs/resultado-cline` | `origin/main` | 1 | Este documento |

## chore/tech-debt

| Punto | Commit | Nota |
| --- | --- | --- |
| 1. `.gitattributes` con LF | `fb175ab` | Hecho. En Windows el checkout dejaba CRLF y biome marcaba ficheros enteros como fallo de format |
| 2. `business-intel/SKILL.md` | ya en main | Verificado: ya dice `query_business`. Sin commit |
| 3. `POST /api/skills/:id/install` -> 501 | ya en main | Verificado. Sin commit |
| 4. `clientes/_example/config.json` | `64ddfe4` | Placeholder explicito + aviso en el README |
| 5. `scripts/provision-client.ts` | - | Omitido: el punto dice "no tocar" |
| 6. 4 stubs a `stubs/` + README | `8ee6dda` | Hecho, con el import de `AppError` corregido un nivel |

## feat/pgvector

| Punto | Commit | Nota |
| --- | --- | --- |
| 1. Detectar PGlite vs Postgres | `939ca6a` | `Store.backend` mas `select()` de solo lectura |
| 2. `CREATE EXTENSION` + columna `vector(768)` + IVFFlat | `8e5fe3d` (parcial) | **Desviacion**: no existe columna `embedding` |
| 3. `ORDER BY embedding <=> $1 LIMIT` | `8e5fe3d` | Hecho, con fallback automatico |
| 4. Fallback PGlite | `8e5fe3d` | Hecho + test |

**Por que el punto 2 no es lo que decia el plan**: los embeddings viven dentro de
`records.data` (jsonb), no en una columna propia: `records` es la tabla clave/valor que
sostiene el motor durable (leases, CAS, `claim`). Migrarla a un esquema con columna
`vector(768)` es toca el motor durable, que el propio TODO marca como intocable. Lo que se
hace en su lugar:

- el indice va **por expresion**, documentado en `rag.ts` y sin tocar el esquema:
  `CREATE INDEX ... ON records USING ivfflat ((data->'embedding')::vector) WITH (lists = 100)`,
- sin extension instalada `canUseVector()` devuelve false y nunca se ejecuta esa SQL,
- si la consulta falla se registra y se vuelve al recorrido en JS,
- con una dimension distinta de 768 se cae al fallback en vez de al cast.

**Sin verificar**: el camino con Postgres real. En este entorno no hay Postgres, asi que la
ruta SQL necesita una prueba manual antes de confiar en ella (subir 2 documentos, buscar,
comprobar que el planner usa el indice con `EXPLAIN`).

## feat/agent-ui

| Punto | Commit | Nota |
| --- | --- | --- |
| 1. UI de agentes | `d42a42a` (parcial) | `api/agents.ts`, `useAgents`, `AgentsView`. **Bloqueado**: el nav item |
| 2. Selector de rol en chat | `e9a16f9` (parcial) | El cliente ya manda `state.roleId`. **Bloqueado**: el dropdown |
| 3. Filtro por rol en tareas | `5c61f2e` | Hecho. El selector del modal de creacion no aplica: no existe |
| Extra | `566eaa0` | `admin:create` estaba duplicada en package.json tras el merge de P0 |

La base es `feat/client-onboarding` porque ahi vive `/api/agent/roles`. No se ha mergeado
nada: ya contiene el merge del audit (`2058269` es ancestro comun, cero commits perdidos).
Tambien ahi ya estaba cableado el backend del rol en `ConversationAgent` (commit
`8d578b7`): lee `state.roleId` y antepone `objetivo` al prompt. Lo que faltaba era la parte
web, que es lo que se ha cerrado aqui.

## Bloqueos

1. **Nav item "Agentes"**: `ConversationsPanel.tsx` y `App.tsx` estan en la lista de ficheros
   compartidos. Sin el item y el render, `AgentsView` no es alcanzable desde la UI: es
   codigo listo pero muerto hasta que se autorice tocar esos dos ficheros (o se registre la
   vista desde `Onboarding`/`CommandPalette`, que tampoco autorizaba el briefing).
2. **Dropdown de rol en el chat**: el estado vive en `ChatPanel.tsx`, que tambien es
   compartido. El cableado de datos esta hecho; el selector visual no.
3. **Filtro por rol en el modal de creacion de tareas**: no existe tal modal en el repo. Las
   tareas se crean desde el chat y por API.
4. **Prueba manual de pgvector**: hace falta un Postgres real con la extension.

## Verificacion

| Comprobacion | chore/tech-debt | feat/pgvector | feat/agent-ui |
| --- | --- | --- | --- |
| `pnpm typecheck` | OK | OK | OK |
| `pnpm --prefix apps/web run typecheck` | - | - | OK |
| `pnpm --prefix apps/web run build` | - | - | OK (237.03 kB) |
| tests tocados | - | `tests/rag.test.ts` 5/5 | - |

Ninguna rama se ha pusheado. Todas son locales y salen de `origin/main` (salvo `feat/agent-ui`,
que sale de `feat/client-onboarding`).
