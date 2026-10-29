# Campaña transversal AGNTIA: del repositorio al primer servicio operado

Fecha de referencia: 2026-10-29. Responsable de producto y autorizaciones: Alfonso. Implementación por fases: Freebuff. Revisión técnica e integración: Codex. Documentación e inventario: Cline, sin cambios de código salvo instrucción expresa de Alfonso.

## 1. Objetivo y límites

Poner en producción un vertical comercial estrecho del OS: una empresa provisionada manualmente, con usuarios separados, conexiones propias, chat conversacional y automatizaciones que produzcan resultados observables. La primera empresa es Agntia Pro (tenant agntia). Después se incorporan clientes como tenants, sin bifurcar el producto ni compartir sus datos o credenciales.

El servicio se vende como implantación y operación mensual. Alfonso ha mencionado aproximadamente 1.200 EUR de implantación y 850 EUR/mes; clientes/agntia/agency.json aún contiene planes de 490/890/1.490 EUR. Pendiente decisión comercial: no modificar ni publicar precios por inferencia.

El panel y la API compartirán https://www.agntiapro.com. El dominio raíz puede albergar la web comercial. No se exige acabar los 34 módulos, el compilador general o la red de nodos agénticos para vender el piloto. El onboarding inicial puede ser manual y el chat puede ser conversacional con herramientas acotadas.

La plataforma se prepara para: reactivación de leads antiguos; captación y cualificación; atención WhatsApp y voz; reserva de citas; seguimiento y borradores de correo; consulta del contexto empresarial. Estos son productos progresivos, no seis lanzamientos simultáneos. El primer flujo completo será atención entrante por WhatsApp -> cualificación -> propuesta de cita -> aprobación cuando proceda -> Calendar -> confirmación -> registro y KPI. Correo y conocimiento de Drive amplían ese flujo. Prospección, voz y pagos se activan después de sus propios criterios de salida.

## 2. Estado comprobado y fuentes

Main incorpora la PR #1 (83d20b2): los dos commits de Freebuff c5a8c7c/9082fba y la revisión de recepción WhatsApp. Hay bindings de canal a tenant/responsable/SOP, autenticación separada Meta/Evolution, lotes e inbox persistente e identidad estable de tarea. Las 38 pruebas dirigidas volvieron a pasar el 29 de octubre. Eso acredita recepción y aislamiento local, no entrega real ni el vertical completo.

Permanecen pendientes: contexto del worker en recuperación, salida aprobada por tenant, conexión real de proveedores, despliegue, fallos generales de CI y correo conversacional. El diagnóstico anterior de suite amplia no fue verde. No usar el número de tests o los marcadores de comentarios como prueba de producto.

La última comprobación de infraestructura (28 de octubre) encontró www sin resolución DNS y CLI de Fly/Vercel sin sesión. Hay que comprobarlo de nuevo cuando se vaya a desplegar: no confundir una fotografía anterior con estado actual. Las cuentas y secretos que Alfonso está preparando en Doppler son declarados por él; no se han verificado individualmente ni leído sus valores.

Fuentes prioritarias: código y configuración en el commit revisado; pruebas específicas reproducibles; entregas controladas al proveedor; despliegue observable. Los handoffs y documentos históricos son contexto. Ver PILOTO-AGNTIA-REVISION.md para las correcciones y límites de la primera entrega.

## 3. Camino transversal de datos

Proveedor o usuario -> autenticación del evento/sesión -> resolución explícita de tenant y actor -> entrada persistida -> identidad de operación -> tarea/SOP y contexto -> conexión autorizada del tenant -> herramienta -> aprobación ligada al efecto -> ejecución -> resultado/estado ambiguo -> registro de auditoría y vista del panel.

Cada tramo debe conservar tenantId, actorId, correlationId y operationId cuando corresponda. La firma del proveedor acredita al emisor, no selecciona por sí sola al cliente. El LLM no puede elegir arbitrariamente un tenant, una credencial, una URL interna ni elevar permisos.

Invariantes de toda la campaña:

- Ninguna caída silenciosa a system/default para ejecutar datos de un cliente desconocido.
- Mismo usuario en dos empresas: el contexto activo y el trabajo persistido seleccionan la empresa correcta, también al reiniciar el worker.
- Las reentregas y dobles clics no duplican efectos. Un timeout después de enviar puede ser resultado desconocido; se reconcilia, no se reenvía a ciegas.
- Una aprobación autoriza actor/tenant/contenido/destinatario concretos y caduca o se invalida si cambia el efecto.
- Los tokens de cliente pertenecen a conexiones de su tenant, protegidas en almacenamiento y omitidas de logs, prompts, respuestas y Git.
- El panel distingue preparado, pendiente de aprobación, ejecutando, confirmado, fallido y desconocido. No llama enviado a una tarea en cola.
- Límites de coste y frecuencia por tenant; interruptor de desactivación y procedimiento de recuperación.
- El contenido de mensajes, correos y documentos es entrada no confiable y no concede autoridad sobre herramientas.

## 4. Trabajo en ramas y supervisión

Cada fase o subfase comienza desde origin/main actualizado, en una rama nueva campaign/vs-NN-descripcion y un checkout/worktree separado. No reutilizar ramas ya integradas. No hacer checkout, reset, stash ni limpieza sobre el checkout del Escritorio: contiene trabajo local de Alfonso. No tocar ramas ajenas o archivos de Cline incidentalmente.

Freebuff entrega una PR por unidad revisable: problema, alcance, archivos cambiados, recorrido antes/después, evidencia, limitaciones, configuración sin valores secretos, migración y rollback. Si descubre un requisito fuera del alcance, lo documenta y propone una subfase; no amplía silenciosamente la campaña.

Codex revisa diff y camino de datos, corrige defectos locales dentro de la misma rama o pide revisión concreta. La revisión se concentra en el cambio y sus fronteras. Pruebas dirigidas y typecheck apropiado; no repetir suites completas por rutina. Los fallos de base se registran y se comparan con main antes de atribuirlos al cambio. Nunca desactivar controles para fabricar verde.

La decisión de merge exige: alcance cerrado, aislamiento y permisos verificables, efecto observable cuando sea integración real, secretos fuera del diff, y riesgos explícitos. Un defecto que permita cruzar tenants, perder mensajes, enviar dos veces o exponer tokens bloquea esa entrega. Los problemas independientes de base necesitan resolución o una decisión explícita de integración acotada del propietario, sin ocultarlos.

Tras integrar: verificar SHA en main, actualizar el informe, marcar la fase cerrada y enlazar evidencia. Cerrar PRs sustituidas con explicación. Borrar la rama remota solo cuando esté integrada, no sea compartida y no contenga trabajo posterior; nunca borrar una rama con trabajo pendiente. Conservar el historial en main.

La supervisión se realiza cuando Alfonso trae la entrega o autoriza trabajar sobre la PR; este documento no instala un monitor ni autoriza mensajes automáticos a otros agentes. Freebuff no debe abrir seis fases de implementación simultáneas: una unidad activa del camino crítico; documentación independiente puede avanzar en paralelo.

## 5. Fases ejecutables

### VS-00 — Contrato del piloto e inventario de conexiones

Rama: campaign/vs-00-contrato. Estado: planificación en este documento; no se considera cerrada hasta confirmar datos de producto y operación.

Entregar: primer producto elegido, owner real de agntia, usuarios/roles, recursos del piloto, topología del despliegue y matriz de conexiones con estado. Contrastar variables con sus consumidores en código; variable propuesta no equivale a integración existente. Registrar por proveedor: preparado, implementado, autenticado, probado con proveedor, desplegado.

Salida: onboarding manual reproducible sin contraseñas en documentos. Alfonso confirma remitentes, número, calendario, oferta y límites. No bloquear el trabajo de código en VS-01 por proveedores que no se utilizan aún.

### VS-01 — Contexto durable de tareas, conexiones y recuperación

Rama: campaign/vs-01-tenant-runtime. Dependencia: base actual de main.

Entregar: tenant/actor persistidos y restaurados al reclamar, continuar o recuperar tareas; conexiones resueltas por identidad de tenant y servicio; ningún worker reconstruye el tenant únicamente desde la membership primaria. Conservar compatibilidad y preparar migración explícita para registros anteriores. Revisar si se puede levantar la restricción actual de responsable primario dedicado de WhatsApp solo después de validar este camino.

Pruebas decisivas: un usuario en dos tenants, trabajo concurrente, reinicio entre recepción y ejecución, reanudación de aprobación y rechazo de una conexión ajena. Salida: efectos y artefactos permanecen en la empresa correcta antes y después del reinicio.

### VS-02 — WhatsApp completo con envío aprobado

Rama: campaign/vs-02-whatsapp-outbound. Dependencia: VS-01 para contexto de ejecución.

Elegir primero Meta o Evolution con Alfonso; no implementar ambos por obligación. Usar el inbox ya integrado. Cerrar SOP real -> borrador -> aprobación -> envío con conexión del tenant -> resultado visible. Sustituir el check-then-send del panel por un mecanismo de exclusión e identidad estable que soporte dobles clics y concurrencia. Separar accepted de delivered; incorporar estados del proveedor cuando el canal los ofrezca y reconciliar resultados ambiguos.

Salida: un mensaje real controlado de Alfonso recorre entrada y respuesta; reentrega, doble aprobación y reinicio no producen dos envíos. Registrar IDs y tiempos sin publicar texto privado o secretos. Si el proveedor no permite garantizar un reenvío seguro, mostrar revisión/reconciliación manual y no prometer exactly-once externo.

### VS-03 — Google OAuth, correo y agenda

Ramas sucesivas: campaign/vs-03a-google-connections y campaign/vs-03b-mail-calendar.

Separar login de la autorización de Gmail/Calendar/Drive. State de un uso ligado a sesión/tenant/actor, callbacks validados, scopes mínimos, renovación y revocación. No tomar un owner recibido sin prueba como autorización. El callback principal que lee config.ts es PUBLIC_API_URL + /api/google/callback; comprobar ruta y topología antes de registrarlo. La ruta GMB actual construye state con owner: revisarla antes de activar Business Profile y no copiar ese patrón.

Resolver el fallo reproducible del chat que esperaba dos TOOL_CALL_RESULT de correo y obtuvo cero, comparándolo con la base. Entregar lectura del buzón propio, borrador revisable, Calendar con zona horaria explícita y prevención/reconciliación de citas duplicadas. Drive entra con lectura limitada a recursos elegidos, no acceso indiscriminado por defecto.

Salida: conexión/revocación de dos tenants, lectura aislada, borrador real y cita real controlada. Consentimiento vencido y token revocado generan un estado accionable, sin filtración ni caída a credenciales globales.

### VS-04 — Panel, chat y empresa provisionada manualmente

Rama: campaign/vs-04-panel-agency. Puede preparar UI sobre contratos acordados mientras se cierran VS-02/03; no simular que están conectadas.

Entregar alta manual de agntia y segundo tenant de prueba, miembros y permisos, selección de empresa, conexiones, inbox, aprobaciones, agenda, historial y errores. Chat conversacional con contexto propio y herramientas acotadas; no requiere la red agéntica. Etiquetar datos de muestra y deshabilitar botones sin backend real.

Salida: Alfonso puede operar el primer flujo sin terminal, ver su estado real y verificar desde otro usuario que no hay lectura cruzada. Cada acción visible llega a una ruta implementada y autorizada.

### VS-05 — Despliegue operativo y observabilidad mínima

Rama: campaign/vs-05-deploy. Se puede preparar antes; el lanzamiento depende de VS-01..04.

Resolver un origen único www.agntiapro.com para panel/API y el destino de web comercial. Elegir Fly para API/worker y Vercel u otro frontal solo si el enrutamiento/cookies/callbacks quedan explícitos. No desplegar simultáneamente dos APIs con almacenamiento divergente. El repositorio tiene Store basado en PGlite y configuraciones DATABASE_URL: verificar qué datos van realmente a cada motor; tener Neon/Supabase/Fly Postgres preparados no autoriza sustituir el Store sin diseño y migración.

Entregar secretos inyectados desde entorno, HTTPS, DNS/certificado, CORS, health/readiness, worker persistente, backup/restore comprobado y rollback de release. Observabilidad mínima con correlación y alertas de fallo de entrada, cola atascada, salida desconocida y gasto. Sentry, OpenTelemetry y Grafana se integran con redacción de datos y sin duplicar toda la observabilidad por tener cuentas creadas.

Salida: recorrido real sobre dominio, reinicio y restauración controlada, métricas visibles y rollback practicable. No basta con un HTTP 200 de health.

### VS-06 — Primer producto comercial y operación semanal

Rama: campaign/vs-06-leads-kpi.

Sobre el flujo entrante ya operativo, añadir pipeline con identidad de lead, origen, etapas, próxima acción y trazabilidad de cambios. Importación de leads existentes con deduplicación, procedencia y reglas de contacto acordadas. Medir recibido -> atendido -> cualificado -> cita -> asistencia -> resultado comercial, con denominadores y ventanas temporales. No inventar ROI ni trasladar estadísticas generales al cliente como resultado propio.

Entregar coste por tenant, pausas, exportación, revisión semanal y reporte/newsletter preparado como borrador. El envío a clientes requiere autorización y lista acordada; esta campaña no autoriza mensajes externos por sí sola.

Salida: dogfooding de Agntia durante una ventana pactada, incidentes registrados, datos suficientes para decidir el siguiente tenant. Solo entonces activar un cliente externo piloto con onboarding manual.

### VS-07 — Voz y recepción telefónica

Rama: campaign/vs-07-voice-vapi. Dependencias: conexiones/calendario/operación estables.

Vapi y, si hace falta, ElevenLabs: número, asistente, tenant de llamada, callbacks autenticados, herramientas limitadas, transferencia humana y resultado persistido. Confirmar con Alfonso horario, idioma, información que se puede registrar y reglas de grabación antes de activar esa función; no asumir requisitos legales o consentimiento por un toggle técnico.

Salida: llamada controlada que consulta disponibilidad, agenda sin duplicar y registra resultado en la empresa correcta. Fallo de proveedor y llamada interrumpida tienen tratamiento explícito.

### VS-08 — Cobro y derecho de acceso

Rama: campaign/vs-08-billing-stripe.

Definir si el piloto se cobra manualmente o mediante Stripe. Si se integra: customer/subscription/product/price ligados al tenant, webhook firmado e idempotente, eventos fuera de orden y conciliación. Un pago no concede permisos por metadata no verificada. Separar sandbox/live y no realizar cargos reales de prueba.

Salida: recorrido sandbox de alta, pago, fallo y cancelación con estado del panel coherente. Alfonso aprueba precios y paso a live.

### VS-09 — Captación, conocimiento y conectores opcionales

Una rama por servicio/producto: campaign/vs-09-maps, vs-09-business-profile, vs-09-prospecting, etc. No es una megarrama.

Maps/Business Profile, Brave/Tavily, Apify, LinkedIn y otros conectores entran por necesidad de una oferta concreta. Registrar procedencia, límites y coste; confirmar permisos y condiciones aplicables con el proveedor antes del flujo real. No asumir que existe acceso de LinkedIn por tener una cuenta.

Composio y Better Auth quedan preparados como opciones. Solo se incorporan con decisión escrita sobre qué reemplazan, aislamiento de tenant, migración, revocación, dependencia y beneficio demostrado. Tener una key no obliga a adoptar el servicio.

Salida por conector: un caso comercial real, camino autorizado y reversible, sin introducir acceso global al resto de clientes.

### VS-10 — Beta progresiva y nuevas empresas

Rama por feature independiente. Activación por tenant y feature flag, sin cambios de precio automáticos. Cada beta tiene alcance, responsables, indicador de éxito, rollback y compatibilidad de datos. El informe semanal educa sobre funciones realmente disponibles y límites.

Salida: segunda empresa aislada y un procedimiento repetible de onboarding, soporte, revocación/exportación y retirada de acceso. La promesa comercial de estabilidad se basa en operación observada, no en decir que el código es infranqueable.

## 6. Datos que necesitamos de Alfonso

No necesitamos que publiques contraseñas, códigos MFA, tokens o claves privadas en el chat, repositorio, issues, PRs, capturas o este documento. Necesitamos referencias de configuración y recursos no secretos; la autenticación personal se hace en la interfaz/CLI correspondiente. Los secretos se introducen directamente en Doppler o en la conexión cifrada del tenant. Un permiso de filesystem no inicia sesión en un proveedor.

Separar: credenciales de infraestructura; credenciales de aplicaciones OAuth; keys de servicios de plataforma; autorizaciones OAuth/canales de cada cliente. Ni siquiera la agencia debe convertirse por comodidad en credencial fallback para otros tenants.

Para cada fila de abajo, completar: titular/organización, recurso/ID no secreto, entorno (dev/staging/prod o sandbox/live), referencia de secreto/conexión, permisos, facturación/límite, estado y última prueba. Solo registrar una referencia, jamás el valor. Los nombres que figuran como propuestos deben acordarse e implementarse; no son variables que el código ya lea.

| Servicio | Datos o acceso que necesitamos | Destino de secretos / observación |
| --- | --- | --- |
| GitHub repositorio y deploy | Confirmar organización y repo uniscrolliabrain-cloud/agente, colaboradores, permisos de PR/merge, entorno de Actions y quién autoriza producción | Autenticación CLI/conector o GitHub App; tokens de deploy mediante integración de entorno. No compartir PAT personal en docs |
| GitHub login / actualización de tenants | Confirmar si login GitHub se necesita en el piloto y qué significa actualizar tenants: configuración, código desplegado o datos | OAuth/App distinta del acceso de despliegue; los permisos de login no autorizan actualizaciones |
| Doppler | Proyecto, configuraciones por entorno y método de inyección local/CI/deploy | Service token con alcance al entorno si es necesario; sin inventariar valores ni usar un token global para todo |
| Dominio/Cloudflare | Cuenta/zone ID, zona agntiapro.com, DNS actual, destino www y raíz, acceso delegado y remitentes | Token acotado a la zona cuando se necesite automatizar; no global API key |
| Fly.io | Organización, app API/worker, región, volúmenes, destino de datos y presupuesto | Sesión CLI o token de deploy de alcance limitado, separado de credenciales DB |
| Vercel | Team, proyecto y función exacta (frontal/web comercial), alias www o proxy, entornos | Integración Git o token delegado; evitar dos destinos contradictorios para www |
| Neon/Postgres | Proyecto, branch/DB, región, pool/directo, roles runtime/migración/read-only, retención | DATABASE_URL y BUSINESS_DATABASE_URL ya existen; no concluir que todo el Store usa Neon sin verificar |
| Supabase | Proyecto, función elegida (auth y/o DB), URL y configuración JWT/JWKS, proveedores de login | SUPABASE_URL y secretos exactos según auth actual; service role nunca al navegador; evitar dos autoridades de identidad sin diseño |
| Google OAuth login | Proyecto Cloud, branding, usuarios piloto, proveedor de identidad elegido, dominios y callbacks exactos | Client ID/secret del login en la autoridad elegida; separado conceptualmente de dar acceso a Gmail |
| Google Gmail/Calendar/Drive | Proyecto y OAuth client, tipo de usuarios, scopes, buzón, calendar ID, zona horaria, carpetas/documentos elegidos | GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET existen; refresh/access tokens en conexión cifrada por tenant, no globales |
| Google Business Profile | Cuenta/locations autorizadas, IDs y acceso API efectivamente disponible | Conexión OAuth del tenant; revisar callback/state de GMB antes de activarlo |
| Google Maps | Proyecto, API concreta habilitada, cuota y restricciones de key | Referencia a secreto y restricciones según uso servidor/navegador; integración/nombre por definir |
| Meta/WhatsApp | Business/app/WABA ID, phone number ID, número piloto, estado de acceso, destinatarios de prueba, plantillas, ruta elegida | WHATSAPP_APP_SECRET, WHATSAPP_VERIFY_TOKEN, WHATSAPP_TOKEN y WHATSAPP_PHONE_ID existen; bindings sin valores secretos y tokens de salida por conexión |
| Evolution, si se elige | URL/instancia, tenant propietario, capacidad de configurar cabecera y reentregas | WHATSAPP_BASE_URL/API_KEY/INSTANCE en config; inbound x-webhook-secret dedicado mediante WHATSAPP_*_INBOUND_SECRET |
| Resend | Organización, dominio verificado, remitente/reply-to, buzón de prueba y autorización de envíos | RESEND_API_KEY existe; definir si correo transaccional de plataforma o correo en nombre de cliente |
| Vapi | Organización, assistant ID, phone number ID, callbacks, horario, transferencia y límites de gasto | VAPI_API_KEY/VAPI_ASSISTANT_ID existen en ejemplo; validar sus consumidores reales antes de marcar implementado |
| ElevenLabs | Workspace, voice ID autorizada, idioma, necesidad efectiva y presupuesto | Key en Doppler; integración y nombre por definir; no subir voces ajenas sin autorización |
| Stripe | Cuenta titular, país/moneda, productos/precios definitivos, facturas/impuestos y sandbox/live | STRIPE_API_KEY/STRIPE_WEBHOOK_SECRET existen; acceso live y cargos requieren decisión expresa |
| OpenAI | Proyecto, modelos aprobados y límite de gasto | OPENAI_API_KEY según config actual; separar entornos y nunca incluirla en prompts |
| Google AI Studio/Gemini | Proyecto, modelo y cuota/facturación | GEMINI_API_KEY según consumidores actuales; comprobar coherencia de proveedor/modelo |
| OpenRouter | Workspace/cuenta, modelos/fallbacks y presupuesto | OPENROUTER_API_KEY; no usar fallback que cambie privacidad/coste sin decisión |
| Brave y Tavily | Servicio elegido para el primer caso de búsqueda, cuota y presupuesto | Keys en Doppler; nombres/consumidores se verifican en la fase del conector |
| Apify | Organización, actors/datasets elegidos, origen de datos y límite | Token de alcance necesario; opcional hasta existir caso aprobado |
| LinkedIn | Cuenta/organización, caso de uso y acceso API concedido | OAuth o integración compatible con permisos concedidos; no pedir contraseña personal ni asumir automatización habilitada |
| Grafana / OpenTelemetry | Stack/proyecto, endpoint de ingestión, servicio/entorno y alertas | OTel es instrumentación/protocolo, no una cuenta por sí mismo; auth de exporter si el destino la necesita |
| Sentry Cloud | Organización/proyecto, entorno y política de redacción/retención | DSN/config de captura y token de publicación de releases tienen funciones distintas; nombres por verificar |
| Composio | Workspace y caso concreto que sustituiría, si se adopta | Key/conexiones con aislamiento por tenant; opción futura, no requisito |
| Better Auth | Decisión de adopción, autoridad de identidad y estrategia de migración | Librería/servicio según diseño elegido; no asumir que preparar una cuenta la integra |

Datos del negocio además de cuentas: nombre legal y comercial, owner y equipo piloto, roles, servicios y precios aprobados, horario/idioma/zona, calendario, buzón y número de atención, scripts/FAQ, reglas de cualificación, cuándo transferir a humano, a quién escalar errores, límites de gasto y contactos de prueba autorizados. Para campañas: origen/lista de leads, reglas de contacto y exclusión, resultado que se medirá. Para newsletter: destinatarios y autorización de envío.

## 7. Orden inmediato y primer handoff a Freebuff

Ejecutar VS-01 como siguiente unidad. Lectura previa: este documento, PILOTO-AGNTIA-REVISION.md y diff de main 83d20b2. Objetivo único: conservar tenant/actor desde tarea persistida hasta recuperación/ejecución y resolver conexiones sin ambigüedad. No rediseñar el motor completo, no cambiar precios, no incorporar Better Auth/Composio y no activar proveedores reales. Entregar PR campaign/vs-01-tenant-runtime con el caso de un usuario en dos empresas y reinicio. Codex revisará esa entrega antes de pasar a VS-02.

Alfonso puede completar VS-00 y las cuentas en paralelo; no debe bloquear la corrección del contexto. Cline puede mantener el inventario documental y enlazar evidencias sin mover este documento mientras una PR lo esté usando. El documento se actualizará por fase con SHA/PR/fecha y evidencia; preparado no equivale a terminado.

## 8. Plantilla de cierre de fase

- Fase y PR / SHA integrado:
- Comportamiento que funciona y recorrido demostrado:
- Proveedores reales o mocks usados:
- Evidencia y fecha, sin datos personales ni secretos:
- Migración / rollback / compatibilidad:
- Limitaciones y fallos de base que siguen abiertos:
- Configuración pendiente de Alfonso (solo nombres/referencias):
- Próxima fase habilitada y responsable:

## 9. Reparto operativo entre agentes (mandato de Alfonso, 2026-10-29)

Esta sección amplía el reparto anterior. Los agentes usan este archivo de main como documento rector; citan el SHA leído al comenzar y no tratan una copia antigua como estado vigente.

| Responsable | Trabajo autorizado | Entrega |
| --- | --- | --- |
| Freebuff | Implementar la fase asignada en rama nueva desde main, con alcance y límites de esta campaña | PR de código y handoff concreto |
| Codex | Revisar diseño/diff/aislamiento, remediar defectos y supervisar integración y cierre de ramas | Dictamen con hallazgos, correcciones y SHA integrado |
| GitHub Copilot en Codespaces | Ejecutar tests y audits sobre commits identificados, analizar fallos y conservar evidencia; sin reparar código ni rebajar controles salvo nueva asignación | PR de informes bajo docs/verification/vertical/ |
| Cline | Registrar el trabajo de los demás en el sistema documental nuevo, con metadatos buscables y enlaces a evidencia | PR documental, índice y registros de actividad; sin cambios de código |
| Alfonso | Prioridades, recursos/cuentas, decisiones comerciales y autorizaciones externas necesarias | Decisiones referenciadas sin secretos |

No hay acceso automático entre agentes por este documento. Alfonso entrega los handoffs o autoriza la coordinación concreta. No implica que Copilot esté ejecutándose ni que se haya creado una automatización. No usar las ramas ajenas como superficie de trabajo compartida.

### 9.1 Estándar de verificación de Copilot

Rama: verification/vs-NN-AAAAMMDD-identificador, desde main. La verificación se ejecuta en un checkout separado del SHA objetivo; los informes se commitean en la rama de informes, nunca sobre la rama de implementación de Freebuff. El SHA objetivo, el SHA base y el SHA del informe son distintos conceptos y deben quedar explícitos.

Carpeta por ejecución: docs/verification/vertical/AAAAMMDD/vs-NN-identificador/. Entregar REPORT.md, manifest.json y logs redactados. No sobreescribir una ejecución anterior ni regenerar documentos generales de audits en la rama ajena. Si los scripts generan documentación, conservarla solo dentro de la evidencia de esa ejecución o informar qué cambió.

Secuencia operacional:

1. Registrar PR/rama/SHA objetivo exacto, SHA de main usado como base, fase, alcance del diff y fecha UTC. Confirmar checkout limpio y entorno sin secretos de producción. Inventariar Node, gestor de paquetes, OS y configuración relevante sin valores sensibles.
2. Instalar desde el lockfile con el gestor declarado. Si no se puede, marcar fallo de preparación; no presentar tests no ejecutados como aprobados.
3. Revisar scripts actuales antes de ejecutarlos. Ejecutar primero typecheck y pruebas dirigidas del cambio. Los audits relevantes y la suite amplia se ejecutan como comprobación central de la entrega, sin multiplicar ejecuciones idénticas en cada agente. Omitir redes reales/cargos/envíos: ALLOW_NETWORK=0 cuando corresponda; este flag no sustituye revisar herramientas que puedan tener efectos externos.
4. Por cada comando: registrar comando exacto, inicio/fin UTC, exit code, timeout, estado y ruta de log. Ante fallo de instalación o requisito previo, marcar dependientes como blocked/not_run, no pass. Un timeout, cancelación, skip y aserción fallida son resultados diferentes.
5. Comparar un fallo sospechoso con el SHA base bajo el mismo entorno y comando. Etiquetar preexistente solo con esa evidencia; en otro caso, origen sin determinar. No repetir una suite completa para cada fallo: aislar la prueba y documentar el motivo de cualquier repetición. No ampliar timeouts o desactivar assertions silenciosamente.
6. Entregar un resumen de regresiones nuevas, fallos de base, riesgos del cambio, controles no ejecutados y pasos de reproducción. El agente no declara todo listo para producción por un único green; el dictamen de integración corresponde a Codex/Alfonso según el alcance.
7. Redactar tokens, URLs con credenciales, datos personales y contenidos de clientes antes de publicar logs. No subir .env, dumps de entorno o bases de clientes. Referenciar artifacts de CI voluminosos en lugar de volcar megabytes al repositorio. La política de retención se acuerda antes de automatizar su borrado.

Estados normalizados de comando: pass, fail, timeout, cancelled, skipped, blocked, not_run. REPORT.md debe incluir conclusión, tabla de comandos, clasificación de fallos, reproducción, límites y enlaces. manifest.json debe incluir al menos schema_version, run_id, phase, target_sha, baseline_sha, source_pr, agent, started_at, finished_at, environment, commands y findings. Cada elemento commands incluye command, status, exit_code (null si no existe), duration_ms y log_path. findings incluye severity, summary, classification (new/preexisting/undetermined), evidence y recommended_action.

No incluir afirmaciones de cobertura sin medición. Un resultado cancelado no cuenta como aprobado. Los audits rojos conservan su salida y su significado; no se cambia el script para que el informe sea verde. Las comprobaciones con proveedor real necesitan entorno de prueba y alcance autorizado, y se registran separadas de la suite sin red.

### 9.2 Estándar documental de Cline

Cline mantiene registros nuevos y buscables, enlazando evidencias sin duplicarlas. Ubicación inicial acordada para esta campaña: docs/registro-agentes/entries/ para registros y docs/registro-agentes/index.jsonl para índice legible por máquina. Si el sistema nuevo usa otra ubicación, proponer y documentar la migración manteniendo enlaces; no ejecutar otra reorganización masiva por cuenta propia.

Cada registro es Markdown con front matter YAML. Campos obligatorios: schema_version, id único, title, created_at en ISO 8601 con zona, updated_at, agent, phase, type, status, repository, branch, commit, source_pr, evidence y tags. Tipos: implementation, review, verification, decision, handoff, deployment, incident. Estados del registro: proposed, in_progress, blocked, completed, superseded. Campos no disponibles usan null con explicación, no datos inventados. Para verificación añadir target_sha y baseline_sha; para decisiones indicar quién decidió y referencia de la instrucción.

El cuerpo contiene objetivo, cambios/resultado observado, pendientes, límites, siguiente responsable y enlaces. evidence y tags son listas. El índice JSONL contiene un objeto por registro con id, path, title, phase, agent, type, status, commit, source_pr, updated_at y tags. IDs únicos; no introducir rutas fuera del árbol documental. Metadatos con vocabulario consistente permiten buscar por fase, agente, SHA, PR, proveedor, estado y tema con herramientas de texto/JSON sin exigir un buscador nuevo.

Un registro completed significa que terminó esa actividad, no que la fase o el producto estén desplegados. Una PR merged acredita integración, no conexión real. Conservar por separado estado de fase, estado de conexión y evidencia de despliegue. No deducir trabajo terminado porque exista un handoff. Registrar fallos y decisiones pendientes con la misma trazabilidad que los éxitos.

Las correcciones de registros conservan trazabilidad: updated_at y nota de cambio; los sustituidos enlazan al sucesor y pasan a superseded. Cline revisa enlaces, front matter e índice antes de entregar. No copia passwords ni tokens, no reescribe conclusiones técnicas sin evidencia y no marca una revisión aprobada antes del dictamen de Codex.

### 9.3 Circuito de entrega

Freebuff abre PR y entrega SHA -> Copilot verifica ese SHA y publica informe -> Cline registra implementación/verificación -> Codex revisa y remedia -> si cambia el código, Copilot comprueba el nuevo SHA con alcance proporcional -> Codex integra cuando procede -> Cline registra merge, pendientes y próxima fase. No bloquear un arreglo urgente por formalidades del índice: registrar la evidencia inmediatamente después.

Para empezar ahora: Freebuff toma VS-01; Copilot prepara el entorno y el primer informe de base sin corregir código; Cline crea el registro inicial de main 83d20b2 y la campaña, diferenciando recepción integrada de funciones pendientes. Estos encargos quedan escritos para que Alfonso los pase a los agentes; no se han enviado desde este chat.
