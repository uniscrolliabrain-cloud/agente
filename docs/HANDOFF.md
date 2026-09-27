# OpenMuse — Estado del proyecto y guía de continuación

> Este documento existe para sobrevivir a cambios de chat, de agente o de dev.
> Cualquiera (humano o IA) que lea esto debería poder continuar el trabajo sin contexto previo.

Última actualización: 26 de septiembre de 2026.
Rama activa: `main`.
Estado: **beta operativa en local. Chat con streaming verificado en navegador. Pendiente: RAG,
multi-hilo y deploy para vender.**

---

## 1. Qué es OpenMuse

Runtime de agentes durables alrededor de **Tasks → SOPs → Skills → Tools → Validation → Learning**.

Es un motor que ejecuta procesos de empresa con:

- Persistencia durable (CAS + leases + checkpoints).
- Aprobaciones humanas obligatorias antes de acciones externas.
- Sandbox Docker aislado para código no confiable.
- SOPs declarativos (JSON) que se ejecutan paso a paso.
- Skills Python que corren dentro del sandbox.
- Chat con LLM conectado a datos del cliente.

## 2. Modelo de negocio

- **Un deployment por cliente.** Sin multitenancy. Un cliente = un repo clonado + un VPS.
- **Setup:** 1000-3000 EUR por compilar la empresa (SOPs, skills, datos, docs, canales).
- **Recurrente:** 200-400 EUR/mes por mantenimiento.
- **Cliente objetivo:** PYME o agencia pequeña (5-50 personas).
- **Propuesta:** "tu propio ChatGPT que sabe cosas de tu empresa y hace cosas".

## 3. Estado actual

### Lo que YA funciona

- Motor durable completo (checkpoints, leases, resumes).
- 12 SOPs de agencia en `sops-examples/agency/`.
- 6 skills Python: factura, propuesta, audit-web, gmb-post-prepare, social-post-prepare, whatsapp-reply-prepare.
- Trigger types reales: manual, api, cron, email_subject.
- Chat LLM (`/api/copilotkit/run`) conectado a Gemini u OpenRouter, con streaming SSE verificado
  end-to-end en navegador real (`apps/worker/om-chat-acceptance.mjs`: Vite → backend → Gemini →
  DOM, con snapshots parciales de los deltas).
- Google OAuth (Gmail, Calendar, Drive).
- Sandbox Docker verificado (files.py con validaciones de path, symlinks, tamaño).
- Suite de tests verde (137 pass, 1 skip en Windows por shebang).
- Endpoint de business-records (seed directo a la DB).
- Scripts de seed: `scripts/seed-agency.ts`, `scripts/seed-sops-agency.ts`.
- **Frontend conectado de verdad**: `apps/web/src/components/*` (Header, ConversationsPanel,
  ChatPanel, KanbanPanel, TaskDetailModal, ApprovalModal) y hooks (`useAuth`, `useChat`,
  `useTasks`). El chat pinta los deltas del SSE en vivo.
- **Static serving**: `apps/server/src/app.ts` sirve `apps/web/dist` con `serveStatic` cuando el
  build existe (en dev sigue mandando Vite en el 5173).
- **Parser SSE del frontend arreglado**: `apps/web/src/api/chat.ts` buscaba el separador de eventos
  como la cadena literal `"\\n\\n"` (backslash + n), así que nunca partía los bloques, descartaba
  todos los eventos y el chat terminaba siempre en "(respuesta vacía)". Ahora parte por
  `/\r?\n\r?\n/` (acepta LF y CRLF).

### Lo que está a medias

- **Frontend web** (`apps/web/`): los componentes existen y el chat ya hace streaming; queda
  pulir multi-hilo real en `ConversationsPanel` (hoy son stubs en `App.tsx`), CSS del mockup
  completo y estados vacíos finos.
- **Persistencia PGlite en dev**: `tsx watch` mata el proceso en cada recarga y el data dir
  puede quedar corrupto (`RuntimeError: Aborted()`). Ver §11.

### Lo que FALTA para vender

1. **Frontend: multi-hilo real + CSS.** El chat ya funciona de punta a punta; quedan
   `ConversationsPanel` (hoy stubs en `App.tsx`), el CSS del mockup y los estados vacíos.
2. **RAG de documentos.** pgvector + ingesta PDF/DOCX + búsqueda semántica. Sin esto "ChatGPT de tu empresa" no se sostiene.
3. **WhatsApp vía Evolution API.** Webhook + envío. Número virtual o SIM prepago.
4. **`provision-client.ts`.** Comando que monta un cliente nuevo desde un directorio (`clientes/empresa-x/`).
5. **Google OAuth verificado E2E.** El código existe; falta probar el ciclo completo.
6. **Stubs TypeScript.** `gmb.ts`, `social.ts`, `stripe.ts`, `whatsapp.ts` (existen, revisar).
7. **Deploy.** Vercel (frontend) + Render o Hetzner+Coolify (backend).

## 4. Decisiones arquitectónicas tomadas

### D1 — Eliminado CopilotKit Intelligence
Razón: no se paga la plataforma. `richThreads: false` en workspace.

### D2 — SOPs anidados deshabilitados
Razón: `run_sop` fuera del enum de tools. El campo `sopStack` existe pero no crece. Reservado para futuro.

### D3 — `query_business` read-only
Razón: bloqueo de comentarios SQL, comillas impares y keywords peligrosas.
Para defensa real, usar un rol Postgres con `GRANT SELECT` (configuración externa).

### D4 — Sin multitenancy
Razón: un deployment por cliente es la ventaja competitiva. Cada cliente = repo + VPS.

### D5 — Sandbox sin red
Razón: seguridad > comodidad. Los skills no descargan paquetes.
Wheels offline en `apps/computer/wheels/`.

### D6 — Soporte `llm_generate` en SOPs (pendiente)
Razón: los SOPs deterministas son fiables pero no escriben texto único.
`llm_generate` combinará determinismo + LLM donde aporte.

## 5. Cómo arrancarlo (dev)

### Requisitos

- Node 22+ (con corepack)
- pnpm 11+
- Docker Desktop (para skills con `computer_command`)

### Pasos

1. Instalar: `corepack pnpm install --frozen-lockfile`

2. Configurar `.env` (copia de `.env.example`):
   - `WORKSPACE_MODE=live`
   - `OPENMUSE_ACCESS_KEY=<32+ chars>`
   - `TOKEN_ENCRYPTION_KEY=<32-byte base64>`
   - `GEMINI_API_KEY=<tu key>`
   - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (opcional)

3. Terminal A — backend: `pnpm dev`
   Esperado: `OpenMuse live API ready at http://127.0.0.1:8787`.

4. Terminal B — frontend: `pnpm --filter @openmuse/web dev`
   Esperado: `VITE ready at http://localhost:5173`.

5. Poblar datos (en terminal C):
   ```
   pnpm exec tsx scripts/seed-agency.ts
   $env:OPENMUSE_ACCESS_KEY = "<tu key>"
   pnpm exec tsx scripts/seed-sops-agency.ts
   ```

6. Registrar skills vía `POST /api/skills` (ver scripts o hacerlo a mano).

## 6. Cómo continuar en un chat nuevo

1. Pega este fichero entero (`docs/HANDOFF.md`).
2. Di qué punto de "Lo que FALTA" quieres atacar.
3. Si es frontend, pega el contenido de `apps/web/src/`.
4. Si es backend, pega el fichero relevante (`apps/server/src/...`).
5. No pegues todo el repo. Solo lo que se va a tocar.

## 7. Ficheros clave

### Dominio
- `packages/domain/src/agent.ts` — tipos AgentTask, Goal, Monitor, etc.
- `packages/domain/src/sop.ts` — schema de SOPs.
- `packages/domain/src/index.ts` — tipos Workspace, Action, Mail, CalendarEvent.

### Server
- `apps/server/src/app.ts` — bootstrap Hono, rutas, static serving.
- `apps/server/src/config.ts` — variables de entorno.
- `apps/server/src/db.ts` — Store con PGlite/Postgres.
- `apps/server/src/engine/service.ts` — AgentService, orquesta todo.
- `apps/server/src/engine/sop-executor.ts` — ejecuta SOPs paso a paso.
- `apps/server/src/engine/worker.ts` — worker durable con leases.
- `apps/server/src/engine/sop-triggers.ts` — cron + email_subject triggers.
- `apps/server/src/engine/model.ts` — task abierta con LLM.
- `apps/server/src/engine/conversation.ts` — chat con LLM.
- `apps/server/src/actions.ts` — aprobaciones con idempotencia.
- `apps/server/src/workspace.ts` — integración Google.

### Frontend (`apps/web/`)
- `src/api/*.ts` — capa de datos contra la API.
- `src/components/*` — Header, ConversationsPanel, ChatPanel, MessageList, ChatInput, KanbanPanel,
  TaskDetailModal, ApprovalModal.
- `src/hooks/*` — useAuth, useChat (streaming SSE), useTasks.

### Datos y contenido
- `sops-examples/agency/*.json` — 12 SOPs.
- `apps/computer/workspace-template/skills/*` — 9 skills (3 originales + 6 nuevos).
- `scripts/seed-*.ts` — scripts de seed.
- `apps/computer/wheels/` — wheels offline para pip.

### Docs
- `README.md` — general.
- `BETA.md` — límites de la beta.
- `SECURITY.md` — modelo de amenaza.
- `ROADMAP.md` — features futuras.
- `docs/COMPUTER.md` — sandbox Docker.
- `docs/HANDOFF.md` — **este fichero**.

## 8. Comandos útiles

```powershell
# Backend
pnpm dev
pnpm typecheck
pnpm test
pnpm build:server
docker build -t openmuse-computer:local apps/computer

# Frontend
pnpm --filter @openmuse/web dev
pnpm --filter @openmuse/web build
pnpm --filter @openmuse/web typecheck

# Aceptación del chat en navegador real (con backend 8787 y Vite 5173 arriba)
node apps/worker/om-chat-acceptance.mjs

# Seed
pnpm exec tsx scripts/seed-agency.ts
$env:OPENMUSE_ACCESS_KEY = "..."
pnpm exec tsx scripts/seed-sops-agency.ts

# Login + llamadas API
$accessKey = "..."
$s = Invoke-RestMethod -Method Post -Uri "http://localhost:8787/api/session" -ContentType "application/json" -Body (@{accessKey=$accessKey} | ConvertTo-Json)
$headers = @{Authorization="Bearer $($s.token)"; "Content-Type"="application/json"}
Invoke-RestMethod -Uri "http://localhost:8787/api/sops" -Headers $headers
```

## 9. Preguntas frecuentes

**¿Puedo desplegar en Vercel?**
El frontend sí (Vercel, gratis). El backend no: necesita procesos persistentes (SSE + worker), Docker y PGlite. Backend va en Hetzner + Coolify, Render o similar.

**¿Cómo se añade un SOP nuevo?**
Se escribe un JSON con el schema `sopSchema` y se POSTea a `/api/sops`. No toca código.

**¿Cómo se añade un skill nuevo?**
1) `main.py` + `SKILL.md` en `apps/computer/workspace-template/skills/<id>/`.
2) Rebuild de la imagen Docker.
3) `POST /api/skills` con la metadata.

**¿Cuántos SOPs puedo tener?**
Sin límite. Cada SOP tiene máximo 12 pasos.

**¿Cómo se añaden canales (WhatsApp, Slack, voz)?**
Conviene primero abstraer `Channel`. Sin abstracción, cada canal es un módulo ad-hoc. Con abstracción, cada canal son ~100 líneas.

**¿Cómo se hace RAG?**
PGlite soporta pgvector. Pendiente de implementar.

**¿Por qué no multitenancy?**
Porque el modelo es un deployment por cliente. Sin RBAC fino, sin K8s, sin SOC2. Cada cliente tiene su VPS.

**El chat responde 200 pero el mensaje se queda en "(respuesta vacía)".**
Revisa el parser SSE de `apps/web/src/api/chat.ts`: debe partir los bloques por salto de línea
real (`/\r?\n\r?\n/`). Si busca la secuencia escapada `"\\n\\n"` nunca encuentra separadores y
todos los eventos se descartan. `@copilotkit/runtime` envía LF.

**¿Por qué hay 401 en consola al cargar la app?**
`useChat` y `useTasks` lanzan su efecto de arranque en el primer render, en paralelo con el login
de `useAuth`, así que las primeras llamadas van sin token. Se recuperan solas, pero conviene
pasarles un flag `enabled` ligado a `auth.isAuthenticated`.

## 10. Última sesión — resumen

En la sesión de streaming del chat (26 septiembre 2026, tarde):

- Se detectó que `@copilotkit/runtime` 1.70 solo publica el run en
  `/api/copilotkit/agent/{agentId}/run`; `app.ts` reescribe `/api/copilotkit/run` a
  `/api/copilotkit/agent/default/run` reutilizando `c.req.raw` en un `Request` nuevo.
- Se añadió static serving de `apps/web/dist` (guardado por `existsSync`, así que el build debe
  existir antes de arrancar el backend para que `/` sirva `index.html`).
- PGlite quedó corrupto por un cierre sucio de `tsx watch` (`RuntimeError: Aborted()`); los data
  dirs corruptos se pusieron en cuarentena (no se borraron) y el store se recreó limpio.
- Se arregló el parser SSE del frontend (bug de `"\\n\\n"`; ver §9) y se verificó el streaming en
  navegador real con `apps/worker/om-chat-acceptance.mjs` (snapshots parciales + respuesta final
  completa, `RUN_FINISHED`, 0 errores de consola salvo los 401 del arranque y el 404 de
  `/favicon.ico`).

En la sesión de auditoría (26 septiembre 2026, mañana):

- Se arreglaron los 54 items de la auditoría inicial (Fases 0-4).
- Se añadió `SOP.trigger` real (cron/api/email_subject) en `sop-triggers.ts`.
- Se añadió `Skill.requirements` con pip offline en `sop-executor.ts`.
- Se crearon 12 SOPs de agencia en `sops-examples/agency/`.
- Se crearon 6 skills Python en `apps/computer/workspace-template/skills/`.
- Se creó la estructura del frontend en `apps/web/` con Vite + React + TS y la capa de API.
- Se documentó todo en este fichero.

---

Fin del handoff. Si algo de este documento está desactualizado cuando lo leas, actualízalo antes de continuar.
