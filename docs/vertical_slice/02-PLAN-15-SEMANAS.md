# 02 — Plan de 15 semanas

> Plan de ejecución del vertical slice. Cada bloque tiene criterio de cierre verificable. No se avanza al siguiente hasta que el anterior está verde.

## Calendario

| Semana | Bloque | Qué consigues |
|---|---|---|
| 1–3 | 0 | Motor fiable, CI bloqueante, smoke verde |
| 4 | 1 | Bundle + bootstrap + template |
| 5 | 2 | Workspace Leads |
| 6–7 | 3 | WhatsApp real + teléfono + email + Drive |
| 8 | 4 | SOP responder_lead |
| 9 | 5 | UI mínima |
| 10–11 | 6 | Piloto real con datos reales |
| 12–13 | 7 | Segundo cliente |
| 14–15 | 8 | Facturación + docs comerciales |

---

## Bloque 0 — Deuda de producción (semanas 1–3)

**Objetivo**: motor fiable, CI bloqueante, smoke tests. Sin esto, el piloto se cae.

| # | Qué | Ficheros | Criterio |
|---|---|---|---|
| 0.1 | Resolver `worker.ts` (commit o revert) | `apps/server/src/engine/worker.ts` | `git status` limpio o commit justificado |
| 0.2 | CI bloqueante: quitar `continue-on-error` del worker, `pnpm test` con glob, `audit:coherence` bloqueante | `.github/workflows/ci.yml`, `package.json` | PR con test roto no mergea |
| 0.3 | Smoke de arranque | `scripts/smoke-startup.ts` | Verde en local y CI |
| 0.4 | 5 deudas de runtime (FIX 05, 12, 48, 50, 53) | `conversation.ts`, `model.ts`, `capability-runner.ts`, `executor.ts`, `worker.ts` | Typecheck + tests verdes |
| 0.5 | Tests de aislamiento (workers, eventos, RAG, memoria, cachés) | `tests/tenant-isolation-extended.test.ts` | 2 tenants concurrentes, 0 fugas |

**Cierre**: typecheck verde + tests verdes + smoke verde + CI bloquea.

---

## Bloque 1 — Bundle del tenant (semana 4)

**Objetivo**: cada cliente es un bundle. Tú lo compilas con 1 comando.

| # | Qué | Ficheros |
|---|---|---|
| 1.1 | Schema `TenantBundle` (company, agents, processes, capabilities, config, channels) | `packages/domain/src/tenant-bundle.ts` |
| 1.2 | `validateBundle(clientDir)` + `compileBundle(clientDir)` | `apps/server/src/engine/compiler/validate-bundle.ts`, `compile-bundle.ts` |
| 1.3 | `bootstrapTenant(db, config, bundle)` | `apps/server/src/engine/compiler/bootstrap-tenant.ts` |
| 1.4 | Cablear `bootstrapTenant` en `app.ts` o `provision-client.ts` | `apps/server/src/app.ts` |
| 1.5 | `clientes/_template/bundle.json` con placeholders | `clientes/_template/` |
| 1.6 | `scripts/provision-client.ts --from-template --tenant <nuevo> --google-email <email>` | `scripts/provision-client.ts` |

**Cierre**: `provision-client --from-template _template --tenant piloto` crea `clientes/piloto/`, valida, bootstrappea. 1 comando.

---

## Bloque 2 — Workspace Leads (semana 5)

**Objetivo**: CRM mínimo. El LLM usa `lead.*` como tools. El humano ve tabla + detalle.

| # | Qué | Ficheros |
|---|---|---|
| 2.1 | Entidades: `Lead`, `Contact`, `Company`, `Opportunity`, `Appointment` | `packages/workspaces/src/leads/src/domain/entities.ts` |
| 2.2 | Queries: `list_leads`, `get_lead`, `search_leads`, `list_appointments` | `.../application/queries.ts` |
| 2.3 | Commands: `create_lead`, `update_lead_status`, `create_appointment`, `update_appointment` | `.../application/commands.ts` |
| 2.4 | Capabilities: `lead.create`, `lead.update`, `lead.search`, `appointment.create` | `.../application/capabilities.ts` |
| 2.5 | Views: `leads_table`, `lead_detail`, `appointments_calendar` | `.../application/views.ts` |
| 2.6 | `workspace.json` + `index.ts` + registrar en `WorkspaceModuleRegistry` | `packages/workspaces/src/leads/` |

**Cierre**: el LLM puede `lead.create`, `lead.search`, `appointment.create`. El humano ve `leads_table` y `appointments_calendar`.

---

## Bloque 3 — Canales: WhatsApp real + teléfono + email + Drive (semanas 6–7)

| # | Qué | Ficheros |
|---|---|---|
| 3.1 | WhatsApp Cloud API real | `packages/integrations/src/whatsapp/cloud.ts` |
| 3.2 | Webhook WhatsApp → `createTask` con SOP `responder_lead` | `apps/server/src/whatsapp-routes.ts` |
| 3.3 | Teléfono: Twilio Voice + Whisper + TTS | `packages/integrations/src/telephony/twilio.ts` |
| 3.4 | Endpoint `/api/telephony/incoming` | `apps/server/src/telephony-routes.ts` |
| 3.5 | Email: `prepare_email` real | `apps/server/src/actions.ts` |
| 3.6 | Drive: `query_business` con `source: "sheets"` | `apps/server/src/engine/business.ts` |

**Cierre**: WhatsApp responde < 5s. Teléfono recibe, transcribe, responde por voz. Email se envía por Gmail real. Drive lee y busca. Sheets lee y escribe como CRM.

---

## Bloque 4 — SOP responder_lead (semana 8)

| # | Qué | Ficheros |
|---|---|---|
| 4.1 | `clientes/_template/sops/responder-lead.json`: 8 pasos | `clientes/_template/sops/` |
| 4.2 | Paso 1: recibir mensaje (WhatsApp/email/teléfono) | — |
| 4.3 | Paso 2: buscar lead existente → `lead.search` | — |
| 4.4 | Paso 3: si no existe, crear → `lead.create` | — |
| 4.5 | Paso 4: cualificar → `ask_user` | — |
| 4.6 | Paso 5: si pide cita, agendar → `appointment.create` + `prepare_event` | — |
| 4.7 | Paso 6: responder → `prepare_whatsapp` / `prepare_email` / TTS | — |
| 4.8 | Paso 7: briefing interno → `create_briefing` | — |
| 4.9 | Paso 8: actualizar lead status → `lead.update` | — |

**Cierre**: lead de prueba entra por WhatsApp → lead creado → cita agendada → email enviado → briefing creado. E2E verde.

---

## Bloque 5 — UI mínima (semana 9)

| # | Qué | Ficheros |
|---|---|---|
| 5.1 | Pantalla "Leads" | `apps/web/src/workspaces/leads/LeadsWorkspace.tsx` |
| 5.2 | Pantalla "Citas" | `apps/web/src/workspaces/leads/AppointmentsWorkspace.tsx` |
| 5.3 | Pantalla "Conversaciones" | `apps/web/src/components/ConversationsView.tsx` |
| 5.4 | Pantalla "Procesos" | `apps/web/src/components/ProcessesView.tsx` |

**Cierre**: el piloto puede ver leads, citas, conversaciones y ejecutar el SOP sin tocar código.

---

## Bloque 6 — Piloto real (semanas 10–11)

| # | Qué |
|---|---|
| 6.1 | `provision-client --from-template _template --tenant piloto` |
| 6.2 | Conectar credenciales reales del piloto (WhatsApp, Google, Twilio) |
| 6.3 | Cargar data del piloto en Drive + Sheets |
| 6.4 | El piloto usa el sistema 1 semana con leads reales |
| 6.5 | Medir: leads capturados, citas agendadas, tiempo de respuesta, coste, tiempo ahorrado |
| 6.6 | `docs/operacion/PILOTO-<cliente>.md` con métricas |

**Cierre**: el piloto renueva o paga la siguiente fase. Si no, el producto no vale.

---

## Bloque 7 — Segundo cliente (semanas 12–13)

| # | Qué |
|---|---|
| 7.1 | `provision-client --from-template _template --tenant cliente2` |
| 7.2 | Conectar credenciales del cliente 2 |
| 7.3 | El cliente 2 usa el sistema 1 semana |
| 7.4 | Medir cuánto tardas en onboardear. Si < 3 días, el template funciona. |
| 7.5 | Corregir lo que el cliente 2 rompa. Añadir test. |

**Cierre**: 2 clientes operativos, template replicable.

---

## Bloque 8 — Facturación y venta (semanas 14–15)

| # | Qué |
|---|---|
| 8.1 | Stripe real: suscripciones, cuotas, control de coste por tenant |
| 8.2 | `docs/operacion/OFERTA.md`: qué vendes, a quién, por cuánto |
| 8.3 | `docs/operacion/ONBOARDING-CLIENTE.md`: pasos para onboardear |
| 8.4 | `docs/operacion/ACEPTACION.md`: criterios de aceptación por cliente |
| 8.5 | Caso de uso del piloto con métricas reales |

**Cierre**: 2 clientes pagando, facturación real, documentación comercial.