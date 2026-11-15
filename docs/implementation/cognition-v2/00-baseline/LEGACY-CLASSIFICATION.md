# Clasificación de sustitución

| Superficie real | Tratamiento | Condición |
|---|---|---|
| kernel/kernel.ts, execution/capability-runner.ts, authz | REUTILIZAR condicionado | Conservar autoridad, comprobar aislamiento en integración |
| db.ts, db-tenant.ts | REUTILIZAR tras corregir transacciones | pg.Pool.query BEGIN no fija conexión; guard inTransaction mezcla callbacks concurrentes |
| events/bus.ts + StoreSink | REUTILIZAR/REFORZAR | Commit separado de notificaciones; event log único |
| kernel/subscribers/events.ts | LEGACY TEMPORAL | Retirar consumidor void tras cutover a proyector durable |
| graph/thought.ts, turn.ts, attention.ts | REUTILIZAR | No confundir Thought con claim verificado |
| engine/context/cognition-cards.ts + card-store.ts | SUSTITUIR | V2 revisiones y ledger ACK; mantener V1 hasta migración |
| conversation.ts context/model routing | SUSTITUIR | ContextServing y Fast independiente; opt-in sintético antes de canary |
| model.ts synchronous capture | SUSTITUIR | Cola durable e inferencia independiente, sin child turn obligatorio |
| memory.ts, rag.ts | LEGACY TEMPORAL/REUTILIZAR adapters | Registry RAG útil; revocación y privacidad deben seguir comprobándose |
| kernel/observers/meta.ts,presenter.ts | SUSTITUIR | Hints durables y estados factuales desde receipts |
| kernel/cromos | LEGACY TEMPORAL | Semántica pendiente; motor nuevo fuera del kernel |
| voice branch | REUTILIZAR tras revisión | No importar scaffold completo sin revisar auth/epoch/consent |
