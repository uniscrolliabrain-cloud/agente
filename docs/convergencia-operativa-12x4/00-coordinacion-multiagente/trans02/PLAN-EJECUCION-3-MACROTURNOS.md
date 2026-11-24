# trans02 — ejecución M1–M3
Aplicar PROTOCOLO-3-MACROTURNOS.md. Conservar cambios existentes en chat-agent.ts, slow-observation.ts, attention.ts, context.ts, runtime.ts; comprobar HEAD y tests antes de aplicar.
## M1
1. C01 agent.ts/makeRuntime y chat-agent.ts: verificar binding de clones y selector V2/legacy/AGUI; test dos clones con identidades distintas y HTTP chat. Solicitar app/service a Trans01.
2. C02 slow-observation.ts: validar tenant/actor/purpose/policy, fuente card/memory y revisión exacta; revalidar antes de enqueue; dedupe durable con revisión; no usar prefijos como única defensa anti-loop. Test revoke entre verify/enqueue y duplicado.
3. C03 slow.ts/workers.ts/storage.ts: inspeccionar cola y DurableProjector; cursor/inbox/job atómicos si mismo Store, lease/fence, cuota y coalescing; no montar segundo worker. Test crash y stale lease.
4. C04 provider.ts/inference.ts: preservar FAST/SLOW config independiente, abort, timeout, cuota y circuit breaker; JEV SemanticClassifier autorizado con evidencia mínima. No fallback cruzado ni herramientas de efecto. Test Slow/JEV offline, Fast responde.
5. C05 attention.ts/context.ts/runtime.ts: ranking común versionado, snapshot ACL/TTL/policyRevision, ledger reserve/rendered/ack; LAIA default y persona autorizada sin cambiar actor. Test revocación antes/durante stream, ranking determinista, delivery replay. H02 hooks Trans04. B2.
## M2
6. C06 WhatsApp/Maps/Calendar/Drive/Gmail/Docs: consumir receipts verificados de Trans01/03, no inferir entrega desde ACK; RuntimeOutcomeProjector acredita job Slow, no negocio. Separar hipótesis, propuesta, evidencia y hecho. Tests falso receipt y contradicción por operación.
7. C07 FiveMemories/grafo/context: fixtures Trans04, owner scope y procedencia; no habilitar MULTI_TENANT_SHARED sin PDP y pruebas. B3.
8. C08 ciber/gestoría: findings y conciliación como evidencia tipada, no hechos automáticos; recontextualizar dominios sin borrar memorias; medir lag y relevancia. B4.
## M3
9. Auditar Trans01: SOP, claims, causalidad, replay, autorización. Revisar ranking y calidad con fixtures, corregir propios paths. B5.
10. Fault injection Slow/JEV, cuota, cancelación, revoke, ACL A/B, replay/fences, persona, receipt falso; medir latencia real y gate Cognition V2 sin neutralizar NO_GO. B6.
