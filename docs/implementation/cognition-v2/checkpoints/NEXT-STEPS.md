# Próximos trabajos

Checkpoint UTC: 2026-11-16T13:47:34.208372+00:00. Código auditado: [640a55db01fc9f934bf927dec53e97035f0455f3](https://github.com/uniscrolliabrain-cloud/agente/commit/640a55db01fc9f934bf927dec53e97035f0455f3). Base: [54b8d5407a8576459448c4d059a877297d18ca7a](https://github.com/uniscrolliabrain-cloud/agente/commit/54b8d5407a8576459448c4d059a877297d18ca7a). Evidencia local sintética; no certificación de producción.

1. Publicar este checkpoint con informes, resultados depurados y reproducciones; comprobar SHA remoto. Conservar enlaces por commit para auditoría paralela.
2. C09/C11/C12: corregir P1-01 (entrega por run) y P1-02 (eventos públicos permitidos); regresiones de tres ejecuciones, replay, concurrencia, abort y razonamiento privado; commits separados.
3. Incorporar W6 solo mediante revisión/cherry-pick controlado, conservando reportes del principal; actualizar gate C08 para distinguir contrato verificado de proveedor activado. Implementar gateway egress durable sin enviar datos reales.
4. C02/C04/C06: consumidores secundarios durables, workspace integrado, consolidación y resolvers de dominio para backfill; pruebas de crash/restore y revocación.
5. C10–C12: ACK tipado por consumidor, acciones y delegaciones V2 mediante kernel/PDP/aprobaciones, presentaciones basadas en recibos y presupuestos/tokenización; mantener V1 temporal hasta paridad.
6. RLS integral con usuario SQL restringido y dos empresas/actores sintéticos sobre HTTP, workers, voz y bridge. Habilitar shared solo cuando supere el gate.
7. C13/C14: adaptadores oficiales y E2E sintético con credenciales/delegaciones autorizadas. No bloquear mejoras autónomas por estas dependencias.
8. C15: recuperar browser/coverage, resolver auditorías sin falsos verdes, medir carga/latencia/costes y calidad cognitiva, restore/canary/rollback/cutover; nuevo checkpoint y revisión independiente. No declarar campañas cerradas por pruebas parciales.

