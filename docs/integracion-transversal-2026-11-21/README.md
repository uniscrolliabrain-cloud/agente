# Integración transversal coherente — handoff para Codex
Fecha: 2026-11-21. Rama: `docs/integracion-transversal-coherente-20261121`. Base inicial: `main` SHA `3023637d72994460b1aa4742f558557ec0c69922`.

## Misión
Reconstruir **con evidencia actual** todas las ramas, PRs, commits, código, tests, CI y despliegues del repositorio `uniscrolliabrain-cloud/agente`; integrar en `main` solamente trabajo válido y coherente; mantener el chat móvil probado, Cognition V2 y el kernel como contratos de referencia; documentar obsolescencia sin perder historia. Esta rama es **documental y preparatoria**, NO autoriza merge, deploy ni borrado de ramas.

## Estado de evidencia y límites
- Auditoría GitHub 2026-11-21: `main` en `3023637`; `fix/mobile-chat-sheet-keyboard-gestures` **22 ahead / 0 behind** frente a main. PR #16 de chat móvil. La interfaz probada por el fundador puede estar desplegada desde una rama o SHA diferente; **no está probado** el SHA de producción.
- `feat/voice-avatar-scaffold`: **11 ahead / 65 behind** y divergente respecto a main en auditoría anterior; código reutilizable, no merge automático.
- Cognition V2 runtime C00-C15 y stepwise estaban incorporadas a main (0 ahead); ramas W4/W5/W6 divergentes contienen trabajo que exige análisis por patch y vigencia.
- Se localizaron 100 commits recientes por búsqueda global; se inspeccionaron individualmente 30. **NO se afirma auditoría completa de todos los commits**. Codex debe completarla y verificar los datos al ejecutar.
- `feat/legal-privacy-ai-compliance`, `docs/2026-11-17-universal-conversation`, `audit/preflight-cognition-option3-20261115`, `wip/mobile-chat-sheet`, observabilidad y demás ramas: clasificación pendiente de inventario exhaustivo.

## Orden de lectura
1. `01-INVENTARIO-Y-CRITERIOS.md`
2. `02-ARQUITECTURA-Y-CONFLICTOS.md`
3. `03-CAMPANAS-CODEX.md`
4. `04-HANDOFF-CODEX.md`
5. [Informe de integración por rama](05-INFORME-POR-RAMA.md)
6. [Estado y cierre de la integración transversal](07-ESTADO-Y-CIERRE-TRANSVERSAL.md)
7. [Auditoría del repositorio actualizado · 24 de noviembre](08-AUDITORIA-DELTA-20261124.md)

## Invariantes
- Tenant/actor/rol/policy en servidor; deny-by-default, RLS, fail-closed, auditoría y idempotencia.
- Un solo contrato de conversación/hilos para texto, voz, vídeo, móvil y escritorio; no crear segundo runtime que evite Cognition o el kernel.
- Separar LLM fast de slow; no habilitar escrituras empresariales de Cognition sin flujo real de aprobación/ActionService.
- Preservar UX de bottom sheet móvil y sus gestos/teclado antes de cualquier integración.
- Un cambio no es terminado sin pruebas, evidencia, reporte y plan de rollback.
- No divulgar secretos, no alterar producción sin aprobación humana explícita.

## Fuentes primarias
- PR móvil: https://github.com/uniscrolliabrain-cloud/agente/pull/16
- Branch móvil: https://github.com/uniscrolliabrain-cloud/agente/tree/fix/mobile-chat-sheet-keyboard-gestures
- Branch avatar: https://github.com/uniscrolliabrain-cloud/agente/tree/feat/voice-avatar-scaffold
- `docs/implementation/cognition-v2/`
- `docs/audits/mobile-chat-sheet/` (rama móvil)
- `docs/08-auditorias/avatar-voz-scaffold-2026-11-11.md` (rama avatar)
- `docs/auditoria-integral-30-angulos/03-harness-conversacional/campanas-redisenio-v2/C13-ANAM-AVATAR-VOZ-REALTIME-INTERRUPCIONES-SESIONES.md`

## Auditoría complementaria y actualización de documentación

Leer también [06 — Auditoría de integración y vigencia documental](06-AUDIT-RECOMENDACIONES-Y-VIGENCIA-DOCS.md). Añade recomendaciones para C04–C10 y un plan D00–D04 para clasificar, encabezar y actualizar la documentación de `main` mediante PRs revisables. La existencia del plan no implica que los archivos de `main` ya estén actualizados.
