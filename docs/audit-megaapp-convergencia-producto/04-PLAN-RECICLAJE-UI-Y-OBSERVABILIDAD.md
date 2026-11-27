# Auditoría 04 — Plan de reciclaje UI Lab e instrumentación de ingeniería
Fecha: 2026-11-27. Base main e496dd43338107f07d48d62d3e0ea03c0e0c6c89 (árbol de la rama documental fd398fa3703e37dc1e4764e5ab9afeb752d7b32e). Contraste puntual exec/Trans04 dd5d26347bf0dad607e7df5f0df38410981ac689. Auditoría estática y planificación, no ejecución funcional.

## Mandato del founder (turno actual)
> la o4 en ui-lab es todo demo osea que la haces para planificar los archivos que reciclaremos, modificamos, creamos etc y donde y como porque ahora eso sin la empresa compilada, los otros repos instalados, las apis y los conectores y sin los agentes definidos esa parte no la empezaria y ademas tendria un ui de ingenieria y observabilidad para poder ir construyendo todo eso con real time visibility sino es chapucero para mi

Decisión: mantener UI Lab como demo y diseño objetivo. Ninguna integración de cognición en UI cliente antes de empresa compilada, repos instalados según alcance, APIs/conectores verificados y agentes definidos. Observabilidad real de ingeniería es prerrequisito del proceso de construcción, no una decoración al final. No empezar implementación ahora; registrar plan y cerrar todas las auditorías. Mantener pendientes 7/10 documentación y 5/10 universos demo de 03. El PMV no exige terminar los 34 workspaces: gates por alcance efectivo, no declarar resto operativo.

## 1. Evidencia actual y límites
- full-app.tsx: monta App de web con demoViews, token demo:interfaz y router local. CompanyApp/CodeApp inyectadas solo en clon. Preservar.
- ChatTransversalV3.tsx: replyFor, temporizadores, estado local de llamadas/audio. No es servicio real. MetaChats guarda pins/asignaciones en localStorage. Estas asignaciones no son autoridad.
- CompanyApp.tsx: 963 líneas, empresa ficticia día 90, versiones y chat locales; publicación descrita no ejecutada.
- CodeApp.tsx: 1898 líneas, snapshot 17 repos a 26 nov; Logs() 1168–1206 muestra barras, estado del build del demo y logs de verificación estáticos, no telemetría.
- Knowledge V1 model.ts contiene páginas sintéticas; V4 data.ts enriquece V1 con status, source y version ficticios. No son registros cognitivos.
- Studio model.ts: reloj, reducer y actividades locales; visualización Kanban/Grafo/Twin/360 sin API. Preservar simulador.
- AnalyticsWorkspace.tsx: KPIs sintéticos explícitos, no observabilidad de ingeniería.
- web/components/chat/CognitionTimeline.tsx: polling de journey por cursor, dedup por eventId, gestión de error/abort/visibilidad; candidato real a reutilizar. UI Lab CognitionTimelineUX.tsx usa fixture.
- ContextualPanel.tsx consume ViewEnvelope y canView. ViewRenderer y hooks/useViewResolver son base de UI servida (ver audit 02), no sustituir por HTML arbitrario de LLM.
- events-routes.ts: lista, SSE, aggregate, timeline, replay, snapshot. Stream usa globalSubscribers por owner, sin replay/cursor explícito en ese handler. web/api/events.ts: reconexión exponencial, token en query, sin recuperación explícita por cursor. No certificar durabilidad ni aislamiento del stream sin Trans01/04/05.
- kernel-routes.ts: turnos, índice, metrics-summary, subscribers/status; varios requieren admin. No publicar raw thoughts/prompt/PII; solo estados estructurados y evidencia autorizada.
- main runtime cognition/v2: allowlist, contexto, projector, atención, delivery, receipts; worker lanes projection/slow/delivery/receipts; cursores y fencing. Inspección estática no prueba runtime sano.
- metrics-exporter.ts main tiene Prometheus; exec/Trans04 endurece token y scrape agregado (no enviar token a frontend). OTel/Kafka no deben presumirse operativos. Revalidar composición final; observabilidad previa detectó problemas de seq, proyección y eventos semánticos (audit 03). No usar números de demo como señal real.
- ControlCenterView.tsx de producción usa tareas/notificaciones y tick visual. attention-legacy.md prohíbe reintroducirlo como vista demo. Reciclar lógica útil si procede, no resucitar menú.
- app.ts:218 timeline de un puerto de grafo devuelve []; no afirmar que exista trayectoria multicapa completa.
- No se ejecutaron pruebas, navegador, DB ni proveedores. Árbol UI inventariado por paths, lectura dirigida, no todos sus archivos completos. Certezas altas de presencia y comportamiento local, no de deploy.

## 2. Matriz de reciclaje (rutas existentes verificadas; destinos propuestas a validar con árbol integrado)
R = reciclar presentación/lógica pura; M = modificar adapter/contrato posterior; N = crear solo si no existe equivalente; D = conservar exclusivamente demo.
| Área | Fuente existente | Decisión | Destino propuesto y condición |
|---|---|---|---|
| Shell demo | apps/ui-lab/src/full-app.tsx, registry.tsx | D | permanecen en laboratorio; nunca convertir clone a producción |
| Tokens | apps/ui-lab/src/design-system/agntia-tokens.css | R | design system de apps/web, conservar branding y revisar colisiones |
| Dock y navegación | apps/ui-lab/src/smart-ux/{MetaDock,MetaChats,smart-ux}.tsx y CSS | R/M | apps/web/src/components/meta-shell/ (propuesto); preferencias locales permitidas, asignaciones server-authoritative |
| Chat transversal | apps/ui-lab/src/chat-transversal-v3/{ChatDock,ChatSheet,ChatPanel,ChatComposer,ChatCall,ChatActions}.tsx y chat-v3.css | R/M | reciclar piezas en apps/web/src/components/chat/ y MobileChatSheet.tsx existentes; no duplicar transport; mapear callbacks al hook real |
| Chat mock | ChatTransversalV3.tsx, chat-data.ts, chat-ux-v2/{fixture,useChatFixture}.ts | D | conservar fixtures de preview; nunca promover replyFor/timers/reportes locales |
| Chat real | apps/web/src/{api/chat.ts,hooks/useChat.ts,components/ChatPanel.tsx,components/chat/CognitionTimeline.tsx} | R/M | contratos de journal/AGUI y journey; conservar scope y cursor; integrar tras gates |
| Views | apps/web/src/{hooks/useViewResolver.ts,hooks/useWorkspaceView.ts,components/ContextualPanel.tsx,view/ViewRenderer.tsx} + packages/domain/src/{views,view-envelope,workspace-spec}.ts | R/M | mantener contratos y renderer; resolver selección autorizada y provenance, no motor nuevo |
| Tu Empresa | apps/ui-lab/src/company-v2/{CompanyApp.tsx,company.css,company-visuals.ts,company-visuals.css} | R/M | apps/web/src/metaapps/company/ (propuesto); descomponer 18 secciones sin cambiar UX; bind versiones y artefactos a backend aprobado |
| Datos company | company-v2/company-data.ts | D | proveedor sintético común posterior; no DB de empresa |
| Agntia Code | apps/ui-lab/src/code-v1/{CodeApp.tsx,code.css} | R/M | apps/web/src/metaapps/code/ (propuesto); extraer shell, navegación, paneles, Logs() como presentación, no terminal ni deploy mock |
| Datos code | code-v1/code-data.ts | D | conservar snapshot como fixture fechado; inventario real por adaptador autorizado futuro |
| Conocimiento | apps/ui-lab/src/knowledge-v1/{KnowledgeWorkspace,ArticleEditor,LibraryHome}.tsx, knowledge-v4/{KnowledgeWorkspace,KnowledgePanels,KnowledgeViews}.tsx y CSS | R/M | apps/web/src/workspaces/knowledge/ (propuesto); elegir versión vigente con founder, no promover ambas; artículos != cards, fuentes y revisiones verificadas |
| Datos conocimiento | knowledge-v1/model.ts y knowledge-v4/data.ts | D | fixtures; no promover status Validado ni authors sin evidencia |
| Estudio | apps/ui-lab/src/vendor/studio/{BusinessCommandStudio,Inspector,Visualizer,Timeline}.tsx, studio.css | R/M | futuro workspace operativo, y subconjunto reutilizable para UI ingeniería; preservar inspector/timeline/visualizador y UX |
| Modelo Studio | vendor/studio/model.ts | D/R | mantener simulador; extraer utilidades puras packIntervals/timeLabel solo si compatibles; adapter separado, no reducer como realidad |
| Analítica | apps/ui-lab/src/analytics-v1/AnalyticsWorkspace.tsx y CSS; apps/web/src/workspaces/35-centro-mando/ | R/M | visualización negocio, no mezclar con ingeniería; sustituir KPIs por datos derivados |
| Legacy | apps/web/src/components/ControlCenterView.tsx, WorkspaceShell.tsx | R condicionado | rescatar patrones/handlers necesarios; no reintroducir superficies retiradas |
| Proyección real | apps/server/src/engine/cognition/v2/{storage,projector,workers,kernel-receipts,attention,context,graph,memory,rag,runtime}.ts | R/M | no nueva cognición para cada metaapp; usar contratos/ports existentes y revalidar wiring tras Trans |
| Telemetría real | apps/server/src/{events-routes,kernel-routes,metrics-exporter}.ts, metrics/registry.ts; engine/events/{bus,replay,snapshot,sinks/store}.ts | R/M | consolidar lectura autorizada durable, no duplicar bus ni almacén de verdad |
| Cliente eventos | apps/web/src/api/events.ts | M | recuperación cursor, dedup, reconexión y auth; no token de larga vida en query; pruebas de revocación |
| UI ingeniería | extraer Logs() de CodeApp, componentes Studio y timeline real de chat | N/R | apps/web/src/engineering/ (propuesto), acceso operador/ingeniero, fuera del menú cliente; decidir integración futura dentro de Agntia Code, no cuarta metaapp comercial |

## 3. UI de ingeniería propuesta (primero que wiring cliente)
Una consola de ingeniería autenticada en entorno dev/staging, con capacidades de lectura trazable. No simular señal real. Un inspector selecciona entidad y scope; visualizador muestra subgrafo autorizado; timeline muestra eventos/receipts con secuencia y cursor. Agntia Code observabilidad es referencia visual y eventual entrada, no backend actual. Separar analítica empresarial, observabilidad operacional y métricas de infraestructura.
| Panel | Señal mínima | Fuente candidata |
|---|---|---|
| Entornos y versiones | commit, deploy, versión schema/bundle, configuración no secreta, estado/última muestra | inventario de repos y deployment provider, health, registros verificados |
| Instalaciones y conectores | instalado/registrado/autorizado/operativo/verificado, versiones y dependencia, consentimiento, health | catálogo, provision:slice, adapters, probes autorizadas; audit 03 |
| Event Bus | seq, eventId, type, schemaVersion, correlationId/causationId, lag, replay, DLQ | durable EventBus y cursores; corregir seq y gaps antes de declarar live |
| Kernel y autoridad | turno, decisión permitida/denegada, motivo codificado, revision de política, receipt | kernel-routes y projector; sin raw thoughts, prompts ni secretos |
| Cognición | cardId/revision, epistemic, provenance, relaciones, selección de atención, snapshot, fase Slow/Fast/JEV, egress/resultado autorizado | v2 projector/context/attention/graph/receipts; mostrar solo metadatos y contenido autorizado |
| Runtime y SOP | taskId, step, lease, fence, attempt, idempotency, approval, outcome, reconciliación | workers/executor/receipts y bus |
| Infra | latencia, errores, colas, health, uso y coste agregado | métricas existentes y collector de Trans04, scrape server-side |
| Evidencia | enlace a fuente, estado, timestamp, frescura, discrepancias, trazabilidad | ViewEnvelope o read model específico reutilizando contratos |
No mostrar cadena privada de razonamiento; explicar decisiones por eventos estructurados, evidencias y códigos. Control de filtro tenant/actor/entorno; sin operaciones de efecto desde consola inicial. Contenido de pruebas marcado test/synthetic; no confundir con ejecución real.

### Archivos nuevos candidatos (no crear hasta inventariar equivalentes)
- apps/web/src/engineering/EngineeringConsole.tsx: layout inspector/visualizador/timeline.
- apps/web/src/engineering/{panels,components}/: EventBusPanel, KernelPanel, CognitionPanel, RuntimePanel, IntegrationsPanel, EvidencePanel; reutilizar componentes presentacionales.
- apps/web/src/engineering/hooks/useEngineeringStream.ts: snapshot y cursor, abort, lag, reconnect y replay; reutilizar api/events.ts donde viable.
- apps/web/src/api/engineering.ts: cliente autenticado, read-only.
- apps/server/src/routes/engineering.ts: si endpoints existentes no cubren consultas scoped/redactadas; no proxy genérico ni acceso DB directo del browser.
- packages/domain/src/engineering-observation.ts: solo si falta contrato reusable; schemaVersion, environment, source, cursor, eventId, causality, authorized references, freshness, redaction; no replicar EventEnvelope ni ViewEnvelope.
- tests/engineering-*.test.ts: lectura scoped, no secretos, cursor, revocación, gaps, reconnect, replay y reconciliación. Tests UI en estructura existente.
Estas rutas son propuestas, no archivos existentes ni una arquitectura aprobada de directorios.

## 4. Secuencia de dependencias (plan no ejecución)
G0 terminar todas las audits, reconciliar Trans01–06 con SHA fijo, no doble escritura.
G1 infraestructura real de observabilidad: habilitar señales mínimas en dev/staging, event stream durable/replay, health/metrics, autorización y consola ingeniería read-only. Puede hacerse antes de tener empresa completa; usar operaciones controladas de prueba.
G2 instalar y certificar repos/capacidades necesarios para alcance; contratos, endpoints, secrets server-side, OAuth/consentimiento, pruebas de proveedor/sandbox. Agentes y conectores definidos, no perfiles de fixture.
G3 compilar empresa y versión de bundle, ontología, relaciones, SOPs, roles, memorias, permisos; confirmar gates del PMV y dataset causal sintético separado; usar la consola para ver provisioning y operaciones.
G4 certificar circuito mínimo de extremo a extremo y observar runtime/cognition: humano -> journal -> contexto/snapshot -> Fast/Slow -> propuestas -> kernel -> ejecución/receipt -> bus -> projector -> view. No exigir que Slow ejecute automáticamente: mantener política default-deny y alcance de campañas. Observar errores, retractación, replay, recuperación.
G5 solo cuando founder autorice y G1–G4 estén verificadas, promover UI por slice, sin modificar UX aprobada; mantener demo separada y feature flags por capacidad certificada. No conectar CompanyApp/CodeApp globalmente de golpe.
G6 reauditar, harden y certificar; rollout y rollback por capacidad/revisión. No etiquetar producción por apariencia de interfaz.
G2/G3 pueden iterar en paralelo según dependencias; G1 es prerrequisito para desarrollo observable, no esperar a G5. Secuencia propuesta, no sustituye fases founder ni canónica. No se fija nuevo calendario.

## 5. Gates concretos de visibilidad
- Fuente real en staging con fecha, commit, entorno, modo de datos; si no hay señal mostrar no instrumentado/indisponible, no 0.
- Inyectar un evento de test autorizado, confirmar persistencia, cursor/proyección, visibilidad en consola y enlace a receipt; simular desconexión y recuperar sin duplicados ni huecos. Distinguir estado live/degraded/stale/replaying.
- Seleccionar card/entidad y reconstruir fuentes/relaciones, revisiones y selección servida; no exponer contenido no autorizado.
- Probar denegación, revocación, error de proveedor, outcome incierto, reintento seguro, caída de worker y DLQ; mostrar evidencia sin falsear éxito.
- Probar aislamiento dos tenants/actores y ausencia de secretos/PII en scrape, stream y navegador. No usar consola operador como bypass de autoridad.
- Medir tiempos, lag, cobertura, cardinalidad y coste con datos; SLO se fijan tras baseline y aprobación, no inventar números.
- Antes de promover una vista: contrato validado, source/permissions/freshness, test de datos, visual parity, rollback, sin fixtures en modo real.
- No modificar main ni exec/TransXX. Esta entrega solo documento.

## 6. Limitaciones y siguientes pasos
No he auditado exhaustivamente todos los child repos, ni instalado ninguno, ni probado APIs, conectores, cuentas, base, CI o navegador. Las rutas destino son sugerencias, sujetas al inventario post-integración. No se ha generado diseño gráfico ni implementado consola. Auditoría 05 seguirá identidad/autoridad/aislamiento; la 06 profundizará observabilidad y evolución sin adelantar implementación. Pendientes de auditoría 03 permanecen congelados hasta cierre de todas.
