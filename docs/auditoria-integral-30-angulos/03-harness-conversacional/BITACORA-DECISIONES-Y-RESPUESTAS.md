## R-20261115-002 — Corrección del objetivo: rediseño sustitutivo
- **Petición:** el fundador aclara que el diseño actual no satisface sus necesidades y debe quedar parcialmente como legacy.
- **Decisión:** la opción 3 es arquitectura de sustitución, no de preservación. Compatibilidad solo durante transición; paridad legacy no es criterio de aceptación.
- **Documento vinculante:** `ADR-009-REDISENO-SUSTITUTIVO-LEGACY-TRANSITORIO.md`.
- **Estado:** DOCUMENTADO; sin cambios de runtime ni tests.

# Bitácora de decisiones y respuestas — ChatLLM / Opción 3
**Regla:** append-only semántico. Una entrada por respuesta técnica sustancial, con links a reportes y commit.

## R-20261115-001 — Protocolo de documentación continua
- **Petición:** “Documenta cada respuesta q me des para q el agente q ejecute el código no se lie y tenga contexto”.
- **Decisión:** toda respuesta técnica debe quedar reflejada en esta bitácora y, cuando haga falta, en un documento temático.
- **Acción:** se crea `PROTOCOLO-CONTINUIDAD-RESPUESTAS-Y-HANDOFF.md` y esta bitácora en rama `audit/preflight-cognition-option3-20261115`.
- **Contexto heredado:** opción 3; Slow produce tarjetas con metadatos; JEV clasifica sin autoridad final; Event Bus y grafo alimentan runtime; ContextServingFacade inyecta a Fast; UX SVG pedagógica y timeline factual.
- **Riesgos abiertos:** flujo V1 de tarjetas con CAS y release-on-error; Fast chain con fallback; Event Bus con `persisted:false`; scopes owner/tenant; diferencias entre ramas documentales.
- **Estado:** DOCUMENTADO. No se ha implementado ni probado código de runtime.
- **Siguiente paso:** cerrar preflight C00 con inventario de código y contratos Cyber, tests de caracterización y plan de migración compatible.
