# Propuesta de arquitectura · SOP cíclico Formación / Cognition V2 TRUE

**Estado:** diseño contrastado con código de `main`; sin implementación ni ejecución de tests. **Canal cognitivo único de destino: Cognition V2 TRUE; prohibido fallback cognitivo a V1.** El literal `TRUE` es nomenclatura de producto solicitada, no un flag de runtime comprobado. Ver [auditoría lexicón](./AUDITORIA-LEXICON-RECOMENDADOR.md).

## Decisión
Formación no es un ranker aislado. Es un **SOP periódico/event-driven de observación → propuesta → evaluación → autorización → proyección → feedback**. Cada ejecución es finita, idempotente y con presupuesto; el scheduler dispara la siguiente iteración. Evitar un bucle de ejecución infinita y evitar invocar modelos por cada scroll.

## Pipeline propuesto
1. **Observación autorizada:** proyectar eventos mínimos de Formación, perfil explícito, metas declaradas y señales del producto permitidas; identidad `tenantId` + `actorId`, revocación y ventana temporal. No leer conversaciones, emails ni datos sensibles para optimizar recomendaciones.
2. **SOP determinista:** normalizar lexicón pedagógico versionado, deduplicar, identificar cambios relevantes y construir snapshot con hash, timestamp y procedencia. Sin cambios, reutilizar proyección válida.
3. **Slow LLM de Cognition V2:** recibir snapshot autorizado y proponer un `LearningPlanProposal` tipado: exerciseIds existentes, orden, colecciones, razón, evidencias y nivel de incertidumbre. No inventar vídeos ni permisos.
4. **JEV AI:** evaluación semántica independiente, tipada y no autoritativa de pertinencia, progresión, diversidad y dudas. Su contrato actual es `agntiapro.cards`, por tanto requiere **adaptador y esquema pedagógico nuevo**; no reciclar `cardFamily` como `learningCollectionId`.
5. **Kernel/Policy Gate obligatorio:** identidad fresca, aislamiento tenant, consentimientos, catálogo publicado, versionado, límites, evidencia y políticas. Rechazo fail-closed; propuesta del modelo nunca es permiso. Para cambios sensibles, revisión humana. Registrar recibo de aprobación o denegación.
6. **Materialización:** runtime persiste `TrainingViewProjection` versionada con IDs y orden, nunca código React generado por LLM. Se invalida por revocación, actualización de catálogo o caducidad.
7. **Template Formación:** frontend renderiza estanterías estables, reproductor, motivos «Por qué esto», guardados y progreso; carga solo contenidos aprobados. Feedback vuelve al Event Bus o proyección educativa autorizada.

## Contraste técnico
| Ruta existente | Evidencia | Límite / integración |
|---|---|---|
| `apps/server/src/engine/sop-executor.ts` | `SOPExecutor` valida SOP, herramientas registradas y allowlist; version pinning y checkpoints | Sus thoughts de kernel son no fatales; **no** sirven como gate de autorización. Añadir gate separado obligatorio antes de publicar. |
| `apps/server/src/engine/cognition/v2/slow.ts` | `SlowCognitionQueue`, leases, fences, idempotencia, evidencias y slow lane | `SlowInput` exige referencias card/memory y `slowOutputSchema` no es un itinerario. Extender mediante un flujo V2 especializado, no pasar JSON de Formación por ese schema sin migración. |
| `apps/server/src/engine/cognition/v2/jev-classifier.ts` | `TypesafeJevClassifier` usa TypeSafe/JEV, egress gate y preguntas cromáticas | Evalúa `agntiapro.cards`; **no** evalúa aprendizaje actualmente. Adaptador con egress autorizado, límites, recibos y esquema propio. |
| `apps/server/src/engine/cognition/v2/jev-egress.ts` | Egress y cuotas con recibos, revocación y reconciliación | Reutilizar patrón; no compartir grants incompatibles con ontologyId pedagógico. |
| `packages/domain/src/cognition-v2.ts` | Identidad y visibilidad con policyRevision; epistemic, evidencia y recibos | `purpose` enum chat/task/presenter/audit; no introducir `training` silenciosamente. Definir extensión aprobada o mapear legítimamente a `task` sin falsear finalidad. |
| `apps/server/src/engine/cognition/v2/attention.ts` | Selección contextual por actor, evidencia y señales | No confundir ranking de atención cognitiva con preferencias educativas. |
| `apps/server/src/engine/events/types.ts` | Eventos cerrados y envelopes tenant/owner | Falta vocabulario de eventos educativos: extensión explícita y tests antes de emitir. |
| `apps/server/src/engine/workspace/registry.ts` | Plantillas de rol y vistas por defecto | Formación no está en enum de vistas y templates ricos son fase posterior: crear proyección/renderer de Formación, no asumir soporte existente. |
| `packages/domain/src/taxonomy.ts`, `actions.ts`, `ontology.ts` | Familias, verbos y slugs canónicos | Separar taxonomía educativa de capacidades y ontología cognitiva. |

## Contratos propuestos, no existentes
```ts
LearningPlanProposal = {
  schemaVersion: "1.0", tenantId, actorId,
  snapshotDigest, catalogVersion, generatedAt,
  recommendations: [{ exerciseId, learningCollectionId,
    reasonCode, evidenceRefs, uncertainty }]
}
TrainingViewProjection = {
  schemaVersion: "1.0", tenantId, actorId,
  policyRevision, catalogVersion, proposalDigest,
  approvalReceiptId, expiresAt,
  shelves: [{ shelfId, titleKey, exerciseIds }]
}
```
Propuesta no implica autorización; JEV y slow son evaluadores no autoritativos. El kernel valida cada publicación y el servidor comprueba vigencia al leer. Un resultado de formación no crea una memoria cognitiva sin consentimiento y contrato específico.

## Frecuencia y fallos
Disparadores: onboarding, objetivo cambiado, práctica verificada, feedback explícito y revisión programada. Debounce y cuota por actor/tenant; deduplicación por digest. Si V2/JEV no están disponibles: catálogo editorial estático o última proyección **aún autorizada y vigente**. **Nunca V1 cognitivo**. Caducidad/revocación obliga a volver al catálogo seguro.

## Gate antes de codificar
Resolver contratos reales de perfil/roles/objetivos, esquema educativo, tipo de evento, policy gate bloqueante, permisos de egress, extensión V2 para learning plans, proyección versionada, renderer y pruebas cross-tenant, revocación, idempotencia, expiración, reintentos, JEV caído y contenido retirado. No afirmar que el ciclo ya existe.

## Producto editorial
Guiones para 60 ideas en [60-GUIONES-40-SEGUNDOS.md](./ejercicios/60-GUIONES-40-SEGUNDOS.md). El contenido estático editorial es la base del template; el SOP solo selecciona y ordena piezas verificadas.
