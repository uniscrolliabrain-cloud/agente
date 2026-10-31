# Continuación — inbox y respuesta manual

Estado: ready_for_review. PR: https://github.com/uniscrolliabrain-cloud/agente/pull/10. Código: 8420138e80507f71583fced2d744c5a9bdc05277. Base: main 4f81f22. No se ha integrado ni desplegado.

## Resultado

El panel muestra mensajes persistidos en la inbox propia y permite preparar una respuesta. El servidor deriva el teléfono y el canal del mensaje original; no acepta un destinatario aportado por el cliente. El borrador, la revisión y la operación quedan ligados a inboxId. Una clave de idempotencia no puede reutilizarse en otra entrada. Los mensajes sin canal de salida coincidente permanecen de solo lectura; no se mezcla Meta con Evolution.

Prueba integrada: Hono app.request (rutas montadas, sin servidor TCP) -> entrada Evolution autenticada/reentregada -> un registro de inbox y una tarea encolada mediante fixture -> creación de respuesta -> tres aprobaciones concurrentes -> una llamada de salida con fetch simulado -> confirmación persistida. No ejecuta el worker/SOP ni demuestra conexión real. Las restantes pruebas cubren aislamiento, cambios de canal y rechazo de parámetros de destinatario.

## Comprobaciones sobre la continuación

| Comando/área | Resultado | Log |
| --- | --- | --- |
| Pruebas salida + adapter | 35/35, exit 0 | tests-inbox.txt |
| Typecheck servidor + worker | exit 0 | typecheck-inbox-server-worker.txt |
| Typecheck web | exit 0 | typecheck-inbox-web.txt |
| Build web final | exit 0 | build-inbox-web.txt |
| Revisión visual | blocked | Browser Use sin pestaña disponible / error previo de red suspendida |
| Proveedor real, worker/SOP, despliegue | not_run | pendiente, no simulado como validación real |

Los logs se normalizan solo en whitespace final; los originales se conservan en outputs de la sesión. No se ejecutó otra suite completa. La integración sigue pendiente de revisión y de las dependencias comunes del núcleo para el piloto automático.

## Coordinación y límites

Sin cambios en paths compartidos reservados. El jefe NC comunicó que PS-01 aún presenta fallos de solicitante, mutación de tenant por checkpoint y atribución de eventos; no los damos por corregidos ni liberamos esos archivos. La base de esa comunicación es su informe, no una repetición de sus tests desde este chat.

La respuesta manual es una vía propia útil mientras se cierra el núcleo; no sustituye el futuro enlace chat/SOP. La salida continúa apagada por defecto, necesita conexión propia y aprobación y solo implementa Evolution. Revisiones manuales anteriores sin inboxId mantienen su algoritmo de hash. La métrica de pendientes excluye borradores ya caducados.
