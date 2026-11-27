# Corrección de publicación V5 — GitHub Pages

Base: ce032d9083ea8ee5332730d973709c442aa523a0. El workflow ui-lab-pages.yml copia full-app.html sobre index.html; la raíz de Pages no lee el selector ?view=today-editorial de la app de laboratorio. El clon montaba apps/web/src/components/command-center-editorial (Editorial V2) aunque V5 existía y compilaba en apps/ui-lab/src/command-center-editorial. Por ello un build verde no demostraba que V5 estuviera conectado.

Solución: inyectar únicamente la presentación V5 en el loader CommandCenterEditorialView mediante el prop demoCommandCenterPresentation del clon. Conservar fuente de datos, polling, filtros, permisos, modales, acciones y callbacks del shell. Producción sigue usando su presentación original por defecto. Marcador DOM data-cce-version="perceptual-v5" permite comprobar qué implementación está montada. El selector del laboratorio queda etiquetado V5. Sin cambios en Workspace 35, Smart Spatial UX, runtime o kernel.

Verificación: abrir la raíz de Pages después del deploy de este commit, inspeccionar el marcador DOM y comprobar navegación y acciones. Para observar las mejoras de estados reales de V3–V5, usar el control «Ver datos reales» del demo: el ejemplo estático conserva sus contenidos. Aún no se afirma validación visual ni despliegue antes de comprobar el workflow.
