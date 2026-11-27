# Piloto 01 — WhatsApp DEV, clon de Comunicación

## Objetivo y límites
Clonar la presentación vigente del workspace, sin rediseño y sin publicar toda AgntiaPro. No usar el antiguo Lab de Fly ni Vercel; no tocar producción, DNS ni GitHub Pages. Propuesta: Cloudflare Worker con assets estáticos o Pages + Functions, nombre provisional agntia-whatsapp-dev. El plan gratuito se verifica antes de crear recursos. Sin envío automático. Este piloto es transporte/visualización, no certificación del runtime.

## Código existente
- apps/ui-lab/src/full-app.tsx inyecta ComunicacionesWorkspace como demoViews.whatsapp.
- apps/ui-lab/src/comunicaciones/ComunicacionesWorkspace.tsx y comunicaciones.css contienen datos sintéticos, estado de interfaz y pestaña teléfono. Reutilizar presentación exacta y dependencias; desactivar funcionalidades de voz simuladas o etiquetarlas.
- apps/web/src/App.tsx monta WhatsAppView en sesión real; apps/web/src/workspaces/02-whatsapp/api.ts es mock, no contrato real.
- apps/server/src/whatsapp-routes.ts implementa GET/POST /api/whatsapp/webhook, HMAC, routing y rutas autenticadas.
- apps/server/src/engine/whatsapp-inbound.ts requiere binding a cuenta, tenant, owner primario y SOP activa; deduplica inbox, crea tarea SOP.
- apps/server/src/engine/whatsapp-outbound.ts, packages/integrations/src/meta-whatsapp.ts y tests/whatsapp-{webhook,inbound,outbound}.test.ts: reutilizar como referencia contractual; no importar backend Node entero a Worker sin comprobar compatibilidad.
- Actualmente ingreso texto; multimedia/status fuera del alcance.

## A. Preflight
Doppler DEV: WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_BUSINESS_ACCOUNT_ID, WHATSAPP_VERIFY_TOKEN, WHATSAPP_APP_SECRET confirmados presentes por operador. Phone/WABA HTTP 200 con token renovado en momento de prueba, duración desconocida; verificar de nuevo. Verificar app ID, app-secret/token correspondencia, scopes y expiración sin publicar valores. Inventariar callback vigente de app/WABA y suscripciones; no sustituir una conexión activa compartida. Si hay conflicto, usar app/WABA DEV independiente o parar. Confirmar número de prueba y emisor autorizado. No registrar números personales en Git.

## B. Plan de implementación (solo después de gate de autorización)
Nueva rama propia desde SHA acordado; nuevo paquete aislado, reutilizar componentes mediante adaptador de datos y fixtures sin editar originales. Proponer ruta exacta y dependencias. Backend Worker: GET challenge solo con token correcto y texto plano; POST firma HMAC SHA-256 sobre bytes crudos, comparación constante soportada por runtime, límite de tamaño y frecuencia, esquema Meta, allowlist phone_number_id y remitentes de prueba, deduplicación por cuenta/mensaje, persistencia durable antes de 2xx, retry seguro. Rechazar firma inválida; ignorar eventos no soportados sin generar mensajes ficticios. No usar logs de payload. Para almacenamiento usar D1 dedicado o Supabase DEV ya demostrado independiente; comparar coste/retención, aprobar opción. No compartir DATABASE_URL con PROD ni utilizar service key en browser. No copiar datos reales entre entornos.
UI protegida por autenticación y autorización server-side (Cloudflare Access si está disponible o mecanismo equivalente); sin login demo ni datos de prueba mezclados con mensajes reales. Cookie segura, CSRF para mutaciones si existieran, CORS exacto, CSP, no public caching de mensajes. Read-only inbox autenticada; representar solo estados observados. No mostrar una respuesta LAIA simulada como real. Secrets solo en binding backend, allowlist mínima y scoped. El token de envío no es necesario en el receptor si no realiza Graph API; conservar en Doppler.

## C. Gates de prueba
C0 build/typecheck, comparación visual con demo, sin dependencias de producción.
C1 GET challenge válido, inválido, falta de token; POST firmado, manipulado, firma ausente, número incorrecto, texto no permitido, tamaño, reentrega y concurrencia. Persistencia y recuperación después de reinicio. Prueba acceso no autenticado y usuario fuera de allowlist; ningún secreto en bundle/logs.
C2 deploy DEV aprobado con SHA, recurso exacto, presupuesto cero adicional y rollback. Pruebas HTTP sintéticas antes de Meta. No activar webhook por tener un endpoint.
C3 aprobar cambio de callback de app dedicada y suscripción messages/WABA; snapshot previo y reversión. Enviar manualmente un texto neutro desde teléfono autorizado; evidenciar receipt, inbox y UI con ID opaco. No contestar desde el sistema. Comprobar dedupe y ausencia de efectos.
C4 runtime real posterior: verificar tenant DEV provisionado, owner y SOP activa de prueba sin side effects, worker separado, bus y receipts; usar contrato canónico, no proxy que eluda kernel. Solo entonces configurar WHATSAPP_WEBHOOK_BINDINGS en entorno adecuado. No crear un segundo kernel ni persistir directamente en records del runtime. Correlacionar evento, tarea, recepción y transición observada. Si el core no está listo, terminar en C3 y marcar runtime pendiente.

## Rollback
Desactivar suscripción DEV o restaurar callback previo verificado, detener ingreso, revocar credenciales dedicadas solo con aprobación, revertir versión DEV, purgar datos de prueba según retención acordada, comprobar ausencia de cambios PROD. No borrar recursos existentes por coincidencia de nombre.
