# Reauditoría V2 — Arquitectura transversal de 15 repositorios

> Ampliación de la auditoría de 30 ángulos, 2026-11-15. **Visión de destino**, no dirección de campañas de los agentes implementadores. Esta documentación se añade a la rama documental de la auditoría; no modifica código, `main` ni repos hijos.

## Objetivo
Diseñar un **AgntiaPro compuesto**: el repositorio padre `agente` gobierna identidad, tenants, agentes, memoria, aprobación, tareas, ejecución, eventos y experiencia; los 14 repositorios hijos aportan capacidades especializadas mediante contratos universales, con versiones, esquemas, límites y evidencias. El sistema debe admitir repos 16, 17… sin reescribir el kernel.

## Base comprobada y límites
- Rama auditada: `docs/audit-30-dominios-runtime-20261115`, 35 archivos documentales por delante de `main` en la comparación inicial.
- Los 30 `INFORME.md` son **diagnósticos iniciales**, no auditorías exhaustivas; su propio índice declara tests no ejecutados.
- Código de `main` leído: `packages/domain/src/ontology.ts`, `ontology-seed.ts`, `capability.ts`, `apps/server/src/engine/policy/engine.ts`, `execution/executor.ts`.
- **Hallazgo crítico de coherencia:** el código de ontología ya define `OntologyBundle` congelado, vocabulario base, `CapabilitySpec` y regla `isCanonicalSlug`; por tanto el léxico transversal no debe ser un simple glosario de prosa: ha de contrastarse con schemas y tipos reales. `capabilityContractSchema.inputs/outputs` siguen siendo registros `unknown`; no hay prueba de que todos los repos usen el mismo contrato.
- **Hallazgo de autoridad:** `PolicyEngine.can` permite si `role.permissions` falta o está vacío. Es comportamiento explícito en el código consultado, incompatible con una frontera universal deny-by-default si no hay un guard anterior probado. Investigar llamadas y contexto antes de afirmar bypass explotable.
- **Hallazgo de ejecución:** `Executor.execute` devuelve `succeeded` cuando hay al menos un paso exitoso aunque otros estén `skipped` por dependencias; solo devuelve `blocked` si todos están skipped. Revisar semántica de obligatoriedad y resultado de negocio.
- No se han ejecutado tests ni leído todos los archivos; no inferir estado actual de integraciones por un README.

## Estructura de ampliación
- `31-lexico-y-contratos-transversales/`: vocabulario, namespaces, tipos, evolución, crosswalk de dialectos y compatibilidad.
- `32-atlas-14-repositorios/`: ficha de cada hijo, Concept Master, superficies, ownership, dependencias, conflictos y visión final.
- `33-arquitectura-global-destino/`: arquitectura de convergencia, ownership, flujos de trabajo, garantías y preguntas de auditoría V2.
- Los ángulos 01–30 **se mantienen**; los tres anexos son una nueva capa transversal, no una sustitución.

## Método para profundizar los 30 ángulos
Por cada ángulo: (1) inventario de código con SHA, (2) diagrama de llamadas reales, (3) contrato y nomenclatura canónicos, (4) ownership padre/hijo, (5) riesgos de interoperabilidad, (6) escenarios entre dos o más dominios, (7) criterios de verdad/observabilidad, (8) diferencias entre estado actual y Concept Masters, (9) propuesta arquitectónica y alternativas, (10) pruebas de aceptación para futuro equipo ejecutor. Clasificar `verified_in_code`, `documented_only`, `proposed`, `not_checked` y `contradicted`.

## Orden de lectura
1. [Léxico y contratos](../31-lexico-y-contratos-transversales/README.md)
2. [Atlas de 14 dominios](../32-atlas-14-repositorios/README.md)
3. [Arquitectura de destino](../33-arquitectura-global-destino/README.md)
4. [Auditoría original 01–30](../README.md)

**Invariante:** `LLM propone → Kernel autoriza → Runtime ejecuta → Evento confirma → Presenter comunica`. La conversación puede comunicar intención pendiente, nunca inventar efectos.
