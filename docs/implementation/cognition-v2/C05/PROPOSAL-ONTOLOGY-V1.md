# Propuesta de ontologías de tarjetas AgntiaPro

Estado: **DRAFT_FOR_REVIEW**. Fecha: 2026-11-16. Referencia de código consolidado: `754231c` más la edición C09 en curso. Este documento propone semántica; no constituye aprobación del fundador, no activa el motor cromático y no acredita capacidades del proveedor JEV.

## 1. Recomendación y resultado buscado

Adoptar un conjunto pequeño de ontologías coordinadas, en lugar de una etiqueta o color que intente representar todo. Separar: contenido, entidades/relaciones, estado epistémico, orientación cromática, evaluación contextual, sensibilidad/autorización y estado operativo. Mantenerlas versionadas y vinculadas por referencias canónicas.

Objetivo cognitivo: recuperar evidencia útil, distinguir lo sabido de lo supuesto, detectar lagunas y desacuerdos, reutilizar procedimientos y evitar razonamiento repetido. Objetivo empresarial: conectar esa cognición con objetivos, decisiones, responsables y resultados verificables, con coste y latencia medidos.

No se promete mejora cuantitativa sin evaluación. Un esquema más rico también puede añadir ruido, tokens y coste; se introducirán facetas por ablación y solo se activarán las que aporten valor.

## 2. Ontología de contenido: ocho familias

Una tarjeta tiene una familia principal estable. Departamento, entidades, proyecto y orientación son facetas, no nuevas clases para cada combinación. Una síntesis es una vista que cita tarjetas/revisiones y no reemplaza sus afirmaciones atómicas.

| Familia / ID | Contenido mínimo | Ejemplo y restricción |
|---|---|---|
| Observación / `observation` | sujeto, predicado, valor/unidad, tiempo de validez, fuente | «El ERP registra 12 facturas vencidas». Que conste en una fuente no demuestra que la fuente refleje toda la realidad. |
| Hipótesis / `hypothesis` | explicación propuesta, evidencia a favor/en contra, alternativa, forma de refutarla | «Los retrasos podrían asociarse al cambio de facturación». No crea causalidad demostrada. |
| Riesgo / `risk` | condición/evento adverso, objetivo/activo afectado, horizonte, consecuencias, controles existentes | «La falta de liquidez podría afectar a nóminas». Probabilidad e impacto desconocidos se marcan como tales. |
| Oportunidad / `opportunity` | objetivo, alternativa, baseline, beneficio/coste esperado con supuestos, horizonte | «Revisar cobros podría liberar caja». Estimación y resultado realizado van separados. |
| Procedimiento / `procedure` | referencia y versión de SOP/capacidad, precondiciones, entradas, postcondiciones, evidencias de uso | «Procedimiento aprobado de reclamación». El texto recuperado no es código ejecutable ni modifica el SOP. |
| Decisión / `decision` | problema, opciones, tradeoffs, recomendación, autoridad requerida; recibo si ya se decidió | «Proponer un plan de cobro». Estado propuesta hasta que exista decisión autorizada; aprobación no equivale a ejecución. |
| Resultado / `outcome` | tarea/acción y recibo autoritativo, estado real, métricas observadas, alcance y limitaciones | «Se enviaron 8 de 12 avisos». Partial, failed y unknown nunca se muestran como éxito completo. |
| Laguna / `knowledge_gap` | pregunta concreta, por qué importa, evidencia que falta, quién/fuente autorizada puede resolverla | «No conocemos qué facturas están disputadas». Ausencia de evidencia no es evidencia de ausencia. |

Las ocho familias no son las cinco memorias. Una observación puede originar un episodio; un procedimiento puede referenciar memoria procedimental; la memoria autobiográfica resume experiencia atribuida al actor; la de trabajo tiene TTL; la semántica necesita consolidación respaldada. No se escriben ocho copias ni se comparte memoria privada por defecto.

## 3. Ontología empresarial: referencias, objetivos y relaciones

Entidades iniciales: objetivo, indicador, empresa/cliente/proveedor, persona/rol, proyecto, proceso/SOP, tarea/acción, documento, activo, control y recurso/presupuesto. Se reutilizan los IDs del dominio y del runtime; no se crea otra fuente autoritativa de clientes o tareas.

Toda afirmación relevante debe señalar el objetivo, sujeto y horizonte a los que se aplica, cuando se conozcan. Las extensiones sectoriales usan namespaces/versiones; no cambian el significado del núcleo común.

Relaciones base: `about`, `derived_from`, `supports`, `contradicts_candidate`, `depends_on`, `answers`, `recommends`, `produces` y `supersedes`. Las referencias fijan tenant, tipo, ID y revisión. Soporte, causalidad, dependencia operativa y similitud son relaciones distintas.

- JEV puede proponer similitud o contradicción con anclas de evidencia; su aceptación estructural no demuestra verdad semántica.
- Una contradicción compara mismo sujeto/predicado, periodo, unidad y alcance. «Saldo enero=10» y «saldo febrero=12» no se contradicen por tener valores distintos.
- Dedupe exacto usa identidad/digest. Dedupe semántico propone agrupación, conserva fuentes y requiere reglas/revisión antes de fusionar.
- `causes` no se crea a partir de similitud o correlación. Una causalidad propuesta sigue siendo una hipótesis identificada.
- Revocar una fuente invalida sus derivados y cachés; no destruye el historial de auditoría.

## 4. Estado epistémico separado de ciclo de vida

Reutilizar los significados V2: `unknown`, `reported_fact`, `hypothesis`, `inference`, `verified_fact`. La contradicción debe además tener relaciones/estado de disputa propios: una discrepancia candidata no convierte automáticamente el contenido en falso. El valor legacy `contradicted` requerirá adaptación explícita a ese modelo.

El estado epistémico corresponde a cada afirmación atómica. Una tarjeta con varias afirmaciones debe conservar sus estados por separado; su resumen no recibe automáticamente el estado más fuerte. Por ejemplo, verificar facturas vencidas no verifica una predicción de impago.

`verified_fact` requiere un verificador de dominio y evidencia comprobable. La mera presencia de una referencia con kind=receipt no basta: se comprueban existencia, tenant, emisor, revisión/digest, alcance y estado del recibo. El kernel acredita hechos de su runtime; no verifica por sí solo cualquier afirmación sobre el mundo exterior.

Ejemplos: un ACK acredita una entrega dentro de su contrato, no que el usuario comprendió el contenido; un recibo de pago acredita lo que confirme el sistema financiero autorizado, no toda la solvencia del cliente.

Mantener independientes: vida del conocimiento (candidate/active/superseded/expired/revoked), decisión empresarial (proposed/approved/denied), ejecución (queued/running/partial/completed/failed/unknown) y entrega (selected/leased/rendered/sent/acknowledged). La compatibilidad exacta con los enums actuales requiere contratos y migraciones; no se añade un enum mezclado.

## 5. Ontología cromática: seis polos en tres pares

Recomiendo **tres ejes descriptivos con dos polos cada uno**, seis polos en total. Es una elección de diseño nueva y explícita, pendiente de aprobación; no afirmación de que esa fuera la intención histórica ni requisito ya satisfecho.

| Eje | Polo A | Polo B | Pregunta que resuelve |
|---|---|---|---|
| Estrategia de conocimiento | `explore`: explorar alternativas/datos nuevos | `apply`: aplicar conocimiento/procedimientos existentes | ¿Hay que ampliar la búsqueda o reutilizar lo conocido? |
| Trabajo epistémico | `generate`: formular opciones/explicaciones | `verify`: contrastar con fuentes/pruebas | ¿Necesitamos producir hipótesis o comprobarlas? |
| Orientación empresarial | `expand`: desarrollar valor/capacidad/crecimiento | `protect`: preservar continuidad, obligaciones y activos | ¿Qué potencial de mejora y qué protección exige el caso? |

A/B no significan bueno/malo. Verificar no siempre es mejor que generar, ni proteger siempre mejor que expandir. La selección depende del objetivo y del estado de evidencia. Ningún polo otorga autonomía ni permisos.

Representación: dos intensidades independientes por eje, cada una en [0,1] o null si desconocida, con anclas de evidencia y procedencia. No se fuerza que sumen uno. Una oportunidad arriesgada puede tener expansión y protección altas; un análisis puede requerir generación y verificación altas.

Se puede derivar una diferencia A−B para visualización, pero no reemplaza los valores originales. Una coexistencia elevada de polos no demuestra contradicción factual; su nombre es demanda simultánea. Unknown no se codifica como cero. En UI cada señal tiene etiqueta/texto accesible; el color es ayuda visual, no el único canal.

No recomiendo introducir física literal, osciladores, atracción global iterativa o geometría hexagonal como motor de decisión inicial. Empezar con funciones puras, relaciones explicadas y ranking acotado. Si una dinámica adicional mejora resultados en un experimento controlado, se evalúa como algoritmo separado y versionado.

## 6. Diez dimensiones de evaluación

Estas dimensiones no son diez permisos ni diez emociones. Las propiedades estables se guardan con la revisión; relevancia, urgencia y disponibilidad de recursos se recalculan respecto al objetivo, tiempo y consumidor autorizados. No existe una puntuación universal de tarjeta.

| Dimensión | Definición operativa y fuente |
|---|---|
| 1. Relevancia para el objetivo | Relación con la petición/objetivo actual. Ranking contextual, nunca ACL. |
| 2. Respaldo de evidencia | Ausente, indirecto, directo o corroborado por verificación independiente, con fuentes concretas. Más fuentes correlacionadas no equivalen a corroboración. |
| 3. Impacto empresarial | Beneficio y daño potencial separados, horizonte, rango/unidad y supuestos. No mezclar euros, porcentaje y reputación en una cifra sin normalización explícita. |
| 4. Urgencia | Tiempo restante para una fecha/ventana verificada y consecuencias de esperar. La alarma verbal de un modelo no crea un deadline. |
| 5. Novedad | Diferencia respecto al conocimiento autorizado de ese actor/objetivo. La familiaridad para un agente no es novedad global de la empresa. |
| 6. Preparación para actuar | Completitud de entradas, evidencias y dependencias. Estar preparado no significa tener permiso. |
| 7. Incertidumbre | Incertidumbres de datos, modelo/supuestos y futuro, con razones. Un score del proveedor no es probabilidad calibrada de verdad. |
| 8. Conflicto de evidencia | Discrepancias relevantes con anclas/periodo; distinguir candidato y conflicto confirmado por revisión/verificador. |
| 9. Vigencia | Edad, periodo de validez, revisión de fuente, expiración y revocación. «Nuevo» no implica correcto. |
| 10. Coste de resolución | Estimación por separado de tiempo, tokens/dinero y recursos necesarios; coste real se registra al terminar. |

Contrato de dimensión: valor tipado o null, unidad/escala, origen, evidenceRefs, evaluatedAt, targetGoalRef, sourceRevision, methodVersion y calibración si existe. No se fabrican diez decimales para una tarjeta sin evidencia. Para comenzar basta con la evidencia disponible: dimensiones faltantes se omiten del ranking o activan una laguna.

La confianza del clasificador en su etiqueta va en la anotación de clasificación, separada de la incertidumbre de la afirmación y del respaldo de evidencia. Una etiqueta risk con alta confianza no significa que la probabilidad del riesgo sea alta.

## 7. Reparto entre Slow, JEV y kernel/runtime

| Actor | Responsabilidad | Frontera |
|---|---|---|
| Slow LLM | Extraer afirmaciones atómicas, proponer familias/hipótesis, sintetizar fuentes, alternativas y preguntas; producir candidatos estructurados | No inventa citas, no crea evidencia ni aprueba/ejecuta; salida de modelo siempre propuesta |
| JEV, mediante puerto | Si su API real lo soporta: clasificar, comparar, proponer relaciones/contradicciones y facetas con incertidumbre/abstención | Sin escritura directa, herramientas empresariales ni permisos; no es árbitro de verdad |
| Servicios cognitivos deterministas en engine | Validar ontología/esquemas, normalizar valores, resolver refs, calcular scores derivados, aplicar política de proyección, persistir/replay | No son un segundo kernel; aceptar metadata no acredita el hecho descrito |
| Kernel/runtime/PDP | Identidad, aislamiento, autorización, aprobaciones, límites, transiciones, idempotencia, recibos y auditoría; ejecutar solo por el runtime existente | Agnóstico de colores; no contiene reglas semánticas específicas ni trata una sugerencia LLM como orden |
| Fundador y revisores autorizados | Aprobar versiones de ontología y cambios semánticos; revisar casos de alto impacto o desacuerdo según política | No hace falta revisar manualmente cada tarjeta de bajo riesgo; la revisión se gobierna por reglas |

No se ha verificado que el proveedor que el fundador denomina JEV/jev.ay ofrezca todas esas operaciones. Son requisitos del puerto propuesto, no capacidades comerciales confirmadas. Si no las ofrece, se conservan operaciones disponibles y baseline determinista con abstención. No se atribuyen independencia estadística ni doble verificación a dos llamadas/modelos sin evaluarlas.

Flujo: evento autorizado → job Slow durable → candidatos con fuentes → validación/minimización → evaluación semántica opcional → señal persistida → validación de contratos/políticas en engine y kernel → tarjetas/revisiones/grafo/memorias → ContextServing → Fast/Presenter. Las acciones empresariales propuestas siguen por su flujo separado de runtime/aprobación/recibos. Si JEV falla, se conserva el candidato y su estado; no se marca verificado ni se bloquea Fast.

## 8. Comportamiento cognitivo y recuperación

Antes del scoring, filtrar tenant/actor, políticas, revocación, revisión vigente y consumidor. La omisión de un recurso por ACL no se expone como pista de que existe. El proveedor recibe segmentos mínimos autorizados y un conjunto acotado de candidatos; no acceso libre al grafo.

Recuperación en dos etapas: candidatos por entidades/objetivo/tipo y recuperación existente; reranking autorizado por relevancia/evidencia/vigencia/urgencia y diversidad. Elegir evidencia, procedimiento y laguna complementarios puede ser más útil que diez resúmenes similares. Toda penalización o preferencia se versiona y se evalúa, sin pesos arbitrarios declarados óptimos.

Exploración alta más incertidumbre y valor para el objetivo puede proponer investigación; verificación alta más conflicto puede proponer contrastar fuentes; aplicación alta más procedimiento vigente puede sugerir un SOP. Todas son propuestas de trabajo, sujetas a presupuesto y autorización. Una contradicción importante no se elimina del contexto solo por ser incómoda.

No calcular relaciones entre todas las tarjetas (coste cuadrático). Usar vecindarios/candidatos acotados, cambios de fuente y consolidación asíncrona. Separar metadatos persistentes de la representación compacta para Fast: Fast recibe resumen, estado epistémico, evidencia/refs y siguiente paso pertinente, no toda la ontología en cada prompt.

## 9. Ejemplo completo de uso empresarial

Caso sintético: el ERP autorizado muestra varias facturas vencidas. La vista genera:

1. Observación: facturas/fechas/importes/periodo y referencia de consulta. `reported_fact` salvo verificador de dominio que acredite un alcance concreto.
2. Hipótesis: ciertos retrasos podrían deberse a disputas; no se afirma causalidad.
3. Riesgo: exposición de caja, con importe/horizonte y supuestos; probabilidad null si no se puede estimar.
4. Oportunidad: priorizar gestión de cobros con beneficio estimado separado del cobrado real.
5. Laguna: falta identificar qué facturas están disputadas.
6. Procedimiento: SOP de cobro vigente con entradas y restricciones, por referencia.
7. Decisión: proponer revisar disputas antes de reclamar; autorización humana/automática según la política real.
8. Resultado posterior: recibo de qué consultas/envíos/cobros se completaron, cuáles fallaron y qué queda pendiente.

Slow propone las tarjetas y explicaciones. JEV puede sugerir que dos observaciones son redundantes o que una afirmación choca con una fuente del mismo periodo. Los servicios contrastan anclas/revisiones y mantienen el desacuerdo como candidato cuando proceda. El kernel decide si el actor puede leer, solicitar o ejecutar cada operación. La clasificación protect no autoriza bloquear cuentas ni contactar clientes.

Perfil cromático ilustrativo, no medido: la tarjeta de riesgo puede requerir protect y verify; la oportunidad expand y generate; el SOP apply. No se fijan números de ejemplo que puedan confundirse con probabilidades del caso.

## 10. Eficiencia, evaluación y condiciones de adopción

Primero dedupe exacto/revisión; después evaluación semántica solo para nuevas tarjetas, fuentes cambiadas, desacuerdos relevantes o consolidación programada. Cachear señales por tenant/actor o ámbito autorizado, source digest/revision, ontología/taxonomía, política, versión del clasificador y conjunto/contexto de comparación. Nunca reutilizar entre tenants ni mantener resultados revocados.

El baseline sin JEV debe funcionar. Comparar mediante ablaciones: A) tipos/evidencia/refs; B) A más diez dimensiones disponibles; C) B más seis polos; D) C más JEV verificado. Así se identifica si aporta valor la estructura, el clasificador o ninguno, y se retira una faceta costosa que no ayude.

Corpus revisado: cobros, ventas, soporte, operaciones, seguridad, permisos; multitenant, español/inglés, fuentes desactualizadas, duplicados, contradicciones temporales, unidades distintas, prompt injection, intentos de autoaprobación y evidencia inexistente. Mantener partición de evaluación fuera de prompts/ejemplos de entrenamiento. Las etiquetas ambiguas admiten desacuerdo humano y abstención.

Medir: éxito empresarial verificado y por tipo de tarea, precisión del contexto/evidencia, errores de certeza, falsos positivos de contradicción, preguntas útiles y redundantes, exactitud de receipts, tokens/coste por tarea exitosa, llamadas evitadas, TTFT/latencia p50/p95/p99, reintentos, estabilidad tras revisiones, y calidad de calibración cuando existan scores probabilísticos. Separar fixtures de proveedor real. Medir en el mismo corpus/carga/configuración y no fijar ahora un porcentaje de mejora ni SLA inventado.

Condiciones duras: cero cruces de tenant en pruebas adversariales, cero autoridad operativa desde clasificaciones, ausencia de referencias revocadas y de éxitos sin recibo. Umbrales de calidad/coste/latencia se fijan con el baseline; no usar «cero observado» como prueba universal de ausencia de fallos.

## 11. Versionado, migración e implementación

Propuesta inicial: `ontologyId=agntiapro.cards`, `ontologyVersion=1.0.0-draft.1`; versiones independientes de familia, relaciones, perfil cromático, evaluador y esquema de transporte. Cambiar el significado de un polo/unidad es cambio semántico, no una simple traducción.

Los cinco kinds legacy no se renombran a polos: logic→faceta de razonamiento, physics→faceta experimental legacy, intent→relación con objetivo, memory→referencia de memoria, policy→referencia de política autoritativa. Esos mappings son propuestas de catalogación, no equivalencias automáticas ni ejecución. Los seis kinds de CognitionCard V1 requieren adaptación aparte: risk/opportunity/question tienen candidatos claros, insight/summary/decision necesitan inspección del contenido y del recibo. Una tarjeta decision antigua no se importa como aprobación.

Migración: inventario/dry-run, mapping con procedencia y campos no resueltos, preservar desconocidos, aprobación de versión, shadow por tenant sintético, comparación, backfill reanudable y validado, lectura progresiva y rollback por versión. No borrar datos ni reinterpretar todo legacy por una regex.

Trabajo concreto sobre el código actual:

- `cognition-v2.ts` aún tiene clasificación mínima risk/question/summary/uncertain y cinco señales; no implementa las ocho familias ni las diez dimensiones propuestas.
- El registro cromático soporta ejes/versiones, pero falta el contrato semántico completo, política de desconocidos y representación de dos intensidades. El normalizador actual convierte ausencia a cero: debe cambiar para este diseño.
- El kernel sigue genérico; contratos, extracción, clasificación y motor cromático viven en domain/engine.
- Implementar y probar contratos, autorización de aprobaciones, catálogo, adaptadores, proyección/replay, gateway, recuperación y benchmarks antes de activar.
- La integración JEV sigue condicionada a verificar su API/contrato y probarla; esta propuesta no crea un cliente ficticio.

## 12. Decisión que resuelve el documento

Recomiendo aprobar, como siguiente versión experimental y no como certificación de rendimiento: ocho familias de contenido; objetivos/refs/relaciones tipadas; seis polos en tres pares con intensidades independientes; diez dimensiones tipadas/contextuales con unknown explícito; Slow productor, JEV evaluador opcional, engine semántico determinista y kernel único autoritativo. No usar un score único ni física semántica global en la primera activación.

La solicitud de una propuesta no equivale a aprobación. Hasta una decisión explícita del fundador y sus pruebas, permanece DRAFT_FOR_REVIEW y C05 BLOCKED_DECISION.

## Fuentes del proyecto contrastadas

- `apps/server/src/kernel/cromos/cromo.ts`: cinco kinds y estado pending.
- `docs/estado/FUTURE.md`, sección 6: dos polos y metáfora del campo.
- `docs/campaigns/NC-COORDINATION/CONTRACT-CANDIDATES.md`: seis polaridades/diez dimensiones no aprobadas y dominio fuera de kernel.
- Campañas C05 y C08, ADR-009 y contratos V2 actuales.
