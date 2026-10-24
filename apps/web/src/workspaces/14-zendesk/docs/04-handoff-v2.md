<!-- ZENDESK_HANDOFF_V2 -->
# Handoff v2 - workspace 14-zendesk

> Para la siguiente IA. Autocontenido.
> Rama: feat/web-zendesk-workspace-ui
> Estado: ficheros creados, pendiente montaje.

---

## 1. Estado actual

El workspace 14-zendesk esta implementado. Tiene 30 ficheros:

- 5 raiz (README, index, types, format, ZendeskWorkspace.css)
- 1 api.ts
- 1 hook (useZendesk.ts)
- 26 componentes en components/ (en plano, sin subcarpetas)
- 4 docs (01-ui-map, 02-roadmap, 03-spec vacios + este handoff)

NO esta montado. No hay excepcion en WorkspaceShell.tsx.

---

## 2. Que falta

### Tarea 1 - Verificar typecheck

Ejecutar en la raiz del repo:

pnpm --filter @openmuse/web exec tsc --noEmit

Si hay errores, arreglarlos uno a uno.

### Tarea 2 - Montar (Opcion B)

Antes de tocar nada, ver estos dos ficheros:

- apps/web/src/workspaces/WorkspaceShell.tsx
- apps/web/src/App.tsx

Anadir excepcion en WorkspaceShell.tsx: si workspaceId es zendesk,
montar ZendeskWorkspace en vez de ViewRenderer.
Marca sugerida: WORKSPACE_SHELL_ZENDESK_MOUNT_V1.

### Tarea 3 - Conectar al backend real

Hoy api.ts es mock. Para conectar:

- Sustituir api.ts por fetch a /api/workspaces/zendesk/tickets.
- El endpoint no existe todavia, hay que crearlo en apps/server.
- Los queries ticket.list y ticket.read ya existen en packages/workspaces/14-zendesk.

### Tarea 4 - Endpoint de inteligencia

TicketIntelligence y TicketInsight son tipos UI, no vienen del backend.

Para servirlos en produccion:

- Crear endpoint /api/workspaces/zendesk/tickets/:id/intelligence.
- El endpoint consume el LLM y devuelve resumen, urgencia, next step, etc.

---

## 3. Ficheros globales que la siguiente IA debe ver

Antes de tocar 14-zendesk, leer:

- apps/web/src/workspaces/registry.ts
- apps/web/src/workspaces/WorkspaceShell.tsx
- apps/web/src/App.tsx
- apps/web/src/main.tsx
- apps/web/src/index.css
- apps/web/tailwind.config.js

Y el 02-whatsapp como referencia:

- apps/web/src/workspaces/02-whatsapp/README.md
- apps/web/src/workspaces/02-whatsapp/hooks/useChatWorkspace.ts

---

## 4. Convenciones de patchset

Un patchset = un fichero. Idempotente por marca. UTF-8 sin BOM.
Sin && ni ;. Un comando por linea. git add selectivo por fichero.

---

## 5. Trampas conocidas

- Paleta real del repo, no inventar. bg-canvas NO existe.
- Sin dark mode.
- Fuente Instrument Sans.
- Imports con extension .ts / .tsx.
- pnpm typecheck corre tambien el worker. Filtrar errores.
- components/ va en plano, no en subcarpetas.

---

## 6. Definicion de terminado

- pnpm --filter @openmuse/web exec tsc --noEmit verde.
- El workspace se ve en el navegador (montado por Opcion B).
- README.md con mapa completo.
- docs/04-handoff-v2.md (este fichero).
- git status --short limpio.

---

FIN DEL HANDOFF V2.
