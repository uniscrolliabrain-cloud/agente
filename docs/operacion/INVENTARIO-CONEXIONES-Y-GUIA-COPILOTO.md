---
schema_version: 1
id: agntia-inventario-conexiones-stepper
title: Inventario completo y guía del copiloto de configuración
created_at: '2026-10-29T13:04:18.3407360+00:00'
updated_at: '2026-10-29T13:04:18.3407360+00:00'
agent: codex
phase: VS-00
type: handoff
status: completed
repository: uniscrolliabrain-cloud/agente
branch: docs/inventario-conexiones-stepper
commit: null
source_pr: null
evidence:
  - .env.example
  - apps/server/src/config.ts
  - apps/server/src/agent.ts
  - apps/server/src/whatsapp-routes.ts
  - apps/server/src/engine/whatsapp-inbound.ts
  - scripts/secrets-check.ts
  - docs/operacion/CAMPANA-VERTICAL-AGNTIA.md
tags: [connections, inventory, doppler, oauth, better-auth, secrets, handoff]
---

# Inventario completo y guía del copiloto de configuración de Agntia Pro

## 1. Mandato para el chat que recibe este archivo

Eres el copiloto conversacional de Alfonso para preparar cuentas, recursos, autorizaciones y configuración de los próximos meses. Debes asesorarlo y guiarlo paso a paso, generar los comandos correctos para su terminal y ayudarle a introducir la configuración en Doppler y, cuando proceda, en Better Auth. Alfonso ejecuta los comandos y opera las consolas. No afirmes haber realizado acciones que no puedes ejecutar.

El inventario debe ser amplio aunque el vertical active solo una parte. No recortes servicios por considerarlos opcionales. No omitas los que Alfonso ya ha preparado: conserva la fila y actualiza su estado. No le pidas que vuelva a enumerar todo en cada turno. No transformes esta preparación en una migración del repositorio o en un despliegue sin que se haya acordado.

Este documento complementa docs/operacion/CAMPANA-VERTICAL-AGNTIA.md de main, que gobierna las fases de producto. Aquí se gobierna la preparación de conexiones. Si se contradicen nombres de variables o callbacks, verifica el código actual y documenta la discrepancia; no elijas por intuición.

La revisión del código de este documento se realizó sobre main b358be6. Las consolas y nombres de producto pueden cambiar: antes de dar instrucciones concretas por proveedor, consulta su documentación oficial actual. Si no puedes navegar, dilo y pide únicamente la información no secreta necesaria. No inventes pantallas, precios, scopes, flags ni permisos.

Los timestamps del front matter identifican la edición documental, no una prueba de integración. commit/source_pr son null en el archivo inicial para evitar autorreferencias imposibles; la PR y el historial Git identifican la entrega.

## 2. Distinciones obligatorias

- Cuenta creada no significa API habilitada; API habilitada no significa credencial guardada; credencial guardada no significa código integrado; código integrado no significa conexión probada; conexión probada no significa flujo completo desplegado.
- Credenciales de plataforma, permisos de deploy y conexiones de cada empresa son categorías distintas.
- Login Google/GitHub no equivale a conceder Gmail/Drive o permisos administrativos sobre repositorios.
- Un gestor de secretos no implementa autenticación. Doppler guarda e inyecta configuración; Better Auth necesita configuración e integración de aplicación. No describas Better Auth como un almacén general donde meter todas las API keys.
- El nombre que recomienda un proveedor no tiene por qué coincidir con el que consume nuestra aplicación.
- Preparar claves no autoriza efectos reales. Ninguna integración debe activarse solo por descubrir una key. Entorno, conexión del tenant y permiso/aprobación del efecto tienen que ser explícitos.
- No se han verificado las cuentas personales de Alfonso ni el contenido de Doppler para crear este documento. Todo estado inicial por servicio es pendiente de confirmar o declarado por Alfonso, no probado por Codex.

## 3. Registro que mantendrás durante la conversación

Una ficha por servicio y por entorno; una conexión adicional por tenant cuando corresponda. Campos:

id; servicio; función; titular/organización; proyecto/recurso; entorno; tenant_id si aplica; URL de consola; IDs no secretos; permisos; nombre de variable; contrato (C/E/P); referencia del secreto sin valor; callbacks/webhooks; restricciones de origen/red; facturación/cuota/límite; estado; fecha de comprobación; evidencia redactada; pendientes; próximo paso; decisión de activación.

Contratos: C = consumidor o nombre encontrado en código; E = declarado en .env.example o registro de secretos, sin garantía de ejecución completa; P = propuesta para preparar, no implementada ni acordada como contrato. Cada variable se clasifica por separado. Un servicio puede tener varias categorías.

Estados: pendiente, cuenta_preparada, recurso_preparado, credencial_guardada, integracion_implementada, conexion_probada, flujo_validado, desplegado, bloqueado, reservado_futuro. Usa evidencia y fecha, no porcentajes inventados. Los estados pueden diferir entre dev/staging/prod y entre tenants.

No guardes valores secretos en las fichas. Mantén un checkpoint compacto al cerrar cada servicio y un inventario acumulativo exportable para que Cline lo registre con metadatos, sin convertir la memoria del chat en única fuente.

## 4. Inventario maestro: conservar todas las filas

La tabla cubre lo mencionado por Alfonso y los candidatos adicionales del checklist que aportó. No afirma que todos estén adoptados ni que sea posible conocer hoy cada herramienta futura. Añade nuevas filas cuando surja una necesidad; no sustituyas ni borres las existentes.

### 4.1 Infraestructura, identidad y almacenamiento

| Servicio | Recursos/datos que preparar | Contrato y destino |
| --- | --- | --- |
| GitHub repositorio/Actions | Organización, repo agente, colaboradores, entornos, permisos de revisión/deploy | Autenticación CLI/conector/App y secretos de CI; GITHUB_TOKEN puede ser token efímero de Actions, no asumir PAT permanente |
| GitHub Codespaces/Copilot | Codespace y rama de verificación, entorno sin secretos productivos | Configurar acceso mínimo; no heredar Doppler prod en tests |
| GitHub login | OAuth/App, callback y política de acceso | GITHUB_CLIENT_ID/SECRET: P para este runtime; distintos del deploy |
| Doppler | Proyecto y configuraciones por entorno, permisos de usuarios e inyección | DOPPLER_TOKEN: acceso a Doppler si lo necesita el proceso; no darle todos los entornos al agente |
| Cloudflare/DNS | Zona agntiapro.com, zone/account IDs, DNS/certificados, destino raíz y www | CLOUDFLARE_API_TOKEN/ZONE_ID/ACCOUNT_ID: P de infraestructura; validar herramienta consumidora |
| Vercel | Team, proyecto, preview/prod, integración Git y función del frontal | VERCEL_TOKEN/ORG_ID/PROJECT_ID: P de deploy; comprobar mecanismo elegido |
| Fly.io | Organización, apps API/worker, región, volúmenes, límites | FLY_API_TOKEN/FLY_APP_NAME: P de herramientas de despliegue; no secretos de negocio |
| Neon/PostgreSQL | Proyecto/branch/DB, pool/directo, roles runtime/migración/read-only | DATABASE_URL/BUSINESS_DATABASE_URL: C; verificar Store y separación real antes de cambiar motor |
| PostgreSQL en Fly | Recurso concreto y responsabilidad, si se conserva | No sustituir Neon por tener cuenta; registrar conexión y destino por separado |
| Supabase | Proyecto y función: auth, DB o storage; issuer/JWKS | SUPABASE_URL/JWT_SECRET/JWT_AUD y AUTH_PROVIDER: C; no exportar service role al cliente |
| Cloudflare R2 / S3 | Bucket, endpoint, región si procede, prefijos y retención | S3_BUCKET/ENDPOINT/ACCESS_KEY_ID/SECRET_ACCESS_KEY: P; contrato del adaptador pendiente |
| Sesiones/cifrado actuales | Responsable, entorno, claves existentes y procedimiento de rotación | TOKEN_ENCRYPTION_KEY/OPENMUSE_ACCESS_KEY: C; no sustituir por SESSION_SECRET/ENCRYPTION_KEY genéricos |
| Better Auth | Variante/producto usado, decisión de adopción, DB, rutas y proveedores de login | BETTER_AUTH_SECRET/URL: estándar del producto, P para este repositorio; no está integrado por preparar las claves |
| Composio | Workspace, región si aplica, conectores, auth configs y conexiones por tenant | COMPOSIO_API_KEY: P; verificar nombres y separación de usuarios antes de uso |
| Backups | Fuente, destino, cifrado, retención, acceso y restore | BACKUP_INTERVAL_HOURS/RETENTION_DAYS: C/E; credenciales del destino según adaptador |

### 4.2 Modelos, voz y búsqueda

| Servicio | Preparación completa | Variables / estado del contrato |
| --- | --- | --- |
| OpenAI API | Organización/proyecto, credencial de servidor, modelo y presupuesto | OPENAI_API_KEY/BASE_URL: C; seleccionar modelo explícitamente, no copiar ejemplos históricos |
| Anthropic / Claude API | Organización/workspace, key, modelos y presupuesto | ANTHROPIC_API_KEY: C en selección del agente; soporte de cada recorrido por verificar |
| Gemini / Google AI Studio | Proyecto, API, facturación/cuotas, restricciones y modelos | GEMINI_API_KEY: C; config la adapta a GOOGLE_API_KEY; no duplicar claves sin propósito |
| OpenRouter | Cuenta/workspace, key, modelos/proveedores permitidos y coste | OPENROUTER_API_KEY/MODEL y MODEL_FALLBACK: C; ver precedencia y no sobreescribir OPENAI_API_KEY existente |
| DeepSeek API directa | Cuenta/proyecto disponible, key, endpoint/modelo y cuota | DEEPSEEK_API_KEY/BASE_URL/MODEL: P; no existe consumidor dedicado comprobado aquí |
| Kernel rápido/lento | Proveedor/modelo, función y presupuesto de cada carril | FAST_LLM_* y SLOW_LLM_*: C/E; no asumir que dos keys del mismo proyecto dan cuotas independientes |
| Embeddings/RAG | Modelo, dimensiones, índice, origen de documentos y coste | EMBEDDINGS_LLM_*: E; comprobar consumidor efectivo. No inventar EMBEDDING_MODEL como alias compatible |
| Vapi | Organización, assistant ID, número, herramientas/callbacks y límites | VAPI_API_KEY/ASSISTANT_ID: E; número/callback/secreto por confirmar con implementación |
| ElevenLabs | Workspace, key, voice ID/modelo, idiomas y derechos de voz | ELEVENLABS_API_KEY/VOICE_ID: P para el repositorio |
| Transcripción/audio | Elegir si Vapi/OpenAI/otro cubre STT/TTS, recursos y retención | No crear otra suscripción por defecto; registrar proveedor y contrato elegido |
| Brave Search | Cuenta, plan/API, key y cuota | BRAVE_SEARCH_API_KEY: P; no asumir que WEB_SEARCH_API_KEY activa este servicio |
| Tavily | Proyecto, key, búsqueda/extracción y cuota | TAVILY_API_KEY: P |
| Apify | Workspace, token, actores/datasets y límites | APIFY_API_TOKEN: P; actores/orígenes explícitos |
| Serper | Candidato del checklist anterior, no decisión de producto | SERPER_API_KEY: P, reservado hasta confirmar |

Claude directo, DeepSeek directo y OpenRouter son filas independientes aunque una pasarela pueda ofrecer modelos de otros proveedores. Guardar una key directa no habilita por sí solo el camino a través de la pasarela ni viceversa.

### 4.3 Google: una ficha por capacidad, no una sola fila OAuth

| Capacidad | Datos y permisos que preparar | Separación |
| --- | --- | --- |
| Proyecto Google Cloud | Project ID, APIs habilitadas, billing, usuarios y cuota | Infraestructura compartida de aplicaciones; recursos por entorno |
| Login Google | Client OAuth del login, branding, usuarios, callback del auth elegido | Identidad; no pedir Gmail completo para iniciar sesión |
| Gmail | Buzón, lectura/borradores/envío necesarios, OAuth y límites | Conexión cifrada por tenant/usuario; aprobar envío según producto |
| Calendar | Calendar ID, propietario, disponibilidad, zona y permisos | Conexión por tenant, identidad de cita y reconciliación |
| Drive | Carpetas/shared drives elegidos, permisos y tipos de archivo | Documentos empresariales del tenant, no acceso global por comodidad |
| Docs | Lectura/edición requeridas y documentos autorizados | Capacidad a verificar/implementar; no derivar todo de Drive sin revisar |
| Sheets | Hojas/rangos y permisos necesarios | Datos tabulares y posible CRM; evidencia de consumidor pendiente |
| Slides | Presentaciones/plantillas y operaciones requeridas | Capacidad futura, sin asumir adaptación implementada |
| Maps | Uso servidor/navegador, APIs exactas, restricciones y cuotas | GOOGLE_MAPS_API_KEY: E; tenerla no prueba conector |
| Places | Caso de búsqueda/detalle, campos y coste | Registrar servicio/API y consentimiento de uso; no confundir con mera visualización de mapas |
| Google Business Profile | Business/accounts/locations IDs y acceso API concedido | Conexión OAuth específica; no confundir con perfil personal de Google |

GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET son C para el conector empresarial actual. config.ts deriva el callback de PUBLIC_API_URL + /api/google/callback. Gmail/Calendar/Drive pueden compartir cliente OAuth si el diseño lo decide, pero cada autorización tiene identidad/scopes. No fijar GOOGLE_OAUTH_SCOPES, GMAIL_SCOPES, GOOGLE_DRIVE_SCOPES ni GOOGLE_REDIRECT_URI como variables consumidas sin verificar su lector. Los refresh/access tokens se guardan en la conexión cifrada, no como un token global del primer cliente.

### 4.4 Comunicación, clientes y cobros

| Servicio | Qué registrar | Contrato |
| --- | --- | --- |
| Meta Business | Titular, Business/App/WABA IDs, permisos y estado de acceso | IDs no secretos; app secret y tokens separados |
| WhatsApp Cloud API | Phone number ID, número, plantillas, destinatarios piloto, callback | WHATSAPP_TOKEN/PHONE_ID: E; WHATSAPP_APP_SECRET/VERIFY_TOKEN/WEBHOOK_BINDINGS: C |
| Evolution si se elige | URL, instancia, propietario, reentregas y cabecera dedicada | WHATSAPP_API_KEY/BASE_URL/INSTANCE: C; secretEnv dedicado WHATSAPP_*_INBOUND_SECRET para entrada |
| Resend | Dominio verificado, remitente/reply-to, prueba y eventos | RESEND_API_KEY: E; EMAIL_FROM: P hasta verificar lector |
| LinkedIn | App, organización, permisos API concedidos y caso de uso | LINKEDIN_CLIENT_ID/SECRET: P; no pedir contraseña personal al bot |
| Stripe | Cuenta, moneda/país, catálogo/precios, sandbox/live y webhook | STRIPE_API_KEY/WEBHOOK_SECRET: C; STRIPE_PUBLISHABLE_KEY: P si el frontal la necesita |
| CRM cliente | Producto, cuenta, pipeline, campos y permisos | Por determinar y por tenant; no inventar API universal |
| Holded/ERP | Candidato del checklist, organización y necesidad | ERP_API_KEY no es contrato actual confirmado; reservar hasta elegir proveedor |
| Leads/importaciones | Procedencia, formato, IDs, reglas de contacto y exclusión | Datos de entrada aunque no tengan key; aislar por tenant |
| Newsletter | Remitente, lista/autorización, borrador, revisión y métricas | Preparar no autoriza envíos reales |

En Meta el token de handshake no sustituye app secret ni token de salida. No renombrar WHATSAPP_TOKEN a WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_ID a WHATSAPP_PHONE_NUMBER_ID o WHATSAPP_APP_SECRET a META_APP_SECRET sin modificar y verificar el contrato de aplicación. WABA ID puede ser necesario para operar aunque no exista una env actual.

### 4.5 Observabilidad completa: componentes y cuentas no son lo mismo

Confirmados por Alfonso: OpenTelemetry, Grafana y Sentry Cloud. Langfuse aparece en el checklist aportado. Los demás componentes se incluyen como candidatos para preparar, no como recuerdo confirmado de las seis herramientas originales.

| Componente | Función en el inventario | Datos a recoger |
| --- | --- | --- |
| OpenTelemetry SDK/instrumentación | Generación de señales | Servicio, entorno, propagación/correlación y redacción |
| OpenTelemetry Collector | Recogida/procesamiento/exportación | Destino, protocolo, autenticación y filtros |
| Grafana Alloy | Alternativa/complemento de recogida según topología | Despliegue/config elegidos; evitar doble envío accidental |
| Grafana Cloud / Grafana | Paneles, stack y acceso | Organización/stack, endpoints, usuarios y scopes |
| Prometheus | Métricas y scraping | Targets, acceso y retención |
| Mimir | Backend de métricas | Endpoint/tenant/auth si se usa |
| Loki | Logs | Endpoint, etiquetas, retención y filtros de datos |
| Tempo | Trazas | OTLP endpoint, acceso y sampling |
| Pyroscope | Perfiles de rendimiento | Endpoint y proceso instrumentado |
| Sentry Cloud | Errores y seguimiento de aplicación | Org/proyecto, DSN, entorno y redacción; token de releases separado |
| Langfuse | Trazas/evaluación LLM | Proyecto, host/región, keys y política de captura de prompts |
| Alertas/uptime | Entrega de incidentes y comprobaciones | Destinatario/canal, reglas, ventana y escalado; proveedor por decidir |

Todos los nombres de variables de esta sección son P para el runtime salvo comprobación posterior. Ejemplos de contratos a estudiar: OTEL_EXPORTER_OTLP_ENDPOINT/HEADERS, OTEL_SERVICE_NAME, SENTRY_DSN/AUTH_TOKEN, LANGFUSE_PUBLIC_KEY/SECRET_KEY/BASE_URL. No guardar JSON de cabeceras o secretos en notas públicas. No dar por hecho que cada componente exige abrir otra cuenta o contratar otro plan.

## 5. Secuencia del copiloto: una tarea pequeña cada vez, inventario siempre completo

1. Reconoce el objetivo global y presenta el inventario acumulado, sin volver a recortarlo a la beta.
2. Pregunta una sola vez por shell (PowerShell en Windows por defecto), proyecto/config de Doppler, entorno y qué servicio quiere completar. Son datos no secretos. Conserva la respuesta.
3. Para ese servicio, verifica documentación oficial actual. Explica función, recurso, requisitos y permisos antes de pedir clicks. No prescribas contratar planes ni sustituir proveedores ya preparados sin necesidad concreta.
4. Da un paso ejecutable, su efecto y el resultado no secreto esperado. Si hay varias rutas de UI, usa la que Alfonso tiene, no pantallas inventadas.
5. Ayuda a crear/seleccionar el recurso y después la credencial con permisos acotados. Alfonso introduce el secreto directamente en Doppler; no lo pega en la conversación.
6. Genera el comando solo después de conocer nombre/contrato/entorno. Señala si creará o reemplazará un valor y no rote claves existentes por rutina. Una key propuesta debe identificarse como preparación, no como integración automática.
7. Pide confirmación del resultado sin secretos: terminó correctamente, código de error redactado, ID de recurso no sensible o estado en consola. No pedir dumps de entorno, salida de secrets get ni capturas con claves visibles.
8. Ofrece una comprobación sin efectos, revisada para ese proveedor. Guardar no prueba conexión. Enviar mensajes, llamar, cobrar, publicar, desplegar y cambiar DNS son pasos distintos y explícitos.
9. Actualiza la ficha/checkpoint y ofrece continuar con el siguiente servicio o pendiente. No reinicies el checklist ni obligues a enumerarlo otra vez.

Formato de cada respuesta operativa: servicio/entorno y estado -> paso actual -> instrucción o comando -> resultado esperado -> dato no secreto que necesitamos después. Si Alfonso se atasca, diagnostica ese paso antes de saltar a otro producto.

## 6. Doppler: comandos base comprobados, sin valores secretos en el historial

Fuente: documentación oficial y ayuda de la CLI local; verificar flags si cambia la versión. No se ha autenticado ni escrito ningún secreto durante la preparación de esta guía.

Inicio en PowerShell, si no está autenticado:

```powershell
doppler --version
doppler login
```

Tras confirmar proyecto y config reales (los nombres siguientes son placeholders, no ejecutar literalmente):

```powershell
doppler secrets set OPENAI_API_KEY --project PROYECTO_REAL --config CONFIG_REAL --silent
```

Introduce el valor en la entrada interactiva de la CLI, no dentro del comando. Sigue su instrucción de terminación; la documentación actual usa una línea con un punto. La entrada interactiva evita el valor literal en el historial de comandos, pero no garantiza ocultarlo en pantalla: evita compartir/grabar la terminal; si necesitas entrada enmascarada, usa el dashboard de Doppler.

Para otro secreto, sustituye únicamente el nombre tras acordar su contrato. No generes 40 comandos con valores vacíos: pueden sobrescribir una configuración válida. No uses secretos literales en argumentos, echo, archivos versionados o variables que luego imprimas.

Para un dato no secreto y ya acordado sí puede utilizarse asignación explícita:

```powershell
doppler secrets set PUBLIC_API_URL='https://www.agntiapro.com' --project PROYECTO_REAL --config CONFIG_REAL --silent
```

Esto es preparación del entorno elegido, no configura DNS ni despliega. No repetir sobre producción sin comprobar que el cambio es el deseado.

No sugerir como verificación comandos que impriman valores (secrets get --plain, downloads, env completo). Comprobar código de salida y presencia/nombre en interfaz sin revelarlo. No ejecutar doppler run sobre tests con config productiva. Los service tokens de agentes se entregan por un canal de credenciales autorizado con alcance mínimo; guardarlos en Doppler no resuelve por sí solo el acceso inicial del agente a Doppler.

## 7. Better Auth: preparación e integración son pasos distintos

La documentación oficial configura BETTER_AUTH_SECRET, BETTER_AUTH_URL, una instancia de servidor y su handler. El secret debe tener alta entropía y al menos 32 caracteres. Para este repo esos nombres siguen siendo P: no instalar ni cambiar AUTH_PROVIDER como parte de preparar cuentas.

Guarda sus secretos en Doppler para el entorno decidido y configura referencias en la aplicación cuando haya una integración revisada. Better Auth no recibe las keys de OpenAI, Stripe o Grafana por ser la librería de identidad. Si Alfonso usa un producto alojado, pedir nombre/pantalla y verificar su documentación antes de indicar campos.

Login Google/GitHub, OAuth empresarial y control interno de tenants deben tener recursos/autoridades explícitos. El router actual ya ocupa rutas /api/auth: montar otro handler sin diseño puede colisionar. No registrar callbacks genéricos sin comprobar basePath, proveedor y dominio de la implementación elegida. El callback empresarial existente /api/google/callback no se convierte automáticamente en callback de login Better Auth.

Antes de activar Better Auth: decidir migración/convivencia con sesiones/Supabase, IDs de usuario, memberships, cookies/orígenes, revocación y rollback. Esta decisión pertenece a la fase de código, no al chat que almacena secretos.

## 8. Nombres que no se deben inventar como equivalencias

| Checklist genérico | Contrato actual / decisión |
| --- | --- |
| APP_URL / API_BASE_URL | PUBLIC_API_URL es C; distinguir origen del panel si se separa |
| SESSION_SECRET / ENCRYPTION_KEY | No reemplazan TOKEN_ENCRYPTION_KEY/OPENMUSE_ACCESS_KEY |
| GOOGLE_REDIRECT_URI | El conector actual deriva callback desde PUBLIC_API_URL |
| WHATSAPP_ACCESS_TOKEN / META_APP_SECRET | No equivalen automáticamente a WHATSAPP_TOKEN/APP_SECRET |
| STRIPE_SECRET_KEY | El servidor actual lee STRIPE_API_KEY |
| WEB_SEARCH_API_KEY | No habilita Brave/Tavily sin un adaptador que la lea |
| EMBEDDING_MODEL | No sustituye EMBEDDINGS_LLM_* ni acredita el consumidor real |
| CI_DEPLOY_TOKEN | No existe un token universal para GitHub, Fly, Vercel y Cloudflare |
| BACKUP_* | Hay variables concretas de intervalo/retención; el resto depende del destino |

No renombrar los secretos ya guardados sin inventario y revisión del consumidor. Puede conservarse una referencia al nombre previo durante una transición explícita; no duplicar por inercia.

## 9. Datos del negocio que también son inputs

Owner y miembros de agntia; roles; nombre legal/comercial; oferta y precios aprobados; horario/idioma/zona; buzón, calendario y números; FAQ/material de Drive; reglas de cualificación; transferencia humana; qué acciones requieren aprobación; destinatarios piloto; procedencia de leads y exclusiones; límites de gasto; responsables de incidencias y newsletter. Registro por tenant y finalidad; no mezclar documentos privados de clientes con el inventario público de infraestructura.

## 10. Fuentes y mantenimiento

- Contrato real: archivos enumerados en evidence y su SHA; verificar de nuevo al implementar.
- [Doppler: establecer secretos](https://docs.doppler.com/docs/setting-secrets).
- [Doppler: CLI](https://docs.doppler.com/docs/cli).
- [Better Auth: instalación](https://better-auth.com/docs/installation).
- [Better Auth: Google](https://better-auth.com/docs/authentication/google).
- [OpenAI: autenticación API](https://developers.openai.com/api/reference/overview).
- [Grafana: componentes del stack](https://grafana.com/about/grafana-stack/).

Los enlaces de los seis puntos anteriores se consultaron para esta edición; no se validaron todas las consolas del catálogo. Para cada paso nuevo el copiloto añade la fuente oficial del proveedor y fecha de consulta. No fijamos modelos/precios actuales en esta guía para no convertirlos en dependencias caducadas.

El catálogo puede crecer. Ningún listado garantiza adivinar herramientas aún no nombradas. Si faltan las seis herramientas exactas que Alfonso recuerda, conservar los componentes candidatos y marcar pendiente de identificar, sin afirmar que se han recuperado esos nombres.

## 11. Primer mensaje que debes dar al recibir este documento

He cargado el inventario completo y conservaré también los servicios reservados para el futuro. Te ayudaré con un paso cada vez y mantendré el estado acumulado. No necesito que pegues claves aquí. Dime el proyecto/config de Doppler y el entorno con el que estás trabajando, y qué servicio tienes abierto ahora; si ya me lo has dicho en este chat, usaré esos datos y seguiré desde el último paso pendiente.

## 12. Ampliación comprobada VS-02a: salida WhatsApp

Contrato nuevo del runtime: WHATSAPP_OUTBOUND_ENABLED=true solo permite salida junto a modo live, conexión propia habilitada, allowlist y aprobación. Contrato nuevo del script de operador: WHATSAPP_PROVISION_API_KEY se lee al aplicar scripts/provision-whatsapp.ts y se cifra en la conexión; no es una key global de fallback. Guardar sin activar ni ejecutar --apply por preparar el inventario. TOKEN_ENCRYPTION_KEY conserva su función y no debe rotarse incidentalmente. Procedimiento y límites en WHATSAPP-PILOTO-APROBACIONES.md, en este mismo directorio.
