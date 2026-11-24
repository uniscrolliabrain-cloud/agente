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
