# Implementación y validación

## Entregado

Auditoría/campaña commiteadas primero en `96ec484`. Implementación posterior: proveedor local, selección/reloj único, inspector con creación/edición, cuatro visualizadores, timeline por capas con subpistas para solapes y entrada lazy «Estudio · Demo» en el shell. Guía de marca y tokens reutilizables extraídos de los valores de la landing, sin modificarla.

Los datos ficticios están identificados como ACME demo. No se modifican servidor, workers, contratos de ejecución, autenticación, permisos ni endpoints. No se sustituye el centro real. No hay persistencia de los cambios de la demo.

## Evidencia local

- TypeScript web: correcto.
- Build Vite de la aplicación: correcta; estudio en chunk diferido propio. Advertencias existentes de tamaño del bundle, import mixto de actions y comentarios de Zod; no errores.
- 8 pruebas del modelo ejecutadas directamente con `node --import tsx tests/business-command-studio.test.ts`: fixtures/dependencias, selección compartida, cambio de ámbito, límites del reloj, bloqueo de escritura en Observar, edición/reset, validación de intervalos/IDs y solapes en subpistas. Todas pasan.
- Baseline existente ejecutada directamente con Node + tsx + setup: analytics-overview **5 tests**, assignment-registry **1**, assignment-routes-authz **2**, todos correctos. Son pruebas acotadas, no una certificación integral de autorización ni producción.
- Build de la entrada aislada de revisión: correcta; usa los mismos componentes, marca y fotografías originales.
- Preview gestionada local: `sites-preview start` falla por `listen EPERM 127.0.0.1:4173`; `sites-preview status` confirma parada. No se ha sorteado la restricción. **Revisión visual de navegador local no realizada**.

## Publicación

El usuario autorizó posteriormente deploy directo por GitHub Actions, sin necesitar preview. Se descarta la publicación en un servicio de preview externo, que había sido bloqueada por la revisión automática antes de transferir código. Destino autorizado: el repositorio original y la infraestructura de producción existente de AgntiaPro.

Antes de declarar éxito deben terminar `gate`, Vercel, Fly y smoke del workflow `deploy.yml`, y comprobarse que producción sirve el nuevo chunk del estudio. El resultado de Actions queda vinculado en el informe final de entrega.

## Límites y siguiente iteración

La composición responsive y reducción de movimiento están implementadas; queda revisión móvil en dispositivos reales. Grafo, Digital Twin y métricas explican el escenario de ejemplo; no son un motor predictivo ni una proyección viva de la empresa. La futura integración de datos exige la campaña backend descrita en 02. El incidente histórico de FreeBuff continúa sin verificar.

## Revisión de producción y ajuste final

El workflow [45029201909](https://github.com/uniscrolliabrain-cloud/agente/actions/runs/45029201909) terminó correctamente en `0faaa9f` (gate, Vercel, API, worker, smoke). HTTP confirmó el chunk nuevo y los hashes de las cuatro imágenes de la landing.

Se observó un despliegue concurrente `release/landing-legal-20261122`, `91576dc`, descendiente directo de `0faaa9f`. Cambió hashes de assets mientras una pestaña cargaba el módulo diferido, causando un fallo temporal de importación. Tras recargar, el estudio funcionó con esa versión. La rama se actualizó por fast-forward a ese commit para preservar el trabajo legal antes de publicar el ajuste final.

En navegador de producción, sesión pública de datos de ejemplo: apertura de Estudio, Kanban, Grafo, selección de nodo sincronizada con inspector, Digital Twin, Empresa 360°, creación local de actividad (conteo 10→11 y nueva pista), y modo Observar bloqueando nueva actividad/editar: verificados. Se detectó línea temporal sin posicionamiento absoluto y control de modo sin nombre accesible cuando su texto se ocultaba. Corregidos junto con wrapping de prioridad y ancho de etiquetas móvil. Se añade un límite de error al módulo diferido para conservar el shell y ofrecer recarga en futuros cambios de assets.
