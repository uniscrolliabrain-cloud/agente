# OpenMuse Enterprise Beta

Durable enterprise agent runtime built around **Tasks → SOPs → Skills → Tools → Validation → Learning**.

This repository is the Enterprise branch reconstructed from the supplied OpenMuse codebase. The original durable task engine, CAS/lease checkpoints, ActionService approval flow and isolated Docker computer are preserved; the Enterprise layer is now wired into the runtime instead of being prompt-only metadata.

## Beta vertical slice

```text
POST /api/agent/tasks
        ↓
   kind = "sop"
        ↓
     SOPExecutor
        ↓
  current SOP step
        ↓
 computer / business / browser / approval / artifact
        ↓
 durable checkpoint
        ↓
 next step
        ↓
 LearningService
        ↓
 memory linked to task
```

### Implemented

- First-class `sop` task kind.
- SOP validation and CRUD.
- Durable SOP step index, results, version and execution stack.
- Allowlisted SOP tools.
- Nested SOP cycle/depth protection.
- `ask_user` pause/resume.
- Reviewed email/calendar actions with existing idempotency and approval receipts.
- Skill bootstrap into the private Docker workspace from the built-in skill library.
- HTTP/PostgreSQL business queries plus deterministic sample-mode business records.
- Deduplicated learning memories after successful SOP execution.
- Beta smoke and computer vertical-slice scripts.
- Existing Docker computer isolation, leases, CAS checkpoints and action recovery retained.

## Start

```bash
corepack pnpm install
cp .env.example .env
pnpm dev
```

### Primer administrador (obligatorio en una instalacion nueva)

Los usuarios viven en la DB y solo un admin puede crearlos desde la UI, asi que el primer
admin tiene que salir del entorno o de la consola. Elige una de las dos vias:

```bash
# Opcion A: en .env antes del primer arranque
ADMIN_EMAIL=admin@empresa.com
ADMIN_PASSWORD=una-contrasena-larga
ADMIN_NAME=Ana

# Opcion B: script de consola (con el API parado)
pnpm admin:create -- --email admin@empresa.com --password "una-contrasena-larga" --name "Ana"
```

`ADMIN_EMAIL` + `ADMIN_PASSWORD` solo se aplican cuando la tabla de usuarios esta vacia; en
arranques posteriores no se toca ningun usuario existente. Sin ninguno de los dos caminos
`POST /api/auth/login` responde 401 siempre (no hay contra quien validar) y el servidor
avisa por consola al arrancar.

El login limita los intentos (20 por IP y 5 por email cada 5 minutos) y devuelve 429 con
`Retry-After` cuando se agota la ventana.

En modo `sample` (el de por defecto) el primer login de cada usuario siembra su workspace de
ejemplo: correo, calendario, un PDF y una accion pendiente de aprobacion.

The deterministic SOP runtime does **not** require `CPK_INTELLIGENCE_API_KEY`. Open-ended model tasks still require their configured model/provider credentials.

# Primer arranque

En una instalacion nueva, la DB no tiene usuarios. El servidor crea el primer admin
solo si ADMIN_EMAIL y ADMIN_PASSWORD estan definidos en .env:

    ADMIN_EMAIL=admin@tu-dominio.com
    ADMIN_PASSWORD=una-clave-de-8-o-mas
    ADMIN_NAME=Admin

Entra con esas credenciales en la pantalla de login. Si faltan, el servidor avisa por
consola y el login devuelve 401.

# Consultas de negocio (`query_business`)

El paso `query_business` de un SOP ejecuta el SQL que escribe el SOP. Esa query llega ya
interpolada y no lleva filtro por owner, asi que **no puede apuntar a la base de datos de la
app** (ahi un `SELECT * FROM records` devolveria las filas de todos los clientes). Usa un DSN
aparte con un rol de solo lectura:

```bash
# en .env
BUSINESS_DATABASE_URL=postgres://openmuse_ro:...@host:5432/negocio
```

```sql
CREATE ROLE openmuse_ro LOGIN PASSWORD '...';
GRANT CONNECT ON DATABASE negocio TO openmuse_ro;
GRANT USAGE ON SCHEMA public TO openmuse_ro;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO openmuse_ro;
```

Si no lo definis, el servidor arranca con un aviso: usara `DATABASE_URL`. El servicio
rechaza de todos modos cualquier sentencia que no sea un `SELECT`/`WITH`, los comentarios SQL
y las comillas desbalanceadas, pero eso es defensa de profundidad, no el control de acceso.

## Smoke test

With the API running:

```bash
pnpm beta:smoke
```

This verifies task creation → SOP execution → business lookup → artifact → learning.

## Computer vertical slice

Build the sandbox image:

```bash
docker build -t openmuse-computer:local apps/computer
```

Set `COMPUTER_ENABLED=true`, restart the API, then:

```bash
pnpm beta:vertical
```

This verifies task → SOP → skill bootstrap → isolated Python skill → artifact → learning.

See [`BETA.md`](BETA.md) for the exact beta boundaries and failure semantics.
