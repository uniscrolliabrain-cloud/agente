# Estrategia — catálogo de capacidades futuras

Superficie actual: `estrategia`. Referencia UX: Cartera y Centro de mando. Diseño prospectivo para la meta-app, no auditoría de implementación.

## Capacidades a representar

| Capacidad | Experiencia demo | Contrato futuro esperado |
|---|---|---|
| Árbol de objetivos | Abrir árbol de objetivos, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para árbol de objetivos: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| OKR | Abrir okr, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para okr: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Plan trimestral | Abrir plan trimestral, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para plan trimestral: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Plan anual | Abrir plan anual, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para plan anual: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Priorización | Abrir priorización, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para priorización: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Roadmap | Abrir roadmap, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para roadmap: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Escenarios | Abrir escenarios, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para escenarios: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Asignación de recursos | Abrir asignación de recursos, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para asignación de recursos: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Seguimiento de indicadores | Abrir seguimiento de indicadores, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para seguimiento de indicadores: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Revisión estratégica | Abrir revisión estratégica, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para revisión estratégica: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Detección de desviaciones | Abrir detección de desviaciones, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para detección de desviaciones: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Propuestas de reajuste | Abrir propuestas de reajuste, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para propuestas de reajuste: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |

## Escenario Agntia Demo

Comparar el objetivo real de diez clientes con el escenario sintético de ocho; planificar prioridades de captación y capacidad.

## Contrato transversal de capacidad futura

Todas las capacidades son propuestas de producto, no endpoints existentes ni promesas de disponibilidad. En UI Lab se representan con datos locales reproducibles, acciones reversibles y estados explícitos; no se llama a proveedores reales. Cada capacidad debe admitir explorar, editar borrador, guardar, revisar evidencia, comparar y solicitar aprobación cuando corresponda. Las conversaciones de LAIA se vinculan a idea, dimensión, revisión y fuentes; nunca cambian directamente la versión activa. El resultado estructurado se guarda como propuesta con identificador estable, tenant, autor, procedencia, fecha lógica, estado, dependencias y revisión. Cognition estructura, JEV valida contratos, kernel autoriza y runtime ejecuta SOPs/skills deterministas; LAIA comunica. Las operaciones externas requieren capacidades registradas, permisos, aprobación según política, idempotencia, auditoría y tratamiento de resultados ambiguos. No inventar nombres de endpoints ni afirmar wiring existente. 

## Estados e interacción de demo

Vacío, explorando, borrador, necesita información, listo para revisar, aprobado, conflicto, publicado en demo y error recuperable. Mostrar la diferencia entre hechos, hipótesis y propuestas. La vista previa no ejecuta. Publicar en demo cambia únicamente la revisión local simulada; preservar historial y permitir volver a la versión previa simulada. Las cifras se derivan de fixtures compartidas, no de porcentajes decorativos. Reutilizar UX existente y mantener el copy humano de la landing.

## Criterios de aceptación

Cada capacidad tiene una entrada visible o contextual, un resultado consultable y una interacción demostrable; no botones mudos. Se puede continuar desde una conversación, vincular la propuesta a otra dimensión y conservar el original. No sustituir el entorno operativo ni modificar sus datos. Validar desktop y móvil, navegación, estados vacíos y error, accesibilidad y consistencia editorial. La implementación backend será una campaña posterior con inventario de código, contratos y pruebas reales.
