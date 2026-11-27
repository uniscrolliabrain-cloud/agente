# Trans00–Trans06 — preparación de conexiones sin credenciales

## Alcance

Complementa scripts/connections.ts, scripts/lib/connections.ts, scripts/secrets-check.ts y .env.example. No sustituye adaptadores existentes, kernel, runtime, Cognition V2, bus, políticas ni autorizaciones por tenant. No introduce efectos de negocio ni activa despliegues. Rama basada en Trans00; integrar selectivamente tras contrastar las ramas de campaña.

## Ejecución sin claves

    pnpm infra:readiness
    pnpm infra:readiness:test

El informe muestra exclusivamente nombres, estados y códigos HTTP, sin valores ni payloads. Por defecto no utiliza red. Los fixtures son sintéticos.

## Ejecución con credenciales autorizadas

Proyecto Doppler agntiapro, configuración dev_campaign_transversal_leads_ia. No utilizar prd. Si Codex no tiene acceso seguro a Doppler, ejecutar desde Linux o CI autorizado y entregar únicamente resultados sanitizados.

    doppler run --project agntiapro --config dev_campaign_transversal_leads_ia -- pnpm infra:readiness
    doppler run --project agntiapro --config dev_campaign_transversal_leads_ia -- pnpm infra:readiness --probe --only=google-workspace,gemini,google-places --strict
    doppler run --project agntiapro --config dev_campaign_transversal_leads_ia -- pnpm infra:readiness --probe --only=slow-deepseek,jev,grafana-api,sentry-release --strict

GOOGLE_TEST_ACCOUNT_EMAIL debe identificar la cuenta dogfood autorizada. Places puede consumir cuota. No enviar correo, WhatsApp, llamadas, eventos de ingestión ni desplegar desde estas sondas. El proxy HTTP de Codex debe aprobar api.doppler.com y los destinos externos requeridos; no persistir secretos ni eludir sus restricciones.

## Estados

- stub_missing_config: faltan nombres requeridos por este contrato.
- stub_wiring_pending: no existe sonda en este suplemento; requiere ingeniería o verificación de los contratos existentes.
- configured_unverified: presencia, no validación.
- invalid_config: incoherencia local.
- probe_pass / probe_failed: solo evidencia de la operación concreta probada, nunca certificación de runtime.
- HTTP 401/403/404/429 y errores de transporte se distinguen; un 403 puede proceder del proxy, no del proveedor.

## Evidencia aportada por el operador

Google Cloud agentic-osv2, cliente agenticos-v3: renovación OAuth y doce scopes verificados, Gmail, Drive, Calendar, Meet, People, Tasks con lecturas exitosas. Refresh token guardado y verificado en la configuración Doppler de desarrollo. Places searchText y catálogo de Gemini devolvieron 200. Docs/Sheets/Slides solo scopes, no operaciones; embeddings, inferencia y Vertex RAG sin prueba. Evidencia externa aportada por el operador, no ejecución de esta rama.

Codex instalador informa dependencias congeladas, typecheck y smoke sample correctos en su checkout. Informa secreto HTTP no vinculado y 403 del túnel hacia api.doppler.com; su verificación no corresponde a este patch. Ninguna credencial se ha inyectado en esta sesión.

## Handoff por campaña

- Trans00: reconciliar contratos, CI y evidencia; no merge automático.
- Trans01: DB aislada de prueba, roles de migración y runtime separados, RLS, fixtures de dos tenants. No probar mutaciones contra DSN no certificado. Los nombres DATABASE_MIGRATION_URL y TEST_* son propuestas, no wiring confirmado.
- Trans02: Fast Muse, Slow DeepSeek con OPEN_ROUTER_API_KEY, JEV con OPENROUTER_API_KEY independiente. JEV_API_KEY solo si el puerto real lo usa. Confirmar modelos, endpoints, embeddings y dimensiones.
- Trans03: Google OAuth por identidad tenant/usuario, no token global en live. Revisar adapters existentes antes de extender. WhatsApp firma + bindings, Resend remitente verificado, Vapi assistant/phone/webhook, Anam y ElevenLabs. No activar outbound.
- Trans04: Grafana API autenticada no equivale a ingestión Cloud. Completar endpoint/tenant/auth por señal, OTLP protocol y receipt; Sentry DSN no prueba recepción. Verificar releases, métricas, alertas, Vercel/Fly y backups con recursos de test.
- Trans05: fuentes explícitamente autorizadas, recuperación y memoria longitudinal aisladas; reusar DB, embeddings y modelos.
- Trans06: atención/metacognición reusan contratos; conservar autoridad del kernel y evidencia.

## Criterio de cierre

El inventario es un primer scaffold de preflight, no una implementación integral de proveedores. Incorporar las sondas a los registros canónicos después de comparar ramas, revisar endpoints/versiones y añadir pruebas de contratos de runtime, fallos, idempotencia y autorización. No presentar un stub como ejecución exitosa. No marcar una campaña lista por tener todas las variables presentes.
