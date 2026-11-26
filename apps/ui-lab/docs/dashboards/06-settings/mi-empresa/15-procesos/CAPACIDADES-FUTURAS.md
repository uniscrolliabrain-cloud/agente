# Procesos — catálogo de capacidades futuras

Superficie actual: `procesos`. Referencia UX: Automatizaciones y Estudio. Diseño prospectivo para la meta-app, no auditoría de implementación.

## Capacidades a representar

| Capacidad | Experiencia demo | Contrato futuro esperado |
|---|---|---|
| Editor SOP | Abrir editor sop, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para editor sop: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Disparadores | Abrir disparadores, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para disparadores: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Entradas y salidas | Abrir entradas y salidas, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para entradas y salidas: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Pasos tipados | Abrir pasos tipados, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para pasos tipados: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Condiciones | Abrir condiciones, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para condiciones: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Permisos | Abrir permisos, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para permisos: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Aprobaciones | Abrir aprobaciones, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para aprobaciones: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Reintentos | Abrir reintentos, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para reintentos: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Idempotencia | Abrir idempotencia, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para idempotencia: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Compensaciones | Abrir compensaciones, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para compensaciones: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Simulación | Abrir simulación, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para simulación: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Pruebas de contratos | Abrir pruebas de contratos, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para pruebas de contratos: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Versionado | Abrir versionado, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para versionado: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Publicación de SOP | Abrir publicación de sop, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para publicación de sop: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Observabilidad | Abrir observabilidad, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para observabilidad: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |

## Escenario Agntia Demo

Diseñar seguimiento de propuesta con espera, aprobación de mensaje, respuesta, excepción y prueba de duplicados.

## Contrato transversal de capacidad futura

Todas las capacidades son propuestas de producto, no endpoints existentes ni promesas de disponibilidad. En UI Lab se representan con datos locales reproducibles, acciones reversibles y estados explícitos; no se llama a proveedores reales. Cada capacidad debe admitir explorar, editar borrador, guardar, revisar evidencia, comparar y solicitar aprobación cuando corresponda. Las conversaciones de LAIA se vinculan a idea, dimensión, revisión y fuentes; nunca cambian directamente la versión activa. El resultado estructurado se guarda como propuesta con identificador estable, tenant, autor, procedencia, fecha lógica, estado, dependencias y revisión. Cognition estructura, JEV valida contratos, kernel autoriza y runtime ejecuta SOPs/skills deterministas; LAIA comunica. Las operaciones externas requieren capacidades registradas, permisos, aprobación según política, idempotencia, auditoría y tratamiento de resultados ambiguos. No inventar nombres de endpoints ni afirmar wiring existente. 

## Estados e interacción de demo

Vacío, explorando, borrador, necesita información, listo para revisar, aprobado, conflicto, publicado en demo y error recuperable. Mostrar la diferencia entre hechos, hipótesis y propuestas. La vista previa no ejecuta. Publicar en demo cambia únicamente la revisión local simulada; preservar historial y permitir volver a la versión previa simulada. Las cifras se derivan de fixtures compartidas, no de porcentajes decorativos. Reutilizar UX existente y mantener el copy humano de la landing.

## Criterios de aceptación

Cada capacidad tiene una entrada visible o contextual, un resultado consultable y una interacción demostrable; no botones mudos. Se puede continuar desde una conversación, vincular la propuesta a otra dimensión y conservar el original. No sustituir el entorno operativo ni modificar sus datos. Validar desktop y móvil, navegación, estados vacíos y error, accesibilidad y consistencia editorial. La implementación backend será una campaña posterior con inventario de código, contratos y pruebas reales.
