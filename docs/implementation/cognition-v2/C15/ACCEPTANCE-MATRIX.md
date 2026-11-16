# Aceptación A01–A30

PASS indica exclusivamente el escenario local descrito y sus fixtures ejecutados; no PASS de campaña ni certificación externa. Ver comandos y resultados reales en EXECUTION-REPORT.md.

| ID | Estado | Alcance / límite |
|---|---|---|
| A01 | PARTIAL | HTTP real con dos empresas, user activo y membership; roles/agentes V2 completos pendientes |
| A02 | PARTIAL | Política privada self-read y sin herramientas de negocio; PDP completo V2 no certificado |
| A03 | PARTIAL | Puerto interno de escritura V2 con aprobación formal ligada al payload, consumo único y receipt incierto; no montado ni con compensación |
| A04 | PASS | Persist-before-confirm, rollback y ACK de commit perdido con unknown/eventId, local |
| A05 | PASS | 501 eventos, cursor durable y orden real de commit por tenant |
| A06 | PASS | Replay idempotente, revisión estable, concurrencia de writers y no resurrección |
| A07 | PARTIAL | Retry/DLQ implementados; crash/retry y agotamiento Slow probados, operación completa pendiente |
| A08 | PARTIAL | Grafo de referencias y evidencia Thought real; consolidación/escala no certificadas |
| A09 | PASS | Cinco memorias funcionales escritas/recuperadas, privacidad y TTL en fixtures |
| A10 | PASS | Revocación transitiva, fuente RAG retirada/corregida y snapshot invalidado |
| A11 | PARTIAL | Datos sin autoridad, límites y schemas; no evaluación adversarial con proveedor LLM real |
| A12 | PARTIAL | Diseño 1.0.0 aprobado, contratos/registro/revocación/flujo probados; benchmarks/ablaciones pendientes |
| A13 | PASS | Scoring finito/versionado separado de autorización, scope privado en tests |
| A14 | PARTIAL | MetaHints de resultado persistidos por eventos; todos los rules/ACK de hints pendientes |
| A15 | PASS | Fast responde con Slow ocupado; admisión y timeout separados |
| A16 | PARTIAL | Job→Thought→Card con fuentes reales; todos los dominios/evidencias externos no cubiertos |
| A17 | BLOCKED_EXTERNAL | Contrato TypeSafe/JEV verificado e integrado; gateway durable probado con fixture; sandbox real, consentimiento/DPA y calibración externos pendientes |
| A18 | PASS | Lease/fence, render/ACK, restart PGlite, idempotencia y conocimiento reutilizable |
| A19 | PARTIAL | Snapshots preparados, deltas/referencias y source watermark; cobertura completa de consumers pendiente |
| A20 | PARTIAL | Cota conservadora por bytes y salida limitada; tokenizer/modelo externo no medido |
| A21 | PARTIAL | p50/p95/p99 medidos con fixture local, no proveedor/SLA aprobado |
| A22 | PASS | Carriles sin fallback cruzado y fallo explícito si falta Fast |
| A23 | PASS | Journey desde receipts durables y texto persistido igual al stream, local |
| A24 | PARTIAL | Chromium real: SVG, aria-hidden, reduced motion, teclado Enter y móvil; no WCAG integral |
| A25 | BLOCKED_EXTERNAL | Sin sandbox Anam/media/contrato verificado |
| A26 | PARTIAL | Epoch y cancelación local probados; ACK/playback físico no probado |
| A27 | PARTIAL | SDK real↔Python y bridge nominado probado; mapping productivo no configurado |
| A28 | NOT_RUN | Jobs Cyber reales/parent coordinator y grants de piloto no activados |
| A29 | PARTIAL | Crash/restart/fence/unknown commit probados; restore operacional y caos integral pendientes |
| A30 | NOT_RUN | No canary real, backfill ni retiro completo del legacy |

Decisión integral: **NO_GO / NOT_CERTIFIED**.
