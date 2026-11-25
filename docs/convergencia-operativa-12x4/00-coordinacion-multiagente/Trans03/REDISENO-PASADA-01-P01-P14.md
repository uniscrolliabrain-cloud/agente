# Trans03 — pasada integral 1: rediseño técnico candidato
Prevalece sobre T01/T02 en contradicciones; conserva evidencia histórica. Solo documentación. Core generalista, no dominios nuevos. Fast no propone operaciones; Slow propone, kernel decide, runtime ejecuta. No segundo OAuth, dispatcher, registry ni JEV.
## Matriz completa de trabajo
P01 transporte Meta/Evolution; P02 OAuth identidad/scopes; P03 refresh/revoke; P04 Google transport; P05 WhatsApp ingress; P06 outbound/receipt; P07 Gmail; P08 Calendar; P09 Drive/RAG; P10 Places; P11 media/JEV/Composio; P12 cyber instalado; P13 H03/fixtures; P14 gate. F01 consolidación P01–04; F02 P13; F03 P11; F04 P05–06; F05 P07–10; F06 P13; F07 solo sandbox; F08 P12; F09 P13; F10/11 fuera de core actual, no nuevos dominios; F12 P14. Orden P01–04 antes de wiring, P13 fixtures temprano, P14 al final. Contratos Trans01 A01/A02/A03/E01/E03, Trans02 P03/P04/P06/P08/P11, Trans04 H03.
## P01 transporte
Meta blob 25162f88 y Evolution 2c0f5c32 ya corrigen 429, redirect, ID textual y cancelación de cuerpo. No repetir. Meta request antes de fetch:
```ts
if (!/^v[0-9]+\.[0-9]+$/.test(this.version)) throw new AppError("Version Meta invalida",503);
if (!/^[0-9]+$/.test(this.options.phoneNumberId!.trim())) throw new AppError("Cuenta Meta invalida",503);
```
Verificar fixtures usan IDs reales o ajustar validación a contrato documentado sin false positives. markRead validar respuesta según upstream antes de declarar éxito; no inferir delivery. Evolution url valida HTTPS, sin userinfo/query/hash, host allowlist de operador; no aceptar URL de usuario. Reusar validación outbound; exigir allowlist de egress en red para evitar DNS rebinding, no resolver DNS como única protección. Antes de fetch signal?.throwIfAborted() (clasificar predispatch en caller). Tests 429, 408, 5xx, redirect, malformed 2xx, invalid config cero fetch. Rollback cliente anterior solo si conserva garantías.
## P02 OAuth
google-auth.ts 09125166: accessToken devuelve token fresco sin membership; callback/refresh verifican owner en vez de authorizer. Añadir en accessToken tras tokens check:
```ts
const scope=currentTenantScope();
if(tokens.tenantId){
 if(!scope||scope.tenantId!==tokens.tenantId||!this.checks.membership)
  throw new AppError("Google connection scope unavailable",403);
 await this.assertMembership(tokens.authorizer??owner,tokens.tenantId);
 await this.assertMembership(scope.actorId,tokens.tenantId);
}
```
No usar este guard para callback sin scope; callback restaura scope desde state y verifica state.authorizer??state.owner antes y después de red. Legacy sin atribución no elegible para governed shared mode; preservar compat explícita. Introducir operación específica en nuevo puerto interno, no cambiar UI write marker sin reserva. Scope map: Gmail read/send/reply (reply requiere read metadata y send; perfil actual exige read), Calendar list/read/write, Drive read/write; Docs export usa Drive read, no Docs create/update en core. Evaluar scopes alternativos según upstream; no ampliar consentimiento automáticamente. Tests token fresco revocado, actor distinto, authorizer revocado, membership outage, scope insuficiente cero fetch.
## P03 refresh y binding
Mismo blob: refreshKey actualmente owner:connectionId; usar JSON.stringify([tokens.tenantId??null,owner,tokens.connectionId]) para separar tenant. No confundir credential.generation (rota en save/connect) con versión de token; aprobación liga connectionId y generación de binding estable, refresh no invalida por sí solo. Releer conexión después de await refresh y antes de entregar token, comprobar connectionId y scope; evitar devolver token si disconnect/reconnect durante await. En refresh preservar scopes devueltos por proveedor si presentes, no ampliar por inferencia:
```ts
const refreshed={...tokens,accessToken:token.access_token,
 refreshToken:token.refresh_token??tokens.refreshToken,
 scopes:token.scope===undefined?tokens.scopes:token.scope.split(/\s+/).filter(Boolean),
 expiresAt:Date.now()+token.expires_in*1000};
```
Validar expires_in finito positivo y scope parse. CAS updateCredential por connectionId ya existe; revisar Trans01 Store si generación también necesaria. No prometer atomicidad entre recheck y remote call; revocation after dispatch outcome unknown. OAuth callback fallback scope state.scopes solo si semántica upstream confirmada; no asumir permiso en ausencia de evidencia. Tests refresh singleflight dos tenants, revoke during refresh, reduced scopes, callback generation race. Rollback governed port off.
## P04 Google transport
google.ts 12b2dcbe: request write 429 actualmente GoogleApiError; alinear política conservadora:
```ts
if(write&&(response.status>=500||response.status===408||response.status===429)){
 await response.body?.cancel().catch(()=>{});
 throw new OutcomeUnknownError();
}
```
En request y requestBytes error HTTP no propagar provider body privado; conservar status y mensaje fijo, cancelar cuerpo. Verificar callers que dependen de detail antes de cambio. No retry de mutaciones; read retries acotados solo donde existentes. Google OutcomeUnknownError local tiene code outcome_unknown; Trans01 classifier debe reconocerlo sin instanceof de clase distinta; no crear otro error. Tests 429/timeout/malformed success, no PII, read retry vs write once.
## P05 inbound
whatsapp-inbound.ts d1cebaf6: inbox dedupe key estable pero payload conflict no se verifica. Después de if(!inbox) y antes de queued return:
```ts
if(inbox.tenantId!==binding.tenantId||inbox.owner!==binding.owner||
 inbox.provider!==message.provider||inbox.accountId!==message.accountId||
 inbox.providerMessageId!==message.id||inbox.from!==message.from||
 inbox.text!==message.text||inbox.sopId!==binding.sopId)
 throw new AppError("Conflicto de mensaje WhatsApp",409);
```
Binding SOP rotation: preservar original inbox y no redespachar; si política permite replay tras cambio, comparar solo payload y scope, validar original SOP antes de recovery. No crear nueva tarea por conflicto. whatsapp-routes.ts 92637de0: HMAC raw bytes ya correcto; limitar body antes de arrayBuffer/json mediante middleware existente (buscar app body limit antes de duplicar), rate limit autenticado y límite preauth en edge. JSON malformed 400 sin leak. Tests batch partial crash/replay, duplicate conflicting payload, cross tenant, oversized, bad HMAC, ignored status not delivered.
## P06 outbound
whatsapp-outbound.ts 7f4401b4: insertIfAbsent + CAS attempt ya existe; no segundo ledger. Separar error antes de invocar sender de error después; no clasificar AppError genérico <500 como definitivo postdispatch. Candidate:
```ts
let dispatched=false;
 // después de última autorización y construcción sender, justo antes de sendText:
 dispatched=true;
 // catch:
 status=!dispatched?"failed":"outcome_unknown";
 errorCode=!dispatched?"predispatch_denied":"provider_outcome_unknown";
```
Reintroducir failed postdispatch solo mediante error tipado explícito de rechazo definitivo, no status genérico. Validate result.id typeof string trim y accepted===true. Reconciliación operator providerChecked true es reported, no verified; exigir evidencia persistida para promotion Trans02 P03. Recheck membership/PDP y expiry tras claim, usar Trans01 authorization port; no activar nuevo sender sin reserva. CacheStatus failure no reenvío, replay authoritative operation. Tests concurrent approve, revocation, sender throws AppError after effect, late CAS vs reconcile, cache failure, forged evidence. Rollback stop outbound, preserve ledger.
## P07 Gmail
sendEmail ya valida MIME/reply threading y messageReceipt. Mantener. Receipt id/threadId acredita recurso, no entrega. Bind draft digest a recipients, attachment hashes, thread, connection and policy; no reenvío si unknown. Use stable operation reference from kernel for reconciliation; random MIME Message-ID actual no idempotency guarantee. No cambiar a deterministic ID sin contrato. Tests thread mismatch, attachment revision, scope revoke, 429, receipt wrong id, no duplicate.
## P08 Calendar
createEvent/updateEvent/deleteEvent existentes; update/delete usan If-Match. Require expectedVersion en governed path, preserve legacy optional signature. eventReceipt readSingleEvent verify returned id matches requested before projection. No inferir disponibilidad de lista truncada 100; no booking automático. Test stale etag 412, unknown create, wrong calendar, recurrence deny, no retry.
## P09 Drive/RAG
list/get/read/trash/rename existentes; Docs export no equivale a create/update. RAG port source ACL + connection generation, deny if no authoritative ACL; Trans02 P08 owns context. Governed mutation requires revision/receipt; no delete/share nuevos. Test revoked source same content, changed account, oversize, export, unknown rename. No new OAuth.
## P10 Places
google-maps.ts 22042adf: limit NaN/fraction and malformed 200 currently empty success. Candidate:
```ts
const requested=input.limit??PLACES_MAX_RESULTS;
if(!Number.isSafeInteger(requested)||requested<1||requested>PLACES_MAX_RESULTS)
 throw new AppError("Limite Places invalido",422);
const limit=requested;
```
Before parsing error cancel body, status only; successful payload null/nonobject or places present nonarray → 502. Empty object valid only if upstream confirms empty result. Dedup by placeId and slice limit; rating finite 0..5, reviews nonnegative integer. Tenant budget in existing capability admission, no scraper. Tests malformed, duplicate, limit, quota, no contact action.
## P11 media/JEV/Composio
Reuse Trans02 jev-classifier/egress; no transport duplicate. Existing C05 media lifecycle only; verify upstream and installed ABI before adding adapter. No new provider endpoint by guess. Composio no production registry until contract; default deny port, no Fast egress. Tests zero calls without consent/binding, epoch stale, abort/unknown, provider down Fast unaffected. No new domains.
## P12 cyber
Installed tarball alpha.2 and sdk-adapter/event-relay only; verify pinned artifact SHA/license/provenance and actual SDK methods. Preserve partial coverage and no security guarantee. Trans02 owns projection, Trans04 deployment. No remediation effects. Test wrong tenant/hash, replay, ACK loss, revoked grant.
## P13 H03 + fixtures
Use Trans04 registry and bounded sink. Candidate logical dimensions provider enum, stage admission/dispatch/receipt/reconcile, outcome accepted/confirmed/unknown/denied/failed; no tenant/account/payload labels. Count winning terminal CAS once; attempts separate. Fixtures two tenants same IDs, provider 429/timeout, revoke, duplicate, late receipt, no network. Reuse existing test runner.
## P14 gate
Historical T02-B2 tests passed on 1143d702, not current HEAD. Run focal tests whatsapp-adapter/webhook/outbound/inbound, oauth/google, vertical-slice-google-connection, cognition-v2-jev-egress/voice, then typecheck/gate/verify:slice/gate:cognition-v2. Record SHA, backend, Node, exit, skips. Restricted PG and sandbox separately. No production effects. Rollback flags off, retain receipts/claims, no blind resend.
## Evaluación pasada 1
Arquitectura 9.1; granularidad 8.0; anclas 8.8; código 8.0; wiring 7.8; tests 8.3; autonomía 7.9; rollback 8.6. Media 8.3125. Revisión estática parcial, no compilación ni tests nuevos; falta inspección exhaustiva de canónica y callers, SDK y contratos Trans04. No GO.
