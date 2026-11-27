# 08 — COL-12: colaboración offline-first, sincronización y reconciliación

**Estado:** propuesta técnica y handoff; no implementada ni testeada. **Rama:** `docs/audit-time-scheduler-mobile-push-20261122`. **Dependencias:** docs 01–07 de este directorio, especialmente ClockPort, EventBus, TaskWorker, Assignment, Projects y COL-00 a COL-11.

## 1. Objetivo y límites
Una persona puede consultar y editar información previamente sincronizada de su ámbito autorizado aun sin cobertura; al reconectar se envían sus cambios pendientes y se reciben las novedades de agentes, compañeros y proveedores. El runtime cloud sigue ejecutando SOPs, workers, approvals y conectores mientras los dispositivos están offline. **Local-first en experiencia, server-authoritative en ejecución, permisos y estados canónicos.** Offline no significa que acciones externas se hayan realizado.

## 2. Matriz de capacidades
| Función | Offline | Reconciliación |
|---|---|---|
| Leer Kanban, proyectos, timeline y documentos cacheados | Sí, con marca de antigüedad | Pull incremental + snapshot |
| Crear comentarios, notas, checklist y borradores | Sí, outbox local | Append idempotente + validación |
| Mover tarjeta y replanificar | Provisional | CAS/version, políticas y resolución de conflicto |
| Asignar actor, cambiar fecha o dependencia | Borrador/propuesta según policy | Servidor autoriza y confirma |
| Aprobar pagos, enviar WhatsApp, ejecutar SOP, publicar, modificar permisos | No ejecución offline | Solicitud pendiente que exige validación online y, si corresponde, confirmación humana |
| Recibir novedades de otros actores | Solo lo cacheado | Pull de eventos/proyecciones desde cursor |
| Presencia en tiempo real | No; estado offline explícito | Reanudar heartbeat online |

## 3. Arquitectura y almacenamiento
- PWA/web: Service Worker para shell y assets versionados; **IndexedDB mediante Dexie** para caché estructurada por usuario/tenant/ámbito, outbox e índices. Service Worker no garantiza ejecución en segundo plano, especialmente en iOS: sincronizar al abrir app, al recuperar conectividad y durante sesión activa; Background Sync es mejora oportunista, no requisito de corrección.
- Android APK futura: reutilizar contrato de sync; almacenamiento y lifecycle nativos si Capacitor. No asumir que push ejecuta tareas en segundo plano.
- Backend: `GET /api/sync/bootstrap` snapshot autorizado paginado; `GET /api/sync/changes?cursor=...` delta autorizado y tombstones; `POST /api/sync/commands` lote limitado con resultados por operación; SSE acelera actualizaciones pero **no** reemplaza delta durable.
- Cursors: por tenant/principal/scope/versión de permisos, opacos y firmados; caducidad y expiración -> rebootstrap. No reutilizar cursor de otro usuario. Orden parcial por agregado, idempotencia por `commandId`; retención y compactación definidas.
- Persistencia local: esquema `cachedWorkItems`, `cachedProjects`, `cachedTimeline`, `cachedArtifactsMetadata`, `syncCursor`, `outbox`, `syncConflicts`, `schemaVersion`, `lastConfirmedAt`. Claves compuestas con tenantId + principalId + scopeId. No guardar secretos, tokens de servicios ni datos sensibles sin política explícita; minimizar caché y borrar al cerrar sesión/revocar acceso, reconociendo que no se puede borrar un dispositivo que permanezca offline hasta que reconecte.

## 4. Contratos orientativos
```ts
type OfflineCommand = {
  commandId: string; // UUID generado en dispositivo
  tenantId: string; // se valida contra identidad de sesión, jamás se confía en cliente
  sourceRef: { kind: string; id: string };
  action: "comment.add"|"checklist.set"|"card.move"|"schedule.propose"|"assignment.propose";
  payload: unknown; // discriminated union Zod en implementación
  expectedVersion?: number;
  clientCreatedAt: string; // informativo, NO autoridad temporal
  dependencies?: string[]; // commandIds que deben aplicarse antes
};
type SyncResult = {
  commandId: string;
  outcome: "applied"|"duplicate"|"conflict"|"rejected"|"retryable";
  serverVersion?: number;
  serverRecordedAt?: string;
  reasonCode?: string;
};
type SyncEnvelope = {
  cursor: string; hasMore: boolean; serverNow: string;
  events: Array<{eventId:string; aggregateId:string; version:number; occurredAt:string; recordedAt:string; type:string; payload:unknown}>;
  tombstones: Array<{resourceType:string;resourceId:string}>;
};
```
Definir contratos Zod, tamaño máximo de batch, límites de almacenamiento, migrations IndexedDB y política de limpieza. `clientCreatedAt` sirve para explicar al usuario cuándo editó; `serverRecordedAt` y versión determinan la aceptación y orden de ejecución.

## 5. Protocolo de sincronización
1. **Online inicial:** autenticación, scope de permisos, bootstrap paginado y cursor persistido atómicamente con snapshot.
2. **Offline:** la UI muestra datos cacheados y marca «sin conexión». Cada cambio permitido crea `OfflineCommand` durable en IndexedDB antes de mostrarse como pendiente; no afirmar «confirmado».
3. **Reconexión:** renovar autenticación, validar scope/versión de permisos, enviar outbox por orden causal en lotes, con idempotency keys y retry exponencial con jitter.
4. **Respuesta:** `applied`/ `duplicate` marcan confirmación; `conflict` abre resolución; `rejected` revierte provisional y explica causa; `retryable` conserva comando.
5. **Pull:** recuperar cambios desde cursor hasta `hasMore=false`, aplicar transaccionalmente versiones/tombstones y actualizar cursor. Refrescar proyecciones del tablero, timeline y bandejas. No perder novedades ocurridas durante el push: repetir pull hasta convergencia.
6. **Live:** SSE/WebSocket solo para invalidación y aceleración; al perder secuencia, forzar delta. Reconectar y revalidar permisos.
7. **Cambios de rol/revocación:** servidor filtra todo por PDP; caché se purga al detectar revocación y no se acepta outbox de un actor sin permiso. Proteger datos en dispositivos compartidos.

## 6. Resolución de conflictos
- Comentarios: append-only con UUID/idempotencia, sin last-write-wins destructivo.
- Checklist: cambios por ítem con versión; si ambos editan mismo ítem, conflicto o regla explícita, no sobreescritura silenciosa.
- Tarjetas: `expectedVersion` + CAS; si otro actor movió la tarjeta, ofrecer «mantener estado remoto / reintentar con nuevo estado» y conservar borrador.
- Fechas/dependencias: validar ciclo, capacidad y calendario del servidor; mostrar diff local/remoto.
- Documentos ricos: **fase posterior** con CRDT (p. ej. Yjs) solo donde haya edición simultánea real, con autorización y persistencia propia. No CRDT para approvals, pagos, permisos ni estado del worker.
- Orden causal: comandos relacionados se envían respetando dependencias; no ordenar únicamente por timestamp del móvil.

## 7. Reloj, UX y notificaciones
El reloj del dispositivo mueve la línea «ahora» y registra la hora percibida; el servidor usa UTC para `recordedAt` y controla deadlines/leases. Timezone IANA para jornadas, DST y horarios humanos. Mostrar tres estados **Guardado en este dispositivo / Sincronizando / Confirmado por servidor**, más «Conflicto» y «Rechazado». Timeline multicapa muestra hechos históricos y forecast con etiquetas distintas. Notificaciones push anuncian novedades online, pero el delta sync es la verdad. Al reconectar se ven todas las tareas, outputs, incidentes y aprobaciones surgidos durante la ausencia, con dedupe.

## 8. Seguridad y privacidad
- Authz por tenant + principal + proyecto + clientAccount + tipo de recurso en **cada comando y lectura**, no por `clientId` enviado.
- Cifrado en tránsito, protección de tokens, CSP y XSS; IndexedDB no es almacén secreto. Para datos altamente sensibles usar política de no-cache o almacenamiento cifrado con claves gestionadas y bloqueo de sesión.
- Cache namespaces separados; logout purga; dispositivo perdido, retención, consentimiento y export/borrado; evitar filtrar información entre dos cuentas en el mismo navegador.
- Replays, doble envío y acciones tardías no pueden duplicar facturas, correos, SOPs ni efectos externos.
- Si hay revocación mientras offline, el servidor rechazará operaciones; datos ya cacheados no pueden retirarse hasta reconexión. Explicar limitación al diseñar política de offline.

## 9. Campaña COL-12, fases y criterios
**COL-12.0 Auditoría:** inspeccionar frontend service worker/PWA, store, auth, API, eventos, endpoints, tests y ramas. Documentar archivos exactos y compatibilidad con `34-trello`, `07-linear` y `35-centro-mando`. No afirmar que Dexie/Sync ya existen.

**COL-12.1 Contratos:** Zod `OfflineCommand`, `SyncResult`, cursor, permisos y versiones; tests de validación, idempotencia y errores.

**COL-12.2 Backend:** bootstrap/delta con autorización, tombstones, paginación, command inbox y replay; snapshot coherente, migraciones, rate limits, métricas.

**COL-12.3 Cliente:** Dexie + cache y outbox transaccional, migraciones, estados UI, offline detection sin confiar solo en `navigator.onLine`, retries, backoff y gestión de cuotas.

**COL-12.4 Integración:** Kanban, checklist, comentarios y planificación; timeline y centro de mando consumen proyecciones comunes. DnD provisional nunca dispara SOP sin confirmación.

**COL-12.5 Seguridad:** revocación, multi-tenant, multi-account, logout, cambio de usuario, dispositivo compartido y retención.

**COL-12.6 Pruebas E2E:** (a) dos humanos editan offline la misma tarjeta; (b) Laia y Marcos cambian el proyecto mientras empleado offline; (c) proveedor aporta output; (d) el dueño reconecta y ve historial, estado actual, próximos pasos y riesgos; (e) fallo en mitad de batch; (f) restart de backend; (g) DST y reloj del móvil incorrecto; (h) outbox de tenant A jamás llega a B; (i) 500+ operaciones pendientes; (j) expiración de cursor y rebootstrap.

**COL-12.7 Rollout:** feature flag por tenant, piloto, métricas (sync lag, pending outbox, conflict rate, dedupe rate, failed commands, storage pressure), canary y rollback. **Sin merge/deploy sin aprobación.**

## 10. Definition of Done
- El usuario sigue trabajando en Kanban/checklists/comentarios sin red.
- Ningún comando crítico se ejecuta offline ni se muestra confirmado sin respuesta del servidor.
- Reconexión converge con cambios del usuario, agentes y otros actores; ninguna acción externa se duplica.
- Conflictos visibles y recuperables, sin pérdida silenciosa de cambios.
- Autorización y aislamiento probados; revocaciones respetadas en servidor.
- Historial, presente y futuro previsto diferenciados en timeline; reloj local nunca sustituye al servidor.
- Tests unitarios, integración y E2E reproducibles, reporte con comandos y evidencias.
