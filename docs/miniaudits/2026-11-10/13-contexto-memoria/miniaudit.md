# Bloque 13 · Contexto y memoria

> Campaña UX · 2026-11-10 · **14 hallazgos** (S0 0 · S1 5 · S2 6 · S3 3)
> Estado: informe recibido. Validación pendiente.

## Hallazgos

| # | Sev | Hallazgo | Estado |
|---|---|---|---|
| 1 | S1 | `forget()` marca `expiresAt` pero `searchMemories` no lo filtra: lo olvidado se sigue recuperando. | Sin verificar |
| 2 | S1 | El fallo de `rag.search` se convierte en `[]`: error indistinguible de "sin resultados". | Sin verificar |
| 3 | S1 | El fallback en JS sólo puntúa las primeras 100 filas. | Sin verificar |
| 4 | S1 | La ingesta escribe chunks nuevos antes de purgar: conviven dos versiones del documento, y la purga recorre 20.000 chunks. | Sin verificar |
| 5 | S1 | El hash de dedupe usa los primeros 500 caracteres: dos memorias distintas colisionan. | Sin verificar |
| 6 | S2 | Sin coincidencia léxica, el recall devuelve las 3 memorias más recientes como si fueran relevantes. | Sin verificar |
| 7 | S2 | Tope de 2.000 memorias: las antiguas no se puntúan nunca. | Sin verificar |
| 8 | S2 | `lowConfidence` ignora los recuerdos privados y puede marcar mal el resultado. | Sin verificar |
| 9 | S2 | Los hechos se puntúan por subcadena: "mar" acierta en "margen". | Sin verificar |
| 10 | S2 | Un chunk sin embedding se guarda y se sirve igual por BM25. | Sin verificar |
| 11 | S2 | El vector nativo y el JSON pueden divergir; se consultan como fuentes distintas. | Sin verificar |
| 12 | S3 | El troceado descarta fragmentos de menos de 30 caracteres. | Sin verificar |
| 13 | S3 | El solapamiento de 120 caracteres duplica texto en el prompt. | Sin verificar |
| 14 | S3 | Siete límites por env sin registrar en el paquete de contexto. | Sin verificar |

## Arreglos propuestos

1. **Lo olvidado no se recupera.** Filtrar `expiresAt` en `searchMemories` (y en el fallback): un `forget()` que no olvida es peor que no tenerlo.
2. **Error ≠ vacío** en `rag.search`: devolver `{ ok: false }` o propagar; el `[]` silencioso hace que una caída del índice parezca "no hay nada que recordar".
3. **Ingesta atómica**: escribir los chunks nuevos y purgar los viejos en la misma transacción (o marcar versión y filtrar por la activa), no en dos pasos con dos versiones vivas.
4. **Hash completo** (o al menos con longitud y cola), no primeros 500 caracteres.
5. **Coincidencia por palabra, no por subcadena**, y sin devolver "las 3 más recientes" cuando no hay match: eso es ruido disfrazado de recall.

## Plan

- **P1 (correctitud)**: `expiresAt` filtrado, error propagado, hash completo.
- **P2 (ingesta)**: transacción y versión activa; purga acotada.
- **P3 (ranking)**: match por palabra, `lowConfidence` con privados, vectores nativos y JSON unificados.

---

## Revisión de destino

La memoria de empresa curada es un diferencial declarado. Un `forget()` que no olvida y un `[]` que oculta un error del índice atacan la confianza en ese dato:

- Olvido efectivo (`expiresAt` filtrado en todas las rutas de recall).
- Error ≠ vacío en `rag.search`.
- Ingesta atómica con versión activa, y hash completo.

## Conclusión

Es el bloque que decide si el cliente puede fiarse de lo que el agente "recuerda". **P0** el olvido y el error silencioso; **P1** ranking e ingesta.
