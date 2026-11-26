# Actualización concurrente de conexiones Google

Revisión de partida `24c232c8bf8239155d9afa45a234be1a2edf322e`. Superficie auditada `apps/server/src/google-auth.ts`, blob `09125166d777825b33f393ddae788a4b29de7bf6`. Símbolos examinados: GoogleAuth.refresh y db.updateCredential. [Especificación original](../REDISENO-PASADA-05-EJECUCION-CONSOLIDADA.md)

## Propuesta original y código actual

P02/P03 distinguen el singleflight por proceso del control de generación compartido. El Map de refresh se indexa por owner y connectionId. La actualización SQL en db.ts exige el mismo connectionId.

## Diagnóstico

El vínculo de conexión protege frente al reemplazo por otra conexión. Dos procesos que obtienen respuestas para la misma conexión satisfacen ese mismo predicado. Además refresh parte de tokens y sustituye accessToken y expiresAt. El modelo de respuesta admite refresh_token opcional.

## Decisión propuesta

MEJORAR P03. Incorporar una revisión monotónica al registro. Un escritor compara generación de conexión y revisión leída. Si pierde, descarta el resultado local y relee el ganador bajo el scope vigente. El proveedor puede invalidar material de renovación tras una rotación. Ante resultado ambiguo que impida recuperar acceso, solicitar reconexión.

## Contrato e invariantes

Aceptar un refresh token nuevo cuando el contrato del proveedor lo entregue y conservar el anterior en ausencia del campo. Mantener la revisión fuera del blob cifrado para CAS y fuera de etiquetas de métricas. Evitar serializar secretos en trazas. Caso legacy con revisión ausente debe admitir un solo ganador inicial.

## Prueba discriminante pendiente

Fixture local con dos instancias y dos respuestas controladas. Entregar en orden inverso, simular desconexión durante la espera, cambio de membresía y respuesta sin refresh_token. Verificar revisión ganadora, lectura autorizada posterior y ausencia de respuestas de una vinculación previa.

## Compatibilidad y rollback

Introducir el lector compatible antes del escritor. Mientras existan escritores sin predicado de revisión, mantener deshabilitado el refresh compartido. Una reversión debe drenar esos escritores y preservar la generación.
