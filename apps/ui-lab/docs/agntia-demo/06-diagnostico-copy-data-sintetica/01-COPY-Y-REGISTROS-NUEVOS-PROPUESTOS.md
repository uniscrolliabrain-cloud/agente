# 01 — Propuesta de COPY y dataset nuevo: `agntia-demo` (SIN APLICAR)

**Estado:** contenido editorial y registros sintéticos de ejemplo para revisión. Ninguna cifra representa facturación, clientes, funcionalidades verificadas ni actividad real de AgntiaPro. Los nombres de organizaciones inventados son **provisionales**, pendientes de validación. Correos de ejemplo usan `.example`. No se publicará una historia ficticia como prueba comercial.

## 1. Identidad única
- `tenantId: agntia-demo`, `businessId: business-agntiapro`, `scenarioId: agntia-owner-journey-v1`, `datasetVersion: 0.1-draft`.
- Empresa simulada: **AgntiaPro**. Sector: compilación, implantación y operación gestionada de empresas con agentes IA.
- Owner: `human-founder-demo`, nombre público **Fundador de AgntiaPro** (evitar datos personales en fixture). Rol: dirección, producto, aprobaciones estratégicas.
- Sello visible: **«Datos simulados · Entorno de demostración»**.
- Fuente del copy comercial: **landing actual**. Este documento **no sustituye sus titulares ni su posicionamiento**.
- Servicio inicial en escenarios: compilación personalizada, dos servicios de ROI por cliente, relación recurrente, formación y acompañamiento. Precio de referencia documental: instalación 1.500 €, mensualidad desde 1.000 €; no se presupone que todos los contratos ficticios tengan idénticas condiciones.
- Nueve áreas: dirección, comercial, marketing, operaciones, producto/ingeniería, soporte, finanzas/gestoría, personas, ciberseguridad.

## 2. Personas y agentes (IDs estables)

| ID | Nombre visible | Naturaleza | Función | Copy de presentación propuesto |
|---|---|---|---|---|
| `human-founder-demo` | Fundador | Humano owner | Visión, producto, decisiones y aprobación | «Diriges la empresa; LAIA te trae lo que necesita tu atención» |
| `agent-laia` | LAIA | Agente IA | Supervisión, comunicación y presentación contextual | «Soy LAIA. Te cuento cómo va la empresa y preparo las decisiones que necesitan tu aprobación» |
| `agent-marcos` | Marcos | Agente IA | Operación y procedimientos | «Tengo preparadas las tareas de implantación y las comprobaciones pendientes» |
| `agent-antonio` | Antonio | Agente IA | Finanzas y seguimiento de cobros | «He revisado las facturas del escenario; hay un cobro que requiere seguimiento» |
| `agent-juan` | Juan | Agente IA | Gestoría y documentación | «He organizado la documentación administrativa para su revisión» |
| `agent-ana` | Ana | Agente IA | Personas, roles y formación | «La formación del equipo está preparada; quedan dos validaciones» |
| `agent-pedro` | Pedro | Agente IA | Ciberseguridad y controles | «He señalado una conexión pendiente de autorización» |
| `human-pilar-demo` | Pilar | Colaboradora humana (opcional) | Apoyo en personas | «Revisa las incorporaciones que requieren intervención humana» |
| `supplier-manuel-demo` | Manuel | Proveedor humano (opcional) | Edición audiovisual | «Preparación de piezas para la comunicación comercial» |

**No confundir:** `agent-ana` no es Ana Ferrer, la owner anterior de Interfaz; `agent-antonio` no es el Antonio humano del Studio. En la demo no se asigna autonomía de pago, contratación o publicación a ningún agente.

## 3. Ocho empresas cliente ficticias: cartera propuesta al día 90

Son **clientes de AgntiaPro**, no tenants activos adicionales en la BD de la demo. Cada empresa tiene su `clientBusinessId`, perfil de compilación, actores propios y estado de fase; los datos se representan **dentro del tenant owner `agntia-demo`**. Un futuro tenant independiente de cada cliente requeriría su propia autorización y aislamiento.

| ID | Empresa inventada | Sector | Dolor principal | Dos capacidades iniciales | Estado al día 90 propuesto |
|---|---|---|---|---|---|
| `client-001` | Taller Bruma | Reparación y mantenimiento | Citas perdidas y consultas repetidas | Atención/agenda; seguimiento comercial | Fase 6, acompañamiento |
| `client-002` | Clínica Albor | Centro de bienestar no sanitario en el escenario | Agenda desordenada y respuestas lentas | Atención/agenda; administración | Fase 6 |
| `client-003` | Costa Nido | Alojamiento turístico | Consultas multicanal y reservas | Atención; reactivación | Fase 5 |
| `client-004` | Estudio Caliza | Arquitectura e interiorismo | Presupuestos y leads sin seguimiento | CRM/propuestas; captación B2B | Fase 5 |
| `client-005` | Mercado Ladera | Comercio local | Clientes recurrentes inactivos | Reactivación; marketing digital | Fase 4, beta pendiente de gate |
| `client-006` | Huerta Clara | Distribución agroalimentaria | Pedidos y documentación manual | Administración; seguimiento comercial | Fase 4, beta en validación |
| `client-007` | Atlas Formación | Servicios formativos B2B | Leads desordenados | Captación B2B; CRM | Fase 3, formación |
| `client-008` | Ronda Talleres | Servicio técnico | Incidencias y tareas dispersas | Atención; coordinación de tareas | Fase 1, compilación |

**Inconsistencia deliberadamente señalada para decidir:** «8 clientes activos al día 90» y «8 empresas en fases 1–6» no son equivalentes. La tabla anterior es una **cartera de ocho empresas contratadas o en onboarding**, no ocho servicios plenamente desplegados. El MRR no debe sumar automáticamente las ocho: se deriva de contratos y fecha de inicio de facturación. Alternativa: ocho contratos recurrentes facturables, aunque algunos estén en beta, si así se define explícitamente el contrato ficticio. **Pedir validación antes de fijar KPI.**

## 4. Historias completas, con IDs y copy reutilizable

### Historia A — Taller Bruma: de la landing a la operación
- `lead-001`: una visita conversa con LAIA desde la landing; canal `web_chat`.
- `thread-001` → `msg-001`: «Somos cuatro personas y perdemos consultas cuando estamos trabajando».
- `opportunity-001`: LAIA propone discovery, no promete disponibilidad de integraciones.
- `meeting-001`: diagnóstico de llamadas, agenda, clientes y prioridades.
- `proposal-001`: compilación + atención/agenda + seguimiento comercial.
- `contract-001`: contrato ficticio con consentimiento y aprobaciones.
- `project-001`: compilación de procesos y perfiles; `task-001` mapea agenda; `task-002` verifica datos.
- `training-001`: owner y dos empleados practican con la simulación.
- `beta-001`: validación de flujo de reserva; `approval-001` aprueba paso de fase.
- `invoice-001` y `payment-001`: facturación y cobro simulados, con vínculo a contrato.
- `event-001...`: cada cambio de estado tiene evento y evidencia.
- Copy Centro de Mando: «Taller Bruma completó la validación de su agenda simulada. La próxima revisión está programada».
- Copy LAIA: «La implantación de Taller Bruma ya pasó la revisión prevista. Te dejo la evidencia y la siguiente decisión».

### Historia B — Estudio Caliza: aprobación pendiente
- `lead-004 → opportunity-004 → proposal-004 → contract-004 → project-004 → task-041 → approval-004`.
- Estado: propuesta de campaña preparada, **sin publicación externa** hasta autorización.
- Copy tarjeta: «Campaña de Estudio Caliza lista para revisión. Publicación bloqueada hasta aprobación».
- Copy LAIA: «Marcos terminó la preparación; necesito tu aprobación para continuar con el siguiente paso del escenario».

### Historia C — Mercado Ladera: beta bloqueada
- `project-005 → task-051 → integration-check-005 → incident-005 → approval-005`.
- Estado: falta consentimiento del canal; no simular conexión real.
- Copy tarjeta: «La beta está preparada, pero la conexión de mensajería sigue pendiente de autorización».
- Copy LAIA: «La prueba interna está lista; todavía no podemos activar el canal para un cliente real».

### Historia D — Finanzas: seguimiento sin acciones de pago
- `contract-003 → invoice-003 → payment-status-003 → task-antonio-003`.
- Copy: «Una factura del escenario está pendiente de cobro. Antonio ha preparado el seguimiento».
- No marcar como cobrada sin `payment`; no ejecutar transferencias ni comunicaciones.

## 5. Copy propuesto por superficie, preservando diseño existente

| Superficie | Antes (semántica) | Después (copy nuevo propuesto) | Fuente de verdad |
|---|---|---|---|
| App demo, nombre | Interfaz Studio | AgntiaPro · Entorno simulado | `BusinessProfile` |
| Header owner | Ana Ferrer | Fundador · AgntiaPro | `Actor` + sesión demo |
| Agentes | Marta/Bruno/Nora/Iker/Vera | LAIA/Marcos/Antonio/Juan/Ana/Pedro | `Actor` + `AgentProfile` |
| Chat | Proyecto de diseño, branding | Operación de AgntiaPro, clientes, aprobaciones y avances | `Conversation`, `Event` |
| Centro de Mando | Leads y KPIs de agencia creativa | Pipeline de compilaciones, beta, operación, cobros y riesgos | Selectores KPI |
| Kanban | Diseño/landing de clientes creativos | Captación, compilación, formación, validación, operación | `Task`/`PhaseProgress` |
| Proyectos | Lumen, Casa Botànica | Compilaciones de ocho empresas ficticias | `Project`/`Customer` |
| Memoria/RAG | Guía de marca de Interfaz | Procesos, SOPs, decisiones y conocimiento empresarial de AgntiaPro | `Document`/`Memory` |
| Documentos | Entregas de diseño | Briefs, diagnósticos, propuestas, contratos ficticios, evidencias | `Document` |
| WhatsApp | Borradores de agencia | Consultas de prospectos/clientes con estado «simulado» | `Message`/`Channel` |
| Finanzas | Presupuestos de diseño | Instalaciones, mensualidades, gastos, cobros y márgenes ficticios | `Contract`/`Invoice`/`Payment` |
| Estudio Operaciones | ACME/Estudio Norte | Jornada AgntiaPro y proyectos de compilación | `ActivityProjection` |
| Grafo | Actividades de ACME | Relaciones de empresas, actores, procesos, evidencias | `Relationship`/`Event` |
| Digital Twin | Escenarios visuales genéricos | Variaciones futuras de ventas, capacidad y tiempos, con supuestos | `TwinScenario` |

## 6. Metas de volumen (no registros creados)

- **Primera maqueta causal para revisión:** 1 owner, 6 agentes, 8 empresas cliente, 8 oportunidades principales, 8 proyectos de implantación, ~40 tareas vinculadas, ~20 conversaciones, ~25 documentos, ~15 facturas/movimientos, ~100 eventos. Son **objetivos de diseño**, no recuentos reales.
- **Dataset expandido, propuesta anterior:** 120 prospectos, 240 contactos, 65 oportunidades, 8 clientes al día 90, 24 proyectos, 450 tareas/ejecuciones, 800 conversaciones/mensajes, 160 documentos, 140 registros financieros, 2.000 eventos.
- **Horizonte temporal:** 90 días de jornada inicial y posibilidad de extender a seis meses; por validar.
- El KPI `MRR` se calcula por contratos vigentes facturables; instalación no es MRR; facturas pendientes no son cobros.
- Las cifras del dataset expandido **no se deben simular por multiplicación ciega** de la maqueta: cada registro necesita relaciones y cronología.

## 7. Contrato de procedencia de cada registro (conceptual)
```json
{
  "id": "task-041",
  "tenantId": "agntia-demo",
  "businessId": "business-agntiapro",
  "scenarioId": "agntia-owner-journey-v1",
  "simulationMode": "synthetic",
  "sourceKind": "founder-derived-proposal",
  "datasetVersion": "0.1-draft",
  "createdAt": "2026-10-08T09:00:00Z",
  "actorId": "agent-marcos",
  "relatedIds": ["client-004", "project-004", "approval-004"],
  "status": "waiting_approval",
  "evidenceIds": ["evidence-041"]
}
```
No es un esquema aprobado ni se asume que las APIs actuales admitan estos campos directamente: se requiere adapter.

## 8. Datos que **no** se inventarán como hechos
Clientes reales, facturación efectiva, contratos firmados, integraciones verificadas, métricas reales de ROI, acciones ejecutadas en WhatsApp/Stripe/bancos, permisos reales de agentes, certificaciones, consentimiento de terceros, evidencias de tests que no se han ejecutado.
