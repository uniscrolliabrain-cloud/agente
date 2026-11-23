# Arquitectura propuesta — un tenant lógico `agntia-demo`

## Decisión de diseño
**Unificar la fuente de datos y el contexto empresarial, no mezclar sandbox con producción.** `agntia-demo` es una identidad canónica de simulación de AgntiaPro, con escenarios por fase, actores, relaciones y eventos coherentes.

Mantener dos adaptadores separados:
- `SyntheticProvider`: dataset versionado, sin red, para UI Lab y full-app demo; nunca llama APIs reales.
- `TenantApiProvider`: vistas/operaciones de un tenant persistente de pruebas usando contratos existentes y `TenantScopedStore`; permisos, sesiones y eventos verificables.
Ambos leen un **mismo modelo canónico de dataset** y devuelven formas compatibles con los componentes existentes. No compartir mutaciones ni tokens entre providers.

## Diagrama de flujo
`raw CEO + raw founder + instrucciones → plantilla 18 taxonomías → escenario 90 días → generador determinista → dataset canónico → {adaptador navegador, seed DB aislada} → {App, Centro Mando, Studio, UI Lab, workspaces}`.

## Diferencias frente a la fuente founder
- El owner dirige **AgntiaPro**, no una agencia de diseño ni ACME Obras.
- LAIA es supervisora/interfaz, Marcos operario, Antonio finanzas, Juan gestoría, Ana RRHH y Pedro seguridad. Los roles del Estudio y de Interfaz no deben sobreescribir esta identidad.
- Ocho clientes simulados al día 90; objetivo real de diez clientes diferenciado.
- Las operaciones son compilaciones, implantaciones, atención, ventas, administración y evolución tecnológica, no presupuestos de obras salvo cuando se modelen como cliente vertical de AgntiaPro.
- Landing = mensaje y puerta comercial principal. La actualización tecnológica continua se registra como dimensión del servicio recurrente, sin sustituir la narrativa de venta.
- Fases **0,1,3,4,5,6,7,8** expresas; fase 2 **sin definir por founder**. Cualquier ensayo adicional entre 1 y 3 es propuesta etiquetada.
- Alpha fase 7 conservada con su nombre, sin redefinirla por defecto.

## Modelo mínimo canónico
`Tenant, BusinessProfile, Actor, Role, Capability, Process, SOP, PainPoint, Solution, Relationship, Lead, Opportunity, Customer, Contract, Project, Task, Action, Approval, Document, Conversation, Message, Invoice, Payment, Event, Evidence, Training, PhaseProgress, Feedback, WeeklyUpdate, Experiment, TwinScenario`.

Cada fila lógica lleva `tenantId`, `id`, `scenarioId`, `simulationMode`, `source`, `effectiveAt`, `createdAt`, `actorId`, `relatedIds`, estado y procedencia donde proceda. Usar contratos Zod reutilizables y adaptadores específicos, no cambiar los contratos kernel.

## Capa de compatibilidad
- `apps/web/src/demo/fixtures.ts`: mantener API pública `demoStore` durante transición, pero alimentarla del dataset canónico mediante mapeo explícito.
- `apps/web/src/demo/router.ts`: preservar rutas y respuestas existentes; eliminar identidad Interfaz al final, no al principio.
- `useDemoCentroMandoData.ts`: derivar KPIs y vistas de entidades canónicas, sin LTV/cliente por texto libre ni confianza ficticia.
- `apps/ui-lab/src/vendor/studio/model.ts`: adaptador `Scenario → StudioState`, conservando `reducer`, interacciones, inspector, timeline y visualizador.
- `apps/ui-lab/src/fixtures.ts` y `registry.tsx`: sustituir ejemplos aislados por selectores del mismo dataset; no eliminar componentes.
- `scripts/seed-acme.ts`: conservar como fixture/regresión de ACME; crear `seed-agntia-demo.ts` independiente, nunca renombrar sobre datos existentes.
- `apps/server/src/acme-owner.ts`: mantener binding existente hasta validar nuevo camino de provisión y login de agntia-demo. Evitar auto-binding a cuentas sin aprobación.
- `packages/workspaces/acme-*`: conservar vertical de obras; crear adaptadores generales para AgntiaPro o reutilizar vistas genéricas.

## BD y seguridad
1. Primer objetivo: **cero cambios destructivos de schema**.
2. Provisionar `agntia-demo` en DB aislada de desarrollo o staging; verificar memberships y aislamiento.
3. `seedVersion`, `datasetVersion`, `scenarioId` y `sourceId` permiten regeneración y reversión.
4. Generar en staging y verificar antes de activar el provider persistente.
5. No tocar `acme`, `default`, usuarios reales ni producción; snapshot/backup y plan de rollback.
6. Validar filtrado por tenant, permisos, paginación, índices y límites del Store al ampliar eventos.
7. Ningún dato sintético se promueve automáticamente a un cliente real.

## Dificultad
- Reemplazo visual de nombres/fixtures: **baja**.
- Dataset canónico causal y adaptadores para múltiples workspaces: **media**.
- Integración con auth, DB, 90 días de historia y event bus sin cruces: **media-alta**.
- Unificación completa de **todos** los workspaces y procesos reales: **alta**, requiere inventario adicional de cada consumidor.
**Estimación de planificación, no medición:** 2–4 días para una demo visual coherente pequeña; 1–3 semanas para dataset canónico, adaptadores, pruebas de aislamiento y un primer seed persistente; más para cobertura exhaustiva de todos los workspaces. Depende del estado de ramas y contratos reales.
