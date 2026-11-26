# Entrevistas — catálogo de capacidades futuras

Superficie actual: `entrevistas`. Referencia UX: Chat y Comunicación. Diseño prospectivo para la meta-app, no auditoría de implementación.

## Capacidades a representar

| Capacidad | Experiencia demo | Contrato futuro esperado |
|---|---|---|
| Entrevistas adaptativas | Abrir entrevistas adaptativas, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para entrevistas adaptativas: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Grabación consentida | Abrir grabación consentida, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para grabación consentida: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Transcripción | Abrir transcripción, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para transcripción: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Preguntas de seguimiento | Abrir preguntas de seguimiento, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para preguntas de seguimiento: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Entrevistas por rol | Abrir entrevistas por rol, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para entrevistas por rol: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Extracción de hechos | Abrir extracción de hechos, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para extracción de hechos: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Detección de lagunas | Abrir detección de lagunas, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para detección de lagunas: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Contraste entre testimonios | Abrir contraste entre testimonios, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para contraste entre testimonios: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Resumen revisable | Abrir resumen revisable, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para resumen revisable: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Conversión a propuestas | Abrir conversión a propuestas, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para conversión a propuestas: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Agenda de sesiones | Abrir agenda de sesiones, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para agenda de sesiones: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Exportación de actas | Abrir exportación de actas, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para exportación de actas: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |

## Escenario Agntia Demo

LAIA entrevista al owner y a Marcos sobre seguimiento comercial; registra desacuerdos y preguntas abiertas sin inventar respuestas.

## Contrato transversal de capacidad futura

Todas las capacidades son propuestas de producto, no endpoints existentes ni promesas de disponibilidad. En UI Lab se representan con datos locales reproducibles, acciones reversibles y estados explícitos; no se llama a proveedores reales. Cada capacidad debe admitir explorar, editar borrador, guardar, revisar evidencia, comparar y solicitar aprobación cuando corresponda. Las conversaciones de LAIA se vinculan a idea, dimensión, revisión y fuentes; nunca cambian directamente la versión activa. El resultado estructurado se guarda como propuesta con identificador estable, tenant, autor, procedencia, fecha lógica, estado, dependencias y revisión. Cognition estructura, JEV valida contratos, kernel autoriza y runtime ejecuta SOPs/skills deterministas; LAIA comunica. Las operaciones externas requieren capacidades registradas, permisos, aprobación según política, idempotencia, auditoría y tratamiento de resultados ambiguos. No inventar nombres de endpoints ni afirmar wiring existente. 

## Estados e interacción de demo

Vacío, explorando, borrador, necesita información, listo para revisar, aprobado, conflicto, publicado en demo y error recuperable. Mostrar la diferencia entre hechos, hipótesis y propuestas. La vista previa no ejecuta. Publicar en demo cambia únicamente la revisión local simulada; preservar historial y permitir volver a la versión previa simulada. Las cifras se derivan de fixtures compartidas, no de porcentajes decorativos. Reutilizar UX existente y mantener el copy humano de la landing.

## Criterios de aceptación

Cada capacidad tiene una entrada visible o contextual, un resultado consultable y una interacción demostrable; no botones mudos. Se puede continuar desde una conversación, vincular la propuesta a otra dimensión y conservar el original. No sustituir el entorno operativo ni modificar sus datos. Validar desktop y móvil, navegación, estados vacíos y error, accesibilidad y consistencia editorial. La implementación backend será una campaña posterior con inventario de código, contratos y pruebas reales.
