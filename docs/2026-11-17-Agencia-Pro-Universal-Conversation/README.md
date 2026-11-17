# Agencia Pro Universal Conversation — 17 noviembre 2026

**Estado:** visión y arquitectura propuesta; no implementación aprobada. **Repo:** agente. **Objetivo:** una empresa agéntica accesible mediante un mismo chat continuo desde AgntiaPro, Gmail, Drive, Outlook, Calendar, Teams y futuras superficies.

## Concepto maestro
Una empresa, un harness, una conversación activa por persona y empresa, múltiples ventanas, historial único. El usuario conversa con LAIA en Gmail, cierra Gmail, abre Drive y continúa exactamente el mismo hilo. Sin abrir la web de AgntiaPro, los mensajes ya se han guardado allí. Al volver, ve cronológicamente todo lo conversado y ejecutado. Solo «Nuevo chat» crea un hilo diferente. El usuario puede volver a cualquier hilo antiguo.

**No son varios bots ni copias del chat:** todas las superficies consultan y escriben en el mismo registro autoritativo de AgntiaPro. La aplicación de origen aporta contexto temporal, no identidad ni memoria independientes.

## Índice
- [01 Visión y experiencia](01-concepto/vision-producto.md)
- [02 Historias y comportamiento](01-concepto/escenarios-ux.md)
- [03 Arquitectura](02-arquitectura/arquitectura-maestra.md)
- [04 Contratos](02-arquitectura/contratos-y-modelo-de-datos.md)
- [05 Sincronización](03-conversacion/sincronizacion-y-concurrencia.md)
- [06 Harness y contexto](03-conversacion/harness-contexto-memoria.md)
- [07 Google y Microsoft](04-conectores/google-microsoft-y-superficies.md)
- [08 Seguridad](05-seguridad/identidad-permisos-y-privacidad.md)
- [09 Encaje real en repo](06-integracion-repo/auditoria-y-patchsets.md)
- [10 Roadmap y gates](07-campanas/roadmap-y-gates.md)
- [11 Pruebas y aceptación](08-calidad/pruebas-y-criterios.md)
- [12 Decisiones y preguntas](09-decisiones/adr-y-pendientes.md)

## Prioridad
Primero consolidar el core y establecer los contratos de conversación universal; después clientes embebidos y conectores. No alterar main ni desplegar sin aprobación. Documentación basada en inspección dirigida de main el 17-11-2026, no auditoría exhaustiva de todas las ramas.

## Definición de éxito
A las 09:00 usuario escribe en Gmail; a las 09:05 continúa en Drive; a las 11:00 abre AgntiaPro y encuentra toda la secuencia, con respuestas, origen, herramientas y aprobaciones, sin copiar ni importar nada. Ningún mensaje se pierde por pestañas cerradas, redes intermitentes o ejecuciones concurrentes.
