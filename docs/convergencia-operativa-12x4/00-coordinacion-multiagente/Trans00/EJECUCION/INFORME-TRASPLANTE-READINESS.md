# Trans00 · Trasplante selectivo de `infra/trans00-provider-readiness`

**Base:** `892061c9` (`integration/trans00-core`) · **Rama:** `converge/trans00-core` · **Fecha:** 2026-11-27
**Origen portado:** `infra/trans00-provider-readiness` @ `1bb25aba` · **Autorización:** arranque de Trans00 por el operador; sin merge, sin push a ramas compartidas, sin despliegue.

## 1. Hallazgo que cambió el plan

El handoff suponía que el registro de readiness era un superconjunto del de integration. **No lo es**: integration es más nuevo en tres puntos y copiar el fichero encima habría borrado trabajo real.

| Elemento | Integration (`892061c9`) | Readiness (`1bb25aba`) | Decisión |
| --- | --- | --- | --- |
| Cuenta lenta de OpenRouter | `openrouter-slow` → `["OPEN_ROUTER_API_KEY"]` | `slow-openrouter` → el mismo nombre | **Se conserva la de integration**; no se duplica |
| Prueba de OpenRouter | `openrouterKey(...)` con fallback `JEV_OPENROUTER_API_KEY` | `openrouterProbe(name)` sin fallback | **Se conserva la de integration** |
| Meta Muse | `meta-muse` → `["MUSE_API_KEY"]` | no existe | Se conserva |
| Sonda Grafana | `/api/org` + `GRAFANA_SERVICE_ACCOUNT_TOKEN`, falla sin credencial | la misma corrección | **Ya estaba**; nada que portar |
| Sonda Sentry | declara que solo valida forma del DSN | la misma corrección | **Ya estaba**; nada que portar |

Conclusión: el trasplante es **aditivo**, no sustitutivo. Un cherry-pick del commit habría producido un conflicto semántico silencioso.

## 2. Qué se portó

| Fichero | Cambio | Por qué |
| --- | --- | --- |
| `scripts/trans-provider-readiness.mjs` | **nuevo** (42 identificadores, sondas de solo lectura, salida JSON con `registry`) | No existía en integration |
| `tests/trans-provider-readiness.test.mjs` | **nuevo** (12 pruebas) | No existía; adaptada al id real `openrouter-slow` |
| `scripts/lib/connections.ts` | `companions?`, 6 conexiones nuevas, `CONNECTION_NAMES` | El contrato necesita una fuente única de nombres |
| `scripts/secrets-check.ts` | fila `METRICS_TOKEN` + coherencia `SLOW_LLM_PROVIDER=openrouter` | Huecos reales del contrato |
| `package.json` | `infra:readiness` e `infra:readiness:test` con `--experimental-strip-types` | Node 22.6–22.17 no importa `.ts` sin el flag |

Conexiones añadidas al registro, cada una con consumidor verificado por `grep` antes de escribir su nota:

| id | Nombre | Consumidor real |
| --- | --- | --- |
| `migrations-db` | `DATABASE_MIGRATION_URL` | **ninguno** — se declara propuesta |
| `whatsapp-bindings` | `WHATSAPP_WEBHOOK_BINDINGS` | `apps/server/src/engine/whatsapp-inbound.ts` |
| `vapi-phone` | `VAPI_PHONE_NUMBER_ID` | `apps/server/src/voice-routes.ts` |
| `vapi-webhook` | `VAPI_WEBHOOK_SECRET` | **ninguno** en `apps/server` — se declara |
| `metrics-token` | `METRICS_TOKEN` | `apps/server/src/metrics-exporter.ts` |
| `worker-token` | `WORKER_TOKEN` | worker y sus rutas |

`companions` documenta nombres secundarios que la sonda lee y que no son alternativas: `SUPABASE_SECRET_KEY`/`SUPABASE_ANON_KEY`, `OPENAI_BASE_URL`, `GOOGLE_CLIENT_SECRET`, `WHATSAPP_GRAPH_VERSION`, `GRAFANA_SERVICE_ACCOUNT_TOKEN`, `FLY_APP_NAME`.

## 3. Qué NO se portó, y por qué

- **`apps/server/src/kernel/config/env-resolver.ts`**: integration resuelve el slow lane en `apps/server/src/config.ts` y `engine/model-chain.ts`, con `SLOW_LLM_PROVIDER=openrouter` y `SLOW_LLM_API_KEY` como override en `.env.example`. Portar el resolver añadiría una segunda capa de resolución con reglas distintas. Queda pendiente de la decisión **D1** del handoff.
- **`docs/TRANS-PROVIDER-READINESS-AUDIT.md`**: sus §6 y §11 marcan como hechos cambios de resolver que en esta rama no existen. Traerlo sería una afirmación falsa dentro del árbol.
- **Sondas Grafana/Sentry**: ya corregidas en integration.

## 4. Corrección de semántica en `--strict`

Antes, `--strict` exigía `probe_pass` en todas las filas **también en modo contrato offline**, donde por definición no hay sondas: fallaba siempre y no servía como gate. Ahora:

- modo offline: falla solo si queda algún nombre sin registrar (`unregistered.length > 0`);
- modo `--probe`: falla además si alguna fila no es `probe_pass`.

Verificado: `--strict` offline sale **0** con `unregistered: []`.

## 5. Verificación de este turno

| Comprobación | Comando | Resultado |
| --- | --- | --- |
| Pruebas del contrato | `node --experimental-strip-types --test tests/trans-provider-readiness.test.mjs` | **12/12 PASS**, 0 fail, exit **0** |
| Contrato offline | `node --experimental-strip-types scripts/trans-provider-readiness.mjs` | 42 filas, 60 nombres, `unregistered: []`, exit **0** |
| Modo estricto | ídem `--strict` | exit **0** |
| Estado de las filas offline | — | 36 `stub_missing_config`, 6 `stub_wiring_pending`; **ninguna se declara viva** |
| Typecheck raíz | `npx tsc --noEmit -p tsconfig.json` | exit **2**, **10 errores**, todos `TS2307` por `node_modules` incompleto (`react`, `playwright`) en `apps/web/src/hooks/useNow.ts` y `apps/worker/src/*`; **ninguno** en un fichero tocado por este turno |

Limitaciones declaradas:

- El typecheck no es concluyente en este entorno: faltan dependencias (`npm install` se hizo parcial, sin tocar el lockfile). No se declara PASS.
- No se ejecutó el gate integral ni la suite completa: exceden el alcance de Trans00 y necesitan un runner con dependencias instaladas.
- Las pruebas PostgreSQL siguen sin ejecutarse (no hay instancia nativa aquí).

## 6. Siguiente paso

1. **Decisión D1** (dónde vive la resolución de `OPEN_ROUTER_API_KEY`) antes de tocar `env-resolver.ts`.
2. Repetir el typecheck con `corepack pnpm install --frozen-lockfile` en un runner con dependencias, para sustituir el `exit 2` ambiental por un resultado real.
3. Trans01–Trans04: gates por campaña con `EVIDENCIA.json` propio.
