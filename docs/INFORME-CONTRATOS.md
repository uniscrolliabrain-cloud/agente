# Informe · los 150 contratos huérfanos

> Fecha: 2026-10-28 · Rama: `campaign/verdad` · Autor: Buffy
> Encargo: **no borrar nada**. Este documento es para que lo revises y decidas.
> Medido con `pnpm audit:contracts` sobre `7ff1a77` + V1.

## 1. Qué dice el audit, exactamente

`scripts/audits/contracts.ts` recorre `packages/domain/src/*.ts`, extrae los
contratos exportados (`export type`, `export interface`, `export const xSchema =
z.`, `export const X = z.enum(`) y da un contrato por **implementado** si su
nombre —o el del tipo que lo infiere (`export type Y = z.infer<typeof xSchema>`)—
aparece en una línea que no sea comentario de **otro** fichero de `apps/server/src`,
`apps/web/src` o `packages`.

Medición de hoy:

| | |
|---|---|
| Contratos totales | **318** |
| Con implementación (según el audit) | **154** |
| Marcados `PENDING`/`STUB` | **14** |
| **Huérfanos** | **150** |

El propio audit deja dicho que su heurística es débil: *"su heuristica es «el
nombre aparece en algún fichero»"* (`docs/operacion/GATE.md`). Este informe mide
cuánto de esos 150 es eso y cuánto es deuda real.

## 2. Triaje de los 150 (medido)

Método: para cada uno de los 150 nombres del informe del audit, contar en qué
ficheros de código aparece fuera de comentarios, distinguiendo su propio módulo
del resto, y comprobar si su fichero se re-exporta desde
`packages/domain/src/index.ts` (el barrel del dominio).

| Cubo | Cuántos | Qué significa |
|---|---|---|
| **Usado dentro de su propio módulo** | **74** | El nombre es un bloque de otra estructura exportada del mismo fichero (p. ej. `actorKindSchema` dentro de `agentActorSchema`). El audit **excluye el fichero declarante** para no contar la definición como uso, y con eso tampoco ve estos usos. **Falso positivo del criterio.** |
| **Sin uso en código** | **75** | El nombre no aparece en ninguna otra línea de código del repo, ni en su propio módulo. Es superficie pública declarada y no consumida. |
| Usado en código que el audit no miró | 1 | Aparece en `tests/` o `scripts/`, que el audit no recorre. También falso positivo. |

Y un dato que ordena la decisión: **122 de los 150 se re-exportan desde el barrel
del dominio** (64 de los "sin uso", 57 de los "usados en módulo"). Es decir, la
mayoría son API pública intencionada: quien consume el dominio importa `Actor`,
no `ActorKind`.

### Los 75 "sin uso en código": dónde están

| Fichero | Huérfanos |
|---|---|
| `packages/domain/src/agent-persona.ts` | 5 |
| `packages/domain/src/business-schema.ts` | 5 |
| `packages/domain/src/policy-context.ts` | 5 |
| `packages/domain/src/messaging.ts` | 4 |
| `packages/domain/src/learning.ts` | 4 |
| `packages/domain/src/goal.ts` | 4 |
| `packages/domain/src/actor.ts` | 3 |
| `packages/domain/src/runtime.ts` | 3 |
| (29 ficheros más) | 42 |

Ejemplos: `ActorKind`, `ActorProfile`, `ActorRole`, `AgentCapabilities`,
`AgentFormality`, `AgentGender`, `AgentMessageIntent`, `AgentRoleInput`.

Caso concreto y verificable: en `packages/domain/src/actor.ts:55-57` hay tres
alias (`ActorKind`, `ActorRole`, `ActorProfile`) que se declaran y **no se usan en
ninguna línea del repo**. Sus schemas sí se usan (`actorKindSchema` dentro de
`agentActorSchema`). Es decir: el schema es el contrato real y el alias es una
comodidad que nadie consume.

## 3. Por qué esto importa más de lo que parece

El criterio actual mezcla dos preguntas distintas:

1. *¿el contrato se usa?* — lo que el producto necesita saber.
2. *¿el nombre aparece escrito literalmente en otro fichero?* — lo que el audit mide.

Con el criterio actual, los 74 del primer cubo no se pueden poner verdes sin
**escribir el nombre a mano** en otro fichero o **borrar el contrato**. Y los 75
restantes no se arreglan sin decidir producto: o se consumen, o se marcan
`PENDING(motivo, fecha)`, o se retiran.

## 4. Decisión que necesito de ti (no he borrado nada)

| Opción | Efecto | Coste |
|---|---|---|
| **A. Arreglar primero el criterio** | El audit cuenta también los usos dentro del propio módulo y en `tests/`/`scripts/`. Los ~75 falsos positivos desaparecen solos y quedan ~75 reales. | Cambio en `contracts.ts` + su test. Los 75 reales siguen en rojo hasta decidirlos. |
| **B. Marcar los 75 como `PENDING(motivo, fecha)`** | `audit:contracts` pasa a verde. Cada marca dice "declarado, sin consumidor todavía" con su fecha. | 75 marcas de comentario; no oculta nada, pero tampoco arregla el criterio. |
| **C. Retirar los 75** | Menos superficie muerta. | Diff grande en `packages/domain` (zona compartida con Codex y con el panel) y rompe a cualquier consumidor externo del paquete. **No lo recomiendo sin A.** |

Mi recomendación: **A, y después B sobre lo que quede**, dejando C para cuando
haya un consumidor real que diga qué sobra. A y B se pueden hacer en la misma
tanda: A sin B deja el gate en rojo y B sin A marca como pendientes cosas que ya
se usan, que es peor (mentira documentada).

## 5. Estado y reproducibilidad

- `audit:contracts` **sigue en rojo**: `exit 1`, 150 huérfanos. No se ha tocado
  ningún contrato ni ninguna marca.
- Los números salen de `pnpm audit:contracts` (informe en
  `artifacts/gate/audits/AUDIT_CONTRACTS.md`) y de un recuento por nombre sobre
  `apps/**`, `packages/**`, `tests/**` y `scripts/**` excluyendo comentarios; la
  sonda vive en `artifacts/` y no se versiona (está en `.gitignore`).
- Diferencia conocida: la sonda cuenta 157 nombres si no aplica el alias
  `z.infer`; aplicándolo como el audit, coincide en los 150.
