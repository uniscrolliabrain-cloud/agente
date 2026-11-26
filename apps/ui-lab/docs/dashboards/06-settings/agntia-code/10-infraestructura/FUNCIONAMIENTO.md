# Infraestructura — funcionamiento

## Flujo principal

1. La superficie muestra el inventario por entorno con buscador y filtro por tipo.
2. Al crear un recurso, se elige tipo, nombre, entorno y propósito; se valida disponibilidad del nombre.
3. Se genera un plan de cambio con recursos y bindings afectados.
4. Al aprobar, el recurso se provisiona y aparece con estado `provisionando` hasta estar listo.
5. El binding se publica en la configuración del proyecto y se refleja en entornos.
6. Las métricas se cargan aparte; si fallan, el inventario sigue visible.
7. Cualquier eliminación muestra dependencias y exige confirmación escrita.

## Entidades y campos

| Entidad | Campos mínimos |
|---|---|
| `resource` | id, tenantId, projectId, tipo, nombre, entorno, estado, creadoEn |
| `binding` | projectId, entorno, variable, resourceId, tipo |
| `changePlan` | id, acciones[], autor, creadoEn, aprobadoPor, estado |
| `resourceHealth` | resourceId, ventana, errores, latenciaP95, cuotaUsada, fuente |
| `costEstimate` | resourceId, mes, consumo, costeEstimado, calculadoEn |

## Estados

Recurso: `planificado` → `provisionando` → `listo` → `degradado` | `eliminando` → `eliminado`. Plan: `borrador` → `pendiente-aprobación` → `aplicando` → `aplicado` | `fallido`. Binding: `declarado` → `activo` | `huérfano`.

## Roles y permisos

- `viewer`: ve tipos y estados, no coste ni configuración.
- `reviewer`: ve salud y puede abrir incidencia.
- `builder`: crea recursos en preview y propone cambios de producción.
- `owner`: aprueba producción, elimina recursos y cambia cuotas.

## Errores, reintentos e idempotencia

- Nombre ocupado: se sugiere alternativa y no se crea nada.
- Provisión a medias: el plan queda `fallido` con el paso exacto y opción de reintentar sin duplicar.
- Métricas no disponibles: se muestra "sin datos" y se reintenta en segundo plano.
- Aplicar dos veces el mismo plan no crea recursos duplicados.

## Rendimiento y límites

- El inventario responde en menos de 1 s con caché de 60 s.
- La provisión debe completarse en 60 s o marcar espera con seguimiento.
- Cuotas del plan base: 20 recursos por proyecto, ampliables.
- Historial de métricas: 24 h en vivo, 30 días agregado.

## Móvil y accesibilidad

- Inventario en tarjetas con tipo y estado textual.
- El plan de cambio se lee en una columna, con acciones separadas por verbo.
- Eliminar nunca está en el primer nivel; confirmación con nombre escrito.
- Gráficos con tabla alternativa y descripción textual.

## Demo actual frente a conectado

El clon pinta cuatro recursos con porcentajes inventados y sin llamada alguna a Cloudflare. Ningún botón provisiona ni elimina; los avisos indican simulación.

## Criterios de aceptación

- Todo recurso mostrado tiene binding o se marca como huérfano.
- No se elimina nada sin dependencias enumeradas y confirmación.
- Las cifras de salud y coste declaran ventana y fuente.
- El plan de cambio coincide con lo aplicado, acción por acción.
