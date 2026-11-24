# Trans03 — ejecución M1–M3
Aplicar PROTOCOLO-3-MACROTURNOS.md. Verificar T02-B2 y cambios existentes google-auth.ts, meta-whatsapp.ts, stubs/whatsapp.ts.
## M1
1. P01: inventario contratos reales, scopes, SDK/HTTP, egress y licencias; conservar fixes OAuth redirect, Meta error sanitizado/body cancel y Evolution 429 ambiguo. Test persistente de transporte.
2. P02 JEV: reutilizar transporte existente, no duplicar classifier trans02. Definir timeout/abort, input mínimo, error tipado, no autoridad.
3. P03 Anam/ElevenLabs: puertos versionados, consentimiento, sesión/epoch, cancelación/barge-in; ACK no playback. Mock y sandbox solo autorizado.
4. P04 Composio: catálogo mapeado a IDs existentes, binding por cuenta/generación, scope por operación, egress allowlist, no dispatcher alternativo. H03 hooks Trans04; deps solicitadas, no editar lockfile. B2.
## M2
5. P05 WhatsApp: Meta/Evolution selección explícita, firma webhook, binding, dedupe, inbound/outbound y reconciliación; no fallback por timeout. markRead respuesta vacía según contrato real. Test duplicado, firma falsa, timeout post-send.
6. P06 Maps lectura; P07 Calendar disponibilidad/create; P08 Drive lectura/revisión; P09 Gmail lectura/send; P10 Docs lectura/create/update según APIs reales. Por cada uno: OAuth existente, scopes mínimos, generation revoke, schema, adapter, accepted/confirmed/rejected/unknown, receipt a Trans01 y fixture A/B. No inventar endpoints ni permisos. B3.
7. P11 ciber tarball/upstream: verificar versión/licencia/API y scope; separar pasivo/activo/remediación. P12 gestoría: upstream, decimal/moneda/periodo, conciliación idempotente, no pago/declaración. P13 catálogo para recompilación y owner actions. B4.
## M3
8. Auditar Trans04 fixtures/CI/telemetría/gates; corregir propios errores ambiguos y scopes. B5.
9. Fault injection, replay, revoke, cuota, egress, kill switch, rollback; matriz configured/verified/blocked por operación. B6. No llamadas reales sin autorización.
