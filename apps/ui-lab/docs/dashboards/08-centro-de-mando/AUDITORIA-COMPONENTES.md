# Auditoría de componentes y alcance — Centro de Mando

## Distinción crítica

El código contiene **dos vistas distintas** que pueden llamarse «Centro de Mando»:

- `apps/web/src/components/CommandCenterView.tsx`: vista de inicio `today`, con `CommandCenterHero`, `BriefingCard`, `CommandFilters`, `CompanyPanels`, `OperationalStatus`, `SampleDashboard`, `TaskSections`. Carga `GET /api/company` y tiene lógica de tenant y de muestra.
- `apps/web/src/workspaces/35-centro-mando/CentroMandoWorkspace.tsx`: vista de **Analítica**. Usa `WorkspaceHeader`, `KpiGrid`, `KpiCard`, `BarList`, `PendingActionsList`, `PipelineFunnel`, `ActiveProjectsPanel`, `CriticalTicketsPanel`, `TopClientsPanel`, `AgentsPerformancePanel`, `AiInsightsPanel`, `ClientDetailModal`, `Toast`.

La prompt original describe la **segunda**, aunque el título «Centro de Mando» pueda confundir. Por decisión del founder, la primera **se conserva como está**.

## Hallazgos sobre la prompt

1. Pedía recrear el sidebar y un botón Chat; el sistema ya los implementa transversalmente. Duplicarlos produciría navegación doble.
2. Pedía datos fijos en cualquier sesión, pero el workspace real obtiene datos mediante `useCentroMandoData`: demo de `demoStore`, sesión real de `/api/analytics/overview`.
3. Pedía un único `App.tsx`, aunque ya existe una composición modular extensa de componentes y hooks. Se preserva la composición existente.
4. La prompt imponía colores exactos sin comprobar tokens compartidos. Se dejan como referencia visual, no como override de marca.
5. Las acciones del workspace contienen varios callbacks que actualmente presentan toasts; no se debe afirmar que exportar, reconectar o reintentar haya ocurrido sin evidencia.
6. El menú de la prompt menciona Workspaces, mientras la decisión comercial reciente es Apps; no se renombra el código en esta fase.
7. El README y spec históricos del workspace describen mocks y una API pendiente, pero el código actual ya incluye el hook de analítica real. Se prioriza el código inspeccionado sobre esa documentación desactualizada.

## Qué se ha verificado y qué no

Se han inspeccionado `CentroMandoWorkspace.tsx`, `CommandCenterView.tsx`, `useDemoCentroMandoData.ts`, el README del workspace y `docs/03-spec.md`, además del árbol de componentes. **No se han ejecutado pruebas ni auditado cada componente individual**. Las recomendaciones son documentales, no una declaración de funcionalidad completada.

## Decisión

**Sin cambios de código, layout, rutas, backend, main ni despliegue.** La prompt V2 queda como referencia de UX para futuras revisiones aprobadas.

[Leer prompt V2](./PROMPT-ANALITICA-V2.md)
