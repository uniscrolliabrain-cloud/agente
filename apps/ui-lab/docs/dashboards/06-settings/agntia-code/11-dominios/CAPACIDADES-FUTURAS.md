# Dominios y DNS — capacidades futuras

Superficie `dominios`. Propuesta; el clon lista dominios y registros ficticios.

## Propósito

Conectar el producto con su nombre público sin conocimientos de DNS y sin romper el correo. La superficie debe explicar qué falta, cuánto tarda y qué pasa si el dominio ya está en uso en otro sitio.

## Modelo de trabajo

Un dominio se añade al proyecto, se verifica por registro TXT o CNAME y se emite certificado cuando el DNS apunta correctamente. Los cambios de DNS se aplican con vista previa y nunca se sobrescriben registros existentes sin confirmación.

## Capacidades · fase V1

| Capacidad | Qué hace | Regla |
|---|---|---|
| Añadir dominio | Alta con subdominio o apex; muestra los registros exactos a crear. | Si el dominio ya está en otro proyecto, se bloquea con explicación. |
| Verificación | Comprueba TXT/CNAME y muestra progreso con reintento manual. | Nunca se declara verificado sin respuesta DNS real. |
| Certificado | Emisión y renovación automática con estado visible. | Aviso 14 días antes de caducar si la renovación falla. |
| Registros | Lista y edición de A, AAAA, CNAME, TXT, MX con validación de formato. | Registrar MX/TXT de correo exige confirmación adicional. |
| Redirecciones | De `www` a apex o al contrario, y de dominio antiguo a nuevo. | Una redirección circular se detecta antes de guardar. |
| Eliminar dominio | Desvincula sin borrar la zona DNS del cliente. | Eliminar exige escribir el dominio. |

## Capacidades · fase V2

- **Importar zona** desde otro proveedor con comparación de registros.
- **Correo seguro**: SPF, DKIM y DMARC con diagnóstico en lenguaje llano.
- **Subdominios por entorno**: `preview-*`, `staging`, `app`.
- **Monitorización** de resolución y latencia por región.
- **Historial de cambios DNS** con autor y reversión.

## Capacidades · fase V3

- **Certificados comodín** y mTLS para integraciones.
- **Migración asistida** con validación de tráfico antes y después.
- **Diagnóstico automático** de propagación con captura de resolutores.

## Integraciones y datos

Cloudflare (zonas, DNS, certificados), Vercel (dominios de proyecto), despliegues y observabilidad. Se guardan nombres de dominio y referencias de zona; nunca claves de API del registrador.

## Límites y no-objetivos

- No se registra el dominio por el cliente: hay que tenerlo ya.
- No se modifican registros de correo sin confirmación explícita.
- No se promete propagación inmediata: se informa del TTL y del tiempo estimado.
- No se muestran certificados como válidos si el DNS no resuelve.

## Métricas de éxito

- Tiempo de alta a dominio sirviendo con HTTPS.
- Dominios sin verificar más de 24 h.
- Renovaciones de certificado fallidas.
- Incidencias de correo causadas por cambios DNS.

## Dependencias y riesgos

Depende de `10-infraestructura` y `09-despliegues`. Riesgo: romper correo o dejar el dominio sin servicio; mitigación con vista previa de registros, confirmaciones específicas y reversión inmediata.
