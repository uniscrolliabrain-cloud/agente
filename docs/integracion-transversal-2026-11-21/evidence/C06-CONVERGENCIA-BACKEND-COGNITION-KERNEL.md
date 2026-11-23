# C06 — Contrato de convergencia backend / Cognition V2 / LAIA

Fecha de inspección: 2026-11-23. **Estado: auditoría parcial del código vivo, no integración terminada.** Rama de trabajo: `feat/continuacion-c05-voz-cognition-v2`. No ejecutar merge, deploy ni eliminación de ramas sin aprobación.

## Objetivo operacional innegociable

Dos realidades concurrentes y coherentes: (1) runtime determinista y kernel autorizador que ejecutan SOPs, workers, skills, herramientas y approvals; (2) LAIA conversacional, natural y de baja latencia, que recibe tarjetas contextuales compactas y verificables. El slow LLM observa resultados, eventos, conversación y procesos; propone tarjetas, hipótesis y acciones, **nunca ejecuta ni concede permisos**. Bus append-only, grafo, proyecciones y memoria son el puente. JEV.AI clasifica semántica bajo autorización de egress; ElevenLabs y Anam son puertos multimedia, no orquestadores ni autoridades.

## Hallazgos verificados por lectura de código

1. `engine/cognition/v2/runtime.ts` en la rama C05 contiene `InferenceLane("fast")`, `SlowCognitionQueue`, `CardDeliveryLedger`, `DeliveryRecoveryWorker`, `GlobalAttentionWorkspace`, `FiveMemories`, `CognitiveProjector`, `KernelReceiptProjector`, `RuntimeOutcomeProjector` y `CardOntologyService`. El fast recibe snapshots, reserva tarjetas con ledger y limita los mensajes de conversación; su ruta comenta explícitamente que no ejecuta herramientas ni fallback slow.
2. `engine/cognition/v2/slow.ts` en main y C05 es idéntico por SHA `20d5f339`: cola durable, leases/fences, revalidación de identidad y evidencia, clasificación semántica, emisión `cognition.v2.slow.status` mediante `DurableEventSink`. **Esto no demuestra** que todos los pasos del runtime y conversación alimenten automáticamente la cola slow. Se necesita trazar productores, subscribers y triggers.
3. `engine/cognition/v2/jev-classifier.ts` en main y C05 es idéntico por SHA `7fac3dbb`: existe `TypesafeJevClassifier` y un contrato `JevEgressGate` para autorización, cuotas y recibos. El comentario del adaptador dice expresamente que no hay activación automática ni egress empresarial. **No afirmar integración JEV operativa**.
4. `engine/conversation.ts` conserva un camino legacy con `shouldDelegateToSlow`, `delegate_task`, inyección de memorias y acciones. La ruta Cognition V2 comenta que no utiliza ese contexto ni esas herramientas. **Riesgo**: la mera coexistencia de ambos módulos no prueba que los endpoints reales estén exclusivamente en V2. Inspeccionar montaje de `app.ts`, selección de `conversation`, consumers y fallbacks antes de retirar tráfico.
5. `packages/domain/src/agent.ts` usa `active.default(true)`; C05 ya corrigió el uso permisivo para autorización de voz. El runtime chat de C04 comprueba `stored.active === true` explícitamente.
6. El adaptador C05 multimedia es mock/no conectado a HTTP; falta integración real, coordinación distribuida y pruebas CI verificadas.

## Matriz real de ramas (comparación GitHub contra main, 2026-11-23)

| Rama | Ahead / behind main | Decisión preliminar |
|---|---:|---|
| `campaign/c04-conversacion-universal` | 11 / 2 | Base conversacional ya incorporada a C05; no duplicar merge |
| `feat/continuacion-c05-voz-cognition-v2` | 33 / 2 | Candidata backend de convergencia, pendiente de gates |
| `feat/cognition-v2-W4-backfill` | 1 / 38 | Extraer diff de migración, comparar con main; no cherry-pick ciego |
| `feat/cognition-v2-W5-outcomes` | 1 / 36 | Revisar equivalencia del outcome projector actual |
| `feat/cognition-v2-W6-jev-contract` | 2 / 36 | Revisar equivalencia de JEV, egress y ontología; main ya contiene archivos relacionados |
| `feat/cognition-v2-runtime-C00-C15` | 0 / 23 | Ancestro de main; no necesita merge |
| `feat/cognition-v2-worker-reliability-504c0b5b` | 0 / 15 | Ancestro de main; no necesita merge |
| `feat/cognition-v2-stepwise-001-504c0b5b` | 0 / 14 | Ancestro de main; no necesita merge |
| `feat/voice-avatar-scaffold` | 11 / 67 | Legacy divergente; no merge completo, extraer contratos/UX útiles |
| `campaign/c00-preflight`, `c01-arqueologia`, `c03-cognition` | 1 / 2 cada una | Principalmente evidencia/documentación; verificar equivalencia |
| `campaign/c02-baseline-movil` | 23 / 2 | Mezcla UX móvil; mantener aislada según decisión del owner |
| `feat/freebuff-compliance-integral` | 60 / 2 | Rama operativa/legal con cambios backend; auditar por superficies, no mezclar indiscriminadamente |
| `feat/legal-privacy-ai-compliance` | 23 / 2 | Auditar dependencias legales; no bloquear C05 por páginas no relacionadas |

La comparación inversa de main contra C05 devuelve 2 commits y archivos de `apps/ui-lab`, `.github/workflows/ui-lab.yml` y `pnpm-lock.yaml`. Mantener la rama UX demo aislada y reconciliar lockfile con cautela; **no afirmar que C05 está sincronizada con main**.

## Plan de convergencia — orden estricto

### B01 Inventario y trazabilidad de código vivo
Crear matriz de cada ruta HTTP, worker, cron, evento y consumidor: punto de entrada, modo fast/slow/legacy, owner tenant, políticas, kernel, side effects, eventos emitidos, tests y observabilidad. Inspeccionar `app.ts`, `engine/service.ts`, `engine/conversation.ts`, `engine/cognition/v2/runtime.ts`, `cognition-worker-entry.ts` y schemas de bus. Etiquetar `LIVE_V2`, `LIVE_LEGACY`, `SHADOW`, `DEAD_DOCUMENTED`, `UNVERIFIED`.

### B02 Separar rutas activas de legacy sin borrar
Primero pruebas de paridad por endpoint, aislamiento de tenants, auth y consent. Después cortar **únicamente** el enrutamiento legacy demostrado equivalente; conservar código antiguo documentado y sin tráfico, con métricas de uso cero. Prohibido quitar scaffold hasta observabilidad Grafana/OTel y pruebas de rollback. No romper acciones V1 sin sustituto V2 verificable.

### B03 Canal de eventos y proyecciones para slow
Toda observación slow debe originarse en eventos autorizados y evidencias con IDs/revisiones, no en acceso indiscriminado a BD ni texto inventado. Event bus -> projector -> graph/context snapshot -> job durable slow; clasificación JEV opcional bajo egress gate -> propuesta de tarjeta con evidencia, estado epistemológico y TTL -> política/kernel -> ledger -> inyección fast. Nunca una tarjeta propuesta equivale a un hecho aprobado ni a autorización de acción.

### B04 Dos loops y presupuesto de latencia
FAST: respuesta incremental sin esperar a slow, JEV, proveedor avatar ni scans completos; presupuesto de tarjetas/tokens, cancelación/barge-in, backpressure y métricas p50/p95/p99. SLOW: asíncrono con lease, retry, idempotencia, event sourcing, control de tokens, revalidación de permisos, detección de contradicciones y feedback del resultado. La consciencia contextual es una **representación operativa** derivada de evidencias; no atribuir conciencia fenomenológica al modelo.

### B05 Integración de proveedores
JEV.AI: verificar modelo, contrato wire, autorización de salida, límites y receipts. ElevenLabs/Anam: credenciales, IDs, token efímero, session binding, interrupción, revocación y cleanup, sin guardar audio/tokens. Ningún proveedor debe conceder capacidades del kernel.

### B06 Consolidación de ramas
Extraer patchsets por ownership de archivo, detectar conflictos de rutas, schemas y migraciones, portar cambios faltantes a **una rama backend de integración**; mantener UX demo en paralelo sin cablear. Correr typecheck, suites HTTP y Cognition, gates de kernel, aislamiento multitenant, replay, observabilidad y smoke; producir reporte de diferencias y rollback. Merge a main solo con aprobación explícita del owner.

## Condición de aceptación

No declarar `BACKEND_UNIFIED` hasta demostrar: un único camino activo por funcionalidad; fast/slow V2 conectados al bus, grafo y kernel; tarjetas slow con procedencia y revisión; latencia medida y sin slow bloqueante; canales legacy sin tráfico pero conservados; integraciones externas bloqueadas hasta autorización; suites y CI verdes; diff de ramas reconciliado; rollback documentado.
