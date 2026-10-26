# Auditoria de console.* en server

> 2026-10-26T17:26:46.009Z

- Ficheros revisados: **226**
- Ocurrencias: **24**

| Fichero | Linea | Tipo | Snippet |
|---|---|---|---|
| apps/server/src/app.ts | 132 | console.log | console.log(`[personas] tenant default: ${loaded} cargadas, ${failed} fallidas`); |
| apps/server/src/app.ts | 268 | console.warn | console.warn("[kernel] init health=" + report.health + " notes=" + report.notes.join("; ")); |
| apps/server/src/app.ts | 271 | console.warn | console.warn("[kernel] init fallo:", error instanceof Error ? error.message : error); |
| apps/server/src/app.ts | 331 | console.log | console.log(`[ontology] validado: ${caps.length} capabilities`); |
| apps/server/src/app.ts | 333 | console.warn | console.warn("[ontology] validacion fallida:", error instanceof Error ? error.message : error); |
| apps/server/src/app.ts | 347 | console.log | console.log(`[ontology] bundle cargado: ${parsed.entities?.length ?? 0} entidades`); |
| apps/server/src/app.ts | 350 | console.warn | console.warn("[ontology] bundle no cargado:", error instanceof Error ? error.message : error); |
| apps/server/src/app.ts | 423 | console.error | console.error(`[OpenMuse] ${error.name}`); |
| apps/server/src/app.ts | 1039 | console.warn | console.warn( |
| apps/server/src/app.ts | 1044 | console.warn | console.warn( |
| apps/server/src/backup-tenant.ts | 127 | console.log | console.log(`Restore completo de tenant ${options.tenantId} desde ${manifest.createdAt}`); |
| apps/server/src/db.ts | 394 | console.log | console.log(`[OpenMuse] DB: Postgres (${where}) - backend: postgres`); |
| apps/server/src/engine/agents/personas/loader.ts | 34 | console.warn | console.warn( |
| apps/server/src/engine/agents/personas/loader.ts | 44 | console.warn | console.warn( |
| apps/server/src/engine/agents/personas/loader.ts | 61 | console.warn | console.warn( |
| apps/server/src/engine/agents/personas/loader.ts | 71 | console.warn | console.warn( |
| apps/server/src/engine/service.ts | 968 | console.warn | console.warn( |
| apps/server/src/kernel/config/env-resolver.ts | 63 | console.warn | console.warn(`[kernel/env-resolver] tenant ${tenantId}: FAST_LLM_API_KEY vacia. Chat usara chain global.`); |
| apps/server/src/kernel/config/env-resolver.ts | 66 | console.warn | console.warn(`[kernel/env-resolver] tenant ${tenantId}: SLOW_LLM_API_KEY vacia. Tareas usaran chain global.`); |
| apps/server/src/kernel/config/env-resolver.ts | 116 | console.warn | console.warn( |
| apps/server/src/kernel/personas-bootstrap.ts | 24 | console.warn | console.warn( |
| apps/server/src/log.ts | 114 | console.error | if (level === "error") console.error(line); |
| apps/server/src/log.ts | 115 | console.warn | else if (level === "warn") console.warn(line); |
| apps/server/src/log.ts | 116 | console.log | else console.log(line); |
