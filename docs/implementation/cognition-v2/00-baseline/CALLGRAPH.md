# Callgraph comprobado por imports y llamadas

Web useChat → api/chat SSE → app.ts /api/copilotkit → agent.ts → ConversationAgent.run.
Conversation → memory.recall (RAG embeddings + privadas/hechos) → systemContext → ContextEngine.assemble → assembleCognitionCards.markConsumed → kernel.config → modelChain → BuiltInAgent/runWithModelFallback → SSE → FastAuthor/closeKernelTurn/Presenter.
AgentService.createTask → TaskWorker lease/CAS → executeModelTask → SlowAuthor/captureSlowCognition → Thought + CardStore V1 (escrituras separadas) → bus.emit.
EventBus.emit → StoreSink.insertIfAbsent → globalSubscribers.publish → kernel subscriber void async → runCognitionCycle. Replay V1 sin cursor durable.
Store → PGlite o pg.Pool; TenantScopedStore compone tenant:owner; request AsyncLocalStorage se fija tras resolveTenantPrincipal.
GraphPort: lectura; TurnStore: pensamientos/turnos; business graph separado. Promoter real: kernel/graph/promote.ts.

La ruta Fast incluye awaits de recall, systemContext, rol, contexto, cards, kernel config y cuotas. No hay medición de proveedor real; no extrapolar latencia del informe histórico.
