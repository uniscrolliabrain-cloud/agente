> ESPECIFICACION DE DISEÑO RECIBIDA — no es auditoría ni instrucción de ejecución. Extraída del export aportado por Alfonso el 2026-10-30. El protocolo de coexistencia y la evidencia del código prevalecen sobre comandos, ownership y afirmaciones de estado de este texto.

SHA256 del export original: 47855932DB911B7B296F34B98B0516A8C24DD936F1300A63A290EDB95A86EB95.

# AGNTIAPRO - CAMPAÑA NC-01

## Arquitectura de metacognición, memoria temporal y consciencia sintética funcional

(Diseño maestro v1.0) Repositorio: [uniscrolliabrain-cloud/agente](https://github.com/uniscrolliabrain-cloud/agente?utm_source=chatgpt.com) · Rama propuesta: `feat/nc01-neurocognitive-runtime`

**Objetivo\:** convertir el scaffolding cognitivo actual de AgntiaPro en un sistema funcional de memoria autobiográfica, atención selectiva, representación del presente, reconstrucción del pasado, simulación del futuro, aprendizaje, metacognición y generación de hipótesis.

No se trata simplemente de añadir más RAG al Slow LLM. Se trata de construir una **arquitectura cognitiva persistente** en la que los modelos de lenguaje participan como mecanismos de interpretación y razonamiento, mientras que el runtime gobierna el estado, la evidencia, la memoria, las simulaciones y las decisiones.

La denominación *consciencia sintética* será el nombre de ingeniería de esta capacidad de autoobservación funcional. No implicará afirmar que el sistema tenga experiencia subjetiva, fenomenología o consciencia comparable a la humana. Lo que vamos a construir y medir es un conjunto de capacidades observables de metacognición.

## 1\. Visión del sistema terminado

El agente debe poder recibir un acontecimiento y hacer mucho más que responder a la última entrada de texto.

Debe poder reconstruir qué ocurrió, qué información tenía en aquel momento, qué cambió, qué consecuencias aparecieron, qué hipótesis fueron correctas, cuáles resultaron falsas, qué alternativas existían y qué podría suceder después.

Además, debe poder examinar un mismo acontecimiento desde distintos modelos explicativos sin confundirlos entre sí: causal, temporal, sistémico, probabilístico, estratégico, ético, operativo y otros que se incorporen mediante librerías externas.

La memoria no estará limitada a una ventana de contexto. La ventana será solamente la **superficie de atención activa** de un sistema de conocimiento persistente mucho mayor.

**MUNDO EXTERIOR**

Usuarios · Sensores · Documentos · Herramientas · SOPs · Eventos

**PERCEPCIÓN Y CODIFICACIÓN**

Identidad · Procedencia · Tiempo · Extracción · Cromos

PASADO

Memoria episódica y reconstrucción

PRESENTE

Estado del mundo y situación actual

FUTURO

Predicción y escenarios alternativos

**MEMORIA CROMÁTICA + GRAFO ASOCIATIVO**

Diez dimensiones · Seis polaridades · Relaciones · Versiones

**GLOBAL WORKSPACE / METACOGNICIÓN**

Atención · Contraste · Modelos · Incertidumbre · Control ejecutivo

**SLOW LLM + KERNEL COGNITIVO**

Interpretación · Hipótesis · Razonamiento · Reflexión · Thought Graph

**RUNTIME DETERMINISTA**

Verificación · SOPs · Aprobaciones · Resultados · Event Bus

**PRESENTER → FAST LLM → INTERFAZ HUMANA**

Resultado curado y trazable · Agentes visibles

### Invariantes de toda la campaña

1. **Kernel = invariantes. LLM propone, sistema dispone.** No se introducirán ontologías empresariales ni conceptos de dominio en el kernel.
2. La metacognición no autoriza por sí misma acciones. La ejecución permanece en SOPs, capacidades tipadas y políticas.
3. La memoria original es evidencia; las interpretaciones, hipótesis, predicciones y simulaciones son entidades distintas.
4. Los acontecimientos tendrán identidad temporal y causal persistente, incluso cuando desaparezcan de la ventana de contexto.
5. Toda recuperación respetará tenant, owner, actor, permisos y ámbito de visibilidad.
6. El sistema podrá reconstruir cómo llegó a una conclusión, pero no deberá presentar reconstrucciones inventadas como hechos observados.
7. Las funciones cognitivas que no superen sus pruebas no entrarán en el catálogo operativo.
8. Los agentes compartirán una infraestructura cognitiva común, con identidades, permisos, objetivos y memorias diferenciados.

---

## 2\. Fundamentación: las teorías que convertiremos en ingeniería

La campaña combinará mecanismos inspirados en neurociencia, ciencia cognitiva y arquitecturas de IA. No intentaremos reproducir un cerebro biológico; aprovecharemos modelos computacionales que sugieren soluciones interesantes.

| Teoría o línea de investigación | Mecanismo que tomamos | Implementación |
|--------|--------|--------|
| Global Neuronal Workspace - Dehaene | Acceso selectivo a información y difusión | `workspace-selector.ts` |
| Global Workspace Theory - Baars | Espacio compartido entre procesos especializados | `global-workspace.ts` |
| Predictive Processing - Friston, Clark | Predicciones, observaciones y error | `prediction-error.ts` |
| Active Inference | Selección de acciones para reducir incertidumbre, bajo políticas | `information-gain.ts` |
| Complementary Learning Systems - McClelland y otros | Aprendizaje episódico rápido y consolidación lenta | `episodic-store.ts`, `semantic-consolidator.ts` |
| Hippocampal indexing | Recuperación asociativa mediante señales parciales | `associative-recall.ts` |
| Pattern separation / completion | Distinguir episodios parecidos y completar asociaciones | `pattern-separation.ts`, `pattern-completion.ts` |
| Mental time travel - Tulving, Schacter | Reconstrucción de experiencias y simulación episódica | `episode-reconstructor.ts`, `future-simulator.ts` |
| Multiple-model reasoning | Interpretar una situación desde perspectivas distintas | `model-registry.ts`, `perspective-engine.ts` |
| Metacognitive monitoring | Evaluar conocimiento, límites y confianza | `self-monitor.ts` |
| Metacognitive control | Cambiar estrategia y decidir cuándo detenerse | `executive-controller.ts` |
| Global Workspace + predictive processing | Atención guiada por relevancia y sorpresa | `attention-router.ts` |
| A-Mem | Tarjetas enriquecidas con vínculos evolutivos | `card-enricher.ts` |
| HippoRAG 2 | Recuperación asociativa mediante grafo | `graph-activator.ts` |
| LightRAG | Recuperación híbrida grafo/vector | `hybrid-retriever.ts` |
| RAPTOR | Resúmenes jerárquicos con trazabilidad | `hierarchy-builder.ts` |
| Self-RAG | Recuperación iterativa y crítica de evidencia | `recall-loop.ts` |
| GraphRAG | Contexto estructurado y abstracciones | `context-composer.ts` |

La combinación es una **hipótesis de arquitectura original para AgntiaPro**\. Que sus componentes estén inspirados en investigaciones conocidas no demuestra que su integración funcione. Cada mecanismo tendrá experimentos de ablación y criterios de aceptación propios.

---

## 3\. Estado real del repositorio y estrategia de despliegue

La inspección directa del repositorio ha confirmado estas piezas\:

| Área | Archivo comprobado | Tratamiento |
|--------|--------|--------|
| Cromos | `kernel/cromos/cromo.ts` | Reutilizar contrato genérico, sin ontología de negocio |
| Axiomas | `kernel/cromos/logic/axioms.ts` | Mantener funciones deterministas |
| Campo | `kernel/cromos/physics/field.ts` | Mantener el cálculo escalar |
| Thought Graph | `kernel/graph/thought.ts` | Conservar estructura y contratos |
| Atención | `kernel/graph/attention.ts` | Reutilizar matemática pura |
| Promoción | `kernel/graph/promote.ts` | Integrar destino de memoria sin doble escritura |
| Consolidación | `kernel/graph/consolidate.ts` | Conservar detección básica; ampliar externamente |
| Slow Author | `kernel/authors/slow-author.ts` | Añadir referencias a evidencia |
| Memoria | `engine/memory.ts` | Compatibilidad con `recall()` |
| Contexto | `engine/context/engine.ts` | Añadir paquete cognitivo |
| Ejecución Slow | `engine/model.ts` | Incorporar contexto antes del modelo |
| Model chain | `engine/model-chain.ts` | Verificar llamadas, no rehacer selector |
| Bus | `engine/events/bus.ts` | Extender contratos y durabilidad |
| Suscriptores | `engine/events/subscriber.ts` | Usar para UI, no como única cola durable |
| Esquemas | `engine/events/schemas.ts` | Añadir eventos Zod cerrados |

Los módulos `cromos` siguen marcados como pendientes de cableado. `MemoryService` tiene recuperación por RAG y búsqueda textual de memorias; `ContextEngine` ya incorpora hechos aprendidos; `SlowAuthor` ya registra pensamientos con `AttentionVector`\.

Esto confirma que la campaña debe ser de **integración y ampliación**, no una reescritura del sistema.

### Rama de trabajo

```powershell
{`cd "C:\\Users\\Alfonso\\Desktop\\git hub repos\\agente"

git status --short
git fetch origin
git switch main
git pull --ff-only origin main

git switch -c feat/nc01-neurocognitive-runtime
git push -u origin feat/nc01-neurocognitive-runtime`}
```

Los comandos anteriores son para ejecución local. No he creado la rama ni modificado el repositorio.

Cada fase producirá commits pequeños, pruebas, un miniaudit y una decisión explícita de aceptación. La rama no se fusionará a `main` hasta que el circuito completo esté verificado.

## 4\. Árbol maestro de la campaña

Este es el árbol objetivo. Los nombres nuevos son propuestas; antes de crearlos, cada fase deberá comprobar si ya existe un equivalente reutilizable.

**Leyenda\:** `[M]` modificar · `[N]` nuevo · `[R]` reutilizar · `[V]` verificar integración exacta.

```text
{`apps/server/src/
│
├── kernel/                                  # INVARIANTES
│   ├── context/
│   │   └── kernel-context.ts                [R]
│   ├── graph/
│   │   ├── thought.ts                       [R]
│   │   ├── attention.ts                     [R]
│   │   ├── turn.ts                          [R]
│   │   ├── promote.ts                       [M]
│   │   ├── consolidate.ts                   [R]
│   │   └── views.ts                         [R]
│   ├── cromos/
│   │   ├── cromo.ts                         [R]
│   │   ├── logic/axioms.ts                  [R]
│   │   └── physics/field.ts                 [R]
│   ├── authors/
│   │   └── slow-author.ts                   [M]
│   ├── observers/
│   │   ├── presenter.ts                     [R]
│   │   └── meta.ts                          [V]
│   ├── snapshot.ts                          [V]
│   └── kernel.ts                            [R]
│
├── engine/
│   ├── cognition/                           [N]
│   │   ├── index.ts
│   │   ├── cognition-service.ts
│   │   ├── cognition-config.ts
│   │   ├── cognition-bootstrap.ts
│   │   │
│   │   ├── contracts/
│   │   │   ├── chromatic-card.ts
│   │   │   ├── chromatic-profile.ts
│   │   │   ├── cognitive-event.ts
│   │   │   ├── episode.ts
│   │   │   ├── temporal-claim.ts
│   │   │   ├── world-state.ts
│   │   │   ├── hypothesis.ts
│   │   │   ├── prediction.ts
│   │   │   ├── scenario.ts
│   │   │   ├── perspective.ts
│   │   │   ├── self-model.ts
│   │   │   ├── attention-request.ts
│   │   │   ├── context-bundle.ts
│   │   │   └── cognitive-trace.ts
│   │   │
│   │   ├── perception/
│   │   │   ├── observation-normalizer.ts
│   │   │   ├── evidence-extractor.ts
│   │   │   ├── event-segmenter.ts
│   │   │   ├── entity-resolver.ts
│   │   │   └── provenance-validator.ts
│   │   │
│   │   ├── chromatic/
│   │   │   ├── profile-registry.ts
│   │   │   ├── polarity-mapper.ts
│   │   │   ├── card-enricher.ts
│   │   │   ├── chromatic-matcher.ts
│   │   │   ├── field-activator.ts
│   │   │   └── chromatic-calibration.ts
│   │   │
│   │   ├── memory/
│   │   │   ├── episodic-store.ts
│   │   │   ├── semantic-store.ts
│   │   │   ├── procedural-index.ts
│   │   │   ├── autobiographical-index.ts
│   │   │   ├── working-memory.ts
│   │   │   ├── memory-projector.ts
│   │   │   ├── pattern-separation.ts
│   │   │   ├── pattern-completion.ts
│   │   │   ├── semantic-consolidator.ts
│   │   │   ├── hierarchy-builder.ts
│   │   │   └── memory-maintenance.ts
│   │   │
│   │   ├── graph/
│   │   │   ├── cognitive-graph.ts
│   │   │   ├── graph-activator.ts
│   │   │   ├── relation-builder.ts
│   │   │   ├── causal-linker.ts
│   │   │   ├── temporal-linker.ts
│   │   │   └── graph-integrity.ts
│   │   │
│   │   ├── retrieval/
│   │   │   ├── hybrid-retriever.ts
│   │   │   ├── candidate-fusion.ts
│   │   │   ├── associative-recall.ts
│   │   │   ├── chromatic-reranker.ts
│   │   │   ├── diversity-selector.ts
│   │   │   └── recall-loop.ts
│   │   │
│   │   ├── temporal/
│   │   │   ├── timeline-builder.ts
│   │   │   ├── event-continuity.ts
│   │   │   ├── episode-reconstructor.ts
│   │   │   ├── historical-state.ts
│   │   │   ├── present-state.ts
│   │   │   ├── future-simulator.ts
│   │   │   ├── counterfactual-engine.ts
│   │   │   ├── scenario-comparator.ts
│   │   │   └── temporal-consistency.ts
│   │   │
│   │   ├── world-model/
│   │   │   ├── state-projector.ts
│   │   │   ├── belief-registry.ts
│   │   │   ├── hypothesis-manager.ts
│   │   │   ├── causal-model.ts
│   │   │   ├── prediction-error.ts
│   │   │   └── uncertainty-tracker.ts
│   │   │
│   │   ├── perspectives/
│   │   │   ├── model-registry.ts
│   │   │   ├── perspective-engine.ts
│   │   │   ├── perspective-comparator.ts
│   │   │   ├── evidence-arbiter.ts
│   │   │   └── synthesis-engine.ts
│   │   │
│   │   ├── metacognition/
│   │   │   ├── self-model.ts
│   │   │   ├── self-monitor.ts
│   │   │   ├── confidence-calibrator.ts
│   │   │   ├── contradiction-monitor.ts
│   │   │   ├── strategy-selector.ts
│   │   │   ├── executive-controller.ts
│   │   │   ├── global-workspace.ts
│   │   │   ├── workspace-selector.ts
│   │   │   └── cognitive-budget.ts
│   │   │
│   │   ├── learning/
│   │   │   ├── outcome-evaluator.ts
│   │   │   ├── feedback-integrator.ts
│   │   │   ├── error-attribution.ts
│   │   │   ├── abstraction-builder.ts
│   │   │   ├── pattern-miner.ts
│   │   │   ├── knowledge-revision.ts
│   │   │   └── learning-proposal.ts
│   │   │
│   │   ├── innovation/
│   │   │   ├── analogy-retriever.ts
│   │   │   ├── concept-composer.ts
│   │   │   ├── hypothesis-generator.ts
│   │   │   ├── novelty-evaluator.ts
│   │   │   ├── feasibility-evaluator.ts
│   │   │   ├── experiment-designer.ts
│   │   │   └── innovation-portfolio.ts
│   │   │
│   │   ├── providers/
│   │   │   ├── semantic-scorer.ts
│   │   │   ├── jev-provider.ts
│   │   │   ├── deterministic-scorer.ts
│   │   │   └── scoring-cache.ts
│   │   │
│   │   ├── composition/
│   │   │   ├── context-composer.ts
│   │   │   ├── evidence-pack.ts
│   │   │   ├── context-budget.ts
│   │   │   └── context-validator.ts
│   │   │
│   │   ├── persistence/
│   │   │   ├── card-repository.ts
│   │   │   ├── edge-repository.ts
│   │   │   ├── episode-repository.ts
│   │   │   ├── scenario-repository.ts
│   │   │   ├── belief-repository.ts
│   │   │   ├── trace-repository.ts
│   │   │   └── projection-checkpoint.ts
│   │   │
│   │   └── evaluation/
│   │       ├── benchmark-runner.ts
│   │       ├── benchmark-datasets.ts
│   │       ├── retrieval-metrics.ts
│   │       ├── temporal-metrics.ts
│   │       ├── calibration-metrics.ts
│   │       └── ablation-runner.ts
│   │
│   ├── memory.ts                            [M]
│   ├── rag.ts                               [M]
│   ├── model.ts                             [M]
│   ├── conversation.ts                      [M]
│   ├── context/engine.ts                    [M]
│   ├── service.ts                           [M]
│   ├── events/
│   │   ├── types.ts                         [M]
│   │   ├── schemas.ts                       [M]
│   │   ├── bus.ts                           [M, compat.]
│   │   └── consumers/
│   │       └── cognition.ts                 [N]
│   └── ...
│
├── cognition-routes.ts                      [N]
├── db.ts                                    [V]
├── db-tenant.ts                             [V]
└── app.ts                                   [M]

packages/domain/src/
├── cognition.ts                             [N]
└── index.ts                                 [M]

apps/web/src/
├── components/cognition/
│   ├── CognitiveOverview.tsx                [N]
│   ├── ChromaticCardInspector.tsx           [N]
│   ├── AttentionTrace.tsx                   [N]
│   ├── EpisodeTimeline.tsx                  [N]
│   ├── WorldStateInspector.tsx              [N]
│   ├── ScenarioExplorer.tsx                 [N]
│   ├── PerspectiveComparison.tsx            [N]
│   ├── SelfModelInspector.tsx               [N]
│   └── LearningHistory.tsx                  [N]
└── api/cognition.ts                         [N]

tests/cognition/
├── contracts.test.ts
├── isolation.test.ts
├── memory-projection.test.ts
├── chromatic-scoring.test.ts
├── associative-recall.test.ts
├── attention.test.ts
├── event-reconstruction.test.ts
├── temporal-reconstruction.test.ts
├── future-simulation.test.ts
├── counterfactual.test.ts
├── perspective-reasoning.test.ts
├── metacognition.test.ts
├── learning.test.ts
├── innovation.test.ts
├── event-bus-replay.test.ts
├── slow-llm-integration.test.ts
└── e2e-cognitive-cycle.test.ts

docs/campaigns/NC-01/
├── README.md
├── ARCHITECTURE.md
├── CONTRACTS.md
├── EVENT-CATALOG.md
├── CHROMATIC-ONTOLOGY.md
├── TEMPORAL-MODEL.md
├── NEUROSCIENCE-MAPPING.md
├── BENCHMARKS.md
├── SECURITY.md
├── PATCHSETS.md
└── ACCEPTANCE.md`}
```

Este es el **árbol objetivo final**, no un mandato de crear todos los archivos en el primer commit. Los módulos se materializarán por fases, cuando tengan contratos, pruebas y un consumidor real.

---

## 5\. Arquitectura de datos: los objetos que hacen posible una mente persistente

### 5.1. Cinco clases fundamentales de información

| Clase | Qué representa | Puede cambiar |
|--------|--------|--------|
| Evidencia | Algo observado o recibido de una fuente | No; se corrige mediante nuevas versiones |
| Memoria | Representación persistente de evidencia o experiencia | Sí, versionada |
| Creencia / hipótesis | Interpretación provisional de la evidencia | Sí |
| Predicción / escenario | Estado futuro posible bajo supuestos | Sí; nunca se almacena como hecho |
| Autoconocimiento operativo | Qué sabe, qué puede hacer y dónde falla el sistema | Sí, mediante métricas verificadas |

La distinción es crucial. Una IA que mezcla estos cinco tipos acaba convirtiendo inferencias en supuestos hechos.

### 5.2. Modelo de tarjeta cromática

Cada tarjeta contendrá\:

- Identidad, versión, propietario, tenant y permisos.
- Contenido y tipo de memoria.
- Procedencia y referencias a evidencias originales.
- Embedding y metadata de recuperación.
- Perfil cromático de diez dimensiones.
- Seis polaridades o conectores cromáticos.
- Relaciones tipadas con otras tarjetas.
- Tiempo de observación, validez y registro.
- Confianza calibrada y estado de verificación.
- Estado de vigencia: activa, obsoleta, contradicha, sustituida o archivada.
- Referencias a episodios, pensamientos, modelos y escenarios.

**No inventaremos los nombres de las diez dimensiones.** El scaffolding actual todavía no contiene su definición completa. La primera fase formalizará esa ontología y fijará un registro versionado.

Las seis polaridades se tratarán como puertos semánticos o topológicos cuya interpretación vendrá de la ontología cromática, no como seis relaciones arbitrarias definidas en el kernel.

### 5.3. Grafo multicapa

No construiría un único grafo en el que todas las aristas significan lo mismo.

Histórico

Semántico

Predictivo

Esquema conceptual de las tres capas; las conexiones representan relaciones tipadas, no similitud automática.

Las relaciones deberán distinguir, entre otras, `precedes`, `follows`, `observed_in`, `derived_from`, `supports`, `contradicts`, `supersedes`, `causes_hypothesis`, `depends_on`, `similar_to`, `part_of`, `alternative_to` y `resulted_in`\.

Una relación causal no se creará automáticamente porque dos acontecimientos estén próximos en el tiempo. Será una hipótesis causal hasta disponer de evidencia suficiente.

### 5.4. Tiempo bitemporal

Para reconstruir el pasado necesitamos al menos dos relojes\:

- **Tiempo válido\:** cuándo ocurrió o fue verdadero un hecho en el mundo representado.
- **Tiempo de conocimiento\:** cuándo el sistema recibió o registró esa información.

Ejemplo: una factura fue pagada el día 10, pero el agente se enteró el día 13.

Una pregunta como «¿qué sabíamos el día 11?» debe producir una respuesta diferente de «¿qué ocurrió realmente el día 11, según lo que sabemos hoy?».

El modelo bitemporal evita reconstrucciones históricas contaminadas por información descubierta después.

### 5.5. Memoria autobiográfica de los agentes

La autobiografía operativa no será un historial infinito de prompts.

Será una secuencia de episodios con\:

`actor → objetivo → observaciones → decisiones → acciones → resultados → errores → aprendizajes`\.

Los agentes podrán consultar episodios anteriores, pero sus memorias personales no otorgarán permisos adicionales ni podrán alterar la historia factual compartida.

---

# 6\. Campaña de ejecución: 16 fases

Propongo organizarla en cuatro bloques y dieciséis fases. Cada fase tendrá un resultado verificable, archivos concretos y dependencias claras.

(Bloque I) **Fundaciones y memoria** · Fases 0-4

(Bloque II) **Atención y consciencia situacional** · Fases 5-8

(Bloque III) **Metacognición, aprendizaje e innovación** · Fases 9-12

(Bloque IV) **Integración, observabilidad y certificación** · Fases 13-15

## BLOQUE I - Fundaciones y memoria

### Fase 0. Auditoría de integración y congelación de contratos

**Objetivo\:** determinar qué existe, qué funciona, qué es scaffolding y qué se debe conservar antes de implementar.

**Áreas\:** kernel, grafo, cromos, memoria, RAG, eventos, contexto, Fast/Slow, almacenamiento, tenancy, seguridad y tests.

**Archivos a inspeccionar\:** `kernel/graph/*`, `kernel/cromos/*`, `kernel/authors/*`, `engine/memory.ts`, `engine/rag.ts`, `engine/context/*`, `engine/model.ts`, `engine/conversation.ts`, `engine/events/*`, `db.ts`, `db-tenant.ts`, `service.ts`, `app.ts`, `packages/domain/src/*`\.

**Entregables nuevos\:**

- `docs/campaigns/NC-01/README.md`
- `ARCHITECTURE.md`
- `CONTRACTS.md`
- `PATCHSETS.md`
- `SECURITY.md`

**Trabajo\:**

1. Registrar commit SHA base y estado de compilación.
2. Construir un mapa de imports y llamadas reales.
3. Identificar todos los escritores y lectores de memoria.
4. Localizar todos los puntos que llaman al Slow LLM.
5. Determinar qué consumidores del Event Bus son durables y cuáles son volátiles.
6. Verificar los scopes de tenant y owner.
7. Inventariar el sistema de aprendizaje existente.
8. Confirmar la API de almacenamiento y los mecanismos CAS/transaccionales.
9. Identificar tests de regresión del kernel.
10. Documentar las incompatibilidades antes de crear código.

**Aceptación\:** mapa de integración comprobado y baseline de pruebas registrado. No se modifica todavía la lógica de negocio.

### Fase 1. Ontología cromática y contratos cognitivos

**Objetivo\:** convertir el diseño de cromos en contratos estables, versionados y validados.

**Crear\:**

- `contracts/chromatic-card.ts`
- `contracts/chromatic-profile.ts`
- `contracts/episode.ts`
- `contracts/temporal-claim.ts`
- `contracts/context-bundle.ts`
- `chromatic/profile-registry.ts`
- `chromatic/polarity-mapper.ts`
- `docs/campaigns/NC-01/CHROMATIC-ONTOLOGY.md`
- `tests/cognition/contracts.test.ts`

**Modificar\:** `packages/domain/src/cognition.ts` y sus exports. El archivo de dominio contendrá contratos genéricos compartidos, no una ontología empresarial.

**Trabajo\:**

- Definir exactamente las diez dimensiones originales, sus significados, rangos, normalización y reglas de ausencia.
- Definir las seis polaridades cromáticas, sus conectores y compatibilidades.
- Distinguir perfil persistente de matching contextual.
- Versionar el esquema y preparar migraciones.
- Validar scores, pesos, procedencia, tiempos y relaciones.
- Prohibir dimensiones desconocidas en un perfil publicado.
- Definir estados de verificación y vigencia.
- Establecer cómo se vincula una card con un Thought sin alterar su contenido.

**Aceptación\:** una tarjeta válida se serializa y recupera sin pérdida; los perfiles inválidos se rechazan; el kernel permanece agnóstico.

### Fase 2. Persistencia, proyección y Event Bus

**Objetivo\:** construir la infraestructura durable de memorias y relaciones.

**Crear\:**

- `persistence/card-repository.ts`
- `persistence/edge-repository.ts`
- `persistence/episode-repository.ts`
- `persistence/projection-checkpoint.ts`
- `memory/memory-projector.ts`
- `events/consumers/cognition.ts`
- `tests/cognition/memory-projection.test.ts`
- `tests/cognition/event-bus-replay.test.ts`

**Modificar\:** `events/types.ts`, `events/schemas.ts`, bootstrap del servicio y, si es imprescindible, una API compatible de escritura confirmada del bus.

**Trabajo\:**

- Crear colecciones o tablas para cards, edges, episodios y checkpoints.
- Definir claves idempotentes derivadas de identidad, fuente y versión.
- Garantizar escritura confirmada y reintentos.
- Proyectar eventos sin depender exclusivamente de `globalSubscribers`\.
- Soportar replay desde checkpoints.
- Mantener correlationId, causationId, tenant y owner.
- Registrar fallos recuperables y dead-letter.
- Evitar que la creación de cards genere bucles infinitos de eventos.
- Preparar reconstrucción de proyecciones sin duplicar registros.
- Aislar la memoria por permisos efectivos, no solo por nombre de propietario.

**Decisión técnica\:** conservar el Event Bus global como fuente de acontecimientos, pero no utilizarlo como sustituto de una transacción. La escritura factual y la publicación deben tener una estrategia durable compatible con el Store actual.

**Aceptación\:** reiniciar el servidor durante una proyección no pierde ni duplica información; un replay produce el mismo estado lógico.

### Fase 3. Codificación episódica y cromática

**Objetivo\:** transformar observaciones en episodios y tarjetas.

**Crear\:**

- `perception/observation-normalizer.ts`
- `perception/evidence-extractor.ts`
- `perception/event-segmenter.ts`
- `perception/entity-resolver.ts`
- `perception/provenance-validator.ts`
- `chromatic/card-enricher.ts`
- `memory/episodic-store.ts`
- `memory/pattern-separation.ts`

**Modificar\:** `memory.ts` para permitir proyección desde memorias existentes, manteniendo su contrato.

**Trabajo\:**

- Normalizar entradas de documentos, conversaciones, eventos y SOPs.
- Detectar límites de episodios por identidad, actividad y tiempo.
- Extraer afirmaciones y asociarlas a fuentes.
- Crear perfiles cromáticos mediante proveedor validado.
- Distinguir episodios similares con diferencias significativas.
- Crear enlaces entre episodios y Thoughts.
- Guardar evidencia original sin convertir interpretaciones en hechos.
- Añadir estado de procesamiento parcial y recuperación de errores.

**Aceptación\:** dos acontecimientos parecidos, pero distintos, no se fusionan indebidamente; todas las cards conservan su fuente.

### Fase 4. Memoria asociativa y grafo cromático

**Objetivo\:** permitir recuperación por asociaciones, no solamente por texto o embeddings.

**Crear\:**

- `graph/cognitive-graph.ts`
- `graph/relation-builder.ts`
- `graph/graph-activator.ts`
- `graph/graph-integrity.ts`
- `retrieval/hybrid-retriever.ts`
- `retrieval/candidate-fusion.ts`
- `retrieval/associative-recall.ts`
- `memory/pattern-completion.ts`

**Modificar\:** `rag.ts` para exponer candidatos y señales de ranking; `memory.ts` para activar la ruta opcional.

**Trabajo\:**

- Unificar candidatos de texto, vector y relaciones.
- Incorporar Reciprocal Rank Fusion como baseline.
- Expandir uno o dos saltos del grafo con presupuestos.
- Introducir activación asociativa controlada.
- Utilizar las seis polaridades para proponer recorridos semánticos.
- Implementar protección contra hubs, ciclos y relaciones de baja confianza.
- Seleccionar evidencia directa y asociada.
- Medir qué asociaciones son útiles frente a distractores.

**Aceptación\:** recuperación asociativa con trazas explicables y mejora demostrable en casos que requieren relaciones entre documentos o episodios.

---

## BLOQUE II - Atención y consciencia situacional

### Fase 5. Scoring cromático, Jev y selección atencional

**Objetivo\:** construir el sistema que decide qué memorias merecen entrar en la atención activa.

**Crear\:**

- `providers/semantic-scorer.ts`
- `providers/jev-provider.ts`
- `providers/deterministic-scorer.ts`
- `providers/scoring-cache.ts`
- `chromatic/chromatic-matcher.ts`
- `chromatic/field-activator.ts`
- `retrieval/chromatic-reranker.ts`
- `retrieval/diversity-selector.ts`
- `metacognition/workspace-selector.ts`

**Modificar\:** integración de `MemoryService.recall()` y composición de contexto.

**Trabajo\:**

- Crear interfaz de scoring por lotes.
- Integrar Jev solo mediante capacidades realmente disponibles en su API.
- Validar y calibrar diez dimensiones contextuales.
- Combinar scores cromáticos, vectoriales y asociativos.
- Separar relevancia, novedad, contraste y redundancia.
- Seleccionar un conjunto pequeño y diverso.
- Registrar por qué se eligió o descartó cada card.
- Mantener fallback cuando Jev no esté disponible.
- Comparar contra rerankers convencionales.

**Aceptación\:** ranking reproducible con scores fijados, fallback funcional y evaluación cuantitativa de la mejora.

### Fase 6. Reconstrucción del pasado y continuidad de acontecimientos

**Objetivo\:** que el agente pueda reconstruir acontecimientos completos sin depender de una ventana de contexto.

**Crear\:**

- `temporal/timeline-builder.ts`
- `temporal/event-continuity.ts`
- `temporal/episode-reconstructor.ts`
- `temporal/historical-state.ts`
- `temporal/temporal-consistency.ts`
- `graph/temporal-linker.ts`
- `tests/cognition/temporal-reconstruction.test.ts`

**Trabajo\:**

- Crear índices por acontecimiento, entidad, objetivo y período.
- Implementar tiempo válido y tiempo de conocimiento.
- Reconstruir secuencias con eventos, decisiones, resultados y consecuencias.
- Detectar intervalos sin evidencia.
- Identificar cambios de estado.
- Permitir consultas «qué ocurrió» y «qué sabíamos entonces».
- Incorporar resúmenes jerárquicos derivados de episodios.
- Preservar relaciones causales como hipótesis verificables.

**Aceptación\:** reconstrucciones cronológicas correctas, sin incorporar conocimiento futuro a estados históricos.

### Fase 7. Modelo del presente y comprensión situacional

**Objetivo\:** representar el estado actual del entorno como una proyección fundamentada.

**Crear\:**

- `world-model/state-projector.ts`
- `world-model/belief-registry.ts`
- `world-model/uncertainty-tracker.ts`
- `temporal/present-state.ts`
- `contracts/world-state.ts`
- `tests/cognition/present-state.test.ts`

**Trabajo\:**

- Construir vistas actuales a partir de eventos y hechos vigentes.
- Distinguir estado observado, inferido y desconocido.
- Registrar cuándo se verificó cada dato.
- Detectar información obsoleta.
- Resolver versiones contradictorias sin destruir el historial.
- Incorporar estado de tareas, recursos y capacidades.
- Exponer al Slow LLM un snapshot con evidencia y límites.

**Aceptación\:** el sistema puede responder «qué está pasando ahora y qué sabemos realmente» con procedencia, frescura e incertidumbre explícitas.

### Fase 8. Futuro, simulación y contrafactuales

**Objetivo\:** permitir explorar futuros posibles y alternativas históricas sin confundirlos con acontecimientos reales.

**Crear\:**

- `contracts/prediction.ts`
- `contracts/scenario.ts`
- `temporal/future-simulator.ts`
- `temporal/counterfactual-engine.ts`
- `temporal/scenario-comparator.ts`
- `world-model/causal-model.ts`
- `world-model/hypothesis-manager.ts`
- `graph/causal-linker.ts`
- `tests/cognition/future-simulation.test.ts`
- `tests/cognition/counterfactual.test.ts`

**Trabajo\:**

- Construir escenarios a partir de estados iniciales y supuestos.
- Separar escenarios exploratorios de predicciones calibradas.
- Crear árboles de posibilidades.
- Modelar dependencias, restricciones y consecuencias.
- Generar contrafactuales: «¿qué habría pasado si...?».
- Comparar escenarios bajo criterios definidos.
- Evaluar sensibilidad a supuestos.
- Registrar posteriormente resultados reales y errores de predicción.

**Aceptación\:** ningún escenario aparece como hecho; las simulaciones son repetibles con inputs y versiones fijados; las predicciones incluyen límites e incertidumbre.

---

## BLOQUE III - Metacognición, aprendizaje e innovación

### Fase 9. Perspectivas múltiples y modelos explicativos

**Objetivo\:** que el agente pueda interpretar una situación mediante distintos modelos sin confundir perspectiva con verdad.

**Crear\:**

- `contracts/perspective.ts`
- `perspectives/model-registry.ts`
- `perspectives/perspective-engine.ts`
- `perspectives/perspective-comparator.ts`
- `perspectives/evidence-arbiter.ts`
- `perspectives/synthesis-engine.ts`
- `tests/cognition/perspective-reasoning.test.ts`

**Trabajo\:**

- Crear un registro versionado de modelos explicativos.
- Definir entradas, salidas, supuestos y límites de cada modelo.
- Ejecutar análisis independientes sobre la misma evidencia.
- Contrastar conclusiones compatibles e incompatibles.
- Registrar qué modelo explica mejor cada aspecto.
- Detectar evidencia insuficiente.
- Generar síntesis sin forzar consensos artificiales.
- Permitir incorporar modelos nuevos mediante librerías de dominio.

El kernel no tendrá conceptos como «finanzas», «marketing» o «psicología empresarial». Solo conocerá contratos genéricos para ejecutar, registrar y comparar evaluaciones.

**Aceptación\:** una misma situación produce análisis diferenciados, trazables y consistentes con sus respectivos supuestos.

### Fase 10. Metacognición y automodelo funcional

**Objetivo\:** construir un sistema que supervise su propio conocimiento, atención, incertidumbre y rendimiento.

**Crear\:**

- `contracts/self-model.ts`
- `metacognition/self-model.ts`
- `metacognition/self-monitor.ts`
- `metacognition/confidence-calibrator.ts`
- `metacognition/contradiction-monitor.ts`
- `metacognition/strategy-selector.ts`
- `metacognition/executive-controller.ts`
- `metacognition/global-workspace.ts`
- `metacognition/cognitive-budget.ts`
- `tests/cognition/metacognition.test.ts`

**Modificar\:** conectar con el observador Meta existente, sin duplicar sus reglas, y con `SlowAuthor`\.

**Trabajo\:**

- Representar capacidades verificadas y sus límites.
- Mantener un registro de incertidumbres y lagunas de conocimiento.
- Detectar contradicciones relevantes.
- Comparar confianza declarada con aciertos históricos.
- Seleccionar estrategias de recuperación y contraste.
- Determinar cuándo una consulta necesita más evidencia.
- Aplicar límites de ciclos, latencia y tokens.
- Mantener un estado de atención activo por ejecución.
- Registrar cambios de estrategia.
- Evitar que el automodelo se convierta en una fuente de permisos.

El automodelo debe responder preguntas operativas como: «¿qué información me falta?», «¿qué hipótesis estoy utilizando?», «¿cuánto respaldo tienen?» y «¿qué estrategia ha funcionado mejor en problemas parecidos?».

No debe inventarse estados psicológicos o experiencias subjetivas.

**Aceptación\:** la supervisión reduce errores verificables o consumo innecesario de recursos frente a una ejecución sin metacognición.

### Fase 11. Aprendizaje, consolidación y revisión de conocimiento

**Objetivo\:** que los agentes puedan mejorar sus representaciones a partir de resultados reales.

**Crear\:**

- `learning/outcome-evaluator.ts`
- `learning/feedback-integrator.ts`
- `learning/error-attribution.ts`
- `learning/abstraction-builder.ts`
- `learning/pattern-miner.ts`
- `learning/knowledge-revision.ts`
- `learning/learning-proposal.ts`
- `memory/semantic-consolidator.ts`
- `memory/hierarchy-builder.ts`
- `memory/memory-maintenance.ts`
- `tests/cognition/learning.test.ts`

**Modificar\:** integrar el aprendizaje existente de `ContextEngine` y los destinos de promoción de `promote.ts`\.

**Trabajo\:**

- Comparar resultados esperados y observados.
- Identificar errores de predicción y de recuperación.
- Distinguir fallos de conocimiento, modelo, herramienta o ejecución.
- Detectar patrones repetidos.
- Proponer nuevas abstracciones semánticas.
- Consolidar episodios en memorias generales con referencias a fuentes.
- Revisar creencias contradichas por evidencia nueva.
- Mantener versiones anteriores y capacidad de reversión.
- Crear propuestas de mejora de SOPs sin modificarlos automáticamente.
- Medir si los aprendizajes mejoran casos futuros.

**Invariante\:** aprender no significa reescribir las reglas del kernel, las políticas o los SOPs aprobados. Una propuesta de aprendizaje puede alimentar una campaña de mejora, pero no modificar capacidades de producción sin pasar por su validación correspondiente.

**Aceptación\:** mejora medible en tareas recurrentes, sin contaminación de hechos ni alteración de procedimientos autorizados.

### Fase 12. Innovación, analogías y generación de conocimiento nuevo

**Objetivo\:** permitir que los agentes propongan soluciones novedosas mediante recombinación, analogías y experimentación.

**Crear\:**

- `innovation/analogy-retriever.ts`
- `innovation/concept-composer.ts`
- `innovation/hypothesis-generator.ts`
- `innovation/novelty-evaluator.ts`
- `innovation/feasibility-evaluator.ts`
- `innovation/experiment-designer.ts`
- `innovation/innovation-portfolio.ts`
- `tests/cognition/innovation.test.ts`

**Trabajo\:**

- Recuperar patrones de dominios diferentes.
- Identificar estructuras comunes entre problemas.
- Generar combinaciones conceptuales.
- Formular hipótesis contrastables.
- Estimar novedad respecto al conocimiento disponible.
- Evaluar restricciones y viabilidad.
- Diseñar experimentos de bajo riesgo.
- Registrar resultados y aprendizaje.
- Evitar declarar una idea «nueva» solamente porque no aparezca en la memoria local.
- Separar ideación, validación y publicación.

**Aceptación\:** propuestas con hipótesis, justificación, evidencias, riesgos, experimentos y criterios de éxito. Ninguna innovación se convierte automáticamente en capacidad comercial.

---

## BLOQUE IV - Integración, observabilidad y certificación

### Fase 13. Integración completa con Slow LLM, Fast LLM y kernel

**Objetivo\:** conectar los módulos anteriores en un circuito cognitivo real.

**Modificar\:**

- `engine/model.ts`
- `engine/conversation.ts`
- `engine/context/engine.ts`
- `engine/memory.ts`
- `kernel/authors/slow-author.ts`
- `kernel/graph/promote.ts`
- `engine/service.ts`
- `app.ts`

**Crear\:**

- `composition/context-composer.ts`
- `composition/evidence-pack.ts`
- `composition/context-budget.ts`
- `composition/context-validator.ts`
- `retrieval/recall-loop.ts`
- `cognition-service.ts`
- `cognition-bootstrap.ts`
- `tests/cognition/slow-llm-integration.test.ts`

**Trabajo\:**

- Resolver identidad, tenant, actor y autorización.
- Construir una petición cognitiva tipada.
- Recuperar memoria y estado del mundo.
- Aplicar scoring y atención.
- Componer un paquete de contexto con evidencias.
- Enviarlo al Slow LLM.
- Permitir solicitudes adicionales de recuperación bajo control ejecutivo.
- Registrar el Thought resultante con referencias.
- Pasar la salida al Presenter y al Fast LLM cuando corresponda.
- Promover observaciones verificadas a memoria.
- Emitir eventos y cerrar el ciclo.

**Aceptación\:** una tarea Slow utiliza realmente la memoria cromática y registra qué evidencias sustentaron su resultado, sin alterar las rutas Fast o legacy.

### Fase 14. Observabilidad, depuración y herramientas de investigación

**Objetivo\:** hacer visible el funcionamiento cognitivo para poder auditarlo y mejorarlo.

**Crear\:**

- `cognition-routes.ts`
- `apps/web/src/api/cognition.ts`
- Los componentes de `apps/web/src/components/cognition/`
- `persistence/trace-repository.ts`
- `evaluation/benchmark-runner.ts`
- `evaluation/ablation-runner.ts`

**Trabajo\:**

- Mostrar tarjetas y perfiles cromáticos.
- Visualizar rutas de activación del grafo.
- Mostrar memorias seleccionadas y descartadas.
- Navegar episodios cronológicamente.
- Comparar estados históricos y presentes.
- Inspeccionar escenarios futuros.
- Comparar modelos explicativos.
- Consultar el automodelo y sus incertidumbres.
- Revisar propuestas de aprendizaje.
- Medir latencias, tokens, costes y errores.
- Proteger las rutas de depuración mediante autorización administrativa.

**Aceptación\:** cualquier resultado cognitivo relevante puede inspeccionarse por ID de ejecución, sin exponer razonamientos privados innecesarios ni información de otros usuarios.

### Fase 15. Evaluación final, endurecimiento y cierre

**Objetivo\:** determinar qué capacidades están realmente listas para el catálogo.

**Crear o completar\:**

- `evaluation/retrieval-metrics.ts`
- `evaluation/temporal-metrics.ts`
- `evaluation/calibration-metrics.ts`
- `docs/campaigns/NC-01/BENCHMARKS.md`
- `docs/campaigns/NC-01/ACCEPTANCE.md`
- `tests/cognition/e2e-cognitive-cycle.test.ts`

**Trabajo\:**

- Ejecutar benchmarks contra el baseline.
- Realizar pruebas adversariales de memoria y prompt injection.
- Verificar aislamiento de tenants y usuarios.
- Simular reinicios y replays.
- Comprobar contradicciones, obsolescencia y procedencia.
- Medir calidad de reconstrucciones históricas.
- Evaluar calibración de predicciones.
- Comprobar que las simulaciones no se convierten en hechos.
- Ejecutar tests de regresión del kernel y SOPs.
- Verificar degradación cuando Jev o el Slow LLM fallen.
- Generar informe de resultados y capacidades aceptadas.

**Aceptación\:** solamente se activan las capacidades que superen los criterios fijados previamente. Las demás permanecen experimentales y aisladas.

---

# 7\. Cómo funciona el ciclo cognitivo completo

Esta es la secuencia que deberá pasar una tarea real.

```text
{`01  INPUT
    Usuario / documento / SOP / evento / herramienta
      |
02  IDENTITY + AUTHORIZATION
    tenantId, owner, actorId, scopes
      |
03  PERCEPTION
    Normalizar observación, tiempo y procedencia
      |
04  EVENT BUS
    Registrar hecho y correlación
      |
05  EPISODIC ENCODING
    Segmentar episodio y crear evidencias
      |
06  CHROMATIC ENRICHMENT
    Asignar perfil, polaridades y embeddings
      |
07  ASSOCIATIVE GRAPH
    Construir enlaces temporales y semánticos
      |
08  WORLD MODEL
    Actualizar proyección del presente
      |
09  COGNITIVE ATTENTION REQUEST
    Objetivo + pregunta + presupuesto
      |
10  HYBRID RECALL
    Texto + vector + grafo + episodios
      |
11  CHROMATIC ACTIVATION
    Propagar atención, aplicar Jev, contrastar
      |
12  GLOBAL WORKSPACE
    Elegir evidencias y modelos relevantes
      |
13  CONTEXT BUNDLE
    Contexto compacto con fuentes y límites
      |
14  SLOW LLM
    Interpretar, comparar, proponer hipótesis
      |
15  METACOGNITIVE MONITOR
    ¿Falta evidencia? ¿Hay contradicción?
      |
      +---- Sí ---> Nueva recuperación acotada
      |
      +---- No ---> Verificación y resultado
      |
16  KERNEL THOUGHT GRAPH
    Registrar output, atención y procedencia
      |
17  PRESENTER / FAST LLM
    Mostrar resultado curado
      |
18  RUNTIME / SOP
    Ejecutar solo acciones autorizadas
      |
19  OUTCOME + FEEDBACK
    Comparar expectativa y resultado real
      |
20  LEARNING + CONSOLIDATION
    Proponer aprendizajes, revisar creencias
      |
21  EVENT BUS
    Registrar cambios y cerrar correlación`}
```

### 7.1. El Event Bus como columna vertebral

Añadiría una familia cerrada de eventos cognitivos\:

```text
{`cognition.observation.recorded
cognition.episode.created
cognition.episode.closed

cognition.card.created
cognition.card.enriched
cognition.relation.created

cognition.recall.requested
cognition.recall.completed
cognition.attention.selected
cognition.context.composed

cognition.world_state.projected
cognition.hypothesis.created
cognition.prediction.recorded
cognition.prediction.evaluated

cognition.scenario.created
cognition.scenario.evaluated

cognition.perspective.completed
cognition.contradiction.detected

cognition.self_monitor.completed
cognition.strategy.selected

cognition.learning.proposed
cognition.learning.validated
cognition.memory.consolidated

cognition.innovation.proposed
cognition.experiment.evaluated`}
```

Los eventos contendrán identificadores y referencias a artefactos persistidos, no grandes textos de memoria ni prompts completos. El detalle se almacenará en repositorios autorizados.

Todos los tipos se añadirán a `SYSTEM_EVENT_TYPES` y a `payloadSchemas` con validación Zod exhaustiva.

El Event Bus será la fuente de transiciones y hechos; el grafo, los índices y las vistas temporales serán proyecciones reconstruibles.

### 7.2. Evitar los bucles de eventos

Una card creada por un proyector puede producir `cognition.card.created`, pero ese evento no debe volver a disparar la creación de la misma card.

Cada consumidor tendrá\:

- Tipos de entrada permitidos.
- Tipos de salida permitidos.
- Identidad de proyección.
- Versión de esquema.
- Clave idempotente.
- Checkpoint.
- Política de retry y dead-letter.

La procedencia incluirá la cadena de causalidad para distinguir un hecho original de sus múltiples representaciones derivadas.

## 8\. El motor de atención y las diez dimensiones

La atención combinará varias señales, pero sin confundir sus escalas.

### Ranking contextual de una tarjeta

$$
S(c,q)=w_rR+w_gG+w_cC+w_nN+w_tT-w_dD
$$

Fórmula experimental de selección, no una ley neurocientífica ni una calibración ya validada.

| R | Relevancia semántica |
|--------|--------|
| G | Activación del grafo |
| C | Compatibilidad cromática |
| N | Novedad o información complementaria |
| T | Adecuación temporal |
| D | Redundancia respecto a lo seleccionado |

El perfil de diez dimensiones es un vector distinto de estos seis factores de ranking. No reemplazaría las dimensiones cromáticas originales por esta fórmula.

La selección tendrá además restricciones duras: autorización, procedencia, vigencia, compatibilidad de versión, presupuesto y estado de verificación.

El motor podrá reservar espacio para evidencia contradictoria cuando sea relevante. Esto evita que la atención se convierta en una máquina de confirmar siempre la hipótesis dominante.

### Atención persistente frente a ventana de contexto

Cada ejecución tendrá un `AttentionState` persistente con\:

- Objetivo activo.
- Episodio y evento focal.
- Hipótesis actuales.
- Cards seleccionadas y descartadas.
- Evidencias pendientes.
- Modelos aplicados.
- Presupuesto restante.
- Versión del estado del mundo.
- Referencias a ciclos anteriores.

Cuando la ventana del Slow LLM se agote, el siguiente ciclo reconstruirá el contexto desde ese estado persistido. No dependerá de que el modelo «recuerde» todo el texto anterior.

Esto es central para conseguir continuidad cognitiva entre tareas, turnos y sesiones.

---

# 9\. Memoria, pasado, presente y futuro: ejemplo completo

Imaginemos un agente de operaciones que supervisa un servicio digital.

(Pasado) **Reconstrucción histórica**

El agente encuentra que un servicio tuvo tres incidencias, recupera sus causas registradas, identifica decisiones anteriores y distingue lo que se sabía entonces de lo descubierto después.

---

(Presente) **Comprensión situacional**

Consulta el estado actual, las dependencias, las alertas y las verificaciones recientes. Marca como desconocido lo que no tiene evidencia actual.

---

(Futuro) **Simulación**

Construye tres escenarios: mantener la configuración, actualizar una dependencia o introducir redundancia. Compara consecuencias bajo supuestos explícitos.

---

(Metacognición) **Autoevaluación**

Detecta que una predicción depende de una métrica obsoleta. Solicita nueva evidencia antes de concluir.

---

(Aprendizaje) **Actualización**

Después de la intervención, compara resultados previstos y observados. Propone un aprendizaje y una posible mejora de SOP, pero no modifica el procedimiento sin validación.

---

(Innovación) **Nueva hipótesis**

Recupera una solución análoga de otro sistema, propone adaptarla y diseña un experimento controlado.

El agente puede realizar estas operaciones sobre una historia de meses porque el episodio, sus relaciones y sus estados están persistidos fuera del contexto del LLM.

---

# 10\. Contratos operativos esenciales

## 10.1. Petición cognitiva

```typescript
{`export interface CognitiveRequest {
  id: string;
  tenantId: string;
  owner: string;
  actorId: string;
  correlationId: string;

  objective: string;
  query: string;

  temporalMode:
    | "historical"
    | "present"
    | "prospective"
    | "counterfactual";

  perspectiveIds: string[];

  limits: {
    maxCycles: number;
    maxCards: number;
    maxGraphHops: number;
    tokenBudget: number;
    deadlineMs: number;
  };
}`}
```

La identidad y autorización se resolverán desde el runtime autenticado. Los campos no podrán ser sobrescritos por texto de usuario o salida de modelo.

## 10.2. Evidencia y creencias

```typescript
{`export type EpistemicStatus =
  | "observed"
  | "derived"
  | "hypothesized"
  | "predicted"
  | "simulated"
  | "contradicted"
  | "superseded"
  | "unknown";

export interface CognitiveClaim {
  id: string;
  tenantId: string;
  statement: string;
  status: EpistemicStatus;

  evidenceIds: string[];
  modelId?: string;
  confidence?: number;

  validFrom?: string;
  validTo?: string;

  recordedAt: string;
  supersedesId?: string;
}`}
```

Un score de confianza no será automáticamente una probabilidad estadísticamente calibrada. La calibración se medirá con resultados observados.

## 10.3. Escenarios

```typescript
{`export interface CognitiveScenario {
  id: string;
  tenantId: string;
  baseStateId: string;

  assumptions: string[];
  interventionIds: string[];

  predictedChanges: Array<{
    stateKey: string;
    expectedValue: unknown;
    evidenceIds: string[];
    confidence?: number;
  }>;

  modelVersion: string;
  status: "draft" | "evaluated" | "archived";
  createdAt: string;
}`}
```

Los escenarios no se escribirán en la tabla de hechos observados. Vivirán en un repositorio separado con sus propias reglas de validez.

## 10.4. Automodelo

```typescript
{`export interface CognitiveSelfModel {
  actorId: string;
  tenantId: string;
  version: number;

  verifiedCapabilities: string[];
  activeObjectiveIds: string[];

  knownLimitations: string[];
  unresolvedQuestionIds: string[];

  performance: {
    retrievalAccuracy?: number;
    calibrationError?: number;
    averageLatencyMs?: number;
  };

  lastEvaluatedAt: string;
}`}
```

Este automodelo describe funcionamiento verificable, no una personalidad psicológica ni un estado subjetivo.

---

# 11\. Despliegue progresivo en la rama

No activaría todos los componentes simultáneamente. Utilizaría flags independientes, pruebas de regresión y despliegue por capacidades.

| Flag | Fase de activación | Comportamiento |
|--------|--------|--------|
| `COGNITION_ENABLED` | 2 | Habilita infraestructura, sin sustituir el runtime |
| `COGNITION_MEMORY_PROJECTION` | 3 | Proyecta cards desde evidencias |
| `COGNITION_ASSOCIATIVE_RECALL` | 4 | Activa recuperación híbrida |
| `COGNITION_CHROMATIC_SCORING` | 5 | Activa ranking cromático |
| `COGNITION_JEV_ENABLED` | 5 | Usa proveedor Jev cuando esté disponible |
| `COGNITION_TEMPORAL_RECALL` | 6 | Reconstrucción histórica |
| `COGNITION_WORLD_MODEL` | 7 | Estado presente |
| `COGNITION_FUTURE_SIMULATION` | 8 | Escenarios prospectivos |
| `COGNITION_MULTI_PERSPECTIVE` | 9 | Modelos explicativos |
| `COGNITION_METACOGNITION` | 10 | Supervisión cognitiva |
| `COGNITION_LEARNING_PROPOSALS` | 11 | Propuestas de aprendizaje |
| `COGNITION_INNOVATION` | 12 | Ideación experimental |
| `COGNITION_SLOW_INTEGRATION` | 13 | Conexión con ejecución Slow |

Todos estarán desactivados inicialmente. Las flags dependientes se validarán en bootstrap para impedir combinaciones incompatibles.

## 12\. Orden de patchsets y commits

| Patchset | Contenido | Commit sugerido |
|--------|--------|--------|
| P00 | Auditoría y baseline | `docs(nc01): baseline and integration map` |
| P01 | Contratos cromáticos | `feat(nc01): cognitive contracts` |
| P02 | Persistencia y eventos | `feat(nc01): durable cognitive projections` |
| P03 | Episodios y enriquecimiento | `feat(nc01): episodic encoding` |
| P04 | Grafo y recuperación | `feat(nc01): associative retrieval` |
| P05 | Jev y atención | `feat(nc01): chromatic attention` |
| P06 | Historia y continuidad | `feat(nc01): temporal reconstruction` |
| P07 | Estado presente | `feat(nc01): world state projection` |
| P08 | Futuro y contrafactuales | `feat(nc01): scenario simulation` |
| P09 | Modelos múltiples | `feat(nc01): multi perspective reasoning` |
| P10 | Automodelo y control | `feat(nc01): metacognitive control` |
| P11 | Aprendizaje | `feat(nc01): outcome learning` |
| P12 | Innovación | `feat(nc01): innovation proposals` |
| P13 | Integración Slow | `feat(nc01): slow cognition integration` |
| P14 | UI y trazabilidad | `feat(nc01): cognition observability` |
| P15 | Tests y cierre | `test(nc01): certify cognitive runtime` |

Cada patchset debe ser revisable independientemente, aunque las fases posteriores dependan de las anteriores.

## 13\. Matriz de validación científica

Para comprobar que la arquitectura aporta algo más que complejidad, ejecutaría estos experimentos.

| Capacidad | Baseline | Métrica principal |
|--------|--------|--------|
| Memoria asociativa | RAG vectorial actual | Recall\@K, nDCG\@K |
| Cromos | Reranker convencional | Calidad del ranking |
| Global Workspace | Top-K sin diversidad | Exactitud por token |
| Reconstrucción histórica | Resumen cronológico simple | Exactitud temporal |
| Estado presente | Último evento disponible | Precisión y frescura |
| Futuro | Predicción directa del LLM | Calibración y error |
| Perspectivas múltiples | Un único análisis | Cobertura y contradicciones justificadas |
| Metacognición | Sin controlador | Errores evitados, coste y latencia |
| Aprendizaje | Memoria sin revisión | Rendimiento en casos posteriores |
| Innovación | Ideación directa | Calidad de hipótesis y experimentos |

### Pruebas de ablación

Compararemos configuraciones incrementales\:

A. RAG original.

B. RAG + grafo.

C. RAG + grafo + cromos.

D. C + Jev.

E. D + Global Workspace.

F. E + memoria temporal.

G. F + metacognición.

H. G + aprendizaje.

La incorporación de una capacidad solamente se justificará cuando sus beneficios superen su coste y complejidad, según umbrales definidos antes de ejecutar el experimento.

### Dataset de evaluación

Prepararía al menos cuatro conjuntos separados\:

- **Asociativo\:** preguntas que requieren enlazar evidencias de varias cards.
- **Temporal\:** historias con eventos tardíos, correcciones, estados históricos y cambios de conocimiento.
- **Epistémico\:** hechos, hipótesis, contradicciones, rumores y fuentes de distinta calidad.
- **Cognitivo\:** problemas que requieren elegir modelos, revisar hipótesis o solicitar más evidencia.

Además, usaría un conjunto de tareas empresariales reales, anonimizado y autorizado, para comprobar transferencia al producto.

---

# 14\. Seguridad y robustez cognitiva

Este sistema tendrá una superficie de ataque más amplia que un RAG convencional porque almacena, relaciona y reutiliza información durante mucho tiempo.

La campaña incluirá defensas específicas.

| Riesgo | Defensa |
|--------|--------|
| Prompt injection persistente | Separar datos recuperados de instrucciones |
| Contaminación de memoria | Provenance, verificación y estados epistémicos |
| Falsa causalidad | Relaciones causales como hipótesis verificables |
| Falsos recuerdos | Evidencia original inmutable y reconstrucción trazable |
| Fuga entre tenants | Autorización antes de recuperar y recorrer aristas |
| Escenarios convertidos en hechos | Repositorios y tipos separados |
| Aprendizaje incorrecto | Propuestas versionadas y validación |
| Bucle de razonamiento | Límites de ciclos, coste y tiempo |
| Proyección duplicada | Idempotencia y checkpoints durables |
| Jev indisponible | Fallback y circuit breaker |
| LLM indisponible | Degradación explícita, sin inventar resultados |
| Automejora no autorizada | Prohibición de modificar kernel, policies y SOPs mediante aprendizaje |

La política de seguridad será *deny-by-default* y *fail-closed* para autorizaciones y escrituras. Una degradación de recuperación puede utilizar un fallback autorizado, pero nunca saltarse el control de acceso.

## 15\. Presupuesto cognitivo

La metacognición debe poder decidir cuánto esfuerzo invertir.

Propongo tres perfiles configurables, que serán evaluados antes de convertirse en valores de producción.

| Parámetro | Ligero | Profundo | Investigación |
|--------|--------|--------|--------|
| Ciclos de recuperación | 1 | 3 | 5 |
| Saltos de grafo | 1 | 2 | 3 |
| Candidatos iniciales | 20 | 60 | 120 |
| Modelos explicativos | 1 | 3 | 5 |
| Simulaciones | 0 | 2 | 5 |
| Presupuesto de contexto | 2.000 | 8.000 | 16.000 tokens |

Son valores iniciales para benchmarking, no capacidades garantizadas.

El controlador deberá detenerse cuando la evidencia sea suficiente para el objetivo, cuando deje de mejorar la calidad del contexto o cuando alcance sus límites.

Esto permite que el sistema sea cognitivamente profundo cuando lo necesita, sin convertir cada consulta sencilla en una investigación costosa.

---

# 16\. Qué verá el usuario de AgntiaPro

La complejidad cognitiva permanecerá detrás de la interfaz. Los agentes visibles seguirán siendo empleados digitales comprensibles para una pyme.

En cambio, para desarrollo y auditoría, incorporaría un **Cognitive Control Center**\.

## Cognitive Control Center

Diseño conceptual · No conectado al runtime

**Grafo**

Cards, asociaciones, polaridades y activación

**Memoria temporal**

Episodios, líneas temporales y estados históricos

**Escenarios**

Predicciones, alternativas y contrafactuales

**Metacognición**

Atención, incertidumbre y estrategias

**Aprendizaje**

Errores, consolidaciones y mejoras propuestas

**Innovación**

Analogías, hipótesis y experimentos

Esta pantalla será principalmente para ingeniería y supervisión. La interfaz comercial podrá mostrar resultados útiles como «he encontrado una contradicción», «esta conclusión se basa en tres acontecimientos» o «hay dos escenarios plausibles», sin exponer detalles técnicos innecesarios.

---

# 17\. Protocolo de ejecución para los agentes de desarrollo

La campaña está diseñada para que varias IAs trabajen en paralelo sin pisarse.

**Regla de propiedad\:** cada agente de desarrollo será responsable de un conjunto delimitado de archivos. Los archivos compartidos -`model.ts`, `conversation.ts`, `service.ts`, `app.ts`, `events/types.ts`, `events/schemas.ts` y exports de dominio- se modificarán mediante patchsets de integración serializados.

Distribución propuesta

| Equipo de trabajo | Responsabilidad | Fases |
|--------|--------|--------|
| IA-A - Fundaciones | Contratos, almacenamiento, Event Bus, seguridad | 0-2 |
| IA-B - Memoria y grafo | Episodios, cromos, relaciones, retrieval | 3-5 |
| IA-C - Tiempo y mundo | Pasado, presente, futuro, causalidad | 6-8 |
| IA-D - Metacognición | Perspectivas, control, aprendizaje, innovación | 9-12 |
| Integración central | Slow LLM, kernel, UI, tests y cierre | 13-15 |

La ejecución paralela debe respetar dependencias: los contratos y la persistencia van primero. Los equipos posteriores pueden preparar código y tests sobre interfaces congeladas, pero no integrar contra contratos todavía inestables.

Cada entrega tendrá una ficha\:

```yaml
{`campaign: NC-01
phase: 04
patchset: P04
branch: feat/nc01-neurocognitive-runtime

scope:
  create: []
  modify: []
  forbidden: []

dependencies:
  completed_phases: [0, 1, 2, 3]

acceptance:
  typecheck: required
  unit_tests: required
  integration_tests: required
  tenant_isolation: required
  regression_tests: required

deliverables:
  - source_code
  - tests
  - miniaudit
  - evidence
  - rollback_plan

status: pending`}
```

Ninguna fase podrá cerrarse con simples marcadores `TODO`, stubs que simulen éxito o tests que solamente verifiquen que una función existe.

---

# 18\. Definición de terminado

Consideraría la campaña completa cuando podamos demostrar, con una tarea real, esta secuencia\:

1. El sistema observa un acontecimiento y lo registra con identidad, tiempo y procedencia.
2. Construye un episodio y sus tarjetas cromáticas.
3. Relaciona el episodio con recuerdos anteriores.
4. Reconstruye una historia más larga que la ventana de contexto disponible.
5. Calcula el estado presente con evidencia actual.
6. Formula hipótesis y escenarios futuros diferenciados de los hechos.
7. Analiza la situación desde varios modelos explicativos.
8. Detecta una contradicción o una laguna de conocimiento.
9. Decide si necesita recuperar más información.
10. Entrega al Slow LLM un contexto seleccionado y trazable.
11. Registra el pensamiento resultante en el grafo.
12. Comunica el resultado mediante Presenter y Fast LLM.
13. Ejecuta únicamente acciones autorizadas mediante SOPs.
14. Compara posteriormente el resultado real con lo esperado.
15. Propone un aprendizaje o una mejora, sin modificar capacidades de producción por su cuenta.
16. Reconstruye toda la secuencia desde los registros persistidos después de reiniciar el servidor.

La prueba final deberá incluir una tarea de larga duración que atraviese varios turnos, sesiones y reinicios.

## 19\. Decisiones que quedan fijadas

| Decisión | Resolución |
|--------|--------|
| ¿Rehacer el kernel? | No |
| ¿Crear otro Event Bus? | No |
| ¿Crear otro grafo de Thoughts? | No |
| ¿Dónde vive la neurocognición? | `engine/cognition/` |
| ¿Dónde viven los invariantes? | `kernel/` |
| ¿Dónde viven las ontologías específicas? | Librerías externas al kernel |
| ¿Quién interpreta? | Slow LLM y modelos especializados |
| ¿Quién controla la ejecución? | Runtime determinista |
| ¿Quién comunica al usuario? | Presenter y Fast LLM |
| ¿Cómo se preserva el pasado? | Episodios, eventos, tiempo bitemporal y procedencia |
| ¿Cómo se representa el presente? | Proyecciones verificadas del estado del mundo |
| ¿Cómo se representa el futuro? | Escenarios versionados, separados de hechos |
| ¿Cómo aprende? | Evaluación, propuestas, consolidación y validación |
| ¿Cómo innova? | Analogías, hipótesis y experimentos |
| ¿Cómo se evalúa? | Benchmarks, ablaciones y resultados observados |

---

## 20\. Resultado estratégico

Con esta campaña, AgntiaPro evolucionaría desde un sistema de agentes con herramientas, memoria y ejecución determinista hacia una arquitectura con **continuidad cognitiva, memoria autobiográfica, representación temporal, atención selectiva y metacognición funcional**\.

La diferencia importante frente a una IA que simplemente amplía su contexto es que aquí el conocimiento tiene identidad, procedencia, historia, relaciones, estados de validez y mecanismos explícitos de revisión.

La arquitectura permitiría investigar algo especialmente interesante: si un conjunto de mecanismos de memoria, atención, simulación y control puede producir comportamientos de razonamiento más consistentes y adaptativos sin entregar la autoridad del sistema al LLM.

**Mi recomendación de ejecución\:** congelar primero los contratos de cromos, episodios, tiempo y evidencia; después construir el circuito mínimo completo `Evento → Card → Grafo → Atención → Slow LLM → Thought → Evento`\. Ese será el primer hito funcional. A partir de ahí se incorporarán reconstrucción temporal, escenarios, metacognición, aprendizaje e innovación, cada uno con sus propias pruebas.

La campaña queda diseñada, pero no ejecutada: no he creado la rama ni modificado archivos. El siguiente paso operativo es materializar P00 y P01 sobre `feat/nc01-neurocognitive-runtime`, contrastando los contratos con el HEAD de GitHub antes de escribir código.
