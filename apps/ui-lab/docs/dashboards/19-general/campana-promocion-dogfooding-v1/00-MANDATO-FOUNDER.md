# Mandato del founder — convergencia UX y dogfooding V1

Fecha: 2026-11-24 · Rama de campaña: `feat/dogfooding-v1` · Producción: `main` intacta.

## Qué pidió el founder

Llevar al producto real el trabajo visual ya construido en UI Lab, conservar toda la
inteligencia y los contratos del software, y publicar una release de dogfooding en el
dominio habitual para poder trabajar desde dentro de AgntiaPro.

## Autorización

- Integración y despliegue del frontend: **autorizados expresamente**.
- Sin merges de Trans01–Trans04 ni de ramas históricas.
- Sin cambios de backend para acomodar estética.
- Sin migraciones de datos ni cambios en Doppler, Fly, Neon o Supabase.
- Legal V1 tiene aprobación **visual**; no aprobación jurídica nueva.

## Realidad encontrada

`apps/web` es el panel real y se sirve desde Fly en `www.agntiapro.com`.
`agntiapro.com` es un sitio estático en Vercel. Su contenido vivo corresponde a la rama
`release/landing-legal-20261122`; el `apps/site` de `main` es una versión anterior.
Desplegar `main` tal cual habría regresado la landing.

## Alcance ejecutado en esta iteración

| Superficie | Estado |
|---|---|
| Landing | preservada; snapshot vivo restaurado en `apps/site`, banner y redirects legales |
| Login V3 | integrado en `apps/web` con contratos reales |
| Legal V1 | integrado en `/legal` con los seis textos publicados |
| Chat transversal V3 | no promovido todavía (solo UI Lab) |
| Centro de Mando V2 | no promovido todavía (solo UI Lab) |
| Chat principal | no promovido todavía (solo UI Lab) |
| Apps Launcher V3 | no promovido todavía (solo UI Lab) |

La tabla se actualiza en `02-MATRIZ-DE-PARIDAD.md` y `06-DEPLOY.md` cuando hay evidencia.
