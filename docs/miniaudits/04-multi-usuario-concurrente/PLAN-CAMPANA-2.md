# PLAN_CAMPANA_2_V1

Plan de las 7 fases de la Campana 2 (Multiusuario). Cada fase tiene su garantia, sus patchsets, sus condiciones de activacion y su criterio de cierre.

## Tabla de fases

| Fase | Garantia | Patchsets | Condicion de activacion | Criterio de cierre |
|---|---|---|---|---|
| F0 | - | 6 docs | Campana 1 cerrada | 6 docs con marca, typecheck registrado |
| F1 | G1 | 15 | F0 PASS | 15 marcas, 17 pruebas, typecheck verde |
| F2 | G2 | 32 | F1 PASS | 32 marcas, 12 pruebas, typecheck verde |
| F3 | G3 | 26 | F2 PASS | 26 marcas, 17 pruebas, typecheck verde |
| F4 | G5 | 9 | F3 PASS | 9 marcas, 10 pruebas, typecheck verde |
| F5 | G4 | 10 | F4 PASS y multiProcess o sseReplayEnabled | 10 marcas, 10 pruebas, typecheck verde |
| F6 | G5 | 9 | F5 PASS y auditTrailEnabled o recordHistoryEnabled | 9 marcas, 10 pruebas, typecheck verde |
| F7 | - | 19 | F6 PASS | 17 tests, KNOWN_ISSUES, CIERRE-MVP, typecheck verde |

## Condiciones de activacion

- F5 I9 (presence y lock compartidos): solo si Config.multiProcess es true. Si single-instance, in-memory.
- F5 I11 (SSE replay): solo si Config.sseReplayEnabled es true. Si no reconecta, no-op.
- F6 I12 (RecordHistory): solo si Config.recordHistoryEnabled es true. Si activity cubre, no se activa.
- F6 I13 (AuditTrail): obligatorio. Config.auditTrailEnabled debe ser true en produccion.

## Matriz de dependencias

| Fase | Depende de | Bloquea a |
|---|---|---|
| F0 | Campana 1 | F1 |
| F1 | F0 | F2 |
| F2 | F1 | F3 |
| F3 | F2 | F4 |
| F4 | F3 | F5 |
| F5 | F4 | F6 |
| F6 | F5 | F7 |
| F7 | F6 | Campana 3 |

Regla: si una fase no esta PASS, la siguiente se aborta. No se saltan fases.

## Orden de ejecucion con 8 IAs

- IA-1: F0. 6 docs. Docs-only.
- IA-2: F1. 15 patchsets. Dominio y server.
- IA-3: F2. 32 patchsets. Dominio, authz y 14 handlers.
- IA-4: F3. 26 patchsets. Dominio, assignments y 5 adapters.
- IA-5: F4. 9 patchsets. Dominio, withWrite y routes.
- IA-6: F5. 10 patchsets. Presence, lock y notifications.
- IA-7: F6. 9 patchsets. Trazabilidad.
- IA-8: F7. 19 patchsets. Tests y docs.

Cada IA recibe su handoff, el repo en disco, el protocolo TypeScript v2 y las reglas PowerShell v2.1. No necesita el chat completo ni el resto de handoffs.

## Criterio de cierre de la campana

- Los 17 tests de F7 en verde (14 obligatorios y 3 condicionales o SKIP justificado).
- Typecheck verde.
- KNOWN_ISSUES.md firmado.
- -pendientes.md actualizado.
- git push origin feat/multitenancy-campaign.
- Confirmacion: Campana 2 cerrada. Siguiente: Campana 3.
