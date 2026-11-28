# Consolidación de rutas y legacy — 27/11/2026

Historial auditado por ruta: SampleDashboard (72a56fcd, 17/11); copia editorial web (6ea0c400, 24/11); UI Lab editorial (7dcdd3c4, 24/11, 19e78b05, 26/11, V1–V5 27/11, 6ce397db integración). No hay pérdida de commits ni rama nueva; feat/ui-lab-command-center-editorial es ancestro de main.

## Causas
- Pages monta full-app, no el selector de laboratorio.
- Aunque 6ce397db inyecta V5, demoSession seleccionaba SampleDashboard del 17/11 por defecto.
- Vite cssCodeSplit:false incorpora ambos árboles con idéntico namespace cce-*. clone-views.css neutralizaba además los colores de estado en el árbol actual.

## Consolidación
- 86c1fafa: copia web movida a command-center-editorial-legacy; loader conserva su fallback anterior (no promover V5 a producción). SampleDashboardLegacy.tsx preserva el mockup histórico y sus consumidores explícitos. En V5 es opt-in, ya no la entrada predeterminada. La demo actual consume CompanyOverview del router sintético existente; no se presentan datos ficticios como reales.
- Segundo commit: namespace cce-legacy-* independiente (clases, tokens, IDs, keyframes); mantener fuentes y lógica histórica. Overrides cromáticos antiguos restringidos al namespace legacy; las señales semánticas de V5 quedan libres. La vista aislada original está etiquetada Legacy en el registro.
- No tocar Workspace 35/Analítica, Smart Spatial UX, runtime, kernel ni datos.
- Snapshots documentales y QA histórica se conservan como evidencia; no se importan. QA actual debe comprobar el DOM en la raíz del clon de Pages y no inferir calidad por un build verde.

No se ha desplegado a producción. Pendientes build y comprobación efectiva en navegador.
