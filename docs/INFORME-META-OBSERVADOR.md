# Informe · el observador meta (D12)

> Fecha: 2026-10-28 · Rama: `campaign/verdad` · Autor: Buffy
> Encargo: dejar una nota explicada para revisar después. **No he tocado código
> de este flujo.** Todo lo que sigue está medido sobre `7ff1a77` + V1.

## 0. Corrección de lo que yo mismo escribí en la campaña

En [CAMPANA-VERDAD.md](operacion/CAMPANA-VERDAD.md) puse: *"el observador meta se
calcula, se paga en tokens y se tira"*. **Las tres cosas son falsas o imprecisas**
y conviene decirlo antes de decidir nada:

- **No se paga en tokens.** `Meta` es un motor de reglas
  ([`kernel/observers/meta.ts`](../apps/server/src/kernel/observers/meta.ts)):
  compara `ProgressEvent`s con umbrales. No llama a ningún modelo.
- **No se tira del todo.** Hay una vía que sí llega al prompt (sección 2).
- **Lo que está muerto** es una segunda vía, la de hints diferidos (sección 3).

El coste real es de **lecturas a la base de datos**, no de tokens. Cuántas y a qué
precio no lo he medido; sería el siguiente dato si quieres decidir con números.

## 1. Qué es Meta, en una frase

Slow (tarea durable) emite progreso: `ready`, `failed`, `progress`. Meta decide si
el fast (chat) debe saber algo de eso y con qué urgencia, para que no ignore al
slow ni lo inunde. Cuatro reglas: `slow_ready_fast_idle`, `slow_long_no_output`,
`slow_failed_urgent`, `nothing_to_report`.

## 2. Vía A: la que funciona (hints → prompt)

1. `AgentService.systemContext()` (`engine/service.ts:1045-1083`) busca el último
   turno **abierto**, lee sus thoughts, extrae los `ProgressEvent` y evalúa Meta.
2. `ConversationAgent.run()` (`engine/conversation.ts:636-641`) añade al bloque
   urgente solo los hints `high` y `medium`:
   `Meta(regla): mensaje`.
3. Ese bloque se concatena al prompt final (`conversation.ts:690`:
   `finalPrompt + urgentBlock + delegateHint`) con el rótulo
   `[Contexto urgente del sistema]` y un presupuesto declarado de 80 tokens.

**Condición que la hace frágil:** solo ve **turnos abiertos**. Si el slow termina
cuando el turno ya se cerró, esta vía no lo cuenta. Para eso existe la vía B… que
es la que está muerta.

## 3. Vía B: la que está muerta (hints diferidos)

1. Al cerrar turno, `closeKernelTurn` evalúa Meta y guarda hasta 3 hints en
   `pendingMetaHints` (`conversation.ts:948-955`).
2. En el turno siguiente, `run()` lee `lastMetaHint` (`conversation.ts:72`), lo
   anula si es viejo y **lo descarta con `void metaHint`** (`conversation.ts:84`).
3. `metaHintsPromptBlock` (`conversation.ts:44-46`) **devuelve `""` siempre** y no
   tiene ni un lector en todo el repo (grep de `metaHintsPromptBlock`: solo su
   definición).
4. `pendingMetaContext` se rellena (`conversation.ts:921`) y solo se consume con
   `void` (`conversation.ts:83`).

Es decir: hay estado que se calcula, se guarda en campos de instancia y se tira.
Y como `ConversationAgent` se clona por turno (`clone()`), esos campos ni siquiera
sobreviven de forma fiable entre turnos.

## 4. Vía C: persistido y sin consumidor de producto

- `MetaHintsStore.persist()` guarda los hints del turno
  (`conversation.ts:913-920`, best-effort).
- Se exponen en dos rutas **de admin**: `GET /meta-hints/pending` y
  `GET /meta-hints/by-turn/:turnId` (`kernel-routes.ts:177+`), ambas con
  `requireAdmin`.
- **`apps/web/src` no referencia `meta-hints` en ningún sitio** (grep: 0).
- Hay limpieza programada (`index.ts:277`) y retención de 30 días (`index.ts:299`).

Conclusión: es observabilidad de operador, no una función de producto. No es
basura, pero hoy nadie la lee.

## 5. El test que dice lo que no prueba

`tests/kernel-meta-context.test.ts` se titula *"Meta hints llegan al contexto del
chat"*, pero sus cuatro casos prueban `Meta.evaluateWithProgress` en aislamiento
(reglas y urgencias). **Ninguno comprueba que el bloque
`[Contexto urgente del sistema]` aparezca en el prompt**, que es la afirmación del
título. Es el patrón de falso verde que persigue esta campaña: el test pasa aunque
se desconecte la inyección.

## 6. Tres salidas, con lo que cuesta cada una

| Opción | Qué se hace | Riesgo |
|---|---|---|
| **A. Conservar A y borrar B** (mi recomendación) | Quitar `pendingMetaHints`, `lastMetaHint`, `pendingMetaContext` y `metaHintsPromptBlock`; el prompt sigue recibiendo hints por `systemContext`. | Ninguno funcional: B no se lee. Reduce estado muerto y una evaluación por cierre de turno. |
| **B. Cablear B de verdad** | Inyectar los hints diferidos en el prompt del turno siguiente y que `clone()` los herede. | Duplica la vía A para el caso "slow terminó con el turno cerrado"; hay que decidir cuál manda y evitar repetir el mismo hint. |
| **C. Borrar todo el observador** | Quitar Meta, sus rutas y su persistencia. | Se pierde el aviso al usuario de que el slow terminó o falló. No lo recomiendo con la vía A funcionando. |

En cualquiera de las tres: **añadir el test que falta** (un turno con un hint
`high` produce el bloque en el prompt). Sin ese test, la decisión no se puede
verificar.

## 7. Lo que no he comprobado

- **Frecuencia real** con la que hay un turno abierto al construir el prompt (si
  es baja, la vía A aporta poco en la práctica). Se mediría con un contador en
  `systemContext`.
- **Coste** de `listTurns(5)` + `thoughtsOf` por petición de chat en Postgres real
  (aquí no hay Postgres; el gate no cubre rendimiento).
- Si alguna integración externa lee `/meta-hints/pending`: en el repo no hay
  consumidor, pero no puedo ver lo que corra fuera.
