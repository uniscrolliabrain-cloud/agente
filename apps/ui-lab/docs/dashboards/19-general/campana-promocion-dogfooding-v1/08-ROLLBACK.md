# Rollback

## Landing / Vercel

1. Vercel → proyecto del sitio → Deployments.
2. Identificar el deployment anterior a `cc57524` (el que servía el 2026-11-22).
3. **Promote to Production** sobre ese deployment, o `vercel rollback <url>`.
4. Verificar que `agntiapro.com` vuelve a mostrar la landing sin banner y que los
   `.html` legales siguen respondiendo.

El contenido de `apps/site` es idéntico al vivo más tres líneas; revertir `cc57524`
restaura el estado anterior sin tocar datos.

## Panel / Fly

1. `flyctl releases -a agntiapro-api` para listar releases con sus etiquetas.
2. `flyctl releases rollback <version> -a agntiapro-api` (y el worker si aplica).
3. Verificar `/api/health` y el login.
4. Si se prefiere Git: revertir `303cbd6` y `aeef4e4` y volver a desplegar.

No hay migraciones ni cambios de datos que deshacer.

## Login sin desplegar

`VITE_LOGIN_V3=false` en el build devuelve el `Login.tsx` anterior. Es la vía más rápida
si la nueva presentación impidiera entrar; requiere reconstruir y desplegar.

## Legal

Los seis `.html` siguen existiendo en `apps/site`. Si `/legal` fallara, basta retirar los
redirects de `apps/site/vercel.json` y volver a desplegar la landing; el panel seguiría
sirviendo `/legal` desde el fallback estático.

## Reglas

- No reset destructivo de `main`.
- No borrar trabajo concurrente.
- Rollback selectivo, sin tocar la base de datos.
