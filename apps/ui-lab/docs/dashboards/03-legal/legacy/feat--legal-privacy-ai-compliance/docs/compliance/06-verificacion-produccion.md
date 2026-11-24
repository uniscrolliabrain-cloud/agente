# Campaña 06 — Verificación, seguridad y checklist de producción

## Dependencias
Campañas 01–05 con informes y evidencias; revisión jurídica externa cuando proceda.

## Fases
1. **Integración**: revisar diffs, conflictos, imports, migraciones, tipos, rutas, permisos y dependencias; no hacer merge automático.
2. **CI**: typecheck, lint, unit, integration, smoke, Playwright E2E móvil/desktop, tests multitenant, OAuth, cookies y DSR. Reportar resultados reales, nunca inventados.
3. **Seguridad**: secretos, headers, XSS, CSRF, almacenamiento de tokens, CSP, CORS, rate limits, SSRF, permisos, PII en logs, RLS y proveedores. Revisar browser worker y perfiles persistentes.
4. **Legal/UX**: enlaces y versiones públicas, consentimientos, transparencia IA, accesibilidad, idioma y flujo de revocación. Validar con navegación real.
5. **Evidencias**: capturas sin datos personales, logs saneados, hashes de commits, test reports, revisión de cambios y matriz con estado actualizado.
6. **Runbooks**: derechos, incidentes, proveedor caído, borrado/restauración, nueva integración, nuevo agente/canal y cambio de políticas.
7. **Go/no-go**: lista de bloqueantes P0/P1, aprobaciones de fundador y legal, acciones externas (Google Console, DPA, DNS, proveedor), rollback y observabilidad.

## Checklist antes de desplegar
- [ ] Inventario y matriz actualizados con fuentes
- [ ] Páginas legales públicas revisadas
- [ ] Cookies no esenciales bloqueadas sin consentimiento
- [ ] Google OAuth, scopes y verificación revisados
- [ ] Derechos RGPD comprobados por tenant
- [ ] Retención, backups y subencargados documentados
- [ ] Transparencia IA y voz/avatar verificada
- [ ] Sin secretos/PII en evidencias ni logs
- [ ] Tests y revisión de seguridad aprobados
- [ ] Aprobación explícita para merge/deploy

## Entregables
`reports/CAMPANA-06-REPORTE.md`, `reports/GO-NO-GO.md`, evidencias, matriz final y handoff de operación.

## Aceptación
Ningún P0 abierto, bloqueantes externos identificados y decisión documentada. El agente se detiene antes de merge y despliegue hasta autorización.
