# Trans03 — pasada 05: contrato de ejecución consolidado
Entrada obligatoria después de PROMPT-HANDOFF-EJECUCION. Precedencia: invariantes founder y barreras autorizadas > este documento > pasada 04 > 03 > 02 > 01 > especificación T02/T03 histórica. No sustituye canónica; divergencias se registran. Todos los hunks son candidatos sin compilar. 
## Preflight real y decisiones
app.ts 96b0aaf5 L109–125 monta TenantScopedStore, GoogleAuth(tdb,config,db,{membership}) y WorkspaceService; L176 pasa workspace.execute a ActionService. tenant-scope.ts 0879be0a exporta currentTenantScope/runInTenantScope, actorId/tenantId. db-tenant.ts 581b242b L80–81 updateCredential(owner,connectionId,secret) no revision CAS. Por tanto el refresh multi-proceso no está resuelto por singleflight. No inventar CAS ni habilitar shared hasta Trans01. Workspace y app son superficies compartidas: reservar antes de editar; sin reserva solo preparar patchsets. No modificar otras ramas.
## Orden y checklist ejecutable
P01 Meta/Evolution: aplicar únicamente delta de validación config/response, preservar id/accepted/to, redirect error, unknown marker. P04 Google request/requestBytes: status 408/429/5xx write unknown, cancelar body y redacción; no retries. P10 Places: limit safe integer, shape, dedup. Estos tres independientes de E03. P02/P03 GoogleAuth después de fixtures: binding actor/authorizer y scope, refresh recheck. P05/P06 WhatsApp inbox/ledger después de A02/A03 para activación; pruebas locales antes. P07/P08/P09 Workspace structured effect después de reserva y E03. P11 profiles/media/JEV, P12 cyber después de contratos propietarios. P13 fixtures desde inicio, H03 después de ABI. P14 gate final. No saltar B1–B6.
## P02 hunk definitivo candidato
En google-auth.ts importar currentTenantScope desde ./tenant-scope.ts si no existe. Insertar método junto a assertMembership:
```ts
private async assertOperationalBinding(owner:string,tokens:Tokens):Promise<void>{
 if(!tokens.tenantId) return; // legacy explícito; governed reader lo rechaza
 const scope=currentTenantScope();
 if(!scope||scope.tenantId!==tokens.tenantId||!this.checks.membership)
  throw new AppError("Google connection scope unavailable",403);
 await this.assertMembership(tokens.authorizer??owner,tokens.tenantId);
 await this.assertMembership(scope.actorId,tokens.tenantId);
}
```
Aplicar cuerpo accessToken de pasada 03. Antes de devolver current.accessToken comprobar expiry > now; si no, fail closed, no bucle refresh. Callback no tiene scope: conservar stateStore y restauración existente, comprobar state.authorizer y tenant antes/después de red; no llamar método anterior fuera de scope. Worker deferred necesita principal/delegación Trans01, no inventar actor. Scope map pasada 02 corregido por 03/04: intersección con grant actual, gmail profile read, calendarlist separado. No modificar consent UI. 
## P03 revisión concurrente
db-tenant updateCredential solo connectionId. Rotated refresh token puede perderse por dos procesos. Candidato contrato Trans01: CAS secret revision independiente de binding generation; updateCredentialIfRevision devuelve boolean, no cambiar método existente sin consumidores. Loser relee; si refresh remoto pudo invalidar token ganador, marcar conexión requires_reconnect y no usar token incierto. No lock DB sobre HTTP; para proveedor con rotación de un solo uso exigir lease/fence o bloqueo de activación multiworker. No simular garantía. Tests fresh revoke, two actors pending, two tenants same owner, reconnect during refresh, scope shrink, CAS loser. 
## P05/P06
Aplicar guard payload y scope de pasada 02, no comparar SOP actual en replay queued. Config binding único, deny ambiguous. Body limit verificar middleware existente antes de introducir lector. P06 claim existente, recheck antes de dispatch, accepted true/id valid, postdispatch error unknown, no provider fallback. E03 referencia attempt, no segundo ledger. Tests webhook fake, partial batch, conflicting duplicate, revoked after claim, timeout after effect, late response and reconcile. 
## P07/P08/P09 composición
app.ts L176 actual wrapper string. Propuesta cambio solo coordinado: mantener legacy callback workspace.execute, añadir governed callback workspace.executeEffect bajo perfil explícito y contrato ActionService E03 aprobado. No cast as unknown as para forzar ABI. AdapterEffect de pasada 04 sustituye WorkspaceEffect de 03; summary no evidencia. En Workspace.executeEffect cada sample branch devuelve simulated, live devuelve accepted family; cache best effort tras receipt remoto, hook degraded y recovery. providerWrite unknown marker primero. Gmail actual receipt.threadId fallback input solo presentación, no evidence. Calendar targetVersion ya exigido; no duplicar. Drive rename/trash no confirmación por 404. Reader governed requiere binding original y generation, verifica IDs y ACL, nunca consulta cuenta nueva para reconciliar antigua. RAG revocation Trans02. Attachment digest reviewed bytes vs dispatch bytes. 
## P11/P12
ProviderSpec existente y env lane; Trans04 resolver tenant, no fallback. JEV existing egress Trans02. Voice coordinator consent/epoch; media transport no ABI, default deny. Composio no generic proxy. Cyber sdk one-use, project callback obligatorio en producción, same Store tx, safe cursor, ACK after commit, recovery no reproject; Trans02 fence. No nuevos dominios ni remediación. 
## P13/P14 pruebas reproducibles
Tree verificado: tests/oauth.test.ts, google.test.ts, actions.test.ts, actions-deferred-wire.test.ts, deferred-actions.test.ts, c05-shared-actions.test.ts, vertical-slice-{calendar,drive,google-connection}.test.ts, whatsapp-{adapter,inbound,outbound,webhook}.test.ts, cognition-v2-{jev,jev-egress,voice,security-context,transactions}.test.ts. Nuevos tests trans03-* candidatos. package.json 8e490918 runner:
```sh
ALLOW_NETWORK=0 node --import tsx --import ./tests/setup.ts --test --test-isolation=none --test-timeout=90000 tests/oauth.test.ts tests/google.test.ts tests/whatsapp-adapter.test.ts tests/whatsapp-inbound.test.ts tests/whatsapp-outbound.test.ts tests/whatsapp-webhook.test.ts tests/vertical-slice-google-connection.test.ts tests/vertical-slice-calendar.test.ts tests/vertical-slice-drive.test.ts tests/actions.test.ts
pnpm typecheck
ALLOW_NETWORK=0 pnpm test:cognition-v2
pnpm gate
pnpm verify:slice
pnpm gate:cognition-v2
```
ALLOW_NETWORK=0 no sustituye aislamiento real de red; verificar setup y sandbox. Test adversarial table de 03/04, añadir spy governed wrapper zero, stale token CAS, sample zero remote, cache fail accepted, telemetry throw no effect. H03 no-op hasta ABI, bounded labels. PG restricted y two processes obligatorios para claims/refresh; mock no certifica. Gate evidence SHA/command/exit/backend/skips. 
## Simulación final del ejecutor
1. E03 no listo: P01/P04/P10/P02 local y fixtures avanzan; no governed dispatch. 2. H03 no listo: no-op sink, no falsa métrica. 3. Scope actor ausente: deny attributed, deferred worker bloqueado hasta principal. 4. Cache error tras accepted: receipt preservado, recovery sin resend. 5. Crash antes durable: unknown, reconcile original binding. 6. Revocation during remote: no prometer cancelación, outcome unknown si no evidencia. 7. Rollback: disable governed, preserve receipts, no fallback. 8. Legacy UI: wrapper y consent marker preservados. 9. Canonical Fast proposal contradicción: no habilitar hasta founder delta. 10. External media/Composio/gestoría absent: no inventar endpoints. 
## Entrega y límites
Mapa 48 requisitos en pasada 04, no lectura íntegra de 48 README. E03/H03 y CAS revision requieren acuerdo propietario; vendor ABI y sandbox no verificados. No tests ejecutados ni código funcional modificado. Autoevaluación documental: arquitectura 9.5, granularidad 9.1, anclas 9.4, código 8.9, wiring 9.2, tests 9.2, autonomía 9.1, rollback 9.3; media 9.2125. Nota provisional, no certificación ni GO. 
