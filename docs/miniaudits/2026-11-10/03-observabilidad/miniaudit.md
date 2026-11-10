# Bloque 03 · Observabilidad

> Campaña UX · 2026-11-10 · **20 hallazgos** (S0 0 · S1 7 · S2 8 · S3 5)
> Estado: informe recibido. Validación: parcial.

## Hallazgos

| # | Sev | Hallazgo | Estado |
|---|---|---|---|
| 1 | S1 | `?tenant=` en `/metrics` devuelve vacío: el logger se monta sin `getTenantId` y ninguna serie lleva label `tenant`. | **Parcial**: `request-logger.ts:50` ya declara `getTenantId?:` y lo usa si existe; falta comprobar el cableado en `app.ts`. |
| 2 | S1 | La auth corre después del logger (403 vs 582): ningún log HTTP tiene owner ni tenant. | Sin verificar |
| 3 | S1 | 5 de 8 inputs de alerta son constantes 0: fallos/h, cuota, circuito, dead-letter y outcome incierto. | Sin verificar |
| 4 | S1 | El único handler de alertas escribe al mismo log: si el proceso cae, no hay alerta. | Sin verificar |
| 5 | S1 | `/api/health` fija `worker: true` y escribe `health/ping` + emite `startup` en cada sonda: 8.640 escrituras y eventos diarios. | Sin verificar |
| 6 | S1 | `background_failures_total` no aparece en `health-deep` ni cambia `ok`. | Sin verificar |
| 7 | S1 | `inc()` sobre métrica no registrada descarta el dato en silencio. | Sin verificar |
| 8 | S2 | `bus.emit` degrada sin propagar; `persisted` se revisa en pocos sitios. | Sin verificar |
| 9 | S2 | `backgroundFailure` importa el módulo en cada fallo y traga sus errores. | Sin verificar |
| 10 | S2 | El histograma HTTP no normaliza ids numéricos, slugs ni emails: cardinalidad sin techo. | Sin verificar |
| 11 | S2 | `render()` no escapa labels: un tenant con comillas rompe el scrape entero. | Sin verificar |
| 12 | S2 | El p99 es un gauge calculado al scrapear; no se agrega entre instancias. | Sin verificar |
| 13 | S2 | Latencia de LLM sólo media, sin buckets: no hay p95 ni p99. | Sin verificar |
| 14 | S2 | `health-deep` sobrescribe `checks.kernel` con string y luego boolean; `tenantService` se evalúa con dos criterios. | Sin verificar |
| 15 | S2 | Las comprobaciones de `health-deep` no tienen timeout. | Sin verificar |
| 16 | S3 | 55 `console.*` fuera de `log.ts`; `onError` registra sólo `error.name`. | Sin verificar |
| 17 | S3 | Sin service, version, pid ni region en las líneas de log. | Sin verificar |
| 18 | S3 | `traceparent` se parsea y se descarta: no se propaga a los 14 `fetch` salientes. | Sin verificar |
| 19 | S3 | 42 líneas de comentario con mojibake en `registry.ts` y `request-logger.ts`. | Sin verificar |
| 20 | S3 | Sin exportador externo: `prom-client`, Sentry y OTel suman 0. | Sin verificar |

## Arreglos propuestos

1. **Una serie, un tenant.** Cablear `getTenantId` en el logger y añadir label `tenant` a las series que lo admitan; sin él, `?tenant=` no puede funcionar nunca.
2. **Alertas que alertan.** El handler no puede ser `console`: mínimo, evento al bus + contador que mueva `ok` en `health-deep`. Los 5 inputs constantes son peores que no tener alerta.
3. **Sonda sin efectos.** `/api/health` no debe escribir ni emitir por petición: un `ping` cada 10 s son 8.640 escrituras/día por instancia. Separar "estoy vivo" de "estoy sano".
4. **Cardinalidad acotada**: normalizar path (`/threads/:id`), no escapar labels a mano sino con `escapeLabel` del formato Prometheus, y buckets reales para LLM.
5. **`health-deep` con timeout** por comprobación y un único tipo por check, no string y boolean alternándose.

## Plan

- **P1 (correctitud)**: escape de labels, `health-deep` determinista y con timeout, sonda sin escrituras.
- **P2 (señal)**: 5 inputs de alerta con dato real; `background_failures_total` en `health-deep`.
- **P3 (traza)**: propagar `traceparent` en los `fetch` salientes y añadir service/version/pid/region al log.

---

## Revisión de destino

Fase 2 se define como "el cliente opera 30 días sin intervención", y eso se sostiene con señal, no con logs. Falta lo que el informe no pide:

- **Métricas de producto**: latencia de resolución, queries vacías, 403/422, vistas `stale`, acciones aprobadas frente a ejecutadas.
- Trazas con `tenantId`, `threadId` y `taskId` para poder reconstruir una decisión (el audit trail del kernel depende de esto).
- SLO mínimo y alerta que no sea el propio log.

## Conclusión

Sin esto no se puede declarar Fase 2: habría que enterarse de las caídas por el cliente. Los arreglos P1 (labels, health-deep determinista, sonda sin escrituras) son la base; las métricas de producto son el siguiente paso obligatorio antes de un piloto amplio. **P1**.
