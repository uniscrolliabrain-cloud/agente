# OpenMuse — TODO

> Verdad: este fichero + HANDOFF.md + el repo actualizado que el usuario mantiene.
> No hay comandos git ni suposiciones. Solo estado real y trabajo pendiente.

## Estado del repo

### Base (repo actualizado que el usuario me paso)

- Motor durable: leases, CAS, checkpoints, resume tras crash.
- ActionService con idempotencia, aprobacion, outcome_unknown.
- Docker computer con verificacion fail-closed.
- Browser worker con egress proxy y DNS pinning.
- SOPs declarativos con allowlist, version pinning, cycle/depth guards.
- Skills bootstrap offline desde workspace-template/skills.
- Multi-usuario: login real, roles admin/user, perfil, modales, admin usuarios.
  - Ficheros: auth-routes.ts, users.ts, Login.tsx, ProfileModal.tsx,
    UserModal.tsx, UsersView.tsx, api/auth.ts.
- RAG backend: embeddings.ts, rag.ts, rag-routes.ts.
- files.ts con ingesta automatica de texto plano.
- conversation.ts con RAG en el Observable (patron correcto, ya en base).
- service.ts acepta rag: RagService.
- assignedTo en AgentTask + createTaskSchema.
- backups: scripts/backup.ts + scripts/restore.ts.
- provision-client: scripts/provision-client.ts + clientes/_example/.
- Entregables previos: Header con dropdown, ApiError.fields, AppError.fields,
  onError con {error, fields}, UserModal/ProfileModal/Login pintan errores
  por campo.

### Aplicado despues (por bloques, confirmado por el usuario)

- MemoryService completo: recall unificado (RAG + memories + reformulacion con
  historial + banda baja/alta), remember con dedup por hash, retry de
  embeddings nulos, dedupMemories.
- AgentMemory extendido: category (MemoryCategory) + tags.
- LearningService delegado a MemoryService (dedup real).
- enforcement de SOPs por usuario en sop-executor.ts.
- case recall_memory en sop-executor.ts.
- recall_memory en el enum de sop.ts.
- Job retry+dedup en maintain() de service.ts.
- artifactFromSource en service.ts (artefactos sin AgentTask).
- conversation.ts: memory.recall con historial.
- threads-routes.ts (API de conversaciones: GET/POST/GET:id/PUT/PATCH/DELETE).
- projects-routes.ts (API de proyectos: CRUD + blocks + link/unlink).
- api/rag.ts (cliente RAG).
- DocumentsView con busqueda semantica + CSS asociado.
- api/index.ts exporta rag.

### Incierto — verificar en el repo actualizado

- Project types en agent.ts. El bloque fallo y se intento re-aplicar al final
  sin confirmar.
- Typecheck: reporto "Found 9 errors in projects-routes.ts:7". Sin verlos.
- projectRoutes cableado en app.ts. No confirmado.
- threadRoutes cableado en app.ts. No confirmado.
- api/threads.ts creado. No aparece. Probablemente NO existe.
- create_briefing en conversation.ts. No aplicado (fallo el anchor).
- clientes/_example/* aparece raro. Probablemente intacto.

## Fix inmediato (antes de features nuevas)

1. Ver los 9 errores de typecheck con codigo TS completo.
2. Confirmar si Project/ProjectBlock/ProjectStatus estan en agent.ts. Si no,
   anadirlos al final del fichero (sin anchor, sin regex).
3. Crear apps/web/src/api/threads.ts si falta.
4. Cablear threadRoutes y projectRoutes en app.ts.
5. Insertar tool create_briefing en conversation.ts + instruccion de prompt.
6. Verificar clientes/_example/ intacto.

## Trabajo pendiente

### Bloqueantes para vender al primer cliente

- UI multi-thread: useChat con thread activo, ConversationsPanel con lista real,
  boton "Nuevo chat" funcional, borrar/renombrar.
- UI Projects: api/projects.ts, ProjectsView.tsx (lista + detalle editable con
  bloques), nav item "Proyectos", boton "Crear proyecto desde este chat".
- create_briefing operativo con prompt que lo fuerza.
- Deploy: backend en Fly.io + frontend en Cloudflare Pages + dominio + HTTPS.
- Cron real de backups.

### Alto valor

- Auto-ingesta al terminar SOP con artefacto (save_artifact → RAG).
- Auto-ingesta de documentos largos de Drive (read_drive_file > N caracteres).
- UI real de RAG: listar fuentes, contar chunks, borrar fuente, reingestar manual.
- Auto-linking de memorias y briefings a proyectos (por tag, clientId, nombre).
- UI memoria taxonomizada: filtros por categoria, tags, busqueda, CRUD manual.
- UI "mis tareas" con assignedTo.
- WhatsApp via Evolution API: webhook, tool prepare_whatsapp, SOP.
- Busqueda hibrida completa (RAG hoy solo coseno).

### Admin y operacion

- Panel maestro de clientes.
- Cost tracking del LLM por cliente.
- Billing con Stripe.

### UI/UX

- Atajos de teclado (Cmd+K, Cmd+N).
- Notificaciones en vivo (badge en el header).
- Busqueda global (mensajes + tareas + memorias + archivos).
- Preview de adjuntos (imagenes inline, PDFs en modal).
- Botones de respuesta rapida (Responder / Resumir / Traducir).

### Escalado (cuando haya volumen)

- pgvector en vez de coseno en JS.
- Indices en records para consultas frecuentes.
- Deduplicacion temporal de run-events / activity.

## Deuda tecnica

- Ficheros basura en la raiz: $path, $t, if, pnpm, Select-String, tsc,
  Write-Host, {', } . Borrar.
- BOM UTF-8 en conversation.ts, embeddings.ts, rag.ts, provision-client.ts.
  RESUELTO (rama fix/cleanup-and-bugs): los 4 ficheros verificados byte a byte,
  ninguno empieza por EF BB BF.
- store.listPaged sin llamadores y store.list duplicando su SQL. PENDIENTE:
  dejar list como envoltorio que llama a listPaged (que ya devuelve data +
  updated_at) y devolver solo los data, para que la paginacion por cursor viva
  en un unico sitio. Fichero: apps/server/src/db.ts.
- Doble persona en model.ts ("enterprise operator" + "personal agent"). Unificar.
- Ingesta RAG serial en files.ts. Paralelizar o hacer asincrona.
- RagService.search escanea todos los chunks. Migrar a pgvector cuando escale.

## Como verificar el estado real

- Mirar el repo actualizado (fuente de verdad).
- pnpm typecheck y pnpm --filter @openmuse/web typecheck.
- Busquedas puntuales con Select-String para comprobar cosas concretas antes de
  escribir sobre ellas.