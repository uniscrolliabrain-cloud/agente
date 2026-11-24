# V8 — Validación

Correcciones estáticas: opciones de filtros de papelera independientes de resultados filtrados; navegación del lector limitada a documentos mostrados; búsqueda en blanco; navegación al destino después de cargar metadatos.

## Evidencia y límites
Consulta de workflow runs del commit V7: vacía (el conector solo devuelve runs de pull requests). Clonación local: fallo DNS github.com. No se ejecutó build, typecheck ni navegador. No certificar.

## Reproducción en Codespaces
```sh
pnpm install --frozen-lockfile
pnpm --filter @agente/ui-lab typecheck
pnpm --filter @agente/ui-lab build
pnpm --filter @agente/ui-lab dev
```
Abrir `/?embed=1&view=documents-explorer`. Comprobar 320/360/390/768/1024/1440/1920 px. Verificar navegación, historial, filtros combinados en papelera, selección y movimiento, carga de metadatos, foco, lector limitado a seis recientes, Escape, reduced motion, ausencia de overflow. Registrar capturas y resultados por resolución. No desplegar.

Sin cambios de branding, runtime ni otros workspaces. Iconos finales pendientes.
