# 09 · Laia y Marcos operativos por empresa — REPORTE

**Estado:** completa con un pendiente de imagen declarado · **Entrada:** `e1c493c` (campaña 08).

## Qué se ha implementado

### 09.P1 · Contrato de persona

`clientes/_template/personas/laia/persona.json` y `clientes/_template/personas/marcos/persona.json`, validados con el schema que ya existía (`agentPersonaSchema`, estricto):

- **Laia**: operaciones, `enabled: true`, sin `crossTenant`.
- **Marcos**: prospección comercial, `reportsTo: "laia"`, `enabled: false`. Nace apagado **por dato** (`metadata.enabled`), no por una rama de código: la plantilla entrega el rol montado y el owner decide si su empresa hace prospección.

No se ha tocado el formato del bundle: los dos personas siguen siendo el contrato de identidades humanas y las personas funcionales salen de la plantilla.

### 09.P2 · Conexión (bundle → registry → chat)

- `agency-bootstrap.ts` compila las personas de la plantilla al dar de alta la empresa y escribe una instancia por persona en `system/persona-instances` (`<tenantId>:<personaId>`), con **`sopIds` del bundle**, `enabled` heredado del JSON y `owners` vacío. Si un `persona.json` no valida, el alta falla en claro en vez de instalar media empresa.
- `kernel/personas-bootstrap.ts` gana `loadInstalledPersonas(registry, db, tenants?)`: lee esas instancias, revalida persona y stats, y las registra en **la misma registry** que consume el chat.
- `app.ts` la llama después del bootstrap de ficheros. Antes el chat solo veía las personas de `default`/`_example`; una empresa instalada por CLI no tenía carpeta en `clientes/` y su registry quedaba vacía.
- `Dockerfile` copia `clientes/_template` a la imagen: sin la plantilla no hay personas que compilar en un deployment limpio.

### 09.P3 · Bordes: humano / agente / SOP / tenant

- `PersonaRegistry.register(...)` acepta activación (`enabled`, `sopIds`, `owners`). Sin activación explícita manda `metadata.enabled`.
- Nuevo `canStartWork(tenantId, personaId, { owner, sopId? })`:
  - persona inexistente en esa empresa → `persona_desconocida` (un `tenantId` de otra empresa nunca resuelve);
  - persona apagada → `persona_deshabilitada`;
  - el humano no tiene membership en la empresa → `sin_humano`;
  - la SOP no está asignada al tenant → `sin_sop`.
- El instalador de la 08 enlaza los `userId` recién creados como `owners` de las personas del tenant (`attachPersonaOwners`), comparando antes para no reescribir en cada reapply.

## Evidencia

| Comprobación | Resultado |
| --- | --- |
| `tsc --noEmit` | 0 errores |
| Gate: `r03-a01-laia-bootstrap` + `laia-hierarchy` + `vertical-slice-personas` + `vertical-slice-provision` | **15/15 pass, 0 fail** |
| `git diff --check` | limpio |
| Audits | ver salida del commit |

Casos de `tests/vertical-slice-personas.test.ts`:

1. La plantilla valida y trae Laia encendida y Marcos apagado (`reportsTo: laia`, sin `crossTenant`).
2. El alta de A y B deja **cuatro instancias** (dos por empresa).
3. La registry del chat resuelve las cuatro, con `sopIds` del bundle y los humanos de **su** empresa (los de B no aparecen en A).
4. Laia puede iniciar trabajo con su SOP; **Marcos deshabilitado devuelve `persona_deshabilitada`**.
5. Sin humano de la empresa (`sin_humano`), con SOP no asignada (`sin_sop`), persona inexistente y tenant ajeno (`persona_desconocida`).
6. Encender Marcos es escribir `activation.enabled` en su instancia: la registry lo acepta y la copia de la otra empresa sigue apagada.

## Pendiente declarado

- **Aserción de imagen (Docker)**: no acreditable en este entorno — `permission denied` en `/var/run/docker.sock`. Lo que sí está probado es que la plantilla entra en la imagen por `COPY` y que el código resuelve las cuatro instancias desde el store; construir y arrancar la imagen queda pendiente para quien tenga Docker.
- **Selector de persona en la UI**: `canStartWork` está en la registry y en las rutas de lectura; el panel todavía no lo usa para deshabilitar el botón de "empezar". Queda para el tramo de superficie.
- **Cuentas reales de staging**: la prueba de dos empresas se hace con PGlite y usuarios creados por el propio test; no hay ejecución contra staging desde aquí.

## Rollback

Revertir el commit de la 09 deja la registry sin activación (comportamiento anterior: `register` con tres argumentos sigue funcionando) y el chat vuelve a cargar solo personas de fichero. Las filas `system/persona-instances` son inertes sin el cableado y se pueden dejar o borrar por tenant sin afectar a identidades ni SOPs.
