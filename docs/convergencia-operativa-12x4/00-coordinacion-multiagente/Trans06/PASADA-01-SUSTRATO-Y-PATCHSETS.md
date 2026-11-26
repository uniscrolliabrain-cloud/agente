# Trans06 — Pasada 01: sustrato real, diagnóstico y patchsets candidatos
26-11-2026. Baseline funcional main 93236a34. CAMPAIGN.md mandato aprobado. Solo documentación; no tests ejecutados. 
## Estrategia y contraste
C05 histórico (blob 663f48ef) ya pide cromos conectados, metadata no autoridad, separación policy descriptivo/enforcement, atención versionada. No repetirlo como motor nuevo. CONTRATO-TRANSVERSAL canónico c791643d exige autoridad única, no duplicación y fail-closed; WIRING faa6834b admite Fast solicitudes tipadas, en conflicto con decisión founder Fast comunica y Slow propone. Registrar como divergencia ya conocida, no modificar canónica. Trans01 V3 A02/A03/E03, Trans02 P02/P03/P04/P06, Trans03 P07–09, Trans04 P08/P14, Trans05 P02–P10 son contratos candidatos, no hechos desplegados. Base neutral main: comparar blobs antes de integración; attention.ts de Trans06 9342866a no coincide con ancla Trans02 45312a2f, por tanto no copiar hunks de otras ramas.
## Inventario y diagnóstico verificable
- kernel/cromos/cromo.ts 6efd6684: z.object id/tenantId, kind logic/physics/intent/memory/policy, axioms strings, field record unknown, provenance source/createdAt. No revision explícita, scope actor, referencia o semántica tipada. No ampliar este contenedor sin decidir si es legacy; CROMOS_PENDING_V1.
- kernel/cromos/logic/axioms.ts 48f36452: cinco strings declarativos, checkContradiction solo 'no '+texto. No inferencia transitiva real. No convertir ausencia de coincidencia en verdad. 
- kernel/cromos/physics/field.ts 31bc3f10: media cuadrática, vacío devuelve 0, umbral .7; no validación finita, rango, signo, desconocido. No física real. Conservar legacy no cableado hasta decisión.
- kernel/graph/rules.ts a53a89fb: first match; SURVIVOR_ROLES incluye confirmation/correction antes de checks matched. checkTenant permite expectedTenantId vacío. Proponer guard en perfil gobernado y reordenar solo con owner Trans01/02; promoción no equivale a ejecución.
- kernel/graph/promote.ts 18701bb8: destino por rol, action→business graph, observation/reflection→memory. Dedup survivors pero writes recorren destinations originales; consolidación registra negaciones sin resolver. Escrituras void/catch; no usar como nuevo circuito durable. 
- kernel/graph/consolidate.ts a4cda6d0: agrupación por tenant, hash normalizado por role/actor.kind, negaciones por prefijos, comparaciones muestreadas a 200. No verificador de contradicción semántica; no borrar evidencia de contradicción.
- kernel/cognition/cycle.ts 92466f71: seis marcas; act marca tras append decision, no effect. openTurnIdempotent no prueba dedupe de append. No introducir nuevo ejecutor.
- packages/domain/src/card-ontology.ts: ocho familias, tres pares de scores independientes [0,1]|null; assessments slow/rules/jev/human, consenso exacto por campo, disagreement null/disputed; outcome no se acepta por consenso; contextDigest exigido para relevance/novelty/action_readiness; refs mismo tenant. Review proposed. No imponer bipolaridad matemática ni convertir score en hecho. 
- packages/domain/src/cognitive-reference.ts b5b3e5a1: strict tenantId, kind event/thought/entity/memory/card/document/receipt, id, revision positiva. Reusar refs; no inventar kind relation/process sin reserva. 
- kernel/graph/port.ts c1755a2a: resolveNode/neighbors/timeline tenant; verificar actor ACL antes de adaptar. Cognition V2 graph d895576f/projector 4e173086 son superficies Trans02. 
- engine/cognition/v2/attention.ts 9342866a: score .5 relevance+.3 urgency+.2 novelty sobre snapshot ya seleccionado. Nueva señal experimental no segundo selector; probar ablation en facade Trans02, no modificar weights por intuición.
- engine/policy/engine.ts f747c8f4: sin permissions allow, canWithContext delega. A02 debe cerrar perfil gobernado. Ninguna regla axiomática concede permisos.
- engine/business/graph.ts fc6bcd22: updateEntity L139–207 lee y compara version opcional, calcula version+1 y put sin CAS visible en método; stateMachines.apply antes de put. Concurrente requiere prueba y contrato Trans01. deleteEntity L218+ borra relaciones y entidad con eventos separados, actor ignorado localmente; no usar como operador destruir automático. loadSchema captura error y retorna null, validateAgainstSchema admite sin schema o def. Perfil gobernado debe distinguir no declarado vs fallo lectura; no cambiar legacy sin tests. 
- packages/domain/src/business.ts 0b3fe3a4: entity version, provenance, stateMachineId, relation no self-ref; metamodelo V1 pending retiro. business-schema.ts f86fc0d3 V2 es camino existente, no crear otro metamodelo. sop.ts 5b21c8e6 version, steps 1–50; preservar SOPExecutor 1ab7a390.
## Propuesta mínima: no formalizar los nueve axiomas todavía
Distinguir predicado verificable, evaluación semántica, criterio empresarial y decisión de autoridad. Una evaluación se vincula a referencia, contexto/goal, escala representada mediante referentes autorizados y revisiones; ningún nivel absoluto. Positivo/negativo significa orientación relativa, no valor booleano de verdad. Desconocido no es cero. Una escala puede invertir evaluación sin contradicción: misma operación distinta referencia/goal. No transitividad general de afinidad, no suma de polos obligatoria, no propagación de permisos. El estado latente es propuesta/posibilidad explícita, no hecho escondido inferido.
Candidato puro, nuevo módulo packages/domain/src/organizational-primitives.ts (ruta propuesta, reservar antes de editar):
```ts
import { z } from "zod";
import { cognitiveRefSchema } from "./cognitive-reference.ts";
const axis = z.string().min(1).max(100);
const finiteScore = z.number().finite().min(0).max(1).nullable();
export const organizationAssessmentSchema = z.strictObject({
  subject: cognitiveRefSchema,
  whole: cognitiveRefSchema,
  goal: cognitiveRefSchema.optional(),
  axis, axisVersion: z.string().min(1).max(100),
  contextDigest: z.string().regex(/^[a-f0-9]{64}$/),
  positive: finiteScore, negative: finiteScore,
  evidence: z.array(cognitiveRefSchema).min(1).max(30),
}).superRefine((v,ctx)=>{
  const refs=[v.whole,...v.evidence,...(v.goal?[v.goal]:[])];
  if(refs.some(r=>r.tenantId!==v.subject.tenantId))
    ctx.addIssue({code:"custom",message:"cross-tenant assessment"});
});
```
No authoritative schema yet: validate axis against versioned registry server-side, bind contextDigest and actor/policy from authorized projection, exact refs resolution, same subject/whole allowed only if definition permits. Do not write new card kind or change core schema. Scores advisory; derive actual evaluator state server-side, keep original evidence and assessment. Shape may be reduced after P2. 
Predicado puro candidato: combine mandatory checks using reject if any false, unknown if any unknown and none false, satisfied otherwise; empty list invalid (not vacuous authorization); evaluation output never permission. Trans01 consumes hard predicates only after explicit agreement, not all semantic scores. Postcondition evaluates after receipt; accepted != confirmed. 
## Patchsets P01–12 (primera granularidad)
| ID | Superficie real / candidato | Delta y prueba negativa | Dependencia / rollback |
|---|---|---|---|
| P01 | cromos, graph, C05, ontology | inventario callers/imports/tests, reconcile V1/V2; baseline SHA | documental; conservar módulos |
| P02 | new pure domain schema | refs, tri-state, exact scope; missing/unknown/cross tenant | independiente; remove unmounted code |
| P03 | pure evaluation | relative to whole+goal+revision; same transform opposite assessment by context; never infer permission | P02; disable evaluation |
| P04 | cromo.ts, axioms.ts | adapter only if reuses evidence contracts; text negation candidate not proof | Trans02 owner; keep legacy pending |
| P05 | field.ts / attention facade | bounded finite normalization, no forced polarity; unknown != zero; stable ordering and explain | Trans02 scorer; ablation feature off |
| P06 | ontology, projector, graph | annotations proposed, exact refs, revoked source omitted; no new verified_fact | Trans02 + Trans05; disable projection |
| P07 | BusinessGraph, GraphPort, business-schema V2 | read-only governed views, version and ACL; no graph duplication; stale/missing ref blocked | Trans01/02; no writes |
| P08 | SOPExecutor/capability/actions | proposal references desired state, resource, expected revision; no direct execute; conflict, unknown, replay | A02/A03/E03 Trans01, Trans03 binding; disable adapter |
| P09 | graph projection | bounded authorized traversal with dedupe and revision; cycle/diamond, no duplicate effect, no cross tenant | P06/P07 + outbox; stop consumer |
| P10 | slow/JEV, Trans05 skills, context | structured proposal and selector feature, not prompt injection; old scope/disabled/timeout | ABI owner; stop new jobs, preserve Fast |
| P11 | existing compiler artifacts | criteria versioned tenant config, 3 synthetic enterprises using same schema; no domain in core | founder approval; revert manifest version |
| P12 | existing tests/gates | fixtures, concurrency PG, ablations and redaction; no PASS on skipped/no tests | Trans04; NO_GO on missing evidence |
## Simulación de escritorio
1. Departamento retira SOP redundante: local producción disminuye, empresa libera capacidad; two assessments same subject distinct whole/goal, no conflict. Slow proposes replacement, Trans01 approval, no auto-deletion. Receipt verified before projection. 
2. Empresa prefiere oportunidad, policy denies: positive high remains descriptive; no runtime call. 
3. Missing evidence and JEV unknown: preserve null, no false polarity, Fast communicates uncertainty.
4. Two updates from revision 3: only authoritative CAS may win; stale projection discarded, no second state transition. Current BusinessGraph method cannot be cited as CAS proof.
5. Relation A→B→C→A: bounded traversal with exact ref visited; no inference of permission, no recursive self-trigger. Diamond yields one projection per key.
6. Delete legacy entity: no axiom maps directly to deleteEntity; propose retirement/revision using existing domain semantics. If not available, blocked.
7. Cross tenant whole or source revoked: deny serving and projection; not merely zero score.
8. Provider accepted / unknown: no confirmed effect, no compensating retry by affinity.
## Feedback y decisiones
Axioms must not become second policy engine. C05 overlaps P04/P05, reconcile with Trans02 before activation. Business graph already carries version/state semantics; reuse before adding fields. Do not harden BusinessGraph from Trans06 without owner reservation. Propagation means knowledge projection, not cascading mutation. Formal 0–8, field math, universe of axes and scale graph remain open. 
## Próxima ejecución documental
P2 exact provenance/epistemology, source/actor/goal/whole resolution and versioned registry; P3 deterministic bounded composition; P4 real wiring of business read/authorized transitions; P5 three synthetic enterprise fixtures and faults; P6 exact hunks/hand-off. Commands candidates root pnpm typecheck; pnpm test:cognition-v2; pnpm gate; pnpm gate:cognition-v2; focused existing tests/kernel-rules-attention.test.ts, kernel-consolidate.test.ts, cognition-v2-ontology.test.ts, business-graph.test.ts and new trans06-* (verify runner). No executed tests. No functional edits. Remaining full caller/import scan, all 48 canonical READMEs, actual DB transaction semantics, exact ABI/migration and performance oracle.
## Reauditoría
Self-score provisional: architecture 9.1, granularity 7.8, anchors 8.8, hunks 7.0, wiring 8.2, test design 8.0, autonomy 7.7, rollback 8.4 = 8.125/10. Documentary estimate only, no independent certification. First pass intentionally open; do not execute functional patchsets yet.
