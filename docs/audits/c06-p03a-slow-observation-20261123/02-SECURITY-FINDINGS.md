# Seguridad: casos SEC-01–08

**SEC-01 cross-tenant:** `observe:25-27` rechaza record.tenantId distinto; `ContextServingFacade.resolve` consulta tenant de identity. Defensa estática; test real pendiente.

**SEC-02 cross-actor:** `resolve` llama `assertAuthorized(identity,record)` y valida ownerActorId, allowedActorIds y policyRevision. Test privado A/B pendiente.

**SEC-03 revocación:** `resolve` comprueba lifecycle, expiración y revocaciones; `SlowCognitionQueue.enqueue` resuelve nuevamente. Test revocación entre pasos pendiente.

**SEC-04 revisión antigua:** `resolve` consulta última revisión y compara revisión exacta. Test pendiente.

**SEC-05 cambio de política:** `assertAuthorized` valida policyRevision contra visibilidad y policy.authorize; la cola revalida. No es operación atómica conjunta. Test con cambio entre resolve y enqueue pendiente; no afirmar vulnerabilidad explotable.

**SEC-06 epistemic:** `observe` rechaza hypothesis/unknown/contradicted; admite reported_fact, inference y verified_fact. No promueve factualidad; el worker debe respetar esa clasificación.

**SEC-07 prompt injection:** `observe` solo comprueba longitud; no convierte texto en instrucciones ejecutables. El proveedor Slow recibirá prompt y contexto, por lo que debe aislar instrucciones y evidencias no confiables. Prueba de resistencia pendiente.

**SEC-08 autoridad:** no existe llamada a ActionService/kernel en el puente, solo a `slow.enqueue`; la cola utiliza captura del kernel en el procesamiento posterior. No demuestra un bypass, pero requiere test E2E de ausencia de acciones.
