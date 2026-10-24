# TODO — Campaña 2.B
## Pendiente pospuesto: investigar autenticación y dependencia `jose`

**Estado:** POSPUESTO. No ejecutar durante la campaña/fase actual.  
**Motivo:** este análisis queda fuera del alcance de la fase en curso y no debe bloquear ni desviar su avance.

### Tareas para Campaña 2.B

- [ ] Revisar `apps/server/src/auth.ts` completo y documentar el flujo de autenticación actual.
- [ ] Ejecutar `pnpm why jose` desde la raíz y determinar qué paquetes introducen `jose` y por qué versión.
- [ ] Comprobar en el código y en `package.json`/`pnpm-lock.yaml` si existe algún uso real de JWT/JWK o si la autenticación actual se basa en tokens Bearer y digest.
- [ ] Recuperar la definición/criterio original de F1.3 antes de decidir qué cambio se pretende hacer.
- [ ] Decidir, con evidencia del repositorio, si hace falta una dependencia directa o un cambio de implementación. No añadir `jose`, no cambiar el sistema de autenticación y no crear `apps/server/package.json` por intuición.
- [ ] Si se propone un cambio, preparar un patch mínimo con bloques `$old` que coincidan exactamente con los archivos reales.
- [ ] Validar cualquier cambio con los comandos de typecheck y tests que correspondan al repositorio.

### Evidencia conocida al posponerlo

- La raíz sí tiene `package.json`; `apps/server/package.json` no existe.
- El `package.json` raíz declara `hono` y no declara `jose` como dependencia directa.
- El `pnpm-lock.yaml` contiene entradas para `jose@5.10.0` y `jose@6.2.12`; eso, por sí solo, no demuestra que la aplicación lo use directamente.
- Las búsquedas realizadas encontraron un flujo Bearer en `apps/server/src/auth.ts` que calcula un `digest` del token. Aún falta revisar el archivo completo y la salida de `pnpm why jose`.

### Criterio de cierre

Cerrar esta tarea solo cuando el propósito de F1.3 esté confirmado, la dependencia/flujo actual esté explicado con evidencia y cualquier cambio propuesto haya pasado las validaciones pertinentes.

**Regla de alcance:** hasta Campaña 2.B, dejarlo documentado y no tocar la autenticación por este motivo.
