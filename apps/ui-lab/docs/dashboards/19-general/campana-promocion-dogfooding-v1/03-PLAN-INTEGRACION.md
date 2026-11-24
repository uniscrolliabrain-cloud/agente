# Plan de integración y estado

## Fase A — Preparación

- [x] SHA de `main` (`3acd03d`) y arquitectura Vercel/Fly identificados.
- [x] Contratos de autenticación, rutas OAuth y sesión inspeccionados.
- [x] Recursos locales (Manrope, Fraunces, marca) inventariados.
- [x] Divergencia de landing detectada y snapshot vivo restaurado.
- [ ] SHA desplegado y releases de Fly: requieren token de infraestructura.

## Fase B — Acceso público

- [x] Login V3 promovido con `onLogin`, `onEnterDemo`, OAuth real y errores.
- [x] Login anterior reversible con `VITE_LOGIN_V3=false`.
- [x] Legal V1 en `/legal` con seis documentos y deep links.
- [x] Rutas antiguas `.html` redirigidas en Vercel y en cliente.
- [x] Banner a 5 s en landing, login y legal; aceptar/rechazar/configurar.
- [x] Preferencias persistentes y reapertura desde footer.
- [x] Sin cookies ni servicios opcionales antes de decidir.
- [ ] Landing: el footer usa redirects; no se reconstruyó la landing.

## Fase C — Superficies operativas

- [x] Centro de Mando editorial con `getCompanyOverview` y permisos reales.
- [x] Chat principal UX V2 sobre `useChat`, adjuntos y stream reales.
- [ ] Chat transversal V3 (sigue en UI Lab).
- [ ] Deploy de las dos superficies nuevas: mañana, con Vercel.

## Fase D — Navegación empresarial

- [ ] Apps Launcher y mapeo de los 35 ids a workspaces reales.

## Fase E — Convergencia y deploy

- [x] Typecheck global y build de `apps/web`.
- [x] QA de navegador de Login, Legal, consentimiento y móvil.
- [x] Commit pequeño por superficie y rama publicada.
- [x] Workflow de producción lanzado (`run 45483309302`); Fly y gate en verde.
- [x] Verificación en dominio: Login V3, `/legal`, OAuth 302, demo y logout.
- [ ] Landing y redirects del ápice: bloqueados por cuota diaria de Vercel.
- [ ] Login completo y restauración con una cuenta real.
