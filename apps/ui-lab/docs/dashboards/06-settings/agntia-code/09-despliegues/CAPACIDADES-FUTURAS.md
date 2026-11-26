# Despliegues — capacidades futuras

Superficie `despliegues`. Propuesta; el pipeline y el historial del clon son ficción de interfaz.

## Propósito

Publicar con confianza y poder volver atrás en segundos. Cada despliegue debe responder: qué commit, quién lo pidió, qué checks pasaron, qué se sirve ahora y cómo se revierte.

## Modelo de trabajo

Preview automática por PR; producción solo por promoción explícita. Toda promoción deja un despliegue inmutable identificado por commit y configuración. La reversión es un despliegue nuevo que apunta al artefacto anterior, nunca un borrado.

## Capacidades · fase V1

| Capacidad | Qué hace | Regla |
|---|---|---|
| Pipeline visible | Etapas build → pruebas → preview → producción con estado y tiempos. | Una etapa desconocida bloquea la promoción. |
| Preview por PR | URL efímera por pull request con datos de preview. | Se destruye al cerrar la PR o a los 7 días, con aviso previo. |
| Historial | Lista de despliegues con commit, autor, entorno, duración y resultado. | Cada fila abre logs y artefacto servido. |
| Promover a producción | Botón que exige checks verdes y aprobación según política. | Confirmación con nombre de proyecto y entorno. |
| Revertir | Despliega de nuevo el artefacto anterior y avisa del impacto. | Revertir no borra el despliegue fallido: lo marca como superado. |
| Bloqueo de despliegue | Ventana de no despliegue y congelación por incidente. | Se muestra siempre el motivo y quién puede levantarlo. |

## Capacidades · fase V2

- **Canario**: porcentaje de tráfico a la versión nueva con métricas comparadas.
- **Aprobaciones por entorno** y por franja horaria.
- **Variables por despliegue** con validación previa y detección de faltantes.
- **Despliegue programado** con cancelación y responsable.
- **Enlace directo** de un despliegue a la incidencia que lo motivó.

## Capacidades · fase V3

- **Rollback automático** si las métricas cruzan umbrales definidos.
- **Despliegue multi-región** con orden y verificación por región.
- **Comparador de builds** para explicar qué cambió entre dos despliegues.

## Integraciones y datos

Vercel y Cloudflare (build y serving), GitHub (commit y checks), pruebas, observabilidad y dominios. Cada despliegue guarda referencia al artefacto y a la configuración exacta usada.

## Límites y no-objetivos

- Producción nunca se despliega desde un chat sin promoción explícita.
- No se publica con checks en rojo ni con migraciones pendientes sin confirmación.
- No se reescriben despliegues pasados.
- No se promete "cero downtime" sin evidencia del proveedor.

## Métricas de éxito

- Tiempo de PR a preview disponible.
- Frecuencia de despliegue y porcentaje con reversión.
- Tiempo medio de reversión (objetivo: menos de 2 minutos).
- Despliegues fallidos por causa evitable (variables, checks, build).

## Dependencias y riesgos

Depende de `06-repositorios`, `10-infraestructura`, `13-entornos` y `14-pruebas`. Riesgo: publicar cambios no verificados; mitigación con puertas, canario y reversión rápida ensayada.
