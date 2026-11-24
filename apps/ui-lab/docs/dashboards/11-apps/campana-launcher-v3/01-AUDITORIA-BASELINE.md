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
| `11-apps/GUIA-MAESTRA-BRANDING-UX-V2.md` | Tokens y reglas de motion | Autoridad de estilo |
| `apps/ui-lab/src/vendor/landing/`, `design-system/agntia-tokens.css` | Branding real | Tokens copiados, no reinterpretados |
| `tools/image-pipeline/` + `generate-editorial-images.yml` | Pipeline OpenRouter con `OPEN_ROUTER_API_KEY` | Documentado; no ejecutable aquí (sin secreto) |
| `11-apps/iconos/`, `CAMPAÑA-LAUNCHER-V2.md`, `DECISION-FOUNDER-INTERACCION-ICONOS.md` | **No existen en `main`** | Se crean en esta campaña; la interacción se implementa según la prompt |
| `.github/workflows/ui-lab.yml` | Build + artifact de Formación V4 | Se amplía con el artifact del launcher |

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
