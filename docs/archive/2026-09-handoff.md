# OpenMuse — Handoff

> Documento para retomar el trabajo sin contexto previo.
> Verdad: este fichero + TODO.md + el repo actualizado del usuario.
> Ultima actualizacion: 27 sep 2026.

## PROTOCOLO OBLIGATORIO

> Lee esto entero antes de tocar un solo fichero. No es opcional. No es un resumen. Es la ley.

### 0.1. La verdad

Tres niveles, en este orden:

1. **Lo que el usuario dice en el chat ahora.** Manda sobre todo lo demás.
2. **El repodump.** Foto del código en un momento dado. Puede estar desactualizado.
3. **Los docs** (este HANDOFF, TODO.md, README.md, UI-REDESIGN.md). Pueden estar desactualizados.

Si hay conflicto, gana el chat. Y se actualiza el doc que no cuadre.

### 0.2. El ledger

Antes de tocar nada en una sesión nueva, escribe en papel (o en un fichero temporal) qué ficheros has modificado en ESTA sesión. Cada vez que modifiques uno, apúntalo. Cuando vuelvas a tocarlo, usa la versión que tú dejaste, no la del repodump.

Ejemplo de ledger:

    NEW apps/web/src/api/threads.ts
    MOD apps/web/src/api/index.ts (export threads)
    NEW apps/web/src/hooks/useThreads.ts
    REWRITE apps/web/src/hooks/useChat.ts (acepta threadId)
    REWRITE apps/web/src/App.tsx (multi-thread)
    REWRITE apps/web/src/components/ConversationsPanel.tsx (multi-thread)

Si vas a tocar App.tsx otra vez, NO lees el repodump. Lees el App.tsx que TÚ dejaste. Si no lo recuerdas, lo pides con Get-Content.

### 0.3. Antes de escribir

Para CADA fichero que vayas a tocar:

1. ¿Lo modifiqué ya en esta sesión? → Uso esa versión (del ledger).
2. ¿No lo modifiqué? → Leo su contenido del repodump, la parte que importa.
3. ¿No está en el repodump o tengo dudas? → Pido `Get-Content -Raw <fichero>` al usuario.

Nunca escribo sin haber leído.

### 0.4. Cómo se escribe

- **Fichero nuevo** → WriteAllText con el contenido completo. Cero anchors. Cero reproducción de "antes".
- **Fichero existente, cambio grande o varias zonas** → Leo el fichero entero, lo reescribo completo con WriteAllText. Nunca Replace() de bloques largos.
- **Fichero existente, cambio quirúrgico** (una línea, un import, un string corto) → IndexOf sobre una cadena corta única del fichero real. Substring + concatenar. Nunca Replace() de bloques de más de 2-3 líneas.
- **CSS/HTML puro** → mismo tratamiento. Cero verificación si no rompe nada.

### 0.5. Idempotencia

Todo bloque empieza comprobando si ya está aplicado:

    if ($t.Contains("<marca de que ya esta aplicado>")) {
      Write-Host "SKIP: ya aplicado"
    } else {
      ... aplicar ...
    }

Si lo ejecutas dos veces, la segunda no hace nada.

### 0.6. Line endings

Antes de escribir un fichero existente:

    $hadCRLF = $t.Contains("`r`n")
    if ($hadCRLF) { $t = $t.Replace("`r`n", "`n") }
    ... modificar en LF ...
    if ($hadCRLF) { $t = $t.Replace("`n", "`r`n") }
    [System.IO.File]::WriteAllText($path, $t, (New-Object System.Text.UTF8Encoding $false))

Siempre UTF-8 sin BOM.

### 0.7. PowerShell seguro

- `$ErrorActionPreference = "Continue"` al principio de cada bloque.
- NUNCA `exit` en un bloque pegado en la terminal. Cierra la ventana y el usuario pierde el contexto. Si hay que parar, se imprime `FALLO: ...` y se sigue.
- Nunca `Remove-Item` sin `-LiteralPath` y sin comprobar que el path es el correcto.
- Nunca `Select-String -Recurse` (no existe en PowerShell 5.1). Usar `Get-ChildItem -Recurse | Select-String`.
- Nunca anchors con `$` final en regex. En .NET `$` matchea antes de `\n` y con CRLF el `\r` queda entre el carácter y el `$`, y el match falla sin avisar.

### 0.8. Verificación

- **Typecheck**: al cerrar cada wave, no después de cada fichero. `pnpm typecheck` + `pnpm --filter @openmuse/web typecheck`.
- **Tests**: solo antes de PR a main. `pnpm test`.
- **Manual**: probar el flujo afectado si es UI.

### 0.9. Comunicación

- **No explicar código.** El usuario no lo lee. Solo comandos que funcionen.
- **No pedir disculpas.** Si algo falló, se arregla.
- **No sugerir alternativas** si el usuario ya ha decidido. Se ejecuta.
- **Un bloque = una tarea.** No mezclar.
- **Si falla un bloque, no apilar parches.** Para, lee el fichero real, reescribe el bloque entero.

### 0.10. Errores ya cometidos (no repetir)

- Add-Content con arrays de strings → corrupción silenciosa.
- Anchors con `$` final y CRLF → fallos silenciosos.
- Suponer que un bloque se aplicó sin ver el output.
- Apilar parches sobre parches cuando algo falla.
- Trabajar contra el repodump cuando ya modificamos el fichero en esta sesión.
- Reproducir "antes" largos de memoria en lugar de leer el fichero real.
- Proponer comandos git que el usuario no usa.
- `exit` en bloques de terminal.

### 0.11. Al terminar una wave

1. Typecheck.
2. Commit con mensaje claro.
3. Actualizar los docs afectados (HANDOFF si cambia arquitectura, TODO si se cierra algo, UI-REDESIGN si es un paso de UI).
4. Avisar al usuario.

---
### 0.12b. Reglas duras de comportamiento

Estas reglas estan por encima del resto. Si se incumplen, la sesion se rompe.

1. Nunca pedir al usuario un fichero que ya esta en el repodump. El repodump es la fuente del contenido. Si un fichero aparece en el arbol del repodump, se lee de ahi, no se pide.
2. Nunca preguntar una decision que ya esta resuelta por el mockup, el TODO, el HANDOFF o el propio repodump. Si hay conflicto entre fuentes, gana el chat, y se resuelve sin preguntar cuando el resto de fuentes ya coinciden.
3. Si un bloque toca TypeScript, el propio bloque ejecuta `pnpm typecheck` al final y reporta FALLO si sale != 0. El usuario no copia un comando de typecheck aparte.
4. Los tests no se lanzan como verificacion de bloque. Solo antes de PR a main o cuando el usuario lo pida expresamente.
5. `$PSScriptRoot` no se usa en terminal interactiva (queda vacio). Rutas relativas al cwd o `(Get-Location).Path`.
6. El ledger se calcula en la cadena de razonamiento antes de escribir el comando, aunque en la respuesta vaya despues (ver 0.12).

### 0.12. Formato de respuesta al usuario

Al responder en el chat:

1. PRIMERO el bloque PowerShell que el usuario va a ejecutar.
2. AL FINAL el ledger, despues del comando.

El ledger sigue siendo obligatorio y se calcula ANTES de escribir el comando. Solo cambia el orden en el mensaje, no el orden mental.

Estructura de cada mensaje:

    ```powershell
    # bloque que el usuario ejecuta
    ```

    Ledger:
      NEW <fichero>
      MOD <fichero ya tocado antes en esta sesion>
      Dependencias: <verificadas antes de tocar>
      Verificacion al final: <como se comprueba>

### 0.13. Editar CSS con bloques { ... }

Para ficheros CSS con bloques selector { ... }, usar escaneo por lineas, no brace-matching:

    $lines = [System.IO.File]::ReadAllLines($p)
    # start = linea cuyo .Trim() == "selector {"
    # end   = siguiente linea cuyo .Trim() == "}"
    # reemplazar rango [start, end]

Nunca contar { y } caracter a caracter (falla con content: "{", url(data:...), etc.).
Nunca regex sobre el fichero completo (falla con CRLF).

### 0.14. Añadir al final de CSS es seguro

Para CSS, += de un bloque nuevo al final es idempotente y no rompe el orden. Preferir añadir al final antes que insertar en medio, salvo que el bloque tenga que ir dentro de un @media o un selector concreto.

### 0.15. Here-strings grandes se cortan al pegar

Un here-string @'...'@ de mas de ~40 lineas puede cortarse al pegar en PowerShell interactivo. Para bloques grandes, usar array de strings:

    $lines = @(
      "linea 1"
      "linea 2"
    )
    $content = ($lines -join "`n")

El array no se corta aunque sean 200 lineas.

---
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