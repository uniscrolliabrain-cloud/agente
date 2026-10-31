# BEFORE — NC-P00b / PS-01b: mantenimiento por tenant

| Campo | Valor |
| --- | --- |
| Unidad | NC-P00b / PS-01b (propuesta) |
| Tipo | Propuesta de alcance — **sin código todavía** |
| Fecha | 2026-10-31 |
| Base | `main` **4f81f22** + PS-01 (`004b999`) |
| Depende de | PS-01 mergeado o al menos su contrato (`runInTenantScope` en worker y recuperación) |
| Estado | `proposed_pending_scope_approval` |

## 1. Hallazgo

PS-01 cerró el contexto durable en creación → reclamación → reanudación →
reinicio. Queda el **mantenimiento**, que repite el mismo patrón inseguro:
`scanByStatus`/`scanByStatusWithCursor` de `TenantScopedStore` devuelven la
owner **ya peelada**, sin el tenant, y los consumidores hacen CAS o emiten con
esa owner fuera de cualquier scope. El store resuelve entonces por membership
primaria.

Bucles afectados en `apps/server/src/engine/service.ts`:

| Línea | Bucle | Efecto |
| --- | --- | --- |
| 455-466 | `pendingActions` (`actions` en `awaiting_review`) | una acción de B caducada no expira o expira en A si hay colisión de id |
| 491-500 | `publishOutcome` sobre `taskStatusPage` | el evento de una tarea de B se publica en A |
| 501-506 | `monitorPage` → `activateMonitor` (CAS de la tarea del monitor, 1676) | la tarea de monitor de B no se reactiva o se reactiva en A; `Monitor` **no** lleva `tenantId` |
| 2592-2620 | `maintainOwner` → `publishOutcome` | igual, y el cursor se guarda en la membership |
| 2621-2650 | `maintainTenantLegacy` | itera por owner = tenantId, no por tenant real |
| 2557-2584 | `maintainTenant` | filtra owners por `tenantIdFor(owner) === tenantId`, así que **omite** a quien tiene membership primaria en otro tenant; es decir, las tareas de B de un usuario de A no se mantienen nunca |

`maintainTenant` además pagina con `scanByStatusWithCursor`, que filtra por
todos los prefijos conocidos: bajo un scope B devolvería filas de A con owner
peelado. Por eso no basta con envolver el bucle en `runInTenantScope`.

## 2. Alcance propuesto, en dos partes

### PS-01b-1 — tareas (solo `service.ts`)

`AgentTask` lleva `tenantId`, así que cada registro del scan ya dice a qué
tenant pertenece. Envolver **por registro**:

```ts
await runInTenantScope({ tenantId: value.tenantId, actorId: owner }, () =>
  this.publishOutcome(owner, value),
);
```

Aplica a `taskStatusPage`, `maintainOwner` y `maintainTenantLegacy`. Sin
cambios de contrato ni de store: mismo patrón que ya usa
`recoverInterruptedTasks` en PS-01.

### PS-01b-2 — acciones, monitores y scans por tenant (requiere `db-tenant.ts`)

Ni `ActionProposal` ni `Monitor` tienen `tenantId`, y `maintainTenant` necesita
paginar *por tenant*, no por unión de prefijos. Hace falta un primitivo en el
store:

```ts
// Store + TenantScopedStore
scanTenantByStatus<T>(
  kind: string,
  tenantId: string,
  statuses: string[],
  limit: number,
  cursor?: { updatedAt?: string; id?: string },
): Promise<{ owner: string; value: T }[]>;
```

- Implementación: `WHERE owner LIKE 'tenantId:%' AND status = ANY(...)` con
  keyset `(updated_at, id)`; la owner se devuelve peelada.
- `TenantScopedStore` valida el `tenantId` (sin `:`), delega y no depende de
  los prefijos vistos en el proceso: esto también ataca el límite estructural
  documentado en PS-01 §5.3.
- `maintainTenant` pasa a usarlo para `agent-settings`, `tasks`, `actions` y
  `monitors`, y guarda un cursor por tenant en `maintain-cursor` (clave
  `maintain-<tenant>`).
- `activateMonitor` recibe además el tenant del scan (o resuelve la tarea del
  monitor dentro del scope) para poder reactivarla sin adivinar la membership.

## 3. Paths a reservar

| Path | Uso | Riesgo para VS |
| --- | --- | --- |
| `apps/server/src/engine/service.ts` | PS-01b-1 y llamadas de PS-01b-2 | alto: es el archivo compartido de la campaña |
| `apps/server/src/db-tenant.ts` | PS-01b-2 (scan por tenant + cursor) | alto: lo lee el vertical |
| `apps/server/src/db.ts` | interfaz `Store` y backend PGlite | medio |
| `tests/cognition/foundation/tenant-maintenance.test.ts` (nuevo) | pruebas | ninguno |

No se toca `app.ts`, `events/**`, `context/**`, auth ni canales.

## 4. Criterios de aceptación

1. **Publicación cruzada**: usuario con membership A, tarea terminal en B →
   una pasada de `maintain` emite `task.completed` con owner de B y **nada** en
   A. Hoy emite en A.
2. **Acción caducada**: `action` en `awaiting_review` con `expiresAt` pasado en
   B → queda `expired` en B; la homónima de A no cambia.
3. **Cobertura de `maintainTenant`**: una tarea de B de un usuario con
   membership A entra en la pasada (hoy se omite).
4. **Monitor**: un monitor activo de B con su tarea `paused`/`initializingMonitor`
   se reactiva en B y no en A.
5. **Cursor**: dos pasadas seguidas no reprocesan la misma página; el cursor de
   B no mueve el de A.
6. **Sin regresión en A**: con un solo tenant, eventos y cursores idénticos a
   los actuales.
7. Cada prueba debe fallar contra `4f81f22` y pasar con el patchset (evidencia
   en las dos direcciones, como en PS-01).

## 5. Riesgos y compatibilidad

- **Duplicados**: `publishOutcome` puede emitir el mismo evento en pasadas
  sucesivas; hoy lo absorbe el bus. Al cambiar el orden de escaneo hay que
  comprobar que la dedupe por `taskId` sigue cubriéndolo.
- **Cursores nuevos**: las claves por tenant son aditivas; los cursores
  antiguos (`maintain-owner`, `maintain-cursor-<tenant>`) quedan huérfanos y se
  pueden ignorar sin migración.
- **Coste**: `scanTenantByStatus` necesita índice por `(owner, status)`; sin él
  la pasada pasa de filtro en memoria a scan con LIKE. Verificar con
  `EXPLAIN` en PGlite antes de aceptar.
- **Rollback**: revertir los scans y el envoltorio por registro; los cursores
  por tenant no afectan a la lectura anterior.

## 6. Fuera de alcance

- Reescritura del EventBus o atomicidad entre store y bus (NC-P02).
- `maintainTenantLegacy` como concepto: se propone dejarlo delegando en el
  camino nuevo o retirarlo en una unidad aparte, no aquí.
- Cambiar la política de dedupe de eventos.

## 7. Preguntas para la revisión

1. ¿Se acepta partir PS-01b en 1 (solo `service.ts`) y 2 (`db-tenant.ts`), o se
   prefiere una sola PR?
2. ¿El vertical necesita `scanTenantByStatus` para algo propio? Si sí, conviene
   fijar la firma antes de implementarla.
3. ¿Se exige `EXPLAIN`/medición de la pasada de mantenimiento como parte de la
   aceptación?
