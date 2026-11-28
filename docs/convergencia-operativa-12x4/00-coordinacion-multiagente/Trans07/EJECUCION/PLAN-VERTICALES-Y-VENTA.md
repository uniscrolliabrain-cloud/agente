# Plan para cerrar verticales y empezar a vender

**Fecha:** 2026-11-28 · **Rama:** `converge/trans00-core` · **Estado del producto:** `LIVE_UNVERIFIED`

> Regla de este documento: cada paso lleva un **criterio de salida verificable**. No se
> promete nada al cliente que no esté en la columna «verificado». Lo que está en rojo se
> dice en la propuesta, no se descubre en el piloto.

---

## 1. Estado real hoy (no de memoria)

| Comprobación | Resultado |
|---|---|
| Gate orquestado | **GATE OK 10/10** (`release gate` de `main` también en verde sobre `6df1cb56`) |
| Suite completa | 1.194 tests · 1.175 PASS · **0 FAIL** · 14 SKIP · 5 TODO |
| PostgreSQL 17 nativo | **83/83 PASS, 0 SKIP** en las 12 suites con puerta Postgres |
| Contratos | 318 OK · 9 PENDING declarados · **0 huérfanos** |
| Merge/PR | PR #37 mergeado en `main` como `6df1cb56`, CI verde |
| Ledger de campaña | 288 bloques, **0 `DONE`** (no se promueve sin 12 fases × 4 pasadas) |
| Proveedores externos | **`LIVE_UNVERIFIED`** (Meta, Google, Vapi, Resend, OpenRouter) |
| Datos reales del owner | `OWNER-REAL`: **`NOT_RUN`** |

**Conclusión:** el código está en estado de piloto, no de producto vendible todavía. Lo que
falta no es «más código» en general: es **una pasada en vivo**, **un recorrido con datos
reales** y **empaquetado comercial**.

---

## 2. Lo que se cerró en este turno

1. **T05-02 retención/borrado por tenant** (antes `BLOCKED`): `LongitudinalMemory.purge`
   con tres criterios excluyentes —antigüedad, evento, supresión total—, siempre acotado a
   la identidad autenticada y con rechazo de un `DELETE` sin alcance. 13/13 en `trans05-*`.
2. **T02-05 concurrencia con PostgreSQL nativo** (antes `BLOCKED`): 10 SKIP resueltos
   contra PostgreSQL **17.12** real; 83/83 PASS, 0 SKIP.
3. **Criterio #9 rollback en seco**: `git revert -m 1 6df1cb56` en worktree desechable,
   **0 conflictos**, árbol revertido **idéntico** a `e496dd43` (`git write-tree` =
   `6df1cb56^1^{tree}`), abortado y limpiado. Sin push ni force-push.
4. **Criterio #3 PostgreSQL 17**: cumplido con las suites en verde (ya no es sólo declarado).

Queda abierto: **ledger** (288 bloques, 0 DONE), **proveedores en vivo** y **OWNER-REAL**.

---

## 3. Bloqueantes transversales (aplican a cualquier vertical)

| Bloqueante | Qué exige | Coste |
|---|---|---|
| `LIVE_UNVERIFIED` | Credenciales de prueba reales y una sonda de lectura por proveedor (Meta test number, dominio de Resend verificado, clave OpenRouter de test) | 1 turno por proveedor |
| `OWNER-REAL` | Un tenant real con datos reales y un recorrido completo (alta → evento → verdad → pack → acción) | 1–2 turnos |
| Retención automática | Job programado que llame a `purge({ olderThanDays })`; hoy existe la API, no el cron | 0,5 turno |
| Empaquetado | Precio, contrato, DPA, onboarding, soporte | Comercial, no código |
| Ledger | No bloquea vender; bloquea **certificar**. No se promete «certificado» | — |

---

## 4. Verticales, de la más cercana a la más lejana

### A. Agente de WhatsApp para atención y venta (el más vendible)

**Qué hay:** adaptador Meta con matriz de fallos, idempotencia por `providerMessageId` +
tenant, `compareAndSwap` de despacho, reconciliación declarada, webhook de entrada, auth,
métricas y `/metrics`.

**Qué falta:**
- Sonda en vivo de Meta (enviar/leer un mensaje real en número de prueba) → mata `T03-04`.
- Política de reconciliación **operativa**: quién revisa los `outcome_unknown` y con qué UI.
- Plantillas de mensaje aprobadas por Meta y Texto de negocio; sin eso el canal no produce.
- Retención programada + DPA (se guardan conversaciones).

**Prerrequisito comercial:** cuenta WhatsApp Business, número verificado, método de pago.

**Criterio de salida:** un mensaje real enviado, uno recibido, uno fallido y reconciliado,
con `providerId` en la evidencia.

### B. Backoffice agéntico (workspace + acciones con aprobación)

**Qué hay:** kernel con leases, CAS, claim de aprobaciones, eventos durables, proyección,
`outcome_unknown` con reconciliación obligatoria, UI.

**Qué falta:** el recorrido `OWNER-REAL` con datos del owner; decidir qué se automatiza sin
aprobación humana y qué no; onboarding de un workspace real.

**Criterio de salida:** un ciclo completo con datos reales y una aprobación humana registrada.

### C. Cognición v2 como módulo (memoria longitudinal + verdad) para integradores

**Qué hay:** verdad con procedencia y receipts, atención con procedencia, memoria
longitudinal montada, idempotente, multi-tenant, con retención ya implementada, RLS
verificado contra Postgres real.

**Qué falta:** empaquetarlo como librería/servicio con contrato público
(`@agente/cognition`), versionado semántico, y una ruta HTTP de diagnóstico (hoy el
diagnóstico es CLI y `resolveField` no tiene ruta).

**Criterio de salida:** un integrador externo consume el paquete sin leer el repo.

### D. Observabilidad y readiness como add-on

**Qué hay:** emisión real de métricas, alertas que distinguen «no disparó» de «cero medido»,
preflight de secretos fail-closed, contrato de readiness de 42 conexiones.

**Qué falta:** que una alerta real se dispare por una condición real (hoy es sintético), y
las 36 conexiones `stub_missing_config` + 6 `stub_wiring_pending` cableadas.

**Criterio de salida:** primera alerta real en un entorno del cliente.

---

## 5. Secuencia recomendada (8 pasos)

0. **PostgreSQL 17 fijo en CI** (§5 bis): servicio `postgres:17` en el job `integration`. Salida:
   `pnpm test` en `main` con 0 SKIP de Postgres, sin depender de una máquina local.
1. **Sondas en vivo controladas** (vertical A): un número de prueba de Meta, un dominio de
   test de Resend, una clave OpenRouter de test. Salida: `LIVE_VERIFIED` por proveedor con
   log y sha256.
2. **Retención programada**: job que invoque `purge({ olderThanDays })` por tenant y deje
   traza. Salida: test + log de ejecución.
3. **`OWNER-REAL`**: recorrido completo sobre datos reales. Salida: informe con capturas
   redactadas y `EVIDENCIA.json` propio.
4. **Entorno de staging**: despliegue separado (no producción), secretos en el gestor del
   cliente, `MULTI_TENANT_SHARED` decidido (RLS ya verificado).
5. **Vertical A en piloto cerrado**: 1 cliente, 1 número, 2 semanas, métricas y alertas
   encendidas; SLA definido sobre `/metrics`, no sobre promesas.
6. **Empaquetado**: precio de alta + cuota mensual, DPA, política de retención publicada,
   límite de mensajes y de tokens declarado.
7. **Vertical C** como segunda línea (módulo para integradores) reutilizando el mismo
   núcleo; sólo cuando A esté cobrando.
8. **Certificación interna** (ledger + 12 fases × 4 pasadas) cuando haya ingresos o un
   cliente que la exija por contrato. No antes: no bloquea vender.

---

## 5 bis. Reproducir PostgreSQL 17 sin root (y dejarlo fijo en CI)

El cierre del criterio #3 se hizo en el sandbox con binarios embebidos, sin `sudo`:

```bash
mkdir -p /tmp/pg && cd /tmp/pg && npm init -y
npm i embedded-postgres@17.12.0-beta.19 @embedded-postgres/linux-x64@17.12.0-beta.19
cd node_modules/@embedded-postgres/linux-x64/native
export PATH="$PWD/bin:$PATH" LD_LIBRARY_PATH="$PWD/lib"
initdb -D /tmp/pgdata -U postgres --auth=trust -E UTF8
pg_ctl -D /tmp/pgdata -l /tmp/pg.log -o "-p 55432 -k /tmp -c listen_addresses=127.0.0.1" start
# base: cognition_test · URL: postgres://postgres@127.0.0.1:55432/cognition_test
```

Eso sirve para una máquina de desarrollo. Para que **no vuelva a haber SKIP en CI**, el job
`integration` de `.github/workflows/ci.yml` (hoy corre `pnpm test` con `ALLOW_NETWORK=1` y sin
base) necesita un servicio y dos variables:

```yaml
    services:
      postgres:
        image: postgres:17
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: cognition_test
        ports: ["5432:5432"]
        options: >-
          --health-cmd "pg_isready -U postgres"
          --health-interval 10s --health-timeout 5s --health-retries 5
# ...y en el step `pnpm test`:
        env:
          ALLOW_NETWORK: "1"
          COGNITION_TEST_POSTGRES_URL: postgres://postgres:postgres@localhost:5432/cognition_test
          TEST_DATABASE_URL: postgres://postgres:postgres@localhost:5432/cognition_test
```

No se aplicó en este turno: un workflow sólo se puede verificar ejecutándolo en `main`, y no se
empuja a `main` sin autorización. Queda como primer paso de la secuencia.

## 6. Qué NO prometer todavía

- **Entrega garantizada** de mensajes/audio/correo: no hay prueba de entrega física y el
  proveedor no acepta clave de idempotencia del cliente; 408/429/5xx quedan en
  `outcome_unknown` con reconciliación humana.
- **Verdad como autoridad**: `resolveField` es puro, no persiste ni concede autoridad.
- **Retención automática «ya incluida»**: existe la API de borrado, no el job.
- **Certificación**: el ledger sigue en 0 `DONE`.
- **Multi-tenant compartido sin revisión**: el aislamiento está probado (RLS + Postgres 17),
  pero cada cliente nuevo merece su propia pasada de configuración.

---

## 7. Riesgos comerciales y su mitigación

| Riesgo | Mitigación ya disponible |
|---|---|
| Prometer cobertura y entregar SKIP | 14 SKIP declarados con motivo; el gate los imprime |
| Fuga de datos entre clientes | RLS + tenant de la identidad, probado contra Postgres real |
| Coste de LLM desbocado | Límite por usuario/día y separación Fast/Slow/JEV |
| Fallo silencioso de proveedor | `OutcomeUnknownError` + reconciliación obligatoria |
| Pérdida de trabajo al desplegar | merge commit, rollback ensayado (`git revert -m 1`) |
