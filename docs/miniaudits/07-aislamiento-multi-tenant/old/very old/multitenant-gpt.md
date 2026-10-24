He estudiado el inventario real de tu repo `repomix-backend.md`, su miniauditoría de aislamiento multi-tenant y la investigación sobre memoria agéntica, seguridad de RAG y arquitecturas SaaS empresariales.

Mi conclusión es clara: tu repo ya contiene muchas de las piezas necesarias; lo que más puede elevarlo es convertirlas en un sistema de aislamiento, autorización, memoria y ejecución que funcione de extremo a extremo y pueda demostrar que funciona.

No empezaría añadiendo más agentes ni otra base vectorial. Empezaría por asegurar que cada agente, recuerdo, documento, herramienta, evento y gasto pertenece al tenant correcto, y que ninguna ruta alternativa puede saltarse ese límite.

La auditoría del propio repo ya identifica problemas concretos: `TenantScopedStore` convive con accesos a `db` sin encapsular; RLS es opcional; la resolución de tenants tiene caché; las cuotas no cubren todos los servicios; y faltan pruebas HTTP de fugas entre tenants. También faltan elementos del SaaS multiusuario real, como membresías, selección de tenant y configuración por tenant. Esos son los puntos de partida, no una lista teórica.

La investigación externa refuerza este enfoque: AWS y Microsoft recomiendan tratar el aislamiento como una propiedad de toda la arquitectura, combinando recursos compartidos y dedicados según el riesgo. PostgreSQL ofrece RLS como segunda barrera. Para memoria agéntica, A-MEM, Mem0 y Hindsight aportan ideas diferentes sobre organización, consolidación, relaciones, temporalidad y reflexión.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://docs.aws.amazon.com\&sz=32)

AWS Documentation

+6



# Las 30 implementaciones que haría

Las ordeno por prioridad técnica. Cada punto incluye dónde lo conectaría en tu código y qué prueba exigiría para considerarlo terminado.

## Bloque A — Aislamiento multi-tenant real

Prioridad crítica · Implementaciones 1–10

## 01

Contexto de tenant obligatorio e inmutable

`packages/domain/src/execution-context.ts` · `apps/server/src/app.ts` · `kernel/tenancy/`

Crear un `TenantExecutionContext` único, construido a partir de la sesión autenticada y la membresía validada. El agente no puede cambiar su `tenantId` mediante argumentos del usuario, mensajes, prompts o resultados de herramientas.

Aceptación: cualquier operación sin tenant autenticado se rechaza antes de acceder a datos. Un tenant enviado en el body no puede sustituir al de la sesión.

## 02

Eliminar los accesos de datos que se saltan el aislamiento

`db-tenant.ts` · `app.ts` · `files.ts` · `engine/rag.ts` · `workspace.ts`

Inyectar `TenantScopedStore` o una interfaz tenant-scoped equivalente en todos los servicios. Corregir las rutas en las que las escrituras usan el `db` original mientras las lecturas usan el store encapsulado. No basta con cambiar el constructor: hay que revisar cada operación y sus transacciones.

Aceptación: una escritura y posterior lectura de archivos, RAG y workspaces se resuelve dentro del mismo tenant, sin fallback silencioso al store global.

## 03

RLS de PostgreSQL corregida y realmente operativa

`db-rls.ts` · `db.ts` · capa de transacciones

Corregir el contexto `app.tenant_id`: el código actual usa `set_config(..., true)`, cuyo ámbito es la transacción. Si el contexto y la consulta no comparten una transacción y conexión, la protección no funciona como se espera. Añadir políticas explícitas de lectura y escritura, incluyendo `WITH CHECK`, y verificar que el rol de aplicación no pueda eludir RLS.

Aceptación: pruebas reales de PostgreSQL demuestran que SELECT, INSERT, UPDATE y DELETE entre tenants están bloqueados, incluso si una consulta de aplicación omite el filtro. PostgreSQL documenta estas particularidades de RLS.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://www.postgresql.org\&sz=32)

PostgreSQL



## 04

Migración de datos tenant-aware, reversible y sin pérdida

Migraciones · `db-tenant.ts` · `db-rls.ts`

Introducir `tenant_id` como dato estructurado, en lugar de depender exclusivamente de la composición textual `tenantId:owner`. Antes de activar RLS, hacer un backfill verificable de los registros existentes; no asignar indiscriminadamente `default` a datos de clientes distintos. Ejecutar migraciones por lotes, con transacción donde proceda, checkpoint y plan de rollback.

Aceptación: el recuento y la integridad de los registros coinciden antes y después, y la migración puede reanudarse sin duplicar ni perder datos.

## 05

Membresías, roles y cambio de tenant

`auth.ts` · `auth-routes.ts` · `engine/tenant.ts` · frontend

Crear el modelo persistente de membresías con roles y permisos por tenant. Implementar la selección de tenant activo, la validación de pertenencia y la invalidación de sesiones o contextos cuando una membresía se revoca.

Aceptación: un usuario puede pertenecer a dos empresas, cambiar de una a otra y perder inmediatamente el acceso a la primera cuando se revoca su membresía.

## 06

Autorización jerárquica y denegación por defecto

`engine/policy/engine.ts` · `engine/policy/expression.ts` · `kernel/tenancy/`

Componer políticas globales, de sector, tenant, equipo, agente y tarea con precedencia explícita. Resolver conflictos mediante reglas deterministas; una política de nivel inferior no debe ampliar privilegios que la política superior prohíbe.

Aceptación: tests de conflicto demuestran que no existe una ruta alternativa que convierta un `deny` en `allow`.

## 07

Pruebas adversariales de aislamiento a escala

`tests/` · `db-tenant.ts` · rutas HTTP

Pasar de pruebas de aislamiento de 50 tenants a escenarios con 500 y 1.000, múltiples usuarios, operaciones concurrentes, IDs manipulados, cachés y accesos por API. Incluir pruebas basadas en propiedades que generen combinaciones de tenants, recursos y permisos.

Aceptación: cero accesos cruzados en pruebas de lectura, escritura, búsqueda, eventos, archivos y memoria; fallos reproducibles si se introduce una regresión.

## 08

Aislamiento de notificaciones, auditoría y onboarding

`engine/events/consumers/notifications.ts` · `kernel/audit/` · rutas de onboarding

Incluir el tenant en las claves, validaciones y consultas de notificaciones y auditoría. Restringir onboarding a los clientes del tenant autorizado y evitar que un identificador arbitrario contamine namespaces ajenos.

Aceptación: ni una notificación, entrada de auditoría o cliente de onboarding aparece en la cuenta de otra empresa.

## 09

Configuración, secretos y modelos por tenant

`engine/tenant.ts` · `kernel/tenancy/` · `app.ts`

Cablear el `DatabaseTenantConfigResolver` existente, validar configuraciones por tenant y mantener credenciales fuera de los registros ordinarios. Soportar proveedor/modelo por tenant, límites, permisos y rotación de claves.

Aceptación: dos empresas pueden usar proveedores, modelos y secretos distintos sin compartir credenciales ni heredar una configuración incorrecta.

## 10

Pruebas HTTP end-to-end de aislamiento

`tests/` · `app.ts` · autenticación

Crear dos tenants reales de prueba y ejecutar el recorrido completo: login, cambio de tenant, chat, búsqueda, archivos, RAG, tareas, notificaciones y auditoría. No limitarse a probar directamente `TenantScopedStore`.

Aceptación: cada endpoint demuestra aislamiento con sesiones reales y el test falla si se sustituye accidentalmente el store por el `db` global.

## Bloque B — Memoria multi-tenant de nivel avanzado

Implementaciones 11–18

La idea central es que la memoria no sea una colección de textos que se inyectan al prompt. Debe ser un sistema de conocimiento con propietario, permisos, procedencia, tiempo, relaciones y ciclo de vida. A-MEM estudia la organización dinámica de memorias y sus conexiones; Mem0, la extracción y consolidación de memoria a largo plazo; Hindsight, la separación entre hechos del mundo, experiencias del agente, resúmenes de entidades y creencias. Son enfoques complementarios, no tres paquetes que debas instalar sin más.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://arxiv.org\&sz=32)

arXiv

+2



## 11

Contrato de memoria con alcance obligatorio

`engine/memory.ts` · `engine/context/engine.ts` · `packages/domain/`

Definir cada memoria con `tenantId`, propietario, audiencia, tipo, rol/agente, origen, sensibilidad, fechas de validez y política de retención. El alcance no se deduce del texto ni del prompt.

Aceptación: no se puede persistir ni recuperar una memoria sin un scope autorizado.

## 12

Cuatro redes lógicas de memoria

`engine/memory.ts` · `kernel/graph/`

Separar hechos verificables, experiencias del agente, resúmenes de entidades y creencias o hipótesis. Pueden compartir infraestructura, pero no semántica ni permisos.

Aceptación: una inferencia no se devuelve como hecho confirmado, y una experiencia privada de un agente no se convierte automáticamente en conocimiento empresarial compartido.

## 13

Visibilidad de memoria por política

`engine/memory.ts` · `engine/context/assembly.ts` · `engine/policy/`

Establecer niveles explícitos: privada del usuario, privada del agente, equipo y organización. Las búsquedas aplican el filtro de permisos antes de calcular o exponer resultados.

Aceptación: una consulta amplia sin rol no mezcla memorias de otros roles ni amplía la visibilidad a toda la empresa por defecto.

## 14

Recuperación híbrida con ranking medible

`engine/memory.ts` · `engine/rag.ts` · `engine/embeddings.ts`

Combinar búsqueda léxica BM25/IDF, semántica vectorial, filtros de metadatos y, cuando aporte valor, relaciones del grafo. Fusionar rankings con una estrategia evaluable como Reciprocal Rank Fusion y aplicar el permiso de acceso a todas las ramas.

Aceptación: benchmark propio que mida Recall\@k, MRR/nDCG, latencia y, sobre todo, cero resultados no autorizados. El RAG ya existe: se trata de integrarlo y medirlo.

## 15

Memoria temporal y resolución de contradicciones

`engine/memory.ts` · `kernel/graph/` · `engine/provenance.ts`

Guardar cuándo ocurrió un hecho y cuándo lo conoció el sistema. Si cambia el horario, responsable o precio de una empresa, conservar el historial y marcar qué afirmación está vigente en lugar de borrar la anterior sin rastro.

Aceptación: preguntas como «¿quién era el responsable en junio?» y «¿quién lo es ahora?» devuelven respuestas distintas y justificadas.

## 16

Consolidación de memoria con evidencia

`engine/learning.ts` · `kernel/graph/consolidate.ts` · `kernel/graph/promote.ts`

Extraer hechos de conversaciones y eventos, deduplicarlos, vincularlos con sus fuentes y promoverlos a memoria compartida solo después de superar reglas de confianza y autorización. Las actualizaciones generadas por IA deben poder revisarse y revertirse.

Aceptación: una afirmación repetida no crea cientos de recuerdos; una hipótesis no se promociona automáticamente a hecho corporativo.

## 17

Borrado, revocación y expiración de memoria de extremo a extremo

`engine/memory.ts` · `engine/rag.ts` · almacenamiento de vectores

Una solicitud de borrado debe alcanzar el registro original, los chunks, embeddings, índices, resúmenes derivados y cachés pertinentes. Registrar el resultado sin mantener innecesariamente el contenido eliminado.

Aceptación: después del borrado, la memoria deja de ser recuperable por todas las rutas y existe una prueba de verificación. OWASP destaca la expiración, el alcance de memoria y las fugas de embeddings como controles relevantes.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://github.com\&sz=32)

GitHub



## 18

Presupuesto de memoria y contexto por tarea

`engine/context/budget.ts` · `engine/context/assembly.ts`

Asignar tokens por tipo de memoria, documentos, eventos, relaciones y aprendizajes, dentro del presupuesto total del modelo. Priorizar evidencia relevante y actual, no solo recuerdos recientes.

Aceptación: ningún ensamblado excede el presupuesto configurado; se registran los elementos incluidos y excluidos y la razón de cada decisión.

## Bloque C — Agentes empresariales seguros y gobernables

Implementaciones 19–24

## 19

Identidad y permisos propios de cada agente

`agents/runtime.ts` · `engine/governance.ts` o equivalente · `engine/capabilities/`

Cada agente tiene identidad de servicio, tenant propietario, capacidades permitidas y un contexto de ejecución limitado. No hereda automáticamente todos los permisos del usuario que lo lanzó.

Aceptación: un agente de marketing no puede acceder a nóminas o credenciales porque otra herramienta las tenga disponibles.

## 20

Delegación de capacidades con caducidad

`engine/capabilities/registry.ts` · `engine/policy/` · `handoff/service.ts`

Emitir capacidades temporales, limitadas a una tarea, recurso y acción. Si un agente delega a otro, la delegación no puede ampliar los permisos del agente padre.

Aceptación: un token de capacidad caducado, revocado o usado en otro tenant no permite ejecutar la herramienta.

## 21

Ejecución de herramientas con autorización en el último momento

`engine/policy/` · runtime · `engine/verification/`

Comprobar identidad, tenant, permisos y parámetros justo antes de ejecutar cada acción externa. No confiar en una aprobación anterior si cambian los parámetros críticos o el recurso de destino.

Aceptación: una llamada manipulada a una herramienta no puede saltarse el control mediante prompt injection, chaining o cambio de argumentos.

## 22

Aprobaciones vinculadas a la acción exacta

`actions.ts` · `engine/verification/` · UI de aprobaciones

Vincular la aprobación al tenant, usuario aprobador, agente, herramienta, parámetros, hash de contenido y caducidad. Si cambia la acción, se necesita una nueva aprobación.

Aceptación: no se puede reutilizar una aprobación de un envío de correo para otro destinatario o contenido diferente.

## 23

Presupuestos, cuotas y circuit breakers por tenant

`rate-limit.ts` · tareas · chat · RAG · archivos · proveedores LLM

Aplicar límites por minuto, concurrencia, tokens, coste estimado y ejecución de herramientas a todos los endpoints relevantes, no solo a `createTask`. Separar cuotas duras de avisos de consumo.

Aceptación: un tenant no puede agotar el presupuesto de los demás mediante un bucle de agentes o una búsqueda costosa. OWASP identifica el consumo sin límites y el exceso de agencia como riesgos de producción.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://genai.owasp.org\&sz=32)

OWASP Gen AI Security Project

+1



## 24

Memoria de ejecución reconstruible y trazabilidad completa

`engine/events/` · `engine/provenance.ts` · `kernel/audit/`

Relacionar cada respuesta o acción con los datos recuperados, versión del prompt, modelo, política aplicada, herramientas ejecutadas y aprobaciones. Guardar eventos suficientes para reconstruir qué pasó sin tener que confiar en que repetir la llamada produzca el mismo resultado.

Aceptación: desde una acción empresarial se puede recorrer la cadena hasta la evidencia y los permisos que la autorizaron. Esto coincide con la necesidad de preservar la procedencia y el contexto de las decisiones de IA en entornos empresariales.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://www.reuters.com\&sz=32)

Reuters



## Bloque D — Rendimiento, operación y nivel SaaS empresarial

Implementaciones 25–30

## 25

Cachés y trabajos en segundo plano tenant-aware

`engine/tenant.ts` · `engine/events/` · servicios de mantenimiento

Invalidar la caché de resolución de tenants por evento, sustituir scans globales periódicos por consultas indexadas y ejecutar mantenimiento por lotes con límites de concurrencia. Toda caché de datos sensibles incluye tenant y versión de permisos en su clave.

Aceptación: un cambio de membresía invalida el acceso antiguo; el mantenimiento de un tenant no degrada los tiempos de respuesta de los demás.

## 26

Índices y consultas con paginación real

`db.ts` · `db-tenant.ts` · `engine/memory.ts` · `engine/rag.ts`

Sustituir grandes scans y filtrado en JavaScript por consultas indexadas y cursores. Auditar los índices según los patrones reales de consulta; revisar, entre otros, `tenant_id`, `owner`, `kind`, estado y orden de actualización.

Aceptación: pruebas con volúmenes de 100.000 chunks y millones de registros mantienen latencias y memoria dentro de objetivos definidos, sin cargar miles de elementos solo para descartar casi todos.

## 27

Cuotas, consumo y facturación verificables

`engine/tenant.ts` · `engine/events/` · capa de billing

Crear eventos de consumo idempotentes para tokens, modelos, almacenamiento, búsqueda y ejecución. Agregar por tenant, periodo y servicio, y reconciliar el uso estimado con el coste real del proveedor.

Aceptación: los reintentos no duplican cargos y un cliente puede consultar su consumo por periodo con trazabilidad hasta las operaciones originales.

## 28

Observabilidad con contexto de tenant y protección de datos

`log.ts` · `metrics/` · `engine/events/exporters/otel.ts`

Propagar tenant, tarea, agente y trace ID por logs y trazas. Añadir métricas de latencia, fallos, consumo y denegaciones, sin etiquetar métricas con identificadores de cardinalidad ilimitada ni registrar secretos o contenido sensible en claro.

Aceptación: se puede diagnosticar el problema de una empresa sin acceder a los datos de otra y sin filtrar contenido privado en los logs.

## 29

Backups, restauración y aislamiento de archivos

`backup-tenant.ts` · `files.ts` · almacenamiento

Alinear las rutas reales donde se guardan los archivos con las rutas de backup. Permitir restaurar un tenant de manera independiente y comprobar integridad, permisos y referencias a documentos.

Aceptación: una restauración de prueba recupera los datos de un tenant sin sobrescribir ni exponer los de otros.

## 30

Plano de control SaaS y niveles de aislamiento configurables

`engine/tenant.ts` · configuración · administración

Crear un plano de control que gestione alta, configuración, límites, miembros, claves, backup, eliminación y migración. Permitir aislamiento compartido para clientes normales y recursos dedicados para clientes que requieran más aislamiento, manteniendo una única experiencia de administración.

Aceptación: se puede aprovisionar, suspender, migrar y eliminar un tenant con procedimientos repetibles y auditables, sin crear un fork manual de la aplicación.

## Orden real de ejecución

No haría las 30 en paralelo. Este sería el orden de dependencias:

P0

Primero: seguridad estructural

Implementaciones 1–4, 6–8 y 10. Resolver la identidad del tenant, cerrar accesos directos, corregir RLS y construir pruebas de aislamiento. Sin esto, optimizar memoria puede hacer que las fugas sean más rápidas y difíciles de detectar.

P1

Segundo: SaaS utilizable y controlado

Implementaciones 5, 9 y 23–29. Membresías, configuración por empresa, cuotas, observabilidad, facturación y operaciones. Aquí el sistema empieza a poder servir a varias empresas con garantías medibles.

P2

Tercero: memoria y autonomía avanzada

Implementaciones 11–22. Construir sobre la frontera de seguridad ya verificada, integrar recuperación y memoria estructurada, y gobernar las capacidades de los agentes.

Transversal

Cuarto: demostrar que no se rompe

Benchmarks, pruebas adversariales, carga, restauración y regresión deben acompañar cada fase, no dejarse para el final.

## Las referencias que usaría como base técnica

| Fuente                                                                                                                                                                      | Qué extraería para tu repo                                                                           |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| [AWS — SaaS Tenant Isolation](https://docs.aws.amazon.com/whitepapers/latest/saas-tenant-isolation-strategies/saas-tenant-isolation-strategies.html?utm_source=chatgpt.com) | Modelos pool, silo y bridge; aislamiento por recurso y tenant.                                       |
| [Microsoft — Multitenant architecture](https://learn.microsoft.com/en-us/azure/architecture/guide/multitenant/considerations/overview?utm_source=chatgpt.com)               | Identidad, requisitos de aislamiento, rendimiento, residencia y costes.                              |
| [PostgreSQL — Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html?utm_source=chatgpt.com)                                                   | Defensa en profundidad en la base de datos.                                                          |
| [A-MEM — Agentic Memory for LLM Agents](https://arxiv.org/abs/2502.12110?utm_source=chatgpt.com)                                                                            | Organización dinámica y enlaces entre recuerdos.                                                     |
| [Mem0 — Scalable Long-Term Memory](https://arxiv.org/abs/2504.19413?utm_source=chatgpt.com)                                                                                 | Extracción, consolidación y recuperación eficiente.                                                  |
| [Hindsight — Retain, Recall, Reflect](https://arxiv.org/abs/2512.12818?utm_source=chatgpt.com)                                                                              | Separación entre hechos, experiencias, entidades y creencias; memoria temporal y reflexión trazable. |
| [OWASP — Top 10 for LLM Applications](https://genai.owasp.org/llm-top-10/?utm_source=chatgpt.com)                                                                           | Fugas sensibles, prompt injection, exceso de agencia, RAG y consumo descontrolado.                   |
| [NIST — Generative AI Profile](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf?utm_source=chatgpt.com)                                                               | Gobernanza, evaluación, verificación y gestión de riesgos.                                           |

## Mi recomendación

Si solo pudiera elegir cinco para comenzar, serían 01, 02, 03, 07 y 10: contexto de tenant obligatorio, cierre de accesos sin encapsular, RLS real, pruebas adversariales y pruebas HTTP completas.

Después atacaría 11, 13, 14, 16 y 24, porque convierten la memoria y las acciones de tus agentes en componentes con permisos, evidencia y trazabilidad.

Y una precisión importante: no llamaría al repo «state of the art» por añadir estas funciones al árbol de archivos. Lo consideraría de nivel empresarial cuando sus fronteras de seguridad sean obligatorias, las fugas estén cubiertas por pruebas, la memoria pueda justificarse y borrarse, y las operaciones multi-tenant sean medibles y recuperables. El diferencial no es tener treinta módulos más: es que los treinta estén conectados y que el sistema pueda demostrar que hace lo que promete.