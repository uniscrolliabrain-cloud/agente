# Ficha · agntia-finanzas

| Campo | Valor |
|---|---|
| Repo | `uniscrolliabrain-cloud/agntia-finanzas` |
| Visibilidad | Público |
| Proyecto | Vertical Finanzas |
| Superficies Agntia Code | Datos, Pruebas, Despliegues |
| Estado | SCAFFOLD |
| Verificado contra | `main@193faf1690d2741134e31b18895d3431a1a79445`, 2026-11-26 |
| Lenguaje | TypeScript |
| Tamaño | 365 KB |
| Licencia | sin declarar |
| Issues abiertas | 0 |

## Propósito

Finanzas empresariales, tesorería y FP&A: convertir datos económicos autorizados en caja, planificación y decisiones explicables con cálculo determinista, sin confundir un forecast con saldo real ni con autorización de pago.

## Qué declara que funciona hoy

- Documentación completa y scaffolding ejecutable de las fundaciones C01–C05.
- `pnpm test` ejecuta **41 tests y pasa** (según README del 2026-11-15).
- Paquetes: `contracts` (DTOs Zod: `Money` decimal, envelope, errores, `EvidenceRef`, `ApprovalBinding`, `CapabilityReport`, `TwinBinding`, mandato, `AuthorityMap`), `core` (aritmética monetaria decimal, signos por fuente, variance), `auth` (JWT Supabase con JWKS fijo, principal con membership, PEP recurso/campo, revalidación de mandato) y `apps/api` (Hono con errores saneados y catálogo fail-closed).

## Qué no está verificado

- No hay persistencia, adaptadores, UI ni E2E.
- Ninguna capacidad de dominio habilitada: el catálogo responde vacío y toda integración externa es `NOT_VERIFIED`.
- C06–C42 permanecen `NOT_STARTED`; no se ha ejecutado la suite en esta auditoría.

## Stack y ejecución (manifiesto real)

- `pnpm install`, `pnpm typecheck`, `pnpm test`, `pnpm check`, `pnpm dev:api`, `pnpm test:watch`.
- Variables de entorno (solo nombres): `SUPABASE_ISSUER`, `SUPABASE_AUDIENCE`, `SUPABASE_JWKS_URL`, `PORT`.
- Lockfile `pnpm-lock.yaml`; workspaces en `packages/` y `apps/`.

## Datos e integraciones

Sin base de datos propia todavía. La autorización se apoya en JWT de Supabase; el cálculo monetario es determinista y decimal. Proveedores bancarios o de facturación: no conectados.

## Calidad

- 41 tests declarados; contratos estrictos y catálogo fail-closed reducen el riesgo de capacidades fantasma.
- 8 documentos en `docs/` más `docs/execution-program/`.
- Sin licencia ni descripción en GitHub.

## Límites y riesgos

- El riesgo financiero es alto: cualquier lectura de la ficha debe dejar claro que **no hay saldo real ni pagos**.
- Sin persistencia, los cálculos son efímeros; no sirve como libro.
- Variables `SUPABASE_*` en `.env.example`: solo nombres, nunca valores.

## Migración a Agntia Code

1. Alta como proyecto "Finanzas" con `pnpm install`, `pnpm test` y `pnpm typecheck`.
2. Superficies: Datos (cuando exista persistencia), Pruebas (41 tests) y Despliegues deshabilitado hasta tener build servible.
3. Mantener el estado `SCAFFOLD` y el aviso de "sin saldo real" en la ficha del proyecto.
4. Añadir a Entornos los cuatro nombres de variable en preview, sin valores de producción.
