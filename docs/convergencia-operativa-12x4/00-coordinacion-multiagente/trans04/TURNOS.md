# Secuencia ejecutable — trans04

Leer [protocolo obligatorio](../PROTOCOLO-TURNOS.md). Ejecutar un turno completo por autorización; no parar entre pasos. Los pasos bloqueados se registran y se continúa lo independiente. Aplicar PATCHSETS.md de las fases correspondientes y el contrato de wiring.

## T01 — B1 contratos y ownership

1. Inventariar registry, exportador, collector, CI, gates y scripts de provisionamiento.
2. Ejecutar baseline disponible y registrar SHA, exit codes, skips; identificar tests existentes.
3. Diseñar OTLP, cardinalidad, trazas, fixtures y plan de dependencias; localizar repo sintético.
4. Publicar ownership, matriz de gates y solicitudes de hooks a propietarios.
5. Revisar diff y ownership, ejecutar pruebas disponibles, registrar evidencias y SHA en BITACORA, publicar PR sin merge.

**STOP B1 contratos y ownership**: único reporte breve en chat según protocolo. Esperar autorización del siguiente turno.

## T02 — B2 núcleo integrado

1. Implementar telemetría por proceso y dashboards iniciales sin duplicar registry.
2. Integrar dependencias aprobadas y lockfile; probar instalación reproducible.
3. Instrumentar trazas causales mediante hooks solicitados; medir baseline Fast/Slow y cola.
4. Ejecutar gates combinados disponibles; documentar collector caído y redacción.
5. Revisar diff y ownership, ejecutar pruebas disponibles, registrar evidencias y SHA en BITACORA, publicar PR sin merge.

**STOP B2 núcleo integrado**: único reporte breve en chat según protocolo. Esperar autorización del siguiente turno.

## T03 — B3 slices y seguridad owner

1. Preparar fixtures reproducibles y validar bundles; probar WhatsApp y cinco slices Google.
2. Integrar repo sintético tras verificar upstream/licencia; no tocar demo.
3. Auditar plan/apply/check, reserva, concurrencia y reanudación; plan owner sin apply.
4. Verificar seguridad mínima y evidencia de aislamiento antes de solicitar owner real.
5. Revisar diff y ownership, ejecutar pruebas disponibles, registrar evidencias y SHA en BITACORA, publicar PR sin merge.

**STOP B3 slices y seguridad owner**: único reporte breve en chat según protocolo. Esperar autorización del siguiente turno.

## T04 — B4 extensiones integradas

1. Actualizar observabilidad con ciberseguridad, gestoría y outcomes; dashboards y alertas.
2. Validar recompilación de bundle, migraciones y restore; ejecutar jornada E2E.
3. Ejecutar pnpm gate, test:cognition-v2, verify:slice y release checks disponibles.
4. Consolidar matriz de evidencia por SHA; no neutralizar NO_GO.
5. Revisar diff y ownership, ejecutar pruebas disponibles, registrar evidencias y SHA en BITACORA, publicar PR sin merge.

**STOP B4 extensiones integradas**: único reporte breve en chat según protocolo. Esperar autorización del siguiente turno.

## T05 — B5 auditoría cruzada

1. Auditar Trans03: adaptadores, scopes, egress, receipts y errores ambiguos.
2. Publicar findings; corregir propios defectos señalados por Trans03.
3. Reproducir gates y detectar mocks, skips, cardinalidad y fuga de secretos.
4. Revisar diff y ownership, ejecutar pruebas disponibles, registrar evidencias y SHA en BITACORA, publicar PR sin merge.

**STOP B5 auditoría cruzada**: único reporte breve en chat según protocolo. Esperar autorización del siguiente turno.

## T06 — B6 certificación final

1. Fault injection, carga, restore, collector caído y Postgres restringido.
2. Certificar SHA combinado tras integración supervisada; distinguir sandbox/producción.
3. Entregar informe final, bloqueos y runbooks; no desplegar.
4. Revisar diff y ownership, ejecutar pruebas disponibles, registrar evidencias y SHA en BITACORA, publicar PR sin merge.

**STOP B6 certificación final**: único reporte breve en chat según protocolo. Esperar autorización del siguiente turno.
