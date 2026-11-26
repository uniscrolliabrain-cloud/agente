# Mercado — catálogo de capacidades futuras

Superficie actual: `mercado`. Referencia UX: Conocimiento y Analítica. Diseño prospectivo para la meta-app, no auditoría de implementación.

## Capacidades a representar

| Capacidad | Experiencia demo | Contrato futuro esperado |
|---|---|---|
| Investigación web autorizada | Abrir investigación web autorizada, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para investigación web autorizada: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Segmentación | Abrir segmentación, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para segmentación: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Personas compradoras | Abrir personas compradoras, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para personas compradoras: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Mapa competitivo | Abrir mapa competitivo, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para mapa competitivo: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Análisis de demanda | Abrir análisis de demanda, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para análisis de demanda: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Entrevistas a clientes | Abrir entrevistas a clientes, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para entrevistas a clientes: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Detección de tendencias | Abrir detección de tendencias, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para detección de tendencias: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Mapa de oportunidades | Abrir mapa de oportunidades, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para mapa de oportunidades: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Hipótesis comerciales | Abrir hipótesis comerciales, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para hipótesis comerciales: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Comparación de canales | Abrir comparación de canales, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para comparación de canales: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Estimación de mercado | Abrir estimación de mercado, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para estimación de mercado: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Repositorio de evidencias | Abrir repositorio de evidencias, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para repositorio de evidencias: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |

## Escenario Agntia Demo

Investigar oportunidades de pymes españolas y separar datos de fuentes, estimaciones e hipótesis; en demo usar fuentes ficticias etiquetadas.

## Contrato transversal de capacidad futura

Todas las capacidades son propuestas de producto, no endpoints existentes ni promesas de disponibilidad. En UI Lab se representan con datos locales reproducibles, acciones reversibles y estados explícitos; no se llama a proveedores reales. Cada capacidad debe admitir explorar, editar borrador, guardar, revisar evidencia, comparar y solicitar aprobación cuando corresponda. Las conversaciones de LAIA se vinculan a idea, dimensión, revisión y fuentes; nunca cambian directamente la versión activa. El resultado estructurado se guarda como propuesta con identificador estable, tenant, autor, procedencia, fecha lógica, estado, dependencias y revisión. Cognition estructura, JEV valida contratos, kernel autoriza y runtime ejecuta SOPs/skills deterministas; LAIA comunica. Las operaciones externas requieren capacidades registradas, permisos, aprobación según política, idempotencia, auditoría y tratamiento de resultados ambiguos. No inventar nombres de endpoints ni afirmar wiring existente. 

## Estados e interacción de demo

Vacío, explorando, borrador, necesita información, listo para revisar, aprobado, conflicto, publicado en demo y error recuperable. Mostrar la diferencia entre hechos, hipótesis y propuestas. La vista previa no ejecuta. Publicar en demo cambia únicamente la revisión local simulada; preservar historial y permitir volver a la versión previa simulada. Las cifras se derivan de fixtures compartidas, no de porcentajes decorativos. Reutilizar UX existente y mantener el copy humano de la landing.

## Criterios de aceptación

Cada capacidad tiene una entrada visible o contextual, un resultado consultable y una interacción demostrable; no botones mudos. Se puede continuar desde una conversación, vincular la propuesta a otra dimensión y conservar el original. No sustituir el entorno operativo ni modificar sus datos. Validar desktop y móvil, navegación, estados vacíos y error, accesibilidad y consistencia editorial. La implementación backend será una campaña posterior con inventario de código, contratos y pruebas reales.
