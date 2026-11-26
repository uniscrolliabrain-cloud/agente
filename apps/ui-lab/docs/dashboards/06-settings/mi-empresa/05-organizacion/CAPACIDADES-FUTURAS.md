# Organización — catálogo de capacidades futuras

Superficie actual: `organizacion`. Referencia UX: Equipo. Diseño prospectivo para la meta-app, no auditoría de implementación.

## Capacidades a representar

| Capacidad | Experiencia demo | Contrato futuro esperado |
|---|---|---|
| Organigrama actual y futuro | Abrir organigrama actual y futuro, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para organigrama actual y futuro: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Diseño de puestos | Abrir diseño de puestos, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para diseño de puestos: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Matriz de responsabilidades | Abrir matriz de responsabilidades, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para matriz de responsabilidades: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Perfiles humanos | Abrir perfiles humanos, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para perfiles humanos: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Perfiles de agentes | Abrir perfiles de agentes, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para perfiles de agentes: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Capacidades y límites | Abrir capacidades y límites, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para capacidades y límites: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Turnos | Abrir turnos, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para turnos: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Delegación | Abrir delegación, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para delegación: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Carga de trabajo | Abrir carga de trabajo, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para carga de trabajo: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Plan de contratación | Abrir plan de contratación, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para plan de contratación: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Simulación de reorganización | Abrir simulación de reorganización, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para simulación de reorganización: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Handoff humano-agente | Abrir handoff humano-agente, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para handoff humano-agente: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |

## Escenario Agntia Demo

Diseñar el reparto entre LAIA, Marcos, Antonio, Juan, Ana y Pedro, con autoridad final del owner y responsabilidades explícitas.

## Contrato transversal de capacidad futura

Todas las capacidades son propuestas de producto, no endpoints existentes ni promesas de disponibilidad. En UI Lab se representan con datos locales reproducibles, acciones reversibles y estados explícitos; no se llama a proveedores reales. Cada capacidad debe admitir explorar, editar borrador, guardar, revisar evidencia, comparar y solicitar aprobación cuando corresponda. Las conversaciones de LAIA se vinculan a idea, dimensión, revisión y fuentes; nunca cambian directamente la versión activa. El resultado estructurado se guarda como propuesta con identificador estable, tenant, autor, procedencia, fecha lógica, estado, dependencias y revisión. Cognition estructura, JEV valida contratos, kernel autoriza y runtime ejecuta SOPs/skills deterministas; LAIA comunica. Las operaciones externas requieren capacidades registradas, permisos, aprobación según política, idempotencia, auditoría y tratamiento de resultados ambiguos. No inventar nombres de endpoints ni afirmar wiring existente. 

## Estados e interacción de demo

Vacío, explorando, borrador, necesita información, listo para revisar, aprobado, conflicto, publicado en demo y error recuperable. Mostrar la diferencia entre hechos, hipótesis y propuestas. La vista previa no ejecuta. Publicar en demo cambia únicamente la revisión local simulada; preservar historial y permitir volver a la versión previa simulada. Las cifras se derivan de fixtures compartidas, no de porcentajes decorativos. Reutilizar UX existente y mantener el copy humano de la landing.

## Criterios de aceptación

Cada capacidad tiene una entrada visible o contextual, un resultado consultable y una interacción demostrable; no botones mudos. Se puede continuar desde una conversación, vincular la propuesta a otra dimensión y conservar el original. No sustituir el entorno operativo ni modificar sus datos. Validar desktop y móvil, navegación, estados vacíos y error, accesibilidad y consistencia editorial. La implementación backend será una campaña posterior con inventario de código, contratos y pruebas reales.
