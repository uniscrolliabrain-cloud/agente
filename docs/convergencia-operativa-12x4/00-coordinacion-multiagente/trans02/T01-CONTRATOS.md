# T01 · Contratos propuestos para revisión en B1

## Decisión de arquitectura

Conservar kernel/runtime como punto de autorización y ejecución de SOPs, capacidades y efectos. Fast lee contexto local preparado y puede formular una solicitud tipada. Slow clasifica y propone con procedencia. JEV puede evaluar el contenido minimizado que el PDP haya autorizado. Los dos últimos quedan fuera del camino síncrono del chat y de la realización de efectos. Conservar V1 autorizado hasta demostrar paridad de montaje, permisos, recuperación y rollback.

1. **Admisión de observación.** Consumir solo eventos durables de una allowlist revisada y después del commit. Exigir versión de schema, tenant, actor, propósito, revisión de política, identificador de evento, correlationId y causationId. Para cada candidato, resolver el recibo y su revisión con autoridad vigente. Rechazar outputs del propio observador, eventos derivados de inferencias y referencias privadas ajenas. Usar clave de entrega por tenant, evento, propósito y revisión de política, y validar coincidencia de la entrada ante colisión. El cursor avanza tras un procesamiento o descarte auditable. Una cuota transitoria aplaza el procesamiento. Una operación ambigua queda pendiente de reconciliación.
2. **Estados epistémicos.** Conservar ID, revisión y origen de cada evidencia. Una proposición del modelo sigue como hipótesis o estado incierto. Un resultado reportado conserva la fuente. Un resultado verificado exige un recibo tipado de su ejecutor y un verificador capaz de contrastar operación, alcance, estado y revisión. La terminación de Slow y el ACK del servidor son evidencias de sus propios procesos.
3. **Persona.** LAIA por defecto. Resolver una preferencia autorizada en el registro existente y vincularla a la identidad de petición. Rechazar cambios de actor, owner, tenant, propósito o revisión de política desde el cliente. Expresar cualquier propuesta de acción por el puerto tipado del runtime, con autorización propia e idempotencia.
4. **ACL y atención.** Preservar lectura privada por defecto. Para compartir una referencia, requerir permiso específico y revalidar al construir y servir el snapshot. Un cambio de revisión, caducidad o revocación debe invalidar la referencia, incluido cualquier intento pendiente de entrega. Proponer una única fachada versionada de ranking y comparar relevancia y presupuesto frente al baseline. Fast usa un contexto local acotado aunque Slow y JEV estén saturados o caídos.
5. **Persistencia y rollback.** T01 solo documental. T02 debe preservar proyecciones y eventos, agregar estructuras compatibles de forma aditiva y mantener el observador desactivado por defecto. Para volver atrás, desactivar admisión y selector por tenant, drenar o cercar leases y volver al montaje anterior manteniendo cursores, DLQ, recibos e idempotencia. Reproducir proyecciones sin repetir efectos externos.

## Ownership y solicitudes

Superficie del turno ejecutado: `docs/convergencia-operativa-12x4/00-coordinacion-multiagente/trans02/{BITACORA,T01-INVENTARIO,T01-CONTRATOS}.md`.

Reserva propuesta para T02: `apps/server/src/agent.ts`; `apps/server/src/engine/cognition/v2/{runtime,chat-agent,context,attention,slow,slow-observation,slow-observation-candidates,slow-observation-worker,projector,kernel-receipts,runtime-outcome,storage,workers,jev-classifier,jev-egress}.ts`; `apps/server/src/engine/agents/personas/` (solo resolución), `apps/server/src/cognition-worker-entry.ts` (previa coordinación) y pruebas nuevas `tests/trans02-*.test.ts`. Grafo/memoria legacy y pruebas existentes quedan pendientes de reserva por archivo.

| Solicitud | Propietario | Cambio propuesto y prueba |
|---|---|---|
| T02-01 | Trans01 | `app.ts::createApp`, `engine/conversation.ts::run` y `engine/service.ts`: acordar un selector único, identidad scoped y devolución del receipt canónico al observador. Verificar HTTP local, remoto y legacy, con flag on/off y sesión revocada |
| T02-02 | Trans01 | Eventos/receipts: publicar después del commit un envelope causal versionado, con las referencias mínimas. Verificar dedupe, rollback y replay sin repetir efectos |
| T02-03 | Trans03 | Acordar puerto JEV/media, salida minimizada y recibos de conectores tipados. Probar ausencia de credenciales, timeout y revocación |
| T02-04 | trans04 | Acordar métricas del cursor, cola, lag, errores, entrega y latencia Fast. Probar trazas correlacionables sin contenido sensible |

## Pruebas rojas propuestas y gates

| Fase | Evidencia prevista para el circuito distribuido |
|---|---|
| 01 Consolidación | HTTP real `/api/copilotkit/run` con callback extraído, clon y selección por tenant. Comprobar rutas V1/V2/AG-UI |
| 02 Observabilidad | Dependencia causal evento–recibo–tarjeta–snapshot; métrica sin contenido privado |
| 03 Proveedores | Cola Slow saturada y JEV no disponible; Fast termina dentro de su presupuesto y la ejecución sigue gobernada |
| 04 WhatsApp | Recibo de mensaje enlazado con el canal autorizado; un resultado incierto queda visible como tal |
| 05 Google | Cinco servicios con revocación entre receipt y snapshot; un usuario B no obtiene el resultado del usuario A |
| 06 Datos sintéticos | Reproducir el mismo evento, introducir contradicción y verificar una sola admisión sin bucle |
| 07 Owner real | Cambio de persona no altera permisos; prueba sintética previa a autorización de cualquier efecto real |
| 08 Ciberseguridad | Una observación conserva estatus de hipótesis hasta que existe evidencia autorizada |
| 09 Observabilidad V2 | Medir retraso, duplicados, presión de cola y calidad del ranking |
| 10 Gestoría | Conciliación con recibo específico y propuesta fiscal sin autorización implícita |
| 11 Recompilación | Mantener procedencia y revisiones durante recompilación de dominios/SOPs; revocar referencia antigua |
| 12 Validación | Jornada sintética con revocación a mitad de stream, caída, recuperación y replay con dos tenants |

Casos inmediatos a reservar: `tests/trans02-routing.test.ts`, `tests/trans02-observation.test.ts`, `tests/trans02-context.test.ts`. Diseñar fixtures sintéticas en PGlite y repetir aislamiento con Postgres y rol restringido. En observación, cubrir doble worker, replay, evento derivado y revocación entre selección y enqueue. En contexto, cubrir alteración de referencias, invalidación de caché y acuse de otro tenant. En Fast, usar barreras controladas para que Slow/JEV queden bloqueados mientras termina el stream.

En P2 se implementan y ejecutan los slices por fases. P3 revisa causalidad, ACL, versiones, bucles y ranking. P4 inyecta fallos y verifica rollback, replay, carga y aislamiento sobre SHA combinado. Las dependencias externas y el owner real quedan sujetos a autorización posterior.
