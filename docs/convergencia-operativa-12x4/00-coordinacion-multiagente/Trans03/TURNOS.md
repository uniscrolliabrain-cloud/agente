# Secuencia ejecutable — Trans03

Leer [protocolo obligatorio](../PROTOCOLO-TURNOS.md). Ejecutar un turno completo por autorización; no parar entre pasos. Los pasos bloqueados se registran y se continúa lo independiente. Aplicar PATCHSETS.md de las fases correspondientes y el contrato de wiring.

## T01 — B1 contratos y ownership

1. Inventariar Evolution y Meta, OAuth Google, Maps/Docs, Composio, media y JEV; localizar upstreams propios.
2. Mapear contratos, scopes, secretos por nombre, licencias y adapters existentes.
3. Proponer puertos, errores ambiguos, receipts y capability IDs; solicitar deps a trans04 y registro a Trans01.
4. Diseñar pruebas sandbox/mock y lista única de owner actions; publicar ownership.
5. Revisar diff y ownership, ejecutar pruebas disponibles, registrar evidencias y SHA en BITACORA, publicar PR sin merge.

**STOP B1 contratos y ownership**: único reporte breve en chat según protocolo. Esperar autorización del siguiente turno.

## T02 — B2 núcleo integrado

1. Implementar puertos externos aprobados, JEV transport y media Anam/ElevenLabs; no invadir cognition.
2. Integrar Composio sin ruta de ejecución paralela; validar scopes y egress.
3. Probar lifecycle, cancelación, timeout, revocación y provider unavailable.
4. Dejar stubs fail-closed si faltan credenciales; entregar contratos y solicitudes de wiring.
5. Revisar diff y ownership, ejecutar pruebas disponibles, registrar evidencias y SHA en BITACORA, publicar PR sin merge.

**STOP B2 núcleo integrado**: único reporte breve en chat según protocolo. Esperar autorización del siguiente turno.

## T03 — B3 slices y seguridad owner

1. Completar WhatsApp inbound/outbound, firma, binding, dedupe y reconciliación.
2. Completar Maps, Calendar, Drive, Gmail y Docs secuencialmente sobre OAuth existente.
3. Probar cada slice con receipt y eventos; verificar ACL, scopes y revocación.
4. Preparar conexiones owner, sin activar cuentas ni enviar mensajes reales sin autorización.
5. Revisar diff y ownership, ejecutar pruebas disponibles, registrar evidencias y SHA en BITACORA, publicar PR sin merge.

**STOP B3 slices y seguridad owner**: único reporte breve en chat según protocolo. Esperar autorización del siguiente turno.

## T04 — B4 extensiones integradas

1. Auditar tarball ciberseguridad y upstream; actualizar delta y adapters.
2. Integrar gestoría versionada y contratos de conciliación; no pagos/declaraciones reales.
3. Revisar errores ambiguos, egress, cuotas y duplicación Composio/directo.
4. Entregar matriz de servicios, owner actions y evidencias para recompilación.
5. Revisar diff y ownership, ejecutar pruebas disponibles, registrar evidencias y SHA en BITACORA, publicar PR sin merge.

**STOP B4 extensiones integradas**: único reporte breve en chat según protocolo. Esperar autorización del siguiente turno.

## T05 — B5 auditoría cruzada

1. Auditar trans04: CI, fixtures, telemetría, provisionamiento y gates.
2. Publicar findings; corregir propios defectos señalados por trans04.
3. Repetir pruebas de revocación, timeout ambiguo y permisos mínimos.
4. Revisar diff y ownership, ejecutar pruebas disponibles, registrar evidencias y SHA en BITACORA, publicar PR sin merge.

**STOP B5 auditoría cruzada**: único reporte breve en chat según protocolo. Esperar autorización del siguiente turno.

## T06 — B6 certificación final

1. Probar firma falsa, replay, rate limit, kill switch y reconciliación.
2. Sandbox solo autorizado; probar degradación de proveedores y rollback de versión.
3. Entregar matriz configured/verified/blocked y pendientes externos.
4. Revisar diff y ownership, ejecutar pruebas disponibles, registrar evidencias y SHA en BITACORA, publicar PR sin merge.

**STOP B6 certificación final**: único reporte breve en chat según protocolo. Esperar autorización del siguiente turno.
