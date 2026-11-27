# Macroauditoría de vigencia UI Lab / GitHub Pages — 27 noviembre 2026

Baseline inmutable: e496dd43338107f07d48d62d3e0ea03c0e0c6c89. Árbol Git f1029256d8248d910378927fe2ec60dbea8ebf3e, 5469 entradas, no truncado. Alcance: seis auditorías restantes tras inventario de 21 superficies. No es una autorización de merge, rediseño, cambio de runtime ni promoción a producción.

## Evidencia del build
Workflow Pages [46012073962](https://github.com/uniscrolliabrain-cloud/agente/actions/runs/46012073962) success, build y CI success. Artefacto github-pages ID 15203718762 descargado e inspeccionado localmente: ZIP 16.176.489 bytes, version.json e496dd43338107f07d48d62d3e0ea03c0e0c6c89, builtAt 2026-11-27T14:01:22.719Z. index.html carga fullApp-CjpBwQdM.js y style-Bwmcaq8V.css (668272 bytes). Se inspeccionó el mapa real de imports minificado, no solo la fuente. No hay acceso DNS al dominio público en el entorno; Chromium bloqueó navegación local ERR_BLOCKED_BY_ADMINISTRATOR. No certificamos DOM, capturas, caché del cliente ni interacción.

## A02 Estudio de Operaciones
- Pages monta apps/web/src/workspaces/business-command-studio/BusinessCommandStudio.tsx. SHA blob 9b2300f6d99d738c390a96e1fa0585ee87b6ce08 idéntico al vendor/studio de main; Inspector, Timeline, Visualizer, model y studio.css también coinciden. Preview difiere (arnés).
- Rama feat/agntia-demo-ui-lab-preview tiene escenario AgntiaPro más reciente: ea847f43 (23/11) sustituye ACME, 25a72347 ajusta labels/timeline. model.ts 3a94e906… frente a 3d55d15f… de main, actividades Bruma, Caliza y LAIA/Marcos. Ambos chunks BusinessCommandStudio-DhQrm2x3.js y BusinessCommandStudio-BQzLuJJG.js contienen Operación ACME. Desfase real, no inferido del nombre de carpeta.
- Recuperar solo los cambios de escenario y compatibilidad de Inspector/Timeline/Visualizer/BusinessCommandStudio sobre versión activa; conservar interacciones, no mergear rama antigua completa. Comparar snapshots y QA. P1.

## A03 Conocimiento
- fullApp importa KnowledgeWorkspace-Cj9qcOXK.js, corresponde a knowledge-v1, recibe onNavigate. V5 integrado en esa ruta (307e3d21, bbfe1d06, e7688f89), e6fb7d2d añade navegación real. Alternativa knowledge-v4/KnowledgeWorkspace.tsx (df54ca33, fix 5ae64369) publicada en laboratorio, compilada como KnowledgeWorkspace-DZiXJexQ.js pero no montada por fullApp.
- V4 importa ArticleEditor y model de V1, añade metadatos status/updated/relations/sources/version, Drawer, Rows, Collection, Graph, Notebook. V1 conserva navegación real; V4 no acepta onNavigate. No promover automáticamente ni llamar V1 legacy: hay dos evoluciones válidas.
- Reconciliar contratos Page/Block, preservación de edición y navegación, colección/grafo/cuaderno; una fuente actual con namespaces separados hasta certificar. P1. 
- Rama feat/ui-lab-knowledge-notion-v1 añade KnowledgeNotionLab histórico; feat/ui-conocimiento-notion-like-c01 introduce MemoryView y piezas alternativas. No evidencia de superioridad ni autorización de merge.

## A04 Chat, Login, Landing, shell
- Chat principal web ChatPanel -> ChatPanelUX, activo salvo flag. Versión web 6ea0c400 incorpora CognitionTimeline, RoleSelector y contratos originales; laboratorio usa fixtures. ChatUXFrame y Markdown tienen SHA iguales, resto difiere. CSS de chat lab 19e78b05 aplica acento elegible y comparte selector .chat-ux-v2 con copia web. Portar únicamente mejoras verificadas, no sustituir loader.
- Transversal: Pages usa MobileChatSheet/SidebarChat; variante chat-transversal-v3 37228ea8/3acd03d2 (más reciente) es fixture aislada con ChatDock/ChatSheet, también utilizada dentro de Conocimiento. No reemplazar gestos aprobados; comparar funcionalidad/branding de forma no destructiva.
- Login web 303cbd6b posterior al lab 9aa8337f, OAuth/contratos reales; fuente activa web. CSS duplicado. Landing web y vendor misma SHA CSS cab7eec4f3, ambas llegan a e61d5b24; JSX difiere en rutas/adaptación y ProductScene merece revisión antes de consolidar. No rediseñar Landing.
- SidebarV2 eb90d498, DockRail bc783ecb, ProfileModal y SettingsMenu son los componentes efectivos; SettingsMenu conecta las dos meta-apps. No tocar Smart Spatial UX aprobado.
- Documentos V9 activo, rama ui-lab cambia solo alias Folder (comparación directa); Comunicación y Teléfono coinciden byte a byte con feat/comunicaciones-telefono-v1 en los dos TSX principales. Tareas V3, Equipo V4, Cartera V2, Analítica V2 activos pese a carpetas v1. Formación V4 conectada. Legal V1 directo en /legal. Revisar paridad visual sin promover snapshots.
- ui-lab-pro: compare de sus 145 cambios exclusivos contiene solo apps/ui-lab/docs; no hay componente activo nuevo ahí. Conservar evidencia documental.

## A05 Los 35 workspaces técnicos
Fuente árbol Git completo, directorio apps/web/src/workspaces y launcher-catalog. AppsLauncher V3 importa AppTransition, el cual renderiza DEMO_SURFACES[app.category], seis plantillas compartidas para 35 IDs. No importa componentes numerados. WorkspaceShell es ruta distinta y usa ViewRenderer; entrada técnica oculta en menú del clon. No confundir con rutas superiores, p.ej. Comunicación y Analítica. 32 directorios no tienen TSX propio, tres sí. 02-whatsapp conserva index.ts que se declara scaffold aunque contiene 11 TSX: metadata obsoleta. 14-zendesk exporta ZendeskWorkspace y status implemented; 35-centro-mando exporta CentroMandoWorkspace. El 35 es distinto de today, Analítica demo y launcher genérico. No conectar 35 por fuerza: primero inventariar contratos, estado y fixture.
 
| Workspace | Archivos | TSX | Situación técnica | Apertura en launcher |
|---|---:|---:|---|---|
| 01-gmail | 7 | 0 | Sin TSX propio en este directorio; no afirmar implementación individual | Plantilla por categoría |
| 02-whatsapp | 24 | 11 | Componentes propios existentes; no montados por launcher | Plantilla por categoría |
| 03-hubspot | 7 | 0 | Sin TSX propio en este directorio; no afirmar implementación individual | Plantilla por categoría |
| 04-holded | 7 | 0 | Sin TSX propio en este directorio; no afirmar implementación individual | Plantilla por categoría |
| 05-google-drive | 7 | 0 | Sin TSX propio en este directorio; no afirmar implementación individual | Plantilla por categoría |
| 06-google-calendar | 7 | 0 | Sin TSX propio en este directorio; no afirmar implementación individual | Plantilla por categoría |
| 07-linear | 7 | 0 | Sin TSX propio en este directorio; no afirmar implementación individual | Plantilla por categoría |
| 08-chatgpt | 7 | 0 | Sin TSX propio en este directorio; no afirmar implementación individual | Plantilla por categoría |
| 09-airtable | 7 | 0 | Sin TSX propio en este directorio; no afirmar implementación individual | Plantilla por categoría |
| 10-perdoo | 7 | 0 | Sin TSX propio en este directorio; no afirmar implementación individual | Plantilla por categoría |
| 11-holded-tesoreria | 7 | 0 | Sin TSX propio en este directorio; no afirmar implementación individual | Plantilla por categoría |
| 12-odoo-purchase | 7 | 0 | Sin TSX propio en este directorio; no afirmar implementación individual | Plantilla por categoría |
| 13-productive | 7 | 0 | Sin TSX propio en este directorio; no afirmar implementación individual | Plantilla por categoría |
| 14-zendesk | 43 | 30 | Componentes propios existentes; no montados por launcher | Plantilla por categoría |
| 15-docusign | 7 | 0 | Sin TSX propio en este directorio; no afirmar implementación individual | Plantilla por categoría |
| 16-n8n | 7 | 0 | Sin TSX propio en este directorio; no afirmar implementación individual | Plantilla por categoría |
| 17-process-street | 7 | 0 | Sin TSX propio en este directorio; no afirmar implementación individual | Plantilla por categoría |
| 18-factorial | 7 | 0 | Sin TSX propio en este directorio; no afirmar implementación individual | Plantilla por categoría |
| 19-personio | 7 | 0 | Sin TSX propio en este directorio; no afirmar implementación individual | Plantilla por categoría |
| 20-ramp | 7 | 0 | Sin TSX propio en este directorio; no afirmar implementación individual | Plantilla por categoría |
| 21-stripe | 7 | 0 | Sin TSX propio en este directorio; no afirmar implementación individual | Plantilla por categoría |
| 22-canva | 7 | 0 | Sin TSX propio en este directorio; no afirmar implementación individual | Plantilla por categoría |
| 23-buffer | 7 | 0 | Sin TSX propio en este directorio; no afirmar implementación individual | Plantilla por categoría |
| 24-shopify | 7 | 0 | Sin TSX propio en este directorio; no afirmar implementación individual | Plantilla por categoría |
| 25-intercom | 7 | 0 | Sin TSX propio en este directorio; no afirmar implementación individual | Plantilla por categoría |
| 26-odoo-inventory | 7 | 0 | Sin TSX propio en este directorio; no afirmar implementación individual | Plantilla por categoría |
| 27-maintainx | 7 | 0 | Sin TSX propio en este directorio; no afirmar implementación individual | Plantilla por categoría |
| 28-odoo-manufacturing | 7 | 0 | Sin TSX propio en este directorio; no afirmar implementación individual | Plantilla por categoría |
| 29-isms-online | 7 | 0 | Sin TSX propio en este directorio; no afirmar implementación individual | Plantilla por categoría |
| 30-microsoft-entra | 7 | 0 | Sin TSX propio en este directorio; no afirmar implementación individual | Plantilla por categoría |
| 31-suitedash | 7 | 0 | Sin TSX propio en este directorio; no afirmar implementación individual | Plantilla por categoría |
| 32-notion | 7 | 0 | Sin TSX propio en este directorio; no afirmar implementación individual | Plantilla por categoría |
| 33-langsmith | 7 | 0 | Sin TSX propio en este directorio; no afirmar implementación individual | Plantilla por categoría |
| 34-trello | 7 | 0 | Sin TSX propio en este directorio; no afirmar implementación individual | Plantilla por categoría |
| 35-centro-mando | 39 | 27 | Componentes propios existentes; no montados por launcher | Plantilla por categoría |

## A06 Meta-apps
fullApp importa CompanyApp-KCAf_7xH.js y CodeApp-D0YYyGGi.js. Tu Empresa 16ae495c, Agntia Code 33221d68, las revisiones del 27/11 están en el árbol activo. Ambos importan MetaDock y MetaChats; CodeApp contiene VARIANTS, CompanyApp contiene switch(section.variant) y COMPANY_DATA. Las 18 secciones respectivas se resuelven dentro de cada app; los nombres v2/v1 no son motivo de declarar legacy. CompanyVisuals importa cuatro WebP por sección; se localizaron 72 nombres emitidos en assets del artefacto. No significa que los 72 aparezcan simultáneamente o que sus interacciones estén certificadas. Code-data snapshot READ_DATE 26 nov 2026 y REPOS estático, no live GitHub. Preservar meta-apps y shell; siguiente gate es probar las 36 rutas y recursos sin tocar los gestos aprobados. No se detectó otra variante meta-app más reciente en las ramas UX examinadas, no se afirma inspección exhaustiva de cada rama backend.

## A07 Colisiones CSS / certificación
Vite cssCodeSplit:false. Bundle único 668272 bytes, 191 selectores de nivel superior repetidos (incluye overrides intencionados). Conflictos concretos: .kw-nav width clamp(220px,calc(var(--kw-width)*.45),340px) frente a clamp(220px,calc(var(--kw-width)*.36),440px); .chat-ux-v2 --cux-violet fijo #6550dd frente a var(--themed-accent,#6550dd), --cux-lilac fijo frente a variable. Login .lv3-footer y .lv3-oauth-btn repetidos sin propiedades comunes distintas en esas reglas concretas. No declarar todas las 191 repeticiones bugs. .cce-root y .cce-legacy-root presentes y separados; chunk CommandCenterEditorial-Zoc5xSBH.js contiene data-cce-version/perceptual-v5 y texto de ejemplo legacy; fullApp inyecta ese chunk, no demuestra DOM real. 
- Añadir manifest de vigencia generado desde entradas + árbol SHA y no nombres; gate build que comprueba todas las rutas, imports y duplicados. QA browser sobre artefacto Pages exacto, capturas 1440/390, selectors root únicos, estados, assets, consola, navegación y errores; 35 apps y 36 subrutas meta como inventario separado. Bloquear publicación si se monta legacy por defecto o hay regresión validada. Sin acceso browser no certificar visualmente.

## Prioridad y decisiones
P1: Estudio recuperar escenario en rama (previa validación de paridad); Conocimiento reconciliar árboles y CSS; Chat/Login aislar duplicados sin tocar lógica autenticación/cognición; gate de artefacto.
P2: reconciliar catálogo 35 con workspaces realmente existentes; no falsear capacidades; registrar variantes aprobadas y snapshots; corregir metadata y README históricos; mantener producción separada.
P3: normalizar nombres solo tras comprobar imports y evidencia. V1 de carpeta no equivale a legacy. No borrar copias de referencia ni promover código sin prueba. Este documento es diagnóstico de fuente y artefacto, no certificación UX integral.
