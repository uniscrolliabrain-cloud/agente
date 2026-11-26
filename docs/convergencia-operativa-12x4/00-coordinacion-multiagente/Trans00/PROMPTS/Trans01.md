# Trans01 — prompt de ejecución candidato D-M2

Lee primero [12-PROMPT-COMUN-EJECUCION.md](../12-PROMPT-COMUN-EJECUCION.md) íntegro, no es opcional. No ejecutar hasta D-M3 y autorización de macroturno con rama y SHA de integración. 

Rama documental original: `Trans01` fijada en `61b76ac514039fd9d3188dffc33abf2a2c28016a`. Carpeta exacta `docs/convergencia-operativa-12x4/00-coordinacion-multiagente/Trans01/`. [Campaña consolidada](https://github.com/uniscrolliabrain-cloud/agente/blob/61b76ac514039fd9d3188dffc33abf2a2c28016a/docs/convergencia-operativa-12x4/00-coordinacion-multiagente/Trans01/ESPECIFICACION-IMPLEMENTACION-V3.md), [Codex](https://github.com/uniscrolliabrain-cloud/agente/blob/61b76ac514039fd9d3188dffc33abf2a2c28016a/docs/convergencia-operativa-12x4/00-coordinacion-multiagente/Trans01/ASTRA-AUDIT-V1/DIAGNOSTICO.md), [GPT](https://github.com/uniscrolliabrain-cloud/agente/blob/61b76ac514039fd9d3188dffc33abf2a2c28016a/docs/convergencia-operativa-12x4/00-coordinacion-multiagente/Trans01/AUDITORIA-GPT-HALLAZGOS-VERIFICADOS.md). Leer todos sus documentos de campaña anteriores necesarios y HANDOFF. La rama de ejecución será proporcionada por Trans00, no asumir que es la histórica.

## Mandato exclusivo

Kernel, runtime, autoridad, causalidad, receipts. Patchsets originales A01–A03, E01–E03, S01, C01/H01, V/O/X/D/G originales. Adendas mínimas A01/A02/A10/A11/A16; A13 contrato recepción, A09 caller, A15 composición. [Inventario/disposición](../10-DM2-CLASIFICACION-Y-REGRESIONES.md) y [reservas](../11-DM2-RESERVAS-Y-ABI.md) obligatorios.

Importación de 33 paths, preservar claim expectedHash, causal envelope, service principal, outbox, outcome.ts, seq replay y tests existentes. A01 reconciliación R1–R3: decisión humana separada del intento y observación; action+dispatch misma tx con fence, recovery arranque/maintain único, no reenviar. A02 único breaker con resultado neutral y probe, coordina cuota 02. A10 auditoría anchor+entry y verify fail-closed causal. A11 filtros sin deshacer seq. A16 turn store idempotencia y quiescencia. Composición app/index/conversation de main: montar una vez factory 02, receipt 03, métricas 04, Meta/Promoter 06. No abrir deferred dispatch sin autoridad. Revisa C03-01 porque actions actual clasifica genérico post dispatch como unknown; no conservar conclusión retry de rama antigua.

## Gates y trabajo integral

B1 contrato ExecutionContext, AdapterOutcomeClass, envelope y hooks reales. B2 tests claim+dispatch/replay+audit y no proveedor live. B3/B4 receipt family, SOP/CapabilityRunner (no asumir todos SOP usan runner), slices y composición. B5/B6 two process, rollback/commit unknown, replay y authority. 03 writer workspace, 02 cognition, 04 hooks tras transferencia. Entrega ABI exacta y pruebas a los otros agentes.

Cada macroturno revisa los doce requisitos y 48 bloques de la campaña, registra estado por bloque, implementa únicamente las ventanas autorizadas, no omite fases independientes seguras. Si una corrección ya está en original, no abrir otra campaña. Entrega a Trans00 las pruebas, deltas y bitácora; no informar por archivo. No despliegue ni efecto real. 
