# 05 — Arquitectura UX para un editor de realidad empresarial
## Modelo mental
El Estudio es una única superficie con inspector contextual, visualizador intercambiable, timeline temporal y chat/vídeo opcional acoplado. No son apps separadas. El usuario observa, decide, simula y aprueba; los agentes consultan y proponen; el runtime autoriza y ejecuta.

## Cuatro planos que jamás se mezclan
1. **Factual**: eventos y resultados verificados con origen, timestamp, tenant, actor y evidencia.
2. **Operativo actual**: estado derivado del runtime con freshness y permisos.
3. **Planificado**: acciones futuras no ejecutadas con responsable, condiciones y aprobaciones.
4. **Simulado**: hipótesis y resultados estimados, aislados de producción.
Todos deben tener indicador textual y semántica visual; el usuario debe poder cambiar de plano conscientemente.

## Contrato de objeto visual propuesto
```ts
type RealityPlane = "fact" | "live" | "plan" | "simulation";
type EntityKind = "task" | "agent" | "person" | "client" | "project" | "process" | "approval" | "event";
type VisualEntityRef = {
  tenantId: string;
  kind: EntityKind;
  id: string;
  plane: RealityPlane;
  version?: string;
  observedAt?: string;
  sourceIds?: string[];
};
type StudioContext = {
  tenantId: string;
  workspaceId: string;
  selected?: VisualEntityRef;
  timeCursor?: string;
  view: "kanban" | "graph" | "twin" | "company360";
  filters: Record<string, string[]>;
  scenarioId?: string;
};
```
Es **propuesta documental**: no afirmar que esos tipos ya existan ni conectarlos sin auditar contratos actuales.

## Sincronización entre perspectivas
Un solo contexto compartido: seleccionar tarea en Kanban ilumina su clip en timeline, su nodo en grafo y su ficha en inspector. El cambio de vista no reinicia la conversación. La identidad estable del objeto prevalece sobre posición visual. URL/deep link puede serializar selección segura; nunca datos privados en querystring.

## UI generativa segura
El LLM no entrega JSX arbitrario ni CSS libre. Propone un `ViewSpec` declarativo, versionado y validado (Zod), con componentes permitidos, datos referenciados por IDs, layout y acciones tipadas. Resolver servidor comprueba tenant, permisos, freshness, compatibilidad y origen; cliente renderiza componentes de catálogo. Si falta capacidad, mostrar fallback comprensible, no pantalla en blanco. Auditoría de cada vista propuesta y aprobaciones de acciones. La vista generada hereda tokens, densidad, navegación, teclado y estados.

## Conversación contextual
La sesión de chat conoce referencias autorizadas a objeto, vista, cursor temporal, escenario y agente activo. Enviar **tarjetas de contexto pequeñas** al fast-LLM, no volcar la empresa completa; el runtime/grafo recupera datos bajo demanda. Diferenciar «el agente lo propone» de «el sistema lo ejecutó». El presentador resume pasos con evidencia.

## Videoconferencia y reporte
Estados: idle → connecting → active → ending → summarizing → saved/failed. Notas destacadas con autor, timestamp, fuente, consentimiento y vínculo a entidades. El reporte posterior contiene resumen, decisiones propuestas/confirmadas, tareas, responsables, evidencias y acciones pendientes. No almacenar contenido sensible sin políticas aplicables. No crear tareas automáticamente a partir de una frase ambigua; mostrar preview/aprobación. Handoff entre agentes preserva contexto autorizado y atribución.

## Temporalidad
Scrub histórico = consultar snapshots/eventos, no reejecutar efectos externos. Playhead en futuro = plan o simulación. Reproducir no envía emails ni mueve dinero. Los cambios reales se convierten en comandos idempotentes con validación, aprobaciones, receipts y audit trail. Undo visual puede revertir cambios locales; undo operativo exige acción compensatoria, nunca borrar historia.

## Multi-tenant y confianza
TenantId verificado en backend en cada read/write; RLS donde aplique; nunca confiar en tenantId enviado por UI como autorización. Los datos demo son fixtures aisladas y explícitas. Fallo de API real => error/empty, jamás cifras ACME. No mezclar memorias de agentes de distintos clientes.

## Responsive y modos
Desktop >=1200: inspector + visualizador + timeline; chat dock opcional. Tablet: inspector colapsable, timeline adaptativo. Móvil <=700: workspace en una superficie principal, sheets tipo Maps para inspector/chat, timeline scroll horizontal y controles sticky seguros. Breakpoints son guía; verificar por contenido y medidas reales.

## Escalado futuro
Biblioteca de vistas aprobadas; layout declarativo versionado; estado por workspace; eventos como fuente de verdad; visualización desacoplada del motor de ejecución; feature flags por tenant; observabilidad de errores UI; telemetría respetuosa con privacidad.
