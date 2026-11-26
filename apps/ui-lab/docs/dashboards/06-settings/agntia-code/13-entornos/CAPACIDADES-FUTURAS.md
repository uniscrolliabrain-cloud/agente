# Entornos y secretos — capacidades futuras

Superficie `entornos`. Propuesta; el clon solo muestra nombres de variables y candados decorativos.

## Propósito

Separar lo que cambia entre desarrollo, preview y producción, y proteger lo que nunca debe filtrarse. El usuario debe saber qué variable existe, dónde se usa, cuándo se rotó y quién puede cambiarla, **sin poder leer su valor**.

## Modelo de trabajo

Cada variable es una entrada con nombre, entorno, ámbito y sensibilidad. Los secretos se guardan cifrados en el servidor y solo se descifran en el proceso que los necesita. La interfaz conoce nombres y metadatos; nunca valores.

## Capacidades · fase V1

| Capacidad | Qué hace | Regla |
|---|---|---|
| Matriz de variables | Filas por nombre, columnas por entorno, estado presente/ausente. | Las variables solo de producción se marcan de forma visible. |
| Alta y edición | Crear variable o secreto; el valor se escribe una vez y no se recupera. | Guardar muestra última actualización y autor, nunca el valor. |
| Ámbitos | Aplicar a un proyecto, a varios o al workspace. | Cambiar ámbito avisa de los proyectos afectados. |
| Referencias | Ver qué despliegues y funciones usan cada variable. | Eliminar una variable en uso exige confirmación y plan de sustitución. |
| Rotación | Programar rotación con aviso y verificación tras el cambio. | Una rotación fallida deja la anterior activa y avisa. |
| Auditoría | Historial de altas, cambios, accesos y rotaciones. | Nunca se registra el valor, solo el evento. |

## Capacidades · fase V2

- **Comparación entre entornos** con detección de faltantes antes de desplegar.
- **Importación desde `.env`** con validación de formato y sin subir valores al navegador más de lo necesario.
- **Secretos por despliegue** temporales, con caducidad automática.
- **Doble control** para secretos de producción críticos.
- **Alertas** de secreto próximo a caducar o detectado en un log.

## Capacidades · fase V3

- **Integración con gestores externos** (Doppler, Vault) manteniendo la misma interfaz.
- **Rotación automática** con proveedores que la soportan.
- **Escaneo de repositorio** para detectar secretos commiteados con plan de remediación.

## Integraciones y datos

Bóveda cifrada, despliegues, terminal sandbox y CI. Solo las variables no sensibles se muestran completas; las sensibles exponen nombre, entorno y metadatos.

## Límites y no-objetivos

- Los valores nunca llegan al navegador ni se muestran "por un momento".
- No se pueden copiar secretos a otro workspace sin autorización explícita.
- No hay secretos en logs, mensajes de error ni artefactos.
- No se promete rotación sin downtime en todos los proveedores.

## Métricas de éxito

- Despliegues fallidos por variable ausente.
- Secretos con más de 180 días sin rotar.
- Accesos a secretos fuera de política.
- Tiempo de completar una rotación y verificar el servicio.

## Dependencias y riesgos

Depende de `10-infraestructura` y `09-despliegues`. Riesgo: fuga o pérdida de acceso; mitigación con cifrado, mínimo privilegio, doble control y procedimiento de recuperación documentado.
