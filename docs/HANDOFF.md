# OpenMuse — Estado del proyecto y guía de continuación

> Este documento existe para sobrevivir a cambios de chat, de agente o de dev.
> Cualquiera (humano o IA) que lea esto debería poder continuar el trabajo sin contexto previo.

Última actualización: 27 de septiembre de 2026.
Rama activa de trabajo: `feat/connect-backend` (mergeada a `main`).
Estado: **beta interna funcional. Frontend rediseñado a nivel pro. Pendiente: multi-usuario y RAG para vender.**

---

## 1. Qué es OpenMuse

Runtime de agentes durables alrededor de **Tasks → SOPs → Skills → Tools → Validation → Learning**.

En la practica: **un ChatGPT que sabe cosas de tu empresa y hace cosas de verdad**.

Piensa en: ChatGPT + CRM + SOPs + kanban + memoria de empresa + agentes a medida, todo en una interfaz que un empleado ya sabe usar porque se parece a GPT.

Componentes del motor:

- Persistencia durable (CAS + leases + checkpoints). Sobrevive a reinicios.
- Aprobaciones humanas obligatorias antes de acciones externas (emails, calendario).
- Sandbox Docker aislado para codigo no confiable (opcional, ver section 4).
- SOPs declarativos (JSON) que se ejecutan paso a paso con recuperacion.
- Skills Python dentro del sandbox.
- Chat con LLM conectado a datos reales del cliente.
- Memoria persistente + artifacts.
- Kanban durable con estados (queued, running, waiting_approval, waiting_input, succeeded, failed, cancelled).

## 2. Modelo de negocio

- **Un deployment por cliente.** Sin multitenancy. Un cliente = un repo clonado + un servidor.
- **Multiples usuarios dentro de un mismo deployment** (mismo cliente). Cada usuario ve solo sus tareas.
- **Setup:** 1000-3000 EUR por compilar la empresa (SOPs, skills, datos, docs, canales).
- **Recurrente:** 200-400 EUR/mes por mantenimiento.
- **Cliente objetivo:** PYME o agencia pequena (5-50 personas).
- **Propuesta:** "tu propio ChatGPT que sabe cosas de tu empresa y hace cosas".
- **Diferenciacion:** soportamos SOPs deterministas con aprobaciones + memoria de empresa + tareas durables. No es otro wrapper de ChatGPT.

## 3. Estado actual (27 sep 2026)

### Lo que YA funciona

**Backend:**
- Motor durable completo (checkpoints, leases, resumes).
- 12 SOPs de agencia en `sops-examples/agency/`.
- 6 skills Python en `apps/computer/workspace-template/skills/`: factura, propuesta, audit-web, gmb-post-prepare, social-post-prepare, whatsapp-reply-prepare.
- Trigger types reales: `manual`, `api`, `cron`, `email_subject`.
- Chat LLM via SSE en `/api/copilotkit/run` (bug del parser SSE resuelto por Cline).
- Google OAuth (Gmail, Calendar, Drive).
- Sandbox Docker verificado (files.py con validaciones de path, symlinks, tamano).
- Suite de tests: 137 pass, 0 fail, 1 skip en Windows por shebang.
- `POST /api/files` acepta PDF, imagenes, texto, Office, zip. Guarda con extension `.bin` y MIME correcto.
- `GET /api/files/:id/content` sirve con el Content-Type real.

**Frontend (`apps/web/`):**
- Vite + React + TypeScript. Sin Tailwind. Sin router. Lucide React para iconos.
- Layout de 3 columnas: sidebar, chat, panel derecho.
- Dark mode real con persistencia en `localStorage` (`data-theme` en `<html>`).
- Chat con streaming SSE, tool calls visibles, cancelacion.
- Kanban con 4 columnas (Por hacer / En curso / Necesita tu accion / Completado).
- Modal de detalle de tarea: plan, eventos, artifacts, controles (pausar, reanudar, cancelar, reintentar, responder).
- Modal de aprobacion: aprobar/denegar acciones propuestas.
- Adjuntos: subida real al backend, chip con spinner/check/error.
- Composer tipo ChatGPT: textarea autoexpandible, boton adjuntar, boton voz (SpeechRecognition del navegador), boton enviar/parar.
- Sidebar con vistas: Chat / Tareas / Documentos / Memoria.
- Panel derecho con tabs: Tareas / Contexto / Memoria.

### Lo que es stub honesto (visual, sin backend)

Aparecen en la UI pero no hacen nada todavia. Marcados con disabled o sin accion:

- **Nuevo chat** y boton `+` de conversaciones -> requiere multi-thread (no implementado).
- **Buscar** -> requiere indice de busqueda.
- **Agentes** y **Configuracion** en el nav -> deshabilitados con tooltip.
- **Selector de modelo** en el header -> no existe. Se muestra el real del `.env`.
- **Boton mas opciones** (3 puntos del chat) -> sin accion.
- **User menu** (avatar) -> solo hace logout, no hay dropdown de settings.
- **Environment pill** (LIVE) -> informativo, no clickable.

### Lo que esta a medias

- **Multi-usuario dentro del tenant**: hoy es un solo owner (`local-user` hardcodeado).
- **Multi-thread de conversaciones**: hoy es un solo thread (`/api/main-thread`).
- **Memoria taxonomizada**: hoy es una lista plana. Falta categorizar (empresa, cliente, proceso, preferencia).
- **RAG de documentos**: el LLM no puede leer PDFs/DOCX/XLSX subidos. Falta pgvector + embeddings.
- **Asignacion de tareas a personas**: hoy todas las tareas son del owner.
- **`provision-client.ts`**: el setup de un cliente hoy es manual.
- **Backups automaticos**: no hay. La DB PGlite y los archivos se pueden perder.
- **WhatsApp via Evolution API**: pendiente. Requiere Docker local.

## 4. Decisiones arquitectonicas tomadas

### D1 — Eliminado CopilotKit Intelligence
Razon: no se paga la plataforma. `richThreads: false` en workspace.

### D2 — SOPs anidados deshabilitados
Razon: `run_sop` fuera del enum de tools. El campo `sopStack` existe pero no crece. Reservado para futuro.

### D3 — `query_business` read-only
Razon: bloqueo de comentarios SQL, comillas impares y keywords peligrosas.
Para defensa real, usar un rol Postgres con `GRANT SELECT` (configuracion externa).

### D4 — Sin multitenancy
Razon: un deployment por cliente es la ventaja competitiva. Cada cliente = repo + servidor.
Multi-usuario dentro de una misma empresa, si.

### D5 — Sandbox sin red
Razon: seguridad > comodidad. Los skills no descargan paquetes.
Wheels offline en `apps/computer/wheels/`.

### D6 — Deploy pospuesto
No desplegar hasta que este listo para prod. Durante desarrollo, localhost + proxy de Vite.
Plan cuando toque: backend en Fly.io (free tier, 3 GB persistente), frontend en Cloudflare Pages (free, sin tarjeta).
El backend NO puede ir en Vercel (necesita procesos persistentes, SSE, PGlite en disco).

### D7 — Frontend sin dependencias innecesarias
Solo React, React DOM, Vite, Lucide React. Sin Tailwind, sin router, sin state managers.
CSS plano con variables. Funciona bien y es mantenible.

### D8 — Access key hardcodeada en frontend (temporal)
`HARDCODED_ACCESS_KEY` en `apps/web/src/hooks/useAuth.ts`. Aceptable para demo privada.
ANTES de venderlo: login real por usuario (ver pendientes).

## 5. Como arrancarlo en dev

Requisitos:
- Node 22+ (con corepack)
- pnpm 11+
- Docker Desktop (solo para skills con `computer_command`)

Pasos:
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

5. Poblar datos (una sola vez, en terminal C):
   ```
   pnpm exec tsx scripts/seed-agency.ts
   $env:OPENMUSE_ACCESS_KEY = "<tu key>"
   pnpm exec tsx scripts/seed-sops-agency.ts
   ```

6. Abrir `http://localhost:5173`. Auto-login entra directo.

IMPORTANTE: nunca pulsar Ctrl+C en las terminales A y B sin esperar al prompt. PGlite necesita cerrar limpio.
Si Windows pregunta "Desea terminar el trabajo por lotes (S/N)", responder N.
Si el backend crashea con `RuntimeError: Aborted()`, es PGlite corrupto. Renombrar `.openmuse/postgres` y re-sembrar.

## 6. Como continuar en un chat nuevo

1. Pega este fichero entero (`docs/HANDOFF.md`).
2. Di que punto del apartado 9 (pendientes) quieres atacar.
3. Pega solo los ficheros que se van a tocar.
4. No pegues todo el repo. Solo lo que se va a tocar.

## 7. Ficheros clave

### Dominio
- `packages/domain/src/agent.ts` — tipos AgentTask, Goal, Monitor, etc.
- `packages/domain/src/sop.ts` — schema de SOPs.
- `packages/domain/src/index.ts` — tipos Workspace, Action, Mail, CalendarEvent.

### Server
- `apps/server/src/app.ts` — bootstrap Hono, rutas, static serving.
- `apps/server/src/config.ts` — variables de entorno.
- `apps/server/src/db.ts` — Store con PGlite/Postgres.
- `apps/server/src/files.ts` — gestion de archivos (PDF, imagenes, docs, zip).
- `apps/server/src/engine/service.ts` — AgentService, orquesta todo.
- `apps/server/src/engine/sop-executor.ts` — ejecuta SOPs paso a paso.
- `apps/server/src/engine/worker.ts` — worker durable con leases.
- `apps/server/src/engine/sop-triggers.ts` — cron + email_subject triggers.
- `apps/server/src/engine/model.ts` — task abierta con LLM.
- `apps/server/src/engine/conversation.ts` — chat con LLM.
- `apps/server/src/actions.ts` — aprobaciones con idempotencia.
- `apps/server/src/workspace.ts` — integracion Google.

### Frontend (`apps/web/src/`)
- `App.tsx` — composicion principal, theme, view switching.
- `api/*.ts` — capa de datos contra la API (client, session, chat, conversation, tasks, actions, files).
- `hooks/useAuth.ts` — auth con auto-login y access key hardcodeada.
- `hooks/useChat.ts` — chat con SSE y adjuntos.
- `hooks/useTasks.ts` — polling de tareas + worker status.
- `hooks/useWorkspaceData.ts` — memories y files.
- `components/Header.tsx` — barra superior con worker chip, theme toggle, user menu.
- `components/ConversationsPanel.tsx` — sidebar con nav y conversaciones.
- `components/ChatPanel.tsx`, `ChatInput.tsx`, `MessageList.tsx`, `MessageBubble.tsx`, `ToolCallCard.tsx` — chat.
- `components/KanbanPanel.tsx`, `TaskCard.tsx` — kanban del panel derecho.
- `components/TasksView.tsx`, `DocumentsView.tsx`, `MemoryView.tsx` — vistas a pantalla completa.
- `components/TaskDetailModal.tsx`, `ApprovalModal.tsx` — modales.
- `index.css` — todo el CSS (design system con variables, dark mode).

### Datos y contenido
- `sops-examples/agency/*.json` — 12 SOPs.
- `apps/computer/workspace-template/skills/*` — 9 skills (3 originales + 6 nuevos).
- `scripts/seed-agency.ts`, `scripts/seed-sops-agency.ts` — scripts de seed.
- `apps/computer/wheels/` — wheels offline para pip.

### Docs
- `README.md` — general.
- `BETA.md` — limites de la beta.
- `SECURITY.md` — modelo de amenaza.
- `ROADMAP.md` — features futuras.
- `docs/COMPUTER.md` — sandbox Docker.
- `docs/HANDOFF.md` — este fichero.

## 8. Comandos utiles

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

## 9. Pendientes para produccion

Ordenado por lo que mas se usa y lo que mas valor anade.

### Bloqueantes antes de vender al primer cliente

1. **Multi-usuario dentro del tenant** (1 dia)
   - Tabla de usuarios con email + password hash + rol (admin/user).
   - Login real (email + contrasena, no access key compartida).
   - Reemplazar `local-user` por el userId real en todo el backend.
   - Cada usuario ve solo sus tareas, memorias, conversaciones.
   - Admin puede crear/desactivar usuarios.
   - Setup por usuario: que SOPs ve, que memorias iniciales tiene.
   - Pantalla de Login en el frontend.
   - Pantalla de Admin Usuarios (solo admin).

2. **Memoria taxonomizada** (1 dia)
   - Categorizar memorias: empresa, cliente, proceso, preferencia, RRHH, producto.
   - Tags + filtros.
   - Permisos por rol (RRHH solo admin).
   - Vista de memoria con filtros.

3. **Asignacion de tareas a personas** (medio dia)
   - Campo `assignedTo` en AgentTask.
   - Vista "mis tareas" en el kanban.
   - Filtro por persona.

4. **`provision-client.ts`** (1 dia)
   - Comando `pnpm provision-client empresa-x` que lee un directorio con docs, SOPs, datos y crea todo.
   - Format del directorio: `client/empresa-x/` con `sops/`, `skills/`, `docs/`, `users.json`.

5. **Backups automaticos** (medio dia)
   - `pg_dump` diario de PGlite.
   - Copia a S3 o Backblaze.
   - Script de restore probado.

### Alto valor (segundo o tercer cliente)

6. **RAG de documentos** (1-2 dias)
   - pgvector en PGlite.
   - Ingesta: PDF, DOCX, XLSX -> chunks -> embeddings.
   - Retrieval integrado en el prompt del LLM.
   - Sin esto, "ChatGPT de tu empresa" no se sostiene.

7. **Multi-thread de conversaciones** (1 dia)
   - Tabla `threads` por owner.
   - Endpoints `/api/threads` (list, create, delete).
   - Sidebar lista threads y permite cambiar.
   - Boton "Nuevo chat" funcional.

8. **WhatsApp via Evolution API** (1 dia)
   - Requiere Docker local para Evolution API.
   - Webhook receptor.
   - Tool `prepare_whatsapp`.
   - SOP `responder-whatsapp` con envio real.

### Admin y operacion (para ti)

9. **Panel de admin** (1 dia)
   - Ver todos los clientes que gestionas.
   - Estado de cada deployment.
   - Uso, errores, coste del LLM.
   - Anadir/quitar usuarios.

10. **Analytics por cliente** (medio dia)
    - Cuantos mensajes, cuantas tareas, que usa mas.
    - Cost tracking del LLM por cliente.

11. **Billing** (1 dia)
    - Como le cobras la cuota mensual.
    - Stripe o similar.

### Mejoras de UI/UX

12. **RAG en el composer**: al adjuntar un PDF, poder decir "busca en mis documentos X".
13. **Vista de conversaciones por usuario**: cada uno ve solo las suyas.
14. **Notificaciones en vivo** (badge en el header cuando llega una tarea).
15. **Atajos de teclado**: Cmd+K para buscar, Cmd+N para nuevo chat.
16. **Microinteracciones**: animacion de las task cards al cambiar de estado.

## 10. Lo que NO hacer

- **No multitenancy** (un solo deployment por cliente).
- **No Tailwind** (mantener CSS plano con variables).
- **No MUI/Ant/Chakra** (Lucide es suficiente).
- **No router** (React Router no es necesario).
- **No state manager global** (Redux, Zustand). Context + useState basta.
- **No Kubernetes/Helm** (Docker Compose en un VPS basta).
- **No refactor del sandbox Docker** (esta bien como esta).
- **No tocar el browser worker** (funciona).
- **No cablear features al backend sin un cliente que las pida**.

## 11. Preguntas frecuentes

**Puedo desplegar en Vercel?**
El frontend si. El backend no: necesita procesos persistentes (SSE + worker), Docker para el sandbox, y PGlite en disco. Backend va en Fly.io, Render, Hetzner+Coolify o similar.

**Como se anade un SOP nuevo?**
Se escribe un JSON con el schema `sopSchema` y se POSTea a `/api/sops`. No toca codigo.

**Como se anade un skill nuevo?**
1) `main.py` + `SKILL.md` en `apps/computer/workspace-template/skills/<id>/`.
2) Rebuild de la imagen Docker.
3) `POST /api/skills` con la metadata.

**Cuantos SOPs puedo tener?**
Sin limite. Cada SOP tiene maximo 12 pasos.

**Como se anaden canales (WhatsApp, Slack, voz)?**
Conviene primero abstraer `Channel`. Sin abstraccion, cada canal es un modulo ad-hoc. Con abstraccion, cada canal son ~100 lineas.

**Como se hace RAG?**
PGlite soporta pgvector. Pendiente de implementar.

**Por que no multitenancy?**
Porque el modelo es un deployment por cliente. Sin RBAC fino, sin K8s, sin SOC2. Cada cliente tiene su servidor. Multi-usuario dentro de un cliente, si.

**Los archivos se pierden al reiniciar?**
En local, no: estan en `.openmuse/files/`. En deploy, depende del hosting. Fly.io con volumen persistente si. Render free no.

## 12. Ultima sesion

27 septiembre 2026.

Se completo:
- Bug del parser SSE resuelto por Cline (el bug que causaba "respuesta vacia").
- Rediseno completo del frontend: sidebar, dark mode, Lucide icons, panel derecho con tabs, composer tipo ChatGPT.
- Refactor a componentes reutilizables en `apps/web/src/components/` y `hooks/`.
- Adjuntos multi-formato: `POST /api/files` acepta PDF, imagenes, texto, Office, zip.
- Vistas de sidebar: Chat, Tareas, Documentos, Memoria.
- Renombrado de `.openmuse/postgres` corrupto y re-seed (dos veces por cierres sucios de PGlite).
- Documentacion actualizada.

Decisiones tomadas:
- Deploy pospuesto hasta que este listo para prod (D6).
- Multi-usuario dentro del tenant es la siguiente fase critica.
- Memoria taxonomizada es la siguiente despues de multi-usuario.
- Backend en Fly.io + frontend en Cloudflare Pages cuando toque.

---

Fin del handoff. Si algo de este documento esta desactualizado cuando lo leas, actualizalo antes de continuar.
