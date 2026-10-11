# Vale. Analizo a fondo el proceso que hemos seguido y lo extraigo como plantilla reutilizable para los 34.

# 

# \---

# 

# \# ANÁLISIS — Proceso aplicado al workspace 02-whatsapp

# 

# \## 1. Qué hemos hecho, en orden real

# 

# 1\. \*\*Identificar el workspace\*\* (02-whatsapp) y su familia (comunicacion).

# 2\. \*\*Ver la estructura existente\*\* (`workspaces/02-whatsapp/{README,index.ts,components,docs,hooks}`).

# 3\. \*\*Ver el registry\*\* (`workspaces/registry.ts`) y confirmar que solo tiene metadata.

# 4\. \*\*Ver el shell\*\* (`WorkspaceShell.tsx`) y confirmar que monta `ViewRenderer` con un `ViewSpec`.

# 5\. \*\*Decidir dónde vive la UI\*\*: dentro del workspace, no en `components/chat/`.

# 6\. \*\*Decidir la paleta\*\*: la real del repo (`bg-bg-card`, `bg-bg-soft`, `border-border`, `text-text`, `text-text-2`, `purple`, `purple-soft`, `green`).

# 7\. \*\*Decidir las fuentes\*\*: la real del repo (`Instrument Sans`).

# 8\. \*\*Decidir dark mode\*\*: no hay, no se mete.

# 9\. \*\*Escribir el README\*\* con mapa de componentes y fases.

# 10\. \*\*Crear `types.ts`\*\* con los tipos del workspace.

# 11\. \*\*Crear `format.ts`\*\* con las utilidades.

# 12\. \*\*Crear el CSS\*\* solo con estructura (sin tokens).

# 13\. \*\*Crear `api.ts`\*\* con mock en memoria.

# 14\. \*\*Crear el hook\*\* (`hooks/useChatWorkspace.ts`) con el estado.

# 15\. \*\*Crear los 10 componentes\*\* uno a uno.

# 16\. \*\*Crear el contenedor\*\* (`ChatWorkspace.tsx`).

# 17\. \*\*Crear `AppRail.tsx`\*\* fuera del workspace.

# 18\. \*\*Corregir la paleta\*\* en 14 ficheros (mapping de clases).

# 19\. \*\*Documentar el handoff v2\*\* para la siguiente IA.

# 20\. \*\*Pendiente\*\*: montar, actualizar index, escribir docs internos.

# 

# \## 2. Patrón extraído

# 

# Todo el proceso se reduce a este pipeline:

# 

# ```

# FASE 0 - Auditoría

# &#x20; 0.1. Leer estructura del workspace (README, index.ts, components, docs, hooks)

# &#x20; 0.2. Leer registry.ts (confirmar metadata-only)

# &#x20; 0.3. Leer WorkspaceShell.tsx (confirmar cómo monta)

# &#x20; 0.4. Leer tailwind.config.js (paleta real)

# &#x20; 0.5. Leer index.css (reglas globales)

# &#x20; 0.6. Leer App.tsx y main.tsx (montaje global)

# &#x20; 0.7. Leer api/chat.ts (o el api existente del workspace)

# 

# FASE 1 - Decisiones

# &#x20; 1.1. ¿La UI vive dentro del workspace o fuera?

# &#x20; 1.2. ¿Qué paleta usa? (la real, no inventada)

# &#x20; 1.3. ¿Qué fuente? (la real)

# &#x20; 1.4. ¿Dark mode? (no, si el repo no lo tiene)

# &#x20; 1.5. ¿Qué tipos necesita?

# &#x20; 1.6. ¿Qué utilidades necesita?

# &#x20; 1.7. ¿Qué mock necesita?

# &#x20; 1.8. ¿Qué hook necesita?

# &#x20; 1.9. ¿Qué componentes necesita?

# &#x20; 1.10. ¿Qué contenedor los orquesta?

# 

# FASE 2 - Documentación

# &#x20; 2.1. README del workspace con mapa de componentes

# &#x20; 2.2. Docs internos (01-ui-map, 02-roadmap, 03-spec)

# 

# FASE 3 - Contratos y utilidades

# &#x20; 3.1. types.ts

# &#x20; 3.2. format.ts

# &#x20; 3.3. CSS solo estructura

# 

# FASE 4 - Datos y estado

# &#x20; 4.1. api.ts (mock)

# &#x20; 4.2. hooks/useXxx.ts

# 

# FASE 5 - Componentes hoja

# &#x20; 5.1. Avatar (o equivalente)

# &#x20; 5.2. Búsquedas, filtros, listas

# &#x20; 5.3. Items de lista

# &#x20; 5.4. Burbujas / tarjetas

# 

# FASE 6 - Componentes contenedores

# &#x20; 6.1. Cabeceras

# &#x20; 6.2. Listas

# &#x20; 6.3. Paneles

# &#x20; 6.4. Composers / formularios

# &#x20; 6.5. Contenedor principal

# 

# FASE 7 - Corrección

# &#x20; 7.1. Mapear clases inventadas a clases reales

# &#x20; 7.2. Un patchset por fichero con .Replace()

# &#x20; 7.3. Verificar con pnpm typecheck

# 

# FASE 8 - Montaje

# &#x20; 8.1. Actualizar index.ts del workspace

# &#x20; 8.2. Montar en WorkspaceShell o App.tsx

# &#x20; 8.3. Verificar en navegador

# 

# FASE 9 - Handoff

# &#x20; 9.1. Doc v2 con estado actual

# &#x20; 9.2. Lista de ficheros que la siguiente IA necesita ver

# &#x20; 9.3. Tareas pendientes

# ```

# 

# \## 3. Boilerplate por workspace

# 

# Cada uno de los 34 workspaces sigue la misma estructura. Esto es lo que hay que generar:

# 

# ```

# apps/web/src/workspaces/NN-nombre/

# ├── README.md                          mapa del workspace (XXX\_UI\_MAP\_V1)

# ├── index.ts                           metadata + export del componente

# ├── types.ts                           tipos del workspace (XXX\_TYPES\_V1)

# ├── format.ts                          utilidades (XXX\_FORMAT\_V1)

# ├── ui.css                             estilos estructurales (XXX\_UI\_CSS\_V1)

# ├── api.ts                             mock en memoria (XXX\_API\_V1)

# ├── hooks/

# │   └── useXxx.ts                      estado (XXX\_HOOK\_V1)

# ├── components/

# │   ├── XxxWorkspace.tsx               contenedor (XXX\_WORKSPACE\_V1)

# │   ├── XxxHeader.tsx

# │   ├── XxxList.tsx

# │   ├── XxxListItem.tsx

# │   ├── XxxFilters.tsx

# │   ├── XxxSearch.tsx

# │   ├── XxxDetail.tsx

# │   ├── XxxForm.tsx

# │   ├── XxxEmptyState.tsx

# │   └── ...                            (los que necesite)

# └── docs/

# &#x20;   ├── 01-ui-map.md                   mapa real

# &#x20;   ├── 02-roadmap.md                  fases reales

# &#x20;   ├── 03-spec.md                     spec real

# &#x20;   └── 04-handoff-v2.md               handoff para la siguiente IA

# ```

# 

# Y fuera, si aplica:

# 

# ```

# apps/web/src/components/layout/AppRail.tsx     (solo si hace falta)

# apps/web/src/components/shared/Xxx.tsx         (si varios workspaces lo comparten)

# ```

# 

# \## 4. SOP — Procedimiento estándar por workspace

# 

# Esto es el SOP que hay que seguir con cada uno de los 34:

# 

# \### SOP-1 — Auditoría (10 min)

# 

# ```powershell

# cd "C:\\Users\\Alfonso\\Desktop\\git hub repos\\agente"

# 

# \# Ver lo que ya existe en el workspace

# Get-ChildItem "apps/web/src/workspaces\\NN-nombre" -Recurse | Select-Object FullName

# 

# \# Ver el README actual

# Get-Content "apps/web/src/workspaces\\NN-nombre\\README.md"

# 

# \# Ver el index.ts actual

# Get-Content "apps/web/src/workspaces\\NN-nombre\\index.ts"

# 

# \# Ver los docs actuales

# Get-Content "apps/web/src/workspaces\\NN-nombre\\docs\\01-ui-map.md"

# Get-Content "apps/web/src/workspaces\\NN-nombre\\docs\\02-roadmap.md"

# Get-Content "apps/web/src/workspaces\\NN-nombre\\docs\\03-spec.md"

# 

# \# Ver el registry y el shell (una vez, no por workspace)

# Get-Content "apps/web/src/workspaces\\registry.ts"

# Get-Content "apps/web/src/workspaces\\WorkspaceShell.tsx"

# ```

# 

# \### SOP-2 — Decisiones (5 min)

# 

# Responder por escrito:

# 

# 1\. ¿Qué UI necesita este workspace? (lista, board, tabla, kanban, dashboard, chat, etc.)

# 2\. ¿Qué roles/estados tiene?

# 3\. ¿Qué acciones ejecuta?

# 4\. ¿Qué tipos necesita?

# 5\. ¿Qué paleta usa? (la del repo, siempre)

# 6\. ¿Qué componentes reutiliza de otros workspaces? (si los hay)

# 7\. ¿Necesita mock? ¿De qué forma?

# 8\. ¿Necesita hook propio o estado local?

# 9\. ¿Dónde se monta? (WorkspaceShell por excepción / ruta propia)

# 

# \### SOP-3 — Doc del workspace (15 min)

# 

# Crear el `README.md` con:

# \- Objetivo

# \- Estructura de ficheros

# \- Mapa de componentes (tabla: fichero | marca | qué es)

# \- Contratos de tipos

# \- Estado compartido

# \- Datos (mock)

# \- Relación con el resto del repo

# \- Roadmap por fases

# \- Pendientes conocidos

# 

# \### SOP-4 — Contratos y utilidades (20 min)

# 

# \- `types.ts`: tipos puros. Sin React, sin colores.

# \- `format.ts`: utilidades puras. Sin React, sin colores.

# \- `ui.css`: solo estructura (display, overflow, grid). Sin tokens, sin dark mode.

# 

# \### SOP-5 — Datos y estado (20 min)

# 

# \- `api.ts`: mock con las firmas reales que tendrá la API.

# \- `hooks/useXxx.ts`: estado. Suscribe al mock. Devuelve estado + setters.

# 

# \### SOP-6 — Componentes hoja (40 min)

# 

# Uno a uno, un patchset por fichero. Orden recomendado:

# 1\. Avatar / Icon / Badge (si aplica)

# 2\. Search

# 3\. Filters

# 4\. Item de lista

# 5\. Burbuja / tarjeta / celda

# 

# \### SOP-7 — Componentes contenedores (40 min)

# 

# 1\. Header

# 2\. List

# 3\. Detail / Panel

# 4\. Form / Composer

# 5\. Contenedor principal

# 

# \### SOP-8 — Corrección (20 min)

# 

# Revisar todas las clases Tailwind. Mapear al sistema real del repo:

# 

# | Inventada | Real |

# |---|---|

# | `bg-canvas` | `bg-bg-card` |

# | `bg-surface` | `bg-bg-soft` |

# | `border-line` | `border-border` |

# | `text-ink` | `text-text` |

# | `text-muted` | `text-text-2` |

# | `bg-accent` | `bg-purple` |

# | `text-accent` | `text-purple` |

# | `border-accent` | `border-purple` |

# | `bg-accentsoft` | `bg-purple-soft` |

# | `bg-online` | `bg-green` |

# | `text-canvas` | `text-white` |

# 

# Un patchset por fichero con `.Replace()`.

# 

# \### SOP-9 — Montaje (variable)

# 

# 1\. Actualizar `index.ts` del workspace.

# 2\. Decidir: `WorkspaceShell` por excepción o ruta nueva.

# 3\. Escribir el bloque.

# 4\. Verificar en navegador.

# 

# \### SOP-10 — Handoff v2 (15 min)

# 

# Crear `docs/04-handoff-v2.md` con:

# \- Estado actual

# \- Qué falta

# \- Ficheros que la siguiente IA necesita ver

# \- Tareas pendientes en orden

# \- Convenciones de patchset

# \- Trampas conocidas

# \- Definición de terminado

# 

# \## 5. Pipeline completo, resumido

# 

# ```

# workspace NN → auditoría → decisiones → doc → contratos → datos → componentes → corrección → montaje → handoff

# &#x20;      ↑                                                                                                ↓

# &#x20;      └──────────────────────── siguiente workspace ←──────────────────────────────────────────────────┘

# ```

# 

# \## 6. Tiempo estimado

# 

# Por workspace, con este SOP:

# 

# \- Auditoría: 10 min

# \- Decisiones: 5 min

# \- Doc: 15 min

# \- Contratos: 20 min

# \- Datos: 20 min

# \- Componentes: 80 min (8-12 componentes)

# \- Corrección: 20 min

# \- Montaje: 10 min

# \- Handoff: 15 min

# 

# \*\*Total: \~3 horas por workspace.\*\*

# 

# 34 workspaces → \*\*\~100 horas\*\*.

# 

# Con paralelización (varias IAs, varios workspaces a la vez): \*\*\~15-20 horas\*\* repartidas entre las IAs.

# 

# \## 7. Lo que NO hay que hacer con los 34

# 

# Aprendido a base de romperlo con el 02:

# 

# 1\. \*\*No inventar paletas.\*\* Usar `bg-bg-card`, `purple`, etc.

# 2\. \*\*No meter dark mode.\*\* El repo no lo tiene.

# 3\. \*\*No meter fuentes ajenas.\*\* `Instrument Sans` y punto.

# 4\. \*\*No meter contexto global si el workspace es el único consumidor.\*\* Usar `hooks/useXxx.ts` dentro del workspace.

# 5\. \*\*No tocar `api/chat.ts`\*\* ni otros ficheros globales sin verlos.

# 6\. \*\*No reescribir `tailwind.config.js`.\*\*

# 7\. \*\*No meter los componentes en `components/`.\*\* Van dentro del workspace.

# 8\. \*\*No crear `contexts/`\*\* si no existe.

# 9\. \*\*No meter heredocs anidados en PowerShell.\*\*

# 10\. \*\*No meter 18 ficheros en un solo script.\*\*

# 11\. \*\*No tocar `App.tsx` ni `main.tsx`\*\* a ciegas.

# 12\. \*\*No montar el workspace\*\* hasta decidir dónde.

# 

# \## 8. Orden recomendado de los 34

# 

# Por dependencia, familia y complejidad:

# 

# \*\*Primero (simples, sin deps):\*\*

# \- 08-chatgpt (global, simple)

# \- 09-airtable (datos, tablas)

# \- 16-n8n (trabajo, workflows)

# \- 33-langsmith (gobierno, observabilidad)

# 

# \*\*Segundo (comunicación, similar al 02):\*\*

# \- 01-gmail

# \- 14-zendesk

# \- 25-intercom

# \- 31-suitedash

# \- 23-buffer

# 

# \*\*Tercero (documentos):\*\*

# \- 05-google-drive

# \- 32-notion

# \- 15-docusign

# \- 22-canva

# 

# \*\*Cuarto (finanzas):\*\*

# \- 04-holded

# \- 11-holded-tesoreria

# \- 12-odoo-purchase

# \- 20-ramp

# \- 21-stripe

# \- 24-shopify

# 

# \*\*Quinto (personas):\*\*

# \- 10-perdoo

# \- 18-factorial

# \- 19-personio

# 

# \*\*Sexto (trabajo):\*\*

# \- 06-google-calendar

# \- 07-linear

# \- 13-productive

# \- 17-process-street

# \- 34-trello

# 

# \*\*Séptimo (operaciones):\*\*

# \- 26-odoo-inventory

# \- 27-maintainx

# \- 28-odoo-manufacturing

# 

# \*\*Octavo (gobierno):\*\*

# \- 29-isms-online

# \- 30-microsoft-entra

# 

# \*\*Último (ya hecho):\*\*

# \- 02-whatsapp

# 

# \## 9. Plantilla de prompt para cada workspace

# 

# Cuando quieras arrancar otro workspace, este es el prompt que le pasas a la IA:

# 

# ```

# Vamos a implementar la UI del workspace NN-nombre.

# 

# Sigue el SOP que ya aplicamos al 02-whatsapp. El patrón está en

# apps/web/src/workspaces/02-whatsapp/docs/04-handoff-v2.md.

# 

# Fase 1 - Auditoría: pásame el contenido de:

# \- apps/web/src/workspaces/NN-nombre/README.md

# \- apps/web/src/workspaces/NN-nombre/index.ts

# \- apps/web/src/workspaces/NN-nombre/docs/01-ui-map.md

# \- apps/web/src/workspaces/NN-nombre/docs/02-roadmap.md

# \- apps/web/src/workspaces/NN-nombre/docs/03-spec.md

# 

# Fase 2 - Decisiones: dime qué UI necesita, qué tipos, qué componentes.

# 

# Fase 3 - Doc: README con mapa de componentes.

# 

# Fase 4 - Contratos: types.ts, format.ts, ui.css.

# 

# Fase 5 - Datos: api.ts, hooks/useXxx.ts.

# 

# Fase 6 - Componentes: uno a uno, un patchset por fichero.

# 

# Fase 7 - Corrección de paleta.

# 

# Fase 8 - Montaje.

# 

# Fase 9 - Handoff v2.

# 

# Reglas:

# \- Un patchset = un fichero.

# \- Paleta real del repo (bg-bg-card, purple, etc).

# \- Sin dark mode.

# \- Sin fuentes ajenas.

# \- Imports con extensión .ts/.tsx.

# \- Sin \&\& ni ;.

# \- Idempotente por marca.

# ```

# 

# \## 10. Lo que falta para hacerlo bien en serie

# 

# 1\. \*\*Un fichero maestro\*\* (`docs/ui/WORKSPACES-UI-SOP.md`) con este SOP, para que cualquier IA lo lea antes de tocar un workspace.

# 2\. \*\*Una plantilla\*\* (`docs/ui/WORKSPACES-UI-TEMPLATE/`) con los ficheros vacíos y las marcas `\_V1` puestas. Solo hay que rellenar.

# 3\. \*\*Un registry de estados\*\* para saber en qué fase está cada workspace: `scaffold`, `types-done`, `mock-done`, `components-done`, `mounted`, `verified`.

# 4\. \*\*Un checklist\*\* por workspace, en `docs/ui/CHECKLIST-NN-nombre.md`, con las 9 fases.

# 

# \## 11. Qué propongo ahora

# 

# Tres opciones:

# 

# \*\*A. Crear primero el SOP maestro\*\* (`docs/ui/WORKSPACES-UI-SOP.md`) con este proceso entero, para que las IAs lo sigan sin reinventarlo cada vez.

# 

# \*\*B. Crear primero la plantilla\*\* (`docs/ui/WORKSPACES-UI-TEMPLATE/`) con los ficheros vacíos y las marcas, para clonarla por workspace.

# 

# \*\*C. Arrancar el siguiente workspace\*\* (por ejemplo 08-chatgpt) siguiendo el SOP, y dejar el SOP maestro para después.

# 

# Yo recomiendo \*\*A\*\* primero (SOP), luego \*\*B\*\* (plantilla), luego \*\*C\*\* (workspaces en serie). Pero tú decides.

# 

# Dime qué opción y arrancamos.

# 

# \-------------------------------------------------Views and Templates Fase2

VIEWS\_AND\_TEMPLATES V2

## Catalogo cerrado

accepts spec {kind data}
ViewSpec kind=collection|timeline|form|chart
FormSpec fields provenance chips
Intent Resolver input user+fast -> spec

## ViewRenderer

readView precomputada fast
collection cards con provenance
timeline turn.thoughts orden
chips auto-alta media sugerido tu

## FormRenderer

computeView lenta profunda
provenance chips por campo
POST /api/views/resolve spec -> view

## Flujo

fast-author -> readView -> UI inmediata
slow-author -> computeView -> progress
Meta hints slow\_ready\_fast\_idle slice 0..200
Presenter PRIORITY elige response display etc

## Endpoint debug

GET /api/kernel/turns/:turnId debug
POST /api/views/resolve {spec}

