# Programa ejecutable documentado — 16 campañas para rediseño V2 (opción 3)
**Rama:** `audit/preflight-cognition-option3-20261115` — **fecha:** 2026-11-15 — **estado:** 16 campañas documentadas, **0 campañas de código ejecutadas**.
**Decisión vinculante:** [ADR-009](../ADR-009-REDISENO-SUSTITUTIVO-LEGACY-TRANSITORIO.md): arquitectura nueva **sustitutiva**; legacy temporal, no objetivo de paridad.
**Preflight:** [C00 de compatibilidad](../PREFLIGHT-C00-COMPATIBILIDAD-NO-DESTRUCCION.md) — auditoría parcial; terminar inventario y ejecutar tests antes de tocar runtime.
**Protocolo:** [Continuidad](../PROTOCOLO-CONTINUIDAD-RESPUESTAS-Y-HANDOFF.md) y [Bitácora](../BITACORA-DECISIONES-Y-RESPUESTAS.md).

## Índice
1. [C00 inventario exhaustivo y mapa de destruccion controlada](./C00-inventario-exhaustivo-y-mapa-de-destruccion-controlada.md)
2. [C01 contratos v2 adr y arquitectura de sustitucion](./C01-contratos-v2-adr-y-arquitectura-de-sustitucion.md)
3. [C02 event bus durable ingest y proyector shadow](./C02-event-bus-durable-ingest-y-proyector-shadow.md)
4. [C03 grafo multicapa y procedencia](./C03-grafo-multicapa-y-procedencia.md)
5. [C04 cinco memorias y recuperacion rag](./C04-cinco-memorias-y-recuperacion-rag.md)
6. [C05 cromos y motor de atencion vectorial](./C05-cromos-y-motor-de-atencion-vectorial.md)
7. [C06 slow llm asincrono productor de conocimiento](./C06-slow-llm-asincrono-productor-de-conocimiento.md)
8. [C07 clasificador jev ai y metacognicion no autoritativa](./C07-clasificador-jev-ai-y-metacognicion-no-autoritativa.md)
9. [C08 cardstore v2 snapshots y ledger de entrega](./C08-cardstore-v2-snapshots-y-ledger-de-entrega.md)
10. [C09 context serving runtime y presupuestos de tokens](./C09-context-serving-runtime-y-presupuestos-de-tokens.md)
11. [C10 fast llm y router de conversacion v2](./C10-fast-llm-y-router-de-conversacion-v2.md)
12. [C11 presenter y ux de recorrido pedagogico](./C11-presenter-y-ux-de-recorrido-pedagogico.md)
13. [C12 voz anam y sesiones multicanal](./C12-voz-anam-y-sesiones-multicanal.md)
14. [C13 adaptador ciberseguridad y eventos del dominio](./C13-adaptador-ciberseguridad-y-eventos-del-dominio.md)
15. [C14 shadow canary migracion y retiro de legacy](./C14-shadow-canary-migracion-y-retiro-de-legacy.md)
16. [C15 certificacion e2e seguridad rendimiento y handoff final](./C15-certificacion-e2e-seguridad-rendimiento-y-handoff-final.md)

## Dependencias y paralelismo seguro
- **Bloque fundacional:** C00→C01→C02. No tocar stores ni eventos sin baseline.
- **Proyecciones cognitivas:** C03/C04/C05 pueden avanzar con contratos C01 y bus C02, pero coordinar cambios en grafo/memory.
- **Generación y clasificación:** C06→C07; JEV opcional, nunca juez.
- **Distribución y conversación:** C08→C09→C10; el nuevo Fast no hereda la semántica one-shot.
- **Canales:** C11/C12 tras ContextServing y Fast; UI pedagógica separada de hechos.
- **Dominio:** C13 puede preparar fixtures y contrato en paralelo tras C01/C02; conectar solo después de autorizaciones y schemas.
- **Corte:** C14→C15, con aprobación humana para merge/deploy.
- Las dependencias por orden de campaña son **conservadoras**, no impiden trabajo de documentación o tests independientes; evitar que agentes escriban el mismo archivo a la vez.

## Checklist de inicio de cada campaña
1. Leer ADR-009, preflight y reporte de campaña anterior.
2. Verificar HEAD y SHAs de padre e hijo; revalidar rutas propuestas.
3. Crear rama específica, baseline y matriz de impactos.
4. Ejecutar tests de caracterización pertinentes.
5. Aplicar patchsets con feature flags y rollback.
6. Registrar tests con comandos, exit codes, FAIL/SKIP, y evidencia.
7. Clasificar cambios como REUTILIZAR/SUSTITUIR/LEGACY TEMPORAL.
8. Emitir reporte antes de pasar a la siguiente.

## Definición de terminado
No es “pasa el legacy”. Es **opción 3 operativa**: kernel autoridad; bus durable; grafo multicapa; memorias/cromos/atención conectados; Slow produce tarjetas y metadata asíncronas; JEV clasifica sin autoridad; Context Serving sirve snapshots/deltas/reference autorizados; Fast conversa sin Slow obligatorio; Anam comparte cerebro; Cyber emite hechos/receipts; UI no inventa progreso; legacy retirado cuando deje de ser necesario.

## Advertencias
Las rutas de código de cada campaña mezclan rutas observadas con rutas nuevas **propuestas**. Los tests aún no se han ejecutado. La documentación ultradetallada anterior se creó en otra rama (`docs/audit-30-dominios-runtime-20261115`); reconciliar sus contenidos antes de un merge, sin sustituir ADR-009 por la interpretación conservadora anterior.
