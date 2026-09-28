# TODO-CLINE — Trabajo delegado

> Ramas donde Cline trabaja. Nada de tocar lo que ya esta cerrado.
> El repo actualizado es la ley. Antes de tocar un fichero, leerlo.

## Rama: feat/agent-ui (nueva, desde main)

Punto de partida: `/api/agent/roles` (GET, POST) ya existe en la rama
`feat/client-onboarding`. Antes de empezar, mergear `feat/client-onboarding`
a `main` o partir de esa rama. Confirmar con el usuario.

### Tareas

1. **UI de agentes**
   - Nueva vista `AgentsView.tsx` en `apps/web/src/components/`.
   - Cliente API `apps/web/src/api/agents.ts` con `listAgents()` y `createAgent()`.
   - Nav item "Agentes" en `ConversationsPanel.tsx` (hoy esta deshabilitado).
   - Lista de roles con nombre, objetivo, SOPs asociados, estado activo.
   - Formulario de creacion (id, name, objetivo, sops, active).

2. **Selector de rol en chat**
   - Dropdown sobre `ChatInput` que lista los roles activos.
   - Estado local en `ChatPanel` (rol activo del thread).
   - Al enviar, adjuntar `roleId` al payload de `/api/copilotkit/run` en `apps/web/src/api/chat.ts`.
   - Backend: leer `roleId` de `forwardedProps` o del state del run en `ConversationAgent` y usar el `objetivo` del rol en el prompt.

3. **Filtro por rol en tareas**
   - `AgentTask.assignedTo` ya existe.
   - Anadir selector de rol en `TasksView.tsx` que filtre la lista.
   - Anadir selector en el formulario de creacion de tarea (modal) si existe.

### Reglas

- No tocar `app.ts`, `auth-routes.ts`, `engine/service.ts`, `engine/conversation.ts` (excepto la extension minima del punto 2).
- No tocar `index.css` salvo anadir al final (regla 0.14 del HANDOFF).
- No tocar SOPs, computer, browser worker.
- Un bloque = un cambio claro. Si falla dos veces, reescribir el fichero completo.
- Typecheck auto-ejecutado al final de cada bloque que toque TS.
- Ledger al final de cada respuesta.

## Rama: chore/tech-debt (nueva, desde main)

Lote de deuda tecnica acotada, cero solapamiento con otras ramas.

1. `.gitattributes` para forzar LF (resuelve falsos positivos de biome en Windows).
2. `business-intel/SKILL.md`: cambiar `query_business_data` por `query_business` (tool correcta del enum).
3. `POST /api/skills/:id/install`: devolver 501 explicito en vez de `{ok:true}` falso (o eliminar el endpoint).
4. `clientes/_example/config.json`: quitar la password en claro, dejar un placeholder.
5. `scripts/provision-client.ts`: ya arreglado en `feat/client-onboarding`. No tocar.
6. Mover los 4 stubs (`stripe.ts`, `whatsapp.ts`, `gmb.ts`, `social.ts`) a `packages/integrations/src/stubs/` con un README que explique que estan sin cablear a proposito.

### Reglas

- Un commit por punto.
- Si algo no esta claro en el codigo real, leerlo antes de tocar.
- Typecheck auto-ejecutado al cerrar la rama.

## Rama: feat/pgvector (nueva, desde main)

Migrar `RagService.search` de coseno en JS a pgvector. Solo si el deployment usa Postgres real (no PGlite).

1. Detectar en `apps/server/src/db.ts` si el backend es PGlite o pg.
2. Si es pg: `CREATE EXTENSION IF NOT EXISTS vector`, cambiar `rag-chunks.embedding` a `vector(768)` (dimension de text-embedding-004), indice IVFFlat.
3. En `RagService.search`, si el backend es pg y la extension existe, usar `ORDER BY embedding <=> $1 LIMIT $2` en vez del bucle en JS.
4. Si es PGlite, mantener el bucle actual como fallback.

### Reglas

- No romper PGlite. El fallback tiene que seguir funcionando.
- Test manual: subir 2 documentos, buscar, comprobar resultados.

## Lo que NO hacer

- No tocar el engine durable (worker, leases, CAS).
- No tocar el ActionService.
- No meter dependencias nuevas sin justificar.
- No proponer comandos git distintos a los que usa el usuario.
- No preguntar decisiones que ya estan en el mockup, el TODO o el HANDOFF.
