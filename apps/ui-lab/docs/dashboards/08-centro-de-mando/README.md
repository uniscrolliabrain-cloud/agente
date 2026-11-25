# 08 · Centro de Mando editorial V2
Founder autoriza preparar refinamiento de la vista Inicio/Hoy, no workspace 35 ni ControlCenterView. Leer PROMPT-MAESTRA-REFINAMIENTO-V2.md, CAMPAÑA-EJECUCION.md, GATE-ACEPTACION-VISUAL.md y componentes-propuestos/. Preservar componentes-reales/ como baseline. Propuesta CSS y wrapper no ejecutados; agente debe integrar en preview aislado, verificar y completar composición/motion. No modificar producción ni shell, no merge/deploy.

## Campaña ejecutada (2026-11-24)

Rama `feat/ui-lab-command-center-editorial`, build `2bda0e581941`. Implementada la vista aislada
`today-editorial` (módulo `apps/ui-lab/src/command-center-editorial/`), registrada en UI Lab junto a
la vista original. Producción, shell, workspace 35 y Control de actividad sin cambios.

- Documentación de campaña: [`campana-editorial-v2/`](campana-editorial-v2/00-BITACORA.md)
  (bitácora, auditoría, dirección visual, storyboard, patchset, matriz de paridad, QA, artifact).
- Código final: [`apps/ui-lab/src/command-center-editorial/`](../../../src/command-center-editorial). El clon con SHA256 se retiró el 25/11/2026 por ser byte a byte idéntico.
- QA: 26/26 comprobaciones, 96/100 en la rúbrica del gate. Evidencias en
  [`qa/capturas/`](qa/capturas/) y [`qa/qa-resultados.json`](qa/qa-resultados.json).
- Artifact para Chromebook: [`artifact/`](artifact/build-artifact.py) (`command-center-editorial-chromebook.zip`,
  13,8 MB, no versionado; se regenera con `build-artifact.py`).

Comparar: `/?embed=1&view=today` (original) frente a `/?embed=1&view=today-editorial` (editorial).
Pendiente la revisión visual del founder; no se ha fusionado ni desplegado.
