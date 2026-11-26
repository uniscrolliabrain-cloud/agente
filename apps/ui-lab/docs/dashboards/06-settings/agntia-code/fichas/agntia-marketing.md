# Ficha · agntia-marketing

| Campo | Valor |
|---|---|
| Repo | `uniscrolliabrain-cloud/agntia-marketing` |
| Visibilidad | Público |
| Proyecto | Vertical Marketing |
| Superficies Agntia Code | Despliegues, Datos, Observabilidad, Pruebas |
| Estado | IMPLEMENTATION |
| Verificado contra | `main@a13ecfa5267b2b9c992d7223815040977a272b1b`, 2026-11-26 |
| Lenguaje | TypeScript |
| Tamaño | 1 124 KB |
| Licencia | sin declarar |
| Issues abiertas | 0 |

## Propósito

Empresa SaaS especialista en marketing, investigación de mercado, campañas y medición, con middleware para `agente`. Publicidad inicialmente en lectura/propuesta y cuentas de prueba: no opera cuentas reales de terceros.

## Qué declara que funciona hoy

- **IMPLEMENTADO EN `main`**: las 42 campañas tienen código y pruebas; 23 `DONE`, 15 `PARTIAL`, 4 `BLOCKED` por proveedor.
- **169 pruebas** declaradas (107 de campañas, 18 de Postgres real, 12 de API contra Postgres, 5 de estado durable, 13 del worker de outbox, 10 del worker como servicio, 4 de entrega en dos fases).
- Postgres 16 ejecutado: capa SQL verificada con runner nativo; worker de outbox como proceso propio con parada ordenada y entrega sin duplicar en pruebas con tres procesos contra el mismo tenant.
- Autorización leyendo tenant y membership de Postgres; API Hono en `:8787` con portal en `/portal/`.
- Persistencia de producto en documento por tenant (`tenant_state`, etapa 1): sobrevive al reinicio, pero la ruta normalizada sigue `PARTIAL`.

## Qué no está verificado

- Proveedores reales: no conectados, capacidades deshabilitadas y no simuladas (4 campañas bloqueadas por eso).
- Supabase staging, instalación en `/agente` y despliegue: no verificados.
- No se ha ejecutado la suite en esta auditoría.

## Stack y ejecución (manifiesto real)

- `npm install`, `npm run typecheck`, `npm test`, `npm run api:dev`, `npm run worker:dev`, `WORKER_DAEMON=1 npm run worker:dev`.
- `npm run db:migrate`, `npm run pack:sdk`, `npm run verify:pack`.
- Lockfile `package-lock.json`; carpetas `apps/`, `packages/`, `db/`, `docs/`.

## Datos e integraciones

PostgreSQL 16 local para SQL y persistencia por tenant; outbox con entrega en dos fases (reclamo corto → envío → liquidación con fence). Proveedores de anuncios y analítica: pendientes de credenciales.

## Calidad

- Es el repo con la evidencia más concreta de la cuenta: tests por capa, Postgres real, worker como servicio y verificación de tarballs en consumidor limpio.
- Estado por campaña en `docs/evidence/ANEXO-42-FASES.md` y en cada `CAMPAIGN.md`.
- Sin licencia ni descripción en GitHub.

## Límites y riesgos

- 15 campañas `PARTIAL`: la ficha no debe redondear a "terminado".
- Gastar presupuesto publicitario es un efecto externo con coste; el producto lo declara deshabilitado, y así debe mostrarse en Agntia Code.
- `tenant_state` como documento único por tenant es una etapa, no la ruta normalizada; anotarlo evita prometer escalabilidad.

## Migración a Agntia Code

1. Alta como proyecto "Marketing" con `npm install`, `npm test`, `npm run api:dev` y `npm run worker:dev`.
2. Superficies: Despliegues (preview del portal), Datos (Postgres y migraciones), Observabilidad (outbox y worker) y Pruebas (169).
3. Cargar el anexo de 42 fases como bitácora inicial, con sus 23/15/4.
4. Mantener proveedores deshabilitados hasta que existan credenciales sandbox.
