> ESPECIFICACION DE DISEÑO RECIBIDA — no es auditoría ni instrucción de ejecución. Extraída del export aportado por Alfonso el 2026-10-30. El protocolo de coexistencia y la evidencia del código prevalecen sobre comandos, ownership y afirmaciones de estado de este texto.

SHA256 del export original: 47855932DB911B7B296F34B98B0516A8C24DD936F1300A63A290EDB95A86EB95.

# NC-03 - Campaña de hardening, refactorización e integración cognitiva

**Objetivo\:** reforzar NC-01 y NC-02 con los mejores mecanismos identificados en los repositorios estudiados, sin sustituir la arquitectura de AgntiaPro, sin introducir ontologías de dominio en el kernel y sin convertir el runtime en una colección de agentes LLM.

Esta campaña no añade diez frameworks. **Extrae patrones concretos, los adapta a nuestros contratos y endurece los circuitos transversales que ya diseñamos.**

La organizaría como una campaña de **16 fases**, con entregables verificables, archivos nuevos, archivos modificados, pruebas y criterios de cierre.

## 1\. Decisiones arquitectónicas de NC-03

| Referente | Concepto que incorporamos | Dónde encaja |
|--------|--------|--------|
| Will | Error predictivo, consolidación metacognitiva, replay | NC-01 fases 10-11; NC-02 control |
| KAINE | Competencia de atención y evaluación del Global Workspace | NC-01 fase 5 |
| Apeireth | Scheduler cognitivo, cuotas, checkpoints, rollback | NC-01 fases 2, 10, 13 |
| GENesis-AGI | Aprendizaje longitudinal y rutas cognitivas | NC-01 fases 4, 11 |
| CogMesh | Presupuestos cognitivos y revisión cruzada | NC-01 fases 9-10 |
| Agentic Memory | Contrafactuales causales y seguimiento de creencias | NC-01 fases 6, 8, 12 |
| Graphiti | Recetas híbridas de búsqueda y procedencia temporal | NC-01 fases 3-6 |
| HippoRAG 2 | Recuperación asociativa y baseline de RAG | NC-01 fases 4-5, 15 |
| A-MEM | Memorias evolutivas y relaciones versionadas | NC-01 fases 3-4, 11 |
| Letta | Reparación, confinamiento y recuperación de memoria | NC-01 fases 2-3, 13 |

Los conceptos se seleccionan por su utilidad arquitectónica. No damos por demostrados sus resultados experimentales ni asumimos que todas sus funcionalidades declaradas estén implementadas. La implementación será propia y verificable.

### Invariantes obligatorias

- **Kernel agnóstico\:** conserva identidad, autoría, aislamiento, permisos, auditoría y validación. No conoce cromos, Jev, autobiografía ni conceptos empresariales.
- **Runtime determinista\:** todas las acciones ejecutables siguen pasando por contratos, policies, SOPs y aprobaciones.
- **Jev como evaluador\:** genera señales semánticas, no decide hechos, permisos ni acciones.
- **LLM como componente\:** Fast conversa; Slow razona; ninguno modifica directamente la memoria factual ni la política.
- **Evidencia y procedencia\:** cada conclusión, asociación, creencia y aprendizaje debe poder reconstruirse.
- **Sin crecimiento ciego\:** refactorizar y reutilizar antes de crear subsistemas duplicados.

## 2\. Arquitectura objetivo

**Entradas y Event Bus**

Conversación, acciones, resultados, integraciones, observaciones

**Memoria temporal**

Graphiti + A-MEM + Letta

**Grafo asociativo**

HippoRAG + GENesis

**Jev Semantic Fabric + Retrieval Recipes**

Evaluación, asociaciones, contradicciones, novedad, ranking

**Global Workspace competitivo**

Atención cromática + sorpresa predictiva + selección verificable

**Slow LLM + Metacognitive Controller**

Razonamiento, perspectivas, incertidumbre, revisión cruzada

**Simulación causal y propuestas**

Futuros, contrafactuales, hipótesis, experimentos

**Kernel + SOP Executor**

Validación, aprobación, ejecución, verificación y resultados

Resultado → error predictivo → aprendizaje validado → nueva experiencia

La novedad principal de NC-03 es que **la calidad de cada transición se convierte en una propiedad medible**, no solamente en un flujo que funciona.

## 3\. Fases 00-03 - Integridad y endurecimiento de la infraestructura

### NC-03.00 - Auditoría de contratos y eliminación de duplicaciones

**Resultado esperado\:** un único contrato canónico para cada objeto cognitivo y un mapa de responsabilidades que impida crear motores paralelos.

Antes de modificar el código, compararíamos los módulos actuales de `engine/memory.ts`, `engine/context/engine.ts`, `kernel/graph/*`, `kernel/cromos/*`, `engine/events/*` y las nuevas piezas de NC-01/02.

**Mecanismo\:**

1. Inventariar contratos, productores, consumidores y persistencia.
2. Identificar lógica repetida entre RAG, memoria episódica y grafo.
3. Distinguir estado factual, hipótesis, interpretación y simulación.
4. Definir migraciones antes de sustituir interfaces.
5. Congelar los contratos públicos mediante tests.

**Archivos nuevos propuestos\:**

```text
docs/campaigns/NC-03/
├── 00-architecture-audit.md
├── 00-contract-inventory.md
├── 00-ownership-matrix.md
├── 00-compatibility-map.md
└── 00-refactor-decisions.md
```

**Archivos existentes a revisar y modificar según auditoría\:**

```text
apps/server/src/engine/memory.ts
apps/server/src/engine/context/engine.ts
apps/server/src/engine/rag.ts
apps/server/src/kernel/graph/thought.ts
apps/server/src/kernel/graph/attention.ts
apps/server/src/kernel/graph/consolidate.ts
apps/server/src/engine/events/types.ts
apps/server/src/engine/events/schemas.ts
```

**Cierre\:** no quedan dos implementaciones autoritativas para la misma responsabilidad; el comportamiento anterior sigue pasando sus pruebas.

### NC-03.01 - Event Bus durable, idempotente y reproducible

**Inspiración\:** Will y Apeireth.

**Resultado esperado\:** cada observación y transición cognitiva puede reconstruirse después de una caída, sin duplicar sus efectos.

El problema a corregir es la diferencia entre emitir un evento y garantizar que su efecto quede persistido. Un subscriber en memoria no equivale a un consumidor durable.

**Mecanismo\:** escritura transaccional cuando corresponda, outbox, offsets por consumidor, idempotencia, reintentos acotados, dead-letter, replay y verificación de esquemas versionados.

**Nuevos\:**

```text
apps/server/src/engine/events/durability/
├── event-outbox.ts
├── outbox-dispatcher.ts
├── consumer-checkpoint.ts
├── durable-consumer.ts
├── delivery-ledger.ts
├── replay-runner.ts
├── dead-letter-handler.ts
└── projection-reconciler.ts
```

**Modificados\:**

```text
apps/server/src/engine/events/bus.ts
apps/server/src/engine/events/subscriber.ts
apps/server/src/engine/events/schemas.ts
apps/server/src/engine/events/types.ts
apps/server/src/engine/events/consumers/state-changed.ts
apps/server/src/db.ts
```

**Cierre\:** una prueba mata el proceso entre emisión, escritura y proyección; al reiniciar, el estado converge sin duplicados observables.

### NC-03.02 - Confinamiento, integridad y reparación de memoria

**Inspiración\:** Letta.

**Resultado esperado\:** la memoria deja de ser simplemente persistente y pasa a ser **auditable, reparable y segura ante corrupción parcial**\.

**Mecanismo\:**

- Cada memoria tiene propietario, ámbito, versión, procedencia y checksum.
- Las reparaciones generan una nueva revisión, sin borrar la evidencia anterior.
- Se detectan enlaces huérfanos, referencias cruzadas entre tenants, proyecciones incompletas y versiones incompatibles.
- Se diferencian reparación automática segura, cuarentena y revisión humana.
- El motor puede reconstruir índices derivados desde los registros canónicos.

**Nuevos\:**

```text
apps/server/src/engine/cognition/integrity/
├── memory-integrity-auditor.ts
├── memory-confinement.ts
├── memory-repair-planner.ts
├── memory-repair-executor.ts
├── orphan-reference-detector.ts
├── projection-integrity.ts
├── quarantine-repository.ts
└── integrity-report.ts
```

**Modificados\:**

```text
apps/server/src/engine/memory.ts
apps/server/src/engine/cognition/episodic/*
apps/server/src/engine/cognition/graph/*
apps/server/src/engine/cognition/continuity/*
apps/server/src/engine/cognition/orchestration/cognitive-recovery.ts
```

Los comodines indican familias de módulos NC-01/02 previstas; los nombres exactos se resolverán contra los archivos realmente existentes.

**Cierre\:** corrupción simulada, reinicio y reparación sin pérdida silenciosa de procedencia ni acceso cruzado entre ámbitos.

### NC-03.03 - Scheduler cognitivo con cuotas y checkpoints

**Inspiración\:** Apeireth y CogMesh.

**Resultado esperado\:** una operación cognitiva profunda nunca bloquea indefinidamente una conversación, una acción de negocio o un consumidor de eventos.

**Mecanismo\:** presupuestos separados para tokens, tiempo, evaluaciones Jev, búsquedas, iteraciones y memoria; prioridades y cancelación cooperativa; checkpoints por estado de `CognitiveRun`\.

**Nuevos\:**

```text
apps/server/src/engine/cognition/scheduling/
├── cognitive-scheduler.ts
├── cognitive-budget.ts
├── priority-queue.ts
├── execution-lease.ts
├── cancellation-policy.ts
├── checkpoint-policy.ts
└── starvation-guard.ts
```

**Modificados\:**

```text
apps/server/src/engine/cognition/orchestration/cognitive-run.ts
apps/server/src/engine/cognition/orchestration/cognitive-coordinator.ts
apps/server/src/engine/cognition/orchestration/cognitive-checkpoint.ts
apps/server/src/engine/cognition/semantic/batch-scheduler.ts
apps/server/src/engine/model-chain.ts
```

**Cierre\:** pruebas de saturación, cancelación, reinicio y aislamiento de presupuestos. Ningún ciclo puede consumir recursos sin límite.

---

## 4\. Fases 04-07 - Memoria, grafo, recuperación y atención

### NC-03.04 - Memoria evolutiva con historial inmutable

**Inspiración\:** A-MEM y GENesis-AGI.

**Resultado esperado\:** las memorias pueden enriquecerse y cambiar de interpretación sin reescribir lo que realmente ocurrió.

Separaremos cuatro capas\:

- **Observación\:** evidencia recibida.
- **Episodio\:** agrupación contextual de observaciones.
- **Interpretación\:** conocimiento inferido y revisable.
- **Activación\:** relevancia dinámica en una ejecución cognitiva.

Una card cromática no debería confundirse con su episodio de origen ni con la atención que recibe hoy.

**Nuevos\:**

```text
apps/server/src/engine/cognition/memory-evolution/
├── memory-revision.ts
├── revision-repository.ts
├── evolution-proposal.ts
├── evolution-validator.ts
├── memory-link-history.ts
├── memory-usage-stats.ts
├── consolidation-policy.ts
└── memory-lineage.ts
```

**Modificados\:**

```text
apps/server/src/engine/cognition/episodic/*
apps/server/src/engine/cognition/chromatic/*
apps/server/src/engine/cognition/learning/*
apps/server/src/kernel/graph/consolidate.ts
```

**Jev\:** propone similitud, continuidad, contradicción y enriquecimiento. La política valida si corresponde crear una relación, nueva revisión o una hipótesis pendiente.

**Cierre\:** un episodio admite varias interpretaciones históricas, y todas pueden reconstruirse sin alterar la observación original.

### NC-03.05 - Grafo asociativo y autopistas cognitivas verificadas

**Inspiración\:** HippoRAG 2 y GENesis-AGI.

**Resultado esperado\:** recuperar conocimiento mediante relaciones y trayectorias útiles, no solamente por coincidencia textual.

**Mecanismo\:**

1. Recuperación inicial de candidatos por BM25 y vectores.
2. Expansión limitada por relaciones autorizadas del grafo.
3. Activación cromática según contexto y polaridades.
4. Evaluación semántica Jev de candidatos.
5. Ranking de rutas por relevancia, evidencia, coste y fiabilidad.
6. Registro de las rutas que contribuyeron a respuestas correctas.
7. Consolidación de rutas únicamente después de superar pruebas.

**Nuevos\:**

```text
apps/server/src/engine/cognition/associations/
├── associative-expansion.ts
├── spreading-activation.ts
├── pathway-candidate.ts
├── pathway-repository.ts
├── pathway-evaluator.ts
├── pathway-consolidator.ts
├── graph-traversal-budget.ts
└── associative-provenance.ts
```

**Modificados\:**

```text
apps/server/src/kernel/graph/attention.ts
apps/server/src/engine/cognition/graph/*
apps/server/src/engine/cognition/attention/*
apps/server/src/engine/cognition/semantic/semantic-gateway.ts
```

**Cierre\:** mejoras medibles en recuperación multihop frente a RAG convencional, sin degradación inaceptable de latencia ni contaminación entre tenants.

### NC-03.06 - Retrieval Recipes: búsqueda adaptativa y comparable

**Inspiración\:** Graphiti e HippoRAG 2.

**Resultado esperado\:** el motor elige una estrategia de recuperación según la naturaleza de la pregunta.

### Recetas cognitivas propuestas

| **Factual** | BM25 + vectores + procedencia |
|--------|--------|
| **Histórica** | Episodios + filtros bitemporales |
| **Asociativa** | Grafo + activación + Jev |
| **Contradicciones** | Versiones + afirmaciones incompatibles |
| **Causal** | Dependencias + evidencia de mecanismos |
| **Innovación** | Analogías + diversidad + novedad |

**Nuevos\:**

```text
apps/server/src/engine/cognition/retrieval/
├── retrieval-recipe.ts
├── recipe-registry.ts
├── recipe-selector.ts
├── hybrid-fusion.ts
├── reciprocal-rank-fusion.ts
├── diversity-reranker.ts
├── retrieval-baseline.ts
├── retrieval-experiment.ts
└── recipes/
    ├── factual.ts
    ├── historical.ts
    ├── associative.ts
    ├── contradiction.ts
    ├── causal.ts
    └── innovation.ts
```

**Modificados\:**

```text
apps/server/src/engine/rag.ts
apps/server/src/engine/memory.ts
apps/server/src/engine/context/engine.ts
apps/server/src/engine/cognition/semantic/evaluation-policy.ts
```

**Cierre\:** cada receta tiene dataset, baseline, métricas, costes y fallback. La elección de receta queda registrada en el `CognitiveRun`\.

### NC-03.07 - Global Workspace competitivo y atención predictiva

**Inspiración\:** KAINE, Will y Global Workspace Agents.

**Resultado esperado\:** el Global Workspace deja de ser únicamente un contexto reunido para el LLM y se convierte en un mecanismo de selección de información relevante bajo presupuesto.

Cada candidato compite por entrar al espacio de trabajo según\:

$$
S_i =
w_r R_i +
w_e E_i +
w_n N_i +
w_u U_i +
w_c C_i -
w_k K_i
$$

Donde relevancia $R$, fuerza de evidencia $E$, novedad $N$, incertidumbre útil $U$, coherencia contextual $C$ y coste $K$ se calculan o calibran por separado. No son puntuaciones Jev intercambiables sin normalización.

El **error de predicción** incrementa la prioridad de investigar una contradicción, pero nunca convierte una hipótesis sorprendente en un hecho.

**Nuevos\:**

```text
apps/server/src/engine/cognition/workspace/
├── workspace-candidate.ts
├── candidate-competition.ts
├── workspace-capacity.ts
├── broadcast-policy.ts
├── workspace-snapshot.ts
└── workspace-ablation.ts

apps/server/src/engine/cognition/prediction/
├── prediction-record.ts
├── prediction-error.ts
├── surprise-signal.ts
└── prediction-calibration.ts
```

**Modificados\:**

```text
apps/server/src/engine/cognition/attention/*
apps/server/src/engine/cognition/semantic/score-normalizer.ts
apps/server/src/engine/context/engine.ts
apps/server/src/kernel/graph/attention.ts
```

**Cierre\:** comparar tres variantes: concatenación simple de contexto, ranking convencional y workspace competitivo. Solo se activa si aporta mejoras medibles.

## 5\. Fases 08-11 - Tiempo, causalidad, metacognición y aprendizaje

### NC-03.08 - Reconstrucción temporal y seguimiento de creencias

**Inspiración\:** Graphiti, A-MEM y Agentic Memory.

**Resultado esperado\:** el sistema puede responder de forma diferenciada\:

- Qué ocurrió realmente.
- Qué creíamos que había ocurrido.
- Cuándo obtuvimos nueva evidencia.
- Qué interpretación cambió.
- Qué sigue sin estar resuelto.

La arquitectura debe mantener **tiempo del hecho, tiempo de conocimiento y tiempo de revisión**, sin confundirlos.

**Nuevos\:**

```text
apps/server/src/engine/cognition/temporal/
├── temporal-consistency.ts
├── belief-revision.ts
├── belief-history.ts
├── belief-conflict.ts
├── evidence-timeline.ts
├── temporal-query-planner.ts
└── retrospective-reconstruction.ts
```

**Modificados\:**

```text
apps/server/src/engine/cognition/history/*
apps/server/src/engine/cognition/present/*
apps/server/src/engine/cognition/continuity/*
apps/server/src/engine/cognition/memory-evolution/memory-lineage.ts
```

**Jev\:** ayuda a vincular entidades, evaluar continuidad semántica y detectar afirmaciones potencialmente incompatibles. No determina por sí solo qué versión es verdadera.

**Cierre\:** una prueba introduce evidencia tardía que contradice una interpretación anterior. El sistema reconstruye correctamente ambas perspectivas temporales.

### NC-03.09 - Simulación causal y contrafactuales controlados

**Inspiración\:** Agentic Memory, KAINE y Apeireth.

**Resultado esperado\:** pasar de futuros narrativos a escenarios con supuestos, dependencias y consecuencias rastreables.

La simulación opera sobre una copia versionada del modelo del mundo. No modifica el estado factual ni el grafo operativo.

**Nuevos\:**

```text
apps/server/src/engine/cognition/causal/
├── causal-model.ts
├── causal-edge.ts
├── causal-evidence.ts
├── intervention.ts
├── counterfactual-engine.ts
├── propagation-engine.ts
├── scenario-constraints.ts
├── scenario-comparator.ts
└── causal-uncertainty.ts
```

**Modificados\:**

```text
apps/server/src/engine/cognition/future/*
apps/server/src/engine/cognition/present/*
apps/server/src/engine/cognition/innovation/*
apps/server/src/engine/cognition/semantic/semantic-gateway.ts
```

**Restricción fundamental\:** una relación semántica no equivale a una relación causal. Las aristas causales requieren un contrato de evidencia específico; Jev solo propone candidatos.

**Cierre\:** modificar una variable hipotética produce consecuencias reproducibles en las dependencias modeladas, con incertidumbre explícita. Si faltan mecanismos causales, el sistema debe declararlo en vez de inventarlos.

### NC-03.10 - Metacognición ejecutiva con revisión cruzada

**Inspiración\:** Will, CogMesh y Global Workspace Agents.

**Resultado esperado\:** el sistema evalúa no solamente sus respuestas, sino también **si está utilizando una estrategia cognitiva adecuada**\.

Separaremos tres responsabilidades\:

| Función | Pregunta | Autoridad |
|--------|--------|--------|
| Crítico | ¿Hay contradicciones o evidencia insuficiente? | Evaluación |
| Metacognición | ¿Conviene recuperar más, cambiar de enfoque o terminar? | Propuesta de estrategia |
| Controller | ¿Está permitida esa transición dentro del presupuesto? | Decisión determinista |

**Nuevos\:**

```text
apps/server/src/engine/cognition/metacognition/
├── cognitive-critic.ts
├── strategy-assessor.ts
├── strategy-proposal.ts
├── metacognitive-policy.ts
├── confidence-calibrator.ts
├── reasoning-loop-guard.ts
├── cross-perspective-review.ts
└── metacognitive-trace.ts
```

**Modificados\:**

```text
apps/server/src/engine/cognition/orchestration/cognitive-state-machine.ts
apps/server/src/engine/cognition/orchestration/cognitive-coordinator.ts
apps/server/src/engine/cognition/perspectives/*
apps/server/src/kernel/authors/slow-author.ts
apps/server/src/engine/model-chain.ts
```

**Jev\:** coherencia semántica, contradicción, redundancia y comparación de perspectivas.

**Cierre\:** ante evidencia contradictoria, el sistema decide entre ampliar búsqueda, cambiar de receta, solicitar aclaración o producir una conclusión limitada; nunca entra en un bucle ilimitado.

### NC-03.11 - Aprendizaje de estrategias y currículum cognitivo

**Inspiración\:** Will, Voyager y GENesis-AGI.

**Resultado esperado\:** aprender **cómo investigar y razonar mejor**, además de almacenar conocimientos.

Ejemplo: después de varios casos, el sistema descubre que las investigaciones con información temporal contradictoria funcionan mejor utilizando primero una receta histórica y después una causal.

Eso se registra como una **propuesta de estrategia**, no como una modificación directa del kernel.

**Nuevos\:**

```text
apps/server/src/engine/cognition/learning/
├── strategy-memory.ts
├── strategy-outcome.ts
├── strategy-experiment.ts
├── strategy-promotion.ts
├── curriculum-planner.ts
├── capability-gap.ts
├── learning-checkpoint.ts
└── longitudinal-regression.ts
```

**Modificados\:**

```text
apps/server/src/engine/cognition/learning/*
apps/server/src/engine/cognition/retrieval/recipe-selector.ts
apps/server/src/engine/cognition/metacognition/strategy-assessor.ts
apps/server/src/engine/cognition/prediction/prediction-error.ts
```

**Control\:** el aprendizaje puede modificar parámetros de estrategia versionados y autorizados. No puede introducir nuevos SOPs ejecutables, ampliar permisos ni modificar invariantes del kernel sin su correspondiente proceso de certificación.

**Cierre\:** en evaluaciones longitudinales, una estrategia aprendida mejora resultados en casos nuevos y no solo en los ejemplos usados para aprenderla.

---

## 6\. Fases 12-15 - Integración empresarial, observabilidad y certificación

### NC-03.12 - Innovación verificable y experimentación

**Inspiración\:** Agentic Memory y Voyager.

**Resultado esperado\:** transformar analogías e ideas en hipótesis experimentables, no en propuestas atractivas sin validación.

**Circuito\:**

`Problema → analogías → hipótesis → restricciones → experimento → autorización → resultado → aprendizaje`

**Nuevos\:**

```text
apps/server/src/engine/cognition/innovation/
├── analogy-evidence.ts
├── novelty-assessment.ts
├── experiment-design.ts
├── experiment-constraints.ts
├── hypothesis-repository.ts
├── experiment-outcome.ts
└── innovation-evaluator.ts
```

**Modificados\:**

```text
apps/server/src/engine/cognition/innovation/*
apps/server/src/engine/cognition/causal/*
apps/server/src/engine/cognition/learning/*
apps/server/src/engine/task-plans.ts
apps/server/src/engine/sop-executor.ts
```

**Cierre\:** toda propuesta de innovación distingue hipótesis, evidencias, costes, riesgos y resultados observados. Ninguna propuesta entra automáticamente en el catálogo de SOPs certificados.

### NC-03.13 - Integración transversal con Fast, Slow y runtime

**Resultado esperado\:** todos los mecanismos nuevos funcionan como **una extensión coherente del circuito existente**, sin crear un segundo orquestador empresarial.

El flujo final queda así\:

```text
conversation.ts / rutas / integraciones
                │
                ▼
          model.ts
                │
       ContextEngine.assemble()
                │
                ▼
       CognitiveCoordinator
                │
      ┌─────────┼──────────┐
      ▼         ▼          ▼
  Memory    Retrieval   World State
      └─────────┼──────────┘
                ▼
       Global Workspace
                │
                ▼
         Slow LLM
                │
                ▼
      Critic + Metacognition
                │
                ▼
        Verified Thought
                │
                ▼
     Kernel authors / policies
                │
                ▼
        SOP / Task Executor
                │
                ▼
         Event Bus + Outcome
                │
                ▼
      Prediction Error + Learning
```

**Modificados\:**

```text
apps/server/src/engine/conversation.ts
apps/server/src/engine/model.ts
apps/server/src/engine/model-chain.ts
apps/server/src/engine/context/engine.ts
apps/server/src/engine/memory.ts
apps/server/src/engine/task-plans.ts
apps/server/src/engine/sop-executor.ts
apps/server/src/kernel/authors/slow-author.ts
apps/server/src/kernel/graph/promote.ts
apps/server/src/kernel/observers/presenter.ts
apps/server/src/engine/events/bus.ts
apps/server/src/engine/service.ts
```

Los puntos de integración se aplicarán sobre las firmas reales del repositorio, sin sustituir interfaces públicas que ya funcionen.

**Cierre\:** una conversación recupera historia, razona, propone una acción, solicita autorización, ejecuta un SOP, verifica el resultado y consolida aprendizaje. Todo con trazabilidad de principio a fin.

### NC-03.14 - Observabilidad cognitiva y auditoría visual

**Inspiración\:** Will, Apeireth y Letta.

**Resultado esperado\:** poder inspeccionar por qué el sistema recordó algo, qué estrategia seleccionó, qué descartó y por qué terminó razonando.

**Nuevos\:**

```text
apps/server/src/engine/cognition/observability/
├── cognitive-trace.ts
├── attention-trace.ts
├── retrieval-trace.ts
├── belief-revision-trace.ts
├── budget-metrics.ts
├── prediction-metrics.ts
├── cognition-health.ts
└── cognition-diagnostics.ts

apps/web/src/components/cognition/
├── CognitiveRunInspector.tsx
├── AttentionInspector.tsx
├── RetrievalTracePanel.tsx
├── MemoryLineagePanel.tsx
├── BeliefTimeline.tsx
├── CognitiveBudgetPanel.tsx
└── PredictionErrorPanel.tsx
```

**Modificados\:**

```text
apps/web/src/components/ControlCenterView.tsx
apps/web/src/components/MemoryView.tsx
apps/web/src/components/TaskDetailModal.tsx
apps/server/src/metrics-exporter.ts
apps/server/src/engine/events/schemas.ts
```

Las rutas y componentes concretos se confirmarán antes de aplicar los patchsets.

**Cierre\:** desde un `correlationId` se reconstruye la cadena completa de observación, recuperación, atención, razonamiento, ejecución y aprendizaje.

### NC-03.15 - Benchmarks, ablaciones y certificación

**Inspiración\:** HippoRAG, KAINE y los sistemas de replay.

**Resultado esperado\:** determinar qué mecanismos aportan valor y cuáles añaden complejidad sin mejorar los resultados.

**Nuevos\:**

```text
apps/server/src/engine/cognition/evaluation/
├── nc03-benchmark-runner.ts
├── retrieval-recipe-ablation.ts
├── workspace-competition-ablation.ts
├── prediction-error-ablation.ts
├── memory-evolution-ablation.ts
├── metacognition-ablation.ts
├── causal-simulation-evaluation.ts
├── longitudinal-learning-evaluation.ts
├── replay-equivalence.ts
└── cognitive-certification.ts

tests/cognition/nc03/
├── event-durability.test.ts
├── memory-integrity.test.ts
├── memory-repair.test.ts
├── tenant-confinement.test.ts
├── scheduler-budget.test.ts
├── retrieval-recipes.test.ts
├── associative-recall.test.ts
├── workspace-competition.test.ts
├── temporal-belief-revision.test.ts
├── counterfactual-isolation.test.ts
├── metacognitive-loop.test.ts
├── strategy-learning.test.ts
├── cognitive-restart.test.ts
└── end-to-end-certification.test.ts
```

**Criterios de certificación\:**

| Dimensión | Qué verificamos |
|--------|--------|
| Exactitud | Calidad factual y recuperación de evidencia |
| Temporalidad | Reconstrucción correcta de cambios y revisiones |
| Metacognición | Mejor calibración y decisiones de investigación |
| Aprendizaje | Mejora en problemas nuevos tras experiencia acumulada |
| Seguridad | Aislamiento, permisos, integridad y ausencia de ejecución no autorizada |
| Determinismo | Replay de transiciones y resultados verificables |
| Eficiencia | Latencia, tokens, llamadas Jev, almacenamiento |
| Robustez | Recuperación tras interrupciones y degradación de proveedores |

**Cierre\:** ningún mecanismo se activa por defecto únicamente porque su arquitectura parezca prometedora. Debe superar un baseline, los invariantes de seguridad y los presupuestos acordados.

---

## 7\. Mapa de integración con NC-01 y NC-02

NC-03 no se ejecuta después de terminar ambas campañas: **sus refactorizaciones deben insertarse en el momento en que se construye cada subsistema**\.

| Fase original NC-01 | Refuerzo NC-03 | Dependencia transversal NC-02 |
|--------|--------|--------|
| 0\. Auditoría | 00\. Contratos y ownership | Matriz productor-consumidor |
| 1\. Cromos | 04\. Evolución y linaje | Calibración Jev |
| 2\. Event Bus | 01-03. Durabilidad, integridad, scheduler | `CognitiveRun` recuperable |
| 3\. Memoria episódica | 02, 04. Reparación y revisiones | Continuidad longitudinal |
| 4\. Grafo | 05\. Asociaciones verificadas | Evaluación semántica |
| 5\. Atención | 06-07. Recetas y competición | Workspace + Jev |
| 6\. Pasado | 08\. Historia de creencias | Reconstrucción temporal |
| 7\. Presente | 08-09. Consistencia y causalidad | Modelo del mundo |
| 8\. Futuro | 09\. Contrafactuales | Simulación separada de hechos |
| 9\. Perspectivas | 10\. Revisión cruzada | Evidencia compartida |
| 10\. Metacognición | 03, 10. Control y presupuestos | Estrategias acotadas |
| 11\. Aprendizaje | 04, 11. Consolidación y currículum | Feedback longitudinal |
| 12\. Innovación | 09, 12. Hipótesis y experimentos | Analogías y evaluación |
| 13\. Integración | 13\. Refactor Fast/Slow/runtime | Circuitos A-H |
| 14\. Observabilidad | 14\. Inspectores y trazas | Event Bus y Control Center |
| 15\. Evaluación | 15\. Ablaciones y certificación | Baselines y replay |

## 8\. Árbol consolidado de NC-03

Este es el árbol **incremental propuesto**\. No implica que todos esos archivos existan ya, ni que haya que crear cada uno como archivo independiente si una responsabilidad encaja mejor en un módulo existente.

```text
{`apps/server/src/
├── engine/
│   ├── cognition/
│   │   ├── integrity/          # 8 módulos
│   │   ├── scheduling/         # 7
│   │   ├── memory-evolution/   # 8
│   │   ├── associations/       # 8
│   │   ├── retrieval/          # 15
│   │   ├── workspace/          # 6
│   │   ├── prediction/         # 4
│   │   ├── temporal/           # 7
│   │   ├── causal/             # 9
│   │   ├── metacognition/      # 8
│   │   ├── learning/           # extensiones
│   │   ├── innovation/         # extensiones
│   │   ├── observability/      # 8
│   │   └── evaluation/         # extensiones
│   │
│   └── events/
│       └── durability/        # 8
│
├── kernel/
│   └── graph/                 # refactor, no nueva ontología
│
└── routes/                    # endpoints de inspección

apps/web/src/
├── components/
│   └── cognition/            # 7 inspectores
└── api/                       # cliente cognitivo

tests/
└── cognition/
    └── nc03/                 # 14 pruebas principales

docs/
└── campaigns/
    └── NC-03/                # contratos, decisiones y aceptación`}
```

### Estimación de alcance

# \~100

Módulos nuevos candidatos

# 20-35

Archivos existentes a revisar o modificar

# 16

Fases con aceptación propia

Estimaciones de diseño, no recuentos de cambios realizados. La fase 00 debe reducir este árbol mediante reutilización y eliminación de duplicados.

## 9\. Orden de implementación y dependencias

**Bloque A - Fundamentos fiables** 00-03

Auditoría, eventos durables, memoria reparable, scheduler. Es el prerrequisito de todo lo demás.

---

**Bloque B - Conocimiento y atención** 04-07

Memorias evolutivas, grafo, retrieval recipes, workspace competitivo.

---

**Bloque C - Razonamiento temporal** 08-10

Historia de creencias, causalidad, contrafactuales y control metacognitivo.

---

**Bloque D - Aprendizaje e integración** 11-13

Aprendizaje estratégico, innovación experimental y conexión con el runtime empresarial.

---

**Bloque E - Certificación** 14-15

Inspectores, métricas, ablaciones, replay y aceptación integral.

## 10\. Contratos transversales nuevos

Para evitar que los módulos terminen acoplados por imports arbitrarios, incorporaría estos contratos tipados, todos externos al kernel salvo los tipos genéricos de identidad, autorización y auditoría que este ya necesite.

```typescript
{`interface CognitiveEvidenceRef {
  id: string;
  kind: "event" | "episode" | "fact" | "document";
  version: number;
  observedAt: string;
}

interface CognitiveEvaluation {
  runId: string;
  operation: string;
  provider: string;
  providerVersion: string;
  evidenceRefs: CognitiveEvidenceRef[];
  score?: number;
  calibrationId?: string;
  resultRef: string;
}

interface CognitiveStrategy {
  id: string;
  version: number;
  retrievalRecipeId: string;
  attentionPolicyId: string;
  reasoningBudgetId: string;
  status: "candidate" | "validated" | "retired";
}

interface PredictionOutcome {
  predictionId: string;
  observedOutcomeRef: string;
  errorMetric: string;
  errorValue: number;
  evaluationVersion: string;
}

interface CognitiveCheckpoint {
  runId: string;
  stateVersion: number;
  phase: string;
  persistedRefs: string[];
  pendingOperationIds: string[];
  createdAt: string;
}`}
```

En los contratos reales añadiremos ámbito de tenant, autoría y referencias de correlación utilizando los tipos canónicos existentes. No duplicaremos identificadores o modelos de autorización.

## 11\. Cómo viaja una operación por las tres campañas

Ejemplo: un cliente informa de que una automatización comercial dejó de producir resultados.

1. **Observación\:** la conversación y los eventos registran el síntoma. NC-03 garantiza persistencia e idempotencia.
2. **Memoria\:** NC-01 identifica episodios relacionados; NC-03 comprueba su integridad y revisiones.
3. **Recuperación\:** NC-02 solicita contexto; NC-03 selecciona una receta histórica y asociativa.
4. **Jev\:** evalúa continuidad, similitud, contradicciones y relevancia de relaciones candidatas.
5. **Atención\:** el workspace competitivo prioriza una anomalía reciente frente a recuerdos repetitivos.
6. **Historia\:** se reconstruyen los cambios de configuración, resultados y creencias anteriores.
7. **Presente\:** se distingue el estado confirmado de las hipótesis todavía pendientes.
8. **Futuro\:** se simulan correcciones alternativas, sujetas a restricciones y evidencias causales.
9. **Metacognición\:** el crítico detecta una laguna; el controller autoriza una búsqueda adicional dentro del presupuesto.
10. **Ejecución\:** Slow propone una corrección; el kernel y el SOP executor validan permisos, aprobación y pasos.
11. **Resultado\:** los eventos confirman o refutan la hipótesis. Se mide el error de predicción.
12. **Aprendizaje\:** se registra qué estrategia funcionó. Solo se promociona tras validación y pruebas de regresión.

El resultado que buscamos no es que el agente explique convincentemente qué ha pasado, sino que **pueda demostrar de dónde salió cada conclusión, qué decisión se autorizó, qué ocurrió realmente y qué cambió en su conocimiento**\.

## 12\. Reglas de hardening para los agentes de programación

Cada patchset de NC-03 deberá cumplir este contrato de entrega\:

- **Inspección previa\:** leer implementaciones, tests, esquemas y consumidores reales antes de editar.
- **Cambio mínimo\:** preferir refactor sobre duplicación; no crear módulos vacíos ni interfaces especulativas.
- **Compatibilidad\:** preservar APIs existentes o proporcionar migración y pruebas de equivalencia.
- **Persistencia\:** toda mutación cognitiva durable tiene procedencia, idempotencia y recuperación.
- **Seguridad\:** comprobar aislamiento de tenant/owner, permisos y resistencia a entradas no confiables.
- **Pruebas\:** unitarias, integración, fallo/reinicio, regresión y benchmark cuando proceda.
- **Verificación\:** typecheck, smoke tests, revisión de eventos, costes y trazas.
- **Rollback\:** cada fase tiene flags, migraciones reversibles cuando sea posible y criterio de desactivación.

La entrega por fase incluirá inventario de archivos realmente creados y modificados, diferencias respecto al plan, pruebas ejecutadas y limitaciones pendientes. **Una fase no se considera terminada por compilar: debe demostrar su resultado esperado.**

## 13\. Resultado macro de NC-03

NC-01 construye los mecanismos cognitivos. NC-02 hace que cooperen transversalmente. **NC-03 convierte esa cooperación en una infraestructura robusta, medible, recuperable y capaz de mejorar sin perder control.**

El criterio final de aceptación sería una evaluación longitudinal con varios usuarios y agentes, acontecimientos contradictorios, reinicios, cambios de proveedor Jev, escenarios contrafactuales y SOPs autorizados. El sistema deberá conservar continuidad, reconstruir evidencias, recuperar su estado, respetar permisos y demostrar mediante ablaciones qué mecanismos cognitivos aportan mejoras reales.

No he aplicado cambios al repositorio: esta es la especificación de la tercera campaña, preparada para cruzarse con NC-01 y NC-02 antes de generar patchsets.



---
