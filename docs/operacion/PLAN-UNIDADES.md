# Plan por campañas, subequipos y gates

> Sustituye cualquier planificación por tiempo. Una unidad está cerrada o no está cerrada: no existe "casi".
> Este documento es el que se copia a la rama de trabajo y se actualiza al cerrar cada campaña.

## 0. Estado verificado hoy (base de comparación)

Medido sobre `coherencia/campanas-1-5` (`7eaa329`), no sobre impresiones:

| Check | Comando | Resultado |
|---|---|---|
| Typecheck servidor | `tsc --noEmit` | 0 errores |
| Typecheck worker | `npm --prefix apps/worker run typecheck` | 0 errores |
| Suite raíz | `tsx --import ./tests/setup.ts --test tests/*.test.ts` | 358 tests, 340 pass, 17 fail, 1 cancelado |
| Auditorías | `node --import tsx scripts/audits/coherence.ts` | 5/7 OK (contratos e idempotencia en rojo) |

Comparación contra `88a20bf`: 308 tests / 255 pass / 52 fail y la app no arrancaba en tests
(`conversation.ts:759`: `||` con `??` sin paréntesis). Las 17 rojas actuales son
comportamiento, no carga de módulos.

## 1. Vocabulario y reglas

| Unidad | Cierra con |
|---|---|
| **Etapa** | criterio de aceptación del doc de `docs/roadmap` |
| **Fase** | checklist de la fase |
| **Campaña** | métrica antes/después + gate reproducible |
| **Subequipo** | su parte del gate |
| **Feature** | test nuevo + contrato en `packages/domain` |
| **Fix** | test que falla antes y pasa después |
| **Patch** | el check afectado en verde |
| **Hunk** | un diff, una intención |
| **Audit** | `pnpm audit:*` con cifra |

Reglas: 1 hunk = 1 intención · 1 commit = 1 unidad cerrada · 1 rama = 1 campaña/feature ·
1 sesión = N unidades (cerradas / abiertas / bloqueadas) · ningún feature sin test ·
ninguna campaña sin comparación contra la tabla de arriba.

Ramas: `campaign/<slug>`, `feat/<slug>`, `fix/<slug>`, `patch/<slug>`.

## 2. Cadena de campañas

Dependencias reales: `authz-tenant` → `leads` → `responder-lead`. `canales` y `deploy` en paralelo.
`ui` consume contratos, así que entra cuando `leads` cierra su gate.

### Campaña `suite-verde` — prioridad inmediata

Cierra las 17 rojas antes de añadir features. No depende de ningún dato externo.

- Subequipos: tests, runtime.
- Unidades: `fix(tenant-query-403)`, `fix(context-tenantid)`, `fix(memory-null-category)`,
  `fix(event-bus-payloads)`, `fix(workflows-cancel)`, `fix(conversation-browser)`,
  `fix(model-worker)`, `patch(crash-recovery)`.
- Gate: 358 tests, 0 fail, 0 cancelados; y el mismo gate se cumple en `main` tras el merge.

### Campaña `authz-tenant`

- Subequipos: contratos, authz-tenant.
- Unidades: `fix(jwt-signature)`, `fix(tenant-claim)`, `feat(user-tenants)`, `patch(app-ctx)`.
- Gate: JWT firmado en local aceptado; JWT sin claim `tenant_id` → 401; dos tenants con
  `scanByOwnerPrefix` sin fuga; test de firma inválida.
- Bloqueada por: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
  `SUPABASE_JWT_SECRET`. Se puede avanzar el fix de firma sin cuenta (HS256 con secret local).

### Campaña `leads`

- Subequipos: contratos, datos, runtime.
- Unidades: `feat(leads-entities)`, `feat(leads-queries)`, `feat(leads-commands)`,
  `feat(leads-capabilities)`, `feat(leads-views)`.
- Gate: `lead.create`, `lead.search`, `appointment.create` ejecutables por el agente;
  3 views serializadas; aislamiento por tenant en cada query.
- Bloqueada por: nada. Es la primera feature de producto sin datos externos.

### Campaña `canales`

- Subequipos: canales, runtime.
- Unidades: `feat(whatsapp-inbound)`, `feat(whatsapp-audio)`, `fix(email-send)`,
  `feat(drive-write)`, `feat(vapi-adapter)`.
- Gate: webhook con firma válida e inválida; borrador → enviado con aprobación;
  503 honesto sin key de Vapi.
- Bloqueada por: WhatsApp (Cloud API o Evolution), Vapi, Google OAuth, dominio público HTTPS.

### Campaña `responder-lead`

- Subequipos: runtime, canales, datos.
- Unidades: `feat(sop-8-pasos)`, `feat(bundle-agencia)`, `patch(provision-client)`.
- Gate: E2E con providers falsos: mensaje → lead → cita → email → briefing → estado final.
- Bloqueada por: `leads` y `canales`.

### Campaña `deploy`

- Subequipos: deploy, auditoría.
- Unidades: `fix(test-glob)`, `patch(ci-blocking)`, `feat(compose-postgres)`,
  `feat(smoke-startup)`.
- Gate: la suite descubre `tests/campaign-2/`, `tests/campaign-3/` y `tests/roadmap/`;
  CI rojo bloquea; compose levanta Postgres + API + worker; smoke verde.
- Bloqueada por: nada para el glob y CI; dominio público para el smoke real.

### Campaña `ui` — propiedad del founder

- Unidades: dashboard híbrido contra los endpoints de `leads` y `canales`.
- Gate: cada vista consume un contrato ya cerrado, sin endpoints nuevos inventados.

## 3. Deuda declarada (no se toca hasta que su campaña la recoja)

- 150 contratos huérfanos y 3 marcas de idempotencia huérfanas.
- `tests/*.test.ts` no descubre subdirectorios.
- Comentarios con mojibake (doble codificación) en varios ficheros.
- `readConfig()` en tests lee entorno: los tests no deben depender del `.env` del que ejecuta.
- Job de worker e integración en CI con `continue-on-error`.

## 4. Qué necesita cada campaña del founder

| Campaña | Dato | Si falta |
|---|---|---|
| `suite-verde` | nada | se ejecuta igual |
| `authz-tenant` | proyecto Supabase | se hace el fix de firma con secret local |
| `leads` | nada | se ejecuta igual |
| `canales` | WhatsApp, Vapi, Google, dominio | adaptadores con 503 honesto y mock |
| `deploy` | dominio público | compose y CI se cierran igual |

Detalle de cada cuenta, variable y verificación: `CUENTAS.md`.
Protocolo de sesión y propiedad de ficheros: `EQUIPO.md`.
