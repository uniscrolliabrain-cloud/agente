# Blueprint ontológico y operacional para compilar tenants demo

## Núcleo
`Tenant → Owner → Business → Actors → Relationships → Processes → Capabilities → Scenarios → Events → Views`.

Cada entidad: `id`, `tenant_id`, `business_id`, `kind`, `status`, `created_at`, `updated_at`, `source_kind`, `simulation_mode`. Son **atributos conceptuales**, no una migración ni un contrato de backend.

## Las 18 taxonomías — inventario de compilación

| # | Dominio | Entidades semilla y vínculos principales |
|---|---|---|
| 01 | Identidad corporativa | empresa, marca, propósito, valores, posicionamiento, ubicación; empresa→marca |
| 02 | Modelo de negocio | servicio, producto, tarifa, segmento, canal, ingreso, coste; empresa→ofrece→servicio |
| 03 | Estructura organizativa | unidad, equipo, puesto, responsabilidad; actor→pertenece→equipo |
| 04 | Actores y entidades | owner, humano, agente, cliente, prospecto, proveedor, socio; actor→tiene→rol |
| 05 | Relaciones y conocimiento | entidad, relación, documento, concepto, dependencia, memoria; documento→describe→entidad |
| 06 | Comercial y marketing | campaña, lead, oportunidad, reunión, propuesta, conversión; lead→origina→oportunidad |
| 07 | Clientes y servicio | cuenta, contrato, onboarding, ticket, incidencia, satisfacción; cliente→contrata→servicio |
| 08 | Proyectos y producción | proyecto, hito, tarea, entregable, recurso; proyecto→contiene→tarea |
| 09 | Finanzas y administración | presupuesto, factura, cobro, gasto, cuenta, conciliación; contrato→origina→factura |
| 10 | Personas y recursos | competencia, disponibilidad, calendario, asignación, permiso; actor→asignado→tarea |
| 11 | Procesos y procedimientos | proceso, SOP, trigger, step, excepción, aprobación; proceso→produce→resultado |
| 12 | Agentes IA | agente, perfil, capacidad, herramienta, supervisión; agente→autorizado_para→capacidad |
| 13 | Conversaciones y canales | hilo, mensaje, participante, canal, sesión, transferencia; mensaje→refiere→entidad |
| 14 | Memoria y conocimiento agéntico | hecho, fuente, memoria, relación, procedencia, confianza; memoria→cita→fuente |
| 15 | Runtime y ejecución | plan, job, acción, skill, verificación, resultado, error; ejecución→instancia_de→SOP |
| 16 | Eventos y trazabilidad | evento, correlación, decisión, evidencia, snapshot; evento→causado_por→acción |
| 17 | Gobernanza y observabilidad | rol, política, consentimiento, riesgo, alerta, métrica técnica; aprobación→autoriza→acción |
| 18 | Inteligencia y escenarios | KPI, objetivo, forecast, escenario, anomalía, decisión; escenario→proyecta→KPI |

## Seis ejes transversales
1. Identidad y pertenencia: `tenant_id`, `owner_id`, `business_id`, responsable.
2. Semántica: sujeto, predicado, objeto, contexto y vigencia.
3. Temporalidad: reloj lógico, fecha efectiva, historial y recurrencia.
4. Ciclo de vida: estados y transiciones por dominio.
5. Autoridad/procedencia: actor, permisos, fuente, evidencia, aprobación.
6. Simulación: ficticio, mock, ensayo, real verificado, previsión; nunca mezclar.

## Perfil de compilación por empresa
- Identidad y diagnóstico: negocio, oferta, clientes, canales, objetivos, dolores, prioridades.
- Operaciones: procesos AS-IS, procesos TO-BE, disparadores, entradas, salidas, SLA, excepciones, responsables.
- Ontología: entidades, atributos, vínculos, cardinalidad, ownership, procedencia y tiempo.
- Capacidades: necesidades, herramientas, conectores, coste, riesgo, disponibilidad, estado de verificación.
- Agentes y humanos: roles, formación, permisos, autonomía, aprobaciones y escalados.
- Experiencia: workspaces, journeys, conversación LAIA, contextos y accesibilidad.
- Medición: KPIs de negocio, baseline, resultados simulados, resultados reales cuando proceda.
- Riesgos: privacidad, consentimiento, datos, seguridad, dependencias, rollback.

## Contrato de proceso simulado
`process_id`, `trigger`, `actor`, `business_entity_ids`, `preconditions`, `steps`, `approval_policy`, `expected_outputs`, `failure_paths`, `event_types`, `evidence`, `success_metrics`.

## Capacidades y madurez
Diferenciar **capacidad deseada**, **simulación visual**, **ejecución simulada**, **implementación existente**, **validación superada** y **habilitación para cliente real**. El catálogo nunca debe inferir disponibilidad real por tener una pantalla bonita.

## Historias transversales
Ejemplo ficticio: visitante→conversación LAIA→lead→discovery→propuesta→contrato→factura→proyecto de compilación→SOPs→formación→beta validada→operación→feedback. Cada vínculo usa IDs estables y se refleja en varias vistas. Esta secuencia no implica que todo esté desplegado.
