# Chats de construcción — funcionamiento

## Flujo principal

1. Desde Chats, el usuario crea una conversación o reabre una existente; se fija proyecto y rama.
2. Escribe la petición; el composer muestra adjuntos y referencias activas.
3. El agente responde en streaming con texto y, si procede, un bloque de plan.
4. Al pedir cambio de código, aparece un diff propuesto con archivos afectados y "Aplicar" / "Descartar".
5. Aplicar crea un checkpoint y actualiza el árbol del editor; descartar deja constancia en el hilo.
6. Si el cambio necesita ejecución, se abre la terminal con el comando ya escrito y pendiente de confirmar.
7. Al terminar, el hilo ofrece "Abrir PR" o "Seguir en el editor".
8. Cada cierre escribe una entrada en la bitácora del proyecto con enlace al hilo.

## Entidades y campos

| Entidad | Campos mínimos |
|---|---|
| `thread` | id, tenantId, projectId, título, rama, autorId, estado, creadoEn, actualizadoEn |
| `message` | id, threadId, rol, contenido, adjuntos[], referencias[], tokens, coste |
| `artifact` | id, messageId, tipo (plan/diff/log/preview), payload, estado |
| `checkpoint` | id, threadId, commitRef, autorId, creadoEn, restaurable |

Los mensajes son inmutables; editar produce una revisión con marca "editado" y fecha.

## Estados

Hilo: `abierto` → `con-propuesta` → `aplicado` → `cerrado` | `descartado`. Un hilo cerrado se puede reabrir sin perder artefactos. Adjunto: `subiendo` → `listo` | `rechazado`. Diff: `propuesto` → `aplicado` | `descartado` | `conflicto`.

## Roles y permisos

- `viewer`: lee hilos compartidos; no ve diffs si se ocultó código.
- `reviewer`: comenta y descarta propuestas, no aplica.
- `builder`: crea hilos, aplica diffs, restaura checkpoints.
- `owner`: comparte, purga y cambia retención.

## Errores, reintentos e idempotencia

- Corte de streaming: se conserva lo recibido y se ofrece "continuar"; el mensaje no se duplica.
- Conflicto al aplicar: se muestra el diff contra el estado real y se pide resolver o rebasar.
- Adjunto rechazado por tamaño o tipo: motivo explícito y alternativa (enlace o recorte).
- Reintento de "Aplicar" con la misma clave no crea dos commits.

## Rendimiento y límites

- Primer token en menos de 2 s en condiciones normales; si no, se muestra "pensando" con tiempo transcurrido.
- Máximo 200 mensajes por hilo visible; el resto se pagina.
- Contexto enviado por turno: 32 KB de texto más referencias resueltas.
- Retención por defecto 12 meses, configurable; los adjuntos siguen su propia política.

## Móvil y accesibilidad

- Composer fijo sobre el teclado; el historial se reduce pero no salta.
- Diffs en vista unificada con conmutador; nunca requieren scroll horizontal para leer el cambio.
- Botones de aplicar/descartar con confirmación y área táctil de 44 px.
- Anuncio por región viva del estado del agente y del resultado de aplicar.

## Demo actual frente a conectado

En el clon, enviar muestra un aviso de simulación; la lista de conversaciones es fija y no hay streaming ni diffs. Conectado, cada paso necesita orquestación de modelo, sandbox y GitHub con límites de coste por hilo.

## Criterios de aceptación

- Reabrir un hilo restaura el contexto y el estado del último artefacto.
- Aplicar un diff deja checkpoint y se refleja en el editor y en la bitácora.
- Un conflicto nunca se resuelve en silencio.
- El coste mostrado coincide con el registrado por el proveedor.
