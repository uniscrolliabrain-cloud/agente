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

La composición responsive y reducción de movimiento están implementadas, pero requieren revisión visual en dispositivos reales. Grafo, Digital Twin y métricas explican el escenario de ejemplo; no son un motor predictivo ni una proyección viva de la empresa. La futura integración de datos exige la campaña backend descrita en 02. El incidente histórico de FreeBuff continúa sin verificar.
