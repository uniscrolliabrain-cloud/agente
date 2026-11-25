# Deploy

## Pipeline real

`.github/workflows/deploy.yml`, `workflow_dispatch` con `environment=production`:

1. `gate`: typecheck, tests sin red y auditoría de coherencia.
2. `fly`: importa secretos desde Doppler y despliega `agntiapro-api` y
   `agntiapro-worker` con etiqueta de imagen = SHA.
3. `vercel`: `vercel deploy --prod` desde `apps/site`.
4. `smoke`: comprobación contra `https://www.agntiapro.com` (solo producción).

## Ejecución

- Rama: `feat/dogfooding-v1`.
- Commit desplegado: `cc5752453a03d907586a4b726fbf960d669ad5d0`.
- Run: [45483309302](https://github.com/uniscrolliabrain-cloud/agente/actions/runs/45483309302).
- Resultado global: **failure**, por el job de Vercel. No es un fallo de código.

| Job | Resultado | Detalle |
|---|---|---|
| `gate` | success | install, typecheck, `pnpm test` (3 min 32 s) y `audit:coherence` |
| `fly (api + worker)` | success | imagen `cc57524` en `agntiapro-api` y `agntiapro-worker` |
| `vercel (sitio publico)` | **failure** | `api-deployments-free-per-day`: más de 100 deployments/día en el plan gratuito |
| `humo en produccion` | skipped | depende de Vercel |

## Qué quedó publicado

- Panel real en `https://www.agntiapro.com` con el bundle `index-CbQzsTvG.js`:
  Login V3 y `/legal` activos.
- API y worker con la misma etiqueta `cc57524`; `/api/health` responde
  `{"ok":true,"mode":"live","checks":{"database":true,"bus":true,"worker":true,"agentConfigured":true}}`.
- Landing del ápice **sin cambios**: sigue el deployment del 22-nov-2026
  (`last-modified: Sun, 22 Nov 2026 14:03:37 GMT`, `x-vercel-cache: HIT`).

## Bloqueo de Vercel

El log del job muestra que el CLI autentica, resuelve `uniscroll2/agntiapro-site` y sube
15,5 KB, pero la API rechaza el deployment por cuota diaria del plan gratuito. No es un
problema de token, proyecto ni `vercel.json`.

Consecuencia: el banner de la landing y los redirects de las URLs legales antiguas **no
están activos** todavía. No afecta al panel ni a `/legal`. Se puede reintentar el job
`vercel` cuando la cuota se restablezca (24 h) o promover el deployment desde el panel de
Vercel; no requiere cambios de código.

## Incidente del 25-nov-2026: producción retrocedió a una línea antigua

El deploy del 24-nov salió de una rama basada en un `main` anterior al trabajo del 21-22
nov. Producción pasó a un árbol sin la landing premium (`apps/web/src/landing/*`), el
estudio de mando (`workspaces/business-command-studio`), el chat móvil multimodal
(`MobileChatSheet`, `MobileChatVoice*`, `DesktopChatDock`), `publicSite.ts`, las imágenes
públicas y 43 archivos en total. El dominio seguía respondiendo 200, por eso el fallo no
se detectó en el humo.

Causa raíz: dos líneas de `main` divergentes (`3023637` y `3acd03d`) y un deploy manual
desde una rama que solo contenía una de ellas.

### Corrección publicada

- Merge `624507a5` (restaura la línea del 22-nov sobre Login V3/Legal/Centro editorial) y
  merge `effbbc7b` con `main` (UI Lab V9 y documentación). Conflictos resueltos a mano en
  `apps/web/src/App.tsx`, `apps/web/vite.config.ts` y `apps/site/index.html`:
  - la landing pública vuelve a la raíz y el panel sigue en `?acceso=1`;
  - `publicLegalPages` convive con `allowedHosts`;
  - el banner conserva el botón «Configurar cookies».
- `main` avanza por fast-forward a `effbbc7b`; ya no hay ramas de despliegue paralelas.
- Run: [45595680068](https://github.com/uniscrolliabrain-cloud/agente/actions/runs/45595680068).

| Job | Resultado | Detalle |
|---|---|---|
| `gate` | success | typecheck, `pnpm test` (4 min 44 s), `audit:coherence`, `check-legal-site --release` |
| `fly (api + worker)` | success | imagen `effbbc7` en `agntiapro-api` y `agntiapro-worker` |
| `vercel (sitio publico)` | success | cuota restablecida; landing nueva, banner y redirects activos |
| `humo en produccion` | success | `www.agntiapro.com` + ápice |

### Qué se comprobó después

- `https://www.agntiapro.com` sirve `index-CVnGkNt5.js` (674.520 B), el mismo hash que el
  build local de `effbbc7b`; el chunk `BusinessCommandStudio` y `landing/laia.png` existen.
- La raíz muestra la landing premium con navegación, retrato, demo y aviso legal;
  `?acceso=1` muestra Login V3 con OAuth, demo y banner de cookies.
- `/legal` responde 200 y `/api/health` sigue `ok:true, mode:live` con base, bus y worker.
- Ápice: `last-modified: Wed, 25 Nov 2026 10:36:46 GMT`, `cookie-consent` presente y
  `/privacidad.html` responde `307` a `https://www.agntiapro.com/legal#privacidad`.
- Pendiente de mirar por el founder: sesión real con su cuenta y recorrido interno
  (Centro editorial, estudio, chat móvil). No se abrió ninguna cuenta real desde aquí.
