# C08 — Verificación documental del proveedor JEV

Estado: **PROVIDER_DOCS_VERIFIED / LOCAL_CONTRACT_TESTED / LIVE_DISABLED**. Fecha: 2026-11-16. No es sandbox externo ni certificación de calibración/rendimiento.

## Fuentes públicas comprobadas

- https://typesafe.ai/ enlaza su documentación y presenta Jev como su modelo.
- https://docs.typesafe.ai/introduction y https://docs.typesafe.ai/introduction/quickstart describen preguntas tipadas y la API.
- https://docs.typesafe.ai/api/system-one documenta POST https://api.typesafe.ai/v1/systemone, Authorization Bearer y model/state/questions; respuesta model/answers/usage.
- https://docs.typesafe.ai/models documenta IDs fijados jev-1.14.0 y jev-1.13.0 y advierte que los aliases cambian. Se rechaza drift de versión.
- https://docs.typesafe.ai/legal enlaza DPA/privacidad. No se presume contrato de cliente, región ni ZDR contratado.
- https://docs.typesafe.ai/llms.txt enlaza el OpenAPI https://api.typesafe.ai/openapi.json. Se descargó solo mediante GET, sin credenciales ni datos privados.

OpenAPI SHA-256: `3ca93b6e6b9aa8d7820531b78c66ed7a9798b11e6e163ad96b140fb3d75fbcf4`. `evidence/TYPESAFE-CONTRACT.json` conserva una proyección de las definiciones funcionales usadas, no un OpenAPI autónomo completo. `evidence/TYPESAFE-WIRE-VALIDATION.json` registra validación local de request/response sintéticos contra los schemas completos descargados, con jsonschema 4.26.0 / Draft202012. No se envió una petición de inferencia real.

El host jev.ai mostró una página de parking al consultarlo. No se usan imitaciones, agregadores ni simple-jev como si fueran el proveedor oficial. La integración de esta rama se llama explícitamente TypeSafe. El SDK oficial publicado se denomina @typesafe-ai/sdk; no se instaló ni se inventó un SDK. El adaptador usa el REST documentado con fetch nativo.

## Adaptador implementado

`engine/cognition/v2/jev-classifier.ts`: siete preguntas Choice en una petición (familia y seis polos independientes). Cada polo permite unknown/absent/weak/moderate/strong: se normaliza a null/0/1⁄3/2⁄3/1 como valoración ordinal propuesta, no probabilidad de un hecho. Las diez dimensiones permanecen desconocidas cuando no hay evaluación respaldada.

El resultado conserva versión real, requestDigest canónico, receipt de egreso, uso de tokens reportado y distribuciones/confianza. La calibración se marca not_locally_verified; no se traduce confianza del proveedor a verdad de negocio ni a permiso. Las hipótesis de Slow no se promueven y los desacuerdos permanecen explícitos.

Límites: entrada fuente 32 KiB, texto minimizado 8 KiB, request 16 KiB y respuesta leída por stream 64 KiB. No imágenes, audio, long-context ni redirects. Una petición por evaluación, sin retry interno. Timeout/cancelación usan el carril existente y fallback de reglas.

## Gobierno de datos y activación

No se activa leyendo una variable o por petición de un modelo. Requiere inyección de un SemanticClassifier en el bootstrap confiable del runtime y un JevEgressGate obligatorio:

1. prepare persiste consentimiento/política y reserva de cuota, ligados a actor/tenant, proveedor/modelo/ontología, hashes de contenido/contexto/evidencia y expiración; devuelve solo texto minimizado.
2. isCurrent revalida antes de enviar y antes de aceptar la respuesta.
3. record registra uso/resultado de forma idempotente por receiptId. Un fallo de confirmación se marca ACCOUNTING_UNKNOWN sin emitir un recibo contradictorio. Los grants incompletos necesitan reconciliación del gateway.

El adaptador no implementa por sí mismo un PDP empresarial ni presume que lectura equivale a permiso de exportación. El gateway durable y sus políticas reales aún deben configurarse/integrarse. Sin ello el runtime conserva RulesClassifier y no hace llamadas externas. TYPESAFE_API_KEY se carga desde secretos del servidor al construir el adaptador; nunca desde prompts ni se publica. Las pruebas usan claves artificiales y transporte simulado.

## Verificación ejecutada

Siete tests locales PASS: contrato/endpoints y minimización; unknown; denegación/pre-abort; respuestas inválidas/probabilidades/drift/tamaño; cancelación/revocación/429/error de transporte; incertidumbre de accounting; integración con Slow→kernel→Card/proyector sin certeza o acuerdo inventados. Wire request/response PASS contra OpenAPI oficial. Typecheck raíz ejecutado, sin instalar dependencias adicionales.

Pendiente: cuenta/clave y permisos efectivos del modelo, gateway/PDP de egreso y cuotas durables, contrato aplicable y tenants sintéticos autorizados, prueba real, corpus gold/calibración/ablaciones, métricas y costes reales. La identificación del proveedor ya no es el bloqueo; la activación y validación reales sí lo son.
