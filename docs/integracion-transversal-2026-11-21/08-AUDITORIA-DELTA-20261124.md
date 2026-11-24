# Auditoría del repositorio actualizado · 24 de noviembre de 2026

**Corte:** `main@715da8c41da78b6d7afc8e23ed8ee5202db72b7e`.
**Ámbito:** C00–C06, Cognition V2, coordinación Trans01–Trans04 y controles asociados. UX reciente, UI Lab/Vercel y legal se mantienen fuera de alcance.

## Estado verificado

| Referencia | HEAD | Exclusivos de la rama / de main | Evidencia y decisión |
| --- | --- | ---: | --- |
| [C02 · PR #17](https://github.com/uniscrolliabrain-cloud/agente/pull/17) | `a61978e3` | 23 / 228 | Abierto, checks aplicables verdes en su SHA. Repetir contra el candidato combinado. |
| [C03 · PR #18](https://github.com/uniscrolliabrain-cloud/agente/pull/18) | `add8798b` | 1 / 228 | Abierto, checks aplicables verdes en su SHA. Mantener intacto el bloqueo de arranque compartido. |
| [C04 · PR #19](https://github.com/uniscrolliabrain-cloud/agente/pull/19) | `c8293e8b` | 11 / 228 | Abierto, gate global rojo por cancelación de pruebas. |
| [C05/C06 · PR #28](https://github.com/uniscrolliabrain-cloud/agente/pull/28) | `54f7fbfe` | 84 / 228 | Borrador, C05 específica verde y gate global rojo. Incluye C04 por ascendencia. Su delta de C05/C06 requiere revisión propia. |
| [Convergencia 12×4](https://github.com/uniscrolliabrain-cloud/agente/tree/campaign/convergencia-operativa-12x4) | `52dcd7ac` | 92 / 6 | Plan y protocolo. Su README lo declara preliminar. |
| Trans01 · trans02 · Trans03 · trans04 | `a70e2da4` · `217ef742` · `508f74d1` · `a48b79e9` | 96 / 6 cada una | Cada rama añade cuatro documentos de coordinación respecto a la campaña maestra. Eso acredita preparación de turnos, sin evidencia de los gates de ejecución. |

`main` avanzó 227 commits alcanzables desde el corte `8c6a951`. El diff neto entre `3023637` y el HEAD actual es vacío para `apps/server`, `packages/domain`, `tests` y `.github/workflows/ci.yml`. Este dato acota el impacto en el backend auditado y no certifica el resto del árbol ni el artefacto desplegado. Ninguno de los PR #17–#19 o #28 está fusionado. C00 ya tiene su [PR documental #30](https://github.com/uniscrolliabrain-cloud/agente/pull/30). C01 conserva inventarios en la rama de coordinación y sigue pendiente de decisiones por archivo.

## Hallazgos ordenados por impacto

### P1 · El gate global de C04 y C05/C06 sigue rojo

En los dos PR falla la ejecución del archivo de voz a partir de la prueba de interrupción entre coordinadores. El log más reciente registra **0 fallos de aserción y 4 cancelaciones** con el mensaje de Node sobre una promesa pendiente cuando termina el bucle de eventos. En el código, la prueba espera una señal emitida tras un sondeo cuyo temporizador está desvinculado con `unref()`. Es la explicación más probable del fallo de CI. La corrección debe mantener acotada y activa la espera del test y verificar que el proveedor recibió el aborto y que no se guardó salida obsoleta. Esto no demuestra un fallo de cancelación en producción. [C04](https://github.com/uniscrolliabrain-cloud/agente/actions/runs/44945470616/job/136971704133) · [C05/C06](https://github.com/uniscrolliabrain-cloud/agente/actions/runs/45234313460/job/137901848292)

### P1 · C04 está incluida en el PR #28

El ancestro común con main es `3023637` y `c8293e8` es ancestro del HEAD del #28. Revisar el delta desde C04 y probar un candidato con C02 y C03 antes de aprobar merges. Dos PR contra main incluyen el mismo trabajo C04, por lo que su orden de integración afecta qué se revisa y qué gates deben repetirse. El estado de mergeabilidad del #28 era `UNKNOWN` al corte. [PR #19](https://github.com/uniscrolliabrain-cloud/agente/pull/19) · [PR #28](https://github.com/uniscrolliabrain-cloud/agente/pull/28)

### C05/C06 · Avances comprobados y límites

- **CopilotKit.** Las auditorías independientes reprodujeron el fallo HTTP de `chat` indefinido en snapshots anteriores (`b59b2950` y `4f426ca`). La rama actual incorpora binding y clonación con identidad de tenant y actor. En `54f7fbfe` pasó la prueba HTTP local con inferencia simulada. Esto confirma el recorrido probado en ese SHA; la CI global todavía requiere corrección. [Auditoría independiente](https://github.com/uniscrolliabrain-cloud/agente/tree/audit/cognition-v2-independent-20261123) · [Auditoría Slow](https://github.com/uniscrolliabrain-cloud/agente/tree/audit/c06-p03a-slow-observation-20261123)
- **Slow.** El observador durable verifica procedencia, revocación y cuota, y difiere hasta el próximo día UTC cuando se agota la cuota, sin consumir intentos de dead-letter. Los únicos usos de `new SlowObservationWorker` en el SHA revisado están en tests. Antes de activar, verificar en PostgreSQL nativo dos workers, reanudación, revocación, métricas y el impacto de que el cursor espere el primer evento diferido de un tenant. El constructor permite inyectar un Store para el cursor mientras cuota y cola usan el runtime. Conviene exigir el mismo Store al hacer el montaje para preservar la transacción. Son riesgos preventivos de activación. [Worker](https://github.com/uniscrolliabrain-cloud/agente/blob/54f7fbfe/apps/server/src/engine/cognition/v2/slow-observation-worker.ts)
- **Medios.** El gate específico de C05 está verde. El transporte simulado y la limpieza por apertura parcial están probados. Quedan pendientes el montaje y verificación de medios reales, la entrega incremental y la cancelación hasta reproducción. El estado de configuración de un proveedor no acredita conectividad, disponibilidad ni reproducción. [CI específica](https://github.com/uniscrolliabrain-cloud/agente/actions/runs/45234313366/job/137901847489)

## Pruebas y decisión

Sobre el árbol exacto de `54f7fbfe`, ejecuté **19 pruebas, 0 fallos y 0 cancelaciones**, con dependencias ya instaladas y sin proveedores reales:

```bash
ALLOW_NETWORK=0 node --import tsx --import ./tests/setup.ts --test \
  --test-timeout=45000 --test-force-exit \
  tests/{cognition-v2-slow-observation-worker-integration,cognition-v2-chat-agent,cognition-v2-http,voice-v2-media-lifecycle}.test.ts
```

La ejecución cubre el HTTP actual, clonación, admisión y cursor Slow, cuota, recuperación a medianoche, workers competidores en el fixture y el ciclo de medios simulado. Esta corrida no sustituye a la suite completa ni a una prueba nueva con PostgreSQL nativo. El historial de C02/C03 y los resultados previos de PostgreSQL están en el [informe 07](07-ESTADO-Y-CIERRE-TRANSVERSAL.md).

**NO_GO para merge y activación.** Primero reparar el gate global de C04. Después preparar un candidato combinado sobre `715da8c4` con C02/C03/C04 y validar aislamiento, regresión móvil y PostgreSQL. Revisar encima el delta C05/C06, con el observador desactivado hasta certificar su montaje. Usar los documentos Trans01–Trans04 como guía de ejecución, registrando por cada parada el SHA y la evidencia. La auditoría no cambia código de producto ni activa despliegues.
