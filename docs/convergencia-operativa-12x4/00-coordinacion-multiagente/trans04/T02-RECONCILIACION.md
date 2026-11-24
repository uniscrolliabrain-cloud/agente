# T02 · Reconciliación B1 y telemetría independiente

Refs de lectura después de fetch: Trans01 `335e0d4a`, trans02 `46dca6ba`, Trans03 `1143d702` y campaña `d341f14f`. La campaña nombraba `Trans04` activa. La instrucción posterior asignó `trans04`; se aplicaron los seis commits documentales propios sobre `origin/trans04@a48b79e9` sin merge y la referencia anterior se conserva. Los cambios de T02 quedan en las superficies reservadas.

| Solicitud | Contraste con código y reconciliación |
|---|---|
| Trans01 T01-R03 / H01 | `SystemEvent` y el business receipt son autoridad de causalidad y evidencia. El comentario del stub `engine/events/exporters/otel.ts` propone derivar span IDs de event IDs e incluir IDs de negocio. No implementar esa transformación. Crear contexto técnico W3C, enlazar spans al cruzar commits o fan-out y mantener correlation/causation de negocio en evidencia interna. Hook del propietario después de commit; intentos, decisiones y efectos se cuentan en etapas distintas. |
| trans02 T02-04 / H02 | `runtime.ts` usa snapshot preparado y Slow se procesa aparte. El gate de entrega debe distinguir reserve/rendered/ACK de recepción y de outcome del negocio. Medir Fast hasta primer token y hasta terminal; cola con edad y profundidad por lane; lag desde commit durable hasta proyección/snapshot. Emitir una observación por transición; los reintentos cuentan en intento, no duplican el resultado durable. La cancelación C04 y el selector C05 tienen evidencia propia en otras refs. No adjudicar su estado a esta rama. |
| Trans03 SOL-03-04 / H03 | Clasificar timeout ambiguo y revocación por etapa en el mismo adapter seleccionado; usar fixtures locales y sin PII. Distinguir aceptación, confirmación y reconciliación. El wrapper no reintenta y no autentica. Tarball del bridge defensivo coincide con el SHA registrado en B1 y declara UNLICENSED según Trans03. ACME sigue sin licencia/generador en el SHA auditado. Bloqueadas incorporación y redistribución de nuevos artefactos. |
| Registry y store | Corrección de T01: `engine/service.ts` importa `MetricsCollector`, declara la propiedad e instancia `new MetricsCollector(db)`; la búsqueda anterior limitó el alcance. Es un collector persistente de negocio. Scrape de `globalMetrics` por proceso, fuera de ese store. Un span técnico no reemplaza un receipt ni la auditoría persistente. |

## Patchset independiente

HTTP agrupa series por método, plantilla registrada y estado; cualquier ruta sin handler registrado cae en `unmatched`. Los logs HTTP usan también la plantilla y el nombre del error. El scrape calcula p99 sobre la misma selección que el histograma, sin insertar una muestra global o de tenant en el registry. Conserva el nombre de la métrica y la omite cuando no hay observaciones. Los tests cubren cardinalidad, filtro y aislamiento entre scrapes. Revertir el patch de métricas recupera el comportamiento anterior sin migraciones ni cambios de datos.

## Wiring compatible pendiente de composición

Propuesta local para revisar con propietarios: una operación de observación síncrona y opcional por proceso que acepte exclusivamente etapa enumerada, duración finita, resultado enumerado y contexto W3C validado. Los productores entregan resultados ya decididos. Se descarta señal inválida, y el sink desactivado es no-op. El adaptador de exportación futuro agrupa y envía en background con cola acotada, sin `await` en hooks, sin propagar baggage ni cabeceras arbitrarias. Un collector caído incrementa una señal local de pérdidas, nunca modifica autorización, outbox, replay o SLA del chat. Probar cola llena, exportador caído, entrada con contenido sensible y dos tenants sintéticos. La composición exacta depende de contratos de evento/receipt y montaje por propietarios. Sin aprobación de SDK/exporter concretos, el lockfile conserva su resolución; no se integra OTLP ni se mide un circuito Fast/Slow/cola simulado como real.

## Dashboard inicial para el scrape existente

| Panel | PromQL inicial |
|---|---|
| Solicitudes por ruta y estado | `sum by (path, status) (rate(agente_http_requests_total[5m]))` |
| p99 HTTP por ruta, ms | `histogram_quantile(0.99, sum by (le, path) (rate(agente_http_request_duration_ms_bucket[5m])))` |
| Errores 5xx por ruta | `sum by (path) (rate(http_errors_by_route_total{status=~"5.."}[5m]))` |
| Capacidad worker | `agente_worker_active / clamp_min(agente_worker_max_active, 1)` |
| Duración media tareas, segundos | `sum(rate(agente_task_duration_seconds_sum[5m])) / sum(rate(agente_task_duration_seconds_count[5m]))` |

Mantener el scrape autenticado y las segmentaciones por tenant internas. Agregar desde histogramas entre réplicas; el gauge de p99 es una vista aproximada por scrape y carece de agregación temporal válida. Los paneles son definiciones iniciales documentadas. No se desplegaron ni se certificaron las consultas en Grafana.
