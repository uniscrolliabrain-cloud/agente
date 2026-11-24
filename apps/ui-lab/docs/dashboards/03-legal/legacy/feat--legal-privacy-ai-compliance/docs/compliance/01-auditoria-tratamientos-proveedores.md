# Campaña 01 — Auditoría de tratamientos y proveedores

## Meta
Inventario **real** y trazable de datos, finalidades, flujos, cookies, OAuth, terceros, ramas y código. Base obligatoria para campañas 02–05.

## Fases
### A. Reconocimiento
- Registrar SHA main, rama, worktrees y PRs relevantes; inventariar frontend, backend, worker, scripts, CI, migraciones y docs; marcar documentación legacy.
- Buscar referencias a localStorage, sessionStorage, document.cookie, set-cookie, trackers, SDKs, cookies de sesión y terceros.
- Inspeccionar auth real, callback OAuth y almacenamiento de sesión. En `oauth-login.ts` hay comentarios sobre localStorage: verificar comportamiento real y riesgos XSS, sin dar por probado el hallazgo.
### B. Mapa de datos
- Trazar alta/login, usuarios, empleados, invitados, agentes, leads, Gmail/Drive/Calendar, Google Maps, WhatsApp, voz, vídeo, memoria, RAG, auditoría, eventos, snapshots, backups, exportaciones y borrados.
- Para cada dato: origen, finalidad, base jurídica propuesta (pendiente legal), categoría, responsable/encargado, tenant, tablas, endpoints, destinatarios, país, plazo de retención, borrado, acceso.
### C. Proveedores
- Contrastar Google, Vercel, Fly.io, Neon, Cloudflare, Resend, Anam, ElevenLabs, modelos LLM, Meta, VAPI, Apify, monitorización y otros realmente invocados; distinguir configurado vs activo vs legado.
- Verificar contratos DPA, subencargados, ubicación y transferencias internacionales, SCC cuando corresponda; sin inventar regiones o garantías.
### D. OAuth y cookies
- Inventariar scopes reales por flujo: login vs conectores; política Google API Services User Data y scopes restringidos cuando aplique.
- Matriz cookies necesarias/no necesarias, dominio, duración, finalidad, tercero, consentimiento, storage y comportamiento preconsentimiento.
### E. Riesgos y reporte
- Evaluar PII en logs/eventos y si hash-chain permite reidentificación. Verificar si hay perfilado, decisiones automatizadas y categorías especiales.
- Producir mapa de flujo y lista priorizada P0/P1/P2 con evidencia de código.

## Entregables
`inventario/DATOS-Y-FLUJOS.md`, `inventario/PROVEEDORES-Y-TRANSFERENCIAS.md`, `inventario/COOKIES-STORAGE.md`, `inventario/OAUTH-SCOPES.md`, `reports/CAMPANA-01-REPORTE.md`; actualizar matriz.

## Aceptación
Todos los flujos relevantes tienen fuente de código o están explícitamente marcados desconocidos; terceros y transferencias sin suposiciones; riesgos priorizados; revisión de alcance por fundador. No implementar CMP antes de este inventario.
