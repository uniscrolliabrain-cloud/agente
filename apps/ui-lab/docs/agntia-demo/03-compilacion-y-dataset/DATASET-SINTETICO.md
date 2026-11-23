# Dataset sintético — semilla, reglas y expansión

## Distinción entre fuente y propuesta
**Fuente aprobada:** oferta inicial de compilación de 1.500 € y suscripción desde 1.000 €/mes; target pequeñas empresas de hasta ~8 personas; objetivo comercial inicial 10 clientes. **Escenario ficticio propuesto:** 90 días, 2 clientes nuevos en mes 1, 3 en mes 2, 3 en mes 3, hasta 8 clientes; historial extensible a seis meses. No son resultados reales ni previsión garantizada.

## Identificadores y universos
- Tenant laboratorio: `agntia-demo`.
- Empresa representada: AgntiaPro **simulada**; no equiparar con producción.
- Owner demo: ID estable ficticio, distinto del usuario real.
- Empresas cliente demo: IDs únicos, cada una con su propio perfil de compilación y aislamiento lógico de datos.
- Eventos: `scenario_id`, `correlation_id`, `causation_id`, `entity_id`, `actor_id`, `logical_timestamp`.
- Nombres, correos y teléfonos de personajes: siempre ficticios; usar dominios `.example` para correos y evitar datos reales.

## Semilla narrativa mínima (antes de expandir volúmenes)
1. Empresa demo AgntiaPro, owner demo, LAIA, Marcos, Antonio, Juan, Ana y Pedro como perfiles simulados; equipo humano/colaboradores diferenciados.
2. Catálogo de servicios con precios y estados `propuesto/simulado/verificado/activo` independientes.
3. Nueve áreas funcionales, roles, políticas, permisos y canales.
4. Ocho **historias de clientes ficticios** con dolores diferentes, dos servicios prioritarios y recorrido de compilación individual.
5. Embudo con oportunidades ganadas, perdidas y pendientes; citas, propuestas, contratos y motivos.
6. Proyectos de implantación, tareas, entregables, documentos, mensajes, aprobaciones, facturas y cobros enlazados.
7. Un conjunto de incidencias y excepciones (integración bloqueada, aprobación tardía, factura pendiente, cambio de alcance).
8. Línea temporal de 90 días, con eventos causales y KPIs derivados, no escritos a mano.
9. Recorridos por fases 0–8 para mostrar empresas en distintos grados de madurez, sin fingir activaciones reales.
10. Digital Twin: ramas de futuro con supuestos, escenarios alternativos y niveles de incertidumbre.

## Metas de densidad de una demo madura (orientativas, no obligación inmediata)

| Familia | Meta |
|---|---:|
| Empresas prospecto | 120 |
| Contactos | 240 |
| Oportunidades | 65 |
| Clientes activos al día 90 | 8 |
| Proyectos | 24 |
| Tareas/ejecuciones | 450 |
| Conversaciones/mensajes | 800 |
| Documentos/entregables | 160 |
| Facturas/movimientos | 140 |
| Eventos | 2.000 |

**Generación gradual:** primero 8 historias causalmente completas; después aumentar contactos, actividad, documentos y eventos sin romper referencias.

## Reglas generativas
- Semilla reproducible y reloj lógico fijo por escenario; no depender de `Date.now()` ni aleatoriedad sin semilla.
- Crear entidades maestras antes de relaciones y eventos; validar referencias y unicidad.
- Generar el pipeline causal: `lead → oportunidad → discovery → propuesta → decisión → contrato → implantación → formación → beta → operación → factura/cobro → seguimiento`.
- No todos los leads se convierten; registrar pérdidas y causas. Los proyectos pueden bloquearse; las facturas pueden vencer.
- Facturas derivan de contratos y servicios; suscripciones de activaciones/periodos. Los totales deben cuadrar con impuestos y descuentos explícitos.
- KPIs se calculan desde eventos/entidades: `MRR`, tasa de conversión, cobros pendientes, trabajos activos, tiempo de respuesta, tasa de validación.
- No contar propuestas como ingresos; ni cobros como facturación; ni simulaciones como acciones externas.
- Todo mensaje de LAIA que mencione un hecho demo debe poder apuntar a eventos o entidades sintéticas.
- Los eventos de acciones autorizadas registran autor, resultado, estado, correlación y evidencia ficticia.
- No duplicar una operación por workspace: distintas vistas leen el mismo ID lógico.
- Generar variaciones por sector, madurez, tamaño, canal y dolor; evitar plantillas idénticas con nombres cambiados.
- Separar `business_actual_simulated`, `product_capability_status` y `presentation_state`.

## Ejemplo mínimo de contrato lógico (no API productiva)

```json
{
  "tenant_id": "agntia-demo",
  "business_id": "demo-agntiapro",
  "scenario_id": "scenario-onboarding-001",
  "simulation_mode": "synthetic",
  "logical_day": 1,
  "owner_id": "owner-demo-001",
  "phase": 0,
  "phase_status": "in_progress",
  "source_kind": "founder_approved_demo",
  "records_are_real": false
}
```

## Pruebas de aceptación del dataset
- IDs estables y relaciones sin huérfanos.
- Los ocho clientes al día 90 tienen historias completas y fechas plausibles.
- MRR calculado desde suscripciones activas simuladas, no del dashboard.
- Facturas, cobros y costes reconciliables.
- Todas las transiciones 0–8 tienen evidencia ficticia, gates y rutas de bloqueo.
- Un evento se puede rastrear desde chat a CRM, tarea, timeline y finanzas.
- La demo no puede activar pagos, enviar mensajes externos, cambiar permisos reales ni confundir al usuario con producción.
