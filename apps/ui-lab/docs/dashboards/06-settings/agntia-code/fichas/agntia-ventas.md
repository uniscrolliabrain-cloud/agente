# Ficha · agntia-ventas

| Campo | Valor |
|---|---|
| Repo | `uniscrolliabrain-cloud/agntia-ventas` |
| Visibilidad | Público |
| Proyecto | Vertical Ventas |
| Superficies Agntia Code | Repositorios, Ramas, Revisiones, Bitácora |
| Estado | SCAFFOLD (scaffolding en rama de fábrica; `main` documental) |
| Verificado contra | `main@dc5d2f38f7f99422b5c82e3b1718862207b5827f`, 2026-11-26 |
| Lenguaje | TypeScript |
| Tamaño | 515 KB · 297 archivos |
| Licencia | sin declarar |
| Issues abiertas | 0 |

## Propósito

Vertical de ventas y operaciones comerciales: convertir oportunidades autorizadas en trabajo comercial verificable (CRM, pipeline, reuniones, propuestas y seguimiento), como middleware hacia AgntiaPro/`agente`, sin atribuirse permisos de efecto.

## Qué declara que funciona hoy

- `main` es **DOCUMENTATION_ONLY**: sin aplicación, SDK, proveedores conectados ni despliegue; las 42 campañas están `NOT_STARTED` en el manifest.
- La rama de fábrica añade scaffolding C01–C06 y el bloque comercial C07–C42: contratos Zod estrictos, verificación Supabase JWT con membership provisionada, mandatos/twins, dinero `Decimal` determinista, CPQ, gobierno de aprobaciones, outbox con ACK, migraciones PostgreSQL con RLS forzada y API Hono que falla cerrado.
- Proveedores y credenciales declarados como stub en `packages/sales/src/stubs.ts`.

## Qué no está verificado

- El scaffolding no está en `main`; esta ficha **no** ha revisado la rama de fábrica ni ejecutado sus tests.
- Supabase real, Postgres/RLS en instancia y cualquier proveedor: pendientes.
- No hay evidencia de ejecución fechada en lo leído más allá de `docs/execution-evidence/`.

## Stack y ejecución (manifiesto real)

- `pnpm install`, `pnpm run typecheck`, `pnpm run test`, `pnpm run check`, `pnpm run dev`.
- Monorepo pnpm con `apps/`, `packages/`, `db/` y `docs/`.
- Variables de entorno: no hay `.env.example` en la raíz.

## Datos e integraciones

PostgreSQL con RLS forzada y migraciones versionadas en la rama de fábrica; Supabase como identidad prevista. Sin persistencia en `main`.

## Calidad

- Existe infraestructura de tests en la rama de fábrica; resultado actual **no verificado**.
- Documentación amplia: producto, investigación, referentes, adaptadores, seguridad, UX, servicio y costes.
- `handoff_chat_gpt.md` de 30 KB idéntico al de otros seis repos: ruido, no ficha.

## Límites y riesgos

- La distancia entre `main` y la rama de fábrica es el mayor riesgo de esta ficha: un lector puede creer que hay producto donde solo hay documento.
- Duplicación de funciones con repos hermanos permitida, con `AuthorityMap` por encargo para evitar doble efecto; sin ese mapa, la migración puede crear dos responsables del mismo efecto.
- Sin licencia ni descripción en GitHub.

## Migración a Agntia Code

1. Alta como proyecto "Ventas", rama `main`, sin despliegue (no hay artefacto que servir).
2. Importar la rama de fábrica como rama de trabajo y fijar en la ficha su commit y estado real; mantener `main` como referencia documental.
3. Superficies: Repositorios (vínculo), Ramas y Revisiones (revisar el scaffolding contra `main`), Bitácora (decisiones de autoridad).
4. No marcar `IMPLEMENTATION` hasta que exista una ejecución de tests fechada sobre el commit indicado.
