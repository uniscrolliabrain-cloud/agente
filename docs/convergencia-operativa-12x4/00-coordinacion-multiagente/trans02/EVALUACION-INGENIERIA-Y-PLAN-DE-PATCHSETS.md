# Evaluación de incorporación GPT Trans02 — INCOMPLETE / NO_GO

Base propia congelada: 2021b06ac33cb313c7fb5b3d863e7631ad264a83. Coordinación en lectura: 9358f7439fb19d6f5940734f952df821bd30d635. Este documento es checkpoint, no autorización de implementación ni cierre B2. No se ejecutaron tests nuevos. No se acredita lectura integral de los 48 bloques ni de agntia-demo: se recuperaron sus árboles completos, no sus contenidos completos. Se leyeron los ocho documentos individuales, contrato, wiring, protocolo, resolución B1, README maestro y se recuperaron los doce PATCHSETS (salida parcialmente truncada). Falta completar lectura y auditoría de consumidores y tests. No sustituir evidencia por nombres de archivos.

## Estado de predecesor
Historial verificado: e1e0fade adaptador sin montaje; 2e0c2e62 bridge sin montaje; 97d98e39 ranking y revocación; ef639a51 routing tests; 2021b06a especificación. Bitácora reporta 72 PASS/9 skips antes de routing, 2/2 routing, gate 9/10 IPC EPERM, cognition gate NO_GO. Son resultados históricos, no reproducidos en este turno. B2 BLOCKED_DEPENDENCY. Resolución B1 asigna agent.ts y cognition/v2 a trans02, conversation.ts y composición a Trans01; no editar app/service.

## Hallazgos de código comprobados
Paths relativos a apps/server/src. Enlaces reproducibles: https://github.com/uniscrolliabrain-cloud/agente/tree/2021b06ac33cb313c7fb5b3d863e7631ad264a83/apps/server/src/engine/cognition/v2

- agent.ts makeRuntime: factory sample/local crea ConversationAgent; agui crea HttpAgent; ownerFor usa currentTenantScope()!.actorId cuando enabledForRequest. No importa CognitionV2ChatAgent. No afirmar que adaptador esté activo. El selector AGUI requiere decisión explícita, sin fallback por error.
- chat-agent.ts: constructor liga run; clone copia cognition y owner y vuelve a ligar copy.run. Riesgo concreto: si super.clone copia función ya ligada, bind no cambia receptor. No demostrado sin leer implementación instalada de AbstractAgent. Probar clones con dependencias diferentes y callback extraído. Propuesta de hunk, no aplicada:
```diff
-    copy.run = copy.run.bind(copy);
+    copy.run = CognitionV2ChatAgent.prototype.run.bind(copy);
```
Firma conservada run(input: RunAgentInput): Observable<BaseEvent>. Aceptación: dos scopes, un stream por llamada, ningún cruce; rollback revertir adaptador no montado.
- slow-observation.ts: VerifyObservation(identity, operationId, record): Promise<boolean> default false; observe exige actor==owner, card/memory activa, excluye hypothesis/unknown/contradicted y runtimeOutcome; prefijos slow/outcome/hint; digest de identidad, propósito, revisión política, operación, fuente y revisión. No cursor ni cuota en este bridge. El prompt libre del llamador no queda ligado a evidencia canónica por el verificador. Enqueue vuelve a validar identidad y referencias, pero no el receipt/operación. Riesgo TOCTOU del verificador y ausencia de causalidad tipada. No confundir con ausencia total de revalidación. Propuesta: verificador devuelve concesión versionada de admisión, no boolean; consumir concesión dentro de transacción de inbox/cuota/job/cursor, verificar binding y política vigente; ruta separada de señales no verificadas. Contrato exacto pendiente Trans01.
- slow.ts enqueue(raw: SlowInput,key:string) valida schema, identidad, referencias, inserta job y evento queued en transacción, coteja digest ante colisión. tick reclama SKIP LOCKED con fence y lease 60s, monitor 100ms, lane slow 2/45s, revalida evidencia antes de inferencia y captura; classifier 500ms con fallback rules, verifica referencias y digest. Persiste raw antes de parse: auditar minimización y retención, no persistir razonamiento privado. No equiparar terminal Slow a resultado empresarial. Falta revisar resto de tick y transacciones reales.
- runtime.ts constructor crea sink, ontology, context, FiveMemories, attention, ledger, deliveryRecovery, projector, kernelReceipts, slow y fast lane 4/15s. chat(owner,input) Observable: identidad scoped, prepared, monitor revocación, ledger reserve/rendered/ack, prompt LAIA, tools/context/forwardedProps vacíos para proveedor, descarta eventos tras abort. No se acredita revocación instantánea ni retractación de texto previo. No hay llamada Slow en camino mostrado.
- attention.ts select usa getSnapshot y contextScorer, persiste attention-v2.2 con digest y watermark; read verifica identidad y snapshot. Compartir scorer no demuestra igualdad de selección prepared/select (presupuestos distintos); probar mismas entradas y política.
- context.ts firmas verificadas assertAuthorized(identity,record?,seen?), resolve(identity,id,revision?), getSnapshot(identity,{query,maxTokens,maxRefs}), prepared(identity,query,maxTokens=4000,maxRefs=10), readSnapshot, getDelta. Ledger reserve(identity,snapshotId,cardId,leaseMs,consumerRef?), rendered(identity,id,fence), ack(identity,id,fence,receiptId), recover. Falta inspección integral de SQL, ACL y cache.
- FiveMemories: fromEvent episodic/procedural, semanticFromCard, autobiographical, working, recall. CognitiveGraphQuery.neighbors/evidence; CognitiveProjector.apply/tick, KernelReceiptProjector.tick. Existencia y firmas parciales verificadas; consumidores y semántica pendientes. RuntimeOutcomeProjector existe; fromSlowReceipt requiere lectura íntegra. TypesafeJevClassifier implementa SemanticClassifier; CopilotInferenceProvider stream/infer; InferenceLane.run. No acreditar egress o worker operativo por existencia.

## Plan provisional (IDs locales, no sustituyen PATCHSETS canónicos)
T01=P1 todas fases; T02=P2 fases 01–03; T03=P2 04–07; T04=P2 08–12; T05=P3 todas; T06=P4 todas. W0–W5 son dependencias, asignación exacta pendiente lectura coordinación completa. Todos los patches abajo INCOMPLETE, sin permiso de programar.

| ID | Fase / turno | Dependencia | Delta y aceptación |
|---|---|---|---|
| C01 | 01/T02 | Trans01 selector | hunk clone arriba; factory único, scope ausente falla cerrado, V1 opt-out, AGUI explícito, V2 opt-in un stream y persistencia |
| C02 | 01/T02 | envelope/verificador Trans01 | bridge causal, inbox y cursor durable, cuota/job atómicos o recuperación demostrada; crash antes/después commit, doble worker, receipt falso, revocación |
| C03 | 02/T02 | H02 Trans04 | hooks no bloqueantes en lane/worker/context; sin IDs ni texto en labels, caída collector no altera resultado |
| C04 | 03/T02 | Trans03 JEV, Trans01 PDP | egress mínimo, clasificación propuesta, persona autorizada por actor, LAIA default; Fast termina con Slow/JEV bloqueados |
| C05 | 04/T03 | receipts WhatsApp | distinguir recibido/aceptado/entregado/ambiguo; replay no reenvía |
| C06 | 05/T03 | receipts Google | cinco casos Maps/Calendar/Drive/Gmail/Docs, ACL y generación binding; revocación invalida snapshot |
| C07 | 06/T03 | fixtures Trans04 | A/B, contradicción y replay deterministas; no importar upstream sin licencia |
| C08 | 07/T03 | owner y PDP | contexto real separado de demo, sin provisionar; persona no cambia identidad |
| C09 | 08/T04 | seguridad Trans03/01 | findings hipótesis hasta receipt específico, remediación vuelve a kernel |
| C10 | 09/T04 | H02 | medir lag, relevancia, duplicados, coste, ACK servidor separado de cliente |
| C11 | 10/T04 | gestoría receipts | conciliación con moneda/periodo/revisión; propuesta fiscal no es decisión |
| C12 | 11/T04 | dominios/SOP Trans01 | versionar referencias, conservar historia y revocar obsoletas |
| C13 | 12/T04 | todos | jornada sintética y gate combinado |
| C14 | 01–12/T05 | auditor independiente | revisar receipts, bus, SOP, ACL, ranking y duplicados; corregir solo paths propios |
| C15 | 01–12/T06 | todos | Postgres restringido, carga, caída, replay, rollback y NO_GO si falta evidencia |

### Cobertura 12x4 (plan, no ejecución)
| Fase | P1 contrato | P2 wiring | P3 auditoría | P4 hardening |
|---|---|---|---|---|
|01|selector/receipt|C01–02|bypass y causalidad|replay y scope|
|02|H02|C03|doble conteo|collector caído|
|03|lanes/egress|C04|cuotas y abort|saturación|
|04|receipt canal|C05|orden y entrega|timeout ambiguo|
|05|scope operación|C06|ACL y generación|revocación|
|06|fixture|C07|hash y colisión|reset test|
|07|PDP owner|C08|identidad|aislamiento|
|08|alcance|C09|falso positivo|objetivo denegado|
|09|métricas|C10|denominadores|pérdida collector|
|10|receipt contable|C11|precisión y duplicado|revocación|
|11|versiones|C12|SOP huérfano|rollback|
|12|gates|C13|C14|C15|

### Escenarios propuestos, no resultados observados
WhatsApp: mensaje entrante autenticado es hecho de recepción, intención de compra hipótesis, respuesta propuesta, autorización kernel decisión, aceptación proveedor no entrega. Google: Maps devuelve candidato no cliente confirmado; Calendar disponibilidad no cita creada; Drive documento revocable; Gmail recepción no consentimiento; Docs revisión creada solo con receipt. Ciber: señal de riesgo hipótesis, evidencia comprobada separada, remediación requiere nueva autorización. Gestoría: extracto importado no conciliación; discrepancia hipótesis; receipt de conciliación verifica importe/moneda/periodo; declaración propuesta no presentada. Dominios: SOP versionado, evidencia conserva revisión; contradicción crea estado/revisión sin borrar historia. Fast sirve contexto local autorizado y explicita incertidumbre; saturación Slow aplaza observación sin bloquear operación; replay reproyecta sin efectos; revocación invalida referencias y futuras emisiones.

## Checkpoint exacto de continuación
1. Completar lectura de todos los blobs bajo docs/convergencia-operativa-12x4 en SHA coordinación, incluidos 48 README de bloques, coordinación y pendientes; completar los 27 archivos empresariales del árbol apps/ui-lab/docs/agntia-demo en SHA propio. Registrar manifiesto por path/blob y no confundir árbol con lectura.
2. Leer diffs completos e1e0fade, 2e0c2e62, 97d98e39, ef639a51 y tests/trans02-*; inspeccionar AGENTS.md, package.json, app.ts, conversation.ts, service.ts, worker entry, runtime/context/slow completos, projector/kernel-receipts/runtime-outcome, graph/memory, storage, ontology, provider/inference, JEV egress, personas, schemas dominio/eventos. Buscar instanciaciones y consumidores reales. Contrastar contratos publicados por Trans01/03/04 en coordinación, sin escribir allí.
3. Completar hunks contextualizados, firmas, migraciones y rollback por C01–15; no fijar schema compartido unilateralmente. Verificar W0–W5 exactas. Para cada prueba registrar fixture, aserción, comando, SHA y exit. Comando candidato histórico: ALLOW_NETWORK=0 node --import tsx --import ./tests/setup.ts --test --test-isolation=none --test-timeout=90000 tests/trans02-*.test.ts tests/cognition-v2-*.test.ts. También pnpm typecheck, pnpm gate, pnpm gate:cognition-v2. NOT_RUN en este turno. El sandbox previo solo dispara chatgpt/**; no afirmar CI sobre trans02 ni modificar workflow sin permiso.
4. Gates críticos: selector y receipt canónico, admisión durable, ACL/persona, H02, egress, Postgres restringido y gate combinado. No READY hasta lectura, diff y plan exhaustivos. No código funcional ni merge/deploy.
