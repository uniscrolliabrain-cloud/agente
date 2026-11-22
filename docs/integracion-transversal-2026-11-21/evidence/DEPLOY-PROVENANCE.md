# Procedencia de despliegue · 2026-11-21

El último despliegue de producción registrado por GitHub corresponde a `18ee1c1f0387e5a9f3cf7044936bbb687dac77c6`, HEAD del PR #16. La ejecución fue un despacho manual. Los registros de despliegue `7962608367` y `7962608369` tienen estado success.

- Fly desplegó `registry.fly.io/agntiapro-api:18ee1c1` y `registry.fly.io/agntiapro-worker:18ee1c1` en producción. El panel y la API comparten origen en `www.agntiapro.com`. El Dockerfile compila e incluye el frontend y el servidor lo sirve. [Job Fly](https://github.com/uniscrolliabrain-cloud/agente/actions/runs/44898256365/job/136829352167)
- Vercel publicó `apps/site` en `agntiapro-site-kixv1iirl-uniscroll2.vercel.app` y asignó `agntiapro.com`. [Job Vercel](https://github.com/uniscrolliabrain-cloud/agente/actions/runs/44898256365/job/136829352180)
- La comprobación pública devolvió HTTP 200 para ambos dominios, cabeceras Fly en el panel y Vercel en el sitio. El endpoint de salud del panel devolvió `ok: true`, `mode: live` sin SHA. El smoke de la ejecución terminó correctamente. [Smoke](https://github.com/uniscrolliabrain-cloud/agente/actions/runs/44898256365/job/136830067081)

El workflow versionado se activa mediante tags `v*` o despacho manual. La ejecución anterior conocida sobre main fue `44763885023` con `3023637`. Queda pendiente verificar de forma independiente las imágenes y el alias activos en los proveedores, así como el SHA de la demo privada probada por el usuario.
