# Precampaña transversal — registro de infraestructura y certificación de proveedores

Estado: propuesta operativa, no ejecución. Base congelada: e496dd43338107f07d48d62d3e0ea03c0e0c6c89 (main, 2026-11-27).

## Principio
Doppler guarda valores sensibles. Git guarda contratos, nombres de variables, identificadores de recursos no sensibles aprobados y topología. El agente recibe una autorización acotada. La presencia de una clave no equivale a permisos, conexión ni certificación. El kernel conserva autoridad; no se crea otro runtime empresarial.

## Entradas
- [Registro legible por máquina](registry.json): 25 familias de proveedores, entornos, estado y metadatos pendientes. Los IDs desconocidos están vacíos intencionadamente.
- [Campaña y gates](CAMPAIGN.md): orden de ejecución y seguridad.
- [Piloto WhatsApp DEV](WHATSAPP-DEV.md): primer caso, clon fiel de Comunicación.
- [Prompt Freebuff](FREEBUFF.md): instrucciones ejecutables.

## Fuentes que ya existen (no duplicar)
- ../../scripts/connections.ts y ../../scripts/lib/connections.ts: CLI y registro de nombres, aliases y sondas. Revisar sanitización de informes y TLS antes de red.
- ../../scripts/secrets-check.ts y ../../.env.example: requisitos y contratos de entorno.
- ../../apps/server/src/config.ts: aliases en runtime.
- ../operacion/DESPLIEGUE.md, ../operacion/ESTADO-VERTICAL-LAIA-Y-DATOS.md, ../PILOTO-AGNTIA-REVISION.md: evidencia histórica, no estado actual.
- ../../.github/workflows/deploy.yml y ui-lab-pages.yml: release y demo.
- Rama infra/trans00-provider-readiness: suplemento previo diverge de main; revisar selectivamente, no fusionar por defecto.
- Ramas exec/Trans01–06 y campaña canónica: consultar HEADs y estado actual antes de ejecutar; no alterar su superficie.

## Topología y contradicciones
GitHub Pages sirve demo sintética; no recibe webhooks. El operador indica Vercel antiguo y Fly web/lab/worker, con Lab en desuso. El workflow sigue incluyendo Vercel para apps/site. No desplegar allí ni reutilizar Lab. fly.toml apunta a agntiapro-api, worker a agntiapro-worker; Doppler DEV reporta agente-eb4t4a y localhost. La documentación histórica afirma Neon para persistencia; el operador indica Supabase. Identificar instancia, DB y rol reales con evidencia, sin escoger por nombre.

## Política
No publicar tokens, DSNs, correos personales, teléfonos, logs de mensajes ni respuestas de proveedor sin sanitizar. IDs de cuenta, tenant y proyecto se consideran metadatos internos y solo se publican en repositorio de visibilidad aprobada; si es público, usar referencia opaca y registro privado. No cambiar main, ramas de ejecución, secretos existentes, DNS, producción ni activar efectos externos. El documento no autoriza despliegues.
