# Trans00 — auditoría de readiness de proveedores y contrato de secretos

Fecha: 2026-11-27. Rama auditada: `infra/trans00-provider-readiness` @ `b7c9fb5a`.
Documento de trabajo local: **no commiteado, no pusheado, sin despliegue**.

Este informe complementa `docs/TRANS-PROVIDER-READINESS.md` con evidencia verificada,
una auditoría de la infraestructura de conexiones ya existente y una lista de
aprovisionamiento clasificada. No sustituye el contrato: lo corrige donde el contrato
exagera o se queda corto.

---

## 1. Método y alcance

| Acción | Comando / herramienta | Resultado |
| --- | --- | --- |
| Rama de trabajo | `git switch -c infra/trans00-provider-readiness origin/infra/...` | OK, sin tocar `main` |
| Suite sintética | `node --test tests/trans-provider-readiness.test.mjs` | **10/10 pass**, 0 fail |
| Readiness offline | `node scripts/trans-provider-readiness.mjs` | `offline-contract`, exit 0, sin red |
| Contrato completo | `import()` de `SPECS` | 42 specs, 71 nombres únicos, 5 grupos de alias |
| Consumidores | `rg` sobre `apps/ packages/ scripts/ tools/ tests/` | ver §7 y §8 |
| Doppler | conector `doppler_scobs-ankee` (solo lectura de metadatos) | ver §3 |

`pnpm` no está instalado en este entorno, así que se invocó el mismo binario que
ejecutan `pnpm infra:readiness` e `infra:readiness:test` (`node` directo). La suite no
necesita `node_modules`.

**No se ha leído ningún valor de secreto.** Todo el contraste se hizo con nombres,
estados y códigos de error. No se ha escrito en Doppler ni en la configuración padre.

---

## 2. Resultado de la suite (evidencia)

```
✔ all 42 identifiers are unique and all campaigns covered
✔ without credentials every provider remains an explicit stub
✔ aliases preserve separation of Slow and JEV
✔ database role guard rejects identical DSNs
✔ missing config and pending wiring never invoke transport
✔ configured probe uses correct credential but emits only status
✔ 403 and transport errors are sanitized
✔ Google refresh and twelve scopes, six API reads, no token in report
✔ wrong Google account stops before other Workspace APIs
✔ live probes need an explicit provider filter
tests 10 · pass 10 · fail 0
```

El scaffold cumple lo que promete: sin credenciales nada se marca como verde, no hay
transporte implícito y las sondas en vivo exigen `--only` explícito.

---

## 3. Alcance real del token de Doppler (condición 5)

El conector opera con el service token **`codex-cloud-dev`**
(`principal.type = service_token`, workplace `AGNTIA PRO`), creado 2026-11-27.
**Ese token no está en el entorno del sandbox** (`DOPPLER_TOKEN` no existe para el
shell): vive en el servidor de integraciones. Por eso `doppler run` no puede ejecutarse
aquí aunque yo pueda listar metadatos.

Comprobaciones directas:

| Config | Respuesta del conector |
| --- | --- |
| `dev_campaign_transversal_leads_ia` | OK (`root:false`, `inherits:[]`, environment `dev`) |
| `dev` | `This token does not have access to requested config 'dev'` |
| `dev_personal` | `This token does not have access to requested config 'dev_personal'` |
| `stg` | `This token does not have access to requested config 'stg'` |
| `prd` | `This token does not have access to requested config 'prd'` |
| `DOPPLER_ENVIRONMENTS_LIST` | `environments: []` |
| `DOPPLER_CONFIGS_LIST?environment=dev` | `Environment does not exist` |

**Conclusión:** las configs `dev`, `dev_personal`, `stg` y `prd` que confirmaste por CLI
existen; lo que no existe es el permiso del token sobre ellas. Los mensajes
"does not have access" son denegaciones de autorización, no ausencias. La lista vacía de
environments es coherencia del token: un service token de una sola config no enumera
el entorno. No debe concluirse nunca que faltan configs a partir de esta vista.

Efecto práctico: cualquier informe generado por esta integración solo puede hablar de
`dev_campaign_transversal_leads_ia`. Auditar `prd` desde aquí es imposible por diseño.

---

## 4. Branch config solicitada (condición 1): no es expresable como se pidió

Dos hechos independientes, ambos verificados:

1. **El token no puede crear configs.** `DOPPLER_CONFIGS_CREATE` respondió
   `Invalid environment id`: la herramienta exige el *id* del entorno y este token no
   puede enumerarlo. Además la documentación de Doppler define los service tokens como
   **read-only sobre una única config**; crear configs requiere token personal/CLI con
   escritura o la acción en el dashboard.
2. **Aunque hubiera escritura, la herencia pedida no existe.** En Doppler toda branch
   config hereda del **root config de su environment** (`dev`), nunca de otra branch
   config hermana. `dev_campaign_transversal_leads_ia` es precisamente una branch config
   de `dev` (`root:false`), así que no puede ser padre de nada.

Lo más cercano a "ramificar todo desde la config de campaña" es **duplicarla**: crea una
branch config hermana que hereda de `dev` y conserva las modificaciones que la config
origen tenía superpuestas.

```
# opción CLI, con un token con permiso de escritura (no este)
doppler configs clone --project agntiapro \
  --config dev_campaign_transversal_leads_ia \
  --name dev_trans00_provider_readiness

# o dashboard: 3-dot sobre la config -> Duplicate -> dev_trans00_provider_readiness
```

Advertencias antes de ejecutarlo (decisión tuya, no la tomé):
- La copia arrastra **credenciales vivas** de la campaña a una config nueva; hay que
  restringir quién la ve.
- `prd` no se toca en ningún caso.
- El nombre debe empezar por `dev_` (prefijo del environment).
- Para que CI use esa config hace falta un service token nuevo **scopeado a ella**;
  guárdalo en Settings → Project settings → Secrets como `DOPPLER_TOKEN`, no en el chat.

---

## 5. Capacidades del conector de Doppler (condición 7)

| Necesidad | ¿Soportado por el conector? | Detalle |
| --- | --- | --- |
| Listar proyectos / configs / nombres | Sí | `PROJECTS_LIST`, `CONFIGS_LIST`, `SECRETS_NAMES` |
| Leer valores | Sí, pero **no usado** | `SECRETS_LIST/GET/DOWNLOAD` devuelven material; el informe no los usa |
| Crear config / branch config | Herramienta existe, **permiso no** | falla por environment id inaccesible + token read-only |
| Escribir secretos | Herramienta existe (`SECRETS_UPDATE`), **no ejecutada** | habría que aportar valores; prohibido inventarlos |
| Duplicar config con overrides | **No** | solo dashboard o `doppler configs clone` |
| Referencias entre secretos | **No hay operación con semántica de referencia** | Doppler sí resuelve `${SECRET}`, `${config.SECRET}`, `${project.config.SECRET}`, pero el conector solo escribe cadenas literales: una referencia se podría escribir como texto, sin validación ni comprobación de ciclos |
| Comprobar proveedores sin revelar valores | **No** | no hay herramienta de *provider check*; la única verificación real es la sonda del scaffold (§9) o `secrets:check` |
| Historial de cambios de config | Sí | `CONFIG_LOGS_LIST` (auditoría de quién cambió qué, sin valores) |
| Visibilidad de secretos | Solo lectura de metadatos | `restricted` es invisible en dashboard pero legible por service tokens; no se inspeccionó ninguna |

Sobre referencias: son útiles aquí para no duplicar `DATABASE_URL`/`BUSINESS_DATABASE_URL`
o el remitente, pero introducirlas exige escritura y revisión humana. No las apliqué.

---

## 6. Auditoría de la infraestructura de conexiones existente (condición 2)

Hay **dos registros paralelos** que se solapan y divergen:

| | `scripts/lib/connections.ts` (`CONNECTIONS_REGISTRY_V1`) | `scripts/trans-provider-readiness.mjs` (`SPECS`) |
| --- | --- | --- |
| Entradas | 39 al auditar (46 tras el cierre de §6) | 42 |
| Enfoque | Capacidad de producto + sonda real | Campaña Trans00–06 + contrato de preflight |
| Sondas | 18, con lógica de dominio (dominios Resend verificados, 12 scopes Google, quality rating de WhatsApp) | 14, solo estado HTTP + clasificación |
| Nombres que solo conoce este registro | `ALLOWED_ORIGINS`, `AUTH_PROVIDER`, `MODEL`, `FAST_LLM_API_KEY`, `SLOW_LLM_API_KEY`, `OPENAI_API_KEY`, `STRIPE_API_KEY`, `STRIPE_WEBHOOK_SECRET`, `SUPABASE_JWT_SECRET`, `CLOUDFLARE_API_TOKEN`, `GITHUB_CLIENT_ID` | `DATABASE_MIGRATION_URL`, `BUSINESS_DATABASE_URL`, `TEST_*`, `GOOGLE_TEST_*`, `JEV_API_KEY`, `ANAM_*`, `GRAFANA_CLOUD_TOKEN`, `OTEL_*`, `METRICS_TOKEN`, `VERCEL_ORG_ID/PROJECT_ID`, `WHATSAPP_WEBHOOK_BINDINGS`, `knowledge-sources`, `attention`, `convergence` |

**Ninguno es superset del otro.** El scaffold no cubre secretos que el runtime sí lee
(`FAST_LLM_API_KEY`, `SLOW_LLM_API_KEY`, `MODEL`, `AUTH_PROVIDER`, `ALLOWED_ORIGINS`,
`STRIPE_*`, `SUPABASE_JWT_SECRET`); el registro de producto no cubre migraciones,
fixtures ni campañas.

Defectos concretos detectados al contrastar ambos con el código:

1. **Sondas duplicadas con criterios distintos.** Grafana: `connections.ts` llamaba a
   `/api/health` **sin autenticación** (un Grafana público respondería 200 y la sonda
   diría OK); el scaffold usa `/api/org` con `GRAFANA_SERVICE_ACCOUNT_TOKEN`, que sí
   prueba autorización. Gana el scaffold, y así quedó en el registro: `/api/org`
   autenticado, y sin token la sonda dice que no prueba nada en lugar de dar verde.
2. **Sentry no tiene consumidor de runtime.** `apps/server/src` no menciona `SENTRY` y no
   hay dependencia `@sentry/*`: `SENTRY_DSN` es un nombre en el registro y en docs. La
   sonda `sentryShape` solo valida la forma de una URL, no la recepción, y su detalle ya
   lo dice explícitamente para que nadie lo lea como observabilidad activa.
3. **El scaffold es más estricto que el runtime en cuatro nombres.** `FAST_LLM_MODEL`,
   `SLOW_LLM_MODEL`, `EMBEDDINGS_LLM_MODEL` y `EMBEDDINGS_LLM_PROVIDER` tienen default en
   `apps/server/src/kernel/config/env-resolver.ts` (`gemini-3.6-flash`,
   `text-embedding-004`, `google`). Marcarlos como `stub_missing_config` es correcto como
   contrato explícito, pero **no son secretos ausentes**.
4. **`EMAIL_FROM` es un parámetro, no una credencial**, y ya tiene cadena de alias en
   `apps/server/src/config.ts` (`EMAIL_FROM` ← `RESEND_FROM` ← `RESEND_FROM_EMAIL`).
5. **`METRICS_TOKEN` no está en el contrato del registro** aunque `metrics-exporter.ts` lo
   lee y sin él cae a "solo admin". Es generable, no aprovisionable.
6. **`WORKER_TOKEN` (≥32 chars) tampoco aparece en el scaffold** y lo leen el worker y sus
   rutas. Igual: generable.

Cierre ejecutado en el repo (rama local, sin commit ni push): `connections.ts` es ahora
la fuente única de nombres y sondas, y `trans-provider-readiness.mjs` importa de ahí
(`CONNECTION_NAMES`) añadiendo solo la capa de campaña. Lo que se cambió:

- `pg` pasa a import dinámico dentro de la sonda de base de datos. Era el motivo real
  por el que el registro no se podía importar sin `node_modules` y por el que existían
  dos tablas.
- `ConnectionSpec.companions`: nombres secundarios que la sonda lee y que no son alias
  (`GRAFANA_SERVICE_ACCOUNT_TOKEN`, `WHATSAPP_GRAPH_VERSION`, `FLY_APP_NAME`,
  `GOOGLE_CLIENT_SECRET`, `SUPABASE_SECRET_KEY`, `OPENAI_BASE_URL`).
- El registro gana las conexiones que solo conocía el scaffold o el runtime:
  `DATABASE_MIGRATION_URL`, `OPEN_ROUTER_API_KEY` (spec propio, sin alias a la JEV),
  `METRICS_TOKEN`, `WORKER_TOKEN`, `WHATSAPP_WEBHOOK_BINDINGS`, `VAPI_PHONE_NUMBER_ID`,
  `VAPI_WEBHOOK_SECRET`.
- `CAMPAIGN_ONLY` en el contrato de campaña declara lo que no es conexión de producto
  (fixtures y extras de certificación). `unregisteredNames()` devuelve vacío y una prueba
  lo fija: un nombre nuevo de campaña o está en el registro o falla el contrato.

---

## 7. De 80 "ausentes" a 28: la corrección del recuento (condición 3)

El número inicial salió de comparar nombres en bruto. Con las **5 reglas de alias** que
el propio repo normaliza (`config.ts` y `secrets-check.ts`), muchos "faltantes" ya están
cubiertos por un nombre existente en Doppler:

| Alias que el código resuelve | Presente en Doppler | Por tanto |
| --- | --- | --- |
| `WHATSAPP_TOKEN` ← `WHATSAPP_ACCESS_TOKEN` | `WHATSAPP_ACCESS_TOKEN` | cubierto |
| `WHATSAPP_PHONE_ID` ← `WHATSAPP_PHONE_NUMBER_ID` | `WHATSAPP_PHONE_NUMBER_ID` | cubierto |
| `WHATSAPP_BUSINESS_ACCOUNT_ID` ← `WHATSAPP_WABA_ID` | `WHATSAPP_BUSINESS_ACCOUNT_ID` | cubierto |
| `GEMINI_API_KEY` ↔ `GOOGLE_API_KEY` | `GEMINI_API_KEY` | cubierto |
| `SUPABASE_SECRET_KEY` ← `SUPABASE_SECRET` | `SUPABASE_SECRET_KEY` | cubierto |
| `EMAIL_FROM` ← `RESEND_FROM` ← `RESEND_FROM_EMAIL` | ninguno | **sin cubrir** (1 parámetro) |

Ejecutando el `inspect()` del scaffold con los 66 nombres de Doppler como entorno, el
resultado es **28 nombres en 19 specs**, no 80. Esos 28 son los que hay que clasificar,
y así quedan:

| # | Clasificación | Nombres |
| --- | --- | --- |
| 1 | **Credencial real necesaria** | `BUSINESS_DATABASE_URL`, `WHATSAPP_APP_SECRET`, `OPEN_ROUTER_API_KEY` (2ª cuenta), `VAPI_WEBHOOK_SECRET` (si voz entrante), `DATABASE_MIGRATION_URL` (si se adopta rol migrador) |
| 2 | **Alias de credencial existente** | ninguno pendiente; los 5 pares ya resuelven (§7.1) |
| 3 | **Parámetro no secreto** | `FAST_LLM_MODEL`, `SLOW_LLM_MODEL`, `EMBEDDINGS_LLM_MODEL`, `EMBEDDINGS_LLM_PROVIDER`, `EMAIL_FROM`, `VAPI_ASSISTANT_ID`, `VAPI_PHONE_NUMBER_ID`, `GOOGLE_CLOUD_PROJECT`, `GOOGLE_CLOUD_LOCATION`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `OTEL_EXPORTER_OTLP_ENDPOINT`, `WHATSAPP_WEBHOOK_BINDINGS` |
| 4 | **Generable por el sistema** | `METRICS_TOKEN` (`openssl rand -hex 32`), `WHATSAPP_VERIFY_TOKEN` (cadena que tú eliges y pegas en Meta), `OTEL_EXPORTER_OTLP_HEADERS` (lo emite el backend de trazas) |
| 5 | **Servicio opcional / sin cablear** | `OTEL_EXPORTER_OTLP_ENDPOINT`/`HEADERS`, `GOOGLE_CLOUD_PROJECT`/`LOCATION` (Vertex RAG no implementado), `VAPI_WEBHOOK_SECRET` |
| 6 | **Legacy / ya en Doppler y sin consumidor** | `ANAM_API_KEY`, `ANAM_AVATAR_ID_2`, `GRAFANA_CLOUD_TOKEN`, `JEV_API_KEY`, `MUSE_API_KEY`, `GROQ_API_KEY`, `OPENMUSE_ACCESS_KEY`, tokens `*_PAGE_ID/_PAGE_TOKEN` (ALUNA, CIRCLE, DEPRADO, ESPIRAL, FUN, LONDON, NOMAD, SOLUNA), `SUPABASE_DATABASE_URL` (duplica `DATABASE_URL`) |
| 7 | **Fixture de pruebas** | `TEST_TENANT_ID`, `TEST_OWNER_ID`, `GOOGLE_TEST_ACCOUNT_EMAIL`, `GOOGLE_TEST_DOCUMENT_ID`, `GOOGLE_TEST_SPREADSHEET_ID`, `GOOGLE_TEST_PRESENTATION_ID` |

Notas de clasificación que evitan trabajo inútil:
- `EMBEDDINGS_LLM_API_KEY` (también ausente) es **opcional con fallback**: el resolver usa
  `FAST` y luego `SLOW` si falta. Solo se aporta si quieres cuota separada de embeddings.
- `SUPABASE_JWT_SECRET` solo aplica si el proyecto firma HS256; con JWKS no se necesita.
- Los `*_PAGE_*` no aparecen en el contrato ni en el código de Trans00–06: no se tocan.

---

## 8. Contraste con consumidores reales de Trans00–Trans06 (condición 4)

Verificado con `rg` sobre `apps/ packages/ scripts/ tools/ tests/` (excluyendo docs):

| Nombre | Consumidor real | Veredicto |
| --- | --- | --- |
| `FAST_LLM_API_KEY` | `apps/server/src/kernel/config/env-resolver.ts` | necesario (kernel rápido) |
| `SLOW_LLM_API_KEY` | idem | necesario (kernel lento) |
| `EMBEDDINGS_LLM_API_KEY` | idem + `engine/embeddings.ts` | opcional con fallback |
| `FAST_LLM_MODEL` | `engine/cognition/v2/inference.ts` | parámetro con default |
| `METRICS_TOKEN` | `apps/server/src/metrics-exporter.ts` | generable |
| `WHATSAPP_PHONE_ID`/`PHONE_NUMBER_ID` | `voice`/`whatsapp-routes`, `scripts/connections.ts` | alias, cubierto |
| `VAPI_PHONE_NUMBER_ID` | `apps/server/src/voice-routes.ts` | parámetro (id de recurso) |
| `BUSINESS_DATABASE_URL` | `scripts/lib/connections.ts`, `secrets-check.ts` | necesario, rol read-only |
| `OPEN_ROUTER_API_KEY` | **solo** `scripts/trans-provider-readiness.mjs` | credencial pedida por el contrato, **aún sin cablear al runtime** |
| `JEV_API_KEY` | ninguno | opcional (solo si el puerto JEV real la usa) |
| `ANAM_API_KEY`, `ANAM_AVATAR_ID_2` | ninguno | opcional, ya en Doppler |
| `GRAFANA_CLOUD_TOKEN` | ninguno | legacy en este repo |
| `GRAFANA_SERVICE_ACCOUNT_TOKEN` | solo sonda del scaffold | necesario solo para la sonda autenticada |
| `SENTRY_AUTH_TOKEN`/`ORG`/`PROJECT` | solo sonda | opcional (release check) |
| `OTEL_EXPORTER_OTLP_*` | ninguno | opcional, sin cablear |
| `DATABASE_MIGRATION_URL` | solo test del scaffold | propuesta, sin runner |
| `TEST_TENANT_ID`/`TEST_OWNER_ID` | solo test del scaffold | fixture |
| `GOOGLE_TEST_*` | solo test del scaffold | fixture |
| `VERCEL_ORG_ID`/`PROJECT_ID` | ninguno en runtime | parámetro de despliegue |
| `GOOGLE_CLOUD_PROJECT`/`LOCATION` | ninguno | opcional (Vertex RAG no implementado) |

### Las dos cuentas de OpenRouter: no se unifican (y una no está cableada)

| Nombre | Cuenta | Campaña | Estado |
| --- | --- | --- | --- |
| `OPENROUTER_API_KEY` | JEV | Trans02/05/06 | **presente en Doppler**, consumida por `connections.ts` y probes |
| `OPEN_ROUTER_API_KEY` | Slow DeepSeek | Trans02/05/06 | **ausente en Doppler**, sin consumidor en runtime |

El scaffold impone `SLOW_JEV_KEYS_IDENTICAL` como `invalid_config`: si las dos cuentas
coinciden, se invalida. Es deliberado y correcto —dos cuotas, dos límites, dos
responsables de gasto— y **no debe fusionarse** aunque el nombre parezca un typo. El
hueco real es otro: el kernel no lee `OPEN_ROUTER_API_KEY`, lee `SLOW_LLM_API_KEY`. Hoy
"slow lane por cuenta OpenRouter propia" es una intención del contrato, no wiring.

---

## 9. Qué credenciales necesitas aportar de verdad (condición 8)

Solo las que un consumidor real lee y **no** tienen valor en Doppler. No se incluyen
parámetros con default, fixtures, ni servicios sin cablear.

### Trans03 — canales (WhatsApp / voz / email)

| Variable | Qué es | Dónde se obtiene | Permisos / forma | Consumidor |
| --- | --- | --- | --- | --- |
| `WHATSAPP_APP_SECRET` | Secreto de app de Meta para validar `X-Hub-Signature-256` | Meta for Developers → tu app → Configuración → Básica → *App Secret* | Solo lectura de ese valor; cadena hex de 32. Sin él cualquiera puede inyectar mensajes | `tests/whatsapp-webhook.test.ts`, `connections.ts`, `secrets-check` |
| `WHATSAPP_VERIFY_TOKEN` | Cadena arbitraria del handshake | La eliges tú (generable) y la pegas en Meta → Webhooks | ≥16 chars aleatorios; debe coincidir exactamente con Meta | `whatsapp-routes`, `engine/whatsapp-inbound` |
| `WHATSAPP_WEBHOOK_BINDINGS` | JSON de canal/tenant/responsable/SOP | Configuración interna, no proveedor | JSON válido; no es secreto | `secrets-check`, tests de inbound |
| `VAPI_ASSISTANT_ID` | Id del asistente que contesta | dashboard.vapi.ai → Assistants | Id de recurso, no secreto | `connections.ts`, `secrets-check` |
| `VAPI_PHONE_NUMBER_ID` | Id del número emisor | dashboard.vapi.ai → Phone Numbers | Id de recurso | `apps/server/src/voice-routes.ts` |
| `VAPI_WEBHOOK_SECRET` | Secreto del webhook de voz | Lo defines en Vapi y aquí | Solo si activas voz entrante | `secrets-check` |
| `EMAIL_FROM` | Remitente por defecto | Debe pertenecer a un dominio verificado en Resend | Dirección, no secreto. Resend exige key **y** remitente | `config.ts`, adaptador email |

### Trans01 — datos

| Variable | Qué es | Dónde se obtiene | Permisos | Consumidor |
| --- | --- | --- | --- | --- |
| `BUSINESS_DATABASE_URL` | DSN de la base de negocio con rol **read-only** | Crear rol como documenta `.env.example` (`CREATE ROLE agente_ro ... GRANT SELECT`) | `CONNECT`, `USAGE`, `SELECT`; nunca el rol de escritura. Igual a `DATABASE_URL` ⇒ `invalid_config` | `connections.ts` (`business-db`), `secrets-check` |
| `DATABASE_MIGRATION_URL` | DSN con rol migrador | Mismo Postgres, rol distinto | `DDL` (CREATE/ALTER); distinto del runtime. Hoy **ningún runner lo lee**: es propuesta | solo scaffold/test |

### Trans02/05/06 — modelos

| Variable | Qué es | Dónde se obtiene | Permisos | Consumidor |
| --- | --- | --- | --- | --- |
| `OPEN_ROUTER_API_KEY` | 2ª cuenta OpenRouter para slow lane | openrouter.ai → Keys, en la cuenta *distinta* de JEV | Clave de inferencia; límite propio. **No unificar** con `OPENROUTER_API_KEY` | solo scaffold (wiring pendiente) |
| `FAST_LLM_API_KEY` | Cuota del kernel rápido | Proveedor elegido (Google AI Studio / OpenRouter / OpenAI) | Inferencia. Sin él, kernel cae a cadena global | `env-resolver.ts` |
| `SLOW_LLM_API_KEY` | Cuota del kernel lento | idem, cuenta separada si quieres aislar gasto | Inferencia | `env-resolver.ts` |
| `EMBEDDINGS_LLM_API_KEY` | Opcional, cuota de embeddings | idem | Embeddings. Fallback a fast→slow | `env-resolver.ts`, `engine/embeddings.ts` |

### Fuera de Trans00–06 pero el código ya lo lee (no lo pidas por campaña)

`STRIPE_API_KEY` / `STRIPE_WEBHOOK_SECRET` (billing), `SUPABASE_JWT_SECRET` (solo HS256),
`OPENAI_API_KEY` / `ANTHROPIC_API_KEY` (proveedores alternativos),
`GMB_API_KEY` / `GMB_CLIENT_ID` (Google Business), `WORKER_TOKEN` y `METRICS_TOKEN`
(generables, no aprovisionables).

### Ya verificado externamente — no regenerar (condición 6)

`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN` (12 scopes, Gmail,
Drive, Calendar, Meet, People, Tasks con lecturas OK), `GOOGLE_MAPS_API_KEY` (Places
`searchText` 200) y `GEMINI_API_KEY` (catálogo 200) están en Doppler y confirmados por ti.
El scaffold solo los **verifica**; no se ha regenerado ni canjeado nada en esta sesión.

---

## 10. Lo que no se ha hecho

- No se creó la branch config (bloqueada por permisos y por semántica de herencia, §4).
- No se escribió ni actualizó ningún secreto. No se inventaron valores.
- No se leyó ningún valor de secreto ni se volcó a este documento.
- No se modificó la config padre ni `prd`/`stg`/`dev`.
- No se hizo merge, push ni despliegue. El archivo está sin commitear en la rama local.

## 11. Siguientes pasos recomendados

1. Crear `dev_trans00_provider_readiness` por **duplicación** (§4) con un token con
   escritura, y emitir un service token scopeado a ella para CI.
2. Aportar las 5 credenciales de §9 en esa config (no en la de campaña): `WHATSAPP_APP_SECRET`,
   `BUSINESS_DATABASE_URL`, `OPEN_ROUTER_API_KEY`, y decidir `VAPI_WEBHOOK_SECRET` /
   `DATABASE_MIGRATION_URL`.
3. Generar `METRICS_TOKEN`, `WHATSAPP_VERIFY_TOKEN` y `WORKER_TOKEN` en el destino, no en
   el chat.
4. ~~Cablear `OPEN_ROUTER_API_KEY` al slow lane~~ **hecho**: `env-resolver.ts` la lee como
   key del slow lane solo con `SLOW_LLM_PROVIDER=openrouter`, `SLOW_LLM_API_KEY` sigue
   mandando y nunca se cae a `OPENROUTER_API_KEY` (cuenta JEV). `secrets:check` avisa si
   el provider es openrouter y no hay ninguna de las dos keys.
5. ~~Unificar los dos registros de conexiones y alinear Grafana/Sentry~~ **hecho** (§6).
6. Reejecutar `infra:readiness --probe --only=...` desde CI con el token de la config
   nueva; aquí no es posible (sin `DOPPLER_TOKEN` en el entorno, sin salida a proveedores).
