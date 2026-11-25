# Pasada 03 — circuitos completos, simulación adversarial y patchsets
Base: pasada 01/02; prevalece en conflictos. Evidencia nueva: actions.ts b8af1e88 L540–640, workspace.ts 1b379fc3 L727–875, google-auth.ts 09125166 L295–378, provider-spec.ts 28651041, cognition/v2/provider.ts 8997051e. No implementación autorizada.
## Estrategia
El objetivo no es aumentar proveedores sino cerrar un circuito reusable de evidencia: intención humana autenticada → Slow → aprobación revisada → claim único → binding autorizado → adaptador → resultado estructurado → receipt durable → bus → proyección cognitiva → Fast narra. Separar tres verdades: decisión humana, efecto remoto y conocimiento. Un fallo de proyección no convierte un envío aceptado en fallido. Una aceptación remota no prueba entrega. Una simulación local nunca prueba efecto remoto. Los adaptadores son hojas, no orquestadores.
## Diagnóstico y feedback de simulación
S1: Calendar crea remoto, db.put local falla. Workspace.execute lanza error genérico fuera de providerWrite, ActionService.run clasifica failed; posible reintento indebido. Corrección: sacar cache de frontera de efecto y preservar receipt estructurado.
S2: Gmail devuelve ID, proceso cae antes de ActionService.db.put. Claim queda executing; nunca repetir automáticamente. Trans01 A03 recovery unknown y E03 atómico con terminal local; no transacción distribuida ficticia.
S3: conexión A se rota a B entre envío y emailReceipt. Workspace.emailReceipt usa conexión actual, no original; un ID coincidente no prueba operación. Resolver receipt por binding original y bloquear si revocado.
S4: token fresco de autorizer expulsado. accessToken devuelve sin membership; dos callers comparten refresh promise, autorización debe ser por caller y no por promise.
S5: sample execute devuelve texto local, ActionService marca provider google. No inferir proveedor real de status succeeded.
S6: providerWrite acepta cualquier status 4xx antes de unknown; 429 o error con marca unknown puede perder clasificación. Priorizar marca unknown.
S7: Calendar serialized es insuficiente para prometer exclusión entre procesos y terceros. Mantener revalidación, no garantizar slot global.
S8: Fast/Slow provider.ts usa env por lane, provider-spec ya existe. No crear registry paralelo; tenant-config/Trans04 debe resolver perfil autorizado antes de activación shared.
S9: cyber ACK perdido tras commit, replay debe recuperar ACK sin repetir proyección; grant one-use no reintentar.
S10: WhatsApp webhook válido duplicado con payload alterado; no reencolar. P05 guard de pasada 02.
## P01/P04: frontera de transporte
Mantener métodos públicos y errores existentes. En workspace.ts providerWrite catch, antes de cualquier status:
```ts
const markedUnknown = error instanceof Error &&
 (("outcomeUnknown" in error && error.outcomeUnknown===true)||
 ("code" in error && error.code==="outcome_unknown"));
if(markedUnknown) throw error;
const status=(error as {status?:number})?.status;
if(status===408||status===429) throw Object.assign(
 new AppError("Provider outcome uncertain",502),
 {outcomeUnknown:true,code:"outcome_unknown"});
```
Después conservar rechazo explícito y fallback unknown. En google.ts request 429/408/5xx y malformed write success unknown; no retry. P01 Meta/Evolution mantener guards y límites de pasada 01/02. Test 429 con status, unknown con 4xx, timeout, malformed 2xx, error predispatch, no PII. No tocar shared error ABI sin Trans01.
## P02/P03: binding por caller
En accessToken reemplazar cuerpo (candidate; currentTenantScope import verificar contra tenancy real antes de aplicar):
```ts
const initial=await this.tokens(owner);
if(!initial||expectedConnectionId&&initial.connectionId!==expectedConnectionId)
 throw new AppError("Google connection changed",409);
await this.assertOperationalBinding(owner,initial);
if(initial.expiresAt<=Date.now()+60000){
 const key=JSON.stringify([initial.tenantId??null,owner,initial.connectionId]);
 let pending=this.refreshing.get(key);
 if(!pending){
  pending=this.refresh(owner,initial).finally(()=>this.refreshing.delete(key));
  this.refreshing.set(key,pending);
 }
 await pending;
}
const current=await this.tokens(owner);
if(!current||current.connectionId!==initial.connectionId)
 throw new AppError("Google connection changed",409);
await this.assertOperationalBinding(owner,current);
return current.accessToken;
```
assertOperationalBinding exige membership dependency para attributed tenant, authorizer y caller autenticado; legacy no shared. refresh preserva token rotado y scopes reducidos solo si tokenSchema soporta campos; ampliar schema aditivamente. Callback verifica authorizer antes/después. P02 operation scopes de pasada 02: corregir gmail.send exige read profile y send, calendar.list exige calendarlist.readonly o calendar; conservar write marker UI. No hacer authz de caller dentro de singleflight. Tests concurrent actor revoke, fresh revoke, scope reduction, reconnect while refreshing.
## P05/P06 WhatsApp
Mantener ledger y draft. Revalidar expiry/connection/PDP después de claim y antes de send; distinguir predispatch de postdispatch unknown. Guard payload immutable inbound, recovery SOP autorizado, CAS loser re-read. P06 receipt adapter E03 usa operationId/attemptId existente; no claim adicional. Reconcile operador reported, no verified. Simulación: send accepted, CAS falla → no resend, operator reconciliation; replay no provider. Tests existentes + concurrent approval, post-effect AppError, duplicate payload, lost ACK.
## P07–P09: eliminar ambigüedad texto/efecto
Nuevo tipo candidato local a workspace.ts, no segundo contrato de kernel:
```ts
type WorkspaceEffect =
 | {mode:"sample";state:"simulated";summary:string}
 | {mode:"live";state:"accepted";family:"gmail";messageId:string;threadId?:string;summary:string}
 | {mode:"live";state:"accepted";family:"calendar";calendarId:string;eventId:string;operation:"create"|"update"|"delete";summary:string}
 | {mode:"live";state:"accepted";family:"drive";fileId:string;operation:"rename"|"trash";summary:string};
```
Contrato propuesto para Trans01 E03, no asumir que ya exportado. Extraer executeEffect(owner,input,connectionId,targetVersion):Promise<WorkspaceEffect> del execute actual, mantener execute wrapper devuelve summary para legacy. ActionService options.execute actual devuelve string; owner Trans01 debe migrar composición explícita a executeEffect y receipt terminal. Hasta entonces governed mode NO_GO, no parsear strings. Sample branches devuelven simulated, nunca live. Gmail return usa receipt.id y threadId real; no fallback a input como evidencia. Calendar create/update/delete y Drive return estructurado con target original. Para cache post-effect:
```ts
// solo después de obtener resultado remoto válido
try { await this.db.put(owner,"events",created); }
catch { /* cache degradada: no relanzar como fallo del efecto */ }
```
En implementación sustituir comentario por hook acotado de cache_degraded sin IDs; reconciliar cache desde receipt durable, no swallow silencioso. Delete cache remove igual. Si crash antes de receipt durable, A03 unknown. No persistir receipt en dos ledgers.
Workspace.emailReceipt/eventReceipt añadir expectedConnectionId obligatorio en nuevo governed reader; conservar firma legacy para UI. Leer conexión y comparar original antes de construir cliente; getAccessToken closure revalida cada request. Receipt verifica message/event ID y calendar exactos; delete/trash requieren verificador específico, 404 solo no prueba autoría. No proyectar verified_fact hasta familia aprobada. Drive/RAG source ACL y generation, no identidad por contenido. Attachments: revisar bytes digest al aprobar y justo antes de send, no aceptar cambio de artifact bajo mismo ID. Calendar targetVersion ya requerido en execute; no duplicar. Tests sample no google receipt, cache fail accepted, wrong binding, wrong ID, stale etag, attachment changed, lost response.
## P10 Places
Guard entero/finito, schema estricto y dedup de pasada 01/02; distinguir empty legítimo de malformed. Budget en admission, no contactar leads. Tests 429/NaN/duplicates/empty/malformed.
## P11 perfiles/media/JEV
provider-spec.ts enum google/anthropic/openai/openrouter. provider.ts env FAST/SLOW; no inventar provider nuevo. Proponer constructor con perfil resuelto por tenant-config existente, preservar fromEnv para single tenant explícito. No pasar apiKey al modelo ni al bus. Trans04 owns resolver/allowlist; Trans02 owns JEV gate. Voice coordinator existente owns epoch/consent; C05 media absent, no fake Anam transport. Simular revoke durante stream: abort, no stale turn, no nueva sesión automática. Composio no generic proxy.
## P12 cyber
SDK governedRead one-use, validate grant expiry/token immediately before dispatch, no retry. Relay requires project in production, safe integer cursor, transaction same store, fence by Trans02. ACK only after commit; pending ACK recovery. No security guarantee. Tests missing project, replay hash mismatch, overflow, revoke, ACK lost.
## P13/P14 matriz adversarial
Fixture table: predispatch denial→0 calls/failed_without_effect; accepted→1 call/accepted receipt; timeout→1/unknown; crash after effect→1/unknown until verified; cache failure→1/accepted+degraded; binding rotate→0 or unknown if already dispatched; duplicate claim→1 total; sample→0 remote/simulated; wrong receipt scope→denied; projection fail→receipt durable/replay no effect. H03 labels provider/stage/outcome bounded, count winning CAS after commit. Test suites actual whatsapp-{adapter,inbound,outbound,webhook}, google, vertical-slice-google-connection, cognition-v2-{voice,runtime-outcome}; new fault tests trans03-* after owner approval. Restricted PG required for concurrency; no mock certification. Rollback disable governed composition, retain claims/receipts and reconcile unknown; never fall back to ungoverned dispatch.
## Dependencias y orden de ejecución
Wave A P01/P04 transport, P02/P03 binding, P10 parser, P13 fixtures. Wave B P05/P06 ledger, P07–09 structured effect with Trans01 E03; no shared activation until A02/A03. Wave C P11 profiles/voice/JEV, P12 cyber with Trans02 P11. Wave D P14 certification. No new domain F10/11; F07 sandbox only. Canonical mapping from pasada 01 remains provisional pending 48-block reconciliation. No circular dependency: adapter contracts can test locally before kernel composition; production activation waits on all.
## Autoevaluación
Arquitectura 9.4; granularidad 8.6; anclas 9.2; código 8.6; wiring 8.8; tests 8.8; autonomía 8.6; rollback 9.0. Media 8.875. Simulación razonada, no ejecución de tests. Faltan firmas finales E03/H03, callers completos y contraste de 48 bloques; no GO. 
