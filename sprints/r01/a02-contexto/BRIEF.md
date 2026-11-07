# A02 · Contexto y tenancy

**Carril:** C2 · **Rama:** `sprint/r01-a02-contexto` · **Superficie:** `sprints/r01/a02-contexto/`, `apps/server/src/engine/context/`, `apps/server/src/tenant-scope.ts`

## Estado medido sobre `0c8fe81` — aquí hay bugs, no hipótesis

### Bug 1 · el contexto pierde los saltos de línea

`apps/server/src/engine/context/assembly.ts:52` y `:77-109` usan los escapes **duplicados**:

```ts
const words = query.split(/\\\\s+/).filter((w) => w.length > 2);   // líneas 52
parts.push(`Memorias del rol (datos):\\\\n${mems.join("\\\\n")}`);   // línea 77
```

El regex no separa por espacios y cada "salto de línea" del prompt es la secuencia literal `\n`.
La línea 106 lo delata: alguien ya se topó con esto y lo parcheó con `String.fromCharCode(10)` en un solo sitio.

**Impacto:** todo el `ContextPackage` llega al modelo como un párrafo único con `\n` visibles. No es cosmético: el modelo deja de ver estructura (memorias / entidad / relaciones / eventos) y el scoring por substring recibe palabras que nunca casa.

### Bug 2 · el feedback no se aplica

`assembly.ts:36` hace `void options.multipliers;` y nunca usa el parámetro, mientras el bloque `FEEDBACK_SCORING_APPLIED_V1` (líneas 21-26) dice que el feedback "ahora" multiplica el score. El cableado del feedback existe (`FeedbackCollector`/`FeedbackScoring`) pero muere en el render.

### Bug 3 · mojibake

Línea 4: `â€”` en lugar de `—`. El fichero es UTF-8 válido, así que es doble codificación en origen. Menor, pero es la única mancha de encoding del fichero y no debería sobrevivir a la ronda.

### Estado de tenancy (esto sí está bien)

- `tenant-scope.ts` usa `AsyncLocalStorage`: dos peticiones concurrentes de tenants distintos no se pisan. Correcto.
- `app.ts:655` fija el scope por petición. **Solo 7 ficheros** llaman a `runInTenantScope`.
- `leads-routes.ts` y `voice-routes.ts` tienen el mismo middleware de scope copiado (~30 líneas idénticas, incluida la resolución por membership única). Duplicación que se separará en cuanto una de las dos cambie.
- `conversation.ts` (1.108 líneas) **no pasa `entityId`** al ensamblado, aunque `context/engine.ts:35` ya lo soporta (`input.entityId ? graph.getEntity(...)`). El camino del chat nunca resuelve la entidad de la que se habla.

## Preguntas

1. ¿Cuántos sitios más del repo tienen `\\\\n` o `\\\\s` duplicados? (grep, no intuición)
2. ¿El fix de escapes cambia el contenido de algún test existente? ¿Cuál y por qué?
3. ¿Qué pasa con `multipliers` si lo conectas: qué test demuestra que "not_useful" baja el score?
4. ¿Por qué `conversation.ts` no resuelve entidad? ¿Lo omite a propósito o nunca se cableó?

## Entregable del sprint

`apps/server/src/engine/context/assembly.ts` corregido **con test propio** en tu superficie que afirme dos cosas sobre la salida de `renderContext`:

- contiene `"\n"` real (`out.split("\n").length > 5`),
- **no** contiene la secuencia literal `"\\n"`.

Y `sprints/r01/a02-contexto/ENTIDAD-EN-CHAT.md` con el diagnóstico de `entityId` (dónde se pierde, qué haría falta), sin implementarlo: es R2.

## Gate

```bash
node --import tsx --test --test-timeout=30000 sprints/r01/a02-contexto/*.test.ts
node --import tsx tests/context-engine.test.ts
```

## Trampa

Arreglar los escapes y decir "listo" sin test: el bug volvería en el siguiente copy-paste. El test es el entregable, no el adorno.
