# Handoff de sublimación técnica — Trans02
Baseline documental: 07bb143e53c72d22d40458266820f024af27dcf2, REDISENO-FINAL-P01-P14.md. Autoevaluación 8.9375/10; objetivo >=9.2. No certificación ni GO. Este informe es backlog de mejora, no sustituye patchsets ni autoriza código. Retomar después de Trans03/04 para aprovechar ABI reales.
## Invariantes
Infraestructura generalista de consciencia operativa; Fast conversa/narra, Slow interpreta y propone, JEV evalúa/clasifica, kernel autoriza, runtime ejecuta. Agentes conversacionales no son principales autónomos. Cards, grafo, atención, cinco memorias y evidencia forman circuito persistente. No añadir dominios, SOPs, agentes ni UX; no alterar canónica sin aprobación founder.
## Backlog priorizado
| ID | Patchset | Mejora y evidencia exigida | Dependencia |
|---|---|---|---|
| S01 | P01 | Compilar factory y comprobar scope real en todos los callers, sample/normal, AGUI precedence, opt-out, clone, streaming y ausencia de fallback; persona server-side sin autoridad | Trans01 C01 |
| S02 | P02 | Schema runtime de snapshot y attention, serializer único, canonical JSONB digest, exact refs/sourceEventId, TTL, cursor pre/post, ledger pending-only; PG revoke/reserve/render/ACK races; no claim de autenticidad criptográfica del score | Trans01 E02 |
| S03 | P03 | Completar diff de storage.apply y todos callers; graph exact kind/revision, límites, endpoints autorizados, evidencia no representable conservada; receipt verifier por familia con schema real y prueba de replay | Trans01 E01/E03, Trans03 |
| S04 | P04 | Diseñar y cablear envelope de intención humana autenticada, idempotency key, causal IDs, durable inbox/outbox y consumer; separar mutable threads de autoridad; template versionado con digest, grant expiración/revisión, sourceKind; impedir que observeAuthorized sea acceso público o que boolean verifier acepte prompt arbitrario; prueba de crash entre enqueue/ACK y revoke | Trans01 A01/A02/E01/E03 |
| S05 | P04 | Slow output validado antes de persistir, output_context_digest migración aditiva y recuperación legacy, fence/lease, terminal CAS; definir deny vs PDP outage; probar cancel/retry y no inferencia duplicada | Trans01 |
| S06 | P05 | H02 ABI exacta, wiring en composición y cada transición ganadora post-commit; bounded sink no bloqueante, métricas attempt vs terminal, backlog durable, labels cerrados, SLO con baseline y test saturación | Trans04 |
| S07 | P06 | JEV tenant gate real, consent/policy revision, cuota y lock order, medianoche, late receipt CAS, incertidumbre y circuit breaker; no HTTP bajo lock; distinguir cancel local de stop remoto; no refund incierto; provider concurrency bound y DPA | Trans03/04 |
| S08 | P07 | Verifier WhatsApp basado en receipt durable y schema discriminado; accepted != delivered; unknown no retry automático; duplicate webhook y delayed delivery; nunca segundo dispatcher | Trans01/03 |
| S09 | P08 | ACL local y connection generation, RAG stable ID independiente del score, policy revision, migración/revocación de IDs anteriores; sidecar query relevance si ablation demuestra necesidad; Fast sin búsqueda remota | Trans03 |
| S10 | P09 | Fixture builders concretos, manifest reproducible y hash, dos tenants con IDs iguales, contradicción/revoke/receipt states; reusar bundle parser, sin nuevo provisioner | Trans04 |
| S11 | P10 | Preflight role/owner/BYPASSRLS/FORCE/policy inventory; schema-qualified lookup, pinned transaction SET LOCAL, optional modules, pool reuse y worker scope; restricted PG obligatorio | Trans01/04 |
| S12 | P11 | Factory cyber exige projector, mismo Store tx, lease/fence y cursor monotónico sin saltos, ACK idempotente según SDK, broker/PDP reales; no prometer exactly once | Trans03/04 |
| S13 | P12 | Mantener gestoría fuera de core actual; si founder autoriza familia futura, verificar ABI real, decimal/currency/period, receipt family; no acciones fiscales ni pagos por Cognition | Founder/Trans03 |
| S14 | P13 | Resolver identidad autobiográfica estable vs versionada tras inventario callers; supersession por conjunto exacto de episodios y revisiones, revocación transitiva, retención, no reescribir historia; cinco memorias con tests de regresión | Trans01/04 |
| S15 | P14 | Gate reproducible con SHA/Node/backend/exit/skips, fault injection, restricted PG, sandbox y cross audit independiente; no relajar NOT_CERTIFIED/NO_GO | Todas |
## Mejora transversal de patchsets
Cada S debe convertirse en diff aplicable sobre SHA congelado: archivo/símbolo, imports y tipos exactos, migración forward compatible, todos los callsites, test file y comando existente, pre/post condición, rollback por feature flag, evidencia de compilación. No aceptar pseudocódigo como diff final. Si ABI externo no existe, puerto default deny y test de no activación; no inventar contrato. Resolver conflictos T2/T3/T4/M3 por precedencia del consolidado y actualizar HANDOFF/TURNOS al retomar. Verificar rama Trans02 (mayúscula), carpeta trans02 (minúscula).
## Orden de recuperación
1. Recoger commits y contratos de Trans03/04 y Trans01; congelar SHA de las cuatro ramas y canónica. 2. Completar S03/S04/S06/S07/S08/S09/S12 primero por impacto en wiring. 3. Completar resto en misma pasada integral y consolidar diffs sin duplicar implementaciones existentes. 4. Validar aplicabilidad y compilación en entorno aislado autorizado; no modificar código funcional de rama documental sin permiso. 5. Reauditar los 14 patchsets y publicar nota comparable.
## Rúbrica y objetivo de mejora (no nota obtenida)
| Criterio | Baseline | Evidencia para >=9.2 |
|---|---:|---|
| Arquitectura | 9.4 | invariantes y autoridad demostrados |
| Granularidad | 8.8 | diffs completos, sin instrucciones vagas |
| Anclas reales | 9.2 | SHA y todos callers comprobados |
| Código | 8.7 | hunks aplicables y compilados en entorno autorizado |
| Wiring | 8.6 | ABI y rutas extremo a extremo verificados |
| Tests | 9.0 | positivos, negativos, races y fault tests reproducibles |
| Autonomía | 8.7 | secuencia ejecutable sin decisiones técnicas delegadas |
| Rollback | 9.1 | reversión ensayada, journal y datos preservados |
Media actual 8.9375. No elevar nota por escribir este backlog. No se ejecutaron tests ni se aplicaron diffs funcionales en esta entrega.
