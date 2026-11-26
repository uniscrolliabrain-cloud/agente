# Ficha · agntia-clientes

| Campo | Valor |
|---|---|
| Repo | `uniscrolliabrain-cloud/agntia-clientes` |
| Visibilidad | Público |
| Proyecto | Vertical Clientes |
| Superficies Agntia Code | Ramas, Pruebas, Observabilidad |
| Estado | SCAFFOLD |
| Verificado contra | `main@8472ea9a5f5b94d753d5a9cafeeeae5d00f8db9d`, 2026-11-26 |
| Lenguaje | TypeScript |
| Tamaño | 1 040 KB |
| Licencia | sin declarar |
| Issues abiertas | 0 |

## Propósito

Empresa SaaS especialista en relación con clientes, atención y customer success: ficha de relación con fuentes, bandeja multicanal, tickets y SLA, conocimiento autorizado, propuestas de respuesta, onboarding, riesgos de relación y reportes.

## Qué declara que funciona hoy

- **SKELETON_IMPLEMENTED**: 42 campañas implementadas con **114 tests locales en verde** y 9 escenarios E2E A–I.
- Dos vertical slices durables (atención y onboarding) verificadas con reinicios del API sobre PostgreSQL real.
- El paquete se instala y arranca en un host limpio (`npm run install:check`); el puente `HostPort` tiene cliente HTTP probado contra su contrato (`npm run bridge:contract`).
- Primera vertical localizada: dos empresas sintéticas → caso → propuesta con evidencia → aprobación humana → intent idempotente → envío a sandbox → receipt → resolución verificable → reporte.

## Qué no está verificado

- Sin proveedores conectados, sin Supabase staging, sin instalación en `/agente` y sin despliegue (declarado por el repo).
- El sandbox es local y se declara `sandbox_only`.
- No se ha ejecutado la suite en esta auditoría.

## Stack y ejecución (manifiesto real)

- `npm ci`, `npm run typecheck`, `npm test`, `npm run build`, `npm start`.
- `npm run install:check`, `npm run bridge:contract`, `npm run slices`, `npm run db:http`, `npm run db:persistence`, `npm run db:verify`, `npm run reports`, `npm run eval`.
- Variables de entorno (solo nombres): `NODE_ENV`, `PORT`, `SUPABASE_PROJECT_REF`, `SUPABASE_ISSUER`, `SUPABASE_AUDIENCE`, `SUPABASE_JWKS_URL`, `SUPABASE_JWT_SECRET`, `CHATWOOT_ENABLED`, `CHATWOOT_BASE_URL`, `TWENTY_ENABLED`, `FRAPPE_ENABLED`, `ZAMMAD_ENABLED`.

## Datos e integraciones

PostgreSQL real para las slices; Supabase previsto para identidad y staging. Candidatos de canal/CRM/tickets: Chatwoot, Twenty o Frappe CRM, Frappe Helpdesk o Zammad, todos desactivables por variable. No se instalan por defecto.

## Calidad

- 114 tests y 9 E2E con reinicios de API: evidencia poco común y valiosa.
- Documentación extensa con informes de implementación, instalación en el padre y anexos por fase.
- La ficha debe conservar `sandbox_only` para no confundirlo con un entorno real.

## Límites y riesgos

- Muchas variables de proveedor: un despliegue prematuro con `*_ENABLED` mal puesto podría intentar conectar servicios reales.
- `SUPABASE_JWT_SECRET` en `.env.example`: solo el nombre; nunca debe viajar al navegador ni a la demo.
- Sin licencia ni descripción en GitHub.

## Migración a Agntia Code

1. Alta como proyecto "Clientes" con `npm ci`, `npm test` y `npm start`.
2. Superficies: Ramas (slices), Pruebas (114) y Observabilidad (bandeja y receipts).
3. Entornos: agrupar Supabase y los cuatro proveedores con todos los `*_ENABLED` en `false` por defecto.
4. No marcar `IMPLEMENTATION` hasta que exista Supabase staging o proveedor sandbox verificado.
