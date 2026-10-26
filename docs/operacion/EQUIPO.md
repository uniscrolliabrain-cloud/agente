# EQUIPO — protocolo de trabajo founder + equipo dev (agentes)

> Cómo trabajamos tú (CEO/founder) y el equipo dev (agentes en sandbox) sobre este repo.
> Última actualización: 26 oct 2026.

## 1. Roles

| Quién | Hace | No hace |
|---|---|---|
| **Founder** | Abre cuentas, saca credenciales, decide producto/precio/ICP, escribe copy, construye UI/UX en bruto, hace las verificaciones que exigen identidad, aprueba merges a `main`, despliega | No cablea contratos, no arregla tipos, no escribe migraciones |
| **Equipo dev (agente)** | Cablea backend, contratos, adaptadores, tests, migraciones, config de deploy, docs técnicas, componentes UI si hace falta | No toca `main`, no recibe secretos por chat, no hace logins interactivos |

## 2. Fuente de verdad y ramas

- `main` es la única fuente de verdad. **El agente nunca escribe en `main`.**
- Cada línea de trabajo vive en **una rama = una campaña o un feature**. Nombres:
  - `campaign/<slug>` — tema transversal (ej. `campaign/authz-tenant`)
  - `feat/<slug>` — capacidad nueva (ej. `feat/leads-workspace`)
  - `fix/<slug>` — causa identificada (ej. `fix/jwt-signature`)
  - `patch/<slug>` — cambio mínimo (ej. `patch/test-glob`)
  - `docs/<slug>` — solo documentación
- Ciclo:
  1. Founder pushea su trabajo (aunque esté en bruto) a `main`.
  2. Agente hace `pull` de `main`, mide baseline, trabaja en su rama (`campaign/`, `feat/`, `fix/` o `patch/`), commitea por unidad y pushea.
  3. Founder revisa el diff, mergea o pide cambios.
  4. Founder hace `pull` a local y sigue.
- **Nunca** force push. Si hay divergencia, se resuelve sin descartar trabajo de nadie.

## 3. Propiedad de ficheros (para no pisarnos)

| Zona | Dueño | Regla |
|---|---|---|
| `apps/web/**` | Founder | El agente entra solo si se lo pides explícitamente |
| `clientes/**` | Founder | Datos de negocio; el agente lee, no inventa |
| `packages/domain/**` | Compartido | **Solo aditivo** (campos nuevos, no renombrar). Es el contrato |
| `apps/server/src/app.ts` (rutas) | Compartido | Founder añade UI, agente añade endpoints. Si toca el mismo bloque, avisar |
| `apps/server/src/engine/**`, `packages/**`, `tests/**`, `scripts/**`, `infra/**` | Agente | El founder no necesita tocarlo |
| `docs/**` | Compartido | — |

Si necesitas un campo nuevo en una entidad, **añádelo en `packages/domain` y avísame**. Es el punto donde tu código en bruto y mi cableado se encuentran.

## 4. Protocolo de sesión (por unidades, no por horas)

**Al empezar**, el agente reporta:
- baseline medido: `pnpm typecheck`, `pnpm test`, `pnpm audit:coherence`;
- qué está roto por el founder y qué por el repo (así no confundimos regresiones);
- la lista de unidades que va a intentar cerrar, con el gate de cada una.

**Al terminar**, el agente entrega:
- **cerradas**: unidades con su gate ejecutado y su cifra;
- **abiertas**: en qué punto quedaron y qué las desbloquea;
- **bloqueadas**: qué dato o decisión falta (una credencial, un merge, un criterio);
- commit por unidad, no un commit por sesión.

**Cómo reportar un bug**: rama, qué hiciste, qué esperabas, qué pasó, consola/red, y si es visual una captura. Sin eso, se investiga a ciegas y se gasta contexto.

## 5. Definition of done (para que un merge no rompa)

- [ ] `pnpm typecheck` en 0 (o justificado qué error es preexistente).
- [ ] Tests de la zona tocada verdes; si se añade capability/conector, test nuevo.
- [ ] Sin regresión en `pnpm audit:coherence` (hoy 5/7).
- [ ] Sin secretos en el diff (`git diff | grep -i "sk-\|postgres://\|api_key"`).
- [ ] Si cambia contrato público, actualizado el doc o la tabla correspondiente.

## 6. Secretos: canales permitidos

**Nunca** por chat, nunca en un commit, nunca en un issue, nunca en una captura de pantalla.

| Entorno | Canal |
|---|---|
| Sandbox del agente (dev) | Panel **Settings → Secrets** del proyecto en Freebuff. Se inyecta como variable de entorno; el agente no lo ve escrito |
| Producción | `fly secrets set NOMBRE=...` (o el panel del proveedor) |
| CI | GitHub → Settings → Secrets and variables → Actions |
| Local del founder | `.env` (gitignored) generado desde el gestor de secretos |
| Cuentas maestras (logins, 2FA) | Gestor de contraseñas personal. **Nunca** se comparten |

Reglas:
- Claves de desarrollo: **test mode**, proyecto dedicado, revocables. Si se filtran, se rotan y ya.
- El agente nunca escribe un secreto dentro de un fichero del repo. Si hace falta uno para un test, va por entorno o por fixture falsa.
- `TOKEN_ENCRYPTION_KEY`, `OPENMUSE_ACCESS_KEY`, `WORKER_TOKEN`, `ADMIN_PASSWORD`: los generas tú, no los pides a nadie.

## 7. Límites reales del equipo dev (para que no esperes magia)

1. **No hay navegador.** No puedo hacer clic en "Aceptar" de Google, ni escanear el QR de WhatsApp, ni ver si un componente queda feo. Eso es tuyo; yo hago las comprobaciones por HTTP/CLI.
2. **No hay procesos persistentes.** El sandbox se archiva entre sesiones: un túnel o un servidor que deje levantado no sobrevive. Los webhooks tienen que apuntar a un entorno desplegado o a tu túnel local.
3. **No hay acceso a tu máquina.** Todo entra y sale por Git. Si algo solo se reproduce en tu local, necesito el log o un test que lo reproduzca.
4. **No puedo hacer verificaciones de identidad**: KYC de Stripe, verificación de negocio de Meta, pantalla de consentimiento de Google, DNS del dominio.

## 8. Contradicción abierta que hay que resolver

`docs/operacion/TODO-FOR-PROD.md` dice **"un deployment por cliente, sin multitenancy"**. El plan del vertical slice dice **multitenant con JWT y `tenant_id`**. Son incompatibles.

Decisión propuesta: **multitenant** (un deployment, N tenants), porque abarata el cliente 2 y es lo que ya asume el doc 03. Implica:
- `MULTI_TENANT_SHARED=true` exige Postgres real (no PGlite) y RLS activo.
- `docs/operacion/TODO-FOR-PROD.md` hay que reescribirlo cuando se apruebe.

## 9. Unidades de trabajo

El trabajo se nombra y se cierra por unidades. Una unidad está terminada cuando su **gate** está medido, no cuando "parece que va". **No planificamos en horas.**

| Unidad | Qué es | Se cierra con | Vive en |
|---|---|---|---|
| **Etapa** | Objetivo de producto (0–15) | Criterio de aceptación del doc de etapa | `docs/roadmap/<NN>-*.md` |
| **Fase** | Subdivisión de una etapa (1–7) | Checklist de la fase | `docs/roadmap/<NN>-*/` |
| **Campaña** | Tema transversal que cruza capas | Métrica antes/después | rama `campaign/<slug>` |
| **Subequipo** | Línea de ejecución dentro de una campaña | Su parte del gate | prefijo del commit |
| **Feature** | Capacidad nueva observable | Test nuevo + contrato en `packages/domain` | rama `feat/<slug>` |
| **Fix** | Comportamiento incorrecto con causa conocida | Test que falla antes y pasa después | rama `fix/<slug>` |
| **Patch** | Cambio mínimo de superficie | El check afectado en verde | rama `patch/<slug>` |
| **Hunk** | Un diff coherente y revisable | Revisión de 30 s: una sola intención | dentro de un commit |
| **Audit** | Medición reproducible con número | `pnpm audit:*` con cifra | `scripts/audits/` |

### Reglas de granularidad

- **1 hunk = 1 intención.** Si arregla dos cosas, son dos hunks.
- **1 commit = 1 unidad cerrada** (feature, fix, patch) con su gate ejecutado.
- **1 rama = 1 campaña o 1 feature.** No se acumulan frentes.
- **1 sesión = N unidades** cerradas, abiertas o bloqueadas. Se reporta eso, nunca horas.
- Un feature no se cierra sin test; un audit no se cierra sin cifra; una campaña no se cierra sin comparación contra baseline.
- Nada de refactors grandes sin número: si no hay métrica, no se toca.
- La deuda conocida y medida (`docs/AUDIT_*.md`) no se "limpia por limpiar".

### Subequipos (líneas de ejecución, no personas)

`contratos` · `runtime` · `authz-tenant` · `canales` · `datos` · `ui` · `deploy` · `auditoría`

Un commit declara campaña y subequipo: `fix(authz-tenant): ...`, `feat(canales): ...`, `patch(ui): ...`. Sirve para saber, con `git log`, quién tocó qué frente sin abrir el diff.

### Vocabulario que no usamos

| En vez de | Decimos |
|---|---|
| "esto son 2 horas" | "esto es 1 patch + 1 test" |
| "ya casi está" | "gate X en verde, gate Y abierto" |
| "lo dejamos para mañana" | "queda fuera de esta campaña, va a la siguiente" |
| "ha tardado mucho" | "la unidad necesitó 3 iteraciones de gate" |
