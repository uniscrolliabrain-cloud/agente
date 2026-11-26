# T04-S · Secretos github-first para las seis campañas

Estado: **propuesta documental, sin código ejecutado**. No es autorización de implementación ni
certificación de T04-S. Requiere reserva de paths y aprobación del supervisor. No modifica
código, workflows, ramas de otras personas, ni produce efectos externos.

Base: `Trans01` en `84499ce7c5ee7f7f572110fa7b7ec3d7144a66bd` (árbol idéntico a `46181c79`).
Campaña de convergencia leída en `8672f8c1`, sin integrarla.

## 0 · Decisión en una frase

**El contrato de nombres es del repo; el almacén por defecto es GitHub (Secrets y Variables por
entorno); Doppler queda como espejo opcional y no es condición de ejecución de ninguna campaña.**

Esto sustituye mi dictamen anterior, que daba por hecho que Doppler era el camino único porque
el wiring actual lo usa. El wiring es una decisión de despliegue, no un requisito del producto:
el código lee `process.env`, y quién lo rellena es indiferente para las seis campañas. La prueba
está en el propio repo: `configure-prod-db.yml` ya es github-first (lee `secrets.SUPABASE_DB_URL`,
`secrets.DATABASE_URL_PROD` y `secrets.DATABASE_URL` **antes** de preguntar a Doppler), mientras
`deploy.yml` sigue siendo doppler-first. Las dos políticas conviven hoy en el mismo repo, así que
elegir GitHub no rompe ninguna suposición del runtime.

## 1 · Diagnóstico verificado del wiring actual

| Hecho | Dónde | Consecuencia |
|---|---|---|
| El deploy obtiene **todo** el entorno de Doppler: preflight (`jq length`), descarga y dos `flyctl secrets import` | `.github/workflows/deploy.yml` (pasos *preparar CLI de Doppler*, *verificar acceso a Doppler*, *importar secretos en la api/worker*) | Sin `DOPPLER_TOKEN`, o con un token caducado, **no hay despliegue**: el job muere antes de tocar Fly |
| El `prd` de Doppler mezcla aplicación e infraestructura, y el workflow lo recorta con una denylist por prefijo (`CLOUDFLARE_`, `FLY_`, `DOPPLER_`, `VERCEL_`, `NEON_`, `GH_`, `AWS_`, `AZURE_`, `GCP_`, `SUPABASE_ACCESS_`) | mismo fichero, comentario `DEPLOY_SECRETS_DENYLIST_V1` | Un almacén único con tokens de zona DNS; la denylist es un parche, no una frontera |
| El preflight de Doppler se añadió porque un fallo se reportaba como `token validation error` sin decir si fallaba Doppler o Fly | comentario `DEPLOY_PREFLIGHT_DOPPLER_V1` | El primer punto de fallo del despliegue es un servicio ajeno al producto |
| `doppler.yaml` declara **un** proyecto y **tres** configs (`dev`, `stg`, `prd`) | `doppler.yaml` | Seis campañas en paralelo dependen de un único proyecto y de un service token por config |
| El contrato ya vive en el repo, no en Doppler: `need: live\|always\|optional`, alias y coherencias | `scripts/secrets-check.ts:26-83`, `ALIASES`, bloque de coherencias | El repo ya sabe qué falta y para qué; Doppler solo aportaba los valores |
| La base de datos ya se resuelve github-first | `.github/workflows/configure-prod-db.yml` (paso *reunir candidatos de DSN*) | El patrón que propongo ya está aceptado en producción para el secreto más crítico |
| `SECRETOS.md` prescribe "se guarda en Doppler y se importa" | `docs/operacion/SECRETOS.md` §1, §6 | Documento de operación a corregir **con reserva de path**; no se toca en este turno |

**Por qué esto bloquea a seis campañas.** `suite-verde` y `leads` cierran su gate sin ninguna
clave (`WORKSPACE_MODE=sample`, `ALLOW_NETWORK=0`); el resto necesitan credenciales para verificar
de verdad. Si la credencial solo existe en Doppler, cada agente necesita un service token, cada
gate depende de que Doppler responda, y un token rotado tumba la verificación de todas a la vez.
Con GitHub, la credencial cuelga del entorno del repo que ya se usa para todo lo demás.

## 2 · Los tres planos (y quién manda en cada uno)

1. **Contrato** — `scripts/secrets-check.ts`. Nombres, `need`, alias y coherencias. Es la fuente
   de verdad de *qué* hace falta. Ya existe y ya sale con código 1.
2. **Almacén** — GitHub. `Settings → Environments → preview | production` para secretos de
   aplicación; `Settings → Secrets and variables → Actions → Variables` para lo que no es
   sensible. Un secreto pertenece a **un** entorno; nunca a los dos con el mismo valor.
3. **Inyección** — explícita y por consumidor: `.env` local no versionado para campañas,
   `env:` nombrado en el workflow para CI, `flyctl secrets import --stage` por app (api y worker
   con listas distintas), y `process.env` en runtime.

Reglas que se derivan:

- **Secret vs Variable.** Clave, token, DSN, cabecera de autorización y material de cifrado →
  Secret. Identificadores y configuración (`FLY_APP_*`, `FAST_LLM_PROVIDER/MODEL`,
  `SLOW_LLM_*`, `EMBEDDINGS_LLM_*`, `JEV_MODEL`, id de avatar, id de voz, `OTEL_SERVICE_NAME`,
  endpoint OTLP) → Variable. Una Variable es legible por cualquiera con acceso al repo: si el
  valor sirve para autenticar, no es Variable.
- **Un entorno, un valor.** `preview` usa sandbox del proveedor; `production` usa real. Un job de
  campaña nunca recibe secretos de `production`.
- **Nada de valores** en repo, logs, PR, chat ni artefactos. El preflight informa presencia y
  longitud, nunca contenido (comportamiento que `secrets-check.ts` ya implementa).
- **La falta de un secreto obligatorio falla el job que lo necesita**, no la campaña entera.

## 3 · Los veinte nombres: qué está verificado y qué se propone

El error de mi dictamen anterior fue tratar "no aparece en el código" como "no existe". La
distinción correcta tiene tres clases, y cada fila lleva la suya:

- **A · verificado en código**: el nombre se lee en el árbol y alguien lo consume.
- **B · declarado sin consumidor**: el nombre está declarado (sonda o contrato) pero el adaptador
  todavía no existe. Sirve para preparar el almacén, no para afirmar que hay integración.
- **C · tipo de credencial verificado, nombre propuesto**: lo que la plataforma exige está
  documentado o en el código; el nombre de la variable lo fija este repo.

| # | Nombre | Clase | Evidencia | Consumidor hoy |
|---|---|---|---|---|
| 1 | `DATABASE_URL` | A | `scripts/secrets-check.ts:26` (`need: live`) | API/worker (Postgres) |
| 2 | `FLY_API_TOKEN` | A | `deploy.yml` (pasos fly), `configure-prod-db.yml` | CI → Fly |
| 3 | `VERCEL_TOKEN` | A | `deploy.yml` job `vercel` | CI → Vercel |
| 4 | `TOKEN_ENCRYPTION_KEY` | A | `secrets-check.ts:28` (32 bytes base64) | cifrado de tokens OAuth |
| 5 | `FAST_LLM_API_KEY` | A | `kernel/config/env-resolver.ts:59`, `cognition/v2/provider.ts:19`, `inference.ts:59` | chat (lane fast) |
| 6 | `SLOW_LLM_API_KEY` | A | `env-resolver.ts:60`, `provider.ts:19` | tareas (lane slow) |
| 7 | `EMBEDDINGS_LLM_API_KEY` | A | `env-resolver.ts:69`, `engine/embeddings.ts:13` | RAG |
| 8 | `JEV_API_KEY` | **C** | `cognition/v2/jev-classifier.ts:37-39` recibe `apiKey`; `:65` envía `Authorization: Bearer ${this.#key}` a `https://api.typesafe.ai/v1/systemone` | clasificador JEV (sin activar) |
| 9 | `ANAM_API_KEY` | **C** | `docs/implementation/cognition-v2/BLOCKERS.md:13` (cuentas/entitlements/session tokens); C13 exige tokens efímeros emitidos por backend | ninguno: no hay cliente Anam |
| 10 | `ELEVENLABS_API_KEY` | B | `scripts/lib/connections.ts:218-222` (sonda `/v1/user/subscription`), declarada en `:590-596` | sonda de salud; no hay TTS de producción |
| 11 | `GOOGLE_CLIENT_ID` | A | `secrets-check.ts:66` | OAuth Gmail/Calendar/Drive |
| 12 | `GOOGLE_CLIENT_SECRET` | A | `secrets-check.ts:67` | idem |
| 13 | `GOOGLE_MAPS_API_KEY` | A | `secrets-check.ts:83` (grupo `leads`) | declarada; sin cliente Places todavía |
| 14 | `OTEL_EXPORTER_OTLP_HEADERS` | **C** | `docs/operacion/INVENTARIO-CONEXIONES-Y-GUIA-COPILOTO.md:161` (contrato P); no hay lectura en código | ninguno: H01 |
| 15 | `METRICS_TOKEN` | A | `apps/server/src/metrics-exporter.ts:19` | `/metrics` |
| 16 | `WHATSAPP_TOKEN` | A | `secrets-check.ts:70`; alias `WHATSAPP_ACCESS_TOKEN` en `ALIASES` | Cloud API saliente |
| 17 | `WHATSAPP_APP_SECRET` | A | `secrets-check.ts:72` | firma `X-Hub-Signature-256` |
| 18 | `WHATSAPP_VERIFY_TOKEN` | A | `secrets-check.ts:71` | handshake del webhook |
| 19 | `RESEND_API_KEY` | A | `secrets-check.ts:68` (exige `EMAIL_FROM` junto) | email transaccional |
| 20 | `COMPOSIO_API_KEY` | B | `scripts/lib/connections.ts:613`, declarada sin sonda ni adaptador | ninguno |

Resumen: **15 A, 2 B, 3 C**. Los tres C no son invención: JEV es una clave Bearer (el código lo
prueba), Anam exige cuenta y tokens de sesión emitidos por el backend, y OTLP/Headers figura como
contrato P en el inventario. Lo que no existe en el código es **el nombre de la variable**, y eso
es exactamente lo que este documento fija: `JEV_API_KEY`, `ANAM_API_KEY`,
`OTEL_EXPORTER_OTLP_HEADERS`.

**Compañeros no secretos que el código exige** y que la lista de veinte no incluye. Sin ellos, la
key sola no arranca el motor: `FAST_LLM_PROVIDER`, `FAST_LLM_MODEL`, `SLOW_LLM_PROVIDER`,
`SLOW_LLM_MODEL`, `EMBEDDINGS_LLM_PROVIDER`, `EMBEDDINGS_LLM_MODEL` — `provider.ts:19-20` lanza
`<LANE>_PROFILE_UNCONFIGURED` si falta cualquiera de los tres, y `inference.ts:59-60` hace lo
mismo para fast. Todos van a **Variables**, no a Secrets. Igual `JEV_MODEL` (el código solo acepta
`jev-1.14.0` y `jev-1.13.0`, `jev-classifier.ts:45`), `ANAM_AVATAR_ID`,
`ELEVENLABS_VOICE_ID`, `OTEL_EXPORTER_OTLP_ENDPOINT`, `OTEL_SERVICE_NAME`, `EMAIL_FROM`,
`WHATSAPP_PHONE_ID`, y los `FLY_APP_*` / `VERCEL_ORG_ID` / `VERCEL_PROJECT_ID` que el workflow ya
usa como `vars`/`secrets`.

## 4 · Qué campaña queda desbloqueada con qué

Las seis campañas de `docs/operacion/PLAN-UNIDADES.md` más la capa de convergencia (C10–C13, H01),
que es donde viven JEV, Anam, ElevenLabs, Composio y OTLP.

| Campaña | Secretos que necesita | Sin ellos |
|---|---|---|
| `suite-verde` | **ninguno** | se ejecuta igual (`sample`, red apagada) |
| `leads` | **ninguno obligatorio**; `GOOGLE_MAPS_API_KEY` solo cuando exista cliente Places | se ejecuta igual |
| `authz-tenant` | `SUPABASE_URL` (+ JWT por JWKS), `AUTH_PROVIDER=supabase`, `ADMIN_EMAIL`/`ADMIN_PASSWORD` | el fix de firma avanza con secreto local HS256; el gate multitenant no |
| `canales` | `WHATSAPP_TOKEN`/`APP_SECRET`/`VERIFY_TOKEN`/`PHONE_ID`, `GOOGLE_CLIENT_ID`/`SECRET`, `RESEND_API_KEY`+`EMAIL_FROM`, `VAPI_*` (legacy), dominio HTTPS | adaptadores con 503 honesto y mock; nada de envíos reales |
| `responder-lead` | hereda `leads` + `canales` + claves LLM | E2E contra dobles, no contra proveedores |
| `deploy` | `FLY_API_TOKEN`, `VERCEL_TOKEN`, `DATABASE_URL`, `TOKEN_ENCRYPTION_KEY`, `AGENTE_ACCESS_KEY`, `PUBLIC_API_URL`, `ALLOWED_ORIGINS`, `SMOKE_EMAIL`/`PASSWORD` | CI y compose se cierran; el smoke real no |
| convergencia C10–C11 | `FAST_`/`SLOW_`/`EMBEDDINGS_LLM_API_KEY` + `*_PROVIDER`/`*_MODEL` | motor sin lane; el chat no responde |
| convergencia C12–C13 | `ANAM_API_KEY`, `ELEVENLABS_API_KEY` (condicionada a API/coste/latencia), `JEV_API_KEY` + `JEV_MODEL` | coordenador con proveedor falso; nada de audio real |
| convergencia H01 | `METRICS_TOKEN`, `OTEL_EXPORTER_OTLP_HEADERS` + endpoint | `/metrics` protegido sigue funcionando; OTLP no exporta |
| Composio | `COMPOSIO_API_KEY` | registro de conectores sin adaptador |

Ninguna fila exige Doppler. Eso es todo el punto: **las seis campañas no deben depender de un
servicio de configuración para poder verificar su gate.**

## 5 · El manifiesto: por qué explícito y no un bucle

GitHub Actions **no permite enumerar `secrets.*`**: no hay `for` sobre el contexto, y
`secrets[expr]` no es fiable fuera de `env:`/`with:`. Cualquier diseño que prometa "inyectar todos
los secretos" en un bucle es falso. La alternativa correcta es un **manifiesto versionado** que
nombre cada secreto una vez, y un generador que produzca el bloque `env:` que se revisa en el PR:

```jsonc
// deploy/secrets.manifest.json (extracto)
{
  "version": 1,
  "entries": [
    { "name": "DATABASE_URL", "kind": "secret", "need": "live",
      "environments": ["production"], "targets": ["api", "worker"],
      "campaigns": ["deploy", "authz-tenant"], "source": "code",
      "evidence": "scripts/secrets-check.ts:26" },
    { "name": "JEV_API_KEY", "kind": "secret", "need": "optional",
      "environments": ["production"], "targets": ["api"],
      "campaigns": ["convergencia:C11"], "source": "proposal",
      "evidence": "cognition/v2/jev-classifier.ts:65" },
    { "name": "FAST_LLM_PROVIDER", "kind": "variable", "need": "optional",
      "environments": ["preview", "production"], "targets": ["api", "worker"],
      "campaigns": ["convergencia:C10"], "source": "code",
      "evidence": "cognition/v2/provider.ts:19" }
  ]
}
```

`scripts/secrets-manifest.ts` (nuevo, sin dependencias) hace cuatro cosas y ninguna lee valores
reales salvo el preflight del runner:

1. `--check-contract`: el conjunto de `name`/`need` coincide con `scripts/secrets-check.ts`.
   Detecta deriva cuando alguien añade una variable y olvida el manifiesto (o al revés).
2. `--check-workflow .github/workflows/deploy.yml`: cada `kind: secret` aparece nombrado en un
   bloque `env:` del workflow. Falla si falta uno; no genera el workflow en tiempo de ejecución.
3. `--render-env --target=api|worker --environment=preview|production`: imprime el bloque `env:`
   con `${{ secrets.NOMBRE }}` para pegarlo revisado en el PR. El workflow resultante es estático.
4. `--preflight`: en el runner, comprueba presencia y longitud de los nombres ya inyectados,
   imprime `OK`/`FALTA` sin valores y sale con 1 si falta un `need: live` del entorno. Es el mismo
   contrato que `secrets-check.ts`, aplicado al conjunto que el manifiesto declara para ese job.

Ventajas frente a la denylist por prefijo: la lista es positiva (solo se importa lo nombrado), el
recorte deja de ser una heurística, y `targets` evita el error actual de mandar el mismo paquete
de secretos a la api y al worker.

## 6 · Patchsets T04-S (para Trans04)

Orden topológico. Ninguno se implementa sin reserva de paths y autorización.

### S0 · Manifiesto y validador (sin cambio de comportamiento)

- **Paths.** `deploy/secrets.manifest.json`, `scripts/secrets-manifest.ts`,
  `package.json` (`"secrets:manifest"`), `tests/secrets-manifest.test.ts`.
- **Cambio.** Manifiesto completo con las 20 entradas y sus compañeros; `--check-contract`,
  `--check-workflow`, `--render-env`, `--preflight`.
- **Pruebas.** Deriva detectada en los dos sentidos; entrada sin `evidence` rechazada; `kind`
  inválido rechazado; `targets` vacío rechazado; `--preflight` sin valores y exit 1 por `need:
  live` ausente. Sin red.
- **Rollback.** Revertir el commit; no hay migración ni workflow tocado.

### S1 · Inyección GitHub → Fly por defecto; Doppler opcional

- **Paths.** `.github/workflows/deploy.yml` (job `fly`), `docs/operacion/SECRETOS.md` (**reserva
  de path**, no es mío), `doppler.yaml` (comentario de "opcional", no borrar el fichero).
- **Cambio.** Paso único `importar secretos (github)` con `env:` explícito por app desde el
  manifiesto; `flyctl secrets import --stage` por `targets`. El camino Doppler se conserva
  íntegro detrás de `vars.SECRETS_SOURCE == 'doppler'`, con su preflight, para quien lo quiera.
  `DOPPLER_TOKEN` deja de ser obligatorio. Se mantiene la comprobación de que ningún nombre
  importado cae en los prefijos de infraestructura, ahora como aserción, no como filtro.
- **Pruebas.** Job sin `DOPPLER_TOKEN` despliega preview; `SECRETS_SOURCE=doppler` sin token
  falla con mensaje que nombra Doppler, no Fly; un nombre de infraestructura en el manifiesto
  rompe el job; api y worker reciben listas distintas.
- **Rollback.** `SECRETS_SOURCE=doppler` restaura el comportamiento actual sin revertir código.

### S2 · Preflight y separación preview/production

- **Paths.** `scripts/secrets-check.ts` (aditivo), `deploy.yml` (job `gate` o paso previo al
  import), entorno `production` con *required reviewers*.
- **Cambio.** `--json` para consumo de CI y `--profile=<campaña>` para validar solo el subconjunto
  de una campaña; coherencias nuevas: `JEV_API_KEY` sin `JEV_MODEL`, `ANAM_API_KEY` sin
  `ANAM_AVATAR_ID`, `OTEL_EXPORTER_OTLP_HEADERS` sin endpoint, `FAST_LLM_API_KEY` sin
  `FAST_LLM_PROVIDER`/`MODEL`. El preflight corre **antes** de importar y solo con el entorno
  elegido; `preview` nunca ve valores de `production`.
- **Pruebas.** `--profile=leads` con entorno vacío sale 0; `--profile=deploy` sin `DATABASE_URL`
  sale 1; `--json` no contiene ningún valor; un job de preview con secreto de producción
  declarado en el manifiesto falla.
- **Rollback.** Revertir; `secrets-check.ts` conserva su interfaz anterior.

### S3 · Fail-closed por adaptador (contrato con Trans03/A03)

- **Paths.** adaptadores de `canales` y `cognition/v2` (**reserva de Trans03**), tests por
  adaptador.
- **Cambio.** Sin credencial: 503 estructurado (`provider_unconfigured` + nombre del proveedor),
  sin reintento, sin respuesta sintética, sin caer a `sample`. Con credencial: una sola llamada
  de verificación. `ANAM_API_KEY` y `ELEVENLABS_API_KEY` no salen del servidor: el cliente recibe
  token efímero si el proveedor lo soporta (C13).
- **Pruebas.** Cada adaptador con y sin clave; ausencia de clave no produce efecto; el token
  efímero caduca; ninguna clave en logs ni en payload del navegador.
- **Rollback.** Revertir el commit del adaptador; el resto del kernel no depende de esto.

### S4 · Observabilidad del secreto (H01)

- **Paths.** `apps/server/src/metrics-exporter.ts` (aditivo), `docs/convergencia-operativa-12x4/02-observabilidad/`
  (reserva de Trans04), tests.
- **Cambio.** Métrica booleana de presencia por credencial (`secret_present{name}`), edad de la
  última rotación si el manifiesto la declara, y contador de `provider_unconfigured`. Nunca el
  valor, nunca un hash que permita comparar entre entornos. OTLP solo si
  `OTEL_EXPORTER_OTLP_HEADERS` está presente.
- **Pruebas.** La métrica no contiene el valor; cardinalidad acotada; exportador sigue exigiendo
  `METRICS_TOKEN` o admin.
- **Rollback.** Revertir; `/metrics` conserva su contrato.

## 7 · Lo que no haría

- **No inyectar todo en todas partes.** El worker no necesita Stripe ni Google OAuth; la api no
  necesita el token de Fly. `targets` en el manifiesto.
- **No poner secretos en Vercel.** El sitio es estático; nada que firme, descifre o conecte.
- **No sincronizar en dos direcciones** GitHub ↔ Doppler: dos fuentes de verdad producen deriva
  silenciosa. Doppler es espejo de lectura o no es.
- **No usar `secrets: inherit`** para pasar todo un entorno a un workflow reutilizable.
- **No convertir un fallo de credencial en un éxito degradado.** Un adaptador sin clave responde
  503; un job sin secreto obligatorio falla.
- **No declarar PASS de una campaña por tener las claves.** El gate sigue siendo el comando, el
  SHA y la evidencia.

## 8 · Límites reales que condicionan el diseño

1. `secrets.*` no se enumera: el manifiesto debe nombrar cada secreto (por eso S0/S1).
2. Los secretos de entorno no existen en `pull_request` de forks; las campañas verifican con
   `sample` y dobles, no con secretos de producción.
3. `flyctl secrets import --stage` requiere un deploy posterior para aplicar; el orden
   import → deploy ya está en el workflow y se conserva.
4. Un secreto en Fly prevalece sobre `[env]` de `fly.toml`; por eso `PUBLIC_API_URL` y
   `ALLOWED_ORIGINS` se publican junto al resto en producción (comportamiento actual que se
   mantiene).
5. `TOKEN_ENCRYPTION_KEY` no se rota a la ligera: cambiarla invalida los tokens OAuth guardados.
6. Coste: 20 secretos × 2 entornos cuentan contra el límite del plan; las Variables no.

## 9 · Evidencia reproducible (este turno)

```text
$ git rev-parse HEAD
84499ce7c5ee7f7f572110fa7b7ec3d7144a66bd

$ rg -n 'name: "(DATABASE_URL|TOKEN_ENCRYPTION_KEY|FAST_LLM_API_KEY|...)"' scripts/secrets-check.ts
26,28,59,60,61,66,67,68,70,71,72,83  → los quince nombres de clase A

$ rg -n 'FAST_LLM_API_KEY|SLOW_LLM_API_KEY|EMBEDDINGS_LLM_API_KEY' apps/server/src
env-resolver.ts:59,60,69 · provider.ts:19 · inference.ts:59 · embeddings.ts:13

$ rg -n 'METRICS_TOKEN' apps/server/src
metrics-exporter.ts:19

$ rg -n 'JEV_|ANAM' apps packages scripts --glob '*.ts'
jev-classifier.ts:37-39,45,65 (apiKey inyectada, Bearer a api.typesafe.ai/v1/systemone)
sin variable de entorno ni cliente Anam

$ rg -n 'ELEVENLABS_API_KEY|COMPOSIO_API_KEY' scripts/lib/connections.ts
218-222 · 590-596 · 613
```

Límites de la evidencia: es inspección estática sobre `84499ce7`. No se ejecutaron typecheck,
tests, workflows ni despliegues en este turno; no se leyó ningún valor de secreto.

## 10 · Estado y siguiente paso

- **T04-S · PROPUESTA · NO_GO** hasta reserva de paths y autorización del supervisor.
- **Trans04** es el dueño natural de S0–S2 y S4 (CI, despliegue, observabilidad); **S3** es de
  Trans03 (adaptadores). `docs/operacion/SECRETOS.md` requiere reserva de su dueño.
- Este documento no cambia el estado de las seis campañas: solo fija dónde viven sus credenciales
  y quién puede verificarlas sin depender de Doppler.
