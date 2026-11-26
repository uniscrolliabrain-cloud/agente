# Dominios y DNS — funcionamiento

## Flujo principal

1. La superficie lista dominios con estado: pendiente, verificando, activo, error.
2. "Añadir dominio" pide el nombre y detecta si es apex o subdominio.
3. Se muestran los registros a crear con botón de copiar y explicación de cada uno.
4. El usuario los crea en su proveedor; "Verificar" consulta DNS y actualiza el estado.
5. Al verificar, se emite certificado y el dominio pasa a activo con HTTPS.
6. Los registros existentes se listan; cualquier edición se previsualiza antes de aplicar.
7. Cada cambio queda en el historial y en la bitácora del proyecto.

## Entidades y campos

| Entidad | Campos mínimos |
|---|---|
| `domain` | id, tenantId, projectId, nombre, tipo (apex/sub), entorno, estado, verificadoEn |
| `dnsRecord` | zonaId, tipo, nombre, valor, ttl, proxied, origen (cliente/agntia) |
| `certificate` | dominioId, emisor, emitidoEn, caducaEn, estado |
| `redirect` | dominioId, desde, hacia, código, estado |
| `dnsChange` | id, zonaId, antes, después, autor, aplicadoEn |

## Estados

Dominio: `pendiente` → `verificando` → `activo` | `error` | `expirado`. Certificado: `solicitado` → `emitido` → `renovando` | `fallido`. Registro: `propuesto` → `aplicado` | `revertido`.

## Roles y permisos

- `viewer`: ve dominio y estado, no registros.
- `reviewer`: ve registros y diagnóstico.
- `builder`: añade dominios de preview y verifica.
- `owner`: añade dominios de producción, edita MX/TXT y elimina.

## Errores, reintentos e idempotencia

- Registro incorrecto: el diagnóstico indica qué esperaba y qué encontró.
- DNS aún propagando: se reintenta con espera creciente y se avisa del TTL.
- Certificado fallido por CAA: se explica el registro CAA que lo bloquea.
- Repetir "Añadir dominio" no duplica la entrada; reutiliza la pendiente.

## Rendimiento y límites

- La verificación tarda entre segundos y minutos; se muestra última comprobación.
- Máximo 20 dominios por proyecto en el plan base.
- Historial DNS: 90 días.
- Consultas de diagnóstico limitadas a una cada 30 s por dominio.

## Móvil y accesibilidad

- Registros en tarjetas con tipo, nombre y valor copiables uno a uno.
- Estado con icono y texto; el certificado indica fecha de caducidad legible.
- Botón de copiar anuncia "copiado" accesiblemente.
- Formularios de DNS con etiquetas y validación previa al envío.

## Demo actual frente a conectado

El clon muestra dos dominios con SSL "Activo" y una tabla de registros inventada; verificar o añadir solo produce un aviso de simulación.

## Criterios de aceptación

- Ningún dominio se muestra activo sin verificación DNS y certificado emitido.
- Los cambios en registros de correo exigen confirmación y quedan auditados.
- Una redirección circular no se puede guardar.
- Eliminar un dominio no borra la zona del cliente.
