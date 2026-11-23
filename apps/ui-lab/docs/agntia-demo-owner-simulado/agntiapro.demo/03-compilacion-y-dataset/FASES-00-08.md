# Ciclo de vida de compilación empresarial — Fases 0 a 8

Este es el **recorrido objetivo de producto y simulación**, no una afirmación de que los nueve niveles estén implementados en el código actual. El progreso de la empresa no debe confundirse con la madurez técnica de AgntiaPro.

## Fase 0 — Génesis: perfil de tenant y sandbox simulada
**Meta:** crear una empresa digital ficticia que el owner pueda explorar antes de conectar nada real.

- Entradas: identidad declarada del negocio, sector, objetivos, tamaño, roles iniciales, problemas percibidos, consentimiento para el ensayo.
- Acciones: crear tenant demo aislado, owner demo, plantilla de 18 taxonomías, 6 dimensiones, actores ficticios, escenarios iniciales y catálogo de vistas.
- Datos: `tenant`, `owner`, `business_profile`, `demo_role`, `scenario`, `fixture_set`, `simulation_clock`.
- UX: primera conversación con LAIA, mapa inicial de la empresa, perfil editable, bienvenida, progreso y primer escenario interactivo.
- Salida: perfil demo trazable y explícitamente ficticio.
- Gate: owner confirma que el retrato de su empresa es suficientemente representativo para iniciar el diagnóstico. No se activan canales reales.

## Fase 1 — Descubrimiento y compilación empresarial
**Meta:** entender y modelar la empresa que se quiere operar.

- Entradas: perfil de fase 0 y entrevistas con owner y actores autorizados.
- Acciones: inventario de servicios, procesos, dolores, causas, oportunidades ROI, objetivos, personas, entidades, relaciones, conocimiento, capacidades, SOPs, canales, riesgos y permisos.
- Clasificación de capacidades: `deseada`, `propuesta`, `simulable`, `implementada`, `verificada`, `habilitada`, `bloqueada`.
- Datos: `pain_point`, `goal`, `process`, `capability`, `sop_definition`, `business_entity`, `relation`, `policy`, `integration_requirement`, `roi_hypothesis`.
- UX: mapa de dolores y soluciones, explorador de procesos, grafo de empresa, propuesta de dos servicios prioritarios.
- Salida: blueprint ontológico y operacional versionado, más backlog de implantación.
- Gate: owner valida el diagnóstico y las prioridades; hipótesis y hechos se distinguen.

## Fase 2 — Construcción y ensayo de la empresa compilada
**Meta:** hacer funcionar una representación simulada completa antes de enseñar o activar operaciones reales.

- Entradas: blueprint aprobado.
- Acciones: generar datos sintéticos relacionados, asignar agentes y tareas, configurar simulaciones de SOP, crear historial, resultados, errores y escenarios.
- Datos: `simulation_run`, `task`, `project`, `agent_assignment`, `mock_tool_call`, `event`, `document`, `approval_request`, `test_case`.
- UX: estudio interactivo, Kanban, Centro de Mando, perfiles, feed, documentos, clientes y timeline con datos consistentes.
- Salida: sandbox funcional para practicar, con cobertura de recorridos completos.
- Gate: escenarios coherentes, sin referencias huérfanas, acciones claramente etiquetadas como simuladas.

## Fase 3 — Academia viva: formación del owner y actores humanos
**Meta:** aprender a usar la empresa digital mediante práctica contextual, no un curso separado del trabajo.

- Entradas: sandbox de fase 2.
- Acciones: recorridos guiados por LAIA, ejercicios de delegación, aprobación, revisión, ventas, incidencias, comunicación y supervisión; prácticas por rol.
- Datos: `training_path`, `exercise`, `attempt`, `competency`, `training_evidence`, `actor_readiness`.
- UX: misiones breves, simulación de consecuencias, ayuda contextual, práctica de conversaciones y recuperación de errores.
- Salida: owner y actores preparados para su responsabilidad.
- Gate: competencias críticas demostradas y permisos entendidos; no basta con pulsar «completado».

## Fase 4 — Beta operativa: PMV con validación obligatoria
**Meta:** activar **dos servicios iniciales de alto retorno**, o el alcance mínimo acordado, de forma controlada.

- Entradas: formación validada, consentimiento, acuerdos y verificaciones pertinentes.
- Acciones: conectar únicamente proveedores autorizados, pruebas end-to-end, control de permisos, observabilidad, rollback, procedimientos de soporte y pilotos con límites.
- Datos: `beta_scope`, `connection_consent`, `verification_run`, `risk_review`, `release_approval`, `deployment`, `rollback_plan`.
- UX: checklist de preparación, matriz de validación, diferencias entre demo y real, aprobación explícita y tablero de beta.
- Gate **obligatorio**: pruebas satisfactorias, revisión de seguridad/privacidad aplicable, aprobación humana, capacidad de reversión y criterios de éxito. Si falla, permanece en sandbox o beta bloqueada.
- Salida: PMV beta autorizado, limitado y monitorizado; nunca una activación automática por progreso visual.

## Fase 5 — Despliegue operativo completo del alcance contratado
**Meta:** pasar de beta a operación estable **de las capacidades verificadas y contratadas**, no de todas las capacidades imaginables.

- Entradas: beta aprobada y resultados de validación.
- Acciones: activar canales y procesos autorizados, asignar responsables, establecer SLAs/soporte, registros, procedimientos de contingencia, documentación y operación recurrente.
- Datos: `service_activation`, `service_level`, `runbook`, `owner_acceptance`, `operational_baseline`.
- UX: empresa operativa, salud de servicios, estado de agentes, incidencias, logros y responsabilidades.
- Gate: aceptación del owner y verificación de cada capacidad en alcance.
- Salida: empresa operativa en el alcance aprobado.

## Fase 6 — Acompañamiento, feedback, ajustes y monitorización
**Meta:** acompañar al owner, medir resultados y mejorar con datos reales autorizados.

- Entradas: baseline de fase 5.
- Acciones: revisiones con fundador/equipo AgntiaPro, análisis de KPIs, satisfacción, incidencias, observabilidad, optimización de SOPs y propuestas de mejora.
- Datos: `feedback`, `metric_observation`, `incident`, `improvement_proposal`, `review_meeting`, `change_request`.
- UX: resumen semanal con LAIA, feed de mejoras, comparativas y recomendaciones explicables.
- Gate: cambios de riesgo requieren nueva validación y aprobación; monitorización no equivale a permiso de ejecución.
- Salida: ciclo continuo de aprendizaje y ajustes.

## Fase 7 — Alpha de evolución: laboratorio de nuevas capacidades
**Meta:** experimentar **nuevas funciones** sobre una empresa que ya tiene operación estable.

- Aclaración: «alpha» aquí significa **laboratorio de evolución**, no degradar la producción estable a una alpha convencional.
- Entradas: necesidades y oportunidades detectadas en fase 6.
- Acciones: prototipos, experimentos aislados, datos sintéticos o anonimizados según autorización, comparativas, evaluación de riesgos y pruebas.
- Datos: `experiment`, `hypothesis`, `variant`, `evaluation`, `promotion_candidate`.
- UX: laboratorio opcional, comparación antes/después, prueba de agentes y nuevas capacidades con separación visual de producción.
- Gate: una capacidad alpha solo pasa a beta mediante validación independiente; nunca por arrastre de la empresa completa.
- Salida: mejoras candidatas a incorporarse a operación.

## Fase 8 — Scale y Digital Twin prospectivo
**Meta:** escalar la empresa y simular escenarios futuros sin confundir previsión con hecho.

- Entradas: modelo operacional histórico y métricas fiables.
- Acciones: simulaciones `what-if` (más leads, nuevos equipos, precios, costes, capacidad, riesgos, estacionalidad), comparación de escenarios, planificación de escalado y seguimiento de decisiones.
- Datos: `twin_snapshot`, `scenario_branch`, `assumption`, `forecast`, `confidence_range`, `scale_plan`, `decision_outcome`.
- UX: gemelo digital, línea temporal futura, escenarios alternativos, simulador de decisiones, exploración de impacto.
- Gate: supuestos, fuentes, incertidumbre y límites visibles; ninguna predicción autoriza una acción financiera o contractual.
- Salida: planificación estratégica asistida, con trazabilidad de hipótesis.

## Máquina de estados y excepciones

`phase_0 → phase_1 → phase_2 → phase_3 → phase_4 → phase_5 → phase_6`. Desde fase 6, nuevas capacidades entran en `phase_7`; fase 8 es una capacidad avanzada opcional que puede convivir con 6 y 7.

Cada fase puede estar `not_started | in_progress | blocked | awaiting_owner | validating | approved | completed`. Registrar `entered_at`, `completed_at`, `owner_id`, `evidence_ids`, `approval_id` y `blocking_reasons`. Repetir formación, revisión o pruebas no borra el historial. El owner puede detener, pausar o retirar autorizaciones. La fase de empresa no habilita automáticamente servicios individuales.

**Dos líneas de realidad:** progreso simulado de onboarding versus autorizaciones y ejecuciones reales. Ambas pueden aparecer en UX, pero nunca mezclarse.
