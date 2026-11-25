# M1 — fronteras HTTP, conversación y admisión cognitiva

## Evidencia Trans02
- threads-routes.ts 5eb8f5f6: POST crea threads y conversations; PUT acepta z.array(z.unknown()).max(1000), CAS con predicado {}, expectedUpdatedAt opcional y comprobación previa separada; lock local por x-user-id u owner. No constituye journal inmutable ni prueba de autoría individual. No asumir aislamiento roto sin comprobar middleware y Store. No ampliar reparación general de threads en Trans02.
- cognition-v2-routes.ts c6b106fc: identity deriva ctx autenticado y owner, propósito chat. POST /slow recibe prompt, snapshotId, key, resuelve refs card/memory y enqueue. Es análisis manual existente, no admisión de operación. DELETE references revoca y emite evento en transacción. ACK delivery no expuesto.
- app.ts 96b0aaf5: 160–164 crea runtime opt-in y EventBus con cognitionV2.sink; 715–721 monta rutas, captura Slow y asigna agent.cognitionV2; 789 monta threads con db y authz. Reutilizar composición, no segundo bus.
- agent.ts 503e0c7e: ownerFor conoce V2 pero factory no monta CognitionV2ChatAgent.
- engine/service.ts 8b47bf26: 194 propiedad cognitionV2; 809–810 excluye tenants V2 de consumidores legacy audit/notifications.
- events/types.ts 8fa15f61 y schemas.ts 05df5af1: tres tipos cognition.v2 existentes (record.proposed, source.revoked, slow.status). No tipo de intención V2 observado. Cambios al registro cerrado coordinados con Trans01.
- tests/cognition-v2-http.test.ts 3d9bd228: fixture tenant-a/b, runtime real y Slow sintético; reutilizar sin proveedores reales.

## Decisiones candidatas
1. Separar historial editable de admisión de intención autenticada. No derivar eventos operativos de PUT threads ni de texto assistant. El usuario puede pedir análisis sin pedir acción; Slow interpreta y propone, kernel decide.
2. P01: verificar ACL thread antes de aceptar run; preservar flujos legítimos de creación y AGUI explícito. No asumir que todos los IDs de thread ya existen: contrastar frontend y tests. No usar x-user-id como autoridad.
3. P04: mantener POST /slow como lane de análisis manual. Si se amplía schema de salida, fijar modo analysis_only por servidor para esta ruta; ningún campo cliente habilita admisión operativa. Conservar contrato HTTP y cancelación.
4. Productor de intención: utilizar EventBus/sink existente tras comprobar semántica de commit y errores. Si emisión no es atómica con run, outbox transaccional en mismo Store con relay idempotente; no doble escritura directa sin reconciliación. Payload solo referencia, actor y binding; no duplicar texto sensible.
5. Revocación: consumidor debe revalidar fuente y política antes de inferir y antes de proyectar/admitir. Borrado de thread debe definir efecto sobre intención pendiente con Trans01; no eliminar auditoría durable.
6. No cambiar consumidores legacy para tenants no opt-in. No activar worker en API si despliegue separado; conservar health checks.

## Gates candidatos
- HTTP: prompt manual intenta solicitar operación → ninguna admisión kernel; snapshot sin evidencia elegible → error tipado; actor A intenta snapshot/thread B → rechazo; client history falsificado no produce intención.
- Concurrencia: dos runs mismo mensaje y binding → una intención; mismo identificador con contenido diferente → conflicto; crash tras commit antes de respuesta → recuperación sin duplicado.
- Compatibilidad: AGUI externo explícito, legacy no opt-in, thread nuevo y existente; preserve /slow, /cancel, /journey y migraciones.
- Integración: evento durable y proyección una vez; sink caído no anunciar aceptación; revocación entre enqueue y admisión; no segundo bus ni doble audit.

## Pendientes y límites
No se ha comprobado todavía el montaje completo de middleware, frontend de threads, callers globales de business-read ni semántica de EventBus.write/emit en esta revisión. No cerrar M1 hasta revisar esos bordes y los README individuales de las 48 pasadas. No código, tests ni canónica modificados. Nota histórica 8.7 sin cambio.
