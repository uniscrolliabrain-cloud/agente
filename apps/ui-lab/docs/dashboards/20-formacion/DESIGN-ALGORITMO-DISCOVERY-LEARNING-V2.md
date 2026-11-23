# AgntiaPro Formación · Discovery & Learning Engine V2 · Concept design

**Estado:** propuesta de producto y contratos, NO motor implementado. Fuente editorial: [METADATA-120-CURSOS.json](./METADATA-120-CURSOS.json), 120 IDs canónicos IA01–IA60, R01–R50 y P01–P10. **Cognition V2 TRUE** es una designación de arquitectura objetivo, no una bandera cuya existencia se haya verificado. No introducir nuevo camino cognitivo V1.

## 1. Tesis: de engagement a utilidad comprobada

Spotify inspira las colecciones, continuidad y serendipia; YouTube inspira contexto, satisfacción explícita y feedback negativo; Google inspira recuperación por intención, relevancia semántica, calidad y diversidad; Facebook/Meta inspira la ponderación contextual de relaciones, pero **no** el crecimiento del tiempo de pantalla ni el uso de relaciones personales sin consentimiento. Estos son **patrones públicos**, no afirmaciones sobre fórmulas internas o pesos secretos.

**Función objetivo AgntiaPro:** maximizar utilidad profesional esperada y progreso verificable, condicionado por consentimiento, seguridad, tiempo disponible y preferencias explícitas. No usar horas vistas, scroll, autoplay, ansiedad, vulnerabilidad ni conversiones comerciales como objetivo principal. No inferir rendimiento de empleados para RRHH.

Referencias públicas:
- Google Search ranking systems: https://developers.google.com/search/docs/appearance/ranking-systems-guide
- Google helpful people-first content: https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- YouTube recommendations: https://support.google.com/youtube/answer/16089387?hl=en
- Spotify Engineering: https://engineering.atspotify.com/
- Meta Transparency Center: https://transparency.meta.com/

## 2. Qué significa cada señal

**Contenido (120 registros):** ID estable, título canónico, track, categoría, etiquetas, objetivo, nivel, prerrequisitos, duración, conectores candidatos, capacidad propuesta, estado editorial, procedencia y restricciones. Metadata actual es semilla editorial, no etiquetado humano verificado ni embedding calculado. La duración es objetivo, no medición.

**Contexto declarado:** objetivos de aprendizaje, rol opcional, conocimientos autoevaluados, idioma, tiempo disponible, preferencias, modalidad y tema elegido. Siempre editable y con opción de «sin personalización».

**Interacción explícita en Formación:** guardado, «quiero aprender», «no me interesa», ocultar, repetición voluntaria, valoración de utilidad, práctica iniciada y práctica completada **solo con evidencia y autorización**. Ver un vídeo entero NO demuestra competencia.

**Señales de trabajo:** únicamente datos agregados, mínimos, consentidos y pertinentes al propósito; jamás lectura silenciosa de correos, actividad personal o datos sensibles para perfilar formación. No puntuar productividad de empleados.

**Calidad editorial:** revisión humana, exactitud, fecha de validación, accesibilidad, derechos audiovisuales, funcionalidad realmente disponible. Material en draft no es publicable; bloqueos de licencia/privacidad prevalecen sobre cualquier score.

## 3. Pipeline propuesto

1. **Ingesta y QA**: validar JSON, unicidad de 120 IDs, referencias, taxonomía, licencias, estados y versión.
2. **Candidate generation**: por búsqueda semántica y lexical, colecciones, prerrequisitos, tema activo, objetivos, novedad editorial y «continuar». En cold start usar declaración voluntaria y catálogo curado.
3. **Eligibility gate**: tenant/actor/purpose/consent, disponibilidad, edad si corresponde, licencias, permiso para datos, accesibilidad, estado publicado. **Fail-closed**.
4. **Ranker determinista inicial**: score explicable de utilidad, encaje de intención, nivel, novedad, diversidad y práctica verificable; penalización de repetición y prerrequisitos no cumplidos. Pesos iniciales son hipótesis para test A/B, no conocimiento de algoritmos ajenos.
5. **SOP cíclico Cognition V2 TRUE**: snapshot mínimo autorizado → slow LLM propone una secuencia educativa y justificación → JEV AI valida coherencia semántica en **adaptador educativo nuevo** → gate **bloqueante** del kernel autoriza versión y proyección → UI consume solo proyección aprobada. **JEV no sustituye el kernel**. No usar el SOPExecutor observacional actual como aprobación fail-closed.
6. **Re-ranking / slate assembly**: 1 continuar, 2 alta utilidad inmediata, 1 base conceptual, 1 exploración adyacente, 1 elección libre. Evitar saturación por categoría, dificultad o conector.
7. **Feedback loop**: eventos tipados y minimizados, evaluación de utilidad, revisión de deriva, borrado y revocación. No llamar al LLM por cada scroll.

**Si V2 falla:** catálogo editorial estático autorizado o última proyección aún vigente y autorizada; nunca fallback a Cognition V1 ni sugerencias personalizadas sin gate.

## 4. Ranking propuesto, auditable

Score preliminar 0–100:
- 25 × ajuste al objetivo declarado
- 20 × relevancia a la intención actual
- 15 × posibilidad real de practicar con capacidades autorizadas
- 15 × adecuación al nivel y prerrequisitos
- 10 × utilidad explícitamente valorada (con corrección por muestras pequeñas)
- 10 × novedad temática/diversidad
- 5 × calidad editorial y accesibilidad

Aplicar después reglas de cobertura y penalización por repetición. **Nunca** compensar un bloqueo de privacidad, derechos o permisos con un score alto. No basar ranking en popularidad bruta: un curso con 2 valoraciones no debe dominar a otro con 200 por azar.

Una sesión nueva no recibe una pantalla vacía: ofrece «Empieza con LAIA», «Resolver algo hoy», «Entender la IA», «Crear contenido», «Organizar mi trabajo». Sin historial ni perfil también funciona.

## 5. Colecciones UX tipo biblioteca musical, con branding propio

- **Para ti, hoy**: máximo 6 tarjetas, razones explicables.
- **Continúa donde lo dejaste**: progreso de consumo, claramente distinto de práctica superada.
- **Trabaja con LAIA**: R01–R50, acciones pequeñas y CTA contextual.
- **Entiende la IA**: IA01–IA60, conceptos y criterio profesional.
- **Primeros 10 minutos**: P01–P10, onboarding.
- **Por objetivo**: productividad, documentos, equipo, creación, automatización, seguridad.
- **Descubre algo distinto**: exploración acotada, sin aleatoriedad intrusiva.
- **Guardados / No me interesa**: controles explícitos y reversibles.

Tarjeta: título, beneficio en una frase, duración **estimada**, dificultad, disponibilidad de práctica (confirmada / propuesta / no disponible), fuente y «Por qué lo ves». No publicar vídeos no producidos.

## 6. Contratos nuevos propuestos (no existentes)

`CourseMetadataV1`: `id`, `track`, `category`, `topicTags[]`, `learningObjective`, `prerequisiteIds[]`, `capabilityProposal?`, `connectorCandidates[]`, `publicationStatus`, `media.licenseStatus`, `editorialSource`.

`LearningContextV1`: `tenantId`, `actorId`, `purpose`, `consentRevision`, `declaredGoals[]`, `currentIntent?`, `accessibility?`, `learningHistorySummary?` (mínimo autorizado).

`RecommendationCandidateV1`: `courseId`, `reasonCodes[]`, `eligibility`, `scoreBreakdown`, `sourceVersion`.

`TrainingViewProjectionV1`: `projectionId`, `tenantId`, `actorId`, `policyRevision`, `catalogVersion`, `expiresAt`, `kernelDecisionReceipt`, `sections[]`, `reasonCodes[]`.

`LearningFeedbackEventV1`: eventos cerrados y versionados: `course_saved`, `course_hidden`, `course_useful_rated`, `practice_started`, `practice_verified`, `course_completed_viewing` (no equivalente a dominio). Añadir al vocabulario real de eventos solo mediante revisión explícita.

No llamar a campos de aprendizaje `capability` o `attention` sin mapearlos a los contratos existentes. No confundir taxonomía de herramientas, grafo cromático cognitivo y categorías editoriales.

## 7. Métricas y evaluación

Primarias: porcentaje de prácticas verificadas voluntarias, utilidad declarada tras practicar, tiempo hasta resultado, éxito en tareas consentidas. Secundarias: cobertura de categorías, diversidad, precisión de recomendaciones, satisfacción, repetición no deseada. Guardrails: errores de permisos, filtración cross-tenant, sugerencias de funciones inexistentes, licencias no verificadas, carga cognitiva, quejas, exclusiones de accesibilidad. Watch time solo diagnóstico de producción audiovisual, nunca objetivo de optimización.

Tests obligatorios: cold start, historial vacío, usuario que rechaza personalización, dos tenants aislados, revocación OAuth, ausencia de vídeos publicados, resultados duplicados, catálogo corrupto, cambio de política entre propuesta y publicación, expiración de proyección, JEV no disponible, slow LLM no disponible, ausencia de aprobación kernel, señal de práctica falsa, diversidad de colecciones y compatibilidad móvil.

## 8. Roadmap secuencial

**F0 · Higiene editorial:** reconciliar R13–R20 de las entregas de producción con el catálogo canónico antes de usar los guiones como fuente de metadata; revisar objetivos, conectores y estados; no publicar drafts.

**F1 · Catálogo y búsqueda:** JSON semilla → esquema Zod y test de integridad → indexación lexical + búsqueda por intención → colecciones estáticas. Sin LLM.

**F2 · Recomendación gobernada:** contexto declarado y consentimiento, ranker determinista, razones visibles, feedback explícito, métricas y control de repetición.

**F3 · Cognition V2 TRUE:** adaptador educativo de slow LLM y JEV, SOP cíclico, kernel gate bloqueante, proyección versionada, revocación, replay y tests de fallo.

**F4 · Evaluación y mejora:** experimento con cohortes pequeñas, métricas de aprendizaje y utilidad, sin incentivos de retención compulsiva.

**Decisión de producto:** una persona debe poder completar una práctica, cerrar Formación y volver a su trabajo. Eso es éxito.
