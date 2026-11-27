# Trans03 — Integraciones: consumidores, idempotencia y fallos de proveedor

**Turno:** Trans03/T1 · **Rama:** `converge/trans00-core` · **Base de campaña:** `892061c9`
**Commit evaluado:** `5a7ea97a` · **Alcance:** local, sin red, **ningún proveedor contactado**.

---

## 1. Verificación ejecutada

`tests/trans03-*.test.ts` (5 ficheros): **14 tests, 14 PASS, 0 FAIL, 0 SKIP**, exit 0.
`tsc --noEmit` → exit 0.

El corpus declaraba 4 suites / 8 tests. Aquí son 5 suites / 14 tests: la quinta es
`tests/trans03-meta-failures.test.ts`, añadida en este turno para cubrir los caminos de fallo que la
campaña exige y que no tenían test.

---

## 2. Paso 1 — cada adaptador tiene consumidor real

| Adaptador | Consumidor real | Montaje |
|---|---|---|
| `packages/integrations/src/meta-whatsapp.ts` | `apps/server/src/engine/whatsapp-outbound.ts:342` | el motor de aprobaciones elige `MetaWhatsAppClient` cuando la conexión declara `provider: "meta"` |
| `packages/integrations/src/stubs/whatsapp.ts` | `whatsapp-outbound.ts:7`, `apps/server/src/engine/service.ts:81` | lane Evolution y servicio |
| `apps/server/src/google-auth.ts` | `apps/server/src/app.ts:119` (`new GoogleAuth(...)`), `apps/server/src/workspace.ts` (`accessToken`, `tokens`) | OAuth + binding por empresa |
| `packages/integrations/src/vapi.ts` | `apps/server/src/voice-routes.ts:13` | llamadas de voz |
| `packages/integrations/src/resend.ts` | `apps/server/src/auth-signup.ts:22` | correo transaccional |

Ninguno se queda en `UNMOUNTED`: los cinco tienen consumidor fuera de su propio test.

---

## 3. Paso 3 — caminos de fallo de Meta WhatsApp (nuevo)

`tests/trans03-meta-failures.test.ts` (6 tests) fija la semántica que el adaptador ya implementaba:

| Caso | Resultado exigido | Resultado |
|---|---|---|
| HTTP 408, 429, 500, 502, 503 | `OutcomeUnknownError` («no confirmo el envio») | PASS |
| timeout del `AbortSignal` o `ECONNRESET` | `OutcomeUnknownError` | PASS |
| 2xx sin `messages[0].id`, con id vacío o body `null` | `OutcomeUnknownError` | PASS |
| 400/401/403 | `AppError` 422 con `outcome: "failed_without_effect"` | PASS |
| mensaje de error del proveedor con token o motivo | **no** se copia al error propio | PASS |
| número inválido, texto vacío o >4096 caracteres | 422 **antes** de cualquier llamada de red | PASS |
| `markRead` con id fuera de `[A-Za-z0-9._:-]{1,300}` | 422, sin inventar id | PASS |

La regla de la casa se cumple: un fallo de proveedor es error explícito, nunca éxito silencioso, y un
5xx no se degrada a «rechazado» (que invitaría a reintentar un envío que quizá sí ocurrió).

---

## 4. Paso 2 — el canal no crea autoridad propia

`whatsapp-outbound.ts` no envía por su cuenta: exige borrador revisado con `revision` sha256,
`identity` con scope de tenant activo, conexión habilitada con la misma `generation`, destinatario en
la lista del piloto y canal de inbox coincidente (`assertReplyChannel`). El envío se registra con
`insertIfAbsent` antes de despachar y se resuelve con `compareAndSwap` sobre `{status:"dispatching",
attemptId}`; si el CAS falla, la respuesta es «requiere reconciliación; no reintentes». La
reconciliación es humana (`providerChecked: true`, `evidenceRef`) y no vuelve a despachar.

---

## 5. Paso 4 — idempotencia

- **Entrada:** el inbox guarda `providerMessageId` del proveedor junto a `tenantId`/`owner`; la clave
  no se deriva de un timestamp local.
- **Salida:** la identidad de la operación es el `draftId` + `revision` + `attemptId`, y el replay
  devuelve la operación existente en lugar de reenviar.
- **Límite real y declarado:** WhatsApp Cloud API **no acepta clave de idempotencia del cliente**. Por
  eso el adaptador documenta que 408/429/5xx dejan el envío en `outcome_unknown` y prohíbe el
  reintento ciego. El `providerId` solo se conoce cuando Meta confirma con `messages[0].id`.

---

## 6. Paso 5 — sondas en vivo

**No ejecutadas.** No hay autorización del operador para contactar Meta, Google, Vapi ni Resend en
este turno. Todos los adaptadores siguen `LIVE_UNVERIFIED`; ninguna afirmación de este informe dice
«integrado con Meta» en el sentido de haber llamado a la API real.

---

## 7. Lo que este turno NO demuestra

- **Ninguna llamada real** a Meta, Google, Vapi o Resend: `LIVE_UNVERIFIED`.
- **No hay prueba de entrega física** de un mensaje, ni de audio, ni de correo.
- **Gate integral no ejecutado**; el ledger de Trans03 no se toca (48 bloques en `PENDING`).
- **`07-owner-real`** sigue `NOT_RUN`.
- La firma de webhook entrante se prueba en las suites existentes de WhatsApp, no aquí.

---

## 8. Handoff

- **A Trans00:** los nombres canónicos de conexión siguen siendo los del registro
  (`WHATSAPP_TOKEN`, `WHATSAPP_PHONE_ID`, `VAPI_*`, `RESEND_API_KEY`, `GEMINI_API_KEY`), sin valores.
- **A Trans04:** cada fallo de proveedor deja un código estable (`JEV_HTTP_*`, `PROVIDER_ERROR`,
  `provider_outcome_unknown`) que puede alimentar métricas sin exponer secretos.
- **A Trans07:** queda pendiente una sonda de **lectura** autorizada por proveedor; sin ella, el
  estado máximo es `LIVE_UNVERIFIED`.
