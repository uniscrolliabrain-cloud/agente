# CIERRE_MVP_MULTIUSUARIO_V1

Criterios de cierre de la Campana 2 (Multiusuario). La campana se cierra cuando todos los criterios estan verificados con evidencia reproducible.

## Garantias (G1-G5)

| ID | Garantia | Criterio |
|---|---|---|
| G1 | Identidad y pertenencia | Todo request humano tiene Actor resuelto desde JWT verificado. Actor desactivado devuelve 403. Worker atribuye executingActorId y requestingActorId. |
| G2 | Acceso seguro | Todo acceso a recurso pasa por PDP fail-closed y deny-overrides. Campo clasificado sin permiso devuelve REDACTED o 403. 403 no revela contenido sensible. |
| G3 | Delegacion controlada | AssignmentService.assign(ctx) con assignedBy = ctx.actor.id. P_efectivos = P_asignador interseccion P_ejecutor interseccion P_tarea interseccion P_tenant. Agente no escala. |
| G4 | Coordinacion compartida | Notificaciones dirigidas por visibility. Presence y lock compartidos si multiProcess. Desactivacion sin huerfanas. |
| G5 | Consistencia y trazabilidad | CAS con expectedVersion. 409 con diff por campo. Reconcile por recurso. AuditTrail de reads sensibles. RecordHistory condicional. |

## Invariantes (I1-I13)

| ID | Invariante | Fase |
|---|---|---|
| I1 | Todo request humano tiene actorId resuelto desde JWT verificado | F1 |
| I2 | Toda operacion sensible lleva actorId y requestingActorId si delegada | F1 |
| I3 | Todo acceso a recurso pasa por autorizacion fail-closed deny-overrides | F2 |
| I4 | Todo acceso denegado deja audit-trail | F2 |
| I5 | Ningun campo clasificado se devuelve sin autorizacion | F2 |
| I6 | Toda escritura compartida lleva expectedVersion y CAS | F4 |
| I7 | Todo conflicto devuelve diff por campo | F4 |
| I8 | Todo conflicto se reconcilia sin recargar | F4 |
| I9 | Presence y lock compartidos en Store (condicional a multi-proceso) | F5 |
| I10 | Toda notificacion dirigida a actor o tenant | F5 |
| I11 | Todo SSE con Last-Event-ID y replay (condicional a reconexion) | F5 |
| I12 | Todo write deja RecordHistory (condicional a activity no cubre) | F6 |
| I13 | Todo acceso sensible deja AuditTrail | F6 |

## Tests

### Obligatorios (14)

| ID | Test | Fase |
|---|---|---|
| T1 | Request sin JWT devuelve 401 | F1 |
| T2 | sub sin User vinculado devuelve 401; usuario sin pertenencia al tenant devuelve 403 | F1 |
| T3 | Ownership: B lee AgentTask de A devuelve 403 | F2 |
| T4 | ACL: B lee recurso compartido devuelve 200; B escribe devuelve 403 | F2 |
| T5 | Campo clasificado sin permiso devuelve REDACTED o 403 | F2 |
| T6 | Dos writes concurrentes: uno 200, otro 409 con diff | F4 |
| T7 | 409 incluye diff por campo | F4 |
| T8 | Reconcile sin recargar devuelve 200 | F4 |
| T10 | Notificacion dirigida: B no ve la de A | F5 |
| T12a | Write deja audit-trail con actorId | F6 |
| T13 | Agente con tarea delegada no obtiene mas permisos que el asignador | F3 |
| T14 | Actor desactivado pierde acceso en el siguiente request | F1 |
| T15 | Worker atribuye executingActorId al agente correcto y requestingActorId al solicitante | F1 |
| T16 | Error 403 no revela contenido sensible | F2 |
| T17 | Reconcile no salta autorizacion ni sobrescribe version posterior | F4 |

### Condicionales (3)

| ID | Test | Condicion |
|---|---|---|
| T9 | Dos procesos, dos actores, presence y lock compartidos | multiProcess = true |
| T11 | SSE reconecta con Last-Event-ID, recibe los perdidos | sseReplayEnabled = true |
| T12b | Write deja record-history con before y after | recordHistoryEnabled = true |

## Criterio de cierre

- Los 14 tests obligatorios en verde.
- Los 3 tests condicionales en verde o SKIP con justificacion de condicion de activacion.
- Typecheck verde.
- git push origin feat/multitenancy-campaign.
- KNOWN_ISSUES.md firmado con las deudas abiertas.
- -pendientes.md actualizado: deudas resueltas cerradas, deudas abiertas documentadas.
- Confirmacion al humano: Campana 2 cerrada. Siguiente: Campana 3.

## Lo que NO se cierra en esta campana

- Gestion empresarial: perfiles editables, clientes, procedimientos, plantillas, nominas, compliance, datos clinicos.
- Multi-tenant real en un solo Postgres: Campana 1, cerrada.
- Colaboracion en tiempo real: CRDT, OT, WebSocket.
