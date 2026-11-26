# Secretos: GitHub Secrets como camino único, Doppler opcional

Estado: **dictamen documental**. Base `46181c79`, rama `Trans01`. Sin cambios de
código, workflows, secretos ni despliegues. Verificado contra el código de esta
rama el 26 de noviembre de 2026.

## 1. Dictamen en una línea

De acuerdo con el **fondo** —GitHub Secrets como camino independiente de Doppler,
Doppler opcional, preflight que no revela valores, separación pruebas/producción y
adaptadores fail-closed— y **en desacuerdo con dos cosas concretas**: cinco de los
veinte nombres no existen en el código, y la premisa de que esto desbloquea las
seis campañas es falsa. Las campañas Trans01–Trans06 no consumen ningún proveedor:
su gate es typecheck + tests + audits con la red bloqueada y Postgres local
efímero. Lo que las bloquea son ABI compartidas (C01, E03, A03, H01, B2.1/2.5/2.7),
no credenciales.

## 2. Los veinte nombres, uno por uno

Evidencia: `scripts/secrets-check.ts` (contrato), `.env.example`,
`.github/workflows/deploy.yml`, `scripts/lib/connections.ts` y lectores reales en
`apps/`, `packages/`.

| Nombre propuesto | ¿Existe? | Dónde se lee | Veredicto |
|---|---|---|---|
| `DATABASE_URL` | Sí | `scripts/secrets-check.ts:26`, `apps/server/src/config.ts` | Correcto. `need: live` |
| `FLY_API_TOKEN` | Sí | `.github/workflows/deploy.yml` (job `fly`) | Correcto. Es secreto de despliegue, no de runtime |
| `VERCEL_TOKEN` | Sí | `deploy.yml` (job `vercel`) | Correcto, pero incompleto: el mismo job exige `VERCEL_ORG_ID` y `VERCEL_PROJECT_ID` |
| `TOKEN_ENCRYPTION_KEY` | Sí | `secrets-check.ts:28` (32 bytes base64) | Correcto. **Falta su pareja obligatoria**: `AGENTE_ACCESS_KEY` (`:29`, ≥24 chars); en `live` el arranque falla sin ella |
| `FAST_LLM_API_KEY` | Sí | `secrets-check.ts:59`, `env-resolver` | Correcto, `optional` |
| `SLOW_LLM_API_KEY` | Sí | `secrets-check.ts:60` | Correcto, `optional` |
| `EMBEDDINGS_LLM_API_KEY` | Sí | `secrets-check.ts:61` | Correcto, `optional` |
| `JEV_API_KEY` | **No** | 0 lectores | **Descartar.** JEV es un modelo/ontología (`jev-1.14.0`, `agntiapro.cards@1.0.0`); no hay API key de JEV. La credencial es un *grant* por operación emitido por el gate de egreso y persistido en DB (`engine/cognition/v2/jev-egress.ts`) |
| `ANAM_API_KEY` | **No** | 0 lectores | **Descartar.** No hay proveedor de avatar integrado |
| `ELEVENLABS_API_KEY` | Solo sonda | `scripts/lib/connections.ts:218-220` (opcional) | **No para runtime.** Ningún adaptador la lee; la voz de hoy es Vapi (`VAPI_API_KEY`, `VAPI_ASSISTANT_ID`) |
| `GOOGLE_CLIENT_ID` | Sí | `secrets-check.ts:66` | Correcto, `optional` |
| `GOOGLE_CLIENT_SECRET` | Sí | `secrets-check.ts:67` | Correcto, `optional` |
| `GOOGLE_MAPS_API_KEY` | Sí | `apps/server/src/leads-routes.ts:53`, `packages/integrations/src/google-maps.ts:72` | Correcto, `optional` |
| `OTEL_EXPORTER_OTLP_HEADERS` | **No** | 0 lectores | **Descartar por ahora.** `engine/events/exporters/otel.ts` es un stub (`export interface OtelExporter {}`) |
| `METRICS_TOKEN` | Sí | `apps/server/src/metrics-exporter.ts:19` | Correcto, `optional`; protege `/metrics` |
| `WHATSAPP_TOKEN` | Sí | `secrets-check.ts:70` | Correcto, `optional` |
| `WHATSAPP_APP_SECRET` | Sí | `:72` (firma `X-Hub-Signature-256`) | Correcto, `optional` |
| `WHATSAPP_VERIFY_TOKEN` | Sí | `:71` (handshake) | Correcto, `optional` |
| `RESEND_API_KEY` | Sí | `config.ts:208`, `packages/integrations/src/resend.ts:82`, `auth-signup.ts:91-96` | Correcto, pero incompleto: sin `EMAIL_FROM` el envío igualmente responde 503 |
| `COMPOSIO_API_KEY` | **No** | 0 lectores (solo docs de `apps/ui-lab`) | **Descartar.** Composio es arquitectura objetivo, no adaptador |

Resumen: 15 nombres válidos, 5 inexistentes (`JEV`, `ANAM`, `ELEVENLABS` en
runtime, `OTEL_*`, `COMPOSIO`), y 6 nombres obligatorios que no están en la lista.

### Nombres que faltan y sí bloquean `live`

`AGENTE_ACCESS_KEY`, `PUBLIC_API_URL`, `ALLOWED_ORIGINS`, `AUTH_PROVIDER`,
`SUPABASE_URL`, `MODEL` y `ADMIN_EMAIL`/`ADMIN_PASSWORD` son `need: live` en el
contrato. `WHATSAPP_PHONE_ID` y `WHATSAPP_WEBHOOK_BINDINGS` son necesarios para
admitir mensajes entrantes (sin bindings el webhook no enruta a ningún tenant).
`SMOKE_EMAIL`/`SMOKE_PASSWORD` los usa el job `smoke` de `deploy.yml`.

### Lo que no es secreto y no debe gastar cupo de Secrets

`MODEL`, `MODEL_FALLBACK`, `FAST_LLM_PROVIDER/MODEL`, `SLOW_LLM_PROVIDER/MODEL`,
`EMBEDDINGS_LLM_PROVIDER/MODEL`, `PUBLIC_API_URL`, `ALLOWED_ORIGINS`,
`PUBLIC_SITE_URL`, `VITE_API_URL`, `AUTH_PROVIDER`, `WHATSAPP_GRAPH_VERSION`,
`WHATSAPP_PHONE_ID`, `DATA_DIR`, `BACKUP_*`, ids de asistente/voz/número y
`FLY_APP_*`/`DOPPLER_CONFIG` van en GitHub **Variables**, como ya hace `deploy.yml`
con `vars.FLY_APP_API`.

## 3. Por qué esto no desbloquea las seis campañas

- `package.json` `test` ejecuta `tsx --import ./tests/setup.ts --test`. Ese setup
  bloquea Gemini, OpenRouter, OAuth/Google, Stripe y Graph API salvo que
  `ALLOW_NETWORK=1`, y la CI fija `ALLOW_NETWORK=0`.
- El gate de M1.2 (101 focales + 2 de concurrencia + 91 de regresión) se ejecutó
  sin proveedores reales. La concurrencia usó `TEST_DATABASE_URL` apuntando a un
  Postgres efímero del sandbox con contraseña trivial: **eso no es un secreto y no
  debe subirse a GitHub**.
- `typecheck`, `test` y los 8 audits no leen ninguna credencial.
- Por tanto, seis workflows de campaña no necesitan ninguno de los veinte nombres.
  Un job de campaña que herede Secrets solo añade superficie de fuga.

Conclusión: GitHub Secrets desbloquea **despliegue** (`deploy.yml`,
`configure-prod-db.yml`) y la futura **campaña vertical en `live`**, no Trans01–06.

## 4. Patchset propuesto para Trans04 (no ejecutado aquí)

Nombre: **T04-S · gestión de secretos independiente de Doppler**. Cinco partes,
en este orden; ninguna toca el kernel.

**S0 · Fuente única de verdad.** `scripts/secrets-check.ts` pasa a ser el contrato
del que se deriva la lista de despliegue: se le añade `--json` que emite
`{name, need, group, targets:[api|worker|deploy]}` **sin valores**. Un manifiesto
versionado (`infra/secrets.manifest.json`) se genera desde ahí y es lo único que
leen los workflows. Hoy la lista vive dos veces (el script y el `filter` de
`deploy.yml`), y eso ya divergió una vez: los alias de WhatsApp.
Restricción real de Actions: **`secrets.*` no se puede enumerar en bucle**. Un
workflow solo ve los secretos que nombra en su `env:`; por eso hace falta el
manifiesto explícito y no un `for` sobre el contexto.

**S1 · Camino GitHub nativo (por defecto).** `deploy.yml` gana `secrets_source`
en `workflow_dispatch` con valores `github` (defecto) y `doppler`. El camino
`github`: paso `preflight` que comprueba presencia de cada nombre `need: live|always`
del manifiesto e imprime **solo nombres y recuento**, y luego
`flyctl secrets import -a <app> --stage` con los valores en `env:` (nunca en la
línea de comandos, que queda en el log). Se conserva la denylist por prefijo
(`CLOUDFLARE_|FLY_|DOPPLER_|VERCEL_|NEON_|GH_|AWS_|AZURE_|GCP_|SUPABASE_ACCESS_`)
que ya existe: es la que impide que un token de zona DNS acabe en el runtime.

**S2 · Doppler opcional, no eliminado.** El camino `doppler` es el código actual,
sin cambios de comportamiento, y `configure-prod-db.yml` ya salta Doppler cuando
no hay `DOPPLER_TOKEN` (línea 62-79). Requisito: los dos caminos convergen en el
mismo manifiesto, el mismo preflight y la misma denylist. Si divergen, el
siguiente incidente será "en GitHub faltaba una que en Doppler sobraba".

**S3 · Separación pruebas/producción y fail-closed.** Secretos a nivel de
**GitHub Environment** (`preview`/`production`), no de repositorio: `deploy.yml` ya
declara `environment:`, así que basta con moverlos. Las campañas no reciben nada.
Los adaptadores ya fallan cerrados (Resend y Maps responden 503 con mensaje
explícito; `config.ts` lanza en `live` si falta lo obligatorio): el patchset
**reutiliza** ese mecanismo y añade `pnpm secrets:check --mode=live` como paso del
preflight de despliegue, en lugar de crear un segundo sistema de validación.

**S4 · Evidencia y pruebas negativas.** El preflight debe demostrar: (a) con todos
los nombres presentes, exit 0 e informe de nombres; (b) quitando uno `need: live`,
exit 1 y el nombre ausente en el mensaje; (c) ningún valor en el log (grep del log
del job por los valores de prueba); (d) un job de campaña sin secretos sigue en
verde. Nada de esto se ejecuta en esta rama.

### Fuera de alcance del patchset

- Rotación de `TOKEN_ENCRYPTION_KEY`: si cambia, los tokens OAuth guardados dejan
  de descifrarse. Merece su propio procedimiento, no un paso de CI.
- `ADMIN_PASSWORD`: la elige el operador; no entra en el manifiesto de CI.
- Cualquier despliegue real: sigue prohibido por el turno vigente.

### Paths que Trans04 debe reservar

`.github/workflows/deploy.yml`, `.github/workflows/configure-prod-db.yml`,
`.github/workflows/ci.yml`, `scripts/secrets-check.ts`,
`scripts/lib/connections.ts`, `infra/secrets.manifest.json` (nuevo),
`docs/operacion/SECRETOS.md`, `doppler.yaml`, `package.json` (script `--json`).

## 5. Riesgos si se hace mal

1. **Doble fuente.** Mantener la lista en el manifiesto y en el `filter` del shell
   reproduce el fallo de los alias.
2. **Secretos en el log.** `flyctl secrets import` con valores interpolados en el
   `run:` deja el valor en el log del job (Actions enmascara los `secrets.*`, no
   los derivados). Los valores van por `env:` y por stdin.
3. **Cupo.** GitHub limita a 100 secretos por repositorio y 100 por entorno; los
   seis nombres inexistentes de la lista gastan cupo y confunden el preflight.
4. **Creer que desbloquea campañas.** No lo hace; el bloqueo es de contratos.
5. **Retirar Doppler antes de tiempo.** `deploy.yml` depende hoy de
   `DOPPLER_TOKEN`; sin poblado el camino `github`, un tag `v*` deja el despliegue
   en rojo.

## 6. Qué haría falta para dar esto por cerrado

1. Supervisor aprueba T04-S y reserva los paths de §4 para Trans04.
2. Trans04 implementa S0–S4 con las pruebas negativas de S4 y las pega en su
   bitácora con SHA y exit por comando.
3. Solo entonces se decide si `DOPPLER_TOKEN` se conserva como opción o se retira.
4. Las seis campañas siguen sin consumir secretos; su desbloqueo es B2.1/B2.5/B2.7
   y los contratos C01/E03/A03/H01.
