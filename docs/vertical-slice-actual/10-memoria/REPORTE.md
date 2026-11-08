# 10 · Hechos compartidos y recall acreditado — REPORTE

**Estado:** completa · **Entrada:** `f642b31` (campaña 09).

## Qué se ha implementado

### 10.P1 · Contrato de hechos y recuerdos privados

`apps/server/src/engine/memory.ts` gana dos canales separados de la memoria de siempre:

- **Hechos de perfil versionados** (`profile-facts`): `{key, value, version, origin, source, createdAt}`. La precedencia es explícita: gana la versión más alta por clave; publicar una versión vieja no degrada la vigente; la **misma versión con otro valor es `FACT_VERSION_CONFLICT`** en vez de sobrescribir a ciegas. Cada versión queda como histórico auditable con su origen (plantilla + versión del bundle, o `edicion-owner`).
- **Recuerdos privados** (`private-memories`): otra colección, bajo el scope del humano. `rememberPrivate(scopePersona, texto)` y `privateMemories(scopePersona)`; el recall solo los incorpora si recibe `privateOwner`, así que sin ese dato no hay forma de que aparezcan.

`publishProfileFact`, `currentProfileFacts` son funciones de módulo (el `MemoryService` delega), de modo que el alta puede sembrar hechos sin construir el servicio completo con RAG.

### 10.P2 · Cableado semilla → hechos → recall → contexto

- `agency-bootstrap.ts` publica el perfil como hechos versionados (`nombre`, `oferta`, `tono`, `icp`) en el scope de cada humano (`seedProfileFacts`). La empresa A y la B publican los suyos con origen distinto, así que un hecho nunca se comparte entre tenants.
- `MemoryService.recall` devuelve ahora `facts` y `privateMemories` además de `memories`/`ragHits`, y el texto los presenta en bloques separados ("Hechos de empresa", "Recuerdos privados de esta persona"). Reformular la query no cambia la política: los hechos se filtran por relevancia y los privados se limitan al scope autorizado.
- `ContextEngine.assemble` acepta `viewerId` y lo pasa como `privateOwner`: el ensamblador inyecta los privados **del humano que pregunta**, no los de la empresa.
- Relectura tras reinicio cubierta: los hechos viven en el store, no en memoria de proceso; un `MemoryService` nuevo sobre el mismo store devuelve la versión vigente con su origen.

### 10.P3 · Meta-hints antes del import

`conversation.ts`: el `void (async () => …)` que persiste los meta-hints leía `this.pendingMetaHints` **después** de dos `await import()`, y para entonces el turno ya había vaciado el array: los hints de ese turno se perdían. Ahora se capturan en `hintsToPersist` antes de lanzar el IIFE. El canal sigue separado del perfil canónico: se persisten en `meta-hints` por tenant/turno, no crean hechos ni memorias, y el test lo comprueba.

> `conversation.ts` estaba reservado por la campaña 13. Se toca aquí porque el contrato de la 10 lista el fichero y el cambio es exactamente el de 10.P3 (una captura antes del import); no se ha reestructurado nada más del turno.

## Evidencia

| Comprobación | Resultado |
| --- | --- |
| `tsc --noEmit` | 0 errores |
| Gate: `context-engine` + `kernel-meta-context` + `vertical-slice-memory` | **15/15 pass, 0 fail** |
| `git diff --check` | limpio |
| Audits | ver salida del commit |

Casos de `tests/vertical-slice-memory.test.ts`:

1. **Dos humanos de A recuperan el hecho sembrado** (mismo key/valor/versión/origen) y B no ve ese valor.
2. Precedencia: v2 gana, republicar v1 no pisa, misma versión con otro valor → `FACT_VERSION_CONFLICT`.
3. Relectura tras reinicio con un `MemoryService` nuevo.
4. **El recuerdo privado solo lo ve su dueño**: el compañero de la misma empresa no lo recupera, otra empresa tampoco, y sin `privateOwner` no hay privados.
5. El ensamblador inyecta privados solo con `viewerId` del dueño; los hechos de empresa llegan a ambos.
6. Los meta-hints se persisten por turno y **no** aparecen como hechos ni en el recall del perfil.

## Pendiente declarado

- **Prueba con dos cuentas reales de staging**: no ejecutada. El entorno no tiene `DATABASE_URL` de staging ni esas cuentas; el aislamiento se prueba con dos scopes de tenant y usuarios distintos sobre el store real (PGlite).
- **UI de hechos**: el panel no muestra todavía versiones ni origen; el contrato de esta campaña es el canal de datos y el recall, no la superficie.
- **Política de olvido de hechos**: `forget`/TTL siguen aplicando a memorias, no a `profile-facts`. Queda anotado para cuando el owner pueda editar hechos desde el panel.

## Rollback

Revertir el commit de la 10 deja `recall` sin `facts`/`privateMemories` (el formato anterior), `assemble` ignorando `viewerId` y los meta-hints leyéndose después del import (comportamiento con la pérdida conocida). Las colecciones `profile-facts` y `private-memories` quedan inertes y no afectan a `memories`.
