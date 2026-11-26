# Finanzas — catálogo de capacidades futuras

Superficie actual: `economia`. Referencia UX: Analítica y Documentos. Diseño prospectivo para la meta-app, no auditoría de implementación.

## Capacidades a representar

| Capacidad | Experiencia demo | Contrato futuro esperado |
|---|---|---|
| Importación contable | Abrir importación contable, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para importación contable: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Conciliación de lectura | Abrir conciliación de lectura, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para conciliación de lectura: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Clasificación de gastos | Abrir clasificación de gastos, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para clasificación de gastos: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Presupuestos | Abrir presupuestos, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para presupuestos: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Tesorería proyectada | Abrir tesorería proyectada, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para tesorería proyectada: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Punto de equilibrio | Abrir punto de equilibrio, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para punto de equilibrio: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Economía unitaria | Abrir economía unitaria, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para economía unitaria: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Rentabilidad por servicio | Abrir rentabilidad por servicio, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para rentabilidad por servicio: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Escenarios de contratación | Abrir escenarios de contratación, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para escenarios de contratación: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Simulación fiscal orientativa | Abrir simulación fiscal orientativa, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para simulación fiscal orientativa: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Alertas | Abrir alertas, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para alertas: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Informes | Abrir informes, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para informes: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |
| Exportación para gestoría | Abrir exportación para gestoría, consultar ejemplo contextual, editar propuesta y revisar resultado local. | Servicio de dominio para exportación para gestoría: entradas tipadas, evidencia, resultado versionado, autorización y trazabilidad según riesgo. |

## Escenario Agntia Demo

Simular ocho clientes a 1000 euros mensuales, distinguir facturación, cobro, impuestos y costes; no ejecutar pagos ni alterar libros.

## Contrato transversal de capacidad futura

Todas las capacidades son propuestas de producto, no endpoints existentes ni promesas de disponibilidad. En UI Lab se representan con datos locales reproducibles, acciones reversibles y estados explícitos; no se llama a proveedores reales. Cada capacidad debe admitir explorar, editar borrador, guardar, revisar evidencia, comparar y solicitar aprobación cuando corresponda. Las conversaciones de LAIA se vinculan a idea, dimensión, revisión y fuentes; nunca cambian directamente la versión activa. El resultado estructurado se guarda como propuesta con identificador estable, tenant, autor, procedencia, fecha lógica, estado, dependencias y revisión. Cognition estructura, JEV valida contratos, kernel autoriza y runtime ejecuta SOPs/skills deterministas; LAIA comunica. Las operaciones externas requieren capacidades registradas, permisos, aprobación según política, idempotencia, auditoría y tratamiento de resultados ambiguos. No inventar nombres de endpoints ni afirmar wiring existente. 

## Estados e interacción de demo

Vacío, explorando, borrador, necesita información, listo para revisar, aprobado, conflicto, publicado en demo y error recuperable. Mostrar la diferencia entre hechos, hipótesis y propuestas. La vista previa no ejecuta. Publicar en demo cambia únicamente la revisión local simulada; preservar historial y permitir volver a la versión previa simulada. Las cifras se derivan de fixtures compartidas, no de porcentajes decorativos. Reutilizar UX existente y mantener el copy humano de la landing.

## Criterios de aceptación

Cada capacidad tiene una entrada visible o contextual, un resultado consultable y una interacción demostrable; no botones mudos. Se puede continuar desde una conversación, vincular la propuesta a otra dimensión y conservar el original. No sustituir el entorno operativo ni modificar sus datos. Validar desktop y móvil, navegación, estados vacíos y error, accesibilidad y consistencia editorial. La implementación backend será una campaña posterior con inventario de código, contratos y pruebas reales.
