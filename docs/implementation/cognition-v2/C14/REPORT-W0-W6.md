# C14 — Puente gobernado y relay durable

Fecha: 2026-11-15. Estado: **PARTIAL_IMPLEMENTATION / PRODUCTION_NO_GO**. El gap del SDK ACK ha sido implementado y probado; no se conserva como bloqueo artificial.

## Referencias y alcance

- Padre base: `54b8d5407a8576459448c4d059a877297d18ca7a`; rama `feat/cognition-v2-runtime-C00-C15`.
- Hijo base leído: `c3a87cd7991e18a89cb5d8bae938be4ace5b9ae6`; delta SDK en rama propia `feat/cognition-v2-sdk-ack`, commit `0a809a18f31aeaba03277d2399549bd1603cd68c`.
- ADR-009 y campaña C14 leídas; hijo AGENTS.md, README, docs/README, registro `docs/research/sources.json`, SDK `client.ts`, `contracts.ts`, `agent-tools.ts`, `hono.ts`, Python `events/outbox.py`, `agents/capabilities.py`, `util.py` contrastados.
- Cambio hijo limitado a SDK ACK existente, versión alpha.2 y pruebas; sin endpoints/permisos nuevos. No scanner, remediación, llamada a cuenta externa, cliente real, merge ni deploy.

## Implementación real

`apps/server/src/engine/security-v2/contracts.ts` contiene esquemas strict de identidad, capacidades de lectura, estados y envelope del outbox real. El estado `partial` queda parcial y la cobertura sigue `not_reported`: un evento de finalización no equivale a seguridad certificada.

`sdk-adapter.ts` reutiliza `CyberClient` real del hijo para las tres lecturas gobernadas: assets, findings y jobs. El modelo solo puede solicitar una capacidad nominada; no puede elegir URL, método, tenant, actor, credencial, activo, scanner o aprobación. Dos callbacks del host comprueban la identidad/policy actual y resuelven una delegación humana vigente ligada a tenant/actor/agente/recurso. El puente no crea ni aprueba grants. La respuesta solo conserva IDs, estado, revisión y severidad admitida; no transmite contenido de evidence, tokens, nombres ni flujos.

`event-relay.ts` usa `CyberClient.outbox()` y `CyberClient.ackOutbox()` nativos y conserva un inbox durable por tenant/consumer/eventId con hash y proyección minimizada. Su callback de proyección solo puede escribir efectos locales a través del Store transaccional. El efecto y dedupe se confirman antes de intentar ACK. Un ACK perdido queda pendiente y se reintenta antes de poll/avance de cursor; el efecto no se repite. La secuencia es la secuencia real de auditoría del hijo, no un contador inventado en el padre. El relay no invoca modelos ni bloquea Fast.

Tablas aditivas: `cognition_v2_cyber_cursors` y `cognition_v2_cyber_inbox`. Sin borrados ni backfill implícito. Se conserva evidencia mínima incluso cuando falta el transporte ACK.

## SDK reproducible

Artefacto vigente: `vendor/agntia-ciberseguridad-0.1.0-alpha.2.tgz`.

- Paquete: `@agntia/ciberseguridad@0.1.0-alpha.2`.
- Origen: checkout del SHA hijo fijado arriba; `npm ci --ignore-scripts` y `npm test` fueron ejecutados previamente por el agente principal.
- Empaquetado: `npm pack --ignore-scripts --cache /tmp/cyber-sdk-npm-cache --pack-destination /workspace/uniscrolliabrain-cloud-agente/vendor --json`, exit 0.
- SHA256: `72067a451731e384542dbd153843da687605b26d1a823c3826663e15bcab895b`.
- npm shasum: `f867e9ae0bf3e1f5eca4f744e8eb80196606f785`.
- Licencia declarada `UNLICENSED`, paquete privado alpha: este artefacto permite revisión interna reproducible, no habilita distribución comercial o producción.

## Gaps comprobados y bloqueos

1. **CERRADO_SDK_ACK:** Python ya implementaba `POST /v1/tenants/{tenant}/outbox/{id}/ack`, pero alpha.1 no lo exponía. El fundador autorizó cambios hijo ante delta probado. Se creó rama propia y commit `0a809a1`, que añade únicamente `CyberClient.ackOutbox()` cerrado en alpha.2, actualiza lock/version y prueba la ruta real. No cliente HTTP paralelo ni endpoint nuevo. El relay usa ese método por defecto; `ChildAckPort` queda solo como DI para pruebas. Un ACK fallido devuelve `CHILD_ACK_PENDING` y no adelanta cursor. Este gap no es una dependencia externa pendiente.
2. **BLOCKED_AUTHORITY_MAPPING:** el host todavía debe conectar callbacks a su PDP, manifest de agente, broker de credenciales y grant/delegación humana real. No existe un default permissive.
3. **BLOCKED_CHILD_PILOT:** `production_enabled=false`, 2 PASS / 40 PARTIAL y gates/licencia/DPA pendientes del hijo; este código no eleva su estado.
4. **PARTIAL_COGNITIVE_WIRING:** la transacción de proyección está disponible, pero el host debe registrar el evento corporativo versionado y mapearlo a grafo/contexto/Presenter con sus políticas. No se publica un evento no registrado ni se expone un router automático.
5. No se han implementado jobs mutantes, grants, aprobaciones, remediación ni cambios de presupuesto. Estas capacidades siguen bajo la autoridad del hijo y del runtime del padre.
6. RLS Postgres y operación multiworker real necesitan el gate de infraestructura C02/C15; pruebas PGlite no equivalen a certificación de ese entorno.

## Pruebas y alcance de evidencia

`tests/cognition-v2-cyber-bridge.test.ts` usa SDK real y transporte fetch sintético, no proveedor externo. Acredita contrato de petición, minimización, rechazo de input arbitrario/cross-tenant, revocación del padre antes de la llamada, partial≠completed, persistencia-before-ACK, reintento tras ACK perdido, restart del relay, idempotencia de efecto y rechazo de hash manipulado. Resultados finales: 5/5 pruebas padre PASS, checker raíz exit 0, SDK alpha.2 checker + 7 pass/1 skip y contrato live Python/SDK + outbox 9 pass/0 skip. Comandos y alcance en `TEST-RESULTS.md`.

## Reutilizar / sustituir / legacy

- REUTILIZAR: SDK hijo, outbox Python y grants/gateway; Store transaccional corregido del padre.
- SUSTITUIR: ausencia de wiring y cualquier idea de proxy genérico por puerto de capacidades cerrado.
- LEGACY TEMPORAL: despliegue y runtime del hijo conservan independencia; no se fusiona el adversarial lab ni se reemplazan sus controles.

## Rollback

No montar el bridge ni iniciar el relay revierte la integración sin tocar datos fuente. Detener el relay conserva inbox y cursor, lo que permite continuar los ACK pendientes. Retirar el artefacto/dependencia requiere quitar sus imports consumidores; no borrar evidencia ni alterar los jobs del hijo. Activación y despliegue requieren aprobación separada del fundador.
