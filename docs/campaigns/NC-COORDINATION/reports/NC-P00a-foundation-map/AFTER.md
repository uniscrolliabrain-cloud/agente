# AFTER — NC-P00a: mapa y contratos de la base compartida

| Campo | Valor |
| --- | --- |
| Unidad | NC-P00a (fase 0 compartida, parte documental) |
| Fecha | 2026-10-30 |
| Base | `main` **4f81f22** |
| Rama | `campaign/nc-p00a-foundation-map` |
| Commit de la entrega | **pendiente**: este informe viaja en el mismo commit; no se inventa un SHA |
| SHA probado | `4f81f22` (solo lectura; no hay código ejecutable modificado) |
| Autor | Implementador Freebuff |
| Estado | **`ready_for_review`** |

## 1. Resultado

Queda disponible el paquete documental de NC-P00a: mapa de arquitectura con evidencia `archivo:línea`, registro de propiedad, seis solicitudes de puente, contratos mínimos y cuatro patchsets ordenados. No se ha modificado ninguna superficie de ejecución.

Recorrido que ahora existe: cualquier revisor puede seguir el cableado real de tenant/actor, memoria, contexto, kernel y eventos desde `ARCHITECTURE-MAP.md`, ver qué archivo tiene un solo escritor en `FILE-OWNERSHIP.md`, y decidir si acepta las fichas de `BRIDGE-REQUESTS.md` antes de abrir PS-01.

## 2. Archivos realmente cambiados

Nuevos (7):

- `docs/campaigns/NC-COORDINATION/ARCHITECTURE-MAP.md`
- `docs/campaigns/NC-COORDINATION/FILE-OWNERSHIP.md`
- `docs/campaigns/NC-COORDINATION/BRIDGE-REQUESTS.md`
- `docs/campaigns/NC-COORDINATION/CONTRACT-CANDIDATES.md`
- `docs/campaigns/NC-COORDINATION/PATCHSETS.md`
- `docs/campaigns/NC-COORDINATION/reports/NC-P00a-foundation-map/BEFORE.md`
- `docs/campaigns/NC-COORDINATION/reports/NC-P00a-foundation-map/AFTER.md`

Modificados: ninguno. Sin cambios en `apps/**`, `packages/**`, `tests/**`, configuración ni lockfiles.

## 3. Diferencias respecto al informe previo

- Se añadió `apps/server/src/engine/business/graph.ts` a la allowlist de PS-03 tras verificar que `BusinessGraph` declara `db: Store` (`graph.ts:56`) y no acepta `TenantScopedStore` sin ampliar tipo o adaptador. El alcance no crece: era una dependencia oculta del mismo cambio.
- Se corrigieron referencias de línea tras verificarlas (`app.ts:299` para `AgentService`, `memory.ts:110/191`, `events/bus.ts:64`).
- No se cambió el objetivo ni se añadieron documentos fuera de NC-P00a.

## 4. Pruebas y comprobaciones

| Comprobación | Comando | Resultado |
| --- | --- | --- |
| SHA base y ausencia de commits posteriores | `git fetch origin --prune` + `git log --oneline -4 origin/main` | `4f81f22`; sin cambios posteriores |
| Paths citados existen | bucle `test -e` sobre 37 rutas del mapa/anexos | 0 ausentes |
| Enlaces relativos resuelven | `grep -o '](\./[^)]*)'` + comprobación manual | 6 enlaces, todos existentes |
| Alcance del cambio | `git status --short` | solo los 7 documentos declarados |
| Typecheck / tests | no ejecutados | **no aplica**: no hay código modificado |

No hay aserciones de test que puedan fallar. No se presenta esta unidad como validación de comportamiento.

## 5. Qué es real, simulado y no comprobado

- **Real (leído en el SHA):** el cableado, las firmas, los namespaces y las líneas citadas.
- **Simulado:** nada; no se crearon fixtures ni mocks.
- **No comprobado:** el comportamiento en runtime de los hallazgos F3/F4/F10 (requieren prueba con dos tenants y reinicio) y el impacto sobre memorias existentes.

## 6. Compatibilidad, migraciones y rollback

- Sin cambios de contrato, datos ni migraciones.
- Rollback: revertir la PR documental. No quedan artefactos en runtime.
- Los documentos fijan `4f81f22`; si `main` avanza, las líneas pueden desplazarse y deben revalidarse antes de PS-01.

## 7. Riesgos y pendientes

1. **Asignación:** Codex no ha asignado formalmente esta unidad; es una propuesta. Si asigna otra, este paquete queda como referencia y no consume reservas.
2. **Aceptación VS:** las fichas NC-BR-001…003 y las reservas de PS-01/PS-03 siguen en `proposed`; ninguna autoriza a editar.
3. **Ontología y Jev:** bloqueados por falta de fuente y de API verificada; no se han inventado.
4. **Reproducción:** falta convertir F3/F4/F10 en pruebas fallidas antes de arreglarlas. No se arregla nada «de paso».
5. **Publicación:** la rama puede publicarse, pero el push y la PR en borrador dependen de credenciales y de que Codex confirme la base.

## 8. Impacto en las dos campañas

- **Núcleo:** desbloquea PS-01..PS-04 y da a NC-P01/P02 un mapa y unos contratos sobre los que construir sin duplicar memoria, contexto ni bus.
- **Vertical:** VS-01 recibe el diagnóstico exacto del worker sin scope y el plan para cerrarlo dentro de la base común, no como un parche separado.
- **Cline/Copilot:** los informes quedan en el namespace de NC; no se tocan índices ni verificaciones del vertical.

## 9. Entrega

- Rama: `campaign/nc-p00a-foundation-map` (worktree `agente-nc-p00`).
- PR: pendiente de publicación; se abrirá en borrador si Codex lo autoriza.
- Recuperación: el commit contiene los 7 archivos; si el worktree se pierde antes de publicar, se puede regenerar desde este informe y el bundle que se cree al publicar.

## 10. Qué debe revisar Codex

1. Si NC-P00a es la unidad correcta y la rama `campaign/nc-p00a-foundation-map` es aceptable.
2. Si el mapa contiene algún hecho mal atribuido o alguna línea desactualizada.
3. Si las reservas de `FILE-OWNERSHIP.md` §4 son compatibles con el jefe VS.
4. Si NC-BR-001 (scope del worker) y NC-BR-003 (namespace de memoria) son el orden correcto o deben invertirse.
5. Si la política de registros antiguos de memoria es suficiente o exige migración antes de tocar el namespace.
6. Si autoriza push de la rama y PR en borrador, o prefiere integrar desde un bundle.
