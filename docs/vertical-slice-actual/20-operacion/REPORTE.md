# 20 · Panel, tarjetas y gate completo A/B — REPORTE

**Estado:** implementada y probada con fixtures; **aserción de cierre A/B pendiente de staging**, por lo que la campaña no se declara acreditada · **Entrada:** `a62bff0` (campaña 19).

## Qué se ha implementado

### 20.P1 · Contrato: panel de operaciones de solo lectura

- Nuevo `VerticalSliceOperationsView.tsx` con seis bloques: **aprobaciones** pendientes (hash y caducidad), **automatizaciones** programadas (hora de ejecución), **conexiones** (proveedor, cuenta, estado), **fichas comerciales** del pipeline (`/api/leads`), **recibos** del proveedor y **incidencias** (`failed`, `outcome_unknown`, `expired`).
- La vista se alimenta de `/api/workspace` (acciones y conexiones ya filtradas por empresa) y `/api/leads` (pipeline con tenant resuelto en servidor). No acepta ids por query ni construye enlaces externos: solo abre el trabajo citado cuando la acción trae un `taskId` del mismo snapshot.
- Entrada **Operaciones** en `SidebarV2` y render en `App.tsx`, reutilizando el modal de tarea existente. Sin escrituras: el panel no aprueba, no envía y no cambia fichas.

### 20.P2 · Conexión: tarjetas aprobadas, versionadas y con permisos

- `published-card.ts` añade `publishCardVersion`: exige que el actor pertenezca a la empresa, el permiso `cards.publish` y una versión entera creciente. Republicar una versión ya mostrada se rechaza, de modo que la evidencia que vio el operador no se sustituye en silencio.
- `assertCardBinding` verifica empresa, versión y que el hash del contenido coincide con el aprobado; manipular la tarjeta publicada la invalida.
- `fixed-card-renderer.ts` añade `renderAuthorizedCard`: solo renderiza tarjetas fijas aprobadas de la empresa y versión correctas, y exige que **cada referencia** (`task`, `action`, `lead`, `connection`, `thread`) esté en la lista autorizada. Devuelve la cita con `cardId`, versión, hash, aprobador, fecha y referencias.
- **Intención real:** nueva herramienta `explain_previous_day` en `conversation.ts`. Lee trabajos y acciones reales del día anterior, construye el briefing sobre una tarjeta fija aprobada y lo renderiza en el canal `panel`; la respuesta lleva ids, estados y horas, y la cita de la tarjeta. Sin registros devuelve un texto explícito, no una invención.

### 20.P3 · Bordes y compatibilidad

- El briefing rechaza cualquier registro de otra empresa antes de renderizar, incluso si el llamador los mezcla por error.
- El panel tolera workspace vacío, pipeline vacío, conexiones sin id y acciones sin `taskId` sin romper ni inventar enlaces.
- Métricas de coste no se añaden: no hay proveedor de coste en la superficie y el panel no ejecuta operaciones. Runbook de promoción: ver «Entrega» abajo.

## Cambios registrados

- `apps/server/src/engine/published-card.ts`: publicación versionada, validación de forma, hash y comprobación de empresa/versión.
- `apps/server/src/engine/context/fixed-card-renderer.ts`: render autorizado con referencias y cita.
- `apps/server/src/engine/conversation.ts`: `buildDailyBriefing` y herramienta `explain_previous_day`.
- `apps/web/src/components/VerticalSliceOperationsView.tsx`: nueva vista de operaciones.
- `apps/web/src/components/SidebarV2.tsx`, `apps/web/src/App.tsx`: entrada y render de la vista.
- `tests/vertical-slice-dogfood.test.ts`: nueva (4 casos).

## Evidencia

| Comprobación | Resultado |
| --- | --- |
| `tsc --noEmit` (raíz) | 0 errores |
| `@agente/web` typecheck | 0 errores |
| `@agente/web` build | correcto (1777 módulos) |
| Gate 20: `published-card`, `fixed-card-renderer`, `laia-vertical-acceptance`, `vertical-slice-dogfood` | **9 pass, 0 fail, 5 TODO heredados** |
| Regresión: marcos, leads, approval, workflows, agency-bootstrap, personas, worker-identity, sop-triggers | **38/38 pass, 0 fail** |
| Audits `idempotency`, `anchors`, `tenant-default`, `layers`, `bridges`, `no-console` | 0 |
| `git diff --check` | limpio |

Casos de `tests/vertical-slice-dogfood.test.ts`:

1. Tarjeta: versión creciente, permiso, empresa, hash íntegro y referencias autorizadas; versión anterior, actor ajeno, contenido manipulado y referencia no autorizada se rechazan.
2. Briefing: cita `action:act-9`, estado `failed`, hora `09:30` y las tres referencias reales; la cita lleva versión y hash.
3. Registro de otra empresa: se rechaza antes de renderizar.
4. Día sin registros: texto explícito, sin hechos inventados.

## Aserción de cierre: no acreditada

La campaña exige **seis humanos y cuatro agentes completando el recorrido con dos cuentas** y una explicación del día siguiente citando registros reales. En este entorno:

- No hay cuentas de staging ni claves de Google (Places/Gmail/Calendar): no se puede ejecutar el recorrido con dos empresas reales.
- No hay LLM configurado: `explain_previous_day` se prueba de forma determinista sobre los registros, no contra el modelo real.
- Docker sigue sin `docker.sock`, así que tampoco se acredita el recorrido contenedorizado.
- La matriz A/B de datos entre empresas está cubierta por fixtures en las campañas 02–19 y por el rechazo de registros ajenos en este test, no por dos cuentas reales.

Por el criterio del CAMPAIGN.md, **la 20 sigue abierta** hasta ejecutar esa matriz en staging y adjuntar ids de proveedor tras aprobación. Todo lo demás de la campaña queda implementado y en verde.

## Pendiente declarado

- Ejecución del gate A/B completo con dos cuentas de staging y proveedores reales; requiere secretos que no están en este entorno (van a Settings → Secrets, nunca al chat).
- `audit:contracts` sigue en rojo heredado (79 huérfanos) y `coherence` 6/7 solo por eso.
- El aviso de Vite sobre `actions.ts` importado de forma estática y dinámica es previo (`ApprovalModal`) y no afecta al build.

## Runbook de promoción

1. `pnpm typecheck`, gate de la campaña 20 y regresión; exigir exit 0.
2. `pnpm --filter @agente/web build` y arrancar API + web; entrar como una cuenta de A y otra de B.
3. En A: aprobar una acción, comprobar recibo e incidencia en el panel; preguntar «¿por qué se paró ayer?» y verificar que la cita incluye id, estado y hora reales.
4. En B: comprobar que no aparecen ids, fichas, acciones ni conexiones de A; abrir un enlace de tarea solo de B.
5. Reiniciar la API y repetir el punto 3: la evidencia debe seguir citando los mismos registros.
6. Retirar una conexión y verificar que el panel deja de mostrar su cuenta y que no se puede operar con ella.

## Rollback

Revertir el commit elimina la vista, la herramienta de briefing y la validación versionada. No hay migración de datos: las tarjetas no se persisten en el store, se construyen por llamada, así que no quedan registros huérfanos. Las acciones y fichas existentes siguen siendo legibles por el resto del motor. Punto de rollback: `a62bff0`.

## SHA por patchset

- **20.P1 + 20.P2 + 20.P3:** `3a43cdf` (producto y pruebas en un unico commit sobre `a62bff0`).
- **Punto de rollback:** `a62bff0`.
