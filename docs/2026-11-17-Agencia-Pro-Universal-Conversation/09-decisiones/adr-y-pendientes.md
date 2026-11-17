# ADRs y decisiones pendientes

## Decisiones propuestas
ADR-001 Una sola conversación persistente; no copias por superficie.
ADR-002 Una conversación activa por (tenant, usuario, scope personal), con hilos históricos.
ADR-003 Solo acción explícita «Nuevo chat» cambia hilo activo.
ADR-004 Backend dueño de historial, secuencia y estado de ejecución; cliente es proyección.
ADR-005 MCP sirve herramientas, no transporte de chat ni UI.
ADR-006 Host adapters independientes, contrato común y renderers adaptados.
ADR-007 Contexto host efímero y autorizado; memoria solo por políticas.
ADR-008 Tenant y actor de sesión autenticada; aislamiento fail-closed.
ADR-009 Core primero; conectores después de estabilidad.
ADR-010 Event bus durable + entrega incremental/replay; no depender de pestaña abierta.

## Por decidir con evidencia
- Qué endpoint de chat es canónico entre /api/conversation, /api/threads y CopilotKit.
- Qué DB transaccional y esquema de RLS usar según despliegue actual.
- Cómo serializar runs concurrentes por hilo y qué ocurre con turnos largos.
- Si seleccionar hilo histórico en un host debe activar globalmente o ser local por defecto.
- Qué mensajes técnicos deben verse en chat y cuáles solo en Control Center.
- Cómo gestionar conversaciones compartidas voluntarias y visibilidad de agentes.
- Cómo se comporta el chat embebido ante limitaciones reales de Workspace Add-ons.
- Políticas de retención y contexto sensible según tipo de cliente.
- Qué funcionalidades Google/Microsoft requieren verificación, revisión o admin consent.
- Si alojar conectores en repos hijos o apps del monorepo; contratos versionados siempre.

## Criterio de arquitectura
No convertir propuestas en hechos implementados. Validar con código y pruebas antes de cada decisión irreversible. No merges ni despliegues sin aprobación explícita.
