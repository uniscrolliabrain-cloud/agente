# Bitácora — promoción dogfooding V1

| Fecha (UTC) | SHA | Acción | Evidencia | Resultado |
|---|---|---|---|---|
| 2026-11-24 20:20 | `3acd03d` | Auditoría de main, arquitectura y credenciales | `git`, workflows, cabeceras HTTP | Login/Legal aislados; landing divergente |
| 2026-11-24 20:24 | `8b1072e` | Base de campaña con Chat UX V2 | merge local | Sin conflictos |
| 2026-11-24 20:30 | `303cbd6` | Login V3 con OAuth, contraseña y demo reales | typecheck + navegador | PASS |
| 2026-11-24 20:34 | `aeef4e4` | Legal V1 con textos publicados y consentimiento | deep link, 390 px, storage | PASS |
| 2026-11-24 20:39 | `cc57524` | Snapshot de landing viva, redirects y banner | diff de 3 líneas | PASS |
| 2026-11-24 20:40 | `cc57524` | `workflow_dispatch` producción | run 45483309302 | gate y Fly OK; Vercel bloqueado por cuota |
| 2026-11-24 20:49 | `cc57524` | Fly publica API, worker y panel | `/api/health`, bundle nuevo | success |
| 2026-11-24 20:52 | `cc57524` | QA en dominio real | login, legal, OAuth 302, demo, logout | verificado |
| 2026-11-24 20:58 | `dbef479` | Documentación de campaña | este directorio | pusheada |

## Decisiones

- No se tocó `main` ni el deployment vivo antes de preservar la landing.
- No se promovieron superficies con fixtures sin cablear; se documentan como pendientes.
- El deploy usa el workflow existente, no un sistema paralelo.
- No se pidieron ni imprimieron secretos.
