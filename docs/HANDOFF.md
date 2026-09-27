# OpenMuse — Handoff

> Documento para retomar el trabajo sin contexto previo.
> Verdad: este fichero + TODO.md + el repo actualizado del usuario.
> Ultima actualizacion: 27 sep 2026.

## 1. Que es OpenMuse

Runtime de agentes durables alrededor de Tasks → SOPs → Skills → Tools →
Validation → Learning.

En la practica: un ChatGPT que sabe cosas de tu empresa y hace cosas de verdad.

- Un deployment por cliente. Sin multitenancy.
- Multiples usuarios dentro del deployment (admin / user).
- Cliente objetivo: PYME o agencia pequena.
- Diferenciacion: SOPs deterministas con aprobaciones + memoria de empresa +
  tareas durables. No es otro wrapper de ChatGPT.

## 2. Como se trabaja aqui

### La clave

**El repo actualizado que da el usuario es la ley.** El usuario lo mantiene en
su maquina y lo pasa como fichero cuando se le pide. Ese fichero esta en el
contexto de la IA que trabaja en el repo.

Antes de escribir cualquier bloque:

1. Releer en el repo actualizado el fichero que se va a tocar.
2. Releer los bloques ya aplicados que hayan modificado ese fichero.
3. Escribir el bloque sabiendo exactamente que hay en cada linea.

No suponer. No usar el dump de hace varios turnos. No "creo que".
Si no se sabe, preguntar antes de escribir.

### Formato de los cambios

- Fichero completo con [System.IO.File]::WriteAllText cuando el cambio pasa de
  ~30 lineas o toca varias zonas de un fichero.
- Nunca Add-Content con arrays de strings: un apostrofe mal escapado corrompe
  el fichero en silencio.
- Para cambios cortos: IndexOf por contenido unico, o regex (?m).
- Nunca anchors con $ final: en .NET $ matchea antes del \n, y con CRLF el \r
  queda entre el caracter y el $, el match falla sin avisar.
- Idempotencia: comprobar que no esta ya antes de insertar.
- Detectar line ending y indentacion del fichero antes de escribir:
    $nl = if ($t.Contains("`r`n")) { "`r`n" } else { "`n" }

### Errores ya cometidos

- Add-Content -Value @('...','...') para ficheros largos. Corrupcion.
- Anchors con $ final y CRLF. Fallos silenciosos.
- Suponer que un bloque se aplico sin ver el output.
- Apilar parches sobre parches cuando algo falla.
- Trabajar contra el dump inicial en vez del repo actualizado.
- Proponer comandos git que el usuario no usa.

## 3. Arquitectura

    apps/
      server/    API Hono + engine durable + RAG + memoria + proyectos
      web/       React + Vite
      worker/    Playwright aislado
      computer/  Docker sandbox

    packages/
      domain/       tipos compartidos
      integrations/ google, pdf, vault, stubs (stripe, whatsapp, gmb, social)
      backends/     adaptador OpenBot (sin cablear)

    scripts/   backup, restore, provision-client, seed, beta-smoke
    clientes/  config por cliente

### Conceptos

- AgentTask: tarea durable. Estados: queued, running, waiting_approval,
  waiting_input, scheduled, paused, succeeded, failed, cancelled.
- SOP: pipeline declarativo JSON. Max 12 pasos. Cada paso llama a una tool.
- Skill: script Python en /workspace/skills/<id>/. Se instala en el sandbox
  al primer uso.
- Action: propuesta revisada (email, calendar, drive). Requiere aprobacion.
- Memory: hechos curados con category y tags.
- RAG: chunks de documentos con embeddings (text-embedding-004 de Gemini).
- Project: mini-Notion editable. Bloques + links a memorias + links a artifacts.
- Thread: conversacion. Multi-thread soportado en backend.

## 4. Ficheros clave

Backend:

    apps/server/src/
      app.ts                  bootstrap Hono
      auth.ts, auth-routes.ts sesiones + login real
      users.ts                UserService
      db.ts                   Store (PGlite/Postgres)
      files.ts                artifacts + ingesta RAG automatica
      actions.ts              aprobaciones con idempotencia
      workspace.ts            integracion Google
      google-auth.ts          OAuth + cifrado
      browser.ts              cliente del worker
      computer.ts             Docker sandbox
      threads-routes.ts       API conversaciones
      projects-routes.ts      API proyectos
      rag-routes.ts           API RAG
      engine/
        service.ts            AgentService
        memory.ts             MemoryService
        rag.ts                RagService
        embeddings.ts         Gemini embeddings
        learning.ts           delegado a MemoryService
        model.ts              task abierta con LLM
        conversation.ts       chat + RAG + briefing
        sop-executor.ts       ejecuta SOPs paso a paso
        sop-triggers.ts       cron + email_subject
        worker.ts             TaskWorker durable
        model-chain.ts        fallback de modelos

Frontend:

    apps/web/src/
      App.tsx
      api/         client, auth, chat, conversation, threads (pendiente),
                   tasks, actions, files, rag, projects (pendiente)
      hooks/       useAuth, useChat, useTasks, useWorkspaceData
      components/  Header, ConversationsPanel, ChatPanel, ChatInput,
                   MessageList, MessageBubble, ToolCallCard, KanbanPanel,
                   TaskCard, TasksView, DocumentsView, MemoryView, Login,
                   ProfileModal, UserModal, UsersView, TaskDetailModal,
                   ApprovalModal
      index.css

Paquetes:

    packages/domain/src/
      agent.ts      AgentTask, Goal, Monitor, Idea, AgentMemory, AgentArtifact,
                    Project, ProjectBlock, ProjectStatus, MemoryCategory
      sop.ts        SOP schema
      index.ts      Workspace, Mail, CalendarEvent, ActionProposal
      computer.ts   ComputerCommand, ComputerSnapshot

    packages/integrations/src/
      google.ts, pdf.ts, vault.ts, gmb.ts, social.ts, stripe.ts, whatsapp.ts

## 5. Decisiones arquitectonicas

- Sin multitenancy. Un deployment por cliente.
- Backend en Fly.io / Render / Hetzner. No Vercel.
- Frontend en Cloudflare Pages.
- Frontend sin dependencias innecesarias: React + Vite + Lucide.
- Sandbox Docker sin red. Wheels offline en apps/computer/wheels/.
- Aprobaciones obligatorias para acciones externas.
- query_business read-only. Con defensa best-effort. Se recomienda rol Postgres
  GRANT SELECT.
- LearningService solo ingiere hechos estructurales curados. Nunca contenidos
  externos.
- MemoryService.recall es el punto unico de recuperacion de contexto para chat
  y SOPs.

## 6. Estado verificado y trabajo pendiente

Ver TODO.md. Este handoff no duplica el detalle.

## 7. Como continuar en un chat nuevo

1. Pega este HANDOFF.md + TODO.md + el repo actualizado.
2. Di que punto del TODO atacar.
3. El repo actualizado es la ley. Antes de escribir, releer en el el fichero a
   tocar y cruzarlo con los bloques ya aplicados.
4. Un bloque = un cambio claro. Si un bloque falla dos veces, parar y reescribir
   el fichero completo.
5. Nada de git. Nada de suposiciones.

## 8. Preguntas frecuentes

Puedo desplegar en Vercel?
Frontend si. Backend no (necesita procesos persistentes, SSE, PGlite en disco).

Como se anade un SOP nuevo?
JSON con sopSchema, POST a /api/sops. Sin tocar codigo.

Como se anade un skill nuevo?
main.py + SKILL.md en apps/computer/workspace-template/skills/<id>/.
Rebuild imagen. POST /api/skills.

Por que no multitenancy?
Un deployment por cliente es la ventaja competitiva.

Como se hace RAG?
Embeddings Gemini (text-embedding-004). Coseno en JS hoy. pgvector cuando
escale.

Los archivos se pierden al reiniciar?
En local no (.openmuse/files/). En deploy depende del hosting.

Que hago si un bloque de PowerShell falla?
Releer el fichero en el repo actualizado. Ver line ending e indentacion reales.
Reescribir el bloque con IndexOf por contenido unico. Si falla dos veces,
reescribir el fichero completo.

---

Fin del handoff.