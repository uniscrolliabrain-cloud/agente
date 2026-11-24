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
- Resultado: **pendiente de terminar** en el momento de escribir este documento.
- SHA anterior en producción: no verificable sin `FLY_API_TOKEN`/Vercel; ver rollback.

## Precauciones tomadas

- No se ha tocado `main`; el deploy sale de una rama con el snapshot exacto de la landing.
- `apps/site` se sincronizó con el contenido vivo antes de publicar.
- No hay migraciones ni cambios de esquema.
- El servidor solo añade el fallback estático de `/legal`; no cambia contratos de API.

## Si el gate falla

No se despliega nada: Fly y Vercel dependen de `gate`. El detalle quedará en el run.
