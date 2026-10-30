> ESPECIFICACION DE DISEÑO RECIBIDA — no es auditoría ni instrucción de ejecución. Extraída del export aportado por Alfonso el 2026-10-30. El protocolo de coexistencia y la evidencia del código prevalecen sobre comandos, ownership y afirmaciones de estado de este texto.

SHA256 del export original: 47855932DB911B7B296F34B98B0516A8C24DD936F1300A63A290EDB95A86EB95.

# AGNTIAPRO - CAMPAÑA NC-02

## Arquitectura transversal de cognición, Jev distribuido y resultados emergentes

Documento complementario de NC-01 · Diseño funcional y de integración · Rama propuesta: `feat/nc01-neurocognitive-runtime`

**Propósito de esta segunda campaña\:** explicar no solamente qué módulos construiremos, sino **qué capacidades esperamos obtener, por qué deberían aparecer, cómo interactuarán los mecanismos y cómo circulará la información por todo el repositorio existente**\.

NC-01 define los componentes y su construcción. NC-02 define su comportamiento conjunto, los resultados esperados, los mecanismos causales que intentaremos comprobar y los contratos que permitirán conectar todas las fases.

También amplía considerablemente el papel de **Jev System One**\. No será un reranker situado al final del RAG. Será una capacidad semántica transversal, disponible para distintos nodos del circuito cognitivo, sin convertirse en una autoridad autónoma ni sustituir las reglas deterministas.

## 1\. El resultado macroscópico que buscamos

Queremos que los agentes de AgntiaPro desarrollen una **continuidad cognitiva funcional**\: una capacidad para relacionar lo que sucede ahora con experiencias anteriores, construir modelos del entorno, anticipar consecuencias, detectar errores, revisar interpretaciones y proponer nuevas soluciones.

La diferencia respecto a un agente que simplemente llama a un LLM con memoria recuperada será la organización de esos procesos.

## Seis capacidades macroscópicas

**Continuidad autobiográfica**

Recordar acontecimientos completos, decisiones y consecuencias entre sesiones.

**Comprensión situacional**

Representar qué sucede, qué se sabe y qué permanece incierto.

**Prospección**

Imaginar futuros alternativos y evaluar sus supuestos.

**Metacognición**

Evaluar estrategias, incertidumbre y suficiencia de evidencia.

**Aprendizaje acumulativo**

Convertir resultados verificados en conocimiento reutilizable.

**Innovación estructurada**

Transferir patrones, generar hipótesis y diseñar experimentos.

Estas capacidades no constituyen una prueba de consciencia fenomenológica. Constituyen una definición operativa de lo que llamaremos **metacognición sintética**\: procesos que monitorizan y regulan otros procesos cognitivos mediante estados persistentes, evidencia y reglas explícitas.

### El cambio de paradigma

ARQUITECTURA CONVENCIONAL

Prompt

RAG

LLM

Respuesta

AGNTIAPRO NC-02

Observación + Historia

Modelos + Memoria + Jev

Workspace + Slow LLM

Resultados + Aprendizaje

Comparación conceptual: los agentes actuales pueden implementar ciclos y memoria; aquí la novedad propuesta es formalizar y verificar la integración transversal.

La arquitectura no pretende sustituir el razonamiento del modelo por reglas rígidas. Pretende darle una infraestructura de conocimiento, continuidad y evaluación que el modelo por sí solo no garantiza.

---

# 2\. Jev como sistema semántico transversal

En NC-01 situamos Jev principalmente en el enriquecimiento cromático y el ranking de memorias. Eso resulta demasiado limitado para el objetivo completo.

En NC-02, Jev tendrá presencia en **percepción, codificación, relaciones, recuperación, atención, tiempo, modelos del mundo, metacognición, aprendizaje e innovación**\.

No significa ejecutar Jev en cada evento o cada nodo. Significa que cada etapa tendrá la posibilidad de solicitar una evaluación semántica tipada cuando su utilidad supere el coste.

## 2.1. Separación de responsabilidades

**Jev**

Evalúa significado y compatibilidad

**Slow LLM**

Interpreta, razona y formula hipótesis

**Runtime**

Valida, gobierna y ejecuta

**Jev no será un segundo LLM conversacional ni un controlador de procesos.** Será un proveedor de evaluaciones semánticas multidimensionales, con contratos de entrada y salida explícitos.

Su API real deberá comprobarse antes de implementar el adaptador. Las capacidades descritas aquí son las que queremos solicitarle; no doy por hecho que todas estén disponibles nativamente. Las operaciones no soportadas se construirán con composición de señales, otros modelos o funciones deterministas, y se distinguirán claramente de las operaciones propias de Jev.

## 2.2. Los doce puntos de intervención de Jev

| Nodo cognitivo | Pregunta que Jev ayudaría a responder | Resultado esperado |
|--------|--------|--------|
| 1\. Percepción | ¿Qué significa esta observación? | Etiquetas y candidatos semánticos |
| 2\. Segmentación | ¿Pertenece al mismo acontecimiento? | Continuidad episódica |
| 3\. Cromos | ¿Cómo se expresa en las diez dimensiones? | Perfil cromático |
| 4\. Grafo | ¿Qué tipo de relación puede existir? | Aristas candidatas |
| 5\. Recuperación | ¿Qué memorias son pertinentes? | Ranking contextual |
| 6\. Atención | ¿Qué evidencia aporta más información? | Priorización |
| 7\. Pasado | ¿Qué episodios se refieren al mismo proceso? | Reconstrucción semántica |
| 8\. Presente | ¿Qué observaciones describen el mismo estado? | Conciliación de señales |
| 9\. Futuro | ¿Qué escenarios son semánticamente compatibles con los supuestos? | Filtrado de incoherencias |
| 10\. Perspectivas | ¿Qué conceptos son comparables entre modelos? | Correspondencias |
| 11\. Aprendizaje | ¿Qué patrón se repite entre experiencias? | Abstracciones candidatas |
| 12\. Innovación | ¿Qué analogías entre dominios merecen explorarse? | Combinaciones prometedoras |

La detección semántica de una relación no demuestra que la relación sea verdadera. Por ejemplo, Jev podría identificar dos episodios como causalmente relacionados en el lenguaje, pero el sistema deberá conservar esa relación como hipótesis hasta verificarla.

## 2.3. El Jev Semantic Fabric

En lugar de que doce módulos llamen directamente a Jev, crearía una capa compartida.

**Servicios cognitivos**

Perception · Memory · Graph · Time · Workspace · Learning · Innovation

**Semantic Evaluation Gateway**

Operación tipada · Batching · Caché · Presupuesto · Versionado

**Jev Adapter**

Capacidades confirmadas del proveedor

**Fallback Adapter**

Heurísticas, embeddings y otros evaluadores

**SemanticEvaluation**

Scores · Explicación acotada · Modelo · Confianza · Provenance

### Archivos adicionales de NC-02

```text
{`apps/server/src/engine/cognition/
├── semantic/
│   ├── semantic-gateway.ts
│   ├── operation-registry.ts
│   ├── semantic-evaluation.ts
│   ├── evaluation-policy.ts
│   ├── batch-scheduler.ts
│   ├── score-normalizer.ts
│   ├── calibration-registry.ts
│   ├── semantic-cache.ts
│   ├── provider-health.ts
│   └── evaluation-trace.ts
│
├── providers/
│   ├── semantic-scorer.ts        # NC-01, ampliar
│   ├── jev-provider.ts           # NC-01, ampliar
│   └── deterministic-scorer.ts   # NC-01, ampliar
│
└── evaluation/
    ├── jev-ablation.ts
    ├── semantic-calibration.ts
    └── semantic-cost-report.ts`}
```

El gateway permitirá reutilizar Jev sin que los servicios conozcan su API concreta.

### Contrato de evaluación

```typescript
{`type SemanticOperation =
  | "chromatic_profile"
  | "semantic_similarity"
  | "episode_continuity"
  | "relation_candidate"
  | "contextual_relevance"
  | "evidence_novelty"
  | "temporal_alignment"
  | "perspective_alignment"
  | "pattern_similarity"
  | "analogy_candidate"
  | "semantic_consistency";

interface SemanticEvaluationRequest {
  requestId: string;
  tenantId: string;
  actorId: string;
  operation: SemanticOperation;

  subjectIds: string[];
  contextRefIds: string[];

  ontologyVersion: string;
  priority: "interactive" | "background";
  deadlineMs: number;
}

interface SemanticEvaluation {
  requestId: string;
  operation: SemanticOperation;

  provider: string;
  modelVersion: string;
  calibrationVersion: string;

  scores: Record<string, number>;
  candidateRelationIds?: string[];

  status: "evaluated" | "fallback" | "unavailable";
  traceId: string;
}`}
```

Este contrato representa una interfaz objetivo. Cada operación deberá declarar qué proveedor puede implementarla, qué dimensiones devuelve y cómo se valida.

**Importante\:** no combinaría scores de distintos modelos como si fueran directamente equivalentes. Se calibrarán por operación, versión, distribución de datos y benchmark.

# 3\. Los procesos transversales: cómo viaja la cognición por el repositorio

La arquitectura necesita distinguir tres tipos de flujo que cooperan, pero no son intercambiables.

**Flujo factual\:** registra acontecimientos, observaciones, acciones y resultados.

**Flujo cognitivo\:** interpreta esos datos, recupera asociaciones, construye modelos y genera hipótesis.

**Flujo ejecutivo\:** convierte decisiones autorizadas en tareas, SOPs y operaciones verificables.

Estos flujos se encuentran mediante referencias, eventos y contratos, no mediante una única cadena gigante de llamadas.

## 3.1. Circuito A - Del mundo exterior a la memoria persistente

```text
{`HTTP / Chat / Documento / SOP / Tool Result
    |
    v
apps/server/src/routes/* o conversation.ts
    |
    v
Authentication + Tenant Context
    |
    v
engine/events/bus.ts
    |
    +--> StoreSink / Event Log
    |
    +--> Durable Cognition Projector
              |
              v
        perception/observation-normalizer.ts
              |
              +--> Jev: clasificación semántica
              |
              v
        perception/event-segmenter.ts
              |
              +--> Jev: continuidad episódica
              |
              v
        memory/episodic-store.ts
              |
              v
        chromatic/card-enricher.ts
              |
              +--> Jev: diez dimensiones
              |
              v
        graph/relation-builder.ts
              |
              +--> Jev: relaciones candidatas
              |
              v
        persistence/card-repository.ts
        persistence/edge-repository.ts
              |
              v
        cognition.card.enriched
        cognition.relation.created`}
```

**Resultado macroscópico\:** cada experiencia puede convertirse en una representación persistente y conectada, sin exigir que el LLM vuelva a leer toda la conversación.

**Cómo se consigue\:** el evento original conserva la procedencia; los proyectores crean representaciones derivadas; Jev aporta propuestas semánticas; Zod, políticas y repositorios controlan lo que se acepta.

**Dónde se conecta con el repo\:** `conversation.ts`, rutas de tareas, resultados del executor, `events/bus.ts`, `memory.ts`, Store y los módulos nuevos de `engine/cognition`\.

**Punto de atención\:** los mensajes de usuario no son automáticamente hechos del mundo. Una afirmación recibida se almacena como afirmación atribuida a una fuente, con su estado de verificación.

## 3.2. Circuito B - De la memoria al Slow LLM

```text
{`engine/model.ts
    |
    v
engine/context/engine.ts
    |
    v
engine/memory.ts
    |
    v
cognition/cognition-service.ts
    |
    +--> RAG actual
    +--> Episodic Store
    +--> Semantic Store
    +--> Graph Activator
    +--> Historical State
    +--> Present World State
    |
    v
semantic/semantic-gateway.ts
    |
    +--> Jev: contextual relevance
    +--> Jev: chromatic compatibility
    +--> Jev: evidence novelty
    |
    v
metacognition/workspace-selector.ts
    |
    v
composition/context-composer.ts
    |
    v
CognitiveContextBundle
    |
    v
Slow LLM
    |
    v
kernel/authors/slow-author.ts
    |
    v
Thought Graph + Provenance`}
```

**Resultado macroscópico\:** el Slow LLM recibe la evidencia más útil para la tarea, incluyendo conexiones que no aparecían en la consulta original.

**Cómo se consigue\:** la recuperación produce un conjunto amplio de candidatos; Jev evalúa compatibilidad contextual; el grafo incorpora asociaciones; el selector de workspace construye un conjunto pequeño, diverso y autorizado.

**Dónde se conecta\:** `engine/context/engine.ts` mantiene `ContextPackage`; `memory.ts` mantiene `RecallResult`; `model.ts` recibe un paquete adicional; `slow-author.ts` registra referencias a evidencias utilizadas.

La primera versión debe mantener compatibilidad con las rutas anteriores. La integración cromática se activará por feature flag.

## 3.3. Circuito C - Del Slow LLM a la nueva atención

Este circuito es el núcleo de la metacognición.

```text
{`Slow LLM
    |
    v
Structured Cognitive Output
    |
    +--> Hypothesis
    +--> Evidence Gap
    +--> Contradiction Candidate
    +--> Recall Request
    +--> Proposed Answer
    |
    v
metacognition/self-monitor.ts
    |
    +--> Jev: semantic consistency
    |
    v
metacognition/executive-controller.ts
    |
    +--> Evidence sufficient?
    +--> Budget available?
    +--> Another retrieval useful?
    |
    +---- YES ----> New AttentionRequest
    |                    |
    |                    v
    |              Hybrid Retrieval
    |                    |
    |                    v
    |              ContextBundle vN+1
    |                    |
    |                    v
    |                 Slow LLM
    |
    +---- NO -----> Verified / Qualified Result`}
```

**Resultado macroscópico\:** el agente puede reconocer que necesita más información antes de responder, en lugar de limitarse a una única generación.

**Cómo se consigue\:** el Slow LLM propone necesidades informativas estructuradas; el monitor verifica su coherencia; el controlador decide si procede otro ciclo.

El controlador no confiará en la autodeclaración del modelo de que «ya sabe suficiente». Utilizará criterios externos: cobertura de evidencias, contradicciones abiertas, requisitos de la tarea, límites de tiempo y presupuesto.

El sistema tampoco necesita almacenar razonamiento privado detallado. Persistirá hipótesis explícitas, solicitudes, referencias y resultados verificables.

## 3.4. Circuito D - Reconstrucción temporal completa

```text
{`User asks:
"Reconstruye todo lo ocurrido con X"
    |
    v
CognitiveRequest(mode=historical)
    |
    v
Event / Episode / Card Search
    |
    +--> Jev: event identity matching
    +--> Jev: episode continuity
    |
    v
Temporal Graph Expansion
    |
    v
Bitemporal Timeline
    |
    +--> What happened?
    +--> What was known then?
    +--> What was discovered later?
    +--> Which decisions were made?
    +--> What consequences followed?
    |
    v
Evidence Gap Detector
    |
    v
Historical ContextBundle
    |
    v
Slow LLM + Perspective Models
    |
    v
Attributed Historical Reconstruction`}
```

**Resultado macroscópico\:** un agente puede reconstruir un acontecimiento completo a partir de decenas, cientos o miles de registros distribuidos.

La palabra *completo* tiene aquí un significado preciso: recuperar todas las partes pertinentes **disponibles y autorizadas**, señalando lagunas. No significa reconstruir mágicamente información que nunca se observó.

**Cómo se consigue\:** identidad de episodio, índices temporales, relaciones entre eventos, resúmenes jerárquicos y recuperación iterativa. Jev ayuda a identificar continuidad semántica cuando los registros utilizan vocabularios diferentes.

La reconstrucción final distinguirá evidencia directa, inferencia y desconocimiento.

## 3.5. Circuito E - Comprensión del presente

```text
{`Latest Events + Valid Historical Facts
    |
    v
world-model/state-projector.ts
    |
    +--> Jev: entity/state alignment
    |
    v
Conflict and Freshness Checks
    |
    v
PresentState Snapshot
    |
    +--> Observed
    +--> Inferred
    +--> Unknown
    +--> Stale
    |
    v
Global Workspace
    |
    v
Slow LLM`}
```

**Resultado macroscópico\:** el agente dispone de una representación coherente de la situación actual y puede diferenciar lo confirmado de lo supuesto.

**Cómo se consigue\:** proyecciones de estado, vigencia temporal, conciliación de señales y procedencia. Jev puede sugerir que dos observaciones se refieren a la misma entidad o condición, pero no resolverá por sí solo conflictos de autoridad entre fuentes.

Este modelo del presente se actualizará mediante eventos y también podrá reconstruirse desde el historial.

## 3.6. Circuito F - Simulación de futuros

```text
{`PresentState + Objective
    |
    v
Hypothesis Manager
    |
    v
Scenario Generator
    |
    +--> Jev: semantic compatibility
    +--> Analogous historical cases
    |
    v
Constraints + Causal Assumptions
    |
    v
Future Simulator
    |
    v
Scenario Comparator
    |
    +--> Expected consequences
    +--> Uncertainties
    +--> Dependencies
    +--> Failure conditions
    |
    v
Slow LLM Synthesis
    |
    v
Prediction / Scenario Repository`}
```

**Resultado macroscópico\:** el agente puede explorar futuros posibles y analizar consecuencias de decisiones alternativas.

**Cómo se consigue\:** estados iniciales, supuestos explícitos, modelos causales, analogías históricas y simulaciones versionadas.

Jev ayuda a encontrar semejanzas y detectar incompatibilidades semánticas. No sustituye los cálculos de probabilidad, los modelos físicos, los modelos financieros ni la verificación de restricciones.

La predicción deberá evaluarse posteriormente contra resultados reales. Sin esa comparación, solamente tendríamos generación de escenarios.

## 3.7. Circuito G - Aprendizaje desde resultados

```text
{`Executed SOP / Observed Outcome
    |
    v
Outcome Evaluator
    |
    +--> Expected vs Observed
    |
    v
Error Attribution
    |
    +--> Jev: pattern similarity
    +--> Historical analogies
    |
    v
Learning Proposal
    |
    v
Evidence + Validation
    |
    +--> Reject
    +--> Keep as Hypothesis
    +--> Approve as Knowledge
    |
    v
Semantic Consolidation
    |
    v
New Versioned Memory
    |
    v
Future Retrieval`}
```

**Resultado macroscópico\:** la experiencia puede modificar el conocimiento utilizado en decisiones futuras.

**Cómo se consigue\:** comparar expectativas con resultados, localizar patrones repetidos, formular aprendizajes, validarlos y consolidarlos.

No habrá aprendizaje automático de permisos, reglas del kernel o SOPs de producción.

## 3.8. Circuito H - Innovación y transferencia entre dominios

```text
{`Problem / Opportunity
    |
    v
Structural Decomposition
    |
    v
Cross-Domain Retrieval
    |
    +--> Jev: analogical similarity
    +--> Graph: shared patterns
    |
    v
Concept Composition
    |
    v
Hypothesis Generation
    |
    v
Feasibility + Novelty Evaluation
    |
    v
Experiment Design
    |
    v
Human Approval / Sandbox Execution
    |
    v
Measured Outcome
    |
    v
Learning + Memory`}
```

**Resultado macroscópico\:** el sistema puede proponer combinaciones de conocimiento que no estaban explícitamente almacenadas como soluciones completas.

**Cómo se consigue\:** descomposición estructural, recuperación analógica, recombinación y experimentación.

La novedad se tratará como una hipótesis relativa a un corpus y una búsqueda, no como una afirmación absoluta de originalidad.

---

# 4\. Campaña de resultados por fase: qué esperamos conseguir y por qué

NC-02 acompaña las dieciséis fases de NC-01. Cada fase deberá demostrar una capacidad funcional, no solamente que los archivos compilan.

## Fase 0 - Mapa de circulación cognitiva

**Resultado esperado\:** conocer todos los caminos por los que una observación entra, se transforma, se recupera, llega al Slow LLM y vuelve al sistema.

**Mecanismo\:** generar un inventario de productores, consumidores, persistencias, eventos, llamadas a modelos y controles de autorización.

**Jev\:** todavía no se ejecuta. Se identifica dónde sus evaluaciones pueden aportar valor y dónde serían redundantes.

**Integración existente\:** `conversation.ts`, `model.ts`, `model-chain.ts`, `context/engine.ts`, `memory.ts`, `rag.ts`, `kernel/graph/*`, `events/*`, `service.ts`, rutas, Store y contratos de dominio.

**Demostración\:** para una tarea real se puede dibujar la ruta exacta de sus datos, con archivos, funciones y contratos. Se registran todos los puntos sin cablear.

## Fase 1 - Cromos como unidades semánticas persistentes

**Resultado esperado\:** cada recuerdo puede representarse mediante un perfil cromático estable y consultarse por significado, no solo por palabras.

**Mecanismo\:** las diez dimensiones describen propiedades del contenido; las seis polaridades sirven para establecer conexiones y orientar exploración asociativa.

**Jev\:** propone o calcula el perfil semántico mediante una operación tipada. El validador aplica rangos, normalización y versión de ontología.

**Integración\:** `kernel/cromos/cromo.ts` permanece genérico; `engine/cognition/chromatic/*` define el perfil específico; `packages/domain` expone contratos públicos; `memory.ts` conecta las cards con memorias existentes.

**Demostración\:** dos textos con vocabulario diferente, pero contenido equivalente, producen perfiles comparables. Dos textos superficialmente similares, pero conceptualmente distintos, deben poder diferenciarse.

**Riesgo principal\:** dimensiones redundantes o mal definidas. Se medirá consistencia entre evaluaciones y utilidad de cada dimensión mediante ablaciones.

## Fase 2 - Memoria durable conectada al Event Bus

**Resultado esperado\:** los agentes conservan una historia persistente que sobrevive a reinicios, fallos y cambios de sesión.

**Mecanismo\:** event log, proyecciones idempotentes, checkpoints y repositorios versionados.

**Jev\:** se invoca después de confirmar la entrada factual, no antes de garantizar su persistencia. Los enriquecimientos semánticos se pueden reintentar sin perder el acontecimiento.

**Integración\:** `events/bus.ts`, `events/types.ts`, `events/schemas.ts`, `events/consumers/cognition.ts`, Store, `memory-projector.ts`\.

**Demostración\:** se interrumpe una ingesta a mitad de proceso; al reiniciar, el sistema completa la proyección sin duplicar cards ni relaciones.

**Riesgo principal\:** confundir notificaciones en vivo con entrega durable. El subscriber actual es útil para SSE, pero no será la única garantía de procesamiento.

## Fase 3 - Memoria episódica y segmentación de experiencias

**Resultado esperado\:** el agente no almacena solamente frases; reconoce unidades de experiencia con comienzo, desarrollo, participantes y resultado.

**Mecanismo\:** segmentación temporal y semántica, resolución de entidades y vinculación de observaciones.

**Jev\:** evalúa continuidad entre observaciones, semejanza entre episodios y posibles cambios de tema o actividad.

**Integración\:** eventos del executor, conversaciones, documentos, `MemoryService`, `episodic-store.ts`, `event-segmenter.ts`\.

**Demostración\:** una conversación larga sobre una incidencia se convierte en un episodio coherente, mientras que dos incidencias parecidas en días distintos siguen siendo episodios separados.

**Riesgo principal\:** fusionar experiencias distintas. La separación de patrones tendrá prioridad sobre una compresión excesiva.

## Fase 4 - Activación asociativa del grafo

**Resultado esperado\:** el agente recupera conocimiento relacionado aunque el usuario no mencione explícitamente los términos almacenados.

**Mecanismo\:** búsqueda híbrida, expansión por aristas, activación ponderada, penalización de hubs y fusión de candidatos.

**Jev\:** propone relaciones semánticas y evalúa la compatibilidad de los candidatos con el objetivo actual.

**Integración\:** `rag.ts`, `memory.ts`, `kernel/graph/attention.ts`, `graph-activator.ts`, `hybrid-retriever.ts`\.

**Demostración\:** ante una pregunta sobre un fallo, el sistema recupera también una decisión anterior y una dependencia técnica que explican el acontecimiento.

**Riesgo principal\:** asociaciones espurias. Toda relación tendrá tipo, confianza, origen y límites de expansión.

## Fase 5 - Atención cromática y Global Workspace

**Resultado esperado\:** el Slow LLM recibe menos información irrelevante y más evidencia útil, complementaria y contradictoria.

**Mecanismo\:** Jev evalúa compatibilidad contextual; el selector combina relevancia, diversidad, novedad, vigencia y restricciones.

**Jev\:** interviene directamente en ranking, polaridades, detección de redundancia y selección de información complementaria.

**Integración\:** `context/engine.ts`, `memory.ts`, `attention.ts`, `workspace-selector.ts`, `context-composer.ts`\.

**Demostración\:** el sistema responde correctamente a una pregunta que requiere varias fuentes, utilizando menos tokens que una recuperación indiscriminada.

**Riesgo principal\:** excluir evidencia minoritaria pero decisiva. Se reservará capacidad para contradicciones y excepciones pertinentes.

## Fase 6 - Reconstrucción histórica

**Resultado esperado\:** reconstruir procesos completos, incluso cuando se desarrollaron durante semanas o meses.

**Mecanismo\:** grafo temporal, episodios, eventos, tiempo bitemporal y resúmenes jerárquicos.

**Jev\:** enlaza referencias semánticas a un mismo acontecimiento, incluso cuando cambia su nombre o descripción.

**Integración\:** `events`, `kernel/graph/turn.ts`, `kernel/snapshot.ts`, repositorios episódicos y `temporal/*`\.

**Demostración\:** reconstruir qué se decidió, cuándo, por quién, con qué evidencia y qué sucedió después, distinguiendo el conocimiento disponible en cada fecha.

**Riesgo principal\:** contaminación retrospectiva. Las consultas históricas usarán el tiempo de conocimiento correspondiente.

## Fase 7 - Estado presente y consciencia situacional

**Resultado esperado\:** el agente mantiene una visión operativa actualizada de su entorno y sus límites.

**Mecanismo\:** proyección del último estado válido a partir de acontecimientos y evidencias verificadas.

**Jev\:** ayuda a reconciliar descripciones distintas de una misma entidad o condición.

**Integración\:** `events/consumers/state-changed.ts`, `ContextEngine`, snapshots, tareas, notificaciones y `world-model/state-projector.ts`\.

**Demostración\:** después de varios cambios de estado, el agente identifica la situación vigente, la última verificación y los datos obsoletos.

**Riesgo principal\:** confundir ausencia de noticias con continuidad garantizada. El sistema incorporará reglas de caducidad y frescura.

## Fase 8 - Futuro y simulación de consecuencias

**Resultado esperado\:** el agente puede construir escenarios alternativos y explicar qué condiciones deberían cumplirse para cada uno.

**Mecanismo\:** estados iniciales, restricciones, modelos causales, hipótesis y simulación.

**Jev\:** recupera episodios análogos y evalúa coherencia semántica de los escenarios.

**Integración\:** `temporal/future-simulator.ts`, `world-model/causal-model.ts`, `scenario-repository.ts`, Slow LLM y planificación.

**Demostración\:** dado un estado inicial y tres intervenciones posibles, produce tres escenarios distinguibles, con supuestos y resultados contrastables.

**Riesgo principal\:** presentar plausibilidad narrativa como probabilidad. Solo se mostrarán probabilidades calibradas cuando exista un modelo que las respalde.

## Fase 9 - Pensamiento multiperspectiva

**Resultado esperado\:** el agente puede analizar un mismo fenómeno desde distintos modelos, identificar tensiones y construir una síntesis.

**Mecanismo\:** ejecución de perspectivas independientes con sus propios supuestos, evidencia y criterios.

**Jev\:** encuentra equivalencias conceptuales entre perspectivas y posibles incompatibilidades.

**Integración\:** `perspectives/*`, `model-registry.ts`, `SlowAuthor`, `ContextBundle`\.

**Demostración\:** una incidencia puede examinarse desde modelos técnico, causal, económico y organizativo, sin mezclar sus conclusiones.

**Riesgo principal\:** multiplicar perspectivas decorativas. Cada perspectiva deberá aportar una predicción, distinción o criterio comprobable.

## Fase 10 - Metacognición y regulación del razonamiento

**Resultado esperado\:** el agente detecta cuándo su respuesta está insuficientemente fundamentada y puede cambiar de estrategia.

**Mecanismo\:** automodelo funcional, monitor de contradicciones, calibración y controlador ejecutivo.

**Jev\:** evalúa coherencia semántica entre hipótesis, evidencias y conclusiones.

**Integración\:** `kernel/observers/meta.ts` si existe y es reutilizable, `SlowAuthor`, `model.ts`, `executive-controller.ts`, `global-workspace.ts`\.

**Demostración\:** ante evidencias contradictorias, el agente solicita información adicional o comunica incertidumbre en lugar de producir una respuesta categórica.

**Riesgo principal\:** bucles de autorreflexión. El controlador limitará ciclos, tiempo y coste, y exigirá ganancia informativa.

## Fase 11 - Aprendizaje acumulativo

**Resultado esperado\:** el sistema mejora su conocimiento operativo después de observar resultados.

**Mecanismo\:** evaluación de resultados, atribución de errores, extracción de patrones, consolidación y revisión de creencias.

**Jev\:** agrupa experiencias semejantes, identifica abstracciones candidatas y detecta posibles contradicciones con conocimientos anteriores.

**Integración\:** hechos aprendidos que ya consume `ContextEngine`, `promote.ts`, `consolidate.ts`, Event Bus y `learning/*`\.

**Demostración\:** un error repetido produce una propuesta de aprendizaje; después de validarla, el sistema utiliza ese conocimiento en una tarea posterior.

**Riesgo principal\:** sobreajustar a experiencias aisladas. Los aprendizajes generales exigirán evidencia suficiente y ámbito de aplicación definido.

## Fase 12 - Innovación y transferencia analógica

**Resultado esperado\:** el agente puede proponer soluciones no almacenadas literalmente, combinando conocimientos de diferentes experiencias.

**Mecanismo\:** analogías estructurales, recombinación, hipótesis y experimentos.

**Jev\:** identifica semejanzas entre patrones de dominios distintos, aunque su vocabulario no coincida.

**Integración\:** `innovation/*`, grafo, memoria semántica, Slow LLM, planner y SOPs de experimentación autorizados.

**Demostración\:** a partir de un problema nuevo, produce una solución candidata, justifica su analogía y propone cómo comprobarla.

**Riesgo principal\:** confundir creatividad con validez. Las ideas permanecerán como hipótesis hasta pasar pruebas.

## Fase 13 - Integración transversal Fast/Slow/Kernel

**Resultado esperado\:** todos los mecanismos anteriores participan en una tarea real sin romper el runtime existente.

**Mecanismo\:** un servicio cognitivo orquesta recuperación, atención y composición; el Slow LLM interpreta; el kernel registra; el runtime ejecuta.

**Jev\:** se utiliza mediante el gateway común en los nodos que lo necesiten, con presupuestos y trazas por operación.

**Integración\:** `model.ts`, `model-chain.ts`, `conversation.ts`, `context/engine.ts`, `service.ts`, `slow-author.ts`, `promote.ts`\.

**Demostración\:** una tarea atraviesa memoria, grafo, Jev, Slow LLM, verificación y Event Bus con un único correlationId.

**Riesgo principal\:** doble ensamblado de contexto o invocaciones duplicadas. Habrá un único punto autorizado de construcción del `CognitiveContextBundle` por ciclo.

## Fase 14 - Observabilidad de los procesos cognitivos

**Resultado esperado\:** el ingeniero puede inspeccionar por qué el sistema recordó, descartó, predijo, aprendió o propuso una idea.

**Mecanismo\:** trazas estructuradas, métricas, visualización de episodios y grafo, e inspección de evaluaciones Jev.

**Jev\:** cada operación registra proveedor, versión, latencia, coste, scores, fallback y referencias de entrada.

**Integración\:** `events-routes.ts`, Centro de Control, `cognition-routes.ts`, métricas existentes, web y `evaluation-trace.ts`\.

**Demostración\:** abrir un resultado y recorrer sus evidencias hasta los eventos originales.

**Riesgo principal\:** observabilidad excesiva que exponga datos. Se usarán referencias, redacción de contenido sensible y permisos administrativos.

## Fase 15 - Validación científica y cierre

**Resultado esperado\:** determinar qué capacidades aportan mejoras reales y cuáles deben descartarse o rediseñarse.

**Mecanismo\:** benchmarks, ablaciones, calibración, pruebas temporales, adversariales y de coste.

**Jev\:** se compara activado, desactivado y sustituido por un baseline convencional en cada nodo relevante.

**Integración\:** tests, métricas, informes y gates de CI.

**Demostración\:** resultados reproducibles sobre datasets separados de los utilizados para ajustar el sistema.

**Riesgo principal\:** atribuir a Jev mejoras que proceden del grafo, del LLM o de más tokens. Los experimentos controlarán esas variables.

---

# 5\. Matriz transversal de archivos: qué atraviesa cada proceso

Esta matriz sirve como mapa de implementación para no crear módulos aislados.

| Archivo o área existente | Qué aporta hoy | Qué recibirá de NC-02 | Qué entregará |
|--------|--------|--------|--------|
| `engine/conversation.ts` | Entrada conversacional | Identidad de tarea y petición cognitiva | Contexto para respuesta |
| `engine/model.ts` | Ejecución de tareas con modelo | `CognitiveContextBundle` | Resultado Slow y referencias |
| `engine/model-chain.ts` | Routing de modelos | Modo, tenant y configuración verificados | Modelo seleccionado |
| `engine/context/engine.ts` | Rol, entidad, eventos, recall y aprendizaje | Estado cognitivo y temporal | Contexto compuesto |
| `engine/memory.ts` | Memorias y RAG | Adaptador cromático | Candidatos y evidencias |
| `engine/rag.ts` | Recuperación documental | Exposición de señales y candidatos | Hits para fusión |
| `kernel/graph/thought.ts` | Contrato de Thought y atención | Referencias genéricas a contexto | Thought tipado |
| `kernel/graph/attention.ts` | Cálculos puros | Pesos validados | Solapamiento y divergencia |
| `kernel/graph/promote.ts` | Clasificación de destinos | Propuestas de memoria y evidencia | Decisiones de promoción |
| `kernel/graph/consolidate.ts` | Duplicados y negaciones textuales | Ninguna dependencia semántica nueva | Resultado determinista |
| `kernel/authors/slow-author.ts` | Escritura del Slow Thought | Referencias de evidencia y ciclo | Thought trazable |
| `kernel/observers/presenter.ts` | Selección de pensamientos | Resultados curados | Salida presentable |
| `kernel/cromos/*` | Contratos y matemática genérica | Integración mediante adaptadores | Primitivas reutilizables |
| `engine/events/bus.ts` | Emisión y persistencia de eventos | Contratos cognitivos y entrega verificable | Registro factual |
| `engine/events/subscriber.ts` | Suscripción en vivo | Eventos cognitivos para UI | Notificaciones no durables |
| `engine/events/consumers/*` | Proyecciones existentes | Consumidor cognitivo | Cards y estados |
| `kernel/snapshot.ts` | Snapshot de kernel | Referencias de estado cognitivo | Reconstrucción coherente |
| `engine/service.ts` | Composición de servicios | Bootstrap cognitivo | Dependencias conectadas |
| `app.ts` | Arranque del servidor | Registro de rutas y servicios | Runtime operativo |
| `apps/web` | Interfaces y Centro de Control | Inspector cognitivo | Visualización y depuración |

Las rutas exactas de algunos módulos deben validarse contra el HEAD antes de editar; las que hemos inspeccionado directamente constituyen el punto de partida confirmado.

## 5.1. Qué no debe atravesar el kernel

El kernel no necesita conocer\:

- Qué significa una dimensión cromática específica.
- Qué es Jev ni qué proveedor la implementa.
- Qué teoría neurocientífica inspira un algoritmo.
- Qué perspectiva económica o empresarial se está usando.
- Qué hipótesis de futuro resulta más plausible.
- Cómo se enriquecen semánticamente las cards.

Solo necesita conocer contratos invariantes: identidad, autoría, atención tipada, procedencia, transición, política, promoción y registro.

Esto evita que la campaña de neurocognición convierta el kernel en una acumulación de funcionalidades de dominio.

## 5.2. Qué sí atraviesa el kernel

Las referencias genéricas a evidencias y contextos pueden circular por metadata de Thought, siempre que estén validadas y autorizadas.

Ejemplo\:

```typescript
{`interface CognitiveThoughtReferences {
  cognitiveRunId: string;
  contextBundleId: string;
  attentionCycleId: string;

  evidenceIds: string[];
  hypothesisIds: string[];
  modelIds: string[];

  traceId: string;
}`}
```

El kernel no necesita interpretar esos identificadores. Solo conservarlos y aplicar sus invariantes.

---

# 6\. El modelo de ejecución transversal: CognitiveRun

Para evitar que cada fase invente su propia forma de coordinarse, crearía un objeto persistente llamado `CognitiveRun`\.

No será un agente nuevo. Será una **instancia de trabajo cognitivo** con estado, presupuesto, referencias y trazabilidad.

## 6.1. Ciclo de vida

```text
{`CREATED
   |
   v
CONTEXT_RESOLVED
   |
   v
RECALLING
   |
   v
EVALUATING
   |
   v
WORKSPACE_READY
   |
   v
REASONING
   |
   +--> NEEDS_MORE_EVIDENCE --> RECALLING
   |
   +--> NEEDS_VERIFICATION --> VERIFYING
   |
   v
COMPLETED
   |
   +--> LEARNING_PROPOSED
   |
   v
ARCHIVED`}
```

Estados alternativos: `FAILED`, `CANCELLED`, `TIMED_OUT` y `WAITING_APPROVAL`\.

Cada transición será válida solamente si cumple una tabla de estados cerrada.

## 6.2. Contrato propuesto

```typescript
{`export interface CognitiveRun {
  id: string;
  tenantId: string;
  owner: string;
  actorId: string;
  correlationId: string;

  objective: string;
  mode:
    | "recall"
    | "historical"
    | "situational"
    | "prospective"
    | "reflection"
    | "innovation";

  status:
    | "created"
    | "context_resolved"
    | "recalling"
    | "evaluating"
    | "workspace_ready"
    | "reasoning"
    | "needs_verification"
    | "waiting_approval"
    | "completed"
    | "failed"
    | "cancelled"
    | "timed_out";

  attentionStateId?: string;
  worldStateId?: string;
  contextBundleIds: string[];
  thoughtIds: string[];

  budgets: {
    maxCycles: number;
    maxTokens: number;
    maxSemanticCalls: number;
    maxDurationMs: number;
  };

  startedAt: string;
  updatedAt: string;
  version: number;
}`}
```

## 6.3. Por qué es necesario

Sin un `CognitiveRun`, los procesos pueden funcionar individualmente, pero es difícil responder\:

- Qué objetivo originó una recuperación.
- Cuántas evaluaciones Jev se realizaron.
- Qué evidencias llegaron realmente al Slow LLM.
- Qué hipótesis se descartaron.
- Qué modelo explicativo se utilizó.
- Cuánto costó llegar a la respuesta.
- Qué se aprendió después.
- Cómo reconstruir el trabajo tras un reinicio.

El `CognitiveRun` se convertirá en el hilo conductor de todos esos registros.

---

# 7\. Arquitectura temporal profunda: el acontecimiento como unidad de comprensión

Uno de tus objetivos centrales es que el agente pueda seguir **el grado de desarrollo completo de un acontecimiento**, no solamente fragmentos de conversación.

Para conseguirlo, diferenciaría cuatro estructuras.

| Estructura | Función | Ejemplo |
|--------|--------|--------|
| `Observation` | Registro individual | «El servidor ha devuelto un error» |
| `Episode` | Secuencia coherente | «Incidencia del servidor durante la mañana» |
| `ProcessHistory` | Evolución de un proceso | «Historia de estabilidad del servicio» |
| `WorldState` | Estado del entorno en un instante | «Estado actual de todos los servicios» |

Un episodio puede contener múltiples observaciones. Un proceso puede atravesar múltiples episodios. Un estado del mundo puede depender de muchos procesos.

## 7.1. Continuidad del acontecimiento

El motor de continuidad decidirá si un evento\:

- Continúa un episodio abierto.
- Corrige una observación anterior.
- Inicia un episodio nuevo.
- Cierra una etapa.
- Representa una consecuencia.
- Pertenece a otro proceso relacionado.

Jev puede proponer la relación semántica. La asignación definitiva dependerá también de identidad, tiempo, fuente, estado y reglas del dominio correspondiente.

## 7.2. Reconstrucción retrospectiva

Una reconstrucción histórica deberá producir tres vistas\:

**Vista factual\:** acontecimientos y evidencias observadas.

**Vista interpretativa\:** hipótesis y modelos que intentan explicar lo sucedido.

**Vista retrospectiva\:** lo que ahora sabemos, diferenciándolo de lo que se sabía en aquel momento.

La separación permitirá al agente aprender del pasado sin reescribirlo.

## 7.3. Simulación prospectiva

Los escenarios futuros se construirán sobre estados versionados. Cada escenario incluirá\:

- Estado inicial.
- Horizonte temporal.
- Supuestos.
- Intervenciones posibles.
- Restricciones.
- Dependencias.
- Resultados estimados.
- Incertidumbre.
- Condiciones de falsación.

El agente podrá comparar escenarios, pero no convertir sus resultados en hechos hasta que existan observaciones posteriores.

## 7.4. Contrafactuales

Los contrafactuales serán simulaciones de mundos alternativos, no modificaciones de la historia real.

Ejemplo: «¿Qué habría ocurrido si hubiéramos actualizado el servicio antes de la incidencia?».

La respuesta tendrá que indicar qué variables se modificaron, qué otras se mantuvieron constantes y qué evidencia respalda el modelo utilizado.

---

# 8\. Metacognición de segundo orden: observar el propio proceso cognitivo

La metacognición no debe limitarse a que el Slow LLM diga «creo que estoy equivocado».

Debe existir un observador externo capaz de evaluar el comportamiento cognitivo mediante datos.

## 8.1. Qué monitorizamos

**Atención\:** qué se seleccionó, qué se ignoró y si la selección fue útil.

**Incertidumbre\:** qué afirmaciones están respaldadas y cuáles son provisionales.

**Contradicciones\:** dónde existen evidencias o modelos incompatibles.

**Eficiencia\:** cuánto esfuerzo se invierte y qué información adicional se obtiene.

**Calibración\:** cómo se relacionan las confianzas declaradas con los resultados reales.

**Estrategia\:** qué métodos de recuperación y razonamiento funcionan mejor para cada clase de tarea.

## 8.2. El bucle metacognitivo

```text
{`CognitiveRun
     |
     v
Observe Cognitive Metrics
     |
     v
Self Monitor
     |
     +--> Jev: consistency check
     +--> Calibration history
     +--> Evidence coverage
     |
     v
Strategy Proposal
     |
     v
Executive Controller
     |
     +--> Continue
     +--> Retrieve differently
     +--> Change perspective
     +--> Request verification
     +--> Stop with uncertainty
     +--> Complete
     |
     v
New Cognitive State`}
```

El controlador elegirá una acción de un conjunto cerrado. No permitirá que un texto libre generado por el LLM se convierta en una orden arbitraria.

## 8.3. Metaaprendizaje

Una segunda capa podrá analizar resultados agregados\:

- ¿Cuándo fue útil Jev?
- ¿Cuándo el grafo introdujo ruido?
- ¿Qué dimensión cromática predijo mejor la relevancia?
- ¿Qué perspectivas fueron más informativas?
- ¿Cuándo una segunda recuperación cambió correctamente la respuesta?
- ¿Cuándo el sistema gastó recursos sin mejorar?

Este metaaprendizaje puede proponer nuevos parámetros o estrategias, pero sus cambios pasarán por evaluación y versionado.

No habilitaría una reconfiguración automática ilimitada del propio sistema.

---

# 9\. La coordinación entre agentes: una cognición compartida, no trece cerebros aislados

AgntiaPro tiene agentes visibles con responsabilidades diferenciadas, pero el motor cognitivo no debe replicarse trece veces.

La arquitectura correcta es\:

**Infraestructura cognitiva común + identidad de agente + ámbito de conocimiento + objetivo + políticas.**

Cada agente tendrá una perspectiva funcional, un conjunto de capacidades autorizadas y acceso a las memorias pertinentes.

## 9.1. Tres niveles de memoria

| Nivel | Contenido | Acceso |
|--------|--------|--------|
| Memoria del agente | Episodios de su actividad, objetivos y aprendizajes específicos | Actor y delegados autorizados |
| Memoria del workspace | Procesos, documentos y acontecimientos compartidos | Miembros autorizados |
| Memoria del tenant | Conocimiento común y modelos generales del entorno | Según roles y políticas |

La memoria global del sistema no podrá utilizarse como excusa para mezclar información de clientes o tenants.

## 9.2. Transferencia cognitiva entre agentes

Supongamos que un agente comercial detecta un problema de facturación.

El flujo sería\:

```text
{`Agente Comercial
   |
   v
Observation + Event Bus
   |
   v
Shared Episodic Memory
   |
   v
Chromatic Enrichment + Jev
   |
   v
Graph: relación con proceso financiero
   |
   v
Authorized Cognitive Notification
   |
   v
Agente de Finanzas
   |
   v
ContextBundle específico del agente
   |
   v
Slow LLM / Task Plan
   |
   v
SOP autorizado
   |
   v
Resultado + Memoria compartida`}
```

El agente financiero no necesita recibir toda la conversación comercial. Recupera las evidencias pertinentes con procedencia, permisos y contexto.

**Resultado esperado\:** transferencia de conocimiento entre áreas sin duplicar el estado cognitivo completo.

## 9.3. El papel del metaagente

El metaagente coordinará objetivos y responsabilidades, pero no se convertirá en una autoridad alternativa al runtime.

Podrá solicitar análisis multiperspectiva, proponer delegaciones, comparar resultados y presentar síntesis. Las delegaciones y acciones seguirán sometidas a las políticas de ejecución.

## 9.4. Modelos mentales diferentes

Un agente de operaciones y uno comercial pueden observar el mismo acontecimiento y producir interpretaciones diferentes porque tienen objetivos distintos.

El sistema debe conservar\:

- Una evidencia factual común.
- Distintos modelos explicativos.
- Diferentes selecciones de atención.
- Conclusiones atribuidas a cada perspectiva.
- Un mecanismo de contraste y síntesis.

Esto es más potente que imponer una única interpretación global de cada acontecimiento.

---

# 10\. La memoria cromática como mecanismo de atención dinámica

La tarjeta cromática no debe ser una ficha estática con diez números.

Debe participar en una dinámica de activación dependiente del objetivo.

## 10.1. Dos estados cromáticos

**Perfil intrínseco\:** propiedades relativamente estables de la representación, calculadas a partir de su contenido y contexto de origen.

**Estado de activación\:** relevancia contextual de la tarjeta durante una ejecución cognitiva concreta.

El primero se persiste y versiona. El segundo pertenece al `CognitiveRun`\.

## 10.2. Propagación asociativa

Una formulación experimental para activar una tarjeta podría ser\:

$$
a_i^{(t+1)}
=
\sigma\left(
b_i(q)
+
\lambda\sum_j w_{ji}a_j^{(t)}
-
\gamma\,d_i
\right)
$$

Donde\:

- $a_i$\: activación de la tarjeta.
- $b_i(q)$\: relevancia inicial para la consulta.
- $w_{ji}$\: peso validado de la relación entre tarjetas.
- $d_i$\: penalización por redundancia o ruido.
- $\lambda$\: propagación.
- $\gamma$\: penalización.
- $\sigma$\: normalización acotada.

Esta ecuación es una propuesta de ingeniería, no una reproducción demostrada de dinámica neuronal.

Jev puede contribuir al cálculo de $b_i(q)$ y a la compatibilidad semántica de ciertas aristas. La propagación numérica debe permanecer determinista y reproducible.

## 10.3. Seis polaridades y rutas de pensamiento

Las seis polaridades podrán funcionar como seis tipos de orientación semántica definidos por la ontología.

Cada recorrido podrá responder preguntas como\:

- ¿Qué relación conceptual justifica seguir esta arista?
- ¿Qué nueva información aporta?
- ¿Qué evidencia contradice la ruta actual?
- ¿Qué coste tiene expandirla?
- ¿Qué probabilidad hay de que sea redundante?
- ¿Cuándo conviene detener la expansión?

No asignaría significados arbitrarios a las seis puntas hasta recuperar y fijar tu definición original.

## 10.4. Autopistas cognitivas

Las asociaciones utilizadas repetidamente y verificadas como útiles podrán convertirse en rutas preferentes de recuperación.

Esto se parece funcionalmente a una forma de aprendizaje de rutas, pero no debe confundirse con plasticidad neuronal biológica.

Cada autopista tendrá\:

- Patrón de entrada.
- Secuencia de relaciones.
- Contextos donde funcionó.
- Evidencia de utilidad.
- Coste medio.
- Tasa de error.
- Versión.
- Condiciones de desactivación.

Una ruta que empiece a producir errores perderá prioridad o será retirada.

**Resultado esperado\:** reducir coste y latencia en clases de problemas recurrentes sin perder capacidad de exploración.

---

# 11\. Jev distribuido: política de ejecución y coste

Una presencia transversal de Jev no debe convertirse en miles de llamadas innecesarias.

El `SemanticEvaluationGateway` tendrá cuatro modos.

| Modo | Uso | Política |
|--------|--------|--------|
| Ingesta | Enriquecimiento de memorias | Preferentemente asíncrono |
| Recuperación | Ranking de candidatos | Síncrono, con deadline |
| Análisis profundo | Perspectivas, contradicciones, analogías | Bajo presupuesto cognitivo |
| Mantenimiento | Consolidación y calibración | Procesamiento por lotes |

### Orden de evaluación

1. Comprobar autorización y elegibilidad.
2. Buscar una evaluación válida en caché.
3. Aplicar filtros baratos y deterministas.
4. Seleccionar candidatos que realmente necesitan evaluación semántica.
5. Agrupar solicitudes compatibles.
6. Invocar Jev si está disponible y dentro de presupuesto.
7. Validar la respuesta.
8. Calibrar scores.
9. Persistir la evaluación y su versión.
10. Entregarla al consumidor.

### Caché semántica

La clave de caché deberá incorporar al menos\:

`tenant + operation + inputHash + ontologyVersion + providerVersion + calibrationVersion + authorizationScope`\.

No se reutilizará una evaluación entre tenants o scopes incompatibles.

### Degradación

Si Jev falla, el gateway distinguirá\:

- Evaluación disponible mediante fallback.
- Evaluación parcial.
- Evaluación no disponible.
- Operación que requiere Jev y debe detenerse.

El sistema no presentará una heurística simple como si fuera una evaluación Jev equivalente.

### Qué medir por nodo

Cada operación registrará tasa de uso, latencia p50/p95, coste, aciertos en benchmark, efecto sobre la calidad final, tasa de fallback y porcentaje de llamadas evitadas por caché.

Así podremos descubrir, por ejemplo, que Jev aporta mucho en recuperación analógica y poco en segmentación de episodios. En ese caso lo mantendremos donde produzca valor.

---

# 12\. Los eventos que conectan las fases

Además del catálogo de NC-01, necesitamos definir **qué evento despierta a qué proceso**\.

| Evento de entrada | Consumidor | Resultado persistente | Evento posterior |
|--------|--------|--------|--------|
| `task.completed` | Outcome evaluator | Resultado evaluado | `cognition.outcome.evaluated` |
| `cognition.observation.recorded` | Episode projector | Episodio actualizado | `cognition.episode.updated` |
| `cognition.episode.closed` | Card enricher | Cards enriquecidas | `cognition.card.enriched` |
| `cognition.card.enriched` | Relation builder | Aristas candidatas validadas | `cognition.relation.created` |
| `cognition.relation.created` | Graph indexer | Índice asociativo | `cognition.graph.updated` |
| `cognition.recall.requested` | Retrieval service | Candidatos | `cognition.recall.completed` |
| `cognition.recall.completed` | Workspace selector | Selección atencional | `cognition.attention.selected` |
| `cognition.attention.selected` | Context composer | ContextBundle | `cognition.context.composed` |
| `cognition.prediction.recorded` | Prediction monitor | Predicción pendiente | Evaluación al existir resultado |
| `cognition.outcome.evaluated` | Learning service | Propuesta | `cognition.learning.proposed` |
| `cognition.learning.validated` | Consolidator | Nueva versión semántica | `cognition.memory.consolidated` |

La tabla es un **contrato objetivo**, no una descripción de consumidores ya implementados.

Los eventos derivados deberán indicar qué evento los originó. Para cada consumidor habrá una política que evite ciclos no deseados.

## 12.1. Síncrono frente a asíncrono

No todos los procesos deben bloquear una respuesta al usuario.

**Síncronos\:** autorización, recuperación necesaria, composición de contexto, evaluación crítica imprescindible y respuesta Slow.

**Asíncronos\:** enriquecimiento histórico, construcción de relaciones secundarias, consolidación, minería de patrones, calibración y mantenimiento.

La regla es que una tarea interactiva no espere a que termine toda la consolidación de memoria del sistema.

## 12.2. Reconstrucción después de fallos

El estado factual se reconstruirá desde eventos y registros persistidos. Las proyecciones cognitivas podrán regenerarse utilizando versiones fijadas de algoritmos y modelos.

Hay una limitación importante: una evaluación nueva de Jev puede producir scores diferentes si el proveedor cambió. Por eso, para reproducir una ejecución histórica se conservarán los resultados originales de evaluación o sus artefactos versionados, no solamente la petición que los generó.

---

# 13\. Resultados macroscópicos por bloques

Más allá de los tests de cada fase, la campaña necesita demostrar que aparecen capacidades de conjunto.

## Bloque I - De datos dispersos a experiencia estructurada

**Fases 0-4.**

Antes, una tarea podía recuperar documentos o memorias relevantes. Después de este bloque, queremos que pueda recuperar **experiencias estructuradas y conectadas**\.

El cambio esperado es pasar de «encontrar un texto» a «encontrar un acontecimiento, sus participantes, relaciones, antecedentes y consecuencias registradas».

### Demostración macroscópica I

Un agente recibe cincuenta registros dispersos sobre varias incidencias. El sistema debe distinguir los episodios, conservar su cronología y recuperar las conexiones pertinentes ante una pregunta nueva.

**Criterios de aceptación\:** identidad correcta de episodios, procedencia completa, ausencia de duplicados tras replay, aislamiento y mejora de recuperación frente al baseline.

## Bloque II - De experiencia estructurada a comprensión temporal

**Fases 5-8.**

Queremos que el agente pueda navegar entre pasado, presente y futuros posibles.

La mejora no consiste en redactar historias más convincentes, sino en construir representaciones temporales explícitas y comprobables.

### Demostración macroscópica II

Ante una incidencia recurrente, el agente reconstruye antecedentes, calcula el estado presente y compara varias intervenciones futuras.

**Criterios de aceptación\:** cronología verificable, estados históricos correctos, separación entre hechos y escenarios, y mejora frente a una respuesta directa del Slow LLM.

## Bloque III - De comprensión a autorregulación y aprendizaje

**Fases 9-12.**

Queremos que el agente pueda identificar cuándo su conocimiento es insuficiente, elegir una estrategia mejor y convertir resultados verificados en nuevas capacidades de comprensión.

### Demostración macroscópica III

El agente formula una hipótesis, detecta una contradicción, recupera evidencia adicional, revisa su conclusión y propone un experimento.

**Criterios de aceptación\:** revisión correcta de hipótesis, menor tasa de errores no reconocidos, mejora de calibración y propuestas de aprendizaje trazables.

## Bloque IV - De módulos independientes a sistema cognitivo integrado

**Fases 13-15.**

El objetivo final es que los mecanismos se coordinen dentro de una tarea real, manteniendo la separación entre cognición y ejecución.

### Demostración macroscópica IV

Una tarea atraviesa varias sesiones y un reinicio. El agente reconstruye su objetivo, recupera experiencias, contrasta hipótesis, propone una acción autorizada y evalúa posteriormente su resultado.

**Criterios de aceptación\:** continuidad, trazabilidad, ausencia de acciones no autorizadas, resultados reproducibles y coste operativo dentro de los límites establecidos.

---

# 14\. Matriz de evaluación de Jev por nodo

No basta con comparar Jev activado frente a desactivado globalmente. Necesitamos saber qué aporta en cada posición.

| Nodo | Experimento con Jev | Control |
|--------|--------|--------|
| Percepción | Clasificación semántica | Reglas + embeddings |
| Segmentación | Continuidad episódica | Tiempo + identidad |
| Cromos | Perfil de diez dimensiones | Evaluador alternativo |
| Grafo | Relaciones candidatas | Similitud vectorial |
| Retrieval | Reranking | Reranker convencional |
| Workspace | Selección contextual | Ranking sin Jev |
| Pasado | Identidad semántica de eventos | Enlaces explícitos |
| Presente | Conciliación de entidades | Resolución determinista |
| Futuro | Coherencia de escenarios | Validación estructural |
| Perspectivas | Correspondencias conceptuales | Comparación directa Slow |
| Aprendizaje | Agrupación de patrones | Clustering vectorial |
| Innovación | Analogías | Recuperación semántica convencional |

Cada prueba tendrá dos resultados: **calidad del componente** y **efecto sobre el resultado final de la tarea**\.

Una evaluación puede ser muy precisa localmente y, sin embargo, no mejorar la respuesta final. En ese caso no merece necesariamente su coste.

### Métricas principales

- **Memoria\:** Recall\@K, nDCG\@K, precisión de asociaciones.
- **Tiempo\:** exactitud de secuencias, errores de anacronismo, cobertura de episodios.
- **Presente\:** frescura, consistencia de estados y precisión de evidencias.
- **Futuro\:** calibración, Brier Score cuando existan predicciones probabilísticas y resultados observables.
- **Metacognición\:** detección de insuficiencia de evidencia, revisiones correctas y coste por problema resuelto.
- **Aprendizaje\:** mejora en tareas posteriores sin degradar las anteriores.
- **Innovación\:** calidad de hipótesis, viabilidad de experimentos y resultados comprobados.
- **Operación\:** p50/p95 de latencia, tokens, coste, reintentos y fallos de proyección.

Los umbrales de aprobación se fijarán después de medir el baseline, pero **antes de ejecutar los experimentos comparativos definitivos**\.

---

# 15\. Despliegue transversal en Git y runtime

NC-02 no necesita una segunda rama independiente. Debe ejecutarse sobre la misma rama de campaña NC-01, porque describe el cableado y la validación de sus módulos.

La secuencia de despliegue será\:

**1\. Rama de campaña**

`feat/nc01-neurocognitive-runtime`, con contratos congelados y baseline registrado.

**2\. Infraestructura en sombra**

Proyectar memorias y ejecutar evaluaciones Jev sin alterar respuestas ni decisiones.

**3\. Comparación paralela**

Registrar resultados legacy y cognitivos sobre las mismas entradas, sin duplicar acciones.

**4\. Activación Slow controlada**

Habilitar ContextBundle cognitivo en tareas internas seleccionadas.

**5\. Certificación**

Aprobar únicamente capacidades que superen aislamiento, calidad, coste y regresión.

**6\. Integración**

Merge revisado y despliegue gradual, conservando rollback por feature flags.

## 15.1. Shadow mode

Durante el modo sombra, la ruta cognitiva podrá recuperar, puntuar y componer contexto, pero su salida no determinará acciones ni respuestas de producción.

Esto permite medir Jev, el grafo y el workspace sin introducir comportamientos nuevos ante clientes.

## 15.2. Canary por capacidades

Después del modo sombra, activaría primero memoria asociativa y atención cromática en un conjunto interno de tareas. Luego incorporaría reconstrucción temporal, presente, simulación, metacognición y aprendizaje.

No activaría todas las funciones simultáneamente porque dificultaría identificar regresiones.

## 15.3. Rollback

Cada capacidad tendrá una flag, una versión de contrato y una ruta legacy cuando sea viable.

Desactivar la capacidad no debe borrar los eventos originales ni destruir memorias anteriores. Las proyecciones experimentales podrán mantenerse aisladas o regenerarse.

---

# 16\. Archivos adicionales que crea específicamente NC-02

Además del árbol de NC-01, incorporaría los siguientes contratos y módulos transversales.

```text
{`apps/server/src/engine/cognition/
├── orchestration/
│   ├── cognitive-run.ts
│   ├── cognitive-run-repository.ts
│   ├── cognitive-state-machine.ts
│   ├── cognitive-coordinator.ts
│   ├── cognitive-checkpoint.ts
│   └── cognitive-recovery.ts
│
├── semantic/
│   ├── semantic-gateway.ts
│   ├── operation-registry.ts
│   ├── semantic-evaluation.ts
│   ├── evaluation-policy.ts
│   ├── batch-scheduler.ts
│   ├── score-normalizer.ts
│   ├── calibration-registry.ts
│   ├── semantic-cache.ts
│   ├── provider-health.ts
│   └── evaluation-trace.ts
│
├── continuity/
│   ├── process-history.ts
│   ├── episode-continuity.ts
│   ├── cognitive-session.ts
│   └── session-restoration.ts
│
├── coordination/
│   ├── agent-memory-scope.ts
│   ├── cognitive-handoff.ts
│   ├── perspective-delegation.ts
│   └── shared-evidence.ts
│
└── evaluation/
    ├── jev-ablation.ts
    ├── semantic-calibration.ts
    ├── semantic-cost-report.ts
    ├── cognitive-run-benchmark.ts
    └── longitudinal-evaluation.ts

tests/cognition/
├── semantic-gateway.test.ts
├── jev-fallback.test.ts
├── cognitive-run.test.ts
├── cognitive-recovery.test.ts
├── session-continuity.test.ts
├── agent-handoff.test.ts
├── cross-tenant-graph.test.ts
├── jev-ablation.test.ts
└── longitudinal-learning.test.ts

docs/campaigns/NC-02/
├── README.md
├── MACRO-OUTCOMES.md
├── TRANSVERSAL-FLOWS.md
├── JEV-SEMANTIC-FABRIC.md
├── COGNITIVE-RUN.md
├── MEMORY-CONTINUITY.md
├── TEMPORAL-REASONING.md
├── METACOGNITIVE-CONTROL.md
├── AGENT-COORDINATION.md
├── EXPERIMENTAL-DESIGN.md
├── RUNTIME-INTEGRATION.md
├── DEPLOYMENT.md
└── ACCEPTANCE.md`}
```

Estos archivos complementan los de NC-01. No deben crearse duplicados de `cognition-service.ts`, `context-composer.ts`, `jev-provider.ts` o repositorios que ya estén definidos en la campaña principal.

---

# 17\. Orden de ejecución de NC-02 dentro de NC-01

| Hito transversal | Se ejecuta con | Dependencia |
|--------|--------|--------|
| T01 - Contrato `CognitiveRun` | Fases 0-2 | Identidad, estados y persistencia |
| T02 - Semantic Gateway | Fases 1-2 | Ontología y contrato de proveedor |
| T03 - Jev en ingesta | Fases 3-4 | Episodios y cards |
| T04 - Jev en recuperación | Fase 5 | Grafo y candidatos |
| T05 - Continuidad temporal | Fases 6-7 | Episodios versionados |
| T06 - Jev en escenarios | Fase 8 | Modelos y supuestos |
| T07 - Jev en perspectivas | Fase 9 | Registro de modelos |
| T08 - Monitor metacognitivo | Fase 10 | Trazas y métricas |
| T09 - Aprendizaje longitudinal | Fase 11 | Resultados observados |
| T10 - Analogías e innovación | Fase 12 | Grafo semántico |
| T11 - Integración de extremo a extremo | Fase 13 | Contratos anteriores |
| T12 - Observabilidad y ablaciones | Fases 14-15 | Trazas completas |

**Regla de integración\:** cada hito transversal debe tener al menos un productor real, un consumidor real, persistencia cuando corresponda y una prueba que atraviese el límite entre módulos.

No aceptaríamos una implementación donde `semantic-gateway.ts` existe pero ningún servicio lo utiliza, o donde el `CognitiveRun` se registra pero no puede recuperarse tras reiniciar.

---

# 18\. Prueba final de continuidad cognitiva

El experimento de aceptación de ambas campañas será una historia distribuida a lo largo de varios días simulados, varias sesiones y múltiples agentes.

### Escenario de prueba

Una empresa recibe una incidencia que afecta a clientes, facturación y operaciones. La información llega fragmentada, algunas observaciones son contradictorias y determinados datos se descubren tarde.

El sistema deberá\:

1. Registrar los eventos sin perder procedencia.
2. Reconocer que varias observaciones pertenecen al mismo acontecimiento.
3. Construir episodios y tarjetas cromáticas.
4. Relacionarlos con experiencias anteriores.
5. Mantener una historia del proceso.
6. Reconstruir qué se sabía en cada momento.
7. Identificar el estado presente.
8. Analizar la situación desde perspectivas técnica, financiera y operativa.
9. Detectar incertidumbres y contradicciones.
10. Solicitar recuperación adicional cuando esté justificada.
11. Construir escenarios futuros con supuestos explícitos.
12. Proponer una intervención.
13. Enviarla al runtime para su validación y aprobación.
14. Registrar el resultado de la intervención.
15. Comparar resultado esperado y real.
16. Proponer un aprendizaje.
17. Recuperar ese aprendizaje en una tarea posterior.
18. Transferir la evidencia pertinente a otro agente autorizado.
19. Reiniciarse y reconstruir su estado cognitivo.
20. Explicar qué fuentes, modelos y evaluaciones sustentaron sus conclusiones.

La prueba debe comparar el sistema completo con el baseline, así como versiones sin Jev, sin grafo, sin memoria temporal y sin metacognición.

**La capacidad final que buscamos no es que el agente parezca consciente en una conversación. Es que mantenga continuidad, interprete evidencia, corrija modelos y mejore decisiones de forma comprobable.**

---

# 19\. Criterios de éxito de la campaña complementaria

**Integración\:** todos los módulos cognitivos activados participan en rutas reales del runtime, sin duplicar kernel, Event Bus o Thought Graph.

**Jev transversal\:** sus operaciones están tipadas, versionadas, medidas y disponibles desde varios nodos mediante un único gateway.

**Continuidad\:** las tareas y acontecimientos sobreviven a límites de contexto, sesiones y reinicios.

**Temporalidad\:** pasado observado, presente proyectado y futuro simulado permanecen separados y trazables.

**Metacognición\:** el sistema monitoriza y regula sus estrategias con métricas externas al propio LLM.

**Aprendizaje\:** los resultados verificados pueden mejorar recuperaciones y análisis posteriores.

**Seguridad\:** las nuevas capacidades no alteran permisos, SOPs o políticas sin autorización.

**Validación\:** los beneficios de Jev, el grafo, la atención y la metacognición se distinguen mediante experimentos controlados.

## 20\. La arquitectura resultante

Al finalizar NC-01 y NC-02, AgntiaPro tendría cinco subsistemas complementarios\:

**1\. Sistema de experiencia.** Observa acontecimientos, los convierte en episodios y conserva su historia.

**2\. Sistema de conocimiento.** Organiza cards, cromos, relaciones, abstracciones y modelos explicativos.

**3\. Sistema de atención.** Decide qué información debe estar activa en cada momento, utilizando recuperación híbrida, Jev y Global Workspace.

**4\. Sistema metacognitivo.** Monitoriza incertidumbre, estrategias, contradicciones y rendimiento, y regula los ciclos de razonamiento.

**5\. Sistema ejecutivo.** Verifica y ejecuta acciones mediante el runtime determinista, con eventos, aprobaciones y SOPs.

La conexión entre ellos produce el circuito\:

**EXPERIENCIA**

Observación · Episodios · Historia

**CONOCIMIENTO**

Cromos · Grafo · Modelos

**ATENCIÓN**

Jev · Asociaciones · Global Workspace

**RAZONAMIENTO Y METACOGNICIÓN**

Slow LLM · Contraste · Autoregulación

**EJECUCIÓN Y RESULTADO**

Kernel · SOPs · Verificación

El resultado observado vuelve a experiencia, conocimiento y aprendizaje.

La propiedad más importante no será la cantidad de módulos ni la complejidad del grafo. Será que **el sistema puede conservar y revisar una representación del mundo a través del tiempo, utilizando múltiples modelos sin confundir observación, interpretación, predicción y decisión**\.

Ese es el objetivo ingenieril de la consciencia sintética funcional de AgntiaPro.

**NC-01 construye los mecanismos. NC-02 define cómo circulan, cooperan, se miden y producen capacidades de conjunto.** Ambas campañas deben ejecutarse como una sola arquitectura integrada, con Jev presente en los puntos semánticos de mayor valor y el kernel conservando siempre la autoridad determinista.
