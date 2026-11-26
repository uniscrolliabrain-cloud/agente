# Fuentes — catálogo de capacidades futuras

Superficie actual: `fuentes`. Referencia UX: Documentos V9. Diseño prospectivo para la meta-app, no auditoría de implementación.

## Capacidades a representar

| Capacidad | Experiencia demo | Contrato futuro esperado |
|---|---|---|
| Carga de archivos | Abrir carga de archivos, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para carga de archivos: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Importación de correo y drive | Abrir importación de correo y drive, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para importación de correo y drive: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Transcripción | Abrir transcripción, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para transcripción: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| OCR cuando proceda | Abrir ocr cuando proceda, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para ocr cuando proceda: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Extracción de tablas | Abrir extracción de tablas, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para extracción de tablas: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Clasificación semántica | Abrir clasificación semántica, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para clasificación semántica: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Deduplicación | Abrir deduplicación, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para deduplicación: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Control de versiones | Abrir control de versiones, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para control de versiones: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Búsqueda híbrida | Abrir búsqueda híbrida, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para búsqueda híbrida: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Citas por fragmento | Abrir citas por fragmento, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para citas por fragmento: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Detección de conflictos | Abrir detección de conflictos, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para detección de conflictos: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Consentimiento | Abrir consentimiento, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para consentimiento: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Retención y eliminación | Abrir retención y eliminación, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para retención y eliminación: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Reprocesamiento | Abrir reprocesamiento, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para reprocesamiento: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |

## Escenario Agntia Demo

Importar kickoffs y documentos sintéticos, conservar originales y vincular afirmaciones con su evidencia.

## Contrato transversal de capacidad futura

Todas las capacidades son propuestas de producto, no endpoints existentes ni promesas de disponibilidad. En UI Lab se representan con datos locales reproducibles, acciones reversibles y estados explícitos; no se llama a proveedores reales. Cada capacidad debe admitir explorar, editar borrador, guardar, revisar evidencia, comparar y solicitar aprobación cuando corresponda. Las conversaciones de LAIA se vinculan a idea, dimensión, revisión y fuentes; nunca cambian directamente la versión activa. El resultado estructurado se guarda como propuesta con identificador estable, tenant, autor, procedencia, fecha lógica, estado, dependencias y revisión. Cognition estructura, JEV valida contratos, kernel autoriza y runtime ejecuta SOPs/skills deterministas; LAIA comunica. Las operaciones externas requieren capacidades registradas, permisos, aprobación según política, idempotencia, auditoría y tratamiento de resultados ambiguos. No inventar nombres de endpoints ni afirmar wiring existente. 

## Estados e interacción de demo

Vacío, explorando, borrador, necesita información, listo para revisar, aprobado, conflicto, publicado en demo y error recuperable. Mostrar la diferencia entre hechos, hipótesis y propuestas. La vista previa no ejecuta. Publicar en demo cambia únicamente la revisión local simulada; preservar historial y permitir volver a la versión previa simulada. Las cifras se derivan de fixtures compartidas, no de porcentajes decorativos. Reutilizar UX existente y mantener el copy humano de la landing.

## Criterios de aceptación

Cada capacidad tiene una entrada visible o contextual, un resultado consultable y una interacción demostrable; no botones mudos. Se puede continuar desde una conversación, vincular la propuesta a otra dimensión y conservar el original. No sustituir el entorno operativo ni modificar sus datos. Validar desktop y móvil, navegación, estados vacíos y error, accesibilidad y consistencia editorial. La implementación backend será una campaña posterior con inventario de código, contratos y pruebas reales.
