# Campaña — INFRA-00 a INFRA-06

## INFRA-00 | Baseline y exclusión mutua
Fijar SHA del código, identificar rama de integración autorizada y cambios concurrentes. Leer README, campaña canónica, scripts de conexiones, secrets-check, config, .env.example, workflows y suplemento infra/trans00-provider-readiness. Comparar contratos existentes con registry.json; no implementar otro inventario paralelo. Registrar visibilidad Git y permisos del agente. No checkout destructivo, merge, rebase, force push, tag ni dispatch.

## INFRA-01 | Acceso Doppler y resolución
Usar exclusivamente proyecto agntiapro/config dev_campaign_transversal_leads_ia con token DEV de lectura. Confirmar que el runner realmente llega a api.doppler.com y que el token corresponde al config. No inferir permisos por presencia de DOPPLER_TOKEN. No imprimir env, set, env vars, descargas de secretos, URLs con query sensible ni activar shell trace. Si la red bloquea, registrar BLOCKED_NETWORK y usar CI autorizado o Linux; no eludir restricciones.
Revisar la ejecución del CLI canónico. Ejemplo de inventario local (sin red a proveedores):
    doppler run --project agntiapro --config dev_campaign_transversal_leads_ia -- pnpm connections --only=whatsapp
Verificar que cualquier consulta interna de Doppler usa proyecto/config correctos y que ningún secreto del shell suplanta un valor. La resolución debe distinguir nombres canónicos, alias, origen y obligatoriedad según entorno. No rotar ni crear credenciales sin aprobación.

## INFRA-02 | Inventario de recursos
Consultar APIs de metadatos con operaciones explícitamente permitidas, timeout, sin redirecciones que reenvíen Authorization, TLS verificado y límites de peticiones. Nunca ejecutar todos los probes ciegamente: revisar scripts/lib/connections.ts (algunas sondas exponen detalles, realizan canjes OAuth o usan TLS sin verificar). No usar credenciales de infraestructura en browser ni en el runtime.
Por proveedor: identificar cuenta, recurso exacto, entorno, región, permisos mínimos, expiración, cuotas y referencias de secretos; contrastar con config y código. No extraer contenido de buzones, mensajes ni DB. Para DB verificar identidad y rol con sesión de solo lectura; evitar arranque del servidor que pudiera migrar esquemas. Confirmar DEV distinto de PROD y de datos reales; si no es demostrable, BLOCKED_ISOLATION.
Actualizar registry.json solo con metadatos autorizados y fuente/fecha. Nunca copiar valores desde Doppler indiscriminadamente. Las referencias a variables nuevas son propuestas hasta que el código las soporte.

## INFRA-03 | Certificación escalonada
Estados: NOT_CONFIGURED, CONFIG_PRESENT, AUTH_VERIFIED, RESOURCE_VERIFIED, CONTRACT_TESTED, DEPLOYED_DEV, E2E_DEV_VERIFIED, BLOCKED. Cada estado exige prueba propia; no ascender por inferencia. Mantener expiry, timestamp, commit, entorno, operación, status y evidencia sanitizada. Los 401, 403, 404, 429, proxy, timeout y cuota son clases distintas. Contratos: tests existentes, fallos, aislamiento, idempotencia, retries, recuperación y ausencia de efectos no autorizados. Sin red por defecto; cualquier probe billable o mutación exige aprobación específica.

## INFRA-04 | Propuesta de infraestructura DEV
Comparar opciones sin costes recurrentes adicionales: Cloudflare Pages + Functions o Worker con assets, y almacenamiento DEV aislado. Verificar plan y límites en documentación oficial y cuenta. No Vercel, no Fly antiguo Lab, no Fly producción. Preparar plan con target exacto, identidad de despliegue, allowlist de variables, recurso DB separado, autenticación, política de retención, rollback, presupuesto y SHA. No usar workflow general de deploy como atajo: su config por defecto es prd y preview requiere API y worker independientes. No crear recursos ni secretos hasta aprobación.

## INFRA-05 | Piloto WhatsApp
Seguir WHATSAPP-DEV.md. Primero recepción de texto con un número de prueba y teléfono autorizado; luego persistencia y UI autenticada. Los mensajes no activan un SOP inexistente ni herramientas. La integración real al runtime es un gate posterior, sujeto a la convergencia actual.

## INFRA-06 | Handoff y operación
Publicar documentación de recursos y evidencia exclusivamente en rama propia autorizada. Entregar matriz de permisos, valores pendientes por nombre, bloqueos, inventario de costos, plan de reversión, diff y tests. Identificar quién rota token y cómo se detecta caducidad. Separar pruebas de proveedor, integración, deploy y operación. Ningún cambio de producción ni release.
Formato de evidence.json propuesto: {schemaVersion, commit, environment, provider, resourceRef, operation, testedAt, status, httpStatus, errorClass, evidenceRef, expiresAt, limitations}. No payload, headers, PII ni secreto. Los reportes reales se guardan en artefactos privados sanitizados, no en Pages. Si no hay evidencia, dejar null y razón.
