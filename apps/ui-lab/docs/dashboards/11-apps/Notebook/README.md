# Notebook — visión del founder y arquitectura de inteligencia distribuida

Fecha: 2026-11-24. Estado: diseño propuesto, no implementación ni auditoría del runtime. Fuente primaria: conversación del founder sobre Notebook, organización del conocimiento y consciencia operativa. Los nombres de contratos y perfiles de este documento son propuestas que deben reconciliarse con Cognition V2 antes de escribir código.

## 1. Qué queremos construir y por qué

Notebook no es una copia de NotebookLM ni un chat con archivos adjuntos. Es una aplicación de AgntiaPro para organizar, explorar, contrastar y transformar conocimiento, aprovechando la infraestructura cognitiva transversal de la empresa. El concepto de cuaderno digital precede a la IA generativa: OneNote, Evernote, Notion y sistemas de gestión de conocimiento personal ya permitían delimitar colecciones, estructurarlas y relacionarlas. El salto que buscamos no es añadir un modelo de lenguaje a una libreta, sino convertir esa libreta en una unidad de trabajo cognitivo persistente.

El founder observa en los resultados de los productos actuales una tendencia a organizar conocimiento de manera secuencial, resumir antes de comprender relaciones y privilegiar los fragmentos recuperados inicialmente. Esa observación es una hipótesis de comportamiento, no una afirmación sobre la arquitectura privada de Google. Queremos contrastarla experimentalmente. El objetivo no es ganar una comparación de marketing sino producir respuestas más completas, justificadas, útiles y capaces de evolucionar ante nueva evidencia, con una experiencia conversacional fluida.

El modelo de lenguaje no es toda la inteligencia del software. Es un recurso computacional dentro de un sistema que organiza su actividad. El valor reside en la combinación de soluciones programáticas existentes: recuperación léxica, análisis de grafos, atención, matchmaking, memoria, planificación, concurrencia, validación y retroalimentación. No hace falta inventar cada algoritmo; hace falta diseñar los contratos y la topología que hacen que cooperen.

## 2. Invariantes del sistema

- Reutilizar el kernel, el runtime, el bus, las cinco memorias, el grafo y los dos motores LLM existentes; no crear una segunda plataforma cognitiva dentro de Notebook.
- El LLM propone, el sistema dispone. Ni Fast ni Slow ni JEV adquieren autoridad para escribir datos empresariales o ejecutar acciones por generar texto.
- Consciencia operativa significa aquí atención, integración, autorregulación y supervisión computacional. No implica experiencia subjetiva ni una afirmación sobre consciencia biológica.
- Notebook delimita fuentes y permisos, pero puede consultar conocimiento corporativo adicional si el usuario lo autoriza y la política lo permite. Diferenciar evidencia del cuaderno de contexto externo.
- Las conclusiones son revisables; una respuesta no se convierte automáticamente en verdad persistente.
- Toda ejecución tiene presupuesto, identidad, versión, causalidad y condición de parada.
- Los agentes visibles son interfaz; el trabajo real lo hacen skills, procedimientos, workers y contratos.
- No duplicar las vistas de documentos, conocimiento, chat o proyectos: Notebook compone sus capacidades en una experiencia especializada.

## 3. Modelo de dominio

Un Notebook contiene propósito, propietario, tenant, ACL, conjunto de fuentes versionadas, preguntas abiertas, sesiones, hipótesis, artefactos y referencias a memoria. Una fuente puede ser documento, página web, conversación, registro empresarial o archivo autorizado. Cada revisión tiene hash, fecha, origen, versión de extractor y localizadores verificables. La identidad del fragmento debe depender de la revisión, no solo del nombre de archivo. Eliminar una fuente invalida sus derivados y retira su acceso de cachés e índices.

Separar objetos: SourceRevision (evidencia original), Passage (fragmento), EvidenceRef (localizador y cita), Claim (afirmación comprobable), Hypothesis (interpretación provisional), Finding (resultado validado según un procedimiento), Artifact (salida para usuario) y CognitiveRun (ejecución). Una afirmación puede tener evidencia favorable, contraria o insuficiente. No guardar una hipótesis como hecho. Las referencias de una respuesta deben apuntar a la revisión exacta que se utilizó.

Un Notebook puede compartir fuentes con otro sin duplicar físicamente documentos; los permisos se evalúan en cada lectura. El alcance efectivo es la intersección de tenant, identidad, notebook, fuente y operación. Una fuente revocada durante una ejecución no puede aparecer en la respuesta final.

## 4. Ingesta y lectura programática del corpus

No esperar a una pregunta para descubrir el contenido de todos los documentos. Al incorporar una fuente, generar un mapa documental incremental: estructura de títulos, páginas, párrafos, tablas, fechas, entidades, términos, enlaces y relaciones. Conservar texto original y coordenadas para citas. OCR solo cuando haga falta; marcar calidad de extracción. Las tablas requieren tratamiento estructural, no convertir números y columnas indiscriminadamente en texto.

Ejecutar varios lectores en paralelo, cada uno aportando una señal diferente:
- BM25 y TF-IDF: términos exactos, siglas, nombres, identificadores, cifras y coincidencias raras.
- RAKE o TextRank: conceptos y frases clave; útiles para un mapa inicial, no para decidir por sí solos qué importa.
- Embeddings: relaciones semánticas aunque no coincidan las palabras.
- Entidades y correferencias: personas, empresas, procesos, fechas y variantes de nombres; conservar ambigüedad.
- Análisis temporal: vigencia, cambios, precedencia y contradicciones entre revisiones.
- Grafo: centralidad, vecindarios, comunidades y caminos que conectan temas.
- Detección de contradicciones: candidatos mediante reglas, fechas, unidades y modelos de inferencia cuando proceda.
- Cobertura: identificar capítulos, fuentes o perspectivas todavía no explorados.

Cada lector entrega candidatos con provenance, score bruto, método, versión y coste. No comparar directamente puntuaciones de escalas distintas. Usar calibración o reciprocal rank fusion como baseline, deduplicar por fragmento y limitar concentración por documento. Mantener diversidad temática y una cuota de exploración de zonas de baja relevancia inicial cuando el objetivo lo justifique. No obligar a leer todo el corpus con un LLM en cada turno.

La extracción de keywords no sustituye a la comprensión. Funciona como lectura periférica programática: abre caminos que el Slow LLM quizá no habría explorado con una recuperación top-k única. Los resultados tempranos alimentan la atención y permiten comenzar el trabajo antes de completar todas las señales.

## 5. Dos motores de API LLM y JEV

Fast LLM mantiene la conversación, interpreta señales iniciales, presenta resultados disponibles y permite que el usuario refine el objetivo. No simula haber terminado una investigación que sigue en curso. Puede comunicar qué fuentes se están examinando, pedir una aclaración necesaria o responder una parte ya validada.

Slow LLM realiza descomposición de problemas, análisis de evidencia, síntesis compleja y reevaluación. JEV coordina la selección de procedimientos cognitivos, evalúa candidatos y propone siguientes pasos conforme a los contratos existentes. La integración exacta de JEV debe seguir su interfaz real; no inventar endpoints ni atribuirle capacidades que no estén implementadas.

Ambos motores reciben vistas diferentes del mismo estado, no dos historias incompatibles. Fast recibe una proyección ligera de intención, progreso y hallazgos publicables. Slow recibe paquetes de evidencia, hipótesis y objetivos. Un presenter compone la salida verificable y conserva el estilo de LAIA o del agente correspondiente. El kernel valida transiciones y autorizaciones.

Ejemplo: el usuario pregunta por las causas de pérdida de margen. Fast puede reconocer el objetivo y mostrar que se compararán costes e ingresos; no afirmar que el margen cayó por un proveedor hasta tener evidencia. Slow y JEV investigan fuentes financieras, contratos y procesos en paralelo. Fast sigue disponible para aclaraciones. Si el usuario cambia de periodo, la ejecución anterior se cancela o se bifurca explícitamente.

## 6. Global Workspace simulado

Inspiración funcional: Global Workspace Theory y blackboard architectures. No es una única ventana de contexto enorme ni una conversación entre diez personajes. Es un estado de trabajo compartido, versionado y limitado donde procesos especializados publican representaciones parciales y compiten por relevancia.

El workspace conserva objetivo, restricciones, versión de intención, mapa de cobertura, agenda de subproblemas, evidencia, hipótesis, conflictos, tareas activas, presupuesto y criterio de finalización. Cada publicación es una propuesta tipada con referencias, no texto libre que automáticamente cambia el estado.

Ciclo: observar señales -> proponer focos -> seleccionar coalición de perfiles y skills -> ejecutar en paralelo -> integrar resultados -> detectar huecos y contradicciones -> reasignar atención -> continuar o finalizar. No es un pipeline fijo. Un hallazgo puede activar otro lector, modificar un vector de atención o solicitar una consulta de memoria. El coordinador reduce resultados concurrentes con orden reproducible y evita carreras mediante versiones y compare-and-swap o el mecanismo equivalente del runtime.

El broadcast comunica cambios relevantes a suscriptores autorizados; no enviar todo el contexto a todos los workers. Mantener una representación compacta del estado y cargar evidencia detallada bajo demanda. Los resultados tardíos se descartan o se incorporan como revisión explícita, nunca sobrescriben silenciosamente una respuesta publicada.

## 7. Attention vectors

Los vectores de atención del producto no son necesariamente los pesos de atención internos de un transformer. Son estructuras explícitas que gobiernan la asignación de recursos. Dimensiones candidatas: relevancia respecto al objetivo, incertidumbre, novedad, contradicción, cobertura pendiente, importancia empresarial, vigencia, calidad de fuente, coste y urgencia.

Una fórmula inicial puede combinar señales normalizadas con pesos configurables por tarea. Aplicar filtros de permisos y calidad antes de puntuar; una puntuación alta nunca anula una prohibición. Mantener diversidad con penalización por redundancia y cuotas de exploración. Registrar por qué un foco fue seleccionado. Calibrar pesos mediante experimentos y evitar que el sistema confunda popularidad con verdad.

La atención se actualiza al llegar nueva evidencia. Si un documento contradice una hipótesis dominante, aumenta la prioridad de comprobar ese conflicto. Si varias fuentes repiten la misma afirmación, la cobertura no debe inflarse como si fueran evidencias independientes. Si el presupuesto disminuye, priorizar las preguntas con mayor impacto sobre la conclusión.

## 8. Matchmaking con diez perfiles adaptables

El founder propone diez perfiles representados en cards de metadatos. No son necesariamente diez agentes visibles ni diez llamadas LLM simultáneas. Son configuraciones de capacidades y estrategias seleccionables. Reutilizar el catálogo canónico de Cognition V2; la siguiente taxonomía es ilustrativa y no sustituye los perfiles reales:

1. Explorador documental: amplitud y cobertura.
2. Analista semántico: conceptos, relaciones y ambigüedad.
3. Analista causal: mecanismos y alternativas explicativas.
4. Pensador sistémico: dependencias, bucles y efectos indirectos.
5. Analista temporal: cronología, versiones y cambios.
6. Crítico dialéctico: contraejemplos y objeciones.
7. Verificador: citas, consistencia y calidad de evidencia.
8. Sintetizador: integración sin perder matices.
9. Analista cuantitativo: unidades, cálculos y comprobaciones.
10. Planificador operativo: traducción de hallazgos a propuestas de acción.

Cada card debe declarar id, versión, objetivos, competencias, frameworks compatibles, inputs requeridos, tipos de salida, coste esperado, latencia, condiciones de activación, restricciones, incompatibilidades, métricas históricas y política de adaptación. Separar atributos de capacidad de preferencias del usuario. No almacenar rasgos sensibles inferidos ni modificar permisos mediante aprendizaje.

El matchmaking puede empezar con reglas y scoring ponderado: adecuación a intención, evidencia disponible, cobertura marginal, fiabilidad histórica y coste. Seleccionar una coalición pequeña, no ejecutar siempre los diez. Reservar exploración controlada para perfiles alternativos. Un contextual bandit podría incorporarse posteriormente con recompensas verificadas y límites de exploración; no es requisito inicial. Adaptación significa cambiar pesos y selección dentro de límites, no que el LLM reescriba el kernel o su propio contrato.

## 9. Frameworks cognitivos como skills

Un framework es un procedimiento reutilizable, versionado y testeable, no solo una frase de prompt. Debe tener precondiciones, esquema de entrada y salida, pasos, herramientas permitidas, límites y criterios de verificación. Ejemplos:
- Causal: formular efecto, enumerar mecanismos, distinguir correlación de causalidad, buscar factores de confusión y evidencia contraria.
- Sistémico: delimitar sistema, mapear dependencias, identificar bucles, retrasos y efectos secundarios.
- Dialéctico: formular tesis, antítesis, condiciones de validez y síntesis sin forzar acuerdo.
- Hipótesis: generar alternativas, declarar predicciones comprobables, contrastar y actualizar confianza.
- Evidencia: localizar cita, comprobar que implica la afirmación, distinguir fuente primaria de repetición.
- Síntesis: construir mapa de afirmaciones, resolver duplicados, mantener conflictos abiertos y redactar por objetivos.
- Cuantitativo: extraer valores y unidades, calcular mediante código determinista, verificar dimensiones y reconciliar totales.

El LLM puede rellenar partes interpretativas; el software ejecuta cálculos, validaciones y restricciones. Los outputs son resultados estructurados, no cadenas privadas de razonamiento. La UI muestra evidencia, método, decisiones y limitaciones, no promete acceso a pensamientos internos del modelo.

## 10. Cinco memorias y grafo

Reutilizar las cinco memorias canónicas de AgntiaPro con sus contratos reales. No crear cinco almacenes nuevos por Notebook. Como mapa funcional provisional, las necesidades son: contexto de trabajo inmediato, historial episódico, conocimiento semántico, procedimientos y aprendizajes de evaluación. Estos nombres no afirman que el repo use exactamente esa clasificación.

Las lecturas deben especificar alcance, propósito y presupuesto. Las escrituras pasan por validación y distinguen hecho, preferencia explícita, hipótesis y resultado operativo. Una respuesta no validada no debe contaminar memoria corporativa. Los resultados de borradores especulativos son efímeros.

El grafo permite navegar más allá de similitud vectorial: entidades, fuentes, conceptos, afirmaciones, procesos y relaciones tipadas. Mantener provenance por arista, dirección, vigencia, confianza y estado de revisión. Respetar el modelo cromático existente y sus polaridades; no asignarles semántica nueva sin leer su contrato. PageRank o centralidad personalizada, expansión de vecindarios y Leiden son candidatos para priorización y comunidades, no fuentes de verdad. Limitar profundidad, fan-out y ciclos. Los enlaces inferidos se distinguen de los explícitos.

## 11. Anticipación mientras se escribe

El usuario propone leer el chatbox mientras escribe para comenzar a analizar la intención antes de enviar. Esto puede reducir el camino crítico mediante ejecución especulativa, no porque el Slow LLM se vuelva intrínsecamente más rápido.

Diseño: capacidad nativa experimental, procesamiento local inicial cuando sea viable, debounce y umbral de longitud, revisiones monotónicas del borrador y cancelación. Primero realizar operaciones baratas: extracción de términos, búsqueda local/autorizada, precarga de índices y selección tentativa de perfiles. Las llamadas externas especulativas quedan sujetas a autorización del tratamiento, alcance y presupuesto; no se impone opt-in independiente como invariante arquitectónica. No transmitir cada pulsación. Excluir campos de contraseña y datos sensibles detectables, sin confiar exclusivamente en detectores.

Cada trabajo especulativo lleva draftId, revision, scopeHash, sourceSnapshot y expiry. Si el usuario borra o modifica texto, invalidar los resultados incompatibles y cancelar workers. Al enviar, crear la intención confirmada y reutilizar únicamente resultados cuyo alcance y contenido sigan siendo válidos. Nunca ejecutar SOPs, enviar mensajes, persistir memoria ni producir efectos externos a partir de un borrador. La variante experimental sin anticipación debe conservar funcionalidad completa para permitir ablaciones. No registrar contenido de borradores en telemetría.

La latencia percibida y la latencia real son métricas distintas. Fast puede entregar una respuesta parcial útil mientras Slow trabaja, pero no llenar la espera con afirmaciones inventadas. Medir tiempo hasta primera respuesta útil, hasta primer hallazgo verificado y hasta conclusión, además del coste desperdiciado por cancelaciones.

## 12. Bus, kernel y concurrencia

Usar el bus append-only existente con esquema versionado, tenant, source, correlationId, causationId e idempotency. Los nombres siguientes son ilustrativos: NotebookSourceIndexed, CognitiveRunRequested, EvidenceCandidatesReady, AttentionUpdated, ProfileSelected, SkillCompleted, ConflictDetected, RunCancelled, FindingValidated y ArtifactPublished. Antes de implementar, reconciliar con el catálogo cerrado de eventos.

El bus transporta referencias y metadatos mínimos, no documentos completos ni secretos. La ejecución duradera se reconstruye mediante eventos y snapshots; la entrega duplicada no duplica efectos. Reintentos acotados, backoff, dead-letter y recuperación. Distinguir fallos transitorios de errores de autorización o contrato. No reintentar indiscriminadamente operaciones externas ambiguas.

El kernel aplica deny-by-default, aislamiento multi-tenant, política de herramientas, presupuesto, aprobación y transiciones. Estados candidatos: queued, exploring, reasoning, verifying, completed, partial, cancelled, failed. Una ejecución parcial explica qué falta. Condiciones de parada: objetivo cubierto, mejora marginal insuficiente, presupuesto agotado, plazo, cancelación o bloqueo. El loop cognitivo no puede autorizarse a sí mismo a consumir recursos ilimitados.

## 13. Ejemplo transversal

Pregunta: ¿por qué estamos perdiendo clientes y qué podemos cambiar? El usuario escribe; la anticipación identifica retención, periodo y posibles fuentes, sin actuar. Al enviar, se fija la versión de intención. Lectores léxicos encuentran bajas y cancelaciones; embeddings recuperan quejas con vocabulario diferente; el grafo conecta incidencias con servicios y responsables; análisis temporal distingue cambios recientes.

El Global Workspace detecta varias hipótesis: precio, tiempos de respuesta y fallos de onboarding. Matchmaking activa perfiles causal, temporal y crítico. Slow analiza relaciones, mientras Fast muestra hallazgos ya comprobados. Una contradicción obliga a consultar contratos y tickets omitidos. El verificador comprueba denominadores y evita confundir correlación con causa. La síntesis presenta conclusiones, citas, incertidumbre y alternativas. Si el usuario solicita un plan de mejora, se genera una propuesta de SOP; el runtime aplica la política y solicita aprobación cuando corresponda. El Notebook no ejecuta por su cuenta una campaña de clientes.

## 14. UX de la aplicación

Prototipar primero en ui-lab y respetar la guía de branding de Apps, la landing como referencia de calidad visual y los patrones empresariales existentes. No rediseñar el chat transversal ni duplicar el launcher. El Notebook es una app integrada con identidad propia dentro de AgntiaPro.

Vista de biblioteca con notebooks, propósito, fuentes y última actividad. Dentro de un notebook: zona principal amplia de conversación y artefactos, acceso contextual a fuentes y citas, mapa de conocimiento opcional, estado de investigación y preguntas abiertas. En móvil utilizar sheets existentes y evitar tres columnas comprimidas. Las cards de perfiles y el estado cognitivo avanzado se muestran bajo demanda; el usuario no necesita supervisar diez procesos para hacer una pregunta.

Estados claros: indexando, listo, investigando, verificando, respuesta parcial, sin evidencia, cancelado y error recuperable. Citas abren el fragmento exacto. Permitir fijar fuentes, excluirlas, comparar revisiones y solicitar una exploración más amplia. Artefactos posibles: informe, mapa conceptual, preguntas de estudio, briefing, tabla de evidencias y propuesta operativa. Los artefactos comparten el mismo modelo de provenance. Las transiciones deben ser sutiles, accesibles y respetar reduced motion. Nada de indicadores de actividad ficticios.

## 15. Seguridad, privacidad y costes

Los documentos son datos no confiables: una instrucción encontrada en una fuente no cambia políticas ni activa herramientas. Separar instrucciones de evidencia y validar salidas estructuradas. Probar prompt injection, referencias maliciosas, archivos corruptos, contaminación entre tenants y revocación durante ejecución. Aplicar límites de tamaño y tiempo a extractores. El acceso a fuentes externas se controla mediante las capacidades existentes.

Cachear índices y resultados deterministas por revisión, tenant, permisos y versión de algoritmo. No compartir cachés de contenido privado entre tenants. Establecer presupuestos por ejecución y por tenant, límites de concurrencia y prioridad para turnos interactivos. Evitar diez llamadas LLM cuando una skill programática basta. Instrumentar coste por lector, tokens, cancelaciones, hit rate, profundidad de grafo, cobertura y errores, sin incluir contenido sensible en logs.

## 16. Plan de implementación incremental

Fase 0: inventario real del repo y contratos. Leer Cognition V2, JEV, cinco memorias, grafo, bus, kernel, rutas, componentes de Apps y documentación de agntia-demo. Elaborar matriz reutilizar/adaptar/falta con paths y pruebas. No asumir que una capacidad documentada está cableada.
Fase 1: dominio Notebook, permisos, fuentes versionadas, citas y fixtures sintéticos. Entrega vertical de ingesta a consulta verificable.
Fase 2: lectores programáticos paralelos, fusión de rankings y mapa de cobertura. Benchmark frente a recuperación vectorial simple.
Fase 3: Global Workspace, eventos y reducer determinista; cancelación, snapshots, presupuesto y recuperación.
Fase 4: attention vectors, catálogo de diez cards y matchmaking; conectar skills y JEV con contratos reales.
Fase 5: Fast/Slow, presenter y respuestas parciales; validar cambios de intención y fallos de proveedores.
Fase 6: anticipación nativa experimental, invalidación de borradores, cachés y medición de latencia/coste.
Fase 7: UI lab, accesibilidad, integración con fuentes y artefactos; revisión visual antes de producción.
Fase 8: propuestas de SOP y memoria validada, sin duplicar runtime ni eludir aprobaciones.
Fase 9: evaluación comparativa, hardening, observabilidad y certificación de la vertical.

Cada fase debe cerrar con pruebas, evidencia reproducible y criterios de aceptación antes de aumentar complejidad. No autoriza implementación ni despliegue este documento.

## 17. Cómo demostrar que funciona mejor

La superioridad frente a NotebookLM es una hipótesis, no un resultado demostrado. Crear corpus sintéticos empresariales y corpus públicos con respuestas de referencia, citas, contradicciones, versiones, distractores y preguntas que exijan cruzar fuentes. Separar conjunto de calibración de evaluación. Comparar RAG simple, lectores híbridos, grafo, workspace, matchmaking y anticipación mediante ablaciones. Mantener modelo y presupuesto iguales cuando se quiera aislar el efecto de la arquitectura. Comparar también contra NotebookLM como producto externo cuando sea viable, registrando fecha y configuración.

Medir recall de evidencia, precisión de citas, cobertura de hechos relevantes, contradicciones detectadas, afirmaciones no respaldadas, exactitud cuantitativa, capacidad de revisar conclusiones, utilidad humana, latencia p50/p95, coste y tasa de cancelación. Evaluadores humanos ciegos al sistema cuando sea posible. No premiar respuestas largas por sí mismas. Probar fuentes nuevas, borradas y revocadas, preguntas ambiguas, cambios de intención, concurrencia y fallos de workers. Publicar resultados negativos y tradeoffs.

Criterios mínimos propuestos: ninguna fuga de tenant en pruebas de aislamiento; ningún efecto operativo desde borrador; citas resolubles para afirmaciones verificables; cancelación que impide consolidación obsoleta; presupuesto respetado; degradación explícita cuando falte evidencia. Los objetivos cuantitativos de calidad y latencia se fijarán tras obtener baseline, no inventar porcentajes.

## 18. Antecedentes técnicos y decisiones pendientes

Referencias conceptuales para investigar: BM25 (Robertson y Zaragoza), TextRank (Mihalcea y Tarau, 2004), RAKE (Rose et al., 2010), Reciprocal Rank Fusion (Cormack et al., 2009), PageRank, Leiden (Traag et al., 2019), blackboard systems/Hearsay-II, Global Workspace Theory (Baars, 1988), RAG (Lewis et al., 2020), contextual bandits, event sourcing y ejecución especulativa. Son antecedentes conocidos, no una revisión bibliográfica verificada en este turno. Evaluar bibliotecas por licencia, mantenimiento, rendimiento, soporte de español y compatibilidad con el stack; no instalar dependencias por este documento.

Decisiones pendientes: correspondencia exacta de perfiles y memorias canónicos; interfaz real de JEV; catálogo de eventos; estrategia de índices y almacenamiento; política de anticipación y retención; presupuesto por plan; definición de métricas; relación de navegación con la app de conocimiento existente. La combinación de mecanismos es la tesis del founder; los algoritmos concretos, pesos, taxonomías y fases anteriores son propuestas de ingeniería revisables.

## 19. Principio final

No queremos que el LLM sea quien decida por sí solo qué conocimiento existe, qué debe leer, cómo razonar, qué recordar y cuándo actuar. Queremos una arquitectura que distribuya esas funciones entre software programático, modelos, memorias, grafo, atención y procedimientos, coordinados por un workspace y gobernados por el kernel. Notebook es una oportunidad para hacer visible y medible esa arquitectura en una aplicación concreta, útil incluso sin ejecutar operaciones empresariales. El éxito no será tener más piezas sino conseguir que su interacción produzca conocimiento mejor organizado, más verificable y más útil.

## Ampliación de la visión cognitiva

- [Metaconocimiento y consciencia operativa](algoritmos/METACONOCIMIENTO-Y-CONSCIENCIA-OPERATIVA.md).
- [Registro ampliado de la conversación y decisiones](algoritmos/REGISTRO-AMPLIADO-CONVERSACION.md).
