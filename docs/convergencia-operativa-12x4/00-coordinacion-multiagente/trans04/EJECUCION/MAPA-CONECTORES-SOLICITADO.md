# Nombres de conectores — información del founder

Nombres proporcionados en la conversación, no inventario remoto verificado ni valores de secretos.

| Uso | Doppler | GitHub Actions | Estado del código |
|---|---|---|---|
| JEV / OpenRouter Decisions | OPENROUTER_API_KEY | OPENROUTER_API_KEY si se añadió la nueva | Adaptador y políticas server-side; nunca usa la cuenta Slow |
| Slow / DeepSeek V3.2 | OPEN_ROUTER_API_KEY | OPEN_ROUTER_API_KEY | Perfil separado; no alias de JEV |
| Fast / Meta Muse directo | MUSE_API_KEY | No indicado | Nombre reconocido; faltan contrato/endpoint/modelo/Contributor verificados |
| Servicio Supabase | SUPABASE_SECRET_KEY | SUPABASE_SECRET | Traducción explícita; no JWT signing key ni DSN |
| Grafana API | GRAFANA_URL + GRAFANA_SERVICE_ACCOUNT_TOKEN | Mismos nombres | Sonda autenticada; no mide entrega de métricas |
| Grafana Cloud | GRAFANA_CLOUD_TOKEN | Mismo nombre | Distinto del token API; no se deduce destino OTLP |
| Sentry ingestión | SENTRY_DSN | SENTRY_DSN | Formato/mapeo; SDK y recepción no acreditados |
| Sentry CI | SENTRY_AUTH_TOKEN | SENTRY_AUTH_TOKEN | No se importa como credencial de runtime |

MUSE_API_KEY prevalece sobre el nombre anterior que se entendió como OpenMuse; no se intercambian esos productos ni sus claves. Contributor permite entrenamiento según lo indicado por el founder, pero su selección exacta se deja pendiente de la documentación de Meta, sin inventar un flag.

Doppler config indicada: dev_campaign_transversal_leads_ia. No se cambia el DSN DATABASE_URL existente ni se toma SUPABASE_DATABASE_URL como sustituto automático. TOKEN_ENCRYPTION_KEY permanece intacta. Google, WhatsApp, Resend y Vapi no se marcan actualizados o conectados; se preservan aliases previos y límites de activación. No se han consultado valores en los almacenes ni probado APIs reales.
