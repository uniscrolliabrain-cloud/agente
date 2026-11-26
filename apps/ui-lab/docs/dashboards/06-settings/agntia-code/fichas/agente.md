# Ficha · agente

| Campo | Valor |
|---|---|
| Repo | `uniscrolliabrain-cloud/agente` |
| Visibilidad | Público |
| Proyecto | AgntiaPro (plataforma) |
| Superficies Agntia Code | Estudio de código, Editor, Despliegues, Entornos, Bitácora |
| Estado | Plataforma en desarrollo (`0.2.0-beta.1`) |
| Verificado contra | `main@6d06cf364321ee169a3caf47ac3bf922c299c55b`, 2026-11-26 |
| Lenguaje | TypeScript + Python (monorepo) |
| Tamaño | 130 778 KB · 4 094 archivos |
| Licencia | MIT |
| Issues abiertas | 11 |
| Homepage | `agentiapro-ui-lab.vercel.app` |

## Propósito

Infraestructura de inteligencia distribuida para compilar, operar y evolucionar empresas: lenguaje natural como interfaz, conocimiento persistente y un runtime gobernado con kernel, bus, auditoría, capacidades, SOPs y aprobaciones.

## Qué declara que funciona hoy

- Runtime durable con estados, leases, checkpoints, reintentos y recuperación.
- Capacidades con entradas, salidas, riesgos, permisos y efectos declarados; el kernel conserva la autoridad sobre las propuestas.
- Cognition V2 con componentes de conocimiento persistente (cards con metadata, revisión, procedencia y estado epistémico).
- Frontend empresarial, laboratorio UX, catálogo de workspaces y adaptadores.
- Interfaz de landing, Apps, Centro de Mando y Tareas.

## Qué no está verificado

- El propio README advierte que las capturas usan datos sintéticos y **no acreditan operaciones reales**.
- Videoconferencia con roles, integraciones de proveedores y paridad con la visión del whitepaper: no verificado por esta auditoría.
- No se ha ejecutado la batería de tests ni el build.

## Stack y ejecución (manifiesto real)

- `pnpm install`, `pnpm dev:all`, `pnpm typecheck`, `pnpm test`, `pnpm lint`, `pnpm build:server`, `pnpm release:check`.
- Scripts de operación: migraciones de tenant, backups, provisiones, auditorías (`audit:*`), gates.
- Variables de entorno (solo nombres): `WORKSPACE_MODE`, `AGENT_BACKEND`, `PORT`, `HOST`, `PUBLIC_API_URL`, `DATA_DIR`, `COMPUTER_ENABLED`, `COMPUTER_IMAGE`, `DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME`.

## Datos e integraciones

Monorepo con apps web/servidor, paquetes de dominio, worker y laboratorio UI. Persistencia por `DATABASE_URL`; el modo demo siembra datos sintéticos. Apps y documentos del laboratorio viven dentro del repo, incluida la documentación de este mismo clon.

## Calidad

- Existe CI y varias suites (`test`, `test:browser`, `test:coverage`, `test:cognition-v2`, `release:check`).
- Recuento de tests y resultado actual: **no verificado** (no ejecutado).
- 11 issues abiertas, la mayor carga de la cuenta.

## Límites y riesgos

- Mezcla producto, laboratorio UX y datos sintéticos en un mismo repo: cualquier ficha debe separar los tres para no confundir demo con producto.
- Es el repo más grande de la cuenta (128 MB) y el de mayor actividad; un import completo en Agntia Code debe excluir `node_modules` y artefactos.
- Contiene variables de administración en el ejemplo de entorno; nunca deben viajar al navegador.

## Migración a Agntia Code

1. Alta como proyecto "AgntiaPro", rama `main`, comandos `pnpm install` y `pnpm dev:all`.
2. Marcar en la ficha qué carpetas son producto (`apps/`, `packages/`) y cuáles laboratorio/demo (`apps/ui-lab`).
3. Configurar entornos preview/producción sin copiar secretos; usar `13-entornos` para los nombres.
4. Activar salud mínima: typecheck, build y release-check antes de marcar verde.
