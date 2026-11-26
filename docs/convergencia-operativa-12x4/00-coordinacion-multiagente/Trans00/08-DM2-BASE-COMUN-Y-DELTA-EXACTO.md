# D-M2 — reconciliación de base común por blobs, no por antigüedad de ramas

Fecha 2026-11-26. Referencia main nueva `55655cdba0348539a0169881794968761af85443`; D-M1 partió de `26b9902d4b5a5e344969cfacab578025b8573b72`. Compare GitHub: 8 commits adicionales, 62 paths informados (55 docs UI-lab settings y 7 jobs/requests image-pipeline), sin cambios en las superficies del core inventariadas. Canónica y seis ramas no cambiaron. Ocho árboles recursivos completos, alcance 1489 paths, 58 divergentes. Matriz exacta generada directamente de los árboles: [09-DM2-DELTA-MANIFEST.json](09-DM2-DELTA-MANIFEST.json). No es un patchset aplicado ni un permiso para importar archivos.

## Decisión robusta

- Base candidata de ejecución: main actual, vuelto a fijar en D-M3 y antes de E-M1. Mantener todos sus cambios, incluidos app.ts, workflow legal release check, lockfile, UX y legal.
- Recuperar únicamente 50 deltas funcionales únicos respecto a main/canónica (33 Trans01, 10 Trans02, 3 Trans03, 4 Trans04). Trans05 duplica exactamente los 10 de Trans02. Trans06 no aporta delta core propio. Los 50 paths cumplen baseBlob===canonicalBlob y un único sourceBlob candidato. Ausencia en base expresada null; no tratar como string. Esto elimina conflictos **de blob en esta selección**, no demuestra compatibilidad semántica, typecheck ni integración.
- Conservar los 50 archivos y sus tests como conjunto de candidatos de implementación previa; abrir diffs y revisar cada contrato antes de incluirlos. No copiar la documentación histórica ni la .gitignore de Trans01 en bloque. No merge completo de ramas divergentes; tampoco rebase/force-push.
- No crear worktrees ni cambiar refs históricas en D-M2. Al autorizar ejecución, Trans00 prepara ref de integración nueva a partir de main, con delta revisado por dueños. Si la autorización incluye creación de ramas de ejecución aisladas, nombres candidatos exec/Trans01..exec/Trans06; no mover Trans01–06 originales. Los seis agentes reciben SHA exacto y rama exclusiva; cualquier nueva rama necesita autorización y verificación de triggers. Las campañas siguen leyéndose por SHA fijado, no requieren copiar documentos a la base funcional.

## Reglas de importación inicial B1

1. Fijar main y seis HEADs; comparar todo árbol y rutas compartidas otra vez. Si cambia baseBlob o sourceBlob, detener **esa entrada**, abrir diff de tres vías y devolver al dueño. No sobrescribir un blob nuevo de main con el antiguo.
2. En entorno Git del ejecutor, crear rama de integración autorizada, checkout limpio, instalar lock de main sin cambios. Verificar actual Node >=22.6.0, pnpm@11.19.0; comparar CI Node 22 y entorno Astra Node 24.22.3, registrar versiones. No actualizar dependencias para forzar verde.
3. Revisar grupo T01 como unidad coherente (DB, wrapper, tipos, effect outcome, event seq, hook, service, SOP, tests). Trans04 revisa hook sin escribir simultáneamente. Preflight de migración y rollback. Grupo T02/05 una sola vez; P01 factory todavía pendiente porque main agent.ts no incluye chat-agent y ConversationAgent actualmente deriva a V2. T03 Google/meta/stub y T04 registry/exporter/request logger entran con tests. No duplicar feature ni marcar LIVE por presencia.
4. Una opción mecánica, solo con autorización y checkout de staging: por path comprobar `git rev-parse HEAD:<path>` (o ausencia) coincide con baseBlob, `git rev-parse <sourceCommit>:<path>` coincide con sourceBlob, inspeccionar `git diff HEAD <sourceCommit> -- <path>`, aplicar delta selectivo (`git restore --source=<sourceCommit> --worktree --staged -- <path>` solo cuando igualdad de base esté probada y revisión del dueño lo autorice). Verificar diff staged contra manifest exacto. No usar restore global ni copiar blobs en caso de divergencia. En grupos sucesivos el HEAD esperado para cada path aún no escrito sigue siendo el baseBlob. Cambios nuevos posteriores se aplican como hunks propios, no en importación. Conservar los commits de origen y atribución en manifest. Revertir cada commit de importación por separado en staging si falla; si migración ya aplicada, rollback operativo sin borrar evidencias.
5. Ejecutar baseline de main separado, después focused por grupo y combinado. Sin runner en Trans00 actual: todos NOT_RUN. Si falta runner/contrato, no declarar SHA funcional integrado. B1 técnico histórico permanece NO_GO hasta gate de la base autorizada. No lanzar ejecución live ni proveedor por importar código.

## Anclas de composición comprobadas

| Archivo actual | Blob | Comprobación y consecuencia |
|---|---|---|
| app.ts main | 6bdb5675a89f56bcb6e956d063b339bb90af2e78 | L162 crea CognitionV2Runtime si tenants; L164 EventBus usa sink V2; L174 ActionService llama workspace.execute. Trans01 conserva montaje y cablea contrato de efecto con Trans03. JEV/telemetry no se montan por copiar adapter. |
| agent.ts main | 503e0c7e2babf631b3a3601a43fdcd4a3048b959 | makeRuntime crea ConversationAgent o HttpAgent; dueño T02. No eliminar AGUI ni legacy; ConversationAgent L147 ya deriva a V2, reconciliar con factory nuevo sin dos rutas activas. |
| engine/conversation.ts main | 182efc387b9e20d5346fe30d93e6bb3326b2566f | L1308 configura Meta, L1313 omite lastFastActivityAt; T01 callsite, T06 función; L1327+ consumidores de destinos Promoter requieren revisión para evitar doble persistencia. |
| index.ts main | 5d23618a433989779b7081c0ade3687e34a3ec5b | L19 recovery de arranque, L223+ alertas y L246 contador fijo. T01 montaje, T04 contrato de métricas. |
| deploy.yml main | c43e66c0594bea727163f8cee7d6d8a26a5af598 | push tags v*, workflow_dispatch; gate incluye comprobación legal nueva. No crear tag ni disparar workflow. environment libre y else prod, Doppler-first: S1/S2 corrigen solo delta bajo autorización. |
| ci.yml main | 7064e59cfd1972d9f7c6b6431fd6f602525b1edd | push main + pull_request, no gate de push en rama de ejecución por sí mismo. Para PR verificar que no se habilite secretos ni deploy; conservar unit/worker/web/integration. |
| package.json main | 8e490918c150a34d071b24d4080506d04ab8bd22 | pnpm gate=tsx scripts/gate-report.ts; gate:cognition-v2 lee report de gate; test:cognition-v2 runner explícito, test general glob. No inventar comandos. |
| cognition-worker-entry.ts | 732a7b1d943225174884a0dc9ec1059d36b78586 | createStore y createApp: revisar targets de secretos cognitivos además del worker browser. |

AGENTS.md: árboles muestran dos bajo workspace business-command-studio y copia histórica UI-lab, no root/core. Respetar los AGENTS.md relevantes si aparecen al refrescar. UX sigue fuera de alcance.

## Evidencia y riesgo residual

Manifest no incluye ningún valor de secreto. 50 archivos = selección de código/contratos/tests, no 50 correcciones nuevas. No se ha creado la rama de integración. Los grupos previos pueden contener errores; las regresiones de 10-DM2 deben ejecutarse contra el código importado. Antes de crear refs funcionales revisar TODOS workflows con trigger relevante (incluidos los no cubiertos por deploy/CI) y permisos de environment; no asumir que un push no ejecuta nada. D-M3 simula el procedimiento y termina checklist de autorizaciones.
