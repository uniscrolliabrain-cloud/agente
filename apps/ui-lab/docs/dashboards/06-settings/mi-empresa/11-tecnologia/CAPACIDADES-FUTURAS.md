# Tecnología — catálogo de capacidades futuras

Superficie actual: `tecnologia`. Referencia UX: Apps Launcher. Diseño prospectivo para la meta-app, no auditoría de implementación.

## Capacidades a representar

| Capacidad | Experiencia demo | Contrato futuro esperado |
|---|---|---|
| Inventario tecnológico | Abrir inventario tecnológico, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para inventario tecnológico: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Mapa de integraciones | Abrir mapa de integraciones, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para mapa de integraciones: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Evaluación de herramientas | Abrir evaluación de herramientas, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para evaluación de herramientas: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Comparación de proveedores | Abrir comparación de proveedores, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para comparación de proveedores: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Diseño de capacidades | Abrir diseño de capacidades, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para diseño de capacidades: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Plan de migración | Abrir plan de migración, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para plan de migración: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Permisos OAuth | Abrir permisos oauth, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para permisos oauth: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Pruebas sandbox | Abrir pruebas sandbox, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para pruebas sandbox: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Estimación de costes | Abrir estimación de costes, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para estimación de costes: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Riesgos de dependencia | Abrir riesgos de dependencia, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para riesgos de dependencia: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Monitorización prevista | Abrir monitorización prevista, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para monitorización prevista: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Plan de actualización | Abrir plan de actualización, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para plan de actualización: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Rollback | Abrir rollback, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para rollback: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |

## Escenario Agntia Demo

Diseñar conexiones de correo, agenda y atención con estados propuesto, autorizado, probado y activo claramente separados.

## Contrato transversal de capacidad futura

Todas las capacidades son propuestas de producto, no endpoints existentes ni promesas de disponibilidad. En UI Lab se representan con datos locales reproducibles, acciones reversibles y estados explícitos; no se llama a proveedores reales. Cada capacidad debe admitir explorar, editar borrador, guardar, revisar evidencia, comparar y solicitar aprobación cuando corresponda. Las conversaciones de LAIA se vinculan a idea, dimensión, revisión y fuentes; nunca cambian directamente la versión activa. El resultado estructurado se guarda como propuesta con identificador estable, tenant, autor, procedencia, fecha lógica, estado, dependencias y revisión. Cognition estructura, JEV valida contratos, kernel autoriza y runtime ejecuta SOPs/skills deterministas; LAIA comunica. Las operaciones externas requieren capacidades registradas, permisos, aprobación según política, idempotencia, auditoría y tratamiento de resultados ambiguos. No inventar nombres de endpoints ni afirmar wiring existente. 

## Estados e interacción de demo

Vacío, explorando, borrador, necesita información, listo para revisar, aprobado, conflicto, publicado en demo y error recuperable. Mostrar la diferencia entre hechos, hipótesis y propuestas. La vista previa no ejecuta. Publicar en demo cambia únicamente la revisión local simulada; preservar historial y permitir volver a la versión previa simulada. Las cifras se derivan de fixtures compartidas, no de porcentajes decorativos. Reutilizar UX existente y mantener el copy humano de la landing.

## Criterios de aceptación

Cada capacidad tiene una entrada visible o contextual, un resultado consultable y una interacción demostrable; no botones mudos. Se puede continuar desde una conversación, vincular la propuesta a otra dimensión y conservar el original. No sustituir el entorno operativo ni modificar sus datos. Validar desktop y móvil, navegación, estados vacíos y error, accesibilidad y consistencia editorial. La implementación backend será una campaña posterior con inventario de código, contratos y pruebas reales.
