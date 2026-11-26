# Estudio de compilación — catálogo de capacidades futuras

Superficie actual: `estudio`. Referencia UX: Centro de mando editorial. Diseño prospectivo para la meta-app, no auditoría de implementación.

## Capacidades a representar

| Capacidad | Experiencia demo | Contrato futuro esperado |
|---|---|---|
| Mapa de empresa | Abrir mapa de empresa, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para mapa de empresa: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Radar de oportunidades | Abrir radar de oportunidades, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para radar de oportunidades: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Bandeja de decisiones | Abrir bandeja de decisiones, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para bandeja de decisiones: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Ideas paralelas | Abrir ideas paralelas, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para ideas paralelas: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Plan de transformación | Abrir plan de transformación, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para plan de transformación: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Comparador de escenarios | Abrir comparador de escenarios, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para comparador de escenarios: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Briefing de LAIA | Abrir briefing de laia, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para briefing de laia: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Simulador de impacto | Abrir simulador de impacto, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para simulador de impacto: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Seguimiento de dependencias | Abrir seguimiento de dependencias, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para seguimiento de dependencias: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Historial de cambios | Abrir historial de cambios, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para historial de cambios: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |

## Escenario Agntia Demo

El dueño quiere recuperar oportunidades comerciales; LAIA relaciona llamadas perdidas, propuestas y procesos; se abre una iniciativa con dos alternativas y decisiones pendientes.

## Contrato transversal de capacidad futura

Todas las capacidades son propuestas de producto, no endpoints existentes ni promesas de disponibilidad. En UI Lab se representan con datos locales reproducibles, acciones reversibles y estados explícitos; no se llama a proveedores reales. Cada capacidad debe admitir explorar, editar borrador, guardar, revisar evidencia, comparar y solicitar aprobación cuando corresponda. Las conversaciones de LAIA se vinculan a idea, dimensión, revisión y fuentes; nunca cambian directamente la versión activa. El resultado estructurado se guarda como propuesta con identificador estable, tenant, autor, procedencia, fecha lógica, estado, dependencias y revisión. Cognition estructura, JEV valida contratos, kernel autoriza y runtime ejecuta SOPs/skills deterministas; LAIA comunica. Las operaciones externas requieren capacidades registradas, permisos, aprobación según política, idempotencia, auditoría y tratamiento de resultados ambiguos. No inventar nombres de endpoints ni afirmar wiring existente. 

## Estados e interacción de demo

Vacío, explorando, borrador, necesita información, listo para revisar, aprobado, conflicto, publicado en demo y error recuperable. Mostrar la diferencia entre hechos, hipótesis y propuestas. La vista previa no ejecuta. Publicar en demo cambia únicamente la revisión local simulada; preservar historial y permitir volver a la versión previa simulada. Las cifras se derivan de fixtures compartidas, no de porcentajes decorativos. Reutilizar UX existente y mantener el copy humano de la landing.

## Criterios de aceptación

Cada capacidad tiene una entrada visible o contextual, un resultado consultable y una interacción demostrable; no botones mudos. Se puede continuar desde una conversación, vincular la propuesta a otra dimensión y conservar el original. No sustituir el entorno operativo ni modificar sus datos. Validar desktop y móvil, navegación, estados vacíos y error, accesibilidad y consistencia editorial. La implementación backend será una campaña posterior con inventario de código, contratos y pruebas reales.
