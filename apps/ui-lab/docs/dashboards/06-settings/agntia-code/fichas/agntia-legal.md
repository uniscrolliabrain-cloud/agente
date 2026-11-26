# Ficha · agntia-legal

| Campo | Valor |
|---|---|
| Repo | `uniscrolliabrain-cloud/agntia-legal` |
| Visibilidad | Público |
| Proyecto | Vertical Legal |
| Superficies Agntia Code | Revisiones, Entornos, Bitácora |
| Estado | IMPLEMENTATION |
| Verificado contra | `main@5fb797631371d34a2521dbb45b7f042776efd210`, 2026-11-26 |
| Lenguaje | TypeScript (Hono) |
| Tamaño | 438 KB |
| Licencia | sin declarar |
| Issues abiertas | 0 |

## Propósito

Operaciones jurídicas, contratos y cumplimiento: preparar investigación, contratos y expedientes con hechos, citas verificables, vigencia y revisión competente, sin presentar un borrador de LLM como actuación profesional realizada.

## Qué declara que funciona hoy

- Servicio TypeScript/Hono con **221 tests ejecutados en verde** (2026-11-15).
- Contrato en código para las 42 campañas: 16 `IMPLEMENTED`, 24 `PARTIAL`, 2 `STUBBED`, 0 `NOT_STARTED`.
- Sin `LEGAL_JWKS_URL` / `LEGAL_ISSUER` / `LEGAL_AUDIENCE`, todas las rutas autenticadas responden **401**: no existe bypass de desarrollo.
- Proveedor por defecto `not_configured`: ningún efecto se simula como éxito.

## Qué no está verificado

- Proveedores conectados, Supabase/Postgres reales y UI: no verificados.
- RLS probado solo en PGlite; backups y efectos externos siguen `NOT_VERIFIED`.
- No se ha ejecutado la suite en esta auditoría.

## Stack y ejecución (manifiesto real)

- `npm ci`, `npm run typecheck && npm test && npm run build`, `npm run dev`, `npm start`, `npm run test:e2e`.
- Variables de entorno (solo nombres): `PORT`, `LEGAL_JWKS_URL`, `LEGAL_ISSUER`, `LEGAL_AUDIENCE`, `LEGAL_MEMBERSHIPS`.
- Secretos y rotación documentados para Doppler en `docs/integration/DOPPLER.md`.

## Datos e integraciones

Persistencia local y RLS en PGlite para pruebas; sin instancia Postgres validada. Integraciones de firma, notificación o registro: stubs declarados.

## Calidad

- 221 tests con fecha y estado por campaña en `docs/implementation/`.
- Documentación densa: producto, investigación, referentes, adaptadores, seguridad, UX, servicio, costes, evaluación y contratos.
- Postura de seguridad ejemplar: falla cerrado sin JWKS y no simula proveedores.

## Límites y riesgos

- Riesgo profesional alto: el producto prepara borradores y expedientes, no sustituye asesoramiento ni firma. La ficha debe decirlo en la interfaz.
- `PARTIAL` en 24 de 42 campañas: nada de "listo".
- Sin licencia ni descripción en GitHub; `handoff_chat_gpt.md` duplicado.

## Migración a Agntia Code

1. Alta como proyecto "Legal" con `npm ci`, `npm test` y `npm run build`.
2. Superficies: Revisiones (campañas y evidencia), Entornos (las cinco variables por entorno, con 401 por defecto) y Bitácora.
3. Cargar estado 16/24/2/0 como bitácora inicial, fechado al commit de la ficha.
4. Despliegue deshabilitado hasta que exista Supabase/Postgres verificado.
