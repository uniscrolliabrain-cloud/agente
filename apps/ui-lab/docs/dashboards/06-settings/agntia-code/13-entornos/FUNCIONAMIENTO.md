# Entornos y secretos — funcionamiento

## Flujo principal

1. La matriz muestra variables por entorno con estado y última actualización.
2. Al crear una variable se elige nombre, entorno, ámbito y si es secreta.
3. Si es secreta, el valor se envía directamente al servidor y no se vuelve a mostrar.
4. Antes de un despliegue, se valida que todas las variables requeridas existan en el entorno.
5. Al rotar, se escribe el nuevo valor, se despliega y se comprueba salud; si falla, se restaura el anterior.
6. Cada acción aparece en auditoría con autor, fecha y resultado, sin valores.

## Entidades y campos

| Entidad | Campos mínimos |
|---|---|
| `envVar` | id, tenantId, nombre, entorno, ámbito (proyecto/workspace), sensible, requerida |
| `secretRef` | envVarId, versión, actualizadaEn, autorId, caducaEn |
| `usage` | envVarId, recursoTipo, recursoId, últimaLectura |
| `rotation` | id, envVarId, programadaEn, ejecutadaEn, estado, verificación |
| `auditEvent` | id, envVarId, acción, autor, fecha, resultado |

## Estados

Variable: `ausente` → `presente` → `obsoleta` | `eliminada`. Secreto: `activo` → `rotando` → `activo` | `rotación-fallida`. Despliegue: bloqueado si falta una requerida.

## Roles y permisos

- `viewer`: no accede.
- `reviewer`: ve nombres y presencia, no metadatos sensibles.
- `builder`: crea variables no secretas y secretos de preview.
- `owner`: secretos de producción, rotación y doble control.

## Errores, reintentos e idempotencia

- Valor rechazado por formato (clave PEM, JSON): se explica el formato esperado sin mostrarlo.
- Rotación fallida: se mantiene la versión anterior y se marca la incidencia.
- Despliegue con variable ausente: se bloquea antes de construir, con lista exacta.
- Repetir una rotación ya aplicada no duplica versiones; se reutiliza la vigente.

## Rendimiento y límites

- La matriz carga en menos de 1 s; los valores nunca se descargan.
- Máximo 200 variables por proyecto; 50 secretos por entorno en el plan base.
- Retención de auditoría: 12 meses.
- Rotación verificada en menos de 5 minutos o se considera fallida.

## Móvil y accesibilidad

- Matriz convertida en lista por variable con entornos como etiquetas.
- Campos de secreto con pegar permitido y sin autocompletado del navegador.
- Estados con texto; los candados llevan etiqueta accesible.
- Confirmaciones de rotación explican el impacto en servicios.

## Demo actual frente a conectado

El clon muestra nombres como `DATABASE_URL` con puntos suspensivos y estados fijos; ninguna acción guarda, cifra ni despliega. Los avisos indican simulación.

## Criterios de aceptación

- Ningún valor secreto es visible ni recuperable desde la interfaz.
- Un despliegue no avanza si falta una variable requerida.
- La rotación fallida no deja el servicio sin credencial válida.
- La auditoría permite reconstruir quién cambió qué y cuándo.
