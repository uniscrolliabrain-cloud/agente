# Operaciones — catálogo de capacidades futuras

Superficie actual: `operaciones`. Referencia UX: Estudio de operaciones. Diseño prospectivo para la meta-app, no auditoría de implementación.

## Capacidades a representar

| Capacidad | Experiencia demo | Contrato futuro esperado |
|---|---|---|
| Mapa actual | Abrir mapa actual, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para mapa actual: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Mapa futuro | Abrir mapa futuro, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para mapa futuro: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Descubrimiento de procesos | Abrir descubrimiento de procesos, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para descubrimiento de procesos: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Cuellos de botella | Abrir cuellos de botella, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para cuellos de botella: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Mapa de experiencia cliente | Abrir mapa de experiencia cliente, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para mapa de experiencia cliente: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Simulación de carga | Abrir simulación de carga, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para simulación de carga: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Diseño de handoffs | Abrir diseño de handoffs, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para diseño de handoffs: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Capacidad operativa | Abrir capacidad operativa, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para capacidad operativa: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Gestión de excepciones | Abrir gestión de excepciones, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para gestión de excepciones: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Pruebas de extremo a extremo | Abrir pruebas de extremo a extremo, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para pruebas de extremo a extremo: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Indicadores | Abrir indicadores, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para indicadores: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Plan de implantación | Abrir plan de implantación, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para plan de implantación: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |

## Escenario Agntia Demo

Reconstruir el recorrido Taller Horizonte desde llamada hasta cobro y comparar el flujo actual con el propuesto.

## Contrato transversal de capacidad futura

Todas las capacidades son propuestas de producto, no endpoints existentes ni promesas de disponibilidad. En UI Lab se representan con datos locales reproducibles, acciones reversibles y estados explícitos; no se llama a proveedores reales. Cada capacidad debe admitir explorar, editar borrador, guardar, revisar evidencia, comparar y solicitar aprobación cuando corresponda. Las conversaciones de LAIA se vinculan a idea, dimensión, revisión y fuentes; nunca cambian directamente la versión activa. El resultado estructurado se guarda como propuesta con identificador estable, tenant, autor, procedencia, fecha lógica, estado, dependencias y revisión. Cognition estructura, JEV valida contratos, kernel autoriza y runtime ejecuta SOPs/skills deterministas; LAIA comunica. Las operaciones externas requieren capacidades registradas, permisos, aprobación según política, idempotencia, auditoría y tratamiento de resultados ambiguos. No inventar nombres de endpoints ni afirmar wiring existente. 

## Estados e interacción de demo

Vacío, explorando, borrador, necesita información, listo para revisar, aprobado, conflicto, publicado en demo y error recuperable. Mostrar la diferencia entre hechos, hipótesis y propuestas. La vista previa no ejecuta. Publicar en demo cambia únicamente la revisión local simulada; preservar historial y permitir volver a la versión previa simulada. Las cifras se derivan de fixtures compartidas, no de porcentajes decorativos. Reutilizar UX existente y mantener el copy humano de la landing.

## Criterios de aceptación

Cada capacidad tiene una entrada visible o contextual, un resultado consultable y una interacción demostrable; no botones mudos. Se puede continuar desde una conversación, vincular la propuesta a otra dimensión y conservar el original. No sustituir el entorno operativo ni modificar sus datos. Validar desktop y móvil, navegación, estados vacíos y error, accesibilidad y consistencia editorial. La implementación backend será una campaña posterior con inventario de código, contratos y pruebas reales.
