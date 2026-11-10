# Bloque 12 · Chat con LLM

> Campaña UX · 2026-11-10 · **15 hallazgos** (S0 0 · S1 5 · S2 6 · S3 4)
> Estado: informe recibido. Validación pendiente.

## Hallazgos

| # | Sev | Hallazgo | Estado |
|---|---|---|---|
| 1 | S1 | Toda tool devuelve `{ error }` al modelo en vez de fallar; el fallo se convierte en una frase del asistente y no deja métrica. | Sin verificar |
| 2 | S1 | `metaHintsPromptBlock` devuelve `""`: el bucle meta → prompt está cortado en el último tramo. | Sin verificar (cruce con 10-7: `buildMetaHintsBlock` sin llamadores) |
| 3 | S1 | El CAS de `PUT /threads/:id` usa `{}` como valor esperado; el conflicto se detecta con read-then-write. | Sin verificar |
| 4 | S1 | `Thread.version` nunca se incrementa: `GET /:id/conflict` responde siempre `null`. | Sin verificar |
| 5 | S1 | `x-user-id` se acepta como identidad para presencia y lock de edición. | Sin verificar (cruce con 18-2) |
| 6 | S2 | Borrar un hilo deja tareas, turnos de kernel y eventos apuntando a él. | Sin verificar |
| 7 | S2 | `PUT` acepta 1.000 mensajes sin tope por mensaje ni por peso total. | Sin verificar |
| 8 | S2 | La historia para retrieval son 8 mensajes y sin presupuesto de tokens. | Sin verificar |
| 9 | S2 | `remember_fact` escribe directo al store sin la normalización de `remember()`: duplicados por espaciado. | Sin verificar |
| 10 | S2 | La apertura de turno del kernel es una IIFE con promesa de espera y ningún test del caso rápido. | Sin verificar |
| 11 | S2 | `clone()` descarta `pendingMetaHints`, `lastMetaHint` y `pendingMetaContext`. | Sin verificar |
| 12 | S3 | Los errores del modelo se traducen por subcadena a un texto fijo: cuota, clave y caída se ven igual. | Sin verificar |
| 13 | S3 | `GET /threads` lista todo y ordena en memoria. | Sin verificar |
| 14 | S3 | `browse_web` reintenta a 500 ms fijos, sin jitter ni `Retry-After`. | Sin verificar |
| 15 | S3 | Kernel, FastAuthor, Meta, Promoter y el presenter se cargan con `import()` por turno, con `catch` silenciosos. | Sin verificar |

## Arreglos propuestos

1. **Un fallo de tool es un fallo.** Devolver `{ error }` al modelo convierte un 500 en una frase amable: el error debe ir al cliente como error, con métrica, y el modelo recibe un mensaje tipado (`tool_failed`) que no finge éxito.
2. **CAS con versión real.** `{}` como valor esperado no es CAS. Incrementar `version` en cada escritura y usarla en el `PUT`; entonces `GET /conflict` deja de ser `null` por construcción.
3. **Identidad de la sesión, no cabecera.** `x-user-id` no puede decidir presencia ni lock: eso sale del principal autenticado.
4. **Borrado con arrastre**: tareas, turnos y eventos del hilo se cancelan o marcan huérfanos en la misma operación.
5. **Presupuesto de contexto** (mensajes y tokens) y errores del modelo clasificados por tipo, no por subcadena.

## Plan

- **P1 (consistencia)**: versión y CAS, `x-user-id` fuera, borrado con arrastre.
- **P2 (contexto)**: presupuesto de tokens, `remember_fact` normalizado, `clone()` completo.
- **P3 (errores)**: clasificación por tipo, métrica por tool y reintento con jitter y `Retry-After`.

---

## Revisión de destino

El chat es la puerta del producto ("asistente que sabe cosas de tu empresa y hace cosas de verdad"). Faltan arreglos que el informe no pide:

- **Un fallo de tool no es una frase**: debe llegar como error tipado y con métrica.
- Versión de hilo real para CAS y `conflict`, no `{}` ni read-then-write.
- Presupuesto de contexto (mensajes y tokens) y errores del modelo clasificados por tipo.

## Conclusión

Mientras un fallo se disfrace de respuesta y el hilo no tenga versión, el chat no puede auditarse ni recuperarse. **P1**, y **P0** la parte de errores si el piloto va a usarlo a diario.
