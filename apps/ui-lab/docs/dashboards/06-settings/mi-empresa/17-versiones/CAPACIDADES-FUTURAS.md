# Versiones y publicación — catálogo de capacidades futuras

Superficie actual: `versiones`. Referencia UX: Timeline y comparador. Diseño prospectivo para la meta-app, no auditoría de implementación.

## Capacidades a representar

| Capacidad | Experiencia demo | Contrato futuro esperado |
|---|---|---|
| Borradores paralelos | Abrir borradores paralelos, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para borradores paralelos: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Snapshots | Abrir snapshots, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para snapshots: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Diff semántico | Abrir diff semántico, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para diff semántico: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Comparación de alternativas | Abrir comparación de alternativas, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para comparación de alternativas: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Detección de conflictos | Abrir detección de conflictos, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para detección de conflictos: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Validación de dependencias | Abrir validación de dependencias, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para validación de dependencias: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Simulación de impacto | Abrir simulación de impacto, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para simulación de impacto: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Aprobación vinculada a revisión | Abrir aprobación vinculada a revisión, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para aprobación vinculada a revisión: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Plan de activación | Abrir plan de activación, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para plan de activación: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Publicación gradual | Abrir publicación gradual, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para publicación gradual: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Registro de despliegue | Abrir registro de despliegue, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para registro de despliegue: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Rollback | Abrir rollback, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para rollback: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Reconciliación | Abrir reconciliación, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para reconciliación: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Historial inmutable | Abrir historial inmutable, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para historial inmutable: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |

## Escenario Agntia Demo

V7 activa y V8 borrador ilustrativos; publicar solo cambios aprobados en demo y conservar conversaciones y fuentes de cada decisión.

## Contrato transversal de capacidad futura

Todas las capacidades son propuestas de producto, no endpoints existentes ni promesas de disponibilidad. En UI Lab se representan con datos locales reproducibles, acciones reversibles y estados explícitos; no se llama a proveedores reales. Cada capacidad debe admitir explorar, editar borrador, guardar, revisar evidencia, comparar y solicitar aprobación cuando corresponda. Las conversaciones de LAIA se vinculan a idea, dimensión, revisión y fuentes; nunca cambian directamente la versión activa. El resultado estructurado se guarda como propuesta con identificador estable, tenant, autor, procedencia, fecha lógica, estado, dependencias y revisión. Cognition estructura, JEV valida contratos, kernel autoriza y runtime ejecuta SOPs/skills deterministas; LAIA comunica. Las operaciones externas requieren capacidades registradas, permisos, aprobación según política, idempotencia, auditoría y tratamiento de resultados ambiguos. No inventar nombres de endpoints ni afirmar wiring existente. 

## Estados e interacción de demo

Vacío, explorando, borrador, necesita información, listo para revisar, aprobado, conflicto, publicado en demo y error recuperable. Mostrar la diferencia entre hechos, hipótesis y propuestas. La vista previa no ejecuta. Publicar en demo cambia únicamente la revisión local simulada; preservar historial y permitir volver a la versión previa simulada. Las cifras se derivan de fixtures compartidas, no de porcentajes decorativos. Reutilizar UX existente y mantener el copy humano de la landing.

## Criterios de aceptación

Cada capacidad tiene una entrada visible o contextual, un resultado consultable y una interacción demostrable; no botones mudos. Se puede continuar desde una conversación, vincular la propuesta a otra dimensión y conservar el original. No sustituir el entorno operativo ni modificar sus datos. Validar desktop y móvil, navegación, estados vacíos y error, accesibilidad y consistencia editorial. La implementación backend será una campaña posterior con inventario de código, contratos y pruebas reales.
