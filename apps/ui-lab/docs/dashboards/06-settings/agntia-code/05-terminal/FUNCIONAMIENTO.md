# Terminal — funcionamiento

## Flujo principal

1. El usuario abre Terminal; si no hay sesión, se crea una con el proyecto y la rama activos.
2. El sandbox se prepara (montaje, dependencias, variables) y se muestra el progreso.
3. El usuario escribe un comando o acepta uno sugerido por el agente.
4. Si el comando es destructivo o sale de la lista permitida, se pide confirmación con explicación.
5. La salida se muestra en streaming con detección de errores y enlaces a archivo/línea.
6. Al terminar, se registra duración, código de salida y recursos; los artefactos quedan descargables.
7. La sesión se puede reabrir mientras no caduque; al caducar, el historial queda en solo lectura.

## Entidades y campos

| Entidad | Campos mínimos |
|---|---|
| `terminalSession` | id, tenantId, projectId, rama, commit, estado, creadaEn, caducaEn |
| `commandRun` | id, sessionId, comando, cwd, autor, inicio, fin, exitCode, recursos |
| `outputChunk` | runId, secuencia, stream (stdout/stderr), texto, truncado |
| `artifact` | id, runId, nombre, tipo, tamaño, urlFirmada, retención |
| `domainAllowlist` | projectId, dominio, motivo, añadidoPor |

## Estados

Sesión: `preparando` → `lista` → `ocupada` → `lista` → `caducada` | `cerrada`. Ejecución: `en-cola` → `ejecutando` → `completada` | `fallida` | `cancelada` | `tiempo-agotado`. Artefacto: `generando` → `disponible` → `expirado`.

## Roles y permisos

- `viewer`: sin acceso.
- `reviewer`: puede leer sesiones y salidas, no ejecutar.
- `builder`: ejecuta comandos dentro de la lista permitida.
- `owner`: añade dominios, amplía cuotas y autoriza comandos marcados como peligrosos.

## Errores, reintentos e idempotencia

- Sandbox no arranca: se reintenta una vez y, si falla, se ofrece ejecución en cola con aviso.
- Timeout: el proceso se detiene y la salida parcial se conserva como artefacto.
- Comando de migración repetido: se detecta por hash y se avisa antes de reejecutar.
- Corte de conexión: la ejecución sigue en servidor; al reconectar se recupera la salida por secuencia.

## Rendimiento y límites

- Arranque objetivo: 5 s con caché caliente, 30 s en frío.
- Cada comando: 20 minutos y 2 GB de artefactos como máximo.
- Salida en pantalla limitada a 5000 líneas con "ver todo" bajo demanda.
- Cuota por workspace: 120 minutos de cómputo al día en el plan base.

## Móvil y accesibilidad

- Consola legible a 12 px con scroll vertical y teclado que no tapa el prompt.
- Historial navegable por gestos y botones, no solo por flechas.
- La salida se anuncia solo en hitos (fin de comando, error) para no saturar lectores de pantalla.
- Copiar comando y copiar salida siempre visibles.

## Demo actual frente a conectado

El clon mantiene una lista de líneas y responde con textos de ejemplo; no hay procesos, ni red, ni archivos. Cualquier comando mostrado es ficción de interfaz y se avisa al usuario.

## Criterios de aceptación

- Un comando destructivo nunca se ejecuta sin confirmación explícita.
- La salida sobrevive a una recarga de la página.
- El código de salida y la duración coinciden con lo ejecutado.
- Ningún secreto aparece en historial, logs ni artefactos.
