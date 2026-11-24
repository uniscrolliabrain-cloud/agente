# Secuencia ejecutable — Trans01

Leer [protocolo obligatorio](../PROTOCOLO-TURNOS.md). Ejecutar un turno completo por autorización; no parar entre pasos. Los pasos bloqueados se registran y se continúa lo independiente. Aplicar PATCHSETS.md de las fases correspondientes y el contrato de wiring.

## T01 — B1 contratos y ownership

1. Inventariar ramas C00–C05 y patch equivalence; registrar SHA y rutas vivas/legacy/shadow.
2. Mapear app.ts/service.ts, kernel, bus, SOPExecutor, CapabilityRunner y contratos dominio.
3. Congelar propuesta de envelope causal, receipts, permisos, idempotencia y solicitudes de persona; registrar consumidores.
4. Diseñar migraciones y rollback; pruebas rojas de tenant, replay y autorización; publicar ownership exacto.
5. Revisar diff y ownership, ejecutar pruebas disponibles, registrar evidencias y SHA en BITACORA, publicar PR sin merge.

**STOP B1 contratos y ownership**: único reporte breve en chat según protocolo. Esperar autorización del siguiente turno.

## T02 — B2 núcleo integrado

1. Reconciliar patches aprobados sin sobrescribir Cognition; preservar V1 operativo.
2. Implementar contratos y outbox/inbox, dedupe y receipts; montar hooks de observación.
3. Integrar app/service con factory trans02 y puertos Trans03; instrumentar hooks solicitados por trans04.
4. Probar autorización, fallo de proveedor, replay y rollback; publicar PR.
5. Revisar diff y ownership, ejecutar pruebas disponibles, registrar evidencias y SHA en BITACORA, publicar PR sin merge.

**STOP B2 núcleo integrado**: único reporte breve en chat según protocolo. Esperar autorización del siguiente turno.

## T03 — B3 slices y seguridad owner

1. Registrar capacidades WhatsApp y Google, SOPs y aprobaciones por operación.
2. Cablear receipt verificado y evento causal para cada slice; distinguir resultado ambiguo.
3. Auditar aislamiento y OAuth revocado con trans03; seguridad mínima antes de owner.
4. Integrar provisionador de trans04 y roles; plan owner sin apply no autorizado.
5. Revisar diff y ownership, ejecutar pruebas disponibles, registrar evidencias y SHA en BITACORA, publicar PR sin merge.

**STOP B3 slices y seguridad owner**: único reporte breve en chat según protocolo. Esperar autorización del siguiente turno.

## T04 — B4 extensiones integradas

1. Registrar ciberseguridad y gestoría bajo policy y capability registry; prohibir remediación/pagos automáticos.
2. Recompilar SOPs y dominios con bootstrap existente, preservar customizaciones.
3. Verificar receipts, eventos y contexto de todos los dominios; retirar duplicación solo con paridad.
4. Preparar cierre de ramas con SHA preservado, equivalencia y rollback.
5. Revisar diff y ownership, ejecutar pruebas disponibles, registrar evidencias y SHA en BITACORA, publicar PR sin merge.

**STOP B4 extensiones integradas**: único reporte breve en chat según protocolo. Esperar autorización del siguiente turno.

## T05 — B5 auditoría cruzada

1. Auditar trans02 sobre SHA integrado: selección V2, persona, ACL, bucles, causalidad.
2. Publicar findings reproducibles; corregir propios contratos tras auditoría de trans02.
3. Reejecutar regresión de runtime, SOP y slices; verificar no bypass legacy.
4. Revisar diff y ownership, ejecutar pruebas disponibles, registrar evidencias y SHA en BITACORA, publicar PR sin merge.

**STOP B5 auditoría cruzada**: único reporte breve en chat según protocolo. Esperar autorización del siguiente turno.

## T06 — B6 certificación final

1. Fault injection en outbox, leases, revocación y concurrencia Postgres restringido.
2. Probar replay sin repetir efectos, restore y rollback; verificar gates.
3. Entregar veredicto y lista de ramas reconciliadas para cierre autorizado.
4. Revisar diff y ownership, ejecutar pruebas disponibles, registrar evidencias y SHA en BITACORA, publicar PR sin merge.

**STOP B6 certificación final**: único reporte breve en chat según protocolo. Esperar autorización del siguiente turno.
