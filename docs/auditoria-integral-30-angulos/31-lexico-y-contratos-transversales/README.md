# Léxico transversal — base de la reauditoría

> **No declarar este documento «léxico canónico vigente» todavía.** Es una matriz inicial contrastada parcialmente con código de `agente`; se deberá reconciliar con los léxicos y convenciones ya existentes en los 15 repositorios, sin renombrar a ciegas.

## Fuentes de vocabulario ya localizadas en el padre
- `packages/domain/src/ontology-seed.ts`: `BASE_VOCABULARY.entities = actor,user,agent,tool,resource,goal,event`; relations `uses,accesses,governs,requires,belongs_to,triggers`; capabilities `read,write,execute_tool,approve,plan,reason`.
- `packages/domain/src/ontology.ts`: `OntologyBundle` versionado, `tenantScope`, entidades/relaciones/capacidades, `frozen: true`; `CapabilitySpec` y `CognitiveSpec`; `isCanonicalSlug` valida `/^[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*$/`.
- `packages/domain/src/capability.ts`: `CapabilityContract`, `sideEffects`, `permissions`, `risk`, `cost`, `idempotency`, `requiresApproval`.
- `docs/ui/GLOSARIO.md`, `docs/campaigns/campana-ux-2026-11-10.md`, `docs/WHITEPAPER.md`: glosarios documentales adicionales; aún no reconciliados.

## Términos globales y ownership propuesto
| Término | Significado canónico deseado | Dueño | Restricción |
|---|---|---|---|
| Tenant | límite de aislamiento de empresa | Kernel Identity | no confiar en texto de LLM |
| Principal / Actor | identidad autenticada y atribución | Kernel Identity | agent ≠ usuario humano |
| Agent | interfaz conversacional/especialista con rol | Agent Registry | no autoridad por personalidad |
| Capability | operación tipada y versionada | Capability Registry | ID estable, inputs/outputs schemas |
| Skill | implementación reutilizable de capacidad | Runtime | no shell libre |
| SOP | procedimiento tipado y auditable | Runtime | entradas, pasos, efectos |
| Pipeline | DAG de dependencias y estados | Runtime | no confundir con conversación |
| Task | trabajo aceptado por runtime | Kernel/Runtime | estado verificable |
| Action | intención de efecto concreto | Kernel Policy | permiso por recurso/argumentos |
| Approval | autorización de humano/mandato | Kernel | hash, expiración, scope |
| Event | hecho registrado | Event Bus | schemaVersion y causalidad |
| Evidence | prueba trazable y minimizada | Dominio + audit | referencia, no secretos |
| Receipt | confirmación externa del efecto | Runtime/Adapter | no equivale a intento |
| Memory | contexto persistente permitido | Memory Engine | scope y procedencia |
| Domain | bounded context de negocio | Hijo | no crea identidad paralela |
| Workspace | proyección UI de tareas/datos | Web | no define autoridad |
| Connector/Adapter | traducción a proveedor externo | Hijo | semántica de error y reintentos |
| IntentBridge | entrada tipada conversación→kernel | Padre | no ejecuta efectos |
| ProgressProjector | eventos→fases explicables | Padre | no inventa estados |

## Reglas de nomenclatura propuestas para revisión
1. Diferenciar **ID de dominio**, **ID de capacidad**, **evento**, **tipo de entidad**, **nombre visible** y **path HTTP**; no usar una misma cadena para cinco funciones.
2. Propuesta de namespaces: `security.audit.preview`, `finance.invoice.read`, `legal.contract.review`, `design.asset.generate`. **No renombrar IDs existentes** sin tabla de alias y migración.
3. `schemaVersion` del envelope y `version` semántica de capacidad son conceptos diferentes; definir compatibilidad hacia atrás y ventanas de deprecación.
4. IDs de entidades estables; nunca deducir `tenantId` desde un ID externo. IDs del proveedor requieren `providerRef` y `externalId` separados.
5. Eventos en pasado (`security.audit.completed`), comandos como intención (`security.audit.requested`); no confundir resultado confirmado con solicitud.
6. Status no equivalentes entre repos requieren **crosswalk explícito**, nunca `string as Status`.
7. Tiempo en UTC con zona de origen cuando afecte obligaciones; dinero decimal/minor units + moneda; PII clasificada; provenance en evidencias.
8. Errores tipados: `DENIED`, `NOT_CONFIGURED`, `NOT_VERIFIED`, `PARTIAL`, `RECONCILIATION_REQUIRED`; catálogo definitivo pendiente de cotejar con código.
9. `unknown` es dato no verificado, no falso; `not_tested` no es PASS; `queued` no es completed.
10. El léxico es un **contrato de interoperabilidad**, con owner, ADR, alias, semver, tests y lint de nombres, no un diccionario estático.

## Dossier de compatibilidad por hijo
Cada repositorio deberá aportar: léxico original, entidades, nombres de rutas, eventos, estados, schemas, prefijos, alias, conflictos con base, adaptación y prueba de roundtrip. Se documentará en `32-atlas-14-repositorios/`. La prioridad es conservar compatibilidad y evitar bifurcaciones de significado.
