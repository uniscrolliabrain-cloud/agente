# Business Command Studio · ACME demo

Workspace React integrado en `App` mediante **Estudio · Demo**. Carga diferida: no añade el estudio al bundle inicial de la landing. Conserva el Centro de mando real, Analítica, shell y chat existentes.

## Qué se puede hacer

- Seleccionar actividad, humano, agente, proveedor, proyecto o cliente; inspector y timeline comparten selección.
- Cambiar entre Kanban, Grafo (dependencias), Digital Twin (actividad por intervalo) y Empresa 360° (resúmenes derivados).
- Crear y editar una actividad de tipo tarea/evento/proyecto/SOP; cambiar responsable, estado, prioridad y horario. Todo queda en memoria.
- Simular una aprobación; modo Observar bloquea mutaciones también en el reducer.
- Mover el reloj, reproducir/pausar, volver a las 11:00, ampliar pistas y plegar capas. Actividades simultáneas se apilan en subpistas.
- Reiniciar el escenario. Recargar también descarta los cambios.

`model.ts` es el proveedor y estado **solo demo**; no importa APIs. `Inspector`, `Visualizer` y `Timeline` consumen las mismas identidades. Los proyectos/SOP nuevos son actividades del escenario, no altas de entidades reales. El reloj describe intervalos planeados; no reconstruye estados históricos ni ejecuta trabajo. Todos los datos de ACME son inventados.

## Referencia y revisión local

Leer `docs/design/agntia-interface-standard.md` y la auditoría/campaña `docs/audits/2026-11-22-business-command-studio/`.

Con dependencias instaladas, `npm --prefix apps/web run dev`; abrir `/studio-demo.html` en la URL que muestre Vite. Esa entrada monta **el mismo componente** sin hooks de autenticación ni APIs. La build normal de producción solo utiliza `index.html`; la entrada de review no se publica como ruta alternativa al login.

Checks:

```sh
npm --prefix apps/web run typecheck
npm --prefix apps/web run build
node --import tsx tests/business-command-studio.test.ts
```

La preview aislada no llama al backend. Dentro de App continúan los hooks globales y el chat existentes; eso no convierte al estudio en un editor de datos reales.
