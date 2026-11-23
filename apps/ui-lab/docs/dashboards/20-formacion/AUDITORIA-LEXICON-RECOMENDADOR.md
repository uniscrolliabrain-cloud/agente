# Auditoría de nomenclatura y lexicón para el recomendador de Formación

**Alcance:** lectura de código de `main` (23/11/2026). Auditoría estática selectiva; sin tests, ejecución ni cambios de runtime. Este documento **no** certifica integración. El directorio correcto de UI Lab es `20-formacion`, no `30-formacion` (ver `../19-general/NOMENCLATURA-UI-FINAL.md`).

## Inventario contrastado
| Fuente de verdad | Archivo | Contrato real / implicación |
|---|---|---|
| Familias | `packages/domain/src/taxonomy.ts` | `taxonomyFamilySchema`: 15 valores uppercase: WEB, RESEARCH, DOCUMENTS, DATA, CONTENT, CREATIVE, COMMUNICATION, SOCIAL, CRM, SALES, MARKETING, SOFTWARE, DATABASE, AUTOMATION, ANALYTICS. `FUTURE_FAMILIES` no equivale a enum activo. |
| Verbos | `packages/domain/src/actions.ts` | `actionTypeSchema`: Discover, Search, Retrieve, Read, Write, Create, Transform, Analyze, Classify, Validate, Communicate, Publish, Execute, Update, Delete, Monitor. No inventar verbos alternativos. |
| Ontología tenant | `packages/domain/src/ontology.ts` | `ontologyBundleSchema` (version, tenantScope, entities, relations, capabilities, frozen), slug canónico `^[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*$`; validación bootstrap, **no** validación de instancias runtime. |
| Capacidades | `packages/domain/src/capability.ts` | `capabilityContractSchema`: kind tool/skill/sop/composite, risk, sideEffects, permissions, actionType y family opcionales. `inputs`/`outputs` admiten unknown; NO implica esquema de operación estricto. |
| Registro | `apps/server/src/engine/capabilities/registry.ts` | `CapabilityRegistry` global y `TenantScopedCapabilityRegistry` con cache TTL. Resolver tenant y permisos del servidor, no de tags de UI. |
| Cognition V2 | `packages/domain/src/cognition-v2.ts` | `cognitiveIdentitySchema` tenantId/actorId/owner/policyRevision/purpose; purpose solo chat/task/presenter/audit. `cognitiveVisibilitySchema` private/tenant; `memoryKindSchema` episodic/semantic/procedural/autobiographical/working; `epistemicSchema` con estados verificados/no verificados. |
| Runtime Cognition V2 | `apps/server/src/engine/cognition/v2/runtime.ts` | Chat `tools: []`; comentario explícito: business actions siguen en V1 hasta migración gobernada a V2. No asumir canal de ejecución V2 completo. |
| Ontología de tarjetas | `packages/domain/src/card-ontology.ts` | Familias observation/hypothesis/risk/opportunity/procedure/decision/outcome/knowledge_gap; perfiles cromáticos explore/apply, generate/verify, expand/protect. **No son categorías pedagógicas**. |
| Event Bus | `apps/server/src/engine/events/types.ts` | `SYSTEM_EVENT_TYPES` es enum cerrado; no emitir `training.watched` ni `recommendation.shown` como si ya existieran. |
| Nomenclatura UX | `apps/ui-lab/docs/dashboards/19-general/NOMENCLATURA-UI-FINAL.md` | Formación es superficie general **20**, separada de las 34 Apps comerciales; «Accesos» es App comercial 30, no Formación. |

## Hallazgos y severidad
**ALTA — colisión semántica:** `family` significa cosas diferentes en `taxonomyFamilySchema`, `cardFamilySchema` y colección editorial. En el recomendador usar nombres explícitos `taxonomyFamily`, `cardFamily`, `learningCollectionId`. Nunca reutilizar un enum para otro.

**ALTA — IDs inventados en especificación anterior:** `roleTags`, `goals`, `availableCapabilityIds`, `skillGap`, `workflowRelevance` son campos y señales **propuestos**, no nombres acreditados de la API existente. No crear adaptadores que adivinen semántica. Levantar matriz de correspondencia real con perfil, roles, goals y capabilities antes de codificar.

**ALTA — eventos inexistentes:** no están declarados eventos de Formación en `SYSTEM_EVENT_TYPES`. Proponer contrato separado de analítica pedagógica o extensión explícita versionada del Event Bus con pruebas de schema/consumidores; prohibido inventar tipos en runtime.

**ALTA — cognición no es telemetría educativa:** cinco memorias, attention signals y ontología cromática de tarjetas sirven a Cognition V2. No reciclarlas automáticamente para inferir competencia de empleados ni recomendar contenidos. Cualquier señal cognitiva requeriría finalidad, permiso, evidencia y un adaptador revisado.

**MEDIA — ontología no garantiza autorización:** `validateAgainstMetamodel` valida kinds en bootstrap y no relaciones de instancia. Recomendaciones y práctica deben pasar por kernel/PDP por tenant/actor, no fiarse del catálogo.

**MEDIA — actionType/family opcionales:** el esquema de capability no obliga a declarar ambos; una estrategia de mapeo necesita estado `unmapped` y exclusión de sugerencias accionables hasta completar mapping, no fallback libre.

**MEDIA — vocabulario de Formación separado:** crear taxonomía editorial versionada (competencyIds, learningCollectionId, difficulty, prerequisites, exerciseId, contentStatus, roleApplicability), sin introducir esas categorías en las 15 familias de ejecución ni en la ontología cromática.

## Contrato puente propuesto (NO existente)
```ts
// Nombres del adaptador de Formación, no tipos ya exportados por packages/domain.
const TrainingCapabilityLink = z.strictObject({
  exerciseId: z.string(),
  capabilityId: z.string(), // debe resolver en TenantScopedCapabilityRegistry
  taxonomyFamily: taxonomyFamilySchema.optional(),
  actionType: actionTypeSchema.optional(),
  mappingStatus: z.enum(["verified", "unmapped", "retired"]),
});
const TrainingCatalogItem = z.strictObject({
  exerciseId: z.string(), learningCollectionId: z.string(),
  competencyIds: z.array(z.string()),
  prerequisiteExerciseIds: z.array(z.string()),
  contentStatus: z.enum(["draft", "verified", "published", "retired"]),
  capabilityLinks: z.array(TrainingCapabilityLink),
});
```
Para ejercicios conceptuales, `capabilityLinks: []` es válido. Para CTA de ejecución real, exigir `mappingStatus=verified`, capability presente en tenant, permiso y conexión autorizados. El ranking no concede permisos ni publica contenidos.

## Integración correcta
`Perfil/objetivos declarados → adaptador autorizado de señales mínimas → lexicón educativo versionado → candidate generator → filtros deterministas (tenant/idioma/estado/permisos) → ranking → explicación → UI Formación`.

La práctica es **otro flujo**: `CTA → LAIA/Cognition V2 propone → kernel/PDP → SOP Zod → executor/adaptador → recibo`. No usar recommendation score como permiso ni como input libre de ejecución. V1 queda legado con migración controlada, no como nueva dependencia de Formación.

## Matriz de mapeo obligatoria antes de implementación
1. Perfil/rol: localizar contratos efectivos de usuarios, membership y rol, definir qué etiquetas se pueden usar sin confundir rol de negocio con rol RBAC.
2. Objetivos: localizar entidad real de objetivos y scope; si no existe señal verificable, utilizar preferencia declarada separada.
3. Capacidad: resolver `capabilityId` por tenant, `actionType`, `taxonomyFamily`, sideEffects, permissions, risk; distinguir operaciones reales y contenido conceptual.
4. Señales: inventariar eventos permitidos, procedencia, retención y controles; crear eventos pedagógicos solo mediante campaña explícita.
5. Catálogo: IDs estables, aliases para migración, versión y unicidad; conservar R01–R50, P01–P10 e IA01–IA60 como **IDs editoriales propuestos**, no IDs del kernel.
6. Verificación: test de colisiones, nombres reservados, enums, compatibilidad de contratos, cross-tenant, ausencia de eventos, scopes y revocación.

## Gate de aceptación
No implementar recomendador hasta completar matriz de mapeo con rutas reales, tests de contrato y decisión sobre eventos de Formación. Documentar `sourcePath`, `exportName`, `version`, `semantics`, `privacyBasis`, `fallback` para cada señal. No cambiar schemas del kernel por conveniencia del algoritmo.
