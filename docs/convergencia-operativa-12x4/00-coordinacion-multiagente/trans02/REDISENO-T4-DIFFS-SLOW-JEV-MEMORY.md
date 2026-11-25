# T4 — Slow, JEV, memoria: hunks candidatos no aplicados
## P04 slow.ts 20d5f3397f5bb7324ad8555b574335143fc831e4
En tick, después de lane.run y antes del UPDATE output, mover slowOutputSchema.parse y comprobación de evidencia. Sustituir JSON.stringify(raw) del UPDATE por JSON.stringify(output). Mantener fence/state/lease y RETURNING. Propuesta:
```ts
if (Buffer.byteLength(JSON.stringify(raw), "utf8") > 32000) throw Error("SLOW_OUTPUT_BUDGET");
const parsed = slowOutputSchema.safeParse(raw);
if (!parsed.success) throw Error("SLOW_OUTPUT_INVALID");
const output = parsed.data;
if (output.evidence.some(r => !job.data.evidence.some(e => digest(e) === digest(r)))) throw Error("FABRICATED_EVIDENCE");
const saved = await this.db.rawQuery(`UPDATE cognition_v2_slow_jobs SET output=$4::jsonb WHERE tenant=$1 AND id=$2 AND fence=$3 AND state='running' AND lease_until>$5 RETURNING id`,
 [tenant, job.id, job.fence, JSON.stringify(output), new Date(this.clock()).toISOString()]);
if (!saved.length) throw Error("STALE_SLOW_FENCE");
```
Eliminar parse duplicado posterior. En catch añadir códigos SLOW_OUTPUT_INVALID/SLOW_OUTPUT_BUDGET al allowlist; const terminal = job.attempts >= 5 || ["SLOW_OUTPUT_INVALID","SLOW_OUTPUT_BUDGET","FABRICATED_EVIDENCE","EVIDENCE_REVOKED","DENIED"].includes(code); sustituir condición de estado y emit por terminal. No cambiar cancelación ni fence. Validar si DENIED es transitorio por infraestructura antes de clasificarlo terminal; preferir denegación explícita separada de error PDP. No persistir salida inválida nueva; legacy output inválido termina sin reenviar, conservar hasta política de retención. Riesgo residual: output reutilizado no vinculado a contextDigest durable; migración aditiva output_context_digest text, guardar junto a output, verificar igualdad antes de reutilizar, legacy sin digest no reutilizar automáticamente (terminal/reconciliar). Revalidar todas las refs antes de capture, conservar transacción final. Test malformed provider output, fabricated ref, invalid legacy output, retry tras fallo capture sin nueva inferencia con mismo digest, context mismatch, cancel vs terminal CAS, lease vencido. Rollback no eliminar columna ni receipts.
## P06 jev-egress.ts 6acd84741eb232e19fd63776e1cf4389e508145b
storage.ts ya crea cognition_v2_lane_locks(tenant,lane) PK. Reutilizar fila lane='jev-egress' solo tras verificar RLS y ausencia de colisión con InferenceLane. En prepare, antes de quota INSERT:
```ts
await this.db.rawQuery("INSERT INTO cognition_v2_lane_locks(tenant,lane) VALUES($1,'jev-egress') ON CONFLICT DO NOTHING",[this.tenant]);
await this.db.rawQuery("SELECT lane FROM cognition_v2_lane_locks WHERE tenant=$1 AND lane='jev-egress' FOR UPDATE",[this.tenant]);
const now = this.clock();
if (Date.parse(grant.expiresAt) <= now) return null;
const day = new Date(now).toISOString().slice(0,10);
```
Eliminar day externo. Mantener cuota lock después de tenant lock; revalidar grant después de authorize y antes de INSERT, si día cambió durante authorize abortar sin consumo y no reenviar automáticamente. authorize dentro de tx solo si PDP local acotado; de otro modo BLOCKED_CONTRACT hasta puerto de revisión local. No contar uncertain indefinidamente como active sin política de reconciliación: separar reserva local vigente de incertidumbre remota, límite adicional de incertidumbre con circuit breaker y revisión autorizada. No refund. Tests dos conexiones PG a medianoche con reloj inyectado, grant expira esperando lock, mismo operation concurrente, reconcile/record late, quota sin consumo en rollback. No afirmar que lock controla proveedor remoto. Rollback deshabilitar JEV y conservar receipts.
## P13 memory.ts 0e94f73cce3dbd4404567c601c726ed20f604413
Autobiographical usa propose revision=1, id digest(actor,episodeIds). Propuesta versionada no destructiva: rechazar duplicate episodeIds, construir evidence una vez a partir de episodios ordenados, nuevo id digest(["autobiographical-v2.1",identity.tenantId,identity.actorId,identity.policyRevision,evidence]); pasar evidence a propose. Incluir policyRevision porque visibility forma parte del digest del record. No cambiar IDs históricos ni sourceEventId sin migración. Revalidar episodios exactos antes de journal; contexto vuelve a validar al servir. Versionar nuevo ID implica coexistencia temporal de agregados; no presentar ambos como independientes en ranking sin prueba de supersession. Tests mismo conjunto permutado mismo ID, nueva revision nuevo ID, policy revision nueva, duplicate input deny, revoke episode invalida derivado, cross tenant, replay. Auditar consumers de ID antes de aplicar; si requieren identidad estable, usar revision CAS en vez de nuevo ID. No tocar otras cuatro memorias salvo pruebas de regresión.
## Estado
Hunks candidatos sin compilar, no tests. Contratos pendientes: local PDP JEV, retención legacy, consumidores memoria y output digest migration. No GO ni nota nueva. Solo documentación Trans02.
