# BEFORE — VS-02a: aprobación durable de WhatsApp

Base: main 4f81f22. Inicio: 2026-10-31 (Europe/Madrid). Responsable: jefe VS/Codex. No es un cierre del canal ni un despliegue.

El panel hace get(status=awaiting_review) -> sendText -> put: dos peticiones pueden enviar el mismo borrador. Rechazar puede sobrescribir un envío en curso. El adapter convierte errores de red en AppError genérico y el router los infiere por texto; puede marcar como fallo lo que sí salió. La conexión WhatsApp de AgentService es global. La validación del número contiene una expresión regular incorrecta.

Alcance exclusivo VS: whatsapp-routes.ts; nuevo engine/whatsapp-outbound.ts; adapter packages/integrations/src/stubs/whatsapp.ts; tests nuevos y documentación. No editar service/worker/model/conversation/app/config/db/tenant/domain reservados por NC. La reserva se ha comunicado al jefe NC. La creación de drafts desde chat sigue como dependencia de integración; se expondrá creación explícita autenticada sin tocar conversación.

Entrega: conexión cifrada por tenant/owner provisionada por operador, sin fallback global; aprobación vinculada a snapshot/revisión; registro persistente único de decisión/efecto; accepted distinto de delivered; sin reenvío automático ante respuesta ambigua; rechazo concurrente exclusivo; bandera global explícita y conexión habilitada, más allowlist de destinatarios del piloto.

Pruebas: concurrencia y doble aprobación/rechazo; aislamiento del mismo usuario en dos tenants; cambio de contenido/conexión; desactivación; reinicio de Store; fallo antes/después de efecto/persistencia; errores HTTP y cuerpo inválido del adapter. Sin red real, cargos, mensajes o secretos productivos. Informar evidencia real vs simulada. Rollback: desactivar salida, conservar ledger y datos; nunca borrar registros para reintentar.

### Continuación: respuesta manual desde inbox

Se amplía la misma unidad para consumir la inbox persistente ya integrada, sin modificar su escritor ni el worker. La respuesta se liga al ID de inbox y al canal Evolution de origen; la persona no puede cambiar el destinatario al responder. Meta se muestra, pero no se ofrece respuesta hasta implementar su adaptador de salida. No se presenta como ejecución del SOP ni como respuesta automática LLM.
