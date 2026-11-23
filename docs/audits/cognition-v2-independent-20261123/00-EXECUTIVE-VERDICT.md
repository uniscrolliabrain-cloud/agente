# Auditoría independiente · veredicto provisional

Snapshot inmutable: `b59b2950ee8aff9f476d4f72c7b31a24d54d632d` (C05, 2026-11-23 13:43:15 UTC). Rama de auditoría creada desde ese SHA. **NO_GO para declarar convergencia o producción. GO para seguir auditando y añadir pruebas aisladas.**

## Hallazgos prioritarios (inspección estática, no PASS)

1. **AUD-01 ALTO CONFIRMADO:** `apps/server/src/agent.ts:34-36` excluye `agentBackend === 'agui'` del selector V2; requiere matriz de configuración y contrato explícito de excepción. Un tenant V2 podría usar backend remoto en esa configuración.
2. **AUD-02 ALTO NO VERIFICADO:** no se acreditó una fuente automática general de trabajos Slow desde eventos empresariales/conversaciones; `cognition-v2-routes.ts:81-91` encola por endpoint, `workers.ts` consume colas. Verificar productores adicionales por búsqueda global.
3. **AUD-03 ALTO CONFIRMADO:** `runtime.ts:159` reconoce que acciones empresariales permanecen en V1 hasta migración gobernada V2. No retirar V1.
4. **AUD-04 ALTO CONFIRMADO:** `runtime.ts:75-77` impide V2 con `MULTI_TENANT_SHARED=true` sin certificación RLS. Protección deliberada, no bug que deba suprimirse.
5. **AUD-05 MEDIO CONFIRMADO:** `runtime.ts:142-155` aplica rol autorizado o LAIA por defecto; revisar pruebas de cambio/revocación de rol y su propagación a voz.
6. **AUD-06 ALTO CONFIRMADO:** `voice-session-routes.ts:135-145` responde JSON tras renderizado de transcripción; no prueba streaming de primer audio ni TTS.
7. **AUD-07 MEDIO CONFIRMADO:** `media-lifecycle.ts` declara expresamente que NO está montado en rutas HTTP; sus tests no acreditan transporte operativo.
8. **AUD-08 MEDIO CONFIRMADO:** `external-connectors.ts` conserva JEV/Anam/ElevenLabs en stubs, sin egress; `assertConnectorGrant` no valida firma ni registro durable, responsabilidad de un gate futuro.
9. **AUD-09 MEDIO CONFIRMADO:** `workers.ts` verifica heartbeats y retry/dead-letter de proyección/receipts; no acredita backlog vacío ni servicios externos. Salud de worker ≠ salud funcional E2E.
10. **AUD-10 ALTO BLOQUEADO:** no se ha ejecutado suite local ni E2E sobre este snapshot; no es legítimo certificar rendimiento, aislamiento o ausencia de regresiones.

**Alcance:** lectura de código del snapshot y comparaciones GitHub; sin ejecución local ni infraestructura de pruebas. No se modificaron implementaciones ni secretos. No hay merge ni deploy.
