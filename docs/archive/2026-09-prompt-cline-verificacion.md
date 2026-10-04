# PROMPT-CLINE-VERIFICACION - Cierre del pase de parches

> **PROMPT_CLINE_VERIFICACION_V2**
>
> Este documento se le pasa a Cline tal cual. Explica el estado del repo tras
> el pase de parches del 2026-10-02, qué se ha cambiado, y qué falta verificar.

---

## Contexto

Se ha hecho un pase grande de parches sobre el repositorio (repodump `8a5edab`).
Los cambios están escritos y aplicados. La mayor parte del typecheck backend ya
pasa limpio, pero queda trabajo de verificación y corrección para ti:

1. `pnpm --filter @openmuse/web typecheck` - arreglar los 61 errores preexistentes del frontend.
2. `pnpm test` - investigar el timeout de 305s y arreglar los tests que asuman firma vieja.
3. Reparar el bug conocido en `seedAgents` de `service.ts`.
4. Confirmar que `pnpm typecheck` sigue en 0 tras tus cambios.
5. Reportar en `docs/RESULTADO-VERIFICACION.md`.

## Estado actual verificado

| Comando | Estado |
|---|---|
| `pnpm typecheck` (backend + domain, 110 ficheros) | OK, 0 errores, 23.5s |
| `pnpm typecheck` (worker) | OK, 0 errores |
| `pnpm --filter @openmuse/web typecheck` | 61 errores preexistentes |
| `pnpm test` | Timeout de 305s, sin fallos en los que corrieron |

---

## Reglas duras

1. **No reescribas lo que funciona.** Si un typecheck pasa, no toques el fichero.
2. **No añadas features nuevas.** El alcance es solo corregir errores.
3. **No toques `docs/HANDOFF.md` ni `docs/TODO.md`** salvo lo que pida este prompt.
4. **Un commit por grupo funcional.** Mensajes claros en español.
5. **Si un fichero tiene un error que NO viene del pase, anótalo y sigue.**
6. **Todo cambio se hace contra el repo real en disco.**
7. **UTF-8 sin BOM.** Detectar CRLF/LF y preservar.
8. **No borres ficheros de tests.**

---

## Tarea 1 - Arreglar los 61 errores del frontend

Los 61 errores son de tres tipos:

### Tipo A: imports sin usar (TS6133)

En `apps/web/src/App.tsx`:
- `ViewRenderer` importado y no usado.
- `ContextChips` importado y no usado.
- `currentViewSpec`, `setCurrentViewSpec` declarados y no usados.
- `contextChips`, `setContextChips` declarados y no usados.
- `intentResolver` declarado y no usado.

En `apps/web/src/components/ControlCenterView.tsx`:
- Iconos `Activity`, `AlertCircle`, `Briefcase` importados y no usados.

**Solucion:** eliminar los imports y las declaraciones sin uso. O, si prefieres,
dejarlos y anotar por que estan. Lo primero es lo correcto.

### Tipo B: `class=` en JSX (TS2322)

Los templates en `apps/web/src/templates/*.tsx` usan `class=` de HTML plano en
vez de `className=` de React. Son stubs que vienen del repodump original y nunca
se compilaron.

**Afecta a:**
- `templates/dashboard/DashboardTemplate.tsx`
- `templates/detail/DetailTemplate.tsx`
- `templates/form/FormTemplate.tsx`
- `templates/graph/GraphTemplate.tsx`
- `templates/kanban/KanbanTemplate.tsx`
- `templates/list/ListTemplate.tsx`
- `templates/table/TableTemplate.tsx`
- `templates/timeline/TimelineTemplate.tsx`

**Solucion rapida:** cambiar `class=` por `className=` en todos. Es un
reemplazo mecanico. Pero **ojo**: son stubs. No los borres todavia porque
Fase 1 los va a reescribir como templates reales que consumen `ViewSpec`.

Si prefieres, marca cada uno con un comentario `// TODO_VIEWSPEC_V1` para que
quede claro que se van a reescribir.

### Tipo C: `spec.columns` posiblemente undefined (TS18048)

En los templates, `spec.columns` es opcional. El codigo asume que existe.

**Solucion:** `(spec.columns ?? []).map(...)` en vez de `spec.columns.map(...)`.

---

## Tarea 2 - Arreglar el bug de `seedAgents`

En `apps/server/src/engine/service.ts`, en el metodo `seedAgents`, hay esta linea:

```ts
const inserted = await upsertIdempotent(this.db, owner, "agent-roles", {
  ...role,
  active: role.active ?? true,
});
if (inserted.id !== role.id) continue;
```

La condicion `inserted.id !== role.id` **nunca es true**, porque
`upsertIdempotent` recibe `role.id` como id y devuelve un objeto con ese mismo
id (nuevo o existente).

**Solucion A (recomendada):** volver al `get` previo:

```ts
const existed = await this.db.get<AgentRole>(owner, "agent-roles", role.id);
if (existed) continue;
const inserted = await this.db.insertIfAbsent(owner, "agent-roles", {
  ...role,
  active: role.active ?? true,
});
```

**Solucion B:** eliminar el `continue` y dejar que `insertIfAbsent` haga su
trabajo. Las memorias del rol se materializan de forma idempotente igual. La
unica diferencia es que se ejecuta el bucle de memorias incluso si el rol ya
existia. Como usa `insertIfAbsent`, no duplica.

Elige A o B. Yo recomiendo A porque mantiene el comportamiento original.

---

## Tarea 3 - Investigar el timeout de `pnpm test`

`pnpm test` corrio durante 305s y se corto con exit code -1. No hay `not ok` en
el output, asi que los tests que corrieron pasaron.

**Sospechas:**
1. Un test concreto cuelga (por ejemplo, un test que espera un evento que nunca llega).
2. La suite entera supera el limite de node --test (por defecto 300s por test o global).
3. Alguna tarea asincrona no se limpia entre tests y bloquea el proceso.

**Pasos:**
1. Ejecutar `pnpm test` de nuevo y mirar el ultimo test que aparece antes del timeout.
2. Ejecutar los tests individuales: `tsx --test tests/agent-api.test.ts` etc.
3. Identificar el test problematico y arreglar su limpieza o su timeout.

Si no puedes arreglarlo, **anotalo** con el nombre del test en el reporte.

---

## Tarea 4 - Arreglar tests que asuman firma vieja

Los tests existentes pueden asumir:

- `UserAuthor.write(ctx, turnId, message)` -> ahora `write(ctx, input)`.
- `SlowAuthor.writeReasoning(ctx, turnId, prompt)` -> ahora `writeReasoning(ctx, input)`.
- `FastAuthor.writeResponse(ctx, turnId, response)` -> ahora `writeResponse(ctx, input)`.
- `Kernel.closeTurn(ctx, turnId, reason)` -> ahora requiere `closedBy` como 4o argumento.
- `Promoter.promote` devuelve `destinations` ademas de `survivors`/`discarded`.
- `Service.answer()` valida `assignedTo` antes de aceptar la respuesta.

**Solucion:** actualizar los tests al nuevo contrato. Si un test comprobaba el
comportamiento viejo (por ejemplo, que `promote` no escribia a memoria), revisar
si el nuevo comportamiento es el correcto y ajustar.

---

## Tarea 5 - Verificacion final

Ejecutar y confirmar:

```
pnpm typecheck                              # debe dar exit 0
pnpm --filter @openmuse/web typecheck       # debe dar exit 0 tras tus arreglos
pnpm test                                   # debe dar exit 0 sin timeout
```

Si algo no pasa, **anotalo** con el error exacto.

---

## Tarea 6 - Reporte final

Crear `docs/RESULTADO-VERIFICACION.md` con esta estructura:

```markdown
# Resultado de verificacion

## Typecheck
- `pnpm typecheck`: OK / falla (con detalle)
- `pnpm --filter @openmuse/web typecheck`: OK / falla (con detalle)

## Tests
- `pnpm test`: X pass / Y fail / Z skip
- Tests tocados: <lista>
- Causa del timeout original: <diagnostico>

## Bug de seedAgents
- Solucion aplicada: A / B
- Justificacion: <breve>

## Ficheros corregidos
- <fichero>: <que se cambio y por que>

## Fallos de diseno encontrados
- <item>: <descripcion honesta>

## Pendientes que no he tocado
- <lista>

## Verificacion final
- `git status -sb`: limpio / con cambios
- `pnpm typecheck`: OK / fallo
- `pnpm --filter @openmuse/web typecheck`: OK / fallo
- `pnpm test`: OK / fallo
```

---

## Lo que NO tocas

- Motor durable (`worker.ts`) mas alla de verificar que compila.
- `ActionService` (`actions.ts`).
- `packages/integrations/src/google.ts`, `pdf.ts`, `vault.ts`.
- `apps/worker/` y `apps/computer/`.
- Ramas remotas. Solo `main` local.
- `docs/HANDOFF.md` (lo actualiza el humano).
- Los templates de `apps/web/src/templates/` mas alla del fix de `class=` y
  `spec.columns`. Se van a reescribir en Fase 1.

---

## Orden de ejecucion

1. `git status -sb` para ver el estado.
2. Leer `LEDGER.md` para saber que ficheros han cambiado en el pase.
3. Arreglar el bug de `seedAgents` (Tarea 2).
4. Ejecutar `pnpm typecheck`. Confirmar 0.
5. Arreglar los 61 errores del frontend (Tarea 1).
6. Ejecutar `pnpm --filter @openmuse/web typecheck`. Confirmar 0.
7. Ejecutar `pnpm test`. Investigar timeout (Tarea 3).
8. Arreglar tests con firma vieja (Tarea 4).
9. Ejecutar `pnpm test` de nuevo. Confirmar sin timeout.
10. Escribir `docs/RESULTADO-VERIFICACION.md` (Tarea 6).
11. Reportar al usuario con `git status -sb` + los 3 comandos.

---

## Notas sobre el pase

### Que se ha hecho

- Kernel cognitivo cableado en chat, tasks y SOPs.
- Stores persistentes cuando hay `DATABASE_URL`.
- `TenantService` como punto unico de tenantId.
- Autores del kernel escribiendo `Thought`s reales.
- `Promoter` con destinos explicitos y persistencia a memoria.
- `Meta` corriendo en bucle desde `maintain()`.
- Endpoints de debug del kernel (`/api/kernel/turns`, `/api/kernel/audit`).
- 43 marcas de idempotencia aplicadas.
- Transacciones en `db.ts`.
- Helpers `upsertIdempotent`, `withIdempotency` en `transaction.ts`.

### Que falta para el producto vendible

Fase 1: Panel contextual con los 7 templates (`dashboard`, `queue`, `inbox`,
`board`, `table`, `detail`, `form`). Ver `docs/TEMPLATES_V2.md`.

Fase 2: Animaciones (typewriter, cascada, contadores). Ver
`docs/UI_ANIMATIONS.md`.

Fase 3: Onboarding, workspace switcher, notificaciones, busqueda global,
metricas, backups.

Fase 4: Observabilidad, CI/CD, hardening, escala.

---

## Aviso sobre el repodump

El repodump original `8a5edab` tenia bugs preexistentes que no eran del pase:

- `service.ts` tenia un `}` huerfano en el interface `BusinessOsServices`
  (arreglado en el pase).
- Los templates del frontend usan `class=` en vez de `className=` (61 errores).
- Algunos tests asumen firmas viejas.

No te alarmes si al arreglar algo aparece otro bug preexistente. Anotalo y sigue.

---

Fin del prompt.
