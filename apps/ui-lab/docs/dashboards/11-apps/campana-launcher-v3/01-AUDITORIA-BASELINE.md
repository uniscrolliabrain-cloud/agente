# Auditoría y baseline (C00)

## Material encontrado en `main`

| Elemento | Estado real | Decisión |
|---|---|---|
| `11-apps/README.md` | Inventario de 35 workspaces + decisión del founder | Fuente de identificadores técnicos |
| `11-apps/CATALOGO-34-APPS.md` | Nombres visibles propuestos para 01–34 | Nombres del launcher, más «Centro de Mando» para 35 |
| `11-apps/prototipo/index.html` + `catalogo.json` | Prototipo funcional con iconos tipográficos | Referencia de interacción, no de acabado |
| `11-apps/componentes-reales/` | Snapshot de `registry`, `WorkspaceShell`, hooks y sidebar | Baseline intacto; no se modifica |
| `11-apps/PROTOTIPO-LAUNCHER-ANDROID.md` | Decisión 24/11: reposo, cajón, recientes, sin conexiones | Cumplida |
| `11-apps/HANDOFF-REDISENO-PREMIUM.md` | Estándar de campaña (C00–C07) | Proceso seguido |
| `19-general/galeria-branding/GUIA-MAESTRA-BRANDING-UX-V2.md` | Tokens y reglas de motion | Autoridad de estilo |
| `apps/ui-lab/src/vendor/landing/`, `design-system/agntia-tokens.css` | Branding real | Tokens copiados, no reinterpretados |
| `tools/image-pipeline/` + `generate-editorial-images.yml` | Pipeline OpenRouter con `OPEN_ROUTER_API_KEY` | Documentado; no ejecutable aquí (sin secreto) |
| `11-apps/iconos/` (35 SVG provisionales, `manifest.json`, `PROMPTS-INDIVIDUALES-V3.md`, `generacion-v3.json`) | Existen en `main` por trabajo paralelo, incorporados durante esta campaña | Se conservan como referencia histórica; el acabado final son los 35 renders propios en `iconos/final/` |
| `CAMPAÑA-LAUNCHER-V2.md` y `DECISION-FOUNDER-INTERACCION-ICONOS.md` | Existen en `main` (llegaron en el rebase) | La decisión del founder se implementa literalmente: sin nombres permanentes, hover/foco revelan, primer toque selecciona, segundo abre, ≥44 px, Escape cancela selección, sin desplazar la cuadrícula |
| `.github/workflows/ui-lab.yml` | Build + artifact de Formación V4 | Se amplía con el artifact del launcher |

## Reconciliación con `generacion-v3.json`

El manifiesto canónico de prompts propone fondo marfil cálido (#FCFAF6) y cuerpo de objeto al 58–65 %.
La dirección aprobada por el founder y las cinco muestras de referencia usan **fondo lavanda suave
(#F0ECFC)**, y la prompt de esta campaña lo confirma como dirección aprobada. Los 35 renders siguen
esa dirección lavanda; `generacion-v3.json` queda como fuente de sujetos y para una regeneración
alternativa sobre marfil si el founder la prefiere.

## Lo que no existía y se ha creado

- Colección completa de 35 iconos con originales, derivados y manifiesto.
- Launcher React/TypeScript aislado (reposo, escritorio, cajón, carpetas, recientes, apps).
- Documentación de campaña y capturas de QA.

## Inventario de la vista original (prototipo HTML)

El prototipo era un único HTML de 8,4 kB con reloj, rejilla de 35 glifos tipográficos, cajón, búsqueda,
favoritos y fichas textuales. Problemas detectados:

| # | Problema | Evidencia | Decisión |
|---|---|---|---|
| 1 | Iconos tipográficos, no una familia visual | `catalogo.json` usa `glyph` | 35 iconos 3D propios |
| 2 | Nombres siempre visibles bajo cada icono | `.app` con texto | Nombre superpuesto, revelado por hover/foco/selección |
| 3 | Sin separación entre reposo y escritorio | todo en un scroll | Dos superficies con transición |
| 4 | Sin carpetas, widgets, dock ni recientes reales | no existen | Construidos |
| 5 | Interacción táctil no distinguida del ratón | solo `:hover` | Detección de modalidad real |
| 6 | Apertura de app sin continuidad espacial | ficha textual | Transición desde el icono con `transform-origin` |
| 7 | Sin estados de búsqueda vacía | — | Estado sin resultados con acción |
| 8 | Sin accesibilidad de teclado ni foco visible | — | Foco violeta, Enter/Espacio, Escape, foco inicial y retorno |

## Superficies que no se tocan

- `apps/web/**`: aplicación de producción, workspaces 01–35, shell, LAIA, runtime, kernel.
- `ControlCenterView`, Estudio de Operaciones, Centro de Mando: sin cambios.
- Integraciones reales, OAuth, MCP y APIs: ninguna conexión nueva.
- El prototipo HTML y `componentes-reales/`: se conservan como referencia histórica.

## Verificación de que el baseline no cambió

`git status` antes del commit solo muestra archivos nuevos del launcher, su documentación, los iconos
y el workflow. No hay cambios en `apps/web` ni en los documentos existentes de 11-apps (solo se
actualizan `README.md` y `ESTADO-UX.md` al final de la campaña, como pide la prompt).

Durante la campaña `main` avanzó con trabajo de otros agentes (Legal V1, Login V3, campaña
transversal y los SVG provisionales de Apps). La rama se rebasó sobre ese estado y el único conflicto
real fue `.github/workflows/ui-lab.yml`: se conservaron ambos pasos de artifact (Login V3 y Launcher V3).
