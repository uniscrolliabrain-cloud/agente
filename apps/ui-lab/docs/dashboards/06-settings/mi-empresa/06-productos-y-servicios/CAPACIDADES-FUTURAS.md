# Productos y servicios — catálogo de capacidades futuras

Superficie actual: `productos`. Referencia UX: Apps y Documentos. Diseño prospectivo para la meta-app, no auditoría de implementación.

## Capacidades a representar

| Capacidad | Experiencia demo | Contrato futuro esperado |
|---|---|---|
| Catálogo | Abrir catálogo, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para catálogo: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Configurador de ofertas | Abrir configurador de ofertas, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para configurador de ofertas: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Precios | Abrir precios, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para precios: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Costes directos | Abrir costes directos, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para costes directos: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Márgenes | Abrir márgenes, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para márgenes: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Paquetes | Abrir paquetes, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para paquetes: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| SLA | Abrir sla, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para sla: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Entregables | Abrir entregables, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para entregables: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Dependencias | Abrir dependencias, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para dependencias: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Plantillas de propuesta | Abrir plantillas de propuesta, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para plantillas de propuesta: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Pruebas de servicio | Abrir pruebas de servicio, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para pruebas de servicio: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Versionado de oferta | Abrir versionado de oferta, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para versionado de oferta: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Retirada de servicios | Abrir retirada de servicios, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para retirada de servicios: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |

## Escenario Agntia Demo

Diseñar un paquete de atención y seguimiento comercial para Taller Horizonte con alcance y costes sintéticos.

## Contrato transversal de capacidad futura

Todas las capacidades son propuestas de producto, no endpoints existentes ni promesas de disponibilidad. En UI Lab se representan con datos locales reproducibles, acciones reversibles y estados explícitos; no se llama a proveedores reales. Cada capacidad debe admitir explorar, editar borrador, guardar, revisar evidencia, comparar y solicitar aprobación cuando corresponda. Las conversaciones de LAIA se vinculan a idea, dimensión, revisión y fuentes; nunca cambian directamente la versión activa. El resultado estructurado se guarda como propuesta con identificador estable, tenant, autor, procedencia, fecha lógica, estado, dependencias y revisión. Cognition estructura, JEV valida contratos, kernel autoriza y runtime ejecuta SOPs/skills deterministas; LAIA comunica. Las operaciones externas requieren capacidades registradas, permisos, aprobación según política, idempotencia, auditoría y tratamiento de resultados ambiguos. No inventar nombres de endpoints ni afirmar wiring existente. 

## Estados e interacción de demo

Vacío, explorando, borrador, necesita información, listo para revisar, aprobado, conflicto, publicado en demo y error recuperable. Mostrar la diferencia entre hechos, hipótesis y propuestas. La vista previa no ejecuta. Publicar en demo cambia únicamente la revisión local simulada; preservar historial y permitir volver a la versión previa simulada. Las cifras se derivan de fixtures compartidas, no de porcentajes decorativos. Reutilizar UX existente y mantener el copy humano de la landing.

## Criterios de aceptación

Cada capacidad tiene una entrada visible o contextual, un resultado consultable y una interacción demostrable; no botones mudos. Se puede continuar desde una conversación, vincular la propuesta a otra dimensión y conservar el original. No sustituir el entorno operativo ni modificar sus datos. Validar desktop y móvil, navegación, estados vacíos y error, accesibilidad y consistencia editorial. La implementación backend será una campaña posterior con inventario de código, contratos y pruebas reales.
