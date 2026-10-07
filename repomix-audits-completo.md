This file is a merged representation of a subset of the codebase, containing specifically included files and files not matching ignore patterns, combined into a single document by Repomix.

# File Summary

## Purpose
This file contains a packed representation of a subset of the repository's contents that is considered the most important context.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Only files matching these patterns are included: docs/audits/**/*
- Files matching these patterns are excluded: **/node_modules/**, **/*.ps1, **/desktop.ini
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
````
docs/
  audits/
    _prep/
      audit-contracts.txt
      audit-idempotency.txt
      audit-tenant-default.txt
      hanging-before.txt
      test-full.txt
      typecheck-web.txt
      typecheck.txt
    _stage-final/
      politica-validacion.md
      stage-ui-llm-viewspec.md
    00-agentes-docs/
      egente-brainstorm.txt
    00-coherencia/
      fixes.md
      miniaudit.md
      report.md
      roadmap.md
    01-tests/
      fixes.md
      miniaudit.md
      roadmap.md
    02-observabilidad/
      fixes.md
      miniaudit.md
      roadmap.md
    03-resiliencia/
      diagnostico.md
      fixes.md
      miniaudit.md
      roadmap.md
    04-multi-usuario-concurrente/
      fixes.md
      miniaudit.md
      roadmap.md
    05-motor-tareas-durable/
      fixes.md
      miniaudit.md
      roadmap.md
      ux-2026-10-06.md
    06-aprobaciones-acciones/
      fixes.md
      miniaudit.md
      roadmap.md
    07-aislamiento-multi-tenant/
      fixes.md
      miniaudit.md
      roadmap.md
    08-bus-de-eventos/
      fixes.md
      miniaudit.md
      roadmap.md
    09-kernel-cognitivo/
      09z-fundamentos.md
      fixes.md
      miniaudit.md
      roadmap.md
    10-fast-slow-llm/
      fixes.md
      miniaudit.md
      roadmap.md
    11-chat-con-llm/
      fixes.md
      miniaudit.md
      roadmap.md
    12-contexto-memoria/
      fixes.md
      miniaudit.md
      roadmap.md
    13-ui-servida-viewspec/
      fixes.md
      miniaudit.md
      roadmap.md
    14-templates-reales/
      fixes.md
      miniaudit.md
      roadmap.md
    15-frontend-react/
      fixes.md
      miniaudit.md
      roadmap.md
    16-autenticacion/
      fixes.md
      miniaudit.md
      roadmap.md
    17-seguridad-basica/
      fixes.md
      miniaudit.md
      roadmap.md
    18-deploy-infra/
      fixes.md
      miniaudit.md
      roadmap.md
    19-backups-restore/
      fixes.md
      miniaudit.md
      roadmap.md
    20-computer-sandbox/
      fixes.md
      miniaudit.md
      roadmap.md
    21-browser-worker/
      fixes.md
      miniaudit.md
      roadmap.md
    22-google-drive-gmail/
      fixes.md
      miniaudit.md
      roadmap.md
    23-whatsapp-stripe-gmb/
      fixes.md
      miniaudit.md
      roadmap.md
    24-business-os-goals/
      miniaudit.md
      roadmap.md
    25-docs-operativos/
      miniaudit.md
      roadmap.md
    _pendientes.md
    26-capability-e2e-miniaudit (1).md
    POLICY_REPO.md
    PROTOCOLO_FIXES.md
    README.md
    SOP.md
````

# Files

## File: docs/audits/_prep/audit-contracts.txt
````
node.exe : $ tsx scripts/audits/contracts.ts
En C:\nvm4w\nodejs\pnpm.ps1: 16 Carácter: 5
+     & "$basedir/node$exe"  
"$basedir/node_modules/corepack/dist/pnpm. 
...
+     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: 
    ($ tsx scripts/audits/contracts.ts:Str  
  ing) [], RemoteException
    + FullyQualifiedErrorId : NativeCommand 
   Error
 
[audit:contracts] Recorriendo dominios...
[audit:contracts] Contratos encontrados: 218
[audit:contracts] Cargando implementaciones...
[audit:contracts] Ficheros de implementacion: 255
[audit:contracts] Buscando implementaciones...
[audit:contracts] Informe escrito en docs/AUDIT_CONTRACTS.md
[audit:contracts] OK: 80   PENDING: 14   HUERFANOS: 124
[audit:contracts] Hay 124 contratos sin 
implementar y sin marca PENDING.
[ELIFECYCLE] Command failed with exit code 1.
````

## File: docs/audits/_prep/audit-idempotency.txt
````
node.exe : $ tsx 
scripts/audits/idempotency.ts
En C:\nvm4w\nodejs\pnpm.ps1: 16 Carácter: 5
+     & "$basedir/node$exe"  
"$basedir/node_modules/corepack/dist/pnpm. 
...
+     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: 
    ($ tsx scripts/audits/idempotency.ts:S  
  tring) [], RemoteException
    + FullyQualifiedErrorId : NativeCommand 
   Error
 
[audit:idempotency] Recorriendo ficheros...
[audit:idempotency] Ficheros: 311
[audit:idempotency] Marcas encontradas: 713
[audit:idempotency] Informe escrito en docs/AUDIT_IDEMPOTENCY.md
[audit:idempotency] DUPLICADAS: 75   HUERFANAS: 4   REPETIDAS: 64
[audit:idempotency] Hay marcas conflictivas 
o repetidas.
[ELIFECYCLE] Command failed with exit code 1.
````

## File: docs/audits/_prep/audit-tenant-default.txt
````
node.exe : $ tsx 
scripts/audits/tenant-default.ts
En C:\nvm4w\nodejs\pnpm.ps1: 16 Carácter: 5
+     & "$basedir/node$exe"  
"$basedir/node_modules/corepack/dist/pnpm. 
...
+     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: 
    ($ tsx scripts/audits/tenant-default.t  
  s:String) [], RemoteException
    + FullyQualifiedErrorId : NativeCommand 
   Error
 
[audit:tenant-default] Recorriendo ficheros...
[audit:tenant-default] Ficheros: 303
[audit:tenant-default] Informe en docs/AUDIT_TENANT_DEFAULT.md
[audit:tenant-default] PERMITIDAS: 63   PROHIBIDAS: 2
[ELIFECYCLE] Command failed with exit code 1.
````

## File: docs/audits/_prep/test-full.txt
````
node.exe : $ tsx --test 
--test-timeout=20000 tests/*.test.ts
En C:\nvm4w\nodejs\pnpm.ps1: 16 Carácter: 5
+     & "$basedir/node$exe"  
"$basedir/node_modules/corepack/dist/pnpm. 
...
+     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: 
    ($ tsx --test --...tests/*.test.ts:Str  
  ing) [], RemoteException
    + FullyQualifiedErrorId : NativeCommand 
   Error
 
Ô£ö denying a persisted proposal never calls its adapter (10053.038ms)
Ô£ö concurrent approval consumes the proposal only once (121.3801ms)
Ô£ö wrong owner and stale hash cannot approve (27.2022ms)
Ô£ö expired and disconnected proposals never reach the provider (35.1278ms)
Ô£ö uncertain writes retain uncertainty and cannot be retried (50.1053ms)
Ô£ö another service instance sees persisted proposals (40.3464ms)
Ô£ö event validation preserves all-day semantics and rejects missing offsets (163.2628ms)
Ô£ö account switching and reconnecting invalidate a prepared action (25.7747ms)
Ô£ö review stores authoritative calendar details and binds execution to their version (84.8744ms)
Ô£ö idempotent proposal replay returns a completed action before another provider preparation (89.4397ms)
Ô£ö concurrent idempotent proposals retain a single persisted review and activity entry (46.8164ms)
Ô£ö an expired stale review cannot overwrite a concurrently executing action (72.6365ms)
Ô£û agent API requires a session and reports the actual worker state (76011.7086ms)
Ô£û the main conversation thread survives reopening and concurrent initialization (5.1377ms)
Ô£û task detail and controls stay scoped to the authenticated owner (2.7785ms)
Ô£û agent request validation rejects malformed input with useful JSON errors (0.8813ms)
Ô£û goal updates validate milestones and pausing a goal pauses its task (0.9389ms)
Ô£û memories can be edited and forgotten while identity changes persist (0.487ms)
Ô£û idea dismissal survives refresh and concurrent acceptance creates one goal and task (0.4269ms)
Ô£û sample monitor saves its baseline and deduplicates notifications for repeated changes (0.515ms)
Ô£û live mode rejects sample sources and hides the fixture mutation endpoint (0.4981ms)
Ô£û C:\Users\Alfonso\Desktop\git hub repos\agente\tests\agent-api.test.ts (3973.1007ms)
Ô£ö spawn devuelve runtimeId unico y activoCount lo cuenta (11.4356ms)
Ô£ö complete limpia el runtime activo (2.401ms)
Ô£ö fail limpia el runtime y no propaga excepcion (1.1663ms)
Ô£ö complete/fail sobre runtime inexistente no hace nada (0.8656ms)
Ô£ö correlationId se genera si no se pasa y se reutiliza si se pasa (1.6548ms)
Ô£û API protects private data and rejects unrelated web origins (34542.5787ms)
Ô£û sample workspace serves a real PDF and filling creates a new version (5.0389ms)
Ô£û reviewed sample email persists a receipt, then revocation blocks another proposal (4.3835ms)
Ô£û missing browser setup is explicit rather than a fictional browser session (0.7474ms)
Ô£û calendar ranges and complete sample mail threads survive navigation (52.1413ms)
Ô£û sample agent streams actual AG-UI events without a model key (0.4071ms)
Ô£û guided document delegation streams a rich tool result bound to its saved task (0.2681ms)
Ô£ö sop.step_started anade progress (5.9129ms)
Ô£ö task.status_changed running anade timer (0.8916ms)
Ô£ö task.completed anade done (0.957ms)
Ô£ö action.deferred sin executeAt anade alerta (0.8252ms)
Ô£ö action.deferred con executeAt elimina el item (1.1784ms)
Ô£ö action.executed elimina el item (1.1882ms)
Ô£ö evento desconocido no cambia el estado (0.7103ms)
Ô£ö upsert del mismo kind reemplaza, no duplica (3.5581ms)
Ô£û a wrong password is a 401 and never leaks whether the user exists (77692.4314ms)
Ô£û login returns a token, the user and the real server mode (3.969ms)
Ô£û the authenticated owner gets its own sample workspace seeded (15.9597ms)
Ô£û google status is readable so the UI can show the connect button (3.9821ms)
Ô£û the login rate limit answers 429 with Retry-After (0.7513ms)
Ô£û C:\Users\Alfonso\Desktop\git hub repos\agente\tests\auth.test.ts (2.7985ms)
Ô£û browser API reopens an owned profile at the edited address and renews console access (33661.9283ms)
Ô£ö server reopens the same worker UUID regardless of stale local session status (17643.8581ms)
Ô£ö console input persists the worker's current page title and URL (17188.8645ms)
Ô£ö failed creation remains app-visible and can be retried with its original UUID (14280.1338ms)
Ô£ö browser observations reuse an owned profile and reject unowned reads (12406.8995ms)
Ô£ö chat browser reads reuse a persisted owned profile across turns and service restarts (11670.0808ms)
Ô£ö chat browser retries failed navigation using the reserved profile (12726.9924ms)
Ô£ö concurrent chat reads keep each navigation paired with its page read (10858.1156ms)
Ô£ö cancelled chat browser requests do not start navigation or a follow-up read (8927.4624ms)
Ô£ö browser read fails on missing page text instead of inventing observation content (11026.2406ms)
Ô£ö browser imports return rejected downloads even when no PDF was accepted (14037.6813ms)
Ô£ö worker persists unsupported, oversized and interrupted download outcomes (2116.8578ms)
Ô£ö browser rejects private, special-use and encoded IP addresses (43.3025ms)
Ô£ö browser rejects DNS answers containing any private address and pins public resolution (3.4761ms)
Ô£ö worker protects all controls, validates before launch, and health reveals no sessions (2397.6189ms)
Ô£ö egress proxy blocks HTTP and CONNECT traffic to local network destinations (100.8066ms)
Ô£ö createEntity guarda provenance obligatoria (24555.8289ms)
Ô£ö createEntity con id duplicado lanza 409 (5277.2967ms)
Ô£ö updateEntity preserva properties no tocadas y actualiza provenance (5226.0973ms)
Ô£ö listEntities filtra por type (5341.8986ms)
Ô£ö createRelation exige que ambas entidades existan (5150.3963ms)
Ô£ö relation no puede ser self-referencial (3972.7163ms)
Ô£ö neighborhood depth 1 y 2 devuelve entidades conectadas (5514.1661ms)
Ô£ö deleteEntity borra tambien sus relaciones huerfanas (5129.9563ms)
Ô£ö BusinessTruth proyecta cada property con su provenance (2638.16ms)
Ô£ö business entities estan scoped por owner (2890.3971ms)
Ô£ö goalSchema parsea un Goal completo (7071.5681ms)
Ô£ö outcomeSchema parsea un Outcome completo (62.6596ms)
Ô£ö capabilityContractSchema parsea una capability (62.0817ms)
Ô£ö executionContextSchema parsea (16.2463ms)
Ô£ö orchestrator devuelve achieved si verifier verifica (9.9243ms)
Ô£ö orchestrator devuelve blocked si no hay deps (1.0932ms)
Ô£ö Goal con criterio de exito se verifica correctamente (147.3771ms)
Ô£ö CapabilityRegistry registra y lista capabilities (123.3525ms)
Ô£û computer REST endpoints require session ownership and return persisted receipts (32987.8791ms)
´╣ú Docker subprocess uses literal argv, strips provider credentials, caps output and bounds hangs (3.4495ms) # Node spawn with shell:false cannot execute .cmd shims on Windows; run on Linux CI
Ô£ö disabled computer reports setup without invoking Docker (7271.1862ms)
Ô£ö commands execute solely as Docker argv and persist failed exit/output receipts (196.9666ms)
Ô£ö a running command holds an atomic lease across service instances (109.7695ms)
Ô£ö timeouts and interruptions remain durable and idempotent commands never replay (232.2664ms)
Ô£ö attaching an existing container fails closed on unsafe isolation or owner labels (285.2984ms)
Ô£ö paths cannot escape the workspace and file contents travel on stdin (28.5399ms)
Ô£ö Stop interrupts an active command and its final output cannot overwrite the interrupted receipt (108.6969ms)
Ô£ö exit 137 without a recorded stop remains a failed command (60.7426ms)
Ô£ö restart waits until a delayed pre-stop Docker execution acknowledges completion (163.1691ms)
Ô£ö failed Stop keeps commands quarantined and can be retried before the lease expires (160.7297ms)
Ô£ö a timeout with unconfirmed Docker cleanup stays quarantined until Stop succeeds (147.4761ms)
Ô£ö an expired lease from a dead executor recovers as interrupted without replay (91.3501ms)
Ô£ö assemble sin entidad devuelve rol con sus memorias (7838.7786ms)
Ô£ö assemble con entidad devuelve relaciones (5709.8227ms)
Ô£ö renderContext incluye rol, entidad y memorias (5483.861ms)
Ô£ö assemble falla si el rol no existe (3774.7382ms)
Ô£û chat browse_web emits real SDK tool events and returns observed source content immediately (34591.5815ms)
AI SDK Warning: System messages in the prompt or messages fields can be a security risk because they may enable prompt injection attacks. Use the system option instead when possible. Set allowSystemInMessages to true to suppress this warning, or false to throw an error.
Ô£û chat browse_web emits an honest completed error result when navigation fails (20630.6889ms)
AI SDK Warning: System messages in the prompt or messages fields can be a security risk because they may enable prompt injection attacks. Use the system option instead when possible. Set allowSystemInMessages to true to suppress this warning, or false to throw an error.
Ô£û unsubscribing from chat stops queued browser navigation and further model steps (20470.6191ms)
AI SDK Warning: System messages in the prompt or messages fields can be a security risk because they may enable prompt injection attacks. Use the system option instead when possible. Set allowSystemInMessages to true to suppress this warning, or false to throw an error.
Ô£û chat searches and reads actual owner mail without creating a task or sending (20357.1134ms)
AI SDK Warning: System messages in the prompt or messages fields can be a security risk because they may enable prompt injection attacks. Use the system option instead when possible. Set allowSystemInMessages to true to suppress this warning, or false to throw an error.
APICallError [AI_APICallError]: You exceeded your current quota, please check your plan and billing details. For more information on this error, head to: https://ai.google.dev/gemini-api/docs/rate-limits. To monitor your current usage, head to: https://ai.dev/rate-limit. 
* Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests, limit: 5, model: gemini-3.6-flash
Please retry in 7.580539336s.
    at <anonymous> (C:\Users\Alfonso\Desktop\git hub repos\agente\node_modules\.pnpm\@ai-sdk+provider-utils@4.0.53_zod@3.25.76\node_modules\@ai-sdk\provider-utils\src\response-handler.ts:144:16)
    at process.processTicksAndRejections (node:internal/process/task_queues:104:5)
    at async postToApi (C:\Users\Alfonso\Desktop\git hub repos\agente\node_modules\.pnpm\@ai-sdk+provider-utils@4.0.53_zod@3.25.76\node_modules\@ai-sdk\provider-utils\src\post-to-api.ts:118:28)
    at async GoogleGenerativeAILanguageModel.doStream (C:\Users\Alfonso\Desktop\git hub repos\agente\node_modules\.pnpm\@ai-sdk+google@3.0.126_zod@3.25.76\node_modules\@ai-sdk\google\src\google-generative-ai-language-model.ts:606:50)
    at async fn (C:\Users\Alfonso\Desktop\git hub repos\agente\node_modules\.pnpm\ai@6.0.289_zod@3.25.76\node_modules\ai\src\generate-text\stream-text.ts:1917:27)
    at async <anonymous> (C:\Users\Alfonso\Desktop\git hub repos\agente\node_modules\.pnpm\ai@6.0.289_zod@3.25.76\node_modules\ai\src\telemetry\record-span.ts:34:24)
    at async retryWithExponentialBackoffInternal (C:\Users\Alfonso\Desktop\git hub repos\agente\node_modules\.pnpm\@ai-sdk+provider-utils@4.0.53_zod@3.25.76\node_modules\@ai-sdk\provider-utils\src\retry-with-exponential-backoff.ts:87:12)
    at async streamStep (C:\Users\Alfonso\Desktop\git hub repos\agente\node_modules\.pnpm\ai@6.0.289_zod@3.25.76\node_modules\ai\src\generate-text\stream-text.ts:1866:17)
    at async fn (C:\Users\Alfonso\Desktop\git hub repos\agente\node_modules\.pnpm\ai@6.0.289_zod@3.25.76\node_modules\ai\src\generate-text\stream-text.ts:2442:9)
    at async <anonymous> (C:\Users\Alfonso\Desktop\git hub repos\agente\node_modules\.pnpm\ai@6.0.289_zod@3.25.76\node_modules\ai\src\telemetry\record-span.ts:34:24) {
  cause: undefined,
  url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:streamGenerateContent?alt=sse',
  requestBodyValues: {
    generationConfig: {
      maxOutputTokens: undefined,
      temperature: undefined,
      topK: undefined,
      topP: undefined,
      frequencyPenalty: undefined,
      presencePenalty: undefined,
      stopSequences: undefined,
      seed: undefined,
      responseMimeType: undefined,
      responseSchema: undefined,
      responseModalities: undefined,
      thinkingConfig: undefined
    },
    contents: [ [Object] ],
    systemInstruction: { parts: [Array] },
    safetySettings: undefined,
    tools: [ [Object] ],
    toolConfig: { functionCallingConfig: [Object] },
    cachedContent: undefined,
    labels: undefined,
    serviceTier: undefined
  },
  statusCode: 429,
  responseHeaders: {
    'alt-svc': 'h3=":443"; ma=2592000,h3-29=":443"; ma=2592000',
    'content-length': '1362',
    'content-type': 'text/event-stream',
    date: 'Sun, 04 Oct 2026 11:45:52 GMT',
    server: 'scaffolding on HTTPServer2',
    'server-timing': 'gfet4t7; dur=220',
    vary: 'Origin, X-Origin, Referer',
    'x-content-type-options': 'nosniff',
    'x-frame-options': 'SAMEORIGIN',
    'x-xss-protection': '0'
  },
  responseBody: '{\n' +
    '  "error": {\n' +
    '    "code": 429,\n' +
    '    "message": "You exceeded your current quota, please check your plan and billing details. For more information on this error, head to: https://ai.google.dev/gemini-api/docs/rate-limits. To monitor your current usage, head to: https://ai.dev/rate-limit. \\n* Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests, limit: 5, model: gemini-3.6-flash\\nPlease retry in 7.580539336s.",\n' +
    '    "status": "RESOURCE_EXHAUSTED",\n' +
    '    "details": [\n' +
    '      {\n' +
    '        "@type": "type.googleapis.com/google.rpc.Help",\n' +
    '        "links": [\n' +
    '          {\n' +
    '            "description": "Learn more about Gemini API quotas",\n' +
    '            "url": "https://ai.google.dev/gemini-api/docs/rate-limits"\n' +
    '          }\n' +
    '        ]\n' +
    '      },\n' +
    '      {\n' +
    '        "@type": "type.googleapis.com/google.rpc.QuotaFailure",\n' +
    '        "violations": [\n' +
    '          {\n' +
    '            "quotaMetric": "generativelanguage.googleapis.com/generate_content_free_tier_requests",\n' +
    '            "quotaId": "GenerateRequestsPerMinutePerProjectPerModel-FreeTier",\n' +
    '            "quotaDimensions": {\n' +
    '              "location": "global",\n' +
    '              "model": "gemini-3.6-flash"\n' +
    '            },\n' +
    '            "quotaValue": "5"\n' +
    '          }\n' +
    '        ]\n' +
    '      },\n' +
    '      {\n' +
    '        "@type": "type.googleapis.com/google.rpc.RetryInfo",\n' +
    '        "retryDelay": "7s"\n' +
    '      }\n' +
    '    ]\n' +
    '  }\n' +
    '}\n',
  isRetryable: true,
  data: {
    error: {
      code: 429,
      message: 'You exceeded your current quota, please check your plan and billing details. For more information on this error, head to: https://ai.google.dev/gemini-api/docs/rate-limits. To monitor your current usage, head to: https://ai.dev/rate-limit. \n' +
        '* Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests, limit: 5, model: gemini-3.6-flash\n' +
        'Please retry in 7.580539336s.',
      status: 'RESOURCE_EXHAUSTED',
      details: [Array]
    }
  },
  Symbol(vercel.ai.error): true,
  Symbol(vercel.ai.error.AI_APICallError): true
}
AI SDK Warning: System messages in the prompt or messages fields can be a security risk because they may enable prompt injection attacks. Use the system option instead when possible. Set allowSystemInMessages to true to suppress this warning, or false to throw an error.
APICallError [AI_APICallError]: You exceeded your current quota, please check your plan and billing details. For more information on this error, head to: https://ai.google.dev/gemini-api/docs/rate-limits. To monitor your current usage, head to: https://ai.dev/rate-limit. 
* Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests, limit: 5, model: gemini-3.6-flash
Please retry in 6.906492084s.
    at <anonymous> (C:\Users\Alfonso\Desktop\git hub repos\agente\node_modules\.pnpm\@ai-sdk+provider-utils@4.0.53_zod@3.25.76\node_modules\@ai-sdk\provider-utils\src\response-handler.ts:144:16)
    at process.processTicksAndRejections (node:internal/process/task_queues:104:5)
    at async postToApi (C:\Users\Alfonso\Desktop\git hub repos\agente\node_modules\.pnpm\@ai-sdk+provider-utils@4.0.53_zod@3.25.76\node_modules\@ai-sdk\provider-utils\src\post-to-api.ts:118:28)
    at async GoogleGenerativeAILanguageModel.doStream (C:\Users\Alfonso\Desktop\git hub repos\agente\node_modules\.pnpm\@ai-sdk+google@3.0.126_zod@3.25.76\node_modules\@ai-sdk\google\src\google-generative-ai-language-model.ts:606:50)
    at async fn (C:\Users\Alfonso\Desktop\git hub repos\agente\node_modules\.pnpm\ai@6.0.289_zod@3.25.76\node_modules\ai\src\generate-text\stream-text.ts:1917:27)
    at async <anonymous> (C:\Users\Alfonso\Desktop\git hub repos\agente\node_modules\.pnpm\ai@6.0.289_zod@3.25.76\node_modules\ai\src\telemetry\record-span.ts:34:24)
    at async retryWithExponentialBackoffInternal (C:\Users\Alfonso\Desktop\git hub repos\agente\node_modules\.pnpm\@ai-sdk+provider-utils@4.0.53_zod@3.25.76\node_modules\@ai-sdk\provider-utils\src\retry-with-exponential-backoff.ts:87:12)
    at async streamStep (C:\Users\Alfonso\Desktop\git hub repos\agente\node_modules\.pnpm\ai@6.0.289_zod@3.25.76\node_modules\ai\src\generate-text\stream-text.ts:1866:17)
    at async fn (C:\Users\Alfonso\Desktop\git hub repos\agente\node_modules\.pnpm\ai@6.0.289_zod@3.25.76\node_modules\ai\src\generate-text\stream-text.ts:2442:9)
    at async <anonymous> (C:\Users\Alfonso\Desktop\git hub repos\agente\node_modules\.pnpm\ai@6.0.289_zod@3.25.76\node_modules\ai\src\telemetry\record-span.ts:34:24) {
  cause: undefined,
  url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:streamGenerateContent?alt=sse',
  requestBodyValues: {
    generationConfig: {
      maxOutputTokens: undefined,
      temperature: undefined,
      topK: undefined,
      topP: undefined,
      frequencyPenalty: undefined,
      presencePenalty: undefined,
      stopSequences: undefined,
      seed: undefined,
      responseMimeType: undefined,
      responseSchema: undefined,
      responseModalities: undefined,
      thinkingConfig: undefined
    },
    contents: [ [Object] ],
    systemInstruction: { parts: [Array] },
    safetySettings: undefined,
    tools: [ [Object] ],
    toolConfig: { functionCallingConfig: [Object] },
    cachedContent: undefined,
    labels: undefined,
    serviceTier: undefined
  },
  statusCode: 429,
  responseHeaders: {
    'alt-svc': 'h3=":443"; ma=2592000,h3-29=":443"; ma=2592000',
    'content-length': '1362',
    'content-type': 'text/event-stream',
    date: 'Sun, 04 Oct 2026 11:45:53 GMT',
    server: 'scaffolding on HTTPServer2',
    'server-timing': 'gfet4t7; dur=176',
    vary: 'Origin, X-Origin, Referer',
    'x-content-type-options': 'nosniff',
    'x-frame-options': 'SAMEORIGIN',
    'x-xss-protection': '0'
  },
  responseBody: '{\n' +
    '  "error": {\n' +
    '    "code": 429,\n' +
    '    "message": "You exceeded your current quota, please check your plan and billing details. For more information on this error, head to: https://ai.google.dev/gemini-api/docs/rate-limits. To monitor your current usage, head to: https://ai.dev/rate-limit. \\n* Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests, limit: 5, model: gemini-3.6-flash\\nPlease retry in 6.906492084s.",\n' +
    '    "status": "RESOURCE_EXHAUSTED",\n' +
    '    "details": [\n' +
    '      {\n' +
    '        "@type": "type.googleapis.com/google.rpc.Help",\n' +
    '        "links": [\n' +
    '          {\n' +
    '            "description": "Learn more about Gemini API quotas",\n' +
    '            "url": "https://ai.google.dev/gemini-api/docs/rate-limits"\n' +
    '          }\n' +
    '        ]\n' +
    '      },\n' +
    '      {\n' +
    '        "@type": "type.googleapis.com/google.rpc.QuotaFailure",\n' +
    '        "violations": [\n' +
    '          {\n' +
    '            "quotaMetric": "generativelanguage.googleapis.com/generate_content_free_tier_requests",\n' +
    '            "quotaId": "GenerateRequestsPerMinutePerProjectPerModel-FreeTier",\n' +
    '            "quotaDimensions": {\n' +
    '              "model": "gemini-3.6-flash",\n' +
    '              "location": "global"\n' +
    '            },\n' +
    '            "quotaValue": "5"\n' +
    '          }\n' +
    '        ]\n' +
    '      },\n' +
    '      {\n' +
    '        "@type": "type.googleapis.com/google.rpc.RetryInfo",\n' +
    '        "retryDelay": "6s"\n' +
    '      }\n' +
    '    ]\n' +
    '  }\n' +
    '}\n',
  isRetryable: true,
  data: {
    error: {
      code: 429,
      message: 'You exceeded your current quota, please check your plan and billing details. For more information on this error, head to: https://ai.google.dev/gemini-api/docs/rate-limits. To monitor your current usage, head to: https://ai.dev/rate-limit. \n' +
        '* Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests, limit: 5, model: gemini-3.6-flash\n' +
        'Please retry in 6.906492084s.',
      status: 'RESOURCE_EXHAUSTED',
      details: [Array]
    }
  },
  Symbol(vercel.ai.error): true,
  Symbol(vercel.ai.error.AI_APICallError): true
}
Ô£û chat mail tools report disconnected mail and refuse another owner's thread (16680.8822ms)
APICallError [AI_APICallError]: This model is currently experiencing high demand. Spikes in demand are usually temporary. Please try again later.
    at <anonymous> (C:\Users\Alfonso\Desktop\git hub repos\agente\node_modules\.pnpm\@ai-sdk+provider-utils@4.0.53_zod@3.25.76\node_modules\@ai-sdk\provider-utils\src\response-handler.ts:144:16)
    at process.processTicksAndRejections (node:internal/process/task_queues:104:5)
    at async postToApi (C:\Users\Alfonso\Desktop\git hub repos\agente\node_modules\.pnpm\@ai-sdk+provider-utils@4.0.53_zod@3.25.76\node_modules\@ai-sdk\provider-utils\src\post-to-api.ts:118:28)
    at async GoogleGenerativeAILanguageModel.doStream (C:\Users\Alfonso\Desktop\git hub repos\agente\node_modules\.pnpm\@ai-sdk+google@3.0.126_zod@3.25.76\node_modules\@ai-sdk\google\src\google-generative-ai-language-model.ts:606:50)
    at async fn (C:\Users\Alfonso\Desktop\git hub repos\agente\node_modules\.pnpm\ai@6.0.289_zod@3.25.76\node_modules\ai\src\generate-text\stream-text.ts:1917:27)
    at async <anonymous> (C:\Users\Alfonso\Desktop\git hub repos\agente\node_modules\.pnpm\ai@6.0.289_zod@3.25.76\node_modules\ai\src\telemetry\record-span.ts:34:24)
    at async retryWithExponentialBackoffInternal (C:\Users\Alfonso\Desktop\git hub repos\agente\node_modules\.pnpm\@ai-sdk+provider-utils@4.0.53_zod@3.25.76\node_modules\@ai-sdk\provider-utils\src\retry-with-exponential-backoff.ts:87:12)
    at async streamStep (C:\Users\Alfonso\Desktop\git hub repos\agente\node_modules\.pnpm\ai@6.0.289_zod@3.25.76\node_modules\ai\src\generate-text\stream-text.ts:1866:17)
    at async Object.flush (C:\Users\Alfonso\Desktop\git hub repos\agente\node_modules\.pnpm\ai@6.0.289_zod@3.25.76\node_modules\ai\src\generate-text\stream-text.ts:2402:25) {
  cause: undefined,
  url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:streamGenerateContent?alt=sse',
  requestBodyValues: {
    generationConfig: {
      maxOutputTokens: undefined,
      temperature: undefined,
      topK: undefined,
      topP: undefined,
      frequencyPenalty: undefined,
      presencePenalty: undefined,
      stopSequences: undefined,
      seed: undefined,
      responseMimeType: undefined,
      responseSchema: undefined,
      responseModalities: undefined,
      thinkingConfig: undefined
    },
    contents: [ [Object], [Object], [Object], [Object], [Object] ],
    systemInstruction: { parts: [Array] },
    safetySettings: undefined,
    tools: [ [Object] ],
    toolConfig: { functionCallingConfig: [Object] },
    cachedContent: undefined,
    labels: undefined,
    serviceTier: undefined
  },
  statusCode: 503,
  responseHeaders: {
    'alt-svc': 'h3=":443"; ma=2592000,h3-29=":443"; ma=2592000',
    'content-length': '198',
    'content-type': 'text/event-stream',
    date: 'Sun, 04 Oct 2026 11:45:54 GMT',
    server: 'scaffolding on HTTPServer2',
    'server-timing': 'gfet4t7; dur=2164',
    vary: 'Origin, X-Origin, Referer',
    'x-content-type-options': 'nosniff',
    'x-frame-options': 'SAMEORIGIN',
    'x-xss-protection': '0'
  },
  responseBody: '{\n' +
    '  "error": {\n' +
    '    "code": 503,\n' +
    '    "message": "This model is currently experiencing high demand. Spikes in demand are usually temporary. Please try again later.",\n' +
    '    "status": "UNAVAILABLE"\n' +
    '  }\n' +
    '}\n',
  isRetryable: true,
  data: {
    error: {
      code: 503,
      message: 'This model is currently experiencing high demand. Spikes in demand are usually temporary. Please try again later.',
      status: 'UNAVAILABLE'
    }
  },
  Symbol(vercel.ai.error): true,
  Symbol(vercel.ai.error.AI_APICallError): true
}
Ô£ö importe pequeno: 1 firma programa y ejecuta tras la ventana (3.3835ms)
Ô£ö importe grande exige 2 firmantes distintos (1.6774ms)
Ô£ö cancelar dentro de la ventana evita la ejecucion (0.6844ms)
Ô£ö tick doble no ejecuta dos veces (0.5425ms)
Ô£ö sin doble firma (dualAt=null) basta una (2.2126ms)
Ô£ö emit registra los eventos correctos (0.8176ms)
Ô£ö aquarium research distinguishes exhibit entries from navigation and only quotes observed descriptions (36.1804ms)
Ô£ö the email demo reads the thread returned by search and quotes its actual details (43.436ms)
Ô£ö the email demo handles no matches and disconnected mail without inventing details (14.9321ms)
Ô£ö demo only summarizes browser evidence belonging to the current user turn (2.5187ms)
Ô£ö demo reports missing or failed browser evidence without inventing a summary (2.5318ms)
Ô£ö AI Mock drives the real BuiltInAgent SDK through two browser tool rounds (1481.7195ms)
Ô£ö two workers claim one task only once (7211.8955ms)
Ô£ö cancellation invalidates a stale worker before its next effect (4035.7817ms)
Ô£û expired leases recover saved checkpoints after the database restarts (47242.485ms)
Ô£ö scheduled tasks wait for due time and approvals wait for a recorded outcome (14325.0385ms)
Ô£ö finance artifacts compute cents exactly and reject ambiguous CSV (111.9909ms)
Ô£ö pending reviews do not starve queued work (22287.2347ms)
Ô£ö entity resolver encuentra por CIF (31256.9042ms)
Ô£û todo SystemEventType tiene schema y un payload minimo valido (773.3372ms)
{"ts":"2026-10-04T11:45:34.534Z","level":"error","event":"background_failure","phase":"event emit verification.executed","error":"ZodError","message":"[\n  {\n    \"expected\": \"object\",\n    \"code\": \"invalid_type\",\n    \"path\": [],\n    \"message\": \"Invalid input: expected object, received undefined\"\n  }\n]"}
{"ts":"2026-10-04T11:45:34.537Z","level":"error","event":"background_failure","phase":"event emit verification.disagreement","error":"ZodError","message":"[\n  {\n    \"expected\": \"object\",\n    \"code\": \"invalid_type\",\n    \"path\": [],\n    \"message\": \"Invalid input: expected object, received undefined\"\n  }\n]"}
Ô£ö EventBus.emit no lanza con ningun tipo del enum (25082.007ms)
Ô£û todo SystemEventType del enum aparece en algun bus.emit del repo (20052.7796ms)
Ô£ö evaluateExpression compara n├║meros (534.6628ms)
Ô£ö evaluateExpression soporta exists e in (3.876ms)
Ô£ö fmtDur segundos (8.7161ms)
Ô£ö fmtDur cero (1.0797ms)
Ô£ö fmtDur minuto exacto (4.1276ms)
Ô£ö fmtDur minutos y segundos (1.1752ms)
Ô£ö fmtDur negativos se clampean a 0 (1.3966ms)
Ô£ö mail reads nested plain text and attachment references over authenticated Gmail paths (830.0115ms)
Ô£ö HTML-only messages expose complete plain text while removing active and non-content elements (1117.6016ms)
Ô£ö Gmail attachments decode actual bytes and enforce declared and actual size limits (121.9631ms)
Ô£ö mail sends correctly encoded CRLF MIME and the exact attachment bytes (81.0413ms)
Ô£ö header injection and oversized outgoing attachments fail before credential access (29.8005ms)
Ô£ö replies resolve source metadata and preserve thread and message references (38.8968ms)
Ô£ö reply metadata cannot inject headers (41.0307ms)
Ô£ö calendar reads expanded primary events and maps all-day boundaries (41.7318ms)
Ô£ö calendar writes use calendar IDs, preserve unrelated fields via PATCH, and notify guests (477.0066ms)
Ô£ö calendar review captures authoritative details and requires a usable version (61.75ms)
Ô£ö calendar writes refuse targets changed since review before dispatch (19.6301ms)
Ô£ö calendar review resolves the selected calendar zone when Google omits an event zone (9.5983ms)
Ô£ö calendar writes pass the reviewed version to Google's final conditional write (76.0726ms)
Ô£ö all-day writes use exclusive date-only end and invalid dates never call Google (65.28ms)
Ô£ö event updates explicitly clear the opposite time representation when switching all-day mode (27.5082ms)
Ô£ö scope errors remain visible and do not look like empty inboxes (11.6016ms)
Ô£ö network failures and 5xx write responses produce outcome_unknown without retrying (97.2344ms)
Ô£ö credential failures before dispatch and explicit 4xx writes remain definite failures (23.9442ms)
Ô£ö an interrupted error response body cannot erase uncertainty about a write (7.6443ms)
Ô£ö thread detail reads sent and archived messages outside the inbox list (56.9051ms)
Ô£ö thread detail retrieves complete text bodies stored behind Gmail attachment IDs (18.6208ms)
Ô£ö event reads include earlier today and support selected calendars and bounded ranges (19.9987ms)
Ô£ö calendar discovery follows pagination and retains names, zones, and access roles (40.9661ms)
Ô£ö recurring masters and occurrences are rejected from fresh Google data before updates or deletes (37.0599ms)
Ô£ö single-event validation is repeated at execution and read failures never dispatch writes (13.4473ms)
Ô£ö checkTaskCreation bloquea al superar cuota (21430.4257ms)
Ô£ö checkTokens bloquea al superar cuota (15390.092ms)
Ô£ö pickPrimary devuelve null si no hay actividad (103.6436ms)
Ô£ö alert gana a todo (2.1331ms)
Ô£ö error gana a stale (1.3021ms)
Ô£ö stale gana a pulse (1.2193ms)
Ô£ö pulse gana a progress (1.5306ms)
Ô£ö progress gana a timer (0.9923ms)
Ô£ö entre alertas gana la mas antigua (5.4647ms)
Ô£ö alertUrgency soft a la mitad del SLA (5.2315ms)
Ô£ö alertUrgency urgent pasada la mitad del SLA (3.1023ms)
Ô£ö groupMemories agrupa por categoria cuando no hay roleId (104.2134ms)
Ô£ö groupMemories agrupa por rol si tiene roleId (1.8287ms)
Ô£ö groupMemories filtra por categoria (1.8945ms)
Ô£ö similarity es 1 con textos identicos y 0 sin overlap (2.087ms)
Ô£ö findDuplicate detecta exacto normalizado (4.2037ms)
Ô£ö findDuplicate detecta similar por jaccard >= 0.6 (33.152ms)
Ô£ö findDuplicate no devuelve nada si no supera threshold (1.6766ms)
Ô£û crear memoria con category y tags (71048.6565ms)
Ô£û editar solo text (patch parcial) (8.0866ms)
Ô£û editar category a otro valor (8.4029ms)
Ô£û editar category a null borra la categoria (0.5739ms)
Ô£û patch vacio devuelve 422 (0.7107ms)
Ô£û C:\Users\Alfonso\Desktop\git hub repos\agente\tests\memory.test.ts (1.9918ms)
Ô£û CopilotKit model worker executes server tools and persists the confirmed outcome (22721.2867ms)
AI SDK Warning: System messages in the prompt or messages fields can be a security risk because they may enable prompt injection attacks. Use the system option instead when possible. Set allowSystemInMessages to true to suppress this warning, or false to throw an error.
APICallError [AI_APICallError]: User not found.
    at <anonymous> (C:\Users\Alfonso\Desktop\git hub repos\agente\node_modules\.pnpm\@ai-sdk+provider-utils@4.0.53_zod@3.25.76\node_modules\@ai-sdk\provider-utils\src\response-handler.ts:144:16)
    at process.processTicksAndRejections (node:internal/process/task_queues:104:5)
    at async postToApi (C:\Users\Alfonso\Desktop\git hub repos\agente\node_modules\.pnpm\@ai-sdk+provider-utils@4.0.53_zod@3.25.76\node_modules\@ai-sdk\provider-utils\src\post-to-api.ts:118:28)
    at async OpenAIResponsesLanguageModel.doStream (C:\Users\Alfonso\Desktop\git hub repos\agente\node_modules\.pnpm\@ai-sdk+openai@3.0.116_zod@3.25.76\node_modules\@ai-sdk\openai\src\responses\openai-responses-language-model.ts:1186:50)
    at async fn (C:\Users\Alfonso\Desktop\git hub repos\agente\node_modules\.pnpm\ai@6.0.289_zod@3.25.76\node_modules\ai\src\generate-text\stream-text.ts:1917:27)
    at async <anonymous> (C:\Users\Alfonso\Desktop\git hub repos\agente\node_modules\.pnpm\ai@6.0.289_zod@3.25.76\node_modules\ai\src\telemetry\record-span.ts:34:24)
    at async retryWithExponentialBackoffInternal (C:\Users\Alfonso\Desktop\git hub repos\agente\node_modules\.pnpm\@ai-sdk+provider-utils@4.0.53_zod@3.25.76\node_modules\@ai-sdk\provider-utils\src\retry-with-exponential-backoff.ts:87:12)
    at async streamStep (C:\Users\Alfonso\Desktop\git hub repos\agente\node_modules\.pnpm\ai@6.0.289_zod@3.25.76\node_modules\ai\src\generate-text\stream-text.ts:1866:17)
    at async fn (C:\Users\Alfonso\Desktop\git hub repos\agente\node_modules\.pnpm\ai@6.0.289_zod@3.25.76\node_modules\ai\src\generate-text\stream-text.ts:2442:9)
    at async <anonymous> (C:\Users\Alfonso\Desktop\git hub repos\agente\node_modules\.pnpm\ai@6.0.289_zod@3.25.76\node_modules\ai\src\telemetry\record-span.ts:34:24) {
  cause: undefined,
  url: 'https://openrouter.ai/api/v1/responses',
  requestBodyValues: {
    model: 'fixture',
    input: [ [Object], [Object] ],
    temperature: undefined,
    top_p: undefined,
    max_output_tokens: undefined,
    conversation: undefined,
    max_tool_calls: undefined,
    metadata: undefined,
    parallel_tool_calls: undefined,
    previous_response_id: undefined,
    store: undefined,
    user: undefined,
    instructions: undefined,
    service_tier: undefined,
    include: undefined,
    prompt_cache_key: undefined,
    prompt_cache_options: undefined,
    prompt_cache_retention: undefined,
    safety_identifier: undefined,
    top_logprobs: undefined,
    truncation: undefined,
    tools: [
      [Object], [Object], [Object],
      [Object], [Object], [Object],
      [Object], [Object], [Object],
      [Object], [Object], [Object],
      [Object], [Object], [Object],
      [Object], [Object], [Object],
      [Object], [Object], [Object],
      [Object], [Object], [Object],
      [Object], [Object], [Object],
      [Object]
    ],
    tool_choice: 'auto',
    stream: true
  },
  statusCode: 401,
  responseHeaders: {
    'access-control-allow-origin': '*',
    'access-control-expose-headers': 'X-Generation-Id,X-Provider-Name,request-id,cf-ray',
    'cf-ray': 'a453f2db1edae55b-MAD',
    connection: 'keep-alive',
    'content-type': 'application/json',
    date: 'Sun, 04 Oct 2026 11:46:53 GMT',
    'permissions-policy': 'payment=(self "https://checkout.stripe.com" "https://connect-js.stripe.com" "https://js.stripe.com" "https://*.js.stripe.com" "https://hooks.stripe.com")',
    'referrer-policy': 'no-referrer, strict-origin-when-cross-origin',
    server: 'cloudflare',
    'set-cookie': '__cf_bm=.wU.3LDQgKCuqBz29gL7ivPRpVYf5Ca.Wu1XBLgHF48-1791114413.2994385-1.0.1.1-U._jAGSYRdG_.5cNXiyecspOBNord2c3Ei4LSNGK20XLLrrUHDxu.AIeHmrY2ddLiDlkoXPChgaX1znhMAKpi0.9cZmhkQnTPTQLJdfIeoBq7Aa3CFaSS0AcJFHy4Qef; HttpOnly; SameSite=None; Secure; Path=/; Domain=openrouter.ai; Expires=Sun, 04 Oct 2026 12:16:53 GMT',
    'transfer-encoding': 'chunked',
    'x-content-type-options': 'nosniff'
  },
  responseBody: '{"error":{"message":"User not found.","code":401}}',
  isRetryable: false,
  data: { error: { message: 'User not found.', code: 401 } },
  Symbol(vercel.ai.error): true,
  Symbol(vercel.ai.error.AI_APICallError): true
}
{"ts":"2026-10-04T11:46:53.900Z","level":"error","event":"background_failure","phase":"record task error","error":"LostLeaseError","message":"Task was paused, cancelled or taken over by another worker"}
Ô£ö old refresh cannot overwrite a newly connected Google account (24576.3954ms)
Ô£ö OAuth callbacks require a known, single-use state (10687.9644ms)
Ô£ö disconnect invalidates an OAuth callback suspended during token (12462.5487ms)
Ô£ö disconnect invalidates an OAuth callback suspended during profile (13483.953ms)
Ô£ö disconnect invalidates pending OAuth state before a callback contacts Google (14940.4506ms)
Ô£ö a newer connect attempt invalidates an older callback already exchanging its code (14529.1177ms)
Ô£ö an in-flight refresh cannot restore credentials after disconnect (15244.8606ms)
Ô£ö OpenBot is disabled by default and cannot call a supplied transport (50.2184ms)
Ô£ö enabled configuration requires an authenticated transport and an agent for runtime (2.4383ms)
Ô£ö runtime is an Intelligence descriptor and reports unsupported capabilities without a connection claim (1.8823ms)
Ô£ö probe verifies user identity before reporting authenticated Intelligence capabilities (364.7932ms)
Ô£ö probe does not treat anonymous runtime discovery as authentication (21.226ms)
Ô£ö probe rejects incompatible capability responses and exposes transport failure (48.437ms)
Ô£ö channel creation preserves separate channel, thread and agent identities (13.9123ms)
Ô£ö computer status uses a Bot ID and rejects unknown lifecycle states or mismatched identity (52.011ms)
Ô£ö snapshot is a read that retains server-owned references (43.0069ms)
Ô£ö navigation uses the policy gateway, preserves cancellation and never creates a direct computer URL (40.3683ms)
Ô£ö human control reads and transitions use the exact audited gateway routes (100.8623ms)
Ô£ö policy refusals preserve status and rule and are never retried (27.4176ms)
Ô£ö uncertain mutations require reconciliation after transport, server or invalid-response failure (55.2044ms)
Ô£ö sample is an actual two-page PDF with blank fillable fields (1374.0575ms)
Ô£ö filling changes only the new PDF and round-trips text and checkbox values (429.257ms)
Ô£ö PDF operations reject invalid bytes, encrypted input, unknown names, and wrong field types (225.5298ms)
Ô£ö unsupported fields are disclosed and cannot be silently filled (87.3122ms)
Ô£ö PDF output removes active actions before returning a filled document (286.4494ms)
Ô£ö XFA forms fail explicitly instead of silently losing their fields (252.6568ms)
Ô£ö PDF failures expose safe typed 422 errors including malformed field and font errors (212.9038ms)
Ô£ö agentRoleSchema acepta rol con permissions (86.4081ms)
Ô£ö agentRoleSchema rechaza actions invalidas (3.8266ms)
Ô£ö agentRoleSchema permite rol sin permissions (2.302ms)
Ô£û fresh nested data directory starts and survives a database restart (57533.7893ms)
Ô£ö idle Postgres client errors are logged instead of crashing the process (172.8253ms)
Ô£ö rol sin permissions declarados: allowlist no activa (5.3886ms)
Ô£ö rol con permissions: solo permite lo declarado (1.4356ms)
Ô£ö denegacion devuelve reason legible (1.8073ms)
Ô£ö AgentGovernance: rol con allowedTools rechaza tool no declarada (1.6934ms)
Ô£ö AgentGovernance: rol sin allowedTools deja pasar al PolicyEngine (1.087ms)
Ô£ö embedTexts embeds in parallel under a bounded number of in-flight calls (546.8756ms)
Ô£ö embedTexts without an API key returns nulls instead of throwing (14.9028ms)
Ô£û RagService.search ranks the best hits across pages of the index (33269.9216ms)
Ô£ö ingestion caps the number of chunks per source (19562.4315ms)
Ô£û the pgvector path is never attempted on PGlite (20483.5555ms)
Ô£ö registry: dashboard pasa el schema (46.9008ms)
Ô£ö registry: queue pasa el schema (4.556ms)
Ô£ö registry: kind no soportado devuelve null (8.8582ms)
Ô£ö reingest endpoint existe y responde a POST (7.4258ms)
Ô£ö reingest no devuelve 501 en modo sample (1.3401ms)
Ô£ö SOP contract accepts a first-class sop task and rejects duplicate step ids (354.8078ms)
Ô£ö every:Nm matches any second of the matching minute (41.0801ms)
Ô£ö every:1m and every:Nh still behave (2.2915ms)
Ô£ö daily and weekly crons are unchanged (3.2704ms)
Ô£ö an unsupported or out-of-range cron is a 422, not a silent never-fire (48.3103ms)
Ô£ö the SOP step schema is closed: an unknown tool never reaches the executor (63.2517ms)
Ô£ö finance errors are AppError 422 so the front can show them (80.2916ms)
Ô£ö stateMachineSchema rechaza estados inexistentes en transiciones (15.2508ms)
Ô£ö transicion permitida devuelve from/to/action (4.8369ms)
Ô£ö transicion no declarada lanza 409 (6.1619ms)
Ô£ö transicion con roleId fija: solo ese rol puede ejecutarla (2.1595ms)
Ô£ö transicion sin roleId declarado admite cualquier rol (1.4362ms)
Ô£û reassign cambia assignedTo y state.roleId (29459.1923ms)
Ô£û reassign sin roleId devuelve 422 (4.7115ms)
Ô£û C:\Users\Alfonso\Desktop\git hub repos\agente\tests\tasks-reassign.test.ts (1.433ms)
Ô£ö records de un tenant no son visibles desde otro (32920.2835ms)
Ô£ö scanByStatus no mezcla tenants (8623.7416ms)
Ô£ö TenantScopedStore aisla por tenantId:owner (7988.9355ms)
Ô£ö RUN_STARTED resetea la lista (38.0395ms)
Ô£ö TOOL_CALL_START anade con status running (1.8189ms)
Ô£ö TOOL_CALL_START duplicado no anade dos veces (1.3866ms)
Ô£ö TOOL_CALL_END marca done (1.5635ms)
Ô£ö TOOL_CALL_END con error marca error (1.2867ms)
Ô£ö TOOL_CALL_END de id desconocido no cambia (29.698ms)
Ô£ö resolver elige la fuente m├ís fiable y detecta conflictos (117.4932ms)
Ô£ö vault encrypts with a fresh nonce and authenticates the entire envelope (59.1213ms)
Ô£ö vault rejects malformed keys and envelopes without echoing secrets (8.3651ms)
Ô£ö resolveView devuelve null si no hay intencion (91.5536ms)
Ô£ö resolveView matchea dashboard (142.9258ms)
Ô£ö resolveView matchea queue (85.8515ms)
Ô£ö resolveView normaliza tildes y mayusculas (9.8496ms)
Ô£ö resolveView valida el spec del builder (9.3026ms)
Ô£û document job runs without a client, waits for review, and resumes from its receipt (28129.0709ms)
Ô£û ideas ignore sent replies while retaining unfinished incoming requests (3.7761ms)
Ô£û cancelling a task denies its pending action (0.8291ms)
Ô£û failed page checks back off, expose the error, and pause after repeated failures (0.4475ms)
Ô£û dismissal racing acceptance never creates work for a dismissed idea (0.5664ms)
Ô£û C:\Users\Alfonso\Desktop\git hub repos\agente\tests\workflows.test.ts (1.1408ms)
Ôä╣ tests 269
Ôä╣ suites 0
Ôä╣ pass 216
Ôä╣ fail 40
Ôä╣ cancelled 12
Ôä╣ skipped 1
Ôä╣ todo 0
Ôä╣ duration_ms 460165.9168

Ô£û failing tests:

test at tests\agent-api.test.ts:62:1
Ô£û agent API requires a session and reports the actual worker state (76011.7086ms)
  'test timed out after 20000ms'

test at tests\agent-api.test.ts:80:1
Ô£û the main conversation thread survives reopening and concurrent initialization (5.1377ms)
  'test timed out after 20000ms'

test at tests\agent-api.test.ts:103:1
Ô£û task detail and controls stay scoped to the authenticated owner (2.7785ms)
  'test timed out after 20000ms'

test at tests\agent-api.test.ts:140:1
Ô£û agent request validation rejects malformed input with useful JSON errors (0.8813ms)
  'test timed out after 20000ms'

test at tests\agent-api.test.ts:171:1
Ô£û goal updates validate milestones and pausing a goal pauses its task (0.9389ms)
  'test timed out after 20000ms'

test at tests\agent-api.test.ts:189:1
Ô£û memories can be edited and forgotten while identity changes persist (0.487ms)
  'test timed out after 20000ms'

test at tests\agent-api.test.ts:227:1
Ô£û idea dismissal survives refresh and concurrent acceptance creates one goal and task (0.4269ms)
  'test timed out after 20000ms'

test at tests\agent-api.test.ts:255:1
Ô£û sample monitor saves its baseline and deduplicates notifications for repeated changes (0.515ms)
  'test timed out after 20000ms'

test at tests\agent-api.test.ts:318:1
Ô£û live mode rejects sample sources and hides the fixture mutation endpoint (0.4981ms)
  'test timed out after 20000ms'

test at tests\agent-api.test.ts:56:1
Ô£û C:\Users\Alfonso\Desktop\git hub repos\agente\tests\agent-api.test.ts (3973.1007ms)
  [Error: ENOTEMPTY: directory not empty, rmdir 'C:\Users\Alfonso\AppData\Local\Temp\openmuse-agent-api-TSLbub'] { errno: -4051, code: 'ENOTEMPTY', syscall: 'rmdir', path: 'C:\\Users\\Alfonso\\AppData\\Local\\Temp\\openmuse-agent-api-TSLbub' }

test at tests\api.test.ts:49:1
Ô£û API protects private data and rejects unrelated web origins (34542.5787ms)
  'test timed out after 20000ms'

test at tests\api.test.ts:60:1
Ô£û sample workspace serves a real PDF and filling creates a new version (5.0389ms)
  'test timed out after 20000ms'

test at tests\api.test.ts:90:1
Ô£û reviewed sample email persists a receipt, then revocation blocks another proposal (4.3835ms)
  'test timed out after 20000ms'

test at tests\api.test.ts:130:1
Ô£û missing browser setup is explicit rather than a fictional browser session (0.7474ms)
  'test timed out after 20000ms'

test at tests\api.test.ts:139:1
Ô£û calendar ranges and complete sample mail threads survive navigation (52.1413ms)
  'test timed out after 20000ms'

test at tests\api.test.ts:179:1
Ô£û sample agent streams actual AG-UI events without a model key (0.4071ms)
  'test timed out after 20000ms'

test at tests\api.test.ts:193:1
Ô£û guided document delegation streams a rich tool result bound to its saved task (0.2681ms)
  'test timed out after 20000ms'

test at tests\auth.test.ts:47:1
Ô£û a wrong password is a 401 and never leaks whether the user exists (77692.4314ms)
  'test timed out after 20000ms'

test at tests\auth.test.ts:55:1
Ô£û login returns a token, the user and the real server mode (3.969ms)
  'test timed out after 20000ms'

test at tests\auth.test.ts:72:1
Ô£û the authenticated owner gets its own sample workspace seeded (15.9597ms)
  'test timed out after 20000ms'

test at tests\auth.test.ts:90:1
Ô£û google status is readable so the UI can show the connect button (3.9821ms)
  'test timed out after 20000ms'

test at tests\auth.test.ts:100:1
Ô£û the login rate limit answers 429 with Retry-After (0.7513ms)
  'test timed out after 20000ms'

test at tests\auth.test.ts:32:1
Ô£û C:\Users\Alfonso\Desktop\git hub repos\agente\tests\auth.test.ts (2.7985ms)
  TypeError: Cannot read properties of undefined (reading 'agent')
      at TestContext.<anonymous> (C:\Users\Alfonso\Desktop\git hub repos\agente\tests\auth.test.ts:33:16)
      at TestHook.runInAsyncScope (node:async_hooks:227:14)
      at TestHook.run (node:internal/test_runner/test:1325:25)
      at TestHook.run (node:internal/test_runner/test:1669:18)
      at TestHook.run (node:internal/util:581:20)
      at Test.runHook (node:internal/test_runner/test:1212:20)
      at after (node:internal/test_runner/test:1265:20)
      at Test.run (node:internal/test_runner/test:1351:13)

test at tests\browser.test.ts:29:1
Ô£û browser API reopens an owned profile at the edited address and renews console access (33661.9283ms)
  'test timed out after 20000ms'

test at tests\computer-api.test.ts:10:1
Ô£û computer REST endpoints require session ownership and return persisted receipts (32987.8791ms)
  'test timed out after 20000ms'

test at tests\conversation-browser.test.ts:57:1
Ô£û chat browse_web emits real SDK tool events and returns observed source content immediately (34591.5815ms)
  'test timed out after 20000ms'

test at tests\conversation-browser.test.ts:118:1
Ô£û chat browse_web emits an honest completed error result when navigation fails (20630.6889ms)
  'test timed out after 20000ms'

test at tests\conversation-browser.test.ts:134:1
Ô£û unsubscribing from chat stops queued browser navigation and further model steps (20470.6191ms)
  'test timed out after 20000ms'

test at tests\conversation-browser.test.ts:158:1
Ô£û chat searches and reads actual owner mail without creating a task or sending (20357.1134ms)
  'test timed out after 20000ms'

test at tests\conversation-browser.test.ts:197:1
Ô£û chat mail tools report disconnected mail and refuse another owner's thread (16680.8822ms)
  Error [AI_APICallError]: You exceeded your current quota, please check your plan and billing details. For more information on this error, head to: https://ai.google.dev/gemini-api/docs/rate-limits. To monitor your current usage, head to: https://ai.dev/rate-limit. 
  * Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests, limit: 5, model: gemini-3.6-flash
  Please retry in 6.906492084s.
      at <anonymous> (C:\Users\Alfonso\Desktop\git hub repos\agente\node_modules\.pnpm\@ai-sdk+provider-utils@4.0.53_zod@3.25.76\node_modules\@ai-sdk\provider-utils\src\response-handler.ts:144:16)
      at process.processTicksAndRejections (node:internal/process/task_queues:104:5)
      at async postToApi (C:\Users\Alfonso\Desktop\git hub repos\agente\node_modules\.pnpm\@ai-sdk+provider-utils@4.0.53_zod@3.25.76\node_modules\@ai-sdk\provider-utils\src\post-to-api.ts:118:28)
      at async GoogleGenerativeAILanguageModel.doStream (C:\Users\Alfonso\Desktop\git hub repos\agente\node_modules\.pnpm\@ai-sdk+google@3.0.126_zod@3.25.76\node_modules\@ai-sdk\google\src\google-generative-ai-language-model.ts:606:50)
      at async fn (C:\Users\Alfonso\Desktop\git hub repos\agente\node_modules\.pnpm\ai@6.0.289_zod@3.25.76\node_modules\ai\src\generate-text\stream-text.ts:1917:27)
      at async <anonymous> (C:\Users\Alfonso\Desktop\git hub repos\agente\node_modules\.pnpm\ai@6.0.289_zod@3.25.76\node_modules\ai\src\telemetry\record-span.ts:34:24)
      at async retryWithExponentialBackoffInternal (C:\Users\Alfonso\Desktop\git hub repos\agente\node_modules\.pnpm\@ai-sdk+provider-utils@4.0.53_zod@3.25.76\node_modules\@ai-sdk\provider-utils\src\retry-with-exponential-backoff.ts:87:12)
      at async streamStep (C:\Users\Alfonso\Desktop\git hub repos\agente\node_modules\.pnpm\ai@6.0.289_zod@3.25.76\node_modules\ai\src\generate-text\stream-text.ts:1866:17)
      at async fn (C:\Users\Alfonso\Desktop\git hub repos\agente\node_modules\.pnpm\ai@6.0.289_zod@3.25.76\node_modules\ai\src\generate-text\stream-text.ts:2442:9)
      at async <anonymous> (C:\Users\Alfonso\Desktop\git hub repos\agente\node_modules\.pnpm\ai@6.0.289_zod@3.25.76\node_modules\ai\src\telemetry\record-span.ts:34:24) {
    cause: undefined,
    url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:streamGenerateContent?alt=sse',
    requestBodyValues: { generationConfig: { maxOutputTokens: undefined, temperature: undefined, topK: undefined, topP: undefined, frequencyPenalty: undefined, presencePenalty: undefined, stopSequences: undefined, seed: undefined, responseMimeType: undefined, responseSchema: undefined, responseModalities: undefined, thinkingConfig: undefined }, contents: [ [Object] ], systemInstruction: { parts: [Array] }, safetySettings: undefined, tools: [ [Object] ], toolConfig: { functionCallingConfig: [Object] }, cachedContent: undefined, labels: undefined, serviceTier: undefined },
    statusCode: 429,
    responseHeaders: { 'alt-svc': 'h3=":443"; ma=2592000,h3-29=":443"; ma=2592000', 'content-length': '1362', 'content-type': 'text/event-stream', date: 'Sun, 04 Oct 2026 11:45:53 GMT', server: 'scaffolding on HTTPServer2', 'server-timing': 'gfet4t7; dur=176', vary: 'Origin, X-Origin, Referer', 'x-content-type-options': 'nosniff', 'x-frame-options': 'SAMEORIGIN', 'x-xss-protection': '0' },
    responseBody: '{\n  "error": {\n    "code": 429,\n    "message": "You exceeded your current quota, please check your plan and billing details. For more information on this error, head to: https://ai.google.dev/gemini-api/docs/rate-limits. To monitor your current usage, head to: https://ai.dev/rate-limit. \\n* Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests, limit: 5, model: gemini-3.6-flash\\nPlease retry in 6.906492084s.",\n    "status": "RESOURCE_EXHAUSTED",\n    "details": [\n      {\n        "@type": "type.googleapis.com/google.rpc.Help",\n        "links": [\n          {\n            "description": "Learn more about Gemini API quotas",\n            "url": "https://ai.google.dev/gemini-api/docs/rate-limits"\n          }\n        ]\n      },\n      {\n        "@type": "type.googleapis.com/google.rpc.QuotaFailure",\n        "violations": [\n          {\n            "quotaMetric": "generativelanguage.googleapis.com/generate_content_free_tier_requests",\n            "quotaId": "GenerateRequestsPerMinutePerProjectPerModel-FreeTier",\n            "quotaDimensions": {\n              "model": "gemini-3.6-flash",\n              "location": "global"\n            },\n            "quotaValue": "5"\n          }\n        ]\n      },\n      {\n        "@type": "type.googleapis.com/google.rpc.RetryInfo",\n        "retryDelay": "6s"\n      }\n    ]\n  }\n}\n',
    isRetryable: true,
    data: { error: { code: 429, message: 'You exceeded your current quota, please check your plan and billing details. For more information on this error, head to: https://ai.google.dev/gemini-api/docs/rate-limits. To monitor your current usage, head to: https://ai.dev/rate-limit. \n* Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests, limit: 5, model: gemini-3.6-flash\nPlease retry in 6.906492084s.', status: 'RESOURCE_EXHAUSTED', details: [Array] } }
  }

test at tests\engine.test.ts:72:1
Ô£û expired leases recover saved checkpoints after the database restarts (47242.485ms)
  'test timed out after 20000ms'

test at tests\event-bus.test.ts:81:1
Ô£û todo SystemEventType tiene schema y un payload minimo valido (773.3372ms)
  AssertionError [ERR_ASSERTION]: falta payload minimo para verification.executed en el test
      at TestContext.<anonymous> (C:\Users\Alfonso\Desktop\git hub repos\agente\tests\event-bus.test.ts:86:12)
      at Test.runInAsyncScope (node:async_hooks:227:14)
      at Test.run (node:internal/test_runner/test:1325:25)
      at Test.start (node:internal/test_runner/test:1191:17)
      at startSubtestAfterBootstrap (node:internal/test_runner/harness:385:17) {
    generatedMessage: false,
    code: 'ERR_ASSERTION',
    actual: undefined,
    expected: true,
    operator: '==',
    diff: 'simple'
  }

test at tests\event-bus.test.ts:109:1
Ô£û todo SystemEventType del enum aparece en algun bus.emit del repo (20052.7796ms)
  'test timed out after 20000ms'

test at tests\memory.test.ts:46:1
Ô£û crear memoria con category y tags (71048.6565ms)
  'test timed out after 20000ms'

test at tests\memory.test.ts:58:1
Ô£û editar solo text (patch parcial) (8.0866ms)
  'test timed out after 20000ms'

test at tests\memory.test.ts:75:1
Ô£û editar category a otro valor (8.4029ms)
  'test timed out after 20000ms'

test at tests\memory.test.ts:91:1
Ô£û editar category a null borra la categoria (0.5739ms)
  'test timed out after 20000ms'

test at tests\memory.test.ts:108:1
Ô£û patch vacio devuelve 422 (0.7107ms)
  'test timed out after 20000ms'

test at tests\memory.test.ts:38:1
Ô£û C:\Users\Alfonso\Desktop\git hub repos\agente\tests\memory.test.ts (1.9918ms)
  TypeError: Cannot read properties of undefined (reading 'agent')
      at TestContext.<anonymous> (C:\Users\Alfonso\Desktop\git hub repos\agente\tests\memory.test.ts:39:16)
      at TestHook.runInAsyncScope (node:async_hooks:227:14)
      at TestHook.run (node:internal/test_runner/test:1325:25)
      at TestHook.run (node:internal/test_runner/test:1669:18)
      at TestHook.run (node:internal/util:581:20)
      at Test.runHook (node:internal/test_runner/test:1212:20)
      at after (node:internal/test_runner/test:1265:20)
      at Test.run (node:internal/test_runner/test:1351:13)

test at tests\model-worker.test.ts:12:1
Ô£û CopilotKit model worker executes server tools and persists the confirmed outcome (22721.2867ms)
  'test timed out after 20000ms'

test at tests\persistence.test.ts:8:1
Ô£û fresh nested data directory starts and survives a database restart (57533.7893ms)
  'test timed out after 20000ms'

test at tests\rag.test.ts:63:1
Ô£û RagService.search ranks the best hits across pages of the index (33269.9216ms)
  'test timed out after 20000ms'

test at tests\rag.test.ts:123:1
Ô£û the pgvector path is never attempted on PGlite (20483.5555ms)
  'test timed out after 20000ms'

test at tests\tasks-reassign.test.ts:45:1
Ô£û reassign cambia assignedTo y state.roleId (29459.1923ms)
  'test timed out after 20000ms'

test at tests\tasks-reassign.test.ts:58:1
Ô£û reassign sin roleId devuelve 422 (4.7115ms)
  'test timed out after 20000ms'

test at tests\tasks-reassign.test.ts:37:1
Ô£û C:\Users\Alfonso\Desktop\git hub repos\agente\tests\tasks-reassign.test.ts (1.433ms)
  TypeError: Cannot read properties of undefined (reading 'agent')
      at TestContext.<anonymous> (C:\Users\Alfonso\Desktop\git hub repos\agente\tests\tasks-reassign.test.ts:38:16)
      at TestHook.runInAsyncScope (node:async_hooks:227:14)
      at TestHook.run (node:internal/test_runner/test:1325:25)
      at TestHook.run (node:internal/test_runner/test:1669:18)
      at TestHook.run (node:internal/util:581:20)
      at Test.runHook (node:internal/test_runner/test:1212:20)
      at after (node:internal/test_runner/test:1265:20)
      at Test.run (node:internal/test_runner/test:1351:13)

test at tests\workflows.test.ts:74:1
Ô£û document job runs without a client, waits for review, and resumes from its receipt (28129.0709ms)
  'test timed out after 20000ms'

test at tests\workflows.test.ts:109:1
Ô£û ideas ignore sent replies while retaining unfinished incoming requests (3.7761ms)
  'test timed out after 20000ms'

test at tests\workflows.test.ts:135:1
Ô£û cancelling a task denies its pending action (0.8291ms)
  'test timed out after 20000ms'

test at tests\workflows.test.ts:146:1
Ô£û failed page checks back off, expose the error, and pause after repeated failures (0.4475ms)
  'test timed out after 20000ms'

test at tests\workflows.test.ts:183:1
Ô£û dismissal racing acceptance never creates work for a dismissed idea (0.5664ms)
  'test timed out after 20000ms'

test at tests\workflows.test.ts:32:1
Ô£û C:\Users\Alfonso\Desktop\git hub repos\agente\tests\workflows.test.ts (1.1408ms)
  TypeError: Cannot read properties of undefined (reading 'agent')
      at TestContext.<anonymous> (C:\Users\Alfonso\Desktop\git hub repos\agente\tests\workflows.test.ts:33:16)
      at TestHook.runInAsyncScope (node:async_hooks:227:14)
      at TestHook.run (node:internal/test_runner/test:1325:25)
      at TestHook.run (node:internal/test_runner/test:1669:18)
      at TestHook.run (node:internal/util:581:20)
      at Test.runHook (node:internal/test_runner/test:1212:20)
      at after (node:internal/test_runner/test:1265:20)
      at Test.run (node:internal/test_runner/test:1351:13)
[ELIFECYCLE] Test failed. See above for more details.
````

## File: docs/audits/_prep/typecheck-web.txt
````
node.exe : $ tsc --noEmit
En C:\nvm4w\nodejs\pnpm.ps1: 16 Carácter: 5
+     & "$basedir/node$exe"  
"$basedir/node_modules/corepack/dist/pnpm. 
...
+     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: 
    ($ tsc --noEmit:String) [], RemoteExce  
  ption
    + FullyQualifiedErrorId : NativeCommand 
   Error
````

## File: docs/audits/_prep/typecheck.txt
````
node.exe : $ tsc --noEmit && npm --prefix 
apps/worker run typecheck
En C:\nvm4w\nodejs\pnpm.ps1: 16 Carácter: 5
+     & "$basedir/node$exe"  
"$basedir/node_modules/corepack/dist/pnpm. 
...
+     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: 
    ($ tsc --noEmit ...r run typecheck:Str  
  ing) [], RemoteException
    + FullyQualifiedErrorId : NativeCommand 
   Error
 

> @openmuse/browser-worker@0.2.0-beta.1 typecheck
> tsc --noEmit
````

## File: docs/audits/00-agentes-docs/egente-brainstorm.txt
````
Ahora sí veo exactamente qué quieres. Y es mucho más ambicioso de lo que yo tenía en la cabeza. Reordeno todo.

## Lo que veo en los mockups

### Vista `Agentes` (primera imagen)

**Es un workspace completo, no una lista.**

- **Header**: "Agentes. Tu equipo de IA operativo. Activo 24/7 — orquesta tareas, memoria y ejecución."
- **Botón**: "+ Crear nuevo agente"
- **Hero card** (agente principal):
  - `AGENTE IA PRO · PRINCIPAL · Orquestador · LVL 9`
  - Avatar con grid + icono sparkle
  - Nombre: "Agente IA Pro — Principal"
  - Descripción: "Coordinador central. Delega y supervisa a todo el squad."
  - Stats: `TAREAS 1247`, `PRECISIÓN 98.2%`, `TIEMPO MEDIO 12s`, `UPTIME 99.9%`
  - Botones: "Delegar tareas", "Redacción comercial", "Gestión operativa", "Email pro"
  - Caja "LO QUE SABE DE TU NEGOCIO": "OpenMuse, sistema operativo, workflows ventas, tono de marca, 47 playbooks" (`47%`)
  - Botones: "Hablar con él", "Ver logs", "Configurar"
  - Estado: `En línea`

- **Squad activo** (`4/6 AGENTES`):
  - Filtros por arquetipo: `Todos`, `Cazador`, `Guardián`, `Estratega`, `Arquitecto`
  - **Agent cards** (4 con contenido + 2 slots vacíos):
    - **Agente Ventas** — Cazador · Lvl 7 — 892 tasks · 96.4% — `ONLINE`
    - **Agente Soporte** — Guardián · Lvl 5 — 534 tasks · 99.1% — `IDLE`
    - **Agente Marketing** — Estratega · Lvl 6 — 621 tasks · 94.7% — `TRABAJANDO`
    - **Agente Ops** — Arquitecto · Lvl 4 — 258 tasks · 91.3% — `STANDBY`
    - Slot vacío: "+ Invocar agente" — Slot libre
    - Slot vacío: "+ Crear agente" — Nuevo rol
  - Tip al pie: `Tip: Escribe "llama al agente" para invocar en chat`

- **Activity log** (con `LIVE`):
  - Ventas completó: Generar 10 versiones del correo comercial de OpenMuse `[420e674a]` — `SUCCESS · ahora`
  - Marketing está trabajando en: Calendario de contenidos Semana 47 + copies LinkedIn — `WORKING · hace 3m`
  - Soporte falló: Responder ticket #8921 - reintento en 2m — `FAILED · hace 5m`
  - Ops sincronizó: Base de datos Notion > 124 registros actualizados — `SUCCESS · hace 12m [420e674a]`

- **Comandos directos** (`/invoke`):
  - Texto: "Squad operativo. Escribe "llama al agente de ventas para..."" 
  - Placeholder: "llama al agente de ventas para..."

**Footer meta**: `Mockup interactivo · Click en agentes cambia el hero · Hover muestra stats · Tipografía Inter · Branding #7C5CFC #FAFAFB`

### Vista `Chat` (segunda imagen)

Es el chat que ya conoces. Pero confirma:
- **Sidebar**: `Agentes` está en el menú pero gris (muerto).
- **Chat funcional**: mensaje → respuesta → delegación a tarea → tool call `delegate_task`.
- **Panel derecho**: `Tareas 1 total`, tabs `Tareas | Contexto | Negocio`, muestra la tarea `DOCUMENT` con estado `Fallida - ahora`.

## Lo que esto significa

**Mi plan de "personas con biografía" era solo la mitad.**

Lo que tú quieres es un **sistema de equipo gamificado**, donde cada agente es:

1. **Una persona funcional** (lo que yo tenía).
2. **Un personaje con stats de videojuego** (lo que no tenía): Nivel, precisión, tareas completadas, uptime, estado.
3. **Un arquetipo del negocio** (Cazador, Guardián, Estratega, Arquitecto, etc.).
4. **Un ente operativo real**: tiene tareas asignadas, sabe del negocio, delega, colabora.

Y la UI lo materializa como un **roster de juego**:
- Hero del agente principal.
- Grid del squad.
- Activity log en vivo.
- Comandos directos.

## Cómo se traduce esto a estructura

### Lo que ya estaba en mi plan

- `AgentPersona` (schema de dominio).
- `Personas/` scaffolding en `engine/agents/`.
- `Laia` como primer agente.
- `personaId` en kernel.

### Lo que hay que añadir

**1. Stats del agente** (`AgentStats`):

```ts
{
  level: 9,                    // nivel del agente
  archetype: "orchestrator",   // orquestador, cazador, guardián, estratega, arquitecto
  totalTasks: 1247,
  precision: 0.982,            // % de tareas completadas bien
  avgTimeMs: 12000,
  uptime: 0.999,
  status: "online" | "idle" | "working" | "standby" | "offline",
  currentTask?: string,
}
```

**2. Arquetipos** (catálogo):

```ts
export const ARCHETYPES = [
  { id: "orchestrator", name: "Orquestador", description: "Coordina y delega al squad", color: "purple" },
  { id: "hunter", name: "Cazador", description: "Busca oportunidades", color: "blue" },
  { id: "guardian", name: "Guardián", description: "Protege y resuelve problemas", color: "green" },
  { id: "strategist", name: "Estratega", description: "Planifica a largo plazo", color: "yellow" },
  { id: "architect", name: "Arquitecto", description: "Construye sistemas", color: "orange" },
];
```

**3. Activity log** (eventos en vivo):

Ya existe `system-events` + `run-events`. Solo hay que **filtrados por agente** y exponerlos en el endpoint.

**4. Comandos directos** (`/invoke`):

Necesita un parser de comandos en el chat:
- `llama al agente X para Y` → abre chat con X (o delega tarea a X).

**5. Botón `+ Crear nuevo agente`**:

Modal de creación de persona (con arquetipo, nivel base, etc.).

## Rediseño de mi plan

Mi plan original de 35 bloques ahora pasa a ser **~50 bloques** en 8 macros:

### MACRO A — Schema base (5 bloques)
Como antes. `AgentPersona` + `AgentStats` + `Archetype` en dominio.

### MACRO B — Carga (6 bloques)
Como antes. Loader, registry, bootstrap, resolver, node, Laia.

### MACRO C — Stats y actividad (5 bloques) ← NUEVO
- `stats.ts` → calcula stats del agente desde sus turns.
- `activity-log.ts` → expone eventos del agente.
- `archetypes.ts` → catálogo de arquetipos.
- `routes/agent-stats.ts` → endpoint.
- Test.

### MACRO D — Endpoints HTTP (5 bloques)
Como antes, más endpoints para stats y activity.

### MACRO E — Kernel `personaId` (4 bloques)
Como antes.

### MACRO F — Chat con persona (3 bloques)
Como antes + intent `invoke_agent`.

### MACRO G — Frontend workspace (8 bloques) ← AMPLIADO
- `AgentsWorkspace.tsx` (reemplaza `AgentsView.tsx`).
- `AgentHeroCard.tsx` (el agente principal grande).
- `AgentCard.tsx` (los secundarios en grid).
- `AgentStats.tsx` (componente de stats).
- `ActivityLog.tsx` (log live).
- `DirectCommands.tsx` (el /invoke).
- `NewAgentModal.tsx`.
- `AgentProfileView.tsx` (perfil detallado).

### MACRO H — Cierre (5 bloques)
Como antes + docs de gamificación.

**Total: ~41 bloques.**

## Decisiones críticas nuevas

Antes de arrancar necesito que confirmes:

### 1. ¿Los "niveles" de agente son reales o cosméticos?

**Opción A — Cosméticos**: el nivel sube de 1 a N según tareas completadas. Es una métrica derivada. No afecta funcionalidad.

**Opción B — Reales**: el nivel **desbloquea capabilities**. Un agente Lvl 5 no puede hacer lo que hace un Lvl 9. Requiere sistema de niveles + permisos.

**Voto: A primero**. Gamificar visualmente es fácil. Desbloquear por nivel es un sistema completo que merece su propio bloque.

### 2. ¿Los arquetipos son fijos o configurables por tenant?

- **(a)** Fijos: Orquestador, Cazador, Guardián, Estratega, Arquitecto (5, universales).
- **(b)** Configurables: cada tenant declara sus arquetipos.
- **(c)** Híbrido: 5 base + los que añada el tenant.

**Voto: (c)**. Base universal, extensible.

### 3. ¿La `activity log` es real o simulada al principio?

- **(a)** Real desde el principio: lee de `run-events` filtrado por agente.
- **(b)** Simulada: hardcoded al principio, real después.

**Voto: (a)**. `run-events` ya tiene `taskId`, `kind`, `title`, `detail`. Solo hay que filtrar por `assignedTo` (agente). Es trivial.

### 4. ¿El comando `/invoke` es del chat o del agente?

- **(a)** El usuario escribe `llama al agente X para Y` **en el chat normal**.
- **(b)** Hay un input especial `/invoke` **en la vista de agentes**.
- **(c)** Ambos.

**Voto: (c)**. El usuario puede invocar desde el chat general o desde la vista de agentes.

### 5. ¿Laia es "Agente Ventas" o "Agente Soporte" o un arquetipo nuevo?

En el mockup hay: Ventas (Cazador), Soporte (Guardián), Marketing (Estratega), Ops (Arquitecto). Y el principal es Orquestador.

**Laia como "Asistente secretaria todoterreno" no encaja en ninguno de los 4.** Necesita su propio arquetipo.

**Opciones:**
- **(a)** Laia = "Agente Soporte" (Guardián). Encaja con "sabe todo, está para todo".
- **(b)** Laia = nuevo arquetipo "Asistente" o "Secretaria" o "Todoterreno".
- **(c)** Laia = "Agente Orquestador" auxiliar, reporta al principal.

**Voto: (b)**. Laia merece su arquetipo propio: **"Asistente"** o **"Vínculo"** (alguien que conecta a todos).

## Lo que necesito de ti antes de arrancar

**Confirma:**

1. Los **5 arquetipos** base: Orquestador, Cazador, Guardián, Estratega, Arquitecto. ¿OK o añadimos "Asistente"?
2. **Niveles cosméticos** al principio. ¿OK?
3. **Activity log real** desde el principio. ¿OK?
4. **`/invoke` doble**: chat + vista agentes. ¿OK?
5. **Laia** = arquetipo "Asistente". ¿OK?

**Y pásame:**

- Los 5 archivos que pedí antes (`app.ts`, `index.ts`, `service.ts`, `conversation.ts`, `App.tsx`).
- Los 2 mockups ya los tengo (los veo).
- La imagen del chat ya la tengo.

**Y por último:** dime si quieres que el **plan de 41 bloques** sea bloque-a-bloque (seguro, lento) o **macro-a-macro** (rápido, más riesgo).

Con eso arranco **Macro A1** sin más dilación.
````

## File: docs/audits/01-tests/fixes.md
````markdown
# Fixes — tests

> v1 · 2026-10-04 · Estado: placeholder

50 fixes concretos. Se rellenan cuando se decida atacar la rama.
````

## File: docs/audits/03-resiliencia/fixes.md
````markdown
# Fixes — resiliencia

> v1 · 2026-10-04 · Estado: placeholder

50 fixes concretos. Se rellenan cuando se decida atacar la rama.
````

## File: docs/audits/05-motor-tareas-durable/fixes.md
````markdown
# Fixes — motor-tareas-durable

> v1 · 2026-10-04 · Estado: placeholder

50 fixes concretos. Se rellenan cuando se decida atacar la rama.
````

## File: docs/audits/06-aprobaciones-acciones/fixes.md
````markdown
# Fixes — aprobaciones-acciones

> v1 · 2026-10-04 · Estado: placeholder

50 fixes concretos. Se rellenan cuando se decida atacar la rama.
````

## File: docs/audits/07-aislamiento-multi-tenant/fixes.md
````markdown
# Fixes — aislamiento-multi-tenant

> v1 · 2026-10-04 · Estado: placeholder

50 fixes concretos. Se rellenan cuando se decida atacar la rama.
````

## File: docs/audits/08-bus-de-eventos/fixes.md
````markdown
# Fixes — bus-de-eventos

> v1 · 2026-10-04 · Estado: placeholder

50 fixes concretos. Se rellenan cuando se decida atacar la rama.
````

## File: docs/audits/09-kernel-cognitivo/fixes.md
````markdown
# Fixes — kernel-cognitivo

> v1 · 2026-10-04 · Estado: placeholder

50 fixes concretos. Se rellenan cuando se decida atacar la rama.
````

## File: docs/audits/10-fast-slow-llm/fixes.md
````markdown
# Fixes — fast-slow-llm

> v1 · 2026-10-04 · Estado: placeholder

50 fixes concretos. Se rellenan cuando se decida atacar la rama.
````

## File: docs/audits/11-chat-con-llm/fixes.md
````markdown
# Fixes — chat-con-llm

> v1 · 2026-10-04 · Estado: placeholder

50 fixes concretos. Se rellenan cuando se decida atacar la rama.
````

## File: docs/audits/12-contexto-memoria/fixes.md
````markdown
# Fixes — contexto-memoria

> v1 · 2026-10-04 · Estado: placeholder

50 fixes concretos. Se rellenan cuando se decida atacar la rama.
````

## File: docs/audits/13-ui-servida-viewspec/fixes.md
````markdown
# Fixes — ui-servida-viewspec

> v1 · 2026-10-04 · Estado: placeholder

50 fixes concretos. Se rellenan cuando se decida atacar la rama.
````

## File: docs/audits/14-templates-reales/fixes.md
````markdown
# Fixes — templates-reales

> v1 · 2026-10-04 · Estado: placeholder

50 fixes concretos. Se rellenan cuando se decida atacar la rama.
````

## File: docs/audits/15-frontend-react/fixes.md
````markdown
# Fixes — frontend-react

> v1 · 2026-10-04 · Estado: placeholder

50 fixes concretos. Se rellenan cuando se decida atacar la rama.
````

## File: docs/audits/16-autenticacion/fixes.md
````markdown
# Fixes — autenticacion

> v1 · 2026-10-04 · Estado: placeholder

50 fixes concretos. Se rellenan cuando se decida atacar la rama.
````

## File: docs/audits/17-seguridad-basica/fixes.md
````markdown
# Fixes — seguridad-basica

> v1 · 2026-10-04 · Estado: placeholder

50 fixes concretos. Se rellenan cuando se decida atacar la rama.
````

## File: docs/audits/18-deploy-infra/fixes.md
````markdown
# Fixes — deploy-infra

> v1 · 2026-10-04 · Estado: placeholder

50 fixes concretos. Se rellenan cuando se decida atacar la rama.
````

## File: docs/audits/19-backups-restore/fixes.md
````markdown
# Fixes — backups-restore

> v1 · 2026-10-04 · Estado: placeholder

50 fixes concretos. Se rellenan cuando se decida atacar la rama.
````

## File: docs/audits/20-computer-sandbox/fixes.md
````markdown
# Fixes — computer-sandbox

> v1 · 2026-10-04 · Estado: placeholder

50 fixes concretos. Se rellenan cuando se decida atacar la rama.
````

## File: docs/audits/21-browser-worker/fixes.md
````markdown
# Fixes — browser-worker

> v1 · 2026-10-04 · Estado: placeholder

50 fixes concretos. Se rellenan cuando se decida atacar la rama.
````

## File: docs/audits/22-google-drive-gmail/fixes.md
````markdown
# Fixes — google-drive-gmail

> v1 · 2026-10-04 · Estado: placeholder

50 fixes concretos. Se rellenan cuando se decida atacar la rama.
````

## File: docs/audits/23-whatsapp-stripe-gmb/fixes.md
````markdown
# Fixes — whatsapp-stripe-gmb

> v1 · 2026-10-04 · Estado: placeholder

50 fixes concretos. Se rellenan cuando se decida atacar la rama.
````

## File: docs/audits/26-capability-e2e-miniaudit (1).md
````markdown
# 26 — Capability E2E Audit

**Versión:** v1  
**Fecha:** 2026-10-06  
**Estado:** PLANNED

## Propósito

Auditar capacidades empresariales completas de extremo a extremo, no módulos aislados.

Una capability solo se considera realmente existente cuando el recorrido completo funciona desde la entrada del usuario hasta el efecto empresarial, incluyendo política, ejecución, resultado, estado, memoria, UI, observabilidad, recuperación y trazabilidad.

## Flujo E2E de referencia

```text
USER / INPUT
    ↓
INTENT
    ↓
CONTEXT
    ↓
PLANNING
    ↓
CAPABILITY
    ↓
POLICY
    ↓
APPROVAL (si aplica)
    ↓
EXECUTION
    ↓
EXTERNAL EFFECT
    ↓
OUTCOME
    ↓
EVENT
    ↓
MEMORY / STATE
    ↓
UI / FEEDBACK
    ↓
AUDIT / PROVENANCE
```

Principio:

```text
implemented ≠ wired ≠ tested ≠ verified ≠ real-use ≠ production-ready
```

## Alcance

El audit cruza:

- server
- domain
- kernel
- context
- memory
- planner
- orchestrator
- policies
- capabilities
- SOPs
- tasks
- approvals
- event bus
- integrations
- persistence
- observability
- frontend
- ViewSpec
- auth
- tenant isolation
- recovery

## 20 capabilities iniciales

1. Crear una task desde chat.
2. Ejecutar una task durable.
3. Crear un documento.
4. Generar una factura.
5. Preparar / enviar una comunicación.
6. Recibir y procesar WhatsApp.
7. Identificar un contacto y relacionarlo con la empresa.
8. Consultar memoria / contexto empresarial.
9. Ejecutar un SOP.
10. Proponer una acción que requiere aprobación.
11. Aprobar una acción.
12. Rechazar una acción.
13. Leer Google Drive.
14. Crear / modificar información en Drive.
15. Ejecutar una operación mediante browser worker.
16. Ejecutar una operación mediante computer sandbox.
17. Resolver un ViewSpec.
18. Persistir resultado y provenance.
19. Recuperar un fallo de provider.
20. Recuperar una task con outcome desconocido.

## Matriz E2E

Cada capability debe revisarse como mínimo en estas etapas:

| Capability | Input | Intent | Context | Planning | Capability | Policy | Approval | Execution | External effect | Outcome | Event | State | Memory | UI | Audit | Recovery | Test | Real-use |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|

Para cada celda debe existir evidencia cuando corresponda.

## Identidad de ejecución

Toda ejecución relevante debe poder reconstruirse mediante una identidad consistente:

- `runId`
- actor
- tenant
- capability
- capability version
- SOP version
- policy version
- model / provider
- contexto relevante
- `taskId`
- `eventId`
- `approvalId`
- outcome
- timestamps
- provenance

## Regla de autoridad

El LLM puede:

- interpretar
- clasificar
- extraer
- proponer
- transformar
- planificar dentro de límites

El LLM no debe poder saltarse:

- schemas
- policies
- permissions
- approvals
- contracts
- tenant boundaries
- validation
- audit

## Failure Experience Audit

No basta con comprobar que técnicamente existe recuperación.

Para cada fallo hay que comprobar:

1. Qué sabe el sistema.
2. Qué sabe el usuario.
3. Qué estado queda persistido.
4. Si puede reintentarse.
5. Si el retry es seguro.
6. Cómo se evita duplicar efectos.
7. Qué queda registrado.
8. Cómo se recupera.

Casos mínimos:

- LLM timeout / error.
- Provider `429` / `5xx`.
- Schema inválido.
- Capability inexistente.
- Permiso insuficiente.
- Approval pendiente.
- Approval rechazado.
- Worker timeout.
- Integración externa caída.
- Respuesta ambigua.
- Request duplicada.
- Retry.
- Crash.
- Outcome desconocido.
- Desconexión de UI.

## Invariantes

El audit debe comprobar al menos:

1. Las acciones críticas requieren autorización.
2. Existe aislamiento entre tenants.
3. Las tareas durables no desaparecen silenciosamente.
4. `outcome_unknown` nunca se convierte silenciosamente en `success`.
5. Las acciones externas tienen provenance.
6. El actor está identificado.
7. Las operaciones sensibles tienen idempotencia cuando corresponda.
8. El LLM no puede saltarse una policy.
9. El usuario puede conocer el estado real de una task.
10. Los cambios importantes son trazables.
11. Un fallo de provider no destruye el estado empresarial.
12. Una nueva versión no degrada silenciosamente una capability crítica.

## Estados de madurez

Cada capability debe clasificarse como:

```text
DESIGNED
IMPLEMENTED
WIRED
TESTED
VERIFIED
REAL_USE
PRODUCTION_READY
```

No deben tratarse como equivalentes.

## Criterios de cierre

Una capability no se considera cerrada hasta disponer, según corresponda, de:

- happy path
- fallo relevante
- persistencia
- autorización / policy
- outcome explícito
- observabilidad
- provenance
- UI / feedback
- test automatizado
- real-use cuando sea posible

## Evidencia

Cada PASS o FAIL debe poder señalar evidencia concreta:

- archivo
- función
- test
- endpoint
- event
- schema
- log
- captura
- comando
- fix marker

Formato recomendado:

```text
PASS — [qué se verificó]
EVIDENCE — [archivo / función / test / comando]
NOTES — [observación]
```

o:

```text
FAIL — [qué falla]
EVIDENCE — [archivo / función / test / comando]
IMPACT — [impacto]
FIX — [fix requerido]
```

## 20 deep gaps a buscar

1. Producer sin consumer.
2. Consumer sin producer.
3. Capability declarada pero no registrada.
4. Capability registrada pero inaccesible.
5. Ruta alternativa que evita una policy.
6. Approval que no bloquea realmente.
7. Outcome persistido pero no mostrado.
8. Event emitido pero no consumido.
9. State actualizado sin provenance.
10. Retries inseguros.
11. External effect sin idempotency key.
12. `unknown outcome` tratado como error genérico.
13. Error técnico mostrado directamente al usuario.
14. Error operacional sin audit.
15. UI afirmando éxito antes del resultado real.
16. Durable task no reanudable.
17. Configuración hardcodeada.
18. Capability que funciona únicamente en tests.
19. Capability que funciona internamente pero no en integración real.
20. Resultado que no puede reconstruirse.

## Relación con audits 01–25

El Capability E2E Audit no sustituye los audits anteriores.

Los utiliza como evidencia transversal.

Debe comprobar especialmente la conexión entre:

- arquitectura
- coherencia
- contratos
- contexto
- memoria
- planner
- orchestrator
- policies
- SOPs
- tasks
- approvals
- event bus
- integrations
- observability
- frontend
- ViewSpec
- auth
- tenant isolation
- recovery
- deploy
- real use

La pregunta deja de ser:

> ¿Existe este módulo?

Y pasa a ser:

> ¿Puede esta capacidad empresarial recorrer todo el sistema y producir correctamente el resultado que promete?

## Dogfooding radical

La primera empresa compilada por el sistema es la propia empresa que comercializa el software.

Por tanto, el dogfooding debe formar parte del audit:

```text
INCIDENT
   ↓
ROOT CAUSE
   ↓
CAPABILITY GAP / BUG / UX / POLICY / SOP / ARCHITECTURE
   ↓
FIX
   ↓
TEST
   ↓
REAL USE
   ↓
GENERALIZABLE CAPABILITY
```

Cada problema encontrado usando el sistema sobre la propia empresa debe convertirse, cuando corresponda, en conocimiento generalizable del producto.

## Empresa compilada

Modelo:

```text
CORE
+
BUSINESS CONTRACT
+
SOPs
+
CAPABILITIES
+
CONFIGURATION
=
COMPILED COMPANY
```

El objetivo es que una nueva empresa requiera principalmente nueva configuración, conocimiento, procedimientos y datos de negocio, y no una reescritura del núcleo.

## Resultado esperado

Crear:

```text
docs/audits/26-capability-e2e/report.md
```

El report deberá contener como mínimo:

- resumen ejecutivo
- matriz de las 20 capabilities
- estado de cada etapa E2E
- failures encontrados
- invariantes violados
- evidencias
- fixes necesarios
- capabilities generalizables
- capabilities específicas del negocio
- pendientes
- criterios de cierre

## Principio final

> Una feature demuestra que existe código.

> Una capability demuestra que existe una capacidad empresarial.

> Un recorrido E2E demuestra que esa capacidad realmente pertenece al sistema.
````

## File: docs/audits/README.md
````markdown
# Macro Audit MetaRepo

> v1 · 2026-10-04 · Estado: current

Auditoria completa del repositorio por 25 ramas. Cada rama tiene su
propio folder con tres documentos:

- `miniaudit.md` — que tiene, que le falta, como se interrelaciona, riesgos, tipo de fixes.
- `roadmap.md` — plan tecnico. **Placeholder por ahora.**
- `fixes.md` — 50 fixes concretos. **Placeholder por ahora.**

## Las 25 ramas

Cada rama toca un aspecto del sistema. Estan numeradas de lo que todo
depende a lo que depende de todo.

| # | Rama | Que es |
|---|---|---|
| 01 | tests | Suite de tests, cobertura, casos raros |
| 02 | observabilidad | Logs, metricas, tracing, alertas |
| 03 | resiliencia | Retry, backoff, circuit breaker, dead letter |
| 04 | multi-usuario-concurrente | Locks, avisos, conflictos entre usuarios |
| 05 | motor-tareas-durable | Leases CAS, heartbeat, checkpoint |
| 06 | aprobaciones-acciones | Hash, idempotencia, outcome_unknown |
| 07 | aislamiento-multi-tenant | TenantScopedStore, RLS, fugas |
| 08 | bus-de-eventos | EventBus, dedupe, SSE |
| 09 | kernel-cognitivo | Thought, Turn, Promoter, Meta, Presenter |
| 10 | fast-slow-llm | Dos velocidades LLM, cuotas, fallback |
| 11 | chat-con-llm | Prompt, tono, tools, RAG |
| 12 | contexto-memoria | MemoryService, ContextEngine, RAG/IDF |
| 13 | ui-servida-viewspec | Resolver, spec, panel contextual |
| 14 | templates-reales | 7 templates React |
| 15 | frontend-react | App, hooks, virtualizacion, a11y |
| 16 | autenticacion | Login, sesiones, OIDC |
| 17 | seguridad-basica | CSP, HSTS, dependencias, rate limit |
| 18 | deploy-infra | Docker, compose, runbook |
| 19 | backups-restore | Backup, retention, restore probado |
| 20 | computer-sandbox | Docker aislado, cuotas, telemetria |
| 21 | browser-worker | Playwright aislado, self-healing |
| 22 | google-drive-gmail | OAuth, Gmail, Calendar, Drive |
| 23 | whatsapp-stripe-gmb | Integraciones externas |
| 24 | business-os-goals | Goal, Plan, Execute, Verify, Replan |
| 25 | docs-operativos | Runbook, glosario, FAQ |

## Los tres fixes prioritarios

Segun la lectura del repo, los tres problemas mas grandes son:

1. **Presenter no wireado al SSE.** El kernel observa pero no dirige. El chat
   emite fullResponse directo.
2. **service.ts monolito con bugs vivos.** createTask cuenta por owner,
   escalateTask TOCTOU, systemContextCache sin limpieza.
3. **Multi-tenant es deuda activa.** scan globales filtrados en memoria.

Estos tres van primero. El resto, por orden de impacto.

## Como se lee esto

- `miniaudit.md` es la fuente de verdad del estado de cada area.
- `roadmap.md` se rellena cuando se decide atacar la rama.
- `fixes.md` se rellena cuando se decide que 50 fixes concretos la cierran.
````

## File: docs/audits/_prep/hanging-before.txt
````
# Tests que superan 10s (candidatos a before colgado)
# Se rellena ejecutando scripts/audits/find-hanging-before.ps1
# Formato de línea: <archivo> — <motivo>
````

## File: docs/audits/_stage-final/politica-validacion.md
````markdown
# Política de validación humana

> Decisión de diseño. Aplicable al runtime del repo y al flujo de trabajo con IA.

## Idea

No todas las acciones necesitan validación humana. Algunas sí (borrar, publicar, aprobar gastos). Otras no (leer, calcular, escribir en local).

El sistema debe permitir al owner definir **por acción** si requiere aprobación humana o no.

## En el runtime del repo

- Cada tool / capability tiene un flag `requiresApproval: boolean` (default según tipo).
- Si `requiresApproval === true`, la acción pasa por `ActionProposal` con estado `awaiting_review`.
- Si `false`, se ejecuta directo.
- El owner del tenant define la política en `TenantConfig` o por rol.
- Ejemplos:
  - `read_*`: nunca requiere aprobación.
  - `write_*` en local: no requiere.
  - `send_email`, `charge_card`, `delete_*`, `publish_*`: requiere.
  - `delegate_task` a un sub-agente: configurable por rol.

**Estado actual:** parcialmente implementado en `actions.ts` (approval-requests). Falta el flag por tool y la política por tenant.

## En el flujo de trabajo con IA (yo)

- El owner define por adelantado qué tipos de comandos quiere que se le consulten antes de ejecutar.
- Ejemplos:
  - "Antes de `git push`, pregúntame."
  - "Antes de borrar archivos, pregúntame."
  - "Antes de cambiar schemas Zod, pregúntame."
  - Todo lo demás, aplica directo.
- La IA respeta la política.

## Bloques donde se aplica

- Bloque 06 (aprobaciones y acciones): añadir flag `requiresApproval` por tool.
- Bloque 11 (chat con LLM): el chat respeta la política al ejecutar tools.
- Bloque 24 (Business OS): el owner configura la política por rol.

## Estado

- Documentado.
- Pendiente de decisión y aplicación en bloque 06 y 24.
````

## File: docs/audits/_stage-final/stage-ui-llm-viewspec.md
````markdown
# Stage final — UI, LLM humano y ViewSpec dinámico

> STAGE_FINAL_UI_LLM_V1 · 2026-10-05 · Estado: pendiente
> Este documento existe para no perder el hilo entre ventanas de chat.
> Es un stage grande que se hace DESPUÉS de los 800 fixes.

## Contexto

Se hará al final, cuando todos los fixes de los 25 bloques estén aplicados
y el motor esté estable. Toca los bloques 13, 14, 15 y probablemente 24.

## Los 3 objetivos

### 1. LLM habla humano

- Prompt, tono, evitar jerga técnica.
- Traducir todo a lenguaje natural.
- Cero términos internos (capability, kernel, thought, SOP, runtime, turn, etc.).
- Cero markdown decorativo (###, ---, **negrita**).
- Cero relleno tipo "Perfecto", "Genial", "Excelente".
- Mensajes cortos, humanos, con pregunta útil al final.

### 2. ViewSpec dinámico

- Detallar todas las entradas de datos posibles.
- Definir qué vistas corresponden a cada tipo de entrada.
- Servir diferentes UI/UX según el caso.
- Spec de vistas debe responder: dado un intent + un contexto de datos,
  qué vista y qué layout se sirve.

### 3. Componentes UI/UX

- Crear los componentes para cada combinación (caso + entrada + vista).
- Definir la UI/UX que se crea en cada caso.
- No es solo un renderer: es un sistema de decisiones visuales.

## Alcance

- Es un stage de diseño + implementación, no un bloque de fixes.
- Requiere:
  - Un documento de spec de entradas de datos (qué tipos hay, qué forma tienen).
  - Un documento de spec de vistas (qué vista corresponde a cada entrada).
  - Un documento de spec de UI/UX por caso.
  - Implementación de componentes.
  - Tests de las combinaciones.

## Qué no es

- No es un rediseño del motor.
- No es un cambio de arquitectura.
- No es un bloque de los 25. Es un stage posterior, transversal.

## Notas sueltas

- Idea del owner: "el LLM hable humano y en detallar todas las entradas de
  data que puede haber y crear el ViewSpec sirviendo diferentes UI/UX depende
  del caso y a crear los componentes y definir la UI/UX que se crea en cada
  caso, va a ser un stage muy grande".
- Se hace al final de todo.
- La docu obsoleta (menos spec, features, goals y audits) no se usa como
  fuente.

## Documentos obsoletos — política del owner

El owner considera obsoleta toda la documentación antigua, EXCEPTO:
- `docs/audits/**` (los 25 bloques de auditoría).
- Los documentos de spec, features y goals (SPEC.md, FEATURES.md, GOALS.md
  o equivalentes).

Todo lo demás (README, ARCHITECTURE, docs sueltos de diseño, mockups
antiguos) **no se usa como fuente de verdad**.
````

## File: docs/audits/00-coherencia/miniaudit.md
````markdown
# 00 - Coherencia del repo y disciplina de fixes

> v1 - 2026-10-04 - Estado: audited-deep
> Fuente: leer el repo como un todo, no modulo a modulo.

## Ontologia

Marcas de idempotencia, contratos Zod, adapters, constantes declaradas, archivos huerfanos, codigo muerto, dependencias entre bloques, docs vs realidad.

## Estado real

Cada miniaudit 01-25 declara 3-6 huecos. La auditoria profunda encuentra 3-5x mas. Los miniaudits estan reescritos con 20 huecos profundos cada uno. La coherencia horizontal (entre bloques) no esta auditada.

## Evidencia

- Bloques 01-09: aplicados y verificados.
- Fixes con anclas que no encontraban el punto: detectados en 04-13, 05-10/11/12, 06-09/10.
- Marcas repetidas: ENGINE_TENANT_V1 x4, KERNEL_NONFATAL_V1 x8.
- Constantes declaradas y no usadas: MAX_CHILD_DEPTH, TenantConfig.fastIdleMs.
- Adapters huerfanos: DatabaseTenantResolver, DatabaseTenantConfigResolver.

## Huecos declarados

- Sin protocolo de fixes.
- Sin policy de que no tocar.
- Sin auditoria de coherencia horizontal.
- Sin verificacion de marcas.
- Sin verificacion de huerfanos.

## Huecos profundos (auditoria extendida)

1. Marcas repetidas en el mismo archivo.
2. Marcas huerfanas.
3. Contratos Zod declarados sin aplicar.
4. Constantes declaradas y no usadas.
5. Adapters construidos y no inyectados.
6. Codigo cromos sin uso.
7. Funciones exportadas sin consumidor.
8. Rutas sin cliente.
9. Config declarada sin lectura.
10. Timeouts hardcodeados.
11. console.log directo.
12. catch {} vacios.
13. TODO sin issue-link.
14. Docs sin cabecera.
15. Fix sin test.
16. Bloque sin verificacion 15/15.
17. Rama sin merge tras 30 dias.
18. package.json sin script de coherencia.
19. Sin informe de coherencia.
20. Sin umbral de aceptable.

## Interrelacion

Transversal a los 25 bloques. Depende de todos. Todos dependen de este.

## Riesgos

El repo se desalinea bloque a bloque. Los docs mienten. Los huerfanos crecen.

## Tipo de fixes

Protocolo de fixes. Policy del repo. Auditoria de coherencia horizontal.
````

## File: docs/audits/00-coherencia/report.md
````markdown
# Informe de coherencia — Bloque 00

> v1 · 2026-10-05 · Estado: cerrado
> Fuente: 4 auditores oficiales (anchors, contracts, idempotency, tenant-default)
> + verificación manual de los 20 huecos profundos del miniaudit.

## Resumen

El miniaudit del bloque 00 es cualitativamente correcto y cuantitativamente
subestimado. La realidad es 3-5x peor de lo declarado, tal y como el propio
miniaudit predice ("la auditoría profunda encuentra 3-5x más").

## Resultados de los 4 auditores oficiales

### anchors
- Sin bloques `.ps1` en `scripts/audits/blocks/`. Nada que verificar.
- El directorio solo tiene un README.

### contracts
- 212 contratos totales.
- 78 con implementación real.
- 13 marcados PENDING/STUB.
- **121 sin implementación y sin marca** (mayoría son tipos/schemas de
  `packages/domain` que se consumen internamente).

### idempotency
- 284 ficheros revisados.
- **535 marcas encontradas, 432 únicas.**
- 65 marcas duplicadas con cuerpo distinto.
- 2 marcas huérfanas (`EXPORT_BUSINESS_WEB_V1`, `FALLBACK_V1`).
- 53 marcas repetidas en el mismo fichero.

### tenant-default
- 324 ficheros revisados.
- 66 ocurrencias de "default".
- **64 permitidas, 2 prohibidas:**
  - `apps/server/src/engine/events/bus.ts:109` — `notification-prefs` con id literal `"default"`.
  - `packages/domain/src/views.ts:20` — enum con valor "default" (legítimo).

## Verificación de los 20 huecos profundos

| # | Hueco | Estado | Notas |
|---|-------|--------|-------|
| 1 | Marcas repetidas en mismo archivo | CONFIRMADO | 53 vs 2 declaradas |
| 2 | Marcas huérfanas | CONFIRMADO | 2 reales + ~460 sin bloque `.ps1` |
| 3 | Contratos Zod declarados sin aplicar | CONFIRMADO | 121 sin implementación ni marca |
| 4 | Constantes declaradas sin uso | CONFIRMADO | `MAX_CHILD_DEPTH` (en realidad sí se usa), `TenantConfig.fastIdleMs` |
| 5 | Adapters huérfanos | CONFIRMADO | `DatabaseTenantResolver`, `DatabaseTenantConfigResolver` con marca PENDING |
| 6 | Código cromos sin uso | CONFIRMADO | `kernel/cromos/**` con marca CROMOS_PENDING |
| 7 | Funciones exportadas sin consumidor | PARCIAL | derivado del 3 |
| 8 | Rutas sin cliente | NO VERIFICADO | requiere cruce web/api |
| 9 | Config declarada sin lectura | PARCIAL | `toolTimeouts` en config.ts |
| 10 | Timeouts hardcodeados | CONFIRMADO | múltiples en computer.ts, google-auth.ts |
| 11 | console.log directo | CONFIRMADO | 27 sitios, ~5 legítimos |
| 12 | catch vacíos | NO VERIFICADO | requiere grep |
| 13 | TODO sin issue-link | CONFIRMADO | `KERNEL_TENANT_DB_V1`, `KERNEL_AUDIT_DB_V1` |
| 14 | Docs sin cabecera | NO VERIFICADO | requiere revisar 25 |
| 15 | Fix sin test | CONFIRMADO | universal en el repo |
| 16 | Bloque sin verificación 15/15 | CONFIRMADO | solo existe bloque-10.ps1 |
| 17 | Rama sin merge tras 30 días | NO VERIFICABLE | sin acceso git |
| 18 | package.json sin script de coherencia | CONFIRMADO | ahora existe `audit:coherence` |
| 19 | Sin informe de coherencia | CONFIRMADO | este documento lo resuelve |
| 20 | Sin umbral de aceptable | CONFIRMADO | pendiente definir |

## Fixes aplicados

- `audit:coherence` añadido a package.json.
- Este informe creado.

## Fixes descartados (falsos positivos)

- `VIEW_RESOLVER_V1` duplicada: no duplicada. Server y web hacen cosas distintas.
- `OUTCOME_V1` duplicada: no duplicada. Una es la definición, otra es el uso del tipo.
- `AGENT_ROLE_V3` x6: no son 6 aplicaciones del mismo fix, es la misma marca documentando 6 campos de la misma ampliación.
- `MAX_CHILD_DEPTH` no usado: sí se usa, ya verificado.

## Pendientes (fuera de este bloque)

- Umbral de aceptable: definir qué nivel de repetición de marcas es tolerable.
- `console.log` directos: caso por caso en el bloque que toque cada archivo.
- Contratos Zod sin implementación: revisar caso por caso cuando cada bloque use el contrato.

## Modelo del repo

Clone-por-cliente: un deployment por cliente. `tenantId` siempre `"default"`.

La ruta a multi-tenant real está documentada en
`docs/audits/07-aislamiento-multi-tenant/miniaudit.md` (sección
"Ruta a multi-tenant real").
````

## File: docs/audits/00-coherencia/roadmap.md
````markdown
# Roadmap - 00 coherencia del repo

> v1 - 2026-10-04 - Estado: planned

## 1. Promesa del repo

Un repo que se puede tocar sin miedo. Cada fix se verifica, cada marca es unica, cada huerfano esta marcado.

## 2. Estado verificado

- 25 miniaudits reescritos con 20 huecos profundos cada uno.
- 9 bloques aplicados.
- Protocolo de fixes y policy escritos.

## 3. Huecos contra produccion

- Sin verificacion de coherencia entre bloques.
- Sin verificacion de marcas repetidas.
- Sin verificacion de huerfanos.

## 4. Objetivo

Cada bloque se cierra con verificacion de coherencia.

## 5. Fronteras

- No auto-fix. El meta-audit reporta, no corrige.

## 6. Conexiones

Transversal a los 25 bloques.

## 7. Principios del PRODUCT.md

Coherencia. Un repo desalineado no se puede operar.

## 8. Como se verifica el cierre

- Protocolo de fixes escrito y en vigor.
- Policy escrita y en vigor.
- Meta-audit escrito y aplicado.
- 25/25 miniaudits con audited-deep.
````

## File: docs/audits/01-tests/miniaudit.md
````markdown
# 01 — Tests

<<<<<<< HEAD
> v2 · 2026-10-04 · Estado: audited-deep
> Fuente: docs/audits/_prep/test-full.txt, docs/audits/_prep/typecheck.txt, código real tests/*.test.ts, package.json

## Ontología

AgentTask, ActionProposal, Mail, CalendarEvent, BrowserSession, ComputerCommand, Thought, Turn, AuditEntry, CapabilityContract, Outcome, Goal, Verification.

## Estado real

218 casos en tests/*.test.ts. 11 con timeout a 20s. Los before hooks dependen de servicios externos que se cuelgan. 429 de Gemini en los tests que llaman al LLM. Los after hooks revientan con TypeError cuando el before falla. Tests unitarios (actions, computer, google, pdf, vault, event-bus, policy) pasan en <500ms.

## Evidencia

De test-full.txt: 11 tests con timeout, 3 before hooks colgados, 4 archivos con TypeError en el after, 429 de Gemini free tier (limit 5). Muchos tests muestran tiempos bajos pero el runner los marca como timeout.

## Huecos declarados

- before/after hooks no protegidos.
- Tests de integración sin aislar servicios externos (Gemini, PGlite, Docker, Playwright).
- Sin cobertura medida.
- Sin tests del kernel cognitivo.
- Sin test de crash-recovery.
- Sin test de 50 tenants concurrentes.

## Huecos profundos (auditoría extendida)

1. **Sin `test:watch` en package.json**: iterar sobre un test cuesta 3-5s cada vez. No hay atajo de desarrollo.
2. **`--test-timeout=20000` hardcodeado**: no hay override por test individual. Un test lento legítimo bloquea toda la suite.
3. **Sin per-test fixtures**: cada test crea su propio `createStore()`. 218 tests × 300ms = 65s solo en setup de DB.
4. **Sin `--test-concurrency` explícito**: por defecto node --test corre en serie. 4 CPUs disponibles sin usar.
5. **`tests/setup.ts` no existe** (aunque el fix 01-01 lo propone): sin él, cada test que llama a un proveedor externo tiene que mockear manualmente.
6. **No hay mock de `pglite`**: los tests usan PGlite real en disco. Cada test crea una DB nueva en `/tmp` y la borra. 4x más lento que in-memory.
7. **No hay `tests/helpers/db.ts`**: cada test copia el mismo patrón `mkdtemp + createStore + rm`. 30 líneas repetidas × 50 tests = 1500 líneas duplicadas.
8. **`tests/helpers/browser.ts` y `tests/helpers/computer.ts` existen pero no se usan consistentemente**: algunos tests montan su propio Docker runner en lugar de reusar el helper.
9. **Sin test de migración de DB**: `scripts/migrate-*` existen pero nadie los verifica contra una DB real.
10. **Sin test de las rutas HTTP**: `app.request("/api/...")` sí se usa, pero no hay un helper para hacer requests tipados. Cada test repite headers, auth, etc.
11. **No hay snapshot testing**: las respuestas de `/api/agent` cambian de shape sin test que detecte el cambio.
12. **Sin test de los schemas Zod del dominio**: si un schema cambia (añadir un campo obligatorio), ningún test lo detecta hasta que rompe en runtime.
13. **Sin test de idempotencia de rutas**: repetir un POST con la misma key no está cubierto salvo en actions.
14. **`tests/load/fifty-tenants.test.ts` hace 50 tenants secuenciales, no concurrentes**: el nombre miente.
15. **Sin `tests/fixtures/`**: los datos de prueba están inline en cada test. Imposible reusar.
16. **No hay `coverage/lcov.info` en CI**: aunque se mida cobertura, no se publica.
17. **Sin `test:all` que corra backend + worker + web**: cada uno tiene su comando. Un solo punto de entrada sería mejor.
18. **Sin test de retención del bus** (los eventos de auth se retienen 365 días, los de system.maintenance 7): implementado en retention.ts pero sin test que lo cubra.
19. **Sin test de la migración owner → tenant:owner**: `scripts/migrate-tenant-scope.ts` sin cobertura.
20. **Sin test de `recoverInterruptedTasks` con datos reales**: el test existe pero usa un store en memoria, no la DB.

## Interrelación

Transversal. Bloquea el cierre de cualquier rama. Comparte infraestructura con 14, 20, 21.

## Riesgos

Un fix en service.ts rompe tests ya colgados. Test pasa por razón equivocada. Suite tarda >3 min y nadie la corre.

## Tipo de fixes

Aislar tests de servicios externos. Proteger after hooks. Instrumentar cobertura (c8). Tests del kernel. Test de crash-recovery. Helper de DB reutilizable. Test de migración. Test de schemas Zod. Test de retención.
=======
> v1 · 2026-10-04 · Estado: audited
> Fuente: docs/audits/_prep/test-full.txt (pnpm test, 218 casos)

## Ontología del área

Conceptos que cubre esta rama: `AgentTask`, `ActionProposal`, `Mail`,
`CalendarEvent`, `BrowserSession`, `ComputerCommand`, `Thought`, `Turn`,
`AuditEntry`, `CapabilityContract`, `Outcome`, `Goal`, `Verification`.

Los tests son la única forma de verificar que la ontología declarada
funciona de verdad.

## Estado real del código

- 218 casos en `tests/*.test.ts`.
- **11 tests con timeout a 20s**. No por bug de código, sino porque sus
  `before` hooks dependen de servicios externos que se cuelgan:
  - `tests/agent-api.test.ts` → `createApp` no resuelve a tiempo.
  - `tests/auth.test.ts`, `tests/api.test.ts` → idem.
  - `tests/browser.test.ts` → arranca un server HTTP en cada test.
  - `tests/computer-api.test.ts` → `createStore` + Docker.
  - `tests/memory.test.ts`, `tests/tasks-reassign.test.ts`, `tests/workflows.test.ts`
    → su `after` revienta con `TypeError: Cannot read properties of undefined (reading 'agent')`,
    porque el `before` no llegó a asignar `server`.
  - `tests/persistence.test.ts`, `tests/rag.test.ts` → PGlite con contención de disco.
  - `tests/model-worker.test.ts` → agota la cuota de Gemini (429).

## Evidencia

De `test-full.txt`:
- Los tests unitarios (actions, computer, google, pdf, vault, event-bus,
  policy, rag unitarios) pasan en <500ms.
- Los tests de integración con `createApp` se cuelgan en `before` o en `after`.
- 429 de Gemini: `Quota exceeded for metric: generate_content_free_tier_requests,
  limit: 5, model: gemini-3.6-flash`.
- Muchos tests muestran tiempos bajos (0.4ms, 0.8ms) pero el runner los marca
  como timeout, señal de que algo del runner se cuelga al final.

## Huecos concretos

- **Los `after` hooks no están protegidos**. Si `before` falla, `after`
  revienta con `TypeError`. Falta `if (server) await server.agent.stop()`.
- **Los tests de integración no aíslan servicios externos**. Dependen de
  Gemini (429), PGlite (contención), Docker.
- **No hay cobertura medida**. Sin `c8` ni `nyc`.
- **No hay test de kernel cognitivo**: `Thought`, `Turn`, `AttentionVector`,
  `Promoter`, `Meta`, `Presenter` no tienen tests directos.
- **No hay test de `closeTurnAndChildren`**, ni de race entre `promote` y `close`.
- **No hay test multi-tenant con N tenants concurrentes**.

## Interrelación

- Depende de **todos** los módulos: es transversal.
- Bloquea el cierre de cualquier rama: no puedes declarar un área "cerrada"
  sin tests verdes.
- Comparte infraestructura con `14-google-drive-gmail` (mocks HTTP),
  `20-computer-sandbox` (Docker), `21-browser-worker` (Playwright).

## Riesgos

- Que un fix en `service.ts` (por ejemplo el de `systemContext`) rompa los
  tests de `memory` que ya están colgados.
- Que un test pase pero por la razón equivocada (falso verde).
- Que la suite entera tarde >3 min y nadie la corra.

## Tipo de fixes

1. Aislar tests de servicios externos: mocks en lugar de llamadas reales
   a Gemini/OpenRouter.
2. Proteger `after` hooks: `if (server) await server.agent.stop()`.
3. Instrumentar cobertura (`c8` o `nyc`).
4. Tests del kernel: `tests/kernel/*.test.ts` con fixtures de `Thought`.
5. Test de crash-recovery: matar el proceso, reiniciar, verificar.
6. Configurar `--test-concurrency=1` si la contención de PGlite es el cuello.
>>>>>>> fix/wave-01-learning-in-pkg
````

## File: docs/audits/01-tests/roadmap.md
````markdown
<<<<<<< HEAD
# Roadmap — 01 tests

> v1 · 2026-10-04 · Estado: planned

## 1. Promesa del repo
Sin tests, ningún otro estado es confiable. El HANDOFF archivado lo
menciona: "un test que falla es un hecho; un sistema sin tests es una
hipótesis".

## 2. Estado verificado
- 218 casos. 11 con timeout. 3 before hooks colgados. 4 after hooks con
  TypeError. 1 test skipped (Windows .cmd). 429 de Gemini.
- Fuente: docs/audits/_prep/test-full.txt.

## 3. Huecos contra producción
- before/after hooks no protegidos.
- Tests de integración sin aislar servicios externos.
- Sin cobertura medida.
- Sin tests del kernel cognitivo.
- Sin test de crash-recovery.
- Sin test de 50 tenants concurrentes.

## 4. Objetivo
Suite verde en CI, cero flakes, cobertura >50% en caminos críticos, y un
test que mate el proceso a mitad de tarea y verifique la recuperación.

## 5. Fronteras
- No tests de UI (pertenecen a 15).
- No tests de browser reales en CI (pertenecen a 21).
- No chaos engineering (pertenece a 03).

## 6. Conexiones
- Depende de: ninguna. Es la base.
- Dependen de esta: las 24 restantes.
- Archivos compartidos: tests/*.test.ts, tests/helpers/*, package.json.

## 7. Principios del PRODUCT.md
Los 5. Sin tests, ninguno se puede verificar.

## 8. Cómo se verifica el cierre
- pnpm test verde, con exit 0.
- Cobertura >50% en los 6 módulos críticos.
- Un test que mata el proceso a mitad y verifica la recuperación.
- CI con pnpm test bloqueante.
=======
# Roadmap — tests

> v1 · 2026-10-04 · Estado: placeholder

Se rellena cuando se decida atacar esta rama.

## 1. Promesa del repo
## 2. Estado verificado
## 3. Huecos contra produccion
## 4. Objetivo y sub-objetivos
## 5. Fronteras
## 6. Conexiones con otras ramas
## 7. Principios del PRODUCT.md que toca
## 8. Como se verifica el cierre
>>>>>>> fix/wave-01-learning-in-pkg
````

## File: docs/audits/02-observabilidad/fixes.md
````markdown
<<<<<<< HEAD
# Fixes — 02 observabilidad

> v1 · 2026-10-05 · Estado: aplicado (23 fixes)

## Fixes aplicados

| # | Fix | Marca | Archivo | Estado |
|---|---|---|---|---|
| 01 | Sampling de logs INFO | LOG_SAMPLING_V1 | apps/server/src/log.ts | applied |
| 02 | LOG_LEVEL en todos los niveles | LOG_LEVEL_GLOBAL_V1 | apps/server/src/log.ts | applied |
| 03 | backgroundFailure retryable + stack + cause + contador | LOG_RETRYABLE_V1 | apps/server/src/log.ts | applied |
| 04 | Contadores background_failures_total + http_errors_by_route_total | METRIC_BG_FAILURES_V1 + METRIC_HTTP_ERRORS_V1 | apps/server/src/metrics/registry.ts | applied |
| 05 | Interfaz Histogram | HISTOGRAM_V1 | apps/server/src/metrics/registry.ts | applied |
| 06 | Campo histograms en MetricsRegistry | HISTOGRAM_FIELDS_V1 | apps/server/src/metrics/registry.ts | applied |
| 07 | Métodos histogram y observe | HISTOGRAM_METHODS_V1 | apps/server/src/metrics/registry.ts | applied |
| 08 | Render de histogramas | HISTOGRAM_RENDER_V1 | apps/server/src/metrics/registry.ts | applied |
| 09 | Registrar histograma HTTP | HISTOGRAM_HTTP_LATENCY_V1 | apps/server/src/metrics/registry.ts | applied |
| 10 | Errores por ruta + observación de latencia | HTTP_ERRORS_AND_HISTOGRAM_V1 | apps/server/src/middleware/request-logger.ts | applied |
| 11 | Activar alerta http_latency_p99 | LATENCY_P99_WIRE_V1 | apps/server/src/alerts/definitions.ts | applied |
| 12 | thoughtProvenance acepta correlationId | PROVENANCE_CORRELATION_V1 | apps/server/src/kernel/graph/thought.ts | applied |
| 13 | Kernel propaga correlationId a Thought | KERNEL_CORRELATION_PROPAGATE_V1 | apps/server/src/kernel/kernel.ts | applied |
| 14 | Parseo W3C de traceparent | TRACEPARENT_PARSE_V1 | apps/server/src/middleware/request-logger.ts | applied |
| 15 | Deduplicar quotaPerSpeed | CONFIG_QUOTA_DEDUP_V1 | apps/server/src/config.ts | applied |
| 16 | .strict() en thoughtProvenance | ATTENTION_STRICT_V1 | apps/server/src/kernel/graph/thought.ts | applied |
| 17 | Exponer p99 HTTP en /metrics | METRICS_P99_EXPOSE_V1 | apps/server/src/metrics-exporter.ts | applied |
| 18 | Método quantile en MetricsRegistry | HISTOGRAM_QUANTILE_V1 | apps/server/src/metrics/registry.ts | applied |
| 19 | Cablear AlertService en index.ts | ALERTS_WIRE_V1 | apps/server/src/index.ts | applied |
| 20 | snapshotHttp en MetricsRegistry | (no aplicado, sustituido por inline) | — | replaced |
| 21 | Fallback snapshotHttp inline | ALERTS_WIRE_FIX3_V1 | apps/server/src/index.ts | applied |
| 22 | Completar mock metricsSnapshot en test | ALERTS_TEST_MOCK_FIX_V1 | tests/alerts.test.ts | pending |
| 23 | Reparar snapshotHttp roto | ALERTS_WIRE_FIX3_V1 | apps/server/src/index.ts | applied |

## No aplicados (fuera de alcance o requieren decisión)

| # | Punto del miniaudit | Motivo |
|---|---|---|
| 3 | Rotación de logs | infra, no código |
| 4 | Separación por nivel | ya hecho con stdout/stderr |
| 7 | Log HTTP bodies | riesgo PII, requiere diseño |
| 11 | metrics_flush a storage | decisión de diseño |
| 12 | Dashboards Grafana | ops, no código |
| 20 | Retención de logs | infra, no código |
| 24 | console.log directos (27 sitios) | arranque/CLI/demo, caso por caso en bloque 00 |

## Notas

- AlertService se instancia al arrancar el server y evalúa las 8 alertas cada 30s.
- El histograma HTTP se puebla en request-logger; la alerta p99 se apoya en él.
- correlationId viaja del request HTTP al Thought.provenance.
=======
# Fixes — observabilidad

> v1 · 2026-10-04 · Estado: placeholder

50 fixes concretos. Se rellenan cuando se decida atacar la rama.
>>>>>>> fix/wave-01-learning-in-pkg
````

## File: docs/audits/02-observabilidad/miniaudit.md
````markdown
# 02 — Observabilidad

<<<<<<< HEAD
> v2 · 2026-10-04 · Estado: audited-deep
> Fuente: repodump log.ts, metrics-exporter.ts, app.ts, engine/events/*, código real tras bloques 01-09

## Ontología

SystemEvent, KernelContext.correlationId, RunEvent, health-deep, métricas Prometheus, backgroundFailure.

## Estado real

log.ts con emit(level, event, fields) que imprime JSON de una línea. metrics-exporter.ts con 6 métricas. /api/health-deep verifica DB, bus, worker, kernel, tenantService, capabilities, guardrails, metrics. backgroundFailure(phase, error) en log.ts.

## Evidencia

Los tests no muestran tracing. Los errores 429 de Gemini no se distinguen de errores de código en el log. metrics-exporter genera las métricas bajo demanda, no las acumula.

## Huecos declarados

- Sin traceId.
- Sin tracing distribuido (OTel).
- Sin alertas.
- Sin dashboards.
- backgroundFailure sin contexto (owner, tenantId, taskId).
- Sin redacción de secretos.

## Huecos profundos (auditoría extendida)

1. **`logInfo`/`logWarn`/`logError` no aceptan contexto estructurado**: hay que concatenar strings. Se pierden campos en el parseo JSON.
2. **Sin sampling**: en producción con 100 req/s, se escriben 100 líneas/s de log info. Ruido.
3. **Sin rotación de logs**: el archivo crece indefinidamente. En 1 mes, 10 GB.
4. **Sin separación por nivel**: errors y debug van al mismo stream. El operador no puede filtrar barato.
5. **`console.log` directo en algunos sitios**: `kernel/graph/store-store.ts`, `metrics-exporter.ts`, `admin-routes.ts` usan `console.warn` directo, saltándose `log.ts`.
6. **Sin `LOG_LEVEL` respetado en todos los sitios**: algunos logs son hardcoded, otros respetan el nivel. Inconsistente.
7. **Sin log de HTTP bodies**: cuando un request falla, no hay forma de saber qué envió el cliente sin tocar el código.
8. **Sin contador de errores por ruta**: `/metrics` no expone `http_errors_by_route_total`. Saber qué endpoint falla más es manual.
9. **Sin histograma de latencia**: `openmuse_http_requests_total` no tiene versión histogram. No hay p50/p95/p99.
10. **`metrics-exporter.ts` recalcula todo en cada GET**: con 50 tenants son 50×4 list = 200 queries por request a /metrics.
11. **Sin `metrics_flush` a storage**: las métricas viven solo en memoria. Reinicio = pierde histórico.
12. **Sin dashboards predefinidos**: ni Grafana, ni JSON de dashboards, ni nada.
13. **Sin alertas implementadas**: el AlertService existe (fix 02-09) pero solo 5 alertas definidas. Faltan: circuito abierto, DLQ creciendo, tenant con quota agotada, worker caído, error rate >5%.
14. **Sin logs de decisión**: cuando el kernel decide un destino (Promoter), no hay log. Debug imposible.
15. **Sin traceId propagado al kernel**: `correlationId` se propaga al HTTP pero no llega a `Thought.provenance`. Imposible correlacionar un turno con un request.
16. **`backgroundFailure` no distingue transitorio vs permanente**: un 503 de Google reintentable y un 400 determinista van al mismo log. El operador no sabe cuál priorizar.
17. **Sin contador de fallos por fase**: `backgroundFailure` loguea pero no incrementa un contador. No hay `background_failures_total{phase}`.
18. **Sin `traceparent` W3C**: no se acepta ni se emite el header estándar de tracing. Imposible integrarse con OTel.
19. **Sin logs estructurados de excepciones**: los errores se loguean como string, no como JSON con `name`, `message`, `stack`, `cause`.
20. **Sin retención de logs**: el log.jsonl crece sin tope. Debería rotarse por tamaño o por días.

## Interrelación

Transversal. Comparte system-events con 08.

## Riesgos

Fallo sin diagnosticar. system-events crece sin tope. /metrics bloquea la DB al calcularse en cada request.

## Tipo de fixes

Propagar correlationId a cada log. Añadir contexto a backgroundFailure. Redacción de campos sensibles. Alertas mínimas. Métricas acumulativas con flush a DB. Sampling. Rotación. Histograma de latencia.
=======
> v1 · 2026-10-04 · Estado: audited
> Fuente: repodump apps/server/src/log.ts, metrics-exporter.ts, app.ts

## Ontología del área

Conceptos: `SystemEvent`, `KernelContext.correlationId`, `RunEvent`,
`health-deep`, métricas Prometheus, `backgroundFailure`.

La observabilidad es lo que permite reconstruir qué pasó en una ejecución
concreta (HTTP → task → turn → thought).

## Estado real del código

- `log.ts` con `emit(level, event, fields)` que imprime JSON de una línea.
- `metrics-exporter.ts` con `openmuse_worker_running`,
  `openmuse_tasks_total{tenant,status}`, `openmuse_roles_total`,
  `openmuse_tasks_running`, `openmuse_tasks_failed`, `openmuse_builds_total`.
- `/api/health-deep` verifica DB, bus, worker, kernel, tenantService,
  capabilities, guardrails, metrics.
- `backgroundFailure(phase, error)` en `log.ts`.

## Evidencia

- Los tests de `test-full.txt` **no muestran tracing**. Solo logs.
- Los errores 429 de Gemini **no se distinguen** de errores de código en el
  log. `backgroundFailure("event emit action.deferred", error)` no incluye
  tenantId ni taskId.
- `metrics-exporter.ts` genera las métricas **bajo demanda**, no las acumula.
  Cada `GET /metrics` recalcula desde la DB.

## Huecos concretos

- **No hay `traceId`**. El `KernelContext` tiene `correlationId` pero no está
  claro que se propague a los logs.
- **No hay tracing distribuido** (OpenTelemetry). Solo logs y métricas.
- **No hay alertas**. Ninguna regla dispara por "X fallos en Y minutos".
- **No hay dashboards**. Solo el endpoint `/metrics`.
- **`backgroundFailure(phase, error)` no incluye contexto**. Sin `owner`,
  `tenantId`, `taskId`, es difícil filtrar 100 tenants.
- **No hay redacción de secretos**. Un `console.log` de un payload puede
  filtrar tokens.

## Interrelación

- Transversal. Todas las ramas necesitan emitir métricas y logs.
- Comparte archivos con `08-bus-de-eventos` (`system-events` es la fuente de
  verdad de las métricas agregadas).

## Riesgos

- Que un fallo en producción no se pueda diagnosticar por falta de contexto.
- Que los logs de `system-events` crezcan sin tope.
- Que `/metrics` se calcule en cada request y bloquee la DB.

## Tipo de fixes

1. Propagar `correlationId` desde HTTP hasta cada log.
2. Añadir `owner`, `tenantId`, `taskId` a `backgroundFailure`.
3. Redacción de campos sensibles (`token`, `apiKey`, `authorization`).
4. Alertas mínimas: worker down, DB down, rate limit, backup fallido.
5. Métricas acumulativas en memoria + flush a DB, no cálculo bajo demanda.
>>>>>>> fix/wave-01-learning-in-pkg
````

## File: docs/audits/02-observabilidad/roadmap.md
````markdown
<<<<<<< HEAD
# Roadmap — 02 observabilidad

> v1 · 2026-10-04 · Estado: planned

## 1. Promesa del repo
No puedes operar lo que no ves. Base de cualquier deploy a producción.

## 2. Estado verificado
- log.ts con JSON de una línea.
- 6 métricas Prometheus bajo demanda.
- health-deep con checks.
- Fuente: repodump apps/server/src/log.ts, metrics-exporter.ts.

## 3. Huecos contra producción
- Sin traceId global.
- backgroundFailure sin owner/tenantId/taskId.
- Sin alertas.
- Sin dashboards.
- Sin redacción de secretos.

## 4. Objetivo
Reconstruir una operación end-to-end (HTTP → task → turn → thought) desde
los logs. Un fallo en producción dispara una alerta.

## 5. Fronteras
- No dashboards Grafana.
- No tracing OTel todavía.

## 6. Conexiones
- Transversal.
- Depende de: 08 (bus).
- Dependen de esta: todas.

## 7. Principios del PRODUCT.md
Tareas durables, kernel cognitivo.

## 8. Cómo se verifica el cierre
- Un request HTTP con correlationId propaga el id a todas las líneas.
- 5 alertas definidas y probadas.
- Redacción de token, apiKey, authorization.
=======
# Roadmap — observabilidad

> v1 · 2026-10-04 · Estado: placeholder

Se rellena cuando se decida atacar esta rama.

## 1. Promesa del repo
## 2. Estado verificado
## 3. Huecos contra produccion
## 4. Objetivo y sub-objetivos
## 5. Fronteras
## 6. Conexiones con otras ramas
## 7. Principios del PRODUCT.md que toca
## 8. Como se verifica el cierre
>>>>>>> fix/wave-01-learning-in-pkg
````

## File: docs/audits/03-resiliencia/diagnostico.md
````markdown
# Diagnóstico — 03 resiliencia

> v1 · 2026-10-05 · Estado: audited
> Fuente: repomix-bloque03 (worker.ts, model-chain.ts, retry.ts, circuit-breaker.ts, dead-letter.ts, service.ts, index.ts, computer.ts, google-auth.ts, bus.ts, app.ts).

## Estado actual del código

**Ya funciona:**
- TaskWorker con lease CAS, heartbeat, AbortSignal propagado.
- `retryWithBackoff` con full jitter y clasificación de errores.
- `CircuitBreaker` con 3 estados (closed/open/half-open).
- `DeadLetterQueue` con enqueue idempotente.
- `recoverInterruptedTasks` y `recoverInterruptedActions` al arrancar.

## Huecos del miniaudit — verificación real

| # | Hueco | Estado | Evidencia |
|---|-------|--------|-----------|
| B1 | Retry sin jitter en model-chain | **FALSO** | model-chain no reintenta; retry.ts usa full jitter |
| B2 | firstByte timeout 45s fijo | **CONFIRMADO** | model-chain.ts:96 |
| B3 | Circuit por spec, no provider | **FALSO** | ya agrupa por provider (CB_PER_PROVIDER_V1) |
| B4 | recoverInterruptedTasks sin lock | **CONFIRMADO** | service.ts:302 sin CAS de claim |
| B5 | Shutdown sin timeout | **CONFIRMADO** | worker.ts:112 |
| B6 | child.kill sin waitpid | **FALSO** | close handler resuelve correctamente |
| B7 | Sin alerta cuando circuit abre | **CONFIRMADO** | circuit-breaker.ts no notifica |
| B8 | guard cache 500ms | **CONFIRMADO** | worker.ts:159 |
| B9 | Sin retry selectivo por tool | **FALSO** | defaultIsRetryable cubre el caso |
| B10 | DLQ sin TTL | **CONFIRMADO** | purgeTargets no incluye dead-letter |
| B11 | outcome_unknown sin reconciliación | **PARCIAL** | maintain marca executing > 10min |
| B12 | Sin bulkhead por provider | **CONFIRMADO** | model-chain sin contador |
| B13 | google timeout hardcoded | **CONFIRMADO** | google-auth.ts usa 15000 |
| B14 | Webhook sin retry | **CONFIRMADO** | app.ts:248 sin retry |
| B15 | shutdown sin drain | **CONFIRMADO** | index.ts:220 |
| B16 | Sin graceful degradation | **CONFIRMADO** | conversation.ts sin mensaje humano |
| B17 | recoverInterruptedActions solo al arrancar | **CONFIRMADO** | index.ts:16 |
| B18 | Files.import sin retry | **CONFIRMADO** | files.ts |
| B19 | retry sin maxTotalTimeMs | **CONFIRMADO** | retry.ts no tiene tope |
| B20 | Test "proveedor caído 5min" | **DIFERIDO** | va al bloque 01 |

## Problemas nuevos detectados

### Graves
- **N1** — El circuit breaker nunca se abre porque `circuit.call()` no se llama en model-chain. Solo se consulta `getState()`. Ningún fallo llega al contador.
- **N20** — `recoverInterruptedTasks` corre en paralelo con `agent.start()`. Carrera real: el worker puede reclamar tareas antes de que recover las vea.
- **N29** — `CircuitBreaker.onFailure()` no distingue error transitorio de error de negocio. 5 errores 4xx abren el circuit.

### Medios
- **N2** — Timers de `firstByteTimeout` no se limpian al abortar el stream.
- **N16** — Listeners de AbortSignal se acumulan en `retryWithBackoff` tras resolve.
- **N21** — `result.status` del handler no se valida antes de `checkpoint`.
- **N8** — `recoverInterruptedTasks` procesa hasta 5000 tareas secuencialmente.

### Menores / aceptados
N3, N4, N5, N6, N7, N9, N10, N11, N12, N13, N14, N15, N17, N18, N19, N22, N23, N24, N25, N26, N27, N28, N30.

## Fixes aplicados en este bloque

22 fixes en scripts/fixes/bloque-03.ps1. Marcas:

- 03-B1 firstByte configurable
- 03-B2 recoverInterruptedTasks con CAS
- 03-B3 worker.stop con timeout
- 03-B4 alerta en circuit open
- 03-B5 guard cache 100ms
- 03-B6 DLQ purge 90d
- 03-B7 reconcile endpoint + STUCK_MS 5min
- 03-B8 bulkhead por provider
- 03-B9 google timeout config
- 03-B10 webhook retry
- 03-B11 shutdown drain timeout
- 03-B12 Files.import retry
- 03-B13 retry maxTotalTimeMs
- 03-B14 graceful degradation chat
- 03-B15 recoverInterruptedActions en maintain
- 03-C1 circuit recibe fallos reales
- 03-C2 recover antes de start
- 03-C3 circuit ignora 4xx
- 03-C4 firstByte timer limpia al abort
- 03-C5 retry signal listeners
- 03-C6 validar result.status
- 03-C7 recover paralelo por lotes
````

## File: docs/audits/03-resiliencia/miniaudit.md
````markdown
# 03 — Resiliencia

<<<<<<< HEAD
> v2 · 2026-10-04 · Estado: audited-deep
> Fuente: repodump worker.ts, service.ts, computer.ts, model-chain.ts, google.ts, código real tras bloques 01-09

## Ontología

LostLeaseError, AbortSignal, ctx.guard(), ctx.checkpoint, outcome_unknown, recoverInterruptedTasks, recoverInterruptedActions, retryWithBackoff, CircuitBreaker, DeadLetterQueue.

## Estado real

TaskWorker con leases CAS, heartbeat cada leaseMs/3, AbortSignal propagado. ctx.guard() antes de cada tool. recoverInterruptedTasks() recupera tareas con lease expirado. recoverInterruptedActions() marca executing como outcome_unknown al arrancar. browser.ts con serial(id, fn).

## Evidencia

Los tests de computer.test.ts que prueban timeout, Stop, quarantine pasan. Los tests de actions.test.ts que prueban outcome_unknown pasan. No hay tests de retry con backoff. No hay tests de circuit breaker.

## Huecos declarados

- Sin retry con backoff.
- Sin circuit breaker.
- Sin dead letter queue.
- Timeouts inconsistentes (30s/45s/90s/300s).
- outcome_unknown no se reconcilia desde la UI.
- recoverInterruptedActions solo al arrancar.

## Huecos profundos (auditoría extendida)

1. **`model-chain.ts` retry sin jitter**: los reintentos entre specs son inmediatos. Con 100 tareas concurrentes, sincronizados.
2. **`firstByteTimeout` de 45s es fijo**: un proveedor lento legítimo tira fallback sin motivo. Configurable por modelo.
3. **Circuit breaker por spec, no por proveedor**: si Google cae, `google/gemini-3.6-flash` y `google/gemini-3.5-flash` tienen circuitos distintos. Falta agrupar por provider.
4. **`recoverInterruptedTasks` sin lock**: si dos procesos arrancan a la vez, ambos intentan recuperar la misma task. Idempotente pero ruidoso.
5. **No hay timeout de shutdown**: `worker.stop()` espera `this.active` vacío sin límite. Con un handler colgado, el proceso no termina.
6. **`child.kill("SIGKILL")` en `runDocker` sin `waitpid`**: el proceso queda zombie hasta que el padre termina.
7. **No hay detección de "proveedor caído globalmente"**: 10 tareas fallan por 500 de Google y no hay alerta.
8. **`ctx.guard()` con cache de 500ms**: si el lease se roba en la ventana, no se detecta hasta el siguiente guard. Bajar a 100ms.
9. **Sin retry selectivo por tool**: `prepare_email` no debería reintentar (efecto externo); `read_workspace` sí. Hoy se tratan igual.
10. **`DeadLetterQueue` sin TTL**: entradas antiguas nunca se limpian. `maintain()` debería purgarlas a los 90 días.
11. **Sin reconciliación automática de `outcome_unknown`**: hay endpoint manual pero nadie reconcilia por defecto. Debería haber un job que consulte al proveedor.
12. **Sin "bulkhead" por proveedor**: si Google tarda 30s, todas las tasks que lo usan se acumulan. Falta pool separado.
13. **`AbortSignal.timeout(30000)` en google.ts hardcodeado**: no respeta `config.toolTimeouts`.
14. **Sin retry de webhook (WhatsApp, Stripe)**: si el webhook falla, no hay reintento. Se pierde el evento.
15. **`process.exit(1)` en `shutdown` sin drain**: si el drain tarda, se mata el proceso. Debería haber timeout de drain.
16. **Sin "graceful degradation"**: cuando el LLM falla, `ConversationAgent` no ofrece un modo degradado (solo el fallback de modelChain).
17. **`recoverInterruptedActions` solo al arrancar**: hay que hacerlo periódico.
18. **Sin retry en `Files.import`**: un `readFile` transitorio no se reintenta.
19. **`retryWithBackoff` no acepta `maxTotalTimeMs`**: un operation con 8 intentos y backoff de 30s puede tardar 4 minutos. Falta tope duro.
20. **Sin test de "proveedor caído durante 5 minutos"**: no hay test que verifique que el sistema sigue funcionando sin Google.

## Interrelación

Depende de 05, 06, 20, 21, 22. Comparte worker.ts con 05, service.ts con 06.

## Riesgos

Proveedor caído tumba el worker por reintentos infinitos. outcome_unknown no reconciliado ejecuta dos veces. Worker muerto no libera el lease.

## Tipo de fixes

Retry con backoff por handler. Circuit breaker por dominio. Dead letter queue con TTL. Timeouts configurables por tool. Reconciliación de outcome_unknown periódica. Bulkhead por proveedor. Retry selectivo por tool. Drain con timeout.
=======
> v1 · 2026-10-04 · Estado: audited
> Fuente: repodump apps/server/src/engine/worker.ts, service.ts, computer.ts

## Ontología del área

Conceptos: `LostLeaseError`, `AbortSignal`, `ctx.guard()`, `ctx.checkpoint`,
`outcome_unknown`, `recoverInterruptedTasks`, `recoverInterruptedActions`.

La resiliencia es lo que permite que un fallo puntual no se propague.

## Estado real del código

- `TaskWorker` con leases CAS, heartbeat cada `leaseMs/3`, `AbortSignal`
  propagado por todos los handlers.
- `ctx.guard()` antes de cada tool.
- `recoverInterruptedTasks()` recupera tareas con lease expirado.
- `recoverInterruptedActions()` marca acciones `executing` como
  `outcome_unknown` al arrancar.
- `browser.ts` con `serial(id, fn)` para no pisarse entre requests del
  mismo browser.

## Evidencia

- En `test-full.txt`, los tests de `computer.test.ts` que prueban
  "timeout", "Stop interrupts", "failed Stop keeps commands quarantined",
  "a timeout with unconfirmed Docker cleanup stays quarantined" **pasan**.
  Eso significa que la resiliencia del computer está testeada.
- Los tests de `actions.test.ts` que prueban `outcome_unknown` pasan.
- **No hay tests de retry con backoff**. No hay tests de circuit breaker.
- El test `Docker subprocess uses literal argv, strips provider credentials,
  caps output and bounds hangs` **está skipped en Windows** porque Node
  spawn no ejecuta `.cmd` con shell:false.

## Huecos concretos

- **No hay retry con backoff real**. Las tareas fallan y quedan fallidas.
- **No hay circuit breaker**. Si Google falla, se sigue intentando.
- **No hay dead letter queue**. Las tareas fallidas quedan en `failed`
  sin cola separada.
- **Timeouts inconsistentes**: 30s computer, 45s browser, 90s `llm_generate`,
  300s task model. Son arbitrarios.
- **`outcome_unknown` no se reconcilia desde la UI**. Solo se marca.
- **`recoverInterruptedActions()` no se llama desde un scheduler**. Solo al
  arrancar el proceso.

## Interrelación

- Depende de `05-motor-tareas-durable`, `06-aprobaciones-acciones`,
  `20-computer-sandbox`, `21-browser-worker`, `14-google-drive-gmail`.
- Comparte `worker.ts` con `05` y `service.ts` con `06`.

## Riesgos

- Que un proveedor caído tumbe el worker entero por reintentos infinitos.
- Que un `outcome_unknown` no reconciliado ejecute dos veces días después.
- Que un worker muerto no libere el lease y bloquee la tarea para siempre.

## Tipo de fixes

1. `retry: { attempts: N, backoff: "exponential", baseMs }` por handler.
2. Circuit breaker por dominio (google.com, openrouter.ai, evolution-api).
3. Dead letter queue: `kind="dead-letter"` con motivo.
4. Timeouts configurables por tool en `TenantConfig`.
5. Reconciliación de `outcome_unknown` con endpoint y UI.
>>>>>>> fix/wave-01-learning-in-pkg
````

## File: docs/audits/03-resiliencia/roadmap.md
````markdown
<<<<<<< HEAD
# Roadmap — 03 resiliencia

> v1 · 2026-10-04 · Estado: planned

## 1. Promesa del repo
Un fallo aislado no puede tumbar el sistema. "Recuperar sin duplicar".

## 2. Estado verificado
- Leases CAS, heartbeat, AbortSignal propagado.
- recoverInterruptedTasks y recoverInterruptedActions al arrancar.
- Fuente: repodump worker.ts, service.ts, computer.ts.

## 3. Huecos contra producción
- Sin retry con backoff.
- Sin circuit breaker.
- Sin dead letter queue.
- Timeouts inconsistentes (30/45/90/300s).
- outcome_unknown sin reconciliación.
- recoverInterruptedActions solo al arrancar.

## 4. Objetivo
Tres fallos consecutivos de un proveedor no rompen el sistema.
outcome_unknown reconciliable en <1 minuto.

## 5. Fronteras
- No chaos engineering.
- No multi-región.

## 6. Conexiones
- Depende de: 05, 06, 20, 21, 22.
- Dependen de esta: 06, 22.

## 7. Principios del PRODUCT.md
Tareas durables.

## 8. Cómo se verifica el cierre
- Mock con 500 en 10 llamadas: backoff y luego circuit breaker.
- Reconciliación de outcome_unknown con endpoint y UI.
- Dead letter queue con 10 tareas.
=======
# Roadmap — resiliencia

> v1 · 2026-10-04 · Estado: placeholder

Se rellena cuando se decida atacar esta rama.

## 1. Promesa del repo
## 2. Estado verificado
## 3. Huecos contra produccion
## 4. Objetivo y sub-objetivos
## 5. Fronteras
## 6. Conexiones con otras ramas
## 7. Principios del PRODUCT.md que toca
## 8. Como se verifica el cierre
>>>>>>> fix/wave-01-learning-in-pkg
````

## File: docs/audits/04-multi-usuario-concurrente/fixes.md
````markdown
<<<<<<< HEAD
# Fixes — 04 multi-usuario concurrente

> v1 · 2026-10-05 · Estado: aplicado (fase 1)

## Fixes aplicados (18)

| Marca | Archivo | Estado |
|-------|---------|--------|
| THREAD_CONFLICT_DIFF_V1 | threads-routes.ts | applied |
| PROJECT_CONFLICT_DIFF_V1 | projects-routes.ts | applied |
| SAVE_THREAD_EXPECTED_V1 | api/threads.ts | applied |
| PROJECT_EXPECTED_V1 | api/projects.ts | applied |
| PROJECT_BLOCKS_EXPECTED_V1 | api/projects.ts | applied |
| PRESENCE_MULTI_V1 | presence.ts | applied |
| PRESENCE_GC_V1 | presence.ts | applied |
| PRESENCE_QUERY_V1 | presence.ts | applied |
| THREAD_EDIT_LOCK_V1 | threads-routes.ts | applied |
| THREAD_EDIT_UNLOCK_V1 | threads-routes.ts | applied |
| PRESENCE_LEAVE_THREAD_V1 | threads-routes.ts | applied |
| PRESENCE_LEAVE_PROJECT_V1 | projects-routes.ts | applied |
| NOTIF_STREAM_TYPE_V1 | notifications-stream.ts | applied |
| NOTIF_STREAM_BUFFER_V1 | notifications-stream.ts | applied |
| RATE_LIMIT_PRUNE_V1 | rate-limit.ts | applied |
| NOTIF_READ_CAS_V1 | engine/routes.ts | applied |

## Fase 2 — pendiente

| Marca propuesta | Hueco | Destino |
|-----------------|-------|---------|
| goals CAS | B5 | bloque 12 |
| SSE Last-Event-ID | B12 | bloque 05 |
| quota del tenant | B14 | bloque 05 |
| record.conflict al bus | B15 | bloque 08 |
| actorId en run-events | B19 | bloque 08 |
| backoff SSE | N8 | bloque 05 |
| usePresence hook | N10 | bloque 13 |
| 409 en useThreads | N11 | bloque 15 |
| 409 en useProjects | N12 | bloque 15 |

## Falsos positivos del miniaudit

- B1, B2, B3, B4, B6, B17, B18 → ya estaban cubiertos por THREADS_CAS_V1, PROJECTS_CAS_V1, PROJECTS_BLOCKS_CAS_V1.

## Fuera de alcance

- B8 (ETag): diseño custom con expectedUpdatedAt.
- B11 (Redis): modelo clone-por-cliente.
- B20 (revertir versión): no prioritario.
=======
# Fixes — multi-usuario-concurrente

> v1 · 2026-10-04 · Estado: placeholder

50 fixes concretos. Se rellenan cuando se decida atacar la rama.
>>>>>>> fix/wave-01-learning-in-pkg
````

## File: docs/audits/04-multi-usuario-concurrente/miniaudit.md
````markdown
# 04 — Multi-usuario concurrente

<<<<<<< HEAD
> v2 · 2026-10-04 · Estado: audited-deep
> Fuente: repodump db.ts, threads-routes.ts, projects-routes.ts, código real tras bloques 01-09

## Ontología

compareAndSwap, insertIfAbsent, updatedAt, conflict, sesión, presencia, edit lock.

## Estado real

compareAndSwap protege contra carreras a nivel de record. insertIfAbsent cierra carreras de creación. threads-routes.ts y projects-routes.ts exponen PUT que pueden pisarse. No hay detección de conflicto en el cliente.

## Evidencia

Los tests de actions.test.ts prueban "concurrent approval consumes the proposal only once" y "concurrent idempotent proposals retain a single persisted review". Ambos pasan. No hay tests de dos usuarios escribiendo el mismo thread.

## Huecos declarados

- Sin locks de edición.
- Sin avisos de "otro usuario está editando".
- Sin reconciliación de conflictos.
- Sin rate limit por usuario.
- Sin presence service.

## Huecos profundos (auditoría extendida)

1. **`conversations` PUT hace `db.put` sin CAS**: dos usuarios pisándose en el chat. Implementado en fix 04-01 pero solo si el cliente envía `expectedUpdatedAt`.
2. **`projects` PATCH hace `db.put` sin CAS**: fix 04-02 con la misma limitación.
3. **`blocks` PUT hace `db.put` sin CAS**: fix 04-03.
4. **`memories` POST hace `compareAndSwap({})`**: expected vacío = siempre gana. No protege contra carreras.
5. **`goals` PATCH usa `db.put`**: fix 04-02 no lo cubre.
6. **`agent-settings/identity` POST**: fix existe pero sin CAS real.
7. **Sin optimistic locking en `notifications`**: dos usuarios marcando leída la misma notificación es idempotente pero sin verificación.
8. **Sin ETag / If-Match HTTP estándar**: en vez de `expectedUpdatedAt` custom, se podría usar el header estándar.
9. **`presence` en proceso único**: el PresenceService es in-memory. Con 2 réplicas, dos usuarios en réplicas distintas no se ven.
10. **`edit-lock` in-process**: mismo problema. Con 2 réplicas, no hay coordinación.
11. **Sin Redis / store compartido para locks**: en producción multi-réplica, faltaría.
12. **Sin WebSocket para presence en vivo**: usa polling (no implementado aún). Latencia 3-5s.
13. **`rate-limit` por usuario in-process**: mismo problema multi-réplica.
14. **Sin quota compartida entre usuarios del mismo tenant**: 5 usuarios × 100 tareas = 500, sin límite del tenant.
15. **Sin notificación de "otro usuario cambió X"**: solo devuelve 409, no avisa proactivamente.
16. **Sin "ver qué cambió"**: el 409 no incluye diff. El usuario tiene que recargar y comparar visualmente.
17. **`threads-routes PUT` no valida que el usuario sea el dueño del thread**: cualquier usuario autenticado con el id puede escribirlo. Falta check de ownership explícito.
18. **`projects-routes PATCH` mismo problema**: falta ownership check.
19. **Sin auditoría de cambios por usuario**: `activity` no guarda quién hizo qué cambio.
20. **Sin "revertir a versión anterior"**: cuando hay 409, no hay forma de recuperar la versión previa del otro usuario.

## Interrelación

Transversal al estado compartido. Comparte db.ts con 05 y 07.

## Riesgos

Cliente con 5 usuarios ve corrupción de datos. Notificaciones duplicadas o perdidas entre usuarios del mismo owner. Presencia en vivo muestra lo que escribe otro.

## Tipo de fixes

updatedAt optimista en PUT. Cliente detecta 409 Conflict y muestra "recarga". Notificaciones dirigidas por userId. Presence service efímero con store compartido. Rate limit por usuario con store compartido. ETag HTTP. Diff en el 409. Ownership check en threads y projects.
=======
> v1 · 2026-10-04 · Estado: audited
> Fuente: repodump apps/server/src/db.ts, threads-routes.ts, projects-routes.ts

## Ontología del área

Conceptos: `compareAndSwap`, `insertIfAbsent`, `updatedAt`, `conflict`,
sesión, presencia.

## Estado real del código

- `compareAndSwap(owner, kind, id, expected, patch)` protege contra carreras
  a nivel de record. Devuelve `null` si no matchea.
- `insertIfAbsent` cierra carreras de creación.
- `threads-routes.ts` y `projects-routes.ts` exponen PUT que pueden pisarse.
- No hay detección de conflicto en el cliente.

## Evidencia

- Los tests de `actions.test.ts` prueban `concurrent approval consumes the
  proposal only once` — **pasa**.
- Los tests de `actions.test.ts` prueban `concurrent idempotent proposals
  retain a single persisted review` — **pasa**.
- **No hay tests de dos usuarios escribiendo el mismo thread**.

## Huecos concretos

- **No hay locks de edición**. Si dos usuarios abren el mismo thread, ambos
  ven el estado antiguo.
- **No hay avisos de "otro usuario está editando"**.
- **No hay reconciliación de conflictos** en memoria, artifacts, tasks.
- **No hay rate limit por usuario**, solo por IP/email.
- **No hay presence service** para ver quién está conectado.

## Interrelación

- Transversal al estado compartido: `threads-routes.ts`, `projects-routes.ts`,
  `agent/routes.ts`.
- Comparte `db.ts` con `05-motor-tareas-durable` y `07-aislamiento-multi-tenant`.

## Riesgos

- Que un cliente con 5 usuarios vea corrupción de datos sin darse cuenta.
- Que las notificaciones se dupliquen o se pierdan entre usuarios del
  mismo owner.
- Que la presencia en vivo muestre a un usuario lo que escribe otro.

## Tipo de fixes

1. `updatedAt` optimista en todos los PUT.
2. Cliente detecta `409 Conflict` y muestra "recarga".
3. Notificaciones dirigidas por `userId` (ya hay `assignedTo` en
   `AgentNotification` pero la UI no lo filtra).
4. Presence service efímero (SSE con estado compartido).
5. Rate limit por usuario además de por IP/email.
>>>>>>> fix/wave-01-learning-in-pkg
````

## File: docs/audits/04-multi-usuario-concurrente/roadmap.md
````markdown
<<<<<<< HEAD
# Roadmap — 04 multi-usuario concurrente

> v1 · 2026-10-04 · Estado: planned

## 1. Promesa del repo
Dos usuarios a la vez no deben pisarse.

## 2. Estado verificado
- compareAndSwap a nivel de record.
- insertIfAbsent cierra carreras de creación.
- Fuente: repodump db.ts, threads-routes.ts, projects-routes.ts.

## 3. Huecos contra producción
- Sin locks de edición.
- Sin avisos de "otro usuario está editando".
- Sin reconciliación de conflictos.
- Sin rate limit por usuario.
- Sin presence service.

## 4. Objetivo
Dos usuarios en el mismo thread no corrompen estado. El segundo ve 409.

## 5. Fronteras
- No colaboración en tiempo real.

## 6. Conexiones
- Depende de: 05, 07.
- Dependen de esta: ninguna.

## 7. Principios del PRODUCT.md
Tareas durables, memoria curada.

## 8. Cómo se verifica el cierre
- Test con 2 usuarios concurrentes en el mismo thread.
- Notificaciones dirigidas por userId.
=======
# Roadmap — multi-usuario-concurrente

> v1 · 2026-10-04 · Estado: placeholder

Se rellena cuando se decida atacar esta rama.

## 1. Promesa del repo
## 2. Estado verificado
## 3. Huecos contra produccion
## 4. Objetivo y sub-objetivos
## 5. Fronteras
## 6. Conexiones con otras ramas
## 7. Principios del PRODUCT.md que toca
## 8. Como se verifica el cierre
>>>>>>> fix/wave-01-learning-in-pkg
````

## File: docs/audits/05-motor-tareas-durable/miniaudit.md
````markdown
# 05 — Motor de tareas durable

<<<<<<< HEAD
> v2 · 2026-10-04 · Estado: audited-deep
> Fuente: repodump worker.ts, service.ts, db.ts, código real tras bloques 01-09

## Ontología

TaskWorker, leaseId, leaseUntil, heartbeat, ctx.checkpoint, ctx.guard(), LostLeaseError, AgentTask.status, AgentTask.plan, run-events.

## Estado real

TaskWorker con lease CAS y heartbeat cada leaseMs/3. checkpoint(patch) hace compareAndSwap con { leaseId, status: "running" }. guard() verifica que el lease sigue vivo antes de cada tool. recoverInterruptedTasks() recupera tareas con lease expirado. Plan por defecto según kind (document 5, monitor 3, finance 3, agent 4). settled() al cerrar notifica al owner.

## Evidencia

Los tests de engine.test.ts "two workers claim one task only once", "cancellation invalidates a stale worker", "scheduled tasks wait for due time" pasan. El test "expired leases recover saved checkpoints" timeout a 20s. "pending reviews do not starve queued work" pasa.

## Huecos declarados

- `this.active` sin tope real.
- Sin cuotas por owner en la ejecución.
- Sin cancelación real del handler.
- Sin observabilidad por task como métricas.
- heartbeat no invalida guard cache siempre.

## Huecos profundos (auditoría extendida)

1. **`tick()` corre cada 1s sin backoff**: si la DB está lenta, 1 tick/s es 60 ticks/minuto todos fallando.
2. **`scanByStatus` sin filtro por tenant**: el worker escanea todos los tenants en cada tick. Con 50 tenants son 50× filas.
3. **`eligible.length === 3` hardcodeado**: 3 tareas por tick. Con 1000 tareas queued, tarda 333s en procesarlas.
4. **`MAX_ACTIVE` implementado pero `eligible` todavía limita a 3**: el fix 05-01 sube el límite pero el código deja `eligible.length === 3`. Hmm, ya se subió a 20 en el fix 05-04. Aún así, límite fijo.
5. **`plan` por kind sin detalle**: "Understand the outcome" es vago. El plan no cambia según el input real.
6. **`checkpoint` escribe el plan completo cada vez**: 5 steps + 500 bytes de plan por checkpoint. Con 10 checkpoints por task, 5 KB de escritura.
7. **`run-events` sin tope por task**: una task con 100 eventos acumula 100 filas. `maintain()` los purga a los 90 días, pero la task sigue viva.
8. **`settled` se llama sin verificar que la task no cambió**: entre el último checkpoint y el settled, otro proceso puede haber movido la task.
9. **No hay cancelación de sub-tareas**: una SOP con 50 steps no puede cancelar el step actual a mitad.
10. **`attempts` incrementa en cada `run`, incluso si es un recover**: una task que se recuperó 5 veces tiene attempts=5, sin distinguir recuperaciones de reintentos reales.
11. **`this.active` es un Map sin LRU**: con 50 tasks concurrentes y 500 liberadas, el Map crece sin límite hasta que el proceso termina.
12. **Sin timeout por task**: una task colgada puede durar 5 minutos sin abort. `leaseMs` es 60s, pero el handler no lo respeta.
13. **`worker.stop()` espera sin timeout**: si un handler está colgado, el shutdown nunca termina.
14. **`heartbeat` con `leaseMs/3` fijo**: con lease de 60s, heartbeat cada 20s. Si el DB tarda 21s, se pierde el lease.
15. **`recoverInterruptedTasks` sin notificar**: cuando recupera una task, no emite evento. El operador no lo sabe.
16. **Sin `task.metrics.lastRunDuration`**: no se persiste cuánto duró la última ejecución. Debug imposible.
17. **`scanByStatusWithCursor` sin validación del cursor**: si el cursor es inválido, salta silenciosamente al inicio.
18. **Sin "task takeover"**: si un worker muere y otro quiere tomar su task, no hay protocolo explícito. Solo funciona por el lease expirado.
19. **`plan` se puede modificar en runtime por el handler**: `ctx.checkpoint({plan})` cambia el plan sin auditoría.
20. **`run-events` sin `correlationId`**: cada evento no lleva el id de la request que lo generó.

## Interrelación

Corazón. Comparte worker.ts con 03, db.ts con 04 y 07. Depende de 08.

## Riesgos

Lease expira mientras el handler hace operación larga → duplicación de efecto. checkpoint falla → tarea inconsistente. this.active crece sin control.

## Tipo de fixes

Guard que verifique abort de operación externa cuando el lease se pierde. Tope real de concurrencia. Métrica task_duration_seconds. Test de crash-recovery. Retry con backoff a nivel de task. Timeout por task. Backoff del tick. Cursor validation. Audit del plan.
=======
> v1 · 2026-10-04 · Estado: audited
> Fuente: repodump apps/server/src/engine/worker.ts, service.ts

## Ontología del área

Conceptos: `TaskWorker`, `leaseId`, `leaseUntil`, `heartbeat`,
`ctx.checkpoint`, `ctx.guard()`, `LostLeaseError`, `AgentTask.status`,
`AgentTask.plan`, `run-events`.

Es el corazón del sistema: todo lo que sea "trabajo en background" pasa por
aquí.

## Estado real del código

- `TaskWorker` con lease CAS y heartbeat cada `leaseMs/3`.
- `checkpoint(patch)` hace `compareAndSwap` con `{ leaseId, status: "running" }`.
- `guard()` verifica que el lease sigue vivo antes de cada tool.
- `recoverInterruptedTasks()` recupera tareas con lease expirado.
- Plan por defecto según `kind`: document (5 pasos), monitor (3), finance (3),
  agent (4).
- `settled()` al cerrar notifica al owner.

## Evidencia

- Los tests de `engine.test.ts` que prueban "two workers claim one task only
  once", "cancellation invalidates a stale worker", "scheduled tasks wait
  for due time" **pasan**.
- El test "expired leases recover saved checkpoints after the database
  restarts" **timeout a 20s**.
- El test "pending reviews do not starve queued work" **pasa**.
- **No hay tests de `Promise.all` con 2000 tareas**.

## Huecos concretos

- **`this.active` sin tope real**. Aunque cada tick mete 3, con tareas
  largas (5 min) y poll 1s, `active` puede acumular cientos.
- **No hay cuotas por owner en la ejecución**. Sí en `createTask` (100 activas),
  pero el worker no las aplica.
- **No hay cancelación real del handler**. `abort()` mata el `AbortController`,
  pero un `fetch` con timeout de 45s no siempre respeta el abort.
- **No hay observabilidad por task**: `task.started`, `task.step`,
  `task.finished` solo como `run-events`, no como métricas.
- **El `heartbeat` no invalida el guard cache siempre**. Hay un `invalidateGuard()`
  pero depende del timing.

## Interrelación

- Es el corazón. Llama a `executeModelTask`, `sopExecutor`, `document`,
  `observe`, `finance`.
- Comparte `worker.ts` con `03-resiliencia`, `db.ts` con `04` y `07`.
- Depende de `08-bus-de-eventos` para emitir `task.*`.

## Riesgos

- Que el lease expire mientras el handler hace una operación larga y otro
  worker tome la tarea. **Duplicación de efecto**.
- Que `checkpoint` falle y la tarea quede en estado inconsistente.
- Que `this.active` crezca sin control.

## Tipo de fixes

1. Guard en `checkpoint` y `guard` que verifique que la operación externa
   se abortó cuando el lease se perdió.
2. Tope real de concurrencia (`MAX_ACTIVE` global).
3. Métrica `openmuse_task_duration_seconds{kind,status}`.
4. Test de crash-recovery.
5. Retry con backoff a nivel de task.
>>>>>>> fix/wave-01-learning-in-pkg
````

## File: docs/audits/05-motor-tareas-durable/roadmap.md
````markdown
<<<<<<< HEAD
# Roadmap — 05 motor de tareas durable

> v1 · 2026-10-04 · Estado: planned

## 1. Promesa del repo
Una tarea sobrevive reinicios, no se duplica, no se pierde.

## 2. Estado verificado
- TaskWorker con lease CAS, heartbeat, checkpoint.
- recoverInterruptedTasks al arrancar.
- Fuente: repodump worker.ts, service.ts.

## 3. Huecos contra producción
- this.active sin tope real.
- Sin cuotas por owner en ejecución.
- Sin cancelación real del handler.
- Sin métricas de task.

## 4. Objetivo
Cobertura 100% de casos de lease expirado sin duplicar efecto. Tope real
de concurrencia.

## 5. Fronteras
- No Kafka.
- No sharding entre procesos.

## 6. Conexiones
- Depende de: 08.
- Dependen de esta: 03, 06, 22, 24.
- Archivos compartidos: worker.ts, service.ts, db.ts.

## 7. Principios del PRODUCT.md
Tareas durables.

## 8. Cómo se verifica el cierre
- Test: matar el proceso a mitad, reiniciar, la tarea continúa.
- Tope MAX_ACTIVE respetado con 100 tareas largas.
- Métrica task_duration_seconds visible.
=======
# Roadmap — motor-tareas-durable

> v1 · 2026-10-04 · Estado: placeholder

Se rellena cuando se decida atacar esta rama.

## 1. Promesa del repo
## 2. Estado verificado
## 3. Huecos contra produccion
## 4. Objetivo y sub-objetivos
## 5. Fronteras
## 6. Conexiones con otras ramas
## 7. Principios del PRODUCT.md que toca
## 8. Como se verifica el cierre
>>>>>>> fix/wave-01-learning-in-pkg
````

## File: docs/audits/05-motor-tareas-durable/ux-2026-10-06.md
````markdown
# UX y clasificación — sesión de uso real 2026-10-06

> v1 · 2026-10-06 · Estado: aplicado
> Desviación corta del ciclo para arreglar 4 bugs vistos en uso real.
> Origen: el usuario arrancó el repo, creó una tarea y la vio fallar sin explicación.

## Bugs vistos en uso real

1. **Clasificación de `kind` errónea.**
   El usuario pidió "generar 10 versiones del correo comercial". El LLM clasificó la tarea como `kind: "document"` en vez de `"agent"`. La tarea falló porque `document` requiere un email con PDF adjunto.

2. **Tarea falla sin motivo visible.**
   El modal de detalle de tarea muestra plan y eventos, pero no el campo `task.error`. El usuario tuvo que preguntar al LLM para saber por qué falló.

3. **Sin validación temprana de `kind: "document"`.**
   `createTask` acepta `kind: "document"` sin verificar `input.messageId`. La validación ocurre tarde, dentro de `document()`.

4. **Rate limit del proveedor llega crudo.**
   Cuando Gemini responde con "high demand", el chat muestra el mensaje en inglés del proveedor en vez de un mensaje humano.

## Fixes aplicados

| Marca | Archivo | Descripción |
|-------|---------|-------------|
| (sin marca) | apps/server/src/engine/conversation.ts | Reescrita la descripción de `delegate_task` con lista explícita de cuándo usar cada `kind`. `agent` como default. |
| VALIDATE_DOCUMENT_KIND_V1 | apps/server/src/engine/service.ts | `createTask` rechaza `kind: "document"` sin `input.messageId` (422). |
| TASK_ERROR_VISIBLE_V1 | apps/web/src/components/TaskDetailModal.tsx | Cuando la tarea falla, el modal muestra `task.error` en un bloque visible. |
| RATE_LIMIT_HUMAN_MESSAGE_V1 | apps/server/src/engine/conversation.ts | El `RUN_ERROR` traduce saturaciones y errores de API key a mensajes humanos en español. |

## Estado

- Aplicados.
- Pendiente: typecheck tras los fixes.
- Pendiente: verificar en uso real.

## Notas

- No es del audit oficial del bloque 05. Es una sesión de uso real.
- El bloque 05 vuelve al ciclo normal cuando toque.
- Este doc se deja como referencia de qué se tocó y por qué.
````

## File: docs/audits/06-aprobaciones-acciones/miniaudit.md
````markdown
# 06 — Aprobaciones / acciones

<<<<<<< HEAD
> v2 · 2026-10-04 · Estado: audited-deep
> Fuente: repodump actions.ts, actions-deferred.ts, engine/routes.ts, ApprovalModal.tsx, código real tras bloques 01-09

## Ontología

ActionProposal, ActionService, propose, decide, hash, expiresAt, idempotencyKey, outcome_unknown, DeferredActions, signers, needed, executeAt.

## Estado real

ActionService.propose con hash SHA-256 y expiresAt 30 min. decide con compareAndSwap sobre status. ActionProposal con 9 estados. DeferredActions con undo de 8s y dualAt para doble firma.

## Evidencia

Los 12 tests de actions.test.ts pasan (approve, deny, expired, disconnected, concurrent, outcome_unknown, idempotent replay, review con version). Los 6 de deferred-actions.test.ts pasan.

## Huecos declarados

- Reconciliación de outcome_unknown desde la UI.
- Doble firma configurable expuesta.
- Undo de 8s integrado en UI.
- Auditoría visual.
- Reintento controlado.

## Huecos profundos (auditoría extendida)

1. **`propose` con `idempotencyKey` usa `hash(key)` como id**: dos proposals con la misma key en tenants distintos colisionan. Falta prefijo de tenant.
2. **`hash` del payload no incluye `connectionId`**: si el usuario cambia de cuenta Google, el hash sigue siendo el mismo pero la acción cambia de cuenta.
3. **`expiresAt` de 30 min hardcodeado**: no configurable por tenant.
4. **`decide("deny")` es CAS pero no incrementa attempts**: no hay penalización por denegar repetido.
5. **`decide` no permite "reabrir" una acción denegada**: una vez denegada, se crea una nueva.
6. **Sin edición de una acción propuesta**: si el usuario quiere cambiar el subject del email antes de aprobar, tiene que denegar y volver a proponer.
7. **`ApprovalModal` no muestra `expiresAt`**: el usuario no sabe cuándo expira la propuesta.
8. **`ApprovalModal` no muestra `hash`**: cuando cambia, no hay forma de verlo.
9. **Sin historial de acciones en el chat**: la propuesta aparece y desaparece. No hay contexto de "hace 3 días aprobé X".
10. **`DeferredActions.decide` con `dualAt` fijo por proceso**: `config.deferredAction.dualAt` no se usa, es un parámetro del constructor.
11. **`signers` no valida que sea el mismo usuario firmando dos veces con distinto id**: cualquier id sirve.
12. **`executeAt` con `windowMs` de 8s no es configurable por tenant**: hardcodeado.
13. **Sin "notificar al firmante X"**: la propuesta no avisa a los co-firmantes.
14. **`outcome_unknown` no se reconcilia automáticamente**: el job de maintain detecta "executing > 10 min" pero no consulta al proveedor.
15. **Sin "acción preparada por rol"**: `prepare` no guarda qué rol propuso la acción.
16. **`action.failed` no distingue error de negocio vs error de infra**: ambos van al mismo estado.
17. **Sin `retries` explícito**: cuando una acción falla, ¿cuántas veces se puede reintentar? Hoy 0.
18. **`action-audit` no se expone en la UI**: el endpoint existe pero el front no lo consume.
19. **Sin "acción programada visible"**: cuando una acción pasa a `scheduled`, no hay una vista del "va a ejecutarse en 5s".
20. **Sin "cancelar acción en curso"**: una vez ejecutando, no se puede cancelar.

## Interrelación

Depende de 05. Comparte actions.ts con 14, 22, 23. Depende de 08.

## Riesgos

Acción en executing para siempre. Dos usuarios aprueban y ejecuta dos veces. Usuario no ve botón de reconciliar.

## Tipo de fixes

Endpoint POST /api/actions/:id/reconcile. ApprovalModal con outcome_unknown. undoMs y dualAt expuestos por tenant. Test de aprobación concurrente extendido. Métrica outcome_unknown_total. Edición de propuesta. Notificación a firmantes. Config por tenant.
=======
> v1 · 2026-10-04 · Estado: audited
> Fuente: repodump apps/server/src/actions.ts, actions-deferred.ts

## Ontología del área

Conceptos: `ActionProposal`, `ActionService`, `propose`, `decide`, `hash`,
`expiresAt`, `idempotencyKey`, `outcome_unknown`, `DeferredActions`,
`signers`, `needed`, `executeAt`.

Es el segundo corazón: todo lo externo (email, calendar, drive, WhatsApp,
Stripe, GMB) pasa por aquí.

## Estado real del código

- `ActionService.propose(owner, raw, idempotencyKey, taskId)` con hash
  SHA-256 y `expiresAt` 30 min.
- `decide(owner, id, hash, decision)` con `compareAndSwap` sobre `status`.
- `ActionProposal.status` con 9 estados: `awaiting_review`, `scheduled`,
  `executing`, `succeeded`, `failed`, `outcome_unknown`, `denied`,
  `cancelled`, `expired`.
- `actions-deferred.ts` con `DeferredActions` para undo de 8s, con
  `dualAt` para doble firma.

## Evidencia

- Los 12 tests de `actions.test.ts` **pasan**. Cubren:
  - "denying a persisted proposal never calls its adapter".
  - "concurrent approval consumes the proposal only once".
  - "wrong owner and stale hash cannot approve".
  - "expired and disconnected proposals never reach the provider".
  - "uncertain writes retain uncertainty and cannot be retried".
  - "another service instance sees persisted proposals".
  - "account switching and reconnecting invalidate a prepared action".
  - "review stores authoritative calendar details and binds execution".
  - "idempotent proposal replay returns a completed action".
  - "concurrent idempotent proposals retain a single persisted review".
  - "an expired stale review cannot overwrite a concurrently executing action".
- Los 6 tests de `deferred-actions.test.ts` **pasan**.
- `waiting_approval` se maneja en el worker (ver `engine.test.ts`).
- **No hay tests de la UI de ApprovalModal**.

## Huecos concretos

- **Reconciliación de `outcome_unknown` desde la UI**. Hoy
  `recoverInterruptedActions` marca el estado al arrancar, pero el usuario
  no ve un botón "ya lo revisé".
- **Doble firma configurable** expuesta por tenant. Existe `dualAt` en
  `actions-deferred.ts` pero no está expuesto en el endpoint.
- **Undo de 8s integrado en la UI**. El cliente no ve countdown.
- **Auditoría visual** de quién aprobó qué.
- **Reintento controlado**. Si una acción falla, no hay endpoint para reintentar.

## Interrelación

- Depende de `05-motor-tareas-durable` (el worker crea la acción y espera).
- Comparte `actions.ts` con `14-google-drive-gmail`, `22-google-drive-gmail`
  (antes 22 era otra), `23-whatsapp-stripe-gmb`.
- Depende de `08-bus-de-eventos` para emitir `action.*`.

## Riesgos

- Que una acción quede en `executing` para siempre (crash antes de escribir
  el resultado).
- Que dos usuarios aprueben la misma acción y se ejecute dos veces (el CAS
  lo previene, pero hay que verificar con test extendido).
- Que el usuario no vea el botón de reconciliar `outcome_unknown`.

## Tipo de fixes

1. Endpoint `POST /api/actions/:id/reconcile` con body
   `{ outcome: "was_executed" | "was_not_executed" }`.
2. `ApprovalModal` que muestre `outcome_unknown` con el botón.
3. `undoMs` y `dualAt` expuestos por tenant.
4. Test de aprobación concurrente extendido a 10.
5. Métrica `openmuse_action_outcome_unknown_total`.
>>>>>>> fix/wave-01-learning-in-pkg
````

## File: docs/audits/06-aprobaciones-acciones/roadmap.md
````markdown
<<<<<<< HEAD
# Roadmap — 06 aprobaciones y acciones

> v1 · 2026-10-04 · Estado: planned

## 1. Promesa del repo
Nada externo se ejecuta sin aprobación humana.

## 2. Estado verificado
- ActionService con hash, expiresAt, idempotencyKey.
- 9 estados en ActionProposal.
- DeferredActions con undo de 8s.
- Fuente: repodump actions.ts, actions-deferred.ts.

## 3. Huecos contra producción
- outcome_unknown sin reconciliación UI.
- Doble firma no expuesta.
- Undo de 8s no visible.
- Auditoría visual incompleta.
- Sin endpoint de reintento.

## 4. Objetivo
100% de acciones externas con aprobación. outcome_unknown reconciliable
en <1 minuto.

## 5. Fronteras
- No firma criptográfica compleja.
- No multi-nivel de aprobación.

## 6. Conexiones
- Depende de: 05.
- Dependen de esta: 14, 22, 23.
- Archivos compartidos: actions.ts, service.ts.

## 7. Principios del PRODUCT.md
SOPs con aprobaciones.

## 8. Cómo se verifica el cierre
- Endpoint POST /api/actions/:id/reconcile.
- ApprovalModal muestra outcome_unknown con botón.
- Test de aprobación y rechazo por acción.
=======
# Roadmap — aprobaciones-acciones

> v1 · 2026-10-04 · Estado: placeholder

Se rellena cuando se decida atacar esta rama.

## 1. Promesa del repo
## 2. Estado verificado
## 3. Huecos contra produccion
## 4. Objetivo y sub-objetivos
## 5. Fronteras
## 6. Conexiones con otras ramas
## 7. Principios del PRODUCT.md que toca
## 8. Como se verifica el cierre
>>>>>>> fix/wave-01-learning-in-pkg
````

## File: docs/audits/07-aislamiento-multi-tenant/roadmap.md
````markdown
<<<<<<< HEAD
# Roadmap — 07 aislamiento multi-tenant

> v1 · 2026-10-04 · Estado: planned

## 1. Promesa del repo
Un tenant no ve a otro. Un deployment por cliente.

## 2. Estado verificado
- TenantScopedStore con peel y scanByOwnerPrefix.
- 2 ocurrencias prohibidas de "default".
- Fuente: repodump db-tenant.ts, db-rls.ts,
  docs/audits/_prep/audit-tenant-default.txt.

## 3. Huecos contra producción
- RLS no activa por defecto.
- service.ts con scans globales.
- Files y Rag con db crudo en algunos callers.
- Cache de 5 min de TenantService.
- Sin test de 50 tenants concurrentes.

## 4. Objetivo
Cero fugas verificables con 50 tenants concurrentes.

## 5. Fronteras
- No tenant por subdominio todavía.

## 6. Conexiones
- Depende de: 16.
- Dependen de esta: 04, 05.
- Archivos compartidos: db.ts, db-tenant.ts, db-rls.ts, service.ts.

## 7. Principios del PRODUCT.md
Memoria curada.

## 8. Cómo se verifica el cierre
- Test con 50 tenants concurrentes.
- 0 ocurrencias prohibidas de "default".
- RLS activa con MULTI_TENANT_SHARED=true.
=======
# Roadmap — aislamiento-multi-tenant

> v1 · 2026-10-04 · Estado: placeholder

Se rellena cuando se decida atacar esta rama.

## 1. Promesa del repo
## 2. Estado verificado
## 3. Huecos contra produccion
## 4. Objetivo y sub-objetivos
## 5. Fronteras
## 6. Conexiones con otras ramas
## 7. Principios del PRODUCT.md que toca
## 8. Como se verifica el cierre
>>>>>>> fix/wave-01-learning-in-pkg
````

## File: docs/audits/08-bus-de-eventos/miniaudit.md
````markdown
# 08 — Bus de eventos

<<<<<<< HEAD
> v2 · 2026-10-04 · Estado: audited-deep
> Fuente: repodump engine/events/*, código real tras bloques 01-09

## Ontología

SystemEvent, SystemEventType, EventBus, EventSink, EventQuery, dedupeKey, correlationId, causationId.

## Estado real

EventBus.emit con Zod. 41 tipos en SYSTEM_EVENT_TYPES. StoreSink append-only con insertIfAbsent. StoreQuery.recent con filtros; aggregate con GROUP BY. dedupeKey opcional con TTL 60s.

## Evidencia

Los tests "todo SystemEventType tiene schema y payload", "EventBus.emit no lanza con ningun tipo", "todo SystemEventType aparece en algun bus.emit" pasan. No hay SSE en vivo. Solo polling cada 5s.

## Huecos declarados

- Sin SSE.
- Solo ReactionEngine lo lee.
- Retención uniforme 90 días.
- Faltan índices para agregados.

## Huecos profundos (auditoría extendida)

1. **`ulid` no expone `timestampOf(id)`**: para ordenar por ULID hace falta parsear el id manualmente.
2. **`dedupeKey` sin TTL variable**: siempre 60s. Un evento de "task status changed" puede repetirse en <60s y perderse.
3. **`dedupe-state` sin límite por owner**: LRU de 64 entradas. Con 100 eventos/s, se pierden claves.
4. **`emit` fire-and-forget con catch silencioso**: si el sink falla, nadie se entera. Debería incrementar un contador.
5. **`StoreSink.write` no valida tenantId**: cualquier tenantId vale. Un bug puede contaminar otro tenant.
6. **`StoreQuery.recent` filtra en memoria**: trae todos los eventos del owner y filtra por tipo/since. Con 100.000 eventos, es lento.
7. **`StoreQuery.recent` con `limit` tope 200**: con 1000 eventos por hora, solo se ven 200. Paginación real necesaria.
8. **`aggregate` con `GROUP BY` sin índice**: cada llamada escanea toda la tabla del owner.
9. **Sin `sinceId` en `recent`**: el cliente no puede hacer polling incremental eficiente.
10. **Sin `system-events` en el índice compuesto `(owner, kind, updated_at)`**: el índice existe pero no filtra por tipo. El agregado sigue lento.
11. **`schema-registry.ts` no se usa en runtime**: solo valida al emitir pero no se expone el registro. `GET /schemas` no lo consume.
12. **`payloadSchemas` con `Record<SystemEventType, ZodTypeAny>`**: si se añade un tipo sin schema, TS falla pero runtime no.
13. **Sin `causationId` consistente**: los emisores rara vez lo pasan. Sin cadena causal real.
14. **Sin `correlationId` propagado automáticamente**: cada emisor lo pasa o no. Inconsistente.
15. **`EventBus` sin dedupe por defecto**: los emisores tienen que acordarse de pasar dedupeKey. Ruido en `system-events`.
16. **Sin "replay" endpoint**: no hay forma de reprocesar eventos históricos.
17. **Sin "snapshot del bus" endpoint**: el operador no puede ver el estado agregado.
18. **Sin `BusSink` alternativo (Kafka, OTel)**: solo StoreSink. Frontera declarada pero sin stub funcional.
19. **Sin test de 1000 eventos/s**: no hay test de estrés del bus.
20. **Sin retención por tipo aplicada**: `retention.ts` existe tras fix 08-03 pero `maintain()` no lo usa hasta fix 08-14.

## Interrelación

Transversal. Alimenta 02, 09, 12.

## Riesgos

system-events crece sin tope. dedupeKey olvidado. Evento escrito y nadie lo lee.

## Tipo de fixes

GET /api/events/stream con SSE. Retención por tipo. Test de dedupe por tipo. Índices para agregados. `sinceId` en recent. `causationId` consistente. Dedupe por defecto. Replay endpoint. Snapshot endpoint. Sink alternativo stub.
=======
> v1 · 2026-10-04 · Estado: audited
> Fuente: repodump engine/events/*

## Ontología del área

Conceptos: `SystemEvent`, `SystemEventType`, `EventBus`, `EventSink`,
`EventQuery`, `dedupeKey`, `correlationId`, `causationId`.

Es la columna vertebral de la observabilidad, del kernel cognitivo, de las
reacciones y de las notificaciones.

## Estado real del código

- `EventBus.emit(owner, type, source, payload, options)` con Zod.
- 41 tipos de evento en `SYSTEM_EVENT_TYPES`.
- `StoreSink` append-only con `insertIfAbsent`.
- `StoreQuery.recent` con filtros; `aggregate` con `GROUP BY` en SQL.
- `dedupeKey` opcional con TTL 60s.

## Evidencia

- El test `todo SystemEventType tiene schema y un payload minimo valido`
  **pasa**.
- El test `EventBus.emit no lanza con ningun tipo del enum` **pasa** (con
  background_failure de `action.deferred`, `action.cancelled`, `view.resolved`
  hasta el fix de este pase).
- El test `todo SystemEventType del enum aparece en algun bus.emit del repo`
  **pasa**.
- **No hay SSE en vivo**. Solo polling en `useLiveActivity`.

## Huecos concretos

- **SSE en vivo**. Hoy solo `GET /api/events` con polling cada 5s.
- **Consumidores reales**. Hoy solo `ReactionEngine` lo lee. `Meta`,
  `observability` podrían consumirlo.
- **Retención por tipo**. 90 días para todos.
- **Índices adicionales**. `records(kind, data->>'type', updated_at)`.

## Interrelación

- Transversal.
- Comparte `db.ts` con `04`, `05`, `07`.
- Alimenta `02-observabilidad`, `09-kernel-cognitivo`, `12-contexto-memoria`.

## Riesgos

- Que `system-events` crezca sin tope.
- Que el `dedupeKey` se olvide en sitios críticos.
- Que un evento se escriba pero nadie lo lea.

## Tipo de fixes

1. `GET /api/events/stream` con SSE.
2. Retención por tipo: `task.*` 90d, `policy.*` 30d, `agent.*` 7d.
3. Test que verifique que cada tipo con `dedupeKey` no se duplica.
4. Índices para agregados rápidos.
>>>>>>> fix/wave-01-learning-in-pkg
````

## File: docs/audits/08-bus-de-eventos/roadmap.md
````markdown
<<<<<<< HEAD
# Roadmap — 08 bus de eventos

> v1 · 2026-10-04 · Estado: planned

## 1. Promesa del repo
Cada acción del sistema se registra y se puede reconstruir.

## 2. Estado verificado
- EventBus con Zod, 41 tipos, dedupe con TTL 60s.
- StoreSink append-only, StoreQuery con aggregate en SQL.
- Fuente: repodump engine/events/*.

## 3. Huecos contra producción
- Sin SSE en vivo (solo polling).
- Solo ReactionEngine lo lee.
- Retención uniforme 90 días.
- Faltan índices para agregados.

## 4. Objetivo
SSE en vivo. Consumidores reales además de ReactionEngine. Retención por
tipo.

## 5. Fronteras
- No Kafka ni OTel todavía.

## 6. Conexiones
- Transversal.
- Dependen de esta: 02, 09, 12.
- Archivos compartidos: engine/events/*, db.ts.

## 7. Principios del PRODUCT.md
Kernel cognitivo.

## 8. Cómo se verifica el cierre
- GET /api/events/stream con SSE.
- 3 consumidores reales del bus.
- Test de dedupe por tipo.
=======
# Roadmap — bus-de-eventos

> v1 · 2026-10-04 · Estado: placeholder

Se rellena cuando se decida atacar esta rama.

## 1. Promesa del repo
## 2. Estado verificado
## 3. Huecos contra produccion
## 4. Objetivo y sub-objetivos
## 5. Fronteras
## 6. Conexiones con otras ramas
## 7. Principios del PRODUCT.md que toca
## 8. Como se verifica el cierre
>>>>>>> fix/wave-01-learning-in-pkg
````

## File: docs/audits/10-fast-slow-llm/miniaudit.md
````markdown
# 10 — Fast / slow LLM

<<<<<<< HEAD
> v2 · 2026-10-04 · Estado: audited-deep
> Fuente: repodump kernel/config/*, conversation.ts, model.ts, model-chain.ts, código real

## Ontología

TenantConfig, ProviderSpec, fast, slow, embeddings, EnvTenantConfigResolver, modelChain, runWithModelFallback, KernelContext.

## Estado real

EnvTenantConfigResolver lee FAST_LLM_* y SLOW_LLM_*. TenantConfig con fast, slow, embeddings. conversation.ts usa el fast (fix de este pase). modelChain con fallback global.

## Evidencia

model.ts no usa el slow. executeModelTask usa modelChain(config), no TenantConfig.slow. recordUsage guarda source pero no velocidad. Sin fallback cruzado.

## Huecos declarados

- model.ts no usa el slow.
- Cuotas por velocidad.
- Fallback cruzado.
- Elección por complejidad (hoy regex).

## Huecos profundos (auditoría extendida)

1. **`modelChain(config)` ignora el tenant config**: lee solo `config.model` global. El tenant no puede tener su propio modelo.
2. **`TenantConfig.fast` y `.slow` sin validación al arrancar**: si la apiKey está vacía, el error aparece en el primer mensaje, no al arrancar.
3. **`EnvTenantConfigResolver` lee envs cada vez**: no cachea. Con 100 turns/min, 100 lecturas de process.env.
4. **Sin caché de TenantConfig por tenant**: cada llamada a `kernel.config(ctx)` recalcula el objeto completo.
5. **Sin fallback fast → slow**: si el fast falla, salta al global, no al slow del tenant.
6. **Sin fallback slow → global**: si el slow falla, salta al global, no al fast del tenant.
7. **Sin medición de latencia por velocidad**: `recordUsage` no distingue fast vs slow. Métricas agregadas sin sentido.
8. **Sin cuotas por velocidad**: un tenant con cuota agotada en fast puede seguir usando slow.
9. **`shouldDelegateToSlow` con regex**: `/(analiza|investiga|prepara|resume|planifica|revisa|compara|estudia|calcula)/i`. Se olvida de idiomas y de contexto.
10. **Sin "cambio dinámico de modelo"**: no se puede empezar en fast y pasar a slow a mitad del turno si el fast no puede resolverlo.
11. **`provider-spec.ts` valida pero el resolver no parsea**: `providerEnv` cae a `"google"` silenciosamente si el valor es raro.
12. **Sin `baseUrl` por tenant**: `providerSpecSchema` lo soporta pero el resolver no lo lee del env.
13. **Sin "modelo por rol"**: un rol podría preferir un modelo distinto (ej. legal usa uno más caro). No implementado.
14. **`fastIdleMs` no se usa en conversation.ts**: `TenantConfig.fastIdleMs` declarado pero el chat no lo consulta.
15. **`quiescenceMs` no se usa en closeTurn**: `TenantConfig.quiescenceMs` declarado pero el kernel no lo aplica al cerrar turnos.
16. **`slowLongMs` no se usa en Meta**: `TenantConfig.slowLongMs` declarado pero Meta usa `longNoOutputMs` hardcodeado.
17. **`maxThoughtsPerTurn` no se usa en StoreTurnStore**: `TenantConfig.maxThoughtsPerTurn` declarado pero el store usa `MAX_THOUGHTS_PER_TURN` constante.
18. **Sin "modo degradado"**: si ambos modelos fallan, el chat devuelve un error técnico, no un mensaje humano.
19. **Sin test de que un tenant con config propia funciona**: no hay test que verifique que el fast del tenant se usa.
20. **`embeddings` en TenantConfig sin usar**: `TenantConfig.embeddings` declarado pero `RagService` usa `process.env.GEMINI_API_KEY` directo.
=======
> v1 · 2026-10-04 · Estado: audited
> Fuente: repodump kernel/config/*, conversation.ts, model.ts

## Ontología del área

Conceptos: `TenantConfig`, `ProviderSpec`, `fast`, `slow`, `embeddings`,
`EnvTenantConfigResolver`, `modelChain`, `runWithModelFallback`.

## Estado real del código

- `EnvTenantConfigResolver` lee `FAST_LLM_*` y `SLOW_LLM_*` con defaults
  a Gemini.
- `TenantConfig` con `fast`, `slow`, `embeddings` como `ProviderSpec`.
- `conversation.ts` ya usa el fast si está configurado
  (`FIX_CHAIN_FALLBACK_V1`, fix de este pase).
- `modelChain(config)` con fallback global.

## Evidencia

- `model.ts` **no usa el slow**. `executeModelTask` usa `modelChain(config)`,
  no `TenantConfig.slow`. El fast se aplica en `conversation.ts`, el slow
  se ignora.
- `recordUsage` guarda `source: "chat" | "task" | "sop"` pero **no velocidad**.
- No hay fallback cruzado: si el fast falla, no se pasa al slow.

## Huecos concretos

- `model.ts` no usa el slow.
- Cuotas separadas por velocidad.
- Fallback cruzado `fast → slow → global chain`.
- Elección por complejidad: `shouldDelegateToSlow` es regex.
>>>>>>> fix/wave-01-learning-in-pkg

## Interrelación

Transversal a chat y tareas. Los embeddings usan un tercer modelo.

## Riesgos

<<<<<<< HEAD
Fast y slow comparten cuota. Task tarda 5 min en el slow. Fallback oculta fallos reales.

## Tipo de fixes

executeModelTask con KernelContext y TenantConfig.slow. recordUsage con speed. Fallback fast → slow → global. Cache de TenantConfig. Modelo por rol. Wire de los tiempos (fastIdleMs, quiescenceMs, slowLongMs, maxThoughtsPerTurn).
=======
- Fast y slow comparten cuota de Google.
- Una task tarda 5 min en el slow y el usuario piensa que está roto.
- El fallback oculta fallos reales.

## Tipo de fixes

1. `executeModelTask` que consulte `KernelContext` y use `TenantConfig.slow`.
2. `recordUsage` con campo `speed: "fast" | "slow"`.
3. Fallback explícito: `fast → slow → global chain → error`.
4. Test que verifica que una task usa el slow.
5. Métrica `openmuse_llm_calls_total{speed,provider,model,status}`.
>>>>>>> fix/wave-01-learning-in-pkg
````

## File: docs/audits/10-fast-slow-llm/roadmap.md
````markdown
<<<<<<< HEAD
# Roadmap — 10 fast / slow LLM

> v1 · 2026-10-04 · Estado: planned

## 1. Promesa del repo
Dos velocidades con cuotas separadas. El fast habla, el slow trabaja.

## 2. Estado verificado
- EnvTenantConfigResolver lee FAST_LLM_* y SLOW_LLM_*.
- conversation.ts usa el fast (fix de este pase).
- Fuente: repodump kernel/config/*, conversation.ts, model.ts.

## 3. Huecos contra producción
- model.ts no usa el slow.
- recordUsage sin campo velocidad.
- Sin fallback cruzado fast → slow.
- Elección por complejidad es regex.

## 4. Objetivo
Tareas durables usan slow real. Cuotas por velocidad. Fallback explícito
fast → slow → global.

## 5. Fronteras
- No LLM local.

## 6. Conexiones
- Depende de: 09.
- Dependen de esta: 11, 24.
- Archivos compartidos: conversation.ts, model.ts, kernel/config/*.

## 7. Principios del PRODUCT.md
Tareas durables, kernel cognitivo.

## 8. Cómo se verifica el cierre
- Test que verifica que una task usa el slow.
- recordUsage con campo speed.
- Fallback fast → slow → global con mock.
=======
# Roadmap — fast-slow-llm

> v1 · 2026-10-04 · Estado: placeholder

Se rellena cuando se decida atacar esta rama.

## 1. Promesa del repo
## 2. Estado verificado
## 3. Huecos contra produccion
## 4. Objetivo y sub-objetivos
## 5. Fronteras
## 6. Conexiones con otras ramas
## 7. Principios del PRODUCT.md que toca
## 8. Como se verifica el cierre
>>>>>>> fix/wave-01-learning-in-pkg
````

## File: docs/audits/11-chat-con-llm/miniaudit.md
````markdown
# 11 — Chat con LLM

<<<<<<< HEAD
> v2 · 2026-10-04 · Estado: audited-deep
> Fuente: repodump conversation.ts, prompt de tono, código real tras bloques 01-09

## Ontología

ConversationAgent, BuiltInAgent, Presenter, tools (browse_web, search_mail, read_mail_thread, delegate_task, create_briefing, remember_fact, prepare_whatsapp, create_goal, watch_page), urgentBlock.

## Estado real

Prompt con 8 reglas de tono. RAG como system message. urgentBlock de 3 líneas. delegateHint si el prompt parece complejo.

## Evidencia

Presenter no wireado. fullResponse directo al SSE. Historial limitado a 3 mensajes al RAG. Sin feedback durante slow. Sin timeout duro de primera respuesta.

## Huecos declarados

- Wire del Presenter.
- Timeout 2s para el fast.
- Feedback durante slow.
- Fallback visible.

## Huecos profundos (auditoría extendida)

1. **Prompt con 8 reglas de tono nunca se valida**: no hay test que verifique que el LLM respeta el tono. Solo el prompt.
2. **`urgentBlock` siempre inyecta "DELEGACION FORZADA"**: literal en el prompt aunque no aplique. Ruido.
3. **RAG inyectado al último mensaje del usuario**: contamina el mensaje. Debería ir como system.
4. **Historial limitado a 3 mensajes al RAG**: con conversaciones largas, pierde contexto.
5. **Sin "modo claro / oscuro" en el prompt**: no distingue cuando el usuario pide paso a paso vs respuesta directa.
6. **`Tools` sin límite de iteraciones**: `maxSteps: 6` hardcodeado. Un bucle puede agotar los 6 steps sin progreso.
7. **`browse_web` sin política de reintento**: si la primera URL falla, no intenta otra.
8. **`search_mail` sin límite de resultados configurables**: 20 hardcodeado.
9. **`delegate_task` sin visibilidad del estado**: el usuario delega pero no ve el progreso.
10. **`remember_fact` guarda sin deduplicar**: cada vez que el usuario dice algo, se escribe. Aunque sea lo mismo.
11. **Sin "cancelar desde el chat"**: el usuario no puede abortar la respuesta en curso.
12. **Sin "editar y reenviar"**: si la respuesta fue mala, no hay forma de iterar sin perder contexto.
13. **Sin "feedback implícito"**: si el usuario copia la respuesta, ¿fue útil? No se mide.
14. **Sin "chips de sugerencia" contextuales**: los chips son fijos (Resumen, Email, Documento). No se adaptan a la conversación.
15. **`prepare_whatsapp` sin verificar conversación previa**: puede sugerir escribir a alguien con quien ya se habló.
16. **Sin "resumen al cerrar el thread"**: cuando se cierra un thread, no hay summary persistido.
17. **`create_briefing` sin validar que el resumen no sea alucinación**: el LLM puede inventar.
18. **`watch_page` sin notificar al usuario del resultado**: crea monitor pero no avisa cuando dispara.
19. **Sin streaming token a token real**: el typewriter del frontend es simulado sobre el stream completo.
20. **Sin "message.edited" event**: si el usuario edita un mensaje, no hay evento en el bus.

## Interrelación

Puerta de entrada. Depende de 09 y 10.

## Riesgos

Prompt de tono se olvida. RAG mete ruido. Chat lento. Email malicioso se interpreta como instrucción.

## Tipo de fixes

Wire del Presenter. Timeout de 2s al fast. Feedback con SlowAuthor → ProgressEvent. Test de tono. Historial ampliado. Chips contextuales. Resumen al cerrar thread. Streaming real.
=======
> v1 · 2026-10-04 · Estado: audited
> Fuente: repodump conversation.ts, model.ts, prompt de tono

## Ontología del área

Conceptos: `ConversationAgent`, `BuiltInAgent`, `Presenter`, `SystemEvent`,
herramientas de chat: `browse_web`, `search_mail`, `read_mail_thread`,
`delegate_task`, `create_briefing`, `remember_fact`, `prepare_whatsapp`,
`create_goal`, `watch_page`.

## Estado real del código

- Prompt con 8 reglas de tono (no dev, no emojis, no "Perfecto").
- RAG se inyecta como mensaje `system`.
- `urgentBlock` de 3 líneas si hay urgencias.
- `delegateHint` si el prompt parece complejo.

## Evidencia

- `Presenter` **no wireado**. El chat emite `fullResponse` sin pasar por
  Presenter. La UI no se beneficia de la prioridad de roles.
- Historial limitado: solo los últimos 3 mensajes de historial al RAG.
- No hay feedback durante slow.
- No hay timeout duro de primera respuesta.

## Huecos concretos

- Wire del Presenter.
- Timeout de 2s para el fast.
- Feedback durante slow.
- Fallback visible.

## Interrelación

Puerta de entrada al sistema. Depende de `09` (kernel), `10` (velocidades).

## Riesgos

- Prompt de tono se olvida.
- RAG mete ruido.
- Chat lento → usuario piensa caído.
- Email malicioso se interpreta como instrucción.

## Tipo de fixes

1. Wire del Presenter: esperar `presentTurn(ctx, turnId)` antes de emitir.
2. Timeout de 2s al fast; si no responde, emite "dame un momento".
3. Feedback de progreso: `SlowAuthor` → `ProgressEvent` → chat.
4. Test de tono: no "Perfecto", no "Capability", no "Kernel".
>>>>>>> fix/wave-01-learning-in-pkg
````

## File: docs/audits/11-chat-con-llm/roadmap.md
````markdown
<<<<<<< HEAD
# Roadmap — 11 chat con LLM

> v1 · 2026-10-04 · Estado: planned

## 1. Promesa del repo
Responde en <2s, con tono humano, sin alucinar.

## 2. Estado verificado
- Prompt con 8 reglas de tono.
- RAG como system message. urgentBlock de 3 líneas.
- Fuente: repodump conversation.ts.

## 3. Huecos contra producción
- Presenter no wireado.
- Sin timeout duro de primera respuesta.
- Historial limitado a 3 mensajes.
- Sin feedback durante slow.

## 4. Objetivo
El chat respeta al Presenter y responde en <2s o avisa.

## 5. Fronteras
- No streaming de audio.

## 6. Conexiones
- Depende de: 09, 10.
- Archivos compartidos: conversation.ts.

## 7. Principios del PRODUCT.md
Kernel cognitivo, UI servida.

## 8. Cómo se verifica el cierre
- Test de primera respuesta <2s.
- Test de tono: no "Perfecto", no "Capability".
- Presenter decide el texto del SSE.
=======
# Roadmap — chat-con-llm

> v1 · 2026-10-04 · Estado: placeholder

Se rellena cuando se decida atacar esta rama.

## 1. Promesa del repo
## 2. Estado verificado
## 3. Huecos contra produccion
## 4. Objetivo y sub-objetivos
## 5. Fronteras
## 6. Conexiones con otras ramas
## 7. Principios del PRODUCT.md que toca
## 8. Como se verifica el cierre
>>>>>>> fix/wave-01-learning-in-pkg
````

## File: docs/audits/12-contexto-memoria/miniaudit.md
````markdown
# 12 — Contexto / memoria

<<<<<<< HEAD
> v2 · 2026-10-04 · Estado: audited-deep
> Fuente: repodump memory.ts, context/engine.ts, context/assembly.ts, rag.ts, código real

## Ontología

MemoryService, AgentMemory, MemoryCategory, ContextEngine, ContextPackage, RecallResult, RagService, RagChunk, RagHit, IDF.

## Estado real

MemoryService.recall con reformulación de query. ContextEngine.assemble con budget. renderContext pinta rol, entidad, relaciones, eventos, RAG y learning (fix de este pase). RagService con coseno + BM25 sin IDF.

## Evidencia

computeIdf, bm25WithIdf, computeAvgLen exportados pero search usa bm25Score sin IDF. budget.ts existe pero renderContext no lo aplica. learning ya se pinta (fix de este pase).

## Huecos declarados

- IDF real.
- Memoria jerárquica.
- Olvido selectivo.
- Budget aplicado en renderContext.

## Huecos profundos (auditoría extendida)

1. **`MemoryService.recall` carga hasta 2000 memorias en memoria**: filtra por palabras en JS. Con 5000 memorias, lento.
2. **Reformulación de query con últimos 2 mensajes concatenados**: puede generar queries raras si los mensajes no son coherentes.
3. **`recall` sin filtro por categoría si no se pasa `categories`**: recupera de todas.
4. **`recall` sin filtro por rol si no se pasa `roleId`**: mezcla memorias de todos los roles.
5. **`formatRecall` con tope de 500 chars por memoria**: trunca el texto sin indicar truncamiento.
6. **`searchMemories` con score de "palabras compartidas"**: no usa TF-IDF ni embeddings. Solo substring.
7. **`remember` con dedupe por hash de texto normalizado**: "el cliente prefiere café" y "El Cliente Prefiere Café" colisionan. Correcto, pero pierde distinción de mayúsculas.
8. **`remember` sin validar categoría**: acepta cualquier string, no valida contra `MemoryCategory`.
9. **`dedupMemories` sin tope real**: recorre 5000 memorias y borra duplicados. Si hay 5000 duplicados, 5000 removes.
10. **`retryMissingEmbeddings` con tope de 50 por pasada**: con 10.000 chunks sin embedding, tarda 200 pasadas.
11. **`chunkText` con `CHUNK_SIZE = 900` hardcodeado**: no configurable por tipo de documento.
12. **`RagService.search` con `SEARCH_PAGE_SIZE = 500`**: con 100.000 chunks, 200 páginas por búsqueda.
13. **`searchVector` con cast a `vector(768)` hardcodeado**: si el modelo cambia, falla silenciosamente.
14. **`ingestText` con `maxChunks = 1000` hardcodeado**: un PDF grande se trunca sin aviso.
15. **`ContextEngine.assemble` sin tope de eventos**: carga hasta 20 eventos. Configurable no.
16. **`renderContext` sin ordenar por relevancia**: pinta en orden de carga, no por score.
17. **`learning-facts` sin TTL**: los facts aprendidos crecen sin tope.
18. **Sin "olvido selectivo"**: no hay forma de marcar una memoria como "obsoleta pero mantener histórico".
19. **Sin "jerarquía de memoria"**: todas las memorias son iguales. No hay "memoria de empresa" vs "memoria de cliente".
20. **`MemoryService.remember` sin `source` obligatorio**: se puede crear sin origen. Auditoría rota.

## Interrelación

Cimiento del kernel. Depende de 08, 09.

## Riesgos

RAG devuelve fragmentos irrelevantes. Memoria crece sin tope. learning-facts con ruido.

## Tipo de fixes

IDF real con computeIdf y bm25WithIdf. MemoryService.forget. budget.ts en renderContext. Paginación real de recall. Filtro por categoría y rol. TTL por categoría. Jerarquía de memoria. Source obligatorio.
=======
> v1 · 2026-10-04 · Estado: audited
> Fuente: repodump memory.ts, context/engine.ts, context/assembly.ts, rag.ts

## Ontología

MemoryService, AgentMemory, MemoryCategory, ContextEngine, ContextPackage,
RecallResult, RagService, RagChunk, RagHit, IDF.

## Estado real

MemoryService.recall con reformulación de query. ContextEngine.assemble con
budget. renderContext pinta rol, entidad, relaciones, eventos, RAG, y
learning (fix de este pase). RagService con coseno + BM25 sin IDF.

## Evidencia

computeIdf, bm25WithIdf, computeAvgLen están exportados pero search usa
bm25Score sin IDF. Los términos comunes pesan igual que "acme". budget.ts
existe pero renderContext no lo aplica. learning ya se pinta (fix de este
pase).

## Huecos

IDF real. Memoria jerárquica (tenant, owner, rol, sesión). Olvido selectivo.
Budget aplicado de verdad en renderContext.

## Interrelación

Cimiento del kernel cognitivo. Sin contexto, el LLM alucina. Con contexto
malo, alucina más. Depende de 08 (bus), 09 (kernel).

## Riesgos

RAG devuelve fragmentos irrelevantes. Memoria crece sin tope. learning-facts
se puebla de ruido.

## Tipo de fixes

IDF real: computeIdf sobre el corpus, bm25WithIdf en search.
MemoryService.forget(owner, criteria). budget.ts aplicado en renderContext.
Test que verifica que un fragmento relevante gana a uno irrelevante con IDF.
>>>>>>> fix/wave-01-learning-in-pkg
````

## File: docs/audits/12-contexto-memoria/roadmap.md
````markdown
<<<<<<< HEAD
# Roadmap — 12 contexto y memoria

> v1 · 2026-10-04 · Estado: planned

## 1. Promesa del repo
El agente recuerda lo relevante y olvida lo demás. Memoria curada.

## 2. Estado verificado
- MemoryService con dedupe.
- ContextEngine con budget.
- renderContext pinta learning (fix de este pase).
- Fuente: repodump memory.ts, context/*, rag.ts.

## 3. Huecos contra producción
- IDF real.
- Memoria jerárquica (tenant, owner, rol, sesión).
- Olvido selectivo.
- Budget aplicado en renderContext.

## 4. Objetivo
Memoria curada con relevancia medible. Un hecho se recupera 5 días después.

## 5. Fronteras
- No embeddings locales.

## 6. Conexiones
- Depende de: 08, 09.
- Dependen de esta: 24.
- Archivos compartidos: memory.ts, context/*, rag.ts.

## 7. Principios del PRODUCT.md
Memoria curada.

## 8. Cómo se verifica el cierre
- Test que verifica que un fragmento relevante gana a uno irrelevante
  con IDF.
- MemoryService.forget con TTL probado.
=======
# Roadmap — contexto-memoria

> v1 · 2026-10-04 · Estado: placeholder

Se rellena cuando se decida atacar esta rama.

## 1. Promesa del repo
## 2. Estado verificado
## 3. Huecos contra produccion
## 4. Objetivo y sub-objetivos
## 5. Fronteras
## 6. Conexiones con otras ramas
## 7. Principios del PRODUCT.md que toca
## 8. Como se verifica el cierre
>>>>>>> fix/wave-01-learning-in-pkg
````

## File: docs/audits/13-ui-servida-viewspec/miniaudit.md
````markdown
# 13 — UI servida (ViewSpec)

<<<<<<< HEAD
> v2 · 2026-10-04 · Estado: audited-deep
> Fuente: repodump packages/domain/src/views.ts, engine/views/resolver.ts, routes/views.ts, useViewResolver.ts, código real

## Ontología

RuntimeViewSpec, ViewResolver, intents, readView, computeView. Siete kinds: dashboard, queue, inbox, board, table, detail, form.

## Estado real

ViewResolver con regex de intenciones. runtimeViewSpecSchema con 7 kinds. Endpoint POST /api/views/resolve. useViewResolver en frontend. conversation.ts llama a resolveView en el turno (fix de este pase).

## Evidencia

Los tests de view-resolver.test.ts pasan. Panel contextual recibe el spec pero la UI no lo dibuja en la mayoría de los casos. ChatPanel llama a resolveView cada vez que el usuario escribe, sin cache.

## Huecos declarados

- Intenciones ricas.
- Wiring al chat con cache por thread.
- Panel contextual que se rellene.
- view.resolved al bus.

## Huecos profundos (auditoría extendida)

1. **`registerIntent` no se llama en ningún sitio**: el resolver tiene intenciones registradas solo en tests. En runtime, `resolveView` siempre devuelve `null`.
2. **Sin cache por thread**: cada mensaje del usuario dispara una llamada a `/api/views/resolve`. Con 10 mensajes/min, 10 requests.
3. **`resolveView` con regex case-insensitive sin normalizar acentos**: "factura" matchea, "facturá" no.
4. **Sin cache de specs resueltos**: la misma intención se re-resuelve. No hay LRU.
5. **Sin "el usuario puede elegir vista"**: solo hay resolución automática. El usuario no puede forzar un tipo de vista.
6. **Sin "vista anterior"**: cuando el panel se vacía, no hay historial.
7. **`RuntimeViewSpec` sin `provenance`**: no hay forma de saber de qué intención vino el spec.
8. **Sin validación estricta al servir**: `parseRuntimeViewSpec` valida pero no rechaza specs que pasan el schema pero son incoherentes.
9. **`view.resolved` se emite en conversation.ts (fix 09-15) pero nadie lo consume**: el frontend no lo recibe por SSE.
10. **Sin "preview" de la vista antes de abrirla**: el panel se abre directo, sin confirmación.
11. **Sin "vista por defecto" si no hay intención**: el panel queda vacío con "Escribe en el chat".
12. **Sin "vista persistida por usuario"**: cada sesión empieza de cero.
13. **Sin "vista compartida"**: un usuario no puede pasarle su vista a otro del mismo tenant.
14. **Sin "vista exportable"**: no hay "descargar la tabla como CSV".
15. **`useViewResolver` sin manejo de errores**: si el request falla, no hay retry ni fallback.
16. **Sin "loading state"**: el panel no sabe si está cargando o si no hay spec.
17. **Sin "vista cacheada"**: cada vez que el usuario escribe, se pide de nuevo.
18. **Sin "spec válido mínimo"**: el schema acepta specs vacíos. Un `dashboard` sin KPIs es válido pero inútil.
19. **Sin test de las 20 intenciones reales**: solo hay tests de 4 intenciones mock.
20. **`ViewResolver` con regex en cliente**: el resolver hace regex sobre el texto del usuario. Un usuario con input raro puede colgar el resolver (ReDoS).

## Interrelación

Promesa visual del PRODUCT. Depende de 09, 14.

## Riesgos

Resolver devuelve spec inválido. Panel se abre sin que el usuario lo pida. LLM en el resolver genera specs inesperados.

## Tipo de fixes

Registro de intenciones con regex + palabras clave + entidades. Cache por thread. Test de 20 intenciones. Emitir view.resolved al bus. Loading state. Persistencia por usuario. Exportar a CSV.
=======
> v1 · 2026-10-04 · Estado: audited
> Fuente: repodump packages/domain/src/views.ts, engine/views/resolver.ts,
> routes/views.ts

## Ontología

RuntimeViewSpec, ViewResolver, intents, readView, computeView. Siete kinds:
dashboard, queue, inbox, board, table, detail, form.

## Estado real

ViewResolver con regex de intenciones. runtimeViewSpecSchema con 7 kinds.
Endpoint POST /api/views/resolve. useViewResolver en el frontend.
conversation.ts llama a resolveView en el turno (fix de este pase).

## Evidencia

Los tests de view-resolver.test.ts pasan. El registry test verifica
dashboard, queue y un kind no soportado. Panel contextual recibe el spec
pero la UI no lo dibuja en la mayoría de los casos. ChatPanel llama a
resolveView cada vez que el usuario escribe, sin cache.

## Huecos

Intenciones ricas (no solo regex). Wiring al chat con cache por thread.
Panel contextual que se rellene. Emitir view.resolved al bus.

## Interrelación

Promesa visual del PRODUCT.md. Depende de 09 (kernel), 14 (templates).

## Riesgos

Resolver devuelve spec inválido. Panel se abre sin que el usuario lo pida.
LLM en el resolver genera specs inesperados.

## Tipo de fixes

Registro de intenciones con regex + palabras clave + entidades. Cache por
thread. Test de 20 intenciones. Emitir view.resolved al bus.
>>>>>>> fix/wave-01-learning-in-pkg
````

## File: docs/audits/13-ui-servida-viewspec/roadmap.md
````markdown
<<<<<<< HEAD
# Roadmap — 13 UI servida ViewSpec

> v1 · 2026-10-04 · Estado: planned

## 1. Promesa del repo
El sistema sirve la vista correcta según la intención.

## 2. Estado verificado
- ViewResolver con regex.
- 7 kinds en runtimeViewSpecSchema.
- Endpoint POST /api/views/resolve.
- conversation.ts llama a resolveView (fix de este pase).
- Fuente: repodump packages/domain/src/views.ts,
  engine/views/resolver.ts.

## 3. Huecos contra producción
- Intenciones ricas.
- Wiring al chat con cache por thread.
- Panel contextual que se rellene.
- view.resolved al bus.

## 4. Objetivo
La intención del usuario sirve la vista correcta sin LLM libre.

## 5. Fronteras
- No plantillas dinámicas generadas por LLM.

## 6. Conexiones
- Depende de: 09.
- Dependen de esta: 14.
- Archivos compartidos: resolver.ts, views.ts.

## 7. Principios del PRODUCT.md
UI servida.

## 8. Cómo se verifica el cierre
- Test de 20 intenciones, cada una espera un spec.
- view.resolved emitido al bus.
=======
# Roadmap — ui-servida-viewspec

> v1 · 2026-10-04 · Estado: placeholder

Se rellena cuando se decida atacar esta rama.

## 1. Promesa del repo
## 2. Estado verificado
## 3. Huecos contra produccion
## 4. Objetivo y sub-objetivos
## 5. Fronteras
## 6. Conexiones con otras ramas
## 7. Principios del PRODUCT.md que toca
## 8. Como se verifica el cierre
>>>>>>> fix/wave-01-learning-in-pkg
````

## File: docs/audits/14-templates-reales/miniaudit.md
````markdown
# 14 — Templates reales

<<<<<<< HEAD
> v2 · 2026-10-04 · Estado: audited-deep
> Fuente: repodump apps/web/src/templates/*, view/ViewRenderer.tsx, código real

## Ontología

ViewRenderer, DashboardTemplate, QueueTemplate, placeholders honestos para inbox, board, table, detail, form.

## Estado real

ViewRenderer con assertNever. DashboardTemplate y QueueTemplate reales. Los otros 5 kinds muestran un placeholder honesto.

## Evidencia

De los 7 kinds del schema, solo 2 tienen componente real. No hay tests de render por kind.

## Huecos declarados

- InboxTemplate, BoardTemplate, TableTemplate, DetailTemplate, FormTemplate.
- Test de render por kind.
- assertNever real.

## Huecos profundos (auditoría extendida)

1. **`assertNever` no se usa**: los 5 kinds faltantes caen a un `default` que devuelve un div con texto. No es exhaustividad real.
2. **DashboardTemplate con KPIs hardcodeados**: el spec trae KPIs pero el template no los pinta con formato (currency, percent).
3. **QueueTemplate sin agrupación por columna**: pinta items en lista plana, no por columnId.
4. **Sin soporte de `trend` en KPIs**: `DashboardSpec.kpis[].trend` existe pero el template no lo usa.
5. **Sin soporte de `actions` en QueueSpec**: cada item puede tener hasta 3 actions pero el template solo pinta botones sin onClick.
6. **Sin "estado vacío" en templates**: si el spec no tiene items, se pinta un div vacío sin mensaje.
7. **Sin "loading state"**: los templates reciben spec con datos o sin datos. Sin estado intermedio.
8. **Sin "error state"**: si un campo del spec no cuadra, el template crashea sin boundary.
9. **Sin lazy loading de templates**: todos los templates se importan al cargar la app. Bundle grande.
10. **CSS de templates inline con style={{}}: no hay hoja de estilos dedicada. Duplicación.
11. **Sin "responsive"**: los templates se rompen en móvil.
12. **Sin "dark mode"**: los colores están hardcodeados.
13. **Sin "accessibility"**: sin `role`, sin `aria-*`, sin keyboard navigation.
14. **Sin "focus management"**: al abrir el panel, el foco no va al template.
15. **Sin test de render con spec vacío**: no se prueba el caso de spec sin datos.
16. **Sin test de render con spec lleno**: no se prueba con 100 filas.
17. **Sin "vista de impresión"**: los templates no se pueden imprimir.
18. **Sin "export a PDF"**: no se puede exportar un DashboardSpec a PDF.
19. **Sin "compartir vista"**: un usuario no puede pasar su vista a otro.
20. **`ViewRenderer` recibe `spec: unknown`**: pierde tipado. Debería ser `RuntimeViewSpec | null`.

## Interrelación

Sin templates, la UI servida no muestra nada útil. Depende de 13.

## Riesgos

Spec cambia y template no lo soporta. Template falla con datos vacíos. CSS del template choca con el shell.

## Tipo de fixes

5 componentes. Test de render por kind. assertNever real. Loading/error/empty states. Responsive. Dark mode. Accessibility. Lazy loading.
=======
> v1 · 2026-10-04 · Estado: audited
> Fuente: repodump apps/web/src/templates/*, view/ViewRenderer.tsx

## Ontología

ViewRenderer, DashboardTemplate, QueueTemplate, y placeholders honestos
para inbox, board, table, detail, form.

## Estado real

ViewRenderer con assertNever. DashboardTemplate y QueueTemplate reales.
Los otros 5 kinds muestran un placeholder honesto ("Este tipo de vista se
sirve pero aún no tiene template dedicado").

## Evidencia

De los 7 kinds del schema, solo 2 tienen componente real. Faltan 5. No hay
tests de render por kind.

## Huecos

InboxTemplate, BoardTemplate, TableTemplate, DetailTemplate, FormTemplate.
Test de render por kind con datos mínimos y vacíos. assertNever real que
no se alcance en producción.

## Interrelación

Sin templates, la UI servida no puede mostrar nada útil. Depende de 13.

## Riesgos

Spec cambia y el template no lo soporta. Template falla con datos vacíos.
CSS del template choca con el shell.

## Tipo de fixes

5 componentes. Test de render por kind. assertNever real.
>>>>>>> fix/wave-01-learning-in-pkg
````

## File: docs/audits/14-templates-reales/roadmap.md
````markdown
<<<<<<< HEAD
# Roadmap — 14 templates reales

> v1 · 2026-10-04 · Estado: planned

## 1. Promesa del repo
7 templates cubren el 90% del trabajo de una pyme.

## 2. Estado verificado
- DashboardTemplate y QueueTemplate reales.
- 5 kinds con placeholder honesto.
- Fuente: repodump apps/web/src/templates/*.

## 3. Huecos contra producción
- InboxTemplate, BoardTemplate, TableTemplate, DetailTemplate,
  FormTemplate.
- Sin tests de render por kind.
- assertNever no garantiza exhaustividad.

## 4. Objetivo
Los 7 templates reales.

## 5. Fronteras
- No drag & drop complejo.

## 6. Conexiones
- Depende de: 13.
- Archivos compartidos: templates/*, view/ViewRenderer.tsx.

## 7. Principios del PRODUCT.md
UI servida.

## 8. Cómo se verifica el cierre
- 7 tests de render por kind.
- assertNever real.
=======
# Roadmap — templates-reales

> v1 · 2026-10-04 · Estado: placeholder

Se rellena cuando se decida atacar esta rama.

## 1. Promesa del repo
## 2. Estado verificado
## 3. Huecos contra produccion
## 4. Objetivo y sub-objetivos
## 5. Fronteras
## 6. Conexiones con otras ramas
## 7. Principios del PRODUCT.md que toca
## 8. Como se verifica el cierre
>>>>>>> fix/wave-01-learning-in-pkg
````

## File: docs/audits/15-frontend-react/miniaudit.md
````markdown
# 15 — Frontend React

<<<<<<< HEAD
> v2 · 2026-10-04 · Estado: audited-deep
> Fuente: repodump apps/web/src/*, código real

## Ontología

App, AppShell, SidebarV2, TopBarV2, MessageList, MessageBubble, ContextualPanel, CommandPalette, hooks, templates.

## Estado real

React 18 + Vite + Tailwind + Lucide. MessageList con slice 50. SuggestionChips sin BOM (fix de este pase). App.tsx con AppShell y ContextualPanel.

## Evidencia

Typecheck web limpio. Sin tests de frontend. Sin virtualización real. Sin aria-live en el chat.

## Huecos declarados

- Virtualización real.
- Accesibilidad.
- Estados vacíos honestos.
- Retry visual.
- Lazy loading de templates.

## Huecos profundos (auditoría extendida)

1. **Sin tests de frontend**: 0 tests. Ningún componente tiene cobertura.
2. **`slice 50` en MessageList**: parche para no reventar con 500 mensajes. Con 100, corta los últimos.
3. **Sin virtualización real**: cada mensaje renderiza su DOM. Con 1000, lag.
4. **`aria-live` solo en el chat**: falta en notificaciones, en el panel contextual, en las tareas.
5. **Sin `role="status"` en lugares de estado**: el usuario con lector de pantalla no sabe qué pasa.
6. **Sin focus trap en modales**: el tab va fuera del modal.
7. **Sin `Escape` para cerrar modales**: hay que hacer click fuera.
8. **Sin "skip links"**: navegación con teclado empieza en el logo.
9. **Contraste WCAG AA no verificado**: algunos textos grises sobre blanco no pasan.
10. **Sin `prefers-reduced-motion` en animaciones**: typewriter, cascada, panel slide se activan siempre.
11. **Sin ErrorBoundary global**: si un componente crashea, la app entera se rompe.
12. **Sin ErrorBoundary por vista**: chat vs tasks comparten boundary.
13. **Sin "retry visual" en errores de red**: el usuario ve error pero no puede reintentar.
14. **Sin skeleton screens**: mientras carga, ve "Cargando..." en texto plano.
15. **`ChatPanel` sin manejo de "conexión caída"**: si el SSE cae, el usuario no lo sabe.
16. **Sin "scroll to bottom" automático**: cuando llega un mensaje nuevo, hay que bajar manualmente.
17. **Sin "notificaciones en vivo" sin polling**: `useNotifications` hace polling cada 8s.
18. **Sin "offline mode"**: si la red cae, todo deja de funcionar.
19. **Sin "PWA"**: no se puede instalar en el móvil.
20. **Sin "internacionalización"**: textos hardcoded en español. No hay i18n.

## Interrelación

Cara del sistema. Depende de 13, 14.

## Riesgos

Chat con 500 mensajes a menos de 30fps. Panel rompe layout. Onboarding confuso.

## Tipo de fixes

Virtualización con react-window o slice. aria-live. ErrorBoundary por vista. Lighthouse >85. Tests con Playwright. i18n. PWA. Skeleton. Retry visual.
=======
> v1 · 2026-10-04 · Estado: audited
> Fuente: repodump apps/web/src/*

## Ontología

App, AppShell, SidebarV2, TopBarV2, MessageList, MessageBubble,
ContextualPanel, CommandPalette, hooks (useChat, useTasks, useThreads,
useWorkspaceData, useViewResolver), templates.

## Estado real

React 18 + Vite + Tailwind + Lucide. MessageList con slice 50.
SuggestionChips sin BOM (fix de este pase). App.tsx con AppShell y
ContextualPanel.

## Evidencia

El typecheck web está limpio (typecheck-web.txt exit 0). No hay tests de
frontend (ninguno en tests/*.test.ts toca apps/web). No hay virtualización
real. No hay aria-live en el chat.

## Huecos

Virtualización real en listas largas. Accesibilidad (aria-live, role=status,
focus trap en modales). Estados vacíos honestos. Errores de red con retry
visual. Lazy loading de templates.

## Interrelación

Cara del sistema. Todo lo demás se ve desde aquí. Depende de 13, 14.

## Riesgos

Chat con 500 mensajes a menos de 30fps. Panel contextual rompe el layout.
Onboarding confuso.

## Tipo de fixes

Virtualización con react-window o slice. aria-live="polite" en el chat.
ErrorBoundary por vista. Lighthouse performance >85.
>>>>>>> fix/wave-01-learning-in-pkg
````

## File: docs/audits/15-frontend-react/roadmap.md
````markdown
<<<<<<< HEAD
# Roadmap — 15 frontend React

> v1 · 2026-10-04 · Estado: planned

## 1. Promesa del repo
Una app usable con 500 mensajes y 100 tareas.

## 2. Estado verificado
- React 18 + Vite + Tailwind + Lucide.
- MessageList con slice 50 (fix de este pase).
- SuggestionChips sin BOM (fix de este pase).
- Fuente: repodump apps/web/src/*.

## 3. Huecos contra producción
- Virtualización real en listas largas.
- Accesibilidad (aria-live, role=status, focus trap).
- Estados vacíos honestos.
- Retry visual de red.
- Lazy loading de templates.

## 4. Objetivo
60fps en scroll con 500 mensajes. Lighthouse performance >85.

## 5. Fronteras
- No React Native.

## 6. Conexiones
- Depende de: 13, 14.
- Archivos compartidos: apps/web/src/*.

## 7. Principios del PRODUCT.md
UI servida.

## 8. Cómo se verifica el cierre
- Lighthouse performance >85.
- aria-live="polite" en el chat.
- ErrorBoundary por vista.
=======
# Roadmap — frontend-react

> v1 · 2026-10-04 · Estado: placeholder

Se rellena cuando se decida atacar esta rama.

## 1. Promesa del repo
## 2. Estado verificado
## 3. Huecos contra produccion
## 4. Objetivo y sub-objetivos
## 5. Fronteras
## 6. Conexiones con otras ramas
## 7. Principios del PRODUCT.md que toca
## 8. Como se verifica el cierre
>>>>>>> fix/wave-01-learning-in-pkg
````

## File: docs/audits/16-autenticacion/miniaudit.md
````markdown
# 16 — Autenticación

<<<<<<< HEAD
> v2 · 2026-10-04 · Estado: audited-deep
> Fuente: repodump users.ts, auth.ts, auth-routes.ts, rate-limit.ts, código real

## Ontología

User, UserService, UserRecord, scrypt, session, token, role (admin | user), rate limit, signing key.

## Estado real

UserService con scrypt (64 bytes). Sesiones con SHA-256. Rate limit por IP y email. Rotación de signing key cifrada con AES-256-GCM. auth-routes.ts con login/register/logout/me/users.

## Evidencia

Los 5 tests de auth.test.ts pasan. Rate limit 20 IP, 5 email, 5 min. "login rate limit answers 429 with Retry-After" pasa.

## Huecos declarados

- OIDC / SSO.
- Scopes por rol.
- roleIds: string[].

## Huecos profundos (auditoría extendida)

1. **Sesión sin rotación**: un token válido 7 días no se rota. Si se filtra, vale 7 días.
2. **Sin "remember me"**: no hay opción de "recordar" vs "olvidar" al cerrar el navegador.
3. **Sin "logout de todos los dispositivos"**: el usuario no puede invalidar sus sesiones globalmente.
4. **`scrypt` sin parámetros configurables**: N=16384 hardcodeado. No se puede subir sin tocar código.
5. **Sin pepper en el hash**: si la DB se filtra, atacante puede rainbow tables (aunque scrypt lo hace caro).
6. **Sin validación de fortaleza de contraseña**: acepta "12345678" si tiene 8 chars.
7. **Sin "have i been pwned" check**: no verifica si la contraseña está en filtraciones.
8. **Sin `password_changed_at`**: no se puede invalidar sesiones tras cambio de contraseña.
9. **Sin `last_login_at`**: no se sabe cuándo se conectó un usuario.
10. **Sin `failed_login_count`**: no se bloquea una cuenta tras N intentos (solo rate limit por IP).
11. **Sin 2FA**: no hay TOTP, no hay WebAuthn.
12. **Sin recuperación de contraseña**: si el usuario la olvida, no hay flow.
13. **Sin verificación de email**: el registro no verifica que el email sea real.
14. **`role` de string a roleIds: string[]**: un usuario puede tener varios roles.
15. **`ensureAdmin` solo crea si no hay usuarios**: si hay 1 usuario no-admin, no crea admin.
16. **`verifyCredentials` sin timing-safe compare del hash**: aunque scrypt lo hace, mejor explícito.
17. **Sin "política de contraseñas por tenant"**: no se puede exigir más a unos clientes que a otros.
18. **Sin "auditoría de accesos"**: no hay log de quién entró, cuándo, desde dónde.
19. **Sin "SAML"**: solo password local. Enterprise pide SAML.
20. **Sin "session binding"**: el token no está atado a IP / user-agent.

## Interrelación

Puerta de entrada. Depende de 07, 04.

## Riesgos

Signup público con SIGNUP_ENABLED=true en single-tenant. Sesiones no expiran bien. Rotación de signing key olvidada.

## Tipo de fixes

OIDC opcional por tenant. Scopes declarativos. Migración a roleIds. Password strength. HIBP check. 2FA. Recuperación. Verificación de email. Session binding. SAML.
=======
> v1 · 2026-10-04 · Estado: audited
> Fuente: repodump users.ts, auth.ts, auth-routes.ts, rate-limit.ts

## Ontología

User, UserService, UserRecord, scrypt, session, token, role
(admin | user), rate limit, signing key.

## Estado real

UserService con scrypt (64 bytes, salt aleatorio). Sesiones con SHA-256.
Rate limit por IP + email. Rotación de signing key cifrada con AES-256-GCM.
auth-routes.ts con login/register/logout/me/users.

## Evidencia

Los 5 tests de auth.test.ts pasan. Rate limit: 20 intentos por IP, 5 por
email, ventana 5 min. El test "the login rate limit answers 429 with
Retry-After" pasa. Firma: `userRoleSchema` con admin | user.

## Huecos

OIDC / SSO. Scopes por rol. roleIds: string[] (un usuario solo tiene un
rol). Rotación de signing key automática.

## Interrelación

Puerta de entrada. Depende de 07 (tenant), 04 (multi-usuario).

## Riesgos

Signup público con SIGNUP_ENABLED=true en single-tenant. Sesiones no
expiran bien. Rotación de signing key se olvida.

## Tipo de fixes

OIDC opcional por tenant. Scopes declarativos por rol. Migración a
roleIds: string[]. Test de sesión expirada y robo de token.
>>>>>>> fix/wave-01-learning-in-pkg
````

## File: docs/audits/16-autenticacion/roadmap.md
````markdown
<<<<<<< HEAD
# Roadmap — 16 autenticación

> v1 · 2026-10-04 · Estado: planned

## 1. Promesa del repo
Login seguro, sin fugas de sesión. SECURITY.md: un owner por deployment.

## 2. Estado verificado
- scrypt, sesiones SHA-256, rate limit IP+email.
- Rotación de signing key cifrada.
- Fuente: repodump users.ts, auth.ts, auth-routes.ts, rate-limit.ts.

## 3. Huecos contra producción
- Sin OIDC / SSO.
- Sin scopes por rol.
- roleIds: string[] pendiente.
- Rotación de signing key manual.

## 4. Objetivo
Auth con roles múltiples. OIDC opcional por tenant.

## 5. Fronteras
- No SSO corporativo todavía.

## 6. Conexiones
- Depende de: 07, 04.
- Archivos compartidos: users.ts, auth.ts.

## 7. Principios del PRODUCT.md
Tareas durables (verificación de quién ejecuta).

## 8. Cómo se verifica el cierre
- Test de sesión expirada bloqueada.
- Test de robo de token bloqueado.
- Migración de roleId a roleIds probada.
=======
# Roadmap — autenticacion

> v1 · 2026-10-04 · Estado: placeholder

Se rellena cuando se decida atacar esta rama.

## 1. Promesa del repo
## 2. Estado verificado
## 3. Huecos contra produccion
## 4. Objetivo y sub-objetivos
## 5. Fronteras
## 6. Conexiones con otras ramas
## 7. Principios del PRODUCT.md que toca
## 8. Como se verifica el cierre
>>>>>>> fix/wave-01-learning-in-pkg
````

## File: docs/audits/17-seguridad-basica/miniaudit.md
````markdown
# 17 — Seguridad básica

<<<<<<< HEAD
> v2 · 2026-10-04 · Estado: audited-deep
> Fuente: repodump SECURITY.md, app.ts, ci.yml, código real

## Ontología

Boundaries, bodyLimit, CORS, CSP, HSTS, webhook firma, rate limit distribuido.

## Estado real

SECURITY.md con boundaries. bodyLimit 12MB. CORS por origin. Zod en rutas. CSP no configurado. /api/whatsapp/incoming con timingSafeEqual. Tokens de Google cifrados.

## Evidencia

"API protects private data and rejects unrelated web origins" pasa. "vault encrypts with a fresh nonce" pasa. Sin test de CSP.

## Huecos declarados

- CSP y HSTS.
- Auditoría de dependencias.
- Rotación de secretos.
- Firma en más webhooks.
- Rate limit distribuido.

## Huecos profundos (auditoría extendida)

1. **Sin `Strict-Transport-Security`**: HTTP downgrade posible.
2. **Sin `X-Frame-Options` / `frame-ancestors`**: clickjacking posible.
3. **Sin `Referrer-Policy`**: fuga de URLs a terceros.
4. **Sin `Permissions-Policy`**: acceso a cámara/micrófono sin restricción.
5. **`Cache-Control: no-store` en todo**: bien, pero falta en `static
$ErrorActionPreference = "Stop"
Set-Location "C:\Users\Alfonso\Desktop\git hub repos\agente"

$path = "docs/audits/17-seguridad-basica/miniaudit.md"
$body = @'
# 17 — Seguridad básica

> v2 · 2026-10-04 · Estado: audited-deep
> Fuente: repodump SECURITY.md, app.ts, ci.yml, código real

## Ontología

Boundaries, bodyLimit, CORS, CSP, HSTS, webhook firma, rate limit distribuido.

## Estado real

SECURITY.md con boundaries. bodyLimit 12MB. CORS por origin. Zod en rutas. CSP no configurado. /api/whatsapp/incoming con timingSafeEqual. Tokens de Google cifrados.

## Evidencia

"API protects private data and rejects unrelated web origins" pasa. "vault encrypts with a fresh nonce" pasa. Sin test de CSP.

## Huecos declarados

- CSP y HSTS.
- Auditoría de dependencias.
- Rotación de secretos.
- Firma en más webhooks.
- Rate limit distribuido.

## Huecos profundos (auditoría extendida)

1. **Sin `Strict-Transport-Security`**: HTTP downgrade posible.
2. **Sin `X-Frame-Options` / `frame-ancestors`**: clickjacking posible.
3. **Sin `Referrer-Policy`**: fuga de URLs a terceros.
4. **Sin `Permissions-Policy`**: acceso a cámara/micrófono sin restricción.
5. **`Cache-Control: no-store` en todo**: bien, pero falta en `static` (que sí cachea).
6. **CORS con wildcard `*` en algún endpoint**: si lo hay, rompe la seguridad. Verificar.
7. **Sin `pnpm audit --production` en CI**: vulnerabilidades conocidas pasan.
8. **Sin SAST (Semgrep, CodeQL)**: bugs de seguridad no detectados en código.
9. **Sin DAST (OWASP ZAP)**: no se prueba la app en runtime.
10. **Sin pentest anual**: no se descubre lo que los tests no ven.
11. **Sin `security.txt`**: sin canal de reporte de vulnerabilidades.
12. **Sin bug bounty**: no hay incentivo para reportar.
13. **Sin WAF**: ataques comunes (SQLi, XSS) dependen de validación propia.
14. **Sin DDoS protection**: capa 7 vulnerable.
15. **`OPENMUSE_ACCESS_KEY` solo validación en modo live**: en sample, no.
16. **`TOKEN_ENCRYPTION_KEY` sin rotación**: si se filtra, hay que re-encriptar todo manualmente.
17. **Sin cifrado en reposo de la DB**: si alguien accede al disco, lee todo.
18. **Sin separación de secretos por servicio**: misma env para API y worker.
19. **`WHATSAPP_WEBHOOK_TOKEN` sin rotación**: mismo problema.
20. **Sin "rate limit distribuido"**: el RateLimiter es in-process. Multi-réplica no funciona.

## Interrelación

Transversal. Depende de 16, 20, 21.

## Riesgos

dangerouslySetInnerHTML. Webhook sin firma. Error verboso filtra rutas.

## Tipo de fixes

CSP en HTML. Headers de seguridad. pnpm audit --production en CI. Rate limit compartido. Vault externo. Rotación de secretos. SAST/DAST. security.txt. WAF.
=======
> v1 · 2026-10-04 · Estado: audited
> Fuente: repodump SECURITY.md, app.ts, .github/workflows/ci.yml

## Ontología

Boundaries (computer, browser, tokens), bodyLimit, CORS, CSP, HSTS, webhook
firma, rate limit distribuido.

## Estado real

SECURITY.md con boundaries. bodyLimit 12MB. CORS por origin. Zod en rutas.
CSP no configurado en frontend. /api/whatsapp/incoming con timingSafeEqual.
Tokens de Google cifrados.

## Evidencia

El test "API protects private data and rejects unrelated web origins"
pasa. El test "vault encrypts with a fresh nonce and authenticates the
entire envelope" pasa. No hay test de CSP.

## Huecos

CSP y HSTS en el frontend servido. Auditoría de dependencias en CI
(pnpm audit). Rotación de secretos. Verificación de firmas en más webhooks.
Rate limit distribuido (hoy en memoria por proceso).

## Interrelación

Transversal. Todo lo externo pasa por aquí. Depende de 16, 20, 21.

## Riesgos

dangerouslySetInnerHTML escapa de una revisión. Webhook sin firma crea
tareas. Error verboso filtra rutas internas.

## Tipo de fixes

CSP en el HTML servido. Headers de seguridad. pnpm audit --production en
CI. Rate limit compartido.
>>>>>>> fix/wave-01-learning-in-pkg
````

## File: docs/audits/17-seguridad-basica/roadmap.md
````markdown
<<<<<<< HEAD
# Roadmap — 17 seguridad básica

> v1 · 2026-10-04 · Estado: planned

## 1. Promesa del repo
No exponer datos, no ejecutar código ajeno. SECURITY.md lo detalla.

## 2. Estado verificado
- boundaries en SECURITY.md.
- bodyLimit 12MB. CORS por origin. Zod en rutas.
- Tokens de Google cifrados.
- Fuente: repodump SECURITY.md, app.ts, ci.yml.

## 3. Huecos contra producción
- CSP y HSTS en el frontend servido.
- Auditoría de dependencias en CI.
- Rotación de secretos.
- Firma en más webhooks.
- Rate limit distribuido.

## 4. Objetivo
OWASP Top 10 básico cumplido. npm audit sin altos.

## 5. Fronteras
- No pentest externo.

## 6. Conexiones
- Depende de: 16, 20, 21.
- Archivos compartidos: app.ts, ci.yml, SECURITY.md.

## 7. Principios del PRODUCT.md
SOPs con aprobaciones.

## 8. Cómo se verifica el cierre
- pnpm audit --production sin altos.
- CSP en el HTML servido.
- Headers de seguridad en cada respuesta.
=======
# Roadmap — seguridad-basica

> v1 · 2026-10-04 · Estado: placeholder

Se rellena cuando se decida atacar esta rama.

## 1. Promesa del repo
## 2. Estado verificado
## 3. Huecos contra produccion
## 4. Objetivo y sub-objetivos
## 5. Fronteras
## 6. Conexiones con otras ramas
## 7. Principios del PRODUCT.md que toca
## 8. Como se verifica el cierre
>>>>>>> fix/wave-01-learning-in-pkg
````

## File: docs/audits/18-deploy-infra/miniaudit.md
````markdown
# 18 — Deploy / infra

<<<<<<< HEAD
> v2 · 2026-10-04 · Estado: audited-deep
> Fuente: repodump Dockerfile, fly.toml, infra/compose.yaml, scripts/*, código real

## Ontología

Dockerfile multi-stage, fly.toml, docker-compose, DATA_DIR, volumen persistente, HEALTH, provision-client, dev.ps1.

## Estado real

Dockerfile multi-stage. fly.toml con mount /data. dev.ps1. scripts/provision-client.ts. infra/compose.yaml para browser worker.

## Evidencia

Dockerfile compila. fly.toml con healthcheck /api/health. provision-client requiere admin ya creado. Sin docker-compose.yml completo.

## Huecos declarados

- docker-compose.yml completo.
- Backups automáticos en host.
- Runbook de incidentes.
- Health checks por servicio.

## Huecos profundos (auditoría extendida)

1. **`Dockerfile` con `NODE_ENV=production` en runtime pero tests en build**: los tests se ejecutan en la imagen final, ocupando espacio.
2. **Sin `.dockerignore` para `docs/`**: la doc se copia a la imagen. +50 MB.
3. **Sin stage separado para `dist`**: la imagen incluye node_modules con devDeps.
4. **Sin "distroless"**: imagen final con shell completo. Superficie de ataque.
5. **Sin "read-only filesystem"** en la imagen del API: si un atacante escribe, persiste.
6. **Sin "non-root user"**: el API corre como root por defecto.
7. **Sin `HEALTHCHECK` en el Dockerfile**: solo fly.io lo tiene.
8. **`fly.toml` sin `[deploy] release_command`**: las migraciones no se ejecutan antes de arrancar.
9. **Sin "graceful shutdown" en el Dockerfile**: SIGTERM no se propaga.
10. **Sin "resource limits" en el Dockerfile**: fly.io los aplica, pero Docker local no.
11. **Sin `docker-compose.yml` completo**: solo hay el del browser worker.
12. **Sin "migración automática de DB"**: `scripts/migrate-*` se ejecutan a mano.
13. **Sin "rollback automático"**: si el deploy falla, no hay rollback.
14. **Sin "blue-green deploy"**: cada deploy es in-place con downtime.
15. **Sin "staging environment"**: todo va a producción.
16. **Sin "CI/CD completo"**: solo hay `pnpm test`, no hay build + deploy.
17. **Sin "k8s / k3s manifests"**: solo Docker + fly.io.
18. **Sin "Helm chart"**: no hay forma de distribuir la app a otros.
19. **Sin "auto-scaling"**: fly.io `auto_stop_machines` pero sin reglas de scale-up.
20. **Sin "runbook"**: docs/operacion/RUNBOOK.md no existe.

## Interrelación

Medio. Depende de 19.

## Riesgos

Deploy rompe el motor. Volumen se llena. Cliente no sabe reiniciar.

## Tipo de fixes

docker-compose.yml con healthchecks. Runbook.md. Backup automático documentado. deploy-client.sh. Non-root user. Read-only fs. Migration release_command. Rollback automático.
=======
> v1 · 2026-10-04 · Estado: audited
> Fuente: repodump Dockerfile, fly.toml, infra/compose.yaml, scripts/*

## Ontología

Dockerfile multi-stage, fly.toml, docker-compose, DATA_DIR, volumen
persistente, HEALTH, provision-client, dev.ps1.

## Estado real

Dockerfile multi-stage (build + runtime). fly.toml con mount persistente
/data. dev.ps1 para desarrollo local. scripts/provision-client.ts.
infra/compose.yaml para browser worker.

## Evidencia

El Dockerfile compila. fly.toml tiene healthcheck /api/health. El
provision-client.ts existe pero requiere admin ya creado. No hay
docker-compose.yml completo para API + worker + browser + computer + DB.

## Huecos

docker-compose.yml completo con healthchecks. Scripts de backup automático
en el host. Runbook de incidentes. Health checks por servicio.

## Interrelación

Medio. Todo corre sobre esto. Depende de 19 (backups).

## Riesgos

Deploy rompe el motor durable (leases activos con la DB caída). Volumen
se llena. Cliente no sabe reiniciar tras un incidente.

## Tipo de fixes

docker-compose.yml con todos los servicios y healthchecks. Runbook.md en
docs/operacion/. Backup automático documentado. Script deploy-client.sh
con pasos numerados.
>>>>>>> fix/wave-01-learning-in-pkg
````

## File: docs/audits/18-deploy-infra/roadmap.md
````markdown
<<<<<<< HEAD
# Roadmap — 18 deploy e infra

> v1 · 2026-10-04 · Estado: planned

## 1. Promesa del repo
Desplegar a un cliente en menos de 1h. Un deployment por cliente.

## 2. Estado verificado
- Dockerfile multi-stage.
- fly.toml con mount /data.
- scripts/provision-client.ts.
- Fuente: repodump Dockerfile, fly.toml, infra/compose.yaml.

## 3. Huecos contra producción
- docker-compose.yml completo.
- Scripts de backup automático en host.
- Runbook de incidentes.
- Health checks por servicio.

## 4. Objetivo
Un cliente nuevo en 1h siguiendo un runbook.

## 5. Fronteras
- No k8s.

## 6. Conexiones
- Depende de: 19.
- Archivos compartidos: Dockerfile, fly.toml, compose.yaml, scripts/*.

## 7. Principios del PRODUCT.md
Tareas durables.

## 8. Cómo se verifica el cierre
- Deploy manual completo cronometrado <1h.
- docker-compose.yml con 5 servicios y healthchecks.
- Runbook.md en docs/operacion/.
=======
# Roadmap — deploy-infra

> v1 · 2026-10-04 · Estado: placeholder

Se rellena cuando se decida atacar esta rama.

## 1. Promesa del repo
## 2. Estado verificado
## 3. Huecos contra produccion
## 4. Objetivo y sub-objetivos
## 5. Fronteras
## 6. Conexiones con otras ramas
## 7. Principios del PRODUCT.md que toca
## 8. Como se verifica el cierre
>>>>>>> fix/wave-01-learning-in-pkg
````

## File: docs/audits/19-backups-restore/miniaudit.md
````markdown
# 19 — Backups / restore

<<<<<<< HEAD
> v2 · 2026-10-04 · Estado: audited-deep
> Fuente: repodump backup.ts, backup-tenant.ts, scripts/*, código real

## Ontología

runBackup, runTenantBackup, retentionDays, manifest, backup por tenant, restore probado.

## Estado real

runBackup por deployment, runTenantBackup por tenant. Retención por días. restore.ts probado. Backups en dataDir/backups/<stamp>/ con manifest. Scheduler en index.ts.

## Evidencia

El script restore.ts funciona. Sin test del ciclo completo. Sin checksum. Sin alerta si >48h sin backup.

## Huecos declarados

- Backups incrementales.
- Verificación automática.
- Alerta si >48h.
- Backup remoto.
- Checksum.

## Huecos profundos (auditoría extendida)

1. **`runBackup` copia PGlite entero**: si la DB tiene 5 GB, cada backup ocupa 5 GB. Sin incremental.
2. **`runBackup` sin compresión**: 5 GB sin gzip son 5 GB en disco. Con gzip, 1 GB.
3. **Sin cifrado del backup**: si alguien accede al directorio, lee todo.
4. **Sin verificación post-backup**: no se verifica que el backup sea restaurable.
5. **`pruneOld` sin dry-run**: borra sin avisar.
6. **Sin "backup por tipo"**: todo o nada. No se puede respaldar solo `files/`.
7. **`runTenantRestore` sin validación de tenant**: restaura si el path existe. Sin verificar que el tenant sea correcto.
8. **Sin "restore parcial"**: no se puede restaurar solo un archivo.
9. **Sin "restore a punto en el tiempo"**: solo restore completo.
10. **Sin "backup off-site"**: todo en el mismo disco. Si el disco muere, todo muere.
11. **Sin "backup verificable"**: sin checksum, no se sabe si el backup está corrupto.
12. **Sin "notificación de backup fallido"**: si el scheduler falla, nadie se entera.
13. **Sin "backup retention policy"**: retentionDays hardcoded a 7. Configurable por env pero sin defaults sensatos.
14. **Sin "backup metrics"**: no hay `backup_size_bytes` ni `backup_last_success_timestamp`.
15. **Sin "backup pre-migration"**: antes de un migrate, no se hace backup automático.
16. **Sin "restore drill"**: no se prueba restaurar en staging.
17. **Sin "backup multi-región"**: no se copia a otra región.
18. **Sin "backup encriptado con KMS"**: el cifrado sería con la misma key del deployment.
19. **Sin "backup incremental"**: cada backup copia todo. Con PGlite, eso es lento.
20. **Sin "backup con WAL"**: PGlite no soporta WAL streaming. Con Postgres sí.

## Interrelación

Red de seguridad. Depende de 05, 18.

## Riesgos

Backup ocupa el disco. Backup corrupto descubierto al restaurar. Nadie verifica el restore.

## Tipo de fixes

restore.test.ts del ciclo completo. Checksum del backup. Notificación si falla. Backup a S3 opcional. Compresión. Cifrado. Off-site. Métricas. Drill trimestral.
=======
> v1 · 2026-10-04 · Estado: audited
> Fuente: repodump backup.ts, backup-tenant.ts, scripts/backup.ts,
> scripts/restore.ts

## Ontología

runBackup, runTenantBackup, retentionDays, manifest, backup por tenant,
restore probado.

## Estado real

runBackup por deployment y runTenantBackup por tenant. Retención por días.
restore.ts probado. Backups en dataDir/backups/<stamp>/ con manifest.json.
Scheduler en index.ts con BACKUP_INTERVAL_HOURS.

## Evidencia

El script restore.ts funciona. No hay test que verifique el ciclo completo
backup → restore. No hay checksum. No hay alerta si >48h sin backup.

## Huecos

Backups incrementales. Verificación automática. Alerta si >48h sin backup.
Backup remoto (S3, B2). Checksum.

## Interrelación

Red de seguridad. Depende de 05 (motor durable), 18 (deploy).

## Riesgos

Backup ocupa todo el disco. Backup corrupto se descubre solo al restaurar.
Nadie verifica que el restore funciona.

## Tipo de fixes

restore.test.ts que verifica el ciclo completo. Checksum del backup al
crearlo y al restaurarlo. Notificación si un backup falla. Backup a S3
opcional.
>>>>>>> fix/wave-01-learning-in-pkg
````

## File: docs/audits/19-backups-restore/roadmap.md
````markdown
<<<<<<< HEAD
# Roadmap — 19 backups y restore

> v1 · 2026-10-04 · Estado: planned

## 1. Promesa del repo
Restaurar en <1h tras pérdida. Persistencia.

## 2. Estado verificado
- runBackup por deployment y por tenant.
- Retención por días. restore.ts probado.
- Fuente: repodump backup.ts, backup-tenant.ts.

## 3. Huecos contra producción
- Backups incrementales.
- Verificación automática del restore.
- Alerta si >48h sin backup.
- Backup remoto (S3, B2).
- Checksum.

## 4. Objetivo
Restaurar en <30 min verificado.

## 5. Fronteras
- No replica streaming.

## 6. Conexiones
- Depende de: 05, 18.
- Archivos compartidos: backup.ts, backup-tenant.ts.

## 7. Principios del PRODUCT.md
Tareas durables.

## 8. Cómo se verifica el cierre
- restore.test.ts del ciclo completo.
- Checksum del backup al crearlo y al restaurarlo.
- Notificación si un backup falla.
=======
# Roadmap — backups-restore

> v1 · 2026-10-04 · Estado: placeholder

Se rellena cuando se decida atacar esta rama.

## 1. Promesa del repo
## 2. Estado verificado
## 3. Huecos contra produccion
## 4. Objetivo y sub-objetivos
## 5. Fronteras
## 6. Conexiones con otras ramas
## 7. Principios del PRODUCT.md que toca
## 8. Como se verifica el cierre
>>>>>>> fix/wave-01-learning-in-pkg
````

## File: docs/audits/20-computer-sandbox/miniaudit.md
````markdown
# 20 — Computer sandbox

<<<<<<< HEAD
> v2 · 2026-10-04 · Estado: audited-deep
> Fuente: repodump computer.ts, apps/computer/*, COMPUTER.md, código real

## Ontología

ComputerService, ComputerCommand, DockerRunner, runDocker, aislamiento (readonly, cap-drop ALL, no-new-privileges, network none, 512MB, 1 CPU, 128 pids, tmpfs 64MB), files.py, /workspace persistente.

## Estado real

Docker sin red. 512MB. 1 CPU. 128 pids. --cap-drop ALL. no-new-privileges. --read-only. tmpfs 64MB. /workspace persistente. Timeout 30s. Output 128KB. files.py con rechazo de symlinks.

## Evidencia

Los 12 tests de computer.test.ts pasan (aislamiento, timeouts, Stop, quarantine, recuperación de lease, inyección argv, paths).

## Huecos declarados

- Cuotas de disco por volumen.
- Rotación de contenedores huérfanos.
- Telemetría de uso.
- Más lenguajes.

## Huecos profundos (auditoría extendida)

1. **`DockerRunner` no expone el container a métricas**: no se puede saber qué container usa qué RAM.
2. **Sin "disk quota por volumen"**: `/workspace` puede crecer hasta llenar el host.
3. **Sin "sweeper de huérfanos"**: si el API crashea, el container sigue vivo. Sin limpieza.
4. **Sin "log de comandos"**: no hay history de qué comandos se ejecutaron por task.
5. **`files.py` sin límite de profundidad**: un path con 100 niveles se procesa. Path traversal mitigation pero sin tope.
6. **`files.py` sin límite de files por directorio**: 1M files en /workspace hace el scandir lento.
7. **Sin "cache de imágenes"**: cada `docker run` puede descargar la imagen si no está local.
8. **`spawn("docker", ...)` sin verificar que docker sea el binario correcto**: si el PATH es raro, ejecuta otro.
9. **Sin "resource monitor"**: no se sabe si el container está cerca del límite.
10. **Sin "kill grace period configurable"**: 2s hardcoded.
11. **Sin "docker exec con timeout real"**: si el comando ignora SIGTERM, el kill tarda.
12. **Sin "fallback a shell nativo"**: correcto (no hay), pero documentar por qué.
13. **Sin "comandos permitidos / prohibidos"**: cualquier comando vale. Un rm -rf borra todo.
14. **Sin "audit de comandos peligrosos"**: no se registra si alguien intentó ejecutar algo destructivo.
15. **Sin "cuota de CPU seconds por tenant"**: un tenant puede consumir 100% del CPU.
16. **Sin "snapshot del workspace"**: no se puede "guardar el estado" del sandbox.
17. **Sin "restore del workspace"**: si el tenant lo rompe, no hay recuperación.
18. **Sin "multi-lenguaje"**: solo bash, python3, node, git. Falta go, rust, java.
19. **Sin "output streaming"**: el output se espera completo antes de devolverlo.
20. **Sin "environment variables aisladas"**: el container hereda HOME=/workspace pero podría heredar más.

## Interrelación

Sandbox externo. Depende de 06, 17.

## Riesgos

Comando llena el disco. Contenedor huérfano bloquea. Fallo de Docker deja tarea inconsistente.

## Tipo de fixes

Cuota de disco real. Sweeper de contenedores con lease expirado. Métricas de uso. Comandos prohibidos. Output streaming. Snapshot. Restore.
=======
> v1 · 2026-10-04 · Estado: audited
> Fuente: repodump apps/server/src/computer.ts, apps/computer/*, COMPUTER.md

## Ontología

ComputerService, ComputerCommand, DockerRunner, runDocker, aislamiento
(readonly, cap-drop ALL, no-new-privileges, network none, 512MB, 1 CPU,
128 pids, tmpfs 64MB), files.py, /workspace persistente.

## Estado real

Docker sin red. 512MB RAM. 1 CPU. 128 pids. --cap-drop ALL.
no-new-privileges. --read-only. tmpfs 64MB. /workspace persistente con
volumen nombrado. Timeout 30s. Output 128KB. files.py con rechazo de
symlinks.

## Evidencia

Los 12 tests de computer.test.ts pasan. Cubren: aislamiento, timeouts,
interrupción, Stop, quarantine tras Stop fallido, recuperación de lease
expirado, inyección de argv, paths que no escapan.

## Huecos

Cuotas de disco por volumen. Rotación de contenedores huérfanos (lease
expirado sin stop). Telemetría de uso. Soporte para más lenguajes.

## Interrelación

Sandbox externo de SOPs con skills. Depende de 06 (aprobaciones), 17.

## Riesgos

Un comando llena el disco del host. Contenedor huérfano bloquea a otro.
Fallo de Docker deja la tarea inconsistente.

## Tipo de fixes

Cuota de disco real. Sweeper que mate contenedores con lease expirado.
Métricas de uso por contenedor.
>>>>>>> fix/wave-01-learning-in-pkg
````

## File: docs/audits/20-computer-sandbox/roadmap.md
````markdown
<<<<<<< HEAD
# Roadmap — 20 computer sandbox

> v1 · 2026-10-04 · Estado: planned

## 1. Promesa del repo
Sandbox Linux aislado, sin fugas.

## 2. Estado verificado
- Docker sin red, 512MB, 1 CPU, 128 pids.
- --cap-drop ALL, no-new-privileges, --read-only, tmpfs 64MB.
- /workspace persistente. files.py rechaza symlinks.
- Fuente: repodump computer.ts, apps/computer/*.

## 3. Huecos contra producción
- Cuota de disco por volumen.
- Rotación de contenedores huérfanos.
- Telemetría de uso.
- Soporte para más lenguajes.

## 4. Objetivo
Sandbox con cuotas de disco y telemetría.

## 5. Fronteras
- No GUI.

## 6. Conexiones
- Depende de: 06, 17.
- Archivos compartidos: computer.ts, apps/computer/*.

## 7. Principios del PRODUCT.md
SOPs con aprobaciones.

## 8. Cómo se verifica el cierre
- Test que verifica límite de disco.
- Sweeper de contenedores con lease expirado.
=======
# Roadmap — computer-sandbox

> v1 · 2026-10-04 · Estado: placeholder

Se rellena cuando se decida atacar esta rama.

## 1. Promesa del repo
## 2. Estado verificado
## 3. Huecos contra produccion
## 4. Objetivo y sub-objetivos
## 5. Fronteras
## 6. Conexiones con otras ramas
## 7. Principios del PRODUCT.md que toca
## 8. Como se verifica el cierre
>>>>>>> fix/wave-01-learning-in-pkg
````

## File: docs/audits/21-browser-worker/miniaudit.md
````markdown
# 21 — Browser worker

<<<<<<< HEAD
> v2 · 2026-10-04 · Estado: audited-deep
> Fuente: repodump apps/worker/*, browser.ts, compose.yaml, código real

## Ontología

Playwright, BrowserService, BrowserSession, proxy egress, validatePublicUrl, isPublicIp, serial(id), WORKER_TOKEN.

## Estado real

Playwright 1.62.1 en contenedor aparte. Sin red privada. 3 sesiones. 20 perfiles. 30 min idle. Bearer de 32 chars. Uploads 64KB. Descargas 10MB. 20 PDFs. Proxy egress con DNS validation.

## Evidencia

Los 17 tests de browser.test.ts pasan (path traversal, URLs privadas, encoded IPs, DNS rebinding, serialización por sesión, downloads rechazados, egress proxy).

## Huecos declarados

- Self-healing.
- Rate limit por sesión.
- Auditoría de URLs bloqueadas.
- Más idiomas.

## Huecos profundos (auditoría extendida)

1. **Sin "auto-restart" del worker**: si Chromium crashea, el worker queda mudo.
2. **Sin "rate limit por sesión"**: un script puede hacer 1000 navegaciones/min.
3. **Sin "log de URLs bloqueadas"**: no se sabe qué intentó navegar el agente.
4. **Sin "user-agent rotation"**: Chromium firma siempre igual. Bot detection.
5. **Sin "CAPTCHA fallback"**: si una página tiene CAPTCHA, el agente se cuelga.
6. **Sin "screenshot OCR"**: la captura es PNG pero no se procesa texto.
7. **Sin "session recording"**: no se puede replay de lo que hizo el agente.
8. **Sin "cleanup de perfiles viejos"**: 20 perfiles máx, pero si no se usan, se acumulan.
9. **Sin "cleanup de downloads"**: 20 PDFs por sesión, pero si la sesión es vieja, no se borran.
10. **Sin "retry de navegación"**: si una URL falla, el step falla. Sin retry.
11. **Sin "cluster de workers"**: un worker único. Sin alta disponibilidad.
12. **Sin "anti-bot mitigations"**: Cloudflare, DataDome bloquean el agente.
13. **Sin "proxy rotativo"**: una IP. Fácil de bloquear.
14. **Sin "fingerprinting protection"**: Chromium estándar es detectable.
15. **Sin "PDF download con validación"**: descarga cualquier PDF sin comprobar contenido.
16. **Sin "multi-tenant worker pools"**: un worker para todos. Un tenant abusivo afecta a todos.
17. **`serial(id, fn)` sin timeout**: si una operación cuelga, toda la cola espera.
18. **Sin "session state externalizado"**: el estado vive en disco del worker. Sin failover.
19. **Sin "auth state export/import"**: no se puede migrar una sesión entre workers.
20. **Sin "screenshot con marca de tiempo"**: las capturas no indican cuándo se tomaron.

## Interrelación

Navegador del agente. Depende de 06, 17.

## Riesgos

Worker caído deja sesiones colgadas. CAPTCHA bloquea. URL privada se abre.

## Tipo de fixes

Health check y auto-restart. Rate limit por sesión y owner. Log de URLs bloqueadas. Cluster de workers. Proxy rotativo. OCR. Session recording. Cleanup.
=======
## Que tiene

Playwright 1.62.1 en contenedor aparte, sin red privada, 3 sesiones maximas,
20 perfiles guardados, 30min de idle, token Bearer de 32 chars, uploads 64KB,
descargas 10MB, 20 PDFs por sesion.

## Que le falta

- Self-healing: si el worker cae, el API no lo relanza.
- Rate limit por sesion.
- Auditoria de URLs bloqueadas (para saber que intento el LLM).
- Soporte para mas idiomas (localizacion de errores).

## Interrelacion con el macro

Es el navegador del agente. Todo browse_web pasa por aqui.

## Riesgos

- Que un worker caido deje sesiones colgadas.
- Que un sitio con CAPTCHA bloquee al agente y no haya forma de avisar.
- Que una URL privada (por bug) se abra.

## Tipo de fixes que necesitara

- Health check del worker y auto-restart.
- Rate limit por sesion + por owner.
- Log de URLs bloqueadas por el proxy.
>>>>>>> fix/wave-01-learning-in-pkg
````

## File: docs/audits/21-browser-worker/roadmap.md
````markdown
<<<<<<< HEAD
# Roadmap — 21 browser worker

> v1 · 2026-10-04 · Estado: planned

## 1. Promesa del repo
Navegador aislado, sin fugas. SECURITY.md y apps/worker/README.md.

## 2. Estado verificado
- Playwright 1.62.1 en contenedor aparte.
- Sin red privada (proxy egress con DNS validation).
- 3 sesiones, 20 perfiles, 30 min idle. Bearer de 32 chars.
- Fuente: repodump apps/worker/*, browser.ts.

## 3. Huecos contra producción
- Self-healing si el worker cae.
- Rate limit por sesión y owner.
- Auditoría de URLs bloqueadas.
- Soporte para más idiomas.

## 4. Objetivo
Browser worker con self-healing y rate limit por sesión.

## 5. Fronteras
- No Chrome extension.

## 6. Conexiones
- Depende de: 06, 17.
- Archivos compartidos: apps/worker/*, browser.ts.

## 7. Principios del PRODUCT.md
SOPs con aprobaciones.

## 8. Cómo se verifica el cierre
- Health check con auto-restart probado.
- Rate limit por sesión y owner.
- Log de URLs bloqueadas por el proxy.
=======
# Roadmap — browser-worker

> v1 · 2026-10-04 · Estado: placeholder

Se rellena cuando se decida atacar esta rama.

## 1. Promesa del repo
## 2. Estado verificado
## 3. Huecos contra produccion
## 4. Objetivo y sub-objetivos
## 5. Fronteras
## 6. Conexiones con otras ramas
## 7. Principios del PRODUCT.md que toca
## 8. Como se verifica el cierre
>>>>>>> fix/wave-01-learning-in-pkg
````

## File: docs/audits/22-google-drive-gmail/miniaudit.md
````markdown
# 22 — Google / Drive / Gmail

<<<<<<< HEAD
> v2 · 2026-10-04 · Estado: audited-deep
> Fuente: repodump google.ts, google-auth.ts, código real

## Ontología

GoogleClient, GoogleAuth, OAuth con PKCE, tokens AES-256-GCM, Gmail read y send, Calendar CRUD con ETag, Drive read y trash y rename.

## Estado real

OAuth completo con PKCE. Tokens cifrados AES-256-GCM. Gmail read+send con attachments. Calendar CRUD con ETag y reviews. Drive read+trash+rename. google-auth.ts con refresco de tokens.

## Evidencia

Los 30 tests de google.test.ts pasan (MIME anidado, CRLF, attachments, OAuth PKCE, ETag mismatch, recurrencia rechazada, red failure → outcome_unknown). Los 7 de oauth.test.ts pasan. Los 2 de vault.test.ts pasan.

## Huecos declarados

- Drive write completo.
- Sheets export CSV.
- Batch operations.
- Contactos.

## Huecos profundos (auditoría extendida)

1. **Drive write incompleto**: solo trash y rename. Falta create, update, delete.
2. **Sin Drive watch**: no se detectan cambios en archivos del usuario.
3. **Sin Gmail push notifications**: solo polling.
4. **Sin "Gmail label management"**: no se pueden crear labels.
5. **Sin "Gmail filter"**: no se pueden crear filters.
6. **Sin "Calendar reminders"**: no se configuran notificaciones de eventos.
7. **Sin "Calendar recurrence expansion"**: los eventos recurrentes no se expanden.
8. **Sin "Calendar attendees response"**: no se sabe si los invitados aceptaron.
9. **Sin "Drive permission management"**: no se puede compartir/descompartir archivos.
10. **Sin "Drive folder tree"**: solo se listan archivos, no carpetas.
11. **Sin "Sheets cell-level update"**: solo export CSV.
12. **Sin "Docs creation"**: no se pueden crear Docs.
13. **Sin "batch API usage"**: 1 request por archivo, no batch.
14. **Sin "quota management"**: si se agota la cuota, falla sin aviso previo.
15. **Sin "token rotation"**: el refresh token vive hasta que se revoca.
16. **Sin "revoked token detection"**: el token puede ser revocado por el usuario y no lo sabemos.
17. **Sin "Gmail search con labels"**: solo search básico.
18. **Sin "Gmail thread-level actions"**: solo read, no archive/mark.
19. **Sin "Drive shortcuts"**: no se pueden crear shortcuts.
20. **Sin "Workspace admin API"**: no se puede gestionar el dominio.

## Interrelación

Fuente de datos principal. Depende de 06, 05.

## Riesgos

Token revocado sin aviso. Email enviado dos veces por outcome_unknown. Cuota agotada.

## Tipo de fixes

Detección de token revocado con notificación. Batch endpoints. Cuota de Google en health-deep. Drive write completo. Calendar reminders. Sheets cell-level. Drive permissions.
=======
## Que tiene

OAuth completo con PKCE, tokens cifrados AES-256-GCM, Gmail read+send,
Calendar CRUD con ETag, Drive read, google-auth.ts con refresco de tokens,
google.ts con paginacion.

## Que le falta

- Drive write completo: trash y rename estan, pero falta create, copy, share.
- Sheets export a CSV.
- Batch operations: leer 100 emails uno a uno es lento.
- Contactos: no hay integracion con Google Contacts.

## Interrelacion con el macro

Es una de las fuentes de datos principales.

## Riesgos

- Que Google revoke el token y todas las tareas fallen sin aviso.
- Que un email se envie dos veces por un outcome_unknown mal reconciliado.
- Que el usuario agote la cuota de Google y no se entere.

## Tipo de fixes que necesitara

- Deteccion de token revocado con notificacion.
- Batch endpoints en google.ts.
- Cuota de Google visible en /api/health-deep.
>>>>>>> fix/wave-01-learning-in-pkg
````

## File: docs/audits/22-google-drive-gmail/roadmap.md
````markdown
<<<<<<< HEAD
# Roadmap — 22 Google Drive y Gmail

> v1 · 2026-10-04 · Estado: planned

## 1. Promesa del repo
Leer y escribir en Google con OAuth cifrado.

## 2. Estado verificado
- OAuth con PKCE, tokens AES-256-GCM.
- Gmail read+send, Calendar CRUD con ETag, Drive read+trash+rename.
- Fuente: repodump google.ts, google-auth.ts.

## 3. Huecos contra producción
- Drive write completo (create, copy, share).
- Sheets export a CSV.
- Batch operations.
- Contactos.

## 4. Objetivo
Integración completa de Google Workspace.

## 5. Fronteras
- No Google Chat.

## 6. Conexiones
- Depende de: 06, 05.
- Archivos compartidos: google.ts, google-auth.ts.

## 7. Principios del PRODUCT.md
SOPs con aprobaciones.

## 8. Cómo se verifica el cierre
- Test end-to-end de cada acción de Google.
- Detección de token revocado con notificación.
- Cuota visible en health-deep.
=======
# Roadmap — google-drive-gmail

> v1 · 2026-10-04 · Estado: placeholder

Se rellena cuando se decida atacar esta rama.

## 1. Promesa del repo
## 2. Estado verificado
## 3. Huecos contra produccion
## 4. Objetivo y sub-objetivos
## 5. Fronteras
## 6. Conexiones con otras ramas
## 7. Principios del PRODUCT.md que toca
## 8. Como se verifica el cierre
>>>>>>> fix/wave-01-learning-in-pkg
````

## File: docs/audits/23-whatsapp-stripe-gmb/miniaudit.md
````markdown
# 23 — WhatsApp / Stripe / GMB

<<<<<<< HEAD
> v2 · 2026-10-04 · Estado: audited-deep
> Fuente: repodump integrations/src/stubs/*, whatsapp-routes.ts, billing-routes.ts, gmb-routes.ts

## Ontología

WhatsAppClient, StripeClient, GmbClient, stubs 503, whatsapp-drafts, stripe-events, webhook firmas.

## Estado real

WhatsAppClient con sendText sin endpoint público de envío. StripeClient con createCustomer y createPaymentLink reales sin webhook completo. GmbClient es stub 503. Los tres en packages/integrations/src/stubs/.

## Evidencia

whatsapp-routes.ts tiene /drafts y /drafts/:id/send pero el envío real no está cableado. billing-routes.ts tiene /webhook con HMAC Stripe. gmb-routes.ts devuelve 501 con mensaje honesto.

## Huecos declarados

- WhatsApp endpoint de envío.
- Stripe webhook completo y vinculación con invoices.
- GMB implementación real.

## Huecos profundos (auditoría extendida)

1. **WhatsApp sendText existe pero no hay endpoint**: no se puede enviar.
2. **WhatsApp sin webhook verificado**: acepta llamadas sin firma en algunos casos.
3. **WhatsApp sin plantillas HSM**: los mensajes fuera de 24h no se pueden enviar.
4. **WhatsApp sin media upload**: no se pueden enviar imágenes/PDFs.
5. **WhatsApp sin read receipts**: no se sabe si el mensaje se leyó.
6. **Stripe sin subscriptions**: solo payment links one-off.
7. **Stripe sin Stripe Tax**: no se calcula IVA.
8. **Stripe sin Stripe Connect**: no se puede actuar en nombre de otros.
9. **Stripe webhook incompleto**: solo invoice.paid, falta customer.subscription.*.
10. **Stripe sin idempotency keys completas**: solo en createCustomer.
11. **GMB stub devuelve 501**: el cliente no puede publicar.
12. **GMB sin OAuth**: no se conecta con la cuenta de Google.
13. **GMB sin locations**: no se listan las ubicaciones del negocio.
14. **GMB sin reviews**: no se leen reseñas.
15. **GMB sin posts scheduled**: no se programan.
16. **Sin "estado de conexión" en UI para cada canal**: el usuario no sabe qué está conectado.
17. **Sin "reintento de webhook"**: si falla, se pierde.
18. **Sin "rate limit de canales"**: un cliente puede spamear WhatsApp/Stripe.
19. **Sin "modo test" de canales**: hay que usar producción para probar.
20. **Sin "auditoría por canal"**: no hay log de qué mensaje se envió a quién.

## Interrelación

Canales externos. Depende de 06.

## Riesgos

WhatsApp sin aprobación. Stripe clientes duplicados. GMB 503 silencioso.

## Tipo de fixes

Endpoint de envío por canal con aprobación. Webhook firmado por canal. Idempotencia por idempotencyKey en Stripe. WhatsApp HSM. Stripe subscriptions. GMB OAuth + locations. Estado de conexión por canal.
=======
## Que tiene

WhatsAppClient con sendText, StripeClient con createCustomer y
createPaymentLink, GmbClient es stub 503. Los tres viven en
packages/integrations/src/stubs/.

## Que le falta

- WhatsApp: endpoint POST /api/whatsapp/drafts/:id/send, webhook firmado,
  SOP que lo use.
- Stripe: webhook con verificacion de firma, vinculacion con records/invoices.
- GMB: implementacion real.

## Interrelacion con el macro

Canales externos que necesitan aprobacion. Todos deberian pasar por
ActionService.

## Riesgos

- Que WhatsApp se use sin aprobacion y envie mensajes por error.
- Que Stripe cree clientes duplicados por falta de idempotencia.
- Que GMB se use y devuelva 503 silencioso.

## Tipo de fixes que necesitara

- Un endpoint de envio por canal, con aprobacion.
- Webhook firmado por canal.
- Idempotencia por idempotencyKey en Stripe.
>>>>>>> fix/wave-01-learning-in-pkg
````

## File: docs/audits/23-whatsapp-stripe-gmb/roadmap.md
````markdown
<<<<<<< HEAD
# Roadmap — 23 WhatsApp Stripe GMB

> v1 · 2026-10-04 · Estado: planned

## 1. Promesa del repo
Tres integraciones declaradas. No obligatorio para vender.

## 2. Estado verificado
- WhatsAppClient con sendText sin endpoint público de envío.
- StripeClient con createCustomer y createPaymentLink reales sin webhook.
- GmbClient es stub 503.
- Fuente: repodump integrations/src/stubs/*, whatsapp-routes.ts,
  billing-routes.ts, gmb-routes.ts.

## 3. Huecos contra producción
- WhatsApp: endpoint de envío con aprobación.
- Stripe: webhook completo y vinculación con invoices.
- GMB: implementación real.

## 4. Objetivo
Al menos una de las tres funcional end-to-end.

## 5. Fronteras
- No todas obligatorias.

## 6. Conexiones
- Depende de: 06.
- Archivos compartidos: stubs/*, whatsapp-routes.ts, billing-routes.ts,
  gmb-routes.ts.

## 7. Principios del PRODUCT.md
SOPs con aprobaciones.

## 8. Cómo se verifica el cierre
- Test end-to-end de la integración cableada.
- Webhook firmado por canal.
- Idempotencia por idempotencyKey en Stripe.
=======
# Roadmap — whatsapp-stripe-gmb

> v1 · 2026-10-04 · Estado: placeholder

Se rellena cuando se decida atacar esta rama.

## 1. Promesa del repo
## 2. Estado verificado
## 3. Huecos contra produccion
## 4. Objetivo y sub-objetivos
## 5. Fronteras
## 6. Conexiones con otras ramas
## 7. Principios del PRODUCT.md que toca
## 8. Como se verifica el cierre
>>>>>>> fix/wave-01-learning-in-pkg
````

## File: docs/audits/24-business-os-goals/miniaudit.md
````markdown
# 24 — Business OS (goals)

> v2 · 2026-10-04 · Estado: audited-deep
> Fuente: repodump engine/orchestrator/*, planner/*, verification/*, capabilities/*, BUSINESS_OS.md

## Ontología

BusinessOSOrchestrator, CapabilityRegistry, Planner, LlmPlanner, Replanner, LlmReplanner, Verifier, DeterministicVerifier, LlmVerifier, LearningObserver, Executor, CapabilityRunner, Goal, Outcome, Plan, CapabilityContract.

## Estado real

BusinessOSOrchestrator cableado. CapabilityRegistry con 12 tools + 4 composites. LlmPlanner con fallback a StubPlanner. LlmVerifier como segunda capa. LearningObserver conectado al orquestador. Executor con retry y compensación. Replanner LLM.

## Evidencia

Los 4 tests de business-os-contracts.test.ts pasan. Los 2 de business-os-orchestrator.test.ts pasan. Los 2 de business-os-slice.test.ts pasan. Los tests del orchestrator devuelven achieved y blocked según verificación. No hay test end-to-end con goal real persistido.

## Huecos declarados

- Más capabilities reales.
- Verificación externa (no solo LLM).
- Promoción de patrones a SOPs.
- Observabilidad por goal.

## Huecos profundos (auditoría extendida)

1. **`Goal` de `agent.ts` vs `Goal` de `goal.ts`**: dos tipos distintos con el mismo nombre. Adapter en createGoal.
2. **`createGoal` con orquestador en background sin retry**: si falla, el goal queda sin plan.
3. **`LlmPlanner` con fallback a `StubPlanner`**: el stub devuelve plan vacío. Silencioso.
4. **`parsePlannerResponse` con substring de `[` a `]`**: un LLM que devuelve texto antes del JSON falla.
5. **`validatePlanCapabilities` existe pero no se llama**: un plan con capabilityId inexistente se ejecuta.
6. **`enforcePlanBudget` con `MAX_PLAN_STEPS = 50`**: configurable no.
7. **`Executor` sin "step timeout"**: un step colgado bloquea el plan.
8. **`Executor` con compensation en orden inverso**: correcto, pero no verifica que la compensación haya funcionado.
9. **`DeterministicVerifier` solo evalúa `metrics`**: no evalúa `evidence`.
10. **`LlmVerifier` como segunda capa solo si `evidence.length > 0`**: si no hay evidence, no verifica.
11. **`LearningObserver.observe` con `goal.id` como key**: si un goal se reabre, se cuenta dos veces.
12. **`LearningObserver` sin TTL de patterns**: crecen sin tope.
13. **`LearningObserver` con `successCount >= 5` para proponer SOP**: umbral fijo.
14. **`proposedAsSop` sin generar el SOP real**: solo marca el pattern.
15. **`FeedbackCollector` sin agrupar por goalId**: cada feedback es una fila.
16. **`FeedbackScoring` con multiplicadores sin aplicar en ContextEngine**: se calculan pero no se usan.
17. **`MetricsCollector` sin export a Prometheus**: las métricas por tenant no están en `/metrics`.
18. **Sin "goal cancelable"**: una vez lanzado, no se puede abortar.
19. **Sin "goal paralelizable"**: los goals se ejecutan uno a uno.
20. **Sin "goal retomable"**: si el proceso muere a mitad de un goal, no se reanuda.

## Interrelación

Capa de negocio. Depende de 05, 08, 09, 12.

## Riesgos

Ciclo se ejecuta en bucle sin salida. LLM planifica mal y el executor falla. Nadie lee los aprendizajes.

## Tipo de fixes

LearningObserver que promueva patrones a SOPs tras N éxitos. Métrica openmuse_goals_total{status}. Test end-to-end con 1 goal persistido. Goal cancelable. Goal persistente. Validación de plan antes de ejecutar. Step timeout.
````

## File: docs/audits/24-business-os-goals/roadmap.md
````markdown
# Roadmap — 24 Business OS goals

> v1 · 2026-10-04 · Estado: planned

## 1. Promesa del repo
Ciclos Goal → Plan → Execute → Verify → Replan. No obligatorio para
vender, sí para madurar.

## 2. Estado verificado
- BusinessOSOrchestrator, CapabilityRegistry.
- LlmPlanner con fallback a StubPlanner.
- LlmVerifier como segunda capa. LearningObserver conectado.
- Fuente: docs/audits/_prep/audit-orchestrator.txt y repodump
  engine/orchestrator/*, planner/*, verification/*, capabilities/*.

## 3. Huecos contra producción
- Más capabilities reales.
- Verificación externa (no solo LLM).
- Promoción de patrones a SOPs.
- Observabilidad por goal.

## 4. Objetivo
Un goal completo ejecutado end-to-end con verificación real.

## 5. Fronteras
- No multi-agente todavía.

## 6. Conexiones
- Depende de: 05, 08, 09, 12.
- Archivos compartidos: engine/orchestrator/*, planner/*,
  verification/*, capabilities/*.

## 7. Principios del PRODUCT.md
Tareas durables, memoria curada.

## 8. Cómo se verifica el cierre
- Test end-to-end Goal → Outcome persistido.
- LearningObserver que promueva patrones a SOPs tras N éxitos.
- Métrica openmuse_goals_total{status}.
````

## File: docs/audits/25-docs-operativos/miniaudit.md
````markdown
# 25 — Docs operativos

> v1 · 2026-10-04 · Estado: audited
> Fuente: docs/README.md, PRODUCT.md, PROTOCOLO.md, docs/operacion/*

## Ontología

<<<<<<< HEAD
README (índice), PRODUCT (visión), PROTOCOLO (reglas de trabajo), estado/
(ROADMAP, KNOWN_ISSUES, FUTURE), operacion/ (DEPLOY, CLIENTE, ONBOARDING,
PRODUCCION, TODO-FOR-PROD), kernel/ (auditorías), ui/ (campaña), archive/
(12 docs históricos con fecha).
=======
README (índice), PRODUCT (visión), PROTOCOLO (reglas de trabajo),
estado/ (ROADMAP, KNOWN_ISSUES, FUTURE), operacion/ (DEPLOY, CLIENTE,
ONBOARDING, PRODUCCION, TODO-FOR-PROD), kernel/ (auditorías), ui/ (campaña),
archive/ (12 docs históricos con fecha).
>>>>>>> fix/wave-01-learning-in-pkg

## Estado real

Reestructuración completa en este pase. README, PRODUCT, PROTOCOLO
nuevos. 12 docs históricos archivados con fecha. Basura borrada
(ROADMAP_112, AUDITORIA_TENANT.ps1, .lnk). Estructura por carpetas
<<<<<<< HEAD
temáticas. Cada doc con cabecera vN · YYYY-MM-DD · Estado.

## Evidencia

docs/README.md lista 8 docs canónicos en nivel 1. PRODUCT.md con visión
de producto. PROTOCOLO.md con reglas unificadas. archive/ con 12+ docs
históricos. audits/ con esta campaña de 25 ramas.
=======
temáticas. Cada doc tiene cabecera `vN · YYYY-MM-DD · Estado`.

## Evidencia

docs/README.md lista 8 docs canónicos en el nivel 1.
docs/PRODUCT.md con visión de producto.
docs/PROTOCOLO.md con reglas de trabajo unificadas.
docs/archive/ con 12+ docs históricos.
docs/audits/ con esta campaña de 25 ramas.
>>>>>>> fix/wave-01-learning-in-pkg

## Huecos

Runbook de incidentes. Glosario del cliente. FAQ operativa. Diagramas de
<<<<<<< HEAD
arquitectura (hoy ASCII). Verificación automática de cabeceras y enlaces.
=======
arquitectura (hoy ASCII). Verificación automática de cabeceras y enlaces
en docs.
>>>>>>> fix/wave-01-learning-in-pkg

## Interrelación

Cara del sistema para quien opera. Transversal a todas las ramas.

## Riesgos

Docs quedan obsoletos al día siguiente. Operador nuevo no sabe qué hacer
ante un fallo. Cliente pregunta lo mismo 100 veces.

## Tipo de fixes

docs/operacion/RUNBOOK.md con 10-15 escenarios. docs/CLIENTE.md con
glosario en lenguaje natural. FAQ. Diagramas Mermaid.
````

## File: docs/audits/25-docs-operativos/roadmap.md
````markdown
# Roadmap — 25 docs operativos

> v1 · 2026-10-04 · Estado: planned

## 1. Promesa del repo
Cualquiera puede operar el sistema leyendo los docs.

## 2. Estado verificado
- Reestructuración completa en este pase.
- README, PRODUCT, PROTOCOLO nuevos.
- 12 docs históricos archivados con fecha.
- Fuente: docs/README.md, PRODUCT.md, PROTOCOLO.md, docs/operacion/*.

## 3. Huecos contra producción
- Runbook de incidentes.
- Glosario del cliente (no del dev).
- FAQ operativa.
- Diagramas de arquitectura.
- Verificación automática de cabeceras y enlaces.

## 4. Objetivo
Runbook completo y glosario cliente.

## 5. Fronteras
- No curso de formación.

## 6. Conexiones
- Transversal.
- Archivos compartidos: docs/*.

## 7. Principios del PRODUCT.md
Los 5.

## 8. Cómo se verifica el cierre
- Operador nuevo ejecuta un incidente ficticio siguiendo el runbook.
- Glosario del cliente con 30 términos mínimo.
- Diagramas Mermaid de la arquitectura.
````

## File: docs/audits/POLICY_REPO.md
````markdown
# Policy del repo durante la campana de fixes

> v1 - 2026-10-04 - Estado: active
> Que NO se puede hacer mientras la campana de 25 bloques esta en marcha.

## 1. Archivos compartidos

| Archivo | Bloques que lo tocan |
|---|---|
| apps/server/src/app.ts | 02, 07, 09, 13 |
| apps/server/src/engine/service.ts | 03, 04, 05, 07, 08, 09, 12 |
| apps/server/src/engine/worker.ts | 03, 05 |
| apps/server/src/engine/conversation.ts | 03, 09, 11 |
| apps/server/src/engine/model.ts | 03, 10 |
| apps/server/src/kernel/kernel.ts | 09, 10, 12 |
| apps/server/src/db.ts | 07, 08, 12 |
| packages/domain/src/index.ts | 06, 08 |
| packages/domain/src/views.ts | 13, 14 |
| package.json | 01, 02 |

## 2. Archivos intocables sin justificacion

- apps/server/src/db.ts (motor durable).
- apps/server/src/kernel/audit/store-store.ts (hash chain).
- packages/domain/src/* (contratos).
- clientes/* (datos de clientes).
- apps/worker/* y apps/computer/* (sandboxes).

## 3. Prohibiciones absolutas

- No anadir dependencias nuevas sin justificar.
- No cambiar contratos Zod sin actualizar tests.
- No borrar codigo huerfano sin marcarlo PENDING durante 1 release.
- No mergear a main sin typecheck y test verdes.
- No cambiar packages/domain sin avisar a bloques 04-06.
- No subir .bak-fase0*, artifacts/, backups/, .openmuse/ al repo.
- No usar console.log directo en codigo de servidor.
- No hardcodear timeouts, modelos, paths, keys.
- No dejar catch {} vacios.
- No reutilizar marcas de idempotencia.
- No saltar fases: bloque A antes que B cuando hay dependencia.
- No anadir features que no esten en el roadmap.

## 4. Reglas de idempotencia y verificacion

- Cada fix idempotente. Aplicar dos veces no duplica codigo.
- Cada fix se verifica con Select-String de su marca.
- Cada bloque con tabla 15/15.
- Cada cambio TS con pnpm typecheck.

## 5. Reglas de anclas y edicion

- Anclas cortas y unicas. Maximo 10 lineas.
- Preservar line endings.
- UTF-8 sin BOM siempre.
- No usar -replace con regex sobre bloques largos.

## 6. Reglas de PowerShell

- No usar nombres de funcion de 1-2 letras.
- No usar here-strings de mas de 40 lineas.
- No usar Write-Host con -f fuera de parentesis.
- No usar exit dentro de bloques pegados.

## 7. Reglas de docs

- Cada doc empieza con: > vN - YYYY-MM-DD - Estado: <state>.
- Cada miniaudit/roadmap con marca audited-deep cuando se profundice.
- No duplicar docs.

## 8. Reglas de git

- Un bloque, un commit.
- Mensaje: feat(bloque-NN): descripcion.
- No force-push a main.
- No binarios grandes (>10 MB).
- No .env ni secretos.

## 9. Orden topologico de bloques

1. 01 (Tests).
2. 02, 08 (Observabilidad, Bus).
3. 03, 05, 06 (Resiliencia, Motor, Aprobaciones).
4. 04, 07 (Multi-usuario, Multi-tenant).
5. 09, 10, 11, 12 (Kernel, LLMs, Chat, Contexto).
6. 13, 14, 15 (UI servida, Templates, Frontend).
7. 16, 17 (Auth, Seguridad).
8. 18, 19 (Deploy, Backups).
9. 20, 21, 22, 23 (Sandboxes, Canales).
10. 24 (Business OS).
11. 25 (Docs).

## 10. Reglas de rollback

git revert <commit-del-bloque>. Comprobar que las marcas ya no aparecen.
Documentar en fixes.md como reverted.

## 11. Referencias

- docs/audits/PROTOCOLO_FIXES.md
- docs/audits/00-coherencia/miniaudit.md
````

## File: docs/audits/PROTOCOLO_FIXES.md
````markdown
# Protocolo de fixes

> v1 - 2026-10-04 - Estado: active
> Como se escribe un fix para no desalinear el repo.

## 1. Regla de oro

Un fix atomico. Una marca. Un archivo. Un proposito.

## 2. Marca unica obligatoria

Formato: XXX_VN en un comentario al principio del bloque.
Nunca reutilizar una marca ya usada en otro sitio con contenido distinto.

## 3. Ancla corta y unica

- Maximo 10 lineas.
- Debe existir exactamente una vez en el archivo.
- Comprobar con Select-String antes de aplicar.

## 4. Idempotencia obligatoria

Cada fix comprueba si ya se aplico antes de aplicar.

## 5. Preservar line endings

Detectar CRLF/LF antes de modificar y restaurar al escribir. UTF-8 sin BOM.

## 6. Errores de PowerShell ya cometidos

- R como nombre de funcion: es alias de Invoke-History. Usar Write-RepoFile.
- Here-strings de mas de 40 lineas se cortan al pegar. Usar array de strings.
- Write-Host con -f fuera de parentesis. Envolver en parentesis.

## 7. Verificacion obligatoria

Tras cada fix: comprobar la marca. Tras cada bloque: tabla 15/15.
Tras cada cambio en TS: pnpm typecheck (0 errores).

## 8. Que hacer si un fix no entra

1. No dejarlo para despues. Se reaplica con ancla mas corta.
2. No apilar parches.
3. No silenciar el fallo.

## 9. Que NO hacer

- No usar -replace sobre todo el archivo.
- No escribir un archivo completo sin leerlo antes.
- No modificar codigo de otro bloque sin avisar.
- No introducir dependencias nuevas sin justificar.
- No hardcodear timeouts, modelos, paths.
- No dejar catch {} vacios.
- No usar console.log en codigo de servidor.
- No borrar codigo huerfano sin marcarlo PENDING.
- No marcar un fix como aplicado sin verificar la marca.
- No commitear sin pnpm typecheck en 0.

## 10. Verificacion al cerrar un bloque

Ejecutar la tabla del bloque. Si hay SIN MARCA, reaplicar. Si hay FALTA, crear.

## 11. Referencias

- docs/audits/POLICY_REPO.md
- docs/audits/00-coherencia/miniaudit.md
````

## File: docs/audits/00-coherencia/fixes.md
````markdown
# Fixes - 00 coherencia del repo

> v1 - 2026-10-04 - Estado: fixed
> Meta-audit de disciplina, no de codigo.

## Fixes aplicados

| # | Fix | Archivo | Estado |
|---|---|---|---|
| 00-01 | Protocolo de fixes | docs/audits/PROTOCOLO_FIXES.md | applied |
| 00-02 | Policy del repo | docs/audits/POLICY_REPO.md | applied |
| 00-03 | Meta-audit | docs/audits/00-coherencia/miniaudit.md | applied |
| 00-04 | Roadmap | docs/audits/00-coherencia/roadmap.md | applied |
| 00-05 | Miniaudits 01-25 reescritos | docs/audits/*/miniaudit.md | applied |
| 00-06 | Marcas repetidas documentadas | (por bloque) | pending |
| 00-07 | Huerfanos marcados PENDING | cromos/*, Database* | applied |
| 00-08 | Constantes no usadas documentadas | (por bloque) | pending |
| 00-09 | Contratos sin aplicar documentados | (por bloque) | pending |
| 00-10 | Config sin leer documentada | (por bloque) | pending |
| 00-11 | Timeouts hardcodeados documentados | (por bloque) | pending |
| 00-12 | console.log directo documentados | (por bloque) | pending |
| 00-13 | catch {} vacios documentados | (por bloque) | pending |
| 00-14 | TODO sin issue documentados | (por bloque) | pending |
| 00-15 | Docs sin cabecera documentados | (por bloque) | pending |
| 00-16 | Fixes sin test documentados | (por bloque) | pending |
| 00-17 | Ramas sin merge documentadas | (por bloque) | pending |
| 00-18 | Informe de coherencia por bloque | docs/audits/00-coherencia/report-<bloque>.md | pending |
| 00-18b | Script audit:coherence | package.json | applied |
| 00-19 | Informe consolidado del bloque 00 | docs/audits/00-coherencia/report.md | applied |
| 00-20 | Sección Ruta a multi-tenant real | docs/audits/07-aislamiento-multi-tenant/miniaudit.md | applied |

## Notas

- El meta-audit no cambia codigo de runtime.
- Documenta, no corrige.
````

## File: docs/audits/07-aislamiento-multi-tenant/miniaudit.md
````markdown
<<<<<<< HEAD
# 07 â€” Aislamiento multi-tenant

> v2 Â· 2026-10-04 Â· Estado: audited-deep
> Fuente: audit-tenant-default.txt, repodump db-tenant.ts, db-rls.ts, service.ts, app.ts, cÃ³digo real tras bloques 01-09

## OntologÃ­a

Tenant, Owner, Membership, TenantScopedStore, peel, scanByOwnerPrefix, RLS, MULTI_TENANT_SHARED.

## Estado real

TenantScopedStore envuelve Store y compone tenantId:owner. peel(owner) quita el prefijo al leer. Store.scanByOwnerPrefix filtra por prefijo en SQL. db-rls.ts con enableRls opcional. TenantService con cache de 5 min.

## Evidencia

De audit-tenant-default.txt: 63 ocurrencias permitidas, 2 prohibidas. Aislamiento mucho mÃ¡s limpio de lo que se suele asumir. Los 2 casos son puntos concretos, no estructurales.

## Huecos declarados

- RLS no activa por defecto.
- service.ts con scans globales (collectActiveTenants hasta 5000, maintainTenant hasta 500).
- Files y Rag con db crudo en algunos callers.
- Cache de 5 min de TenantService.
- Sin tests de fugas con N tenants.

## Huecos profundos (auditorÃ­a extendida)

1. **`Files`, `Rag`, `WorkspaceService` reciben `db` crudo en app.ts**: sus writes van con owner plano, los reads con tenantId:owner. Invisible hasta que los artifacts no aparecen.
2. **`TenantService.cache` sin invalidaciÃ³n por evento**: si un admin mueve un owner de tenant, la cache sigue vieja 5 min.
3. **`collectActiveTenants` escanea 5000 filas de `agent-settings`**: con 50 tenants son 50Ã—5000 = 250.000 filas/minuto.
4. **`maintainTenant` itera owners secuencialmente**: 50 owners Ã— 1s cada uno = 50s por tenant, 25 min con 30 tenants.
5. **Sin rate limit por tenant real**: `takeForTenant` existe pero solo se llama en createTask. Chat, RAG, files sin lÃ­mite.
6. **`tenantPrefixes` guardaba solo el Ãºltimo**: bug corregido en 07-01 pero documentado.
7. **`db.scanByOwnerPrefix` sin Ã­ndice dedicado**: el LIKE '%' no usa Ã­ndice. Con 1M filas, 1s por scan.
8. **Sin Ã­ndice `(owner, kind)` en `records`**: cada query filtra por owner+kind sin Ã­ndice compuesto. La PK es `(owner, kind, id)`, no sirve para scans por owner+kind.
9. **`db-rls.ts` no se activa salvo flag explÃ­cito**: 99% de deployments no usan RLS. La seguridad depende del cÃ³digo, no de la DB.
10. **Sin verificaciÃ³n de que el tenantId del request coincida con el tenantId del owner**: si un request autenticado pasa un tenantId distinto, nadie lo valida.
11. **Sin auditorÃ­a de accesos cross-tenant**: si un bug causa un leak, no hay log.
12. **`onboarding` no verifica tenant**: cualquier usuario de cualquier tenant puede listar los clientes.
13. **Sin `tenantId` en las respuestas HTTP**: el cliente no sabe en quÃ© tenant estÃ¡.
14. **Sin "elegir tenant activo"**: un usuario multi-tenant no puede cambiar de tenant.
15. **Sin migraciÃ³n segura de owner â†’ tenantId:owner**: `scripts/migrate-tenant-scope.ts` sin transacciÃ³n.
16. **Sin "fugas" test con N=500 tenants**: el test 07-13 cubre 50. Con 500 hay mÃ¡s presiÃ³n.
17. **`audit-entries` sin tenant check**: el `StoreAuditStore` escribe en `tenantId` como clave de tenant, pero si un tenantId es malicioso, contamina el namespace.
18. **`notifications` sin tenant filter**: las notificaciones van al owner sin verificar tenant.
19. **`Files.import` con `tenantId` opcional**: default "default". Un caller que olvide pasarlo escribe bajo "default".
20. **Sin "tenant switcher" en el frontend**: multi-tenant real no es usable.

## Ruta a multi-tenant real

> RUTA_MULTITENANT_REAL_V1 — inventario de que falta para pasar de
> clone-por-cliente a SaaS multi-tenant.

### Ya listo

TenantService, TenantScopedStore, ServiceTenantResolver, db-rls, auditor tenant-default, tests 50 tenants, backup-tenant, auth-signup con slug.

### Falta por capa

**Auth / JWT**
- Sesion sin tenantId. Falta /api/auth/switch-tenant. Falta rol por membresia.
- DatabaseTenantResolver espera tabla tenant_members que no existe.

**DB**
- records sin columna tenant_id separada. owner es string tenantId:owner.
- DatabaseTenantConfigResolver espera tabla tenant_configs que no existe.
- scanByStatus global.
- Faltan tablas usage_events y tenant_quotas.

**LLM keys por tenant**
- EnvTenantConfigResolver lee de .env. DatabaseTenantConfigResolver existe pero no se inyecta.

**Cuotas**
- takeForTenant solo en createTask. Chat, RAG, files sin limite.

**Billing**
- No existe. recordUsage escribe llm-usage por owner; se puede extender.

**Observabilidad**
- logContext sin tenantId. Metricas sin label tenant.

**Notificaciones**
- notification-prefs con id "default". notifications sin filtro tenant.

**Files / RAG / Workspace**
- Algunos callers usan db.put directo sin tdb.
- Files.import acepta tenantId opcional con default "default".

**Computer**
- computer-routes y computer-tools hardcodean "default".
- computerIdentity no incluye tenant.

**Backups**
- runTenantBackup busca dataDir/tenants/<id>/files pero Files escribe a dataDir/files.

**Tests**
- No hay test HTTP end-to-end multi-tenant.

**Frontend**
- No hay tenant switcher.

### Decisiones pendientes

1. Modelo: SaaS o clone-por-cliente.
2. Aislamiento: mismo Postgres con RLS o separado.
3. Facturacion: dia 1 o despues.
4. Membresia: varios tenants por usuario o uno.
5. API keys: del tenant o del deployment.

### Plan por fases

- Fase 1: preparar sin activar (tenant_id, tenant_members, tenant_configs, cablear DatabaseTenantConfigResolver).
- Fase 2: activar auth (tenantId en sesion, switch-tenant, rol por membresia, logContext.tenantId).
- Fase 3: cuotas y observabilidad (takeForTenant en chat/RAG/files, label tenant).
- Fase 4: billing (usage_events, agregacion, factura).
- Fase 5: tests end-to-end y tenant switcher.
- Fase 6: migrar cliente 1 a SaaS.

### Riesgos

- Bug de aislamiento = fuga entre clientes.
- TenantService cacheado: si admin mueve owner, cache vieja.
- Files/Rag/Workspace con db crudo: un fix que olvide tdb escribe bajo "default".
- scanByStatus global: si no se filtra, lee todo.
## InterrelaciÃ³n

Transversal al almacenamiento. Comparte db.ts con 04 y 05. Depende de 16.

## Riesgos

Fuga silenciosa. Cache desactualizada tras mover usuario. RLS desactivada.

## Tipo de fixes

MULTI_TENANT_SHARED=true por defecto. maintainTenant con scanByOwnerPrefix. Auditar this.db.list en service.ts. Files y Rag con tdb. Test de 50 tenants. Ãndice (owner, kind). RLS por defecto o doc. Tenant switcher. Rate limit por tenant en mÃ¡s sitios.
=======
# 07 — Aislamiento multi-tenant

> v1 · 2026-10-04 · Estado: audited
> Fuente: audit-tenant-default.txt, repodump db-tenant.ts, db-rls.ts

## Ontología del área

Conceptos: `Tenant`, `Owner`, `Membership`, `TenantScopedStore`, `peel`,
`scanByOwnerPrefix`, RLS, `MULTI_TENANT_SHARED`.

## Estado real del código

- `TenantScopedStore` envuelve `Store` y compone `tenantId:owner`.
- `peel(owner)` quita el prefijo al leer.
- `Store.scanByOwnerPrefix(kind, prefix, limit)` filtra por prefijo en SQL.
- `db-rls.ts` con `enableRls` opcional.
- `TenantService` con cache de 5 min.

## Evidencia

De `audit-tenant-default.txt`:
- 63 ocurrencias permitidas (comentarios, fallbacks declarados, tests).
- **2 ocurrencias prohibidas**. Casi nada.

Traducción ontológica: **el aislamiento multi-tenant está mucho más limpio
de lo que se suele asumir**. Los 2 casos prohibidos son puntos concretos,
no un problema estructural.

## Huecos concretos

- **RLS no activa por defecto**. `MULTI_TENANT_SHARED` debe estar en `true`.
- **`service.ts` con scans globales**: `collectActiveTenants` escanea
  `tenant-membership` hasta 5000; `maintainTenant` escanea `agent-settings`
  hasta 500.
- **`Files` y `Rag` reciben `db` crudo en algunos callers**. Los artifacts
  no aparecen en `agent.detail()` cuando se crean desde SOPs.
- **Cache de 5 min** de `TenantService`. Si se mueve a un usuario de tenant,
  sigue escribiendo en el viejo hasta 5 min.
- **No hay tests de fugas cruzadas con N tenants concurrentes**. Solo
  `tenant-isolation.test.ts` con 2.

## Interrelación

- Transversal a todo el almacenamiento.
- Comparte `db.ts` con `04-multi-usuario-concurrente`,
  `05-motor-tareas-durable`.
- Depende de `16-autenticacion` para resolver el owner real.

## Riesgos

- Fuga silenciosa: un tenant ve filas de otro y nadie lo nota.
- Cache de `TenantService` desactualizada tras mover un usuario.
- RLS desactivada por defecto.

## Tipo de fixes

1. `MULTI_TENANT_SHARED=true` por defecto en multi-tenant.
2. Reescribir `maintainTenant` para usar `scanByOwnerPrefix`.
3. Auditar todos los `this.db.list` en `service.ts`.
4. `Files` y `Rag` con `tdb` en todos los callers.
5. Test de 50 tenants concurrentes.
>>>>>>> fix/wave-01-learning-in-pkg
````

## File: docs/audits/09-kernel-cognitivo/roadmap.md
````markdown
<<<<<<< HEAD
# Roadmap — 09 kernel cognitivo

> v2 · 2026-10-07 · Estado: planned-v2 (post 09z Fases 1-3)

## 1. Promesa del repo
Cada turno se registra como Thought con AttentionVector real. Audit con
hash chain. Grafo compartido. El kernel decide qué se muestra, no solo
lo observa.

## 2. Estado verificado (post 09z)
- Kernel con openTurn, appendThought, closeTurn, openChildTurn.
- StoreTurnStore con closeTurnAndChildren + cache de getTurn (TTL 1s).
- StoreAuditStore con hash chain, CAS sobre anchor, verify fail-honest.
- Lifecycle wireado en `/health-deep` (`checkKernelHealth`).
- Snapshot con transacción + endpoints admin `/api/kernel/snapshot/export`
  e `/import`.
- Presenter wireado al SSE + `composeFromThoughts` (primary + secondary).
- Meta con 4 reglas + `consumeHint` + `evaluateWithProgress`.
- Rules con atención real (`isFocusedOn >= 0.7`).
- consolidate en `maintain()` con cap O(n²) de 200 por tenant.
- Autores (user, fast, slow) escriben AttentionVector real.
- Child turn en runtime (`model.ts`).
- TenantScopedCapabilityRegistry wireado en `service.ts`.
- 16 action verbs + 15 familias + OntologyBundle + validateAgainstMetamodel.

## 3. Huecos contra producción
- Tests de kernel (N10-N12) — bloque 01.
- Test `ontology.test.ts` — bloque 01.
- `StoreAuditStore.verify` con >10.000 entradas: fail-honest. Paginar
  con cursor keyset es trabajo del bloque 19 (backups).

## 4. Objetivo
El kernel decide qué se muestra, no solo lo observa. **Cumplido** en 09z.

## 5. Fronteras
- No cromos ni polaridad todavía. Eso es 09b/09c.
- No specs cognitivos por capacidad (CapabilitySpec.cognitive) todavía.
  Estructura declarada, sin poblar.

## 6. Conexiones
- Depende de: 05 (motor tareas), 08 (bus eventos), 10 (fast/slow).
- Dependen de esta: 11 (chat), 12 (contexto), 13 (UI servida).
- Archivos compartidos: kernel/*, conversation.ts, model.ts, service.ts.

## 7. Principios del PRODUCT.md
Kernel cognitivo. Materializar lo existente, no inventar abstracciones.

## 8. Cómo se verifica el cierre
- [x] Presenter decide el texto (wireado en conversation.ts).
- [x] Meta hint inyectado en el siguiente turno (systemContext.metaHints).
- [x] Rules.classify con isFocusedOn (rules.ts).
- [x] consolidate en maintain (service.ts).
- [ ] Test SSE que verifica que el Presenter decide el texto (bloque 01).
- [ ] Test `ontology.test.ts` (bloque 01).

## 9. Próximo bloque
**09b — Rediagnóstico.** Tras 09z Fases 1-3, reauditar el kernel
remodelado con Cline en Plan Mode. Detectar qué aflora al mirar con
el kernel ya materializado.
=======
# Roadmap — kernel-cognitivo

> v1 · 2026-10-04 · Estado: placeholder

Se rellena cuando se decida atacar esta rama.

## 1. Promesa del repo
## 2. Estado verificado
## 3. Huecos contra produccion
## 4. Objetivo y sub-objetivos
## 5. Fronteras
## 6. Conexiones con otras ramas
## 7. Principios del PRODUCT.md que toca
## 8. Como se verifica el cierre
>>>>>>> fix/wave-01-learning-in-pkg
````

## File: docs/audits/SOP.md
````markdown
# SOP â€” CÃ³mo se audita, diagnostica y arregla el repo

> v1 Â· 2026-10-05 Â· MÃ©todo oficial.

## Ciclo por bloque

Se repite para cada bloque NN del repo.

### 1. Ãrbol del repo

El humano entrega el Ã¡rbol actualizado del repo
(`Get-ChildItem -Recurse | Select FullName`) o el bloque lo pide si no lo tiene.
El Ã¡rbol se usa para verificar rutas antes de pedir archivos.

### 2. Repomix

El agente pide un repomix con los archivos que necesita:
    npx repomix --style markdown --include "<rutas>" --ignore "**/node_modules/**" --output repomix-bloqueNN.md

Reglas del repomix:
- Rutas verificadas contra el Ã¡rbol.
- Nunca rutas inventadas.
- Un repomix por bloque o por fase si es muy grande.

### 3. Inventario en chat

El agente lista:
- Archivos que ya tiene (con contenido).
- Archivos que necesita.
- Cambios ya hechos en el repo.
- Documentos del audit que existen (`miniaudit.md`, `roadmap.md`, `fixes.md`).

### 4. Repomix faltante

El humano entrega los repomix que el agente pide.

### 5. Preestrategia

El agente escribe en chat:
- DiagnÃ³stico hueco por hueco del miniaudit, con evidencia real (archivo:lÃ­nea + snippet).
- Veredicto por hueco: CONFIRMADO / FALSO / PARCIAL / FUERA DE ALCANCE / NO VERIFICABLE.
- Problemas nuevos detectados al leer el cÃ³digo.
- Lista de fixes reales (id, archivo, LOC aprox).
- Decisiones pendientes (numeradas).

### 6. ValidaciÃ³n

El humano responde a las decisiones en una lÃ­nea cada una.
Si hay algo mal, vuelve al paso 5.
Si estÃ¡ bien, se aprueba.

### 7. Mini scripts

El agente escribe un mini script PowerShell por fix:

    $path = "apps/server/src/..."
    $content = Get-Content $path -Raw
    if ($content -match "MARCA_V1") {
      Write-Host "SKIP" -ForegroundColor DarkGray
    } else {
      $anchor = @'
    <cÃ³digo actual>
    '@
      $replacement = @'
    <cÃ³digo nuevo>
    '@
      if (-not $content.Contains($anchor)) {
        Write-Host "MISS: anchor no encontrado" -ForegroundColor Yellow
      } else {
        $new = $content.Replace($anchor, $replacement)
        [System.IO.File]::WriteAllText((Resolve-Path $path), $new, (New-Object System.Text.UTF8Encoding $false))
        Write-Host "OK: MARCA_V1" -ForegroundColor Green
      }
    }

Reglas de los mini scripts:
- Uno por fix. Nunca varios fixes en un script.
- Marcas `NN-XX` (bloque-fix).
- Idempotente: si la marca existe, SKIP.
- Si el anchor no existe, MISS.
- Si dos fixes tocan la misma lÃ­nea, se aplican en serie.
- Antes de escribir el script, el agente verifica el anchor contra el archivo real.

### 8. AplicaciÃ³n

El humano ejecuta cada mini script y pega el output.
- `OK` â†’ siguiente fix.
- `SKIP` â†’ ya estaba, siguiente.
- `MISS` â†’ el agente ajusta el anchor y reenvÃ­a.

### 9. Cierre del bloque

- El agente escribe `docs/audits/NN/diagnostico.md` con el diagnÃ³stico real.
- El agente escribe `docs/audits/NN/fixes.md` con la tabla de fixes aplicados.
- Cline corre typecheck.
- Si hay errores, se resuelven con mini scripts.
- Si todo OK, el bloque se cierra y se pasa al siguiente.

### 10. Loop

Si un bloque no tiene `miniaudit.md` ni `roadmap.md`, primero se crean:
1. DiagnÃ³stico (paso 5).
2. Miniaudit (huecos declarados + huecos profundos).
3. Roadmap (estado verificado + huecos + objetivo + criterios de cierre).
4. Luego se aplican fixes (pasos 7-9).

## Reglas duras

- Rutas verificadas contra el Ã¡rbol. Nunca inventar.
- Evidencia real: archivo:lÃ­nea + snippet. Nunca parafrasear.
- Veredicto explÃ­cito por hueco. Nunca 100% PENDIENTE.
- Un fix = un mini script.
- Typecheck lo hace Cline.
- Tests al final (bloque 01).
- Modelo del repo: clone-por-cliente. Multi-tenant dinÃ¡mico estÃ¡ documentado aparte.

## Orden de bloques

00, 02, 07, 03, 04 ya cerrados.
05 en curso.
Siguientes: 06, 08, 09, 10, 11-25.
01 (tests) al final.
---

## PATCHSET_TECHNIQUE_V1 — la técnica oficial

### Nombre

- Cada `.ps1` de un bloque es un **patchset**.
- Cada fix dentro del patchset es un **hunk**.
- El conjunto de los 25 patchsets es el **audit-fix-bundle**.
- Vocabulario del repo: `Apply-Fix -Id -Path -Mark -Anchor -Replacement`.

### Qué es

Un patchset es un script PowerShell que aplica N cambios a archivos de código mediante find-and-replace verificado, sin AST, sin parser, sin diff/patch de GNU.

### Componentes de cada hunk

- **Id** (ej. `05-B9`).
- **Mark** (ej. `WORKER_RECOVERED_STATE_V1`): etiqueta única que queda en el código. Sirve para idempotencia.
- **Anchor**: fragmento literal del código actual que se va a reemplazar.
- **Replacement**: fragmento nuevo que sustituye al anchor.
- **Guard de idempotencia**: `if ($content -match "MARCA_V1") { SKIP }`.
- **Guard de anchor**: `if (-not $content.Contains($anchor)) { MISS }`.
- **Escritura atómica**: `[System.IO.File]::WriteAllText` con UTF-8 sin BOM.

### Por qué funciona

- No depende de AST ni de parser (rápido).
- Es idempotente (se puede re-ejecutar sin romper).
- Falla limpio: SKIP si ya está, MISS si el anchor no coincide, sin corromper.
- Auditable: cada fix deja una marca en el código.
- Portable: no requiere dependencias externas.

### Cuándo falla

- Cuando el anchor cambia por un fix anterior del mismo patchset (solapamiento).
- Cuando el archivo tiene CRLF y el anchor tiene LF (o viceversa).
- Cuando hay caracteres invisibles o encoding distinto.
- Cuando el anchor aparece más de una vez en el archivo.

**Prevención:** antes de escribir cada hunk, verificar el anchor con `Select-String` contra el archivo real. Si dos hunks tocan la misma línea, aplicar en serie.

### Qué NO es

- No es AST-based refactor.
- No es idempotente por hash (es idempotente por marca textual).
- No valida sintaxis antes de aplicar. El typecheck lo hace Cline al final.

### Nombres técnicos equivalentes

- Surgical patching.
- Idempotent find-and-replace patcher.
- Anchor-based codemod.
- Multi-hunk idempotent patch.

### Cómo se loguea lo que no entra

Todo hunk que da MISS se apunta en `docs/audits/_pendientes.md` con:
- Marca.
- Archivo.
- Anchor esperado.
- Anchor real (si se sabe).
- Replacement esperado.
- Motivo del MISS.
- Estado: pendiente / resuelto / revisar manualmente.

Al final de todos los bloques, otra IA retoma `_pendientes.md` y aplica los fixes con anchor actualizado.

### Reglas duras del patchset

- Un hunk = un fix. Nunca varios fixes en un solo hunk.
- Un patchset = todos los hunks de un bloque.
- Antes de escribir el patchset, el agente verifica los anchors.
- Antes de aplicar cada hunk, si hay riesgo de solapamiento, verificar con `Select-String`.
- Si un hunk da MISS, se loguea y se sigue con el siguiente. No se bloquea el patchset.
- Al final del patchset, se verifica con `Select-String` que todas las marcas están puestas.
- Las que no estén, van a `_pendientes.md`.

### Flujo del patchset

1. Diagnóstico del bloque.
2. Lista de hunks.
3. Validación del humano.
4. Patchset PowerShell.
5. Aplicación hunk por hunk.
6. Los OK quedan. Los MISS van a `_pendientes.md`.
7. Cierre del bloque.
8. Typecheck por Cline.
````

## File: docs/audits/09-kernel-cognitivo/09z-fundamentos.md
````markdown
# 09z — Fundamentos del kernel cognitivo

> v2 · 2026-10-07 · Estado: Fases 1-3 aplicadas

## Qué se ha aplicado

### Fase 1 — Fundamentos (`59d675e`)

Archivos nuevos:
- `packages/domain/src/actions.ts` — 16 verbos de acción.
- `packages/domain/src/taxonomy.ts` — 15 familias de capacidad.
- `packages/domain/src/ontology.ts` — OntologyBundle + CapabilitySpec + validateAgainstMetamodel.
- `packages/domain/src/ontology-seed.ts` — vocabulario base.

Fixes:
- `packages/domain/src/capability.ts` — `actionType` y `family` opcionales.
- `packages/domain/src/sop.ts` — `capabilityId` opcional en pasos.
- `packages/domain/src/agent.ts` — `ALLOWED_TASK_TRANSITIONS` + `canTransitionTask`.
- `apps/server/src/engine/capabilities/registry.ts` — `TenantScopedCapabilityRegistry`.

### Fase 2 — Migración (`7c9b936`)

- 19 capacidades de `bootstrap.ts` con `actionType` + `family`.
- `validateAgainstMetamodel` wireado en bootstrap del server.
- `canTransitionTask` en `worker.ts` y `service.ts`.
- `capabilityId` en pasos de SOP (38 coincidencias en seed).

### Fase 3 — Materialización (4 commits)

**Pipeline 1 — Fundaciones** (`140c18d`):
- `attention.ts` — `fromMetadata` con Zod real.
- `lifecycle.ts` — quitado `auditChainValid = true` siempre.
- `snapshot.ts` — import con transacción por lotes.
- `kernel-routes.ts` — endpoints `/api/kernel/snapshot/export` e `/import`.
- `app.ts` — `/api/health-deep` llama a `checkKernelHealth`.

**Pipeline 2 — Materialización core** (`7a5b6fa`):
- `service.ts` — `runMetaLoop` con `consumeHint`.
- `rules.ts` — `discard_reasoning_noise` después de atención.
- `model.ts` — `openChildTurn` si slow termina tras cerrar padre.

**Pipeline 3 — Comportamiento** (`69bbd01`):
- `user-author.ts`, `fast-author.ts`, `slow-author.ts` — atención real.
- `presenter.ts` — `composeFromThoughts`.
- `views.ts` — sin `as any` en `tenant.turns`.
- `consolidate.ts` — marca CONSOLIDATE_ACTION_V1.

**Pipeline 4 — Latencias** (`608cf07`):
- `consolidate.ts` — cap 200 thoughts por tenant.
- `views.ts` — `readView` con tope 200.
- `store-store.ts` — cache `getTurn` TTL 1s.

**Pipeline 5 — Cierre**:
**Pipeline 6 — slow-author atencion real**:
- `slow-author.ts` — `SLOW_AUTHOR_ATTENTION_V1` en reasoning y `SLOW_AUTHOR_DELEGATION_ATTENTION_V1` en delegation.

- `service.ts` — `TenantScopedCapabilityRegistry` wireado con resolver real.

## Qué NO hace esta fase

- No cromos ni polaridad.
- No specs cognitivos por capacidad (estructura declarada, sin poblar).
- No tests (bloque 01).

## Pendientes (bloque 01)

- Test `packages/domain/test/ontology.test.ts`:
  - slug canónico aceptado,
  - colisión con base rechazada,
  - bundle congelado devuelto.
- Test SSE que verifica que el Presenter decide el texto.
- Tests N10-N12 del kernel.

## Pendientes (bloque 19)

- `StoreAuditStore.verify` paginado con cursor keyset.
  Hoy: fail-honest (devuelve `false` si > `KERNEL_AUDIT_MAX_LIST`).

## Filosofía

- El vocabulario es estático. Se compila. No se reescribe en runtime.
- Se valida en bootstrap. Falla rápido.
- El runtime solo consulta. Cero latencia por validación.
- Materializar lo existente, no inventar abstracciones.
````

## File: docs/audits/09-kernel-cognitivo/miniaudit.md
````markdown
# 09 — Kernel cognitivo

<<<<<<< HEAD
> v2 · 2026-10-07 · Estado: audited-deep (post 09z Fases 1-3)
> Fuente: repo real, commits 59d675e, 7c9b936, 140c18d, 7a5b6fa, 69bbd01, 608cf07

## Ontología

Kernel, KernelContext, Thought, Turn, AttentionVector, ThoughtRole,
Promoter, Rules, Consolidate, Meta, Presenter, Views, Lifecycle,
Snapshot, Replay (pendiente).

## Estado real (post 09z)

El kernel ha sido remodelado en 3 fases:

- **Fase 1** (`59d675e`): fundamentos. 16 action verbs, 15 familias,
  OntologyBundle, CapabilitySpec, validateAgainstMetamodel, ALLOWED_TASK_TRANSITIONS.
- **Fase 2** (`7c9b936`): migración. 19 capacidades con actionType+family,
  validator wireado, canTransitionTask en worker+service, capabilityId en SOPs.
- **Fase 3** (4 commits: `140c18d`, `7a5b6fa`, `69bbd01`, `608cf07`): materialización.
  20 fixes en 4 pipelines.

## Huecos originales (miniaudit v1) — veredicto

| Hueco | Veredicto v2 | Evidencia |
|---|---|---|
| Presenter no wireado | **FALSO** | `conversation.ts` llama `presentText` → `presenter.presentTurn` |
| Meta sin consumidor | **FALSO** | `service.ts` `runMetaLoop` con `consumeHint`, hints al bus |
| Rules.ts sin atención | **FALSO** | `rules.ts` `survive_high_attention_focus` con `isFocusedOn >= 0.7` |
| consolidate no en maintain | **FALSO** | `service.ts` llama `runConsolidateLoop()` en `maintain()` |

## Problemas nuevos N1-N12 — veredicto v2

| ID | Problema | Veredicto |
|---|---|---|
| N1 | `lifecycle.auditChainValid = true` siempre | **RESUELTO** (P1.2) |
| N2 | `snapshot.ts` sin transacción | **RESUELTO** (P1.3) |
| N3 | `views.ts` con `as any` | **RESUELTO** (P3.5) |
| N4 | `attention.fromMetadata` sin validar | **RESUELTO** (P1.1) |
| N5 | `consolidate.key()` sin `tenantId` | **PARCIAL** (agrupa por tenant antes, no colisiona) |
| N6 | `rules.ts` orden de reglas | **RESUELTO** (P2.2) |
| N7 | `lifecycle.ts` no wireado | **RESUELTO** (P1.6) |
| N8 | `snapshot.ts` no wireado | **RESUELTO** (P1.5) |
| N9 | `views.ts` con `?? []` mal | **RESUELTO** (P3.5) |
| N10 | tests `closeTurnAndChildren` profundo | **APLAZADO** (bloque 01) |
| N11 | `kernel-meta-context.test.ts` usa `require` | **APLAZADO** (bloque 01) |
| N12 | `kernel-presenter.test.ts` no verifica persistencia | **APLAZADO** (bloque 01) |

## Pipeline 6 — slow-author atencion real

- `slow-author.ts` — atencion real en `writeReasoning` y `writeDelegation`.
- Marcas `SLOW_AUTHOR_ATTENTION_V1` y `SLOW_AUTHOR_DELEGATION_ATTENTION_V1`.

## Pendientes reales

1. `TenantScopedCapabilityRegistry` **wireado** en `service.ts` (Pipeline 5, Fix A).
2. `StoreAuditStore.verify` — fail-honest (devuelve `false` si > `KERNEL_AUDIT_MAX_LIST`).
   Decisión: se deja así. Paginar con cursor keyset es trabajo del bloque 19 (backups).
3. Tests kernel (N10-N12) + `packages/domain/test/ontology.test.ts` — bloque 01.

## Interrelación

Depende de 05, 08, 10. Alimenta a 11 y 12.

## Riesgos

- Kernel escribe más de lo que se lee. **Mitigado**: presenter, meta, promoción
  y consolidación leen lo que escriben.
- Meta escribe run-events que nadie limpia. **Mitigado**: purge cada 90 días en
  `maintain()` (run-events en `purgeTargets`).

## Tipo de fixes aplicados

- Wire del Presenter al SSE. ✅
- Wire de Meta.evaluate en el chat + consumeHint. ✅
- Rules.classify con isFocusedOn >= 0.7. ✅
- consolidate en maintain cada minuto. ✅
- Atención real en los 3 autores. ✅
- Presenter compuesto (primary + secondary). ✅
- Child turn en runtime (model.ts). ✅
- Snapshot con transacción + endpoints admin. ✅
- Lifecycle wireado en `/health-deep`. ✅
- Audit con correlationId. ✅
- Latencias: consolidate O(n²) acotado, views paginado, getTurn cache. ✅

## Verificación

- Typecheck verde tras cada pipeline.
- 4 commits independientes, cada uno aprobable.
- Pendiente: test SSE que verifica que el Presenter decide el texto (bloque 01).
=======
> v1 · 2026-10-04 · Estado: audited
> Fuente: repodump apps/server/src/kernel/*, KERNEL_SPEC.md

## Ontología del área

Conceptos: `Kernel`, `KernelContext`, `Thought`, `Turn`, `AttentionVector`,
`MatchedNode`, `IgnoredNode`, `MatchReason`, `IgnoreReason`, `ThoughtRole`,
`Promoter`, `Rules`, `Consolidate`, `Meta`, `Presenter`, `Views`.

Es el centro cognitivo. Chat, tareas, SOPs y auditoría pasan por aquí.

## Estado real del código

- `Kernel` con `openTurn`, `openChildTurn`, `appendThought`, `closeTurn`,
  `thoughtsOf`, `listTurns`, `findOpenTurnForThread`.
- `StoreTurnStore` con `closeTurnAndChildren` (fix de este pase).
- `StoreAuditStore` con hash chain y CAS sobre anchor con id fijo.
- `Meta` con 4 reglas. `Promoter` con destinos (memory, business-graph,
  audit). `Views` con readView. `SlowAuthor`, `FastAuthor`, `UserAuthor`.

## Evidencia

- `StoreAuditStore.verify` falla al pasar 10.000 entradas (fix de este pase).
- El `Presenter` existe pero `conversation.ts` no lo llama.
- `Meta.evaluate` corre en `maintain()` pero nadie lee los hints.
- `Rules.classify` no usa `attention`.

## Huecos concretos

- Presenter no wireado al SSE.
- Meta sin consumidor.
- Rules.ts sin atención.
- `consolidate` no se llama en `maintain`.
- `verify` bloqueado a 10.000 entradas (fix de este pase).

## Interrelación

Centro cognitivo. Depende de `05`, `08`, `10`. Alimenta a `11`, `12`.

## Riesgos

- El kernel escribe más de lo que se lee.
- El Presenter nunca se cablea.
- Meta escribe `run-events` que nadie limpia.

## Tipo de fixes

1. Wire del Presenter al SSE en `conversation.ts`.
2. Wire de `Meta.evaluate` en el flujo del chat.
3. `Rules.classify` con `isFocusedOn(vector, node) >= 0.7`.
4. `consolidate` en `maintain()` cada 5 min.
5. Test end-to-end: chat → openTurn → appendThought → closeTurn → promote.
>>>>>>> fix/wave-01-learning-in-pkg
````

## File: docs/audits/_pendientes.md
````markdown
# Pendientes â€” fixes que no entraron

> Doc vivo. Se actualiza cada vez que un mini script da MISS y no se resuelve en el momento.

## Bloque 05

| Marca | Archivo | Motivo | Estado |
|-------|---------|--------|--------|
| WORKER_STATUS_FIELD_V1 | apps/server/src/engine/worker.ts | Anchor con comentario intermedio no previsto | pendiente |
| WORKER_PLAN_EVENT_V1 | apps/server/src/engine/worker.ts | Anchor del compareAndSwap no coincide | pendiente |
| RUN_EVENT_CORRELATION_V1 | apps/server/src/engine/worker.ts | Anchor del put run-events no coincide | pendiente |
| WORKER_STATUS_THROTTLE_V1 | apps/server/src/engine/worker.ts | Anchor del if(this.running) no coincide | pendiente |
| CURSOR_VALIDATE_V1 | apps/server/src/db.ts | Anchor no coincide exacto | pendiente |
| IDEMPOTENCY_RESERVE_V1 | apps/server/src/engine/transaction.ts | Anchor no coincide exacto | pendiente |

## Bloque 04

| Marca | Archivo | Motivo | Estado |
|-------|---------|--------|--------|
| (fase 2) | varios | Requiere mÃ¡s archivos | pendiente |

## Bloque 03

| Marca | Archivo | Motivo | Estado |
|-------|---------|--------|--------|
| (ninguno) | â€” | â€” | â€” |

## Reglas

- Cada MISS se apunta aquÃ­ con archivo y motivo.
- Al cierre de cada bloque se revisan los pendientes y se deciden:
  - Aplicar con nuevo anchor.
  - Descartar (falso positivo).
  - Aparcar para otro bloque.
- El doc no se borra. Se actualiza.
---

## Bloque 06

### ACTION_EDIT_ENDPOINT_V1

- Archivo: `apps/server/src/engine/routes.ts` (o donde viva `/api/actions/:id/decide`)
- Anchor esperado: `// ACTIONS_AUDIT_ENDPOINT_V1 — audit trail de una acción.`
- Motivo: MISS. El endpoint `/decide` **no está en `engine/routes.ts`**. Hay que localizarlo (probablemente en `app.ts` o en otro router) y meter el `/edit` ahí.
- Replacement esperado:
      app.post("/actions/:id/edit", async (c) => {
        const owner = c.get("owner");
        const id = c.req.param("id");
        const body = z.object({
          data: z.record(z.string(), z.unknown()),
          expectedHash: z.string().length(64),
        }).parse(await c.req.json());
        return c.json(await service.actions.edit(owner, id, body.data, body.expectedHash));
      });
- Estado: pendiente

### USER_ID_REAL_V1 (route)

- Archivo: el que registre `/api/actions/:id/decide`.
- Motivo: MISS. El handler no está en `engine/routes.ts`.
- Replacement esperado: leer `x-user-id` del header y pasarlo a `service.actions.decide(owner, id, hash, decision, userId)`.
- Estado: pendiente

### 06-B17 attempts en ActionProposal

- Archivo: `packages/domain/src/index.ts` (schema `proposalSchema`).
- Motivo: falta el archivo.
- Replacement esperado: añadir `attempts: z.number().int().min(0).default(0)` al schema.
- Estado: pendiente

### 06-N1 kind whitelist

- Archivo: `apps/server/src/actions.ts`.
- Motivo: falta ver `proposalSchema.kind`.
- Replacement esperado: si el enum no cubre la lista, añadir whitelist explícita.
- Estado: pendiente

### 06-N7 attempts schema (duplicado de 06-B17)

- Mismo fix. Se unifica con 06-B17.
- Estado: pendiente

### 06-B12 windowMs por tenant

- Archivo: `apps/server/src/actions-deferred.ts` + `index.ts`.
- Motivo: requiere que `DeferredActions` consulte `TenantConfig` en runtime.
- Fix: cambiar `cfg.windowMs` fijo por callback que lea de `tenantService`.
- Estado: pendiente

### 06-B13 notificar firmantes

- Archivo: `apps/server/src/actions.ts`.
- Motivo: requiere `DeferredActions.get` (ya añadido) + lógica nueva.
- Fix: tras `approve`, si `record.needed > record.signers.length`, emitir notificación al siguiente firmante.
- Estado: pendiente

### 06-N4 modal usa ApprovalInbox

- Archivo: `apps/web/src/components/ApprovalModal.tsx`.
- Motivo: refactor grande (mover lógica al Inbox).
- Estado: pendiente

### 06-B9 / 06-B18 audit en modal

- Archivo: `apps/web/src/components/ApprovalModal.tsx`.
- Motivo: requiere fetch adicional y renderizado.
- Fix: añadir useEffect que llame a `/actions/:id/audit` y renderizar la lista.
- Estado: pendiente

### 06-N11 re-fetch modal cada 5s

- Archivo: `apps/web/src/components/ApprovalModal.tsx`.
- Motivo: mejora nueva, no es del miniaudit.
- Fix: `setInterval` que re-consulta la acción y actualiza estado si el hash cambió.
- Estado: pendiente
## Tanda 1 Fase 2 - MISS 2026-10-06 18:57

- F2-01-01 : MISS anchor en apps\server\src\engine\capabilities\bootstrap.ts
- F2-01-02 : MISS anchor en apps\server\src\engine\capabilities\bootstrap.ts
- F2-01-03 : MISS anchor en apps\server\src\engine\capabilities\bootstrap.ts
- F2-01-04 : MISS anchor en apps\server\src\engine\capabilities\bootstrap.ts
- F2-01-05 : MISS anchor en apps\server\src\engine\capabilities\bootstrap.ts
- F2-01-06 : MISS anchor en apps\server\src\engine\capabilities\bootstrap.ts
- F2-01-07 : MISS anchor en apps\server\src\engine\capabilities\bootstrap.ts
- F2-01-08 : MISS anchor en apps\server\src\engine\capabilities\bootstrap.ts
- F2-01-09 : MISS anchor en apps\server\src\engine\capabilities\bootstrap.ts
- F2-01-11 : MISS anchor en apps\server\src\engine\capabilities\bootstrap.ts
- F2-01-12 : MISS anchor en apps\server\src\engine\capabilities\bootstrap.ts
- F2-01-13 : MISS anchor en apps\server\src\engine\capabilities\bootstrap.ts
- F2-01-15 : MISS anchor en apps\server\src\engine\capabilities\bootstrap.ts
- F2-01-17 : MISS anchor en apps\server\src\engine\capabilities\bootstrap.ts
- F2-01-18 : MISS anchor en apps\server\src\engine\capabilities\bootstrap.ts
- F2-01-19 : MISS anchor en apps\server\src\engine\capabilities\bootstrap.ts
- F2-04-01 : MISS anchor en apps\server\src\engine\service.ts

## 09z Fase 3 - cierre (2026-10-07)

### Aplicados
- **Pipeline 1**: attention Zod, lifecycle, snapshot, health-deep.
- **Pipeline 2**: meta consumeHint, rules order, child turn.
- **Pipeline 3**: atencion real autores, presenter compose, views sin as any.
- **Pipeline 4**: consolidate O(n2) cap, views paged, getTurn cache.
- **Pipeline 5**: TenantScopedCapabilityRegistry wireado en service.ts.

### Pendientes (bloque 01 - tests)
- `packages/domain/test/ontology.test.ts` (slug, colision, bundle congelado).
- Test SSE que verifica que el Presenter decide el texto.
- Test `closeTurnAndChildren` con arbol profundo (N10).
- `kernel-meta-context.test.ts` con import en vez de require (N11).
- `kernel-presenter.test.ts` verifica persistencia (N12).

### Pendientes (bloque 19 - backups)
- `StoreAuditStore.verify` paginado con cursor keyset. Hoy fail-honest:
  devuelve `false` si el list llega a `KERNEL_AUDIT_MAX_LIST` (10.000).

## 09z Fase 3 - Pipeline 6 (2026-10-07)

- slow-author.ts: atencion real en reasoning y delegation (SLOW_AUTHOR_ATTENTION_V1 + SLOW_AUTHOR_DELEGATION_ATTENTION_V1).
````
