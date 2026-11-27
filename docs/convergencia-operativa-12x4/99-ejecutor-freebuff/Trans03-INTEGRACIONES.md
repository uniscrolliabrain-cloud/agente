# Trans03 — Integraciones: Meta WhatsApp, Google, voz y caché

**Rol:** agente de integraciones. Conecta canales y proveedores sin crear una vía de autoridad
paralela.
**Base:** `origin/integration/trans00-core` @ `892061c9`.
**Protocolo:** [`00-PROTOCOLO-GENERAL.md`](00-PROTOCOLO-GENERAL.md).

---

## 1. Misión

Que un mensaje que entra por WhatsApp, un permiso de Google o una llamada de voz se conviertan en
**operaciones tipadas dentro del circuito gobernado**, y que un fallo de proveedor se manifieste como
error explícito, nunca como éxito silencioso.

Regla de la casa: un adaptador **traduce**; no decide, no reintenta por su cuenta y no ejecuta efectos
sin kernel.

---

## 2. Estado forense verificado (`892061c9`)

| Requisito | Rutas / evidencia | Verificación | Estado |
|---|---|---|---|
| Adaptador Meta WhatsApp | `packages/integrations/src/meta-whatsapp.ts` | consumido por `apps/server/src/engine/whatsapp-outbound.ts`; 8 tests PASS en 4 suites | `INTEGRATED` + `IMPLEMENTED_TESTED` |
| Stub WhatsApp | `packages/integrations/src/stubs/whatsapp.ts` | ejercido por tests | `IMPLEMENTED_TESTED` |
| Salida WhatsApp gobernada | `apps/server/src/engine/whatsapp-outbound.ts` | PASS | `INTEGRATED` |
| Google auth / binding | `apps/server/src/google-auth.ts`, `tests/trans03-google-binding.test.ts` | PASS | `INTEGRATED` + `IMPLEMENTED_TESTED` |
| Composición Gmail | `INFORME-GMAIL-COMPOSICION.md`, `EVIDENCIA-GMAIL-COMPOSICION.json` | documentada y probada con fixtures | `IMPLEMENTED_TESTED`; envío real `LIVE_UNVERIFIED` |
| Voz | `tests/trans03-voice-binding.test.ts` | PASS | `IMPLEMENTED_TESTED`; audio físico `LIVE_UNVERIFIED` |
| Caché de workspace | `tests/trans03-workspace-cache.test.ts` | PASS | `IMPLEMENTED_TESTED` |
| Validación de proveedor | `tests/trans03-provider-validation.test.ts` | PASS | `IMPLEMENTED_TESTED` |

Total focal reproducido: **4 suites, 8 tests, 8 PASS, 0 FAIL, 0 SKIP**.

**Nada de esto está verificado en vivo.** `.env.example` documenta `WHATSAPP_*`, `RESEND_API_KEY`,
`VAPI_*`, `GEMINI_API_KEY` sin valores. La ausencia de credenciales no invalida el código, pero
prohíbe escribir "integrado con Meta" como si hubiera habido una llamada real.

---

## 3. Alcance propio

Sí:

- `packages/integrations/src/**` (adaptadores y stubs);
- `apps/server/src/engine/whatsapp-outbound.ts`, `apps/server/src/google-auth.ts`;
- contratos de entrada/salida de canal y su mapeo a operaciones;
- `tests/trans03-*.test.ts`;
- documentación de composición y mapeo de conectores.

No:

- kernel y autorización (Trans01): el adaptador no decide;
- métricas y alertas (Trans04), aunque emita eventos;
- preflight de secretos y provisión (Trans04);
- registro de conexiones y readiness (Trans00, trasplante de `infra`).

---

## 4. Los 48 bloques vistos desde integraciones

| Fase | Bloques | Foco esperado |
|---|---|---|
| `01-consolidacion` | `01.01`–`01.04` | contrato de adaptador: entrada tipada, salida tipada, error explícito |
| `02-observabilidad` | `02.01`–`02.04` | cada llamada deja traza con proveedor, operación y resultado |
| `03-proveedores` | `03.01`–`03.04` | registro de conectores, nombres canónicos, config requerida |
| `04-whatsapp` | `04.01`–`04.04` | inbound/outbound, idempotencia por mensaje, ventana de servicio |
| `05-google` | `05.01`–`05.04` | OAuth, scopes mínimos, refresh, revocación |
| `06-data-sintetica` | `06.01`–`06.04` | fixtures de payloads reales (sin datos personales) |
| `07-owner-real` | `07.01`–`07.04` | sonda autorizada de lectura; nunca envío masivo |
| `08-ciberseguridad` | `08.01`–`08.04` | verificación de firma/token, replay, rate limit |
| `09-observabilidad-v2` | `09.01`–`09.04` | latencia y errores por proveedor, sin secretos |
| `10-gestoria` | `10.01`–`10.04` | caso completo: mensaje → operación → respuesta |
| `11-recompilacion` | `11.01`–`11.04` | build del paquete de integraciones |
| `12-validacion` | `12.01`–`12.04` | contrato + pruebas de fallo (timeout, 401, 429, 5xx) |

---

## 5. Plan de ejecución

### Paso 1 — Mapear adaptador → consumidor

```bash
grep -rn "meta-whatsapp\|whatsapp-outbound\|google-auth" apps/server/src packages --include=*.ts | grep -v test
```

Cada adaptador debe tener un consumidor real. Si solo lo usa su test, el estado es `UNMOUNTED`.

### Paso 2 — Verificar que el canal no crea autoridad

Pregunta obligatoria: ¿el mensaje entrante se convierte en **propuesta/operación** que el kernel
autoriza, o el adaptador ejecuta directamente? Si ejecuta, es un bypass y hay que corregirlo.

### Paso 3 — Probar los caminos de fallo

Un adaptador solo está probado si se probaron: timeout, 401/403, 429 con `Retry-After`, 5xx,
respuesta ambigua y reintento idempotente. Registrar qué hace cada caso.

### Paso 4 — Idempotencia de mensajes

WhatsApp reintenta entregas. La clave de idempotencia debe derivarse del identificador del mensaje del
proveedor + tenant, no de un timestamp local.

### Paso 5 — Sondas en vivo (solo con autorización específica)

Si el operador autoriza una sonda de **lectura**:

- usar el binding de secretos; nunca imprimir el valor;
- registrar solo estado HTTP y código de error del proveedor;
- no enviar mensajes, no llamar teléfonos, no generar coste;
- documentar red / autenticación / permisos / configuración por separado si falla.

Sin autorización: `LIVE_UNVERIFIED` y a otra cosa.

### Paso 6 — Gate y ledger

Gate integral; actualizar solo bloques con evidencia. Hoy `0/48` DONE.

---

## 6. Tests obligatorios

| Conjunto | Archivos | Esperado |
|---|---|---|
| Google binding | `tests/trans03-google-binding.test.ts` | PASS |
| Validación de proveedor | `tests/trans03-provider-validation.test.ts` | PASS |
| Voz | `tests/trans03-voice-binding.test.ts` | PASS |
| Caché de workspace | `tests/trans03-workspace-cache.test.ts` | PASS |
| Fallos de transporte | añadir/verificar timeout, 401, 429, 5xx | PASS o deuda declarada |

---

## 7. Criterios de DONE

- [ ] Cada adaptador tiene consumidor real identificado.
- [ ] Ningún canal ejecuta efectos sin pasar por kernel.
- [ ] Idempotencia por identificador de proveedor + tenant.
- [ ] Caminos de fallo probados y documentados.
- [ ] Secretos nunca impresos; `.env.example` sin valores.
- [ ] Estado de proveedor declarado `LIVE_VERIFIED` o `LIVE_UNVERIFIED`, nunca "listo".
- [ ] Ledger actualizado con evidencia.

---

## 8. Riesgos específicos

| Riesgo | Señal | Mitigación |
|---|---|---|
| Canal con autoridad propia | outbound ejecuta sin receipt | revisar ruta y exigir kernel |
| Reintento duplica mensajes | dos envíos con mismo contenido | clave de idempotencia del proveedor |
| Scope de Google excesivo | scopes amplios "por comodidad" | mínimo privilegio y revisión |
| Firma no verificada | webhook acepta cualquier POST | verificación obligatoria, fail-closed |
| "Integrado" sin llamada real | docs con logo del proveedor | exigir sonda o declarar `LIVE_UNVERIFIED` |

---

## 9. Handoff

A Trans00: registro de conectores que debe alinear el trasplante de `infra` (nombres canónicos y
config requerida). A Trans04: eventos y errores por proveedor para métricas. A Trans07: qué sonda real
queda pendiente y con qué autorización.
