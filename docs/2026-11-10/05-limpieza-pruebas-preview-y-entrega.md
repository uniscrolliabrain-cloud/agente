# 05 · Limpieza, pruebas, preview y entrega

> v1 · 2026-11-10 · Estado: handoff
>
> Base: commit `804d8f7` en `main`. Este documento describe exactamente qué se eliminó, qué se verificó y qué limitaciones tiene la entrega.

## Limpieza del legacy

La limpieza tuvo cuatro frentes. El primero fue el evento `view.resolved`. Se eliminó de `apps/server/src/engine/events/types.ts`, de `apps/server/src/engine/events/schemas.ts`, del bloque del Presenter en `apps/server/src/engine/conversation.ts` y del payload mínimo de `tests/event-bus.test.ts`. El evento ya no se emite y el enum ya no lo acepta. No se debe reintroducir: el chat no debe usar el bus como transporte de vistas.

El segundo fue el contrato duplicado del frontend. Se eliminó `apps/web/src/view/spec.ts`, un archivo con un `viewSpec` de Zod que no era el schema que usaba el renderer. El renderer usa `parseRuntimeViewSpec` de `packages/domain/src/views.ts`; el archivo muerto solo confundía sobre cuál era la fuente de verdad. Si alguien lo encuentra en una rama antigua, no debe restaurarlo.

El tercero fue el default del generador. `WorkspaceGenerator` ponía `defaultView: "dashboard"` aunque el workspace no tuviera un dashboard declarado. Ahora usa `sections[0]?.viewKind ?? "dashboard"`, de modo que el default coincide con la primera sección real y solo cae en dashboard si no hay ninguna. Es un cambio pequeño, pero evita que un workspace abra una vista que no existe.

El cuarto fue la documentación activa. `docs/09-interfaz/VIEWS_AND_TEMPLATES.md` se reescribió para describir el contrato implementado, el pipeline, los siete kinds, los límites y los archivos clave. El documento anterior hablaba de siete templates de producto (dashboard, chat, mail, calendar, files, activity, connections) y de un resolver con builders por defecto; ya no reflejaba el código. La versión nueva tiene cabecera `v2 · 2026-11-10 · Estado: implementado`.

El contrato con gestoría se mantuvo separado. Vive en `docs/07-integraciones/GESTORIA.md`, commit `155f799`, y describe la integración propuesta: gestoría como fuente de verdad, Odoo invisible, change feed, read models, envelope, acciones humanas y límites. No se movió a `agntia-gestoria` desde este workspace. El usuario dijo que lo pasaría él mismo. Es importante no tratarlo como si ya estuviera en el otro repositorio.

## Pruebas añadidas

Se añadieron cuatro tests nuevos y se actualizó uno existente:

- `tests/view-envelope.test.ts`: valida un envelope correcto y rechaza un spec inválido. Comprueba los defaults de `permissions.canAct` y `provenance`.
- `tests/workspace-view-adapter.test.ts`: construye una tabla desde filas reales, verifica que las columnas se infieren y que una cola mantiene estados. También verifica que un resultado vacío produce una cola vacía, no filas inventadas.
- `tests/workspace-default-views.test.ts`: recorre todos los workspaces de `ALL_WORKSPACES` y exige que cada uno tenga al menos una vista con query.
- `tests/views-route.test.ts`: monta Hono, registra HubSpot con un store fake y comprueba que `POST /api/views/resolve` devuelve un envelope con `tenantId`, `workspaceId` y `spec.kind: "table"`.
- `tests/event-bus.test.ts`: se quitó el payload de `view.resolved` y el comentario que lo mencionaba.

El test de ruta usa un store fake con `get`, `put`, `list`, `insertIfAbsent` y `remove`. No usa la base real. Eso permite probar el contrato HTTP sin infraestructura, pero no prueba que las queries de los 34 workspaces funcionen contra datos reales. Es una prueba de integración de la ruta, no de la base.

## Verificación ejecutada

Los comandos y resultados fueron:

- `node_modules/.bin/tsc --noEmit`: exit 0.
- `node_modules/.bin/tsc -p apps/web/tsconfig.json --noEmit`: exit 0.
- Tests focalizados de vistas, envelope, adapter, default views, resolver y event bus: 14 tests, 14 pass.
- Suite completa con `node_modules/.bin/tsx --import ./tests/setup.ts --test --test-timeout=30000 --test-force-exit "tests/**/*.test.ts"`: **718 tests, 701 pass, 0 fail, 12 skipped, 5 todo**.
- `git diff --check`: limpio antes del commit.
- `git diff --cached --check`: limpio antes del commit.

El entorno no tenía `pnpm` instalado. Por eso se usaron los binarios locales de `node_modules`. En un entorno normal, los comandos equivalentes son `pnpm typecheck` y `pnpm test`, pero la suite se ejecutó con `tsx` directamente y ese es el resultado que consta. Si se restaura el workspace y falta `node_modules`, hay que instalarlo antes de repetir; no se deben actualizar dependencias ni el lockfile para “arreglar” el entorno.

## Preview y Vite

El frontend se levantó con Vite 5.4.21 desde `apps/web/node_modules/.bin/vite`, no desde el binario raíz (el raíz no exponía `vite`). El primer intento fue en el puerto 5173, que es el default de `apps/web/vite.config.ts`, pero la herramienta de preview de este chat exige el puerto reservado 3000. Se detuvo únicamente el proceso identificado por PID y se reinició en `0.0.0.0:3000`.

Vite rechazó el hostname del preview con un 403:

```text
Blocked request. This host ("pv-...style.dev") is not allowed.
```

Se intentó primero la variable `__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS`, pero en esta versión de Vite no habilitó el host. La solución aplicada fue añadir a `apps/web/vite.config.ts` una lista `allowedHosts` alimentada por `VITE_ALLOWED_HOSTS`:

```ts
allowedHosts: process.env.VITE_ALLOWED_HOSTS
  ? process.env.VITE_ALLOWED_HOSTS.split(",")
      .map((host) => host.trim())
      .filter(Boolean)
  : undefined,
```

No se usó `allowedHosts: true` ni un comodín `.style.dev`. Se pasó el hostname exacto por entorno y se reinició Vite. La comprobación con `curl` a `127.0.0.1:3000` y la cabecera `Host` del preview devolvió **HTTP 200** con HTML. `cloud_show_dev_server` solicitó el panel derecho. No se abrió el navegador completo ni se hizo una inspección visual de los siete templates; por tanto, “Vite responde” no equivale a “la UI se ve correctamente”.

La configuración de Vite hace proxy de `/api` a `http://127.0.0.1:8787`. En la sesión no se levantó el servidor API. Si el usuario abre el preview sin backend, las llamadas a `/api/workspaces` o `/api/views/resolve` fallarán con error de red. Eso es esperado y no significa que el frontend esté roto. Para una revisión visual con datos haría falta arrancar el backend y autenticarse.

## Git y entrega

El trabajo se hizo en la rama `main`. El commit de código es:

```text
804d8f7 feat(vistas): unificar las vistas de workspace en ViewEnvelope
```

El commit incluye 35 archivos, 1.335 inserciones y 194 eliminaciones. El push se hizo con `155f799..804d8f7 HEAD -> main`. Después del push, `FETCH_HEAD` y `HEAD` coincidieron en `804d8f7` y la divergencia remoto/local fue `0/0`.

Quedaron fuera del commit:

- `agente-integration.patch`: parche del contrato de gestoría, sin trackear.
- `agntia-gestoria/`: clon local del otro repositorio, sin trackear.

No se tocó `agntia-gestoria` ni se hizo push de su `main`. El contrato de gestoría en `agente` ya estaba publicado en `155f799`; el usuario se encargará de moverlo. Cualquier IA que continúe debe comprobar el estado real de `agntia-gestoria` antes de asumir que el contrato está allí.

## Cómo reproducir la verificación

Desde la raíz de `agente`:

```bash
node_modules/.bin/tsc --noEmit
node_modules/.bin/tsc -p apps/web/tsconfig.json --noEmit
node_modules/.bin/tsx --import ./tests/setup.ts --test --test-timeout=30000 --test-force-exit "tests/**/*.test.ts"
```

Para el preview, si se usa el entorno de este chat:

```bash
cd apps/web
VITE_ALLOWED_HOSTS="<hostname-exacto-del-preview>" \
  ./node_modules/.bin/vite --host 0.0.0.0 --port 3000 --strictPort
```

No se debe hardcodear el hostname en el repositorio. `VITE_ALLOWED_HOSTS` es una configuración de proceso; el valor cambia cuando cambia el preview. Si se levanta el backend, revisar el puerto y el proxy antes de probar las rutas.

## Limitaciones de la entrega

- No hay tests de componentes React ni E2E.
- El test de ruta no prueba permisos ni tenants cruzados.
- No se probaron queries reales de los 34 workspaces; solo el default de HubSpot con un store fake.
- No se verificó visualmente el render de los siete templates.
- El preview no tenía backend, así que las llamadas API no se probaron desde el navegador.
- La documentación de este paquete se creó después del commit `804d8f7`; no forma parte de ese commit salvo que se haga uno nuevo.
- Los procesos del preview no sobreviven necesariamente al archivado de la sesión. Si el panel deja de responder, hay que reinstalar dependencias si faltan y volver a arrancar Vite en el puerto reservado.

La entrega es **código verificado por typecheck y suite**, no una validación de producto en navegador. El siguiente agente debe tratar esa diferencia como un requisito de trabajo, no como un detalle.
