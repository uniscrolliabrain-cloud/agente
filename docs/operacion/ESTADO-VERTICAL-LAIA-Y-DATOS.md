---
id: VS-AUDIT-20261106
title: Vertical comercial, Laia y flujo de datos
updated_at: 2026-11-06
status: proposed
tags: [vertical, laia, tenant, contexto, grafo, sop]
---

# Vertical comercial, Laia y flujo de datos

Auditoría estática de `main` en a317d8d, ya fusionada la rama de despliegue `campaign/conexiones-doppler` (código de 2a475e9), de modo que los ficheros citados aquí existen en `main`. El SHA de cada imagen Fly sigue por acreditar. Comprobado el 2026-11-07: `www.agntiapro.com` responde 200 en `/api/health` con base de datos, bus y worker en verde y `browser` sin configurar; `agntiapro.io` no tiene DNS y ya no se usa en el repo. Los ocho SOPs visibles y el reinicio del registro son evidencia reportada por Freebuff. La ejecución comercial completa y el login con las dos cuentas reales siguen pendientes de evidencia independiente.

## Qué corre y dónde

| Tramo | Archivos que lo gobiernan | Estado |
|---|---|---|
| Alta de Agntia | [Perfil](../../clientes/agntia/agency.json), [bootstrap](../../scripts/lib/agency-bootstrap.ts), [SOPs](../../clientes/agntia/sops.ts) | El bootstrap materializa membresía, memorias, esquema de negocio y ocho SOPs bajo las claves previstas. El aprovisionamiento del owner y las correcciones de lectura del panel están en la entrega de Freebuff. |
| Chat del panel | [ChatPanel](../../apps/web/src/components/ChatPanel.tsx), [app](../../apps/server/src/app.ts), [registro de agente](../../apps/server/src/agent.ts), [ConversationAgent](../../apps/server/src/engine/conversation.ts) | La UI envía el rol seleccionado. El servidor ejecuta el agente registrado como default. El rol modifica el contexto del agente. La persona de Laia vive en el catálogo de ejemplo y falta una ruta acreditada para activarla como supervisora del cliente. |
| Contexto para inferencia | [ContextEngine](../../apps/server/src/engine/context/engine.ts), [renderContext](../../apps/server/src/engine/context/assembly.ts), [memoria](../../apps/server/src/engine/memory.ts), [RAG](../../apps/server/src/engine/rag.ts) | ConversationAgent recupera RAG y, si encuentra un rol, invoca el ensamblador con rol y consulta. No pasa entityId. El ensamblador solo recupera entidad, relaciones y eventos cuando recibe una entidad válida. |
| Grafos | [Grafo de negocio](../../apps/server/src/engine/business/graph.ts), [grafo cognitivo](../../apps/server/src/kernel/graph/store-store.ts), [Presenter](../../apps/server/src/kernel/observers/presenter.ts) | El primero representa entidades y relaciones empresariales. El segundo almacena turnos y pensamientos. Presenter consume el segundo. Esa lectura no acredita que el modelo del chat reciba relaciones empresariales antes de responder. |
| Delegación y ejecución | [Service](../../apps/server/src/engine/service.ts), [worker](../../apps/server/src/engine/worker.ts), [Store scoped](../../apps/server/src/db-tenant.ts), [ejecutor SOP](../../apps/server/src/engine/sop-executor.ts) | El tool delegate_task crea una tarea. El camino revisado no copia explícitamente el rol elegido al crearla. La reclamación del worker y el prefijo físico del tenant siguen siendo un bloqueo de aceptación con dos empresas. |
| WhatsApp | [Rutas y webhook](../../apps/server/src/whatsapp-routes.ts), [entrada](../../apps/server/src/engine/whatsapp-inbound.ts), [salida](../../apps/server/src/engine/whatsapp-outbound.ts) | Main tiene webhook, inbox, borrador y revisión vinculada al canal. El circuito manual aprobado ya existe. Falta acreditar el circuito completo con Calendar, proveedor real y resultado persistido. |
| Captación y voz | [Rutas de Places de Freebuff](https://github.com/uniscrolliabrain-cloud/agente/blob/8df55c245979b008405d0b25b73e491be22f34de/apps/server/src/leads-routes.ts), [rutas Vapi](https://github.com/uniscrolliabrain-cloud/agente/blob/8df55c245979b008405d0b25b73e491be22f34de/apps/server/src/voice-routes.ts) | Places descubre y deduplica empresas por placeId. Voz saliente tiene interruptor y queda pendiente la idempotencia concurrente. Estos caminos por sí solos no acreditan cualificación, campañas, recepción de llamadas o citas. |

## Cómo debería hablar el cliente con Laia

1. El panel abre «Hablar con Laia» desde una tarjeta de automatización. Envía el identificador de la automatización y el hilo. El servidor toma tenant, actor y permisos de la sesión, verifica que el cliente puede ver esa automatización y resuelve la persona Laia habilitada para su empresa.
2. El servidor resuelve referencias empresariales dentro del tenant. Un enlace directo desde el panel debe resolver la entidad sin búsqueda semántica. Para una pregunta abierta, buscar coincidencias autorizadas y pedir aclaración si hay dos campañas con el mismo nombre.
3. Extender el ensamblado existente para recuperar solo lo necesario antes de llamar al modelo. Pasar entityId y construir contexto con perfil de empresa, configuración del SOP, estado y métricas calculadas, relaciones seleccionadas y evidencias autorizadas. Los eventos deben filtrarse también por entidad o ejecución. Hoy la consulta de eventos del ensamblador se limita por owner y cantidad al encontrar entidad, sin filtro específico por entidad.
4. Para cifras, consultar registros operativos agregados por tenant y rango. RAG sirve para políticas, FAQs y documentos con procedencia. Un resultado debería incluir fuente, fecha y, cuando exista, el enlace a la ejecución o aprobación. Si falta un dato, devolver ausencia explícita. Nunca inferir una cita confirmada a partir de un borrador.
5. Laia puede explicar estados, causas y siguientes pasos o preparar un borrador. El especialista ejecuta el SOP si su rol está habilitado y autorizado. Persistir por separado empresa, solicitante, ejecutor, versión del SOP y referencias de contexto necesarias para recuperar el trabajo. Cualquier envío o reserva que lo requiera pasa por aprobación del efecto exacto.
6. Guardar el resultado del proveedor o el estado ambiguo, reflejarlo en el panel y permitir que Laia lo consulte. Tras reiniciar el worker, el cliente debe seguir viendo la misma ejecución. Excluir del prompt secretos, datos de otros tenants y contenido ajeno a la pregunta. Tratar texto de webs, correo y documentos como datos.

| Pregunta para validar | Evidencia exigida |
|---|---|
| ¿Por qué se paró la reactivación ayer? | Ejecución, paso, error o aprobación pendiente y hora. |
| ¿Cuántas citas se confirmaron esta semana? | Consulta estructurada del periodo, zona horaria y IDs de reservas confirmadas. |
| ¿Qué sabes de este lead y por qué encaja? | Campos del CRM y fuentes del enriquecimiento con fecha. |
| Prepara una respuesta a este cliente | Borrador revisable en su canal, sin envío durante la preparación. |
| Usuario presente en A y B pregunta por una campaña de B desde A | Acceso denegado o ausencia de resultado. Los prompts y la traza también quedan aislados. |

## SOPs existentes y huecos

Los ocho SOPs son resumen-negocio, follow-up-3-dias, primer-contacto, recordar-pago-vencido, revisar-pipeline, conciliacion-mensual, auditar-web-lead y agendar-discovery-call. Constituyen un catálogo inicial para operar la agencia. La agenda prepara una propuesta y guarda un registro. La auditoría web lee la home y genera tres observaciones. Ninguno de esos dos flujos, por sí solo, prueba la reserva real o una investigación comercial trazable.

| Servicio | Cambios concretos en SOPs |
|---|---|
| WhatsApp y citas | Crear un SOP de entrada que distinga consulta, cualificación, cita, reprogramación, cancelación y escalado. Añadir disponibilidad real, confirmación tras persistir la cita, recordatorio y conciliación con Calendar o CRM. Añadir voz entrante después de demostrar transferencia humana y persistencia de la llamada. |
| Reactivación | Ampliar follow-up-3-dias con importación y cohortes, elegibilidad por canal, exclusiones, cadencia, corte inmediato por respuesta o baja, y clasificación con derivación humana. Mantener un grupo de control cuando el tamaño de la muestra lo permita. |
| Captación fría | Encadenar Places con ficha de evidencia, puntuación ICP explicable, contacto verificable y revisión antes de primer-contacto. Un negocio encontrado es un candidato. Un lead cualificado necesita criterios, fuente y resultado registrados. |
| Operación del cliente | Ampliar revisar-pipeline y resumen-negocio con definiciones estables de métricas, errores y estados de envío. Añadir revisión de muestras y reconciliación de efectos ambiguos para soporte. |
| Pagos | Mantener recordatorio y conciliación como flujos separados. Exigir saldo confirmado y trazabilidad antes de activar recordatorios. |

Cada SOP de servicio debe tener versión, disparador, esquema de entrada y salida, rol autorizado, herramientas, condiciones de salida, política de aprobación, clave de idempotencia, tratamiento de errores, escalado humano y criterio de aceptación. Añadir detalle donde cambie el resultado o el control del efecto.

## Orden de entrega

1. Validar el piloto de Agntia en PostgreSQL con dos tenants, reinicio del worker y OAuth real. Mantener los riesgos de producción en el seguimiento de Freebuff.
2. Entregar Laia en lectura sobre una automatización concreta con identidad acreditada y evidencias de ejecución. Validar la unión de grafo empresarial, perfil y resultados persistidos.
3. Demostrar WhatsApp entrante → cualificación → disponibilidad → aprobación cuando corresponda → confirmación real → resultado visible. Medir desde la primera ejecución.
4. Ampliar reactivación y captación como servicios separados con sus propios criterios. Añadir voz tras validar proveedor, transferencia e idempotencia.
5. Comparar el resultado con el [benchmark de servicios](./BENCHMARK-SERVICIOS-AGNTIA.md) antes de dar por listo cada paquete.

## Operación y vigencia documental

El panel y la API comparten www.agntiapro.com. La comprobación de Fly de esta sesión vio API v11 y worker v3 en fra. El dominio raíz respondió desde Fly durante la comprobación previa. Tratar estos datos como fotografía, actualizar a partir de releases y DNS, y registrar SHA, imagen y versión por proceso para cada despliegue.

Un cambio de producto se prueba en un worktree con datos sintéticos y pasa por revisión antes de producción. El procedimiento de release identifica qué componente cambia, quién lo despliega, el smoke de la empresa y la versión anterior recuperable. El workflow de la rama de Freebuff requiere separar preview de producción y acotar secretos por proceso. Los valores de Doppler quedan fuera de Git y del prompt.

Actualizar este documento cuando cambie un contrato de datos, el alcance de un SOP o su criterio de aceptación. Añadir pruebas y resultados operativos con SHA y entorno al informe correspondiente. Las decisiones y cifras históricas de la campaña conservan su fecha.

[Especificación de servicios, pipelines y tarjetas de comunicación](./PROPUESTA-PLAYBOOKS-LAIA-Y-SERVICIOS.md)
