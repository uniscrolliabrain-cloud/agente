# Implementación cognitiva y conversacional V2

Estado: **PARTIAL_IMPLEMENTED · C15 NO-GO**. Este paquete documenta código ejecutado y sus límites. No declara terminadas las dieciséis campañas ni autoriza un piloto, merge o despliegue.

## Referencias y entrega

- Padre: `uniscrolliabrain-cloud/agente`, rama `feat/cognition-v2-runtime-C00-C15`.
- Main de partida: `54b8d5407a8576459448c4d059a877297d18ca7a`.
- Documentación de partida: `1e007d75b470490fe2ca8943ed5dc91803af039a`.
- Snapshot inicial del último gate completo: `24b4e8d` (818 tests, 801 PASS, 0 FAIL; 8/10 controles). Patchsets posteriores y sus verificaciones constan en C15/EXECUTION-REPORT.md.
- Hijo independiente: `agntia-ciberseguridad`, rama `feat/cognition-v2-sdk-ack`, commit `0a809a18f31aeaba03277d2399549bd1603cd68c`; base `c3a87cd7991e18a89cb5d8bae938be4ace5b9ae6`.
- SDK real empaquetado: `vendor/agntia-ciberseguridad-0.1.0-alpha.2.tgz`. Sin copiar/reimplementar su cliente HTTP. El hijo solo cambió para añadir el ACK ya existente en su API.
- Commits locales y separados; sin push a main, merge, deploy ni uso de empresas/activos reales.

## Qué se ha construido

Kernel autoritativo reutilizado; transacciones reales por conexión y contexto async; eventos con receipt pendiente/confirmado/desconocido; journal del bus existente con orden de commit por tenant; proyector con cursor, inbox, lease/fence, retry y DLQ; referencias de grafo y revisiones; cinco memorias privadas y revocación transitiva; atención persistente; output Slow durable, captura idempotente de Thought independiente del turno padre, extracción estricta y clasificación rules; CardStore y ledger separados; ContextServing con snapshots/deltas/referencias y RAG preparado fuera de Fast; pools/cuotas/circuitos independientes; ruta Fast propia sin ensamblaje legacy ni fallback Slow; Presenter con recibos, SVG accesible; coordinador de voz durable; bridge SDK→Python y relay con ACK posterior al commit, conectado a contexto mediante una proyección minimizada.

## Cómo comprobarlo y continuar

- [Mapa del código y consumidores](IMPLEMENTATION-MAP.md).
- [Runbook, flags y rollback](RUNBOOK.md).
- [Estado por campaña y bloqueos](CAMPAIGN-STATUS.md).
- [Resultados y aceptación C15](C15/EXECUTION-REPORT.md).
- [Revisión independiente](C15/SECURITY-REVIEW.md).
- [Baseline C00](00-baseline/README.md).
- [Ontología aprobada e implementación](C05/IMPLEMENTATION-REPORT.md).

La ruta V2 está apagada por defecto. `COGNITION_V2_TENANTS` es una allowlist explícita para pruebas controladas, no una migración automática de clientes. El modo `MULTI_TENANT_SHARED=true` falla cerrado para V2 hasta terminar el gate de RLS con rol restringido y la migración correspondiente. La aplicación no está lista para producción por pasar tests locales.
